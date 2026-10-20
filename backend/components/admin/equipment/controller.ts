import { ObjectId } from "mongodb";
import { BaseController } from "../../../core";
import { Filter_Options, Request, Response } from "../../../__types";

export default class EquipmentController extends BaseController {
  public __component: string = "equipments";
  private filter_options: Filter_Options = {
    search: ["candidateName", "contactNumber"],
    defaultSort: "candidateName",
    filters: {},
  };
  
public list = async (req: Request, res: Response): Promise<Response> => {
  try {
    const defaultFilter = { isDeleted: { $ne: true } };
    this.getAggrigation(req, this.filter_options, defaultFilter);

    const [data, count] = await Promise.all([
      this.collections.equipments
        .aggregate([
          // {
          //   $lookup: {
          //     from: "profiles",
          //     localField: "profileId",
          //     foreignField: "_id",
          //     as: "profile",
          //   },
          // },
          ...req.aggregations,
          {
            $project: {
              _id: 1,
              candidateName: 1,
              contactNumber: 1,
              status: 1,
              issueDate: 1,
              returnDate: 1,
              equipmentCount: { $size: "$equipmentIds" },
              equipmentNames: "$equipmentList.name",
            },
          },
        ])
        .toArray(),
      this.collections.equipments
        .aggregate([...req.aggregations, ...(req.dbPagination || [])])
        .toArray(),
    ]);

    return this.json(req, res, 200, { data, count });
  } catch (error) {
    return this.jsonError(res, 500, this.__component, "invalid", error);
  }
};

public get = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return this.jsonError(res, 400, this.__component, "Invalid ID");
    }

    const record = await this.collections.equipments.findOne(
      { _id: this.toObjectId(id) },
      {
        projection: {
          _id: 1,
          profileId: 1,
          recruitmentId: 1,
          candidateName: 1,
          contactNumber: 1,
          status: 1,
          issueDate: 1,
          returnDate: 1,
          equipmentIds: 1,
        },
      }
    );

    if (!record) {
      return this.jsonError(res, 404, this.__component, "Record Not Found");
    }

    return this.json(req, res, 200, { data: record });
  } catch (error) {
    return this.jsonError(res, 500, this.__component, "invalid", error);
  }
};

public createOrUpdate = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const FormBody = req.body;

    const payload: any = {
      candidateName: FormBody.candidateName,
      contactNumber: FormBody.contactNumber,
      status: FormBody.status,
      issueDate: FormBody.issueDate,
      returnDate: FormBody.returnDate,
      profileId: FormBody.profileId ? this.toObjectId(FormBody.profileId) : undefined,
      recruitmentId: FormBody.recruitmentId ? this.toObjectId(FormBody.recruitmentId) : undefined,
      equipmentIds: FormBody.equipmentIds?.map((e: string) => this.toObjectId(e)) || [],
    };

    if (id) {
      const existing = await this.collections.equipments.findOne({ _id: this.toObjectId(id) });
      if (!existing) {
        return this.jsonError(res, 400, this.__component, "Equipment does not exist");
      }
      await this.collections.equipments.updateOne({ _id: existing._id }, { $set: payload });
    } else {
      await this.collections.equipments.insertOne({
        _id: new ObjectId(),
        ...payload,
      });
    }

    return this.json(req, res, 200, {
      message: `Equipment ${id ? "Updated" : "Saved"} Successfully`,
    });
  } catch (error) {
    return this.jsonError(res, 400, this.__component, "wrong", error);
  }
};

public delete = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    if (!id) {
      return this.jsonError(res, 400, this.__component, "delete");
    }

    const equipment = await this.collections.equipments.findOne({ _id: this.toObjectId(id) });
    if (!equipment) {
      return this.jsonError(res, 400, this.__component, "Equipment does not exist");
    }

    await this.collections.equipments.updateOne(
      { _id: equipment._id },
      { $set: { isDeleted: true } }
    );

    await this.appLog(req, this.__component, "Delete", this.toObjectId(id));

    return this.json(req, res, 200, { message: "Equipment Deleted Successfully" });
  } catch (error) {
    return this.jsonError(res, 500, this.__component, "invalid", error);
  }
};
}
