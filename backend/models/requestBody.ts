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

const addressSchema = z
  .object({
    sameAsPhysicalAddress: z.boolean().optional(),
    sameAsMine: z.boolean().optional(),
    sameAsSpouse: z.boolean().optional(),
    sameAsMineForKin: z.boolean().optional(),
    line1: z.string().min(1, "Address line1 is required"),
    line2: z.string().optional(),
    regionId: objectIdSchema,
    suburb: z.string().min(1, "Suburb is required"),
    zipCode: z.string().min(1, "Zip code is required"),
  })
  .strict();

const bankDetailsSchema = z
  .object({
    bankNameId: objectIdSchema,
    accountNumber: z.number().min(1, "Account number is required"),
    accountTypeId: objectIdSchema,
    branchCode: z.string().min(1, "Branch code is required"),
    branchName: z.string().min(1, "Branch name is required"),
  })
  .strict();

const employmentInfoSchema = z
  .object({
    workForUs: z.boolean(),
    workAddress: z.string().optional(),
    relativeOnCompany: z.boolean(),
    relativeDetails: z.string().optional(),
  })
  .strict();

const contactSchema = z.object({
  _id: objectIdSchema.optional().or(z.literal("")),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  type: z.string().optional(),
  homePhone: z
    .string()
    .regex(/^\+?[0-9]\d{9,14}$/, "Invalid home phone number")
    .optional()
    .or(z.literal("")),
  mobilePhone: z
    .string()
    .regex(/^\+?[0-9]\d{9,14}$/, "Invalid mobile phone number"),
  relationId: objectIdSchema,
  address: addressSchema,
});

const dependentSchema = z.object({
  _id: objectIdSchema.optional().or(z.literal("")),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  age: z.number().min(0, "Age must be a positive number"),
});

export const registerSchema = z
  .object({
    firstName: z.string().min(1, "Frist name is required"),
    lastName: z.string().min(1, "Last name is required"),
    phoneNumber: z.string().regex(/^\+?[0-9]\d{9,14}$/, "Invalid phone number"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
        "Password must include uppercase, lowercase, number and special character"
      ),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords do not match",
    path: ["passwordConfirm"],
  });

export const changePasswordSchema = z
  .object({
    oldPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
        "Password must include uppercase, lowercase, number and special character"
      ),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
        "Password must include uppercase, lowercase, number and special character"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["passwordConfirm"],
  });

export const forgetPasswordSchema = z
  .object({
    phoneNumber: z
      .string()
      .regex(/^\+?[0-9]\d{9,14}$/, "Invalid mobile phone number")
      .optional()
      .or(z.literal("")),
    email: z.email().optional().or(z.literal("")),
  })
  .refine((data) => data.phoneNumber || data.email, {
    message: "Either phoneNumber or email must be provided",
    path: ["phoneNumber", "email"],
  });

export const verifyCodeSchema = z
  .object({
    phoneNumber: z
      .string()
      .regex(/^\+?[0-9]\d{9,14}$/, "Invalid mobile phone number")
      .optional()
      .or(z.literal("")),
    email: z.email().optional().or(z.literal("")),
    code: z
      .number()
      .int()
      .min(10000, "Code must be 5 digits")
      .max(99999, "Code must be 5 digits"),
  })
  .refine((data) => data.phoneNumber || data.email, {
    message: "Either phoneNumber or email must be provided",
    path: ["phoneNumber", "email"],
  });

export const setPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
        "Password must include uppercase, lowercase, number and special character"
      ),
    passwordConfirm: z.string(), // for "confirmed"
    phoneNumber: z
      .string()
      .regex(/^\+?[0-9]\d{9,14}$/, "Invalid mobile phone number")
      .optional()
      .or(z.literal("")),
    email: z.email().optional().or(z.literal("")),
    code: z
      .number()
      .int()
      .min(10000, "Code must be 5 digits")
      .max(99999, "Code must be 5 digits"),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords do not match",
    path: ["passwordConfirm"],
  })
  .refine((data) => data.phoneNumber || data.email, {
    message: "Either phoneNumber or email must be provided",
    path: ["phoneNumber", "email"],
  });

export const step1Schema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    userName: z.string().optional(),
    phoneNumber: z.string().regex(/^\+?[0-9]\d{9,14}$/, "Invalid phone number"),
    email: z.email("Invalid email address"),
    alternativeNumber: z
      .string()
      .regex(/^\+?[0-9]\d{9,14}$/, "Invalid alternative number")
      .optional()
      .or(z.literal("")),
    dateOfBirth: z.coerce.date({ message: "Date of birth is required" }),
    nationalityId: objectIdSchema,
    documentTypeId: objectIdSchema,
    profileId: objectIdSchema.optional(),
    idNumber: z.string().min(1, "Document number is required"),
    documentExpiryDate: z
      .union([z.coerce.date(), z.literal("")])
      .transform((val) => (val === "" ? "" : val))
      .optional(),
    nativeLanguageId: objectIdSchema,
    additionalLanguageIds: z.array(objectIdSchema).optional(),
    physicalAddress: addressSchema,
    postalAddress: addressSchema,
    bankDetails: bankDetailsSchema,
    employmentInfo: employmentInfoSchema,
  })
  .strict();

export const step2Schema = z.object({
  isMarried: z.boolean(),
  contacts: z.array(contactSchema).min(1, "At least one contact is required"),
  dependents: z.array(dependentSchema).optional(),
  userId: objectIdSchema,
});

export const step3Schema = z
  .object({
    educationDetails: z
      .object({
        lastSchool: z.string().min(1, "Last school is required"),
        highestGrade: z.string().min(1, "Highest grade is required"),
        yearCompleted: z
          .number()
          .int()
          .min(1900, "Year completed must be valid")
          .max(new Date().getFullYear(), "Year completed cannot be in future"),
      })
      .strict(),

    tertiaryQualification: z.boolean({
      message: "Tertiary qualification must be true or false",
    }),

    tertiaryEducation: z
      .object({
        institutionName: z.string().min(1, "Institution name is required"),
        qualification: z.string().min(1, "Qualification is required"),
        yearCompleted: z
          .number()
          .int()
          .min(1900, "Year completed must be valid")
          .max(new Date().getFullYear(), "Year completed cannot be in future"),
      })
      .strict()
      .optional(),

    futureEducationPlans: z.boolean({
      message: "Future education plans must be true or false",
    }),

    studyPlanDetail: z
      .string()
      .min(1, "Study plan detail is required")
      .optional()
      .or(z.literal("")),
  })
  .strict()
  .transform((data) => {
    const cleaned = { ...data };

    if (!cleaned.tertiaryQualification) {
      delete cleaned.tertiaryEducation;
    }

    if (!cleaned.futureEducationPlans) {
      delete cleaned.studyPlanDetail;
    }

    return cleaned;
  })
  .refine((data) => !(data.futureEducationPlans && !data.studyPlanDetail), {
    message: "Study plan detail is required if future education plan is true",
    path: ["studyPlanDetail"],
  });

export const employmentHistorySchema = z.object({
  applicationId: objectIdSchema,
  companyName: z.string().min(1, { message: "Company name is required" }),
  position: z.string().min(1, { message: "Position is required" }),
  jobDescription: z.string().min(1, { message: "Job description is required" }),
  startDate: z.preprocess(
    (val) => (val ? new Date(val as string) : undefined),
    z.date({ message: "Invalid start date" })
  ),
  endDate: z.preprocess(
    (val) => (val ? new Date(val as string) : undefined),
    z.date({ message: "Invalid end date" })
  ),
  type: z.string().min(1, { message: "Employment type is required" }),
  reasonForLeaving: z
    .string()
    .min(1, { message: "Reason for leaving is required" }),
  salary: z
    .union([z.number(), z.string().regex(/^\d+(\.\d+)?$/, "Invalid number")])
    .transform((val) => Number(val))
    .refine((val) => val > 0, { message: "Salary must be positive" }),
  referenceName: z.string().optional(),
  referenceContact: z
    .string()
    .regex(/^\+?[0-9]\d{9,14}$/, "Invalid reference contact number")
    .optional()
    .or(z.literal("")),
  referenceDesignation: z.string().optional(),
});

export const step4Schema = z
  .object({
    jobDescription: z.string().min(1, "Job description is required"),
    benefitIds: z.array(objectIdSchema).optional(),
    otherBenefit: z.string().optional(),
    dismissedFromJob: z.boolean(),
    employersDismissalEndorsement: z.number().optional(),
    reasonForDismissal: z.string().optional(),
    employmentHistoryIds: z.array(objectIdSchema).optional(),
  })
  .refine(
    (data) => {
      // If dismissedFromJob is true, reasonForDismissal must be provided
      if (data.dismissedFromJob) {
        return !!data.reasonForDismissal?.trim();
      }
      return true;
    },
    {
      message:
        "Reason for dismissal is required when dismissed from job is true",
      path: ["reasonForDismissal"], // shows which field caused the error
    }
  );

export const step5Schema = z
  .object({
    applicationType: z
      .string()
      .refine((val) => ["driver", "other"].includes(val), {
        message: "Application type must be either 'driver' or 'other'",
      }),
    jobPosition: z.string().optional(),
    hasLicense: z.boolean().optional(),
    endorsements: z.boolean().optional(),
    vehicleOwned: z.boolean().optional(),
    licenseNumber: z.string().optional(),
    licenseCodeIds: z.array(objectIdSchema).optional(),
    issuedDate: z.union([z.string(), z.date()]).optional(),
    licenseExpiry: z.union([z.string(), z.date()]).optional(),
    prdpExpiry: z.union([z.string(), z.date()]).optional(),
    drivingExperience: z.union([z.string(), z.number()]).optional(),
    anyAccidents: z.string().optional(),
    licenseSuspended: z.string().optional(),
    skillIds: z.array(objectIdSchema).optional(),
    areaIds: z.array(objectIdSchema).optional(),
    medicationCondition: z.string().optional(),
    medication: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.applicationType === "driver") {
      const requiredForDrivers: (keyof typeof data)[] = [
        "hasLicense",
        "endorsements",
        "vehicleOwned",
        "licenseNumber",
        "licenseCodeIds",
        "issuedDate",
        "licenseExpiry",
        "drivingExperience",
        "anyAccidents",
        "licenseSuspended",
        "medicationCondition",
        "medication",
        "areaIds",
      ];

      for (const field of requiredForDrivers) {
        if (
          data[field] === undefined ||
          data[field] === null ||
          data[field] === "" ||
          (Array.isArray(data[field]) && data[field].length === 0)
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [field],
            message: `${field} is required when application type is driver`,
          });
        }
      }
    } else if (data.applicationType === "other") {
      const requiredForNonDrivers: (keyof typeof data)[] = [
        "jobPosition",
        "skillIds",
        "medicationCondition",
        "medication",
        "areaIds",
      ];

      for (const field of requiredForNonDrivers) {
        if (
          data[field] === undefined ||
          data[field] === null ||
          data[field] === "" ||
          (Array.isArray(data[field]) && data[field].length === 0)
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [field],
            message: `${field} is required when application type is not driver`,
          });
        }
      }
    }
  });

export const step6Schema = z
  .object({
    _id: objectIdSchema.optional(),
    userId: objectIdSchema,
    applicationId: objectIdSchema.optional(),
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
    documentIds: z.array(objectIdSchema).optional(),
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

export const step7Schema = z
  .object({
    isArrested: z.boolean().refine((val) => val !== undefined, {
      message: "Are you arrested is required",
    }),
    arrestDetails: z.string().optional(),
    courtCase: z.boolean().refine((val) => val !== undefined, {
      message: "Court case is required",
    }),
    caseDetails: z.string().optional(),
    criminalRecordDetails: z
      .string()
      .nonempty("Criminal record details is required"),
  })
  .superRefine((data, ctx) => {
    // 🟥 If isArrested is true → arrestDetails required
    if (
      data.isArrested &&
      (!data.arrestDetails || data.arrestDetails.trim() === "")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["arrestDetails"],
        message: "Arrest details is required when arrested is true",
      });
    }

    // 🟧 If courtCase is true → caseDetails required
    if (
      data.courtCase &&
      (!data.caseDetails || data.caseDetails.trim() === "")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["caseDetails"],
        message: "Case details is required when court case is true",
      });
    }
  });

export const step8Schema = z.object({
  documentIds: z.array(objectIdSchema).nonempty("Document ids are required"),
});

export const step9Schema = z.object({
  applicationSign: z.string().optional(),
  applicationSignDate: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.coerce.date({ message: "Application sign date is required" })
  ),
});

export const applicationStatusSchema = z.object({
  status: z
    .string({ message: "Status is required" })
    .min(1, "status is required"),
  reason: z.string().optional(),
});

export const documentSchema = z.object({
  _id: objectIdSchema.optional(),
  userId: objectIdSchema.optional(), // required
  applicationId: objectIdSchema.optional(),
  customerId: objectIdSchema.optional(), // required
  recruitmentId: objectIdSchema.optional(),
  disciplinaryId: objectIdSchema.optional(),
  name: z.string().optional(),
  type: z.string(), // required
  url: z.string().optional(),
  status: z.enum(["active", "expired", "revoked", "uploaded"]).optional(),
});

export const nameSchema = z.object({
  name: z.string({ message: "Name is required" }).min(1, "Name is required"),
  code: z.string().optional(),
});

export const areaSchema = z.object({
  regionId: objectIdSchema,
  name: z.string({ message: "Name is required" }).min(1, "Name is required"),
});

export const vehicleIdDepSchema = z.object({
  vehicleTypeId: objectIdSchema,
  name: z.string({ message: "Name is required" }).min(1, "Name is required"),
});

export const docTypeSchema = z.object({
  name: z.string({ message: "Name is required" }).min(1, "Name is required"),
  type: z.string({ message: "Type is required" }).min(1, "Type is required"),
});

export const disciplinaryTypeSchema = z.object({
  name: z.string({ message: "Name is required" }).min(1, "Name is required"),
  type: z.string({ message: "Type is required" }).min(1, "Type is required"),
});

export const relationTypeSchema = z.object({
  name: z.string({ message: "Name is required" }).min(1, "Name is required"),
  category: z
    .string({ message: "Category is required" })
    .min(1, "Category is required"),
});

export const appSettingSchema = z.object({
  title: z.string({ message: "Title is required" }).min(1, "Title is required"),
  code: z.string(),
  value: z.literal("required"), // only allows the word "required"
});

export const userSchema = (id?: string) => {
  // base schema
  let schema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    userName: z.string().min(1, "Username is required"),
    alternativeNumber: z
      .string()
      .regex(/^\+?[0-9]\d{9,14}$/, "Invalid alternative number")
      .optional()
      .or(z.literal("")),
    email: z.email("Invalid email address"),
    phoneNumber: z.string().regex(/^\+?[0-9]\d{9,14}$/, "Invalid phone number"),
    roleId: objectIdSchema.optional(),
    physicalAddress: addressSchema,
    postalAddress: addressSchema,
  });

  // add password if id is missing
  if (!id) {
    schema = schema.extend({
      password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/,
          "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character"
        )
        .optional(),
    });
  }

  return schema;
};

export const calendarSchema = z.object({
  name: z.string().min(1, "Name is required"),
  calendlyAddress: z
    .string()
    .regex(
      /^https?:\/\/([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[a-zA-Z0-9@:%._+~#?&/=~-]*)?$/,
      "Invalid url format"
    )
    .min(1, "Calendly url address is required"),
});

export const emailTemplateSchema = z.object({
  _id: z.instanceof(ObjectId).optional(), // optional for inserts
  emailTypeId: objectIdSchema, // optional, can be added later
  name: z.string().min(1, "Name is required"),
  subject: z.string().min(1, "Subject is required"),
  description: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  isActive: z.boolean(), // required
  sendTo: z.array(z.string()).optional(),
});

const fieldSchema = z.object({
  name: z.string().min(1, "Field name is required"),
  type: z.enum(["string", "time", "text", "boolean"]),
});

export const templateSchema = z.object({
  _id: z.instanceof(ObjectId).optional(), // optional for inserts
  templateTypeId: objectIdSchema, // required
  name: z.string().min(1, "Name is required"), // required
  description: z.string().optional(),
  documentTypeId: objectIdSchema.optional(),
  customerId: objectIdSchema.optional().or(z.literal("")),
  documentName: z.string().optional(),
  isActive: z.boolean().default(true),
  used_for:z.string().min(1, "Used For is required"),
  content: z.string().min(1, "Content is required"), // required
  fields: z.array(fieldSchema).optional(),
  signPlatform: z.string().optional(),
});

export const templateTypeSchema = z.object({
  title: z.string().min(1, "This field is required"),
  used_for: z.string().min(1, "This field is required"),
  fields: z
    .array(
      z.object({
        message: z.string().min(1, "Message is required"),
        code: z.string().min(1, "Code is required"),
      })
    )
    .min(1, "At least one field is required"),
});

export const permissionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  priority: z
    .number()
    .int()
    .nonnegative("Priority must be a positive number")
    .optional(),
  permissions: z.record(
    z.string(), // outer key type
    z.record(z.string(), z.boolean()) // inner record: { [key: string]: boolean }
  ),
});

export const contentPagesSchema = z.object({
  title: z.string(),
  heading: z.string(),
  description: z.string(),
  isActive: z.boolean(),
});

export const customerContactSchema = z.object({
  customerId: objectIdSchema,
  name: z.string().min(1, "Name is required"),
  position: z.string().min(1, "Position is required"),
  email: z.email("Invalid email"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  isDefault: z.boolean(),
  isActive: z.boolean().optional(),
}).strict();

export const customerSchemaStep1 = z
  .object({
    code: z.number(),
    name: z.string().min(1, "Name is required"),
    email: z.email("Invalid email address"),
    telNumber: z
      .string()
      .regex(/^\+?[0-9]\d{9,14}$/, "Invalid phone number")
      .min(1, "Telephone number is required"),
    // phoneNumber: z
    //   .string()
    //   .regex(/^\+?[0-9]\d{9,14}$/, "Invalid phone number")
    //   .min(1, "Phone number is required"),
    //faxNumber: z.string().optional(),
    tradingAs: z.string().min(1, "Trading is required"),
    companyRegNumber: z.string().min(1, "Company Registration is required"),
    regionId: objectIdSchema,
    vatNumber: z.number(),
    vatPercentage: z.number(),
    //  statusCode: z.string().min(1, "Status code is required"),
    costCenterIds: z.array(objectIdSchema).optional(),
  })
  .strict();

export const customerSchemaStep2 = z.object({
  physicalAddress: addressSchema,
  postalAddress: addressSchema,
});

const configurationItemSchema = z.object({
  checkListType: z.string().optional(),
  checkListIds: z.array(objectIdSchema).optional(),
  supportingDocs: z.array(objectIdSchema).optional(),
});

export const customerSchemaStep4 = z.object({
  configuration: z.array(configurationItemSchema).optional().default([]),
});

export const optionSchema = z.object({
  name: z.string().min(1, "Option name is required"),
});

export const groupSchema = z.object({
  name: z.string().min(1, "Group name is required"),
  options: z.array(optionSchema).default([]),
});

export const checklistSchema = z.object({
  checklistTypeId: objectIdSchema, // ObjectId ref to checklist type
  name: z.string().min(1, "Checklist name is required"),
  groups: z.array(groupSchema).default([]),
  isActive: z.boolean().default(true).optional(),
});

export const aodSchema = z
  .object({
    _id: objectIdSchema.optional(),
    profileId: objectIdSchema,
    templateId: objectIdSchema,
    paymentTermId: objectIdSchema,
    aodTypeId: objectIdSchema,
    aodReasonId: objectIdSchema,
    date: z.preprocess((val) => {
      if (typeof val === "string" || typeof val === "number")
        return new Date(val);
      return val;
    }, z.date()),
    paymentDuration: z.string().min(1, "Payment duration is required"),
    amount: z.string().min(1, "Amount is required"),
    // If you actually want number: z.coerce.number().positive()
    weekOrMonth: z.string().min(1, "Day or month is required"),
  })
  .strict();

  export const recruitmentSchema = z.object({
  customerId: objectIdSchema,
  regionId: objectIdSchema,
  areaIds: z.array(objectIdSchema),
  site: z.string(),
  recruitmentTypeId: objectIdSchema,
  recruitmentModelId: objectIdSchema,
  availablePositions: z.coerce.number().int().nonnegative(),
  jobType: z.string(),
  jobTitle: z.string(),
  jobDescription: z.string(),
  startDate:  z
      .union([z.coerce.date(), z.literal("")])
      .transform((val) => (val === "" ? "" : val)),
  isEndDate: z.boolean(),
  endDate:  z
      .union([z.coerce.date(), z.literal("")])
      .transform((val) => (val === "" ? "" : val))
      .optional(),
  skillIds: z.array(objectIdSchema),
  costCenterIds: z.array(objectIdSchema),
  status: z
    .enum(["induction", "searching", "shortlisted", "finalised"])
    .optional(),
  documentIds: z.array(objectIdSchema),
  shortListedIds: z.array(objectIdSchema).optional(),
  finalisationIds: z.array(objectIdSchema).optional(),
  isInductionRequired: z.boolean(),
}).superRefine((data, ctx) => {
    // ✅ If isEndDate is true, endDate is required
    if (data.isEndDate && !data.endDate) {
      ctx.addIssue({
        path: ["endDate"],
        message: "End date is required when isEndDate is true",
        code: z.ZodIssueCode.custom,
      });
    }
  });
