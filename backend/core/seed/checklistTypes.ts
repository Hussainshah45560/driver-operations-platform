import { ObjectId } from "mongodb";
import { ChecklistType } from "../../models";

export const checklistTypes: ChecklistType[] = [
  { _id: new ObjectId("691f5730123d03c8fc069460"), name: "General Checklist" },
  { _id: new ObjectId("691f5730123d03c8fc069461"), name: "Driver Inspection" },
  { _id: new ObjectId("691f5730123d03c8fc069462"), name: "Vehicle Inspection" },
];