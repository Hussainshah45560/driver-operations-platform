import { ObjectId } from "mongodb";
import { DocumentType } from "../../models";

export const documentTypes: DocumentType[] = [
  { _id: new ObjectId("691f58dd123d03c8fc069484"), name: "Driver's License", type:"Document" },
  { _id: new ObjectId("691f58dd123d03c8fc069485"), name: "License Disc", type:"Document" },
  { _id: new ObjectId("691f58dd123d03c8fc069486"), name: "CV", type:"Document" },
  { _id: new ObjectId("691f58dd123d03c8fc069487"), name: "Passport", type:"Document" },
  { _id: new ObjectId("691f58dd123d03c8fc069488"), name: "Work Permit", type:"Document" },
  { _id: new ObjectId("691f58dd123d03c8fc069489"), name: "Proof of Address", type:"Document" },
  { _id: new ObjectId("691f58dd123d03c8fc06948a"), name: "Bank Statement/ Confirmation Letter", type:"Document" },
  { _id: new ObjectId("691f58dd123d03c8fc06948b"), name: "Educational Qualification", type:"Document" },
  { _id: new ObjectId("691f58dd123d03c8fc06948c"), name: "SARS Tax Confirmation", type:"Document" },
  { _id: new ObjectId("691f58dd123d03c8fc06948d"), name: "Selfie", type:"Document" },
  { _id: new ObjectId("691f58dd123d03c8fc069499"), name: "ID", type:"Document" },

  { _id: new ObjectId("691f58dd123d03c8fc06948e"), name: "ID", type:"Profile" },
  { _id: new ObjectId("691f58dd123d03c8fc06948f"), name: "Passport", type:"Profile" },
  { _id: new ObjectId("691f58dd123d03c8fc069490"), name: "Work Permit", type:"Profile" },
  { _id: new ObjectId("691f58dd123d03c8fc069491"), name: "Asylum", type:"Profile" },
  { _id: new ObjectId("691f58dd123d03c8fc069492"), name: "Application for Work Permit", type:"Profile" },

   { _id: new ObjectId("691f58dd123d03c8fc069494"), name: "Recruitment", type:"Recruitment" },
   { _id: new ObjectId("691f58dd123d03c8fc069495"), name: "Evidence", type:"Evidence" },
   { _id: new ObjectId("691f58dd123d03c8fc069496"), name: "Hearing", type:"Hearing" },
   { _id: new ObjectId("691f58dd123d03c8fc069497"), name: "Dispute", type:"Dispute" },
   { _id: new ObjectId("691f58dd123d03c8fc069498"), name: "Incident", type:"Incident" },
];