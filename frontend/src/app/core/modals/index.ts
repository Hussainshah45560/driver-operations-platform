export interface Page {
  title: string;
  heading: string;
  description: string;
}

export interface Navigation {
  _id: string;
  code: string;
  title: string;
  type: string;
  icon: string;
  url: string;
  order: number;
  target: boolean;
  children?: Navigation[];
}
[];

export interface Application {
  firstName: string;
  lastName: string;
  status: string;
}
[];

export interface AdminSetting {
  _id?: string;
  title: string;
  value: any;
}

export interface CmcTemplate {
  _id?: string;
  templateTypeId: string;
  name: string;
  isActive: boolean;
  documentName: string;
  documentTypeId: string;
  content?: string;
  description?: string;
  customerId?: string;
  signPlatform?: string;
  fields?: any[];
}
export interface EmailTemplate {
  _id?: string;
  name: string;
  sendTo: string;
  subject: string;
  description: string;
  content: string;
  isActive: boolean;
  emailTypeId?: string;
}

export interface Recruitment {
  _id?: string;
  requestNumber: string;
  customerName: string;
  customerId: string;
  regionId: string;
  region: string;
  areaIds: string[];
  site: string;
  recruitmentTypeId: string;
  recruitmentModelId: string;
  availablePositions: number;
  jobType: string;
  jobTitle: string;
  jobDescription: string;
  startDate: string;
  isEndDate: boolean;
  status: string;
  shortListedIds: string[];
  finalisationIds: string[];
  endDate?: string;
  isActive: boolean;
  skillIds: string[];
  documentIds: string[];
  defaultContact: string;
  isInductionRequired: boolean;
  costCenterIds: string[];
}

export interface Induction {
  _id?: string;
  applicationNumber: number;
  status: string;
  customer: string;
  userName: string;
  firstName: string;
  lastName: string;
  nationality: string;
  documentNumber: number;
  email: string;
  phoneNumber: string;
  scheduledDate: string;
  checklistIds?: string[];
  driverTesting?: {
    isTestCompleted: boolean;
    testDate: string;
    testResult: string;
    checklist: {
      checklistId: string;
      group: {
        name: string;
        status: string;
      }[];
    }[];
  };
  vehicleTesting?: {
    isTestCompleted: boolean;
    testDate: string;
    testResult: string;
    checklist: {
      checklistId: string;
      group: {
        name: string;
        status: string;
      }[];
    }[];
  };
}

export interface Candidates {
  _id?: string;
  applicationNumber: string;
  name: string;
  customerName: string;
  customerId: string;
  regionId: string;
  region: string;
  areaIds: string[];
  site: string;
  recruitmentTypeId: string;
  recruitmentModelId: string;
  availablePositions: number;
  jobType: string;
  jobTitle: string;
  jobDescription: string;
  startDate: string;
  isEndDate: boolean;
  status: string;
  shortListedIds: string[];
  finalisationIds: string[];
  endDate?: string;
  isActive: boolean;
  skillIds: string[];
  documentIds: string[];
  defaultContact: string;
}

export interface CandidateDetails {
  contactedDate: string;
  documentType: string;
  firstName: string;
  idNumber: number;
  nickName: string;
  lastName: string;
  phoneNumber: string;
  region: string;
  trainingCompletionDate: string;
  trainingDate: string;
  _id: string;
  applicationCategory: string;
}

export interface CandidateInfo {
  applicationNumber: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  region: string;
  _id: string;
  customerName: string;
  jobTitle: string;
  jobType: string;
  applicationStatus: string;
  customerId?: string;
  userId?: string;
  selfie: string;
  site: string;
  startDate: string;
  applicationCategory: string;
  endDate: string;
  hasDisciplinaryEnquiry: boolean;
}

export interface Hearing {
  scheduledDate: string;
  isEmployeeAttended: boolean;
  attendedDate: string;
  dismissalDate: string;
  location: string;
  hearingOutcome: string;
  status: string;
  type: string;
  noticeDate: string;
  isAodRequired: boolean;
}

export interface Dispute {
  scheduledDate: string;
  disputeTypeId: string;
  disputeOutcome: string;
  notes: string;
}

export interface DriverTesting {
  _id: string;
  testCompletion: boolean;
}
export interface VehicleTesting {
  _id: string;
  inspectionCompletion: boolean;
}

export interface Disciplinary {
  _id?: string;
  applicationNumber: number;
  status: string;
  customer: string;
  nickName: string;
  firstName: string;
  lastName: string;
  nationality: string;
  documentNumber: number;
  email: string;
  telNumber: string;
}

export interface WarningList {
  customerName: string;
  requestType: string;
  date: string;
  warningNumber: string;
}

export interface Equipment {
  candidateName: string;
  contactNumber: string;
  status: string;
  issueDate: string;
  returnDate: string;
  equipmentIds: string[];
  profileId?: string;
}

export interface References {
  _id: string;
  referenceContact: string;
  referenceDesignation: string;
  referenceName: string;
}

export interface Calendar {
  _id?: string;
  name: string;
  calendlyAddress: string;
  isActive: boolean;
}

export interface Aod {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  applicationNumber: string;
  status: string;
  amount: string;
  aodReasonId: string;
  aodTypeId: string;
  date: string;
  paymentDuration: string;
  paymentTermId: string;
  profileId: string;
  templateId: string;
  weekOrMonth: string;
  aodSign: string;
  aodSignDate: string;
}
export interface Offboarding {
  _id: string;
  customer: string;
  nikeName: string;
  firstName: string;
  lastName: string;
  applicationNumber: string;
  applicationDate: string;
  offboardingReason: string;
  payrollReason: string;
  reason: string;
  status: string;
  endDate: string;
  requirements: string[];
  approved: boolean;
  offboardingDate: string;
}
export interface Queries {
  _id: string;
  customer: string;
  nikeName: string;
  firstName: string;
  lastName: string;
  applicationNumber: string;
  applicationDate: string;
  assignedTo: string;
  status: string;
  notes?: string;
  approved: boolean;
  type: {
    _id: string;
    name: string;
    status: string;
  }[];
}

export interface Profile {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  applicationNumber: string;
  nationality: string;
  status: string;
  documentType: string;
  idNumber: string;
  documentExpiryDate: string;
}

export interface Content {
  _id?: string;
  title: string;
  heading: string;
  description: string;
  isActive: boolean;
}
export interface Checklist {
  _id?: string;
  name: string;
  groupName: string[];
  type: string;
  isActive: boolean;
  checklistTypeId?: string;
  groups: {
    name: string;
    selectedValue: string;
    options: { name: string }[];
  }[];
}
export interface Address {
  line1: string;
  line2: string;
  regionId: string;
  suburb: string;
  zipCode: number;
  sameAsPhysicalAddress?: boolean;
}
export interface Customer {
  _id?: string;
  customerId: string;
  code: number;
  name: string;
  email: string;
  telNumber: string;
  phoneNumber: string;
  faxNumber: string;
  tradingAs: string;
  companyRegNumber: string;
  regionId: string;
  vatNumber: number;
  vatPercentage: number;
  statusCode: string;
  costCenterIds: string;
  isActive: boolean;
  physicalAddress?: Address;
  postalAddress?: Address;
  configuration?: {
    checkListIds: string;
    checkListType: string;
    supportingDocs: string[];
  }[];
}
export interface EmploymentHistory {
  _id?: string;
  applicationId?: string;
  companyName: string;
  position: string;
  jobDescription: string;
  startDate: string;
  endDate: string;
  reasonForLeaving: string;
  salary: string;
  type: string;
  referenceName?: string;
  referenceContact?: string;
  referenceDesignation?: string;
}
export interface Documents {
  _id: string;
  userId?: string;
  applicationId?: string;
  name: string;
  type: string;
  url: string;
  status: string;
  file: any[];
  customerId?: string;
  disciplinaryId?: string;
}
export interface AppSetting {
  _id?: string;
  title: string;
  code: string;
  value: any;
}

export interface Company {
  _id?: string;
  name: string;
  licence: string;
  address: string;
  logo?: string;
  email: string;
  phoneNo: string;
  status: string;
  website: string;
  subdomain: string;
  package: {
    type: string; // PerCampaign, Percentage, Capped
    value: number; // 0.05
    cappedAmount?: number; // 500
  };
}

export interface User {
  role?: Role;
  alternativeNumber: string;
  email: string;
  firstName: string;
  isActive: boolean;
  lastName: string;
  phoneNumber: string;
  physicalAddress: {
    suburb: string;
    line1: string;
    line2: string;
    zipCode: string;
    regionId: string;
  };
  postalAddress: {
    sameAsPhysicalAddress: boolean;
    suburb: string;
    line1: string;
    line2: string;
    zipCode: string;
    regionId: string;
  };
  profileId: string;
  region: string;
  roleId: string;
  roleName: string;
  userName: string;
  _id: string;
  branch: string;
}

export interface Role {
  _id: string;
  name: string;
  priority: number;
  permissions: { [key: string]: { [key: string]: boolean } };
}

export interface Log {
  _id?: string;
  component: string;
  action: string;
  userId: string | null;
  documentId?: string | null;
  ip: string;
  timestamp: Date;
  after?: Object;
}
export interface Area {
  _id?: string;
  name: string;
  regionId: string;
}
export interface SubDevice {
  _id?: string;
  name: string;
  vehicleTypeId: string;
}
export interface Accessory {
  _id?: string;
  name: string;
  vehicleTypeId: string;
}

export interface DocumentTypee {
  _id?: string;
  name: string;
  type: string;
}
export interface RelationType {
  _id?: string;
  name: string;
  category: string;
}
export interface ClearanceType {
  _id?: string;
  name: string;
}
export interface DisciplinaryType {
  _id?: string;
  name: string;
  type: string;
}
export interface DisputeType {
  _id?: string;
  name: string;
}
export interface TestType {
  _id?: string;
  name: string;
}
export interface WarningReason {
  _id?: string;
  name: string;
}
export interface Banks {
  _id?: string;
  name: string;
  code: string;
}
export interface SettingData {
  _id?: string;
  name: string;
}

export interface Contact {
  _id: string;
  customerId: string;
  name?: string;
  email?: string;
  position: string;
  phoneNumber: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface Timezone {
  _id?: string;
  zoneName: string;
  gmtOffset: number;
  gmtOffsetName: string;
  abbreviation: string;
  tzName: string;
}

export interface EmailType {
  _id: string;
  title: string;
  used_for: string;
  fields: { message: string; code: string }[];
}
export interface Fields {
  message: string;
  code: string;
}

export interface lookupData {
  name: string;
  value: string;
  code?: string;
  disabled?: boolean;
  label?: string;
}

export interface Asset {
  accessoryIds: string[];
  chassisNumber: string;
  color: string;
  currentMileage: number;
  documents: {
    _id: string;
    userId: string;
    type: string;
    url?: string;
    uploadedAt?: string;
  }[];
  engineNumber: string;
  licenseExpiryDate: string;
  make: string;
  model: string;
  registrationDate: string;
  registrationNumber: string;
  subDeviceIds: string[];
  tracking: boolean;
  trackingSupplier: string;
  vehicleTypeId: string;
  _id: string;
}

export interface Home {
  applicationNumber: string;
  applicationStatus: string;
  name: string;
  rejectedSteps: { step: string; status: string; reason: string }[];
  selfie: string;
  unreadWarnings: string;
  asset: string | null;
  recruitmentStatus: string;
  recruitmentId?: string;
  customerName: string;
  queryCount: string;
  testCount: string;
  paySlips: string;
  showLogoutNotice: boolean;
  showSignNotice: boolean;
  applicationCategory: string;
}

export interface BankingDetails {
  accountNumber: string;
  accountTypeId: string;
  bankNameId: string;
  branchCode: string;
  branchName: string;
  _id: string;
}
export interface VehicleInspection {
  testDate: string;
  testResult: string;
  registrationNumber?: string;
  make?: string;
  model?: string;
  registrationDate?: string;
  licenseExpiryDate?: string;
  currentMileage?: string;
  checklist: {
    checklistId: string;
    group: {
      name: string;
      status: string;
    }[];
  }[];
  _id: string;
}

export interface Incidents {
  date: string;
  templateId: string;
  assetId: string;
  status: string;
  asset: string;
  tempalte: string;
  userId?: string;
  notes: string;
  _id: string;
  payload: {};
}
export interface Notices {
  authorizedBy: string;
  authorizedDate: string;
  customerId: string;
  customerName: string;
  date: string;
  disciplinaryId: string;
  isAuthorized: string;
  isFinalWarning: string;
  isRead: string;
  requestTypeId: string;
  requestTypeName: string;
  warningNumber: string;
  warningReason: string;
  warningReasonId: string;
  _id: string;
}

export interface DriverEquipment {
  issueDate: string;
  profileId: string;
  returnDate: string;
  status: string;
  _id: string;
}

export interface Contract {
  employer: string;
  endDate: string;
  startDate: string;
  status: string;
  _id: string;
  tempalteId?: string;
}

export interface Tests {
  date: string;
  name: string;
  testTypeId: string;
  status: string;
  testType: string;
  time: string;
  _id: string;
}

export interface TemplateFields {
  _id: string;
  used_for: string;
  fields: {
    for: string, variableFor: string
  }[]
}

export interface EmailTemplateFields {
  _id: string;
  used_for: string;
  fields: {
    message: string, code: string
  }[]
}
