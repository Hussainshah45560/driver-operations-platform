import { route } from "../../__types";
import { appSettingSchema } from "../../models/requestBody";
import * as Controller from './controller';
const controller: Controller.default = new Controller.default;


const routes: route[] = [
    { path: controller.__component + '/:id', method: "get", function: controller.get, private: true, perm_component: 'appsetting', permission: 'get' },
    { path: controller.__component + '/', method: "get", function: controller.list, private: true, perm_component: 'appsetting', permission: 'list' },
    { path: controller.__component + '/', method: "post", function: controller.createOrUpdate,  private: true, perm_component: 'appsetting', permission: 'add', validationSchema:appSettingSchema },
    { path: controller.__component + '/:id', method: "put", function: controller.createOrUpdate, private: true, perm_component: 'appsetting', permission: 'update', validationSchema:appSettingSchema },

];
export default routes;