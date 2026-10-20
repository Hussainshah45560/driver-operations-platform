import { route } from "../../../__types";
import { incidentSchema } from "../../../models/driverRequestBody";
import * as Controller from './controller';
import * as DocumentController from '../documents/controller';
import { documentSchema } from "../../../models/requestBody";
const controller: Controller.default = new Controller.default;
const documentController: DocumentController.default = new DocumentController.default;
import multer from 'multer';
const upload = multer({ dest: "temp/" });


const routes: route[] = [
    { path: controller.__component + '/', method: "get", function: controller.list, private: true,perm_component: "incidents", permission: "view" },
    { path: controller.__component + '/:id', method: "get", function: controller.get, private: true, perm_component: "incidents", permission: "view" },
    { path: controller.__component + '/:id/fields', method: "get", function: controller.getTemplateFields, private: true, perm_component: "incidents", permission: "view" },
    { path: controller.__component + '/', method: "post", function: controller.createOrUpdate, private: true,perm_component: "incidents", permission: "add", validationSchema: incidentSchema },
    { path: controller.__component + '/:id', method: "put", function: controller.createOrUpdate, private: true,perm_component: "incidents", permission: "update", validationSchema: incidentSchema },
     { path: controller.__component + '/:id', method: "delete", function: controller.delete, private: true, perm_component: "incidents", permission: "delete" },
    // { path: controller.__component + '/verifyLicenseDisc', method: "post", function: controller.verifyLicenseDisc, private: true, perm_component: "assets", permission: "update", uploader: upload.fields([{ name: 'licenseDisc', maxCount: 1 }]) },

 // Document Routes
    { path: controller.__component + '/fetch/documents', method: "get", function: documentController.list, private: true, perm_component: "incidents", permission: "view" },
    { path: controller.__component + '/documents/:id', method: "get", function: documentController.get, private: true, perm_component: "incidents", permission: "view" },
    { path: controller.__component + '/documents/', method: "post", function: documentController.createOrUpdate, private: true, perm_component: "incidents", permission: "add", validationSchema:documentSchema,uploader: upload.fields([{name: 'document', maxCount: 1 }]) },
    { path: controller.__component + '/documents/:id', method: "delete", function: documentController.delete, private: true, perm_component: "incidents", permission: "delete" },
]
export default routes;