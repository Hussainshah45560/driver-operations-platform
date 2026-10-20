import { ObjectId } from "mongodb";
import { BaseController } from "../../../core";
import { Filter_Options, Request, Response } from "../../../__types";

export default class UserController extends BaseController {
  public __component: string = "users";
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
      roleId: { type: "objectId", filter: "$in" },
    },
  };

  public me = async (req: Request, res: Response): Promise<Response> => {
    try {
      const defaultFilter = { _id: this.toObjectId(req.user._id) };
      this.getAggrigation(req, this.filter_options, defaultFilter);
      const myProfile = await this.collections.users
        .aggregate([
          {
            $lookup: {
              from: "userProfiles",
              localField: "_id",
              foreignField: "userId",
              as: "profile",
            },
          },
          // {
          //   $lookup: {
          //     from: "applications",
          //     localField: "_id",
          //     foreignField: "userId",
          //     as: "application",
          //   },
          // },
          ...req.aggregations,
          {
            $project: {
              _id: 1,
              firstName: { $arrayElemAt: ["$profile.firstName", 0] },
              lastName: { $arrayElemAt: ["$profile.lastName", 0] },
              userName: { $arrayElemAt: ["$profile.userName", 0] },
              phoneNumber: { $arrayElemAt: ["$profile.phoneNumber", 0] },
              alternativeNumber: {
                $arrayElemAt: ["$profile.alternativeNumber", 0],
              },
              email: { $arrayElemAt: ["$profile.email", 0] },
              physicalAddress: {
                $arrayElemAt: ["$profile.physicalAddress", 0],
              },
              postalAddress: { $arrayElemAt: ["$profile.postalAddress", 0] },
              // application: { $arrayElemAt: ["$application", 0] },
            },
          },
        ])
        .toArray();
      return this.json(req, res, 200, { data: myProfile[0] });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public updateProfile = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { profileId } = req.params;
      const FormBody = req.body;
      if (profileId) {
        const updateProfile = {
          firstName: FormBody.firstName,
          lastName: FormBody.lastName,
          userName: FormBody.userName,
          email: FormBody.email,
          phoneNumber: FormBody.phoneNumber,
          alternativeNumber: FormBody.alternativeNumber,
          physicalAddress: {
            ...FormBody.physicalAddress,
            regionId: this.toObjectId(FormBody.physicalAddress.regionId),
          },
          postalAddress: {
            ...FormBody.postalAddress,
            regionId: this.toObjectId(FormBody.postalAddress.regionId),
          },
        };
        await this.collections.userProfiles.updateOne(
          { _id: this.toObjectId(profileId) },
          {
            $set: {
              ...updateProfile,
            },
          },
        );
        if (req.user.role?.name !== "Admin") {
          const app = await this.collections.applications.findOne({
            profileId: this.toObjectId(profileId),
          });
          if (app?.applicationStatus != "completed") {
            await this.collections.applications.updateOne(
              { _id: app?._id },
              { $set: { "stepStatus.step1": "confirmed" } },
            );
          }
        }
        return this.json(req, res, 200, {
          message: `Profile updated Successfully`,
        });
      }
      return this.jsonError(
        res,
        400,
        this.__component,
        "invalid",
        "Profile not found",
      );
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public list = async (req: Request, res: Response): Promise<Response> => {
    try {
      const defaultFilter = { isDeleted: { $ne: true } };
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
            const roleIds = roleDocs.map((r) => r._id);
            defaultFilter["roleId"] = { $in: roleIds };
          }
        }
      }
      this.getAggrigation(req, this.filter_options, defaultFilter);
      const [data, count] = await Promise.all([
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
              $match: {
                profile: {
                  $not: { $elemMatch: { email: "developer@loopbrackets.com" } },
                },
                _id: { $ne: new ObjectId(req.user._id) },
              },
            },
            ...req.aggregations,
            {
              $project: {
                _id: 1,
                firstName: { $arrayElemAt: ["$profile.firstName", 0] },
                lastName: { $arrayElemAt: ["$profile.lastName", 0] },
                userName: { $arrayElemAt: ["$profile.userName", 0] },
                phoneNumber: { $arrayElemAt: ["$profile.phoneNumber", 0] },
                email: { $arrayElemAt: ["$profile.email", 0] },
                isActive: 1,
              },
            },
          ])
          .toArray(),
        this.collections.users
          .aggregate([...req.aggregations, ...req.dbPagination])
          .toArray(),
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
      this.getAggrigation(req, this.filter_options, defaultFilter);
      const [user] = await Promise.all([
        await this.collections.users
          .aggregate([
            ...req.aggregations,
            {
              $lookup: {
                from: "userProfiles",
                localField: "_id",
                foreignField: "userId",
                as: "profile",
              },
            },
            {
              $lookup: {
                from: "roles",
                localField: "roleId",
                foreignField: "_id",
                as: "role",
              },
            },
            {
              $project: {
                _id: 1,
                firstName: { $arrayElemAt: ["$profile.firstName", 0] },
                lastName: { $arrayElemAt: ["$profile.lastName", 0] },
                userName: { $arrayElemAt: ["$profile.userName", 0] },
                phoneNumber: { $arrayElemAt: ["$profile.phoneNumber", 0] },
                alternativeNumber: {
                  $arrayElemAt: ["$profile.alternativeNumber", 0],
                },
                email: { $arrayElemAt: ["$profile.email", 0] },
                roleId: { $arrayElemAt: ["$role._id", 0] },
                roleName: { $arrayElemAt: ["$role.name", 0] },
                physicalAddress: {
                  $arrayElemAt: ["$profile.physicalAddress", 0],
                },
                postalAddress: { $arrayElemAt: ["$profile.postalAddress", 0] },
                isActive: 1,
              },
            },
          ])
          .toArray(),
      ]);
      if (user) {
        return this.json(req, res, 200, { data: user[0] });
      }
      return this.jsonError(res, 400, this.__component, "get");
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public createOrUpdate = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const FormBody = req.body;
      if (id) {
        console.log(id)
        const existingUser = await this.collections.users.findOne({
          _id: { $ne: this.toObjectId(id) }, // exclude current user
          $or: [
            { phoneNumber: FormBody.phoneNumber },
            { email: FormBody.email },
          ],
        });
        if (existingUser) {
          return this.jsonError(
            res,
            400,
            this.__component,
            "User already exists",
          );
        }
        const checkUser = await this.collections.users
          .aggregate([
            {
              $match: { _id: this.toObjectId(id) },
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
                _id: 1,
                profileId: { $arrayElemAt: ["$profile._id", 0] },
              },
            },
          ])
          .next();
        if (!checkUser) {
          return this.jsonError(
            res,
            400,
            this.__component,
            "User does not exist",
          );
        }
        const updateProfile = {
          firstName: FormBody.firstName,
          lastName: FormBody.lastName,
          userName: FormBody.userName,
          email: FormBody.email,
          phoneNumber: FormBody.phoneNumber,
          alternativeNumber: FormBody.alternativeNumber,
          physicalAddress: {
            ...FormBody.physicalAddress,
            regionId: this.toObjectId(FormBody.physicalAddress.regionId),
          },
          postalAddress: {
            ...FormBody.postalAddress,
            regionId: this.toObjectId(FormBody.postalAddress.regionId),
          },
        };

        await this.collections.users.updateOne(
          { _id: checkUser._id },
          {
            $set: {
              roleId: this.toObjectId(FormBody.roleId),
              email: FormBody.email,
              phoneNumber: FormBody.phoneNumber,
            },
          },
        );

        await this.collections.userProfiles.updateOne(
          { _id: checkUser.profileId },
          {
            $set: {
              ...updateProfile,
            },
          },
        );
      } else {
        const existingUser = await this.collections.users.findOne({
          $or: [
            { phoneNumber: FormBody.phoneNumber },
            { email: FormBody.email },
          ],
        });
        if (existingUser) {
          return this.jsonError(
            res,
            400,
            this.__component,
            "User already exists",
          );
        }
        let hashedPassword: { password: string; salt: string } | undefined;
        if (!id) {
          const formWithPassword = FormBody as typeof FormBody & {
            password: string;
          };
          const hashed = this.passwordEn(formWithPassword.password);
          hashedPassword = hashed;
        }
        const newUser = {
          _id: new ObjectId(),
          email: FormBody.email,
          phoneNumber: FormBody.phoneNumber,
          roleId: this.toObjectId(FormBody.roleId),
          isActive: true,
        };
        const insertedUser = await this.collections.users.insertOne({
          ...newUser,
          ...(hashedPassword ? hashedPassword : {}),
        });
        const newProfile = {
          _id: new ObjectId(),
          userId: insertedUser.insertedId,
          firstName: FormBody.firstName,
          lastName: FormBody.lastName,
          userName: FormBody.userName,
          email: FormBody.email,
          phoneNumber: FormBody.phoneNumber,
          alternativeNumber: FormBody.alternativeNumber,
          physicalAddress: {
            ...FormBody.physicalAddress,
            regionId: this.toObjectId(FormBody.physicalAddress.regionId),
          },
          postalAddress: {
            ...FormBody.postalAddress,
            regionId: this.toObjectId(FormBody.postalAddress.regionId),
          },
        };
        await this.collections.userProfiles.insertOne(newProfile);
      }

      return this.json(req, res, 200, {
        message: `User ${id ? "Updated" : "Saved"} Successfully`,
      });
    } catch (error) {
      return this.jsonError(res, 400, this.__component, "wrong", error);
    }
  };

  public delete = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      if (id) {
        const user = await this.collections.users.findOne({
          _id: new ObjectId(id),
        });
        if (!user) {
          return this.jsonError(
            res,
            400,
            this.__component,
            "User does not exist",
          );
        }
        await this.collections.users.updateOne(
          {
            _id: user._id,
          },
          { $set: { isDeleted: true } },
        );
        await this.collections.applications.updateOne(
          {
            userId: user._id,
          },
          { $set: { isDeleted: true } },
        );
        await this.appLog(req, this.__component, "Delete", new ObjectId(id));
        return this.json(req, res, 200, {
          message: `User Deleted Successfully`,
        });
      } else {
        return this.jsonError(res, 400, this.__component, "delete");
      }
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public setUserStatus = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      if (id) {
        const user = await this.collections.users.findOne({
          _id: new ObjectId(id),
        });
        if (!user) {
          return this.jsonError(
            res,
            400,
            this.__component,
            "User does not exist",
          );
        }
        await this.collections.users.updateOne(
          {
            _id: new ObjectId(user._id),
          },
          { $set: { isActive: !user.isActive } },
        );
        await this.appLog(
          req,
          this.__component,
          "Active User",
          new ObjectId(id),
        );
        return this.json(req, res, 200, {
          message: `User ${
            !user.isActive ? "Activated" : "Deactivated"
          } Successfully`,
        });
      } else {
        return this.jsonError(
          res,
          400,
          this.__component,
          "activate/deactivate",
        );
      }
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };

  public changePassword = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const FormBody = req.body;
      const user = await this.collections.users?.findOne(
        { _id: new ObjectId(req.user._id) },
        { projection: { password: 1, salt: 1 } },
      );
      if (user) {
        const oldPassword = this.passwordEn(FormBody.oldPassword, user.salt);
        if (oldPassword.password === user.password) {
          const password = this.passwordEn(FormBody.newPassword);
          await this.collections.users?.updateOne(
            { _id: new ObjectId(req.user._id) },
            { $set: { password: password.password, salt: password.salt } },
          );
          return this.json(req, res, 200, {
            message: "Password updates successfully",
          });
        }
      }
      return this.jsonError(
        res,
        400,
        this.__component,
        "You provided wrong password",
      );
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };
}
