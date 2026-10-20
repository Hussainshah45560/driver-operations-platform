import { ObjectId } from "mongodb";
import { AccountType } from "../../models";

export const accountTypes: AccountType[] = [
  { _id: new ObjectId("691b6a4e63c29490260d65a1"), name: "Current (cheque/bond) Account" },
  { _id: new ObjectId("691b6a4e63c29490260d65a2"), name: "Savings Account" },
  { _id: new ObjectId("691b6a4e63c29490260d65a3"), name: "Transmission Account" },
  { _id: new ObjectId("691b6a4e63c29490260d65a4"), name: "Bond Account" },
];