import { route } from "../../__types";
import * as Controller from './controller';
const controller: Controller.default = new Controller.default;

const routes: route[] = [
    { path: controller.__component + '/signNow', method: "post", function: controller.signNowWebhook, private: false },
    { path: controller.__component + '/dot360Verification', method: "post", function: controller.dot360Webhook, private: false }
];
export default routes;