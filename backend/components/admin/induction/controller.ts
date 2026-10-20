import { ObjectId } from "mongodb";
import { BaseController } from "../../../core";
import { Filter_Options, Request, Response } from "../../../__types";
import moment from "moment";
import { SignNow } from "../../../helpers/signNow";

export default class InductionController extends BaseController {
  public __component: string = "inductions";
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
      const defaultFilter = {
        isDeleted: { $ne: true },
        isInductionRequired: true,
      };
      this.getAggrigation(req, this.filter_options, defaultFilter);
      const [data, count] = await Promise.all([
        this.collections.recruitments
          .aggregate([
            {
              $lookup: {
                from: "applications",
                localField: "finalisedIds",
                foreignField: "_id",
                as: "applicants",
              },
            },
            { $unwind: "$applicants" },
            {
              $lookup: {
                from: "userProfiles",
                localField: "applicants.profileId",
                foreignField: "_id",
                as: "profile",
              },
            },
            { $unwind: "$profile" },
            {
              $lookup: {
                from: "customers",
                localField: "customerId",
                foreignField: "_id",
                as: "customer",
              },
            },
            { $unwind: "$customer" },
            {
              $lookup: {
                from: "inductions",
                let: {
                  applicationId: "$applicants._id",
                  recruitmentId: "$_id",
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$applicationId", "$$applicationId"] },
                          { $eq: ["$recruitmentId", "$$recruitmentId"] },
                        ],
                      },
                    },
                  },
                ],
                as: "induction",
              },
            },
            ...req.aggregations,
            {
              $project: {
                _id: 1,
                applicationId: "$applicants._id",
                userName: "$profile.userName",
                firstName: "$profile.firstName",
                lastName: "$profile.lastName",
                phoneNumber: "$profile.phoneNumber",
                trainingDate: "$applicants.trainingDate",
                applicationNumber: "$applicants.applicationNumber",
                inductionStatus: {
                  $ifNull: [
                    { $arrayElemAt: ["$induction.status", -1] },
                    "in progress",
                  ],
                },
                inductionId: { $arrayElemAt: ["$induction._id", -1] },
                // status: 1,
                // customerName: "$customer.name",
              },
            },
          ])
          .toArray(),
        this.collections.recruitments
          .aggregate([
            {
              $lookup: {
                from: "applications",
                localField: "finalisedIds",
                foreignField: "_id",
                as: "applicants",
              },
            },
            { $unwind: "$applicants" },
            {
              $lookup: {
                from: "userProfiles",
                localField: "applicants.profileId",
                foreignField: "_id",
                as: "profile",
              },
            },
            { $unwind: "$profile" },
            {
              $lookup: {
                from: "customers",
                localField: "customerId",
                foreignField: "_id",
                as: "customer",
              },
            },
            { $unwind: "$customer" },
            ...req.dbPagination,
          ])
          .toArray(),
      ]);
      return this.json(req, res, 200, { data, count: count });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public get = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const defaultFilter = { _id: this.toObjectId(id) };
      const induction = await this.collections.inductions.findOne(
        defaultFilter,
        {
          projection: {
            _id: 1,
            checklistIds: 1,
            driverTesting: 1,
            vehicleTesting: 1,
            status: 1,
          },
        },
      );

      if (induction) {
        return this.json(req, res, 200, { data: induction });
      }
      return this.jsonError(res, 400, this.__component, "get");
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
      const checklistIds =
        FormBody.checklistIds && Array.isArray(FormBody.checklistIds)
          ? FormBody.checklistIds.map((id: string) => this.toObjectId(id))
          : [];

      if (id) {
        const existingInduction = await this.collections.inductions.findOne({
          _id: this.toObjectId(id),
        });
        if (!existingInduction) {
          return this.jsonError(
            res,
            400,
            this.__component,
            "Induction does not exist",
          );
        }

        await this.collections.inductions.updateOne(
          { _id: existingInduction._id },
          {
            $set: { checklistIds: checklistIds },
          },
        );
      } else {
        const app = await this.collections.applications.findOne(
          {
            _id: this.toObjectId(FormBody.applicationId),
          },
          { projection: { assetIds: 1 } },
        );
        const insertedInduction = await this.collections.inductions.insertOne({
          _id: new ObjectId(),
          checklistIds,
          applicationId: this.toObjectId(FormBody.applicationId),
          recruitmentId: this.toObjectId(FormBody.recruitmentId),
          assetId: app?.assetIds?.[0],
          status: "in progress",
        });
        return this.json(req, res, 200, {
          data: {
            message: `Induction ${id ? "Updated" : "Saved"} Successfully`,
            inductionId: insertedInduction.insertedId,
          },
        });
      }
      return this.json(req, res, 200, {
        message: `Induction ${id ? "Updated" : "Saved"} Successfully`,
      });
    } catch (error) {
      return this.jsonError(res, 400, this.__component, "wrong", error);
    }
  };

  public updateDriverTesting = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const FormBody = req.body;

      if (!id) {
        return this.jsonError(res, 400, this.__component, "ID is required");
      }

      const existingInduction = await this.collections.inductions.findOne({
        _id: this.toObjectId(id),
      });

      if (!existingInduction) {
        return this.jsonError(
          res,
          400,
          this.__component,
          "Induction does not exist",
        );
      }

      const existingDriverTesting: any = existingInduction.driverTesting || {};
      const existingChecklist: any[] = existingDriverTesting.checklist || [];

      const mergedChecklist = [...existingChecklist];

      if (FormBody.checklist?.length) {
        const incomingChecklist = FormBody.checklist.map((item: any) => ({
          checklistId: this.toObjectId(item.checklistId),
          group: item.group,
        }));

        incomingChecklist.forEach((newItem: any) => {
          const idx = mergedChecklist.findIndex(
            (x: any) =>
              x.checklistId.toString() === newItem.checklistId.toString(),
          );

          if (idx >= 0) {
            const existingGroups = mergedChecklist[idx].group || [];
            const incomingGroups = newItem.group || [];

            incomingGroups.forEach((g: any) => {
              const gIndex = existingGroups.findIndex(
                (e: any) => e.name === g.name,
              );

              if (gIndex >= 0) {
                existingGroups[gIndex] = { ...existingGroups[gIndex], ...g };
              } else {
                existingGroups.push(g);
              }
            });

            mergedChecklist[idx].group = existingGroups;
          } else {
            mergedChecklist.push(newItem);
          }
        });
      }

      const updatedDriverTesting: any = { ...existingDriverTesting };

      if (FormBody.isTestCompleted !== undefined)
        updatedDriverTesting.isTestCompleted = FormBody.isTestCompleted;

      if (FormBody.testDate !== undefined)
        updatedDriverTesting.testDate = FormBody.testDate;

      if (FormBody.testResult !== undefined)
        updatedDriverTesting.testResult = FormBody.testResult;

      if (FormBody.checklist !== undefined)
        updatedDriverTesting.checklist = mergedChecklist;

      await this.collections.inductions.updateOne(
        { _id: existingInduction._id },
        {
          $set: {
            driverTesting: updatedDriverTesting,
            status: updatedDriverTesting.testResult,
          },
        },
      );

      return this.json(req, res, 200, {
        message: "Driver Test Saved Successfully",
      });
    } catch (error) {
      return this.jsonError(res, 400, this.__component, "wrong", error);
    }
  };

  public updateVehicleTesting = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const FormBody = req.body;

      if (!id) {
        return this.jsonError(res, 400, this.__component, "ID is required");
      }

      const existingInduction = await this.collections.inductions.findOne({
        _id: this.toObjectId(id),
      });

      if (!existingInduction) {
        return this.jsonError(
          res,
          400,
          this.__component,
          "Induction does not exist",
        );
      }

      const existingVehicleTesting: any =
        existingInduction.vehicleTesting || {};
      const existingChecklist: any[] = existingVehicleTesting.checklist || [];

      const mergedChecklist = [...existingChecklist];

      if (FormBody.checklist?.length) {
        const incomingChecklist = FormBody.checklist.map((item: any) => ({
          checklistId: this.toObjectId(item.checklistId),
          group: item.group,
        }));

        incomingChecklist.forEach((newItem: any) => {
          const idx = mergedChecklist.findIndex(
            (x: any) =>
              x.checklistId.toString() === newItem.checklistId.toString(),
          );

          if (idx >= 0) {
            const existingGroups = mergedChecklist[idx].group || [];
            const incomingGroups = newItem.group || [];

            incomingGroups.forEach((g: any) => {
              const gIndex = existingGroups.findIndex(
                (e: any) => e.name === g.name,
              );

              if (gIndex >= 0) {
                existingGroups[gIndex] = { ...existingGroups[gIndex], ...g };
              } else {
                existingGroups.push(g);
              }
            });

            mergedChecklist[idx].group = existingGroups;
          } else {
            mergedChecklist.push(newItem);
          }
        });
      }

      const updatedVehicleTesting: any = { ...existingVehicleTesting };

      if (FormBody.isTestCompleted !== undefined)
        updatedVehicleTesting.isTestCompleted = FormBody.isTestCompleted;

      if (FormBody.testDate !== undefined)
        updatedVehicleTesting.testDate = FormBody.testDate;

      if (FormBody.testResult !== undefined)
        updatedVehicleTesting.testResult = FormBody.testResult;

      if (FormBody.checklist !== undefined)
        updatedVehicleTesting.checklist = mergedChecklist;

      await this.collections.inductions.updateOne(
        { _id: existingInduction._id },
        {
          $set: {
            vehicleTesting: updatedVehicleTesting,
            status: updatedVehicleTesting.testResult,
          },
        },
      );

      await this.collections.assets.updateOne(
        { _id: existingInduction.assetId },
        {
          $set: {
            status: updatedVehicleTesting.testResult,
          },
        },
      );

      return this.json(req, res, 200, {
        message: "Vehicle Test Saved Successfully",
      });
    } catch (error) {
      return this.jsonError(res, 400, this.__component, "wrong", error);
    }
  };

  /* public delete = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      if (id) {
        const recruitment = await this.collections.recruitments.findOne({
          _id: new ObjectId(id),
        });
        if (!recruitment) {
          return this.jsonError(
            res,
            400,
            this.__component,
            "Recruitment does not exist"
          );
        }
        await this.collections.recruitments.updateOne(
          {
            _id: recruitment._id,
          },
          { $set: { isDeleted: true } }
        );
        await this.appLog(req, this.__component, "Delete", new ObjectId(id));
        return this.json(req, res, 200, {
          message: `Recruitment Deleted Successfully`,
        });
      } else {
        return this.jsonError(res, 400, this.__component, "delete");
      }
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  }; */

  /* public setRecruitmentStatus = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      if (id) {
        const recruitment = await this.collections.recruitments.findOne({
          _id: new ObjectId(id),
        });
        if (!recruitment) {
          return this.jsonError(
            res,
            400,
            this.__component,
            "Recruitment does not exist"
          );
        }
        await this.collections.recruitments.updateOne(
          {
            _id: new ObjectId(recruitment._id),
          },
          { $set: { isActive: !recruitment.isActive } }
        );
        await this.appLog(
          req,
          this.__component,
          "Active Recruitment",
          new ObjectId(id)
        );
        return this.json(req, res, 200, {
          message: `Recruitment ${
            !recruitment.isActive ? "Activated" : "Deactivated"
          } Successfully`,
        });
      } else {
        return this.jsonError(
          res,
          400,
          this.__component,
          "activate/deactivate"
        );
      }
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  }; */

  public getApplicantProfile = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { application_id, recruitment_id } = req.query;
      const applicationId =
        typeof application_id === "string"
          ? this.toObjectId(application_id)
          : application_id;
      const recruitmentId =
        typeof recruitment_id === "string"
          ? this.toObjectId(recruitment_id)
          : recruitment_id;
      const defaultFilter = { _id: applicationId };
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
                        $and: [
                          {
                            $in: [
                              "$$applicationId",
                              { $ifNull: ["$finalisedIds", []] },
                            ],
                          },
                          { $eq: ["$_id", recruitmentId] }, // 🔥 THIS IS IMPORTANT
                        ],
                      },
                    },
                  },
                ],
                as: "recruitment",
              },
            },
            { $unwind: "$recruitment" },
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
            { $unwind: "$customer" },
            {
              $lookup: {
                from: "regions",
                localField: "profile.physicalAddress.regionId",
                foreignField: "_id",
                as: "region",
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
                customerId: "$customer._id",
                customerName: "$customer.name",
                applicationStatus: 1,
                applicationNumber: 1,
                jobTitle: "$recruitment.jobTitle",
                jobType: "$recruitment.jobType",
                selfie: { $arrayElemAt: ["$selfieDocument.url", 0] },
                recruitmentId: "$recruitment._id",
                recruitmentCustomerId: "$recruitment.customerId",
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
  public getCandidateApplication = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { application_id } = req.query;
      const applicationId =
        typeof application_id === "string"
          ? this.toObjectId(application_id)
          : application_id;
      const defaultFilter = { _id: applicationId };
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
                from: "nationalities",
                localField: "profile.nationalityId",
                foreignField: "_id",
                as: "nationality",
              },
            },
            {
              $lookup: {
                from: "documentTypes",
                localField: "profile.documentTypeId",
                foreignField: "_id",
                as: "documentType",
              },
            },
            ...req.aggregations,
            {
              $project: {
                _id: 1,
                userName: { $arrayElemAt: ["$profile.userName", 0] },
                firstName: { $arrayElemAt: ["$profile.firstName", 0] },
                lastName: { $arrayElemAt: ["$profile.lastName", 0] },
                nationality: { $arrayElemAt: ["$nationality.name", 0] },
                documentType: { $arrayElemAt: ["$documentType.name", 0] },
                documentNumber: {
                  $arrayElemAt: ["$profile.idNumber", 0],
                },
                phoneNumber: { $arrayElemAt: ["$profile.phoneNumber", 0] },
                email: { $arrayElemAt: ["$profile.email", 0] },
                // customerName: { $arrayElemAt: ["$customer.name", 0] },
                //status: 1,
                //applicationNumber: 1,
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

  public getCustomerChecklist = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { customer_id, type } = req.query;

      const customerId =
        typeof customer_id === "string"
          ? this.toObjectId(customer_id)
          : customer_id;

      const defaultFilter = { _id: customerId };
      this.getAggrigation(req, this.filter_options, defaultFilter);

      const [data] = await Promise.all([
        this.collections.customers
          .aggregate([
            { $unwind: "$configuration" },
            {
              $lookup: {
                from: "checklists",
                let: {
                  checklistIds: "$configuration.checkListIds",
                  typeLower: { $toLower: "$configuration.checkListType" },
                  filterType: type
                    ? typeof type === "string"
                      ? type.toLowerCase()
                      : null
                    : null,
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          {
                            $cond: [
                              { $eq: ["$$filterType", null] },
                              true,
                              { $eq: ["$$typeLower", "$$filterType"] },
                            ],
                          },
                          { $in: ["$_id", "$$checklistIds"] },
                        ],
                      },
                    },
                  },
                ],
                as: "checklists",
              },
            },
            { $match: { "checklists.0": { $exists: true } } },
            ...req.aggregations,
            {
              $group: {
                _id: "$_id",
                checklists: { $push: "$checklists" },
              },
            },
            {
              $set: {
                checklists: {
                  $reduce: {
                    input: "$checklists",
                    initialValue: [],
                    in: { $concatArrays: ["$$value", "$$this"] },
                  },
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

  public generateContract = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const {
        customer_id,
        application_id,
        recruitment_id,
        contract_template_id,
        download,
      } = req.query;

      const customerId =
        typeof customer_id === "string"
          ? this.toObjectId(customer_id)
          : customer_id;

      const applicationId =
        typeof application_id === "string"
          ? this.toObjectId(application_id)
          : application_id;

      const recruitmentId =
        typeof recruitment_id === "string"
          ? this.toObjectId(recruitment_id)
          : recruitment_id;

      const contractTemplateId =
        typeof contract_template_id === "string"
          ? this.toObjectId(contract_template_id)
          : contract_template_id;

      const defaultFilter = {};
      this.getAggrigation(req, this.filter_options, defaultFilter);

      const customer = await this.collections.customers.findOne({
        _id: customerId,
      });

      const recruitment = await this.collections.recruitments.findOne({
        customerId: customerId,
        finalisedIds: applicationId,
        _id: recruitmentId,
      });

      const [application] = await Promise.all([
        this.collections.applications
          .aggregate([
            {
              $match: { _id: applicationId },
            },
            ...req.aggregations,
            {
              $lookup: {
                from: "userProfiles",
                localField: "profileId",
                foreignField: "_id",
                as: "profile",
              },
            },
          ])
          .toArray(),
      ]);
      const address = [
        customer?.physicalAddress?.line1,
        customer?.physicalAddress?.suburb,
        customer?.physicalAddress?.zipCode,
      ]
        .filter(Boolean)
        .join(" ");
      const data = {
        companyName: customer?.name || "",
        companyAddress: address,
        employeeName:
          application[0]?.profile[0].firstName +
            " " +
            application[0]?.profile[0].lastName || "",
        employeeId: application[0]?.profile[0].idNumber || "",
        contractDate: new Date().toLocaleDateString(),
        jobTitle: recruitment?.jobTitle || "",
        salary: "1000",
        startDate: moment(recruitment?.startDate).format("MM/DD/YYYY") || "",
        endDate: moment(recruitment?.endDate).format("MM/DD/YYYY") || "",
        noticePeriod: "30",
      };
      const template = await this.collections.cmcTemplates.findOne({
        isDeleted: { $ne: true },
        _id: contractTemplateId,
      });

      const html = this.replaceTemplateData(template?.content || "", data);
      if (download) {
        const contract = await this.collections.contracts.findOne({
          recruitmentId: recruitment?._id,
          userId: application[0].userId,
        });
        const finalHtml = this.appendSignatures(html, contract);
        const pdfPath = await this.generatePdf(
          finalHtml,
          data.employeeName + recruitment?._id + ".pdf",
          "contracts",
        );
        return this.json(req, res, 200, {
          data: { url: pdfPath, templateName: template?.name },
        });
      } else {
        const contract = {
          _id: new ObjectId(),
          userId: application[0].userId,
          applicationId: application[0]._id,
          recruitmentId: recruitment?._id,
          customerId: recruitment?.customerId,
          templateId: template?._id ?? undefined,
          startDate: recruitment?.startDate ?? null,
          endDate: recruitment?.endDate ?? null,
          templateContent: html,
          status: "unsigned",
        };

        const insertedContract =
          await this.collections.contracts.insertOne(contract);

        if (template?.signPlatform && template.signPlatform == "signNow") {
          const pdfPath = await this.generatePdf(
            html,
            data.employeeName + recruitment?._id + ".pdf",
            "contracts",
          );
          const sign = new SignNow();
          const result = await sign.uploadDocument(pdfPath);
          await sign.addFields(result.id);
          const inviteResult = await sign.embedInvite(
            result.id,
            //"u.hussain42@gmail.com",
            req.user.email ?? "manager@example.com",
            application[0]?.profile[0].email,
          );
          const linkResult = await sign.getEmbedInviteLink(
            result.id,
            inviteResult.data[0].id,
          );

          await sign.subscribeForEvents(result.id)
          await this.collections.contracts.updateOne(
            { _id: insertedContract.insertedId },
            {
              $set: {
                adminInviteId: inviteResult.data[0].id,
                userInviteId: inviteResult.data[1].id,
                adminInviteLink: linkResult?.data.link ?? null,
                signNowDocumentId: result.id,
                adminEmail:req.user.email,
                userEmail: application[0]?.profile[0].email,
              },
            },
          );
          return this.json(req, res, 200, {
            data: {
              templateName: template?.name,
              template: html,
              contractId: insertedContract.insertedId,
              signNowDocumentId: result.id,
              adminInviteLink: linkResult.data.link ?? null,
            },
          });
        }
        return this.json(req, res, 200, {
          data: {
            templateName: template?.name,
            template: html,
            contractId: insertedContract.insertedId,
          },
        });
      }
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getContract = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { user_id } = req.query;

      const userId =
        typeof user_id === "string" ? this.toObjectId(user_id) : user_id;

      const defaultFilter = {};
      this.getAggrigation(req, this.filter_options, defaultFilter);
      const data = await this.collections.contracts
        .aggregate([
          { $match: { userId: userId } },
          {
            $lookup: {
              from: "cmcTemplates",
              localField: "templateId",
              foreignField: "_id",
              as: "template",
            },
          },
          {
            $project: {
              _id: 1,
              template: "$templateContent",
              templateId: 1,
              signNowDocumentId: 1,
              templateName: { $arrayElemAt: ["$template.name", 0] },
              signature: {
                adminSign: "$adminSign",
                adminSignDate: "$adminSignDate",
                userSign: "$userSign",
                userSignDate: "$userSignDate",
              },
              adminInviteLink: 1,
              adminSigned:1
            },
          },
        ])
        .toArray();

      if (!data || data.length === 0) {
        return this.json(req, res, 200, { data: null });
      }

      return this.json(req, res, 200, { data: { data: data[0] } });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public signContract = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const FormBody = req.body;
      const existingContract = await this.collections.contracts.findOne({
        _id: this.toObjectId(id),
      });
      if (!existingContract) {
        return this.jsonError(
          res,
          400,
          this.__component,
          "Contract does not exist",
        );
      }
      const updateFields: any = {};

      updateFields.adminSign = FormBody.adminSign;
      updateFields.adminSignDate = FormBody.adminSignDate || new Date();

      // Prevent empty update
      if (Object.keys(updateFields).length === 0) {
        return this.jsonError(
          res,
          400,
          this.__component,
          "Invalid role or no data to update",
        );
      }

      await this.collections.contracts.updateOne(
        { _id: existingContract._id },
        { $set: updateFields },
      );
      return this.json(req, res, 200, {
        message: "Contract Signed Successfully",
      });
    } catch (error) {
      return this.jsonError(res, 400, this.__component, "wrong", error);
    }
  };

  public downloadSignNowContract = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const contract = await this.collections.contracts
        .aggregate([
          {
            $match: {
              _id: this.toObjectId(id),
            },
          },
          {
            $lookup: {
              from: "cmcTemplates",
              localField: "templateId",
              foreignField: "_id",
              as: "template",
            },
          },
          {
            $project: {
              _id: 1,
              templateName: { $arrayElemAt: ["$template.name", 0] },
              signNowDocumentId: 1,
            },
          },
        ])
        .toArray();
      if (!contract || contract.length === 0) {
        return this.jsonError(res, 404, this.__component, "Contract not found");
      }
      if (!contract[0].signNowDocumentId) {
        return this.jsonError(
          res,
          400,
          this.__component,
          "Contract not signed via SignNow",
        );
      }
      const signNow = new SignNow();
      const url = await signNow.downloadDocument(contract[0].signNowDocumentId);
      return this.json(req, res, 200, {
        data: { url: url, templateName: contract[0].templateName },
      });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };
}
