import { ObjectId } from "mongodb";
import { BaseController } from "../../../core";
import { Filter_Options, Request, Response } from "../../../__types";

export default class ChecklistController extends BaseController {
  public __component: string = "checklists";
  private filter_options: Filter_Options = {
    search: ["name","checklist.name"],
    defaultSort: "_id",
    filters: {},
  };

  public list = async (req: Request, res: Response): Promise<Response> => {
    try {
      const defaultFilter = { isDeleted: { $ne: true } };
      this.getAggrigation(req, this.filter_options, defaultFilter);
      const [data, count] = await Promise.all([
        this.collections.checklists
          .aggregate([
            {
              $lookup: {
                from: "checklistTypes",
                localField: "checklistTypeId",
                foreignField: "_id",
                as: "checklist",
              },
            },
            ...req.aggregations,
            {
              $project: {
                _id: 1,
                type: { $arrayElemAt: ["$checklist.name", 0] },
                name: 1,
                groupName: {
                  $map: {
                    input: "$groups",
                    as: "g",
                    in: "$$g.name",
                  },
                },
                // groupOptions: {
                //   $reduce: {
                //     input: "$groups",
                //     initialValue: [],
                //     in: { $concatArrays: ["$$value", "$$this.options.name"] },
                //   },
                // },
                isActive: 1,
              },
            },
          ])
          .toArray(),
        this.collections.checklists.aggregate(req.dbPagination).toArray(),
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
      const checklist = await this.collections.checklists.findOne(
        defaultFilter,
        {
          projection: {
            _id: 1,
            checklistTypeId: 1,
            name: 1,
            groups: 1,
            isActive: 1,
          },
        }
      );
      if (checklist) {
        return this.json(req, res, 200, { data: checklist });
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
      if (id) {
        const isExist = await this.collections.checklists.findOne({
          _id: this.toObjectId(id),
        });
        if (!isExist) {
          return this.jsonError(
            res,
            400,
            this.__component,
            "Checklist does not exist"
          );
        }
        const updateChecklist = {
          checklistTypeId: this.toObjectId(FormBody.checklistTypeId),
          name: FormBody.name,
          groups: FormBody.groups,
        };
        await this.collections.checklists.updateOne(
          { _id: isExist._id },
          {
            $set: {
              ...updateChecklist,
            },
          }
        );
      } else {
        const isExist = await this.collections.checklists.findOne({
          name: FormBody.name,
        });
        if (isExist) {
          return this.jsonError(
            res,
            400,
            this.__component,
            "Checklist already exist"
          );
        }
        const newChecklist = {
          _id: new ObjectId(),
          checklistTypeId: this.toObjectId(FormBody.checklistTypeId),
          name: FormBody.name,
          groups: FormBody.groups,
          isActive: true,
        };
        await this.collections.checklists.insertOne(newChecklist);
      }

      return this.json(req, res, 200, {
        message: `Checklist ${id ? "Updated" : "Saved"} Successfully`,
      });
    } catch (error) {
      return this.jsonError(res, 400, this.__component, "wrong", error);
    }
  };

    public setChecklistStatus = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      if (id) {
        const checklist = await this.collections.checklists.findOne({
          _id: new ObjectId(id),
        });
        if (!checklist) {
          return this.jsonError(
            res,
            400,
            this.__component,
            "checklist does not exist"
          );
        }
        await this.collections.checklists.updateOne(
          {
            _id: checklist._id,
          },
          { $set: { isActive: !checklist.isActive } }
        );
        await this.appLog(
          req,
          this.__component,
          "Active Checklist",
          new ObjectId(id)
        );
        return this.json(req, res, 200, {
          message: `Checklist ${
            !checklist.isActive ? "Activated" : "Deactivated"
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

  public delete = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      if (id) {
        await this.collections.checklists.updateOne(
          {
            _id: new ObjectId(id),
          },
          { $set: { isDeleted: true } }
        );
        await this.appLog(req, this.__component, "Delete", new ObjectId(id));
        return this.json(req, res, 200, {
          message: `Checklist Deleted Successfully`,
        });
      } else {
        return this.jsonError(res, 400, this.__component, "delete");
      }
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };
}
