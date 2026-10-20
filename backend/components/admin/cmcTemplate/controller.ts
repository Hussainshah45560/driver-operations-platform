import { ObjectId } from "mongodb";
import { BaseController } from "../../../core";
import { Filter_Options, Request, Response } from "../../../__types";

export default class CMCTemplateController extends BaseController {
  public __component: string = "cmcTemplates";
  private filter_options: Filter_Options = {
    search: ["name", "documentName"],
    defaultSort: "_id",
    filters: {},
  };

  public list = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const defaultFilter = {
        isDeleted: { $ne: true },
        templateTypeId: this.toObjectId(id),
      };
      this.getAggrigation(req, this.filter_options, defaultFilter);
      const [data, count] = await Promise.all([
        this.collections.cmcTemplates
          .aggregate([
            // {
            //   $lookup: {
            //     from: "templateTypes",
            //     localField: "templateTypeId",
            //     foreignField: "_id",
            //     as: "templateType",
            //   },
            // },
            {
              $lookup: {
                from: "customers",
                localField: "customerId",
                foreignField: "_id",
                as: "customer",
              },
            },
            ...req.aggregations,
            {
              $project: {
                _id: 1,
                name: 1,
                // templateTypeId: 1,
                // templateType: { $arrayElemAt: ["$templateType.title", 0] },
                documentName: 1,
                isActive: 1,
                customerName: { $arrayElemAt: ["$customer.name", 0] },
              },
            },
          ])
          .toArray(),
        this.collections.cmcTemplates.aggregate(req.dbPagination).toArray(),
      ]);
      return this.json(req, res, 200, { data, count: count });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public get = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const cmcTemplate = await this.collections.cmcTemplates.findOne(
        { _id: new ObjectId(id) },
        {
          projection: {
            _id: 1,
            name: 1,
            description: 1,
            documentTypeId: 1,
            documentName: 1,
            isActive: 1,
            content: 1,
            customerId: 1,
            fields:1,
            signPlatform:1
          },
        },
      );

      if (cmcTemplate) {
        return this.json(req, res, 200, { data: cmcTemplate });
      }
      return this.jsonError(res, 404, this.__component, "get");
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getTemplateByCode = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      let template;
      const { used_for, template_id } = req.query;
      const templateId =
        typeof template_id == "string"
          ? this.toObjectId(template_id)
          : template_id;
      const templateType = await this.collections.templateTypes.findOne(
        { used_for: used_for },
        {
          projection: {
            _id: 1,
          },
        },
      );
      if (templateType) {
        template = await this.collections.cmcTemplates.findOne(
          { templateTypeId: templateType?._id, isActive: true },
          {
            projection: {
              _id: 1,
              name: 1,
              content: 1,
            },
          },
        );
      } else {
        template = await this.collections.cmcTemplates.findOne(
          { _id: templateId, isActive: true },
          {
            projection: {
              _id: 1,
              name: 1,
              content: 1,
            },
          },
        );
      }

      if (template) {
        return this.json(req, res, 200, { data: template });
      }
      return this.jsonError(res, 404, this.__component, "get");
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public createOrUpdate = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const FormBody = req.body;
      const updateData = {
        ...FormBody,
        templateTypeId: this.toObjectId(FormBody.templateTypeId),
        documentTypeId: FormBody.documentTypeId
          ? this.toObjectId(FormBody.documentTypeId)
          : undefined,
      };
      if (FormBody.customerId != "") {
        updateData["customerId"] = this.toObjectId(FormBody.customerId);
      }
      if(FormBody.fields && FormBody.fields.length > 0){
        updateData["fields"] =FormBody.fields;
      }
      const { _id, ...rest } = updateData;

      if (id) {
        await this.collections.cmcTemplates.updateOne(
          { _id: new ObjectId(id) },
          {
            $set: rest,
          },
        );
        await this.appLog(
          req,
          this.__component,
          "Update",
          new ObjectId(id),
          FormBody,
        );
      } else {
        // const isExist = await this.collections.cmcTemplates.findOne({
        //   documentName: FormBody.documentName,
        // });
        // if (isExist) {
        //   return this.jsonError(
        //     res,
        //     400,
        //     this.__component,
        //     "Template already exists with same documentName",
        //   );
        // }
        FormBody.isActive = true;
        const created = await this.collections.cmcTemplates.insertOne({
          _id: new ObjectId(),
          ...updateData,
          isActive: true,
        });
        await this.appLog(
          req,
          this.__component,
          "Create",
          created.insertedId,
          FormBody,
        );
      }
      return this.json(req, res, 200, {
        message: `Template ${id ? "Updated" : "Created"} Successfully`,
      });
    } catch (error) {
      return this.jsonError(res, 400, this.__component, "wrong", error);
    }
  };

  public setTemplateStatus = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      if (id) {
        const cmcTemplate = await this.collections.cmcTemplates.findOne({
          _id: new ObjectId(id),
        });
        if (!cmcTemplate) {
          return this.jsonError(
            res,
            400,
            this.__component,
            "Template does not exist",
          );
        }
        await this.collections.cmcTemplates.updateOne(
          {
            _id: cmcTemplate._id,
          },
          { $set: { isActive: !cmcTemplate.isActive } },
        );
        await this.appLog(
          req,
          this.__component,
          "Active Template",
          new ObjectId(id),
        );
        return this.json(req, res, 200, {
          message: `Template ${
            !cmcTemplate.isActive ? "Activated" : "Deactivated"
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
        await this.collections.cmcTemplates.updateOne(
          {
            _id: new ObjectId(id),
          },
          { $set: { isDeleted: true } },
        );
        await this.appLog(req, this.__component, "Delete", new ObjectId(id));
        return this.json(req, res, 200, {
          message: `Template Deleted Successfully`,
        });
      } else {
        return this.jsonError(res, 400, this.__component, "delete");
      }
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getTemplateCategory = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const defaultFilter = {};
      this.getAggrigation(req, this.filter_options, defaultFilter, false);
      const [data] = await Promise.all([
        this.collections.templateTypes
          .aggregate([
            ...req.aggregations,
            {
              $lookup: {
                from: "cmcTemplates",
                let: { templateId: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$templateTypeId", "$$templateId"] }, // ✅ FIXED
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
      const result = await this.collections.templateTypes.findOne(
        defaultFilter,
        {
          projection: {
            _id: 1,
            used_for: 1,
            fields: 1,
          },
        },
      );
      return this.json(req, res, 200, { data: result });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "wrong", error);
    }
  };
}
