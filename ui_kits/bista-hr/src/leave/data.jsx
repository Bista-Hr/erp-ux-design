// BISTA HR · leave/data — shared leave-request data + helpers.
// Deliberately kept standalone so the future admin side (approvals, team leave) can import
// the same shapes. Values here are placeholders; once the Leave module exists they'll be fed
// from real leave types/allocations. Everything is exported on window.

// ---- leave types (placeholder; later sourced from the Leave configuration) -------------
const LEAVE_TYPES = ["Casual Leave", "Sick Leave", "Recommended Leave", "Annual Leave", "Maternity Leave", "Compassionate Leave"];

// ---- balance tiles on the planner landing (placeholder values) -------------------------
// `apply` flags the tiles that link to a pre-typed request. `key` maps Apply → leave type.
const LEAVE_BALANCE = [
  { key: "total",       label: "Total Leave Days",   value: 25 },
  { key: "available",   label: "Days Available",     value: 21 },
  { key: "casual",      label: "Casual Leave",       value: 13, apply: "Casual Leave" },
  { key: "bereavement", label: "Bereavement Leave",  value: 3,  apply: "Bereavement Leave" },
  { key: "sick",        label: "Sick Leave",         value: 4,  apply: "Sick Leave" },
  { key: "pending",     label: "Pending Request",    value: 1 },
];

// ---- relievers / approvers (pull from the Employees directory) -------------------------
const LEAVE_PEOPLE = ["Kwame Ayim", "Franklin Brobbey", "Emmanuel Ansah", "Bright Manu",
  "Samuel Boateng", "Samuel Asante", "Akosua Mensah", "Yaw Boateng", "Ama Serwaa"];

// ---- annual leave schedule = the set of leave PERIODS the employee has planned ----------
// A "request" and a planned "period" share this shape (type/from/to/days/reliever/status).
let LEAVE_SEQ = 200;
const nextLeaveId = () => ++LEAVE_SEQ;

const LEAVE_PERIODS_SEED = [
  { id: nextLeaveId(), type: "Casual Leave", from: "2025-11-20", to: "2025-11-24", reliever: "Kwame Ayim", note: "", status: "pending" },
];

// ---- leave history (resolved past requests; placeholder) -------------------------------
const LEAVE_HISTORY_SEED = [
  { id: nextLeaveId(), date: "2025-09-12", type: "Recommended Leave", days: 1, pendingTime: "—" },
];

// ---- status display map (reused by landing card + admin approvals) ----------------------
const LEAVE_STATUS = {
  pending:  { variant: "pending",  text: "Pending Approval" },
  approved: { variant: "approved", text: "Approved" },
  rejected: { variant: "rejected", text: "Rejected" },
};

// ---- date helpers ----------------------------------------------------------------------
function fmtLeaveDate(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  if (!d) return iso;
  return `${d}/${m}/${y}`;
}
// inclusive day span between two ISO dates (min 1)
function leaveDays(fromIso, toIso) {
  if (!fromIso || !toIso) return 0;
  const a = new Date(fromIso), b = new Date(toIso);
  const n = Math.round((b - a) / 86400000) + 1;
  return n > 0 ? n : 0;
}

Object.assign(window, {
  LEAVE_TYPES, LEAVE_BALANCE, LEAVE_PEOPLE, LEAVE_PERIODS_SEED, LEAVE_HISTORY_SEED,
  LEAVE_STATUS, fmtLeaveDate, leaveDays, nextLeaveId,
});
