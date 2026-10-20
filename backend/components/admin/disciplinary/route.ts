import { route } from "../../../__types";
import { documentSchema } from "../../../models/requestBody";
import * as Controller from './controller';
import * as DocumentController from '../../driver/documents/controller';
const controller: Controller.default = new Controller.default;
const documentController: DocumentController.default = new DocumentController.default;
import multer from 'multer';
const upload = multer({ dest: "temp/" });

const routes: route[] = [
    
    { path: controller.__component + '/', method: "get", function: controller.list, private: true, perm_component: "disciplinary", permission: "view" },
    { path: controller.__component + '/:id', method: "get", function: controller.getWarnings, private: true, perm_component: "disciplinary", permission: "view" },
    { path: controller.__component + '/getDisciplinary/:id', method: "get", function: controller.getDisciplinary, private: true, perm_component: "disciplinary", permission: "view" },
    { path: controller.__component + '/getAOD/:id', method: "get", function: controller.getAOD, private: true, perm_component: "disciplinary", permission: "view" },
    { path: controller.__component + '/', method: "post", function: controller.createOrUpdate, private: true, perm_component: "disciplinary", permission: "add"},
    { path: controller.__component + '/:id', method: "put", function: controller.createOrUpdate, private: true, perm_component: "disciplinary", permission: "update"},
   // { path: controller.__component + '/updateEvidence/:id', method: "put", function: controller.updateWarnignSign, private: true, perm_component: "disciplinary", permission: "update"},
    { path: controller.__component + '/updateHearing/:id', method: "put", function: controller.updateHearing, private: true, perm_component: "disciplinary", permission: "update" },
    { path: controller.__component + '/updateDispute/:id', method: "put", function: controller.updateDispute, private: true, perm_component: "disciplinary", permission: "update" },
    { path: controller.__component + '/updateAOD/:id', method: "put", function: controller.updateAOD, private: true, perm_component: "disciplinary", permission: "update" },
    { path: controller.__component + '/get/enquiryTemplate', method: "get", function: controller.getEnquiryTemplate, private: true, perm_component: "disciplinary", permission: "view" },
    { path: controller.__component + '/sendNotice/:id', method: "put", function: controller.sendNoticeToHearing, private: true, perm_component: "disciplinary", permission: "add"},
   
    { path: controller.__component + '/sign/:id', method: "put", function: controller.signWarning, private: true, perm_component: "disciplinary", permission: "update"},
    { path: controller.__component + '/fetch/download', method: "get", function: controller.downloadWarning, private: true, perm_component: "disciplinary", permission: "view" },

    { path: controller.__component + '/candidate/details', method: "get", function: controller.getApplicantProfile, private: true, perm_component: "disciplinary", permission: "view" },
    
     // Document Routes
    { path: controller.__component + '/fetch/documents', method: "get", function: documentController.list, private: true, perm_component: "disciplinary", permission: "view" },
    { path: controller.__component + '/documents/:id', method: "get", function: documentController.get, private: true, perm_component: "disciplinary", permission: "view" },
    { path: controller.__component + '/documents/', method: "post", function: documentController.createOrUpdate, private: true, perm_component: "disciplinary", permission: "add", validationSchema:documentSchema,uploader: upload.fields([{name: 'document', maxCount: 1 }]) },
    { path: controller.__component + '/documents/:id', method: "delete", function: documentController.delete, private: true, perm_component: "disciplinary", permission: "delete" },

]
export default routes;