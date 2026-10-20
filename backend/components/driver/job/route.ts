import { route } from "../../../__types";
import * as Controller from './controller';
const controller: Controller.default = new Controller.default;


const routes: route[] = [
    { path: controller.__component + '/:id', method: "get", function: controller.get, private: true, perm_component: "job", permission: "view" },
    { path: controller.__component + '/getCustomerCostCenters/:customerId', method: "get", function: controller.getCustomerCostCenters, private: true, perm_component: "job", permission: "view" },
   
]
export default routes;