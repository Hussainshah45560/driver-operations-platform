import { route } from "../../../__types";
import * as Controller from './controller';
const controller: Controller.default = new Controller.default;


const routes: route[] = [
    { path: controller.__component + '/matchingCandidates', method: "get", function: controller.matchingCandidates, private: true },
    { path: controller.__component + '/shortlistedCandidates', method: "get", function: controller.shortListedCandidates, private: true },
    { path: controller.__component + '/finalisedCandidates', method: "get", function: controller.finalisedCandidates, private: true },
    { path: controller.__component + '/allowEquipmentsToCandidates', method: "get", function: controller.allowEquipmentsToCandidates, private: true },

]
export default routes;