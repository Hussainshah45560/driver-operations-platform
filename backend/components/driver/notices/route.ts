 import { route } from "../../../__types";
 import * as Controller from './controller';
import * as DocumentController from '../../driver/documents/controller';
const controller: Controller.default = new Controller.default;
const documentController: DocumentController.default = new DocumentController.default;
 
 const routes: route[] = [
     
    { path: controller.__component + '/', method: "get", function: controller.list, private: true, perm_component: "notices", permission: "view" },
    { path: controller.__component + '/:profileId', method: "get", function: controller.getWarnings, private: true, perm_component: "notices", permission: "view" },
     { path: controller.__component + '/sign/:id', method: "put", function: controller.signWarning, private: true, perm_component: "notices", permission: "update"},
     { path: controller.__component + '/fetch/download', method: "get", function: controller.downloadWarning, private: true, perm_component: "notices", permission: "view" },
    
    // Document Routes
    { path: controller.__component + '/fetch/documents', method: "get", function: documentController.list, private: true, perm_component: "notices", permission: "view" },
 ]
 export default routes;