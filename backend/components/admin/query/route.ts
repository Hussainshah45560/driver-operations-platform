import { route } from "../../../__types";
import {   } from "../../../models/requestBody";
import * as Controller from './controller';
const controller: Controller.default = new Controller.default;

const routes: route[] = [
    { path: controller.__component + '/', method: "get", function: controller.list, private: true, perm_component: "queries", permission: "view" },
    { path: controller.__component + '/:id', method: "get", function: controller.get, private: true, perm_component: "queries", permission: "view" },
    { path: controller.__component + '/', method: "post", function: controller.createOrUpdate, private: true, perm_component: "queries", permission: "add" },
    { path: controller.__component + '/:id', method: "put", function: controller.createOrUpdate, private: true, perm_component: "queries", permission: "update" },
    { path: controller.__component + '/assignToAdmin', method: "post", function: controller.assignToAdmin, private: true, perm_component: "queries", permission: "add" },

    { path: controller.__component + '/candidate/details', method: "get", function: controller.getApplicantProfile, private: true, perm_component: "queries", permission: "view" },

    // User Routes For AOD
    { path: controller.__component + '/user/queries', method: "get", function: controller.userQuerylist, private: true, perm_component: "queries", permission: "view" },
     { path: controller.__component + '/newQuery', method: "post", function: controller.createOrUpdateUserQuery, private: true, perm_component: "queries", permission: "add" },
   ]
export default routes;