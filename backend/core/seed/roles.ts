import { ObjectId } from "mongodb";
import { Role } from "../../models";

export const roles: Role[] = [
  {
    _id: new ObjectId("691f5bf0123d03c8fc069608"),
    name: "Developer",
    permissions: {
      lookup: {
        view: true,
      },
      role: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      appsetting: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      dashboard: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      applications: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      recruitment: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      induction: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      disciplinary: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      offBoarding: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      queries: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      calendars: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      reminders: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      emailtypes: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      emailtemplates: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      checklists: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      templatetypes: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      cmctemplates: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      customers: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
       incidents: {
        view: true,
        add: false,
        update: true,
        delete: true,
      },
      users: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      permissions: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      content: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      settings: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      documents: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      profile: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      contacts: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      aod: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
    },
  },
  {
    _id: new ObjectId("691f5bf0123d03c8fc069609"),
    name: "Admin",
    permissions: {
      lookup: {
        view: true,
      },
      role: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      dashboard: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      applications: {
        view: true,
        add: true,
        update: true,
        delete: true,
        confirmer:true,
        approver:true
      },
      recruitment: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      induction: {
        view: true,
        add: true,
        update: true,
        delete: true,
        "driver Testing":true,
        "vehicle Testing":true,
      },
      disciplinary: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      offBoarding: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
       tests: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      queries: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      calendars: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      emailtemplates: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      checklists: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      cmctemplates: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      customers: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      incidents: {
        view: true,
        add: false,
        update: true,
        delete: true,
      },
      users: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      content: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      permissions: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      settings: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      workExperience: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      documents: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      profile: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      contacts: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      aod: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      equipments: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
    },
  },
  {
    _id: new ObjectId("691f5bf0123d03c8fc06960a"),
    name: "Driver",
    permissions: {
      home: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      job: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      applications: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      notices: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      queries: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      incidents: {
        view: true,
        add: true,
        update: false,
        delete: true,
      },
      aod: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      documents: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      contracts: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      irp5s: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      tests: {
        view: true,
        add: true,
        update: false,
        delete: false,
      },
      inspection: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      assets: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      equipment: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      paySlips: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      remittance: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      deductions: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      bankingDetails: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      profile: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
      settings: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
    },
  },
  {
    _id: new ObjectId("691f5bf0123d03c8fc069617"),
    name: "Applicant",
    permissions: {
      home: {
        view: true,
      },
      applications: {
        view: true,
        add: true,
        update: true,
        delete:true
      },
      profile: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
       contracts: {
        view: true,
        add: true,
        update: true,
        delete:true
      },
      tests: {
        view: true,
        add: true,
        update: false,
        delete: false,
      },
    },
  },
  {
    _id: new ObjectId("691f5bf0123d03c8fc06960b"),
    name: "Other",
    permissions: {
      dashboard: {
        view: true,
      },
    },
  },
  {
    _id: new ObjectId("691f5bf0123d03c8fc06960c"),
    name: "Application Confirmer",
    permissions: {
      dashboard: {
        view: true,
      },
    },
  },
  {
    _id: new ObjectId("691f5bf0123d03c8fc06960d"),
    name: "Application Approver",
    permissions: {
      dashboard: {
        view: true,
      },
    },
  },
  {
    _id: new ObjectId("691f5bf0123d03c8fc06960e"),
    name: "Recruitment",
    permissions: {
      dashboard: {
        view: true,
      },
    },
  },
  {
    _id: new ObjectId("691f5bf0123d03c8fc06960f"),
    name: "Induction",
    permissions: {
      dashboard: {
        view: true,
      },
    },
  },
  {
    _id: new ObjectId("691f5bf0123d03c8fc069610"),
    name: "AOD",
    permissions: {
      dashboard: {
        view: true,
      },
    },
  },
  {
    _id: new ObjectId("691f5bf0123d03c8fc069611"),
    name: "Disciplinary",
    permissions: {
      dashboard: {
        view: true,
      },
    },
  },
  {
    _id: new ObjectId("691f5bf0123d03c8fc069612"),
    name: "Offboarding",
    permissions: {
      dashboard: {
        view: true,
      },
    },
  },
  {
    _id: new ObjectId("691f5bf0123d03c8fc069613"),
    name: "Clearance",
    permissions: {
      dashboard: {
        view: true,
      },
    },
  },
  {
    _id: new ObjectId("691f5bf0123d03c8fc069614"),
    name: "Contact Reference",
    permissions: {
      dashboard: {
        view: true,
      },
    },
  },
  {
    _id: new ObjectId("691f5bf0123d03c8fc069615"),
    name: "Query Approval/Rejection",
    permissions: {
      dashboard: {
        view: true,
      },
    },
  },
  {
    _id: new ObjectId("691f5bf0123d03c8fc069616"),
    name: "Query Assigned",
    permissions: {
      dashboard: {
        view: true,
      },
    },
  },
];
