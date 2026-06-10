// BISTA HR · leave-admin/data — canonical Leave Management data (admin side).
// This is the SOURCE OF TRUTH for leave configuration; the self-service planner
// (src/leave) consumes the same type names. Kept in plain shapes so future modules
// (payroll, reports) can read them directly. All values are seed/placeholder.

// ---- leave types (rich config rows shown on the Leave Types tab) -----------------------
let LADM_SEQ = 500;
const ladmId = () => ++LADM_SEQ;

const LEAVE_TYPES_DATA = [
  { id: ladmId(), name: "Leave of Absence",   gender: "All",    entitled: false, requiresDocs: false, docsAfter: null, dependent: false, description: "Approved time away without a specific category." },
  { id: ladmId(), name: "Casual Leave",       gender: "All",    entitled: false, requiresDocs: false, docsAfter: null, dependent: false, description: "Short, ad-hoc personal time off." },
  { id: ladmId(), name: "Compassionate Leave",gender: "All",    entitled: false, requiresDocs: false, docsAfter: null, dependent: false, description: "Leave for bereavement or family emergencies." },
  { id: ladmId(), name: "Sick Leave",         gender: "All",    entitled: true,  requiresDocs: false, docsAfter: null, dependent: false, description: "Time off due to illness." },
  { id: ladmId(), name: "Annual Leave",       gender: "All",    entitled: true,  requiresDocs: false, docsAfter: null, dependent: false, description: "Yearly paid vacation entitlement." },
  { id: ladmId(), name: "Maternity Leave",    gender: "Female", entitled: true,  requiresDocs: true,  docsAfter: 30,   dependent: false, description: "Leave for childbirth and recovery." },
  { id: ladmId(), name: "Leave without pay",  gender: "All",    entitled: false, requiresDocs: false, docsAfter: null, dependent: false, description: "Unpaid approved leave." },
];

const LEAVE_TYPE_NAMES = LEAVE_TYPES_DATA.map(t => t.name);
const GENDER_OPTIONS = ["All", "Male", "Female"];
const APPROVAL_ROLES = ["Head of HR", "Line Manager", "Department Head", "Director", "CEO"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const daysInMonth = (m) => [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][MONTHS.indexOf(m)] || 31;

// ---- allocations by job grade ----------------------------------------------------------
// Leave Allocations is DERIVED from the managed Job Grades entity: every available grade
// is listed with its allocated leave days. Days are keyed by leave-type name. A grade with
// no explicit allocation yet falls back to DEFAULT_ALLOC_DAYS; SEED_ALLOC_DAYS holds the
// initial per-grade overrides (keyed by grade NAME so it stays in sync with Job Grades).
const DEFAULT_ALLOC_DAYS = {
  "Annual Leave": 21, "Casual Leave": 10, "Compassionate Leave": 10,
  "Leave of Absence": 0, "Leave without pay": 0, "Maternity Leave": 0, "Sick Leave": 0,
};
const SEED_ALLOC_DAYS = {
  "Grade 1": { ...DEFAULT_ALLOC_DAYS, "Annual Leave": 21 },
  "Grade 2": { ...DEFAULT_ALLOC_DAYS, "Annual Leave": 24 },
  "Grade 3": { ...DEFAULT_ALLOC_DAYS, "Annual Leave": 26 },
  "Grade 4": { ...DEFAULT_ALLOC_DAYS, "Annual Leave": 28 },
};

// ---- admin leave requests (all employees) ----------------------------------------------
const mkReq = (name, start, end, days, status = "pending") =>
  ({ id: ladmId(), name, type: "Annual Leave", start, end, days, status, reason: "Annual leave", reliever: "Kwame Ayim" });
const ADMIN_LEAVE_REQUESTS = [
  mkReq("Janet Smith-Quayson (Mrs)", "2026-03-16", "2026-04-07", 15),
  mkReq("Jojo Owuman Mensah",        "2026-03-16", "2026-03-20", 5),
  mkReq("Benedicta Asamoah",         "2026-03-18", "2026-03-19", 2),
  mkReq("Leticia Derzu Tiere",       "2026-04-20", "2026-05-04", 10),
  mkReq("Ebenezer Ansah",            "2026-03-24", "2026-03-27", 4, "approved"),
  mkReq("Ama Yeboah",                "2026-03-24", "2026-04-01", 7),
  mkReq("Adwoa Boateng",             "2026-03-19", "2026-03-20", 2, "rejected"),
  mkReq("Samuel Opoku",              "2026-03-24", "2026-04-07", 9),
  mkReq("Kwame Asamoah-Gyan",        "2026-03-30", "2026-04-10", 8),
  mkReq("Esther Anim-Dankwa",        "2026-04-01", "2026-04-03", 3, "approved"),
];

// ---- holidays --------------------------------------------------------------------------
const HOLIDAYS_DATA = [
  { id: ladmId(), name: "New Year's Day", month: "January", day: 1 },
  { id: ladmId(), name: "Independence Day", month: "March", day: 6 },
  { id: ladmId(), name: "Founders' Day", month: "August", day: 4 },
];

// ---- leave balances --------------------------------------------------------------------
const mkBal = (employee, entitled, used) =>
  ({ id: ladmId(), employee, type: "Annual Leave", year: 2026, entitled, used, remaining: entitled - used });
const LEAVE_BALANCES = [
  mkBal("Candice Bonsu", 30, 0), mkBal("Maxwell Manu", 30, 4), mkBal("George Kyeremeh", 30, 0),
  mkBal("Augustine Gyasi-Hayford", 30, 12), mkBal("Robert Ampofo", 30, 0), mkBal("Esther Anim-Dankwa", 30, 6),
  mkBal("Candy Owusu", 30, 0), mkBal("Daniel Boateng", 30, 9), mkBal("Patience Owusu", 30, 0),
  mkBal("Sam Addo", 30, 15), mkBal("Ruth Mensah", 30, 0), mkBal("Joel Nyarko", 30, 2),
];

Object.assign(window, {
  ladmId, LEAVE_TYPES_DATA, LEAVE_TYPE_NAMES, GENDER_OPTIONS, APPROVAL_ROLES, MONTHS, daysInMonth,
  DEFAULT_ALLOC_DAYS, SEED_ALLOC_DAYS, ADMIN_LEAVE_REQUESTS, HOLIDAYS_DATA, LEAVE_BALANCES,
});
