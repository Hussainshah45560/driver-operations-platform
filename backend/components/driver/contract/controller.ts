import { BaseController } from "../../../core";
import { Filter_Options, Request, Response } from "../../../__types";
import { SignNow } from "../../../helpers/signNow";

export default class ContractController extends BaseController {
  public __component: string = "contracts";
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
      const defaultFilter = {
        isDeleted: { $ne: true },
        userId: req.user._id,
      };
      this.getAggrigation(req, this.filter_options, defaultFilter);
      const [data, count] = await Promise.all([
        this.collections.contracts
          .aggregate([
            {
              $lookup: {
                from: "customers",
                localField: "customerId",
                foreignField: "_id",
                as: "customer",
              },
            },
            ...req.aggregations,
            {
              $project: {
                _id: 1,
                employer: { $arrayElemAt: ["$customer.name", 0] },
                startDate: 1,
                endDate: 1,
                status: 1,
                customerId: 1,
                recruitmentId: 1,
                applicationId: 1,
                signNowDocumentId: 1,
                adminSigned:1,
                userSigned:1,
                userInviteLink:1,
              },
            },
          ])
          .toArray(),
        this.collections.contracts.aggregate([...req.dbPagination]).toArray(),
      ]);
      return this.json(req, res, 200, { data, count: count });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public getContract = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const defaultFilter = { _id: this.toObjectId(id)};
      this.getAggrigation(req, this.filter_options, defaultFilter);
      const data = await this.collections.contracts
        .aggregate([
          {
            $lookup: {
              from: "cmcTemplates",
              localField: "templateId",
              foreignField: "_id",
              as: "template",
            },
          },
          ...req.aggregations,
          {
            $project: {
              _id: 1,
              template: "$templateContent",
              templateName: { $arrayElemAt: ["$template.name", 0] },
              signNowDocumentId: 1,
              signature: {
                adminSign: "$adminSign",
                adminSignDate: "$adminSignDate",
                userSign: "$userSign",
                userSignDate: "$userSignDate",
              },
            },
          },
        ])
        .toArray();

      if (!data || data.length === 0) {
        return this.jsonError(
          res,
          404,
          this.__component,
          "No Contract Generated for this user",
        );
      }

      return this.json(req, res, 200, { data: { data: data[0] } });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };
  public signContract = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const FormBody = req.body;
      const existingContract = await this.collections.contracts.findOne({
        _id: this.toObjectId(id),
      });
      if (!existingContract) {
        return this.jsonError(
          res,
          400,
          this.__component,
          "Contract does not exist",
        );
      }
      const updateFields: any = {};

      updateFields.userSign = FormBody.userSign;
      updateFields.userSignDate = FormBody.userSignDate || new Date();
      updateFields.status = "signed";

      // Prevent empty update
      if (Object.keys(updateFields).length === 0) {
        return this.jsonError(
          res,
          400,
          this.__component,
          "Invalid role or no data to update",
        );
      }

      await this.collections.contracts.updateOne(
        { _id: existingContract._id },
        { $set: updateFields },
      );

      const signedContract = await this.collections.contracts.findOne({
        _id: existingContract._id,
      });
      if ((signedContract?.userSign != null && signedContract?.userSign != "") || (signedContract?.signNowDocumentId && signedContract?.signNowDocumentId != null)) {
        const application = await this.collections.applications.findOne(
          { userId: req.user._id },
          { projection: { _id: 1 } },
        );
        await this.collections.applications.updateOne(
          { _id: application?._id },
          { $set: { applicationStatus: "in contract" } },
        );

        const role = await this.collections.roles.findOne({ name: "Driver" });
        await this.collections.users.updateOne(
          { _id: req.user._id },
          { $set: { roleId: role?._id } },
        );
      }

      return this.json(req, res, 200, {
        message: "Contract Signed Successfully",
      });
    } catch (error) {
      return this.jsonError(res, 400, this.__component, "wrong", error);
    }
  };

  public downloadContract = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      
      const { id } = req.params;
      const contract = await this.collections.contracts.aggregate([
        {
          $match: {
            _id: this.toObjectId(id),
          },
        },
        {
          $lookup: {
            from: "cmcTemplates",
            localField: "templateId",
            foreignField: "_id",
            as: "template",
          },
        },
        {
          $lookup: {
            from: "userProfiles",
            localField: "userId",
            foreignField: "_id",
            as: "userProfile",
          },
        },
        {
          $project: {
            _id: 1,
            templateContent: "$templateContent",
            templateName: { $arrayElemAt: ["$template.name", 0] },
            employeeName: { $concat: [{ $arrayElemAt: ["$userProfile.firstName", 0] }, " ", { $arrayElemAt: ["$userProfile.lastName", 0] }] },
            adminSign:1,
            adminSignDate:1,
            userSign:1,
            userSignDate:1,
          },
        },
      ]).toArray();
        if (!contract || contract.length === 0) {
        return this.jsonError(res, 404, this.__component, "Contract not found");
      }
      const finalHtml = this.appendSignatures(contract[0].templateContent, contract[0]);
      const pdfPath = await this.generatePdf(
        finalHtml,
        contract[0].employeeName + contract[0]._id + ".pdf",
        "contracts",
      );
      return this.json(req, res, 200, {
        data: { url: pdfPath, templateName: contract[0].templateName },
      });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public downloadSignNowContract = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { id } = req.params;
     const contract = await this.collections.contracts.aggregate([
        {
          $match: {
            _id: this.toObjectId(id),
          },
        },
        {
          $lookup: {
            from: "cmcTemplates",
            localField: "templateId",
            foreignField: "_id",
            as: "template",
          },
        },
        {
          $project: {
            _id: 1,
            templateName: { $arrayElemAt: ["$template.name", 0] },
            signNowDocumentId: 1,
          },
        },
      ]).toArray();
      if (!contract || contract.length === 0) {
        return this.jsonError(res, 404, this.__component, "Contract not found");
      }
      if (!contract[0].signNowDocumentId) {
        return this.jsonError(res, 400, this.__component, "Contract not signed via SignNow");
      }
      const signNow = new SignNow()
      const url = await signNow.downloadDocument(contract[0].signNowDocumentId);
      return this.json(req, res, 200, { data: { url: url,templateName:contract[0].templateName } });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  }
}
