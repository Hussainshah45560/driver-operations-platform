import { ObjectId } from "mongodb";
import { BaseController } from "../../../core";
import { Filter_Options, Request, Response } from "../../../__types";
import ne from "node-each";
import { uploadDocument } from "../../../helpers/image";
import { Document } from "../../../models";
import { LicenseDisk } from "../../../helpers/licenseDisc";
import { sendSMS } from "../../../helpers/sms";
import { EmailHelper } from "../../../helpers/email";
import Utility from "../../../helpers/utility";
import config from "../../../config/config";

export default class ApplicationController extends BaseController {
  public __component: string = "applications";
  private filter_options: Filter_Options = {
    search: [
      "profile.firstName",
      "profile.lastName",
      "applicationNumber",
      "applicationStatus",
    ],
    defaultSort: "_id",
    filters: {
      promoterIds: { type: "objectId", filter: "$in" },
      industryIds: { type: "objectId", filter: "$in" },
      firmId: { type: "objectId", filter: "$in" },
    },
  };

  public list = async (req: Request, res: Response): Promise<Response> => {
    try {
      const defaultFilter = { isDeleted: { $ne: true } };
      if (
        req.user.role &&
        ["Applicant", "Driver"].includes(req.user.role?.name)
      ) {
        defaultFilter["userId"] = this.toObjectId(req.user._id);
      }
      if (
        req.user.role &&
        ["Application Confirmer"].includes(req.user.role?.name)
      ) {
        defaultFilter["$or"] = [
          { applicationStatus: "completed" },
          { applicationStatus: "not confirmed" },
        ];
      }
      if (
        req.user.role &&
        ["Application Approver"].includes(req.user.role?.name)
      ) {
        defaultFilter["$or"] = [
          { applicationStatus: "changed" },
          { applicationStatus: "confirmed" },
          { applicationStatus: "rejected" },
        ];
      }
      this.getAggrigation(req, this.filter_options, defaultFilter);
      const [data, count] = await Promise.all([
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
                from: "tests",
                let: { userId: "$userId" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$userId", "$$userId"],
                      },
                    },
                  },
                  {
                    $sort: { createdAt: -1 },
                  },
                  {
                    $group: {
                      _id: "$testTypeId",
                      testDate: { $first: "$date" },
                      status: { $first: "$status" },
                    },
                  },

                  // 👇 JOIN testTypes COLLECTION HERE
                  {
                    $lookup: {
                      from: "testTypes",
                      localField: "_id",
                      foreignField: "_id",
                      as: "type",
                    },
                  },
                  {
                    $unwind: {
                      path: "$type",
                      preserveNullAndEmptyArrays: true,
                    },
                  },

                  // 👇 FINAL SHAPE
                  {
                    $project: {
                      _id: 0,
                      testTypeName: "$type.name", // ✅ HERE IS THE NAME
                      testDate: 1,
                      status: 1,
                    },
                  },
                ],
                as: "tests",
              },
            },
            {
              $lookup: {
                from: "recruitments",
                let: { appId: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $in: [
                          "$$appId",
                          { $ifNull: ["$finalisedIds", []] }, // ✅ FIX HERE
                        ],
                      },
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
                  {
                    $unwind: {
                      path: "$customer",
                      preserveNullAndEmptyArrays: true,
                    },
                  },
                  {
                    $project: {
                      _id: 0,
                      customerName: "$customer.name",
                    },
                  },
                ],
                as: "recruitment",
              },
            },
            {
              $addFields: {
                customerName: {
                  $arrayElemAt: ["$recruitment.customerName", 0],
                },
              },
            },
            ...req.aggregations,
            {
              $project: {
                _id: 1,
                firstName: { $arrayElemAt: ["$profile.firstName", 0] },
                lastName: { $arrayElemAt: ["$profile.lastName", 0] },
                userId: { $arrayElemAt: ["$profile.userId", 0] },
                profileId: { $arrayElemAt: ["$profile._id", 0] },
                applicationNumber: 1,
                appliedDate: "$applicationSignDate",
                stepStatus: 1,
                applicationStatus: 1,
                test: "$tests",
                customerName: {
                  $ifNull: [
                    { $arrayElemAt: ["$recruitment.customerName", 0] },
                    "",
                  ],
                },
                testDate: {
                  $arrayElemAt: [
                    {
                      $map: {
                        input: {
                          $filter: {
                            input: "$tests",
                            as: "t",
                            cond: {
                              $eq: ["$$t.testTypeName", "Driver's Test"],
                            },
                          },
                        },
                        as: "t",
                        in: "$$t.testDate",
                      },
                    },
                    0,
                  ],
                },
                bioDate: {
                  $arrayElemAt: [
                    {
                      $map: {
                        input: {
                          $filter: {
                            input: "$tests",
                            as: "t",
                            cond: {
                              $eq: ["$$t.testTypeName", "Biometric Test"],
                            },
                          },
                        },
                        as: "t",
                        in: "$$t.testDate",
                      },
                    },
                    0,
                  ],
                },
                testStatus: {
                  $arrayElemAt: [
                    {
                      $map: {
                        input: {
                          $filter: {
                            input: "$tests",
                            as: "t",
                            cond: {
                              $eq: ["$$t.testTypeName", "Driver's Test"],
                            },
                          },
                        },
                        as: "t",
                        in: "$$t.status",
                      },
                    },
                    0,
                  ],
                },

                bioStatus: {
                  $arrayElemAt: [
                    {
                      $map: {
                        input: {
                          $filter: {
                            input: "$tests",
                            as: "t",
                            cond: {
                              $eq: ["$$t.testTypeName", "Biometric Test"],
                            },
                          },
                        },
                        as: "t",
                        in: "$$t.status",
                      },
                    },
                    0,
                  ],
                },
              },
            },
          ])
          .toArray(),
        this.collections.applications
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
      this.getAggrigation(req, this.filter_options, defaultFilter);
      const [data] = await Promise.all([
        this.collections.applications
          .aggregate([
            ...req.aggregations,
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
                from: "contacts",
                localField: "emergencyContactIds",
                foreignField: "_id",
                as: "emergencyContacts",
              },
            },
            {
              $lookup: {
                from: "employmentHistories",
                localField: "employmentHistoryIds",
                foreignField: "_id",
                as: "employmentHistory",
              },
            },
            {
              $lookup: {
                from: "assets",
                localField: "assetIds",
                foreignField: "_id",
                as: "assets",
              },
            },
            {
              $lookup: {
                from: "documents",
                localField: "documentIds",
                foreignField: "_id",
                as: "documents",
              },
            },
            {
              $unwind: {
                path: "$assets",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: "documents",
                localField: "assets.documentIds",
                foreignField: "_id",
                as: "assets.documents",
              },
            },
            {
              $group: {
                _id: "$_id",
                root: { $first: "$$ROOT" },
                assets: { $push: "$assets" },
              },
            },
            {
              $replaceRoot: {
                newRoot: {
                  $mergeObjects: ["$root", { assets: "$assets" }],
                },
              },
            },
            {
              $project: {
                _id: 1,
                firstName: { $arrayElemAt: ["$profile.firstName", 0] },
                lastName: { $arrayElemAt: ["$profile.lastName", 0] },
                dateOfBirth: { $arrayElemAt: ["$profile.dateOfBirth", 0] },
                userId: 1,
                profileId: 1,
                applicationNumber: 1,
                appliedDate: "$applicationSignDate",
                dependents: 1,
                employmentInfo: 1,
                education: 1,
                emergencyContactIds: 1,
                emergencyContacts: 1,
                employmentHistoryIds: 1,
                employmentHistory: 1,
                applicationStatus: 1,
                reasonForRejection: 1,
                applicationType: 1,
                driverDetails: 1,
                assetIds: 1,
                assets: 1,
                security: 1,
                documentIds: 1,
                documents: 1,
                popiSign: 1,
                popiSignDate: 1,
                applicationSign: 1,
                applicationSignDate: 1,
                stepStatus: 1,
                declaration: 1,
              },
            },
          ])
          .toArray(),
      ]);
      const application = data[0];
      if (application) {
        return this.json(req, res, 200, { data: application });
      }

      return this.jsonError(res, 400, this.__component, "get");
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  //Application Steps Get Endpoints

  public getStep1 = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const defaultFilter = { _id: new ObjectId(id) };
      this.getAggrigation(req, this.filter_options, defaultFilter);
      const [data] = await Promise.all([
        this.collections.applications
          .aggregate([
            ...req.aggregations,
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
                _id: 1,
                profileId: { $arrayElemAt: ["$profile._id", 0] },
                firstName: { $arrayElemAt: ["$profile.firstName", 0] },
                lastName: { $arrayElemAt: ["$profile.lastName", 0] },
                userName: { $arrayElemAt: ["$profile.userName", 0] },
                phoneNumber: { $arrayElemAt: ["$profile.phoneNumber", 0] },
                email: { $arrayElemAt: ["$profile.email", 0] },
                alternativeNumber: {
                  $arrayElemAt: ["$profile.alternativeNumber", 0],
                },
                dateOfBirth: { $arrayElemAt: ["$profile.dateOfBirth", 0] },
                nationalityId: { $arrayElemAt: ["$profile.nationalityId", 0] },
                documentTypeId: {
                  $arrayElemAt: ["$profile.documentTypeId", 0],
                },
                idNumber: { $arrayElemAt: ["$profile.idNumber", 0] },
                documentExpiryDate: {
                  $arrayElemAt: ["$profile.documentExpiryDate", 0],
                },
                nativeLanguageId: {
                  $arrayElemAt: ["$profile.nativeLanguageId", 0],
                },
                additionalLanguageIds: {
                  $arrayElemAt: ["$profile.additionalLanguageIds", 0],
                },
                physicalAddress: {
                  $arrayElemAt: ["$profile.physicalAddress", 0],
                },
                postalAddress: { $arrayElemAt: ["$profile.postalAddress", 0] },
                bankDetails: { $arrayElemAt: ["$profile.bankDetails", 0] },
                employmentInfo: 1,
                step1Changes: 1,
                "stepStatus.step1": 1,
                "stepReject.step1Reason": 1,
                applicationStatus: 1,
              },
            },
          ])
          .toArray(),
      ]);
      const application = data[0];
      if (application) {
        return this.json(req, res, 200, { data: application });
      }

      return this.jsonError(res, 400, this.__component, "get");
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getStep2 = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const defaultFilter = { _id: new ObjectId(id) };
      this.getAggrigation(req, this.filter_options, defaultFilter);
      const [data] = await Promise.all([
        this.collections.applications
          .aggregate([
            ...req.aggregations,
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
                _id: 0,
                isMarried: 1,
                emergencyContacts: 1,
                userId: 1,
                dependents: 1,
                physicalAddress: {
                  $arrayElemAt: ["$profile.physicalAddress", 0],
                },
                postalAddress: { $arrayElemAt: ["$profile.postalAddress", 0] },
                step2Changes: 1,
                "stepStatus.step2": 1,
                "stepReject.step2Reason": 1,
                applicationStatus: 1,
              },
            },
          ])
          .toArray(),
      ]);
      const application = data[0];
      if (application) {
        return this.json(req, res, 200, { data: application });
      }

      return this.jsonError(res, 400, this.__component, "get");
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getStep3 = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const defaultFilter = { _id: new ObjectId(id) };
      this.getAggrigation(req, this.filter_options, defaultFilter);
      const [data] = await Promise.all([
        this.collections.applications
          .aggregate([
            ...req.aggregations,
            {
              $project: {
                _id: 1,
                education: 1,
                step3Changes: 1,
                "stepStatus.step3": 1,
                "stepReject.step3Reason": 1,
                applicationStatus: 1,
              },
            },
          ])
          .toArray(),
      ]);
      const application = data[0];
      if (application) {
        return this.json(req, res, 200, { data: application });
      }

      return this.jsonError(res, 400, this.__component, "get");
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getStep4 = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const defaultFilter = { _id: new ObjectId(id) };
      this.getAggrigation(req, this.filter_options, defaultFilter);
      const [data] = await Promise.all([
        this.collections.applications
          .aggregate([
            ...req.aggregations,
            {
              $project: {
                _id: 1,
                currentEmployment: 1,
                employmentHistoryIds: 1,
                step4Changes: 1,
                "stepStatus.step4": 1,
                "stepReject.step4Reason": 1,
                applicationStatus: 1,
              },
            },
          ])
          .toArray(),
      ]);
      const application = data[0];
      if (application) {
        return this.json(req, res, 200, { data: application });
      }

      return this.jsonError(res, 400, this.__component, "get");
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getStep5 = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const defaultFilter = { _id: new ObjectId(id) };
      this.getAggrigation(req, this.filter_options, defaultFilter);
      const [data] = await Promise.all([
        this.collections.applications
          .aggregate([
            ...req.aggregations,
            {
              $lookup: {
                from: "userProfiles",
                localField: "profileId", // or whatever your field name is
                foreignField: "_id", // or whatever your field name is
                as: "profile",
              },
            },
            {
              $project: {
                _id: 1,
                regionId: {
                  $arrayElemAt: ["$profile.physicalAddress.regionId", 0],
                },
                applicationType: 1,
                driverDetails: 1,
                step5Changes: 1,
                "stepStatus.step5": 1,
                "stepReject.step5Reason": 1,
                applicationStatus: 1,
              },
            },
          ])
          .toArray(),
      ]);
      const application = data[0];
      if (application) {
        return this.json(req, res, 200, { data: application });
      }

      return this.jsonError(res, 400, this.__component, "get");
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getStep6 = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const defaultFilter = { _id: new ObjectId(id) };
      this.getAggrigation(req, this.filter_options, defaultFilter);
      const [data] = await Promise.all([
        this.collections.applications
          .aggregate([
            ...req.aggregations,
            {
              $lookup: {
                from: "assets",
                let: { appId: this.toObjectId(id) }, // or "$applicationId" depending on your field
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$applicationId", "$$appId"], // only assets for that appId
                      },
                    },
                  },
                  {
                    $lookup: {
                      from: "documents",
                      localField: "documentIds", // or whatever your field name is
                      foreignField: "_id", // or whatever your field name is
                      as: "documents",
                    },
                  },
                ],
                as: "assets",
              },
            },
            {
              $addFields: {
                // pick the first asset
                asset: {
                  $let: {
                    vars: { asset: { $arrayElemAt: ["$assets", 0] } },
                    in: {
                      _id: "$$asset._id",
                      userId: "$$asset.userId",
                      applicationId: "$$asset.applicationId",
                      registrationNumber: "$$asset.registrationNumber",
                      registrationDate: "$$asset.registrationDate",
                      make: "$$asset.make",
                      model: "$$asset.model",
                      engineNumber: "$$asset.engineNumber",
                      chassisNumber: "$$asset.chassisNumber",
                      licenseExpiryDate: "$$asset.licenseExpiryDate",
                      currentMileage: "$$asset.currentMileage",
                      color: "$$asset.color",
                      vehicleTypeId: "$$asset.vehicleTypeId",
                      subDeviceIds: "$$asset.subDeviceIds",
                      accessoryIds: "$$asset.accessoryIds",
                      tracking: "$$asset.tracking",
                      trackingSupplier: "$$asset.trackingSupplier",
                      status: "$$asset.status",
                      documentIds: "$$asset.documentIds",
                    },
                  },
                },

                // flatten all asset documents into a single array
                documents: {
                  $reduce: {
                    input: "$assets.documents",
                    initialValue: [],
                    in: { $concatArrays: ["$$value", "$$this"] },
                  },
                },
              },
            },
            {
              $project: {
                _id: 1,
                userId: 1,
                asset: 1,
                documents: 1,
                step6Changes: 1,
                "stepStatus.step6": 1,
                "stepReject.step6Reason": 1,
                applicationStatus: 1,
              },
            },
          ])
          .toArray(),
      ]);
      const application = data[0];
      if (application) {
        return this.json(req, res, 200, { data: application });
      }

      return this.jsonError(res, 400, this.__component, "get");
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getStep7 = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const defaultFilter = { _id: new ObjectId(id) };
      this.getAggrigation(req, this.filter_options, defaultFilter);
      const [data] = await Promise.all([
        this.collections.applications
          .aggregate([
            ...req.aggregations,
            {
              $project: {
                _id: 1,
                applicationType: 1,
                security: 1,
                step7Changes: 1,
                "stepStatus.step7": 1,
                "stepReject.step7Reason": 1,
                applicationStatus: 1,
              },
            },
          ])
          .toArray(),
      ]);
      const application = data[0];
      if (application) {
        return this.json(req, res, 200, { data: application });
      }

      return this.jsonError(res, 400, this.__component, "get");
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getStep8 = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const defaultFilter = { _id: new ObjectId(id) };
      this.getAggrigation(req, this.filter_options, defaultFilter);
      const [data] = await Promise.all([
        this.collections.applications
          .aggregate([
            ...req.aggregations,
            {
              $project: {
                _id: 1,
                userId: 1,
                step8Changes: 1,
                "stepStatus.step8": 1,
                "stepReject.step8Reason": 1,
                applicationStatus: 1,
              },
            },
          ])
          .toArray(),
      ]);
      const application = data[0];
      if (application) {
        return this.json(req, res, 200, { data: application });
      }

      return this.jsonError(res, 400, this.__component, "get");
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getStep9 = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const defaultFilter = { _id: new ObjectId(id) };
      this.getAggrigation(req, this.filter_options, defaultFilter);
      const [data] = await Promise.all([
        this.collections.applications
          .aggregate([
            ...req.aggregations,
            {
              $project: {
                _id: 1,
                applicationSign: 1,
                applicationSignDate: 1,
                step9Changes: 1,
                "stepStatus.step9": 1,
                "stepReject.step9Reason": 1,
                applicationStatus: 1,
              },
            },
          ])
          .toArray(),
      ]);
      const application = data[0];
      if (application) {
        return this.json(req, res, 200, { data: application });
      }

      return this.jsonError(res, 400, this.__component, "get");
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  // Applicaiton Steps Create And Update Endpoints

  public createOrUpdateStep1 = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const FormBody = req.body;

      const additionalLanguageIds =
        FormBody.additionalLanguageIds &&
          Array.isArray(FormBody.additionalLanguageIds)
          ? FormBody.additionalLanguageIds.map((id: string) =>
            this.toObjectId(id),
          )
          : [];

      if (id && FormBody.profileId) {
        const profileId = this.toObjectId(FormBody.profileId);
        const existingProfile = await this.collections.userProfiles.findOne({
          _id: profileId,
        });
        const existingApp = await this.collections.applications.findOne({
          _id: this.toObjectId(id),
        });
        if (!existingProfile) {
          return this.jsonError(
            res,
            404,
            this.__component,
            "Profile not found",
          );
        }
        if (!existingApp) {
          return this.jsonError(
            res,
            404,
            this.__component,
            "Application not found",
          );
        }
        const allowedApplicationStatuses = [
          "accepted",
          "changed",
          "in contract",
          "rejected",
        ];
        const allowedStepStatusesForChange = ["approved"];
        const appStatus = existingApp.applicationStatus ?? "";
        const stepStatus = existingApp.stepStatus?.step1 ?? "";
        const canMarkAsChanged =
          allowedApplicationStatuses.includes(appStatus) &&
          allowedStepStatusesForChange.includes(stepStatus);
        let updateProfilePayload: Record<string, any> = {};
        let updateApplicationPayload: Record<string, any> = {};
        if (!canMarkAsChanged) {
          updateProfilePayload = {
            firstName: FormBody.firstName,
            lastName: FormBody.lastName,
            userName: FormBody.userName,
            phoneNumber: FormBody.phoneNumber,
            email: FormBody.email,
            dateOfBirth: FormBody.dateOfBirth,
            nationalityId: this.toObjectId(FormBody.nationalityId),
            documentTypeId: this.toObjectId(FormBody.documentTypeId),
            idNumber: FormBody.idNumber,
            documentExpiryDate: FormBody.documentExpiryDate,
            nativeLanguageId: this.toObjectId(FormBody.nativeLanguageId),
            additionalLanguageIds,
            physicalAddress: {
              ...FormBody.physicalAddress,
              regionId: this.toObjectId(FormBody.physicalAddress.regionId),
            },
            postalAddress: {
              ...FormBody.postalAddress,
              regionId: this.toObjectId(FormBody.postalAddress.regionId),
            },
            bankDetails: {
              ...FormBody.bankDetails,
              accountTypeId: this.toObjectId(
                FormBody.bankDetails.accountTypeId,
              ),
              bankNameId: this.toObjectId(FormBody.bankDetails.bankNameId),
            },
            alternativeNumber: FormBody.alternativeNumber,
          };
          updateApplicationPayload = {
            employmentInfo: FormBody.employmentInfo,
            "stepStatus.step1":
              existingApp.stepStatus?.step1 &&
                ["not confirmed", "rejected", "completed"].includes(
                  existingApp.stepStatus?.step1,
                ) &&
                ["not confirmed", "in progress"].includes(
                  existingApp?.applicationStatus || "",
                )
                ? "completed"
                : await this.updateStepStatus(
                  existingApp?.stepStatus?.step1 ?? "",
                ),
          };
        } else {
          console.log("here")
          const fieldsToCompare = [
            "firstName",
            "lastName",
            "userName",
            "phoneNumber",
            "email",
            "dateOfBirth",
            "nationalityId",
            "documentTypeId",
            "idNumber",
            "documentExpiryDate",
            "nativeLanguageId",
            "additionalLanguageIds",
            "physicalAddress",
            "postalAddress",
            "bankDetails",
            "alternativeNumber",
          ];
          const changedFields = this.compareChanges(
            FormBody,
            existingProfile,
            fieldsToCompare,
          );
          console.log("changedFields", changedFields);
          const employmentInfoChanged = this.compareChanges(
            FormBody,
            existingApp,
            ["employmentInfo"],
          );
          if (
            employmentInfoChanged &&
            Object.keys(employmentInfoChanged).length > 0
          ) {
            changedFields["employmentInfo"] =
              employmentInfoChanged["employmentInfo"];
          }
          if (Object.keys(changedFields).length > 0) {
            updateApplicationPayload = {
              step1Changes: changedFields,
              "stepStatus.step1": "changed",
            };
          }
        }
        if (Object.keys(updateProfilePayload).length > 0) {
          await this.collections.userProfiles.updateOne(
            { _id: existingProfile._id },
            { $set: updateProfilePayload },
          );
        }

        if (Object.keys(updateApplicationPayload).length > 0) {
          await this.collections.applications.updateOne(
            { _id: existingApp._id },
            { $set: updateApplicationPayload },
          );
        }
        await this.updateApplicationStatus(existingApp._id);
      } else {
        let userId;
        let profileId;
        const checkIds = await this.collections.userProfiles.findOne({
          idNumber: FormBody.idNumber,
        });
        if (checkIds) {
          return this.jsonError(
            res,
            404,
            this.__component,
            "Document Number already exists",
          );
        }
        if (
          req.user.role &&
          ["Applicant", "Driver", "Other"].includes(req.user.role.name)
        ) {
          const existingApp = await this.collections.applications.findOne({
            userId: this.toObjectId(req.user._id),
            isDeleted: { $ne: false },
          });
          if (existingApp) {
            return this.jsonError(
              res,
              400,
              this.__component,
              "Your application is already exists",
            );
          }
          const updateProfile = {
            firstName: FormBody.firstName,
            lastName: FormBody.lastName,
            userName: FormBody.userName,
            phoneNumber: FormBody.phoneNumber,
            email: FormBody.email,
            dateOfBirth: FormBody.dateOfBirth,
            nationalityId: this.toObjectId(FormBody.nationalityId),
            documentTypeId: this.toObjectId(FormBody.documentTypeId),
            idNumber: FormBody.idNumber,
            documentExpiryDate: FormBody.documentExpiryDate,
            nativeLanguageId: this.toObjectId(FormBody.nativeLanguageId),
            additionalLanguageIds,
            physicalAddress: {
              ...FormBody.physicalAddress,
              regionId: this.toObjectId(FormBody.physicalAddress.regionId),
            },
            postalAddress: {
              ...FormBody.postalAddress,
              regionId: this.toObjectId(FormBody.postalAddress.regionId),
            },
            bankDetails: {
              ...FormBody.bankDetails,
              accountTypeId: this.toObjectId(
                FormBody.bankDetails.accountTypeId,
              ),
              bankNameId: this.toObjectId(FormBody.bankDetails.bankNameId),
            },
            alternativeNumber: FormBody.alternativeNumber,
          };
          const updatedProfile =
            await this.collections.userProfiles.findOneAndUpdate(
              { userId: req.user._id },
              { $set: updateProfile },
              { returnDocument: "after" },
            );
          userId = req.user._id;
          profileId = updatedProfile?._id;
        } else {
          const existingUser = await this.collections.users.findOne({
            phoneNumber: FormBody.phoneNumber,
          });
          if (existingUser) {
            return this.jsonError(
              res,
              400,
              this.__component,
              "Cellphone number already exists",
            );
          }
          const role = await this.collections.roles.findOne({
            name: "Applicant",
          });
          if (role) {
            FormBody.roleId = role._id;
          }
          const newUserId = new ObjectId();
          await this.collections.users.insertOne({
            _id: newUserId,
            email: FormBody.email,
            phoneNumber: FormBody.phoneNumber,
            roleId: FormBody.roleId,
            isActive: true,
          });
          const newProfileId = new ObjectId();
          const profileData = {
            _id: newProfileId,
            userId: newUserId,
            firstName: FormBody.firstName,
            lastName: FormBody.lastName,
            userName: FormBody.userName,
            phoneNumber: FormBody.phoneNumber,
            alternativeNumber: FormBody.alternativeNumber,
            email: FormBody.email,
            dateOfBirth: FormBody.dateOfBirth,
            nationalityId: this.toObjectId(FormBody.nationalityId),
            documentTypeId: this.toObjectId(FormBody.documentTypeId),
            idNumber: FormBody.idNumber,
            documentExpiryDate: FormBody.documentExpiryDate,
            nativeLanguageId: this.toObjectId(FormBody.nativeLanguageId),
            additionalLanguageIds,
            physicalAddress: {
              ...FormBody.physicalAddress,
              regionId: this.toObjectId(FormBody.physicalAddress.regionId),
            },
            postalAddress: {
              ...FormBody.postalAddress,
              regionId: this.toObjectId(FormBody.postalAddress.regionId),
            },
            bankDetails: {
              ...FormBody.bankDetails,
              accountTypeId: this.toObjectId(
                FormBody.bankDetails.accountTypeId,
              ),
              bankNameId: this.toObjectId(FormBody.bankDetails.bankNameId),
            },
          };
          await this.collections.userProfiles.insertOne(profileData);
          userId = newUserId;
          profileId = newProfileId;

          if (FormBody.email && FormBody.phoneNumber) {
            const currentDate = new Date();
            const validTill = new Date(
              currentDate.setHours(currentDate.getHours() + 24),
            );
            const util = new Utility();
            const code = util.randomString(5, true);
            const url = `userId=${userId}&code=${code}&email=${FormBody.email}`;
            const cipher = util.encryptData(url);
            const baseUrl =
              config.baseUrl != ""
                ? `${config?.baseUrl}`
                : "http://localhost:4200/";
            const createPasswordLink = `${baseUrl}set-password?&code=${cipher}`;
            if (FormBody.phoneNumber) {
              if (global["config"].sendSMS) {
                const sms = new sendSMS();
                await sms.sendSmsUsingApi(
                  FormBody.phoneNumber,
                  `Set your password by clicking the link: ${createPasswordLink}`,
                );
              }
            }
            if (FormBody.email) {
              const emailType = await this.collections.emailTypes.findOne({
                used_for: "set_password_link_email",
              });
              const template = await this.collections.emailTemplates.findOne({
                emailTypeId: emailType?._id,
                isActive: true,
              });
              const email = new EmailHelper();
              if (global["config"].sendEmails) {
                const data = {
                  user_name: FormBody.firstName + " " + FormBody.lastName,
                  link: createPasswordLink,
                };
                const message_subject =
                  "Online Application - link to create your password";
                const html = this.replaceTemplateData(
                  template?.content || "",
                  data,
                );
                console.log(html);

                const mailOptions = {
                  to: FormBody.email,
                  from: "ds@cmcglobal.co.za",
                  subject: message_subject,
                  text: html,
                };

                const forgetPassword = {
                  code: Number(code),
                  validTill: validTill,
                  link: createPasswordLink,
                };
                await this.collections.users.updateOne(
                  { _id: this.toObjectId(userId) },
                  { $set: { forgetPassword: forgetPassword } },
                );
                console.log("here");
                await email
                  .sendEmailUsingSendGrid(mailOptions)
                  .catch(console.error);
              }
            }
          }
        }
        const applicationNumber = this.generateNumber();
        const applicationId = new ObjectId();
        const newApplication: any = {
          _id: applicationId,
          applicationNumber,
          userId,
          profileId,
          employmentInfo: FormBody.employmentInfo,
          stepStatus: {
            step1: "completed",
            step2: "in progress",
            step3: "in progress",
            step4: "in progress",
            step5: "in progress",
            step6: "in progress",
            step7: "in progress",
            step8: "in progress",
            step9: "in progress",
          },
          applicationStatus: "in progress",
        };
        await this.collections.applications.insertOne(newApplication);
        await this.updateApplicationStatus(applicationId);
        return this.json(req, res, 200, {
          data: {
            message: "Step 1 Saved, Application created successfully",
            applicationId,
          },
        });
      }
      return this.json(req, res, 200, {
        message: `Application Step 1 Saved Successfully`,
      });
    } catch (error) {
      return this.jsonError(res, 400, this.__component, "wrong", error);
    }
  };

  public updateStep2 = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const FormBody = req.body;
      const existingApp = await this.collections.applications.findOne({
        _id: this.toObjectId(id),
      });
      if (!existingApp) {
        return this.jsonError(
          res,
          400,
          this.__component,
          "Application does not exist",
        );
      }
      const allowedApplicationStatuses = [
        "accepted",
        "changed",
        "in contract",
        "rejected",
      ];
      const allowedStepStatusesForChange = ["approved"];
      const appStatus = existingApp.applicationStatus ?? "";
      const stepStatus = existingApp.stepStatus?.step2 ?? "";
      const canMarkAsChanged =
        allowedApplicationStatuses.includes(appStatus) &&
        allowedStepStatusesForChange.includes(stepStatus);
      let updatePayload: Record<string, any> = {};
      if (!canMarkAsChanged) {
        const contacts = Array.isArray(FormBody.contacts)
          ? FormBody.contacts.map((c: any) => ({
            _id: new ObjectId(),
            userId: FormBody.userId
              ? this.toObjectId(FormBody.userId)
              : undefined,
            firstName: c.firstName,
            lastName: c.lastName,
            relationId: this.toObjectId(c.relationId),
            homePhone: c.homePhone,
            mobilePhone: c.mobilePhone,
            type: c.type,
            address: c.address,
          }))
          : [];

        const dependents = Array.isArray(FormBody.dependents)
          ? FormBody.dependents.map((d: any) => ({
            _id: new ObjectId(),
            firstName: d.firstName,
            lastName: d.lastName,
            age: d.age,
          }))
          : [];
        updatePayload = {
          isMarried: FormBody.isMarried,
          emergencyContacts: contacts,
          dependents: dependents,
          "stepStatus.step2": await this.updateStepStatus(
            existingApp?.stepStatus?.step2 ?? "",
          ),
        };
      } else {
        const changedFields: any = this.compareChanges(FormBody, existingApp, [
          "isMarried",
        ]);

        const existingContacts = existingApp.emergencyContacts || [];
        if (Array.isArray(FormBody.contacts)) {
          const contactsChanged: any[] = [];
          FormBody.contacts.forEach((newC: any) => {
            const oldC = existingContacts.find(
              (c: any) => String((c as any)._id) === String(newC._id),
            );
            if (!oldC) {
              contactsChanged.push({ ...newC, create: true });
              return;
            }
            const diff = this.compareChanges(newC, oldC, [
              "userId",
              "firstName",
              "lastName",
              "relationId",
              "homePhone",
              "mobilePhone",
              "address",
            ]);
            if (oldC?.type) {
              diff.type = oldC?.type; // retain type field
            }
            if (Object.keys(diff).length > 0) {
              contactsChanged.push({ _id: (oldC as any)._id, ...diff });
            }
          });
          if (
            contactsChanged.length > 0 &&
            contactsChanged.some((contact) =>
              Object.keys(contact).some(
                (key) => !["_id", "type"].includes(key),
              ),
            )
          ) {
            changedFields.emergencyContacts = contactsChanged;
          }
        }
        const existingDependents = existingApp.dependents || [];
        if (Array.isArray(FormBody.dependents)) {
          const dependentsChanged: any[] = [];
          FormBody.dependents.forEach((newD: any, idx: number) => {
            const oldD = existingDependents[idx];
            if (!oldD) return;
            const diff = this.compareChanges(newD, oldD, [
              "firstName",
              "lastName",
              "age",
            ]);
            if (Object.keys(diff).length > 0) {
              dependentsChanged.push({ _id: oldD._id, ...diff });
            }
          });
          if (dependentsChanged.length > 0) {
            changedFields.dependents = dependentsChanged;
          }
        }
        if (Object.keys(changedFields).length > 0) {
          updatePayload = {
            step2Changes: changedFields,
            "stepStatus.step2": "changed",
          };
        }
      }
      if (Object.keys(updatePayload).length > 0) {
        await this.collections.applications.updateOne(
          { _id: existingApp._id },
          { $set: updatePayload },
        );
      }
      await this.updateApplicationStatus(existingApp._id);
      return this.json(req, res, 200, {
        message: `Application Step 2 Saved Successfully`,
      });
    } catch (error) {
      return this.jsonError(res, 400, this.__component, "wrong", error);
    }
  };

  public updateStep3 = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const FormBody = req.body;
      const existingApp = await this.collections.applications.findOne({
        _id: this.toObjectId(id),
      });
      if (!existingApp) {
        return this.jsonError(
          res,
          400,
          this.__component,
          "Application does not exist",
        );
      }
      const allowedApplicationStatuses = [
        "accepted",
        "changed",
        "in contract",
        "rejected",
      ];
      const allowedStepStatusesForChange = ["approved"];
      const appStatus = existingApp.applicationStatus ?? "";
      const stepStatus = existingApp.stepStatus?.step3 ?? "";
      const canMarkAsChanged =
        allowedApplicationStatuses.includes(appStatus) &&
        allowedStepStatusesForChange.includes(stepStatus);
      let updatePayload: Record<string, any> = {};
      if (!canMarkAsChanged) {
        updatePayload = {
          education: { ...FormBody },
          "stepStatus.step3": await this.updateStepStatus(
            existingApp?.stepStatus?.step3 ?? "",
          ),
        };
      } else {
        const changedFields = this.compareChanges(
          FormBody,
          existingApp.education,
          [
            "educationDetails",
            "tertiaryEducation",
            "futureEducationPlans",
            "tertiaryQualification",
            "studyPlanDetail",
          ],
        );
        if (Object.keys(changedFields).length > 0) {
          updatePayload = {
            step3Changes: changedFields,
            "stepStatus.step3": "changed",
          };
        }
      }
      if (Object.keys(updatePayload).length > 0) {
        await this.collections.applications.updateOne(
          { _id: existingApp._id },
          { $set: updatePayload },
        );
      }
      await this.updateApplicationStatus(existingApp._id);
      return this.json(req, res, 200, {
        message: `Application Step 3 Saved Successfully`,
      });
    } catch (error) {
      return this.jsonError(res, 400, this.__component, "wrong", error);
    }
  };

  public updateStep4 = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const FormBody = req.body;
      const existingApp = await this.collections.applications.findOne({
        _id: this.toObjectId(id),
      });
      if (!existingApp) {
        return this.jsonError(
          res,
          400,
          this.__component,
          "Application does not exist",
        );
      }
      const allowedApplicationStatuses = [
        "accepted",
        "changed",
        "in contract",
        "rejected",
      ];
      const allowedStepStatusesForChange = ["approved"];
      const appStatus = existingApp.applicationStatus ?? "";
      const stepStatus = existingApp.stepStatus?.step4 ?? "";
      const canMarkAsChanged =
        allowedApplicationStatuses.includes(appStatus) &&
        allowedStepStatusesForChange.includes(stepStatus);
      let updatePayload: Record<string, any> = {};
      const benefitIds =
        FormBody.benefitIds && Array.isArray(FormBody.benefitIds)
          ? FormBody.benefitIds.map((id: string) => this.toObjectId(id))
          : [];
      const employmentHistoryIds =
        FormBody.employmentHistoryIds &&
          Array.isArray(FormBody.employmentHistoryIds)
          ? FormBody.employmentHistoryIds.map((id: string) =>
            this.toObjectId(id),
          )
          : [];
      if (!canMarkAsChanged) {
        const currentEmployment = {
          jobDescription: FormBody.jobDescription,
          benefitIds,
          dismissedFromJob: FormBody.dismissedFromJob,
          employersDismissalEndorsement: FormBody.employersDismissalEndorsement,
          reasonForDismissal: FormBody.reasonForDismissal,
          otherBenefit: FormBody.otherBenefit,
        };

        updatePayload = {
          currentEmployment,
          employmentHistoryIds,
          "stepStatus.step4": await this.updateStepStatus(
            existingApp?.stepStatus?.step4 ?? "",
          ),
        };
      } else {
        const changedFields = this.compareChanges(
          FormBody,
          existingApp.currentEmployment,
          [
            "jobDescription",
            "benefitIds",
            "dismissedFromJob",
            "employersDismissalEndorsement",
            "reasonForDismissal",
            "otherBenefit",
          ],
        );

        if (Object.keys(changedFields).length > 0) {
          updatePayload = {
            step4Changes: changedFields,
            "stepStatus.step4": "changed",
          };
        }
      }
      if (Object.keys(updatePayload).length > 0) {
        await this.collections.applications.updateOne(
          { _id: existingApp._id },
          { $set: updatePayload },
        );
      }
      await this.updateApplicationStatus(existingApp._id);
      return this.json(req, res, 200, {
        message: `Application Step 4 Saved Successfully`,
      });
    } catch (error) {
      return this.jsonError(res, 400, this.__component, "wrong", error);
    }
  };

  public updateStep5 = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const FormBody = req.body;
      const existingApp = await this.collections.applications.findOne({
        _id: this.toObjectId(id),
      });
      if (!existingApp) {
        return this.jsonError(
          res,
          400,
          this.__component,
          "Application does not exist",
        );
      }
      const licenseNumberExists = await this.collections.applications.findOne({
        "driverDetails.licenseNumber": FormBody.licenseNumber,
        _id: { $ne: existingApp._id },
      });
      if (licenseNumberExists) {
        return this.jsonError(
          res,
          400,
          this.__component,
          "License number already exists",
        );
      }
      const allowedApplicationStatuses = [
        "accepted",
        "changed",
        "in contract",
        "rejected",
      ];
      const allowedStepStatusesForChange = ["approved"];
      const appStatus = existingApp.applicationStatus ?? "";
      const stepStatus = existingApp.stepStatus?.step5 ?? "";
      const canMarkAsChanged =
        allowedApplicationStatuses.includes(appStatus) &&
        allowedStepStatusesForChange.includes(stepStatus);
      let updatePayload: Record<string, any> = {};
      const areaIds =
        FormBody.areaIds && Array.isArray(FormBody.areaIds)
          ? FormBody.areaIds.map((id: string) => this.toObjectId(id))
          : [];

      const licenseCodeIds =
        FormBody.licenseCodeIds && Array.isArray(FormBody.licenseCodeIds)
          ? FormBody.licenseCodeIds.map((id: string) => this.toObjectId(id))
          : [];

      const skillIds =
        FormBody.skillIds && Array.isArray(FormBody.skillIds)
          ? FormBody.skillIds.map((id: string) => this.toObjectId(id))
          : [];
      if (!canMarkAsChanged) {
        let driverDetails: Record<string, any> = {
          medicationCondition: FormBody.medicationCondition,
          medication: FormBody.medication,
          areaIds,
        };

        if (FormBody.applicationType === "driver") {
          driverDetails = {
            ...driverDetails,
            hasLicense: FormBody.hasLicense,
            endorsements: FormBody.endorsements,
            vehicleOwned: FormBody.vehicleOwned,
            licenseNumber: FormBody.licenseNumber,
            licenseCodeIds,
            issuedDate: FormBody.issuedDate,
            licenseExpiry: FormBody.licenseExpiry,
            prdpExpiry: FormBody.prdpExpiry,
            drivingExperience: FormBody.drivingExperience,
            anyAccidents: FormBody.anyAccidents,
            licenseSuspended: FormBody.licenseSuspended,
          };
        } else {
          driverDetails = {
            ...driverDetails,
            jobPosition: FormBody.jobPosition,
            skillIds,
          };
        }

        updatePayload = {
          applicationType: FormBody.applicationType,
          driverDetails,
          "stepStatus.step5": await this.updateStepStatus(
            existingApp?.stepStatus?.step5 ?? "",
          ),
        };

        if (FormBody.applicationType === "other") {
          updatePayload["stepStatus.step6"] = "skipped";
        } else if (
          FormBody.applicationType === "driver" &&
          existingApp?.stepStatus?.step6 === "skipped"
        ) {
          updatePayload["stepStatus.step6"] = "in progress";
        }
      } else {
        let compare: any[] = [];
        if (FormBody.applicationType === "driver") {
          compare = [
            "hasLicense",
            "endorsements",
            "vehicleOwned",
            "licenseNumber",
            "licenseCodeIds",
            "issuedDate",
            "licenseExpiry",
            "prdpExpiry",
            "drivingExperience",
            "anyAccidents",
            "licenseSuspended",
            "medicationCondition",
            "medication",
            "areaIds",
          ];
        } else {
          compare = ["jobPosition", "skillIds"];
        }
        const changedFields = this.compareChanges(
          FormBody,
          existingApp.driverDetails,
          compare,
        );

        if (Object.keys(changedFields).length > 0) {
          updatePayload = {
            step5Changes: changedFields,
            "stepStatus.step5": "changed",
          };
        }
      }
      if (Object.keys(updatePayload).length > 0) {
        await this.collections.applications.updateOne(
          { _id: existingApp._id },
          { $set: updatePayload },
        );
      }
      await this.updateApplicationStatus(existingApp._id);
      return this.json(req, res, 200, {
        message: `Application Step 5 Saved Successfully`,
      });
    } catch (error) {
      return this.jsonError(res, 400, this.__component, "wrong", error);
    }
  };

  // public updateStep6 = async (
  //   req: Request,
  //   res: Response
  // ): Promise<Response> => {
  //   try {
  //     const { id } = req.params;
  //     const FormBody = req.body;
  //     const existingApp = await this.collections.applications.findOne({
  //       _id: this.toObjectId(id),
  //     });
  //     if (!existingApp) {
  //       return this.jsonError(
  //         res,
  //         400,
  //         this.__component,
  //         "Application does not exist"
  //       );
  //     }
  //     const allowedApplicationStatuses = ["accepted", "changed"];
  //     const allowedStepStatusesForChange = ["approved"];
  //     const appStatus = existingApp.applicationStatus ?? "";
  //     const stepStatus = existingApp.stepStatus?.step6 ?? "";
  //     const canMarkAsChanged =
  //       allowedApplicationStatuses.includes(appStatus) &&
  //       allowedStepStatusesForChange.includes(stepStatus);

  //     if (FormBody.vehicleTypeId) {
  //       FormBody.vehicleTypeId = this.toObjectId(FormBody.vehicleTypeId);
  //     }
  //     if (FormBody.subDeviceId) {
  //       FormBody.subDeviceId = this.toObjectId(FormBody.subDeviceId);
  //     }
  //     if (FormBody.accessoryId) {
  //       FormBody.accessoryId = this.toObjectId(FormBody.accessoryId);
  //     }

  //     if (!FormBody.userId) {
  //       return this.jsonError(res, 400, this.__component, "userId is required");
  //     }

  //     const userIdObj = this.toObjectId(FormBody.userId);
  //     const asset = userIdObj
  //       ? await this.collections.assets.findOne({
  //           applicationId: existingApp._id,
  //           userId: userIdObj,
  //         })
  //       : null;

  //     const filesArray = (req.files ?? {}) as Record<string, any>;
  //     const newFileUploadsExist =
  //       filesArray["image"] && Object.keys(filesArray["image"]).length > 0;
  //     let applicationUpdatePayload: Record<string, any> = {};
  //     let assetUpdatePayload: Record<string, any> | null = null;

  //     if (!canMarkAsChanged) {
  //       if (!asset) {
  //         const uploadedDocumentIds = newFileUploadsExist
  //           ? await this.uploadAndInsertDocuments(
  //               filesArray["image"],
  //               existingApp._id,
  //               userIdObj
  //             )
  //           : [];

  //         const newAsset = {
  //           _id: new ObjectId(),
  //           userId: userIdObj,
  //           applicationId: existingApp._id,
  //           registrationNumber: FormBody.registrationNumber,
  //           make: FormBody.make,
  //           model: FormBody.model,
  //           engineNumber: FormBody.engineNumber,
  //           chassisNumber: FormBody.chassisNumber,
  //           registrationDate: FormBody.registrationDate,
  //           licenseExpiryDate: FormBody.licenseExpiryDate,
  //           currentMileage: FormBody.currentMileage,
  //           color: FormBody.color,
  //           vehicleTypeId: FormBody.vehicleTypeId,
  //           subDeviceId: FormBody.subDeviceId,
  //           accessoryId: FormBody.accessoryId,
  //           tracking: FormBody.tracking,
  //           trackingSupplier: FormBody.trackingSupplier ?? "",
  //           documentIds: uploadedDocumentIds,
  //           status: "awaiting inspection" as const,
  //         };

  //         const createdAsset = await this.collections.assets.insertOne(
  //           newAsset
  //         );
  //         const assetId = createdAsset.insertedId;

  //         applicationUpdatePayload = {
  //           assetIds: [assetId],
  //           "stepStatus.step6": "completed",
  //         };
  //       }
  //       // If asset exists -> update it and mark application completed
  //       else {
  //         // append uploaded docs to existing documentIds if any
  //         const uploadedDocumentIds = newFileUploadsExist
  //           ? await this.uploadAndInsertDocuments(
  //               filesArray["image"],
  //               existingApp._id,
  //               userIdObj
  //             )
  //           : [];

  //         const mergedDocumentIds =
  //           uploadedDocumentIds.length > 0
  //             ? [...(asset.documentIds ?? []), ...uploadedDocumentIds]
  //             : asset.documentIds ?? [];

  //         assetUpdatePayload = {
  //           registrationNumber: FormBody.registrationNumber,
  //           make: FormBody.make,
  //           model: FormBody.model,
  //           engineNumber: FormBody.engineNumber,
  //           chassisNumber: FormBody.chassisNumber,
  //           registrationDate: FormBody.registrationDate,
  //           licenseExpiryDate: FormBody.licenseExpiryDate,
  //           currentMileage: FormBody.currentMileage,
  //           color: FormBody.color,
  //           vehicleTypeId: FormBody.vehicleTypeId,
  //           subDeviceId: FormBody.subDeviceId,
  //           accessoryId: FormBody.accessoryId,
  //           documentIds: mergedDocumentIds,
  //           tracking: FormBody.tracking,
  //           trackingSupplier: FormBody.trackingSupplier,
  //         };

  //         applicationUpdatePayload = {
  //           assetIds: Array.isArray(existingApp.assetIds)
  //             ? Array.from(new Set([...existingApp.assetIds, asset._id]))
  //             : [asset._id],
  //           "stepStatus.step6": "completed",
  //         };
  //       }
  //     } else {
  //       // Compare scalar fields
  //       const scalarChanged = this.compareChanges(FormBody, asset, [
  //         "registrationNumber",
  //         "make",
  //         "model",
  //         "engineNumber",
  //         "chassisNumber",
  //         "registrationDate",
  //         "licenseExpiryDate",
  //         "currentMileage",
  //         "color",
  //         "vehicleTypeId", // note: spelling corrected to vehicleTypeId
  //         "subDeviceId",
  //         "accessoryId",
  //         "tracking",
  //         "trackingSupplier",
  //       ]);

  //       // If the user uploaded new images, append them to documents
  //       let appendedDocumentIds: ObjectId[] = [];
  //       if (newFileUploadsExist) {
  //         appendedDocumentIds = await this.uploadAndInsertDocuments(
  //           filesArray["image"],
  //           existingApp._id,
  //           userIdObj
  //         );
  //       }

  //       // Build update payload for asset if needed
  //       const newDocumentIds =
  //         appendedDocumentIds.length > 0
  //           ? [...(asset?.documentIds ?? []), ...appendedDocumentIds]
  //           : undefined;

  //       if (
  //         Object.keys(scalarChanged).length > 0 ||
  //         appendedDocumentIds.length > 0
  //       ) {
  //         const merged: any = {
  //           ...(Object.keys(scalarChanged).length > 0
  //             ? {
  //                 registrationNumber: FormBody.registrationNumber,
  //                 make: FormBody.make,
  //                 model: FormBody.model,
  //                 engineNumber: FormBody.engineNumber,
  //                 chassisNumber: FormBody.chassisNumber,
  //                 registrationDate: FormBody.registrationDate,
  //                 licenseExpiryDate: FormBody.licenseExpiryDate,
  //                 currentMileage: FormBody.currentMileage,
  //                 color: FormBody.color,
  //                 vehicleTypeId: FormBody.vehicleTypeId,
  //                 subDeviceId: FormBody.subDeviceId,
  //                 accessoryId: FormBody.accessoryId,
  //                 tracking: FormBody.tracking,
  //                 trackingSupplier: FormBody.trackingSupplier,
  //               }
  //             : {}),
  //           ...(newDocumentIds ? { documentIds: newDocumentIds } : {}),
  //         };

  //         assetUpdatePayload = merged;

  //         applicationUpdatePayload = {
  //           step6Changes: {
  //             ...scalarChanged,
  //             ...(appendedDocumentIds.length > 0
  //               ? { newDocuments: appendedDocumentIds }
  //               : {}),
  //           },
  //           "stepStatus.step6": "changed",
  //         };
  //       }
  //     }

  //     if (assetUpdatePayload && asset) {
  //       await this.collections.assets.updateOne(
  //         { _id: asset._id },
  //         { $set: assetUpdatePayload }
  //       );
  //     }

  //     if (Object.keys(applicationUpdatePayload).length > 0) {
  //       await this.collections.applications.updateOne(
  //         { _id: existingApp._id },
  //         { $set: applicationUpdatePayload }
  //       );
  //     }
  //     await this.updateApplicationStatus(existingApp._id);
  //     return this.json(req, res, 200, {
  //       message: `Application Step 6 Saved Successfully`,
  //     });
  //   } catch (error) {
  //     return this.jsonError(res, 400, this.__component, "wrong", error);
  //   }
  // };

  public updateStep6 = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const FormBody = req.body;

      if (id) {
        const existingApp = await this.collections.applications.findOne({
          _id: this.toObjectId(id),
        });
        if (!existingApp) {
          return this.jsonError(
            res,
            400,
            this.__component,
            "Application does not exist",
          );
        }
        const asset = await this.collections.assets.findOne({
          applicationId: existingApp._id,
          userId: this.toObjectId(FormBody.userId),
        });
        if (FormBody.vehicleTypeId) {
          FormBody.vehicleTypeId = this.toObjectId(FormBody.vehicleTypeId);
        }
        const subDeviceIds =
          FormBody.subDeviceIds && Array.isArray(FormBody.subDeviceIds)
            ? FormBody.subDeviceIds.map((id: string) => new ObjectId(id))
            : [];
        const accessoryIds =
          FormBody.accessoryIds && Array.isArray(FormBody.accessoryIds)
            ? FormBody.accessoryIds.map((id: string) => new ObjectId(id))
            : [];

        if (
          existingApp.applicationStatus !== "accepted" &&
          existingApp.stepStatus?.step6 !== "approved"
        ) {
          if (!asset && asset == null) {
            const uploadedImages: any[] = [];
            if (
              req.files != null &&
              req.files != undefined &&
              Object.keys(req.files).length > 0
            ) {
              const filesArray = req.files;

              if (filesArray["image"]) {
                const documentType = global["config"].production
                  ? "Documents"
                  : ["png", "jpg", "jpeg", "pdf"];
                const existingDocOrPath = global["config"].production
                  ? ""
                  : "assets/";
                const imagePaths = await uploadDocument(
                  filesArray["image"],
                  documentType,
                  existingDocOrPath,
                );

                await ne.each(imagePaths, async (el, i) => {
                  const newDocument: Document = {
                    _id: new ObjectId(),
                    applicationId: existingApp._id,
                    userId: this.toObjectId(FormBody.userId),
                    type: "Asset",
                    name: el.name ?? "",
                    url: el.url ?? "",
                    status: "uploaded",
                  };
                  const createdDocument =
                    await this.collections.documents.insertOne(newDocument);
                  uploadedImages.push(createdDocument.insertedId);
                });
              }
            }
            const assetIds: ObjectId[] = [];
            const newAsset = {
              _id: new ObjectId(),
              userId: this.toObjectId(FormBody.userId),
              applicationId: existingApp._id,
              registrationNumber: FormBody.registrationNumber,
              make: FormBody.make,
              model: FormBody.model,
              engineNumber: FormBody.engineNumber,
              chassisNumber: FormBody.chassisNumber,
              registrationDate: FormBody.registrationDate,
              licenseExpiryDate: FormBody.licenseExpiryDate,
              currentMileage: FormBody.currentMileage,
              color: FormBody.color,
              vehicleTypeId: FormBody.vehicleTypeId,
              accessoryIds,
              subDeviceIds,
              tracking: FormBody.tracking,
              trackingSupplier: FormBody.trackingSupplier,
              documentIds: uploadedImages,
              status: "awaiting inspection" as const,
            };
            const createdAsset =
              await this.collections.assets.insertOne(newAsset);
            assetIds.push(createdAsset.insertedId);
            const step6Data = {
              assetIds: assetIds ?? [],
              "stepStatus.step6": await this.updateStepStatus(
                existingApp?.stepStatus?.step6 ?? "",
              ),
            };
            await this.collections.applications.updateOne(
              { _id: new ObjectId(id) },
              {
                $set: {
                  ...step6Data,
                },
              },
            );
          } else {
            const uploadedImages: any[] = [];
            if (
              req.files != null &&
              req.files != undefined &&
              Object.keys(req.files).length > 0
            ) {
              const assetDocument = await this.collections.documents
                .find({
                  applicationId: existingApp?._id,
                  userId: existingApp?.userId,
                  type: "Asset",
                })
                .toArray();

              if (assetDocument && assetDocument.length > 0) {
                assetDocument.forEach(async (el) => {
                  await this.collections.documents.deleteOne({ _id: el._id });
                  this.deleteFile(el.url);
                });
              }
              const filesArray = req.files;

              if (filesArray["image"]) {
                const documentType = global["config"].production
                  ? "Documents"
                  : ["png", "jpg", "jpeg", "pdf"];
                const existingDocOrPath = global["config"].production
                  ? ""
                  : "assets/";
                const imagePaths = await uploadDocument(
                  filesArray["image"],
                  documentType,
                  existingDocOrPath,
                );

                await ne.each(imagePaths, async (el, i) => {
                  const newDocument: Document = {
                    _id: new ObjectId(),
                    applicationId: existingApp._id,
                    userId: this.toObjectId(FormBody.userId),
                    type: "Asset",
                    name: el.name ?? "",
                    url: el.url ?? "",
                    status: "uploaded",
                  };
                  const createdDocument =
                    await this.collections.documents.insertOne(newDocument);
                  uploadedImages.push(createdDocument.insertedId);
                });
              }
            }
            const updateAsset = {
              registrationNumber: FormBody.registrationNumber,
              make: FormBody.make,
              model: FormBody.model,
              engineNumber: FormBody.engineNumber,
              chassisNumber: FormBody.chassisNumber,
              registrationDate: FormBody.registrationDate,
              licenseExpiryDate: FormBody.licenseExpiryDate,
              currentMileage: FormBody.currentMileage,
              color: FormBody.color,
              vehicleTypeId: FormBody.vehicleTypeId,
              accessoryIds,
              subDeviceIds,
              documentIds: uploadedImages,
              tracking: FormBody.tracking,
              trackingSupplier: FormBody.trackingSupplier,
            };
            await this.collections.assets.updateOne(
              { _id: asset._id },
              {
                $set: {
                  ...updateAsset,
                },
              },
            );
            await this.collections.applications.updateOne(
              { _id: existingApp._id },
              {
                $set: {
                  "stepStatus.step6": await this.updateStepStatus(
                    existingApp?.stepStatus?.step6 ?? "",
                  ),
                },
              },
            );
          }
        } else {
          const changedField: any = this.compareChanges(FormBody, asset, [
            "registrationNumber",
            "make",
            "model",
            "engineNumber",
            "chassisNumber",
            "registrationDate",
            "licenseExpiryDate",
            "currentMileage",
            "color",
            "vehicleTypeId",
            "subDeviceIds",
            "accessoryIds",
            "tracking",
            "trackingSupplier",
          ]);

          // Update only if something changed
          if (Object.keys(changedField).length > 0) {
            await this.collections.applications.updateOne(
              { _id: existingApp._id },
              {
                $set: {
                  step6Changes: changedField,
                  "stepStatus.step6": "changed",
                },
              },
            );
          }
        }
      }

      return this.json(req, res, 200, {
        message: `Application Step 6 Saved Successfully`,
      });
    } catch (error) {
      return this.jsonError(res, 400, this.__component, "wrong", error);
    }
  };

  public updateStep7 = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const FormBody = req.body;
      const existingApp = await this.collections.applications.findOne({
        _id: this.toObjectId(id),
      });
      if (!existingApp) {
        return this.jsonError(
          res,
          400,
          this.__component,
          "Application does not exist",
        );
      }
      const allowedApplicationStatuses = [
        "accepted",
        "changed",
        "in contract",
        "rejected",
      ];
      const allowedStepStatusesForChange = ["approved"];
      const appStatus = existingApp.applicationStatus ?? "";
      const stepStatus = existingApp.stepStatus?.step7 ?? "";
      const canMarkAsChanged =
        allowedApplicationStatuses.includes(appStatus) &&
        allowedStepStatusesForChange.includes(stepStatus);
      let updatePayload: Record<string, any> = {};
      if (!canMarkAsChanged) {
        updatePayload = {
          security: { ...FormBody },
          "stepStatus.step7": await this.updateStepStatus(
            existingApp?.stepStatus?.step7 ?? "",
          ),
        };
      } else {
        const changedFields: any = this.compareChanges(
          FormBody,
          existingApp.security,
          [
            "isArrested",
            "arrestDetails",
            "courtCase",
            "caseDetails",
            "criminalRecordDetails",
          ],
        );

        if (Object.keys(changedFields).length > 0) {
          updatePayload = {
            step7Changes: changedFields,
            "stepStatus.step7": "changed",
          };
        }
      }
      if (Object.keys(updatePayload).length > 0) {
        await this.collections.applications.updateOne(
          { _id: existingApp._id },
          { $set: updatePayload },
        );
      }
      await this.updateApplicationStatus(existingApp._id);
      return this.json(req, res, 200, {
        message: `Application Step 7 Saved Successfully`,
      });
    } catch (error) {
      return this.jsonError(res, 400, this.__component, "wrong", error);
    }
  };

  public updateStep8 = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const FormBody = req.body;

      const existingApp = await this.collections.applications.findOne({
        _id: this.toObjectId(id),
      });
      if (!existingApp) {
        return this.jsonError(
          res,
          400,
          this.__component,
          "Application does not exist",
        );
      }
      let documentIds: ObjectId[] = [];
      if (FormBody.documentIds && Array.isArray(FormBody.documentIds)) {
        documentIds = FormBody.documentIds.map((docId: string) =>
          this.toObjectId(docId),
        );
      }
      if (documentIds.length > 0) {
        const updatePayload = {
          documentIds,
          "stepStatus.step8": await this.updateStepStatus(
            existingApp?.stepStatus?.step8 ?? "",
          ),
        };

        await this.collections.applications.updateOne(
          { _id: existingApp._id },
          { $set: updatePayload },
        );
      }
      await this.updateApplicationStatus(existingApp._id);
      return this.json(req, res, 200, {
        message: `Application Step 8 Saved Successfully`,
      });
    } catch (error) {
      return this.jsonError(res, 400, this.__component, "wrong", error);
    }
  };

  public updateStep9 = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const FormBody = req.body;

      const existingApp = await this.collections.applications.findOne({
        _id: this.toObjectId(id),
      });
      if (!existingApp) {
        return this.jsonError(
          res,
          400,
          this.__component,
          "Application does not exist",
        );
      }
      const updatePayload = {
        ...FormBody,
        "stepStatus.step9": await this.updateStepStatus(
          existingApp?.stepStatus?.step9 ?? "",
        ),
      };
      await this.collections.applications.updateOne(
        { _id: existingApp._id },
        { $set: updatePayload },
      );
      await this.updateApplicationStatus(existingApp._id);
      return this.json(req, res, 200, {
        message: `Application Step 9 Saved Successfully`,
      });
    } catch (error) {
      return this.jsonError(res, 400, this.__component, "wrong", error);
    }
  };

  // Application Steps Aprrove Endpoints

  public approveStep1 = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;

      const existingApp = await this.collections.applications.findOne({
        _id: new ObjectId(id),
      });

      if (!existingApp) {
        return this.jsonError(
          res,
          404,
          this.__component,
          "Application not found",
        );
      }

      const isApproved = status === "approved";
      const isStatusValid = ["confirmed", "changed", "in contract"].includes(
        existingApp.applicationStatus ?? "",
      );
      const isStepChanged = ["confirmed", "changed"].includes(
        existingApp.stepStatus?.step1 ?? "",
      );
      const stepChanges = (existingApp as any)?.step1Changes;

      if (
        isApproved &&
        isStatusValid &&
        isStepChanged &&
        stepChanges &&
        Object.keys(stepChanges).length > 0
      ) {
        const allowedProfileFields = [
          "firstName",
          "lastName",
          "userName",
          "phoneNumber",
          "email",
          "alternativeNumber",
          "nationalityId",
          "documentTypeId",
          "idNumber",
          "documentExpiryDate",
          "nativeLanguageId",
          "additionalLanguageIds",
          "physicalAddress",
          "postalAddress",
          "bankDetails",
          "employmentInfo",
        ];

        const filteredChanges: any = {};

        // --- 1) Add simple (non-nested) fields only ---
        for (const [key, value] of Object.entries(stepChanges)) {
          if (!allowedProfileFields.includes(key)) continue;

          // Skip nested parent objects (handled below)
          if (
            ["physicalAddress", "postalAddress", "bankDetails"].includes(key)
          ) {
            continue;
          }
          if (
            ["documentTypeId", "nationalityId", "nativeLanguageId"].includes(
              key,
            ) &&
            value &&
            typeof value === "string"
          ) {
            filteredChanges[key] = this.toObjectId(value as string);
          } else {
            filteredChanges[key] = value;
          }
        }

        // --- 2) Handle nested fields safely ---
        ["physicalAddress", "postalAddress", "bankDetails"].forEach(
          (nested) => {
            const group = stepChanges[nested];
            if (!group) return;

            for (const [key, value] of Object.entries(group)) {
              const path = `${nested}.${key}`;

              // Convert IDs
              if ((key === "regionId" || key === "accountTypeId") && value) {
                filteredChanges[path] = this.toObjectId(value as string);
              } else {
                filteredChanges[path] = value;
              }
            }
          },
        );

        // --- 3) Update user profile (only if needed) ---
        if (Object.keys(filteredChanges).length > 0) {
          await this.collections.userProfiles.updateOne(
            { _id: existingApp.profileId },
            { $set: filteredChanges },
          );
        }

        // --- 4) Employment Info update ---
        if (stepChanges.employmentInfo) {
          const employmentUpdates: any = {};

          for (const [key, value] of Object.entries(
            stepChanges.employmentInfo,
          )) {
            employmentUpdates[`employmentInfo.${key}`] = value;
          }

          await this.collections.applications.updateOne(
            { _id: existingApp._id },
            { $set: employmentUpdates },
          );
        }

        // --- 5) Update step status ---
        await this.collections.applications.updateOne(
          { _id: existingApp._id },
          {
            $set: { "stepStatus.step1": status },
            $unset: { step1Changes: "" },
          },
        );
      } else {
        await this.collections.applications.updateOne(
          { _id: existingApp._id },
          {
            $set: {
              "stepStatus.step1": status,
              "stepReject.step1Reason": reason || "",
            },
          },
        );
      }
      await this.updateApplicationStatus(existingApp._id);
      return this.json(req, res, 200, {
        message: `Application Step 1 ${status} Successfully`,
      });
    } catch (error) {
      return this.jsonError(res, 400, this.__component, "wrong", error);
    }
  };

  public approveStep2 = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;

      const existingApp = await this.collections.applications.findOne({
        _id: new ObjectId(id),
      });

      if (!existingApp) {
        return this.jsonError(
          res,
          404,
          this.__component,
          "Application not found",
        );
      }
      const isApproved = status === "approved";
      const isStatusValid = ["confirmed", "in contract", "changed"].includes(
        existingApp.applicationStatus ?? "",
      );
      const isStepChanged = ["confirmed", "changed"].includes(
        existingApp.stepStatus?.step2 ?? "",
      );
      const stepChanges = (existingApp as any)?.step2Changes;
      if (
        isApproved &&
        isStatusValid &&
        isStepChanged &&
        stepChanges &&
        Object.keys(stepChanges).length > 0
      ) {
        const allowedFields = ["emergencyContacts", "isMarried", "dependents"];
        const filteredChanges: any = {};
        for (const key of Object.keys(stepChanges)) {
          if (allowedFields.includes(key))
            filteredChanges[key] = stepChanges[key];
        }
        if (
          Array.isArray(filteredChanges.emergencyContacts) &&
          filteredChanges.emergencyContacts.length > 0
        ) {
          for (const contactChange of filteredChanges.emergencyContacts) {
            if (contactChange.create) {
              // 🆕 New contact → insert
              const newContact = {
                _id: new ObjectId(),
                userId: existingApp.userId,
                firstName: contactChange.firstName,
                lastName: contactChange.lastName,
                relationId: this.toObjectId(contactChange.relationId),
                homePhone: contactChange.homePhone,
                mobilePhone: contactChange.mobilePhone,
                address: contactChange.address,
                type: contactChange.type,
                createdAt: new Date(),
              };

              await this.collections.applications.updateOne(
                { _id: existingApp._id },
                { $push: { emergencyContacts: newContact } },
              );
            } else if (contactChange._id) {
              const updateFields: any = {};

              // Keep only changed fields
              for (const key in contactChange) {
                if (key !== "_id" && key !== "create") {
                  updateFields[`emergencyContacts.$[elem].${key}`] =
                    contactChange[key];
                }
              }
              await this.collections.applications.updateOne(
                { _id: existingApp._id },
                {
                  $set: updateFields,
                },
                {
                  arrayFilters: [
                    { "elem._id": this.toObjectId(contactChange._id) },
                  ],
                },
              );
            }
          }

          await this.collections.applications.updateOne(
            { _id: existingApp._id },
            {
              $set: {
                "stepStatus.step2": status,
              },
            },
          );
        }

        if (
          Array.isArray(filteredChanges.dependents) &&
          filteredChanges.dependents.length > 0
        ) {
          await this.collections.applications.updateOne(
            { _id: existingApp._id },
            {
              $set: {
                dependents: filteredChanges.dependents,
                "stepStatus.step2": status,
              },
            },
          );
        }

        if (typeof filteredChanges.isMarried !== "undefined") {
          await this.collections.applications.updateOne(
            { _id: existingApp._id },
            {
              $set: {
                isMarried: filteredChanges.isMarried,
                "stepStatus.step2": status,
              },
            },
          );
        }

        await this.collections.applications.updateOne(
          { _id: existingApp._id },
          { $unset: { step2Changes: "" } },
        );
      } else {
        await this.collections.applications.updateOne(
          { _id: existingApp._id },
          {
            $set: {
              "stepStatus.step2": status,
              "stepReject.step2Reason": reason || "",
            },
          },
        );
      }
      await this.updateApplicationStatus(existingApp._id);
      return this.json(req, res, 200, {
        message: `Application Step 2 ${status} Successfully`,
      });
    } catch (error) {
      console.error("approveStep2 Error:", error);
      return this.jsonError(
        res,
        400,
        this.__component,
        "Error approving Step 2",
        error,
      );
    }
  };

  public approveStep3 = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;

      const existingApp = await this.collections.applications.findOne({
        _id: new ObjectId(id),
      });

      if (!existingApp) {
        return this.jsonError(
          res,
          404,
          this.__component,
          "Application not found",
        );
      }
      const isApproved = status === "approved";
      const isStatusValid = ["confirmed", "in contract", "changed"].includes(
        existingApp.applicationStatus ?? "",
      );
      const isStepChanged = ["confirmed", "changed"].includes(
        existingApp.stepStatus?.step3 ?? "",
      );
      const stepChanges = (existingApp as any)?.step3Changes;
      if (
        isApproved &&
        isStatusValid &&
        isStepChanged &&
        stepChanges &&
        Object.keys(stepChanges).length > 0
      ) {
        const education = {
          educationDetails: {
            lastSchool:
              stepChanges.educationDetails.lastSchool ??
              existingApp?.education?.educationDetails.lastSchool,
            highestGrade:
              stepChanges.educationDetails.highestGrade ??
              existingApp?.education?.educationDetails.highestGrade,
            yearCompleted:
              stepChanges.educationDetails.yearCompleted ??
              existingApp?.education?.educationDetails.yearCompleted,
          },
          tertiaryEducation: {
            institutionName:
              stepChanges.tertiaryEducation?.institutionName ??
              existingApp?.education?.tertiaryEducation?.institutionName ??
              "",
            qualification:
              stepChanges.tertiaryEducation?.qualification ??
              existingApp?.education?.tertiaryEducation?.qualification ??
              "",
            yearCompleted:
              stepChanges.tertiaryEducation?.yearCompleted ??
              existingApp?.education?.tertiaryEducation?.yearCompleted ??
              0,
          },
          tertiaryQualification:
            stepChanges.tertiaryQualification ??
            existingApp?.education?.tertiaryQualification,
          futureEducationPlans:
            stepChanges.futureEducationPlans ??
            existingApp?.education?.futureEducationPlans,
          studyPlanDetail:
            stepChanges.studyPlanDetail ??
            existingApp?.education?.studyPlanDetail,
        };
        await this.collections.applications.updateOne(
          { _id: existingApp._id },
          {
            $set: {
              education,
              "stepStatus.step3": status,
            },
            $unset: { step3Changes: "" },
          },
        );
      } else {
        await this.collections.applications.updateOne(
          { _id: existingApp._id },
          {
            $set: {
              "stepStatus.step3": status,
              "stepReject.step3Reason": reason || "",
            },
          },
        );
      }
      await this.updateApplicationStatus(existingApp._id);
      return this.json(req, res, 200, {
        message: `Application Step 3 ${status} Successfully`,
      });
    } catch (error) {
      return this.jsonError(
        res,
        400,
        this.__component,
        "Error approving Step 3",
        error,
      );
    }
  };

  public approveStep4 = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;

      const existingApp = await this.collections.applications.findOne({
        _id: new ObjectId(id),
      });

      if (!existingApp) {
        return this.jsonError(
          res,
          404,
          this.__component,
          "Application not found",
        );
      }
      const isApproved = status === "approved";
      const isStatusValid = ["confirmed", "in contract", "changed"].includes(
        existingApp.applicationStatus ?? "",
      );
      const isStepChanged = ["confirmed", "changed"].includes(
        existingApp.stepStatus?.step4 ?? "",
      );
      const stepChanges = (existingApp as any)?.step4Changes;
      if (
        isApproved &&
        isStatusValid &&
        isStepChanged &&
        stepChanges &&
        Object.keys(stepChanges).length > 0
      ) {
        const benefitIds =
          stepChanges.benefitIds && Array.isArray(stepChanges.benefitIds)
            ? stepChanges.benefitIds.map((id: string) => new ObjectId(id))
            : [];
        const employmentHistoryIds =
          stepChanges.employmentHistoryIds &&
            Array.isArray(stepChanges.employmentHistoryIds)
            ? stepChanges.employmentHistoryIds.map(
              (id: string) => new ObjectId(id),
            )
            : [];

        const currentEmployment = {
          jobDescription:
            stepChanges.jobDescription ??
            existingApp.currentEmployment?.jobDescription,
          benefitIds,
          dismissedFromJob:
            stepChanges.dismissedFromJob ??
            existingApp.currentEmployment?.dismissedFromJob,
          employersDismissalEndorsement:
            stepChanges.employersDismissalEndorsement ??
            existingApp.currentEmployment?.employersDismissalEndorsement,
          reasonForDismissal:
            stepChanges.reasonForDismissal ??
            existingApp.currentEmployment?.reasonForDismissal,
          otherBenefit:
            stepChanges.otherBenefit ??
            existingApp.currentEmployment?.otherBenefit,
        };

        await this.collections.applications.updateOne(
          { _id: existingApp._id },
          {
            $set: {
              currentEmployment,
              employmentHistoryIds,
              "stepStatus.step4": status,
            },
            $unset: { step4Changes: "" },
          },
        );
      } else {
        await this.collections.applications.updateOne(
          { _id: existingApp._id },
          {
            $set: {
              "stepStatus.step4": status,
              "stepReject.step4Reason": reason || "",
            },
          },
        );
      }
      await this.updateApplicationStatus(existingApp._id);
      return this.json(req, res, 200, {
        message: `Application Step 4 ${status} Successfully`,
      });
    } catch (error) {
      return this.jsonError(
        res,
        400,
        this.__component,
        "Error approving Step 4",
        error,
      );
    }
  };

  public approveStep5 = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;

      const existingApp = await this.collections.applications.findOne({
        _id: new ObjectId(id),
      });

      if (!existingApp) {
        return this.jsonError(
          res,
          404,
          this.__component,
          "Application not found",
        );
      }
      const isApproved = status === "approved";
      const isStatusValid = ["confirmed", "in contract", "changed"].includes(
        existingApp.applicationStatus ?? "",
      );
      const isStepChanged = ["confirmed", "changed"].includes(
        existingApp.stepStatus?.step5 ?? "",
      );
      const stepChanges = (existingApp as any)?.step5Changes;
      if (
        isApproved &&
        isStatusValid &&
        isStepChanged &&
        stepChanges &&
        Object.keys(stepChanges).length > 0
      ) {
        const skillIds =
          stepChanges.skillIds && Array.isArray(stepChanges.skillIds)
            ? stepChanges.skillIds.map((id: string) => new ObjectId(id))
            : [];

        const areaIds =
          stepChanges.areaIds && Array.isArray(stepChanges.areaIds)
            ? stepChanges.areaIds.map((id: string) => new ObjectId(id))
            : [];

        const licenseCodeIds =
          stepChanges.licenseCodeIds &&
            Array.isArray(stepChanges.licenseCodeIds)
            ? stepChanges.licenseCodeIds.map((id: string) => new ObjectId(id))
            : [];
        const driverInfo = {
          drivingExperience:
            stepChanges.drivingExperience ??
            existingApp.driverDetails?.drivingExperience,
          medication:
            stepChanges.medication ?? existingApp.driverDetails?.medication,
          medicationCondition:
            stepChanges.medicationCondition ??
            existingApp.driverDetails?.medicationCondition,
          hasLicense:
            stepChanges.hasLicense ?? existingApp.driverDetails?.hasLicense,
          licenseNumber:
            stepChanges.licenseNumber ??
            existingApp.driverDetails?.licenseNumber,
          issuedDate:
            stepChanges.issuedDate ?? existingApp.driverDetails?.issuedDate,
          prdpExpiry:
            stepChanges.prdpExpiry ?? existingApp.driverDetails?.prdpExpiry,
          licenseExpiry:
            stepChanges.licenseExpiry ??
            existingApp.driverDetails?.licenseExpiry,
          endorsements:
            stepChanges.endorsements ?? existingApp.driverDetails?.endorsements,
          vehicleOwned:
            stepChanges.vehicleOwned ?? existingApp.driverDetails?.vehicleOwned,
          anyAccidents:
            stepChanges.anyAccidents ?? existingApp.driverDetails?.anyAccidents,
          licenseSuspended:
            stepChanges.licenseSuspended ??
            existingApp.driverDetails?.licenseSuspended,
          skillIds,
          areaIds,
          licenseCodeIds,
          jobPosition:
            stepChanges.jobPosition ?? existingApp.driverDetails?.jobPosition,
        };

        await this.collections.applications.updateOne(
          { _id: existingApp._id },
          {
            $set: {
              driverDetails: driverInfo,
              applicationType:
                stepChanges.applicationType ?? existingApp.applicationType,
              "stepStatus.step5": status,
            },
            $unset: { step5Changes: "" },
          },
        );
      } else {
        await this.collections.applications.updateOne(
          { _id: existingApp._id },
          {
            $set: {
              "stepStatus.step5": status,
              "stepReject.step5Reason": reason || "",
            },
          },
        );
      }
      await this.updateApplicationStatus(existingApp._id);
      return this.json(req, res, 200, {
        message: `Application Step 5 ${status} Successfully`,
      });
    } catch (error) {
      return this.jsonError(
        res,
        400,
        this.__component,
        "Error approving Step 5",
        error,
      );
    }
  };

  public approveStep6 = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;

      const existingApp = await this.collections.applications.findOne({
        _id: new ObjectId(id),
      });

      if (!existingApp) {
        return this.jsonError(
          res,
          404,
          this.__component,
          "Application not found",
        );
      }

      const existingAsset = await this.collections.assets
        .find({
          _id: { $in: existingApp.assetIds },
        })
        .toArray();

      if (!existingAsset || existingAsset.length === 0) {
        return this.jsonError(res, 404, this.__component, "Asset not found");
      }
      const isApproved = status === "approved";
      const isStatusValid = ["confirmed", "in contract", "changed"].includes(
        existingApp.applicationStatus ?? "",
      );
      const isStepChanged = ["confirmed", "changed"].includes(
        existingApp.stepStatus?.step6 ?? "",
      ); //existingApp.stepStatus?.step6 === "confirmed";
      const stepChanges = (existingApp as any)?.step6Changes;
      if (
        isApproved &&
        isStatusValid &&
        isStepChanged &&
        stepChanges &&
        Object.keys(stepChanges).length > 0
      ) {
        if (stepChanges.vehicleTypeId) {
          stepChanges.vehicleTypeId = this.toObjectId(
            stepChanges.vehicleTypeId,
          );
        }
        if (stepChanges.subDeviceIds) {
          stepChanges.subDeviceIds =
            stepChanges.subDeviceIds && Array.isArray(stepChanges.subDeviceIds)
              ? stepChanges.subDeviceIds.map((id: string) => new ObjectId(id))
              : [];
        }
        if (stepChanges.accessoryId) {
          stepChanges.accessoryIds =
            stepChanges.accessoryIds && Array.isArray(stepChanges.accessoryIds)
              ? stepChanges.accessoryIds.map((id: string) => new ObjectId(id))
              : [];
        }
        const updateAsset = {
          registrationNumber:
            stepChanges.registrationNumber ??
            existingAsset[0].registrationNumber,
          make: stepChanges.make ?? existingAsset[0].registrationNumber,
          model: stepChanges.model ?? existingAsset[0].model,
          engineNumber:
            stepChanges.engineNumber ?? existingAsset[0].engineNumber,
          chassisNumber:
            stepChanges.chassisNumber ?? existingAsset[0].chassisNumber,
          registrationDate:
            stepChanges.registrationDate ?? existingAsset[0].registrationDate,
          licenseExpiryDate:
            stepChanges.licenseExpiryDate ?? existingAsset[0].licenseExpiryDate,
          currentMileage:
            stepChanges.currentMileage ?? existingAsset[0].currentMileage,
          color: stepChanges.color ?? existingAsset[0].color,
          vehicleTypeId:
            stepChanges.vehicleTypeId ?? existingAsset[0].vehicleTypeId,
          subDeviceIds:
            stepChanges.subDeviceIds ?? existingAsset[0].subDeviceIds,
          accessoryIds:
            stepChanges.accessoryIds ?? existingAsset[0].accessoryIds,
          tracking: stepChanges.tracking ?? existingAsset[0].tracking,
          trackingSupplier:
            stepChanges.trackingSupplier ?? existingAsset[0].trackingSupplier,
        };
        await this.collections.assets.updateOne(
          { _id: existingAsset[0]._id },
          {
            $set: updateAsset,
          },
        );
        await this.collections.applications.updateOne(
          { _id: existingApp._id },
          {
            $set: {
              "stepStatus.step6": status,
            },
            $unset: { step6Changes: "" },
          },
        );
      } else {
        await this.collections.applications.updateOne(
          { _id: existingApp._id },
          {
            $set: {
              "stepStatus.step6": status,
              "stepReject.step6Reason": reason || "",
            },
          },
        );
      }
      await this.updateApplicationStatus(existingApp._id);
      return this.json(req, res, 200, {
        message: `Application Step 6 ${status} Successfully`,
      });
    } catch (error) {
      return this.jsonError(
        res,
        400,
        this.__component,
        "Error approving Step 6",
        error,
      );
    }
  };

  public approveStep7 = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;

      const existingApp = await this.collections.applications.findOne({
        _id: new ObjectId(id),
      });

      if (!existingApp) {
        return this.jsonError(
          res,
          404,
          this.__component,
          "Application not found",
        );
      }
      const isApproved = status === "approved";
      const isStatusValid = ["confirmed", "in contract", "changed"].includes(
        existingApp.applicationStatus ?? "",
      );
      const isStepChanged = ["confirmed", "changed"].includes(
        existingApp.stepStatus?.step7 ?? "",
      );
      const stepChanges = (existingApp as any)?.step7Changes;
      if (
        isApproved &&
        isStatusValid &&
        isStepChanged &&
        stepChanges &&
        Object.keys(stepChanges).length > 0
      ) {
        const security = {
          isArrested:
            stepChanges.isArrested ?? existingApp.security?.isArrested,
          arrestDetails:
            stepChanges.arrestDetails ?? existingApp.security?.arrestDetails,
          courtCase: stepChanges.courtCase ?? existingApp.security?.courtCase,
          caseDetails:
            stepChanges.caseDetails ?? existingApp.security?.caseDetails,
          criminalRecordDetails:
            stepChanges.criminalRecordDetails ??
            existingApp.security?.criminalRecordDetails,
        };

        await this.collections.applications.updateOne(
          { _id: existingApp._id },
          {
            $set: {
              security,
              "stepStatus.step7": status,
            },
            $unset: { step7Changes: "" },
          },
        );
      } else {
        await this.collections.applications.updateOne(
          { _id: existingApp._id },
          {
            $set: {
              "stepStatus.step7": status,
              "stepReject.step7Reason": reason || "",
            },
          },
        );
      }
      await this.updateApplicationStatus(existingApp._id);
      return this.json(req, res, 200, {
        message: `Application Step 7 ${status} Successfully`,
      });
    } catch (error) {
      return this.jsonError(
        res,
        400,
        this.__component,
        "Error approving Step 7",
        error,
      );
    }
  };

  public approveStep = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const { step } = req.query;
      const { status, reason } = req.body;

      const existingApp = await this.collections.applications.findOne({
        _id: this.toObjectId(id),
      });
      if (!existingApp) {
        return this.jsonError(
          res,
          400,
          this.__component,
          "Application does not exist",
        );
      }
      const stepKey = `stepStatus.step${step}`;
      const rejectKey = `stepReject.step${step}Reason`;
      await this.collections.applications.updateOne(
        { _id: existingApp._id },
        {
          $set: {
            [stepKey]: status,
            [rejectKey]: reason || "",
          },
        },
      );
      await this.updateApplicationStatus(existingApp._id);
      return this.json(req, res, 200, {
        message: `Application Step ${step} ${status} Successfully`,
      });
    } catch (error) {
      return this.jsonError(
        res,
        400,
        this.__component,
        "Error approving Step",
        error,
      );
    }
  };

  public getStepStatus = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const defaultFilter = { _id: new ObjectId(id) };
      this.getAggrigation(req, this.filter_options, defaultFilter);
      const [data] = await Promise.all([
        this.collections.applications
          .aggregate([
            ...req.aggregations,
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
                _id: 1,
                name: {
                  $concat: [
                    { $arrayElemAt: ["$profile.firstName", 0] },
                    " ",
                    { $arrayElemAt: ["$profile.lastName", 0] },
                  ],
                },
                stepStatus: 1,
                applicationType: 1,
              },
            },
          ])
          .toArray(),
      ]);
      const status = data[0];
      if (status) {
        return this.json(req, res, 200, { data: status });
      }

      return this.jsonError(res, 400, this.__component, "get");
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public delete = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      if (id) {
        await this.collections.applications.updateOne(
          {
            _id: new ObjectId(id),
          },
          { $set: { isDeleted: true } },
        );
        return this.json(req, res, 200, {
          message: `Application Deleted Successfully`,
        });
      } else {
        return this.jsonError(res, 400, this.__component, "delete");
      }
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public verifyLicenseDisc = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      let path: string = "";
      const { applicationId } = req.params;
      const app = await this.collections.applications.findOne(
        {
          _id: this.toObjectId(applicationId),
        },
        { projection: { userId: 1 } },
      );
      const licenseDisc = await this.collections.documents
        .find({
          applicationId: app?._id,
          userId: app?.userId,
          type: "License Disc",
        })
        .toArray();
      if (licenseDisc && licenseDisc.length > 0) {
        licenseDisc.forEach(async (el) => {
          await this.collections.documents.deleteOne({ _id: el._id });
          this.deleteFile(el.url);
        });
      }
      if (
        req.files != null &&
        req.files != undefined &&
        Object.keys(req.files).length > 0
      ) {
        const filesArray = req.files;

        if (filesArray["licenseDisc"]) {
          const documentType = ["png", "jpg", "jpeg"];
          const existingDocOrPath = global["config"].production ? "" : "disc/";
          const imagePaths = await uploadDocument(
            filesArray["licenseDisc"],
            documentType,
            existingDocOrPath,
          );

          await ne.each(imagePaths, async (el, i) => {
            const newDocument: Document = {
              _id: new ObjectId(),
              userId: app?.userId,
              applicationId: app?._id,
              type: "License Disc",
              name: el.name ?? "",
              url: el.url ?? "",
              status: "uploaded",
            };
            await this.collections.documents.insertOne(newDocument);
            path = el.url ?? "";
          });
        }
        if (path != "") {
          const disc = new LicenseDisk();
          const result = await disc.verifyLicenseDisc(path);
          if (result && result.length > 0 && result[0].data) {
            return this.json(req, res, 200, { data: result[0].data });
          } else {
            return this.jsonError(
              res,
              400,
              this.__component,
              "License disc verification failed",
            );
          }
        }
      }
      return this.jsonError(res, 400, this.__component, "No file uploaded");
    } catch (error) {
      return this.jsonError(res, 400, this.__component, "wrong", error);
    }
  };

  private updateApplicationStatus = async (applicationId: ObjectId) => {
    const app = await this.collections.applications.findOne({
      _id: applicationId,
    });
    if (!app) return;
    const steps = app.stepStatus || {};
    // Filter out "skipped" steps (e.g. step6 when applicationType is "other")
    const stepValues = Object.values(steps).filter((v) => v !== "skipped");

    let newStatus = app.applicationStatus;

    if (stepValues.includes("rejected")) {
      newStatus = "rejected";
    } else if (stepValues.includes("changed")) {
      newStatus = "changed";
    } else if (stepValues.includes("not confirmed")) {
      newStatus = "not confirmed";
    } else if (stepValues.every((v) => v === "approved")) {
      newStatus = "accepted";
    } else if (stepValues.every((v) => v === "confirmed")) {
      newStatus = "confirmed";
    } else if (stepValues.includes("in progress")) {
      newStatus = "in progress";
    } else if (stepValues.includes("approved")) {
      newStatus = "confirmed";
    } else if (stepValues.includes("confirmed")) {
      newStatus = "completed";
    } else if (stepValues.every((v) => v === "completed")) {
      newStatus = "completed";
    } else if (app.applicationStatus == "accepted") {
      newStatus = "accepted";
    }
    if (
      app.applicationStatus !== newStatus &&
      !["in contract", "shortlisted", "finalised"].includes(
        app?.applicationStatus || "",
      )
    ) {
      await this.collections.applications.updateOne(
        { _id: applicationId },
        {
          $set: {
            applicationStatus: newStatus as
              | "accepted"
              | "confirmed"
              | "not confirmed"
              | "in progress"
              | "rejected"
              | "completed"
              | "changed",
          },
        },
      );
    }
  };

  private updateStepStatus = async (status: string) => {
    switch (status) {
      case "confirmed":
        return "confirmed";
      case "rejected":
        return "confirmed";
      case "approved":
        return "approved";
      default:
        return "completed";
    }
  };

  public getRequiredDocuments = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { user_id } = req.query;
      const userId = typeof user_id === "string" ? new ObjectId(user_id) : null;

      if (!userId) {
        return this.jsonError(
          res,
          400,
          this.__component,
          "Invalid user_id or application_id",
        );
      }

      const defaultFilter = { userId: new ObjectId(userId) };
      this.getAggrigation(req, this.filter_options, defaultFilter);
      const [data] = await Promise.all([
        this.collections.userProfiles
          .aggregate([
            ...req.aggregations,
            {
              $lookup: {
                from: "documentTypes",
                localField: "documentTypeId",
                foreignField: "_id",
                as: "documentTypes",
              },
            },
            {
              $lookup: {
                from: "applications",
                localField: "_id",
                foreignField: "profileId",
                as: "applications",
              },
            },
            {
              $project: {
                _id: 1,
                applicationType: {
                  $arrayElemAt: ["$applications.applicationType", 0],
                },
                documentType: {
                  $arrayElemAt: ["$documentTypes.name", 0],
                },
              },
            },
          ])
          .toArray(),
      ]);
      const requiredDocs: string[] = [
        "Bank Statement/ Confirmation Letter",
        "Proof of Address",
        "Selfie",
      ];
      const result = data[0];
      if (result.applicationType === "driver") {
        requiredDocs.push("Driver's License");
      }
      if (result.documentType) {
        const docName = await this.docs(result.documentType);
        docName.forEach((doc) => {
          if (!requiredDocs.includes(doc)) {
            requiredDocs.push(doc);
          }
        });
      }

      return this.json(req, res, 200, { data: requiredDocs });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  private docs = (docType: string): string[] => {
    switch (docType) {
      case "ID":
        return ["ID"];

      case "Passport":
        return ["Passport"];

      case "Work Permit":
        return ["Work Permit", "Passport"];

      case "Asylum":
        return ["Asylum"];

      default:
        return [];
    }
  };
}
