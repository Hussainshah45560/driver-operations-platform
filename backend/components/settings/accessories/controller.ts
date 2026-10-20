import { ObjectId } from "mongodb";
import { BaseController } from "../../../core";
import { Filter_Options, Request, Response } from "../../../__types";

export default class AccessoryController extends BaseController {
  public __component: string = "accessories";
  private filter_options: Filter_Options = {
    search: ["name","vehicleTypes.name"],
    defaultSort: "name",
    filters: {},
  };

  public list = async (req: Request, res: Response): Promise<Response> => {
    try {
      const defaultFilter = {};
      this.getAggrigation(req, this.filter_options, defaultFilter);
      const [data, count] = await Promise.all([
        this.collections.accessories
          .aggregate([
            {
              $lookup: {
                from: "vehicleTypes",
                localField: "vehicleTypeId",
                foreignField: "_id",
                as: "vehicleTypes",
              },
            },
            ...req.aggregations,
            {
              $project: {
                _id: 1,
                name: 1,
                vehicleType: { $arrayElemAt: ["$vehicleTypes.name", 0] },
              },
            },
          ])
          .toArray(),
        this.collections.accessories.aggregate(req.dbPagination).toArray(),
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
      const accessory = await this.collections.accessories.findOne(
        defaultFilter,
        {
          projection: {
            _id: 1,
            name: 1,
            vehicleTypeId: 1,
          },
        }
      );
      if (accessory) {
        return this.json(req, res, 200, { data: accessory });
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
        const isExist = await this.collections.accessories.findOne({
          _id: this.toObjectId(id),
        });
        if (!isExist) {
          return this.jsonError(
            res,
            400,
            this.__component,
            "Accessory does not exist"
          );
        }
        await this.collections.accessories.updateOne(
          { _id: isExist._id },
          {
            $set: {
              name: FormBody.name,
              vehicleTypeId: this.toObjectId(FormBody.vehicleTypeId),
            },
          }
        );
      } else {
        await this.collections.accessories.insertOne({
          _id: new ObjectId(),
          name: FormBody.name,
          vehicleTypeId: this.toObjectId(FormBody.vehicleTypeId),
        });
      }

      return this.json(req, res, 200, {
        message: `Accessory ${id ? "Updated" : "Saved"} Successfully`,
      });
    } catch (error) {
      return this.jsonError(res, 400, this.__component, "wrong", error);
    }
  };

  public delete = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      if (id) {
        await this.collections.accessories.deleteOne({
          _id: new ObjectId(id),
        });
        await this.appLog(req, this.__component, "Delete", new ObjectId(id));
        return this.json(req, res, 200, {
          message: `Accessory Deleted Successfully`,
        });
      } else {
        return this.jsonError(res, 400, this.__component, "delete");
      }
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };
}
