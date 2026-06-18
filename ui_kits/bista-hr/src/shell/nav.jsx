// BISTA HR — navigation model (mirrors navigationMain + navigationSettingsParent).
//
// A node may have:
//   tabs:     string[]  → rendered as the horizontal tab bar (showSubItemsAsTabs === true)
//   children: node[]    → rendered as a collapsible sidebar dropdown
//   (neither)           → a simple sidebar link / page
//
// `kind` tags how a section's pages render: "list" → CRUD table + empty state,
// "info" → analytics/info placeholder, "dashboard" → self-service area (Overview, My Info, …).

const NAV_MAIN = [
  { name: "Dashboard", icon: "dashboard-line", kind: "dashboard",
    tabs: ["Overview", "My Info", "Leave Requests", "Target Requests", "Appraisals", "My Learning", "Careers", "Requests"] },

  { name: "Reports & Analytics", icon: "pie-chart-2-line", kind: "info",
    tabs: ["Performance", "Leave"] },

  { name: "HR Management", icon: "building-4-line", kind: "list", children: [
    { name: "Core HR", tabs: ["Branches/Units", "Departments", "Job Titles", "Job Grades", "Zones", "Employees", "Reporting Managers", "Approvals"] },
    { name: "Leave Management", tabs: ["Leave Types", "Leave Allocations", "Leave Requests", "Leave Recalls", "Holidays", "Leave Balances"] },
    { name: "Employee Engagement", tabs: ["Disciplinary Cycle", "Accommodation", "Welfare", "Protocols"] },
    { name: "Recruitment", tabs: ["Hiring Requests", "Job Posts", "Assessments"] },
    { name: "Talent Acquisition" },
    { name: "Onboarding" },
    { name: "People & Culture", tabs: ["Promotions", "Transfers", "Job Title", "Employee Exit"] },
  ]},

  { name: "Performance", icon: "award-line", kind: "list",
    tabs: ["Department Perspectives", "Goal Setting", "Objectives", "Performance Appraisals", "Portfolio of Evidence", "360 Feedback", "Moderation", "IDP", "PIP"] },

  // { name: "Learning & Development", icon: "graduation-cap-line", kind: "list",
  //   tabs: ["Needs Assessment", "Program Catalog", "Enrollment", "Evaluation", "Courses", "Analytics"] },
];

const NAV_ADMIN = { name: "System Administration", icon: "settings-3-line", kind: "list", children: [
  { name: "Configuration", tabs: ["Corporate Perspectives", "Competencies", "KPI / Measures", "Periods", "Performance Ratings"] },
  { name: "User Management", tabs: ["Roles", "Users"] },
  { name: "Organization" },
]};

const tabsFor = (node) => (node && node.tabs ? node.tabs : null);

// default landing: HR Management ▸ Core HR ▸ Departments
const CORE_HR = NAV_MAIN[2].children[0];

Object.assign(window, { NAV_MAIN, NAV_ADMIN, tabsFor, CORE_HR });
