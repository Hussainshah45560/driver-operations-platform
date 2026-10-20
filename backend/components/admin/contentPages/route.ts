import { route } from "../../../__types";
import { contentPagesSchema } from "../../../models/requestBody";
import * as Controller from './controller';
const controller: Controller.default = new Controller.default;

const routes: route[] = [
    { path: controller.__component + '/', method: "get", function: controller.list, private: true, perm_component: "content", permission: "view" },
    { path: controller.__component + '/:id', method: "get", function: controller.get, private: true, perm_component: "content", permission: "view" },
    { path: controller.__component + '/:id', method: "put", function: controller.createOrUpdate, private: true, perm_component: "content", permission: "update", validationSchema:contentPagesSchema },
    { path: controller.__component + '/:id', method: "delete", function: controller.delete, private: true, perm_component: "content", permission: "delete" },
];
export default routes;