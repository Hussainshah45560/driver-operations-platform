import { ObjectId } from "mongodb";
import { Request, Response } from "../../__types";
import { BaseController } from "../../core";
import UserHelper from "../../helpers/user";
import Utility from "../../helpers/utility";
import { sendSMS } from "../../helpers/sms";
import { EmailHelper } from "../../helpers/email";
import config from "../../config/config";

export default class AuthController extends BaseController {
  public __component: string = "auth";
  protected userHelper: UserHelper = new UserHelper();
  public login = async (req: Request, res: Response): Promise<Response> => {
    const FormBody: { phoneNumber: string; password: string; email: string } =
      req.body;
    const field = !FormBody.email.includes("@")
      ? { phoneNumber: FormBody.email }
      : { email: FormBody.email };
    const user = await this.collections.users.findOne({
      ...field,
      isActive: true,
    });
    if (user) {
      if (user.isActive) {
        const password = this.passwordEn(FormBody.password, user.salt);
        if (password.password === user.password) {
          const result = await this.userHelper.getTokenAndMenu(user._id);
          req.user = user;
          await this.appLog(req, this.__component, "Login");
          return this.json(req, res, 200, {
            data: { navigation: result.navigation },
            message: "Login successful",
            accessToken: result.accessToken,
          });
        }
      } else {
        return this.jsonError(res, 400, this.__component, "Access is revoked");
      }
    } else {
      return this.jsonError(
        res,
        400,
        this.__component,
        "Login information is incorrect",
      );
    }
    return this.jsonError(
      res,
      400,
      this.__component,
      "Login information is incorrect",
    );
  };

  public register = async (req: Request, res: Response): Promise<Response> => {
    try {
      const FormBody = req.body;
      const normalizedPhone = this.normalizeToLocal(FormBody.phoneNumber);
      if (normalizedPhone == "") {
        return this.jsonError(
          res,
          400,
          this.__component,
          "Cellphone number is not valid",
        );
      }
      const existingUser = await this.collections.users.findOne({
        phoneNumber: normalizedPhone,
      });
      if (existingUser) {
        return this.jsonError(
          res,
          400,
          this.__component,
          "Cellphone number already exists",
        );
      }
      const password = this.passwordEn(FormBody.password);
      const role = await this.collections.roles.findOne({ name: "Applicant" });
      if (role) {
        FormBody["roleId"] = role._id;
      }
      const userData = {
        _id: new ObjectId(),
        phoneNumber: normalizedPhone,
        roleId: FormBody.roleId,
        isActive: true,
      };
      const createdUser = await this.collections.users.insertOne({
        ...userData,
        ...password,
      });
      const profileData = {
        _id: new ObjectId(),
        userId: createdUser.insertedId,
        firstName: FormBody.firstName,
        lastName: FormBody.lastName,
        phoneNumber: normalizedPhone,
      };
      await this.collections.userProfiles.insertOne({ ...profileData });
      return this.json(req, res, 200, {
        message: "Registration successful",
      });
    } catch (error) {
      return this.jsonError(res, 400, this.__component, "wrong", error);
    }
  };

  public forgetPassword = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const FormBody = req.body;
    const currentDate = new Date();
    const validTill = new Date(
      currentDate.setHours(currentDate.getHours() + 24),
    );
    const field = FormBody.phoneNumber
      ? { phoneNumber: FormBody.phoneNumber }
      : FormBody.email
        ? { email: FormBody.email }
        : null;
    const user = await this.collections.users
      .aggregate([
        {
          $match: { ...field, isActive: true },
        },
        {
          $lookup: {
            from: "userProfiles",
            localField: "_id",
            foreignField: "userId",
            as: "profile",
          },
        },
        {
          $project: {
            phoneNumber: 1,
            email: { $arrayElemAt: ["$profile.email", 0] },
            name: {
              $concat: [
                { $arrayElemAt: ["$profile.firstName", 0] },
                " ",
                { $arrayElemAt: ["$profile.lastName", 0] },
              ],
            },
          },
        },
        { $limit: 1 },
      ])
      .toArray();
    if (user.length == 1) {
      const util = new Utility();
      const code = util.randomString(5, true);
      if (user[0].phoneNumber) {
        if (global["config"].sendSMS) {
          const sms = new sendSMS();
          await sms.sendSmsUsingApi(
            user[0].phoneNumber,
            `Your One-Time OTP is: ${code}`,
          );
        }
      }
      if (user[0].email) {
        const emailType = await this.collections.emailTypes.findOne({
          used_for: "forget_password_otp_email",
        });
        const template = await this.collections.emailTemplates.findOne({
          emailTypeId: emailType?._id,
          isActive: true,
        });
        const email = new EmailHelper();
        if (global["config"].sendEmails) {
          const data = {
            user_name: user[0].name,
            code: code,
          };
          const message_subject =
            "Online Application - OTP to reset your password";
          const html = this.replaceTemplateData(template?.content || "", data);

          const mailOptions = {
            to: user[0].email,
            from: "ds@cmcglobal.co.za",
            subject: message_subject,
            text: html,
          };
          await email.sendEmailUsingSendGrid(mailOptions);
        }
      }
      await this.collections.users.updateOne(
        { _id: user[0]._id },
        {
          $set: {
            forgetPassword: {
              code: Number(code),
              validTill: validTill,
            },
          },
        },
      );
    } else {
      return this.jsonError(res, 400, this.__component, "User not found");
    }

    return this.json(req, res, 200, {
      message: "You will receive an email/sms shortly",
    });
  };

  public verifyCode = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const FormBody = req.body;
    const field = FormBody.phoneNumber
      ? { phoneNumber: FormBody.phoneNumber }
      : FormBody.email
        ? { email: FormBody.email }
        : null;
    const user = await this.collections.users.findOne({
      ...field,
      isActive: true,
    });
    if (user) {
      const date = new Date();
      if (
        user.forgetPassword &&
        user.forgetPassword.code == FormBody.code &&
        date <= user.forgetPassword.validTill
      ) {
        return this.json(req, res, 200, { data: { success: true } });
      } else {
        return this.jsonError(
          res,
          400,
          this.__component,
          "Code has been expired",
        );
      }
    } else {
      return this.jsonError(res, 400, this.__component, "User not found");
    }
  };

  public setPassword = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const FormBody = req.body;
    const field = FormBody.phoneNumber
      ? { phoneNumber: FormBody.phoneNumber }
      : FormBody.email
        ? { email: FormBody.email }
        : null;
    const password = this.passwordEn(FormBody.password);
    const user = await this.collections.users.findOne({
      ...field,
      isActive: true,
    });
    if (user) {
      req.user = user;
      const date = new Date();
      if (
        user.forgetPassword &&
        user.forgetPassword.code == FormBody.code &&
        date <= user.forgetPassword.validTill
      ) {
        await this.collections.users.updateOne(
          { _id: user._id },
          { $unset: { forgetPassword: "" }, $set: { ...password } },
        );
        await this.appLog(
          req,
          this.__component,
          "Set Password",
          user._id,
          FormBody,
        );
      } else {
        return this.jsonError(
          res,
          400,
          this.__component,
          "Code has been expired",
        );
      }
    } else {
      return this.jsonError(res, 400, this.__component, "User not found");
    }
    return this.json(req, res, 200, {
      message: "Login with your credentials",
    });
  };

  public isLinkValid = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const query = req.query;
    if (!query.code || query.code == undefined) {
      return this.jsonError(
        res,
        400,
        this.__component,
        "query parameter is not defined",
      );
    }
    const util = new Utility();
    const decipher = util.decryptData(query.code);
    const validData = new URLSearchParams(decipher);
    const userID = validData.get("userId");
    const code = validData.get("code");
    if (!userID || !ObjectId.isValid(userID)) {
      throw new Error("Invalid or missing userId");
    }
    const user = await this.collections.users.findOne({
      _id: ObjectId.createFromHexString(userID) ?? "",
    });
    if (user) {
      if (user.forgetPassword && user.forgetPassword.code == Number(code)) {
        const date = new Date();
        if (user.forgetPassword && date <= user.forgetPassword.validTill) {
          return this.json(req, res, 200, { data: { success: true } });
        } else {
          return this.json(req, res, 200, { data: { success: false, sendAgain: true, message: "Your code has expired after 24 hours. Please request a new email to receive a fresh link." } });
        }
      } else {
        return this.json(req, res, 200, { data: { success: false, message: "Password has already been set." } });
      }
    } else {
      return this.json(req, res, 200, { data: { success: false } });
    }
  };

  public resendEmail = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const util = new Utility();
    const decipher = util.decryptData(req.query.code);
    const validData = new URLSearchParams(decipher);
    const userID = validData.get("userId");
    const email = validData.get("email");
    const code = validData.get("code");
    if (!userID || !ObjectId.isValid(userID)) {
      throw new Error("Invalid or missing userId");
    }
    const user = await this.collections.users.findOne({
      _id: this.toObjectId(userID) ?? "",
    });
    if (user) {
      if (user.forgetPassword && user.forgetPassword.code == Number(code)) {
        const date = new Date();
        if (user.forgetPassword && date >= user.forgetPassword.validTill) {
          const currentDate = new Date();
          const validTill = new Date(
            currentDate.setHours(currentDate.getHours() + 24),
          );
          const util = new Utility();
          const code = util.randomString(5, true);
          const url = `userId=${userID}&code=${code}&email=${email}`;
          const cipher = util.encryptData(url);
          const baseUrl =
            config.baseUrl != ""
              ? `${config?.baseUrl}`
              : "http://localhost:4200/";
          const createPasswordLink = `${baseUrl}set-password?&code=${cipher}`;
          const forgetPassword = {
            code: Number(code),
            validTill: validTill,
            link: createPasswordLink,
          };
          await this.collections.users.updateOne(
            { _id: this.toObjectId(userID) },
            { $set: { forgetPassword: forgetPassword } },
          );
          return this.json(req, res, 200, { data: { success: true } });
        } else {
          return this.json(req, res, 200, {
            message: "Link is not expired yet"
          });
        }
      } else {
        return this.json(req, res, 200, { data: { success: false } });
      }
    } else {
      return this.json(req, res, 200, { data: { success: false } });
    }
  };

  public createPassword = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const FormBody = req.body;
    const util = new Utility();
    const decipher = util.decryptData(FormBody.code);
    const validData = new URLSearchParams(decipher);
    const userID = validData.get("userId");
    const code = validData.get("code");
    if (!userID || !ObjectId.isValid(userID)) {
      throw new Error("Invalid or missing userId");
    }
    const user = await this.collections.users.findOne({
      _id: this.toObjectId(userID) ?? "",
    });
    if (user) {
      const password = this.passwordEn(FormBody.password);
      if (user.forgetPassword && user.forgetPassword.code == Number(code)) {
        const date = new Date();
        if (user.forgetPassword && date <= user.forgetPassword.validTill) {
          await this.collections.users.updateOne(
            { _id: this.toObjectId(userID) },
            { $unset: { forgetPassword: "" }, $set: { ...password } },
          );
          return this.json(req, res, 200, { message: "Password created successful", });
        } else {
          return this.json(req, res, 200, {
            message: "Link has been Expired"
          });
        }
      } else {
        return this.json(req, res, 200, { data: { success: false } });
      }
    } else {
      return this.json(req, res, 200, { data: { success: false } });
    }
  };

  private normalizeToLocal = (phone: string): string => {
    let cleaned = phone.replace(/\D/g, ""); // remove spaces, +, dashes

    // If starts with 27 → convert to 0 format
    if (cleaned.startsWith("27")) {
      cleaned = "0" + cleaned.substring(2);
    }

    // Must start with 0 and be 10 digits
    if (!cleaned.startsWith("0") || cleaned.length !== 10) {
      return "";
    }

    return cleaned;
  };
}
