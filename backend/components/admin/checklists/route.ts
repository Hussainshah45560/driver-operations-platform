import { route } from "../../../__types";
import { checklistSchema } from "../../../models/requestBody";
import * as Controller from './controller';
const controller: Controller.default = new Controller.default;


const routes: route[] = [
    { path: controller.__component + '/', method: "get", function: controller.list, private: true, perm_component: "workExperience", permission: "view" },
    { path: controller.__component + '/:id', method: "get", function: controller.get, private: true, perm_component: "workExperience", permission: "view" },
    { path: controller.__component + '/', method: "post", function: controller.createOrUpdate, private: true, perm_component: "workExperience", permission: "add", validationSchema:checklistSchema },
    { path: controller.__component + '/:id', method: "put", function: controller.createOrUpdate, private: true, perm_component: "workExperience", permission: "update",validationSchema:checklistSchema },
    { path: controller.__component + '/:id', method: "delete", function: controller.delete, private: true, perm_component: "workExperience", permission: "delete" },
      { path: controller.__component + '/changeStatus/:id', method: "put", function: controller.setChecklistStatus, private: true, perm_component: "users", permission: "update" },
]
export default routes;