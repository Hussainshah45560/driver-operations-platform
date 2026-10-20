import { ObjectId } from "mongodb";
import { Asset } from "../../models";
import { documents } from "./documents";
import { users } from "./users";
import { applications } from "./applications";
import { vehicleTypes } from "./vehicleTypes";
import { subDevices } from "./subDevices";
import { accessories } from "./accessories";


export const assets: Asset[] = [
  {
    _id: new ObjectId("691f56ad123d03c8fc069460"),
    userId: users[2]._id,
    applicationId:applications[0]._id,
    registrationNumber: "CA12345",
    registrationDate: new Date("2022-01-01"),
    make: "Toyota",
    model: "Hilux",
    engineNumber: "ENG12345",
    chassisNumber: "CHS98765",
    licenseExpiryDate: new Date("2026-01-01"),
    currentMileage: 55000,
    color: "White",
    vehicleTypeId: vehicleTypes[0]._id,
    subDeviceIds: [subDevices[0]._id],
    accessoryIds: [accessories[0]._id],
    tracking: true,
    trackingSupplier: "TrackIt",
    status: "approved",
    documentIds:[documents[0]._id,documents[1]._id]
  },
];
