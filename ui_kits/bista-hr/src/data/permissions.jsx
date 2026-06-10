// BISTA HR · data/permissions — data-driven RBAC model.
//
// Mirrors the real app's permission scheme: granular "Resource:Action" strings
// (e.g. "Employees:Read", "Departments:Create") bundled into ROLES. Roles are
// stored in a reactive store so the demo can switch the signed-in role live AND
// so new roles/permissions can be created from System Administration ▸ Roles.
//
//   window.RBAC.resources   → catalog of resources (grouped) + their actions
//   window.RBAC.allPerms     → every "Resource:Action" string
//   window.RBAC.defaultRoles → the six seeded roles (extensible)
//   window.RBAC.pageRes      → nav page/tab name → resource key (read-gating)
//   helpers: can / canRead / tabAllowed / firstAllowedTab / permsForRole
//   window.HRStores.rbac     → { roleId, roles } reactive store
//
// Gating policy (chosen for the cleanest demo): blocked nav items & tabs are
// HIDDEN; in-page Add/Edit/Archive buttons are hidden when the role lacks the
// matching Create/Update/Delete permission; a hard nav to a blocked area shows
// the /forbidden screen.

const ACTIONS_CRUD = ["Read", "Create", "Update", "Delete"];

// ---- Resource catalog (grouped — drives the Roles permission matrix) --------
const RESOURCES = [
  // Dashboard / self-service
  { key: "Dashboard",         label: "Dashboard & Self-Service", group: "Dashboard",      actions: ["Read"] },
  { key: "DashboardReport",   label: "Leave Reports",            group: "Dashboard",      actions: ["Read"] },
  { key: "PerformanceReports",label: "Performance Reports",      group: "Dashboard",      actions: ["Read"] },

  // Organization structure
  { key: "Departments",       label: "Departments",              group: "Organization",   actions: ACTIONS_CRUD },
  { key: "Designations",      label: "Job Titles / Designations",group: "Organization",   actions: ACTIONS_CRUD },
  { key: "OrganizationalUnits",label: "Branches / Units",        group: "Organization",   actions: ACTIONS_CRUD },
  { key: "JobGrades",         label: "Job Grades",               group: "Organization",   actions: ACTIONS_CRUD },
  { key: "Zones",             label: "Zones",                    group: "Organization",   actions: ACTIONS_CRUD },

  // Employees
  { key: "Employees",         label: "Employees",                group: "Employees",      actions: ACTIONS_CRUD },
  { key: "ESS_Change_Requests",label: "ESS Change Requests",     group: "Employees",      actions: ["Read", "Create", "Update", "Delete", "Approve"] },

  // Leave
  { key: "LeaveTypes",        label: "Leave Types & Holidays",   group: "Leave",          actions: ACTIONS_CRUD },
  { key: "LeaveRequests",     label: "Leave Requests & Balances",group: "Leave",          actions: ["Read", "Create", "Update", "Delete", "Approve"] },
  { key: "LeaveAllocations",  label: "Leave Allocations",        group: "Leave",          actions: ["Read", "Create", "Update"] },
  { key: "LeaveRecalls",      label: "Leave Recalls",            group: "Leave",          actions: ACTIONS_CRUD },

  // Engagement
  { key: "DisciplinaryCases", label: "Disciplinary Cases",       group: "Engagement",     actions: ACTIONS_CRUD },
  { key: "Accommodations",    label: "Accommodations",           group: "Engagement",     actions: ["Read", "Create", "Update", "Delete", "Assign"] },
  { key: "Circulars",         label: "Welfare / Circulars",      group: "Engagement",     actions: ["Read", "Create", "Update", "Delete", "Approve"] },
  { key: "Protocol",          label: "Protocols",                group: "Engagement",     actions: ACTIONS_CRUD },

  // Recruitment
  { key: "HiringRequests",    label: "Hiring Requests",          group: "Recruitment",    actions: ["Read", "Create", "Update", "Approve", "Delete"] },
  { key: "JobRequests",       label: "Job Requests",             group: "Recruitment",    actions: ["Read", "Create", "Update", "Approve", "Delete"] },
  { key: "JobPostings",       label: "Job Posts & Reopenings",   group: "Recruitment",    actions: ["Read", "Create", "Update", "Delete", "Close"] },
  { key: "JobApplications",   label: "Talent Pool / Applications",group: "Recruitment",   actions: ["Read", "Shortlist", "Reject"] },
  { key: "AssessorInterviews",label: "Assessments",              group: "Recruitment",    actions: ["Read", "Submit"] },

  // People & Culture
  { key: "Promotions",        label: "Promotions",               group: "People & Culture", actions: ACTIONS_CRUD },
  { key: "Transfers",         label: "Transfers",                group: "People & Culture", actions: ACTIONS_CRUD },
  { key: "Exits",             label: "Employee Exit",            group: "People & Culture", actions: ACTIONS_CRUD },

  // Performance / appraisals
  { key: "TargetRequests",    label: "Goal Setting / Targets",   group: "Performance",    actions: ["Read", "Create", "Update", "Delete", "Approve"] },
  { key: "PerformanceAppraisals",label: "Appraisals / IDP / PIP",group: "Performance",    actions: ["Read", "Create", "Update", "Delete", "Approve"] },
  { key: "Moderations",       label: "Moderation",               group: "Performance",    actions: ["Read", "Create"] },
  { key: "PortfolioOfEvidence",label: "Portfolio of Evidence",   group: "Performance",    actions: ACTIONS_CRUD },
  { key: "AppraisalAssignments",label: "360 Feedback",           group: "Performance",    actions: ["Read", "Create"] },
  { key: "Objectives",        label: "Objectives",               group: "Performance",    actions: ACTIONS_CRUD },

  // Configuration
  { key: "Perspectives",      label: "Perspectives",             group: "Configuration",  actions: ACTIONS_CRUD },
  { key: "Competencies",      label: "Competencies",             group: "Configuration",  actions: ACTIONS_CRUD },
  { key: "Periods",           label: "Periods",                  group: "Configuration",  actions: ACTIONS_CRUD },
  { key: "Measures",          label: "KPIs / Measures",          group: "Configuration",  actions: ACTIONS_CRUD },
  { key: "PerformanceRatings",label: "Performance Ratings",      group: "Configuration",  actions: ACTIONS_CRUD },

  // System administration
  { key: "Roles",             label: "Roles",                    group: "User Management", actions: ACTIONS_CRUD },
  { key: "Users",             label: "Users",                    group: "User Management", actions: ACTIONS_CRUD },
  { key: "Permissions",       label: "Permissions",              group: "User Management", actions: ACTIONS_CRUD },
  { key: "OrganizationProfile",label: "Organization Profile",    group: "User Management", actions: ["Read", "Update"] },
];

const RES_BY_KEY = Object.fromEntries(RESOURCES.map(r => [r.key, r]));
const ALL_PERMS = RESOURCES.flatMap(r => r.actions.map(a => `${r.key}:${a}`));

// ---- Permission-set builders ------------------------------------------------
const permsAll = (res) => (RES_BY_KEY[res]?.actions || []).map(a => `${res}:${a}`);
const permsRead = (res) => [`${res}:Read`];
const permsReadApprove = (res) => [`${res}:Read`, `${res}:Approve`];
const flat = (...lists) => Array.from(new Set([].concat(...lists)));

// ---- nav page/tab → resource (read-gating for "list"/"info" sections) -------
// Dashboard-section tabs are gated by the section's own Dashboard:Read, so they
// are intentionally NOT mapped here (avoids the "Leave Requests" name collision
// between the ESS dashboard tab and the Leave-Management admin tab).
const PAGE_RES = {
  // Reports & Analytics (info)
  "Performance": "PerformanceReports", "Leave": "DashboardReport",
  // Core HR
  "Branches/Units": "OrganizationalUnits", "Departments": "Departments", "Job Titles": "Designations",
  "Job Grades": "JobGrades", "Zones": "Zones", "Employees": "Employees",
  "Reporting Managers": "Employees", "Approvals": "ESS_Change_Requests",
  // Leave Management
  "Leave Types": "LeaveTypes", "Leave Allocations": "LeaveAllocations", "Leave Requests": "LeaveRequests",
  "Leave Recalls": "LeaveRecalls", "Holidays": "LeaveTypes", "Leave Balances": "LeaveRequests",
  // Employee Engagement
  "Disciplinary Cycle": "DisciplinaryCases", "Accommodation": "Accommodations",
  "Welfare": "Circulars", "Protocols": "Protocol",
  // Recruitment
  "Hiring Requests": "HiringRequests", "Job Posts": "JobPostings", "Assessments": "AssessorInterviews",
  "Job Requests": "JobRequests", "Job Reopenings": "JobPostings", "Talent Pool": "JobApplications",
  // People & Culture
  "Promotions": "Promotions", "Transfers": "Transfers", "Job Title": "Designations", "Employee Exit": "Exits",
  "Talent Acquisition": "JobApplications", "Onboarding": "Employees",
  // Performance
  "Department Perspectives": "Perspectives", "Goal Setting": "TargetRequests",
  "Performance Appraisals": "PerformanceAppraisals", "Portfolio of Evidence": "PortfolioOfEvidence",
  "360 Feedback": "AppraisalAssignments", "Moderation": "Moderations", "IDP": "PerformanceAppraisals",
  "PIP": "PerformanceAppraisals", "Objectives": "Objectives",
  // System Admin ▸ Configuration
  "Corporate Perspectives": "Perspectives", "Competencies": "Competencies", "Periods": "Periods",
  "Employee Goals": "Measures", "KPI / Measures": "Measures", "Performance Ratings": "PerformanceRatings",
  // System Admin ▸ User Management / Organization
  "Roles": "Roles", "Users": "Users", "Organization": "OrganizationProfile",
};

// ---- Default roles (the six seeded bundles — fully editable in the UI) -------
const DEFAULT_ROLES = [
  {
    id: "super-admin", name: "Super Admin", icon: "shield-star-line", color: "#375DFB",
    description: "Full access to every module, configuration and user-management area.",
    system: true, permissions: ALL_PERMS.slice(),
  },
  {
    id: "hr-admin", name: "HR Admin / Officer", icon: "user-settings-line", color: "#007839",
    description: "Day-to-day HR operations across org, employees, leave, engagement and recruitment.",
    permissions: flat(
      permsRead("Dashboard"),
      permsAll("Departments"), permsAll("Designations"), permsAll("OrganizationalUnits"),
      permsAll("JobGrades"), permsAll("Zones"), permsAll("Employees"),
      permsAll("ESS_Change_Requests"),
      permsAll("LeaveTypes"), permsAll("LeaveRequests"), permsAll("LeaveAllocations"), permsAll("LeaveRecalls"),
      permsAll("DisciplinaryCases"), permsAll("Accommodations"), permsAll("Circulars"), permsAll("Protocol"),
      permsAll("Promotions"), permsAll("Transfers"), permsAll("Exits"),
      permsAll("HiringRequests"), permsAll("JobRequests"), permsAll("JobPostings"), permsRead("JobApplications"),
      permsRead("PerformanceReports"), permsRead("DashboardReport"),
    ),
  },
  {
    id: "hrbp", name: "HRBP / HR Manager", icon: "briefcase-line", color: "#7A5AF8",
    description: "Performance-cycle ownership — appraisals, moderation, IDP/PIP, goals and reports.",
    permissions: flat(
      permsRead("Dashboard"),
      permsRead("Employees"), permsRead("Departments"), permsRead("JobGrades"),
      permsAll("TargetRequests"), permsAll("PerformanceAppraisals"), permsAll("Moderations"),
      permsAll("PortfolioOfEvidence"), permsAll("AppraisalAssignments"), permsAll("Objectives"),
      permsRead("Perspectives"), permsRead("Competencies"), permsRead("Periods"),
      permsRead("LeaveRequests"), permsReadApprove("LeaveRequests"),
      permsRead("PerformanceReports"), permsRead("DashboardReport"),
    ),
  },
  {
    id: "pc-bp", name: "People & Culture (P&CBP)", icon: "user-shared-2-line", color: "#C11574",
    description: "People & Culture Business Partner — owns transfers, promotions, change of job title and exits end-to-end (Head P&C approves).",
    permissions: flat(
      permsRead("Dashboard"),
      permsRead("Employees"), ["Employees:Update"],
      permsRead("Departments"), permsRead("JobGrades"), permsRead("OrganizationalUnits"), permsRead("Zones"),
      permsAll("Designations"),
      permsAll("Promotions"), permsAll("Transfers"), permsAll("Exits"),
      permsRead("DashboardReport"),
    ),
  },
  {
    id: "line-manager", name: "Line Manager", icon: "team-line", color: "#C2540A",
    description: "Approves their team's leave, goals and change requests; reviews team appraisals.",
    permissions: flat(
      permsRead("Dashboard"),
      permsRead("Employees"),
      permsReadApprove("LeaveRequests"),
      permsReadApprove("ESS_Change_Requests"),
      permsReadApprove("TargetRequests"),
      permsRead("PerformanceAppraisals"), permsRead("Objectives"), permsRead("Moderations"),
    ),
  },
  {
    id: "recruiter", name: "Recruiter / Hiring Manager", icon: "user-search-line", color: "#0C7792",
    description: "Owns the recruitment pipeline — hiring & job requests, postings, talent pool, assessments.",
    permissions: flat(
      permsRead("Dashboard"),
      permsRead("Employees"),
      permsAll("HiringRequests"), permsAll("JobRequests"), permsAll("JobPostings"),
      permsAll("JobApplications"), permsAll("AssessorInterviews"),
    ),
  },
  {
    id: "employee", name: "Employee (ESS)", icon: "user-3-line", color: "#525866",
    description: "Self-service only — personal info, own leave, goals and submitted requests.",
    // Dashboard:Read drives every self-service tab. We deliberately DON'T grant
    // Read on the admin resources (LeaveRequests/TargetRequests/PerformanceAppraisals/
    // ESS_Change_Requests) — those keys gate the admin list tabs, so granting Read
    // would leak Core HR / Leave Management / Performance into an employee's sidebar.
    // The :Create perms below are the genuine self-service writes and never reveal a
    // tab (tabs gate on :Read only).
    permissions: flat(
      permsRead("Dashboard"),
      ["ESS_Change_Requests:Create"],
      ["LeaveRequests:Create"],
    ),
  },
];

// ---- Reactive store ---------------------------------------------------------
window.HRStores = window.HRStores || {};
window.HRStores.rbac = makeStore({ roleId: "super-admin", roles: DEFAULT_ROLES.map(r => ({ ...r })) });

// ---- Helpers ----------------------------------------------------------------
function permsForRole(roleId, roles) {
  const role = (roles || []).find(r => r.id === roleId);
  return new Set(role ? role.permissions : []);
}
const can = (perms, res, action) => !!perms && perms.has(`${res}:${action}`);
const canRead = (perms, res) => can(perms, res, "Read");
const resourceOf = (pageName) => PAGE_RES[pageName];

// tab visibility given the owning section's `kind`
function tabAllowed(perms, kind, tabName) {
  if (kind === "dashboard") return canRead(perms, "Dashboard");
  const res = PAGE_RES[tabName];
  if (!res) return true; // unmapped → visible (e.g. bespoke pages)
  return canRead(perms, res);
}
const firstAllowedTab = (perms, kind, tabs) => (tabs || []).find(t => tabAllowed(perms, kind, t)) || null;

// CRUD action gating for a page (resource derived from page name)
function pageCan(perms, pageName, action) {
  const res = PAGE_RES[pageName];
  if (!res) return true;          // bespoke/unmapped → don't restrict
  return can(perms, res, action);
}

// number of top-level sidebar destinations a role can see (groups + leaves + admin).
// When this is ≤ 1 (e.g. an ESS who only has the Dashboard), the sidebar is pointless
// and we hide it — the role navigates via the Dashboard's horizontal tabs instead.
function visibleNavCount(perms) {
  const allow = (kind, name) => tabAllowed(perms, kind, name);
  const showChild = (kind, c) => (c.tabs && c.tabs.length ? c.tabs.some(t => allow(kind, t)) : allow(kind, c.name));
  let count = 0;
  for (const top of NAV_MAIN) {
    if (top.children) { if (top.children.some(c => showChild(top.kind, c))) count++; }
    else if (top.tabs && top.tabs.length) { if (top.tabs.some(t => allow(top.kind, t))) count++; }
    else if (allow(top.kind, top.name)) count++;
  }
  if (NAV_ADMIN.children.some(c => showChild(NAV_ADMIN.kind, c))) count++;
  return count;
}

Object.assign(window, {
  RBAC: { resources: RESOURCES, resByKey: RES_BY_KEY, allPerms: ALL_PERMS, defaultRoles: DEFAULT_ROLES, pageRes: PAGE_RES },
  permsForRole, can, canRead, resourceOf, tabAllowed, firstAllowedTab, pageCan, visibleNavCount,
});
