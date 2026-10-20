
import { BaseController } from "../../../core";
import { Request, Response } from "../../../__types";


export default class RecruitmentController extends BaseController {
  public __component: string = "jobs";

  public get = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const defaultFilter = { _id: this.toObjectId(id) };
      const job = await this.collections.recruitments.findOne(
        defaultFilter,
        {
          projection: {
            _id: 1,
            customerId: 1,
            regionId: 1,
            areaIds: 1,
            site: 1,
            recruitmentTypeId: 1,
            recruitmentModelId: 1,
            model: 1,
            availablePositions: 1,
            jobType: 1,
            jobTitle: 1,
            jobDescription: 1,
            startDate: 1,
            isEndDate: 1,
            endDate: 1,
            skillIds: 1,
            costCenterIds: 1,
            status: 1,
            isInductionRequired: 1,
            requestNumber: 1,
          },
        }
      );

      if (job) {
        return this.json(req, res, 200, { data: job });
      }
      return this.jsonError(res, 400, this.__component, "get");
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

   public getCustomerCostCenters = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { customerId } = req.params;
      if (customerId) {
        const customerCostCenters = await this.collections.customers
          .aggregate([
            { $match: { _id: this.toObjectId(customerId) } },
            {
              $lookup: {
                from: "costCenters",
                localField: "costCenterIds",
                foreignField: "_id",
                as: "costCenters",
              },
            },
            { $unwind: "$costCenters" },
            {
              $project: {
                value: "$costCenters._id",
                name: "$costCenters.name",
              },
            },
          ])
          .toArray();

        return this.json(req, res, 200, { data: customerCostCenters });
      } else {
        return this.jsonError(
          res,
          400,
          this.__component,
          "Cost centers not found"
        );
      }
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  
}
