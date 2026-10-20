import { ObjectId } from "mongodb";
import { BaseController } from "../../../core/BaseController";
import { Filter_Options, Response, Request } from "../../../__types";

export default class EmailTemplateController extends BaseController {
  public __component: string = "emailTemplates";
  private readonly filter_options: Filter_Options = {
    search: ["name", "subject"],
    defaultSort: "_id",
    filters: {},
  };

  public list = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const defaultFilter = {
        isDeleted: { $ne: true },
        emailTypeId: this.toObjectId(id),
      };
      this.getAggrigation(req, this.filter_options, defaultFilter, false);
      const [data, count] = await Promise.all([
        this.collections.emailTemplates
          .aggregate([
            ...req.aggregations,
            {
              $project: {
                _id: 1,
                name: 1,
                subject: 1,
                emailTypeId: 1,
                isActive: 1,
              },
            },
          ])
          .toArray(),
        this.collections.emailTemplates.aggregate(req.dbPagination).toArray(),
      ]);
      return this.json(req, res, 200, { data, count: count });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "wrong", error);
    }
  };

  public get = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const defaultFilter = { _id: new ObjectId(id) };
      const emailTemplate = await this.collections.emailTemplates.findOne(
        defaultFilter,
        {
          projection: {
            _id: 1,
            emailTypeId: 1,
            name: 1,
            subject: 1,
            sendTo: 1,
            description: 1,
            content: 1,
            isActive: 1,
          },
        },
      );
      if (emailTemplate) {
        return this.json(req, res, 200, { data: emailTemplate });
      }
      return this.jsonError(res, 400, this.__component, "get");
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "wrong", error);
    }
  };

  public getFieldByTypeId = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { emailTypeId } = req.params;
      const defaultFilter = { _id: new ObjectId(emailTypeId) };
      const result = await this.collections.emailTypes.findOne(defaultFilter, {
        projection: {
          _id: 1,
          used_for: 1,
          fields: 1,
        },
      });
      return this.json(req, res, 200, { data: result });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "wrong", error);
    }
  };

  public createOrUpdate = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const FormBody = req.body;
      const emailTypeId =
        typeof FormBody.emailTypeId === "string"
          ? this.toObjectId(FormBody.emailTypeId)
          : FormBody.emailTypeId;
      if (id) {
        const { emailTypeId: _discard, ...rest } = FormBody;
        await this.collections.emailTemplates?.updateOne(
          { _id: new ObjectId(id) },
          { $set: { emailTypeId, ...rest } },
        );
        await this.appLog(
          req,
          this.__component,
          "Update",
          new ObjectId(id),
          FormBody,
        );
      } else {
        await this.collections.emailTemplates?.updateMany(
          { emailTypeId: this.toObjectId(FormBody.emailTypeId) },
          { $set: { isActive: false } },
        );
        const createdEmailTemplate =
          await this.collections.emailTemplates?.insertOne({
            _id: new ObjectId(),
            ...FormBody,
            emailTypeId,
            isActive: true,
          });
        await this.appLog(
          req,
          this.__component,
          "Create",
          createdEmailTemplate.insertedId,
          FormBody,
        );
      }
      return this.json(req, res, 200, {
        message: `Email Template ${id ? "Updated" : "Created"} Successfully`,
      });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "wrong", error);
    }
  };

  public setEmailStatus = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const FormBody = req.body;
      if (id) {
        const emailTemplate = await this.collections.emailTemplates.findOne({
          _id: new ObjectId(id),
        });
        if (!emailTemplate) {
          return this.jsonError(
            res,
            400,
            this.__component,
            "Email Template does not exist",
          );
        }
        if (FormBody.emailTypeId) {
          await this.collections.emailTemplates?.updateMany(
            { emailTypeId: this.toObjectId(FormBody.emailTypeId) },
            { $set: { isActive: false } },
          );
          await this.collections.emailTemplates?.updateOne(
            { _id: this.toObjectId(id) },
            { $set: { isActive: true } },
          );
        }
        await this.appLog(
          req,
          this.__component,
          "Active Template",
          new ObjectId(id),
        );
        return this.json(req, res, 200, {
          message: `Email Template ${
            !emailTemplate.isActive ? "Activated" : "Deactivated"
          } Successfully`,
        });
      } else {
        return this.jsonError(
          res,
          400,
          this.__component,
          "activate/deactivate",
        );
      }
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "wrong", error);
    }
  };

  public delete = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      if (id) {
        await this.collections.emailTemplates.updateOne(
          {
            _id: new ObjectId(id),
          },
          { $set: { isDeleted: true } },
        );
        await this.appLog(req, this.__component, "Delete", new ObjectId(id));
        return this.json(req, res, 200, {
          message: `Email Template Deleted Successfully`,
        });
      } else {
        return this.jsonError(res, 400, this.__component, "delete");
      }
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getEmailCategory = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const defaultFilter = {};
      this.getAggrigation(req, this.filter_options, defaultFilter, false);
      const [data] = await Promise.all([
        this.collections.emailTypes
          .aggregate([
            ...req.aggregations,
            {
              $lookup: {
                from: "emailTemplates",
                let: { templateId: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$emailTypeId", "$$templateId"] }, // ✅ FIXED
                          {
                            $or: [
                              { $eq: ["$isDeleted", false] },
                              { $not: ["$isDeleted"] }, // ✅ include if field doesn't exist
                            ],
                          },
                        ],
                      },
                    },
                  },
                ],
                as: "templates",
              },
            },
            {
              $project: {
                _id: 1,
                title: 1,
                count: { $size: "$templates" },
              },
            },
            {
              $sort: { title: 1 },
            },
          ])
          .toArray(),
      ]);
      return this.json(req, res, 200, { data });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "wrong", error);
    }
  };

  public getFieldByCategory = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const defaultFilter = { _id: new ObjectId(id) };
      const result = await this.collections.emailTypes.findOne(defaultFilter, {
        projection: {
          _id: 1,
          used_for: 1,
          fields: 1,
        },
      });
      return this.json(req, res, 200, { data: result });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "wrong", error);
    }
  };
}
