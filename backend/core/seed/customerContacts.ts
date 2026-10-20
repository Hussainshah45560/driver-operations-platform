import { ObjectId } from "mongodb";
import { CustomerContact } from "../../models";
import { customers } from "../seed/customers"; 
export const customerContacts: CustomerContact[] = [
  {
    _id: new ObjectId("691f587c123d03c8fc06947d"),
    customerId: customers[0]._id,
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    phoneNumber: "+1135131231", 
    isDefault: true,
    isActive: true,
  },
  {
    _id: new ObjectId("691f587c123d03c8fc06947e"),
    customerId: customers[1]._id,
    name: "Bob Smith",
    email: "bob.smith@example.com",
    phoneNumber: "+11234567890", 
    isDefault: false,
    isActive: true,
  },
];
