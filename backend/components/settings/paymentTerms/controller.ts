import { ObjectId } from "mongodb";
import { BaseController } from "../../../core";
import { Filter_Options, Request, Response } from "../../../__types";

export default class PaymentTermController extends BaseController {
  public __component: string = "paymentTerms";
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
        this.collections.paymentTerms
          .aggregate([
            ...req.aggregations,
            {
              $project: {
                _id: 1,
                name: 1,
              },
            },
          ])
          .toArray(),
        this.collections.paymentTerms.aggregate(req.dbPagination).toArray(),
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
      const paymentTerm = await this.collections.paymentTerms.findOne(
        defaultFilter,
        {
          projection: {
            _id: 1,
            name: 1,
          },
        }
      );
      if (paymentTerm) {
        return this.json(req, res, 200, { data: paymentTerm });
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
        const isExist = await this.collections.paymentTerms.findOne({
          _id: this.toObjectId(id),
        });
        if (!isExist) {
          return this.jsonError(
            res,
            400,
            this.__component,
            "Payment term does not exist"
          );
        }
        await this.collections.paymentTerms.updateOne(
          { _id: isExist._id },
          {
            $set: {
              ...FormBody,
            },
          }
        );
      } else {
        await this.collections.paymentTerms.insertOne({
          _id: new ObjectId(),
          ...FormBody,
        });
      }

      return this.json(req, res, 200, {
        message: `Payment term ${id ? "Updated" : "Saved"} Successfully`,
      });
    } catch (error) {
      return this.jsonError(res, 400, this.__component, "wrong", error);
    }
  };

  public delete = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      if (id) {
        await this.collections.paymentTerms.deleteOne({
          _id: new ObjectId(id),
        });
        await this.appLog(req, this.__component, "Delete", new ObjectId(id));
        return this.json(req, res, 200, {
          message: `Payment term Deleted Successfully`,
        });
      } else {
        return this.jsonError(res, 400, this.__component, "delete");
      }
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };
}
