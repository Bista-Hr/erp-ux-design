// BISTA HR · promotions/data — seed promotions + the employee directory used to
// auto-populate current job title / grade / department / zone / branch / staff ID /
// salary / performance rating when an employee is picked in the promotion form
// (mirrors the "Auto populated" fields in the Electronic Promotion Form spec).
// EMPLOYEE_DIRECTORY is shared and reusable across Promotions / Transfers / Job-Title flows.

const EMPLOYEE_DIRECTORY = {
  "Aaron Appiah":      { staffId: "EMP-18330", title: "Ag. Assurance Supervisor", grade: "Grade 4", dept: "Finance",              unit: "Assurance",       zone: "Accra East",   branch: "Abossey Okai", salary: "GHS 8,000.00", rating: "Very Good" },
  "Aba Odum":          { staffId: "EMP-18389", title: "Data Scientist",           grade: "Grade 5", dept: "Information Technology", unit: "Data & Analytics", zone: "Accra West",   branch: "Ridge",        salary: "GHS 9,500.00", rating: "Outstanding" },
  "Abass Abdul Mumin": { staffId: "EMP-17431", title: "Branch Support",           grade: "Grade 3", dept: "Operations",           unit: "Branch Support",  zone: "Central Zones", branch: "Cape Coast",   salary: "GHS 5,200.00", rating: "Good" },
  "Franklin Brobbey":  { staffId: "EMP-10231", title: "Accountant",               grade: "Grade 2", dept: "Finance",              unit: "Accounts",        zone: "South Zone",   branch: "Accra",        salary: "GHS 6,000.00", rating: "Very Good" },
  "Emmanuel Ansah":    { staffId: "EMP-10412", title: "HR Officer",               grade: "Grade 2", dept: "Human Resource",       unit: "HR Operations",   zone: "South Zone",   branch: "Accra",        salary: "GHS 5,800.00", rating: "Good" },
  "Bright Manu":       { staffId: "EMP-10876", title: "Software Engineer",        grade: "Grade 3", dept: "Information Technology", unit: "Engineering",     zone: "East Zone",    branch: "Tema",         salary: "GHS 7,400.00", rating: "Outstanding" },
  "Samuel Boateng":    { staffId: "EMP-11002", title: "Sales Officer",            grade: "Grade 1", dept: "Marketing",            unit: "Sales",           zone: "West Zone",    branch: "Kumasi",       salary: "GHS 4,500.00", rating: "Above Average" },
  "Samuel Asante":     { staffId: "EMP-11233", title: "Teller",                   grade: "Grade 1", dept: "Finance",              unit: "Retail",          zone: "West Zone",    branch: "Takoradi",     salary: "GHS 4,200.00", rating: "Good" },
  "Abdul-Gadaf Abubakar": { staffId: "EMP-08141", title: "Retail Sales Manager",   grade: "Grade 5", dept: "Operations",           unit: "Retail",          zone: "North Zone",   branch: "Tamale",       salary: "GHS 8,600.00", rating: "Outstanding" },
};
const EMPLOYEE_NAMES = Object.keys(EMPLOYEE_DIRECTORY);

// ── Staff-ID-keyed employee list (the source of truth for staff pickers) ──
// The client's requirement: employees may share a NAME but always have a unique STAFF ID,
// so selection is keyed on the staff id, never the name. EMPLOYEE_LIST is an array of
// { id: <staffId>, name, ...record }; EMP_BY_ID resolves a staff id back to the record.
const EMPLOYEE_LIST = EMPLOYEE_NAMES.map(n => ({ id: EMPLOYEE_DIRECTORY[n].staffId, name: n, ...EMPLOYEE_DIRECTORY[n] }));
// demonstrate a same-name / different-staff-id case (two distinct "Samuel Boateng"s)
EMPLOYEE_LIST.push({ id: "EMP-20114", name: "Samuel Boateng", staffId: "EMP-20114", title: "Field Agent",
  grade: "Grade 1", dept: "Operations", unit: "Field Operations", zone: "East Zone", branch: "Tema", salary: "GHS 4,300.00", rating: "Good" });
const EMP_BY_ID = {};
EMPLOYEE_LIST.forEach(e => { EMP_BY_ID[e.id] = e; });
// MOCK: default profile pictures for a handful of employees (stable stock faces) — the rest
// keep initials avatars, so both drawer/preview states are demoable.
const MOCK_PROFILE_PICS = {
  "EMP-18330": "https://i.pravatar.cc/512?img=12",
  "EMP-18389": "https://i.pravatar.cc/512?img=47",
  "EMP-10876": "https://i.pravatar.cc/512?img=33",
  "EMP-11002": "https://i.pravatar.cc/512?img=15",
  "EMP-10412": "https://i.pravatar.cc/512?img=53",
};
// MOCK: promotion-relevant employment fields (mirrors the employee API record: notch,
// reportingManager, dateEmployed, employmentType, yearsOfService, isConfirmed). Deterministic
// from the staff-id digits so values are stable & demoable across reloads.
EMPLOYEE_LIST.forEach((e, i) => {
  const n = parseInt(e.staffId.replace(/\D/g, ""), 10) || 0;
  if (!e.profilePictureUrl) e.profilePictureUrl = MOCK_PROFILE_PICS[e.staffId] || "";
  if (!e.notch) e.notch = "Notch " + (1 + n % 3);
  if (!e.reportingManager) e.reportingManager = EMPLOYEE_LIST[(i + 1) % EMPLOYEE_LIST.length].name;
  if (!e.dateEmployed) {
    const y = 2016 + (n % 9);
    e.dateEmployed = new Date(y, n % 12, 1 + (n % 27)).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    e.yearsOfService = Math.max(0, 2026 - y);
  }
  if (!e.employmentType) e.employmentType = n % 4 === 0 ? "Contract" : "Full Time";
  if (e.isConfirmed == null) e.isConfirmed = n % 5 !== 0;
});
// first staff id matching a name — used to migrate legacy name-based records to ids on edit
const firstIdForName = (name) => (EMPLOYEE_LIST.find(e => e.name === name) || {}).id;

// ── Payroll (MOCK) ──
// The real new-salary + allowances will come from the Payroll module (not yet implemented).
// Until then, picking a Job Grade + Notch auto-fetches the salary and standard allowances from
// this mock grid. Replace `fetchPayroll` with the payroll API call when it lands.
const NOTCHES = ["Notch 1", "Notch 2", "Notch 3", "Notch 4", "Notch 5", "Notch 6"];
// Notches are tied to the job grade. A grade OWNS its band of notches (managed on the Core HR
// Job Grade form). notchesForGrade reads the live grade's notch count first, falling back to a
// computed band when a grade has none defined. Notches are sequential integers starting at 1.
function gradeNotchCount(grade) {
  const rows = (window.HR_DATA && window.HR_DATA["Job Grades"]) || [];
  const row = rows.find(r => r.name === grade);
  if (row) {
    if (Array.isArray(row.notches)) return row.notches.length;
    if (row.notches != null && row.notches !== "") return +row.notches || 0;
  }
  return 0;
}
function notchesForGrade(grade) {
  if (!grade) return [];
  let count = gradeNotchCount(grade);
  if (!count) {
    const g = parseInt((String(grade).match(/\d+/) || [1])[0], 10) || 1;
    count = Math.max(3, Math.min(6, 2 + g)); // fallback: Grade 1 → 3 notches … capped at 6
  }
  return Array.from({ length: count }, (_, i) => `Notch ${i + 1}`);
}
const ghs = (n) => "GHS " + Math.round(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
function fetchPayroll(grade, notch) {
  if (!grade || !notch) return null;
  const g = parseInt((String(grade).match(/\d+/) || [1])[0], 10) || 1;
  const no = parseInt((String(notch).match(/\d+/) || [1])[0], 10) || 1;
  const base = 4000 + g * 1500 + (no - 1) * 350;
  const allowances = [
    { label: "Transport Allowance", value: ghs(base * 0.10) },
    { label: "Housing Allowance", value: ghs(base * 0.15) },
  ];
  if (g >= 5) allowances.push({ label: "Responsibility Allowance", value: ghs(base * 0.08) });
  return { salary: ghs(base), allowances };
}

const PROMO_DOC = (name, ext, size, docType) => ({ name, ext, size, docType });

const PROMOTION_SEED = [
  { id: 1, employees: ["Aaron Appiah"], staffIds: "EMP-18330",
    previousRole: "Ag. Assurance Supervisor", newRole: "Branch Support", previousGrade: "Grade 4", grade: "Grade 5",
    deptUnit: "Finance", department: "Finance", unit: "Assurance", zone: "Accra East", branch: "Abossey Okai",
    previousSalary: "GHS 8,000.00", salary: "GHS 9,200.00", performanceRating: "Very Good",
    effectiveDate: "Jun 01, 2026", dateSubmitted: "May 14, 2026", status: "Approved",
    justification: "Consistently strong assurance performance and readiness for a broader operational remit.",
    audit: [
      { id: "pr1-1", action: 0, description: "Promotion request submitted — Ag. Assurance Supervisor → Branch Support", actorName: "Peter Bosrotsi (P&C)", occurredAt: "2026-05-14T10:00:00Z", justificationReason: "Consistently strong assurance performance and readiness for a broader operational remit.", staffId: "EMP-18330" },
      { id: "pr1-2", action: 3, description: "Promotion approved", actorName: "Angela Osei (Head P&C)", occurredAt: "2026-05-16T14:08:00Z", justificationReason: null, staffId: "EMP-18330" },
    ],
    allowances: [], documents: [PROMO_DOC("Promotion Recommendation.pdf", "PDF", "1.2 MB", "Reference Letter"), PROMO_DOC("Performance Summary.xlsx", "XLSX", "84 KB", "Other")],
    docUrls: [
      "https://files.bistasol.com/promotions/Promotion-Recommendation.pdf",
      "https://files.bistasol.com/promotions/Talent-Review-Notes.docx",
      "https://files.bistasol.com/promotions/Performance-Summary.xlsx",
      "https://files.bistasol.com/promotions/Board-Briefing-Deck.pptx",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cat03.jpg/640px-Cat03.jpg",
    ],
    approvedBy: "Angela Osei", approverEmail: "aosei@gcb.com.gh", approvedAt: "5/16/2026, 2:08:34 PM",
    rejectedBy: "N/A", rejectorEmail: "N/A", rejectedAt: "N/A" },
  { id: 2, employees: ["Abass Abdul Mumin"], staffIds: "EMP-17431",
    previousRole: "Branch Support", newRole: "Retail Sales Manager", previousGrade: "Grade 3", grade: "Grade 5",
    deptUnit: "Operations", department: "Operations", unit: "Branch Support", zone: "Central Zones", branch: "Cape Coast",
    previousSalary: "GHS 5,200.00", salary: "GHS 8,600.00", performanceRating: "Good",
    effectiveDate: "May 28, 2026", dateSubmitted: "May 10, 2026", status: "Approved",
    justification: "Demonstrated leadership in branch support; promotion fills a vacant retail management role.",
    allowances: [{ label: "Transport Allowance", value: "GHS 800.00" }, { label: "Responsibility Allowance", value: "GHS 1,200.00" }],
    documents: [PROMO_DOC("Approval Memo.pdf", "PDF", "640 KB", "Contract")],
    approvedBy: "Angela Osei", approverEmail: "aosei@gcb.com.gh", approvedAt: "5/12/2026, 10:22:10 AM",
    rejectedBy: "N/A", rejectorEmail: "N/A", rejectedAt: "N/A" },
  { id: 3, employees: ["Abdul-Gadaf Abubakar"], staffIds: "EMP-08141",
    previousRole: "Retail Sales Manager", newRole: "Retail Relationship Officer", previousGrade: "Grade 5", grade: "Grade 6",
    deptUnit: "Operations", department: "Operations", unit: "Retail", zone: "North Zone", branch: "Tamale",
    previousSalary: "GHS 8,600.00", salary: "GHS 10,400.00", performanceRating: "Outstanding",
    effectiveDate: "Jul 08, 2026", dateSubmitted: "May 18, 2026", status: "Pending",
    justification: "Top performer in the zone; succession plan recommends elevation to relationship management.",
    allowances: [], documents: [PROMO_DOC("Talent Review Notes.docx", "DOCX", "120 KB", "Other")],
    docUrls: ["https://files.bistasol.com/promotions/Talent-Review-Notes.docx", "https://files.bistasol.com/promotions/Recommendation.pdf"],
    approvedBy: "N/A", approverEmail: "N/A", approvedAt: "N/A",
    rejectedBy: "N/A", rejectorEmail: "N/A", rejectedAt: "N/A" },
  { id: 4, employees: ["Aba Odum"], staffIds: "EMP-18389",
    previousRole: "Data Scientist", newRole: "Ag. Retail Relationship Manager", previousGrade: "Grade 5", grade: "Grade 6",
    deptUnit: "Information Technology", department: "Information Technology", unit: "Data & Analytics", zone: "Accra West", branch: "Ridge",
    previousSalary: "GHS 9,500.00", salary: "GHS 11,800.00", performanceRating: "Outstanding",
    effectiveDate: "May 28, 2026", dateSubmitted: "May 14, 2026", status: "Pending", hasBeenCorrected: true,
    justification: "Cross-functional impact and analytics leadership justify an acting management appointment.",
    audit: [
      { id: "pr4-1", action: 0, description: "Promotion request submitted — Data Scientist → Ag. Retail Relationship Manager", actorName: "Peter Bosrotsi (P&C)", occurredAt: "2026-05-09T09:20:00Z", justificationReason: "Cross-functional impact and analytics leadership justify an acting management appointment.", staffId: "EMP-18389" },
      { id: "pr4-2", action: 4, description: "Promotion returned to initiator for correction", actorName: "Angela Osei (Head P&C)", occurredAt: "2026-05-12T11:40:00Z", justificationReason: "Effective date precedes the acting-appointment approval window. Align the date with the June cycle and reattach the signed business case.", staffId: "EMP-18389" },
      { id: "pr4-3", action: 6, description: "Request corrected and resubmitted for approval after return", actorName: "Peter Bosrotsi (P&C)", occurredAt: "2026-05-14T08:05:00Z", justificationReason: null, staffId: "EMP-18389" },
    ],
    allowances: [], documents: [PROMO_DOC("Business Case.pdf", "PDF", "2.1 MB", "Other"), PROMO_DOC("ID Verification.jpg", "JPG", "1.4 MB", "ID Card")],
    docUrls: ["https://files.bistasol.com/promotions/Business-Case.pdf", "https://files.bistasol.com/promotions/Analytics-Summary.xlsx"],
    approvedBy: "N/A", approverEmail: "N/A", approvedAt: "N/A",
    rejectedBy: "N/A", rejectorEmail: "N/A", rejectedAt: "N/A" },
  { id: 5, employees: ["Samuel Boateng"], staffIds: "EMP-11002",
    previousRole: "Sales Officer", newRole: "Senior Sales Officer", previousGrade: "Grade 1", grade: "Grade 2",
    deptUnit: "Marketing", department: "Marketing", unit: "Sales", zone: "West Zone", branch: "Kumasi",
    previousSalary: "GHS 4,500.00", salary: "GHS 5,600.00", performanceRating: "Above Average",
    effectiveDate: "Apr 30, 2026", dateSubmitted: "Apr 12, 2026", status: "Rejected",
    justification: "Recommended for promotion based on sales targets met over four consecutive quarters.",
    allowances: [], documents: [PROMO_DOC("Sales Record.xlsx", "XLSX", "210 KB", "Other")],
    approvedBy: "N/A", approverEmail: "N/A", approvedAt: "N/A",
    rejectedBy: "Angela Osei", rejectorEmail: "aosei@gcb.com.gh", rejectedAt: "4/18/2026, 9:14:02 AM",
    rejectionReason: "Budget headroom for Grade 2 in Marketing is exhausted for this cycle. Revisit with the Q3 budget or restate the case at the current grade with a notch adjustment, then resubmit.",
    audit: [
      { id: "pr5-1", action: 0, description: "Promotion request submitted — Sales Officer → Senior Sales Officer", actorName: "Peter Bosrotsi (P&C)", occurredAt: "2026-04-12T10:05:00Z", justificationReason: "Recommended for promotion based on sales targets met over four consecutive quarters.", staffId: "EMP-11002" },
      { id: "pr5-2", action: 4, description: "Promotion rejected — request closed", actorName: "Angela Osei (Head P&C)", occurredAt: "2026-04-18T09:14:00Z", justificationReason: "Budget headroom for Grade 2 in Marketing is exhausted for this cycle. Revisit with the Q3 budget or restate the case at the current grade with a notch adjustment, then resubmit.", staffId: "EMP-11002" },
    ] },
  { id: 6, employees: ["Bright Manu"], staffIds: "EMP-10876",
    previousRole: "Software Engineer", newRole: "Senior Software Engineer", previousGrade: "Grade 3", grade: "Grade 4", notch: "Notch 1",
    deptUnit: "Information Technology", department: "Information Technology", unit: "Engineering", zone: "East Zone", branch: "Tema",
    previousSalary: "GHS 7,400.00", salary: "GHS 10,350.00", performanceRating: "Outstanding",
    effectiveDate: "Jul 01, 2026", dateSubmitted: "Jun 18, 2026", status: "Returned",
    justification: "Led the payments platform rebuild and mentors three junior engineers; grade change reflects sustained senior-level output.",
    allowances: [], documents: [PROMO_DOC("Engineering Review.pdf", "PDF", "860 KB", "Other")],
    docUrls: ["https://files.bistasol.com/promotions/Engineering-Review.pdf"],
    approvedBy: "N/A", approverEmail: "N/A", approvedAt: "N/A",
    rejectedBy: "N/A", rejectorEmail: "N/A", rejectedAt: "N/A",
    returnedBy: "Angela Osei", returnedAt: "6/20/2026, 11:02:47 AM",
    returnReason: "The supporting document is the mid-year review, not the signed promotion recommendation. Attach the recommendation letter and confirm the notch — Grade 4 placements this cycle start at Notch 2.",
    audit: [
      { id: "pr6-1", action: 0, description: "Promotion request submitted — Software Engineer → Senior Software Engineer", actorName: "Peter Bosrotsi (P&C)", occurredAt: "2026-06-18T09:30:00Z", justificationReason: "Led the payments platform rebuild and mentors three junior engineers; grade change reflects sustained senior-level output.", staffId: "EMP-10876" },
      { id: "pr6-2", action: 4, description: "Promotion returned to initiator for correction", actorName: "Angela Osei (Head P&C)", occurredAt: "2026-06-20T11:02:00Z", justificationReason: "The supporting document is the mid-year review, not the signed promotion recommendation. Attach the recommendation letter and confirm the notch — Grade 4 placements this cycle start at Notch 2.", staffId: "EMP-10876" },
    ] },
  { id: 7, employees: ["Emmanuel Ansah"], staffIds: "EMP-10412",
    previousRole: "HR Officer", newRole: "HR Manager", previousGrade: "Grade 2", grade: "Grade 3", notch: "",
    deptUnit: "Human Resource", department: "Human Resource", unit: "HR Operations", zone: "South Zone", branch: "Accra",
    previousSalary: "GHS 5,800.00", salary: "—", performanceRating: "Good",
    effectiveDate: "—", dateSubmitted: "—", status: "Draft",
    justification: "Succession pick for the HR Operations lead role; pending confirmation of the effective date.",
    allowances: [], documents: [], docUrls: [],
    approvedBy: "N/A", approverEmail: "N/A", approvedAt: "N/A",
    rejectedBy: "N/A", rejectorEmail: "N/A", rejectedAt: "N/A",
    audit: [
      { id: "pr7-1", action: 1, description: "Promotion drafted — saved for later completion", actorName: "Peter Bosrotsi (P&C)", occurredAt: "2026-07-20T15:12:00Z", justificationReason: null, staffId: "EMP-10412" },
    ] },
];

Object.assign(window, { EMPLOYEE_DIRECTORY, EMPLOYEE_NAMES, EMPLOYEE_LIST, EMP_BY_ID, firstIdForName, NOTCHES, notchesForGrade, gradeNotchCount, fetchPayroll, PROMOTION_SEED });

// ── Job-title catalog ──
// Every job title belongs to a DEPARTMENT (and the organization) and carries a default JOB GRADE
// + NOTCH. Reads the live Core HR "Job Titles" rows so titles created there cascade everywhere;
// falls back to a static set before any data is loaded. BENEFITS are not stored on the title —
// they derive from (grade, notch) via fetchPayroll, so a title resolves to grade → notch → benefits.
const JOB_TITLE_FALLBACK = [
  { name: "Finance Analyst", department: "Finance", grade: "Grade 2", notch: "Notch 1" },
  { name: "Accountant", department: "Finance", grade: "Grade 2", notch: "Notch 1" },
  { name: "HR Manager", department: "Human Resource", grade: "Grade 3", notch: "Notch 1" },
  { name: "Software Engineer", department: "Information Technology", grade: "Grade 2", notch: "Notch 1" },
  { name: "Sales Officer", department: "Marketing", grade: "Grade 1", notch: "Notch 1" },
];
const jtCatalog = () => {
  const rows = (window.HR_DATA && window.HR_DATA["Job Titles"]) || [];
  return rows.length ? rows : JOB_TITLE_FALLBACK;
};
function jobTitlesForDepartment(dept) {
  return jtCatalog().filter(r => !dept || r.department === dept).map(r => r.name);
}
function jobTitleInfo(title) {
  const r = jtCatalog().find(x => x.name === title);
  if (!r) return null;
  return { department: r.department || "", grade: r.grade || "", notch: r.notch || "Notch 1" };
}
Object.assign(window, { JOB_TITLE_FALLBACK, jobTitlesForDepartment, jobTitleInfo });

// Notch options stay PLAIN ("Notch 1") — matches production: salary lives in its own
// read-only Salary field resolved from (grade, notch), not inline in the notch label.
function notchSalaryOptions(grade) {
  return notchesForGrade(grade);
}
Object.assign(window, { notchSalaryOptions });
