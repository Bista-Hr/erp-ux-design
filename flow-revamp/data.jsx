// FLOW REVAMP (standalone proposal) · data — demo directory for the two role journeys.
// One signed-in EMPLOYEE (Ama) and one signed-in MANAGER (Daniel) whose direct reports
// include Ama, so an action in one view shows up in the other. Everything here is seed data.

// ---- the signed-in employee (ESS view) ----
const ME = {
  id: "emp-ama", name: "Ama Mensah", code: "BG-3104", title: "Relationship Manager",
  dept: "Retail Banking", branch: "Accra Main", grade: "Grade 3", manager: "Daniel Aboagye",
  email: "ama.mensah@bistasol.com", joined: "12 Mar 2021",
};

// ---- the signed-in line manager ----
const MGR = {
  id: "mgr-daniel", name: "Daniel Aboagye", code: "BG-2090", title: "Branch Manager",
  dept: "Retail Banking", branch: "Accra Main", grade: "Grade 5",
  email: "daniel.aboagye@bistasol.com",
};

// ---- the manager's direct reports (the "My Team" roster) ----
// goalStatus: Draft | Submitted | Approved   ·   appraisal: null | {score, status}
const TEAM = [
  { id: "emp-ama",   name: "Ama Mensah",     code: "BG-3104", title: "Relationship Manager", dept: "Retail Banking",
    goalStatus: "Submitted", goalsWeight: 100, appraisal: { score: 3.6, status: "Pending Review" }, idp: "On Track", idpPct: 62, leavePending: 1 },
  { id: "emp-yaw",   name: "Yaw Asante",     code: "BG-3120", title: "Relationship Officer", dept: "Retail Banking",
    goalStatus: "Approved", goalsWeight: 100, appraisal: { score: 4.1, status: "Completed" }, idp: "On Track", idpPct: 78, leavePending: 0 },
  { id: "emp-efua",  name: "Efua Boateng",   code: "BG-3155", title: "Teller", dept: "Retail Banking",
    goalStatus: "Draft", goalsWeight: 60, appraisal: null, idp: "Not Started", idpPct: 0, leavePending: 0 },
  { id: "emp-kojo",  name: "Kojo Mensah",    code: "BG-3162", title: "Customer Service Officer", dept: "Retail Banking",
    goalStatus: "Submitted", goalsWeight: 100, appraisal: { score: 2.8, status: "Pending Review" }, idp: "At Risk", idpPct: 28, leavePending: 2 },
  { id: "emp-adwoa", name: "Adwoa Owusu",    code: "BG-3171", title: "Relationship Officer", dept: "Retail Banking",
    goalStatus: "Approved", goalsWeight: 100, appraisal: { score: 3.9, status: "Completed" }, idp: "On Track", idpPct: 71, leavePending: 0 },
  { id: "emp-kwame", name: "Kwame Darko",    code: "BG-3188", title: "Teller", dept: "Retail Banking",
    goalStatus: "Submitted", goalsWeight: 90, appraisal: { score: 3.2, status: "Pending Review" }, idp: "On Track", idpPct: 45, leavePending: 0 },
];

// ---- Ama's goals (for her My Goals view + the manager drill-in approval) ----
const ME_GOALS = [
  { id: "g1", title: "Grow deposit portfolio by 15%", perspective: "Financial", weight: 40, progress: 68, kpi: "Deposit balance growth %" },
  { id: "g2", title: "Improve customer satisfaction score to 90%", perspective: "Customer", weight: 30, progress: 74, kpi: "CSAT survey average" },
  { id: "g3", title: "Strengthen credit analysis turnaround", perspective: "Internal Process", weight: 20, progress: 40, kpi: "Avg. appraisal time (days)" },
  { id: "g4", title: "Complete RM certification pathway", perspective: "Learning & Growth", weight: 10, progress: 55, kpi: "Modules completed" },
];

// ---- Ama's learning (My Learning, the consumer side) ----
const ME_COURSES = [
  { id: "c1", title: "Credit Risk Fundamentals", provider: "BISTA Academy", status: "In Progress", pct: 45, due: "30 Jun 2026" },
  { id: "c2", title: "Customer Experience Excellence", provider: "External · Skillsoft", status: "Completed", pct: 100, due: "12 May 2026" },
  { id: "c3", title: "Anti-Money-Laundering Refresher", provider: "Compliance Unit", status: "Not Started", pct: 0, due: "15 Jul 2026" },
];

// ---- internal career opportunities (Careers) ----
const OPEN_ROLES = [
  { id: "r1", title: "Senior Relationship Manager", dept: "Corporate Banking", location: "Accra Main", closes: "28 Jun 2026", applicants: 12 },
  { id: "r2", title: "Branch Operations Lead", dept: "Operations", location: "Kumasi", closes: "04 Jul 2026", applicants: 7 },
  { id: "r3", title: "Credit Analyst II", dept: "Credit Risk", location: "Accra Main", closes: "11 Jul 2026", applicants: 19 },
];

// ---- training-request seed (the NEW employee→manager→L&D flow) ----
// status: "Pending Manager" | "Approved" (→ in L&D Needs) | "Declined"
let DEV_SEQ = 10;
const devReqId = () => ++DEV_SEQ;
const DEV_REQUESTS_SEED = [
  { id: 1, employee: "Ama Mensah", employeeId: "emp-ama", manager: "Daniel Aboagye", program: "Advanced Credit Analysis", category: "Formal Training",
    need: "Cut credit appraisal turnaround; close the gap flagged in my appraisal.", priority: "High", method: "10% Formal", date: "02 Jun 2026", status: "Pending Manager" },
  { id: 2, employee: "Ama Mensah", employeeId: "emp-ama", manager: "Daniel Aboagye", program: "Negotiation & Deal Structuring", category: "Coaching",
    need: "Strengthen deal-closing for larger corporate clients.", priority: "Medium", method: "20% Coaching", date: "21 May 2026", status: "Approved", ldStatus: "In Needs Assessment" },
  { id: 3, employee: "Ama Mensah", employeeId: "emp-ama", manager: "Daniel Aboagye", program: "Public Speaking Masterclass", category: "Formal Training",
    need: "Personal interest — present at branch town-halls.", priority: "Low", method: "10% Formal", date: "08 May 2026", status: "Declined", reason: "Not aligned to current role priorities this cycle; revisit next period." },
];

// dropdown options for the request form
const PROGRAM_CATEGORIES = ["Formal Training", "Coaching / Mentoring", "On-the-Job / Stretch Assignment", "Certification", "Conference / Seminar"];
const DEV_METHODS = ["70% On-the-job", "20% Coaching", "10% Formal"];
const PRIORITIES = ["High", "Medium", "Low"];

// suggested programs (so the employee can pick a known program or type a custom need)
const PROGRAM_CATALOG = ["Advanced Credit Analysis", "Negotiation & Deal Structuring", "Leadership Essentials", "Data Analytics for Bankers",
  "Customer Experience Excellence", "Anti-Money-Laundering Deep Dive", "Project Management (PMP)", "Digital Banking & Fintech"];

Object.assign(window, {
  ME, MGR, TEAM, ME_GOALS, ME_COURSES, OPEN_ROLES, DEV_REQUESTS_SEED, devReqId,
  PROGRAM_CATEGORIES, DEV_METHODS, PRIORITIES, PROGRAM_CATALOG,
});
