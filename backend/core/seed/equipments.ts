import { ObjectId } from "mongodb";
import { Equipment } from "../../models";
import { userProfiles } from "./userProfiles";
import { recruitments } from "./recruitments";
import { allowEquipments } from "./allowEquipments";



export const equipments: Equipment[] = [
    {
        _id: new ObjectId("692deba6f754533ff10814d4"),
        profileId: userProfiles[0]._id,
        recruitmentId: recruitments[0]._id,
        candidateName: "John Doe",
        contactNumber: "081-234-5678",
        status: "allocated",
        issueDate: new Date("2024-10-01"),
        returnDate: null as any, // returnDate not provided yet
        equipmentIds: [allowEquipments[0]._id, allowEquipments[1]._id]
    }
];
