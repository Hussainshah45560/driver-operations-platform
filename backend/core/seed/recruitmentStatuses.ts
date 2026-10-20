import { ObjectId } from "mongodb";
import {  RecruitmentStatus } from "../../models";

export const recruitmentStatuses: RecruitmentStatus[] = [
  { _id: new ObjectId("691f4e97317c7f9993063704"), name: "In Contract" },
  { _id: new ObjectId("691f4e97317c7f9993063705"), name: "Successful" },
  { _id: new ObjectId("691f4e97317c7f9993063706"), name: "Unsuccessful" }
];
