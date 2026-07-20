// BISTA HR · crud/config — entity configs + seed data + a generic config factory.
// Each entity config: { title, subtitle, cta, noun, cols[], fields[] }.
// A field: { key, label, placeholder, type?: 'select'|'multiselect'|'textarea', lookup?, options?, optional?, full?, icon? }.
// `lookup` references a key in window.LOOKUPS; `options` is an inline list (string[] or {value,label,image}[]).
// Fields are required unless `optional` is true (used to enable/disable the submit button).

const CONFIGS = {
  // ---- Department — modelled on the Figma "Adding Department" flow ----
  "Departments": {
    title: "Departments", subtitle: "Manage your organization's departments.", cta: "Add Department", noun: "Department", emptyVariant: "place",
    cols: [
      { key: "name", label: "Name" }, { key: "code", label: "Code" },
      { key: "orgUnit", label: "Organizational Unit" }, { key: "head", label: "Head of Department" },
    ],
    fields: [
      { key: "name", label: "Name", placeholder: "Enter department name" },
      { key: "code", label: "Code", placeholder: "Enter department code" },
      { key: "head", label: "Head of Department", type: "select", icon: "search-line",
        lookup: "employees", placeholder: "Select an employee", optional: true },
      { key: "orgUnit", label: "Organizational Unit", type: "select",
        lookup: "orgUnits", placeholder: "Select an organizational unit", optional: true },
      { key: "description", label: "Description", type: "textarea", placeholder: "Enter description", full: true, optional: true },
    ],
  },
  "Job Grades": {
    title: "Job Grades", subtitle: "Manage your organization's job grades.", cta: "Create Job Grade", noun: "Job Grade",
    // Grade column: legacy grades saved without a level (backend still calls it "level")
    // render a clickable "Add Grade" tag that opens the edit form on that row.
    cols: [{ key: "name", label: "Name" }, { key: "level", label: "Grade", type: "missing-tag", missingLabel: "Add Grade" }, { key: "code", label: "Code", fallback: "Not Set" }, { key: "notches", label: "Notches", type: "count" }],
    fields: [
      // Grade (was "Level") comes FIRST: it is the unique key. Picking it auto-fills an empty
      // Name as "Grade {n}" (fillTarget/fillTemplate); a duplicate grade raises an inline error.
      { key: "level", label: "Grade", type: "number", min: 1, placeholder: "1", unique: true, uniqueError: "Grade {value} already exists.", fillTarget: "name", fillTemplate: "Grade {value}" },
      // Name in turn auto-fills an empty Code with its initials (e.g. "Senior Executive" → "SE").
      { key: "name", label: "Name", placeholder: "Grade 1", fillTarget: "code", fillInitials: true },
      { key: "notches", label: "Notches", type: "notches", full: true, optional: true },
      { key: "description", label: "Description", type: "textarea", placeholder: "Highest grade level for senior executives", full: true },
      // Code stays optional in the UI (initials are the fallback) but the backend requires it
      // and rejects anything outside [A-Za-z0-9_-] — validated live so Zod never surprises.
      { key: "code", label: "Code", placeholder: "GA", optional: true, pattern: "^[A-Za-z0-9_-]+$", patternError: "Code can only contain letters, numbers, hyphens, and underscores" },
    ],
  },
  "Branches/Units": {
    title: "Organizational Units", subtitle: "Manage your organization's structure and hierarchy.",
    cta: "Create Unit/Branch", noun: "Unit/Branch", emptyVariant: "place",
    hideSegment: true,                               // Figma list: Search + Show Filter, no status segment
    headerAction: { key: "orgTree", label: "View Organizational Tree", icon: "node-tree" },
    cols: [
      { key: "name", label: "Name" },
      { key: "head", label: "Unit Head", type: "avatar" },
      { key: "type", label: "Type" },
      { key: "department", label: "Department" },
      { key: "level", label: "Hierarchy Level" },
    ],
    fields: [
      { key: "name", label: "Name", placeholder: "Enter branch name" },
      { key: "head", label: "Unit/Branch Head", type: "select", lookup: "employees", icon: "search-line", placeholder: "Select a staff", optional: true },
      { key: "department", label: "Department", type: "select", lookup: "departments", placeholder: "Select department", optional: true },
      { key: "city", label: "City", placeholder: "Enter city", optional: true },
      { key: "country", label: "Country", type: "select", lookup: "countries", placeholder: "Select a country", optional: true },
      { key: "zone", label: "Zone", type: "select", lookup: "zones", placeholder: "Select a zone", optional: true },
      { key: "code", label: "Code", placeholder: "Enter code", optional: true },
      { key: "costCenter", label: "Cost Center Code", type: "select", lookup: "zones", placeholder: "Select a zone", optional: true },
      { key: "description", label: "Description", type: "textarea", placeholder: "Enter description", full: true, optional: true },
    ],
  },
  "Job Titles": {
    title: "Job Titles", subtitle: "Manage designations across your organization.", cta: "Add Job Title", noun: "Job Title",
    addTitle: "Create Job Title", verb: "Create",
    cols: [{ key: "name", label: "Name" }, { key: "code", label: "Code" }, { key: "department", label: "Department", fallback: "—" }, { key: "grade", label: "Job Grade", fallback: "—" }],
    fields: [
      { key: "name", label: "Name", placeholder: "Senior Software Engineer" },
      { key: "code", label: "Code", placeholder: "SSE" },
      { key: "department", label: "Department", type: "select", lookup: "departments", placeholder: "Select a department (optional)", optional: true },
      { key: "grade", label: "Job Grade", type: "select", lookup: "jobGrades", placeholder: "Select a job grade (optional)", optional: true },
      { key: "description", label: "Description", type: "textarea", placeholder: "Responsible for developing and maintaining software applications", full: true },
    ],
  },
  "Zones": {
    title: "Zones", subtitle: "Manage your organization's zones.", cta: "Create Zone", noun: "Zone", emptyVariant: "place",
    hideStatus: true, hideSegment: true,            // Figma Zones list shows only Name + Code (no Status column / status filter)
    menu: [{ key: "viewBranches", label: "View Branches", icon: "git-branch-line" }],
    cols: [{ key: "name", label: "Name" }, { key: "code", label: "Code" }],
    fields: [
      { key: "name", label: "Name", placeholder: "Enter zone name" },
      { key: "code", label: "Code", placeholder: "Enter zone code" },
      { key: "description", label: "Description", type: "textarea", placeholder: "Enter description", full: true, optional: true },
    ],
  },
  "Employees": {
    title: "Employees", subtitle: "Manage all your employees.", cta: "Add Employee", noun: "Employee",
    cols: [{ key: "name", label: "Full Name" }, { key: "code", label: "Employee ID" }, { key: "email", label: "Email" }, { key: "role", label: "Role" }, { key: "dept", label: "Dept/Unit" }, { key: "branch", label: "Branch" }],
    fields: [
      { key: "name", label: "Full Name", placeholder: "Enter full name" },
      { key: "code", label: "Employee ID", placeholder: "Enter employee ID" },
      { key: "email", label: "Email", placeholder: "Enter email address", optional: true },
      { key: "role", label: "Role", type: "select", lookup: "roles", placeholder: "Select role", optional: true },
      { key: "dept", label: "Department", type: "select", lookup: "departments", placeholder: "Select department", optional: true },
      { key: "branch", label: "Branch", type: "select", lookup: "branches", placeholder: "Select branch", optional: true },
    ],
  },

  // ---- System Administration ▸ Configurations (Figma) ----
  "Corporate Perspectives": {
    title: "Corporate Perspectives", subtitle: "Manage strategic perspectives and company goal categories for performance evaluations.",
    cta: "Add Perspective", noun: "Perspective", verb: "Add", addTitle: "Add Perspective",
    subtitle: "Create a new strategic perspective for company goal categories.",
    hideStatus: true, hideSegment: true, hideActive: true, aiAssist: true, modalWidth: 560,
    cols: [{ key: "name", label: "Perspective" }, { key: "description", label: "Description" }],
    fields: [
      { key: "name", label: "Perspective", placeholder: "e.g. Financial, Customer, Operational, Innovation", full: true },
      { key: "description", label: "Description", type: "textarea", placeholder: "Describe the perspective", full: true },
    ],
  },
  "Periods": {
    title: "Periods", subtitle: "Define and manage time periods for organizing appraisals and reports.",
    cta: "Add Period", noun: "Period", verb: "Add", addTitle: "Add Period",
    hideSegment: true, aiAssist: true, modalWidth: 560, activeLabel: "Set as Active Period",
    cols: [{ key: "name", label: "Period" }, { key: "startDate", label: "Start Date" }, { key: "endDate", label: "End Date" }, { key: "description", label: "Description" }],
    fields: [
      { key: "name", label: "Period Name", placeholder: "e.g. Q1 2024, Summer Term, FY 2024", full: true },
      { key: "startDate", label: "Start Date", type: "date", placeholder: "Pick a start date" },
      { key: "endDate", label: "End Date", type: "date", placeholder: "Pick an end date" },
      { key: "description", label: "Description", type: "textarea", placeholder: "Describe what this period covers (e.g. goals, coverage, notes)…", full: true },
    ],
  },
  "Employee Goals": {
    title: "Employee Goals", subtitle: "Define Employee Goals that can be applied to objectives and EMPLOYEE GOALs.",
    cta: "Add KPI", noun: "KPI", verb: "Add",
    hideStatus: true, hideSegment: true, hideActive: true, aiAssist: true, modalWidth: 560,
    cols: [{ key: "name", label: "KPI" }, { key: "description", label: "Description" }],
    fields: [
      { key: "name", label: "KPI Title", placeholder: "Eg. Quality", full: true },
      { key: "description", label: "Description", type: "textarea", placeholder: "Enter description", full: true, optional: true },
    ],
  },

  // ---- Performance (manager) — approximated with the shared CRUD + status badges ----
  "Department Perspectives": {
    title: "Department Perspectives", subtitle: "Manage perspectives and their weighting for departmental scorecards.",
    cta: "Add Perspective", noun: "Perspective", verb: "Add", hideStatus: true, hideSegment: true, hideActive: true, modalWidth: 560,
    cols: [{ key: "name", label: "Name" }, { key: "description", label: "Description" }, { key: "weight", label: "Weight" }],
    fields: [
      { key: "name", label: "Perspective Name", placeholder: "Eg. Financial", full: true },
      { key: "description", label: "Description", type: "textarea", placeholder: "Describe this perspective", full: true, optional: true },
      { key: "weight", label: "Weight (%)", placeholder: "Eg. 25%", optional: true },
    ],
  },
  "Goal Setting": {
    title: "Goal Setting", subtitle: "Define and track employee goals across perspectives.",
    cta: "Add Goal", noun: "Goal", verb: "Add", hideStatus: true, hideSegment: true, hideActive: true,
    cols: [{ key: "employee", label: "Employee", type: "avatar" }, { key: "goal", label: "Goal" }, { key: "perspective", label: "Perspective" }, { key: "weight", label: "Weight" }, { key: "status", label: "Status", type: "badge" }],
    fields: [
      { key: "employee", label: "Employee", type: "select", lookup: "employees", icon: "search-line", placeholder: "Select an employee" },
      { key: "goal", label: "Goal", placeholder: "Describe the goal", full: true },
      { key: "perspective", label: "Perspective", type: "select", options: ["Financial", "Customer", "Internal Processes", "Learning & Growth"], placeholder: "Select perspective", optional: true },
      { key: "weight", label: "Weight (%)", placeholder: "Eg. 20%", optional: true },
      { key: "status", label: "Status", type: "select", options: ["Draft", "Pending", "Approved", "Completed"], placeholder: "Select status", optional: true },
    ],
  },
  "Performance Appraisals": {
    title: "Performance Appraisals", subtitle: "Review and manage employee performance appraisals.",
    cta: "New Appraisal", noun: "Appraisal", verb: "Create", hideStatus: true, hideSegment: true, hideActive: true,
    cols: [{ key: "employee", label: "Employee", type: "avatar" }, { key: "period", label: "Period" }, { key: "department", label: "Department" }, { key: "score", label: "Score" }, { key: "status", label: "Status", type: "badge" }],
    fields: [
      { key: "employee", label: "Employee", type: "select", lookup: "employees", icon: "search-line", placeholder: "Select an employee" },
      { key: "period", label: "Period", type: "select", options: ["Quarter 1", "Quarter 2", "Quarter 3", "Quarter 4"], placeholder: "Select period" },
      { key: "department", label: "Department", type: "select", lookup: "departments", placeholder: "Select department", optional: true },
      { key: "score", label: "Score", placeholder: "Eg. 4.2 / 5", optional: true },
      { key: "status", label: "Status", type: "select", options: ["Draft", "Pending", "Completed"], placeholder: "Select status", optional: true },
    ],
  },
  "Portfolio of Evidence": {
    title: "Portfolio of Evidence", subtitle: "Evidence submitted to support performance and competency assessments.",
    cta: "Add Evidence", noun: "Evidence", verb: "Add", hideStatus: true, hideSegment: true, hideActive: true,
    cols: [{ key: "employee", label: "Employee", type: "avatar" }, { key: "title", label: "Title" }, { key: "type", label: "Type" }, { key: "date", label: "Date" }, { key: "status", label: "Status", type: "badge" }],
    fields: [
      { key: "employee", label: "Employee", type: "select", lookup: "employees", icon: "search-line", placeholder: "Select an employee" },
      { key: "title", label: "Title", placeholder: "Eg. Project Completion Certificate", full: true },
      { key: "type", label: "Type", type: "select", options: ["Certificate", "Project", "Award", "Report", "Other"], placeholder: "Select type", optional: true },
      { key: "date", label: "Date", placeholder: "DD / MM / YYYY", optional: true },
      { key: "status", label: "Status", type: "select", options: ["Pending", "Approved", "Rejected"], placeholder: "Select status", optional: true },
    ],
  },
  "360 Feedback": {
    title: "360 Feedback", subtitle: "Multi-rater feedback collected for employee evaluations.",
    cta: "Request Feedback", noun: "Feedback Request", verb: "Request", hideStatus: true, hideSegment: true, hideActive: true,
    cols: [{ key: "employee", label: "Employee", type: "avatar" }, { key: "reviewer", label: "Reviewer" }, { key: "relationship", label: "Relationship" }, { key: "status", label: "Status", type: "badge" }],
    fields: [
      { key: "employee", label: "Employee", type: "select", lookup: "employees", icon: "search-line", placeholder: "Select an employee" },
      { key: "reviewer", label: "Reviewer", type: "select", lookup: "employees", placeholder: "Select reviewer" },
      { key: "relationship", label: "Relationship", type: "select", options: ["Manager", "Peer", "Direct Report", "Self", "External"], placeholder: "Select relationship", optional: true },
      { key: "status", label: "Status", type: "select", options: ["Pending", "Completed"], placeholder: "Select status", optional: true },
    ],
  },
  "Moderation": {
    title: "Moderation", subtitle: "Calibrate and moderate appraisal scores across departments.",
    cta: "Add Moderation", noun: "Moderation", verb: "Add", hideStatus: true, hideSegment: true, hideActive: true,
    cols: [{ key: "employee", label: "Employee", type: "avatar" }, { key: "department", label: "Department" }, { key: "initial", label: "Initial Score" }, { key: "moderated", label: "Moderated Score" }, { key: "status", label: "Status", type: "badge" }],
    fields: [
      { key: "employee", label: "Employee", type: "select", lookup: "employees", icon: "search-line", placeholder: "Select an employee" },
      { key: "department", label: "Department", type: "select", lookup: "departments", placeholder: "Select department", optional: true },
      { key: "initial", label: "Initial Score", placeholder: "Eg. 4.0", optional: true },
      { key: "moderated", label: "Moderated Score", placeholder: "Eg. 4.2", optional: true },
      { key: "status", label: "Status", type: "select", options: ["Pending", "Completed"], placeholder: "Select status", optional: true },
    ],
  },
  "IDP": {
    title: "Individual Development Plans", subtitle: "Track development plans agreed during appraisals.",
    cta: "Add Plan", noun: "Development Plan", verb: "Add", hideStatus: true, hideSegment: true, hideActive: true,
    cols: [{ key: "employee", label: "Employee", type: "avatar" }, { key: "focus", label: "Focus Area" }, { key: "target", label: "Target Date" }, { key: "status", label: "Status", type: "badge" }],
    fields: [
      { key: "employee", label: "Employee", type: "select", lookup: "employees", icon: "search-line", placeholder: "Select an employee" },
      { key: "focus", label: "Focus Area", placeholder: "Eg. Leadership skills", full: true },
      { key: "target", label: "Target Date", placeholder: "DD / MM / YYYY", optional: true },
      { key: "status", label: "Status", type: "select", options: ["Draft", "Pending", "Completed"], placeholder: "Select status", optional: true },
    ],
  },
  "PIP": {
    title: "Performance Improvement Plans", subtitle: "Manage improvement plans for under-performing employees.",
    cta: "Add Plan", noun: "Improvement Plan", verb: "Add", hideStatus: true, hideSegment: true, hideActive: true,
    cols: [{ key: "employee", label: "Employee", type: "avatar" }, { key: "reason", label: "Reason" }, { key: "start", label: "Start Date" }, { key: "review", label: "Review Date" }, { key: "status", label: "Status", type: "badge" }],
    fields: [
      { key: "employee", label: "Employee", type: "select", lookup: "employees", icon: "search-line", placeholder: "Select an employee" },
      { key: "reason", label: "Reason", placeholder: "Reason for the plan", full: true },
      { key: "start", label: "Start Date", placeholder: "DD / MM / YYYY", optional: true },
      { key: "review", label: "Review Date", placeholder: "DD / MM / YYYY", optional: true },
      { key: "status", label: "Status", type: "select", options: ["Pending", "Completed", "Closed"], placeholder: "Select status", optional: true },
    ],
  },
};

const SEED = {
  // Department seed mirrors the Figma list exactly
  "Departments": [
    { id: 1, name: "Finance", code: "FIN", orgUnit: "Operations", head: "Franklin Brobbey", active: true },
    { id: 2, name: "Human Resource", code: "HR", orgUnit: "Operations", head: "Emmanuel Ansah", active: true },
    { id: 3, name: "Information Technology", code: "IT", orgUnit: "Technology", head: "Bright Manu", active: true },
    { id: 4, name: "Marketing", code: "MKT", orgUnit: "Technology", head: "Samuel Boateng", active: true },
  ],
  "Job Grades": [
    { id: 1, name: "Grade 1", code: "G1", level: "1", notches: [1, 2, 3], description: "Entry-level grade for junior staff.", active: true },
    { id: 2, name: "Grade 2", code: "G2", level: "2", notches: [1, 2, 3, 4], description: "Standard professional grade.", active: true },
    { id: 3, name: "Grade 3", code: "G3", level: "3", notches: [1, 2, 3, 4, 5], description: "Senior professional grade.", active: true },
    { id: 4, name: "Grade 4", code: "G4", level: "4", notches: [1, 2, 3, 4, 5, 6], description: "Management grade for department heads.", active: false },
    { id: 5, name: "Senior Executive", code: "SE", level: "", notches: [1, 2, 3], description: "Legacy grade added before grade levels were required.", active: true },
  ],
  "Branches/Units": [
    { id: 1, name: "Executive Management", head: "Leslie Alexandre", type: "Management", department: "N/A", level: "1", active: true },
    { id: 2, name: "Operations", head: "Leslie Alexandre", type: "Department", department: "N/A", level: "2", active: true },
    { id: 3, name: "Support Services", head: "Leslie Alexandre", type: "Unit", department: "N/A", level: "2", active: true },
    { id: 4, name: "Technology", head: "Leslie Alexandre", type: "Department", department: "N/A", level: "2", active: true },
  ],
  "Job Titles": [
    { id: 1, name: "Software Engineer", code: "SWE", department: "Information Technology", grade: "Grade 2", notch: "Notch 1", description: "Develops and maintains software applications.", active: true },
    { id: 2, name: "Data Scientist", code: "DSC", department: "Information Technology", grade: "Grade 3", notch: "Notch 1", description: "Builds models and analytics from organizational data.", active: true },
    { id: 3, name: "HR Manager", code: "HRM", department: "Human Resource", grade: "Grade 3", notch: "Notch 1", description: "Leads HR operations and people management.", active: true },
    { id: 4, name: "HR Officer", code: "HRO", department: "Human Resource", grade: "Grade 2", notch: "Notch 1", description: "Supports day-to-day HR administration.", active: true },
    { id: 5, name: "Finance Analyst", code: "FAN", department: "Finance", grade: "Grade 2", notch: "Notch 1", description: "Analyzes financial data and prepares reports.", active: true },
    { id: 6, name: "Accountant", code: "ACC", department: "Finance", grade: "Grade 2", notch: "Notch 2", description: "Maintains ledgers and financial records.", active: true },
    { id: 7, name: "Marketing Lead", code: "MKL", department: "Marketing", grade: "Grade 3", notch: "Notch 1", description: "Owns campaigns and brand strategy.", active: true },
    { id: 8, name: "Sales Officer", code: "SLO", department: "Marketing", grade: "Grade 1", notch: "Notch 1", description: "Drives sales and customer acquisition.", active: true },
  ],
  "Zones": [
    { id: 1, name: "West Zone", code: "West", active: true },
    { id: 2, name: "Central Zones", code: "Central", active: true },
    { id: 3, name: "East Zone", code: "East", active: true },
    { id: 4, name: "North Zone", code: "North", active: true },
    { id: 5, name: "South Zone", code: "South", active: true },
  ],
  "Employees": [
    { id: 1, name: "Ama Mensah", code: "EMP-001", orgUnit: "Support Services", title: "Manager", active: true },
    { id: 2, name: "Kofi Owusu", code: "EMP-002", orgUnit: "Technology", title: "Engineer", active: true },
    { id: 3, name: "James Brown", code: "EMP-003", orgUnit: "Operations", title: "Analyst", active: true },
    { id: 4, name: "Yaa Asantewaa", code: "EMP-004", orgUnit: "Operations", title: "Officer", active: false },
  ],
  "Corporate Perspectives": [
    { id: 1, name: "Financial", description: "Revenue growth and cost management", active: true },
    { id: 2, name: "Customer", description: "Customer satisfaction and service excellence", active: true },
    { id: 3, name: "Internal Processes", description: "Employee development and innovation", active: true },
    { id: 4, name: "Organizational Capacity", description: "Operational efficiency and quality", active: true },
  ],
  "Periods": [
    { id: 1, name: "Quarter 1", startDate: "03 Jan, 2025", endDate: "31 Mar, 2025", description: "Appraisal period for first quarter", active: true },
    { id: 2, name: "Quarter 2", startDate: "01 Apr, 2025", endDate: "30 Jun, 2025", description: "Appraisal period for second quarter", active: true },
    { id: 3, name: "Quarter 3", startDate: "01 Jul, 2025", endDate: "31 Sept, 2025", description: "Appraisal period for third quarter", active: true },
  ],
  "Employee Goals": [
    { id: 1, name: "Quality", description: "Appraisal period for first quarter", active: true },
    { id: 2, name: "Efficiency", description: "Appraisal period for second quarter", active: true },
    { id: 3, name: "Speed", description: "Appraisal period for third quarter", active: true },
  ],
  "Department Perspectives": [
    { id: 1, name: "Financial", description: "Revenue growth and cost management", weight: "25%", active: true },
    { id: 2, name: "Customer", description: "Customer satisfaction and service excellence", weight: "25%", active: true },
    { id: 3, name: "Internal Processes", description: "Operational efficiency and quality", weight: "25%", active: true },
    { id: 4, name: "Learning & Growth", description: "Employee development and innovation", weight: "25%", active: true },
  ],
  "Goal Setting": [
    { id: 1, employee: "Leslie Alexandre", goal: "Increase quarterly revenue by 12%", perspective: "Financial", weight: "30%", status: "Approved", active: true },
    { id: 2, employee: "Olivia Bennett", goal: "Reduce month-end close to 3 days", perspective: "Internal Processes", weight: "20%", status: "Pending", active: true },
    { id: 3, employee: "Phoenix Carter", goal: "Improve customer CSAT to 90%", perspective: "Customer", weight: "25%", status: "Draft", active: true },
  ],
  "Performance Appraisals": [
    { id: 1, employee: "Leslie Alexandre", period: "Quarter 1", department: "Human Resource", score: "4.2 / 5", status: "Completed", active: true },
    { id: 2, employee: "Olivia Bennett", period: "Quarter 1", department: "Finance", score: "3.8 / 5", status: "Pending", active: true },
    { id: 3, employee: "Phoenix Carter", period: "Quarter 1", department: "Finance", score: "—", status: "Draft", active: true },
    { id: 4, employee: "Lana Mensah", period: "Quarter 1", department: "Marketing", score: "4.5 / 5", status: "Completed", active: true },
  ],
  "Portfolio of Evidence": [
    { id: 1, employee: "Leslie Alexandre", title: "Leadership Workshop Certificate", type: "Certificate", date: "12 Mar, 2025", status: "Approved", active: true },
    { id: 2, employee: "Phoenix Carter", title: "Q1 Cost-saving Project", type: "Project", date: "28 Mar, 2025", status: "Pending", active: true },
    { id: 3, employee: "Lana Mensah", title: "Sales Excellence Award", type: "Award", date: "02 Apr, 2025", status: "Approved", active: true },
  ],
  "360 Feedback": [
    { id: 1, employee: "Leslie Alexandre", reviewer: "Olivia Bennett", relationship: "Peer", status: "Completed", active: true },
    { id: 2, employee: "Leslie Alexandre", reviewer: "James Brown", relationship: "Manager", status: "Pending", active: true },
    { id: 3, employee: "Lana Mensah", reviewer: "Demi Owusu", relationship: "Direct Report", status: "Pending", active: true },
  ],
  "Moderation": [
    { id: 1, employee: "Leslie Alexandre", department: "Human Resource", initial: "4.0", moderated: "4.2", status: "Completed", active: true },
    { id: 2, employee: "Olivia Bennett", department: "Finance", initial: "3.6", moderated: "—", status: "Pending", active: true },
  ],
  "IDP": [
    { id: 1, employee: "Phoenix Carter", focus: "Financial modelling", target: "30 Jun, 2025", status: "Pending", active: true },
    { id: 2, employee: "Lana Mensah", focus: "Team leadership", target: "31 Aug, 2025", status: "Draft", active: true },
  ],
  "PIP": [
    { id: 1, employee: "Drew Asante", reason: "Consistent target shortfall", start: "01 Apr, 2025", review: "30 Jun, 2025", status: "Pending", active: true },
  ],
};

function singularize(s) {
  if (/ies$/.test(s)) return s.replace(/ies$/, "y");
  if (/ses$/.test(s)) return s.replace(/es$/, "");
  if (/s$/.test(s) && !/ss$/.test(s)) return s.replace(/s$/, "");
  return s;
}
function genConfig(name) {
  const noun = singularize(name);
  return {
    title: name, subtitle: `Manage your organization's ${name.toLowerCase()}.`,
    cta: `Add ${noun}`, noun,
    cols: [{ key: "name", label: "Name" }, { key: "code", label: "Reference" }],
    fields: [
      { key: "name", label: "Name", placeholder: `Enter ${noun.toLowerCase()} name` },
      { key: "code", label: "Reference", placeholder: "Enter reference", optional: true },
      { key: "description", label: "Description", type: "textarea", placeholder: "Enter description", full: true, optional: true },
    ],
  };
}

Object.assign(window, { CONFIGS, SEED, genConfig, singularize });
