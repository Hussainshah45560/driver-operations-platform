import { route } from "../../../__types";
import { documentSchema, recruitmentSchema } from "../../../models/requestBody";
import * as Controller from './controller';
import * as DocumentController from '../../driver/documents/controller';
import * as EquipmentController from '../equipment/controller';
import * as InductionController from '../induction/controller';
const controller: Controller.default = new Controller.default;
const documentController: DocumentController.default = new DocumentController.default;
const equipmentController: EquipmentController.default = new EquipmentController.default;
const inductionController: InductionController.default = new InductionController.default;
import multer from 'multer';
const upload = multer({ dest: "temp/" });

const routes: route[] = [
    
    { path: controller.__component + '/', method: "get", function: controller.list, private: true, perm_component: "recruitment", permission: "view" },
    { path: controller.__component + '/:id', method: "get", function: controller.get, private: true, perm_component: "recruitment", permission: "view" },
    { path: controller.__component + '/', method: "post", function: controller.createOrUpdate, private: true, perm_component: "recruitment", permission: "add", validationSchema:recruitmentSchema},
    { path: controller.__component + '/:id', method: "put", function: controller.createOrUpdate, private: true, perm_component: "recruitment", permission: "update",validationSchema:recruitmentSchema },
    { path: controller.__component + '/:id', method: "delete", function: controller.delete, private: true, perm_component: "recruitment", permission: "delete" },
    { path: controller.__component + '/changeStatus/:id', method: "put", function: controller.setRecruitmentStatus, private: true, perm_component: "recruitment", permission: "update" },
    { path: controller.__component + '/getCustomerCostCenters/:customerId', method: "get", function: controller.getCustomerCostCenters, private: true, perm_component: "recruitment", permission: "view" },
    { path: controller.__component + '/shortListed/:id', method: "put", function: controller.shortListedCandidates, private: true, perm_component: "recruitment", permission: "update" },
    { path: controller.__component + '/finalised/:id', method: "put", function: controller.finalisedCandidates, private: true, perm_component: "recruitment", permission: "update" },

    { path: controller.__component + '/candidate/details', method: "get", function: controller.getApplication, private: true, perm_component: "recruitment", permission: "view" },
    { path: controller.__component + '/candidate/:applicationId', method: "put", function: controller.updateApplication, private: true, perm_component: "recruitment", permission: "update" },
    
     // Document Routes
    { path: controller.__component + '/fetch/documents', method: "get", function: documentController.list, private: true, perm_component: "recruitment", permission: "view" },
    { path: controller.__component + '/documents/:id', method: "get", function: documentController.get, private: true, perm_component: "recruitment", permission: "view" },
    { path: controller.__component + '/documents/', method: "post", function: documentController.createOrUpdate, private: true, perm_component: "recruitment", permission: "add", validationSchema:documentSchema,uploader: upload.fields([{name: 'document', maxCount: 1 }]) },
    { path: controller.__component + '/documents/:id', method: "delete", function: documentController.delete, private: true, perm_component: "recruitment", permission: "delete" },

    // Equipment Routes
    { path: controller.__component + '/equipments/:id', method: "get", function: equipmentController.get, private: true, perm_component: "recruitment", permission: "view" },
    { path: controller.__component + '/equipments/', method: "post", function: equipmentController.createOrUpdate, private: true, perm_component: "recruitment", permission: "add" },
    { path: controller.__component + '/equipments/:id', method: "put", function: equipmentController.createOrUpdate, private: true, perm_component: "recruitment", permission: "update" },

    // Induction Routes
    { path: controller.__component + '/contract/generateContract', method: "get", function: inductionController.generateContract, private: true, perm_component: "recruitment", permission: "view" },
    { path: controller.__component + '/get/contract/', method: "get", function: inductionController.getContract, private: true, perm_component: "recruitment", permission: "view" },
    { path: controller.__component + '/sign/:id', method: "put", function: inductionController.signContract, private: true, perm_component: "recruitment", permission: "update" },
     { path: controller.__component + '/fetch/signnow/download/:id', method: "get", function: inductionController.downloadSignNowContract, private: true, perm_component: "recruitment", permission: "view"},
]
export default routes;