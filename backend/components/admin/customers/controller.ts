import { ObjectId } from "mongodb";
import { BaseController } from "../../../core";
import { Filter_Options, Request, Response } from "../../../__types";

export default class CustomerController extends BaseController {
  public __component: string = "customers";
  private filter_options: Filter_Options = {
    search: ["name", "code", "tradingAs", "email"],
    defaultSort: "_id",
    filters: {},
  };

  public list = async (req: Request, res: Response): Promise<Response> => {
    try {
      const defaultFilter = { isDeleted: { $ne: true } };
      this.getAggrigation(req, this.filter_options, defaultFilter);
      const [data, count] = await Promise.all([
        this.collections.customers
          .aggregate([
            ...req.aggregations,
            {
              $project: {
                _id: 1,
                code: 1,
                name: 1,
                tradingAs: 1,
                phoneNumber: 1,
                telNumber:1,
                email: 1,
                isActive: 1,
              },
            },
          ])
          .toArray(),
        this.collections.customers.aggregate(req.dbPagination).toArray(),
      ]);
      return this.json(req, res, 200, { data, count: count });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getCustomerStep1 = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const defaultFilter = { _id: this.toObjectId(id) };
      const customer = await this.collections.customers.findOne(defaultFilter, {
        projection: {
          _id: 1,
          name: 1,
          email: 1,
          code: 1,
          telNumber: 1,
          phoneNumber: 1,
          faxNumber: 1,
          tradingAs: 1,
          companyRegNumber: 1,
          regionId: 1,
          vatNumber: 1,
          vatPercentage: 1,
          statusCode: 1,
          costCenterIds:1,
          isActive: 1,
        },
      });
      if (customer) {
        return this.json(req, res, 200, { data: customer });
      }
      return this.jsonError(res, 400, this.__component, "get");
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getCustomerStep2 = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const defaultFilter = { _id: this.toObjectId(id) };

      const customer = await this.collections.customers.findOne(defaultFilter, {
        projection: {
          _id: 1,
          physicalAddress: 1,
          postalAddress: 1,
          isActive: 1,
        },
      });
      if (customer) {
        return this.json(req, res, 200, { data: customer });
      }
      return this.jsonError(res, 400, this.__component, "get");
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getCustomerStep4 = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const defaultFilter = { _id: this.toObjectId(id) };

      const customer = await this.collections.customers.findOne(defaultFilter, {
        projection: {
          _id: 1,
          configuration: 1,
          isActive: 1,
        },
      });
      if (customer) {
        return this.json(req, res, 200, { data: customer });
      }
      return this.jsonError(res, 400, this.__component, "get");
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public createOrUpdateStep1 = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const FormBody = req.body;

      const costCenterIds =
        FormBody.costCenterIds && Array.isArray(FormBody.costCenterIds)
          ? FormBody.costCenterIds.map((id: string) => new ObjectId(id))
          : [];
      const customer = {
        code: FormBody.code,
        name: FormBody.name,
        email: FormBody.email,
        telNumber: FormBody.telNumber,
        phoneNumber: FormBody.phoneNumber,
        faxNumber: FormBody.faxNumber,
        tradingAs: FormBody.tradingAs,
        companyRegNumber: FormBody.companyRegNumber,
        regionId: this.toObjectId(FormBody.regionId),
        vatNumber: FormBody.vatNumber,
        vatPercentage: FormBody.vatPercentage,
        costCenterIds,
      };

      if (id) {
        const isExist = await this.collections.customers.findOne({
          _id: this.toObjectId(id),
        });
        if (!isExist) {
          return this.jsonError(
            res,
            400,
            this.__component,
            "Cutomer does not exist"
          );
        }

        await this.collections.customers.updateOne(
          { _id: isExist._id },
          {
            $set: { ...customer },
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
        const createdCustomer = await this.collections.customers.insertOne({
          _id: new ObjectId(),
          ...customer,
          isActive: true,
        });
        await this.appLog(
          req,
          this.__component,
          "Create",
          createdCustomer.insertedId,
          FormBody
        );
        return this.json(req, res, 200, {
          data: {
            message: "Cutomer saved successfully",
            customerId: createdCustomer.insertedId,
          },
        });
      }
      return this.json(req, res, 200, {
        message: `Customer ${id ? "Updated" : "Saved"} Successfully`,
      });
    } catch (error) {
      return this.jsonError(res, 400, this.__component, "wrong", error);
    }
  };

  public updateCustomerStep2 = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const FormBody = req.body;

      if (id) {
        const isExist = await this.collections.customers.findOne({
          _id: this.toObjectId(id),
        });
        if (!isExist) {
          return this.jsonError(
            res,
            400,
            this.__component,
            "Cutomer does not exist"
          );
        }
        const updateCustomer = {
          physicalAddress: {
            ...FormBody.physicalAddress,
            regionId: this.toObjectId(FormBody.physicalAddress.regionId),
          },
          postalAddress: {
            ...FormBody.postalAddress,
            regionId: this.toObjectId(FormBody.postalAddress.regionId),
          },
        };
        await this.collections.customers.updateOne(
          { _id: isExist._id },
          {
            $set: { ...updateCustomer },
          }
        );
        await this.appLog(
          req,
          this.__component,
          "Update",
          new ObjectId(id),
          FormBody
        );
      }
      return this.json(req, res, 200, {
        message: `Customer ${id ? "Updated" : "Saved"} Successfully`,
      });
    } catch (error) {
      return this.jsonError(res, 400, this.__component, "wrong", error);
    }
  };

  public updateCustomerStep4 = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const FormBody = req.body;

      if (id) {
        const isExist = await this.collections.customers.findOne({
          _id: this.toObjectId(id),
        });
        if (!isExist) {
          return this.jsonError(
            res,
            400,
            this.__component,
            "Cutomer does not exist"
          );
        }

        if (FormBody.configuration.length > 0) {
          FormBody.configuration = FormBody.configuration?.map((item: any) => ({
            checkListType: item.checkListType,
            ...(item.checkListIds?.length > 0
              ? {
                  checkListIds: item.checkListIds.map((id: string) =>
                    this.toObjectId(id)
                  ),
                }
              : {}),
            ...(item.supportingDocs?.length > 0
              ? {
                  supportingDocs: item.supportingDocs.map((id: string) =>
                    this.toObjectId(id)
                  ),
                }
              : {}),
          }));
        }

        await this.collections.customers.updateOne(
          { _id: isExist._id },
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
      }
      return this.json(req, res, 200, {
        message: `Customer ${id ? "Updated" : "Saved"} Successfully`,
      });
    } catch (error) {
      return this.jsonError(res, 400, this.__component, "wrong", error);
    }
  };

  public delete = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      if (id) {
        const customer = await this.collections.customers.findOne({
          _id: new ObjectId(id),
        });
        if (!customer) {
          return this.jsonError(
            res,
            400,
            this.__component,
            "Customer does not exist"
          );
        }
        await this.collections.customers.updateOne(
          {
            _id: customer._id,
          },
          { $set: { isDeleted: true } }
        );
        await this.appLog(req, this.__component, "Delete", new ObjectId(id));
        return this.json(req, res, 200, {
          message: `Customer Deleted Successfully`,
        });
      } else {
        return this.jsonError(res, 400, this.__component, "delete");
      }
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public setCustomerStatus = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      if (id) {
        const customer = await this.collections.customers.findOne({
          _id: new ObjectId(id),
        });
        if (!customer) {
          return this.jsonError(
            res,
            400,
            this.__component,
            "Customer does not exist"
          );
        }
        await this.collections.customers.updateOne(
          {
            _id: customer._id,
          },
          { $set: { isActive: !customer.isActive } }
        );
        await this.appLog(
          req,
          this.__component,
          "Active Customer",
          new ObjectId(id)
        );
        return this.json(req, res, 200, {
          message: `Customer ${
            !customer.isActive ? "Activated" : "Deactivated"
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

  public getCustomerInfo = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const defaultFilter = { _id: this.toObjectId(id) };
      const customer = await this.collections.customers.findOne(defaultFilter, {
        projection: {
          _id: 1,
          name: 1,
          tradingAs: 1,
        },
      });
      if (customer) {
        return this.json(req, res, 200, { data: customer });
      }
      return this.jsonError(res, 400, this.__component, "get");
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };
}
