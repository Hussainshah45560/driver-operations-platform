import { ObjectId } from "mongodb";
import { AODType } from "../../models";

export const aodTypes: AODType[] = [
  { _id: new ObjectId("691dd32267927096cf05f01a"), name: "Traffic Fines" },
  { _id: new ObjectId("691dd32267927096cf05f01b"), name: "Loan" },
];