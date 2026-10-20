import { ObjectId } from "mongodb";
import { RecruitmentType } from "../../models";

export const recruitmentTypes: RecruitmentType[] = [
  { _id: new ObjectId("691f4f02317c7f9993063712"), name: "Urgent Request" },
  { _id: new ObjectId("691f4f02317c7f9993063713"), name: "Unreal Deal" },
  { _id: new ObjectId("691f4f02317c7f9993063714"), name: "Replacements" },
  { _id: new ObjectId("691f4f02317c7f9993063715"), name: "Urgent Replacement" },
  { _id: new ObjectId("691f4f02317c7f9993063716"), name: "Store Launch" },
  { _id: new ObjectId("691f4f02317c7f9993063717"), name: "Risk Identified" },
  { _id: new ObjectId("691f4f02317c7f9993063718"), name: "Cancelled After Recruitment" },
];
