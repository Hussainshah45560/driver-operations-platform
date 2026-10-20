import { ObjectId } from "mongodb";
import { z } from "zod";

const objectIdSchema = z.union([
  z.instanceof(ObjectId),
  z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId"),
]);

const booleanString = z.union([z.boolean(), z.string()]).transform((val) => {
  if (typeof val === "boolean") return val;
  if (typeof val === "string") {
    return val.toLowerCase() === "true" || val === "1";
  }
  return false;
});

export const assetSchema = z
  .object({
    _id: objectIdSchema.optional(),
    registrationNumber: z.string().min(1, "Registration number is required"),
    registrationDate: z.coerce.date().optional(),
    make: z.string().min(1, "Make is required"),
    model: z.string().min(1, "Model is required"),
    engineNumber: z.string().min(1, "Engine number is required"),
    chassisNumber: z.string().min(1, "Vin number is required"),
    vehicleTypeId: objectIdSchema,
    subDeviceIds: z.array(objectIdSchema).optional(),
    accessoryIds: z.array(objectIdSchema).optional(),
    tracking: booleanString,
    trackingSupplier: z.string().optional(),
    licenseExpiryDate: z.coerce.date(),
    currentMileage: z.coerce.number(),
    documentId: z.array(objectIdSchema).optional(),
    color: z.string().min(1, "Colour is required"),
    status: z
      .enum(["approved", "awaiting inspection", "rejected", "inactive"])
      .optional(),
  })
  .refine(
    (data) => {
      // If tracking is true, trackingSupplier must exist and not be empty
      return (
        !data.tracking ||
        (data.trackingSupplier && data.trackingSupplier.trim() !== "")
      );
    },
    {
      message: "Tracking supplier is required when tracking is enabled.",
      path: ["trackingSupplier"], // points the error to that field
    }
  );

 export const bankDetailsSchema = z
  .object({
    bankDetails: z.object({
      bankNameId: objectIdSchema,
      accountNumber: z.number().min(1, "Account number is required"),
      accountTypeId: objectIdSchema,
      branchCode: z.string().min(1, "Branch code is required"),
      branchName: z.string().min(1, "Branch name is required"),
    }),
  })
  .strict();

  export const incidentSchema = z.object({
  userId: objectIdSchema.optional(),
  templateId: objectIdSchema,
  assetId: objectIdSchema,
  date: z.coerce.date(),
  payload: z.record(z.string(), z.any()),
  status: z.enum(["recovered", "repaired", "write-off", "in review"]).optional().or(z.literal("")),
  notes: z.string().optional(),
}).strict();
