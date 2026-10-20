import { route } from "../../../__types";
import { templateSchema } from "../../../models/requestBody";
import * as Controller from './controller';
const controller: Controller.default = new Controller.default;

const routes: route[] = [
    { path: controller.__component + '/list/categories', method: "get", function: controller.getTemplateCategory, private: true, perm_component: "cmctemplates", permission: "view" },
    { path: controller.__component + '/get/templates/:id', method: "get", function: controller.list, private: true, perm_component: "cmctemplates", permission: "view" },
    { path: controller.__component + '/get/template-fields/:id', method: "get", function: controller.getFieldByCategory, private: true, perm_component: "cmctemplates", permission: "view" },
    { path: controller.__component + '/:id', method: "get", function: controller.get, private: true, perm_component: "cmctemplates", permission: "view" },
    { path: controller.__component + '/template/templateType', method: "get", function: controller.getTemplateByCode, private: true },
    { path: controller.__component + '/', method: "post", function: controller.createOrUpdate, private: true, perm_component: "cmctemplates", permission: "add", validationSchema:templateSchema },
    { path: controller.__component + '/:id', method: "put", function: controller.createOrUpdate, private: true, perm_component: "cmctemplates", permission: "update", validationSchema:templateSchema },
    { path: controller.__component + '/changeStatus/:id', method: "put", function: controller.setTemplateStatus, private: true, perm_component: "cmctemplates", permission: "update" },
    { path: controller.__component + '/:id', method: "delete", function: controller.delete, private: true, perm_component: "cmctemplates", permission: "delete" },
];

export default routes;
