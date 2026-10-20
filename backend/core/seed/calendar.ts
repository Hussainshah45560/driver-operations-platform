import { ObjectId } from "mongodb";
import { Calendar } from "../../models";

export const calendars: Calendar[] = [
  {
    _id: new ObjectId("691f56f2123d03c8fc069467"),
    name: "General Booking Calendar",
    calendlyAddress: "https://calendly.com/company/general",
    isActive:true
  },
  {
    _id: new ObjectId("691f56f2123d03c8fc069468"),
    name: "Premium Consultations",
    calendlyAddress: "https://calendly.com/company/premium",
    isActive:true
  },
  {
    _id: new ObjectId("691f56f2123d03c8fc069469"),
    name: "Support Calls",
    calendlyAddress: "https://calendly.com/company/support",
    isActive:true
  },
];
