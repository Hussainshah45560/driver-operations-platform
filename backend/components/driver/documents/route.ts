import { route } from "../../../__types";
import { documentSchema } from "../../../models/requestBody";
import * as Controller from './controller';
const controller: Controller.default = new Controller.default;
import multer from 'multer';
const upload = multer({ dest: "temp/" });

const routes: route[] = [
    { path: controller.__component + '/', method: "get", function: controller.list, private: true, perm_component: "documents", permission: "view" },
    { path: controller.__component + '/:id', method: "get", function: controller.get, private: true, perm_component: "documents", permission: "view" },
    { path: controller.__component + '/', method: "post", function: controller.createOrUpdate, private: true, uploader: upload.fields([{name: 'document', maxCount: 1 }]), perm_component: "documents", permission: "add", validationSchema:documentSchema },
    //{ path: controller.__component + '/:id', method: "put", function: controller.createOrUpdateDocument, private: true, uploader: upload.fields([{name: 'document', maxCount: 2 }]), perm_component: "documents", permission: "update" },
    { path: controller.__component + '/:id', method: "delete", function: controller.delete, private: true, perm_component: "documents", permission: "delete" },
]
export default routes;