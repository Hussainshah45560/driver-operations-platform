import { ObjectId } from "mongodb";
import { Accessory } from "../../models";
import { vehicleTypes } from "./vehicleTypes";

export const accessories: Accessory[] =[
    { _id: new ObjectId("691b699a63c29490260d6596"), name: "Crash Bar", vehicleTypeId: vehicleTypes[0]._id },
    { _id: new ObjectId("691b699a63c29490260d6597"), name: "Roll Bar", vehicleTypeId: vehicleTypes[2]._id },
    { _id: new ObjectId("691b699a63c29490260d6598"), name: "Bull Bar", vehicleTypeId: vehicleTypes[2]._id },
    { _id: new ObjectId("691b699a63c29490260d6599"), name: "Cargo Net", vehicleTypeId: vehicleTypes[2]._id },
    { _id: new ObjectId("691b699a63c29490260d659a"), name: "Rubberising", vehicleTypeId: vehicleTypes[2]._id },
    { _id: new ObjectId("691b699a63c29490260d659b"), name: "Rubberising", vehicleTypeId: vehicleTypes[3]._id },
    { _id: new ObjectId("691b699a63c29490260d659c"), name: "Rubberising", vehicleTypeId: vehicleTypes[4]._id },
    { _id: new ObjectId("691b699a63c29490260d659d"), name: "Fire Ext", vehicleTypeId: vehicleTypes[2]._id },
    { _id: new ObjectId("691b699a63c29490260d659e"), name: "Fire Ext", vehicleTypeId: vehicleTypes[3]._id },
    { _id: new ObjectId("691b699a63c29490260d659f"), name: "Fire Ext", vehicleTypeId: vehicleTypes[4]._id },

]