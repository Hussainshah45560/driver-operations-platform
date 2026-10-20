import { ObjectId } from "mongodb";
import { TemplateType } from "../../models";

export const templateTypes: TemplateType[] = [
  {
    _id: new ObjectId("691f5c51123d03c8fc069629"),
    title: "POPIA Template",
    used_for: "popi_template",
    fields:[]
  },
  {
    _id: new ObjectId("691f5c51123d03c8fc06962b"),
    title: "AOD Templates",
    used_for: "aod_template",
    fields:[{for:"Name", variableFor:"{{name}}"},{for:"Amount", variableFor:"{{amount}}"},{for:"Reason", variableFor:"{{reason}}"}]
  },
  {
    _id: new ObjectId("691f5c51123d03c8fc06962c"),
    title: "Contract",
    used_for: "contract_template",
    fields:[{for:"Contract Date", variableFor:"{{contractDate}}"},{for:"Company Name", variableFor:"{{companyName}}"},{for:"Company Address", variableFor:"{{companyAddress}}"},{for:"Employee Name", variableFor:"{{employeeName}}"},
      {for:"Employee Id", variableFor:"{{employeeId}}"}, {for:"Job Title", variableFor:"{{jobTitle}}"},{for:"Salary", variableFor:"{{salary}}"},
    {for:"Start Date", variableFor:"{{startDate}}"},{for:"End Date", variableFor:"{{endDate}}"},{for:"Notice Period", variableFor:"{{noticePeriod}}"}]
  },
  {
    _id: new ObjectId("691f5c51123d03c8fc06962d"),
    title: "Warning Templates",
    used_for: "warning_template",
    fields:[{for:"Employee Name", variableFor:"{{employeeName}}"},{for:"Warning Reason", variableFor:"{{warningReason}}"}]
  },
  {
    _id: new ObjectId("691f5c51123d03c8fc06962e"),
    title: "Incident Templates",
    used_for: "incident_template",
    fields:[{ for: "Location", variableFor: "{{location}}" },{ for: "Time", variableFor: "{{time}}" },
      { for: "Description", variableFor: "{{description}}" },{ for: "Condition", variableFor: "{{condition}}" },{ for: "Object", variableFor: "{{object}}" },
      { for: "Damage", variableFor: "{{damage}}" },{ for: "Vehicle", variableFor: "{{vehicle}}" },
      { for: "Fled", variableFor: "{{fled}}" },]
  }
];
