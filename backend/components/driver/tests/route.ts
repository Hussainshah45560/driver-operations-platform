import { route } from "../../../__types";
import * as Controller from './controller';
const controller: Controller.default = new Controller.default;


const routes: route[] = [
    { path: controller.__component + '/', method: "get", function: controller.list, private: true,perm_component: "tests", permission: "view" },
    { path: controller.__component + '/:id', method: "get", function: controller.get, private: true, perm_component: "tests", permission: "view" },
   // { path: controller.__component + '/time/slots', method: "get", function: controller.getSlots, private: true, perm_component: "tests", permission: "view" },
    { path: controller.__component + '/', method: "post", function: controller.createOrUpdate, private: true,perm_component: "tests", permission: "add"  },
    { path: controller.__component + '/:id', method: "put", function: controller.createOrUpdate, private: true,perm_component: "tests", permission: "update"},
    { path: controller.__component + '/changeStatus/:id', method: "put", function: controller.setTestStatus, private: true,perm_component: "tests", permission: "update"},
]
export default routes;