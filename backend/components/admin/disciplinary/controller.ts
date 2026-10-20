import { BaseController } from "../../../core";
import { Filter_Options, Request, Response } from "../../../__types";
import { ObjectId } from "mongodb";

export default class DisciplinaryController extends BaseController {
  public __component: string = "disciplinaries";
  private filter_options: Filter_Options = {
    search: [
      "profile.firstName",
      "profile.lastName",
      "profile.userName",
      "email",
      "phoneNumber",
    ],
    defaultSort: "_id",
    filters: {
      "induction.status": { type: "string", filter: "$in" },
    },
  };

  public list = async (req: Request, res: Response): Promise<Response> => {
    try {
      const defaultFilter = { isDeleted: { $ne: true } };
      this.getAggrigation(req, this.filter_options, defaultFilter);
      const [data, count] = await Promise.all([
        this.collections.disciplinaries
          .aggregate([
            {
              $lookup: {
                from: "userProfiles",
                localField: "profileId",
                foreignField: "_id",
                as: "profile",
              },
            },
            { $unwind: "$profile" },
            {
              $lookup: {
                from: "applications",
                localField: "profile._id",
                foreignField: "profileId",
                as: "application",
              },
            },
            { $unwind: "$application" },
            {
              $lookup: {
                from: "warningReasons",
                localField: "warningReasonId",
                foreignField: "_id",
                as: "warningType",
              },
            },
            {
              $addFields: {
                lastWarning: {
                  $arrayElemAt: ["$warnings", -1],
                },
              },
            },
            {
              $lookup: {
                from: "cmcTemplates", // 👈 adjust collection name if different
                localField: "lastWarning.requestTypeId",
                foreignField: "_id",
                as: "disciplinaryType",
              },
            },
            ...req.aggregations,
            {
              $project: {
                _id: 1,
                firstName: "$profile.firstName",
                profileId: "$profile._id",
                lastName: "$profile.lastName",
                applicationNumber: "$application.applicationNumber",
                warningType: { $arrayElemAt: ["$warningType.name", 0] },
                disciplinaryType: {
                  $arrayElemAt: ["$disciplinaryType.name", 0],
                },
              },
            },
          ])
          .toArray(),
        this.collections.disciplinaries
          .aggregate([
            {
              $lookup: {
                from: "userProfiles",
                localField: "profileId",
                foreignField: "_id",
                as: "profile",
              },
            },
            { $unwind: "$profile" },
            {
              $lookup: {
                from: "applications",
                localField: "profile._id",
                foreignField: "profileId",
                as: "application",
              },
            },
            { $unwind: "$application" },
            ...req.dbPagination,
          ])
          .toArray(),
      ]);
      return this.json(req, res, 200, { data, count: count });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getWarnings = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { id } = req.params;

      const data = await this.collections.disciplinaries
        .aggregate([
          {
            $match: { _id: this.toObjectId(id) },
          },
          { $unwind: "$warnings" },
          {
            $lookup: {
              from: "customers",
              localField: "warnings.customerId",
              foreignField: "_id",
              as: "customer",
            },
          },
          {
            $lookup: {
              from: "cmcTemplates",
              localField: "warnings.requestTypeId",
              foreignField: "_id",
              as: "requestType",
            },
          },

          {
            $addFields: {
              "warnings.customerName": { $arrayElemAt: ["$customer.name", 0] },
              "warnings.requestType": {
                $arrayElemAt: ["$requestType.name", 0],
              },
              "warnings.status": {
                $cond: {
                  if: {
                    $ne: [{ $ifNull: ["$warnings.userSign", null] }, null],
                  },
                  then: "signed",
                  else: "unsigned",
                },
              },
            },
          },
          {
            $project: {
              customer: 0,
              requestType: 0,
            },
          },
          {
            $group: {
              _id: "$_id",
              warnings: { $push: "$warnings" },
              warningReasonId: { $first: "$warningReasonId" },
            },
          },
        ])
        .toArray();

      if (!data.length) {
        return this.jsonError(res, 404, this.__component, "No warnings found");
      }

      return this.json(req, res, 200, {
        data: data[0],
      });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getDisciplinary = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const { type } = req.query;

      const project: Record<string, any> = {};

      switch (type) {
        case "hearing":
          project.hearing = 1;
          break;

        case "dispute":
          project.dispute = 1;
          break;

        default:
          project.hearing = 1;
          project.dispute = 1;
      }
      const data = await this.collections.disciplinaries.findOne(
        { _id: this.toObjectId(id) },
        { projection: project },
      );

      return this.json(req, res, 200, { data });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getAOD = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const data = await this.collections.disciplinaries.findOne(
        { _id: this.toObjectId(id) },
        { projection: { aodId: 1 } },
      );
      if (!data?.aodId) {
        return this.json(req, res, 200, { data: null });
      }
      const aodData = await this.collections.aods.findOne({
        _id: this.toObjectId(data.aodId),
      });

      return this.json(req, res, 200, { data: aodData });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public createOrUpdate = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const FormBody = req.body;

      if (FormBody.requestTypeId) {
        FormBody.requestTypeId = this.toObjectId(FormBody.requestTypeId);
      }
      if (FormBody.customerId) {
        FormBody.customerId = this.toObjectId(FormBody.customerId);
      }
      if (FormBody.profileId) {
        FormBody.profileId = this.toObjectId(FormBody.profileId);
      }

      const warning = {
        warningNumber: this.generateNumber("WARN"),
        customerId: FormBody.customerId,
        requestTypeId: FormBody.requestTypeId,
        date: FormBody.date,
        isRead: false,
      };

      if (id) {
        await this.collections.disciplinaries.updateOne(
          { _id: this.toObjectId(id) },
          {
            $push: { warnings: warning },
            $set: {
              profileId: FormBody.profileId,
              isFinalWarning: FormBody.isFinalWarning ?? false,
              isAuthorized: FormBody.isAuthorized,
              authorizedBy: FormBody.authorizedBy,
              authorizedDate: FormBody.authorizedDate,
            },
          },
        );

        return this.json(req, res, 200, {
          message: "Disciplinary Updated Successfully",
        });
      }
      const disciplinary = {
        profileId: FormBody.profileId,
        warnings: [warning],
        warningReasonId: this.toObjectId(FormBody.warningReasonId),
        isFinalWarning: FormBody.isFinalWarning ?? false,
        isAuthorized: FormBody.isAuthorized,
        authorizedBy: FormBody.authorizedBy,
        authorizedDate: FormBody.authorizedDate,
      };

      const inserted =
        await this.collections.disciplinaries.insertOne(disciplinary);

      return this.json(req, res, 200, {
        data: {
          message: "Disciplinary Saved Successfully",
          disciplinaryId: inserted.insertedId,
        },
      });
    } catch (error) {
      return this.jsonError(res, 400, this.__component, "wrong", error);
    }
  };

  // public updateWarnignSign = async (
  //   req: Request,
  //   res: Response
  // ): Promise<Response> => {
  //   try {
  //     const { id } = req.params;
  //     const FormBody = req.body;

  //     if (!id) {
  //       return this.jsonError(res, 400, this.__component, "ID is required");
  //     }

  //     const disciplinary = await this.collections.disciplinaries.findOne(
  //       { _id: this.toObjectId(id) },
  //       { projection: { warnings: 1 } }
  //     );

  //     if (!disciplinary || !disciplinary.warnings?.length) {
  //       return this.jsonError(res, 404, this.__component, "No warnings found");
  //     }
  //     const lastIndex = disciplinary.warnings.length - 1;

  //     const updateQuery: any = {};

  //     if (FormBody.cmcTemplateId) {
  //       updateQuery[`warnings.${lastIndex}.cmcTemplateId`] = this.toObjectId(
  //         FormBody.cmcTemplateId
  //       );
  //     }
  //     if (FormBody.status) {
  //       updateQuery[`warnings.${lastIndex}.status`] = FormBody.status;
  //     }
  //     if (FormBody.evidenceDocumentIds) {
  //       const evidennceIds =
  //         FormBody.evidenceDocumentIds &&
  //         Array.isArray(FormBody.evidenceDocumentIds)
  //           ? FormBody.evidenceDocumentIds.map((id: string) =>
  //               this.toObjectId(id)
  //             )
  //           : [];
  //       updateQuery[`warnings.${lastIndex}.evidenceDocumentIds`] = evidennceIds;
  //     }
  //     await this.collections.disciplinaries.updateOne(
  //       { _id: this.toObjectId(id) },
  //       { $set: updateQuery }
  //     );

  //     return this.json(req, res, 200, {
  //       message: "Warning Successfully",
  //     });
  //   } catch (error) {
  //     return this.jsonError(res, 400, this.__component, "wrong", error);
  //   }
  // };

  public updateHearing = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const FormBody = req.body;

      const existingDisciplinary =
        await this.collections.disciplinaries.findOne({
          _id: this.toObjectId(id),
        });
      if (!existingDisciplinary) {
        return this.jsonError(
          res,
          400,
          this.__component,
          "Disciplinary does not exist",
        );
      }
      // const hearingIds =
      //   FormBody.hearingDocumentIds &&
      //   Array.isArray(FormBody.hearingDocumentIds)
      //     ? FormBody.hearingDocumentIds.map((id: string) => this.toObjectId(id))
      //     : [];

      await this.collections.disciplinaries.updateOne(
        { _id: existingDisciplinary._id },
        {
          $set: {
            "hearing.scheduledDate":
              FormBody.scheduledDate ??
              existingDisciplinary.hearing?.scheduledDate,
            "hearing.location":
              FormBody.location ?? existingDisciplinary.hearing?.location,
            "hearing.isEmployeeAttended":
              FormBody.isEmployeeAttended ??
              existingDisciplinary.hearing?.isEmployeeAttended,
            "hearing.attendedDate":
              FormBody.attendedDate ??
              existingDisciplinary.hearing?.attendedDate,
            "hearing.hearingOutcome":
              FormBody.hearingOutcome ??
              existingDisciplinary.hearing?.hearingOutcome,
            "hearing.dismissalDate":
              FormBody.dismissalDate ??
              existingDisciplinary.hearing?.dismissalDate,
            "hearing.isAodRequired":
              FormBody.isAodRequired ??
              existingDisciplinary.hearing?.isAodRequired,
            "hearing.status":
              FormBody.status ?? existingDisciplinary.hearing?.status,
          },
        },
      );

      return this.json(req, res, 200, {
        message: "Hearing Saved Successfully",
      });
    } catch (error) {
      return this.jsonError(res, 400, this.__component, "wrong", error);
    }
  };

  public sendNoticeToHearing = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const FormBody = req.body; // needs to implement email sending logic

      const existingDisciplinary =
        await this.collections.disciplinaries.findOne({
          _id: this.toObjectId(id),
        });
      if (!existingDisciplinary) {
        return this.jsonError(
          res,
          400,
          this.__component,
          "Disciplinary does not exist",
        );
      }

      await this.collections.disciplinaries.updateOne(
        { _id: existingDisciplinary._id },
        {
          $set: {
            "hearing.noticeDate": new Date(),
            "hearing.scheduledDate":
              FormBody.scheduledDate ??
              existingDisciplinary.hearing?.scheduledDate,
            "hearing.location":
              FormBody.location ?? existingDisciplinary.hearing?.location,
          },
        },
      );

      return this.json(req, res, 200, {
        message: "Hearing Saved Successfully",
      });
    } catch (error) {
      return this.jsonError(res, 400, this.__component, "wrong", error);
    }
  };

  public updateDispute = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const FormBody = req.body;

      const existingDisciplinary =
        await this.collections.disciplinaries.findOne({
          _id: this.toObjectId(id),
        });
      if (!existingDisciplinary) {
        return this.jsonError(
          res,
          400,
          this.__component,
          "Disciplinary does not exist",
        );
      }
      // const disputeIds =
      //   FormBody.disputeDocumentIds &&
      //   Array.isArray(FormBody.disputeDocumentIds)
      //     ? FormBody.disputeDocumentIds.map((id: string) => this.toObjectId(id))
      //     : [];

      if (FormBody.disputeTypeId) {
        FormBody.disputeTypeId = this.toObjectId(FormBody.disputeTypeId);
      }

      await this.collections.disciplinaries.updateOne(
        { _id: existingDisciplinary._id },
        {
          $set: {
            "dispute.scheduledDate":
              FormBody.scheduledDate ??
              existingDisciplinary.dispute?.scheduledDate,
            "dispute.disputeTypeId":
              FormBody.disputeTypeId ??
              existingDisciplinary.dispute?.disputeTypeId,
            "dispute.disputeOutcome":
              FormBody.disputeOutcome ??
              existingDisciplinary.dispute?.disputeOutcome,
            "dispute.notes":
              FormBody.notes ?? existingDisciplinary.dispute?.notes,
          },
        },
      );

      return this.json(req, res, 200, {
        message: "Dispute Saved Successfully",
      });
    } catch (error) {
      return this.jsonError(res, 400, this.__component, "wrong", error);
    }
  };

  public updateAOD = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const existingDisciplinary =
        await this.collections.disciplinaries.findOne({
          _id: this.toObjectId(id),
        });
      if (!existingDisciplinary) {
        return this.jsonError(
          res,
          400,
          this.__component,
          "Disciplinary does not exist",
        );
      }
      const FormBody = req.body;
      const AOD = {
        profileId: this.toObjectId(FormBody.profileId),
        templateId: this.toObjectId(FormBody.templateId),
        paymentTermId: this.toObjectId(FormBody.paymentTermId),
        aodTypeId: this.toObjectId(FormBody.aodTypeId),
        aodReasonId: this.toObjectId(FormBody.aodReasonId),
        date: FormBody.date,
        paymentDuration: FormBody.paymentDuration,
        amount: FormBody.amount,
        weekOrMonth: FormBody.weekOrMonth,
      };
      if (existingDisciplinary.aodId) {
        const existingAOD = await this.collections.aods.findOne({
          _id: existingDisciplinary.aodId,
        });
        if (!existingAOD) {
          return this.jsonError(
            res,
            400,
            this.__component,
            "AOD does not exist",
          );
        }
        await this.collections.aods.updateOne(
          { _id: existingAOD._id },
          {
            $set: {
              ...AOD,
            },
          },
        );
      } else {
        const aod = await this.collections.aods.insertOne({
          _id: new ObjectId(),
          ...AOD,
        });
        await this.collections.disciplinaries.updateOne(
          { _id: existingDisciplinary._id },
          {
            $set: {
              aodId: aod.insertedId,
            },
          },
        );
      }
      return this.json(req, res, 200, {
        message: "AOD Saved Successfully",
      });
    } catch (error) {
      return this.jsonError(res, 400, this.__component, "wrong", error);
    }
  };

  public getEnquiryTemplate = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { disciplinary_id } = req.query;

      const disciplinaryId =
        typeof disciplinary_id === "string"
          ? this.toObjectId(disciplinary_id)
          : disciplinary_id;

      const [result] = await this.collections.disciplinaries
        .aggregate([
          { $match: { _id: disciplinaryId } },
          {
            $lookup: {
              from: "warningReasons",
              localField: "warningReasonId",
              foreignField: "_id",
              as: "reason",
            },
          },
          {
            $lookup: {
              from: "userProfiles",
              localField: "profileId",
              foreignField: "_id",
              as: "profile",
            },
          },
          {
            $project: {
              lastWarning: {
                $arrayElemAt: ["$warnings", -1],
              },
              warningReason: { $arrayElemAt: ["$reason.name", 0] },
              name: {
                $concat: [
                  { $arrayElemAt: ["$profile.firstName", 0] },
                  " ",
                  { $arrayElemAt: ["$profile.lastName", 0] },
                ],
              },
            },
          },
        ])
        .toArray();

      const lastWarning = result?.lastWarning;

      if (!lastWarning?.requestTypeId) {
        return this.json(req, res, 200, { data: null });
      }

      const template = await this.collections.cmcTemplates.findOne({
        _id: lastWarning.requestTypeId,
      });

      const data = {
        employeeName: result?.name || "",
        warningReason: result?.warningReason || "",
      };

      // const fullpath = global["appRoot"] +
      //   global["config"].uploads.path +
      //   "contracts/contract_" +
      //   data.employeeName.replace(" ", "_") +
      //   templateName +
      //   ".pdf";

      // if(fs.existsSync(fullpath)){
      //   return this.json(req, res, 200, {
      //     data: { url: fullpath, template: requestType.name },
      //   });
      // }

      const html = this.replaceTemplateData(template?.content || "", data);

      await this.collections.disciplinaries.updateOne(
        { _id: disciplinaryId },
        {
          $set: {
            "warnings.$[last].generatedTemplate": html, // store HTML
          },
        },
        {
          arrayFilters: [
            { "last.warningNumber": lastWarning.warningNumber }, // target the last warning
          ],
        },
      );
      const signature = {
        adminSign: lastWarning.adminSign || null,
        adminSignDate: lastWarning.adminSignDate || null,
        userSign: lastWarning.userSign || null,
        userSignDate: lastWarning.userSignDate || null,
      };

      // const userId =
      //   typeof user_id === "string" ? this.toObjectId(user_id) : user_id;

      // const warning = {
      //   _id: new ObjectId(),
      //   userId: userId as ObjectId,
      //   name: templateName.replace(/template/gi, "").trim(),
      //   type: "Warning",
      //   url: pdfPath,
      //   status: "active" as const,
      //   disciplinaryId: disciplinaryId as ObjectId,
      // };

      // await this.collections.documents.insertOne(warning);
      return this.json(req, res, 200, {
        data: { templateName: template?.name || "", template: html, signature },
      });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getApplicantProfile = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { profile_id, disciplinary_id } = req.query;
      const profileId =
        typeof profile_id === "string"
          ? this.toObjectId(profile_id)
          : profile_id;
      const disciplinaryId = disciplinary_id
        ? this.toObjectId(disciplinary_id as string)
        : null;
      const defaultFilter = { profileId: profileId };
      this.getAggrigation(req, this.filter_options, defaultFilter);
      const [data] = await Promise.all([
        this.collections.applications
          .aggregate([
            {
              $lookup: {
                from: "userProfiles",
                localField: "profileId",
                foreignField: "_id",
                as: "profile",
              },
            },
            {
              $lookup: {
                from: "recruitments",
                let: { applicationId: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $or: [
                          // { $in: ["$$applicationId", { $ifNull: ["$shortListedIds", []] }] },
                          {
                            $in: [
                              "$$applicationId",
                              { $ifNull: ["$finalisedIds", []] },
                            ],
                          },
                        ],
                      },
                    },
                  },
                ],
                as: "recruitment",
              },
            },
            {
              $lookup: {
                from: "documents",
                let: {
                  userId: { $arrayElemAt: ["$profile.userId", 0] },
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$userId", "$$userId"] },
                          { $eq: ["$type", "Selfie"] },
                        ],
                      },
                    },
                  },
                  { $limit: 1 }, // ensure only one document
                ],
                as: "selfieDocument",
              },
            },
            {
              $lookup: {
                from: "customers",
                localField: "recruitment.customerId",
                foreignField: "_id",
                as: "customer",
              },
            },
            {
              $lookup: {
                from: "regions",
                localField: "profile.physicalAddress.regionId",
                foreignField: "_id",
                as: "region",
              },
            },
            {
              $lookup: {
                from: "disciplinaries",
                let: { profileId: "$profileId" },
                pipeline: [
                  {
                    $match: {
                      $expr: disciplinaryId
                        ? {
                            $and: [
                              { $eq: ["$profileId", "$$profileId"] },
                              { $eq: ["$_id", disciplinaryId] },
                            ],
                          }
                        : { $eq: ["$profileId", "$$profileId"] },
                    },
                  },
                  {
                    $project: { warnings: 1, _id: 1 },
                  },
                ],
                as: "disciplinary",
              },
            },
            {
              $addFields: {
                allWarnings: {
                  $reduce: {
                    input: "$disciplinary",
                    initialValue: [],
                    in: {
                      $concatArrays: [
                        "$$value",
                        { $ifNull: ["$$this.warnings", []] },
                      ],
                    },
                  },
                },
              },
            },
            {
              $lookup: {
                from: "cmcTemplates",
                let: { requestTypeIds: "$allWarnings.requestTypeId" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $in: ["$_id", "$$requestTypeIds"] },
                          { $eq: ["$name", "Disciplinary Enquiry"] },
                        ],
                      },
                    },
                  },
                ],
                as: "disciplinaryEnquiryTypes",
              },
            },
            {
              $addFields: {
                hasDisciplinaryEnquiry: {
                  $gt: [{ $size: "$disciplinaryEnquiryTypes" }, 0],
                },
              },
            },
            ...req.aggregations,
            {
              $project: {
                _id: 1,
                userId: 1,
                firstName: { $arrayElemAt: ["$profile.firstName", 0] },
                lastName: { $arrayElemAt: ["$profile.lastName", 0] },
                phoneNumber: { $arrayElemAt: ["$profile.phoneNumber", 0] },
                email: { $arrayElemAt: ["$profile.email", 0] },
                region: { $arrayElemAt: ["$region.name", 0] },
                customerId: { $arrayElemAt: ["$customer._id", 0] },
                customerName: { $arrayElemAt: ["$customer.name", 0] },
                applicationStatus: 1,
                applicationNumber: 1,
                jobTitle: { $arrayElemAt: ["$recruitment.jobTitle", 0] },
                jobType: { $arrayElemAt: ["$recruitment.jobType", 0] },
                selfie: { $arrayElemAt: ["$selfieDocument.url", 0] },
                applicationCategory: 1,
                hasDisciplinaryEnquiry: {
                  $gt: [{ $size: "$disciplinaryEnquiryTypes" }, 0],
                },
              },
            },
          ])
          .toArray(),
      ]);
      return this.json(req, res, 200, { data: data[0] });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public signWarning = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const FormBody = req.body;

      const disciplinary = await this.collections.disciplinaries.findOne(
        { _id: this.toObjectId(id) },
        { projection: { warnings: 1 } },
      );
      if (!disciplinary || !disciplinary.warnings?.length) {
        throw new Error("No warnings found");
      }

      const lastWarning =
        disciplinary?.warnings[disciplinary.warnings.length - 1];

      await this.collections.disciplinaries.updateOne(
        { _id: this.toObjectId(id) },
        {
          $set: {
            "warnings.$[last].adminSign": FormBody.adminSign,
            "warnings.$[last].adminSignDate":
              FormBody.adminSignDate || new Date(),
          },
        },
        {
          arrayFilters: [{ "last.warningNumber": lastWarning.warningNumber }],
        },
      );

      return this.json(req, res, 200, {
        message: "Warning signed successfully",
      });
    } catch (error) {
      return this.jsonError(res, 400, this.__component, "wrong", error);
    }
  };

  public downloadWarning = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { disciplinary_id, warning_number } = req.query;

      if (!disciplinary_id || !warning_number) {
        return this.json(req, res, 400, {
          message: "disciplinary_id and warning_number are required",
        });
      }

      const disciplinaryId =
        typeof disciplinary_id === "string"
          ? this.toObjectId(disciplinary_id)
          : disciplinary_id;

      const [result] = await this.collections.disciplinaries
        .aggregate([
          {
            $match: { _id: disciplinaryId },
          },
          {
            $unwind: "$warnings",
          },
          {
            $match: {
              "warnings.warningNumber": warning_number,
            },
          },
          {
            $project: {
              _id: 1,
              profileId: 1,
              warning: "$warnings",
            },
          },
        ])
        .toArray();

      if (!result) {
        return this.json(req, res, 404, {
          message: "Warning not found",
        });
      }

      const finalHtml = this.appendSignatures(
        result.warning.generatedTemplate || "",
        result.warning,
      );

      const pdfPath = await this.generatePdf(
        finalHtml,
        result.warning.warningNumber + ".pdf",
        "warnings",
      );

      return this.json(req, res, 200, {
        data: { url: pdfPath, templateName: result.warning.warningNumber },
      });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };
}
