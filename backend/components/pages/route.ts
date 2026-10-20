import { route } from "../../__types";
import * as Controller from './controller';
const controller: Controller.default = new Controller.default;

const routes: route[] = [
    { path: controller.__component + '/', method: "get", function: controller.get, private: false }
];
export default routes;