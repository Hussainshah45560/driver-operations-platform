
import { BaseController } from "../../../core";
import { Filter_Options, Request, Response } from "../../../__types";

export default class BankingDetailsController extends BaseController {
  public __component: string = "bankingDetails";
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
      const userId = req.user._id;
      const defaultFilter = { userId: userId };
      this.getAggrigation(req, this.filter_options, defaultFilter);
      const [data] = await Promise.all([
        this.collections.userProfiles
          .aggregate([
            ...req.aggregations,
            {
              $project: {
                _id: 1,
                bankDetails: 1,
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
      const userId = req.user._id;
      const FormBody = req.body;

      const payload = {
        bankDetails: {
          ...FormBody.bankDetails,
          accountTypeId: this.toObjectId(FormBody.bankDetails.accountTypeId),
          bankNameId: this.toObjectId(FormBody.bankDetails.bankNameId),
        },
      };
      if (id == userId.toString()) {
        await this.collections.userProfiles.updateOne(
          { userId: userId },
          { $set: payload },
        );
        const app = await this.collections.applications.findOne({ userId: userId });
        await this.collections.applications.updateOne(
          { _id: app?._id },
          { $set: { "stepStatus.step1": "confirmed" } },
        );
      }

      return this.json(req, res, 200, {
        message: `Bank Detail Updated Successfully`,
      });
    } catch (error) {
      return this.jsonError(res, 400, this.__component, "wrong", error);
    }
  };
}
