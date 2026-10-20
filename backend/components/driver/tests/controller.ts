import { ObjectId } from "mongodb";
import { BaseController } from "../../../core";
import { Filter_Options, Request, Response } from "../../../__types";

export default class TestController extends BaseController {
  public __component: string = "tests";
  private filter_options: Filter_Options = {
    search: ["name"],
    defaultSort: "_id",
    filters: {},
  };

  public list = async (req: Request, res: Response): Promise<Response> => {
    try {
      console.log(req.query)
      const defaultFilter = {};
      if (
        req.user.role &&
        ["Applicant", "Driver", "Other"].includes(req.user.role?.name)
      ) {
        defaultFilter["userId"] = this.toObjectId(req.user._id);
      }
      this.getAggrigation(req, this.filter_options, defaultFilter);
      const [data, count] = await Promise.all([
        this.collections.tests
          .aggregate([
            {
              $lookup: {
                from: "testTypes",
                localField: "testTypeId",
                foreignField: "_id",
                as: "testType",
              },
            },
            {
              $lookup: {
                from: "userProfiles",
                localField: "userId",
                foreignField: "userId",
                as: "profile",
              },
            },
            ...req.aggregations,
            {
              $project: {
                _id: 1,
                time: 1,
                date: 1,
                testType: { $arrayElemAt: ["$testType.name", 0] },
                name: {
                  $concat: [
                    { $arrayElemAt: ["$profile.firstName", 0] },
                    " ",
                    { $arrayElemAt: ["$profile.lastName", 0] },
                  ],
                },
                status: 1,
              },
            },
          ])
          .toArray(),
        this.collections.tests.aggregate(req.dbPagination).toArray(),
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
        this.collections.tests
          .aggregate([
            {
              $lookup: {
                from: "testTypes",
                localField: "testTypeId",
                foreignField: "_id",
                as: "testTypeData",
              },
            },
            /* {
              $addFields: {
                timeSlot: {
                  $map: {
                    input: "$timeSlot",
                    as: "slot",
                    in: {
                      $mergeObjects: [
                        "$$slot",
                        {
                          testTypeName: {
                            $arrayElemAt: ["$testTypeData.name", 0],
                          },
                        },
                      ],
                    },
                  },
                },
              },
            }, */
            ...req.aggregations,
            {
              $project: {
                _id: 1,
                time: 1,
                date: 1,
                status: 1,
                testTypeId: 1,
                testTypeName: {
                  $arrayElemAt: ["$testTypeData.name", 0],
                },
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

  /* public getSlots = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { date, type_id } = req.query;
      if (typeof date !== "string" || typeof type_id !== "string") {
        return res.status(400).json({ message: "Invalid query parameters" });
      }
      const testTypeId =
        typeof type_id === "string" ? this.toObjectId(type_id) : type_id;
      const slotDate = new Date(date);
      let slots = await this.collections.timeSlots
        .find({ date: slotDate, testTypeId: testTypeId })
        .toArray();
      if (slots.length === 0) {
        const newSlots = this.generateSlots(date, testTypeId);

        await this.collections.timeSlots.insertMany(newSlots);

        slots = await this.collections.timeSlots
          .find({ date: slotDate, testTypeId: testTypeId })
          .toArray();
      }
      if (slots && slots.length > 0) {
        return this.json(req, res, 200, { data: slots });
      }
      return this.jsonError(res, 400, this.__component, "get");
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  }; */

  public createOrUpdate = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const FormBody = req.body;

      // if (FormBody.slotId) {
      //   FormBody.slotId = this.toObjectId(FormBody.slotId);
      // }

      /* const slot = await this.collections.timeSlots.findOneAndUpdate(
        { _id: FormBody.slotId, isBooked: false },
        { $set: { isBooked: true } }, // <-- use $set here
        { returnDocument: "after" }, // optional: return the updated document
      );

      if (!slot) {
        return res.status(400).json({ message: "Slot already booked" });
      } */

      if (FormBody.testTypeId) {
        FormBody.testTypeId = this.toObjectId(FormBody.testTypeId);
      }
      if (FormBody.userId) {
        FormBody.userId = this.toObjectId(FormBody.userId);
      }

      const newTest = {
        userId: FormBody.userId,
        testTypeId: FormBody.testTypeId,
        date: FormBody.date,
        time: FormBody.time,
        status: FormBody.status ?? "booked",
        createdAt: new Date(),
      };
      if (id) {
        await this.collections.tests.updateOne(
          { _id: new ObjectId(id) },
          { $set: newTest },
        );
      } else {
        await this.collections.tests.insertOne({
          _id: new ObjectId(),
          ...newTest,
        });
      }

      return this.json(req, res, 200, {
        message: `Test ${id ? "Updated" : "Booked"} Successfully`,
      });
    } catch (error) {
      return this.jsonError(res, 400, this.__component, "wrong", error);
    }
  };

  public setTestStatus = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const FormBody = req.body;
      if (id) {
        const test = await this.collections.tests.findOne({
          _id: new ObjectId(id),
        });
        if (!test) {
          return this.jsonError(
            res,
            400,
            this.__component,
            "Test does not exist",
          );
        }
        await this.collections.tests.updateOne(
          {
            _id: test._id,
          },
          { $set: { status: FormBody.status } },
        );
        await this.appLog(
          req,
          this.__component,
          "Status Changed",
          new ObjectId(id),
        );
        return this.json(req, res, 200, {
          message: `Test ${FormBody.staus} Successfully`,
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
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };
}
