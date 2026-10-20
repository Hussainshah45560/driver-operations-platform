import { ObjectId } from "mongodb";
import { BaseController } from "../../../core";
import { Filter_Options, Request, Response } from "../../../__types";

export default class OffBoardingController extends BaseController {
  public __component: string = "offBoardings";

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
        this.collections.offBoardings
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
                from: "customers",
                localField: "customerId",
                foreignField: "_id",
                as: "customer",
              },
            },

            ...req.aggregations,
            {
              $project: {
                _id: 1,
                profileId: { $arrayElemAt: ["$profile._id", 0] },
                firstName: { $arrayElemAt: ["$profile.firstName", 0] },
                lastName: { $arrayElemAt: ["$profile.lastName", 0] },
                customerName: { $arrayElemAt: ["$customer.name", 0] },
                offboardingDate: 1,
                payrollReason: 1,
                status: 1,
                approved: 1,
              },
            },
          ])
          .toArray(),
        this.collections.offBoardings
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
      const record = await this.collections.offBoardings.findOne(
        { _id: this.toObjectId(id) },
        {
          projection: {
            _id: 1,
            offboardingReason: 1,
            payrollReason: 1,
            reason: 1,
            offboardingDate: 1,
            endDate: 1,
            status: 1,
            requirements: 1,
            approved: 1,
          },
        },
      );

      if (!record) {
        return this.jsonError(res, 404, this.__component, "Record Not Found");
      }

      return this.json(req, res, 200, { data: record });
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
      const requirementIds =
        FormBody.requirements && Array.isArray(FormBody.requirements)
          ? FormBody.requirements.map((id: string) => this.toObjectId(id))
          : [];

      const payload = {
        profileId: this.toObjectId(FormBody.profileId),
        customerId: this.toObjectId(FormBody.customerId),
        offboardingReason: FormBody.offboardingReason,
        payrollReason: FormBody.payrollReason,
        reason: FormBody.reason,
        offboardingDate: FormBody.offboardingDate,
        requirements: requirementIds,
        endDate: FormBody.endDate,
        status: FormBody.status,
        approved: FormBody.approved,
      };
      if (
        FormBody.status == "completed" &&
        FormBody.offboardingReason == "contractEnded" &&
        FormBody.approved == true
      ) {
        const application = await this.collections.applications.findOne({
          profileId: this.toObjectId(FormBody.profileId),
        });
        const applicationId = application?._id;
        await this.collections.recruitments.updateOne(
          { finalisedIds: applicationId }, // find recruitment that has this application
          {
            $pull: { finalisedIds: applicationId }, // remove from finalisedIds
            $addToSet: { offboardingIds: applicationId }, // add to offboardingIds (avoids duplicates)
          },
        );
        await this.collections.applications.updateOne(
          { profileId: this.toObjectId(FormBody.profileId) },
          {
            $set: { applicationStatus: "accepted" },
          },
        );
      } else if (
        FormBody.status == "completed" &&
        FormBody.offboardingReason == "termination"
      ) {
        await this.collections.applications.updateOne(
          { profileId: this.toObjectId(FormBody.profileId) },
          {
            $set: { applicationStatus: "terminated" },
          },
        );
      }
      if (id) {
        const existing = await this.collections.offBoardings.findOne({
          _id: this.toObjectId(id),
        });
        if (!existing) {
          return this.jsonError(res, 400, this.__component, "Record not found");
        }
        await this.collections.offBoardings.updateOne(
          { _id: existing._id },
          { $set: payload },
        );
        if (FormBody.requirements.length > 0) {
          const query = await this.collections.queries.findOne({
            profileId: this.toObjectId(FormBody.profileId),
          });
          const type: { _id: ObjectId; status: string }[] = [];
          FormBody.requirements.forEach((el) => {
            type.push({ _id: this.toObjectId(el), status: "in progress" });
          });
          await this.collections.queries.updateOne(
            { _id: query?._id },
            {
              $set: {
                type: type,
              },
            },
          );
        }
      } else {
        await this.collections.offBoardings.insertOne({
          _id: new ObjectId(),
          ...payload,
        });
        if (FormBody.requirements.length > 0) {
          const type: { _id: ObjectId; status: string }[] = [];
          FormBody.requirements.forEach((el) => {
            type.push({ _id: this.toObjectId(el), status: "in progress" });
          });
          const query = {
            _id: new ObjectId(),
            profileId: this.toObjectId(FormBody.profileId),
            queryDate: new Date(),
            type: type,
            status: "in progress" as const,
          };
          await this.collections.queries.insertOne(query);
        }
      }

      return this.json(req, res, 200, {
        message: `Offboarding ${id ? "Updated" : "Created"} Successfully`,
      });
    } catch (error) {
      return this.jsonError(res, 400, this.__component, "wrong", error);
    }
  };

  public delete = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      if (!id) {
        return this.jsonError(res, 400, this.__component, "delete");
      }
      const offBoarding = await this.collections.offBoardings.findOne({
        _id: this.toObjectId(id),
      });
      if (!offBoarding) {
        return this.jsonError(
          res,
          404,
          this.__component,
          "offBoarding does not exist",
        );
      }
      await this.collections.offBoardings.updateOne(
        { _id: offBoarding._id },
        { $set: { isDeleted: true } },
      );
      await this.appLog(req, this.__component, "Delete", this.toObjectId(id));
      return this.json(req, res, 200, {
        message: "Off Boarding Deleted Successfully",
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
}
