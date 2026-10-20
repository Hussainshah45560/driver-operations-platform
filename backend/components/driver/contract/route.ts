 import { route } from "../../../__types";
 import * as Controller from './controller';
const controller: Controller.default = new Controller.default;

 
 const routes: route[] = [
     
    { path: controller.__component + '/', method: "get", function: controller.list, private: true, perm_component: "contracts", permission: "view" },
    { path: controller.__component + '/:id', method: "get", function: controller.getContract, private: true, perm_component: "contracts", permission: "view"},
    { path: controller.__component + '/sign/:id', method: "put", function: controller.signContract, private: true, perm_component: "contracts", permission: "update" },
    { path: controller.__component + '/fetch/download/:id', method: "get", function: controller.downloadContract, private: true, perm_component: "contracts", permission: "view"},
    { path: controller.__component + '/fetch/signnow/download/:id', method: "get", function: controller.downloadSignNowContract, private: true, perm_component: "contracts", permission: "view"},
    
 ]
 export default routes;