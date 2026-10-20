import { ObjectId } from "mongodb";
import { BaseController } from "../../../core";
import { Filter_Options, Request, Response } from "../../../__types";

export default class AreaController extends BaseController {
  public __component: string = "areas";
  private filter_options: Filter_Options = {
    search: ["name"],
    defaultSort: "name",
    filters: {},
  };

  public list = async (req: Request, res: Response): Promise<Response> => {
    try {
      const defaultFilter = {};
      this.getAggrigation(req, this.filter_options, defaultFilter);
      const [data, count] = await Promise.all([
        this.collections.areas
          .aggregate([
            ...req.aggregations,
            {
              $lookup: {
                from: "regions",
                localField: "regionId",
                foreignField: "_id",
                as: "regions",
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                region: { $arrayElemAt: ["$regions.name", 0] },
              },
            },
          ])
          .toArray(),
        this.collections.areas.aggregate(req.dbPagination).toArray(),
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
      const area = await this.collections.areas.findOne(defaultFilter, {
        projection: {
          _id: 1,
          name: 1,
          regionId: 1,
        },
      });
      if (area) {
        return this.json(req, res, 200, { data: area });
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
        const isExist = await this.collections.areas.findOne({
          _id: this.toObjectId(id),
        });
        if (!isExist) {
          return this.jsonError(
            res,
            400,
            this.__component,
            "Area does not exist"
          );
        }
        await this.collections.areas.updateOne(
          { _id: isExist._id },
          {
            $set: {
              name: FormBody.name,
              regionId: this.toObjectId(FormBody.regionId),
            },
          }
        );
      } else {
        await this.collections.areas.insertOne({
          _id: new ObjectId(),
          name: FormBody.name,
          regionId: this.toObjectId(FormBody.regionId),
        });
      }

      return this.json(req, res, 200, {
        message: `Area ${id ? "Updated" : "Saved"} Successfully`,
      });
    } catch (error) {
      return this.jsonError(res, 400, this.__component, "wrong", error);
    }
  };

  public delete = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      if (id) {
        await this.collections.areas.deleteOne({
          _id: new ObjectId(id),
        });
        await this.appLog(req, this.__component, "Delete", new ObjectId(id));
        return this.json(req, res, 200, {
          message: `Area Deleted Successfully`,
        });
      } else {
        return this.jsonError(res, 400, this.__component, "delete");
      }
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };
}
