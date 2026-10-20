import { ObjectId } from "mongodb";
import { Request, Response } from "../../../__types";
import { BaseController } from "../../../core/BaseController";

export default class StateController extends BaseController {
	public __component: string = "permissions";
	/* private filter_options: Filter_Options = {
		search: ["name"],
		defaultSort: "_id",
		filters: {},
	}; */
	public list = async (req: Request, res: Response): Promise<Response> => {
		try {
			let result;
			result = await this.collections.appSettings.find({}, { projection: { permissions: 1 } }).toArray()
			result = result[0]
			return this.json(req, res, 200, { data: result });
		} catch (error) {
			return this.jsonError(res, 500, this.__component, "invalid", error);
		}
	};

	public createOrUpdate = async (req: Request, res: Response): Promise<Response> => {
		try {
			const { id } = req.params;
			const FormBody = req.body;
			let perm;
			let isNew: boolean = false;
			const currentPer = await this.collections.appSettings.findOne({ _id: new ObjectId(id) }, { projection: { permissions: 1 } });
			if (currentPer) {
				perm = currentPer?.value
				Object.keys(perm).forEach(function (c) {
					if (c == FormBody.component.toLowerCase()) {
						Object.keys(perm[c]).forEach(function (p) {
							if (p != FormBody.permission.toLowerCase()) {
								perm[c] = {
									...perm[c], ...{ [FormBody.permission.toLowerCase()]: true }
								}
							}
						})
					} else {
						isNew = (Object.keys(perm).indexOf(FormBody.component.toLowerCase()) == -1) ? true : false
					}
				});
				if (isNew) {
					perm = { ...perm, ...{ [FormBody.component.toLowerCase()]: { [FormBody.permission.toLowerCase()]: true } } }
				}
			}
			if (id) {
				await this.collections.appSettings.updateOne({ _id: new ObjectId(id) }, { $set: { permissions: perm } });
			return this.json(req, res, 200, { message: `Permissions Updated Successfully` });
			} else {
				return this.jsonError(res, 400, this.__component, 'not found');
			}
		} catch (error) {
			return this.jsonError(res, 500, this.__component, "invalid", error);
		}
	};

	 public getAllPermissions = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { code } = req.query;
      const defaultFilter = { code: code };
      const setting = await this.collections.appSettings.findOne(
        defaultFilter,
        {
          projection: {
            _id: 1,
            value: 1,
          },
        }
      );
      if (setting) {
        if(req.user.role?.name != "Developer"){
          const keysToRemove = ["appsetting","emailtypes","templatetypes"];
          if (setting?.value) {
            setting.value = Object.fromEntries(
              Object.entries(setting.value).filter(
                ([key]) => !keysToRemove.includes(key)
              )
            );
          }
        }
        return this.json(req, res, 200, { data: setting });
      }
      return this.jsonError(res, 400, this.__component, "get");
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };
}