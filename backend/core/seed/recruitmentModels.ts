import { ObjectId } from "mongodb";
import { RecruitmentModel } from "../../models";

export const recruitmentModels: RecruitmentModel[] = [
  { _id: new ObjectId("691f4ed0317c7f999306370b"), name: "None" },
  { _id: new ObjectId("691f4ed0317c7f999306370c"), name: "Stipend" },
  { _id: new ObjectId("691f4ed0317c7f999306370d"), name: "Replacements" },
  { _id: new ObjectId("691f4ed0317c7f999306370e"), name: "R200" },
  { _id: new ObjectId("691f4ed0317c7f999306370f"), name: "Top Up R350" },
  { _id: new ObjectId("691f4ed0317c7f9993063710"), name: "Top Up" },
  { _id: new ObjectId("691f4ed0317c7f9993063711"), name: "Low Volume Zone" },
];
