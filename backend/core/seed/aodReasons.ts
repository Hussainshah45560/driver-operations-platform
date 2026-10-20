import { ObjectId } from "mongodb";
import { AODReason } from "../../models";

export const aodReasons: AODReason[] = [
  { _id: new ObjectId("691dd37c67927096cf05f01c"), name: "Can't afford full amount" },
  { _id: new ObjectId("691dd37c67927096cf05f01d"), name: "Speeding" },
  { _id: new ObjectId("691dd37c67927096cf05f01e"), name: "Parking" },
];