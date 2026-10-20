import { route } from "../../../__types";
import { changePasswordSchema, userSchema } from "../../../models/requestBody";
import * as Controller from './controller';
const controller: Controller.default = new Controller.default;


const routes: route[] = [
    { path: controller.__component + '/me', method: "get", function: controller.me, private: true},
    { path: controller.__component + '/updatePassword', method: "put", function: controller.changePassword, private: true, validationSchema:changePasswordSchema },
    { path: controller.__component + '/updateProfile/:profileId', method: "put", function: controller.updateProfile, private: true, validationSchema:(req) => userSchema(req.params.id)},
    
    { path: controller.__component + '/', method: "get", function: controller.list, private: true, perm_component: "users", permission: "view" },
    { path: controller.__component + '/:id', method: "get", function: controller.get, private: true, perm_component: "users", permission: "view" },
    { path: controller.__component + '/', method: "post", function: controller.createOrUpdate, private: true, perm_component: "users", permission: "add", validationSchema:userSchema() },
    { path: controller.__component + '/:id', method: "put", function: controller.createOrUpdate, private: true, perm_component: "users", permission: "update", validationSchema:(req) => userSchema(req.params.id) },
    { path: controller.__component + '/:id', method: "delete", function: controller.delete, private: true, perm_component: "users", permission: "delete" },
    { path: controller.__component + '/changeStatus/:id', method: "put", function: controller.setUserStatus, private: true, perm_component: "users", permission: "update" },
]
export default routes;