import { ObjectId } from "mongodb";
import { BaseController } from "../../../core";
import { Filter_Options, Request, Response } from "../../../__types";

export default class DisciplinaryTypeController extends BaseController {
  public __component: string = "disciplinaryTypes";
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
        this.collections.disciplinaryTypes
          .aggregate([
            ...req.aggregations,
            {
              $project: {
                _id: 1,
                name: 1,
                type: 1,
              },
            },
          ])
          .toArray(),
        this.collections.disciplinaryTypes.aggregate(req.dbPagination).toArray(),
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
      const disciplinaryType = await this.collections.disciplinaryTypes.findOne(
        defaultFilter,
        {
          projection: {
            _id: 1,
            name: 1,
            type: 1,
          },
        }
      );
      if (disciplinaryType) {
        return this.json(req, res, 200, { data: disciplinaryType });
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
        const isExist = await this.collections.disciplinaryTypes.findOne({
          _id: this.toObjectId(id),
        });
        if (!isExist) {
          return this.jsonError(
            res,
            400,
            this.__component,
            "Disciplinary type does not exist"
          );
        }
        await this.collections.disciplinaryTypes.updateOne(
          { _id: isExist._id },
          {
            $set: {
              ...FormBody,
            },
          }
        );
      } else {
        await this.collections.disciplinaryTypes.insertOne({
          _id: new ObjectId(),
          ...FormBody,
        });
      }

      return this.json(req, res, 200, {
        message: `Disciplinary type ${id ? "updated" : "saved"} successfully`,
      });
    } catch (error) {
      return this.jsonError(res, 400, this.__component, "wrong", error);
    }
  };

  public delete = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      if (id) {
        await this.collections.disciplinaryTypes.deleteOne({
          _id: new ObjectId(id),
        });
        await this.appLog(req, this.__component, "Delete", new ObjectId(id));
        return this.json(req, res, 200, {
          message: `Disciplinary type deleted successfully`,
        });
      } else {
        return this.jsonError(res, 400, this.__component, "delete");
      }
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };
}
