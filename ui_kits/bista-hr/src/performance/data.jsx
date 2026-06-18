// BISTA HR · performance/data — shared seed data for the admin Performance section.
// Mirrors the codebase appraisal module: Balanced-Scorecard perspectives → objectives → KPIs,
// appraisal periods, competencies (for the behavioural step), and goal-setting rows
// (My Goals + Goals to review). Standalone window globals so every Performance screen shares it.
let PERF_SEQ = 1000;
const perfId = () => ++PERF_SEQ;

// objective vs behavioural split shown on the detail/summary tabs (codebase constants)
const OBJECTIVE_SCORE_PCT = 80;
const BEHAVIOURAL_SCORE_PCT = 20;

// competency level labels (COMPLETENCY_LEVEL_LABELS)
const COMPETENCY_LEVELS = {
  1: "Level 1 — Apprentice",
  2: "Level 2 — Developing",
  3: "Level 3 — Competent",
  4: "Level 4 — Mastery",
};

// current signed-in employee (drives "My Goals")
const PERF_ME = {
  id: "emp-me", employeeNumber: "BG-2041", name: "Kwame Mensah",
  designation: "Relationship Manager", department: "Retail Banking",
  branch: "Accra Main", appraiser: "Adwoa Owusu", appraiserId: "emp-mgr",
};

// appraisal periods (year-scoped)
const PERF_PERIODS = [
  { id: "per-2026-h1", name: "2026 First Half", year: 2026, start: "2026-01-01", end: "2026-06-30" },
  { id: "per-2026-h2", name: "2026 Second Half", year: 2026, start: "2026-07-01", end: "2026-12-31" },
  { id: "per-2025-h2", name: "2025 Second Half", year: 2025, start: "2025-07-01", end: "2025-12-31" },
  { id: "per-2025-h1", name: "2025 First Half", year: 2025, start: "2025-01-01", end: "2025-06-30" },
];

// department perspectives — weights sum to 100
const DEPT_PERSPECTIVES = [
  { id: "psp-fin", key: "financial", name: "Financial", weight: 35, tint: "cream" },
  { id: "psp-cust", key: "customer", name: "Customer", weight: 30, tint: "pink" },
  { id: "psp-proc", key: "process", name: "Internal Process", weight: 20, tint: "cream" },
  { id: "psp-learn", key: "learning", name: "Learning & Growth", weight: 15, tint: "pink" },
];

// objectives per perspective, each with selectable KPIs (mirrors objective → KPI cascade)
const PERF_OBJECTIVES = [
  { id: "obj-1", perspectiveKey: "financial", name: "Grow deposit mobilisation", kpis: ["Total deposits (GHS)", "New deposit accounts", "CASA ratio"] },
  { id: "obj-2", perspectiveKey: "financial", name: "Increase loan portfolio", kpis: ["Loan book value", "Disbursement count", "Portfolio yield"] },
  { id: "obj-3", perspectiveKey: "financial", name: "Reduce operational cost", kpis: ["Cost-to-income ratio", "Cost savings (GHS)"] },
  { id: "obj-4", perspectiveKey: "customer", name: "Improve customer satisfaction", kpis: ["CSAT score", "Net Promoter Score", "Complaint resolution time"] },
  { id: "obj-5", perspectiveKey: "customer", name: "Expand customer base", kpis: ["New customers onboarded", "Active customer ratio"] },
  { id: "obj-6", perspectiveKey: "process", name: "Improve turnaround time", kpis: ["Avg. request TAT", "SLA adherence %"] },
  { id: "obj-7", perspectiveKey: "process", name: "Strengthen controls & compliance", kpis: ["Audit exceptions", "KYC completeness %"] },
  { id: "obj-8", perspectiveKey: "learning", name: "Build team capability", kpis: ["Training hours", "Certifications earned"] },
  { id: "obj-9", perspectiveKey: "learning", name: "Drive innovation", kpis: ["Process improvements", "Ideas implemented"] },
];
const objectivesForPerspective = (key) => PERF_OBJECTIVES.filter((o) => o.perspectiveKey === key);
const kpisForObjective = (objName) => (PERF_OBJECTIVES.find((o) => o.name === objName)?.kpis) || [];

// competency framework for the behavioural step — descriptors keyed by level (1..4)
const PERF_COMPETENCIES = [
  { id: "comp-1", name: "Customer Focus", descriptors: {
    1: ["Responds to customer requests with guidance", "Records customer interactions accurately"],
    2: ["Resolves routine customer issues independently", "Anticipates common customer needs"],
    3: ["Builds lasting customer relationships", "Proactively identifies cross-sell opportunities"],
    4: ["Shapes the customer-experience strategy", "Coaches others on customer excellence"],
  }},
  { id: "comp-2", name: "Communication", descriptors: {
    1: ["Communicates clearly in writing and speech", "Listens and confirms understanding"],
    2: ["Adapts message to the audience", "Handles difficult conversations calmly"],
    3: ["Influences stakeholders effectively", "Presents complex ideas simply"],
    4: ["Sets communication standards for the team", "Represents the bank externally with authority"],
  }},
  { id: "comp-3", name: "Accountability", descriptors: {
    1: ["Completes assigned tasks on time", "Owns mistakes and seeks help"],
    2: ["Delivers on commitments consistently", "Manages own priorities effectively"],
    3: ["Takes ownership of team outcomes", "Drives results under pressure"],
    4: ["Holds the function accountable to targets", "Models integrity across the bank"],
  }},
];
const competenciesForLevel = (level) =>
  PERF_COMPETENCIES.map((c) => ({ id: c.id, name: c.name, descriptors: c.descriptors[level] || [] }));

// approval status → StatusBadge variant
const APPROVAL_VARIANT = { pending: "pending", approved: "approved", rejected: "rejected" };

// ---- a fully-built sample goal (perspectives → objectives → goals → tasks) ----
const sampleGoalData = () => DEPT_PERSPECTIVES.map((p) => {
  const objs = objectivesForPerspective(p.key).slice(0, 1).map((o) => ({
    id: perfId(), objectiveId: o.id, objective: o.name, kpi: o.kpis[0], weight: p.weight,
    goals: [{
      id: perfId(), goal: o.name, target: "10%", kpi: o.kpis[0], weight: p.weight,
      tasks: [
        { id: perfId(), task: "Execute quarterly action plan", target: "5%", kpi: o.kpis[0], weight: Math.round(p.weight / 2) },
        { id: perfId(), task: "Report monthly progress", target: "5%", kpi: o.kpis[0], weight: p.weight - Math.round(p.weight / 2) },
      ],
    }],
  }));
  return { perspectiveId: p.id, perspectiveKey: p.key, perspectiveName: p.name, perspectiveWeight: p.weight, objectives: objs };
});

const fmtDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

// goal-setting rows: My Goals (isAppraisee) + Goals to review (isReviewer)
const GOAL_ROWS = [
  { id: perfId(), employeeId: PERF_ME.id, employeeName: PERF_ME.name, employeeNumber: PERF_ME.employeeNumber,
    designation: PERF_ME.designation, department: PERF_ME.department, branch: PERF_ME.branch, appraiser: PERF_ME.appraiser,
    isAppraisee: true, isReviewer: false, reviewStatus: null,
    appraisalYear: 2026, periodId: "per-2026-h1", startDate: "2026-01-01", endDate: "2026-06-30",
    status: "approved", createdAt: "2026-01-08", competencyLevel: 3, perspectives: sampleGoalData() },
  { id: perfId(), employeeId: PERF_ME.id, employeeName: PERF_ME.name, employeeNumber: PERF_ME.employeeNumber,
    designation: PERF_ME.designation, department: PERF_ME.department, branch: PERF_ME.branch, appraiser: PERF_ME.appraiser,
    isAppraisee: true, isReviewer: false, reviewStatus: null,
    appraisalYear: 2026, periodId: "per-2026-h2", startDate: "2026-07-01", endDate: "2026-12-31",
    status: "pending", createdAt: "2026-06-22", competencyLevel: 3, perspectives: sampleGoalData() },
  { id: perfId(), employeeId: PERF_ME.id, employeeName: PERF_ME.name, employeeNumber: PERF_ME.employeeNumber,
    designation: PERF_ME.designation, department: PERF_ME.department, branch: PERF_ME.branch, appraiser: PERF_ME.appraiser,
    isAppraisee: true, isReviewer: false, reviewStatus: null,
    appraisalYear: 2025, periodId: "per-2025-h2", startDate: "2025-07-01", endDate: "2025-12-31",
    status: "rejected", createdAt: "2025-07-03", rejectionReason: "Financial perspective weights don't sum to the perspective weight. Please revise and resubmit.", competencyLevel: 2, perspectives: sampleGoalData() },
  // direct reports (Goals to review)
  { id: perfId(), employeeId: "emp-2", employeeName: "Yaw Asante", employeeNumber: "BG-3120",
    designation: "Relationship Officer", department: "Retail Banking", branch: "Accra Main", appraiser: PERF_ME.name,
    isAppraisee: false, isReviewer: true, reviewStatus: "PendingReview",
    appraisalYear: 2026, periodId: "per-2026-h1", startDate: "2026-01-01", endDate: "2026-06-30",
    status: "pending", createdAt: "2026-01-09", competencyLevel: 2, perspectives: sampleGoalData() },
  { id: perfId(), employeeId: "emp-3", employeeName: "Efua Boateng", employeeNumber: "BG-3144",
    designation: "Teller", department: "Retail Banking", branch: "Accra Main", appraiser: PERF_ME.name,
    isAppraisee: false, isReviewer: true, reviewStatus: "PendingReview",
    appraisalYear: 2026, periodId: "per-2026-h1", startDate: "2026-01-01", endDate: "2026-06-30",
    status: "pending", createdAt: "2026-01-11", competencyLevel: 1, perspectives: sampleGoalData() },
  { id: perfId(), employeeId: "emp-4", employeeName: "Kojo Antwi", employeeNumber: "BG-2988",
    designation: "Relationship Officer", department: "Retail Banking", branch: "Accra Main", appraiser: PERF_ME.name,
    isAppraisee: false, isReviewer: true, reviewStatus: "Reviewed",
    appraisalYear: 2026, periodId: "per-2026-h1", startDate: "2026-01-01", endDate: "2026-06-30",
    status: "approved", createdAt: "2026-01-06", competencyLevel: 3, perspectives: sampleGoalData() },
  // a rejected goal to review (covers the "rejected" status sample)
  { id: perfId(), employeeId: "emp-7", employeeName: "Abena Mensah", employeeNumber: "BG-3300",
    designation: "Relationship Officer", department: "Retail Banking", branch: "Accra Main", appraiser: PERF_ME.name,
    isAppraisee: false, isReviewer: true, reviewStatus: "Reviewed",
    appraisalYear: 2026, periodId: "per-2026-h1", startDate: "2026-01-01", endDate: "2026-06-30",
    status: "rejected", createdAt: "2026-01-05", rejectionReason: "Targets need clearer KPIs before approval.", competencyLevel: 2, perspectives: sampleGoalData() },
];

// blank perspective form state for the wizard (one objective, one goal, one task)
const blankPerfObjective = (perspectiveWeight) => ({
  id: perfId(), objectiveId: "", objective: "", kpi: "", weight: "",
  goals: [{ id: perfId(), goal: "", target: "", kpi: "", weight: "", tasks: [] }],
});
const blankGoalForm = (employee) => ({
  employeeId: employee.id, appraisalYear: 2026, periodId: "", startDate: "", endDate: "",
  perspectives: DEPT_PERSPECTIVES.map((p) => ({
    perspectiveId: p.id, perspectiveKey: p.key, perspectiveName: p.name, perspectiveWeight: p.weight,
    objectives: [blankPerfObjective(p.weight)],
  })),
});

// total of every task weight across all perspectives (must equal 100 to submit)
const totalGoalWeight = (perspectives) =>
  perspectives.reduce((sum, p) => sum + p.objectives.reduce((os, o) =>
    os + (o.goals || []).reduce((gs, g) =>
      gs + (g.tasks && g.tasks.length
        ? g.tasks.reduce((ts, t) => ts + (Number(t.weight) || 0), 0)
        : (Number(g.weight) || 0)), 0), 0), 0);

Object.assign(window, {
  perfId, OBJECTIVE_SCORE_PCT, BEHAVIOURAL_SCORE_PCT, COMPETENCY_LEVELS,
  PERF_ME, PERF_PERIODS, DEPT_PERSPECTIVES, PERF_OBJECTIVES,
  objectivesForPerspective, kpisForObjective, PERF_COMPETENCIES, competenciesForLevel,
  APPROVAL_VARIANT, sampleGoalData, fmtDate, GOAL_ROWS,
  blankPerfObjective, blankGoalForm, totalGoalWeight,
});
