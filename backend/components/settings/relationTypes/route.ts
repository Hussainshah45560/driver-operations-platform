import { route } from "../../../__types";
import { relationTypeSchema } from "../../../models/requestBody";
import * as Controller from './controller';
const controller: Controller.default = new Controller.default;


const routes: route[] = [
    { path: controller.__component + '/', method: "get", function: controller.list, private: true, perm_component: "settings", permission: "view" },
    { path: controller.__component + '/:id', method: "get", function: controller.get, private: true, perm_component: "settings", permission: "view" },
    { path: controller.__component + '/', method: "post", function: controller.createOrUpdate, private: true, perm_component: "settings", permission: "add",validationSchema:relationTypeSchema },
    { path: controller.__component + '/:id', method: "put", function: controller.createOrUpdate, private: true, perm_component: "settings", permission: "update",validationSchema:relationTypeSchema },
    { path: controller.__component + '/:id', method: "delete", function: controller.delete, private: true, perm_component: "settings", permission: "delete" },
]
export default routes;