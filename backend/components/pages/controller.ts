import { BaseController } from "../../core";
import { Request, Response } from "../../__types";

export default class PagesController extends BaseController {
  public __component: string = "public-page";

  public get = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { code } = req.query;
      const defaultFilter = { code: code, isActive: true };
      const page = await this.collections.contentPages.findOne(defaultFilter, {
        projection: {
          _id: 1,
          title: 1,
          heading: 1,
          description: 1,
        },
      });
      if (page) {
        return this.json(req, res, 200, { data: page });
      }
      return this.jsonError(res, 400, this.__component, "get");
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };
}
