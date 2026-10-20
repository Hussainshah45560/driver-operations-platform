import { ObjectId } from "mongodb";
import { BaseController } from "../../../core";
import { Filter_Options, Request, Response } from "../../../__types";

export default class CustomerContactController extends BaseController {
  public __component: string = "customer-contacts";
  private filter_options: Filter_Options = {
    search: ["name", "email", "phoneNumber"],
    defaultSort: "_id",
    filters: {},
  };

  public list = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { customer_id } = req.query;
      const customerId =
        typeof customer_id === "string" ? this.toObjectId(customer_id) : "";
      const defaultFilter = {
        customerId: customerId,
        isDeleted: { $ne: true },
      };
      this.getAggrigation(req, this.filter_options, defaultFilter);
      const [data, count] = await Promise.all([
        this.collections.customerContacts
          .aggregate([
            ...req.aggregations,
            {
              $project: {
                _id: 1,
                name: 1,
                email: 1,
                phoneNumber: 1,
                position:1,
                isActive: 1,
                isDefault: 1,
              },
            },
          ])
          .toArray(),
        this.collections.customerContacts.aggregate(req.dbPagination).toArray(),
      ]);
      return this.json(req, res, 200, { data, count: count });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public get = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const defaultFilter = { _id: this.toObjectId(id) };
      const cutomerContact = await this.collections.customerContacts.findOne(
        defaultFilter,
        {
          projection: {
            _id: 1,
            name: 1,
            email: 1,
            phoneNumber: 1,
            position:1,
            isActive: 1,
            isDefault: 1,
          },
        }
      );
      if (cutomerContact) {
        return this.json(req, res, 200, { data: cutomerContact });
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
        const isExits =
          await this.collections.customerContacts.findOne({
            _id: this.toObjectId(id),
          });
        if (!isExits) {
          return this.jsonError(
            res,
            400,
            this.__component,
            "Customer contact does not exist"
          );
        }
          if(FormBody.isDefault){
          await this.collections.customerContacts.updateMany({
            customerId: this.toObjectId(FormBody.customerId)
          },{$set:{isDefault:false}})
        }
        const updateCustomerContact = {
          customerId: this.toObjectId(FormBody.customerId),
          name: FormBody.name,
          email: FormBody.email,
          phoneNumber: FormBody.phoneNumber,
          position: FormBody.position,
          isDefault: FormBody.isDefault,
        };
        await this.collections.customerContacts.updateOne(
          { _id: isExits._id },
          {
            $set: {
              ...updateCustomerContact,
            },
          }
        );
        
      } else {
        const contactExits =
          await this.collections.customerContacts.findOne({
            phoneNumber: FormBody.phoneNumber,
            isDeleted:{$ne:true}
          });
        if (contactExits) {
          return this.jsonError(
            res,
            400,
            this.__component,
            "Customer contact already exists"
          );
        }
        if(FormBody.isDefault){
          await this.collections.customerContacts.updateMany({
            customerId: this.toObjectId(FormBody.customerId)
          },{$set:{isDefault:false}})
        }
        const newCustomerContact = {
          _id: new ObjectId(),
          customerId: this.toObjectId(FormBody.customerId),
          name: FormBody.name,
          email: FormBody.email,
          phoneNumber: FormBody.phoneNumber,
          position: FormBody.position,
          isDefault: FormBody.isDefault,
          isActive:true
        };
        await this.collections.customerContacts.insertOne(newCustomerContact);
      }

      return this.json(req, res, 200, {
        message: `Contact ${id ? "Updated" : "Saved"} Successfully`,
      });
    } catch (error) {
      return this.jsonError(res, 400, this.__component, "wrong", error);
    }
  };

   public setContactStatus = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      if (id) {
        const customerContact = await this.collections.customerContacts.findOne({
          _id: new ObjectId(id),
        });
        if (!customerContact) {
          return this.jsonError(
            res,
            400,
            this.__component,
            "Customer does not exist"
          );
        }
        await this.collections.customerContacts.updateOne(
          {
            _id: customerContact._id,
          },
          { $set: { isActive: !customerContact.isActive } }
        );
        await this.appLog(
          req,
          this.__component,
          "Active Customer",
          new ObjectId(id)
        );
        return this.json(req, res, 200, {
          message: `Contact ${
            !customerContact.isActive ? "Activated" : "Deactivated"
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
        await this.collections.customerContacts.updateOne({
          _id: new ObjectId(id),
        },{$set:{isDeleted:true}});
        await this.appLog(req, this.__component, "Delete", new ObjectId(id));
        return this.json(req, res, 200, {
          message: `Contact Deleted Successfully`,
        });
      } else {
        return this.jsonError(res, 400, this.__component, "delete");
      }
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };
}
