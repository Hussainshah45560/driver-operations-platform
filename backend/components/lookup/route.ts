import { route } from "../../__types";
import * as Controller from './controller';
const controller: Controller.default = new Controller.default;

const routes: route[] = [
	
	{ path: controller.__component + '/getRoles', method: "get", function: controller.getRolesData, private: true },
	{ path: controller.__component + '/getAdminSettings', method: "get", function: controller.getAdminSettingType, private: true },
	{ path: controller.__component + '/getRegions', method: "get", function: controller.getRegionData, private: true },
	{ path: controller.__component + '/getVehicleTypes', method: "get", function: controller.getVehicleTypeData, private: true },
	{ path: controller.__component + '/getSubDevices', method: "get", function: controller.getSubDevicesByVehicleType, private: true },
	{ path: controller.__component + '/getAccessories', method: "get", function: controller.getAccessoriesByVehicleType, private: true },
	{ path: controller.__component + '/getTemplateType', method: "get", function: controller.getTemplateType, private: true },
	{ path: controller.__component + '/getDocumentType', method: "get", function: controller.getDocumentType, private: true },
	{ path: controller.__component + '/getNationality', method: "get", function: controller.getNationalities, private: true },
	{ path: controller.__component + '/getLanguages', method: "get", function: controller.getLanguages, private: true },
	{ path: controller.__component + '/getAccountType', method: "get", function: controller.getAccountType, private: true },
	{ path: controller.__component + '/getRelationType', method: "get", function: controller.getRelationType, private: true },
	{ path: controller.__component + '/getBenefits', method: "get", function: controller.getBenefits, private: true },
	{ path: controller.__component + '/getSkills', method: "get", function: controller.getSkills, private: true },
	{ path: controller.__component + '/getLicenseCodes', method: "get", function: controller.getLicenseCode, private: true },
	{ path: controller.__component + '/getAreas', method: "get", function: controller.getAreasByRegionId, private: true },
	{ path: controller.__component + '/getSupportingDocs', method: "get", function: controller.getSupportingDoc, private: true },
	{ path: controller.__component + '/getChecklistType', method: "get", function: controller.getChecklistType, private: true },
	{ path: controller.__component + '/getChecklist', method: "get", function: controller.getChecklist, private: true },
	{ path: controller.__component + '/getAODTypes', method: "get", function: controller.getAODType, private: true },
	{ path: controller.__component + '/getAODReasons', method: "get", function: controller.getAODReason, private: true },
	{ path: controller.__component + '/getPaymentTerms', method: "get", function: controller.getPaymentTerm, private: true },
	{ path: controller.__component + '/getUserProfiles', method: "get", function: controller.getInContractApplicantProfile, private: false,  },
	{ path: controller.__component + '/getRecruitmentTypes', method: "get", function: controller.getRecruitmentTypes, private: true },
	{ path: controller.__component + '/getRecruitmentModels', method: "get", function: controller.getRecruitmentModels, private: true },
	{ path: controller.__component + '/getCustomers', method: "get", function: controller.getCustomers, private: true },
	{ path: controller.__component + '/getCostCenters', method: "get", function: controller.getCostCenter, private: true },
	{ path: controller.__component + '/getAllowEquipments', method: "get", function: controller.getAllowEquipments, private: true },
	{ path: controller.__component + '/getCMCTemplates', method: "get", function: controller.getCMCTemplate, private: true },
	{ path: controller.__component + '/getDisciplinaryTypes', method: "get", function: controller.getDisciplinaryTypes, private: true },
	{ path: controller.__component + '/getDisputeTypes', method: "get", function: controller.getDisputeTypes, private: true },
	{ path: controller.__component + '/getClearanceTypes', method: "get", function: controller.getClearanceTypes, private: true },
	{ path: controller.__component + '/getWarningReasons', method: "get", function: controller.getWarningReasons, private: true },
	{ path: controller.__component + '/getAdmins', method: "get", function: controller.getAdminUsers, private: true },
	{ path: controller.__component + '/getAssetDetail', method: "get", function: controller.getAssetDetail, private: true },
	{ path: controller.__component + '/getBanks', method: "get", function: controller.getBanks, private: true },
	{ path: controller.__component + '/getTestTypes', method: "get", function: controller.getTestTypes, private: true },

];
export default routes;