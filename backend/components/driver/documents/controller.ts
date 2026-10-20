import { ObjectId } from "mongodb";
import { BaseController } from "../../../core";
import { Filter_Options, Request, Response } from "../../../__types";
import { uploadDocument } from "../../../helpers/image";
import { Document } from "../../../models";
import { SelfieCheck } from "../../../helpers/selfieCheck";


export default class DocumentController extends BaseController {
  public __component: string = "documents";
  private readonly d: Date = new Date();
  private filter_options: Filter_Options = {
    search: ["name"],
    defaultSort: "_id",
    filters: {},
  };

  public list = async (req: Request, res: Response): Promise<Response> => {
    try {
      const {
        user_id,
        customer_id,
        disciplinary_id,
        type,
        incident_id,
        doc_name,
      } = req.query;
      const defaultFilter: any = {};
      const userId =
        typeof user_id === "string" ? this.toObjectId(user_id) : "";
      const customerId =
        typeof customer_id === "string" ? this.toObjectId(customer_id) : "";
      const disciplinaryId =
        typeof disciplinary_id === "string"
          ? this.toObjectId(disciplinary_id)
          : "";
      const incidentId =
        typeof incident_id === "string" ? this.toObjectId(incident_id) : "";

      const orConditions: any = [];

      if (userId) {
        orConditions.push({ userId });
      }

      if (customerId) {
        orConditions.push({ customerId });
      }
      if (disciplinaryId) {
        orConditions.push({ disciplinaryId });
      }
      if (incidentId) {
        orConditions.push({ incidentId });
      }

      if (orConditions.length > 0) {
        defaultFilter.$and = orConditions;
      }

      if (type) {
        defaultFilter.type = type;
      }
      else{
        defaultFilter.type = { $nin: ["Incident", "Warning", "Hearing", "Dispute", "Contract"] };
      }
      if (doc_name) {
        defaultFilter.name = { $regex: new RegExp(doc_name as string, "i") };
      }

      this.getAggrigation(req, this.filter_options, defaultFilter);
      const [data, count] = await Promise.all([
        this.collections.documents
          .aggregate([
            ...req.aggregations,
            {
              $project: {
                _id: 1,
                name: 1,
                type: 1,
                url: 1,
                applicationId: 1,
                userId: 1,
                customerId: 1,
                disciplinaryId: 1,
                incidentId: 1,
                status: 1,
                updatedAt: 1,
                deleteAllowedUntil:1
              },
            },
          ])
          .toArray(),
        this.collections.documents.aggregate(req.dbPagination).toArray(),
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
      const document = await this.collections.documents.findOne(defaultFilter, {
        projection: {
          _id: 1,
          name: 1,
          type: 1,
          url: 1,
          status: 1,
        },
      });
      if (document) {
        return this.json(req, res, 200, { data: document });
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
      const FormBody = req.body;
      if (
        req.files != null &&
        req.files != undefined &&
        Object.keys(req.files).length > 0
      ) {
        const filesArray = req.files;
        let documentDirectory = "documents/";
        if (filesArray["document"]) {
          if (FormBody.type == "Contract") {
            documentDirectory = "contracts/";
            await this.collections.applications.updateOne(
              { userId: this.toObjectId(FormBody.userId) },
              { $set: { applicationStatus: "in contract" } },
            );
          }

          const documentType = global["config"].production
            ? "Document"
            : ["png", "jpg", "jpeg", "pdf"];
          const path = global["config"].production ? "" : documentDirectory;
          const documentPaths = await uploadDocument(
            filesArray["document"],
            documentType,
            path,
          );
          if (documentPaths.length > 0) {
            const newDocument: Document = {
              _id: new ObjectId(),
              type: FormBody.type,
              name: documentPaths[0].name ?? "",
              url: documentPaths[0].url ?? "",
              status: "uploaded",
            };
            if (FormBody?.userId) {
              newDocument.userId = this.toObjectId(FormBody.userId);
            }
            if (FormBody?.applicationId) {
              newDocument.applicationId = this.toObjectId(
                FormBody.applicationId,
              );
            }
            if (FormBody?.recruitmentId) {
              newDocument.recruitmentId = this.toObjectId(
                FormBody.recruitmentId,
              );
            }
            if (FormBody?.customerId) {
              newDocument.customerId = this.toObjectId(FormBody.customerId);
            }
            if (FormBody?.disciplinaryId) {
              newDocument.disciplinaryId = this.toObjectId(
                FormBody.disciplinaryId,
              );
            }
            const addFields = { createdAt: this.d, updatedAt:this.d, deleteAllowedUntil: new Date(Date.now() + 2 * 60 * 1000) };
            const insertedDocument =
              await this.collections.documents.insertOne({ ...newDocument, ...addFields });
            if (FormBody.type == "Selfie") {
              const selfie = await this.collections.documents.findOne({
                _id: insertedDocument.insertedId,
              });
              if (selfie && selfie.url) {
                const selfieCheck = new SelfieCheck();
                const selfieResult = await selfieCheck.verifySelfie(selfie.url);
                if (selfieResult.result === "fail" || selfieResult.success === false) {
                  await this.collections.documents.deleteOne({ _id: insertedDocument.insertedId });
                  return this.jsonError(
                    res,
                    400,
                    this.__component,
                    selfieResult.message,
                  );
                }else{
                  await this.collections.documents.updateOne(
                    { _id: insertedDocument.insertedId },
                    { $set: { url: selfieResult.payload.face_crop_base64, original_url: selfieResult.payload.corrected_image_base64 } },
                  );
                }
              }
            }
          }
        }
      }

      return this.json(req, res, 200, {
        message: `Document uploaded Successfully`,
      });
    } catch (error) {
      return this.jsonError(res, 400, this.__component, "wrong", error);
    }
  };

  public delete = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      if (id) {
        const document = await this.collections.documents.findOne({
          _id: this.toObjectId(id),
        });
        if (document) {
          this.deleteFile(document.url);
          await this.collections.documents.deleteOne({ _id: new ObjectId(id) });
          await this.appLog(req, this.__component, "Delete", new ObjectId(id));
        }
        return this.json(req, res, 200, {
          message: `Document Deleted Successfully`,
        });
      } else {
        return this.jsonError(res, 400, this.__component, "delete");
      }
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };
}
