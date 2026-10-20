import { ObjectId } from "mongodb";
import { User } from "../../models";
import { roles } from "./roles";
import Utility from "../../helpers/utility";

const util = new Utility();

export const users: User[] = [
  {
    _id: new ObjectId("691f597e123d03c8fc06949a"),
    phoneNumber: "03312502777",
    roleId: roles[0]._id,
    ...util.passwordEn("Test@123"),
    isActive: true,
  },
  {
    _id: new ObjectId("691f597e123d03c8fc06949b"),
    phoneNumber: "03212502777",
    email: "admin@loopbrackets.com",
    roleId: roles[1]._id,
    ...util.passwordEn("Test@123"),
    isActive: true,
  },
  {
    _id: new ObjectId("691f597e123d03c8fc06949c"),
    phoneNumber: "0635003622",
    email: "kevin@fluiddevelopment.co.za",
    roleId: roles[1]._id,
    ...util.passwordEn("Test@123"),
    isActive: true,
  },
  {
    _id: new ObjectId("691f597e123d03c8fc06949d"),
    phoneNumber: "0835406137",
    email: "kerri@fleet-flex.co.za",
    roleId: roles[1]._id,
    ...util.passwordEn("Test@123"),
    isActive: true,
  },
  {
    _id: new ObjectId("691f597e123d03c8fc06949e"),
    phoneNumber: "0665773560",
    roleId: roles[3]._id,
    ...util.passwordEn("Test@123"),
    isActive: true,
  },
  {
    _id: new ObjectId("691f597e123d03c8fc06949f"),
    phoneNumber: "03001234567",
    email: "confirmer@loopbrackets.com",
    roleId: roles[5]._id,
    ...util.passwordEn("Test@123"),
    isActive: true,
  },
  {
    _id: new ObjectId("691f597e123d03c8fc069491"),
    phoneNumber: "03001234568",
    email: "approver@loopbrackets.com",
    roleId: roles[6]._id,
    ...util.passwordEn("Test@123"),
    isActive: true,
  },
  {
    _id: new ObjectId("691f597e123d03c8fc0694e9"),
    phoneNumber: "0665773561",
    roleId: roles[3]._id,
    ...util.passwordEn("Test@123"),
    isActive: true,
  },
    {
    _id: new ObjectId("691f597e123d03c8fc069459"),
    phoneNumber: "0665773562",
    roleId: roles[3]._id,
    ...util.passwordEn("Test@123"),
    isActive: true,
  },
];
