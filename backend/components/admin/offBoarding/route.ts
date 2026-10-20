import { route } from "../../../__types";
import {   } from "../../../models/requestBody";
import * as Controller from './controller';
const controller: Controller.default = new Controller.default;

const routes: route[] = [
    { path: controller.__component + '/', method: "get", function: controller.list, private: true, perm_component: "offBoarding", permission: "view" },
    { path: controller.__component + '/:id', method: "get", function: controller.get, private: true, perm_component: "offBoarding", permission: "view" },
    { path: controller.__component + '/', method: "post", function: controller.createOrUpdate, private: true, perm_component: "offBoarding", permission: "add" },
    { path: controller.__component + '/:id', method: "put", function: controller.createOrUpdate, private: true, perm_component: "offBoarding", permission: "update" },
    { path: controller.__component + '/:id', method: "delete", function: controller.delete, private: true, perm_component: "offBoarding", permission: "delete" },

    { path: controller.__component + '/candidate/details', method: "get", function: controller.getApplicantProfile, private: true, perm_component: "offBoarding", permission: "view" },
   ]
export default routes;