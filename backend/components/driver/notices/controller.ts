import { BaseController } from "../../../core";
import { Filter_Options, Request, Response } from "../../../__types";

export default class DisciplinaryController extends BaseController {
  public __component: string = "notices";
  private filter_options: Filter_Options = {
    search: [
      "profile.firstName",
      "profile.lastName",
      "profile.userName",
      "email",
      "phoneNumber",
    ],
    defaultSort: "_id",
    filters: {
      "induction.status": { type: "string", filter: "$in" },
    },
  };

  public list = async (req: Request, res: Response): Promise<Response> => {
    try {
      const defaultFilter = { isDeleted: { $ne: true } };
      this.getAggrigation(req, this.filter_options, defaultFilter);
      const [data, count] = await Promise.all([
        this.collections.disciplinaries
          .aggregate([
            {
              $lookup: {
                from: "userProfiles",
                localField: "profileId",
                foreignField: "_id",
                as: "profile",
              },
            },
            { $unwind: "$profile" },
            {
              $lookup: {
                from: "applications",
                localField: "profile._id",
                foreignField: "profileId",
                as: "application",
              },
            },
            { $unwind: "$application" },
            {
              $lookup: {
                from: "warningReasons",
                localField: "warningReasonId",
                foreignField: "_id",
                as: "warningType",
              },
            },
            {
              $addFields: {
                lastWarning: {
                  $arrayElemAt: ["$warnings", -1],
                },
              },
            },
            {
              $lookup: {
                from: "disciplinaryTypes", // 👈 adjust collection name if different
                localField: "lastWarning.requestTypeId",
                foreignField: "_id",
                as: "disciplinaryType",
              },
            },
            ...req.aggregations,
            {
              $project: {
                _id: 1,
                firstName: "$profile.firstName",
                profileId: "$profile._id",
                lastName: "$profile.lastName",
                applicationNumber: "$application.applicationNumber",
                warningType: { $arrayElemAt: ["$warningType.name", 0] },
                disciplinaryType: {
                  $arrayElemAt: ["$disciplinaryType.name", 0],
                },
              },
            },
          ])
          .toArray(),
        this.collections.disciplinaries
          .aggregate([
            {
              $lookup: {
                from: "userProfiles",
                localField: "profileId",
                foreignField: "_id",
                as: "profile",
              },
            },
            { $unwind: "$profile" },
            {
              $lookup: {
                from: "applications",
                localField: "profile._id",
                foreignField: "profileId",
                as: "application",
              },
            },
            { $unwind: "$application" },
            ...req.dbPagination,
          ])
          .toArray(),
      ]);
      return this.json(req, res, 200, { data, count: count });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getWarnings = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { profileId } = req.params;
      const defaultFilter = { profileId: this.toObjectId(profileId) };
      this.getAggrigation(req, this.filter_options, defaultFilter);
      const [data, count] = await Promise.all([
        this.collections.disciplinaries
          .aggregate([
            { $unwind: "$warnings" },

            // 🔹 Lookup Customer
            {
              $lookup: {
                from: "customers",
                localField: "warnings.customerId",
                foreignField: "_id",
                as: "customer",
              },
            },

            // 🔹 Lookup Request Type
            {
              $lookup: {
                from: "cmcTemplates",
                localField: "warnings.requestTypeId",
                foreignField: "_id",
                as: "requestType",
              },
            },

            // 🔹 Lookup Warning Reason
            {
              $lookup: {
                from: "warningReasons",
                localField: "warningReasonId",
                foreignField: "_id",
                as: "warningReason",
              },
            },
            ...req.aggregations,
            {
              $addFields: {
                "warnings.customerName": {
                  $arrayElemAt: ["$customer.name", 0],
                },
                "warnings.requestTypeName": {
                  $arrayElemAt: ["$requestType.name", 0],
                },
                "warnings.warningReason": {
                  $arrayElemAt: ["$warningReason.name", 0],
                },
                "warnings.status": {
                  $cond: {
                    if: {
                      $ne: [{ $ifNull: ["$warnings.userSign", null] }, null],
                    },
                    then: "signed",
                    else: "unsigned",
                  },
                },

                // 🔹 Include parent document data
                "warnings.disciplinaryId": "$_id",
                "warnings.warningReasonId": "$warningReasonId",
                "warnings.isFinalWarning": "$isFinalWarning",
                "warnings.isAuthorized": "$isAuthorized",
                "warnings.authorizedBy": "$authorizedBy",
                "warnings.authorizedDate": "$authorizedDate",
              },
            },

            {
              $replaceRoot: { newRoot: "$warnings" },
            },

            {
              $sort: { date: -1 },
            },
          ])
          .toArray(),
        this.collections.disciplinaries
          .aggregate([
            { $unwind: "$warnings" },

            // 🔹 Lookup Customer
            {
              $lookup: {
                from: "customers",
                localField: "warnings.customerId",
                foreignField: "_id",
                as: "customer",
              },
            },

            // 🔹 Lookup Request Type
            {
              $lookup: {
                from: "cmcTemplates",
                localField: "warnings.requestTypeId",
                foreignField: "_id",
                as: "requestType",
              },
            },

            // 🔹 Lookup Warning Reason
            {
              $lookup: {
                from: "warningReasons",
                localField: "warningReasonId",
                foreignField: "_id",
                as: "warningReason",
              },
            },
            ...req.dbPagination,
          ])
          .toArray(),
      ]);

      return this.json(req, res, 200, { data, count: count });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public signWarning = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const FormBody = req.body;

      const disciplinary = await this.collections.disciplinaries.findOne(
        { _id: this.toObjectId(id) },
        { projection: { warnings: 1 } },
      );
      if (!disciplinary || !disciplinary.warnings?.length) {
        throw new Error("No warnings found");
      }

      const lastWarning =
        disciplinary?.warnings[disciplinary.warnings.length - 1];

      await this.collections.disciplinaries.updateOne(
        { _id: this.toObjectId(id) },
        {
          $set: {
            "warnings.$[last].userSign": FormBody.userSign,
            "warnings.$[last].userSignDate":
              FormBody.userSignDate || new Date(),
          },
        },
        {
          arrayFilters: [{ "last.warningNumber": lastWarning.warningNumber }],
        },
      );

      return this.json(req, res, 200, {
        message: "Warning signed successfully",
      });
    } catch (error) {
      return this.jsonError(res, 400, this.__component, "wrong", error);
    }
  };

    public downloadWarning = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { disciplinary_id, warning_number, download } = req.query;

      if (!disciplinary_id || !warning_number) {
        return this.json(req, res, 400, {
          message: "disciplinary_id and warning_number are required",
        });
      }

      const disciplinaryId =
        typeof disciplinary_id === "string"
          ? this.toObjectId(disciplinary_id)
          : disciplinary_id;

      const [result] = await this.collections.disciplinaries
        .aggregate([
          {
            $match: { _id: disciplinaryId },
          },
          {
            $unwind: "$warnings",
          },
          {
            $match: {
              "warnings.warningNumber": warning_number,
            },
          },
          {
              $lookup: {
                from: "cmcTemplates",
                localField: "warnings.requestTypeId",
                foreignField: "_id",
                as: "template",
              },
            },
          {
            $project: {
              _id: 1,
              profileId: 1,
              warning: "$warnings",
              template: { $arrayElemAt: ["$template.name", 0] },
            },
          },
        ])
        .toArray();

      if (!result) {
        return this.json(req, res, 404, {
          message: "Warning not found",
        });
      }
      if(download){
        const finalHtml = this.appendSignatures(
          result.warning.generatedTemplate || "",
          result.warning,
        );
  
        const pdfPath = await this.generatePdf(
          finalHtml,
          result.warning.warningNumber + ".pdf",
          "warnings",
        );
  
        return this.json(req, res, 200, {
          data: { url: pdfPath, templateName: result.template},
        });
      }
      const signature = {
        adminSign: result.warning.adminSign || "",
        adminSignDate: result.warning.adminSignDate || null,
        userSign: result.warning.userSign || "",
        userSignDate: result.warning.userSignDate || null,
      };

      return this.json(req, res, 200, {
          data: { templateName: result.template, template: result.warning.generatedTemplate, signature },
        });

    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };


}
