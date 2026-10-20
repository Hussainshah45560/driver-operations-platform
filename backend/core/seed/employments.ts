import { ObjectId } from "mongodb";
import { EmploymentHistory } from "../../models";
import { applications } from "./applications";

export const employmentHistory: EmploymentHistory[] = [
  {
    _id: new ObjectId("691f593b123d03c8fc069497"),
    applicationId: applications[0]._id,
    companyName: "ABC Transport",
    position: "Driver",
    jobDescription: "Delivered food and occasionally supplies",
    startDate: new Date("2015-01-01"),
    endDate: new Date("2019-12-31"),
    reasonForLeaving: "Better opportunity",
    salary: 12000,
    referenceName: "Michael Smith",
    referenceContact: "082-555-4321",
    referenceDesignation: "Supervisor",
  },
  {
    _id: new ObjectId("691f593b123d03c8fc069498"),
    applicationId: applications[0]._id,
    companyName: "ABC Transport",
    position: "Driver",
    jobDescription: "Delivered food and occasionally supplies",
    startDate: new Date("2015-01-01"),
    endDate: new Date("2019-12-31"),
    reasonForLeaving: "Better opportunity",
    salary: 12000,
    referenceName: "Michael Smith",
    referenceContact: "082-555-4321",
    referenceDesignation: "Supervisor",
  },
  {
    _id: new ObjectId("691f593b123d03c8fc069499"),
    applicationId: applications[0]._id,
    companyName: "ABC Transport",
    position: "Driver",
    jobDescription: "Delivered food and occasionally supplies",
    startDate: new Date("2015-01-01"),
    endDate: new Date("2019-12-31"),
    reasonForLeaving: "Better opportunity",
    salary: 12000,
    referenceName: "Michael Smith",
    referenceContact: "082-555-4321",
    referenceDesignation: "Supervisor",
  },
];
