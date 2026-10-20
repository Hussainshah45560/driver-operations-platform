import { ObjectId } from "mongodb";
import { BaseController } from "../../../core";
import { Filter_Options, Request, Response } from "../../../__types";

export default class EmploymentHistoryController extends BaseController {
  public __component: string = "employment-history";
  private filter_options: Filter_Options = {
    search: ["name"],
    defaultSort: "_id",
    filters: {},
  };

  public list = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { application_id } = req.query;
      const applicationId =
        typeof application_id === "string"
          ? this.toObjectId(application_id)
          : "";
      const defaultFilter = {
        applicationId: applicationId,
      };
      this.getAggrigation(req, this.filter_options, defaultFilter);
      const [data, count] = await Promise.all([
        this.collections.employmentHistories
          .aggregate([
            ...req.aggregations,
            {
              $project: {
                _id: 1,
                startDate: 1,
                endDate: 1,
                position: 1,
                type: 1,
                companyName: 1,
                jobDescription: 1,
                referenceName: 1,
                referenceContact: 1,
                referenceDesignation: 1,
              },
            },
          ])
          .toArray(),
        this.collections.employmentHistories
          .aggregate(req.dbPagination)
          .toArray(),
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
      const experience = await this.collections.employmentHistories.findOne(
        defaultFilter,
        {
          projection: {
            _id: 1,
            startDate: 1,
            endDate: 1,
            position: 1,
            type: 1,
            companyName: 1,
            jobDescription: 1,
            reasonForLeaving: 1,
            salary: 1,
            referenceName: 1,
            referenceContact: 1,
            referenceDesignation: 1,
          },
        }
      );
      if (experience) {
        return this.json(req, res, 200, { data: experience });
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
        const checkExperience =
          await this.collections.employmentHistories.findOne({
            _id: this.toObjectId(id),
          });
        if (!checkExperience) {
          return this.jsonError(
            res,
            400,
            this.__component,
            "Work Experience does not exist"
          );
        }
        const updateEmployment = {
          applicationId: this.toObjectId(FormBody.applicationId),
          companyName: FormBody.companyName,
          position: FormBody.position,
          jobDescription: FormBody.jobDescription,
          startDate: FormBody.startDate,
          endDate: FormBody.endDate,
          reasonForLeaving: FormBody.reasonForLeaving ?? "",
          salary: FormBody.salary,
          type: FormBody.type,
          referenceName: FormBody.referenceName ?? "",
          referenceContact: FormBody.referenceContact ?? "",
          referenceDesignation: FormBody.referenceDesignation ?? "",
        };
        await this.collections.employmentHistories.updateOne(
          { _id: checkExperience._id },
          {
            $set: {
              ...updateEmployment,
            },
          }
        );
      } else {
        const newEmployment = {
          _id: new ObjectId(),
          applicationId: this.toObjectId(FormBody.applicationId),
          companyName: FormBody.companyName,
          position: FormBody.position,
          jobDescription: FormBody.jobDescription,
          startDate: FormBody.startDate,
          endDate: FormBody.endDate,
          reasonForLeaving: FormBody.reasonForLeaving ?? "",
          salary: FormBody.salary,
          type: FormBody.type,
          referenceName: FormBody.referenceName ?? "",
          referenceContact: FormBody.referenceContact ?? "",
          referenceDesignation: FormBody.referenceDesignation ?? "",
        };
        await this.collections.employmentHistories.insertOne(newEmployment);
      }

      return this.json(req, res, 200, {
        message: `Work Experience ${id ? "Updated" : "Saved"} Successfully`,
      });
    } catch (error) {
      return this.jsonError(res, 400, this.__component, "wrong", error);
    }
  };

  public delete = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      if (id) {
        await this.collections.employmentHistories.deleteOne({
          _id: new ObjectId(id),
        });
        await this.appLog(req, this.__component, "Delete", new ObjectId(id));
        return this.json(req, res, 200, {
          message: `Work Experience Deleted Successfully`,
        });
      } else {
        return this.jsonError(res, 400, this.__component, "delete");
      }
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };
}
