import { ObjectId } from "mongodb";
import { DisputeType } from "../../models";

export const disputeTypes: DisputeType[] = [
  { _id: new ObjectId("6944391999ae49d6bd0516b5"), name: "CCMA" },
  { _id: new ObjectId("6944391999ae49d6bd0516b6"), name: "NBCRFLI" },
  { _id: new ObjectId("6944391999ae49d6bd0516b7"), name: "Small Claims Court" },
  { _id: new ObjectId("6944391999ae49d6bd0516b8"), name: "Department of Labour" }
];