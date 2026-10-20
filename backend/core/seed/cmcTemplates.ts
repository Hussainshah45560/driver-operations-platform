import { ObjectId } from "mongodb";
import { CMCTemplate } from "../../models";
import { templateTypes } from "./templateTypes";
import { customers } from "./customers";

export const cmcTemplates: CMCTemplate[] = [
  {
    _id: new ObjectId("691f5741123d03c8fc06946e"),
    templateTypeId: templateTypes[0]._id,
    name: "POPIA Template",
    description: "Popi template for Application step 9.",
    isActive: true,
    content: `<h4 style="text-align:center">PROTECTION OF PERSONAL INFORMATION ACT</h4><ol><li><p><strong>CONSENT TO PROCESSING</strong></p><ol><li><p>I agree that personal information about me may be recorded, kept for as long as required by Fleet Flex Services (Pty) Ltd, and processed by Fleet Flex Services (Pty) Ltd for its legitimate interests, subject to the provisions of the Protection of Personal Information Act 4 of 2013.</p></li></ol></li><li><p><strong>CREDIT AND CRIMINAL RECORD</strong></p><ol><li><p>I, hereby consent and authorise Fleet Flex (Pty) Ltd or its duly authorized agent to make my name, surname, identity number and fingerprints available to the South African Police Service or any credit bureau and hereby authorise Fleet Flex Services (Pty) Ltd to conduct any credit references and/or to conduct criminal record enquiry as Fleet Flex Services (Pty) Ltd in its sole discretion deems necessary.</p></li><li><p>I, furthermore, authorise the South African Police Service to furnish personal information regarding my criminal background, criminal history, previous convictions and/or any other relevant information such as usually furnished by the Criminal Record Centre of the South African Police Service in this regard, to Fleet Flex Services (Pty) Ltd and/or Fleet Flex Services (Pty) Ltd duly authorised agent.</p></li><li><p>I, furthermore, unconditionally indemnify the South African Police Service and all its members, employees, as well as the Government of the Republic of South Africa, against any liability which results or may result from furnishing information in this regard.</p></li><li><p>I understand that it is a condition of the South African Police Service that-</p><ol><li><p>The information is furnished solely for my contract</p></li><li><p>Any information furnished to Fleet Flex Services (Pty) Ltd or its duly authorised agent will be disclosed to me for comments before a decision is made on my application; and</p></li><li><p>Fleet Flex Services (Pty) Ltd or its duly authorised agent is responsible for verifying the accuracy, in every respect, of the information furnished by the South African Police Service.</p></li></ol></li></ol></li><li><p><strong>REFERENCES</strong></p><ol><li><p>I hereby consent and authorise Fleet Flex Services (Pty) Ltd or its duly authorized agent to contact any of my references and to make enquiries in respect of my behaviour, work ethic, competence, expertise, work record, honesty, and any related matters as Fleet Flex Services (Pty) Ltd in its sole discretion deems necessary.</p></li></ol></li><li><p><strong>QUALIFICATION VERIFICATION</strong></p><ol><li><p>I hereby consent and authorise Fleet Flex Services (Pty) Ltd or its duly authorized agent to verify any of my qualifications against any source as Fleet Flex Services (Pty) Ltd in its sole discretion deems necessary.</p></li></ol></li><li><p><strong>PSYCHOMETRIC OR OTHER ASSESSMENT TESTING</strong></p><ol><li><p>I hereby consent and authorise Fleet Flex Services (Pty) Ltd or its duly authorized agent to conduct any screening tests on me, including but not limited to, psychometric and other assessment tests, as Fleet Flex Services (Pty) Ltd in its sole discretion deems necessary.</p></li></ol></li><li><p><strong>THIRD PARTY PROCESSING AND FURTHER PROCESSING</strong></p><ol><li><p>I, hereby consent and authorise Fleet Flex Services (Pty) Ltd or its duly authorized agent to share my personal information, with third parties, where it is in the legitimate interests of the Fleet Flex Services (Pty) Ltd to do so, including but not limited to, other companies within Fleet Flex Services (Pty) Ltd and I hereby consent and authorise such third parties to process my personal information for reasons that are related to the legitimate interests of Fleet Flex Services (Pty) Ltd or such third parties.</p></li></ol></li></ol>`,
    used_for: "popia_template",
  },
  {
    _id: new ObjectId("6575e5c5f1a4c8b2d9a1e3f4"),
    templateTypeId: templateTypes[1]._id,
    name: "Loan Authorization Declaration",
    description:
      "Standard loan authorization declaration for AOD applications. ",
    isActive: true,
    content: `<p>I {{name}}, the undersigned Debtor, hereby acknowledge that I am lawfully and truly indebted to the Creditor in the amount of: {{amount}}</p><p>This debt arises due to:{{reason}}</p><p>I fully acknowledge and accept the terms and conditions related to the loan processing and authorization.</p>`,
    used_for: "aod_template",
  },
  {
    _id: new ObjectId("6575e5c5f1a4c8b2d9a1e3f5"),
    templateTypeId: templateTypes[1]._id,
    name: "Medical Authorization Declaration",
    description:
      "Standard medical authorization declaration for AOD applications. ",
    isActive: true,
    content: `<p>I fully acknowledge and accept the terms and conditions related to the loan processing and authorization.</p>`,
    used_for: "aod_template",
  },
  {
    _id: new ObjectId("6575e5c5f1a4c8b2d9a1e3f6"),
    templateTypeId: templateTypes[2]._id,
    name: "Employment Contract",
    description:
      "Standard employment contract template for new hires.",
    isActive: true,
    content: `<p><b>EMPLOYMENT CONTRACT</b></p><p><b></b></p><p><font face="Arial">This Employment Contract is made on {{contractDate}} between:</font></p><div><p><font face="Arial" size="5">{{companyName}}, located at {{companyAddress}}<br></font><font face="Arial"><font size="3">AND</font><br></font><font face="Arial" size="5">{{employeeName}}, holding ID {{employeeId}}</font></p></div><div><font face="Arial" size="5"><br></font></div><div><font face="Arial" size="5"><div>1. Position</div><div>The Employee is hired as {{jobTitle}} in the {{department}} department.</div><div><br></div><div>2. Salary</div><div>The Employee shall receive a monthly salary of {{salary}} PKR.</div><div><br></div><div>3. Duration</div><div>This contract is effective from {{startDate}} to {{endDate}}.</div><div><br></div><div>4. Termination</div><div>Either party may terminate with {{noticePeriod}} days notice.</div><div><br></div><div>5. Signatures</div><div><br></div><div>Employer: ______________________</div><div>Employee: ______________________</div></font></div>`,
    used_for: "contract_template",
  },
  {
    _id: new ObjectId("695e6f56d2c22c37030f23d1"),
    templateTypeId: templateTypes[3]._id,
    name: "1st Warning",
    description:
      "Standard first warning template for disciplinary actions.",
    isActive: true,
    content: `<p><b>FIRST WARNING NOTICE</b></p><p>Dear {{employeeName}},</p><p>This is to formally notify you that your conduct/performance has been unsatisfactory due to {{warningReason}} </p><p>Please consider this as your first warning. Further incidents may lead to more severe disciplinary actions.</p>`,
    used_for: "warning_template",
  },
  {
    _id: new ObjectId("695e6f56d2c22c37030f23d2"),
    templateTypeId: templateTypes[3]._id,
    name: "2nd Warning",
    description:
      "Standard second warning template for disciplinary actions.",
    isActive: true,
    content: `<p><b>SECOND WARNING NOTICE</b></p><p>Dear {{employeeName}},</p><p>This is to formally notify you that your conduct/performance has been unsatisfactory due to {{warningReason}} </p><p>Please consider this as your second warning. Further incidents may lead to more severe disciplinary actions.</p>`,
    used_for: "warning_template",
  },
   {
    _id: new ObjectId("695e6f56d2c22c37030f23d3"),
    templateTypeId: templateTypes[3]._id,
    name: "3rd Warning",
    description:
      "Standard third warning template for disciplinary actions.",
    isActive: true,
    content: `<p><b>THIRD WARNING NOTICE</b></p><p>Dear {{employeeName}},</p><p>This is to formally notify you that your conduct/performance has been unsatisfactory due to {{warningReason}} </p><p>Please consider this as your third warning. Further incidents may lead to more severe disciplinary actions.</p>`,
    used_for: "warning_template",
  },
  {
    _id: new ObjectId("695e6f56d2c22c37030f23d4"),
    templateTypeId: templateTypes[3]._id,
    name: "Final Warning",
    description:
      "Standard final warning template for disciplinary actions.",
    isActive: true,
    content: `<p><b>FINAL WARNING NOTICE</b></p><p>Dear {{employeeName}},</p><p>This is to formally notify you that your conduct/performance has been unsatisfactory due to {{warningReason}} </p><p>Please consider this as your final warning. Further incidents may lead to more severe disciplinary actions.</p>`,
    used_for: "warning_template",
  },
  {
    _id: new ObjectId("695e6f56d2c22c37030f23d5"),
    templateTypeId: templateTypes[3]._id,
    name: "Verbal Warning",
    description:
      "Standard verbal warning template for disciplinary actions.",
    isActive: true,
    content: `<p><b>VERBAL WARNING NOTICE</b></p><p>Dear {{employeeName}},</p><p>This is to formally notify you that your conduct/performance has been unsatisfactory due to {{warningReason}} </p><p>Please consider this as your verbal warning. Further incidents may lead to more severe disciplinary actions.</p>`,
    used_for: "warning_template",
  },
  {
    _id: new ObjectId("695e6f56d2c22c37030f23d6"),
    templateTypeId: templateTypes[3]._id,
    name: "Disciplinary Enquiry",
    description:
      "Standard disciplinary enquiry template for disciplinary actions.",
    isActive: true,
    content: `<p><b>DISCIPLINARY ENQUIRY NOTICE</b></p><p>Dear {{employeeName}},</p><p>This is to formally notify you that your conduct/performance has been unsatisfactory due to {{warningReason}} </p><p>Please consider this as your disciplinary enquiry. Further incidents may lead to more severe disciplinary actions.</p>`,
    used_for: "warning_template",
  },
  {
    _id: new ObjectId("695e6f56d2c22c37030f23d7"),
    templateTypeId: templateTypes[3]._id,
    name: "Counselling",
    description:
      "Standard counselling template for disciplinary actions.",
    isActive: true,
    content: `<p><b>COUNSELLING NOTICE</b></p><p>Dear {{employeeName}},</p><p>This is to formally notify you that your conduct/performance has been unsatisfactory due to {{warningReason}} </p><p>Please consider this as your counselling. Further incidents may lead to more severe disciplinary actions.</p>`,
    used_for: "warning_template",
  },
  {
    _id: new ObjectId("695e6f56d2c22c37030f23d8"),
    templateTypeId: templateTypes[3]._id,
    name: "Breach",
    description:
      "Standard breach template for disciplinary actions.",
    isActive: true,
    content: `<p><b>BREACH NOTICE</b></p><p>Dear {{employeeName}},</p><p>This is to formally notify you that your conduct/performance has been unsatisfactory due to {{warningReason}} </p><p>Please consider this as your breach. Further incidents may lead to more severe disciplinary actions.</p>`,
    used_for: "warning_template",
  },
  {
    _id: new ObjectId("6970e69016b5615a8c08a983"),
    templateTypeId: templateTypes[1]._id,
    name: "Loan Template For Customer",
    customerId: customers[1]._id,
    description:
      "Loan authorization declaration for specific customer. ",
    isActive: true,
    content: `<p>I fully acknowledge and accept the terms and conditions related to the loan processing and authorization.</p>`,
    used_for: "aod_template",
  },
  {
    _id: new ObjectId("6970ec6316b5615a8c08a98b"),
    templateTypeId: templateTypes[2]._id,
    name: "Employment Contract From Customer",
    customerId: customers[1]._id,
    description:
      "Standard employment contract template for new hires from specific customer.",
    isActive: true,
    content: `<p><b>EMPLOYMENT CONTRACT</b></p><p><b></b></p><p><font face="Arial">This Employment Contract is made on {{contractDate}} between:</font></p><div><p><font face="Arial" size="5">{{companyName}}, located at {{companyAddress}}<br></font><font face="Arial"><font size="3">AND</font><br></font><font face="Arial" size="5">{{employeeName}}, holding CNIC {{employeeCnic}}</font></p></div><div><font face="Arial" size="5"><br></font></div><div><font face="Arial" size="5"><div>1. Position</div><div>The Employee is hired as {{jobTitle}} in the {{department}} department.</div><div><br></div><div>2. Salary</div><div>The Employee shall receive a monthly salary of {{salary}} PKR.</div><div><br></div><div>3. Duration</div><div>This contract is effective from {{startDate}} to {{endDate}}.</div><div><br></div><div>4. Termination</div><div>Either party may terminate with {{noticePeriod}} days notice.</div><div><br></div><div>5. Signatures</div><div><br></div><div>Employer: ______________________</div><div>Employee: ______________________</div></font></div>`,
    used_for: "contract_template",
  },
  {
    _id: new ObjectId("6970ec6316b5615a8c08a98c"),
    templateTypeId: templateTypes[3]._id,
    name: "1st Warning From Customer",
    customerId: customers[1]._id,
    description:
      "Standard first warning template for disciplinary actions from specific customer.",
    isActive: true,
    content: `<p><b>FIRST WARNING NOTICE</b></p><p>Dear {{employeeName}},</p><p>This is to formally notify you that your conduct/performance has been unsatisfactory due to {{warningReason}} </p><p>Please consider this as your first warning. Further incidents may lead to more severe disciplinary actions.</p>`,
    used_for: "warning_template",
  },
  {
    _id: new ObjectId("6970ec6316b5615a8c08a98d"),
    templateTypeId: templateTypes[4]._id,
    name: "Road Accident",
    description:
      "Standard road accident template for incident reporting.",
    isActive: true,
    content: `<p><b>ROAD ACCIDENT REPORT</b></p><p>An incident has been reported at {{location}} on {{date}} at {{time}}.,</p><p>Description: {{description}}</p>`,
    used_for: "incident_template",
    fields: [
      { name: "location", type: "string" },
      { name: "time", type: "time" },
      { name: "description", type: "text" },
    ],
  },
  {
    _id: new ObjectId("6970ec6316b5615a8c08a98e"),
    templateTypeId: templateTypes[4]._id,
    name: "Vehicle Rollover",
    description:
      "Standard vehicle rollover template for incident reporting.",
    isActive: true,
    content: `<p><b>VEHICLE ROLLOVER REPORT</b></p><p>An incident has been reported at {{location}} on {{date}} at {{time}}.,</p><p> Driver Condition: {{condition}}</p>`,
    used_for: "incident_template",
    fields: [
      { name: "location", type: "string" },
      { name: "time", type: "time" },
      { name: "condition", type: "text" },
    ],
  },
  {
    _id: new ObjectId("6970ec6316b5615a8c08a98f"),
    templateTypeId: templateTypes[4]._id,
    name: "Pedestrian Hit",
    description:
      "Standard pedestrian hit template for incident reporting.",
    isActive: true,
    content: `<p><b>PEDESTRIAN HIT REPORT</b></p><p>An incident has been reported at {{location}} on {{date}} at {{time}}.,</p><p> Pedestrian Condition: {{condition}}</p>`,
    used_for: "incident_template",
    fields: [
      { name: "location", type: "string" },
      { name: "time", type: "time" },
      { name: "condition", type: "text" },
    ],
  },
  {
    _id: new ObjectId("6970ec6316b5615a8c08a990"),
    templateTypeId: templateTypes[4]._id,
    name: "Property Collision",
    description:
      "Standard property collision template for incident reporting.",
    isActive: true,
    content: `<p><b>PROPERTY COLLISION REPORT</b></p><p>An incident has been reported at {{location}} on {{date}} at {{time}}.,</p><p>Object Hit: {{object}}</p><p>Damage: {{damage}}</p>`,
    used_for: "incident_template",
    fields: [
      { name: "location", type: "string" },
      { name: "time", type: "time" },
      { name: "object", type: "string" },
      { name: "damage", type: "text" },
    ],
  },
  {
    _id: new ObjectId("6970ec6316b5615a8c08a991"),
    templateTypeId: templateTypes[4]._id,
    name: "Hit & Run",
    description:
      "Standard hit and run template for incident reporting.",
    isActive: true,
    content: `<p><b>HIT & RUN REPORT</b></p><p>An incident has been reported at {{location}} on {{date}} at {{time}}.,</p><p>Vehicle: {{vehicle}}</p><p>Other party fled the scene: {{fled}}</p>`,
    used_for: "incident_template",
    fields: [
      { name: "location", type: "string" },
      { name: "time", type: "time" },
      { name: "vehicle", type: "string" },
      { name: "fled", type: "boolean" },
      { name: "damage", type: "text" },
    ],
  },

];
