import { ObjectId } from "mongodb";
import { LicenseCode } from "../../models";

export const licenseCodes: LicenseCode[]=[
    {_id: new ObjectId("691f5ace123d03c8fc06952a"), name:"A1 (Motorcycles up to 125 cc)"},
    {_id: new ObjectId("691f5ace123d03c8fc06952b"), name:"A (Motorcycles over 125 cc)"},
    {_id: new ObjectId("691f5ace123d03c8fc06952c"), name:"B (Light motor vehicles (≤ 3 500 kg GVM, small trailer ≤ 750 kg))"},
    {_id: new ObjectId("691f5ace123d03c8fc06952d"), name:"EB (Light motor vehicles with large trailer (> 750 kg))"},
    {_id: new ObjectId("691f5ace123d03c8fc06952e"), name:"C1 (Medium goods/passenger vehicles (3 500 – 16 000 kg GVM))"},
    {_id: new ObjectId("691f5ace123d03c8fc06952f"), name:"C (Heavy goods/passenger vehicles (> 16 000 kg GVM))"},
    {_id: new ObjectId("691f5ace123d03c8fc069530"), name:"EC1 (Combination vehicles with medium power unit towing > 750 kg)"},
    {_id: new ObjectId("691f5ace123d03c8fc069531"), name:"EC (Combination vehicles with heavy power unit towing > 750 kg)"},
]