// BISTA HR · learning/data — the SINGLE SOURCE OF TRUTH for the Learning & Development module.
// Every L&D screen (admin pillars + the ESS "My Learning" classroom) reads and writes the same
// reactive stores on window.HRStores, so an admin enrollment / course assignment shows up LIVE in
// the employee's classroom — the same pattern Core HR uses for exits / accommodation / circulars.
//
//   window.HRStores.ldNeeds        → Needs Assessment (3-tier) records
//   window.HRStores.ldPrograms     → Program Catalog (instructor-led / hosted programs)
//   window.HRStores.ldEnrollments  → Enrollment records (program ↔ learner, lifecycle status)
//   window.HRStores.ldCourses      → Course library (LXP-style content items)
//   window.HRStores.ldAssignments  → Course assignments → feeds each learner's My Classroom
//   window.HRStores.ldEvaluations  → Kirkpatrick L2/L3/L4 evaluation records
//
// Learner identity = window.ME (the signed-in self-service user, "James Brown").

const LD_ME = (window.ME && window.ME.name) || "James Brown";
const ldToday = () => new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
let LD_SEQ = 4000;
const ldId = () => ++LD_SEQ;

// ---- money: a single program can mix currencies (fee in USD, associated in GHS) ----
const CUR = { GHS: "GHS", USD: "$", GBP: "£" };
const ldMoney = (amount, currency = "GHS") =>
  (currency === "GHS" ? "GHS " : CUR[currency] || (currency + " ")) +
  Number(amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
// rough FX → GHS, for roll-ups only (demo rates)
const FX_TO_GHS = { GHS: 1, USD: 15.4, GBP: 19.6 };
const ldToGhs = (amount, currency = "GHS") => Number(amount || 0) * (FX_TO_GHS[currency] || 1);

// ---- status vocab (mirrors the app's enum-style statuses) ----
// Enrollment lifecycle: Invited → Confirmed (acknowledged) / Declined ; Waitlisted ; Attended ; No-show
const LD_ENROLL_STATUS = ["Invited", "Confirmed", "Declined", "Waitlisted", "Attended", "No-show"];
const LD_ENROLL_VARIANT = {
  Invited: "pending", Confirmed: "approved", Declined: "rejected",
  Waitlisted: "draft", Attended: "completed", "No-show": "cancelled",
};
const LD_COURSE_VARIANT = { "Not Started": "draft", "In Progress": "pending", Completed: "completed" };
const LD_PROGRAM_VARIANT = { Draft: "draft", Scheduled: "info", Open: "open", "In Progress": "pending", Completed: "completed", Closed: "closed" };
const LD_TIER = {
  "Tier 1": { label: "Strategic / Mandatory", color: "#375DFB", tint: "#F4F7FF" },
  "Tier 2": { label: "Department / Academy", color: "#C2540A", tint: "var(--brand-yellow-tint)" },
  "Tier 3": { label: "Individual / IDP", color: "#007839", tint: "var(--success-tint)" },
};

// directory of learners we can enroll (reuse the shared employee directory + the ESS user) ----
const LD_LEARNERS = (() => {
  const dir = window.EMPLOYEE_DIRECTORY || {};
  const names = Object.keys(dir);
  // ensure the signed-in ESS user is enrollable so their classroom is populated
  if (!names.includes(LD_ME)) {
    dir[LD_ME] = { staffId: (window.ME && window.ME.code) || "EMP100", title: (window.ME && window.ME.role) || "Accountant",
      grade: "Grade 2", dept: (window.ME && window.ME.dept) || "Finance", zone: "South Zone", branch: "Accra", salary: "GHS 5,400.00", rating: "Very Good" };
    names.unshift(LD_ME);
  }
  return names;
})();

/* ================= PROGRAM CATALOG seed =================
   mode: "In-person" | "Online" | "Hybrid"  (Online == Virtual).
   Online/Hybrid carry a meetingLink (platform auto-detected); In-person/Hybrid carry a
   locationLink (Google-Maps URL or address). Status is DERIVED from the dates, never stored. */
const cost = (fee, feeCur, assoc) => ({ directFee: { amount: fee, currency: feeCur }, associated: assoc || [] });
const LD_PROGRAM_SEED = [
  { id: 301, code: "AML-2026", title: "Anti-Money Laundering & CFT", tier: "Tier 1", category: "Compliance / Mandatory",
    provider: "Internal — Compliance", mode: "Online", recurring: true,
    objectives: "Recognise, prevent and report money-laundering and terrorist-financing risk in line with BoG directives.",
    startDate: "Jun 22, 2026", endDate: "Jun 23, 2026", dueDate: "Jun 30, 2026", venue: "MS Teams", seats: 250, mandatory: true,
    meetingLink: "https://teams.microsoft.com/l/meetup-join/aml-2026", coordinator: "Bright Manu",
    cost: cost(0, "GHS", [{ label: "Facilitator", amount: 6000, currency: "GHS" }]) },
  { id: 302, code: "CYB-2026", title: "Cybersecurity Awareness", tier: "Tier 1", category: "Compliance / Mandatory",
    provider: "External — Intuition", mode: "Online", recurring: true,
    objectives: "Build a security-first culture: phishing, social engineering, data handling and incident reporting.",
    startDate: "Jun 15, 2026", endDate: "Jul 15, 2026", dueDate: "Jul 15, 2026", venue: "Intuition LMS", seats: 1200, mandatory: true,
    meetingLink: "https://intuition.com/lms/cyber", coordinator: "",
    cost: cost(12, "USD", [{ label: "Platform licence (per seat)", amount: 12, currency: "USD" }]) },
  { id: 303, code: "LEAD-26", title: "Leadership Development Programme", tier: "Tier 1", category: "Strategic Focus",
    provider: "National Banking College", mode: "In-person",
    objectives: "Equip emerging leaders with strategy, people management and change-leadership capability.",
    startDate: "Jul 06, 2026", endDate: "Jul 10, 2026", dueDate: "Jul 10, 2026", venue: "NBC, Accra", seats: 30, mandatory: false,
    locationLink: "https://maps.google.com/?q=National+Banking+College+Accra", coordinator: LD_ME,
    cost: cost(4500, "GHS", [{ label: "Residential & meals", amount: 8000, currency: "GHS" }, { label: "Transport", amount: 2400, currency: "GHS" }]) },
  { id: 304, code: "CRED-26", title: "Credit Risk & Analysis — Credit Academy", tier: "Tier 2", category: "Department Academy",
    provider: "Internal — Credit Academy", mode: "In-person",
    objectives: "Department academy bundle: credit appraisal, risk rating, collateral and portfolio management.",
    startDate: "Jul 14, 2026", endDate: "Jul 18, 2026", dueDate: "Jul 18, 2026", venue: "Head Office, Training Room 2", seats: 40, mandatory: false,
    locationLink: "https://maps.google.com/?q=GCB+Head+Office+Accra", coordinator: "Franklin Brobbey",
    cost: cost(2800, "GHS", [{ label: "Materials", amount: 600, currency: "GHS" }]) },
  { id: 305, code: "ISLB-26", title: "Islamic / Non-Interest Banking", tier: "Tier 1", category: "Strategic Focus",
    provider: "External — Islamic Finance Institute", mode: "Hybrid",
    objectives: "Build capacity for the bank's non-interest banking window: Shariah principles, products and compliance.",
    startDate: "Aug 04, 2026", endDate: "Aug 06, 2026", dueDate: "Aug 06, 2026", venue: "Zoom + Head Office", seats: 60, mandatory: false,
    meetingLink: "https://zoom.us/j/9876543210", locationLink: "https://maps.google.com/?q=GCB+Head+Office+Accra", coordinator: "",
    cost: cost(900, "GBP", []) },
  { id: 306, code: "CXE-26", title: "Customer Experience Excellence", tier: "Tier 2", category: "Department Academy",
    provider: "Internal — Retail Academy", mode: "In-person",
    objectives: "Service standards, complaint handling and turnaround for frontline retail staff.",
    startDate: "May 12, 2026", endDate: "May 13, 2026", dueDate: "May 13, 2026", venue: "Kumasi Branch Hall", seats: 50, mandatory: false,
    locationLink: "https://maps.google.com/?q=GCB+Kumasi+Branch", coordinator: "Aaron Appiah",
    cost: cost(1500, "GHS", [{ label: "Refreshments", amount: 900, currency: "GHS" }]) },
  { id: 307, code: "EXC-26", title: "Advanced Excel for Bankers", tier: "Tier 3", category: "Individual / IDP",
    provider: "External — Percipio", mode: "Online",
    objectives: "From an IDP development gap: data analysis, pivot tables, dashboards and financial modelling.",
    startDate: "Jun 10, 2026", endDate: "Jul 31, 2026", dueDate: "Jul 31, 2026", venue: "Percipio (deep-link)", seats: 200, mandatory: false,
    meetingLink: "https://percipio.com/courses/excel", coordinator: "",
    cost: cost(0, "GHS", []) },
];

/* ================= ENROLLMENT seed (program ↔ learner) ================= */
const enr = (programId, learner, status, extra) => {
  const e = (window.EMPLOYEE_DIRECTORY || {})[learner] || {};
  return { id: ldId(), programId, learner, staffId: e.staffId || "—", dept: e.dept || "—", grade: e.grade || "—",
    status, source: "Selected", invitedOn: "Jun 02, 2026", ...extra };
};
const LD_ENROLLMENT_SEED = [
  enr(303, "Aaron Appiah", "Confirmed"), enr(303, "Aba Odum", "Invited"),
  enr(303, "Bright Manu", "Confirmed"), enr(303, "Emmanuel Ansah", "Declined", { declineReason: "On approved annual leave during the program dates." }),
  enr(303, "Samuel Boateng", "Waitlisted", { source: "IDP interest" }),
  enr(304, "Franklin Brobbey", "Confirmed"), enr(304, "Samuel Asante", "Invited"),
  enr(306, "Bright Manu", "Attended"), enr(306, "Aaron Appiah", "Attended"), enr(306, "Aba Odum", "No-show"),
  enr(301, LD_ME, "Invited", { source: "Bulk · All staff" }),
  enr(303, LD_ME, "Confirmed"),
];

/* ================= COURSE LIBRARY seed (interactive, section-based) =================
   A course = ordered sections. A section is one of: content · quiz · form.
   Content items: video (with optional YouTube/file url) · document (downloadable file) · link · post (rich text).
   Thumbnails use deterministic photos (picsum) so the demo looks polished out of the box. */
const item = (type, title, meta) => ({ id: ldId(), type, title, meta });
const vid = (title, meta, url) => ({ id: ldId(), type: "video", title, meta, url });
const docItem = (title, file) => ({ id: ldId(), type: "document", title, meta: `${file.size} · ${file.ext}`, file });
const sContent = (title, items) => ({ id: ldId(), type: "content", title, items });
const sQuiz = (title, passMark, questions) => ({ id: ldId(), type: "quiz", title, passMark, questions });
const sForm = (title, description, fields) => ({ id: ldId(), type: "form", title, description, fields });
const qz = (prompt, options, correct) => ({ id: ldId(), prompt, options, correct });
const fld = (label, kind, required, extra) => ({ id: ldId(), label, kind, required: !!required, ...(extra || {}) });
const thumb = (seed) => `https://picsum.photos/seed/${seed}/720/405`;
const YT = "https://youtu.be/r3rOILZpKHQ";
const MP4 = "https://test-videos.co.uk/vids/bigbuckbunny/mp4/av1/360/Big_Buck_Bunny_360_10s_1MB.mp4";

const LD_COURSE_SEED = [
  { id: 401, title: "AML & CFT Essentials", source: "Internal", category: "Compliance", thumbnail: thumb("gcb-aml"),
    summary: "Core money-laundering red flags, KYC obligations and the bank's reporting workflow.",
    sections: [
      sContent("Module 1 · Fundamentals", [
        vid("What is money laundering?", "8 min", YT), vid("Recognising suspicious transactions", "12 min", MP4),
        docItem("SAR Reporting Guide", { name: "SAR-Reporting-Guide.pdf", ext: "PDF", size: "820 KB" }),
        { id: ldId(), type: "post", title: "Key takeaways & your obligations", meta: "3 min read",
          html: "<h3>Your obligations at a glance</h3><p>As a member of staff, you are the bank's <strong>first line of defence</strong> against money laundering. Three duties matter most:</p><ul><li><strong>Know Your Customer (KYC):</strong> verify identity and keep records current.</li><li><strong>Stay alert:</strong> watch for structuring, unusual transfers and mismatched documents.</li><li><strong>Report promptly:</strong> escalate anything suspicious to the Compliance/AML unit via a SAR — never tip off the customer.</li></ul><p>When in doubt, <em>report</em>. A false alarm is far cheaper than a missed one.</p>" }
      ]),
      sQuiz("Knowledge Check", 70, [
        qz("Which of these is a red flag for money laundering?", ["A customer makes a single small deposit", "Structuring deposits just under the reporting threshold", "Using a debit card at an ATM", "Requesting a bank statement"], 1),
        qz("A suspicious transaction must be reported to…", ["The customer", "The branch manager only", "The Compliance / AML unit via a SAR", "No one"], 2),
        qz("KYC stands for…", ["Know Your Customer", "Keep Your Cash", "Knowledge Yield Curve", "Key Yearly Compliance"], 0) ]),
      sForm("Declaration & Feedback", "Confirm your understanding and share feedback with Compliance.", [
        fld("I confirm I have completed this course and will apply the bank's AML policy.", "yes-no", true),
        fld("Which area is most relevant to your role?", "single-select", true, { options: ["Branch operations", "Credit", "Trade finance", "Treasury", "Other"] }),
        fld("Which red flags do you encounter most? (select all)", "multi-select", false, { options: ["Structuring", "Unusual wire transfers", "PEP activity", "Cash-intensive business", "Mismatched documents"] }),
        fld("Any questions for the Compliance team?", "long-text", false, { placeholder: "Optional" }) ]) ] },
  { id: 402, title: "Cybersecurity for Bankers", source: "Intuition", category: "Compliance", thumbnail: thumb("gcb-cyber"),
    summary: "Phishing, password hygiene, safe data handling and how to report an incident.",
    sections: [
      sContent("Module 1 · Threats", [ vid("Spotting a phishing email", "6 min", YT), vid("Protecting customer data", "9 min", MP4), item("link", "Intuition module (deep-link)", "External link") ]),
      sQuiz("Phishing Check", 80, [
        qz("An email asks you to 'verify your password' via a link. You should…", ["Click and enter it quickly", "Forward it to a colleague", "Report it to IT Security and not click", "Reply with your password"], 2),
        qz("The safest password is…", ["Your name + 123", "A long unique passphrase", "The same one everywhere", "Your date of birth"], 1) ]),
      sForm("Incident Acknowledgement", "Tell us how you'll apply this.", [
        fld("How confident are you spotting a phishing attempt?", "rating", true),
        fld("I know how to report a security incident.", "yes-no", true),
        fld("Upload your signed security policy (optional)", "file", false) ]) ] },
  { id: 403, title: "Advanced Excel for Bankers", source: "Percipio", category: "Productivity", thumbnail: thumb("gcb-excel"),
    summary: "Pivot tables, lookup functions, dashboards and lightweight financial modelling.",
    sections: [
      sContent("Module 1 · Core skills", [ vid("Pivot tables in 15 minutes", "15 min", YT), docItem("Practice workbook", { name: "Practice-workbook.xlsx", ext: "XLSX", size: "240 KB" }), vid("Building a simple dashboard", "18 min", YT) ]),
      sForm("Reflection", "How will you use this?", [
        fld("Which feature will save you the most time?", "single-select", true, { options: ["Pivot tables", "XLOOKUP", "Dashboards", "Conditional formatting"] }),
        fld("Describe one report you'll improve with Excel.", "long-text", false) ]) ] },
  { id: 404, title: "Customer Experience Excellence", source: "Internal", category: "Retail", thumbnail: thumb("gcb-cx"),
    summary: "Service standards, complaint handling and frontline turnaround.",
    sections: [
      sContent("Module 1 · The service mindset", [ item("video", "The service mindset", "10 min"), item("document", "Service standards guide", "800 KB"), item("text", "Handling difficult conversations", "4 min read") ]),
      sQuiz("Service Check", 70, [
        qz("A customer is upset about a delayed transaction. First, you…", ["Tell them it's not your fault", "Listen and acknowledge their concern", "Ask them to come back later", "Ignore it"], 1),
        qz("Service turnaround is best improved by…", ["Blaming other branches", "Clear ownership and follow-up", "Avoiding the customer", "Longer queues"], 1) ]),
      sForm("Action Commitment", "Commit to one service improvement.", [
        fld("My service commitment for this quarter", "short-text", true),
        fld("Target date", "date", false) ]) ] },
];

/* ================= COURSE ASSIGNMENT seed → feeds My Classroom =================
   Progress is section-based: doneSections holds completed section ids; quizScores / formResponses
   capture learner submissions. progress% is derived from doneSections / total sections. */
const asg = (courseId, learner, status, doneCount, due, extra) => {
  const course = LD_COURSE_SEED.find(c => c.id === courseId) || { sections: [] };
  const sections = course.sections || [];
  const doneSections = sections.slice(0, doneCount).map(s => s.id);
  const progress = sections.length ? Math.round((doneSections.length / sections.length) * 100) : 0;
  return { id: ldId(), courseId, learner, status, progress, due, assignedOn: "Jun 02, 2026",
    doneSections, viewed: {}, quizScores: {}, formResponses: {}, ...(extra || {}) };
};
const LD_ASSIGNMENT_SEED = [
  // the signed-in ESS user's classroom
  asg(401, LD_ME, "In Progress", 1, "Jun 30, 2026"),
  asg(402, LD_ME, "Not Started", 0, "Jul 15, 2026"),
  asg(403, LD_ME, "Completed", 3, "Jun 12, 2026"),
  asg(404, LD_ME, "In Progress", 2, "Jun 20, 2026"),
  // a few others (so admin tracking shows a realistic spread)
  asg(401, "Bright Manu", "Completed", 4, "Jun 30, 2026"),
  asg(401, "Aba Odum", "In Progress", 2, "Jun 30, 2026"),
  asg(401, "Franklin Brobbey", "Not Started", 0, "Jun 30, 2026"),
  asg(403, "Samuel Boateng", "In Progress", 1, "Jul 31, 2026"),
];

/* ================= NEEDS ASSESSMENT seed (3 tiers) ================= */
const LD_NEEDS_SEED = [
  { id: 501, tier: "Tier 1", title: "Anti-Money Laundering & CFT", createdBy: "L&D / Compliance", area: "Bank-wide",
    rationale: "Regulatory mandatory — annual recurring compliance requirement (BoG).", priority: "Must", target: "All staff", status: "Mapped", linkedProgram: "AML & CFT" },
  { id: 502, tier: "Tier 1", title: "Cybersecurity Awareness", createdBy: "L&D / IT Security", area: "Bank-wide",
    rationale: "Mandatory security culture; recurring yearly.", priority: "Must", target: "All staff", status: "Mapped", linkedProgram: "Cybersecurity Awareness" },
  { id: 503, tier: "Tier 1", title: "Islamic / Non-Interest Banking capacity", createdBy: "L&D / Strategy", area: "Strategic",
    rationale: "Management decision — build capacity for the new non-interest banking window.", priority: "Should", target: "Selected units", status: "Open", linkedProgram: "—" },
  { id: 504, tier: "Tier 2", title: "Build data-analytics capacity (Operations)", createdBy: "Head, Operations", area: "Operations",
    rationale: "Problem to solve: reduce manual reporting and improve MI turnaround.", priority: "Should", target: "Operations dept", status: "Under review", linkedProgram: "Advanced Excel" },
  { id: 505, tier: "Tier 2", title: "Credit appraisal depth (Credit Academy)", createdBy: "Head, Credit", area: "Credit",
    rationale: "Department academy — strengthen credit risk capability across the unit.", priority: "Must", target: "Credit dept", status: "Mapped", linkedProgram: "Credit Risk & Analysis" },
  { id: 506, tier: "Tier 3", title: "Advanced Excel — Franklin Brobbey", createdBy: "IDP", area: "Formal Training (70-20-10)",
    rationale: "IDP development gap; selected formal-training intervention.", priority: "Should", target: "Franklin Brobbey", status: "Mapped", linkedProgram: "Advanced Excel" },
  { id: 507, tier: "Tier 3", title: "Coaching / mentoring — Aba Odum", createdBy: "IDP", area: "Coaching & Mentoring (70-20-10)",
    rationale: "IDP selected coaching/mentoring — surfaced for pairing oversight.", priority: "Could", target: "Aba Odum", status: "Open", linkedProgram: "—" },
];

/* ================= EVALUATION seed (Kirkpatrick L2/L3/L4) ================= */
const LD_EVAL_SEED = [
  { id: 601, programId: 306, learner: "Bright Manu", program: "Customer Experience Excellence",
    l2Pre: 45, l2Post: 82, l3Status: "In Progress", l3Actions: 3, l3Done: 1,
    l4LearnerScore: 4, l4ManagerScore: 4, impactCategory: "Improved customer experience", stage: "Application (L3)" },
  { id: 602, programId: 306, learner: "Aaron Appiah", program: "Customer Experience Excellence",
    l2Pre: 52, l2Post: 88, l3Status: "Completed", l3Actions: 3, l3Done: 3,
    l4LearnerScore: 5, l4ManagerScore: 4, impactCategory: "Faster turnaround", stage: "Impact (L4)" },
  { id: 603, programId: 303, learner: LD_ME, program: "Leadership Development Programme",
    l2Pre: null, l2Post: null, l3Status: "Not Started", l3Actions: 0, l3Done: 0,
    l4LearnerScore: null, l4ManagerScore: null, impactCategory: "—", stage: "Learning (L2)" },
];

// ---- create the reactive stores (single source of truth) ----
window.HRStores = window.HRStores || {};
const ldStore = (key, seed) => { if (!window.HRStores[key]) window.HRStores[key] = makeStore(seed); return window.HRStores[key]; };
ldStore("ldNeeds", LD_NEEDS_SEED);
ldStore("ldPrograms", LD_PROGRAM_SEED);
ldStore("ldEnrollments", LD_ENROLLMENT_SEED);
ldStore("ldCourses", LD_COURSE_SEED);
ldStore("ldAssignments", LD_ASSIGNMENT_SEED);
ldStore("ldEvaluations", LD_EVAL_SEED);

// program total cost (in GHS, for roll-ups) + a readable per-currency breakdown
function ldProgramTotalGhs(p) {
  if (!p || !p.cost) return 0;
  const c = p.cost;
  let t = ldToGhs(c.directFee.amount, c.directFee.currency);
  (c.associated || []).forEach(a => { t += ldToGhs(a.amount, a.currency); });
  return t;
}

// program status is DERIVED from its dates (never stored): Draft → Scheduled → In Progress → Completed
function ldParseDate(s) { if (!s) return null; const d = new Date(s); return isNaN(d) ? null : d; }
function ldProgramStatus(p) {
  if (!p) return "Draft";
  const start = ldParseDate(p.startDate), end = ldParseDate(p.endDate) || start, due = ldParseDate(p.dueDate) || end;
  if (!start) return "Draft";
  const now = new Date();
  if (now < start) return "Scheduled";
  if (end && now > (due || end)) return "Completed";
  return "In Progress";
}
// auto-detect the virtual platform from a meeting URL → key + label (logo rendered by PlatformLogo)
function ldMeetingPlatform(url) {
  const u = String(url || "").toLowerCase();
  if (!u) return null;
  if (/teams\.microsoft|teams\.live|teams\.|microsoft/.test(u)) return { key: "teams", name: "Microsoft Teams", color: "#5059C9" };
  if (/zoom\./.test(u)) return { key: "zoom", name: "Zoom", color: "#2D8CFF" };
  if (/meet\.google|hangouts/.test(u)) return { key: "meet", name: "Google Meet", color: "#00897B" };
  if (/webex/.test(u)) return { key: "webex", name: "Webex", color: "#16A98D" };
  if (/whatsapp|wa\.me|chat\.whatsapp/.test(u)) return { key: "whatsapp", name: "WhatsApp", color: "#25D366" };
  if (/facebook|fb\.me|fb\.com|messenger/.test(u)) return { key: "facebook", name: "Facebook", color: "#1877F2" };
  if (/youtube|youtu\.be/.test(u)) return { key: "youtube", name: "YouTube Live", color: "#FF0000" };
  if (/intuition|percipio|skillsoft|coursera|udemy/.test(u)) return { key: "online", name: "Hosted platform", color: "#6941C6" };
  return { key: "online", name: "Online", color: "var(--brand-blue)" };
}

Object.assign(window, {
  LD_ME, ldToday, ldId, ldMoney, ldToGhs, ldProgramTotalGhs, ldProgramStatus, ldMeetingPlatform, CUR, FX_TO_GHS,
  LD_ENROLL_STATUS, LD_ENROLL_VARIANT, LD_COURSE_VARIANT, LD_PROGRAM_VARIANT, LD_TIER, LD_LEARNERS,
});
