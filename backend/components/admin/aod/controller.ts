import { ObjectId } from "mongodb";
import { BaseController } from "../../../core";
import { Filter_Options, Request, Response } from "../../../__types";

export default class AODController extends BaseController {
  public __component: string = "aods";
  private filter_options: Filter_Options = {
    search: [
      "profile.firstName",
      "profile.lastName",
      "application.applicationNumber",
      "application.applicationStatus",
      "amount",
    ],
    defaultSort: "_id",
    filters: {},
  };

  public list = async (req: Request, res: Response): Promise<Response> => {
    try {
      const defaultFilter = { isDeleted: { $ne: true } };
      this.getAggrigation(req, this.filter_options, defaultFilter);
      const [data, count] = await Promise.all([
        this.collections.aods
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
                from: "applications",
                localField: "profileId",
                foreignField: "profileId",
                as: "application",
              },
            },
            ...req.aggregations,
            {
              $project: {
                _id: 1,
                firstName: { $arrayElemAt: ["$profile.firstName", 0] },
                lastName: { $arrayElemAt: ["$profile.lastName", 0] },
                applicationNumber: {
                  $arrayElemAt: ["$application.applicationNumber", 0],
                },
                status: {
                  $arrayElemAt: ["$application.applicationStatus", 0],
                },
                amount: 1,
                templateId: 1,
                userSign: 1,
                userSignDate: 1,
              },
            },
          ])
          .toArray(),
        this.collections.aods
          .aggregate([...req.aggregations, ...req.dbPagination])
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
      const defaultFilter = { _id: new ObjectId(id) };
      const aod = await this.collections.aods.findOne(defaultFilter, {
        projection: {
          _id: 1,
          profileId: 1,
          templateId: 1,
          paymentTermId: 1,
          aodTypeId: 1,
          aodReasonId: 1,
          date: 1,
          paymentDuration: 1,
          amount: 1,
          weekOrMonth: 1,
          adminSign: 1,
          adminSignDate: 1
        },
      });
      if (aod) {
        return this.json(req, res, 200, { data: aod });
      }
      return this.jsonError(res, 400, this.__component, "get");
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getProfileById = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { profileId } = req.params;
      const defaultFilter = { _id: this.toObjectId(profileId) };
      this.getAggrigation(req, this.filter_options, defaultFilter);
      const [profile] = await Promise.all([
        this.collections.userProfiles
          .aggregate([
            {
              $lookup: {
                from: "applications",
                localField: "_id",
                foreignField: "profileId",
                as: "application",
              },
            },
            {
              $lookup: {
                from: "recruitments",
                localField: "application._id",
                foreignField: "finalisedIds",
                as: "recruitment",
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
                localField: "recruitment.regionId",
                foreignField: "_id",
                as: "region",
              },
            },
            {
              $lookup: {
                from: "documents",
                let: {
                  userId: "$userId",
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
            ...req.aggregations,
            {
              $project: {
                _id: 1,
                firstName: 1,
                lastName: 1,
                email: 1,
                phoneNumber: 1,
                status: { $arrayElemAt: ["$application.applicationStatus", 0] },
                applicationNumber: {
                  $arrayElemAt: ["$application.applicationNumber", 0],
                },
                customerName: { $arrayElemAt: ["$customer.name", 0] },
                customerId: { $arrayElemAt: ["$customer._id", 0] },
                region: { $arrayElemAt: ["$region.name", 0] },
                jobTitle: { $arrayElemAt: ["$recruitment.jobTitle", 0] },
                jobType: { $arrayElemAt: ["$recruitment.jobType", 0] },
                selfie: { $arrayElemAt: ["$selfieDocument.url", 0] },
              },
            },
          ])
          .toArray(),
      ]);
      if (profile.length == 1) {
        return this.json(req, res, 200, { data: profile[0] });
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
      if (id) {
        const existingAOD = await this.collections.aods.findOne({
          _id: this.toObjectId(id),
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
        return this.json(req, res, 200, {
          data: {
            message: "AOD Updated Successfully",
            aodId: existingAOD._id,
          },
        });
      } else {
        const insertedAod = await this.collections.aods.insertOne({
          _id: new ObjectId(),
          ...AOD,
        });
        return this.json(req, res, 200, {
          data: {
            message: "AOD Saved Successfully",
            aodId: insertedAod.insertedId,
          },
        });
      }
    } catch (error) {
      return this.jsonError(res, 400, this.__component, "wrong", error);
    }
  };

  public delete = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      if (id) {
        await this.collections.aods.updateOne(
          {
            _id: new ObjectId(id),
          },
          { $set: { isDeleted: true } },
        );
        await this.appLog(req, this.__component, "Delete", new ObjectId(id));
        return this.json(req, res, 200, {
          message: `AOD Deleted Successfully`,
        });
      } else {
        return this.jsonError(res, 400, this.__component, "delete");
      }
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  // User Profile related APIs

  public userAODlist = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const defaultFilter = {
        isDeleted: { $ne: true },
        profileId: req.user.profileId,
      };
      this.getAggrigation(req, this.filter_options, defaultFilter);
      const [data, count] = await Promise.all([
        this.collections.aods
          .aggregate([
            {
              $lookup: {
                from: "aodReasons",
                localField: "aodReasonId",
                foreignField: "_id",
                as: "aodReason",
              },
            },
            ...req.aggregations,
            {
              $project: {
                _id: 1,
                date: 1,
                reason: { $arrayElemAt: ["$aodReason.name", 0] },
                amount: 1,
                paymentDuration: 1,
                status: {
                  $cond: {
                    if: { $ifNull: ["$userSign", false] },
                    then: "Signed",
                    else: "Unsigned",
                  },
                },
              },
            },
          ])
          .toArray(),
        this.collections.aods
          .aggregate([...req.aggregations, ...req.dbPagination])
          .toArray(),
      ]);
      return this.json(req, res, 200, { data, count: count });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  // Common APIs

  public getAODTemplate = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const { download } = req.query;
      const aod = await this.collections.aods
        .aggregate([
          {
            $match: {
              _id: this.toObjectId(id),
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
            $lookup: {
              from: "aodReasons",
              localField: "aodReasonId",
              foreignField: "_id",
              as: "aodReason",
            },
          },
          {
            $project: {
              _id: 1,
              firstName: { $arrayElemAt: ["$profile.firstName", 0] },
              lastName: { $arrayElemAt: ["$profile.lastName", 0] },
              amount: 1,
              reason: { $arrayElemAt: ["$aodReason.name", 0] },
              templateId: 1,
              adminSign: 1,
              adminSignDate: 1,
              userSign: 1,
              userSignDate: 1,
            },
          },
        ])
        .toArray();
      const template = await this.collections.cmcTemplates.findOne({
        _id: aod[0].templateId,
      });

      const data = {
        name: aod[0].firstName + " " + aod[0].lastName,
        reason: aod[0].reason ?? "",
        amount: aod[0].amount,
      };
      const html = this.replaceTemplateData(template?.content || "", data);
      if (download) {
        const finalHtml = this.appendSignatures(html, aod[0]);

        const pdfPath = await this.generatePdf(
          finalHtml,
          data.name + "_" + template?.name + ".pdf",
          "Aods",
        );
        return this.json(req, res, 200, {
          data: { url: pdfPath, templateName: template?.name },
        });
      }

      const signatures = {
        adminSign: aod[0].adminSign,
        adminSignDate: aod[0].adminSignDate,
        userSign: aod[0].userSign,
        userSignDate: aod[0].userSignDate,
      };

      return this.json(req, res, 200, {
        data: {
          templateName: template?.name,
          template: html,
          signature: signatures,
        },
      });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public signAOD = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const FormBody = req.body;
      const role = req.user?.role?.name;
      const existingAOD = await this.collections.aods.findOne({
        _id: this.toObjectId(id),
      });
      if (!existingAOD) {
        return this.jsonError(res, 400, this.__component, "AOD does not exist");
      }
      const updateFields: any = {};

      if (role === "Admin") {
        updateFields.adminSign = FormBody.adminSign;
        updateFields.adminSignDate = FormBody.adminSignDate || new Date();
      } else {
        updateFields.userSign = FormBody.userSign;
        updateFields.userSignDate = FormBody.userSignDate || new Date();
      }

      // Prevent empty update
      if (Object.keys(updateFields).length === 0) {
        return this.jsonError(
          res,
          400,
          this.__component,
          "Invalid role or no data to update",
        );
      }

      await this.collections.aods.updateOne(
        { _id: existingAOD._id },
        { $set: updateFields },
      );
      return this.json(req, res, 200, {
        message: "AOD Signed Successfully",
      });
    } catch (error) {
      return this.jsonError(res, 400, this.__component, "wrong", error);
    }
  };
}
