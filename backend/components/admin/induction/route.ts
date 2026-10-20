import { route } from "../../../__types";
import { documentSchema } from "../../../models/requestBody";
import * as Controller from './controller';
import * as DocumentController from '../../driver/documents/controller';
const controller: Controller.default = new Controller.default;
const documentController: DocumentController.default = new DocumentController.default;
import multer from 'multer';
const upload = multer({ dest: "temp/" });

const routes: route[] = [
    
    { path: controller.__component + '/', method: "get", function: controller.list, private: true, perm_component: "induction", permission: "view" },
    { path: controller.__component + '/:id', method: "get", function: controller.get, private: true, perm_component: "induction", permission: "view" },
    { path: controller.__component + '/', method: "post", function: controller.createOrUpdate, private: true, perm_component: "induction", permission: "add"},
    { path: controller.__component + '/:id', method: "put", function: controller.createOrUpdate, private: true, perm_component: "induction", permission: "update"},
    { path: controller.__component + '/updateDriverTesting/:id', method: "put", function: controller.updateDriverTesting, private: true, perm_component: "induction", permission: "update" },
    { path: controller.__component + '/updateVehicleTesting/:id', method: "put", function: controller.updateVehicleTesting, private: true, perm_component: "induction", permission: "update" },
    { path: controller.__component + '/customer/checklist', method: "get", function: controller.getCustomerChecklist, private: true, perm_component: "induction", permission: "view" },
    { path: controller.__component + '/contract/generateContract/', method: "get", function: controller.generateContract, private: true, perm_component: "induction", permission: "view"},
    { path: controller.__component + '/get/contract/', method: "get", function: controller.getContract, private: true, perm_component: "induction", permission: "view"},
    { path: controller.__component + '/fetch/signnow/download/:id', method: "get", function: controller.downloadSignNowContract, private: true, perm_component: "induction", permission: "view"},
    
    // { path: controller.__component + '/:id', method: "delete", function: controller.delete, private: true, perm_component: "induction", permission: "delete" },
    // { path: controller.__component + '/changeStatus/:id', method: "put", function: controller.setRecruitmentStatus, private: true, perm_component: "induction", permission: "update" },
    { path: controller.__component + '/sign/:id', method: "put", function: controller.signContract, private: true, perm_component: "induction", permission: "update" },

    { path: controller.__component + '/candidate/details', method: "get", function: controller.getApplicantProfile, private: true, perm_component: "induction", permission: "view" },
    { path: controller.__component + '/candidate/application', method: "get", function: controller.getCandidateApplication, private: true, perm_component: "induction", permission: "view" },
    
     // Document Routes
    { path: controller.__component + '/fetch/documents', method: "get", function: documentController.list, private: true, perm_component: "induction", permission: "view" },
    { path: controller.__component + '/documents/:id', method: "get", function: documentController.get, private: true, perm_component: "induction", permission: "view" },
    { path: controller.__component + '/documents/', method: "post", function: documentController.createOrUpdate, private: true, perm_component: "induction", permission: "add", validationSchema:documentSchema,uploader: upload.fields([{name: 'document', maxCount: 1 }]) },
    { path: controller.__component + '/documents/:id', method: "delete", function: documentController.delete, private: true, perm_component: "induction", permission: "delete" },

]
export default routes;