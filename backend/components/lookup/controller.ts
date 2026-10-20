import { ObjectId } from "mongodb";
import { Filter_Options, Request, Response } from "../../__types";
import { BaseController } from "../../core";

export default class LookUpController extends BaseController {
  public __component: string = "lookup";
  private filter_options: Filter_Options = {
    search: [
      "name",
      "profile.firstName",
      "profile.lastName",
      "profile.phoneNumber",
      "applicationNumber",
    ],
    defaultSort: "name",
    filters: {},
  };
  // Application Data Lookups

  public getRolesData = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      let roleIds;
      const { lookup } = req.query;
      const matchStage = {
        name: { $ne: "Developer" },
      };
      if (lookup) {
        if (
          req.user.role &&
          req.user.role.permissions["users"] &&
          !["Admin", "Developer"].includes(req.user.role.name)
        ) {
          const allowed = ["view", "add", "update", "delete"];
          const extraPermissions = Object.entries(
            req.user.role.permissions["users"],
          )
            .filter(([key, value]) => !allowed.includes(key) && value === true)
            .map(([key]) => key);
          if (extraPermissions.length > 0) {
            const roleDocs = await this.collections.roles
              .find({ name: { $in: extraPermissions } })
              .project({ _id: 1 })
              .toArray();
            if (roleDocs.length > 0) {
              roleIds = roleDocs.map((r) => r._id);
              matchStage["_id"] = { $in: roleIds };
            }
          }
        }
      }

      const result = await this.collections.roles
        .aggregate([
          {
            $match: matchStage,
          },
          { $sort: { name: 1 } },
          {
            $project: {
              name: 1,
              value: "$_id",
            },
          },
        ])
        .toArray();
      return this.json(req, res, 200, { data: result });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getRegionData = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const lookup: any = [];
      const result = await this.collections.regions
        .find()
        .sort({ name: 1 })
        .toArray();
      if (result.length > 0) {
        result.forEach((el) => {
          lookup.push({
            name: el.name,
            value: el._id,
          });
        });
      }
      return this.json(req, res, 200, { data: lookup });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getVehicleTypeData = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const lookup: any = [];
      const result = await this.collections.vehicleTypes
        .find()
        .sort({ name: 1 })
        .toArray();
      if (result.length > 0) {
        result.forEach((el) => {
          lookup.push({
            name: el.name,
            value: el._id,
          });
        });
      }
      return this.json(req, res, 200, { data: lookup });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getSubDevicesByVehicleType = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { vehicle_type_id } = req.query;
      const vehicleTypeId =
        typeof vehicle_type_id === "string"
          ? this.toObjectId(vehicle_type_id)
          : vehicle_type_id;
      const lookup: any = [];
      const result = await this.collections.subDevices
        .find({ vehicleTypeId: vehicleTypeId })
        .sort({ name: 1 })
        .toArray();
      if (result.length > 0) {
        result.forEach((el) => {
          lookup.push({
            name: el.name,
            value: el._id,
          });
        });
      }
      return this.json(req, res, 200, { data: lookup });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getAccessoriesByVehicleType = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { vehicle_type_id } = req.query;
      const vehicleTypeId =
        typeof vehicle_type_id === "string"
          ? this.toObjectId(vehicle_type_id)
          : vehicle_type_id;
      const lookup: any = [];
      const result = await this.collections.accessories
        .find({ vehicleTypeId: vehicleTypeId })
        .sort({ name: 1 })
        .toArray();
      if (result.length > 0) {
        result.forEach((el) => {
          lookup.push({
            name: el.name,
            value: el._id,
          });
        });
      }
      return this.json(req, res, 200, { data: lookup });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getTemplateType = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const lookup: any = [];
      const result = await this.collections.templateTypes
        .find()
        .sort({ name: 1 })
        .toArray();
      if (result.length > 0) {
        result.forEach((el) => {
          lookup.push({
            name: el.title,
            value: el._id,
          });
        });
      }
      return this.json(req, res, 200, { data: lookup });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getDocumentType = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { type } = req.query;
      const lookup: any = [];
      const result = await this.collections.documentTypes
        .find({ type: type })
        .sort({ name: 1 })
        .toArray();
      if (result.length > 0) {
        result.forEach((el) => {
          lookup.push({
            name: el.name,
            value: el._id,
          });
        });
      }
      return this.json(req, res, 200, { data: lookup });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getNationalities = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const lookup: any = [];
      const result = await this.collections.nationalities
        .find()
        .sort({ name: 1 })
        .toArray();
      if (result.length > 0) {
        result.forEach((el) => {
          lookup.push({
            name: el.name,
            value: el._id,
          });
        });
      }
      return this.json(req, res, 200, { data: lookup });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getLanguages = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const lookup: any = [];
      const result = await this.collections.languages
        .find()
        .sort({ name: 1 })
        .toArray();
      if (result.length > 0) {
        result.forEach((el) => {
          lookup.push({
            name: el.name,
            value: el._id,
          });
        });
      }
      return this.json(req, res, 200, { data: lookup });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getAccountType = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const lookup: any = [];
      const result = await this.collections.accountTypes
        .find()
        .sort({ name: 1 })
        .toArray();
      if (result.length > 0) {
        result.forEach((el) => {
          lookup.push({
            name: el.name,
            value: el._id,
          });
        });
      }
      return this.json(req, res, 200, { data: lookup });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getRelationType = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { category } = req.query;
      const lookup: any = [];
      const result = await this.collections.relationTypes
        .find({ category: category })
        .sort({ name: 1 })
        .toArray();
      if (result.length > 0) {
        result.forEach((el) => {
          lookup.push({
            name: el.name,
            value: el._id,
          });
        });
      }
      return this.json(req, res, 200, { data: lookup });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getAreasByRegionId = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { region_id } = req.query;
      const regionId =
        typeof region_id === "string" ? this.toObjectId(region_id) : region_id;
      const lookup: any = [];
      const result = await this.collections.areas
        .find({ regionId: regionId })
        .sort({ name: 1 })
        .toArray();
      if (result.length > 0) {
        result.forEach((el) => {
          lookup.push({
            name: el.name,
            value: el._id,
          });
        });
      }
      return this.json(req, res, 200, { data: lookup });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getBenefits = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const lookup: any = [];
      const result = await this.collections.benefits
        .find()
        .sort({ name: 1 })
        .toArray();
      if (result.length > 0) {
        result.forEach((el) => {
          lookup.push({
            name: el.name,
            value: el._id,
          });
        });
      }
      return this.json(req, res, 200, { data: lookup });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getSkills = async (req: Request, res: Response): Promise<Response> => {
    try {
      const lookup: any = [];
      const result = await this.collections.skills
        .find()
        .sort({ name: 1 })
        .toArray();
      if (result.length > 0) {
        result.forEach((el) => {
          lookup.push({
            name: el.name,
            value: el._id,
          });
        });
      }
      return this.json(req, res, 200, { data: lookup });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getLicenseCode = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const lookup: any = [];
      const result = await this.collections.licenseCodes
        .find()
        .sort({ name: 1 })
        .toArray();
      if (result.length > 0) {
        result.forEach((el) => {
          lookup.push({
            name: el.name,
            value: el._id,
          });
        });
      }
      return this.json(req, res, 200, { data: lookup });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getSupportingDoc = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const lookup: any = [];
      const result = await this.collections.cmcTemplates
        .find({ isDeleted: { $ne: true } })
        .sort({ name: 1 })
        .toArray();
      if (result.length > 0) {
        result.forEach((el) => {
          lookup.push({
            name: el.name,
            value: el._id,
          });
        });
      }
      return this.json(req, res, 200, { data: lookup });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getCMCTemplate = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const lookup: any = [];
      const { used_for, customer_id } = req.query;
      let customerId: ObjectId | null = null;
      if (typeof customer_id === "string" && customer_id.trim() !== "") {
        customerId = this.toObjectId(customer_id);
      }
      const query: any = {
        isDeleted: { $ne: true },
        used_for: used_for,
      };

      if (customerId) {
        query.$or = [
          { customerId: customerId }, // customer specific
          { customerId: { $exists: false } }, // global
          { customerId: "" },
        ];
      } else {
        // only global templates
        query.$or = [{ customerId: { $exists: false } }, { customerId: "" }];
      }

      const result = await this.collections.cmcTemplates
        .find(query)
        .sort({ name: 1 })
        .toArray();
      if (result.length > 0) {
        result.forEach((el) => {
          lookup.push({
            name: el.name,
            value: el._id,
          });
        });
      }
      return this.json(req, res, 200, { data: lookup });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };


  public getChecklistType = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const lookup: any = [];
      const result = await this.collections.checklistTypes
        .find()
        .sort({ name: 1 })
        .toArray();
      if (result.length > 0) {
        result.forEach((el) => {
          lookup.push({
            name: el.name,
            value: el._id,
          });
        });
      }
      return this.json(req, res, 200, { data: lookup });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getChecklist = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { checklist } = req.query;
      const checklistType = await this.collections.checklistTypes.findOne(
        { name: checklist },
        { projection: { _id: 1 } },
      );
      const lookup: any = [];
      const result = await this.collections.checklists
        .find({ isDeleted: { $ne: true }, checklistTypeId: checklistType?._id })
        .project({ _id: 1, name: 1 })
        .sort({ name: 1 })
        .toArray();
      if (result.length > 0) {
        result.forEach((el) => {
          lookup.push({
            name: el.name,
            value: el._id,
          });
        });
      }
      return this.json(req, res, 200, { data: lookup });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getAODType = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const lookup: any = [];
      const result = await this.collections.aodTypes
        .find()
        .sort({ name: 1 })
        .toArray();
      if (result.length > 0) {
        result.forEach((el) => {
          lookup.push({
            name: el.name,
            value: el._id,
          });
        });
      }
      return this.json(req, res, 200, { data: lookup });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getAODReason = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const lookup: any = [];
      const result = await this.collections.aodReasons
        .find()
        .sort({ name: 1 })
        .toArray();
      if (result.length > 0) {
        result.forEach((el) => {
          lookup.push({
            name: el.name,
            value: el._id,
          });
        });
      }
      return this.json(req, res, 200, { data: lookup });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getPaymentTerm = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const lookup: any = [];
      const result = await this.collections.paymentTerms
        .find()
        .sort({ name: 1 })
        .toArray();
      if (result.length > 0) {
        result.forEach((el) => {
          lookup.push({
            name: el.name,
            value: el._id,
          });
        });
      }
      return this.json(req, res, 200, { data: lookup });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getCostCenter = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const lookup: any = [];
      const result = await this.collections.costCenters
        .find()
        .sort({ name: 1 })
        .toArray();
      if (result.length > 0) {
        result.forEach((el) => {
          lookup.push({
            name: el.name,
            value: el._id,
          });
        });
      }
      return this.json(req, res, 200, { data: lookup });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getInContractApplicantProfile = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { type } = req.query;
      const lookup: any = [];
      const defaultFilter = {}; //applicationStatus: "in progress"
      if (type == "all") {
        defaultFilter["applicationStatus"] = { $nin: ["in progress"] };
      } else {
        defaultFilter["applicationStatus"] = { $in: ["in contract"] };
      }
      console.log(type, defaultFilter);
      this.getAggrigation(req, this.filter_options, defaultFilter);
      const promiseAr: any = [
        this.collections.applications
          .aggregate([
            /* {
            $match: {
              applicaitonStatus: "in progress",
            },
          }, */
            {
              $lookup: {
                from: "userProfiles",
                localField: "profileId",
                foreignField: "_id",
                as: "profile",
              },
            },
            {
              $addFields: {
                profile: { $arrayElemAt: ["$profile", 0] }, // <-- FIX
              },
            },
            {
              $addFields: {
                fullName: {
                  $concat: [
                    "$profile.firstName",
                    " ",
                    { $ifNull: ["$profile.lastName", ""] },
                  ],
                },
              },
            },
            {
              $sort: {
                fullName: 1,
              },
            },
            ...req.aggregations,
            {
              $project: {
                _id: 1,
                profileId: 1,
                fullName: 1,
                userId: 1,
              },
            },
          ])
          .toArray(),
        this.collections.applications
          .aggregate([...req.aggregations, ...req.dbPagination])
          .toArray(),
      ];
      // if (req.query.ex && typeof req.query.ex == "string") {
      //   promiseAr.push(
      //     this.collections.applications
      //       .find({ _id: this.toObjectId(req.query.ex) })
      //       .toArray()
      //   );
      // } else {
      //   promiseAr.push("null");
      // }

      const [data, count] = await Promise.all(promiseAr);
      if (data.length > 0) {
        // let ex = {
        //   name: "",
        //   value: "",
        // };
        // if (existing.length > 0) {
        //   ex = {
        //     name: existing[0].name,
        //     value: existing[0]._id,
        //   };
        // }
        // let patched = false;
        data.forEach((el) => {
          // if (el._id.equals(ex.value)) {
          //   patched = true;
          // }
          lookup.push({
            name: el.fullName,
            value: type == "all" ? el.userId : el.profileId,
          });
        });
        // if (!patched) {
        //   lookup.push(ex);
        // }
      }

      return this.json(req, res, 200, { data: lookup, count: count });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getCustomers = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const lookup: any = [];
      const defaultFilter = {};
      this.getAggrigation(req, this.filter_options, defaultFilter);
      const promiseAr: any = [
        this.collections.customers
          .aggregate([
            ...req.aggregations,
            {
              $project: {
                _id: 1,
                name: 1,
              },
            },
          ])
          .toArray(),
        this.collections.customers
          .aggregate([...req.aggregations, ...req.dbPagination])
          .toArray(),
      ];
      if (req.query.ex && typeof req.query.ex == "string") {
        promiseAr.push(
          this.collections.customers
            .find({ _id: this.toObjectId(req.query.ex) })
            .toArray(),
        );
      } else {
        promiseAr.push("null");
      }
      const [data, count, existing] = await Promise.all(promiseAr);
      if (data.length > 0) {
        let ex = {
          name: "",
          value: "",
        };
        if (existing.length > 0) {
          ex = {
            name: existing[0].name,
            value: existing[0]._id,
          };
        }
        let patched = false;
        data.forEach((el) => {
          if (el._id.equals(ex.value)) {
            patched = true;
          }
          lookup.push({
            name: el.name,
            value: el._id,
          });
        });
        if (!patched && ex.name != undefined) {
          lookup.push(ex);
        }
      }
      return this.json(req, res, 200, { data: lookup, count: count });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };
  public getRecruitmentTypes = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const lookup: any = [];
      const result = await this.collections.recruitmentTypes
        .find()
        .sort({ name: 1 })
        .toArray();
      if (result.length > 0) {
        result.forEach((el) => {
          lookup.push({
            name: el.name,
            value: el._id,
          });
        });
      }
      return this.json(req, res, 200, { data: lookup });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getRecruitmentModels = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const lookup: any = [];
      const result = await this.collections.recruitmentModels
        .find()
        .sort({ name: 1 })
        .toArray();
      if (result.length > 0) {
        result.forEach((el) => {
          lookup.push({
            name: el.name,
            value: el._id,
          });
        });
      }
      return this.json(req, res, 200, { data: lookup });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getAllowEquipments = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const lookup: any = [];
      const result = await this.collections.allowEquipments
        .find()
        .sort({ name: 1 })
        .toArray();
      if (result.length > 0) {
        result.forEach((el) => {
          lookup.push({
            name: el.name,
            value: el._id,
          });
        });
      }
      return this.json(req, res, 200, { data: lookup });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getDisciplinaryTypes = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { type, customer_id } = req.query;
      const customerId =
        typeof customer_id === "string"
          ? this.toObjectId(customer_id)
          : customer_id;
      const lookup: any = [];
      const filter: any = {
        used_for: "warning_template",
      };

      if (customerId) {
        filter.$or = [
          { customerId: customerId }, // customer specific
          { customerId: { $exists: false } }, // no field
          { customerId: null }, // null
          { customerId: "" }, // empty string
        ];
      } else {
        filter.$or = [
          { customerId: { $exists: false } },
          { customerId: null },
          { customerId: "" },
        ];
      }

      const result = await this.collections.cmcTemplates
        .find(filter)
        .sort({ name: 1 })
        .toArray();
      if (result.length > 0) {
        result.forEach((el) => {
          if (type === "contractor") {
            // Only push Breach templates
            if (el.name === "Breach") {
              lookup.push({
                name: el.name,
                value: el._id,
              });
            }
          } else {
            // Employee (or any other type) → push everything except Breach
            if (el.name !== "Breach") {
              lookup.push({
                name: el.name,
                value: el._id,
              });
            }
          }
        });
      }
      return this.json(req, res, 200, { data: lookup });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getDisputeTypes = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const lookup: any = [];
      const result = await this.collections.disputeTypes
        .find()
        .sort({ name: 1 })
        .toArray();
      if (result.length > 0) {
        result.forEach((el) => {
          lookup.push({
            name: el.name,
            value: el._id,
          });
        });
      }
      return this.json(req, res, 200, { data: lookup });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getClearanceTypes = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const lookup: any = [];
      const result = await this.collections.clearanceTypes
        .find()
        .sort({ name: 1 })
        .toArray();
      if (result.length > 0) {
        result.forEach((el) => {
          lookup.push({
            name: el.name,
            value: el._id,
          });
        });
      }
      return this.json(req, res, 200, { data: lookup });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getWarningReasons = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const lookup: any = [];
      const result = await this.collections.warningReasons
        .find()
        .sort({ name: 1 })
        .toArray();
      if (result.length > 0) {
        result.forEach((el) => {
          lookup.push({
            name: el.name,
            value: el._id,
          });
        });
      }
      return this.json(req, res, 200, { data: lookup });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getAdminUsers = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const lookup: any = [];
      const defaultFilter = {
        roleId: new ObjectId("691f5bf0123d03c8fc069609"),
      }; //applicationStatus: "in progress"
      this.getAggrigation(req, this.filter_options, defaultFilter);
      const promiseAr: any = [
        this.collections.users
          .aggregate([
            {
              $lookup: {
                from: "userProfiles",
                localField: "_id",
                foreignField: "userId",
                as: "profile",
              },
            },
            {
              $addFields: {
                profile: { $arrayElemAt: ["$profile", 0] }, // <-- FIX
              },
            },
            {
              $addFields: {
                fullName: {
                  $concat: [
                    "$profile.firstName",
                    " ",
                    { $ifNull: ["$profile.lastName", ""] },
                  ],
                },
              },
            },
            {
              $sort: {
                fullName: 1,
              },
            },
            ...req.aggregations,
            {
              $project: {
                _id: 1,
                profileId: "$profile._id",
                fullName: 1,
              },
            },
          ])
          .toArray(),
        this.collections.users
          .aggregate([...req.aggregations, ...req.dbPagination])
          .toArray(),
      ];

      const [data] = await Promise.all(promiseAr);
      if (data.length > 0) {
        data.forEach((el) => {
          lookup.push({
            name: el.fullName,
            value: el.profileId,
          });
        });
      }
      return this.json(req, res, 200, { data: lookup });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getAssetDetail = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const lookup: any = [];
      const { user_id } = req.query;

      const userId =
        typeof user_id === "string" ? this.toObjectId(user_id) : user_id;
      const result = await this.collections.applications
        .aggregate([
          {
            $match: { userId: userId },
          },
          {
            $lookup: {
              from: "assets",
              localField: "assetIds",
              foreignField: "_id",
              as: "assets",
            },
          },
          { $unwind: "$assets" },
          { $replaceRoot: { newRoot: "$assets" } },
          {
            $project: {
              _id: 1,
              make: 1,
              model: 1,
              registrationNumber: 1,
            },
          },
        ])
        .toArray();

      if (result.length > 0) {
        result.forEach((el) => {
          lookup.push({
            name:
              el.make + ", " + el.model + " (" + el.registrationNumber + ")",
            value: el._id,
          });
        });
      }
      return this.json(req, res, 200, { data: lookup });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getAdminSettingType = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { code } = req.query;
      const lookup: any = [];
      const result = await this.collections.appSettings.findOne(
        { code: code },
        { projection: { value: 1 } },
      );
      const roles = result?.value.sort((a, b) => a.name.localeCompare(b.name));
      roles.forEach((el) => {
        lookup.push({
          name: el.name,
          value: el.value,
        });
      });
      return this.json(req, res, 200, { data: lookup });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getBanks = async (req: Request, res: Response): Promise<Response> => {
    try {
      const lookup: any = [];
      const result = await this.collections.banks
        .find()
        .sort({ name: 1 })
        .toArray();
      if (result.length > 0) {
        result.forEach((el) => {
          lookup.push({
            name: el.name,
            code: el.code,
            value: el._id,
          });
        });
      }
      return this.json(req, res, 200, { data: lookup });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getTestTypes = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const lookup: any = [];
      const result = await this.collections.testTypes
        .find()
        .sort({ name: 1 })
        .toArray();
      if (result.length > 0) {
        result.forEach((el) => {
          lookup.push({
            name: el.name,
            value: el._id,
          });
        });
      }
      return this.json(req, res, 200, { data: lookup });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };
}
