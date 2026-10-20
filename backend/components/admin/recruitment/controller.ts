import { ObjectId } from "mongodb";
import { BaseController } from "../../../core";
import { Filter_Options, Request, Response } from "../../../__types";
import { Recruitment } from "../../../models";
import { Dot360 } from "../../../helpers/dot360";

export default class RecruitmentController extends BaseController {
  public __component: string = "recruitments";
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
      roleId: { type: "objectId", filter: "$in" },
    },
  };

  public list = async (req: Request, res: Response): Promise<Response> => {
    try {
      const defaultFilter = { isDeleted: { $ne: true } };
      const { recruitment_id } = req.query;
      if (recruitment_id) {
        const recruitmentId =
          typeof recruitment_id == "string"
            ? this.toObjectId(recruitment_id)
            : recruitment_id;
        defaultFilter["_id"] = recruitmentId;
      }
      this.getAggrigation(req, this.filter_options, defaultFilter);
      const [data, count] = await Promise.all([
        this.collections.recruitments
          .aggregate([
            {
              $lookup: {
                from: "customers",
                localField: "customerId",
                foreignField: "_id",
                as: "customer",
              },
            },
            {
              $unwind: {
                path: "$customer",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: "customerContacts",
                let: { cid: "$customer._id" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$customerId", "$$cid"] },
                          { $eq: ["$isDefault", true] },
                        ],
                      },
                    },
                  },
                ],
                as: "defaultContact",
              },
            },
            {
              $lookup: {
                from: "regions",
                localField: "regionId",
                foreignField: "_id",
                as: "region",
              },
            },
            {
              $lookup: {
                from: "areas",
                localField: "areaIds",
                foreignField: "_id",
                as: "area",
              },
            },
            {
              $lookup: {
                from: "recruitmentTypes",
                localField: "recruitmentTypeId",
                foreignField: "_id",
                as: "recruitmentType",
              },
            },
            ...req.aggregations,
            {
              $project: {
                _id: 1,
                requestNumber: 1,
                customerName: "$customer.name",
                customerId:"$customer._id",
                jobType: { $arrayElemAt: ["$recruitmentType.name", 0] },
                status: 1,
                region: { $arrayElemAt: ["$region.name", 0] },
                area: "$area.name",
                site: 1,
                defaultContact: {
                  $arrayElemAt: ["$defaultContact.phoneNumber", 0],
                },
                jobTitle: 1,
                requestDate: 1,
                isActive: 1,
              },
            },
          ])
          .toArray(),
        this.collections.recruitments
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
      const defaultFilter = { _id: this.toObjectId(id) };
      const recruitment = await this.collections.recruitments.findOne(
        defaultFilter,
        {
          projection: {
            _id: 1,
            customerId: 1,
            regionId: 1,
            areaIds: 1,
            site: 1,
            recruitmentTypeId: 1,
            recruitmentModelId: 1,
            model: 1,
            availablePositions: 1,
            jobType: 1,
            jobTitle: 1,
            jobDescription: 1,
            startDate: 1,
            isEndDate: 1,
            endDate: 1,
            skillIds: 1,
            costCenterIds: 1,
            status: 1,
            isInductionRequired: 1,
            requestNumber: 1,
          },
        }
      );

      if (recruitment) {
        return this.json(req, res, 200, { data: recruitment });
      }
      return this.jsonError(res, 400, this.__component, "get");
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public createOrUpdate = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const FormBody = req.body;
      if (FormBody.customerId) {
        FormBody.customerId = this.toObjectId(FormBody.customerId);
      }
      const costCenterIds =
        FormBody.costCenterIds && Array.isArray(FormBody.costCenterIds)
          ? FormBody.costCenterIds.map((id: string) => this.toObjectId(id))
          : [];
      if (FormBody.regionId) {
        FormBody.regionId = this.toObjectId(FormBody.regionId);
      }
      const areaIds =
        FormBody.areaIds && Array.isArray(FormBody.areaIds)
          ? FormBody.areaIds.map((id: string) => this.toObjectId(id))
          : [];
      if (FormBody.recruitmentTypeId) {
        FormBody.recruitmentTypeId = this.toObjectId(
          FormBody.recruitmentTypeId
        );
      }
      if (FormBody.recruitmentModelId) {
        FormBody.recruitmentModelId = this.toObjectId(
          FormBody.recruitmentModelId
        );
      }
      const skillIds =
        FormBody.skillIds && Array.isArray(FormBody.skillIds)
          ? FormBody.skillIds.map((id: string) => this.toObjectId(id))
          : [];
      const documentIds =
        FormBody.documentIds && Array.isArray(FormBody.documentIds)
          ? FormBody.documentIds.map((id: string) => this.toObjectId(id))
          : [];
      const recruitment = {
        customerId: FormBody.customerId,
        costCenterIds,
        regionId: FormBody.regionId,
        areaIds,
        site: FormBody.site,
        recruitmentTypeId: FormBody.recruitmentTypeId,
        recruitmentModelId: FormBody.recruitmentModelId,
        availablePositions: FormBody.availablePositions,
        jobType: FormBody.jobType,
        jobTitle: FormBody.jobTitle,
        jobDescription: FormBody.jobDescription,
        startDate: FormBody.startDate,
        isEndDate: FormBody.isEndDate,
        endDate: FormBody.endDate,
        isInductionRequired: FormBody.isInductionRequired,
        skillIds,
        documentIds,
      };
      if (id) {
        const existingRecruitment = await this.collections.recruitments.findOne(
          { _id: this.toObjectId(id) }
        );
        if (!existingRecruitment) {
          return this.jsonError(
            res,
            400,
            this.__component,
            "Recruitment does not exist"
          );
        }

        await this.collections.recruitments.updateOne(
          { _id: existingRecruitment._id },
          {
            $set: {
              ...recruitment,
            },
          }
        );
      } else {
        const addFields: Pick<
          Recruitment,
          "status" | "requestNumber" | "isActive" | "requestDate"
        > = {
          requestNumber: this.generateNumber("Req"),
          status: "searching",
          isActive: true,
          requestDate: new Date(),
        };
        const insertedRecruitmet =
          await this.collections.recruitments.insertOne({
            _id: new ObjectId(),
            ...recruitment,
            ...addFields,
          });
        return this.json(req, res, 200, {
          data: {
            message: "Step 1 Saved, Application created successfully",
            recruitmentId: insertedRecruitmet.insertedId,
          },
        });
      }
      return this.json(req, res, 200, {
        message: `Recruitment ${id ? "Updated" : "Saved"} Successfully`,
      });
    } catch (error) {
      return this.jsonError(res, 400, this.__component, "wrong", error);
    }
  };

  public delete = async (req: Request, res: Response): Promise<Response> => {
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
  };

  public setRecruitmentStatus = async (
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
  };

  public getCustomerCostCenters = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { customerId } = req.params;
      if (customerId) {
        const customerCostCenters = await this.collections.customers
          .aggregate([
            { $match: { _id: this.toObjectId(customerId) } },
            {
              $lookup: {
                from: "costCenters",
                localField: "costCenterIds",
                foreignField: "_id",
                as: "costCenters",
              },
            },
            { $unwind: "$costCenters" },
            {
              $project: {
                value: "$costCenters._id",
                name: "$costCenters.name",
              },
            },
          ])
          .toArray();

        return this.json(req, res, 200, { data: customerCostCenters });
      } else {
        return this.jsonError(
          res,
          400,
          this.__component,
          "Cost centers not found"
        );
      }
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public shortListedCandidates = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const FormBody = req.body;
      if (FormBody.shortListedId) {
        FormBody.shortListedId = this.toObjectId(FormBody.shortListedId);
      }
      const existingRecruitment = await this.collections.recruitments.findOne({
        _id: this.toObjectId(id),
      });
      if (!existingRecruitment) {
        return this.jsonError(
          res,
          400,
          this.__component,
          "Recruitment does not exist"
        );
      }

      const isAlreadyShortlisted = existingRecruitment.shortListedIds?.some(
        (x: any) => x.equals(FormBody.shortListedId)
      );

      if (isAlreadyShortlisted) {
        await this.collections.recruitments.updateOne(
          { _id: existingRecruitment._id },
          { $pull: { shortListedIds: FormBody.shortListedId } }
        );

        await this.collections.applications.updateOne(
          { _id: FormBody.shortListedId },
          { $set: { applicationStatus: "accepted" } }
        );

        return this.json(req, res, 200, {
          message: "Candidate removed from shortlist",
        });
      } else {
        const update: any = {
          $addToSet: { shortListedIds: FormBody.shortListedId },
        };
        if (
          !existingRecruitment.finalisedIds ||
          existingRecruitment.finalisedIds.length === 0
        ) {
          update.$set = { status: "shortlisted" };
        }
        await this.collections.recruitments.updateOne(
          { _id: existingRecruitment._id },
          update
        );
        await this.collections.applications.updateOne(
          { _id: FormBody.shortListedId },
          { $set: { applicationStatus: "shortlisted" } }
        );

        //integratin for dot360 verification when candidate is shortlisted

        const profile = await this.collections.applications
          .aggregate([
            {
              $match: {
                _id: this.toObjectId(FormBody.shortListedId),
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
              $unwind: {
                path: "$profile",
                preserveNullAndEmptyArrays: true,
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
            {
              $unwind: {
                path: "$documentType",
                preserveNullAndEmptyArrays: true,
              },
            },

            {
              $project: {
                _id: 1,
                profile: 1,
                documentType: 1,
              },
            },
          ])
          .toArray();

        if (profile && profile.length > 0) {
          const dot360 = new Dot360();
          if (profile[0].documentType.name == "ID") {
            const verification = await dot360.performVerification({
              "type": "IDV+",
              "id_type": "sa_id",
              "id_number": profile[0].profile.idNumber,
              "first_name": profile[0].profile.firstName,
              "surname": profile[0].profile.lastName,
              "date_of_birth": profile[0].profile.dateOfBirth.toISOString().split("T")[0],
              "email_address": profile[0].profile.email,
              "contact_number": profile[0].profile.phoneNumber,
              "consent_type": "internal"
            });
            await this.collections.userProfiles.updateOne({ _id: this.toObjectId(profile[0].profile._id) }, { $addToSet: { verifications: {name:profile[0].documentType.name, ref: verification.reference, status: verification.status, result: "pending" } } })
          }
        }

        return this.json(req, res, 200, {
          message: "Candidate shortlisted successfully",
        });
      }
    } catch (error) {
      return this.jsonError(res, 400, this.__component, "wrong", error);
    }
  };

  public finalisedCandidates = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const FormBody = req.body;
      if (FormBody.finalisedId) {
        FormBody.finalisedId = this.toObjectId(FormBody.finalisedId);
      }
      const existingRecruitment = await this.collections.recruitments.findOne({
        _id: this.toObjectId(id),
      });
      if (!existingRecruitment) {
        return this.jsonError(
          res,
          400,
          this.__component,
          "Recruitment does not exist"
        );
      }

      const isAlreadyFinalised = existingRecruitment.finalisedIds?.some(
        (x: any) => x.equals(FormBody.finalisedId)
      );

      if (isAlreadyFinalised) {
        await this.collections.recruitments.updateOne(
          { _id: existingRecruitment._id },
          { $pull: { finalisedIds: FormBody.finalisedId } }
        );

        return this.json(req, res, 200, {
          message: "Candidate removed from finalised list",
        });
      } else {
        await this.collections.recruitments.updateOne(
          { _id: existingRecruitment._id },
          {
            $addToSet: { finalisedIds: FormBody.finalisedId },
            $pull: { shortListedIds: FormBody.finalisedId },
            $set: { status: "finalised" },
          }
        );
        await this.collections.applications.updateOne(
          { _id: FormBody.finalisedId },
          { $set: { applicationStatus: "finalised" } }
        );

        return this.json(req, res, 200, {
          message: "Candidate approved for finalisation",
        });
      }
    } catch (error) {
      return this.jsonError(res, 400, this.__component, "wrong", error);
    }
  };

  public getApplication = async (
    req: Request,
    res: Response
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
                from: "regions",
                localField: "profile.physicalAddress.regionId",
                foreignField: "_id",
                as: "region",
              },
            },
            {
              $lookup: {
                from: "documentTypes",
                localField: "profile.documentTypeId",
                foreignField: "_id",
                as: "type",
              },
            },
            ...req.aggregations,
            {
              $project: {
                _id: 1,
                nickName: { $arrayElemAt: ["$profile.userName", 0] },
                firstName: { $arrayElemAt: ["$profile.firstName", 0] },
                lastName: { $arrayElemAt: ["$profile.lastName", 0] },
                phoneNumber: { $arrayElemAt: ["$profile.phoneNumber", 0] },
                region: { $arrayElemAt: ["$region.name", 0] },
                documentType: { $arrayElemAt: ["$type.name", 0] },
                idNumber: { $arrayElemAt: ["$profile.idNumber", 0] },
                contactedDate: 1,
                trainingDate: 1,
                trainingCompletionDate: 1,
                applicationCategory: 1,
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

  public updateApplication = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { applicationId } = req.params;
      const application = await this.collections.applications.findOne({
        _id: this.toObjectId(applicationId),
      });
      if (!application) {
        return this.jsonError(
          res,
          400,
          this.__component,
          "Application does not exist"
        );
      }
      const FormBody = req.body;
      const updateData: any = {};
      updateData.applicationCategory = FormBody.applicationCategory;
      if (FormBody.contactedDate) {
        updateData.contactedDate = FormBody.contactedDate;
      }
      if (FormBody.trainingDate) {
        updateData.trainingDate = FormBody.trainingDate;
      }
      if (FormBody.trainingCompletionDate) {
        updateData.trainingCompletionDate = FormBody.trainingCompletionDate;
      }

      await this.collections.applications.updateOne(
        { _id: application._id },
        { $set: updateData }
      );

      return this.json(req, res, 200, {
        message: `Candidate details Updated Successfully`,
      });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };
}
