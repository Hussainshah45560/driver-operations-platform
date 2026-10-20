import { ObjectId } from "mongodb";
import { Document } from "../../models";
import { users } from "./users";

export const documents: Document[] = [
  {
    _id: new ObjectId("691f58c3123d03c8fc069482"),
    userId: users[2]._id,
    name: "Driver License",
    type: "license",
    url: "https://example.com/license.pdf",
    status: "active",
  },
  {
    _id: new ObjectId("691f58c3123d03c8fc069483"),
    userId: users[2]._id,
    name: "Bike",
    type: "asset",
    url: "https://example.com/license.pdf",
    status: "active",
  },
];
