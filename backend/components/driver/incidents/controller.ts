import { ObjectId } from "mongodb";
import { BaseController } from "../../../core";
import { Filter_Options, Request, Response } from "../../../__types";

export default class IncidentController extends BaseController {
  public __component: string = "incidents";
  private filter_options: Filter_Options = {
    search: ["name"],
    defaultSort: "_id",
    filters: {},
  };

  public list = async (req: Request, res: Response): Promise<Response> => {
    try {
      const defaultFilter = { isDeleted: { $ne: true } };
      if (
        req.user.role &&
        ["Applicant", "Driver"].includes(req.user.role?.name)
      ) {
        defaultFilter["userId"] = this.toObjectId(req.user._id);
      }
      this.getAggrigation(req, this.filter_options, defaultFilter);
      const [data, count] = await Promise.all([
        this.collections.incidents
          .aggregate([
            {
              $lookup: {
                from: "cmcTemplates",
                localField: "templateId",
                foreignField: "_id",
                as: "template",
              },
            },
            {
              $lookup: {
                from: "assets",
                localField: "assetId",
                foreignField: "_id",
                as: "asset",
              },
            },
            ...req.aggregations,
            {
              $project: {
                _id: 1,
                date: 1,
                status: 1,
                incidentUrl: 1,
                template: { $arrayElemAt: ["$template.name", 0] },
                asset: { $arrayElemAt: ["$asset.registrationNumber", 0] },
              },
            },
          ])
          .toArray(),
        this.collections.incidents.aggregate(req.dbPagination).toArray(),
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
      this.getAggrigation(req, this.filter_options, defaultFilter);
      const [data] = await Promise.all([
        this.collections.incidents
          .aggregate([
            ...req.aggregations,
            {
              $project: {
                _id: 1,
                templateId: 1,
                assetId: 1,
                date: 1,
                payload: 1,
                userId: 1,
                status: 1,
                notes: 1,
              },
            },
          ])
          .toArray(),
      ]);
      if (data && data.length > 0) {
        return this.json(req, res, 200, { data: data[0] });
      }
      return this.jsonError(res, 400, this.__component, "get");
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
      if (FormBody.templateId) {
        FormBody.templateId = this.toObjectId(FormBody.templateId);
      }
      if (FormBody.assetId) {
        FormBody.assetId = this.toObjectId(FormBody.assetId);
      }

      
      const incident = {
        userId:  this.toObjectId(FormBody.userId),
        date: FormBody.date,
        templateId: FormBody.templateId,
        assetId: FormBody.assetId,
        payload: FormBody.payload,
        status: FormBody.status,
        notes: FormBody.notes,
      };
      if (id) {
        await this.collections.incidents.updateOne(
          { _id: new ObjectId(id) },
          { $set: incident },
        );
      } else {
        const template = await this.collections.cmcTemplates.findOne({
          isDeleted: { $ne: true },
          _id: FormBody.templateId,
        });
        if (!template) {
          throw new Error("Template not found");
        }
        const data = {
            ...FormBody.payload,
            date: FormBody.date,
          };
          // Generate PDF
          const html = this.replaceTemplateData(template?.content || "", data);
          const pdfPath = await this.generatePdf(
            html,
            template.name + req.user._id + "-" + data.date+ ".pdf",
            "incidents",
          );
          
         const insertedIncident = await this.collections.incidents.insertOne({
            _id: new ObjectId(),
            ...incident,
            incidentUrl: pdfPath,
            status: FormBody.status || "in review",
          });

          const docs = await this.collections.documents.find({
            userId: this.toObjectId(FormBody.userId),
            type: { $eq: "Incident" },
          }).toArray();

          console.log(docs)
          for (const doc of docs) {
            await this.collections.documents.updateOne(
              { _id: doc._id },
              { $set: { incidentId: insertedIncident.insertedId } },
            );
          }
          
          const incidentDoc = {
            _id: new ObjectId(),
            userId: this.toObjectId(FormBody.userId),
            incidentId: insertedIncident.insertedId,
            name: template.name + " Incident Report",
            type: "Incident",
            url: pdfPath,
            status: "active" as const,
          };
          await this.collections.documents.insertOne(incidentDoc);

      }

      return this.json(req, res, 200, {
        message: `Incident ${id ? "Updated" : "Saved"} Successfully`,
      });
    } catch (error) {
      return this.jsonError(res, 400, this.__component, "wrong", error);
    }
  };

  public getTemplateFields = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const defaultFilter = { _id: new ObjectId(id) };

      const data = await this.collections.cmcTemplates.findOne(
        { ...defaultFilter },
        { projection: { fields: 1 } },
      );

      if (data) {
        return this.json(req, res, 200, { data: data.fields });
      }
      return this.jsonError(res, 400, this.__component, "get");
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public delete = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      if (id) {
        await this.collections.incidents.updateOne(
          { _id: new ObjectId(id) },
          { $set: { isDeleted: true } },
        );
        await this.appLog(req, this.__component, "Delete", new ObjectId(id));
        return this.json(req, res, 200, {
          message: `Incident Deleted Successfully`,
        });
      } else {
        return this.jsonError(res, 400, this.__component, "delete");
      }
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };
}
