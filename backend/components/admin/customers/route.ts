import { route } from "../../../__types";
import { customerContactSchema, customerSchemaStep1, customerSchemaStep2, customerSchemaStep4 } from "../../../models/requestBody";
import * as Controller from './controller';
import * as CustomerContactController from '../customerContacts/controller';
const controller: Controller.default = new Controller.default;
const contactController: CustomerContactController.default = new CustomerContactController.default;


const routes: route[] = [
    { path: controller.__component + '/', method: "get", function: controller.list, private: true, perm_component: "customers", permission: "view" },
    { path: controller.__component + '/getCustomerStep1/:id', method: "get", function: controller.getCustomerStep1, private: true, perm_component: "customers", permission: "view" },
    { path: controller.__component + '/getCustomerStep2/:id', method: "get", function: controller.getCustomerStep2, private: true, perm_component: "customers", permission: "view" },
    { path: controller.__component + '/getCustomerStep4/:id', method: "get", function: controller.getCustomerStep4, private: true, perm_component: "customers", permission: "view" },
    { path: controller.__component + '/saveCustomerStep1', method: "post", function: controller.createOrUpdateStep1, private: true, perm_component: "customers", permission: "add", validationSchema:customerSchemaStep1 },
    { path: controller.__component + '/saveCustomerStep1/:id', method: "put", function: controller.createOrUpdateStep1, private: true, perm_component: "customers", permission: "update", validationSchema:customerSchemaStep1 },
    { path: controller.__component + '/saveCustomerStep2/:id', method: "put", function: controller.updateCustomerStep2, private: true, perm_component: "customers", permission: "update", validationSchema:customerSchemaStep2 },
    { path: controller.__component + '/saveCustomerStep4/:id', method: "put", function: controller.updateCustomerStep4, private: true, perm_component: "customers", permission: "update", validationSchema:customerSchemaStep4 },
    { path: controller.__component + '/:id', method: "delete", function: controller.delete, private: true, perm_component: "customers", permission: "delete" },
    { path: controller.__component + '/changeStatus/:id', method: "put", function: controller.setCustomerStatus, private: true, perm_component: "customers", permission: "update" },
    { path: controller.__component + '/getCustomerInfo/:id', method: "get", function: controller.getCustomerInfo, private: true, perm_component: "customers", permission: "view" },
    
    // Customer Contacts Endpoints
    { path: controller.__component + '/customer-contacts/', method: "get", function: contactController.list, private: true, perm_component: "customers", permission: "view" },
    { path: controller.__component + '/customer-contacts/:id', method: "get", function: contactController.get, private: true, perm_component: "customers", permission: "view" },
    { path: controller.__component + '/customer-contacts/', method: "post", function: contactController.createOrUpdate, private: true, validationSchema:customerContactSchema, perm_component: "customers", permission: "add" },
    { path: controller.__component + '/customer-contacts/:id', method: "put", function: contactController.createOrUpdate, private: true, validationSchema:customerContactSchema, perm_component: "customers", permission: "update" },
    { path: controller.__component + '/customer-contacts/:id', method: "delete", function: contactController.delete, private: true,perm_component: "customers", permission: "delete" },
    { path: controller.__component + '/customer-contacts/changeStatus/:id', method: "put", function: contactController.setContactStatus, private: true, perm_component: "customers", permission: "update"},
]
export default routes;