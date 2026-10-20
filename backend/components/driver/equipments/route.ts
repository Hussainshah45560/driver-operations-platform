 import { route } from "../../../__types";
 import * as Controller from './controller';
const controller: Controller.default = new Controller.default;

 
 const routes: route[] = [
     
    { path: controller.__component + '/', method: "get", function: controller.list, private: true, perm_component: "equipment", permission: "view" },
    
 ]
 export default routes;