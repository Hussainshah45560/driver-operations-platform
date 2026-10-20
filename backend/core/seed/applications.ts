import { ObjectId } from "mongodb";
import { Application } from "../../models";
import { users } from "./users";
import { userProfiles } from "./userProfiles";
import Utility from "../../helpers/utility";
import { regions } from "./regions";
import { relationTypes } from "./relationTypes";

const util = new Utility();

export const applications: Application[] = [
  {
    _id: new ObjectId("691f43ec317c7f9993063002"),
    userId: users[4]._id,
    profileId: userProfiles[4]._id,
    applicationNumber: util.generateNumber(),
    applicationType: "in progress",
    emergencyContacts: [{
      userId: users[2]._id,
      firstName: "John",
      lastName: "Doe",
      relationId: relationTypes[11]._id,
      type: "spouse",
      homePhone: "+15550100020",
      mobilePhone: "+15550100020",
      address: {
        line1: "12 Main St",
        line2: "12 Main St",
        suburb: "Cape Town",
        regionId: regions[0]._id,
        zipCode: 80010,
      },
    },
    {
      userId: users[2]._id,
      firstName: "John",
      lastName: "Doe",
      relationId: relationTypes[5]._id,
      type: "kin",
      homePhone: "+15550100020",
      mobilePhone: "+15550100020",
      address: {
        line1: "12 Main St",
        line2: "12 Main St",
        suburb: "Cape Town",
        regionId: regions[0]._id,
        zipCode: 80010,
      },
    },],
    dependents: [
      { _id: new ObjectId("69205966539ad48f060d335e"), firstName: "John", lastName: "Doe", age: 10 },
      { _id: new ObjectId("69205966539ad48f060d335f"), firstName: "Sara", lastName: "Khan", age: 8 },
    ],
    employmentInfo: {
      workForUs: true,
      workAddress: "Atelier Deliverins, Randburg",
      relativeOnCompany: true,
      relativeDetails: "Danial Dumalani, Bike Driver",
    },
  },
  {
    _id: new ObjectId("691f43ec317c7f9993063004"),
    userId: users[7]._id,
    profileId: userProfiles[7]._id,
    applicationNumber: util.generateNumber(),
    applicationType: "in progress",
    emergencyContacts: [{
      userId: users[7]._id,
      firstName: "John",
      lastName: "Doe",
      relationId: relationTypes[11]._id,
      type: "spouse",
      homePhone: "+15550100020",
      mobilePhone: "+15550100020",
      address: {
        line1: "12 Main St",
        line2: "12 Main St",
        suburb: "Cape Town",
        regionId: regions[0]._id,
        zipCode: 80010,
      },
    },
    {
      userId: users[7]._id,
      firstName: "John",
      lastName: "Doe",
      relationId: relationTypes[5]._id,
      type: "kin",
      homePhone: "+15550100020",
      mobilePhone: "+15550100020",
      address: {
        line1: "12 Main St",
        line2: "12 Main St",
        suburb: "Cape Town",
        regionId: regions[0]._id,
        zipCode: 80010,
      },
    },],
    dependents: [
      { _id: new ObjectId("69205966539ad48f060d3356"), firstName: "John", lastName: "Doe", age: 10 },
      { _id: new ObjectId("69205966539ad48f060d3359"), firstName: "Sara", lastName: "Khan", age: 8 },
    ],
    employmentInfo: {
      workForUs: true,
      workAddress: "Atelier Deliverins, Randburg",
      relativeOnCompany: true,
      relativeDetails: "Danial Dumalani, Bike Driver",
    },
  },
    {
    _id: new ObjectId("691f43ec317c7f9993063044"),
    userId: users[8]._id,
    profileId: userProfiles[8]._id,
    applicationNumber: util.generateNumber(),
    applicationType: "in progress",
    emergencyContacts: [{
      userId: users[8]._id,
      firstName: "John",
      lastName: "Doe",
      relationId: relationTypes[11]._id,
      type: "spouse",
      homePhone: "+15550100020",
      mobilePhone: "+15550100020",
      address: {
        line1: "12 Main St",
        line2: "12 Main St",
        suburb: "Cape Town",
        regionId: regions[0]._id,
        zipCode: 80010,
      },
    },
    {
      userId: users[8]._id,
      firstName: "John",
      lastName: "Doe",
      relationId: relationTypes[5]._id,
      type: "kin",
      homePhone: "+15550100020",
      mobilePhone: "+15550100020",
      address: {
        line1: "12 Main St",
        line2: "12 Main St",
        suburb: "Cape Town",
        regionId: regions[0]._id,
        zipCode: 80010,
      },
    },],
    dependents: [
      { _id: new ObjectId("69205966539ad48f060d3388"), firstName: "John", lastName: "Doe", age: 10 },
      { _id: new ObjectId("69205966539ad48f060d3385"), firstName: "Sara", lastName: "Khan", age: 8 },
    ],
    employmentInfo: {
      workForUs: true,
      workAddress: "Atelier Deliverins, Randburg",
      relativeOnCompany: true,
      relativeDetails: "Danial Dumalani, Bike Driver",
    },
  },
];
