// BISTA HR · target/data — Target Requests (quarterly appraisal) data + helpers.
// Structured standalone so the admin Appraisals side can reuse the same shapes later.
let TGT_SEQ = 700;
const tgtId = () => ++TGT_SEQ;

// job levels (selectable per perspective in the wizard)
const JOB_LEVELS = ["Level 1 (Apprentice)", "Level 2 - Developing", "Level 3 - Competent", "Level 4 - Mastery"];

// balanced-scorecard perspectives (one wizard step each); weights sum to 100
const PERSPECTIVES = [
  { key: "customer",  name: "Customer",          weight: 25, tint: "cream" },
  { key: "financial", name: "Financial",         weight: 25, tint: "pink" },
  { key: "people",    name: "People",            weight: 15, tint: "cream" },
  { key: "learning",  name: "Learning & Growth", weight: 15, tint: "pink" },
  { key: "process",   name: "Internal Process",  weight: 20, tint: "cream" },
];

// option lookups for the builder selects
const OBJECTIVE_OPTS = ["Improve Stakeholder Satisfaction", "Increase Revenue", "Reduce Operational Cost", "Enhance Service Delivery", "Develop Team Capability"];
const GOAL_OPTS = ["Provision of market data and information", "Manage stakeholder requests", "Streamline reporting process", "Improve turnaround time", "Strengthen internal controls"];
const KPI_OPTS = ["Efficiency", "Accuracy", "Timeliness", "Quality", "Cost", "Satisfaction"];

// card statuses → pill variant + clipboard tint + primary action
const TARGET_STATUS = {
  "not-started": { variant: "default",  text: "Not Started", tint: "lavender", cta: "Complete Assessment", disabled: true },
  "in-draft":    { variant: "draft",    text: "In Draft",    tint: "yellow",   cta: "Complete Assessment", disabled: false },
  "in-progress": { variant: "pending",  text: "In Progress", tint: "yellow",   cta: "Continue Assessment", disabled: false },
  "submitted":   { variant: "approved", text: "Submitted",   tint: "green",    cta: "View Details",        disabled: false },
};

// the four quarterly appraisal cards
const TARGET_CARDS = [
  { id: tgtId(), quarter: "Q1", title: "Q1 Target Appraisal", year: 2026, status: "in-draft",   due: "3rd Jan 2026",
    desc: "A structured evaluation of individual and team targets for the first quarter." },
  { id: tgtId(), quarter: "Q2", title: "Q2 Target Appraisal", year: 2026, status: "not-started", due: null,
    desc: "A structured evaluation of individual and team targets for the second quarter." },
  { id: tgtId(), quarter: "Q3", title: "Q3 Target Appraisal", year: 2026, status: "not-started", due: null,
    desc: "A structured evaluation of individual and team targets for the third quarter." },
  { id: tgtId(), quarter: "Q4", title: "Q4 Target Appraisal", year: 2026, status: "not-started", due: null,
    desc: "A structured evaluation of individual and team targets for the fourth quarter." },
];

// clipboard tint backgrounds (the 3D art is recolored via mix-blend over these)
const CLIP_TINT = {
  lavender: "#C7CDF4", yellow: "#FFD84D", green: "#7DD9A6", pink: "#F4B8C6",
};

// a prefilled objective so the wizard/details look populated (mirrors the mock)
const seedObjective = () => ({
  id: tgtId(), objective: "Improve Stakeholder Satisfaction", kpi: "Efficiency", weight: 25,
  goals: [{
    id: tgtId(), goal: "Provision of market data and information", target: "10%", kpi: "Efficiency", weight: 15,
    tasks: [
      { id: tgtId(), task: "Provision of market data and information", target: "5%", kpi: "Accuracy", weight: 10 },
      { id: tgtId(), task: "Provision of market data and information", target: "5%", kpi: "Accuracy", weight: 5 },
    ],
  }],
});

// build a fresh per-perspective form state
const blankPerspective = () => ({ level: JOB_LEVELS[0], objectives: [seedObjective()] });

Object.assign(window, {
  tgtId, JOB_LEVELS, PERSPECTIVES, OBJECTIVE_OPTS, GOAL_OPTS, KPI_OPTS,
  TARGET_STATUS, TARGET_CARDS, CLIP_TINT, seedObjective, blankPerspective,
});
