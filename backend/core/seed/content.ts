import { ObjectId } from "mongodb";
import { Content } from "../../models";

export const contents: Content[] = [
  {
    _id: new ObjectId("691f580a123d03c8fc069478"),
    title: "Landing Page",
    code: "landing-page",
    heading: "Welcome to CMC Global",
    description:
      `<p><font face="Arial" color="#43474e">Keep in mind both drivers and admins will be using this screen. This body text should be filled by the clients and can be used to describe the company or any other relevant info they would like to communicate to users</font></p>`,
    isActive: true,
  },
  {
    _id: new ObjectId("691f580a123d03c8fc069479"),
    title: "Registration Page",
    code: "registration-page",
    heading: "<h2>Register as a<br>  Driver for CMC Global</h2>",
    description: `<p><font face="Arial">To be able to find, apply and track your job applications, as well as receive notifications.</font></p>`,
    isActive: true,
  },
  {
    _id: new ObjectId("691f580a123d03c8fc06947a"),
    title: "Forgot Password Page",
    code: "forgot-password-page",
    heading: "<h2>Forgot Password</h2>",
    description: `<p><font face="Arial">Since you forgot your password, we&#8217;ll be creating a new one. Before we can do that, we&#8217;ll need to know what your Cellphone number is.</font></p>`,
    isActive: true,
  },
  {
    _id: new ObjectId("691f580a123d03c8fc06947b"),
    title: "Confirmation Page",
    code: "confirmation-page",
    heading: "<h2>Let&#8217;s confirm it&#8217;s you</h2>",
    description: `<p><font face="Arial">We&#8217;ve sent a One-Time PIN to your cellphone number. Enter it here to confirm it&#8217;s you.</font></p>`,
    isActive: true,
  },
  {
    _id: new ObjectId("691f580a123d03c8fc06947c"),
    title: "New Password Page",
    code: "new-password-page",
    heading: "<h2>Let&#8217;s change your Password",
    description: `<p><font face="Arial">Since you forgot your current password, let&#8217;s change it to a new one.</font></p>`,
    isActive: true,
  },
  {
    _id: new ObjectId("69b194407a4198c7c8fca5c0"),
    title: "Set Password Page",
    code: "set-password-page",
    heading: "<h2>Let&#8217;s set your Password",
    description: `<p><font face="Arial">Since you are creating your new password, let&#8217;s set it.</font></p>`,
    isActive: true,
  },
];
