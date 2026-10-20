import { route } from "../../../__types";
import * as Controller from './controller';
const controller: Controller.default = new Controller.default;


const routes: route[] = [
    { path: controller.__component + '/', method: "get", function: controller.list, private: true,perm_component: "inspection", permission: "view" },
    { path: controller.__component + '/:id', method: "get", function: controller.get, private: true, perm_component: "inspection", permission: "view" },
    { path: controller.__component + '/customer/checklist', method: "get", function: controller.getCustomerChecklist, private: true, perm_component: "inspection", permission: "view" },
    // { path: controller.__component + '/', method: "post", function: controller.createOrUpdate, private: true,perm_component: "assets", permission: "add", validationSchema: assetSchema,uploader: upload.fields([{ name: 'image', maxCount: 1 }]) },
    // { path: controller.__component + '/:id', method: "put", function: controller.createOrUpdate, private: true,perm_component: "assets", permission: "update", validationSchema: assetSchema, uploader: upload.fields([{ name: 'image', maxCount: 1 }]) },
    // { path: controller.__component + '/:id', method: "delete", function: controller.delete, private: true, perm_component: "assets", permission: "delete" },
    // { path: controller.__component + '/verifyLicenseDisc', method: "post", function: controller.verifyLicenseDisc, private: true, perm_component: "assets", permission: "update", uploader: upload.fields([{ name: 'licenseDisc', maxCount: 1 }]) },
]
export default routes;