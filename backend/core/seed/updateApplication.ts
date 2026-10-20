import { areas } from "./areas";
import { assets } from "./assets";
import { benefits } from "./benefits";
import { documents } from "./documents";
import { employmentHistory } from "./employments";
import { licenseCodes } from "./licenseCodes";
import { skills } from "./skills";

export const updateApplication = {
  isMarried:true,
  education: {
      educationDetails: {
        lastSchool: "Mamelodi High School",
        highestGrade: "Matric",
        yearCompleted: 2017,
      },
      tertiaryQualification: true,
      tertiaryEducation: {
        institutionName: "University of Johannesburg",
        qualification: "Certicate IV in Logistics",
        yearCompleted: 2020,
      },
      futureEducationPlans: true,
      studyPlanDetail: "Degree in Industrial Engineering",
    },
    currentEmployment: {
      jobDescription: "Delivered food and occasionally supplies",
      benefitIds: [benefits[0]._id, benefits[1]._id],
      dismissedFromJob: true,
      employersDismissalEndorsement: 1,
      reasonForDismissal: "Injured for too many days",
    },
    employmentHistoryIds: [
      employmentHistory[0]._id,
      employmentHistory[1]._id,
      employmentHistory[2]._id,
    ],
    applicationStatus: "in progress",
    reasonForRejection: "",
    applicationType: "driver",
    driverDetails: {
      medication: "Phenytoin",
      medicationCondition: "Epilepsy",
      hasLicense: true,
      licenseNumber: "DL12345678",
      issuedDate: new Date("2018-06-10"),
      prdpExpiry: new Date("2026-06-10"),
      licenseExpiry: new Date("2028-06-10"),
      licenseCodeIds: [licenseCodes[0]._id, licenseCodes[1]._id],
      endorsements: false,
      vehicleOwned: true,
      anyAccidents: "none",
      licenseSuspended: "never",
      skillIds: [skills[0]._id, skills[1]._id],
      areaIds: [areas[0]._id, areas[1]._id],
    },
    assetIds: [assets[0]._id],
    security: {
      isArrested: true,
      arrestDetails: "Fight with another driver who caused an accident",
      courtCase: true,
      caseDetails: "Street accident and fight",
      criminalRecordDetails: "A clean record",
    },
    documentIds: [documents[0]._id, documents[1]._id],
    applicationSign: "signed_by_user",
    applicationSignDate: new Date(),
    stepStatus: {
      step1: "completed",
      step2: "in progress",
      step3: "completed",
      step4: "completed",
      step5: "completed",
      step6: "completed",
      step7: "completed",
      step8: "completed",
      step9: "completed",
    }
}