import { ObjectId } from "mongodb";
import { BaseController } from "../../../core";
import { Filter_Options, Request, Response } from "../../../__types";
export default class SubDeviceController extends BaseController {
  public __component: string = "subDevices";
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
        this.collections.subDevices
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
        this.collections.subDevices.aggregate(req.dbPagination).toArray(),
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
      const subDevice = await this.collections.subDevices.findOne(
        defaultFilter,
        {
          projection: {
            _id: 1,
            name: 1,
            vehicleTypeId: 1,
          },
        }
      );
      if (subDevice) {
        return this.json(req, res, 200, { data: subDevice });
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
        const isExist = await this.collections.subDevices.findOne({
          _id: this.toObjectId(id),
        });
        if (!isExist) {
          return this.jsonError(
            res,
            400,
            this.__component,
            "Sub Device does not exist"
          );
        }
        await this.collections.subDevices.updateOne(
          { _id: isExist._id },
          {
            $set: {
              name: FormBody.name,
              vehicleTypeId: this.toObjectId(FormBody.vehicleTypeId),
            },
          }
        );
      } else {
        await this.collections.subDevices.insertOne({
          _id: new ObjectId(),
          name: FormBody.name,
          vehicleTypeId: this.toObjectId(FormBody.vehicleTypeId),
        });
      }

      return this.json(req, res, 200, {
        message: `Sub Device ${id ? "Updated" : "Saved"} Successfully`,
      });
    } catch (error) {
      return this.jsonError(res, 400, this.__component, "wrong", error);
    }
  };

  public delete = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      if (id) {
        await this.collections.subDevices.deleteOne({
          _id: new ObjectId(id),
        });
        await this.appLog(req, this.__component, "Delete", new ObjectId(id));
        return this.json(req, res, 200, {
          message: `Sub Device Deleted Successfully`,
        });
      } else {
        return this.jsonError(res, 400, this.__component, "delete");
      }
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };
}
