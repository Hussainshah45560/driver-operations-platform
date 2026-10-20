import { ObjectId } from "mongodb";
import { RelationType } from "../../models";

export const relationTypes: RelationType[] = [
  { _id: new ObjectId("691f5ba2123d03c8fc0695f8"), name: "Mother", category: "Kin" },
  { _id: new ObjectId("691f5ba2123d03c8fc0695f9"), name: "Father", category: "Kin" },
  { _id: new ObjectId("691f5ba2123d03c8fc0695fa"), name: "Wife", category: "Kin" },
  { _id: new ObjectId("691f5ba2123d03c8fc0695fb"), name: "Husband", category: "Kin" },
  { _id: new ObjectId("691f5ba2123d03c8fc0695fc"), name: "Sister", category: "Kin" },
  { _id: new ObjectId("691f5ba2123d03c8fc0695fd"), name: "Brother", category: "Kin" },
  { _id: new ObjectId("691f5ba2123d03c8fc0695fe"), name: "Aunt", category: "Kin" },
  { _id: new ObjectId("691f5ba2123d03c8fc0695ff"), name: "Uncle", category: "Kin" },
  { _id: new ObjectId("691f5ba2123d03c8fc069600"), name: "Cousin", category: "Kin" },
  { _id: new ObjectId("691f5ba2123d03c8fc069601"), name: "Partner", category: "Kin" },
  { _id: new ObjectId("691f5ba2123d03c8fc069602"), name: "Friend", category: "Kin" },

    { _id: new ObjectId("691f5ba2123d03c8fc069603"), name: "Customary", category: "Spouse" },
  { _id: new ObjectId("691f5ba2123d03c8fc069604"), name: "Civil", category: "Spouse" },
];
