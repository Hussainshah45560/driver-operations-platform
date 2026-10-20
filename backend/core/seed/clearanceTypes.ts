import { ObjectId } from "mongodb";
import { ClearanceType } from "../../models";

export const clearanceTypes: ClearanceType[] = [
  { _id: new ObjectId("69443fd199ae49d6bd0516ba"), name: "UI-19" },
  { _id: new ObjectId("69443fd199ae49d6bd0516bb"), name: "Providend Fund" },
  { _id: new ObjectId("69443fd199ae49d6bd0516bc"), name: "Confirmation Letter" },
  { _id: new ObjectId("69443fd199ae49d6bd0516bd"), name: "Final HRS / Leave Pay" },
  { _id: new ObjectId("69443fd199ae49d6bd0516be"), name: "IRP5" },
  { _id: new ObjectId("69443fd199ae49d6bd0516bf"), name: "Uniform" },
  { _id: new ObjectId("69443fd199ae49d6bd0516c0"), name: "Equipment Issued" },
  { _id: new ObjectId("69443fd199ae49d6bd0516c1"), name: "Asset" },
  { _id: new ObjectId("69443fd199ae49d6bd0516c2"), name: "Something Else" },
];