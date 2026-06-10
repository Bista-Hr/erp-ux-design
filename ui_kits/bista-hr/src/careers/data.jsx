// BISTA HR · careers/data — shared careers store powering BOTH the ESS careers flow
// (Dashboard ▸ Careers) and the admin pipeline (Recruitment ▸ Job Posts ▸ Posting Details).
// Mirrors the codebase: a JobPosting has rich detail + pre-screening questions; applications
// move through Submitted → Shortlisted → Assessment → Offer → Hired (or Rejected). When an
// employee applies on the ESS side, the application is pushed here and shows up live on the
// admin side under the "Applications" (Submitted) tab.

// ---- employment-type label + pill colour (mirrors CareerCard.tsx) ----
const EMP_LABEL = { permanent: "Permanent", fulltime: "Permanent", contract: "Contract", temporary: "Temporary", parttime: "Part Time", internship: "Internship", intern: "Internship" };
const EMP_COLOR = {
  permanent: { bg: "#ECFDF3", fg: "#067647", bd: "#ABEFC6" },
  contract:  { bg: "#EFF4FF", fg: "#3538CD", bd: "#C7D7FE" },
  internship:{ bg: "#F9F5FF", fg: "#6941C6", bd: "#E9D7FE" },
  temporary: { bg: "#FFFAEB", fg: "#B54708", bd: "#FEDF89" },
  parttime:  { bg: "#F2F4F7", fg: "#475467", bd: "#E4E7EC" },
};
const empLabel = (t) => EMP_LABEL[String(t).toLowerCase().replace(/\s/g, "")] || t;
const empColor = (t) => EMP_COLOR[String(t).toLowerCase().replace(/\s/g, "")] || EMP_COLOR.parttime;

// ---- application status pipeline (mirrors ApplicationStatus enum) ----
const APP_STATUS = {
  0: { key: "Submitted",   label: "Submitted",   variant: "pending" },
  1: { key: "Shortlisted", label: "Shortlisted", variant: "info" },
  2: { key: "Assessment",  label: "Assessment",  variant: "review" },
  3: { key: "Offer",       label: "Offer",       variant: "warning" },
  4: { key: "Hired",       label: "Hired",       variant: "success" },
  5: { key: "Rejected",    label: "Rejected",    variant: "rejected" },
};
const APP_TABS = [
  { value: "all", label: "Applications", status: 0 },
  { value: "shortlisted", label: "Shortlisted", status: 1 },
  { value: "assessment", label: "Assessment", status: 2 },
  { value: "offer", label: "Offer", status: 3 },
  { value: "hired", label: "Hired", status: 4 },
  { value: "rejected", label: "Rejected", status: 5 },
];

const PRESCREEN = [
  { text: "What is your highest qualification?", type: "text" },
  { text: "Do you have at least 3 years of relevant experience?", type: "yesno" },
  { text: "Are you willing to relocate if required?", type: "yesno" },
];

let _cid = 5000;
const _app = (a) => ({
  id: ++_cid, applicantPhone: a.applicantPhone || "+233 24 000 0000", matchScore: a.matchScore ?? null,
  cv: "resume.pdf", coverLetter: "cover-letter.pdf",
  employmentHistory: a.employmentHistory || [{ employer: "Prior Co. Ltd", title: "Officer", start: "Jan 2021", end: "Dec 2024", note: "Handled day-to-day operations and reporting." }],
  education: a.education || [{ institution: "University of Ghana", degree: "BSc", field: "Administration", start: "2016", end: "2020", grade: "First Class" }],
  skills: a.skills || ["Communication", "MS Excel", "Analysis"],
  certifications: a.certifications || ["—"],
  preScreeningAnswers: a.preScreeningAnswers || ["BSc. Accounting", "Yes", "Yes"],
  ...a,
});

const CAREER_POSTINGS = [
  {
    id: "jp-1", designation: "Senior Accountant", department: "Finance", employmentType: "Permanent",
    closingDate: "28 Feb, 2025", postedAgo: "3 days", status: "Active",
    description: "Own the monthly close, financial reporting and controls for the Finance function.",
    jobDescription: "The Senior Accountant leads monthly and year-end close, ensures accuracy in financial reporting, and strengthens internal controls across the Finance function. You will partner with department heads on budgets and variance analysis.",
    keyDuties: ["Lead month-end and year-end close", "Prepare statutory and management accounts", "Own balance-sheet reconciliations", "Support audits and tax filings", "Drive process automation across reporting"],
    qualifications: ["BSc Accounting / Finance", "ICA / ACCA part- or fully-qualified", "5+ years in a similar role", "Strong IFRS knowledge"],
    skills: ["IFRS", "Financial Reporting", "Excel modelling", "ERP (SAP/Oracle)", "Reconciliations"],
    preScreeningQuestions: PRESCREEN,
  },
  {
    id: "jp-2", designation: "Software Engineer", department: "Information Technology", employmentType: "Contract",
    closingDate: "05 Mar, 2025", postedAgo: "1 day", status: "Active",
    description: "Build and maintain internal HR and operations platforms used across the group.",
    jobDescription: "As a Software Engineer you will design, build and ship features across our internal platforms, working closely with product and operations to deliver reliable, well-tested software.",
    keyDuties: ["Build features end-to-end", "Write tested, maintainable code", "Review peers' pull requests", "Collaborate with product on scope", "Support production systems"],
    qualifications: ["BSc Computer Science or equivalent", "3+ years building web apps", "Strong JavaScript/TypeScript", "Experience with React & Node"],
    skills: ["TypeScript", "React", "Node.js", "SQL", "CI/CD"],
    preScreeningQuestions: PRESCREEN,
  },
  {
    id: "jp-3", designation: "HR Officer", department: "Human Resource", employmentType: "Permanent",
    closingDate: "20 Mar, 2025", postedAgo: "5 days", status: "Active",
    description: "Support the full employee lifecycle — onboarding, records, leave and engagement.",
    jobDescription: "The HR Officer supports day-to-day HR operations including onboarding, employee records, leave administration and engagement initiatives, ensuring a smooth experience for all staff.",
    keyDuties: ["Coordinate onboarding & offboarding", "Maintain accurate employee records", "Administer leave and benefits", "Support engagement programs", "Respond to employee queries"],
    qualifications: ["BSc HR Management or related", "2+ years in HR operations", "Knowledge of labour law", "Excellent interpersonal skills"],
    skills: ["HRIS", "Onboarding", "Employee Relations", "MS Office"],
    preScreeningQuestions: PRESCREEN,
  },
  {
    id: "jp-4", designation: "Marketing Lead", department: "Marketing", employmentType: "Permanent",
    closingDate: "12 Mar, 2025", postedAgo: "2 days", status: "Active",
    description: "Lead brand and growth marketing across channels for the Bistasol portfolio.",
    jobDescription: "The Marketing Lead owns brand strategy and demand generation across digital and trade channels, managing campaigns end-to-end and a small team of specialists.",
    keyDuties: ["Own the marketing calendar", "Lead brand & growth campaigns", "Manage agency & media partners", "Report on funnel performance", "Mentor marketing specialists"],
    qualifications: ["BSc Marketing / Communications", "6+ years, 2+ leading teams", "FMCG experience a plus", "Data-driven mindset"],
    skills: ["Brand Strategy", "Performance Marketing", "Analytics", "Content", "Leadership"],
    preScreeningQuestions: PRESCREEN,
  },
  {
    id: "jp-5", designation: "Graduate Trainee", department: "Operations", employmentType: "Internship",
    closingDate: "26 Mar, 2025", postedAgo: "6 days", status: "Active",
    description: "12-month rotational program across Operations, Finance and Supply Chain.",
    jobDescription: "Our Graduate Trainee program is a structured 12-month rotation designed to build well-rounded future leaders across Operations, Finance and Supply Chain.",
    keyDuties: ["Rotate across core functions", "Support live projects", "Complete a capstone project", "Present to leadership", "Build cross-functional skills"],
    qualifications: ["Recent graduate (0–2 yrs)", "Minimum Second Class Upper", "Strong analytical ability", "Eagerness to learn"],
    skills: ["Analysis", "Communication", "Teamwork", "Adaptability"],
    preScreeningQuestions: PRESCREEN,
  },
  {
    id: "jp-6", designation: "Procurement Officer", department: "Operations", employmentType: "Temporary",
    closingDate: "18 Feb, 2025", postedAgo: "8 days", status: "Closed",
    description: "Manage sourcing, supplier relationships and purchase orders for the Tema depot.",
    jobDescription: "The Procurement Officer manages sourcing, supplier evaluation and purchase orders, ensuring value for money and continuity of supply for the Tema depot.",
    keyDuties: ["Raise and track purchase orders", "Evaluate and onboard suppliers", "Negotiate pricing and terms", "Maintain procurement records", "Ensure policy compliance"],
    qualifications: ["BSc Procurement / Supply Chain", "3+ years in procurement", "CIPS certification a plus", "Negotiation skills"],
    skills: ["Sourcing", "Negotiation", "Vendor Management", "ERP"],
    preScreeningQuestions: PRESCREEN,
  },
];

const CAREER_APPLICATIONS = {
  "jp-1": [
    _app({ applicantName: "Daniel Quaye", applicantEmail: "daniel.quaye@email.com", status: 4, matchScore: 88, createdAt: "08 Feb, 2025" }),
    _app({ applicantName: "Selina Owusu", applicantEmail: "selina.owusu@email.com", status: 3, matchScore: 81, createdAt: "10 Feb, 2025" }),
    _app({ applicantName: "Michael Asare", applicantEmail: "michael.asare@email.com", status: 2, matchScore: 74, createdAt: "11 Feb, 2025" }),
    _app({ applicantName: "Linda Mensah", applicantEmail: "linda.mensah@email.com", status: 1, matchScore: null, createdAt: "12 Feb, 2025" }),
    _app({ applicantName: "Joseph Nkrumah", applicantEmail: "joseph.nkrumah@email.com", status: 0, matchScore: null, createdAt: "13 Feb, 2025" }),
    _app({ applicantName: "Patience Darko", applicantEmail: "patience.darko@email.com", status: 0, matchScore: null, createdAt: "14 Feb, 2025" }),
    _app({ applicantName: "Kwame Adjei", applicantEmail: "kwame.adjei@email.com", status: 5, matchScore: 42, createdAt: "09 Feb, 2025" }),
  ],
  "jp-2": [
    _app({ applicantName: "Kofi Boadu", applicantEmail: "kofi.boadu@email.com", status: 2, matchScore: 91, createdAt: "03 Mar, 2025" }),
    _app({ applicantName: "Grace Adjei", applicantEmail: "grace.adjei@email.com", status: 1, matchScore: null, createdAt: "04 Mar, 2025" }),
    _app({ applicantName: "Emmanuel Tetteh", applicantEmail: "emmanuel.tetteh@email.com", status: 0, matchScore: null, createdAt: "05 Mar, 2025" }),
    _app({ applicantName: "Abena Sarpong", applicantEmail: "abena.sarpong@email.com", status: 0, matchScore: null, createdAt: "05 Mar, 2025" }),
    _app({ applicantName: "Yaw Darko", applicantEmail: "yaw.darko@email.com", status: 5, matchScore: 38, createdAt: "02 Mar, 2025" }),
  ],
  "jp-3": [
    _app({ applicantName: "Adwoa Nyarko", applicantEmail: "adwoa.nyarko@email.com", status: 3, matchScore: 84, createdAt: "16 Mar, 2025" }),
    _app({ applicantName: "Kwabena Adjei", applicantEmail: "kwabena.adjei@email.com", status: 1, matchScore: null, createdAt: "17 Mar, 2025" }),
    _app({ applicantName: "Efua Tetteh", applicantEmail: "efua.tetteh@email.com", status: 0, matchScore: null, createdAt: "18 Mar, 2025" }),
  ],
  "jp-4": [
    _app({ applicantName: "Nana Addo", applicantEmail: "nana.addo@email.com", status: 2, matchScore: 79, createdAt: "09 Mar, 2025" }),
    _app({ applicantName: "Maabena Asare", applicantEmail: "maabena.asare@email.com", status: 0, matchScore: null, createdAt: "10 Mar, 2025" }),
    _app({ applicantName: "Kwesi Frimpong", applicantEmail: "kwesi.frimpong@email.com", status: 0, matchScore: null, createdAt: "11 Mar, 2025" }),
  ],
  "jp-5": [
    _app({ applicantName: "Akua Bonsu", applicantEmail: "akua.bonsu@email.com", status: 1, matchScore: null, createdAt: "21 Mar, 2025" }),
    _app({ applicantName: "Yaw Mensah", applicantEmail: "yaw.mensah@email.com", status: 0, matchScore: null, createdAt: "22 Mar, 2025" }),
    _app({ applicantName: "Ama Serwaa", applicantEmail: "ama.serwaa@email.com", status: 0, matchScore: null, createdAt: "22 Mar, 2025" }),
  ],
  "jp-6": [
    _app({ applicantName: "Esi Quartey", applicantEmail: "esi.quartey@email.com", status: 4, matchScore: 86, createdAt: "12 Feb, 2025" }),
  ],
};

window.HRStores = window.HRStores || {};
window.HRStores.careers = window.HRStores.careers || makeStore({ postings: CAREER_POSTINGS, applications: CAREER_APPLICATIONS });

Object.assign(window, { empLabel, empColor, APP_STATUS, APP_TABS, CAREER_POSTINGS, CAREER_APPLICATIONS });
