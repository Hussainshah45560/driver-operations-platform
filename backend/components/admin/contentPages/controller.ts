import { ObjectId } from "mongodb";
import { BaseController } from "../../../core";
import { Filter_Options, Request, Response } from "../../../__types";

export default class ContentController extends BaseController {
  public __component: string = "content-pages";
  private filter_options: Filter_Options = {
    search: ["title", "heading"],
    defaultSort: "_id",
    filters: {},
  };

  public list = async (req: Request, res: Response): Promise<Response> => {
    try {
      const defaultFilter = { isDeleted: { $ne: true } };
      this.getAggrigation(req, this.filter_options, defaultFilter);
      const [data, count] = await Promise.all([
        this.collections.contentPages
          .aggregate([
            ...req.aggregations,
            {
              $project: {
                _id: 1,
                title: 1,
                heading: 1,
                isActive: 1,
              },
            },
          ])
          .toArray(),
        this.collections.contentPages.aggregate(req.dbPagination).toArray(),
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
      const pages = await this.collections.contentPages.findOne(defaultFilter, {
        projection: {
          _id: 1,
          title: 1,
          heading: 1,
          description: 1,
          isActive: 1,
        },
      });
      if (pages) {
        return this.json(req, res, 200, { data: pages });
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
        const isExist = await this.collections.contentPages.findOne({
          _id: this.toObjectId(id),
        });
        if (!isExist) {
          return this.jsonError(
            res,
            400,
            this.__component,
            "Page does not exist"
          );
        }
        await this.collections.contentPages.updateOne(
          { _id: new ObjectId(id) },
          {
            $set: { ...FormBody },
          }
        );
        await this.appLog(
          req,
          this.__component,
          "Update",
          new ObjectId(id),
          FormBody
        );
      } else {
        //   FormBody.isActive = true;
        //   const created = await this.collections.contentPages.insertOne({
        //     _id: new ObjectId(),
        //     ...FormBody,
        //     isActive: true,
        //   });
        //   await this.appLog(
        //     req,
        //     this.__component,
        //     "Create",
        //     created.insertedId,
        //     FormBody
        //   );
      }
      return this.json(req, res, 200, {
        message: `Content Page ${id ? "Updated" : "Created"} Successfully`,
      });
    } catch (error) {
      return this.jsonError(res, 400, this.__component, "wrong", error);
    }
  };

  public setContentStatus = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      if (id) {
        const contentPage = await this.collections.contentPages.findOne({
          _id: new ObjectId(id),
        });
        if (!contentPage) {
          return this.jsonError(
            res,
            400,
            this.__component,
            "Page does not exist"
          );
        }
        await this.collections.contentPages.updateOne(
          {
            _id: contentPage._id,
          },
          { $set: { isActive: !contentPage.isActive } }
        );
        await this.appLog(
          req,
          this.__component,
          "Active Template",
          new ObjectId(id)
        );
        return this.json(req, res, 200, {
          message: `Page ${
            !contentPage.isActive ? "Activated" : "Deactivated"
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
      return this.jsonError(res, 500, this.__component, "wrong", error);
    }
  };

  public delete = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      if (id) {
        await this.collections.contentPages.updateOne(
          {
            _id: new ObjectId(id),
          },
          {$set:{isDeleted:true}}
        );
        await this.appLog(req, this.__component, "Delete", new ObjectId(id));
        return this.json(req, res, 200, {
          message: `Content Page Deleted Successfully`,
        });
      } else {
        return this.jsonError(res, 400, this.__component, "delete");
      }
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };
}
