import { route } from "../../../__types";
import { bankDetailsSchema } from "../../../models/driverRequestBody";
import * as Controller from './controller';
const controller: Controller.default = new Controller.default;


const routes: route[] = [
    { path: controller.__component + '/', method: "get", function: controller.get, private: true, perm_component: "bankingDetails", permission: "view" },
    { path: controller.__component + '/:id', method: "put", function: controller.createOrUpdate, private: true, perm_component: "bankingDetails", permission: "update", validationSchema: bankDetailsSchema },
]
export default routes;