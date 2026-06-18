// BISTA HR · performance/IdpData — Individual Development Plan data.
// The Performance ▸ IDP tab is the HRBP "IDP management" report: organization-wide plans
// filtered/exported by department, unit and status. A plan has Personal Info + 3–5 goals
// (each with activities + 70-20-10 learning methods) plus mid-year / end-of-year reviews.
let IDP_SEQ = 7000;
const idpId = () => ++IDP_SEQ;

const GOAL_TYPES = ["Technical", "Behavioral", "Leadership"];
const GOAL_PRIORITIES = ["High", "Medium", "Low"];

const LEARNING_METHODS = {
  onJob: { label: "70% On-the-job experience", options: ["Stretch assignments", "Job rotation", "Lead a project or team", "Project participation", "Job shadowing", "Acting role coverage", "Create process improvements"] },
  social: { label: "20% Social learning", options: ["Mentoring", "Coaching conversations", "Peer learning groups", "Reverse mentoring", "360-degree feedback", "Communities of practice"] },
  formal: { label: "10% Formal training", options: ["In-house training workshops", "Professional certifications", "External classroom courses", "e-Learning modules", "Leadership programmes", "Webinars and virtual events"] },
};
const FORMAL_SUPPLEMENTARY = ["Curated reading list", "Academic study"];

// status → StatusBadge variant + label
const IDP_STATUS = {
  draft: { variant: "draft", text: "Draft" },
  submitted: { variant: "review", text: "Submitted" },
  approved: { variant: "approved", text: "Approved" },
  returned: { variant: "warning", text: "Returned" },
  completed: { variant: "completed", text: "Completed" },
};
const IDP_ACHIEVEMENTS = ["Fully achieved", "Largely achieved", "Partially achieved", "Not achieved"];

const newActivity = (endDate) => ({ id: idpId(), description: "", endDate: endDate || "", onJob: "", social: "", formal: "", additionalFormal: [], comments: "", status: "Not Started" });
const newGoal = (endDate) => ({ id: idpId(), developmentGoal: "", comments: "", type: "", priority: "", activities: [newActivity(endDate)] });

const sampleGoal = (title, type, priority, actDesc, onJob, social, formal) => ({
  id: idpId(), developmentGoal: title, comments: `${title} — building capability over the year.`, type, priority,
  activities: [{ id: idpId(), description: actDesc, endDate: "2025-11-30", onJob, social, formal, additionalFormal: [], comments: "", status: "In Progress" }],
});
const sampleGoals = () => [
  sampleGoal("Strengthen credit analysis", "Technical", "High", "Lead 3 live credit appraisals under supervision", "Stretch assignments", "Coaching conversations", "Professional certifications"),
  sampleGoal("Improve client relationship management", "Behavioral", "Medium", "Shadow a senior RM on key accounts", "Job shadowing", "Mentoring", "In-house training workshops"),
  sampleGoal("Develop team leadership", "Leadership", "Medium", "Co-lead a branch improvement project", "Lead a project or team", "Peer learning groups", "Leadership programmes"),
];

// filter option lists
const IDP_DEPARTMENTS = ["People & Culture Department", "Retail Banking", "Operations", "Credit Risk", "Information Technology"];
const IDP_UNITS = ["KN Circle / KN Circle", "P&C Business Partnering / P&C Business Partnering", "Accra Main", "Tema Branch"];
const IDP_STATUS_FILTERS = ["Completed", "Approved", "Submitted", "Draft", "Returned"];

// organization-wide IDP plans (the management report)
const IDP_PLAN_ROWS = [
  { id: idpId(), employeeName: "Leo Kyeremateng", jobTitle: "People & Culture Business Partner", department: "People & Culture Department", unitBranch: "KN Circle / KN Circle", reportsTo: "Peter Bosrotsi",
    period: "2025 Individual Goal plan", year: 2025, startDate: "2025-01-01", endDate: "2025-12-31", status: "completed", progress: null,
    reviewCompleted: "2026-05-28", endYearStatus: "Fully achieved", goals: sampleGoals(),
    midYearReviews: [{ id: idpId(), date: "2026-05-28", employeeComments: "", managerComments: "rhshrhs bhsbhuswhhrrujbhsenh uwujhruijie", achievement: "Fully achieved" }],
    endYearReview: { date: "2026-05-28", employeeSelfAssessment: "", managerComments: "ujrjudjfjnkirjism jsnfjnnsknkkjr", achievement: "Fully achieved" },
    proudOf: "Successfully embedded the new onboarding programme across two units.", stillToWorkOn: "Deepen data-analytics capability for workforce reporting." },
  { id: idpId(), employeeName: "Peter Bosrotsi", jobTitle: "Head, P&C Business Partnering", department: "People & Culture Department", unitBranch: "P&C Business Partnering / P&C Business Partnering", reportsTo: "Chief HR Officer",
    period: "2025 Individual Goal plan", year: 2025, startDate: "2025-01-01", endDate: "2025-12-31", status: "completed", progress: null,
    reviewCompleted: "2026-05-26", endYearStatus: "Largely achieved", goals: sampleGoals(),
    midYearReviews: [{ id: idpId(), date: "2026-05-26", employeeComments: "Made strong progress on the partnering model.", managerComments: "On track; keep driving stakeholder engagement.", achievement: "Largely achieved" }],
    endYearReview: { date: "2026-05-26", employeeSelfAssessment: "Delivered most objectives with measurable impact.", managerComments: "Largely achieved — strong year overall.", achievement: "Largely achieved" },
    proudOf: "Rolled out the business-partnering operating model bank-wide.", stillToWorkOn: "Succession depth in the P&C team." },
  { id: idpId(), employeeName: "Peter Bosrotsi", jobTitle: "Head, P&C Business Partnering", department: "People & Culture Department", unitBranch: "P&C Business Partnering / P&C Business Partnering", reportsTo: "Chief HR Officer",
    period: "2025 Individual Goal plan", year: 2025, startDate: "2025-01-01", endDate: "2025-12-31", status: "approved", progress: 31.9,
    reviewCompleted: null, endYearStatus: null, goals: sampleGoals(), midYearReviews: [], endYearReview: null, proudOf: "", stillToWorkOn: "" },
  { id: idpId(), employeeName: "Peter Bosrotsi", jobTitle: "Head, P&C Business Partnering", department: "People & Culture Department", unitBranch: "P&C Business Partnering / P&C Business Partnering", reportsTo: "Chief HR Officer",
    period: "2026 Year Review", year: 2026, startDate: "2026-01-01", endDate: "2026-12-31", status: "draft", progress: null,
    reviewCompleted: null, endYearStatus: null, goals: [sampleGoals()[0]], midYearReviews: [], endYearReview: null, proudOf: "", stillToWorkOn: "" },
  { id: idpId(), employeeName: "Ama Serwaa", jobTitle: "Relationship Manager", department: "Retail Banking", unitBranch: "Accra Main", reportsTo: "Adwoa Owusu",
    period: "2026 Individual Goal plan", year: 2026, startDate: "2026-01-01", endDate: "2026-12-31", status: "submitted", progress: 0,
    reviewCompleted: null, endYearStatus: null, goals: sampleGoals(), midYearReviews: [], endYearReview: null, proudOf: "", stillToWorkOn: "" },
  { id: idpId(), employeeName: "Kojo Antwi", jobTitle: "Relationship Officer", department: "Retail Banking", unitBranch: "Accra Main", reportsTo: "Adwoa Owusu",
    period: "2026 Individual Goal plan", year: 2026, startDate: "2026-01-01", endDate: "2026-12-31", status: "returned", progress: 0,
    reviewCompleted: null, endYearStatus: null, goals: sampleGoals(), midYearReviews: [], endYearReview: null,
    returnReason: "Please add a measurable activity to Goal 2 and resubmit.", proudOf: "", stillToWorkOn: "" },
];

const idpEmployee = {
  fullName: "Kwame Mensah", employeeId: "BG-2041", designation: "Relationship Manager",
  department: "Retail Banking", branch: "Accra Main", reportingManager: "Adwoa Owusu",
};
const idpGoalValid = (g) => g.developmentGoal.trim() && g.type && g.priority && g.activities.length &&
  g.activities.every((a) => a.description.trim() && a.onJob && a.social && a.formal && a.endDate);

Object.assign(window, {
  idpId, GOAL_TYPES, GOAL_PRIORITIES, LEARNING_METHODS, FORMAL_SUPPLEMENTARY, IDP_STATUS, IDP_ACHIEVEMENTS,
  newActivity, newGoal, sampleGoals, IDP_PLAN_ROWS, IDP_DEPARTMENTS, IDP_UNITS, IDP_STATUS_FILTERS, idpEmployee, idpGoalValid,
});
