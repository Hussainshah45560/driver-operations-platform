import { ObjectId } from "mongodb";
import { User } from "../../models";
import { roles } from "./roles";
import Utility from "../../helpers/utility";

const util = new Utility();

export const users: User[] = [
  {
    _id: new ObjectId("691f597e123d03c8fc06949a"),
    phoneNumber: "+15550100000",
    roleId: roles[0]._id,
    ...util.passwordEn("DemoPass123!"),
    isActive: true,
  },
  {
    _id: new ObjectId("691f597e123d03c8fc06949b"),
    phoneNumber: "+15550100001",
    email: "admin@example.com",
    roleId: roles[1]._id,
    ...util.passwordEn("DemoPass123!"),
    isActive: true,
  },
  {
    _id: new ObjectId("691f597e123d03c8fc06949c"),
    phoneNumber: "+15550100002",
    email: "manager@example.com",
    roleId: roles[1]._id,
    ...util.passwordEn("DemoPass123!"),
    isActive: true,
  },
  {
    _id: new ObjectId("691f597e123d03c8fc06949d"),
    phoneNumber: "+15550100003",
    email: "coordinator@example.com",
    roleId: roles[1]._id,
    ...util.passwordEn("DemoPass123!"),
    isActive: true,
  },
  {
    _id: new ObjectId("691f597e123d03c8fc06949e"),
    phoneNumber: "+15550100004",
    roleId: roles[3]._id,
    ...util.passwordEn("DemoPass123!"),
    isActive: true,
  },
  {
    _id: new ObjectId("691f597e123d03c8fc06949f"),
    phoneNumber: "+15550100005",
    email: "confirmer@example.com",
    roleId: roles[5]._id,
    ...util.passwordEn("DemoPass123!"),
    isActive: true,
  },
  {
    _id: new ObjectId("691f597e123d03c8fc069491"),
    phoneNumber: "+15550100006",
    email: "approver@example.com",
    roleId: roles[6]._id,
    ...util.passwordEn("DemoPass123!"),
    isActive: true,
  },
  {
    _id: new ObjectId("691f597e123d03c8fc0694e9"),
    phoneNumber: "+15550100007",
    roleId: roles[3]._id,
    ...util.passwordEn("DemoPass123!"),
    isActive: true,
  },
    {
    _id: new ObjectId("691f597e123d03c8fc069459"),
    phoneNumber: "+15550100008",
    roleId: roles[3]._id,
    ...util.passwordEn("DemoPass123!"),
    isActive: true,
  },
];
