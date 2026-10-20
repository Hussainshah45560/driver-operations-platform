import { ObjectId } from "mongodb";
import { Request } from "../__types";
import DataBase from "../core/Database";

type TokenAndMenuResult = {
  accessToken: string;
  navigation: any[];
};
export default class UserHelper extends DataBase {
  static hasPermissions = (
    req: Request,
    component: string,
    permission: string
  ): boolean => {
    if (
      req.user.role?.permissions[component] &&
      req.user.role?.permissions[component][permission] == true
    ) {
      return true;
    }
    return false;
  };

  constructor() {
    super();
  }

  public getTokenAndMenu = async (
    _id: ObjectId
  ): Promise<TokenAndMenuResult> => {
    const user = await this.collections.users
      .aggregate([
        { $match: { _id: _id } },
        {
          $lookup: {
            from: "roles",
            localField: "roleId",
            foreignField: "_id",
            as: "role",
          },
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
              $lookup: {
                from: "documents",
                let: {
                  userId: "$_id",
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$userId", "$$userId"] },
                          { $eq: ["$type", "Selfie"] },
                        ],
                      },
                    },
                  },
                  { $limit: 1 }, // ensure only one document
                ],
                as: "selfieDocument",
              },
            },
        {
          $project: {
            _id: 1,
            name: {
              $concat: [
                { $arrayElemAt: ["$profile.firstName", 0] },
                " ",
                { $arrayElemAt: ["$profile.lastName", 0] },
              ],
            },
            phoneNumber:1,
            profileId: { $arrayElemAt: ["$profile._id", 0] },
            email: { $arrayElemAt: ["$profile.email", 0] },
            roleId: 1,
            role: { $arrayElemAt: ["$role", 0] },
            isActive: 1,
          },
        },
      ])
      .toArray();
    if (user.length === 0) {
      return { accessToken: "", navigation: [] };
    }
    const accessToken = this.signJwt(user[0]);
    const permissions = user[0].role?.permissions || {};
    const menuCode =
      ["Driver", "Other","Applicant"].indexOf(user[0].role.name) > -1
        ? "user_menu"
        : "admin_menu";
    const menu = await this.collections.appSettings.findOne({
      code: menuCode,
    });
    if (!menu) {
      throw new Error("Menu not found");
    }
    const app = await this.collections.applications.findOne({ userId: user[0]._id });
    const userCategory = app && app.applicationCategory ? app.applicationCategory : null;
    const navigation = await this.filterMenuByPermissions(
      menu.value,
      permissions,
      userCategory
    );
    return { accessToken, navigation };
  };

  public async filterMenuByPermissions(menu, permissions, categoryAccess) {
    const menuArray = Array.isArray(menu) ? menu : [menu];
    const results = await Promise.all(
      menuArray.map(async (item) => {
        if (item.children) {
          const filteredChildren = await this.filterMenuByPermissions(
            item.children,
            permissions,
            categoryAccess
          );
          return filteredChildren.length > 0
            ? { ...item, children: filteredChildren }
            : null;
        }

        const perm = permissions[item.code];
        const hasPermission = perm && perm.view;
        const categoryAllowed =
        !item.categoryAccess || item.categoryAccess.includes(categoryAccess);
         return hasPermission && categoryAllowed ? item : null;
      })
    );

    return results.filter(Boolean);
  }
}
