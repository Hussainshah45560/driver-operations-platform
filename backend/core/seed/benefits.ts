import { ObjectId } from "mongodb";
import { Benefit } from "../../models";

export const benefits: Benefit[] = [
  { _id: new ObjectId("691f56c8123d03c8fc069461"), name: "Medical Aid" },
  { _id: new ObjectId("691f56c8123d03c8fc069462"), name: "Provident Fund" },
  { _id: new ObjectId("691f56c8123d03c8fc069463"), name: "Overtime" },
  { _id: new ObjectId("691f56c8123d03c8fc069464"), name: "UIF" },
  { _id: new ObjectId("691f56c8123d03c8fc069465"), name: "Bonuses" },
  { _id: new ObjectId("691f56c8123d03c8fc069466"), name: "Other" },
];
