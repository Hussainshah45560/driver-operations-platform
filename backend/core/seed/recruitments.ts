import { ObjectId } from "mongodb";
import { Recruitment } from "../../models";
import { customers } from "./customers";
import { regions } from "./regions";
import { costCenters } from "./costCenters";
import { cmcTemplates } from "./cmcTemplates";
import { recruitmentTypes } from "./recruitmentTypes";

export const recruitments: Recruitment[] = [
  {
    _id: new ObjectId("691f5bf0123d03c8fc000108"),
    requestNumber: "REQ-0001",
    customerId: customers[0]._id,
    regionId: regions[0]._id,
    areaIds: [costCenters[0]._id],
    site: "Site A",
    recruitmentTypeId: recruitmentTypes[0]._id,
    recruitmentModelId: cmcTemplates[0]._id,
    availablePositions: 5,
    jobType: "Full-time",
    jobTitle: "Software Developer",
    jobDescription: "Responsible for developing and maintaining applications.",
    startDate: new Date(),
    isEndDate: false,                   
    skillIds: [],                       
    documentIds: [],                    
    status: "induction",                
    shortListedIds: [],                 
    finalisedIds: [],                
    isActive: true,
    isDeleted: false,
    isInductionRequired:true,
    requestDate: new Date(),
  },
];
