import { BaseController } from "../../../core";
import { Filter_Options, Request, Response } from "../../../__types";

export default class DisciplinaryController extends BaseController {
  public __component: string = "equipment";
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
        profileId: req.user.profileId,
      };
      this.getAggrigation(req, this.filter_options, defaultFilter);
      const [data, count] = await Promise.all([
        this.collections.equipments
          .aggregate([
            {
              $lookup: {
                from: "allowEquipments",
                localField: "equipmentIds",
                foreignField: "_id",
                as: "equipments",
              },
            },
            ...req.aggregations,
            {
              $project: {
                _id: 1,
                status: 1,
                profileId: 1,
                issueDate: 1,
                returnDate: 1,
                equipmentType: {
                  $sortArray: {
                    input: {
                      $map: {
                        input: "$equipments",
                        as: "eq",
                        in: "$$eq.name",
                      },
                    },
                    sortBy: 1, // 1 = ASC, -1 = DESC
                  },
                },
              },
            },
          ])
          .toArray(),
        this.collections.equipments
          .aggregate([
            {
              $lookup: {
                from: "allowEquipments",
                localField: "equipmentIds",
                foreignField: "_id",
                as: "equipments",
              },
            },
            ...req.dbPagination,
          ])
          .toArray(),
      ]);
      return this.json(req, res, 200, { data, count: count });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };
}
