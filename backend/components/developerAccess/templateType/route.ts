import { route } from "../../../__types";
import { templateTypeSchema } from "../../../models/requestBody";
import * as Controller from './controller';
const controller: Controller.default = new Controller.default;

const routes: route[] = [
	{ path: controller.__component + '/', method: "get", function: controller.list, private: true, perm_component: "templatetypes", permission: "view" },
	{ path: controller.__component + '/:id', method: "get", function: controller.get, private: true, perm_component: "templatetypes", permission: "view" },
	{ path: controller.__component + '/', method: "post", function: controller.createOrUpdate, private: true, perm_component: "templatetypes", permission: "add", validationSchema:templateTypeSchema },
	{ path: controller.__component + '/:id', method: "put", function: controller.createOrUpdate, private: true, perm_component: "templatetypes", permission: "update", validationSchema:templateTypeSchema }
];
export default routes;
