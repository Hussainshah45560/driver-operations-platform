import { ObjectId } from "mongodb";
import { EmailTemplate } from "../../models";
import { emailTypes } from "./emailTypes";

export const emailTemplates: EmailTemplate[] = [
  {
    _id: new ObjectId("691f590a123d03c8fc069493"),
    name: "Forget Password OTP Template",
    subject: "Your OTP Code",
    content: `<h4>Hello {{user_name}}</h4>,

<p>Here is your OTP code: {{code}}</p>
<p>Please note that this code will be expired within 24 hours.</p>,

Thank you,
The Team`,
    emailTypeId: emailTypes[0]._id,
    isActive: true,
    description: "Template for sending OTP codes for password recovery",
  },
  {
    _id: new ObjectId("691f590a123d03c8fc069494"),
    name: "Set Password Template",
    subject: "Set Your Password",
    content: `<h4>Hello {{user_name}}</h4>,

<p>Please set your password using the following link: {{link}}</p>
<p>Please note that this code will be expired within 24 hours.</p>,

Thank you,
The Team`,

    emailTypeId: emailTypes[1]._id,
    isActive: true,
    description: "Template for setting a new password",
  },
];
