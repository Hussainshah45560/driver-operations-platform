import { ObjectId } from "mongodb";
import { BaseController } from "../../../core/BaseController";
import { Filter_Options, Request, Response } from "../../../__types";

export default class EmailTypeController extends BaseController {
  public __component: string = "emailTypes";
  private readonly filter_options: Filter_Options = {
    search: ["title", "used_for"],
    defaultSort: "_id",
    filters: {},
  };

  public get = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const defaultFilter = { _id: new ObjectId(id) };
      const emailType = await this.collections.emailTypes.findOne(
        defaultFilter,
        {
          projection: {
            _id: 1,
            title: 1,
            used_for: 1,
            fields: 1,
          },
        }
      );
      if (emailType) {
        return this.json(req, res, 200, { data: emailType });
      }
      return this.jsonError(res, 400, this.__component, "get");
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "wrong", error);
    }
  };

  public list = async (req: Request, res: Response): Promise<Response> => {
    try {
      const defaultFilter = {};
      this.getAggrigation(req, this.filter_options, defaultFilter);
      const [data, count] = await Promise.all([
        this.collections.emailTypes.aggregate([...req.aggregations]).toArray(),
        this.collections.emailTypes.aggregate(req.dbPagination).toArray(),
      ]);
      return this.json(req, res, 200, { data, count: count });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "wrong", error);
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
        await this.collections.emailTypes?.updateOne(
          { _id: new ObjectId(id) },
          { $set: FormBody }
        );
        await this.appLog(
          req,
          this.__component,
          "Update",
          new ObjectId(id),
          FormBody
        );
      } else {
        const isTypeExist = await this.collections.emailTypes.findOne({
          used_for: FormBody.used_for,
        });
        if (isTypeExist) {
          return this.jsonError(
            res,
            400,
            this.__component,
            "Email Type already Exists"
          );
        }
        const createdEmailType = await this.collections.emailTypes?.insertOne({
          _id: new ObjectId(),
          ...FormBody,
        });
        await this.appLog(
          req,
          this.__component,
          "Create",
          createdEmailType.insertedId,
          FormBody
        );
      }
      return this.json(req, res, 200, {
        message: `Email Type ${id ? "Updated" : "Created"} Successfully`,
      });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "wrong", error);
    }
  };

  /* public delete = async (req: Request, res: Response): Promise<Response> => {
		try {
			const { id } = req.params;
			if (id) {
				await this.collections.emailTypes.updateOne({ _id: new ObjectId(id) },{$set:{}});
				return this.json(req, res, 200, { message: `Email Template Deleted Successfully` });
			} else {
				return this.jsonError(res, 400, this.__component, 'delete');
			}
		} catch (error) {
			return this.jsonError(res, 500, this.__component, "invalid", error);
		}
	}; */
}
