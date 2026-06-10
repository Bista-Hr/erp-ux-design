// BISTA HR · appraisal/data — self-service quarterly Employee Appraisal data.
// Mirrors the Target Requests pattern (4 quarterly cards → scoring wizard → details),
// but scores objectives/tasks (Actual Score / Score / Rating / Ranking) and adds a
// Behavioural Score step. Standalone shapes for the future admin appraisal side.
let APP_SEQ = 900;
const appId = () => ++APP_SEQ;

// 4 weighted perspectives (25% each) + a Behavioural step = 5 wizard steps
const APP_PERSPECTIVES = [
  { key: "customer",  name: "Customer",          weight: 25, tint: "cream" },
  { key: "financial", name: "Financial",         weight: 25, tint: "pink" },
  { key: "learning",  name: "Learning & Growth", weight: 25, tint: "cream" },
  { key: "internal",  name: "Internal Growth",   weight: 25, tint: "pink" },
];

const APP_KPI = ["Quality", "Efficiency", "Accuracy", "Timeliness", "Cost"];

// rating (1–5) → ranking label
const rankLabel = (r) => { const n = Number(r); return n >= 5 ? "Outstanding" : n >= 4 ? "Very Good" : n >= 3 ? "Satisfactory" : n >= 2 ? "Needs Improvement" : n >= 1 ? "Poor" : "—"; };

// card status → pill + photo tint + action (active = natural photo, others tinted)
const APP_STATUS = {
  "not-started": { variant: "default",  text: "Not Started", tint: "yellow",  cta: "Complete Assessment", disabled: true },
  "in-draft":    { variant: "draft",    text: "In Draft",    tint: "natural", cta: "Complete Assessment", disabled: false },
  "in-progress": { variant: "pending",  text: "In Progress", tint: "natural", cta: "Continue Assessment", disabled: false },
  "submitted":   { variant: "approved", text: "Submitted",   tint: "green",   cta: "View Details",        disabled: false },
};
const APP_PHOTO_TINT = { yellow: "#E8C21A", green: "#46B179" }; // natural = no blend

const APP_CARDS = [
  { id: appId(), quarter: "Q1", title: "Q1 Employee Appraisal", year: 2026, status: "in-draft",   due: "3rd Jan 2026",
    desc: "A structured evaluation of individual and team targets for the first quarter." },
  { id: appId(), quarter: "Q2", title: "Q2 Employee Appraisal", year: 2026, status: "not-started", due: null,
    desc: "A structured evaluation of individual and team targets for the second quarter." },
  { id: appId(), quarter: "Q3", title: "Q3 Employee Appraisal", year: 2026, status: "not-started", due: null,
    desc: "A structured evaluation of individual and team targets for the third quarter." },
  { id: appId(), quarter: "Q4", title: "Q4 Employee Appraisal", year: 2026, status: "not-started", due: null,
    desc: "A structured evaluation of individual and team targets for the fourth quarter." },
];

// a scored objective (with its tasks) for one perspective
const seedObjectiveScore = () => ({
  id: appId(), objective: "Improve Stakeholder Satisfaction",
  tasks: [
    { id: appId(), task: "Provision of market data and information", kpi: "Quality", weight: 15, actual: 15, score: 15, rating: 4, comment: "" },
    { id: appId(), task: "Provision of market data and information", kpi: "Quality", weight: 15, actual: 15, score: 15, rating: 5, comment: "" },
  ],
});
const blankAppPerspective = () => ({ objectives: [seedObjectiveScore(), { id: appId(), objective: "Improve Stakeholder Satisfaction",
  tasks: [{ id: appId(), task: "Provision of market data and information", kpi: "Quality", weight: 15, actual: 15, score: 15, rating: 4, comment: "" }] }] });

// behavioural score step: competency areas, each with rated tasks
const seedBehavioural = () => ([
  { id: appId(), title: "Workplace Planning and Promotion", tasks: [
    { id: appId(), task: "Ability to participate in discussions and contribute to the development of goals", rating: 4, comment: "" },
    { id: appId(), task: "Uses the strategic plan as an ongoing point of reference and governance tool", rating: 5, comment: "" },
    { id: appId(), task: "Uses the strategic plan as an ongoing point of reference and governance tool", rating: 4, comment: "" },
  ]},
  { id: appId(), title: "Performance Data Appreciation and Analysis", tasks: [
    { id: appId(), task: "Ability to participate in discussions and contribute to the development of goals", rating: 4, comment: "" },
    { id: appId(), task: "Uses the strategic plan as an ongoing point of reference and governance tool", rating: 3, comment: "" },
    { id: appId(), task: "Uses the strategic plan as an ongoing point of reference and governance tool", rating: 4, comment: "" },
  ]},
]);

Object.assign(window, {
  appId, APP_PERSPECTIVES, APP_KPI, rankLabel, APP_STATUS, APP_PHOTO_TINT, APP_CARDS,
  seedObjectiveScore, blankAppPerspective, seedBehavioural,
});
