import { ObjectId } from "mongodb";
import { Customer } from "../../models";
import { checklistTypes } from "./checklistTypes";
import { regions } from "./regions";
import { costCenters } from "./costCenters";

export const customers: Customer[] = [
  {
    _id: new ObjectId("691f5893123d03c8fc06947f"),
    code: 101,
    name: "John Doe Logistics",
    email: "info@johndoelogistics.com",
    telNumber: "+12025550100",
    phoneNumber: "+12025550110",
    faxNumber: "+12025550120",
    tradingAs: "JD Logistics",
    companyRegNumber: "REG123456",
    regionId: regions[0]._id,
    vatNumber: 123456789,
    vatPercentage: 15,
    costCenterIds: [costCenters[0]._id],
    physicalAddress: {
      line1: "123 Main Street",
      line2: "Suite 4B",
      suburb: "New York",
      regionId: regions[0]._id,
      zipCode: 54000,
    },
    postalAddress: {
      line1: "P.O. Box 1234",
      line2: "Central Post Office",
      suburb: "New York",
      regionId: regions[0]._id,
      zipCode: 54000,
    },
    configuration: [
      {
        checkListType: "vehicle",
        checkListIds: [checklistTypes[0]._id, checklistTypes[1]._id],
        supportingDocs: [],
      },
    ],
    isActive: true,
  },
  {
    _id: new ObjectId("691f5893123d03c8fc069480"),
    code: 102,
    name: "Brightline Transport Co.",
    email: "contact@brightlinetransport.com",
    telNumber: "+442035550177",
    phoneNumber: "+442035550188",
    faxNumber: "+442035550199",
    tradingAs: "BT Logistics",
    companyRegNumber: "REG789654",
    regionId: regions[1]._id,
    vatNumber: 987654321,
    vatPercentage: 17,
    costCenterIds: [costCenters[0]._id],

    physicalAddress: {
      line1: "45 Fleet Street",
      line2: "Warehouse Block C",
      suburb: "London",
      regionId: regions[1]._id,
      zipCode: 75000,
    },
    postalAddress: {
      line1: "P.O. Box 5678",
      line2: "City Centre Mail",
      suburb: "London",
      regionId: regions[1]._id,
      zipCode: 75000,
    },
    configuration: [
      {
        checkListType: "equipment",
        checkListIds: [checklistTypes[0]._id, checklistTypes[1]._id],
        supportingDocs: [],
      },
    ],
    isActive: true,
  },
  {
    _id: new ObjectId("691f5893123d03c8fc069481"),
    code: 103,
    name: "Global Freight Solutions",
    email: "support@globalfreight.com",
    telNumber: "+612905550133",
    phoneNumber: "+612905550144",
    faxNumber: "+612905550155",
    tradingAs: "GFS",
    companyRegNumber: "REG456987",
    regionId: regions[2]._id,
    vatNumber: 654321987,
    vatPercentage: 10,
    costCenterIds: [costCenters[0]._id],
    physicalAddress: {
      line1: "89 Harbour Road",
      line2: "Logistics Hub",
      suburb: "Sydney",
      regionId: regions[2]._id,
      zipCode: 2000,
    },
    postalAddress: {
      line1: "P.O. Box 91011",
      line2: "Harbour Office",
      suburb: "Sydney",
      regionId: regions[2]._id,
      zipCode: 2000,
    },
    configuration: [
      {
        checkListType: "safety",
        checkListIds: [checklistTypes[0]._id, checklistTypes[1]._id],
        supportingDocs: [],
      },
    ],
    isActive: true,
  },
];
