import { route } from "../../../__types";
import { emailTemplateSchema } from "../../../models/requestBody";
import * as Controller from './controller';
const controller: Controller.default = new Controller.default;

const routes: route[] = [
	{ path: controller.__component + '/list/categories', method: "get", function: controller.getEmailCategory, private: true, perm_component: "emailtemplates", permission: "view" },
    { path: controller.__component + '/get/templates/:id', method: "get", function: controller.list, private: true, perm_component: "emailtemplates", permission: "view" },
    { path: controller.__component + '/get/template-fields/:id', method: "get", function: controller.getFieldByCategory, private: true, perm_component: "emailtemplates", permission: "view" },
	{ path: controller.__component + '/:id', method: "get", function: controller.get, private: true, perm_component: "emailtemplates", permission: "view" },
	{ path: controller.__component + '/email-fields/:emailTypeId', method: "get", function: controller.getFieldByTypeId, private: true, perm_component: "emailtemplates", permission: "view" },
	{ path: controller.__component + '/', method: "post", function: controller.createOrUpdate, private: true, perm_component: "emailtemplates", permission: "add", validationSchema:emailTemplateSchema },
	{ path: controller.__component + '/:id', method: "put", function: controller.createOrUpdate, private: true, perm_component: "emailtemplates", permission: "update", validationSchema:emailTemplateSchema },
	{ path: controller.__component + '/changeStatus/:id', method: "put", function: controller.setEmailStatus, private: true, perm_component: "emailtemplates", permission: "update" },
	{ path: controller.__component + '/:id', method: "delete", function: controller.delete, private: true, perm_component: "emailtemplates", permission: "delete" },
];
export default routes;
