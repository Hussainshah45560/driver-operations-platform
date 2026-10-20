import { route } from "../../../__types";
import { calendarSchema } from "../../../models/requestBody";
import * as Controller from './controller';
const controller: Controller.default = new Controller.default;

const routes: route[] = [
    { path: controller.__component + '/', method: "get", function: controller.list, private: true, perm_component: "calendars", permission: "view" },
    { path: controller.__component + '/:id', method: "get", function: controller.get, private: true, perm_component: "calendars", permission: "view" },
    { path: controller.__component + '/', method: "post", function: controller.createOrUpdate, private: true, perm_component: "calendars", permission: "add", validationSchema:calendarSchema },
    { path: controller.__component + '/:id', method: "put", function: controller.createOrUpdate, private: true, perm_component: "calendars", permission: "update", validationSchema:calendarSchema },
    { path: controller.__component + '/:id', method: "delete", function: controller.delete, private: true, perm_component: "calendars", permission: "delete" },
    { path: controller.__component + '/changeStatus/:id', method: "put", function: controller.setCalendarStatus, private: true, perm_component: "calendars", permission: "update" },

];

export default routes;