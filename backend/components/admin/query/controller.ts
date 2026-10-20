import { ObjectId } from "mongodb";
import { BaseController } from "../../../core";
import { Filter_Options, Request, Response } from "../../../__types";

export default class QueriesController extends BaseController {
  public __component: string = "queries";

  private filter_options: Filter_Options = {
    search: ["offboardingReason", "payrollReason"],
    defaultSort: "createdAt",
    filters: {},
  };

  public list = async (req: Request, res: Response): Promise<Response> => {
    try {
      const defaultFilter = { isDeleted: { $ne: true } };
      this.getAggrigation(req, this.filter_options, defaultFilter);

      const [data, count] = await Promise.all([
        this.collections.queries
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
                from: "userProfiles",
                localField: "assignedTo",
                foreignField: "_id",
                as: "assign",
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
                profileId: { $arrayElemAt: ["$profile._id", 0] },
                firstName: { $arrayElemAt: ["$profile.firstName", 0] },
                lastName: { $arrayElemAt: ["$profile.lastName", 0] },
                applicationNumber: {
                  $arrayElemAt: ["$application.applicationNumber", 0],
                },
                assignedTo: {
                  $concat: [
                    { $arrayElemAt: ["$assign.firstName", 0] },
                    " ",
                    { $arrayElemAt: ["$assign.lastName", 0] },
                  ],
                },
                status: 1,
                approved: 1,
              },
            },
          ])
          .toArray(),
        this.collections.queries
          .aggregate([...req.aggregations, ...(req.dbPagination || [])])
          .toArray(),
      ]);

      return this.json(req, res, 200, { data, count });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public get = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        return this.jsonError(res, 400, this.__component, "Invalid ID");
      }
      const record = await this.collections.queries
        .aggregate([
          {
            $match: { _id: this.toObjectId(id) },
          },
          { $unwind: "$type" },

          {
            $lookup: {
              from: "clearanceTypes", // 👈 change if different
              localField: "type._id",
              foreignField: "_id",
              as: "typeInfo",
            },
          },

          {
            $addFields: {
              "type.name": { $arrayElemAt: ["$typeInfo.name", 0] },
            },
          },

          {
            $project: {
              typeInfo: 0,
            },
          },

          {
            $group: {
              _id: "$_id",
              assignedTo: { $first: "$assignedTo" },
              approved: { $first: "$approved" },
              type: { $push: "$type" },
              notes: { $first: "$notes" },
            },
          },
        ])
        .toArray();

      if (!record) {
        return this.jsonError(res, 404, this.__component, "Record Not Found");
      }

      return this.json(req, res, 200, { data: record[0] });
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
      const existing = await this.collections.queries.findOne({
        _id: this.toObjectId(id),
      });
      if (!existing) {
        return this.jsonError(res, 400, this.__component, "Record not found");
      }
      const type: { _id: ObjectId; status: string }[] = [];
      if (FormBody.type.length > 0) {
        FormBody.type.forEach((el) => {
          type.push({ _id: this.toObjectId(el._id), status: el.status });
        });
      }
      const allCompleted = FormBody.type.every(
        (el) => el.status === "completed",
      );
      const payload = {
        profileId: this.toObjectId(FormBody.profileId),
        assignedTo: this.toObjectId(FormBody.assignedTo),
        type: type,
        status: allCompleted ? "completed" : "in progress",
        queryDate: FormBody.queryDate ?? existing.queryDate,
        approved: FormBody.approved,
      } as const;

      if (id) {
        await this.collections.queries.updateOne(
          { _id: existing._id },
          {
            $set: payload,
          },
        );
      } else {
        await this.collections.queries.insertOne({
          _id: new ObjectId(),
          ...payload,
        });
      }

      return this.json(req, res, 200, {
        message: `Query ${id ? "Updated" : "Created"} Successfully`,
      });
    } catch (error) {
      return this.jsonError(res, 400, this.__component, "wrong", error);
    }
  };

  public assignToAdmin = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const FormBody = req.body;
      if (FormBody.queryIds.length == 0) {
        return this.jsonError(
          res,
          400,
          this.__component,
          "No record to assign",
        );
      }
      if (FormBody.queryIds.length > 0) {
        FormBody.queryIds.forEach(async (el) => {
          await this.collections.queries.updateMany(
            { _id: this.toObjectId(el) },
            {
              $set: { assignedTo: this.toObjectId(FormBody.assignTo) },
            },
          );
        });
      }

      return this.json(req, res, 200, {
        message: `Queries assign to admin successfully`,
      });
    } catch (error) {
      return this.jsonError(res, 400, this.__component, "wrong", error);
    }
  };

  public getApplicantProfile = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { profile_id } = req.query;
      const profileId =
        typeof profile_id === "string"
          ? this.toObjectId(profile_id)
          : profile_id;
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
                site: { $arrayElemAt: ["$recruitment.site", 0] },
                startDate: { $arrayElemAt: ["$recruitment.startDate", 0] },
                endDate: { $arrayElemAt: ["$recruitment.endDate", 0] },
                selfie: { $arrayElemAt: ["$selfieDocument.url", 0] },
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

  // User Profile related APIs

  public userQuerylist = async (
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
        this.collections.queries
          .aggregate([
            {
              $lookup: {
                from: "clearanceTypes",
                localField: "type._id",
                foreignField: "_id",
                as: "typeDetails",
              },
            },
            {
              $unwind: "$type",
            },

            ...req.aggregations,
            {
              $project: {
                queryDate: 1,
                isAnonymous: 1,
                _id: "$type._id",
                status: "$type.status",
                name: {
                  $arrayElemAt: [
                    {
                      $map: {
                        input: {
                          $filter: {
                            input: "$typeDetails",
                            cond: { $eq: ["$$this._id", "$type._id"] },
                          },
                        },
                        as: "matched",
                        in: "$$matched.name",
                      },
                    },
                    0,
                  ],
                },
              },
            },
          ])
          .toArray(),
        this.collections.queries
          .aggregate([
            {
              $lookup: {
                from: "clearanceTypes",
                localField: "type._id",
                foreignField: "_id",
                as: "typeDetails",
              },
            },
            {
              $unwind: "$type",
            },
            ...(req.dbPagination || []),
          ])
          .toArray(),
      ]);

      return this.json(req, res, 200, { data, count });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public createOrUpdateUserQuery = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const FormBody = req.body;

      const type: { _id: ObjectId; status: string }[] = [];
      FormBody.type.forEach((el) => {
        type.push({ _id: this.toObjectId(el), status: "in progress" });
      });
      const payload = {
        profileId: this.toObjectId(FormBody.profileId),
        type: type,
        status: "in progress",
        queryDate: FormBody.queryDate != "" ? FormBody.queryDate : new Date(),
        isAnonymous: FormBody.isAnonymous,
        notes: FormBody.notes,
      } as const;

      if (id) {
        const existing = await this.collections.queries.findOne({
          _id: this.toObjectId(id),
        });
        if (!existing) {
          return this.jsonError(res, 400, this.__component, "Record not found");
        }
        await this.collections.queries.updateOne(
          { _id: existing._id },
          {
            $set: payload,
          },
        );
      } else {
        await this.collections.queries.insertOne({
          _id: new ObjectId(),
          ...payload,
        });
      }

      return this.json(req, res, 200, {
        message: `Query ${id ? "Updated" : "Created"} Successfully`,
      });
    } catch (error) {
      return this.jsonError(res, 400, this.__component, "wrong", error);
    }
  };
}
