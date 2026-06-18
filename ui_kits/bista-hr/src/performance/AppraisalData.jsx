// BISTA HR · performance/AppraisalData — performance-appraisal scoring data.
// Appraisals derive from APPROVED goals: each task is scored by the employee (Assessee)
// and the line manager (Assessor) via a Ranking → Rating (1..N) → Score = weight/100 × rating.
// Mirrors the codebase performance-appraisal module (PerspectiveScoreStep + columns).
let APR_SEQ = 5000;
const aprId = () => ++APR_SEQ;

// performance ratings, sorted low → high; rating value = index + 1
const PERF_RATINGS = [
  { id: "rt-1", name: "Poor", color: "#EF4444", min: 0, max: 39 },
  { id: "rt-2", name: "Needs Improvement", color: "#F97316", min: 40, max: 59 },
  { id: "rt-3", name: "Satisfactory", color: "#F59E0B", min: 60, max: 74 },
  { id: "rt-4", name: "Very Good", color: "#3B82F6", min: 75, max: 89 },
  { id: "rt-5", name: "Outstanding", color: "#10B981", min: 90, max: 100 },
];
const rankingInfo = (name) => {
  const i = PERF_RATINGS.findIndex((r) => r.name === name);
  if (i === -1) return { name: "Pending", color: "#6B7280", rating: 0 };
  return { name: PERF_RATINGS[i].name, color: PERF_RATINGS[i].color, rating: i + 1 };
};
const scoreFor = (rankName, weight) => {
  const r = rankingInfo(rankName).rating;
  return Number(((Number(weight) / 100) * r).toFixed(2));
};

// appraisal status → StatusBadge variant + label
const APPRAISAL_STATUS = {
  "not-started": { variant: "default", text: "Not Started" },
  "in-progress": { variant: "pending", text: "In Progress" },
  submitted: { variant: "review", text: "Submitted" },
  completed: { variant: "completed", text: "Completed" },
};
// action label + wizard mode from a status (per role)
const appraisalAction = (status) => {
  if (status === "not-started") return { label: "Start Appraisal", mode: "create" };
  if (status === "in-progress") return { label: "Continue Appraisal", mode: "update" };
  return null; // submitted / completed → read-only
};

// flatten a goal's perspectives → per-perspective scored task rows
const buildAppraisalPerspectives = (seed, employeeName, managerName, prefill) =>
  seed.map((p) => {
    const tasks = [];
    p.objectives.forEach((o) => (o.goals || []).forEach((g) => (g.tasks || []).forEach((t) => {
      const base = { id: aprId(), taskName: t.task, objective: o.objective, kpi: t.kpi, weight: t.weight, annualTarget: t.target,
        employeeName, managerName, employeeRanking: "", employeeRating: 0, employeeScore: 0, managerRanking: "", managerRating: 0, managerScore: 0, employeeComment: "", managerComment: "" };
      if (prefill === "employee" || prefill === "both") {
        const rk = PERF_RATINGS[3 + (t.weight % 2)].name; // Very Good / Outstanding
        base.employeeRanking = rk; base.employeeRating = rankingInfo(rk).rating; base.employeeScore = scoreFor(rk, t.weight);
      }
      if (prefill === "both") {
        const rk = PERF_RATINGS[2 + (t.weight % 3)].name;
        base.managerRanking = rk; base.managerRating = rankingInfo(rk).rating; base.managerScore = scoreFor(rk, t.weight);
      }
      tasks.push(base);
    })));
    return { perspectiveId: p.perspectiveId, perspectiveName: p.perspectiveName, perspectiveWeight: p.perspectiveWeight, tasks };
  });

// appraisal rows — My Appraisals (isAppraisee) + Appraisals to review (isReviewer)
const APPRAISAL_ROWS = [
  { id: aprId(), employeeId: PERF_ME.id, employeeName: PERF_ME.name, employeeNumber: PERF_ME.employeeNumber,
    designation: PERF_ME.designation, department: PERF_ME.department, branch: PERF_ME.branch, appraiser: PERF_ME.appraiser,
    isAppraisee: true, isReviewer: false, userRole: "employee",
    appraisalYear: 2026, periodId: "per-2026-h1", startDate: "2026-01-01", endDate: "2026-06-30",
    status: "in-progress", reviewStatus: null, createdAt: "2026-06-25", competencyLevel: 3,
    perspectives: buildAppraisalPerspectives(sampleGoalData(), PERF_ME.name, PERF_ME.appraiser, "employee") },
  { id: aprId(), employeeId: PERF_ME.id, employeeName: PERF_ME.name, employeeNumber: PERF_ME.employeeNumber,
    designation: PERF_ME.designation, department: PERF_ME.department, branch: PERF_ME.branch, appraiser: PERF_ME.appraiser,
    isAppraisee: true, isReviewer: false, userRole: "employee",
    appraisalYear: 2025, periodId: "per-2025-h2", startDate: "2025-07-01", endDate: "2025-12-31",
    status: "completed", reviewStatus: null, createdAt: "2025-12-20", competencyLevel: 3,
    perspectives: buildAppraisalPerspectives(sampleGoalData(), PERF_ME.name, PERF_ME.appraiser, "both") },
  // a submitted self-appraisal (covers the "submitted" status sample)
  { id: aprId(), employeeId: PERF_ME.id, employeeName: PERF_ME.name, employeeNumber: PERF_ME.employeeNumber,
    designation: PERF_ME.designation, department: PERF_ME.department, branch: PERF_ME.branch, appraiser: PERF_ME.appraiser,
    isAppraisee: true, isReviewer: false, userRole: "employee",
    appraisalYear: 2026, periodId: "per-2026-h2", startDate: "2026-07-01", endDate: "2026-12-31",
    status: "submitted", reviewStatus: null, createdAt: "2026-06-28", competencyLevel: 3,
    perspectives: buildAppraisalPerspectives(sampleGoalData(), PERF_ME.name, PERF_ME.appraiser, "employee") },
  // reports to appraise (manager)
  { id: aprId(), employeeId: "emp-2", employeeName: "Yaw Asante", employeeNumber: "BG-3120",
    designation: "Relationship Officer", department: "Retail Banking", branch: "Accra Main", appraiser: PERF_ME.name,
    isAppraisee: false, isReviewer: true, userRole: "manager", reviewStatus: "PendingReview",
    appraisalYear: 2026, periodId: "per-2026-h1", startDate: "2026-01-01", endDate: "2026-06-30",
    status: "not-started", createdAt: "2026-06-26", competencyLevel: 2,
    perspectives: buildAppraisalPerspectives(sampleGoalData(), "Yaw Asante", PERF_ME.name, "employee") },
  { id: aprId(), employeeId: "emp-4", employeeName: "Kojo Antwi", employeeNumber: "BG-2988",
    designation: "Relationship Officer", department: "Retail Banking", branch: "Accra Main", appraiser: PERF_ME.name,
    isAppraisee: false, isReviewer: true, userRole: "manager", reviewStatus: "Reviewed",
    appraisalYear: 2026, periodId: "per-2026-h1", startDate: "2026-01-01", endDate: "2026-06-30",
    status: "completed", createdAt: "2026-06-18", competencyLevel: 3,
    perspectives: buildAppraisalPerspectives(sampleGoalData(), "Kojo Antwi", PERF_ME.name, "both") },
  // an in-progress appraisal to review (covers "in-progress" in the review table)
  { id: aprId(), employeeId: "emp-3", employeeName: "Efua Boateng", employeeNumber: "BG-3144",
    designation: "Teller", department: "Retail Banking", branch: "Accra Main", appraiser: PERF_ME.name,
    isAppraisee: false, isReviewer: true, userRole: "manager", reviewStatus: "PendingReview",
    appraisalYear: 2026, periodId: "per-2026-h1", startDate: "2026-01-01", endDate: "2026-06-30",
    status: "in-progress", createdAt: "2026-06-24", competencyLevel: 1,
    perspectives: buildAppraisalPerspectives(sampleGoalData(), "Efua Boateng", PERF_ME.name, "employee") },
];

Object.assign(window, {
  aprId, PERF_RATINGS, rankingInfo, scoreFor, APPRAISAL_STATUS, appraisalAction,
  buildAppraisalPerspectives, APPRAISAL_ROWS,
});
