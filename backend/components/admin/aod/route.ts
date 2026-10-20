import { route } from "../../../__types";
import { aodSchema } from "../../../models/requestBody";
import * as Controller from './controller';
const controller: Controller.default = new Controller.default;


const routes: route[] = [
    { path: controller.__component + '/', method: "get", function: controller.list, private: true, perm_component: "aod", permission: "view" },
    { path: controller.__component + '/:id', method: "get", function: controller.get, private: true, perm_component: "aod", permission: "view" },
    { path: controller.__component + '/', method: "post", function: controller.createOrUpdate, private: true, perm_component: "aod", permission: "add", validationSchema:aodSchema },
    { path: controller.__component + '/:id', method: "put", function: controller.createOrUpdate, private: true, perm_component: "aod", permission: "update",validationSchema:aodSchema },
    { path: controller.__component + '/:id', method: "delete", function: controller.delete, private: true, perm_component: "aod", permission: "delete" },
    { path: controller.__component + '/getProfileData/:profileId', method: "get", function: controller.getProfileById, private: true, perm_component: "aod", permission: "view" },

    // User Routes For AOD
    { path: controller.__component + '/user/AOD', method: "get", function: controller.userAODlist, private: true, perm_component: "aod", permission: "view" },

    // Template Sign AOD
    { path: controller.__component + '/getTemplate/:id', method: "get", function: controller.getAODTemplate, private: true, perm_component: "aod", permission: "view" },
    { path: controller.__component + '/sign/:id', method: "put", function: controller.signAOD, private: true, perm_component: "aod", permission: "update" },
]
export default routes;