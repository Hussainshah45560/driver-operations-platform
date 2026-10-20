import { route } from "../../__types";
import { forgetPasswordSchema, registerSchema, setPasswordSchema, verifyCodeSchema } from "../../models/requestBody";
import AuthController from './controller';
const controller: AuthController = new AuthController();

const routes: route[] = [
	{ path: controller.__component + '/login', method: "post", function: controller.login, private: false },
	{ path: controller.__component + '/register', method: "post", function: controller.register, private: false, validationSchema:registerSchema },
	{ path: controller.__component + '/forgetPassword', method: "post", function: controller.forgetPassword, private: false, validationSchema:forgetPasswordSchema },
	{ path: controller.__component + '/verifyCode', method: "post", function: controller.verifyCode, private: false, validationSchema:verifyCodeSchema },
	{ path: controller.__component + '/setPassword', method: "post", function: controller.setPassword, private: false, validationSchema:setPasswordSchema },
	{ path: controller.__component + '/validateLink', method: "get", function: controller.isLinkValid, private: false },
	{ path: controller.__component + '/resendEmail', method: "get", function: controller.resendEmail, private: false },
	{ path: controller.__component + '/createPassword', method: "post", function: controller.createPassword, private: false },
];
export default routes;
