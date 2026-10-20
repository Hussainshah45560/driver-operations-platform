import { ObjectId } from "mongodb";
import { CostCenter } from "../../models";

export const costCenters: CostCenter[] = [
  { _id: new ObjectId("691e23ac18565ffc7a0def65"), name: "Cost Center 1" },
  { _id: new ObjectId("691e23ac18565ffc7a0def66"), name: "Cost Center 2" },
  { _id: new ObjectId("691e23ac18565ffc7a0def67"), name: "Cost Center 3" },
];
