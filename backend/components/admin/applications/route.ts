import { route } from "../../../__types";
import { applicationStatusSchema, documentSchema, step1Schema, step2Schema, step3Schema, step4Schema, step5Schema, step6Schema, step7Schema, step8Schema, step9Schema } from "../../../models/requestBody";
import * as Controller from './controller';
import * as DocumentController from '../../driver/documents/controller';
const controller: Controller.default = new Controller.default;
const documentController: DocumentController.default = new DocumentController.default;
import multer from 'multer';
const upload = multer({ dest: "temp/" });


const routes: route[] = [
    { path: controller.__component + '/documents', method: "get", function: documentController.list, private: true, perm_component: "applications", permission: "view" },
    { path: controller.__component + '/', method: "get", function: controller.list, private: true, perm_component: "applications", permission: "view" },
    { path: controller.__component + '/:id', method: "get", function: controller.get, private: true, perm_component: "applications", permission: "view" },
    // Applicaion Steps Update Endpoints
    { path: controller.__component + '/saveStep1', method: "post", function: controller.createOrUpdateStep1, private: true, perm_component: "applications", permission: "add", validationSchema: step1Schema },
    { path: controller.__component + '/saveStep1/:id', method: "put", function: controller.createOrUpdateStep1, private: true, perm_component: "applications", permission: "update", validationSchema: step1Schema },
    { path: controller.__component + '/saveStep2/:id', method: "put", function: controller.updateStep2, private: true, perm_component: "applications", permission: "update", validationSchema: step2Schema },
    { path: controller.__component + '/saveStep3/:id', method: "put", function: controller.updateStep3, private: true, perm_component: "applications", permission: "update", validationSchema: step3Schema },
    { path: controller.__component + '/saveStep4/:id', method: "put", function: controller.updateStep4, private: true, perm_component: "applications", permission: "update", validationSchema: step4Schema },
    { path: controller.__component + '/saveStep5/:id', method: "put", function: controller.updateStep5, private: true, perm_component: "applications", permission: "update", validationSchema: step5Schema },
    { path: controller.__component + '/saveStep6/:id', method: "put", function: controller.updateStep6, private: true, uploader: upload.fields([{ name: 'image', maxCount: 1 }]), perm_component: "applications", permission: "update", validationSchema: step6Schema },
    { path: controller.__component + '/saveStep7/:id', method: "put", function: controller.updateStep7, private: true, perm_component: "applications", permission: "update", validationSchema: step7Schema },
    { path: controller.__component + '/saveStep8/:id', method: "put", function: controller.updateStep8, private: true, perm_component: "applications", permission: "update", validationSchema: step8Schema },
    { path: controller.__component + '/saveStep9/:id', method: "put", function: controller.updateStep9, private: true, uploader: upload.fields([{ name: 'popiSign', maxCount: 1 }, { name: 'applicationSign', maxCount: 1 }]), perm_component: "applications", permission: "update", validationSchema: step9Schema },
    // Aplicaiton Steps Get Endpoints
    { path: controller.__component + '/getStep1/:id', method: "get", function: controller.getStep1, private: true, perm_component: "applications", permission: "view" },
    { path: controller.__component + '/getStep2/:id', method: "get", function: controller.getStep2, private: true, perm_component: "applications", permission: "view" },
    { path: controller.__component + '/getStep3/:id', method: "get", function: controller.getStep3, private: true, perm_component: "applications", permission: "view" },
    { path: controller.__component + '/getStep4/:id', method: "get", function: controller.getStep4, private: true, perm_component: "applications", permission: "view" },
    { path: controller.__component + '/getStep5/:id', method: "get", function: controller.getStep5, private: true, perm_component: "applications", permission: "view" },
    { path: controller.__component + '/getStep6/:id', method: "get", function: controller.getStep6, private: true, perm_component: "applications", permission: "view" },
    { path: controller.__component + '/getStep7/:id', method: "get", function: controller.getStep7, private: true, perm_component: "applications", permission: "view" },
    { path: controller.__component + '/getStep8/:id', method: "get", function: controller.getStep8, private: true, perm_component: "applications", permission: "view" },
    { path: controller.__component + '/getStep9/:id', method: "get", function: controller.getStep9, private: true, perm_component: "applications", permission: "view" },
    // Applicaiotn Steps Approve/Reject Endpoints
    { path: controller.__component + '/approveStep1/:id', method: "put", function: controller.approveStep1, private: true, perm_component: "applications", permission: "update", validationSchema: applicationStatusSchema },
    { path: controller.__component + '/approveStep2/:id', method: "put", function: controller.approveStep2, private: true, perm_component: "applications", permission: "update", validationSchema: applicationStatusSchema },
    { path: controller.__component + '/approveStep3/:id', method: "put", function: controller.approveStep3, private: true, perm_component: "applications", permission: "update", validationSchema: applicationStatusSchema },
    { path: controller.__component + '/approveStep4/:id', method: "put", function: controller.approveStep4, private: true, perm_component: "applications", permission: "update", validationSchema: applicationStatusSchema },
    { path: controller.__component + '/approveStep5/:id', method: "put", function: controller.approveStep5, private: true, perm_component: "applications", permission: "update", validationSchema: applicationStatusSchema },
    { path: controller.__component + '/approveStep6/:id', method: "put", function: controller.approveStep6, private: true, perm_component: "applications", permission: "update", validationSchema: applicationStatusSchema },
    { path: controller.__component + '/approveStep7/:id', method: "put", function: controller.approveStep7, private: true, perm_component: "applications", permission: "update", validationSchema: applicationStatusSchema },
    { path: controller.__component + '/approveStep8/:id', method: "put", function: controller.approveStep, private: true, perm_component: "applications", permission: "update", validationSchema: applicationStatusSchema },
    { path: controller.__component + '/approveStep9/:id', method: "put", function: controller.approveStep, private: true, perm_component: "applications", permission: "update", validationSchema: applicationStatusSchema },
    // Get Application step
    { path: controller.__component + '/getApplicationSteps/:id', method: "get", function: controller.getStepStatus, private: true, perm_component: "applications", permission: "view" },

    { path: controller.__component + '/:id', method: "delete", function: controller.delete, private: true, perm_component: "applications", permission: "delete" },
    // License Disc Verification Endpoint
    { path: controller.__component + '/verifyLicenseDisc/:applicationId', method: "post", function: controller.verifyLicenseDisc, private: true, uploader: upload.fields([{ name: 'licenseDisc', maxCount: 1 }]), perm_component: "applications", permission: "view" },
    // Document Routes
    
    { path: controller.__component + '/documents/:id', method: "get", function: documentController.get, private: true, perm_component: "applications", permission: "view" },
    { path: controller.__component + '/documents/', method: "post", function: documentController.createOrUpdate, private: true, perm_component: "applications", permission: "add", validationSchema:documentSchema,uploader: upload.fields([{name: 'document', maxCount: 1 }]) },
    { path: controller.__component + '/documents/:id', method: "delete", function: documentController.delete, private: true, perm_component: "applications", permission: "delete" },

    // Get Required Documents for Application
    { path: controller.__component + '/fetch/getRequiredDocuments', method: "get", function: controller.getRequiredDocuments, private: true, perm_component: "applications", permission: "view" },

];
export default routes;