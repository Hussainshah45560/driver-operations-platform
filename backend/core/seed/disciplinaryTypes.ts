import { ObjectId } from "mongodb";
import { DisciplinaryType } from "../../models";
import { customers } from "./customers";

export const disciplinaryTypes: DisciplinaryType[] = [
  { _id: new ObjectId("694438a899ae49d6bd0516ad"), name: "Verbal Warning", type:"employee" },
  { _id: new ObjectId("694438a899ae49d6bd0516ae"), name: "Counselling",type:"employee" },
  { _id: new ObjectId("694438a899ae49d6bd0516af"), name: "1st Warning", type:"employee" },
  { _id: new ObjectId("694438a899ae49d6bd0516b0"), name: "2nd Warning", type:"employee" },
  { _id: new ObjectId("694438a899ae49d6bd0516b1"), name: "3rd Warning", type:"employee" },
  { _id: new ObjectId("694438a899ae49d6bd0516b2"), name: "Final Warning", type:"employee" },
  { _id: new ObjectId("694438a899ae49d6bd0516b3"), name: "Disciplinary Enquiry", type:"employee" },
  { _id: new ObjectId("694438a899ae49d6bd0516b4"), name: "AOD", type:"employee" },
  { _id: new ObjectId("694438a899ae49d6bd0516b5"), name: "Breach", type:"contractor" },
   { _id: new ObjectId("694438a899ae49d6bd0516b6"), name: "1st Warning From Customer", type:"employee", customerId:customers[1]._id },
];