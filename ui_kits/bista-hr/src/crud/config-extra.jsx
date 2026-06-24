// BISTA HR · crud/config-extra — additional entity configs + ~10-row demo seed
// for the pages added to match the real app (Recruitment, Objectives, KPI/Measures,
// Performance Ratings, Reporting Managers). Merged into the global CONFIGS / SEED so
// the generic CrudScreen renders them with data. Loads AFTER config.jsx and BEFORE app.jsx.

let _xid = 2000;
const _rows = (arr) => arr.map(r => ({ id: ++_xid, active: r.active !== false, ...r }));

const EXTRA_CONFIGS = {
  // ---------- Recruitment ----------
  "Hiring Requests": {
    title: "Hiring Requests", subtitle: "Manager requests to fill a role — routed for HR approval.",
    cta: "New Hiring Request", noun: "Hiring Request", verb: "Create", hideStatus: true, hideSegment: true, hideActive: true,
    cols: [{ key: "position", label: "Position" }, { key: "department", label: "Department" }, { key: "grade", label: "Grade" }, { key: "requestedBy", label: "Requested By", type: "avatar" }, { key: "date", label: "Date" }, { key: "status", label: "Status", type: "badge" }],
    fields: [
      { key: "position", label: "Position", placeholder: "Eg. Finance Analyst", full: true },
      { key: "department", label: "Department", type: "select", lookup: "departments", placeholder: "Select department" },
      { key: "grade", label: "Job Grade", type: "select", lookup: "jobGrades", placeholder: "Select grade", optional: true },
      { key: "requestedBy", label: "Requested By", type: "select", lookup: "employees", icon: "search-line", placeholder: "Select requester", optional: true },
      { key: "status", label: "Status", type: "select", options: ["Pending", "Approved", "Rejected"], placeholder: "Select status", optional: true },
    ],
  },
  "Job Requests": {
    title: "Job Requests", subtitle: "Approved hiring needs formalized into job requisitions.",
    cta: "New Job Request", noun: "Job Request", verb: "Create", hideStatus: true, hideSegment: true, hideActive: true,
    cols: [{ key: "title", label: "Job Title" }, { key: "department", label: "Department" }, { key: "type", label: "Type" }, { key: "vacancies", label: "Vacancies" }, { key: "requestedBy", label: "Requested By", type: "avatar" }, { key: "status", label: "Status", type: "badge" }],
    fields: [
      { key: "title", label: "Job Title", placeholder: "Eg. Software Engineer", full: true },
      { key: "department", label: "Department", type: "select", lookup: "departments", placeholder: "Select department" },
      { key: "type", label: "Employment Type", type: "select", options: ["Permanent", "Contract", "Temporary", "Internship"], placeholder: "Select type", optional: true },
      { key: "vacancies", label: "Vacancies", placeholder: "Eg. 2", optional: true },
      { key: "status", label: "Status", type: "select", options: ["Pending", "Approved", "Rejected"], placeholder: "Select status", optional: true },
    ],
  },
  "Job Posts": {
    title: "Job Posts", subtitle: "Published vacancies open to internal and external applicants.",
    cta: "Create Job Post", noun: "Job Post", verb: "Create", hideStatus: true, hideSegment: true, hideActive: true,
    cols: [{ key: "title", label: "Title" }, { key: "department", label: "Department" }, { key: "location", label: "Location" }, { key: "applicants", label: "Applicants" }, { key: "closing", label: "Closing Date" }, { key: "status", label: "Status", type: "badge" }],
    fields: [
      { key: "title", label: "Title", placeholder: "Eg. Senior Accountant", full: true },
      { key: "department", label: "Department", type: "select", lookup: "departments", placeholder: "Select department" },
      { key: "location", label: "Location", placeholder: "Eg. Accra — Main Office", optional: true },
      { key: "closing", label: "Closing Date", placeholder: "DD / MM / YYYY", optional: true },
      { key: "status", label: "Status", type: "select", options: ["Open", "Closed", "Draft"], placeholder: "Select status", optional: true },
    ],
  },
  "Job Reopenings": {
    title: "Job Reopenings", subtitle: "Previously closed postings reopened to source more candidates.",
    cta: "Reopen Posting", noun: "Job Reopening", verb: "Reopen", hideStatus: true, hideSegment: true, hideActive: true,
    cols: [{ key: "title", label: "Title" }, { key: "department", label: "Department" }, { key: "originalClose", label: "Originally Closed" }, { key: "reopenedBy", label: "Reopened By", type: "avatar" }, { key: "status", label: "Status", type: "badge" }],
    fields: [
      { key: "title", label: "Title", placeholder: "Eg. Senior Accountant", full: true },
      { key: "department", label: "Department", type: "select", lookup: "departments", placeholder: "Select department" },
      { key: "originalClose", label: "Originally Closed", placeholder: "DD / MM / YYYY", optional: true },
      { key: "status", label: "Status", type: "select", options: ["Open", "Pending", "Closed"], placeholder: "Select status", optional: true },
    ],
  },
  "Assessments": {
    title: "Assessments", subtitle: "Interview and evaluation stages assigned to assessors.",
    cta: "Add Assessment", noun: "Assessment", verb: "Add", hideStatus: true, hideSegment: true, hideActive: true,
    cols: [{ key: "candidate", label: "Candidate", type: "avatar" }, { key: "position", label: "Position" }, { key: "stage", label: "Stage" }, { key: "assessor", label: "Assessor" }, { key: "score", label: "Score" }, { key: "status", label: "Status", type: "badge" }],
    fields: [
      { key: "candidate", label: "Candidate", placeholder: "Candidate full name", full: true },
      { key: "position", label: "Position", placeholder: "Eg. Finance Analyst", optional: true },
      { key: "stage", label: "Stage", type: "select", options: ["Screening", "Technical", "Panel", "Final"], placeholder: "Select stage", optional: true },
      { key: "assessor", label: "Assessor", type: "select", lookup: "employees", icon: "search-line", placeholder: "Select assessor", optional: true },
      { key: "status", label: "Status", type: "select", options: ["Pending", "Completed"], placeholder: "Select status", optional: true },
    ],
  },
  "Talent Pool": {
    title: "Talent Pool", subtitle: "Shortlisted and prospective candidates kept for future roles.",
    cta: "Add Candidate", noun: "Candidate", verb: "Add", hideStatus: true, hideSegment: true, hideActive: true,
    cols: [{ key: "name", label: "Candidate", type: "avatar" }, { key: "role", label: "Target Role" }, { key: "source", label: "Source" }, { key: "experience", label: "Experience" }, { key: "rating", label: "Rating" }, { key: "status", label: "Status", type: "badge" }],
    fields: [
      { key: "name", label: "Candidate", placeholder: "Full name", full: true },
      { key: "role", label: "Target Role", placeholder: "Eg. Marketing Lead", optional: true },
      { key: "source", label: "Source", type: "select", options: ["Referral", "LinkedIn", "Job Board", "Walk-in", "Agency"], placeholder: "Select source", optional: true },
      { key: "experience", label: "Experience", placeholder: "Eg. 5 yrs", optional: true },
      { key: "status", label: "Status", type: "select", options: ["Shortlisted", "Pending", "Rejected"], placeholder: "Select status", optional: true },
    ],
  },

  // ---------- Performance ----------
  "Objectives": {
    title: "Objectives", subtitle: "Strategic objectives that goals and KPIs roll up to.",
    cta: "Add Objective", noun: "Objective", verb: "Add", hideStatus: true, hideSegment: true, hideActive: true,
    cols: [{ key: "title", label: "Objective" }, { key: "perspective", label: "Perspective" }, { key: "owner", label: "Owner", type: "avatar" }, { key: "weight", label: "Weight" }, { key: "period", label: "Period" }, { key: "status", label: "Status", type: "badge" }],
    fields: [
      { key: "title", label: "Objective", placeholder: "Eg. Grow market share", full: true },
      { key: "perspective", label: "Perspective", type: "select", options: ["Financial", "Customer", "Internal Processes", "Learning & Growth"], placeholder: "Select perspective" },
      { key: "owner", label: "Owner", type: "select", lookup: "employees", icon: "search-line", placeholder: "Select owner", optional: true },
      { key: "weight", label: "Weight (%)", placeholder: "Eg. 25%", optional: true },
      { key: "period", label: "Period", type: "select", options: ["Quarter 1", "Quarter 2", "Quarter 3", "Quarter 4"], placeholder: "Select period", optional: true },
      { key: "status", label: "Status", type: "select", options: ["Draft", "Active", "Completed"], placeholder: "Select status", optional: true },
    ],
  },

  // ---------- System Administration ▸ Configuration ----------
  "KPI / Measures": {
    title: "KPIs / Measures", subtitle: "Define KPIs used to track performance and impact across objectives and appraisals.",
    cta: "Add KPIs", noun: "KPIs", verb: "Add", addTitle: "Add KPIs", hideStatus: true, hideSegment: true, hideActive: true, aiAssist: true, modalWidth: 560,
    cols: [{ key: "name", label: "KPIs" }, { key: "category", label: "Category" }, { key: "description", label: "Description" }],
    fields: [
      { key: "name", label: "KPIs Title", placeholder: "e.g. Employee Retention Rate", full: true },
      { key: "category", label: "Category", type: "select", options: ["Objective", "Employee Goal", "Task"], placeholder: "Select a category" },
      { key: "description", label: "Description", type: "textarea", placeholder: "Describe what this KPIs evaluates…", full: true },
    ],
  },

  // ---------- Core HR ----------
  "Reporting Managers": {
    title: "Reporting Managers", subtitle: "Reporting lines mapping employees to their managers.",
    cta: "Assign Manager", noun: "Reporting Line", verb: "Assign", hideStatus: true, hideSegment: true, hideActive: true,
    cols: [{ key: "employee", label: "Employee", type: "avatar" }, { key: "manager", label: "Reports To", type: "avatar" }, { key: "department", label: "Department" }, { key: "effective", label: "Effective" }],
    fields: [
      { key: "employee", label: "Employee", type: "select", lookup: "employees", icon: "search-line", placeholder: "Select employee" },
      { key: "manager", label: "Reports To", type: "select", lookup: "employees", icon: "search-line", placeholder: "Select manager" },
      { key: "department", label: "Department", type: "select", lookup: "departments", placeholder: "Select department", optional: true },
      { key: "effective", label: "Effective Date", placeholder: "DD / MM / YYYY", optional: true },
    ],
  },
};

const EXTRA_SEED = {
  "Hiring Requests": _rows([
    { position: "Finance Analyst", department: "Finance", grade: "Grade 2", requestedBy: "Franklin Brobbey", date: "04 Jan, 2025", status: "Approved" },
    { position: "Software Engineer", department: "Information Technology", grade: "Grade 2", requestedBy: "Bright Manu", date: "09 Jan, 2025", status: "Pending" },
    { position: "HR Officer", department: "Human Resource", grade: "Grade 2", requestedBy: "Emmanuel Ansah", date: "12 Jan, 2025", status: "Approved" },
    { position: "Marketing Lead", department: "Marketing", grade: "Grade 3", requestedBy: "Samuel Boateng", date: "15 Jan, 2025", status: "Pending" },
    { position: "Procurement Officer", department: "Operations", grade: "Grade 2", requestedBy: "Leslie Alexandre", date: "18 Jan, 2025", status: "Rejected" },
    { position: "Data Engineer", department: "Information Technology", grade: "Grade 3", requestedBy: "Bright Manu", date: "22 Jan, 2025", status: "Approved" },
    { position: "Accounts Payable Clerk", department: "Finance", grade: "Grade 1", requestedBy: "Franklin Brobbey", date: "27 Jan, 2025", status: "Pending" },
    { position: "Brand Designer", department: "Marketing", grade: "Grade 2", requestedBy: "Samuel Boateng", date: "31 Jan, 2025", status: "Approved" },
    { position: "Internal Auditor", department: "Finance", grade: "Grade 3", requestedBy: "Olivia Bennett", date: "03 Feb, 2025", status: "Pending" },
    { position: "Facilities Supervisor", department: "Operations", grade: "Grade 2", requestedBy: "Leslie Alexandre", date: "06 Feb, 2025", status: "Approved" },
  ]),
  "Job Requests": _rows([
    { title: "Software Engineer", department: "Information Technology", type: "Permanent", vacancies: "2", requestedBy: "Bright Manu", status: "Approved" },
    { title: "Finance Analyst", department: "Finance", type: "Permanent", vacancies: "1", requestedBy: "Franklin Brobbey", status: "Pending" },
    { title: "HR Officer", department: "Human Resource", type: "Permanent", vacancies: "1", requestedBy: "Emmanuel Ansah", status: "Approved" },
    { title: "Marketing Lead", department: "Marketing", type: "Permanent", vacancies: "1", requestedBy: "Samuel Boateng", status: "Pending" },
    { title: "Graduate Trainee", department: "Operations", type: "Internship", vacancies: "5", requestedBy: "Leslie Alexandre", status: "Approved" },
    { title: "Data Engineer", department: "Information Technology", type: "Contract", vacancies: "2", requestedBy: "Bright Manu", status: "Approved" },
    { title: "Procurement Officer", department: "Operations", type: "Permanent", vacancies: "1", requestedBy: "Leslie Alexandre", status: "Rejected" },
    { title: "Brand Designer", department: "Marketing", type: "Contract", vacancies: "1", requestedBy: "Samuel Boateng", status: "Pending" },
    { title: "Internal Auditor", department: "Finance", type: "Permanent", vacancies: "1", requestedBy: "Olivia Bennett", status: "Approved" },
    { title: "Customer Support Rep", department: "Operations", type: "Temporary", vacancies: "3", requestedBy: "Phoenix Carter", status: "Pending" },
  ]),
  "Job Posts": _rows([
    { title: "Senior Accountant", department: "Finance", location: "Accra — Main Office", applicants: "34", closing: "28 Feb, 2025", status: "Open" },
    { title: "Software Engineer", department: "Information Technology", location: "Accra — Main Office", applicants: "82", closing: "05 Mar, 2025", status: "Open" },
    { title: "HR Officer", department: "Human Resource", location: "Kumasi Branch", applicants: "21", closing: "20 Feb, 2025", status: "Closed" },
    { title: "Marketing Lead", department: "Marketing", location: "Accra — Main Office", applicants: "47", closing: "12 Mar, 2025", status: "Open" },
    { title: "Data Engineer", department: "Information Technology", location: "Remote — Ghana", applicants: "59", closing: "15 Mar, 2025", status: "Open" },
    { title: "Procurement Officer", department: "Operations", location: "Tema Depot", applicants: "12", closing: "18 Feb, 2025", status: "Draft" },
    { title: "Brand Designer", department: "Marketing", location: "Accra — Main Office", applicants: "38", closing: "22 Mar, 2025", status: "Open" },
    { title: "Internal Auditor", department: "Finance", location: "Accra — Main Office", applicants: "16", closing: "10 Mar, 2025", status: "Open" },
    { title: "Facilities Supervisor", department: "Operations", location: "Takoradi Branch", applicants: "9", closing: "08 Feb, 2025", status: "Closed" },
    { title: "Customer Support Rep", department: "Operations", location: "Kumasi Branch", applicants: "27", closing: "26 Mar, 2025", status: "Open" },
  ]),
  "Job Reopenings": _rows([
    { title: "HR Officer", department: "Human Resource", originalClose: "20 Feb, 2025", reopenedBy: "Emmanuel Ansah", status: "Open" },
    { title: "Facilities Supervisor", department: "Operations", originalClose: "08 Feb, 2025", reopenedBy: "Leslie Alexandre", status: "Open" },
    { title: "Procurement Officer", department: "Operations", originalClose: "18 Feb, 2025", reopenedBy: "Leslie Alexandre", status: "Pending" },
    { title: "Accounts Clerk", department: "Finance", originalClose: "01 Feb, 2025", reopenedBy: "Franklin Brobbey", status: "Open" },
    { title: "Junior Designer", department: "Marketing", originalClose: "25 Jan, 2025", reopenedBy: "Samuel Boateng", status: "Closed" },
    { title: "IT Support Officer", department: "Information Technology", originalClose: "30 Jan, 2025", reopenedBy: "Bright Manu", status: "Open" },
    { title: "Field Officer", department: "Operations", originalClose: "12 Jan, 2025", reopenedBy: "Phoenix Carter", status: "Pending" },
    { title: "Payroll Officer", department: "Finance", originalClose: "05 Feb, 2025", reopenedBy: "Olivia Bennett", status: "Open" },
    { title: "Receptionist", department: "Human Resource", originalClose: "28 Jan, 2025", reopenedBy: "Emmanuel Ansah", status: "Closed" },
    { title: "Warehouse Lead", department: "Operations", originalClose: "15 Feb, 2025", reopenedBy: "Leslie Alexandre", status: "Open" },
  ]),
  "Assessments": _rows([
    { candidate: "Daniel Quaye", position: "Software Engineer", stage: "Technical", assessor: "Bright Manu", score: "82%", status: "Completed" },
    { candidate: "Selina Owusu", position: "Finance Analyst", stage: "Panel", assessor: "Franklin Brobbey", score: "—", status: "Pending" },
    { candidate: "Michael Asare", position: "HR Officer", stage: "Screening", assessor: "Emmanuel Ansah", score: "74%", status: "Completed" },
    { candidate: "Grace Adjei", position: "Marketing Lead", stage: "Final", assessor: "Samuel Boateng", score: "88%", status: "Completed" },
    { candidate: "Kofi Boadu", position: "Data Engineer", stage: "Technical", assessor: "Bright Manu", score: "—", status: "Pending" },
    { candidate: "Linda Mensah", position: "Internal Auditor", stage: "Panel", assessor: "Olivia Bennett", score: "79%", status: "Completed" },
    { candidate: "Emmanuel Tetteh", position: "Procurement Officer", stage: "Screening", assessor: "Leslie Alexandre", score: "—", status: "Pending" },
    { candidate: "Patience Darko", position: "Brand Designer", stage: "Final", assessor: "Samuel Boateng", score: "91%", status: "Completed" },
    { candidate: "Joseph Nkrumah", position: "Software Engineer", stage: "Technical", assessor: "Bright Manu", score: "68%", status: "Completed" },
    { candidate: "Abena Sarpong", position: "Customer Support Rep", stage: "Screening", assessor: "Phoenix Carter", score: "—", status: "Pending" },
  ]),
  "Talent Pool": _rows([
    { name: "Daniel Quaye", role: "Software Engineer", source: "Referral", experience: "6 yrs", rating: "4.5", status: "Shortlisted" },
    { name: "Grace Adjei", role: "Marketing Lead", source: "LinkedIn", experience: "8 yrs", rating: "4.8", status: "Shortlisted" },
    { name: "Selina Owusu", role: "Finance Analyst", source: "Job Board", experience: "4 yrs", rating: "4.1", status: "Pending" },
    { name: "Kofi Boadu", role: "Data Engineer", source: "Referral", experience: "5 yrs", rating: "4.3", status: "Shortlisted" },
    { name: "Linda Mensah", role: "Internal Auditor", source: "Agency", experience: "7 yrs", rating: "4.0", status: "Pending" },
    { name: "Patience Darko", role: "Brand Designer", source: "LinkedIn", experience: "3 yrs", rating: "4.6", status: "Shortlisted" },
    { name: "Michael Asare", role: "HR Officer", source: "Walk-in", experience: "2 yrs", rating: "3.6", status: "Rejected" },
    { name: "Joseph Nkrumah", role: "Software Engineer", source: "Job Board", experience: "4 yrs", rating: "3.9", status: "Pending" },
    { name: "Abena Sarpong", role: "Customer Support Rep", source: "Referral", experience: "3 yrs", rating: "4.2", status: "Shortlisted" },
    { name: "Emmanuel Tetteh", role: "Procurement Officer", source: "Agency", experience: "9 yrs", rating: "4.4", status: "Pending" },
  ]),
  "Objectives": _rows([
    { title: "Grow net revenue by 12%", perspective: "Financial", owner: "Franklin Brobbey", weight: "30%", period: "Quarter 1", status: "Active" },
    { title: "Improve customer CSAT to 90%", perspective: "Customer", owner: "Phoenix Carter", weight: "20%", period: "Quarter 1", status: "Active" },
    { title: "Reduce month-end close to 3 days", perspective: "Internal Processes", owner: "Olivia Bennett", weight: "15%", period: "Quarter 1", status: "Completed" },
    { title: "Launch employee upskilling program", perspective: "Learning & Growth", owner: "Emmanuel Ansah", weight: "15%", period: "Quarter 1", status: "Active" },
    { title: "Cut operational cost by 8%", perspective: "Financial", owner: "Leslie Alexandre", weight: "20%", period: "Quarter 2", status: "Draft" },
    { title: "Increase digital adoption to 70%", perspective: "Customer", owner: "Bright Manu", weight: "25%", period: "Quarter 2", status: "Active" },
    { title: "Automate payroll reconciliation", perspective: "Internal Processes", owner: "Franklin Brobbey", weight: "10%", period: "Quarter 2", status: "Active" },
    { title: "Raise eNPS to +30", perspective: "Learning & Growth", owner: "Emmanuel Ansah", weight: "15%", period: "Quarter 2", status: "Draft" },
    { title: "Expand to 2 new branches", perspective: "Financial", owner: "Leslie Alexandre", weight: "20%", period: "Quarter 3", status: "Draft" },
    { title: "Achieve 95% policy compliance", perspective: "Internal Processes", owner: "Olivia Bennett", weight: "10%", period: "Quarter 3", status: "Active" },
  ]),
  "KPI / Measures": _rows([
    { name: "Revenue Growth", category: "Objective", description: "Year-on-year net revenue growth" },
    { name: "Cost-to-Income Ratio", category: "Objective", description: "Operating cost over income" },
    { name: "Customer Satisfaction", category: "Objective", description: "CSAT survey score" },
    { name: "Net Promoter Score", category: "Objective", description: "Customer NPS" },
    { name: "Process Cycle Time", category: "Task", description: "Average end-to-end process time" },
    { name: "First-Pass Yield", category: "Task", description: "Output passing without rework" },
    { name: "Training Hours", category: "Employee Goal", description: "Training hours per employee/yr" },
    { name: "Employee Engagement", category: "Employee Goal", description: "Engagement survey score" },
    { name: "Attrition Rate", category: "Employee Goal", description: "Voluntary turnover rate" },
    { name: "On-time Delivery", category: "Task", description: "Deliverables met on schedule" },
  ]),
  "Reporting Managers": _rows([
    { employee: "Ama Mensah", manager: "Leslie Alexandre", department: "Support Services", effective: "01 Jan, 2025" },
    { employee: "Kofi Owusu", manager: "Bright Manu", department: "Information Technology", effective: "01 Jan, 2025" },
    { employee: "James Brown", manager: "Leslie Alexandre", department: "Operations", effective: "15 Jan, 2025" },
    { employee: "Yaa Asantewaa", manager: "Olivia Bennett", department: "Operations", effective: "01 Feb, 2025" },
    { employee: "Phoenix Carter", manager: "Franklin Brobbey", department: "Finance", effective: "01 Jan, 2025" },
    { employee: "Lana Mensah", manager: "Samuel Boateng", department: "Marketing", effective: "10 Jan, 2025" },
    { employee: "Drew Asante", manager: "Bright Manu", department: "Information Technology", effective: "20 Jan, 2025" },
    { employee: "Demi Owusu", manager: "Emmanuel Ansah", department: "Human Resource", effective: "05 Feb, 2025" },
    { employee: "Olivia Bennett", manager: "Leslie Alexandre", department: "Finance", effective: "01 Jan, 2025" },
    { employee: "Bright Manu", manager: "Leslie Alexandre", department: "Information Technology", effective: "01 Jan, 2025" },
  ]),
};

Object.assign(window.CONFIGS, EXTRA_CONFIGS);
Object.assign(window.SEED, EXTRA_SEED);
