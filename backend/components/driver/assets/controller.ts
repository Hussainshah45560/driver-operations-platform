import { ObjectId } from "mongodb";
import { BaseController } from "../../../core";
import { Filter_Options, Request, Response } from "../../../__types";
import { uploadDocument } from "../../../helpers/image";
import { Document } from "../../../models";
import { LicenseDisk } from "../../../helpers/licenseDisc";

export default class AssetController extends BaseController {
  public __component: string = "assets";
  private filter_options: Filter_Options = {
    search: ["name"],
    defaultSort: "_id",
    filters: {},
  };

  public list = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = req.user._id;
      const defaultFilter = {
        userId: userId,
      };
      this.getAggrigation(req, this.filter_options, defaultFilter);
      const [data, count] = await Promise.all([
        this.collections.assets
          .aggregate([
            ...req.aggregations,
            {
              $project: {
                _id: 1,
                make: 1,
                registrationNumber: 1,
                model: 1,
                engineNumber: 1,
                chassisNumber: 1,
                status: 1,
              },
            },
          ])
          .toArray(),
        this.collections.assets.aggregate(req.dbPagination).toArray(),
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
        this.collections.assets
          .aggregate([
            {
              $lookup: {
                from: "documents",
                localField: "documentIds",
                foreignField: "_id",
                as: "documents",
              },
            },
            ...req.aggregations,
            {
              $project: {
                _id: 1,
                registrationNumber: 1,
                make: 1,
                model: 1,
                engineNumber: 1,
                chassisNumber: 1,
                registrationDate: 1,
                licenseExpiryDate: 1,
                currentMileage: 1,
                color: 1,
                vehicleTypeId: 1,
                subDeviceIds: 1,
                accessoryIds: 1,
                tracking: 1,
                trackingSupplier: 1,
                documents: "$documents",
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

      if (FormBody.vehicleTypeId) {
        FormBody.vehicleTypeId = this.toObjectId(FormBody.vehicleTypeId);
      }
      const subDeviceIds =
        FormBody.subDeviceIds && Array.isArray(FormBody.subDeviceIds)
          ? FormBody.subDeviceIds.map((id: string) => new ObjectId(id))
          : [];
      const accessoryIds =
        FormBody.accessoryIds && Array.isArray(FormBody.accessoryIds)
          ? FormBody.accessoryIds.map((id: string) => new ObjectId(id))
          : [];

      const uploadedImages: any[] = [];
      if (
        req.files != null &&
        req.files != undefined &&
        Object.keys(req.files).length > 0
      ) {
        const filesArray = req.files;

        if (filesArray["image"]) {
          const documentType = global["config"].production
            ? "Documents"
            : ["png", "jpg", "jpeg", "pdf"];
          const existingDocOrPath = global["config"].production
            ? ""
            : "assets/";
          const imagePaths = await uploadDocument(
            filesArray["image"],
            documentType,
            existingDocOrPath,
          );

          const newDocument: Document = {
            _id: new ObjectId(),
            userId: req.user._id,
            type: "Asset",
            name: imagePaths[0].name ?? "",
            url: imagePaths[0].url ?? "",
            status: "uploaded",
          };
          const createdDocument = await this.collections.documents.insertOne(newDocument);
          uploadedImages.push(createdDocument.insertedId);
        }
      }
      if(FormBody.documentId && FormBody.documentId.length > 0){
        FormBody.documentId.forEach(element => {
          uploadedImages.push(this.toObjectId(element));
        });
      }
      const newAsset = {
        userId: req.user._id,
        registrationNumber: FormBody.registrationNumber,
        make: FormBody.make,
        model: FormBody.model,
        engineNumber: FormBody.engineNumber,
        chassisNumber: FormBody.chassisNumber,
        registrationDate: FormBody.registrationDate,
        licenseExpiryDate: FormBody.licenseExpiryDate,
        currentMileage: FormBody.currentMileage,
        color: FormBody.color,
        vehicleTypeId: FormBody.vehicleTypeId,
        accessoryIds,
        subDeviceIds,
        tracking: FormBody.tracking,
        trackingSupplier: FormBody.trackingSupplier,
        documentIds: uploadedImages,
        status: "awaiting inspection" as const,
      };
      if (id) {
        await this.collections.assets.updateOne(
          { _id: new ObjectId(id) },
          { $set: newAsset },
        );
        const app = await this.collections.applications.findOne({ userId: req.user._id });
        await this.collections.applications.updateOne(
          { _id: app?._id },
          { $set: { "stepStatus.step6": "confirmed" } },
        );
      } else {
        await this.collections.assets.insertOne({ _id: new ObjectId(), ...newAsset });
      }

      return this.json(req, res, 200, {
        message: `Asset ${id ? "Updated" : "Saved"} Successfully`,
      });
    } catch (error) {
      return this.jsonError(res, 400, this.__component, "wrong", error);
    }
  };

  public delete = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      if (id) {
        await this.collections.assets.deleteOne({
          _id: new ObjectId(id),
        });
        await this.appLog(req, this.__component, "Delete", new ObjectId(id));
        return this.json(req, res, 200, {
          message: `Asset Deleted Successfully`,
        });
      } else {
        return this.jsonError(res, 400, this.__component, "delete");
      }
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public verifyLicenseDisc = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      let path: string = "";
      if (
        req.files != null &&
        req.files != undefined &&
        Object.keys(req.files).length > 0
      ) {
        const filesArray = req.files;

        if (filesArray["licenseDisc"]) {
          const documentType = ["png", "jpg", "jpeg"];
          const existingDocOrPath = global["config"].production ? "" : "disc/";
          const imagePaths = await uploadDocument(
            filesArray["licenseDisc"],
            documentType,
            existingDocOrPath,
          );
          const newDocument: Document = {
            _id: new ObjectId(),
            userId: req.user._id,
            type: "License Disc",
            name: imagePaths[0].name ?? "",
            url: imagePaths[0].url ?? "",
            status: "uploaded",
          };
          const insertedDocument =
            await this.collections.documents.insertOne(newDocument);
          path = imagePaths[0].url ?? "";
          if (path != "") {
            const disc = new LicenseDisk();
            const result = await disc.verifyLicenseDisc(path);
            return this.json(req, res, 200, {
              data: { ...result[0].data, _id: insertedDocument.insertedId },
            });
          }
        }
      }
      return this.jsonError(res, 400, this.__component, "No file uploaded");
    } catch (error) {
      return this.jsonError(res, 400, this.__component, "wrong", error);
    }
  };
}
