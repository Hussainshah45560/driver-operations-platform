import { route } from "../../../__types";
import { customerContactSchema } from "../../../models/requestBody";
import * as Controller from './controller';
const controller: Controller.default = new Controller.default;


const routes: route[] = [
    { path: controller.__component + '/', method: "get", function: controller.list, private: true },
    { path: controller.__component + '/:id', method: "get", function: controller.get, private: true },
    { path: controller.__component + '/', method: "post", function: controller.createOrUpdate, private: true, validationSchema:customerContactSchema },
    { path: controller.__component + '/:id', method: "put", function: controller.createOrUpdate, private: true, validationSchema:customerContactSchema },
    { path: controller.__component + '/:id', method: "delete", function: controller.delete, private: true },
    { path: controller.__component + '/changeStatus/:id', method: "put", function: controller.setContactStatus, private: true},
]
export default routes;