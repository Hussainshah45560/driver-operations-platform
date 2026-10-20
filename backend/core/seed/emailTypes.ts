import { ObjectId } from "mongodb";
import { EmailType } from "../../models";

export const emailTypes: EmailType[] = [
    {
		_id: new ObjectId("691f5922123d03c8fc069495"),
		title: "Forget Password OTP",
		fields: [
			{ message: "User Name", code: "{{user_name}}" },
			{ message: "Code", code: "{{code}}" },

		],
		used_for: "forget_password_otp_email",
	},
     {
		_id: new ObjectId("691f5922123d03c8fc069496"),
		title: "Set Password",
		fields: [
			{ message: "User Name", code: "{{user_name}}" },
			{ message: "User Email", code: "{{user_email}}" },
			{ message: "Link", code: "{{link}}" },

		],
		used_for: "set_password_link_email",
	},

]
