import { ObjectId } from "mongodb";
export interface User {
  _id: ObjectId;
  phoneNumber: string;
  email?: string;
  password?: string;
  salt?: string;
  roleId: ObjectId;
  role?: Role;
  isActive: boolean;
  isDeleted?: boolean;
  forgetPassword?: {
    code: number;
    validTill: Date;
    link?: string
  };
  profileId?: ObjectId;
}

export interface Profile {
  _id: ObjectId;
  userId: ObjectId;
  firstName: string;
  lastName: string;
  userName?: string;
  email?: string;
  phoneNumber: string;
  alternativeNumber?: string;
  nationalityId?: ObjectId;
  documentTypeId?: ObjectId;
  idNumber?: string;
  documentExpiryDate?: Date;
  nativeLanguageId?: ObjectId;
  additionalLanguageIds?: ObjectId[];
  physicalAddress?: Address;
  postalAddress?: Address;
  bankDetails?: {
    bankNameId: ObjectId;
    accountNumber: number;
    accountTypeId: ObjectId;
    branchCode: string;
    branchName: string;
  };
  gender?: "male" | "female" | "other";
  dateOfBirth?: Date;
  workedbeforeUs?: boolean;
  verfications?: {
    name: string;
    ref: string;
    status: string;
    result: string;
  }[];
}

export interface Role {
  _id: ObjectId;
  name: string;
  permissions: { [key: string]: { [key: string]: boolean } };
}

export interface AppSetting {
  _id?: ObjectId;
  title: string;
  code: string;
  value: any;
}

export interface Log {
  _id?: ObjectId;
  component: string;
  action: string;
  userId: ObjectId | null;
  documentId?: ObjectId | null;
  ip: string;
  timestamp: Date;
  after?: object;
}

export interface Application {
  _id: ObjectId;
  applicationNumber: string;
  userId: ObjectId;
  profileId: ObjectId;
  employmentInfo: {
    workForUs: boolean;
    workAddress?: string;
    relativeOnCompany: boolean;
    relativeDetails?: string;
  };
  dependents?: {
    _id: ObjectId;
    firstName: string;
    lastName: string;
    age: number;
  }[];
  isMarried?: boolean;
  emergencyContacts?: Contact[];
  education?: Education;
  employmentHistoryIds?: ObjectId[];
  currentEmployment?: CurrentEmployment;
  employmentHistory?: EmploymentHistory[];
  applicationStatus?:
  | "in progress"
  | "accepted"
  | "rejected"
  | "completed"
  | "confirmed"
  | "not confirmed"
  | "changed"
  | "shortlisted"
  | "finalised"
  | "in contract"
  | "terminated";
  reasonForRejection?: string;
  applicationType?: string;
  applicationCategory?: string;
  driverDetails?: {
    jobPosition?: string;
    hasLicense?: boolean;
    endorsements?: boolean;
    vehicleOwned?: boolean;
    licenseNumber?: string;
    licenseCodeIds?: ObjectId[];
    issuedDate?: Date;
    licenseExpiry?: Date;
    prdpExpiry?: Date;
    drivingExperience?: number;
    anyAccidents?: string;
    licenseSuspended?: string;
    skillIds?: ObjectId[];
    areaIds: ObjectId[];
    medicationCondition?: string;
    medication?: string;
  };
  assetIds?: ObjectId[];
  assets?: Asset[];
  security?: {
    isArrested: boolean;
    arrestDetails?: string;
    courtCase: boolean;
    caseDetails?: string;
    criminalRecordDetails: string;
  };
  documentIds?: ObjectId[];
  documents?: Document[];
  applicationSign?: string;
  applicationSignDate?: Date;
  stepStatus?: {
    step1:
    | "in progress"
    | "completed"
    | "changed"
    | "approved"
    | "rejected"
    | "confirmed"
    | "not confirmed";
    step2:
    | "in progress"
    | "completed"
    | "changed"
    | "approved"
    | "rejected"
    | "confirmed"
    | "not confirmed";
    step3:
    | "in progress"
    | "completed"
    | "changed"
    | "approved"
    | "rejected"
    | "confirmed"
    | "not confirmed";
    step4:
    | "in progress"
    | "completed"
    | "changed"
    | "approved"
    | "rejected"
    | "confirmed"
    | "not confirmed";
    step5:
    | "in progress"
    | "completed"
    | "changed"
    | "approved"
    | "rejected"
    | "confirmed"
    | "not confirmed";
    step6:
    | "in progress"
    | "completed"
    | "changed"
    | "approved"
    | "rejected"
    | "confirmed"
    | "not confirmed"
    | "skipped";
    step7:
    | "in progress"
    | "completed"
    | "changed"
    | "approved"
    | "rejected"
    | "confirmed"
    | "not confirmed";
    step8:
    | "in progress"
    | "completed"
    | "changed"
    | "approved"
    | "rejected"
    | "confirmed"
    | "not confirmed";
    step9:
    | "in progress"
    | "completed"
    | "changed"
    | "approved"
    | "rejected"
    | "confirmed"
    | "not confirmed";
  };
  stepReject?: {
    step1reason?: string;
    step2reason?: string;
    step3reason?: string;
    step4reason?: string;
    step5reason?: string;
    step6reason?: string;
    step7reason?: string;
    step8reason?: string;
    step9reason?: string;
  };
  step1Chaneges?: object;
  step2Changes?: object;
  step3Changes?: object;
  step4Changes?: object;
  step5Changes?: object;
  step6Changes?: object;
  step7Changes?: object;
  step8Changes?: object;
  step9Changes?: object;
  isDeleted?: boolean;
}
export interface Contact {
  userId: ObjectId;
  type: "kin" | "spouse";
  firstName: string;
  lastName: string;
  relationId?: ObjectId;
  homePhone: string;
  mobilePhone: string;
  address: Address;
}

export interface EmploymentHistory {
  _id: ObjectId;
  applicationId: ObjectId;
  companyName: string;
  position: string;
  jobDescription: string;
  startDate: Date;
  endDate: Date;
  reasonForLeaving: string;
  salary: number;
  referenceName?: string;
  referenceContact?: string;
  referenceDesignation?: string;
}
export interface Document {
  _id: ObjectId;
  userId?: ObjectId;
  customerId?: ObjectId;
  recruitmentId?: ObjectId;
  applicationId?: ObjectId;
  disciplinaryId?: ObjectId;
  incidentId?: ObjectId;
  name: string;
  type: string;
  url: string;
  original_url?: string;
  status: "active" | "expired" | "revoked" | "uploaded";
}
export interface Asset {
  _id: ObjectId;
  userId: ObjectId;
  applicationId?: ObjectId;
  registrationNumber: string;
  registrationDate: Date;
  make: string;
  model: string;
  engineNumber: string;
  chassisNumber: string;
  vehicleTypeId: ObjectId;
  subDeviceIds?: ObjectId[];
  accessoryIds?: ObjectId[];
  tracking: boolean;
  trackingSupplier: string;
  licenseExpiryDate: Date;
  currentMileage: number;
  documentIds?: ObjectId[];
  document?: Document;
  color: string;
  status?: "approved" | "awaiting inspection" | "rejected" | "inactive";
  isDeleted?: boolean;
}

export interface TemplateType {
  _id: ObjectId;
  title: string;
  used_for: string;
  fields: { for: string, variableFor: string }[]
}

export interface CMCTemplate {
  _id: ObjectId;
  templateTypeId: ObjectId;
  name: string;
  description?: string;
  customerId?: ObjectId;
  documentTypeId?: ObjectId;
  documentName?: string;
  isActive: boolean;
  content: string;
  used_for: string;
  fields?: { name: string; type: string }[];
  isDeleted?: boolean;
  signPlatform?: string;
}

export interface EmailType {
  _id: ObjectId;
  title: string;
  used_for: string;
  fields: { message: string; code: string }[];
}

export interface EmailTemplate {
  _id: ObjectId;
  emailTypeId: ObjectId;
  name: string;
  subject: string;
  description?: string;
  content: string;
  isActive: boolean;
  sendTo?: string[];
  isDeleted?: boolean;
}

export interface Calendar {
  _id?: ObjectId;
  name: string;
  calendlyAddress: string;
  isActive: boolean;
  isDeleted?: boolean;
}

export interface Customer {
  _id?: ObjectId;
  code: number;
  name: string;
  email: string;
  telNumber: string;
  phoneNumber: string;
  faxNumber: string;
  tradingAs: string;
  companyRegNumber: string;
  regionId: ObjectId;
  vatNumber: number;
  vatPercentage: number;
  //statusCode: string;
  costCenterIds: ObjectId[];
  physicalAddress?: Address;
  postalAddress?: Address;
  configuration?: {
    checkListType?: string;
    checkListIds?: ObjectId[];
    supportingDocs?: ObjectId[];
  }[];
  isDeleted?: boolean;
  isActive: boolean;
}

export interface CustomerContact {
  _id: ObjectId;
  customerId: ObjectId | undefined;
  name: string;
  email: string;
  phoneNumber: string;
  isActive: boolean;
  isDeleted?: boolean;
  isDefault: boolean;
}

export interface Checklist {
  _id: ObjectId;
  checklistTypeId: ObjectId;
  name: string;
  groups: {
    name: string;
    options: { name: string }[];
  }[];
  isActive: boolean;
}

export interface AOD {
  _id?: ObjectId;
  profileId: ObjectId;
  templateId: ObjectId;
  paymentTermId: ObjectId;
  aodTypeId: ObjectId;
  aodReasonId: ObjectId;
  date: Date;
  paymentDuration: string;
  amount: string;
  weekOrMonth: string;
  isDeleted?: boolean;
  adminSign?: string;
  adminSignDate?: Date;
  userSign?: string;
  userSignDate?: Date;
}
export interface Recruitment {
  _id?: ObjectId;
  requestNumber?: string;
  customerId?: ObjectId;
  costCenterIds?: ObjectId[];
  regionId: ObjectId;
  areaIds: ObjectId[];
  site: string;
  recruitmentTypeId: ObjectId;
  recruitmentModelId: ObjectId;
  availablePositions: number;
  jobType: string;
  jobTitle: string;
  jobDescription: string;
  startDate: Date;
  isEndDate: boolean;
  endDate?: Date;
  skillIds: ObjectId[];
  status?: "induction" | "searching" | "shortlisted" | "finalised";
  isInductionRequired: boolean;
  documentIds: ObjectId[];
  shortListedIds?: ObjectId[];
  finalisedIds?: ObjectId[];
  isActive?: boolean;
  isDeleted?: boolean;
  requestDate: Date;
}
export interface Equipment {
  _id?: ObjectId;
  profileId: ObjectId;
  recruitmentId?: ObjectId;
  candidateName: string;
  contactNumber: string;
  status: "allocated" | "not allocated" | "returned" | "not returned";
  issueDate: Date;
  returnDate?: Date;
  equipmentIds: ObjectId[];
}



export interface Inspection {
  _id?: ObjectId;
  assetId: ObjectId;
  inspectorId: ObjectId;
  userId: ObjectId;
  date: Date;
  mileage: number;
  condition: string;
  notes?: string;
  documentIds: ObjectId[];
  documents: Document[];
  checklist: {
    title: string;
    items: { title: string; status: "good" | "fair" | "poor" }[];
  }[]; // need to ask
}

export interface Incident {
  _id?: ObjectId;
  userId: ObjectId;
  templateId: ObjectId;
  assetId: ObjectId;
  date: Date;
  payload: Record<string, any>;
  incidentUrl: string;
  status?: "recovered" | "repaired" | "write-off" | "in-review";
  notes?: string;
}

export interface Remittance {
  _id?: ObjectId;
  date: Date;
  userId: ObjectId;
}

export interface PaySlip {
  _id?: ObjectId;
  date: Date;
  userId: ObjectId;
}
export interface IRP5 {
  _id?: ObjectId;
  date: Date;
  userId: ObjectId;
}

export interface Reminder {
  _id?: ObjectId;
  name: string;
  description?: string;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  dayOfWeek?: number;
  dayOfMonth?: number;
  monthOfYear?: number;
  sendToCustomer: boolean;
  emailTemplateId: ObjectId;
  isActive: boolean;
}
export interface Induction {
  _id?: ObjectId;
  applicationId: ObjectId;
  recruitmentId: ObjectId;
  assetId: ObjectId | undefined;
  checklistIds: ObjectId[];
  driverTesting?: {
    isTestCompleted: boolean;
    testDate?: Date;
    testResult?: string;
    checklist: {
      checklistId: ObjectId;
      group: { name: string; status: "good" | "fair" | "poor" }[];
    }[];
  };
  vehicleTesting?: {
    isTestCompleted: boolean;
    testDate?: Date;
    testResult?: string;
    checklist: {
      checklistId: ObjectId;
      group: { name: string; status: "good" | "fair" | "poor" }[];
    }[];
  };
  status?: "in progress" | "completed" | "failed";
}
export interface Content {
  _id: ObjectId;
  title: string;
  code: string;
  heading?: string;
  description?: string;
  isActive: boolean;
}

export interface Disciplinary {
  _id?: ObjectId;
  profileId: ObjectId;
  warnings: {
    warningNumber: string;
    requestTypeId: ObjectId;
    customerId: ObjectId;
    date: Date;
    generatedTemplate?: string;
    adminSign?: string;
    adminSignDate?: Date;
    userSign?: string;
    userSignDate?: Date;
    status?: string;
    isRead: boolean;
  }[];
  warningReasonId: ObjectId;
  isFinalWarning?: boolean;
  isAuthorized?: boolean;
  authorizedBy?: ObjectId;
  authorizedDate?: Date;
  hearing?: {
    scheduledDate?: Date;
    location?: string;
    noticeDate?: Date;
    isEmployeeAttended?: boolean;
    attendedDate?: Date;
    hearingOutcome?: string;
    dismissalDate?: Date;
    isAodRequired?: boolean;
    status?: "pending" | "completed";
  };
  dispute?: {
    scheduledDate: Date;
    disputeTypeId: string;
    disputeOutcome: string;
    notes: string;
  };
  aodId?: ObjectId;
}

export interface OffBoarding {
  _id?: ObjectId;
  profileId: ObjectId;
  customerId: ObjectId;
  offboardingReason: string;
  payrollReason: string;
  reason: string;
  offboardingDate: Date;
  requirements: ObjectId[];
  endDate: Date;
  approved?: boolean;
  status: "in progress" | "completed";
}

export interface Query {
  _id?: ObjectId;
  profileId: ObjectId;
  assignedTo?: ObjectId;
  queryDate: Date;
  type: {
    _id: ObjectId;
    status: string;
  }[];
  approved?: boolean;
  isAnonymous?: boolean;
  notes?: string;
  status: "in progress" | "completed";
}

export interface Contract {
  _id?: ObjectId;
  userId: ObjectId;
  applicationId: ObjectId;
  templateId: ObjectId | undefined;
  recruitmentId?: ObjectId;
  customerId?: ObjectId;
  startDate: Date | null;
  endDate: Date | null;
  status?: string;
  adminSigned?: boolean;
  adminEmail?: string;
  adminSign?: string;
  adminSignDate?: Date;
  userSigned?: boolean;
  userEmail?: string;
  userSign?: string;
  userSignDate?: Date;
  templateContent: string;
  signNowDocumentId?: string;
  adminInviteId?: string;
  userInviteId?: string;
  adminInviteLink?: string;
  UserInviteLink?: string;
}

export interface TimeSlot {
  _id: ObjectId,
  date: Date,
  startTime: Date,
  testTypeId: ObjectId,
  isBooked: boolean
}
export interface Test {
  _id?: ObjectId;
  userId: ObjectId,
  testTypeId: ObjectId,
  date: Date;
  time: Date,
  status: string,
  createdAt: Date
}

// Setting Master Data Models

export interface Region {
  _id: ObjectId;
  name: string;
}
export interface Area {
  _id: ObjectId;
  name: string;
  regionId: ObjectId;
}
export interface Skill {
  _id: ObjectId;
  name: string;
}
export interface Benefit {
  _id: ObjectId;
  name: string;
}
export interface VehicleType {
  _id: ObjectId;
  name: string;
}

export interface TestType {
  _id: ObjectId;
  name: string;
}
export interface DocumentType {
  _id: ObjectId;
  name: string;
  type: string;
}

export interface Nationality {
  _id: ObjectId;
  name: string;
}
export interface LicenseCode {
  _id: ObjectId;
  name: string;
}
export interface Language {
  _id: ObjectId;
  name: string;
}

export interface AccountType {
  _id: ObjectId;
  name: string;
}

export interface PaymentTerm {
  _id: ObjectId;
  name: string;
}

export interface AODType {
  _id: ObjectId;
  name: string;
}
export interface AODReason {
  _id: ObjectId;
  name: string;
}

export interface RelationType {
  _id: ObjectId;
  name: string;
  category: string;
}
export interface ChecklistType {
  _id: ObjectId;
  name: string;
}

export interface CostCenter {
  _id: ObjectId;
  name: string;
}

export interface RecruitmentType {
  _id: ObjectId;
  name: string;
}
export interface RecruitmentStatus {
  _id: ObjectId;
  name: string;
}
export interface RecruitmentModel {
  _id: ObjectId;
  name: string;
}
export interface AllowEquipment {
  _id: ObjectId;
  name: string;
}
export interface SubDevice {
  _id: ObjectId;
  name: string;
  vehicleTypeId: ObjectId;
}

export interface Accessory {
  _id: ObjectId;
  name: string;
  vehicleTypeId: ObjectId;
}

export interface DisciplinaryType {
  _id: ObjectId;
  name: string;
  type: string;
  customerId?: ObjectId;
}

export interface DisputeType {
  _id: ObjectId;
  name: string;
}

export interface ClearanceType {
  _id: ObjectId;
  name: string;
}

export interface WarningReason {
  _id: ObjectId;
  name: string;
}

export interface Bank {
  _id: ObjectId;
  name: string;
  code: string;
}

//No collections below these only Interfaces

export interface Contact {
  userId: ObjectId;
  type: "kin" | "spouse";
  firstName: string;
  lastName: string;
  relationId?: ObjectId;
  homePhone: string;
  mobilePhone: string;
  address: Address;
}
export interface Address {
  line1: string;
  line2?: string;
  regionId: ObjectId;
  suburb: string;
  zipCode: number;
}

export interface Education {
  educationDetails: {
    lastSchool: string;
    highestGrade: string;
    yearCompleted: number;
  };
  tertiaryQualification: boolean;
  tertiaryEducation?: {
    institutionName: string;
    qualification: string;
    yearCompleted: number;
  };
  futureEducationPlans: boolean;
  studyPlanDetail?: string;
}

export interface CurrentEmployment {
  jobDescription: string;
  benefitIds?: ObjectId[];
  otherBenefit?: string;
  dismissedFromJob: boolean;
  employersDismissalEndorsement?: number;
  reasonForDismissal?: string;
}



