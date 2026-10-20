import { ObjectId } from "mongodb";
import { SubDevice } from "../../models";
import { vehicleTypes } from "./vehicleTypes";

export const subDevices: SubDevice[] = [
  { _id: new ObjectId("691f5c34123d03c8fc069620"), name: "Load box", vehicleTypeId: vehicleTypes[0]._id },
  { _id: new ObjectId("691f5c34123d03c8fc069621"), name: "Canopy", vehicleTypeId: vehicleTypes[2]._id },
  { _id: new ObjectId("691f5c34123d03c8fc069622"), name: "Trailer", vehicleTypeId: vehicleTypes[2]._id },
  { _id: new ObjectId("691f5c34123d03c8fc069623"), name: "Trailer", vehicleTypeId: vehicleTypes[3]._id },
  { _id: new ObjectId("691f5c34123d03c8fc069624"), name: "Trailer", vehicleTypeId: vehicleTypes[4]._id },
  { _id: new ObjectId("691f5c34123d03c8fc069625"), name: "Tail Lift", vehicleTypeId: vehicleTypes[3]._id },
  { _id: new ObjectId("691f5c34123d03c8fc069626"), name: "Tail Lift", vehicleTypeId: vehicleTypes[4]._id },
  { _id: new ObjectId("691f5c34123d03c8fc069627"), name: "Body", vehicleTypeId: vehicleTypes[3]._id },
  { _id: new ObjectId("691f5c34123d03c8fc069628"), name: "Body", vehicleTypeId: vehicleTypes[4]._id },

];
