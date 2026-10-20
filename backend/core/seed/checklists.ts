import { ObjectId } from "mongodb";
import { Checklist } from "../../models";
import { checklistTypes } from "./checklistTypes";

export const checklists: Checklist[] = [
  {
    _id: new ObjectId("691f5721123d03c8fc06946b"),
    checklistTypeId: checklistTypes[1]._id,
    name: "Appearance",

    groups: [
      {
        name: "Hair",
        options: [
          { name: "Good" },
          { name: "Fair" },
          { name: "Poor" }
        ]
      },
      {
        name: "Uniform",
        options: [
          { name: "Good" },
          { name: "Fair" },
          { name: "Poor" }
        ]
      },
      {
        name: "Helmet",
        options: [
          { name: "Good" },
          { name: "Fair" },
          { name: "Poor" }
        ]
      },
    ],
    isActive: true,
  },
  {
    _id: new ObjectId("691f5721123d03c8fc06946c"),
    checklistTypeId: checklistTypes[0]._id,
    name: "Training Program",

    groups: [

    ],
    isActive: true,
  },
  {
    _id: new ObjectId("691f5721123d03c8fc06946d"),
    checklistTypeId: checklistTypes[0]._id,
    name: "	Training Completed",

    groups: [

    ],
    isActive: true,
  },
  {
    _id: new ObjectId("691f5721123d03c8fc06946e"),
    checklistTypeId: checklistTypes[0]._id,
    name: "Training Passed",

    groups: [

    ],
    isActive: true,
  },
  {
    _id: new ObjectId("691f5721123d03c8fc06946f"),
    checklistTypeId: checklistTypes[0]._id,
    name: "Interview Conducted",

    groups: [

    ],
    isActive: true,
  },
  {
    _id: new ObjectId("691f5721123d03c8fc069401"),
    checklistTypeId: checklistTypes[1]._id,
    name: "Safety",

    groups: [
      {
        name: "Option A",
        options: [
          { name: "Good" },
          { name: "Fair" },
          { name: "Poor" }
        ]
      },
      {
        name: "Option B",
        options: [
          { name: "Good" },
          { name: "Fair" },
          { name: "Poor" }
        ]
      },
      {
        name: "Option C",
        options: [
          { name: "Good" },
          { name: "Fair" },
          { name: "Poor" }
        ]
      },
    ],
    isActive: true,
  },
  {
    _id: new ObjectId("691f5721123d03c8fc069402"),
    checklistTypeId: checklistTypes[1]._id,
    name: "Driving Ability",

    groups: [
      {
        name: "Option A",
        options: [
          { name: "Good" },
          { name: "Fair" },
          { name: "Poor" }
        ]
      },
      {
        name: "Option B",
        options: [
          { name: "Good" },
          { name: "Fair" },
          { name: "Poor" }
        ]
      },
      {
        name: "Option C",
        options: [
          { name: "Good" },
          { name: "Fair" },
          { name: "Poor" }
        ]
      },
    ],
    isActive: true,
  },
  {
    _id: new ObjectId("691f5721123d03c8fc069403"),
    checklistTypeId: checklistTypes[2]._id,
    name: "Body Work",

    groups: [
      {
        name: "Option A",
        options: [
          { name: "Good" },
          { name: "Fair" },
          { name: "Poor" }
        ]
      },
      {
        name: "Option B",
        options: [
          { name: "Good" },
          { name: "Fair" },
          { name: "Poor" }
        ]
      },
      {
        name: "Option C",
        options: [
          { name: "Good" },
          { name: "Fair" },
          { name: "Poor" }
        ]
      },
    ],
    isActive: true,
  },
  {
    _id: new ObjectId("691f5721123d03c8fc069404"),
    checklistTypeId: checklistTypes[2]._id,
    name: "Mechanical",

    groups: [
      {
        name: "Option A",
        options: [
          { name: "Good" },
          { name: "Fair" },
          { name: "Poor" }
        ]
      },
      {
        name: "Option B",
        options: [
          { name: "Good" },
          { name: "Fair" },
          { name: "Poor" }
        ]
      },
      {
        name: "Option C",
        options: [
          { name: "Good" },
          { name: "Fair" },
          { name: "Poor" }
        ]
      },
    ],
    isActive: true,
  },
  {
    _id: new ObjectId("691f5721123d03c8fc069405"),
    checklistTypeId: checklistTypes[2]._id,
    name: "Electrical",

    groups: [
      {
        name: "Option A",
        options: [
          { name: "Good" },
          { name: "Fair" },
          { name: "Poor" }
        ]
      },
      {
        name: "Option B",
        options: [
          { name: "Good" },
          { name: "Fair" },
          { name: "Poor" }
        ]
      },
      {
        name: "Option C",
        options: [
          { name: "Good" },
          { name: "Fair" },
          { name: "Poor" }
        ]
      },
    ],
    isActive: true,
  },
  {
    _id: new ObjectId("691f5721123d03c8fc069406"),
    checklistTypeId: checklistTypes[2]._id,
    name: "Tyres",

    groups: [
      {
        name: "Option A",
        options: [
          { name: "Good" },
          { name: "Fair" },
          { name: "Poor" }
        ]
      },
      {
        name: "Option B",
        options: [
          { name: "Good" },
          { name: "Fair" },
          { name: "Poor" }
        ]
      },
      {
        name: "Option C",
        options: [
          { name: "Good" },
          { name: "Fair" },
          { name: "Poor" }
        ]
      },
    ],
    isActive: true,
  },
]