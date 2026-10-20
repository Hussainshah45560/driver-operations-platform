import { BaseController } from "../../core";
import { Request, Response } from "../../__types";
import { SignNow } from "../../helpers/signNow";

export default class WebhookController extends BaseController {
  public __component: string = "webhook";

  //SignNow callback handler

  public signNowWebhook = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { meta, content } = req.body;
      switch (meta?.event) {
        case "document.fieldinvite.signed":
          await this.handleSignerSigned(content);
          break;

        case "document.complete":
          await this.handleDocumentComplete(content);
          break;

        default:
          console.log("⚠️ Unhandled event:", meta?.event);
      }
      return this.json(req, res, 200, { message: "Webhook received" });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  private handleSignerSigned = async (content: any) => {
    const { document_id, signer, status } = content;
    if (status !== "fulfilled") return;
    const doc = await this.collections.contracts.findOne({
      signNowDocumentId: document_id,
    });

    if (!doc) {
      console.log("Contract not found");
      return;
    }
    const signerEmail = signer.includes("-") ? signer.substring(0, signer.lastIndexOf("-")) : signer;
    if (doc.adminEmail === signerEmail) {
      const sign = new SignNow();
      let linkResult;
      if (doc.userInviteId && doc.signNowDocumentId) {
         linkResult = await sign.getEmbedInviteLink(
          doc.signNowDocumentId,
          doc.userInviteId,
        );
      }
      await this.collections.contracts.updateOne(
        { _id: doc._id },
        { $set: { adminSigned: true, userInviteLink: linkResult?.data.link ?? null } },
      );
    } else if (doc.userEmail === signerEmail) {
      await this.collections.contracts.updateOne(
        { _id: doc._id },
        { $set: { userSigned: true } },
      );
    } else {
      console.log("Unknown signer:", signer);
    }
  };

  private handleDocumentComplete = async (content: any) => {
    const { document_id } = content;

    const doc = await this.collections.contracts.findOne({
      signNowDocumentId: document_id,
    });

    if (!doc) {
      console.log("Contract not found");
      return;
    }

    await this.collections.contracts.updateOne(
      { _id: doc._id },
      { $set: { status: "signed" } },
    );

    if (
      (doc?.adminSigned && doc?.userSigned) ||
      (doc?.signNowDocumentId && doc?.signNowDocumentId != null)
    ) {
      const application = await this.collections.applications.findOne(
        { userId: doc.userId },
        { projection: { _id: 1 } },
      );
      await this.collections.applications.updateOne(
        { _id: application?._id },
        { $set: { applicationStatus: "in contract" } },
      );

      const role = await this.collections.roles.findOne({ name: "Driver" });
      await this.collections.users.updateOne(
        { _id: doc.userId },
        { $set: { roleId: role?._id } },
      );
    }
  };

  // webhook handler for dot360 verification results

  public dot360Webhook = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      console.log(req)
      const { content } = req.body;
      const userProfile = await this.collections.userProfiles.findOne({ "verifications.ref": content.reference });
      if (!userProfile) {
        console.log("User profile not found for reference:", content.reference);
        return this.json(req, res, 404, { message: "User profile not found" });
      }

      await this.collections.userProfiles.updateOne(
        { _id: userProfile._id,  "verifications.ref": content.reference },
        { $set: { "verifications.$.status": content.status } }
      );
      return this.json(req, res, 200, { message: "Webhook received" });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    } 
  }

}
