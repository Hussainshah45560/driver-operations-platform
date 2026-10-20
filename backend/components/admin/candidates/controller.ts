import { BaseController } from "../../../core";
import { Filter_Options, Request, Response } from "../../../__types";

export default class CandidatesController extends BaseController {
  public __component: string = "candidates";
  private filter_options: Filter_Options = {
    search: ["name"],
    defaultSort: "_id",
    filters: {},
  };

  public matchingCandidates = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { recruitment_id, areas, region, skills, all } = req.query;
      const recruitmentId =
        typeof recruitment_id === "string"
          ? this.toObjectId(recruitment_id)
          : recruitment_id;
      const criteria = await this.collections.recruitments.findOne({
        _id: recruitmentId,
      });
      const defaultFilter = {
        applicationType: criteria?.jobType || "",
        applicationStatus: "accepted",
      };
      const orConditions: any[] = [];

      if (areas && criteria?.areaIds?.length) {
        orConditions.push({
          "driverDetails.areaIds": { $in: criteria.areaIds },
        });
      }

      if (skills && criteria?.skillIds?.length) {
        orConditions.push({
          "driverDetails.skillIds": { $in: criteria.skillIds },
        });
      }

      if (region && criteria?.regionId) {
        orConditions.push({
          "profile.physicalAddress.regionId": criteria.regionId,
        });
      }

      if (orConditions.length > 0) {
        defaultFilter["$or"] = orConditions;
      }
      if (orConditions.length == 0 && !all) {
        return this.json(req, res, 200, { data: [], count: 0 });
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
                from: "employmentHistories",
                let: { ids: "$employmentHistoryIds" },
                pipeline: [
                  {
                    $match: {
                      $expr: { $in: ["$_id", { $ifNull: ["$$ids", []] }] },
                    },
                  },
                  {
                    $project: {
                      referenceName: 1,
                      referenceContact: 1,
                      referenceDesignation: 1,
                      _id: 1, // keep or remove
                    },
                  },
                ],
                as: "history",
              },
            },
            ...req.aggregations,
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
                applicationNumber: 1,
                phoneNumber: { $arrayElemAt: ["$profile.phoneNumber", 0] },
                contactedDate: 1,
                reference: "$history",
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

  public shortListedCandidates = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { recruitment_id } = req.query;
      const recruitmentId =
        typeof recruitment_id === "string"
          ? this.toObjectId(recruitment_id)
          : recruitment_id;
      const criteria = await this.collections.recruitments.findOne({
        _id: recruitmentId,
      });
      const defaultFilter = { _id: { $in: criteria?.shortListedIds || [] } };
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
                from: "employmentHistories",
                let: { ids: "$employmentHistoryIds" },
                pipeline: [
                  {
                    $match: {
                      $expr: { $in: ["$_id", { $ifNull: ["$$ids", []] }] },
                    },
                  },
                  {
                    $project: {
                      referenceName: 1,
                      referenceContact: 1,
                      referenceDesignation: 1,
                      _id: 1, // keep or remove
                    },
                  },
                ],
                as: "history",
              },
            },
            ...req.aggregations,
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
                applicationNumber: 1,
                phoneNumber: { $arrayElemAt: ["$profile.phoneNumber", 0] },
                contactedDate: 1,
                reference: "$history",
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

  public finalisedCandidates = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { recruitment_id } = req.query;
      const recruitmentId =
        typeof recruitment_id === "string"
          ? this.toObjectId(recruitment_id)
          : recruitment_id;
      const criteria = await this.collections.recruitments.findOne({
        _id: recruitmentId,
      });
      const defaultFilter = { _id: { $in: criteria?.finalisedIds || [] } };
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
                from: "contracts",
                localField: "profile.userId",
                foreignField: "userId",
                as: "contract",
              },
            },
            
            {
              $lookup: {
                from: "employmentHistories",
                let: { ids: "$employmentHistoryIds" },
                pipeline: [
                  {
                    $match: {
                      $expr: { $in: ["$_id", { $ifNull: ["$$ids", []] }] },
                    },
                  },
                  {
                    $project: {
                      referenceName: 1,
                      referenceContact: 1,
                      referenceDesignation: 1,
                      _id: 1, // keep or remove
                    },
                  },
                ],
                as: "history",
              },
            },
            ...req.aggregations,
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
                applicationNumber: 1,
                phoneNumber: { $arrayElemAt: ["$profile.phoneNumber", 0] },
                contactedDate: 1,
                userId: { $arrayElemAt: ["$profile.userId", 0] },
                reference: "$history",
                contract: { $size: "$contract" },
                contractStatus: { $arrayElemAt: ["$contract.status", 0] },
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
      return this.json(req, res, 200, {
        data: {
          result: data,
          isInductionRequired: criteria?.isInductionRequired,
        },
        count: count,
      });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public allowEquipmentsToCandidates = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { recruitment_id } = req.query;
      const recruitmentId =
        typeof recruitment_id === "string"
          ? this.toObjectId(recruitment_id)
          : recruitment_id;
      const recruitment = await this.collections.recruitments.findOne({
        _id: recruitmentId,
      });
      const defaultFilter = { _id: { $in: recruitment?.finalisedIds || [] } };
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
                from: "equipments",
                localField: "profile._id",
                foreignField: "profileId",
                as: "equipment",
              },
            },
            {
              $addFields: {
                equipmentIds: {
                  $reduce: {
                    input: "$equipment",
                    initialValue: [],
                    in: { $concatArrays: ["$$value", "$$this.equipmentIds"] },
                  },
                },
              },
            },
            {
              $lookup: {
                from: "allowEquipments",
                localField: "equipmentIds",
                foreignField: "_id",
                as: "allowEquipment",
              },
            },
            ...req.aggregations,
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
                profileId: { $arrayElemAt: ["$profile._id", 0] },
                equipmentId: { $arrayElemAt: ["$equipment._id", 0] },
                phoneNumber: { $arrayElemAt: ["$profile.phoneNumber", 0] },
                status: {
                  $ifNull: [
                    { $arrayElemAt: ["$equipment.status", 0] },
                    "not allocated",
                  ],
                },
                contactedDate: 1,
                allowEquipments: "$allowEquipment.name",
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
}
