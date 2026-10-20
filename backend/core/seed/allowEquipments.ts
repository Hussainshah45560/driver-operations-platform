import { ObjectId } from "mongodb";
import { AllowEquipment } from "../../models";

export const allowEquipments: AllowEquipment[] = [
  { _id: new ObjectId("691f4eaf317c7f9993063707"), name: "Uniform" },
  { _id: new ObjectId("691f4eaf317c7f9993063708"), name: "Mobile" },
  { _id: new ObjectId("691f4eaf317c7f9993063709"), name: "Helmet" },
  { _id: new ObjectId("691f4eaf317c7f999306370a"), name: "Load Box" },
];
