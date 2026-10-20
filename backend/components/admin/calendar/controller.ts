import { ObjectId } from "mongodb";
import { BaseController } from "../../../core";
import { Filter_Options, Request, Response } from "../../../__types";

export default class CalendarController extends BaseController {
  public __component: string = "calendars";
  private filter_options: Filter_Options = {
    search: ["name", "calendlyAddress"],
    defaultSort: "_id",
    filters: {},
  };

  public list = async (req: Request, res: Response): Promise<Response> => {
    try {
      this.getAggrigation(req, this.filter_options);
      const [data, count] = await Promise.all([
        this.collections.calendars
          .aggregate([
            ...req.aggregations,
            {
              $project: {
                _id: 1,
                name: 1,
                calendlyAddress: 1,
                isActive: 1,
              },
            },
          ])
          .toArray(),
        this.collections.calendars.aggregate(req.dbPagination).toArray(),
      ]);
      return this.json(req, res, 200, { data, count: count });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public get = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const calendars = await this.collections.calendars.findOne(
        { _id: new ObjectId(id) },
        {
          projection: {
            _id: 1,
            name: 1,
            calendlyAddress: 1,
            isActive: 1,
          },
        }
      );

      if (calendars) {
        return this.json(req, res, 200, { data: calendars });
      }
      return this.jsonError(res, 404, this.__component, "get");
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
        await this.collections.calendars.updateOne(
          { _id: new ObjectId(id) },
          { $set: { ...FormBody } }
        );

        await this.appLog(
          req,
          this.__component,
          "Update",
          new ObjectId(id),
          FormBody
        );
      } else {
        const isExist = await this.collections.calendars.findOne({
          name: FormBody.name,
        });

        if (isExist) {
          return this.jsonError(
            res,
            400,
            this.__component,
            "Calendar with same name already exists"
          );
        }
        const created = await this.collections.calendars.insertOne({
          _id: new ObjectId(),
          ...FormBody,
          isActive: true,
        });

        await this.appLog(
          req,
          this.__component,
          "Create",
          created.insertedId,
          FormBody
        );
      }

      return this.json(req, res, 200, {
        message: `Calendar ${id ? "updated" : "created"} successfully`,
      });
    } catch (error) {
      return this.jsonError(res, 400, this.__component, "wrong", error);
    }
  };

  public setCalendarStatus = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      if (id) {
        const calendar = await this.collections.calendars.findOne({
          _id: new ObjectId(id),
        });
        if (!calendar) {
          return this.jsonError(
            res,
            400,
            this.__component,
            "Calendar does not exist"
          );
        }
        await this.collections.calendars.updateOne(
          {
            _id: calendar._id,
          },
          { $set: { isActive: !calendar.isActive } }
        );
        await this.appLog(
          req,
          this.__component,
          "Active Calendar",
          new ObjectId(id)
        );
        return this.json(req, res, 200, {
          message: `Calendar ${
            !calendar.isActive ? "Activated" : "Deactivated"
          } Successfully`,
        });
      } else {
        return this.jsonError(
          res,
          400,
          this.__component,
          "activate/deactivate"
        );
      }
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public delete = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      if (id) {
        await this.collections.calendars.deleteOne({ _id: new ObjectId(id) });
        await this.appLog(req, this.__component, "Delete", new ObjectId(id));
        return this.json(req, res, 200, {
          message: `Calendar deleted successfully`,
        });
      } else {
        return this.jsonError(res, 400, this.__component, "delete");
      }
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };
}
