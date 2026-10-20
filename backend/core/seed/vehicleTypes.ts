import { ObjectId } from "mongodb";
import { VehicleType } from "../../models";

export const vehicleTypes: VehicleType[] = [
  { _id: new ObjectId("691f5c7a123d03c8fc06962b"), name: "Bike" },
  { _id: new ObjectId("691f5c7a123d03c8fc06962c"), name: "Passenger" },
  { _id: new ObjectId("691f5c7a123d03c8fc06962d"), name: "Light Commercial" },
  { _id: new ObjectId("691f5c7a123d03c8fc06962e"), name: "Medium Commercial" },
  { _id: new ObjectId("691f5c7a123d03c8fc06962f"), name: "Heavy Commercial" },
];
