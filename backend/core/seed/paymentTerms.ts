import { ObjectId } from "mongodb";
import { PaymentTerm } from "../../models";

export const paymentTerms: PaymentTerm[] = [
  { _id: new ObjectId("691dd28367927096cf05f018"), name: "Weekly" },
  { _id: new ObjectId("691dd28367927096cf05f019"), name: "Monthly" },
];
