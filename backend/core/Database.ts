import { Collection, Db, MatchKeysAndValues } from "mongodb";
import {
  Role,
  User,
  Log,
  AppSetting,
  Profile,
  Content,
  Document,
  Asset,
  Application,
  EmploymentHistory,
  EmailType,
  EmailTemplate,
  TemplateType,
  CMCTemplate,
  Region,
  Area,
  Skill,
  Benefit,
  VehicleType,
  SubDevice,
  Accessory,
  Nationality,
  Language,
  DocumentType,
  LicenseCode,
  AccountType,
  Calendar,
  RelationType,
  ChecklistType,
  Customer,
  CustomerContact,
  Checklist,
  AOD,
  AODReason,
  AODType,
  PaymentTerm,
  CostCenter,
  RecruitmentType,
  RecruitmentModel,
  RecruitmentStatus,
  AllowEquipment,
  Recruitment,
  Equipment,
  Induction,
  Disciplinary,
  OffBoarding,
  DisciplinaryType,
  DisputeType,
  ClearanceType,
  WarningReason,
  Query,
  Incident,
  Bank,
  Contract,
  TestType,
  Test
} from "../models";
import Utility from "../helpers/utility";
import { roles } from "./seed/roles";
import { appsettings } from "./seed/appsettings";
import { Database } from "../database/db";
import { contents } from "./seed/content";
import { users } from "./seed/users";
import { userProfiles } from "./seed/userProfiles";
import { employmentHistory } from "./seed/employments";
import { assets } from "./seed/assets";
import { documents } from "./seed/documents";
import { applications } from "./seed/applications";
import { updateApplication } from "./seed/updateApplication";
import { emailTypes } from "./seed/emailTypes";
import { emailTemplates } from "./seed/emailTemplates";
import { templateTypes } from "./seed/templateTypes";
import { cmcTemplates } from "./seed/cmcTemplates";
import { regions } from "./seed/regions";
import { areas } from "./seed/areas";
import { skills } from "./seed/skills";
import { benefits } from "./seed/benefits";
import { subDevices } from "./seed/subDevices";
import { accessories } from "./seed/accessories";
import { vehicleTypes } from "./seed/vehicleTypes";
import { nationalities } from "./seed/nationalities";
import { languages } from "./seed/languages";
import { documentTypes } from "./seed/documentTypes";
import { licenseCodes } from "./seed/licenseCodes";
import { accountTypes } from "./seed/accountTypes";
import { calendars } from "./seed/calendar";
import { relationTypes } from "./seed/relationTypes";
import { checklistTypes } from "./seed/checklistTypes";
import { customers } from "./seed/customers";
import { customerContacts } from "./seed/customerContacts";
import { checklists } from "./seed/checklists";
import { aodReasons } from "./seed/aodReasons";
import { aodTypes } from "./seed/aodTypes";
import { paymentTerms } from "./seed/paymentTerms";
import { costCenters } from "./seed/costCenters";
import { recruitmentTypes } from "./seed/recruitmentTypes";
import { recruitmentModels } from "./seed/recruitmentModels";
import { recruitmentStatuses } from "./seed/recruitmentStatuses";
import { allowEquipments } from "./seed/allowEquipments";
import { equipments } from "./seed/equipments";
import { disciplinaryTypes } from "./seed/disciplinaryTypes";
import { disputeTypes } from "./seed/disputeTypes";
import { clearanceTypes } from "./seed/clearanceTypes";
import { warningReasons } from "./seed/warningReasons";
import { banks } from "./seed/banks";
import { testTypes } from "./seed/testTypes";

const tables = [
  "users",
  "roles",
  "logs",
  "appSettings",
  "userProfiles",
  "contentPages",
  "documents",
  "assets",
  "applications",
  "employmentHistories",
  "emailTypes",
  "emailTemplates",
  "templateTypes",
  "cmcTemplates",
  "regions",
  "areas",
  "skills",
  "benefits",
  "vehicleTypes",
  "subDevices",
  "accessories",
  "nationalities",
  "languages",
  "licenseCodes",
  "documentTypes",
  "accountTypes",
  "calendars",
  "relationTypes",
  "checklistTypes",
  "customers",
  "customerContacts",
  "checklists",
  "aods",
  "aodReasons",
  "aodTypes",
  "paymentTerms",
  "costCenters",
  "recruitmentTypes",
  "recruitmentModels",
  "recruitmentStatuses",
  "allowEquipments",
  "recruitments",
  "equipments",
  "inductions",
  "disciplinaries",
  "offBoardings",
  "disciplinaryTypes",
  "disputeTypes",
  "clearanceTypes",
  "warningReasons",
  "queries",
  "incidents",
  "banks",
  "contracts",
  "testTypes",
  "tests"
];
export default class DataBase extends Utility {
  private readonly db: Db;
  protected collections: {
    users: Collection<User>;
    roles: Collection<Role>;
    logs: Collection<Log>;
    appSettings: Collection<AppSetting>;
    userProfiles: Collection<Profile>;
    contentPages: Collection<Content>;
    documents: Collection<Document>;
    assets: Collection<Asset>;
    employmentHistories: Collection<EmploymentHistory>;
    applications: Collection<Application>;
    emailTypes: Collection<EmailType>;
    emailTemplates: Collection<EmailTemplate>;
    templateTypes: Collection<TemplateType>;
    cmcTemplates: Collection<CMCTemplate>;
    regions: Collection<Region>;
    areas: Collection<Area>;
    skills: Collection<Skill>;
    benefits: Collection<Benefit>;
    vehicleTypes: Collection<VehicleType>;
    subDevices: Collection<SubDevice>;
    accessories: Collection<Accessory>;
    nationalities: Collection<Nationality>;
    languages: Collection<Language>;
    licenseCodes: Collection<LicenseCode>;
    documentTypes: Collection<DocumentType>;
    accountTypes: Collection<AccountType>;
    calendars: Collection<Calendar>;
    relationTypes: Collection<RelationType>;
    checklistTypes: Collection<ChecklistType>;
    customers: Collection<Customer>;
    customerContacts: Collection<CustomerContact>;
    checklists: Collection<Checklist>;
    aods: Collection<AOD>;
    aodReasons: Collection<AODReason>;
    aodTypes: Collection<AODType>;
    paymentTerms: Collection<PaymentTerm>;
    costCenters: Collection<CostCenter>;
    recruitments: Collection<Recruitment>;
    recruitmentTypes: Collection<RecruitmentType>;
    recruitmentModels: Collection<RecruitmentModel>;
    recruitmentStatuses: Collection<RecruitmentStatus>;
    equipments: Collection<Equipment>;
    allowEquipments: Collection<AllowEquipment>;
    inductions: Collection<Induction>;
    disciplinaries: Collection<Disciplinary>;
    offBoardings: Collection<OffBoarding>;
    disciplinaryTypes: Collection<DisciplinaryType>;
    disputeTypes: Collection<DisputeType>;
    clearanceTypes: Collection<ClearanceType>;
    warningReasons: Collection<WarningReason>;
    queries: Collection<Query>;
    incidents: Collection<Incident>;
    banks: Collection<Bank>;
    contracts: Collection<Contract>;
    testTypes: Collection<TestType>;
    tests: Collection<Test>;
  };
  constructor() {
    super();
    if (Database.db && !this.db) {
      this.db = Database.db;
      const c: any = {};
      tables.forEach((collection) => {
        c[collection] = this.db.collection(collection);
      });
      this.collections = c;
      this.syncDB();
    }
  }
  private readonly syncDB = async () => {
    if (global["config"]["syncDb"] && global["syncDb"] == true) {
      global["syncDb"] = false;
      this.db.dropDatabase();

      await this.collections.roles.insertMany(roles);
      await this.collections.contentPages.insertMany(contents);
      await this.collections.appSettings.insertMany(appsettings);
      await this.collections.regions.insertMany(regions);
      await this.collections.areas.insertMany(areas);
      await this.collections.skills.insertMany(skills);
      await this.collections.benefits.insertMany(benefits);
      await this.collections.vehicleTypes.insertMany(vehicleTypes);
      await this.collections.subDevices.insertMany(subDevices);
      await this.collections.accessories.insertMany(accessories);
      await this.collections.nationalities.insertMany(nationalities);
      await this.collections.languages.insertMany(languages);
      await this.collections.documentTypes.insertMany(documentTypes);
      await this.collections.licenseCodes.insertMany(licenseCodes);
      await this.collections.accountTypes.insertMany(accountTypes);
      await this.collections.relationTypes.insertMany(relationTypes);
      await this.collections.checklistTypes.insertMany(checklistTypes);
      await this.collections.aodReasons.insertMany(aodReasons);
      await this.collections.aodTypes.insertMany(aodTypes);
      await this.collections.paymentTerms.insertMany(paymentTerms);
      await this.collections.costCenters.insertMany(costCenters);
      await this.collections.recruitmentTypes.insertMany(recruitmentTypes);
      await this.collections.recruitmentModels.insertMany(recruitmentModels);
      await this.collections.recruitmentStatuses.insertMany(recruitmentStatuses);
      await this.collections.allowEquipments.insertMany(allowEquipments);
      await this.collections.disciplinaryTypes.insertMany(disciplinaryTypes);
      await this.collections.disputeTypes.insertMany(disputeTypes);
      await this.collections.clearanceTypes.insertMany(clearanceTypes);
      await this.collections.warningReasons.insertMany(warningReasons);
      await this.collections.testTypes.insertMany(testTypes);
      await this.collections.banks.insertMany(banks);
      
      await this.collections.equipments.insertMany(equipments);
      await this.collections.users.insertMany(users);
      await this.collections.userProfiles.insertMany(userProfiles);
      await this.collections.emailTypes.insertMany(emailTypes);
      await this.collections.emailTemplates.insertMany(emailTemplates);
      await this.collections.templateTypes.insertMany(templateTypes);
      await this.collections.calendars.insertMany(calendars);
      
      await this.collections.customers.insertMany(customers);
      await this.collections.cmcTemplates.insertMany(cmcTemplates);

      //await this.collections.contacts.insertMany(emergencyContacts);
      await this.collections.documents.insertMany(documents);
      const app = await this.collections.applications.insertMany(applications);

      await this.collections.assets.insertMany(assets);
      await this.collections.employmentHistories.insertMany(employmentHistory);
      await this.collections.applications.updateMany(
        { _id: { $in: Object.values(app.insertedIds) } }, {
          $set: { ...updateApplication }
        } as unknown as MatchKeysAndValues<Application>);

      await this.collections.customerContacts.insertMany(customerContacts);
      await this.collections.checklists.insertMany(checklists);
      // await this.collections.offBoarding.insertMany(offBoarding);

      console.log("Data is seeded");
    }
  };
}
