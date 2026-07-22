// BISTA HR · exit/Exit — People & Culture ▸ Employee Exit.
// Mirrors the production employee-exit flow (components/employee-exit/*):
//   ExitList     : list + versatile filter (Status incl. Cancelled · Exit Type · Department · Channel).
//   ExitForm     : full-page Initiate / Edit Employee Exit (edit only while Pending).
//   ExitDetails  : "Exit Processing" — header actions driven by deriveExitUi (Edit Details ·
//                  Cancel Exit · Approve & Process · Close Exit Process), Workflow Status card
//                  hosting Audit Trail + "Clearance n/m" (drawer checklist, locked until the
//                  exit is In Progress), a state-aware Exit Interview card (schedule/reschedule
//                  dialog, Mark Completed, resolved empty copy per status/role), and a
//                  Cancellation Reason fallback card when the workflow is absent (cancelled).
// EVERY permission/state decision is made ONCE in deriveExitUi — render code never
// re-combines raw booleans (same rule as the app's deriveExitDetailUi).
const { useState: useEx, useEffect: useExEffect } = React;

let EX_SEQ = 950;
const exId = () => ++EX_SEQ;
const todayEx = () => new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

// Exit types → classification + whether an exit interview applies (resignation & retirement only).
const EXIT_TYPES = [
  { value: "Resignation",     classification: "Voluntary",   interview: true,  icon: "logout-box-r-line" },
  { value: "Retirement",      classification: "Involuntary", interview: true,  icon: "user-heart-line" },
  { value: "Deceased",        classification: "Involuntary", interview: false, icon: "service-line" },
  { value: "Termination",     classification: "Involuntary", interview: false, icon: "user-unfollow-line" },
  { value: "Vacation of Post", classification: "Involuntary", interview: false, icon: "user-forbid-line" },
  { value: "Dismissal",       classification: "Involuntary", interview: false, icon: "close-circle-line" },
];
const exitMeta = (type) => EXIT_TYPES.find(t => t.value === type) || EXIT_TYPES[0];

const EX_STATUS_VARIANT = { Pending: "pending", "In Progress": "draft", Cleared: "success", Closed: "past", Cancelled: "rejected" };

// Clearance checklist template (workflow steps 8–15). Each item names its responsible party.
const CLEARANCE_TEMPLATE = [
  { key: "indebtedness", label: "Indebtedness & Final Settlement Spooling", party: "Payroll / Finance / P&C", icon: "money-dollar-circle-line" },
  { key: "leaveCash",    label: "Annual Leave Cash Impact Quantified",       party: "System / Core HR",        icon: "calendar-check-line" },
  { key: "assets",       label: "Asset Return / Retention",                  party: "Line Manager / BOBS / Admin", icon: "archive-2-line" },
  { key: "physical",     label: "Physical Access Revocation",               party: "BOBS / Security / Facilities", icon: "door-lock-line" },
  { key: "electronic",   label: "Electronic Access Revocation",             party: "S&IT",                    icon: "shield-keyhole-line" },
  { key: "coreHr",       label: "Core HR Exit Update",                      party: "HR Operations / Core HR", icon: "database-2-line" },
  { key: "payroll",      label: "Payroll Closure & Final Pay",              party: "Payroll / Comp & Benefits", icon: "bank-card-line" },
  { key: "stakeholder",  label: "Stakeholder Clearance Confirmation",       party: "P&C / Stakeholders",      icon: "team-line" },
];
const freshClearance = (filled = []) => CLEARANCE_TEMPLATE.reduce((a, c) => (a[c.key] = filled.includes(c.key), a), {});
const clearanceDone = (cl) => CLEARANCE_TEMPLATE.every(c => cl[c.key]);
const clearanceCount = (cl) => CLEARANCE_TEMPLATE.filter(c => cl[c.key]).length;
// Audit trail rendering + entry helpers are shared — see shared/PncAuditTrail.jsx.

/* ---------- deriveExitUi — every decision, once (mirrors app deriveExitDetailUi) ---------- */
// The mock viewer is the P&C admin (all permission flags true, never the exit's subject).
// Flip these to preview another role.
const EXIT_PERSONA = { canUpdate: true, canApprove: true, canProcess: true, canClose: true, canCancel: true, isSubject: false };
const deriveExitUi = (exit, p = EXIT_PERSONA) => {
  const cancelled = exit.status === "Cancelled";
  const closed = exit.status === "Closed" || cancelled;
  const isPending = exit.status === "Pending";
  const isProcessing = exit.status === "In Progress";
  const allClear = clearanceDone(exit.clearance);
  // The admin persona is the initiator of P&C-raised exits only.
  const isInitiator = exit.source === "P&C/P&CBP";
  const notParty = !isInitiator && !p.isSubject;

  const required = !!exit.interviewRequired;
  const scheduled = !!exit.interviewDate;
  const completed = !!exit.interviewDone;
  // An admin who can update the exit may schedule even when "requires interview"
  // is false — saving the schedule then marks the interview as required.
  const canSchedule = !closed && !p.isSubject && (required ? p.canProcess : p.canUpdate);
  const canComplete = !closed && !p.isSubject && required && scheduled && p.canProcess;
  let emptyMessage;
  if (cancelled) emptyMessage = "This exit was cancelled before an exit interview was scheduled.";
  else if (closed) emptyMessage = "The exit process was closed without an exit interview.";
  else if (p.isSubject) emptyMessage = "An exit interview is required. People & Culture will schedule it and share the date, time and location or meeting link with you.";
  else if (canSchedule) emptyMessage = required
    ? "An exit interview is required. Schedule it to set the date, time and location or meeting link."
    : "No exit interview was required for this exit — scheduling one will mark the interview as required.";
  else emptyMessage = "An exit interview is required but has not been scheduled yet.";

  return {
    closed, cancelled, isPending, isProcessing,
    header: {
      // Editing is locked once the exit leaves Pending; only the initiator edits.
      showEdit: isPending && isInitiator && p.canUpdate,
      showCancel: !closed && !p.isSubject && p.canCancel,
      showApproveAndProcess: isPending && p.canApprove && notParty,
      showCloseExit: isProcessing && p.canApprove && notParty,
      closeExitEnabled: allClear,
      closeDisabledReason: allClear ? undefined : "All clearance items must be cleared before the exit process can be closed",
    },
    clearance: {
      // Clearance opens only once the exit is In Progress (backend-enforced in the app).
      unlocked: isProcessing,
      done: allClear,
      canToggle: isProcessing && p.canProcess && !p.isSubject,
      canClearAll: isProcessing && p.canClose && !p.isSubject,
    },
    interview: { show: completed || scheduled || required || canSchedule, completed, scheduled, canSchedule, canComplete, schedulingMarksRequired: !required, emptyMessage },
  };
};

const EXIT_SEED = [
  { id: 1, employee: "Aba Odum", staffId: "EMP-18389", exitType: "Resignation", exitDate: "Jun 30, 2026", dateSubmitted: "May 02, 2026",
    reason: "Better Opportunity", note: "Accepted a senior role at another institution; serving one-month notice.",
    title: "Data Scientist", dept: "Information Technology", branch: "Ridge", zone: "Accra West", grade: "Grade 5",
    source: "ESS (Employee)", status: "In Progress", interviewRequired: true, interviewDone: true,
    interviewLocation: "P&C Boardroom, Ridge", interviewDate: "Jun 24, 2026", interviewTime: "10:00 AM",
    clearance: freshClearance(["indebtedness", "leaveCash", "assets"]),
    audit: [
      { id: "a1-1", action: 0, description: "Resignation — effective Jun 30, 2026", actorName: "Aba Odum (ESS)", occurredAt: "2026-05-02T09:14:00Z", justificationReason: "Accepted a senior data science role at another institution offering broader responsibility and a clearer growth path. I remain committed to a smooth handover and will serve the full one-month notice period, documenting all in-flight models and dashboards for the team.", staffId: "EMP-18389" },
      { id: "a1-2", action: 2, description: "Exit interview held at P&C Boardroom, Ridge", actorName: "Peter Bosrotsi (P&C)", occurredAt: "2026-06-24T11:05:00Z", justificationReason: null, staffId: "EMP-18389" },
      { id: "a1-3", action: 1, description: "Indebtedness & Final Settlement Spooling marked cleared", actorName: "Peter Bosrotsi (P&C)", occurredAt: "2026-06-25T15:40:00Z", justificationReason: null, staffId: "EMP-18389" },
      { id: "a1-4", action: 1, description: "Annual Leave Cash Impact Quantified marked cleared", actorName: "Peter Bosrotsi (P&C)", occurredAt: "2026-06-26T10:02:00Z", justificationReason: null, staffId: "EMP-18389" },
      { id: "a1-5", action: 1, description: "Asset Return / Retention marked cleared", actorName: "Peter Bosrotsi (P&C)", occurredAt: "2026-06-27T16:18:00Z", justificationReason: null, staffId: "EMP-18389" },
    ],
    documents: ["https://files.bistasol.com/exits/Resignation-Letter.pdf"] },
  { id: 2, employee: "Abass Abdul Mumin", staffId: "EMP-17431", exitType: "Retirement", exitDate: "Aug 15, 2026", dateSubmitted: "Jun 15, 2026",
    reason: "Attained Retirement Age", note: "Auto-triggered two months before attaining 60 years.",
    title: "Branch Support", dept: "Operations", branch: "Cape Coast", zone: "Central Zones", grade: "Grade 3",
    source: "System Auto-Trigger", status: "Pending", interviewRequired: true, interviewDone: false,
    interviewLocation: "", interviewDate: "", interviewTime: "",
    clearance: freshClearance([]),
    audit: [{ id: "a2-1", action: 0, description: "Retirement — effective Aug 15, 2026", actorName: "System Auto-Trigger", occurredAt: "2026-06-15T06:00:00Z", justificationReason: "Auto-triggered two months ahead of the employee attaining the statutory retirement age of 60 years, per the retirement policy.", staffId: "EMP-17431" }],
    documents: ["https://files.bistasol.com/exits/Retirement-Notice.pdf"] },
  { id: 3, employee: "Samuel Boateng", staffId: "EMP-11002", exitType: "Termination", exitDate: "May 20, 2026", dateSubmitted: "May 06, 2026",
    reason: "Performance", note: "Termination following the performance improvement process.",
    title: "Sales Officer", dept: "Marketing", branch: "Kumasi", zone: "West Zone", grade: "Grade 1",
    source: "P&C/P&CBP", status: "Pending", interviewRequired: false, interviewDone: false,
    clearance: freshClearance([]),
    audit: [{ id: "a3-1", action: 0, description: "Termination — effective May 20, 2026", actorName: "Peter Bosrotsi (P&C)", occurredAt: "2026-05-06T14:22:00Z", justificationReason: "Termination following completion of the performance improvement process. Two consecutive PIP cycles closed below the required threshold despite documented coaching, revised targets and weekly check-ins with the line manager.", staffId: "EMP-11002" }],
    documents: ["https://files.bistasol.com/exits/Termination-Approval.pdf"] },
  { id: 4, employee: "Franklin Brobbey", staffId: "EMP-10231", exitType: "Resignation", exitDate: "Mar 31, 2026", dateSubmitted: "Feb 28, 2026",
    reason: "Relocation", note: "Relocating abroad with family.",
    title: "Accountant", dept: "Finance", branch: "Accra", zone: "South Zone", grade: "Grade 2",
    source: "ESS (Employee)", status: "Closed", interviewRequired: true, interviewDone: true,
    interviewLocation: "Microsoft Teams (remote)", interviewDate: "Mar 26, 2026", interviewTime: "2:30 PM",
    clearance: freshClearance(CLEARANCE_TEMPLATE.map(c => c.key)),
    audit: [
      { id: "a4-1", action: 0, description: "Resignation — effective Mar 31, 2026", actorName: "Franklin Brobbey (ESS)", occurredAt: "2026-02-28T08:47:00Z", justificationReason: "Relocating abroad with family.", staffId: "EMP-10231" },
      { id: "a4-2", action: 2, description: "Exit interview held remotely via Microsoft Teams", actorName: "Peter Bosrotsi (P&C)", occurredAt: "2026-03-26T15:10:00Z", justificationReason: null, staffId: "EMP-10231" },
      { id: "a4-3", action: 1, description: "All clearance items marked cleared", actorName: "Peter Bosrotsi (P&C)", occurredAt: "2026-03-30T17:02:00Z", justificationReason: null, staffId: "EMP-10231" },
      { id: "a4-4", action: 5, description: "All clearance points completed — exit process closed.", actorName: "Peter Bosrotsi (P&C)", occurredAt: "2026-03-31T09:00:00Z", justificationReason: null, staffId: "EMP-10231" },
    ],
    audit: [
      { id: "a4-1", action: 0, description: "Resignation — effective Mar 31, 2026", actorName: "Franklin Brobbey (ESS)", occurredAt: "2026-02-28T08:47:00Z", justificationReason: "Relocating abroad with family.", staffId: "EMP-10231" },
      { id: "a4-2", action: 2, description: "Exit interview held remotely via Microsoft Teams", actorName: "Peter Bosrotsi (P&C)", occurredAt: "2026-03-26T15:10:00Z", justificationReason: null, staffId: "EMP-10231" },
      { id: "a4-3", action: 1, description: "All clearance items marked cleared", actorName: "Peter Bosrotsi (P&C)", occurredAt: "2026-03-30T17:02:00Z", justificationReason: null, staffId: "EMP-10231" },
      { id: "a4-4", action: 5, description: "All clearance points completed — exit process closed.", actorName: "Peter Bosrotsi (P&C)", occurredAt: "2026-03-31T09:00:00Z", justificationReason: null, staffId: "EMP-10231" },
    ],
    documents: ["https://files.bistasol.com/exits/Resignation-Letter.pdf", "https://files.bistasol.com/exits/Clearance-Form.pdf"] },
  { id: 5, employee: "Efua Mensimah", staffId: "EMP-14567", exitType: "Resignation", exitDate: "Jul 15, 2026", dateSubmitted: "Jun 01, 2026",
    reason: "Personal Reasons", note: "",
    title: "Customer Service Officer", dept: "Operations", branch: "Tema", zone: "Accra East", grade: "Grade 2",
    source: "ESS (Employee)", status: "Cancelled", cancelReason: "Employee rescinded the resignation after counter-offer discussions with the line manager.",
    interviewRequired: true, interviewDone: false, interviewLocation: "", interviewDate: "", interviewTime: "",
    clearance: freshClearance([]),
    audit: [
      { id: "a5-1", action: 0, description: "Resignation — effective Jul 15, 2026", actorName: "Efua Mensimah (ESS)", occurredAt: "2026-06-01T08:30:00Z", justificationReason: "Personal reasons.", staffId: "EMP-14567" },
      { id: "a5-2", action: 4, description: "Exit cancelled", actorName: "Peter Bosrotsi (P&C)", occurredAt: "2026-06-10T13:05:00Z", justificationReason: "Employee rescinded the resignation after counter-offer discussions with the line manager.", staffId: "EMP-14567" },
    ],
    documents: [] },
];

/* ---------- list ---------- */
function ExitList({ rows, q, setQ, onCreate, onOpen, onArchive }) {
  const [menu, setMenu] = useEx(null);
  const [draft, setDraft] = useEx({ status: "", exitType: "", dept: "", source: "" });
  const [applied, setApplied] = useEx({ status: "", exitType: "", dept: "", source: "" });
  const deptOptions = [...new Set(rows.map(r => r.dept).filter(Boolean))].sort();
  const sourceOptions = [...new Set(rows.map(r => r.source).filter(Boolean))].sort();
  const shown = rows.filter(r => {
    if (q !== "" && !`${r.employee} ${r.exitType}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (applied.status && r.status !== applied.status) return false;
    if (applied.exitType && r.exitType !== applied.exitType) return false;
    if (applied.dept && r.dept !== applied.dept) return false;
    if (applied.source && r.source !== applied.source) return false;
    return true;
  });
  const pg = usePaged(shown, 10);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title="Employee Exits" subtitle="Manage voluntary and involuntary exits and track clearance to closure."
        actions={<Button variant="primary" icon="add-line" onClick={onCreate}>Initiate Exit</Button>} />
      <div className="card" style={{ padding: 20, overflow: "visible" }}>
        <div className="bh-tablebox">
        <UI.FilterBar
          search={q} onSearch={setQ} searchPlaceholder="Search exits…"
          filters={[
            { label: "Status", node: <Combobox value={draft.status} onChange={v => setDraft(s => ({ ...s, status: v }))} options={["Pending", "In Progress", "Closed", "Cancelled"]} placeholder="All statuses" /> },
            { label: "Exit Type", node: <Combobox value={draft.exitType} onChange={v => setDraft(s => ({ ...s, exitType: v }))} options={EXIT_TYPES.map(t => t.value)} placeholder="All exit types" /> },
            { label: "Department", node: <Combobox value={draft.dept} onChange={v => setDraft(s => ({ ...s, dept: v }))} options={deptOptions} placeholder="All departments" /> },
            { label: "Initiation Channel", node: <Combobox value={draft.source} onChange={v => setDraft(s => ({ ...s, source: v }))} options={sourceOptions} placeholder="All channels" /> },
          ]}
          onReset={() => { setDraft({ status: "", exitType: "", dept: "", source: "" }); setApplied({ status: "", exitType: "", dept: "", source: "" }); }}
          onApply={() => setApplied(draft)} />
        {rows.length === 0
          ? <EmptyState title="No exits yet" subtitle="Initiate an employee exit to begin the clearance process." cta="Initiate Exit" onAction={onCreate} />
          : <table className="bh">
              <thead><tr>
                <th>Employee</th><th>Exit Type</th><th>Exit Date</th><th>Clearance</th><th>Status</th><th style={{ width: 48 }}></th>
              </tr></thead>
              <tbody>
                {pg.pageItems.map(r => {
                  const meta = exitMeta(r.exitType);
                  return (
                    <tr key={r.id} style={{ cursor: "pointer" }} onClick={() => onOpen(r)}>
                      <td>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                          <Avatar name={r.employee} size={32} />
                          <span style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontWeight: 500, color: "var(--gray-900)" }}>{r.employee}</span>
                            <span style={{ fontSize: 12, color: "var(--gray-400)" }}>ID: {r.staffId}</span>
                          </span>
                        </span>
                      </td>
                      <td>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                          <Icon name={meta.icon} size={16} color="var(--gray-500)" />{r.exitType}
                        </span>
                      </td>
                      <td>{r.exitDate}</td>
                      <td><span style={{ fontSize: 13, color: "var(--gray-600)" }}>{clearanceCount(r.clearance)} / {CLEARANCE_TEMPLATE.length}</span></td>
                      <td><StatusBadge variant={EX_STATUS_VARIANT[r.status]} text={r.status} size="sm" /></td>
                      <td style={{ position: "relative", textAlign: "right" }} onClick={e => e.stopPropagation()}>
                        <button className="btn btn-icon btn-ghost" style={{ width: 28, height: 28, padding: 0 }} onClick={() => setMenu(menu === r.id ? null : r.id)}>
                          <Icon name="more-fill" size={18} color="var(--gray-400)" />
                        </button>
                        {menu === r.id && (
                          <div onMouseLeave={() => setMenu(null)} style={{ position: "absolute", right: 16, top: 40, zIndex: 20, background: "#fff",
                            borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-pop)", padding: 6, minWidth: 170, display: "flex", flexDirection: "column" }}>
                            <button className="menu-item" onClick={() => { setMenu(null); onOpen(r); }}><Icon name="eye-line" size={16} />Process Exit</button>
                            <button className="menu-item danger" onClick={() => { setMenu(null); onArchive(r); }}><Icon name="archive-line" size={16} />Archive Exit</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {shown.length === 0 && <tr><td colSpan={6} style={{ padding: 0 }}><EmptyState compact title="No results found" subtitle="No exit matches your search." /></td></tr>}
              </tbody>
            </table>}
        {shown.length > 0 && <div style={{ borderTop: "1px solid var(--divider)" }}><Pagination page={pg.page} pages={pg.pages} onPrev={pg.prev} onNext={pg.next} /></div>}
        </div>
      </div>
    </div>
  );
}

/* ---------- initiate / edit form (full page) ---------- */
function ExitForm({ lookups, initial, onCancel, onSubmit }) {
  const DIR = window.EMPLOYEE_DIRECTORY;
  const isEdit = !!initial;
  const empOptions = (() => {
    const seen = {};
    return (window.EMPLOYEE_LIST || []).filter(e => { if (seen[e.name]) return false; seen[e.name] = 1; return true; })
      .map(e => ({ value: e.name, label: e.name, name: e.name, sublabel: `${e.staffId || e.id}${e.dept ? " · " + e.dept : ""}` }));
  })();
  const [employee, setEmployee] = useEx(initial ? initial.employee : "");
  const [form, setForm] = useEx(initial
    ? { exitType: initial.exitType, exitDate: initial.exitDate, reason: initial.reason, note: initial.note || "", interviewRequired: !!initial.interviewRequired, interviewLocation: initial.interviewLocation || "", interviewDate: initial.interviewDate || "", interviewTime: initial.interviewTime || "" }
    : { exitType: "", exitDate: "", reason: "", note: "", interviewRequired: false, interviewLocation: "", interviewDate: "", interviewTime: "" });
  const [docs, setDocs] = useEx({ keptUrls: initial ? (initial.documents || []) : [], newFiles: [] });
  const [mails, setMails] = useEx([]);
  const set = (k, v) => setForm(s => ({ ...s, [k]: v }));

  const primary = employee ? DIR[employee] : null;
  const autoItems = primary ? [
    { label: "Staff ID", value: primary.staffId },
    { label: "Current Job Title", value: primary.title },
    { label: "Grade", value: primary.grade },
    { label: "Department / Unit", value: primary.dept },
    { label: "Branch", value: primary.branch },
    { label: "Zone", value: primary.zone },
  ] : [];

  const valid = employee && form.exitType && form.exitDate && form.reason;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title={isEdit ? "Edit Employee Exit" : "Initiate Employee Exit"}
        subtitle={isEdit ? "Update the exit details. Editing is available while the exit is pending." : "Initiate an employee exit and start the clearance process."} />

      <FormCard title="Exit Information">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <Field label="Exit Type"><Combobox value={form.exitType} onChange={v => setForm(s => ({ ...s, exitType: v, interviewRequired: exitMeta(v).interview }))} options={EXIT_TYPES.map(t => t.value)} placeholder="Select exit type" /></Field>
          <Field label="Employee Name"><Combobox value={employee} onChange={setEmployee} options={empOptions} placeholder="Select employee" avatar disabled={isEdit} /></Field>
        </div>

        {primary && (
          <div>
            <div style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--gray-400)", marginBottom: 6 }}>Auto-populated from employee record</div>
            <DetailPanel items={autoItems} tint="gray" cols={3} />
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <Field label="Proposed / Approved Exit Date"><UI.DatePicker value={form.exitDate} onSelect={d => set("exitDate", d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }))} placeholder="Pick a date" /></Field>
          <div style={{ gridColumn: "1 / -1" }}>
            <Field label="Reason for Exit"><UI.RichText value={form.reason} onChange={v => set("reason", v)} placeholder="Describe the reason for this exit…" /></Field>
          </div>
        </div>
      </FormCard>

      <FormCard title="Exit Interview">
        <div className="bh-body">Indicate whether an exit interview is required. If so, you can optionally schedule a location and time.</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <UI.Switch checked={form.interviewRequired} onCheckedChange={v => set("interviewRequired", v)} />
          <span style={{ fontFamily: "var(--font-control)", fontWeight: 500, fontSize: 14, color: "var(--gray-900)" }}>Exit interview required</span>
        </div>
        {form.interviewRequired && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
            <Field label="Interview Location" optional><Input value={form.interviewLocation} onChange={e => set("interviewLocation", e.target.value)} placeholder="e.g. P&C Boardroom or Teams link" /></Field>
            <Field label="Interview Date" optional><UI.DatePicker value={form.interviewDate} onSelect={d => set("interviewDate", d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }))} placeholder="Pick a date" /></Field>
            <Field label="Interview Time" optional><Input type="time" value={form.interviewTime} onChange={e => set("interviewTime", e.target.value)} /></Field>
          </div>
        )}
      </FormCard>

      <FormCard title="Supporting Documents">
        <div className="bh-body">Upload resignation letter, approval memo or other supporting documentation.</div>
        <SupportingDocuments existingUrls={initial ? (initial.documents || []) : []} isEditMode={isEdit} onChange={setDocs} maxFiles={8} maxSizeMB={8} />
      </FormCard>

      <FormCard title="Notification">
        <div className="bh-body">P&C, Line Manager, BOBS, S&IT, Payroll, Finance, Admin, Security and Medicals are notified for closure actions.</div>
        <EmailInputList label="Notify Stakeholders" description="Department / stakeholder mails" placeholder="eg. financedept@starret.com"
          emails={mails} onChange={setMails} />
      </FormCard>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
        <Button variant="stroke" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" disabled={!valid} onClick={() => valid && onSubmit({ employee, primary, ...form, docs, notifyMails: mails })}>{isEdit ? "Save Changes" : "Initiate Exit"}</Button>
      </div>
    </div>
  );
}

/* ---------- exit interview card (state-aware, mirrors ExitInterviewCard) ---------- */
function ExitInterviewPanel({ exit, ui, onSchedule, onComplete }) {
  const iv = ui.interview;
  const d = iv.scheduled ? new Date(exit.interviewDate) : null;
  const ok = d && !Number.isNaN(d.getTime());
  const day = ok ? String(d.getDate()).padStart(2, "0") : "--";
  const month = ok ? d.toLocaleString("default", { month: "short" }) : "";
  const badge = iv.completed ? ["success", "Completed"] : iv.scheduled ? ["draft", "Scheduled"] : ["pending", "Pending"];
  return (
    <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14, height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 17, color: "var(--gray-900)", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={`Exit Interview with ${exit.employee}`}>Exit Interview with {exit.employee}</div>
        <StatusBadge variant={badge[0]} text={badge[1]} size="sm" />
      </div>
      {(iv.scheduled || iv.completed)
        ? <div style={{ display: "flex", gap: 16 }}>
            <div style={{ width: 82, height: 88, borderRadius: 12, background: "var(--brand-yellow)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "var(--gray-900)" }}>
              <span style={{ fontFamily: "var(--font-ui)", fontSize: 13 }}>{month}</span>
              <span style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 30, lineHeight: 1.1 }}>{day}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0, flex: 1 }}>
              {!iv.completed && (iv.canSchedule || iv.canComplete) && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {iv.canSchedule && <Button variant="stroke" size="sm" onClick={onSchedule}>Reschedule interview</Button>}
                  {iv.canComplete && <Button variant="primary" size="sm" icon="checkbox-circle-line" onClick={onComplete}>Mark Completed</Button>}
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-ui)", fontSize: 13.5, color: "var(--gray-500)", flexWrap: "wrap" }}>
                {exit.interviewTime && <span>{exit.interviewTime}</span>}
                {exit.interviewLocation && (
                  <React.Fragment>
                    <span aria-hidden>•</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, minWidth: 0 }}>
                      <Icon name="map-pin-2-line" size={14} color="var(--gray-400)" />
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{exit.interviewLocation}</span>
                    </span>
                  </React.Fragment>
                )}
              </div>
              {iv.completed && <div style={{ marginTop: "auto", fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--gray-500)" }}>Completed by Peter Bosrotsi (P&C)</div>}
            </div>
          </div>
        : <div style={{ display: "flex", alignItems: "center", gap: 12, border: "1px dashed var(--gray-300)", background: "var(--gray-50)", borderRadius: 10, padding: "14px 16px" }}>
            <Icon name="calendar-schedule-line" size={20} color="var(--gray-400)" />
            <div className="bh-body" style={{ flex: 1 }}>{iv.emptyMessage}</div>
            {iv.canSchedule && <Button variant="stroke" size="sm" onClick={onSchedule}>Schedule Interview</Button>}
          </div>}
    </div>
  );
}

/* ---------- schedule / reschedule interview dialog ---------- */
function ScheduleInterviewModal({ open, exit, marksRequired, onClose, onSave }) {
  const [loc, setLoc] = useEx("");
  const [date, setDate] = useEx("");
  const [time, setTime] = useEx("");
  useExEffect(() => { if (open) { setLoc(exit.interviewLocation || ""); setDate(exit.interviewDate || ""); setTime(exit.interviewTime || ""); } }, [open]);
  if (!open) return null;
  const valid = date;
  return ReactDOM.createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 1200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(16,24,40,.45)" }} />
      <div style={{ position: "relative", width: 520, maxWidth: "100%", background: "#fff", borderRadius: 16, boxShadow: "var(--shadow-pop)", padding: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16 }}>
          <span style={{ width: 44, height: 44, borderRadius: 999, background: "var(--primary-50, #FFFAE6)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name="calendar-schedule-line" size={22} color="var(--gray-700)" />
          </span>
          <div>
            <div className="bh-h2" style={{ fontSize: 18 }}>{exit.interviewDate ? "Reschedule Exit Interview" : "Schedule Exit Interview"}</div>
            <div className="bh-body" style={{ marginTop: 2 }}>
              {marksRequired
                ? "No exit interview was required for this exit — saving a schedule will mark the interview as required."
                : `Set the date, time and location or meeting link for ${exit.employee}'s exit interview.`}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Location / Meeting Link"><Input value={loc} onChange={e => setLoc(e.target.value)} placeholder="e.g. P&C Boardroom or Teams link" /></Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Date"><UI.DatePicker value={date} onSelect={d => setDate(d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }))} placeholder="Pick a date" /></Field>
            <Field label="Time" optional><Input type="time" value={time} onChange={e => setTime(e.target.value)} /></Field>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 20 }}>
          <Button variant="stroke" onClick={onClose}>Cancel</Button>
          <Button variant="primary" icon="check-line" disabled={!valid} onClick={() => valid && onSave({ interviewLocation: loc, interviewDate: date, interviewTime: time })}>Save Schedule</Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ---------- clearance checklist drawer (mirrors ExitClearanceSheet) ---------- */
function ExitClearanceDrawer({ open, onClose, exit, ui, onToggle, onToggleAll }) {
  const done = clearanceCount(exit.clearance);
  const total = CLEARANCE_TEMPLATE.length;
  const allClear = ui.clearance.done;
  return (
    <Drawer open={open} onClose={onClose} title="Clearance Checklist" icon="list-check-3" width={560}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {!ui.clearance.unlocked && !ui.closed && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--primary-50, #FFFAE6)", border: "1px solid var(--primary-200, #FFE99A)", borderRadius: 10, padding: "12px 14px", fontFamily: "var(--font-ui)", fontSize: 13.5, color: "var(--gray-700)" }}>
            <Icon name="lock-line" size={16} color="var(--gray-500)" />
            Approve &amp; process the exit before clearing items.
          </div>
        )}
        {ui.closed && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--gray-50)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", fontFamily: "var(--font-ui)", fontSize: 13.5, color: "var(--gray-600)" }}>
            <Icon name="lock-line" size={16} color="var(--gray-400)" />
            This exit is {exit.status.toLowerCase()} — the checklist is read-only.
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 600, color: allClear ? "#1F8A5B" : "var(--gray-500)" }}>{done} / {total} cleared</span>
          {ui.clearance.canClearAll && (
            <button onClick={() => onToggleAll(!allClear)} style={{ display: "inline-flex", alignItems: "center", gap: 7, border: "1px solid var(--border)",
              background: "#fff", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 13, color: "var(--gray-700)" }}>
              <Icon name={allClear ? "checkbox-multiple-blank-line" : "checkbox-multiple-line"} size={16} color="var(--gray-500)" />
              {allClear ? "Uncheck All" : "Check All"}
            </button>
          )}
        </div>
        <div style={{ height: 6, borderRadius: 3, background: "var(--gray-100)", overflow: "hidden" }}>
          <div style={{ width: `${(done / total) * 100}%`, height: "100%", background: allClear ? "#1F8A5B" : "var(--brand-yellow)", transition: "width .2s" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {CLEARANCE_TEMPLATE.map(c => {
            const checked = !!exit.clearance[c.key];
            return (
              <div key={c.key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                border: `1px solid ${checked ? "#A6E9C8" : "var(--border)"}`, borderRadius: 10, background: checked ? "#F2FBF6" : "#fff" }}>
                <span style={{ width: 34, height: 34, borderRadius: 8, background: checked ? "#E7F7EF" : "var(--gray-100)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon name={c.icon} size={18} color={checked ? "#1F8A5B" : "var(--gray-500)"} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "var(--font-head)", fontWeight: 500, fontSize: 14, color: "var(--gray-900)" }}>{c.label}</div>
                  <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-400)", marginTop: 1 }}>{c.party}</div>
                </div>
                {checked
                  ? <StatusBadge variant="success" text="Cleared" size="sm" />
                  : <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-400)" }}>Pending</span>}
                {ui.clearance.canToggle && <Checkbox checked={checked} onChange={() => onToggle(c.key, !checked)} />}
              </div>
            );
          })}
        </div>
      </div>
    </Drawer>
  );
}

/* ---------- details — "Exit Processing" ---------- */
function ExitDetails({ exit, onEdit, onCancelExit, onApproveProcess, onToggleClearance, onToggleAll, onSchedule, onMarkInterview, onClose }) {
  const meta = exitMeta(exit.exitType);
  const ui = deriveExitUi(exit);
  const [trailOpen, setTrailOpen] = useEx(false);
  const [clearOpen, setClearOpen] = useEx(false);
  const info = [
    { label: "Employee", value: exit.employee },
    { label: "Staff ID", value: exit.staffId },
    { label: "Exit Type", value: exit.exitType },
    { label: "Classification", value: meta.classification },
    { label: "Job Title", value: exit.title },
    { label: "Department / Unit", value: exit.dept },
    { label: "Branch", value: exit.branch },
    { label: "Exit Date", value: exit.exitDate },
    { label: "Reason", value: exit.reason },
    { label: "Initiated Via", value: exit.source },
  ];
  const done = clearanceCount(exit.clearance);
  const total = CLEARANCE_TEMPLATE.length;

  // Audit Trail + Clearance live in the workflow card header — shared with the
  // cancellation fallback card below (workflow may be absent for cancelled exits).
  const headerActions = (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <Button variant="stroke" size="sm" icon="history-line" onClick={() => setTrailOpen(true)}>Audit Trail</Button>
      <span title={ui.clearance.unlocked || ui.closed ? undefined : "Approve & process the exit before clearing items"}>
        <Button variant="primary" size="sm" icon="list-check-3" onClick={() => setClearOpen(true)}>Clearance {done}/{total}</Button>
      </span>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title="Exit Processing" subtitle="Review the exit and complete every clearance point before closing the process."
        actions={
          <React.Fragment>
            <StatusBadge variant={EX_STATUS_VARIANT[exit.status]} text={exit.status} />
            {ui.header.showEdit && <Button variant="stroke" onClick={() => onEdit(exit)}>Edit Details</Button>}
            {ui.header.showCancel && <Button variant="stroke" style={{ color: "var(--error)", borderColor: "var(--error)" }} onClick={() => onCancelExit(exit)}>Cancel Exit</Button>}
            {ui.header.showApproveAndProcess && <Button variant="primary" icon="check-line" onClick={() => onApproveProcess(exit)}>Approve &amp; Process</Button>}
            {ui.header.showCloseExit && (
              <span title={ui.header.closeDisabledReason}>
                <Button variant="primary" icon="check-double-line" disabled={!ui.header.closeExitEnabled} onClick={() => onClose(exit)}>Close Exit Process</Button>
              </span>
            )}
          </React.Fragment>
        } />

      <div style={{ display: "flex", gap: 20, alignItems: "stretch", flexWrap: "wrap" }}>
        <div style={{ flex: "2 1 480px", minWidth: 0 }}>
          {!ui.cancelled
            ? <div className="card" style={{ padding: 0, height: "100%" }}>
                <DetailCard icon="route-line" title="Workflow Status" action={headerActions}>
                  <WorkflowProgress status={exit.status} />
                </DetailCard>
              </div>
            // Cancelled — no workflow to show: same card anatomy (title + header
            // actions), cancellation reason as the body (mirrors the app fallback).
            : <div className="card" style={{ padding: 0, height: "100%" }}>
                <DetailCard icon="close-circle-line" title="Cancellation Reason" action={headerActions}>
                  <div style={{ background: "#FEECEC", border: "1px solid #F7C5C5", borderRadius: 10, padding: "14px 16px", fontFamily: "var(--font-ui)", fontSize: 14, lineHeight: "22px", color: "var(--gray-800)" }}>
                    {exit.cancelReason || "This exit was cancelled."}
                  </div>
                </DetailCard>
              </div>}
        </div>
        {ui.interview.show && (
          <div style={{ flex: "1 1 360px", minWidth: 320 }}>
            <ExitInterviewPanel exit={exit} ui={ui} onSchedule={() => onSchedule(exit)} onComplete={() => onMarkInterview(exit)} />
          </div>
        )}
      </div>

      <div className="card" style={{ padding: 0 }}>
        <DetailCard icon="logout-box-r-line" title="Exit Information"><DetailPanel items={info} tint="gray" cols={4} /></DetailCard>
      </div>

      {exit.note && (
        <div className="card" style={{ padding: 0 }}>
          <DetailCard icon="file-text-line" title="Notes">
            <div style={{ background: "#F6F8FA", borderRadius: 8, padding: "14px 16px", fontFamily: "var(--font-ui)", fontSize: 14, lineHeight: "22px", color: "var(--gray-800)" }}>{exit.note}</div>
          </DetailCard>
        </div>
      )}

      <div className="card" style={{ padding: 0 }}>
        <DetailCard icon="attachment-2" title="Supporting Documents">
          <SupportingDocumentsList urls={exit.documents} />
        </DetailCard>
      </div>

      <ExitClearanceDrawer open={clearOpen} onClose={() => setClearOpen(false)} exit={exit} ui={ui}
        onToggle={(key, on) => onToggleClearance(exit, key, on)} onToggleAll={(on) => onToggleAll(exit, on)} />

      <AuditTrailDrawer open={trailOpen} onClose={() => setTrailOpen(false)} name={exit.employee}
        sub={`${exit.staffId} · ${exit.exitType}`} badge={<StatusBadge variant={EX_STATUS_VARIANT[exit.status]} text={exit.status} />}
        entries={exit.audit || []} />
    </div>
  );
}

/* ---------- controller ---------- */
function ExitScreen({ onToast, onSubPage, lookups }) {
  const [exits, setExits] = useStore(window.HRStores.exits);
  const [q, setQ] = useEx("");
  const [view, setView] = useEx({ name: "list" });   // list | add | edit | details
  const [confirm, setConfirm] = useEx(null);
  const [cancelFor, setCancelFor] = useEx(null);      // exit being cancelled (reason modal)
  const [schedFor, setSchedFor] = useEx(null);        // exit being scheduled (interview modal)

  useExEffect(() => {
    if (!onSubPage) return;
    if (view.name === "add") onSubPage({ trail: [{ label: "Employee Exit", onClick: () => setView({ name: "list" }) }, { label: "Initiate Employee Exit" }] });
    else if (view.name === "edit") onSubPage({ trail: [{ label: "Employee Exit", onClick: () => setView({ name: "list" }) }, { label: "Exit Processing", onClick: () => setView({ name: "details", id: view.id }) }, { label: "Edit Exit" }] });
    else if (view.name === "details") onSubPage({ trail: [{ label: "Employee Exit", onClick: () => setView({ name: "list" }) }, { label: "Exit Processing" }] });
    else onSubPage(null);
    return () => onSubPage(null);
  }, [view]);

  const current = (view.name === "details" || view.name === "edit") ? exits.find(e => e.id === view.id) : null;

  const logEntry = (e, entry) => [...(e.audit || []), { id: pncAuditId(), actorName: "Peter Bosrotsi (P&C)", occurredAt: new Date().toISOString(), justificationReason: null, staffId: e.staffId, ...entry }];
  const patchExit = (id, fn) => setExits(es => es.map(e => e.id === id ? fn(e) : e));

  // Every sign-off is confirmed — clearance toggles (both directions), clear all,
  // approve & process, close, interview completion (same UX as the app).
  const toggleClearance = (exit, key, on) => {
    const item = CLEARANCE_TEMPLATE.find(c => c.key === key);
    setConfirm({ kind: "clearItem", row: exit, key, on, cc: {
      t: on ? "Clear Item" : "Unclear Item",
      m: on ? `mark “${item.label}” as cleared` : `remove the clearance on “${item.label}”`,
      l: on ? "Yes, Clear" : "Yes, Remove", i: "check-line", c: "No" } });
  };
  const toggleAll = (exit, on) => setConfirm({ kind: "clearAll", row: exit, on, cc: {
    t: on ? "Clear All Items" : "Reopen All Items",
    m: on ? "mark every clearance item as cleared" : "reopen every clearance item",
    l: on ? "Yes, Clear All" : "Yes, Reopen", i: "checkbox-multiple-line", c: "No" } });
  const markInterview = (exit) => setConfirm({ kind: "interview", row: exit });
  const approveProcess = (exit) => setConfirm({ kind: "approveProcess", row: exit });

  const handleCancelExit = (reason) => {
    const row = cancelFor;
    patchExit(row.id, e => ({ ...e, status: "Cancelled", cancelReason: reason,
      audit: logEntry(e, { action: 4, description: "Exit cancelled", justificationReason: reason }) }));
    setCancelFor(null);
    onToast("Exit Cancelled", { tone: "error" });
    setView({ name: "list" });
  };

  const handleSaveSchedule = (fields) => {
    const row = schedFor;
    const marksRequired = !row.interviewRequired;
    patchExit(row.id, e => ({ ...e, ...fields, interviewRequired: true,
      audit: logEntry(e, { action: 1, description: `Exit interview scheduled — ${fields.interviewDate}${fields.interviewTime ? " · " + fields.interviewTime : ""}${fields.interviewLocation ? " · " + fields.interviewLocation : ""}` }) }));
    setSchedFor(null);
    onToast(marksRequired ? "Interview scheduled — exit interview is now marked as required" : "Interview schedule saved", { tone: "success" });
  };

  const submitExit = (f) => setConfirm({ kind: view.name === "edit" ? "edit" : "add", form: f });
  const runConfirm = () => {
    const c = confirm;
    if (c.kind === "add") {
      const f = c.form, p = f.primary || {};
      const meta = exitMeta(f.exitType);
      setExits(es => [{
        id: exId(), employee: f.employee, staffId: p.staffId || "—", exitType: f.exitType, exitDate: f.exitDate,
        dateSubmitted: todayEx(), reason: f.reason, note: f.note,
        title: p.title || "—", dept: p.dept || "—", branch: p.branch || "—", zone: p.zone || "—", grade: p.grade || "—",
        source: meta.value === "Resignation" ? "ESS (Employee)" : meta.value === "Retirement" ? "System Auto-Trigger" : "P&C/P&CBP",
        status: "Pending", interviewRequired: f.interviewRequired, interviewDone: false,
        interviewLocation: f.interviewLocation || "", interviewDate: f.interviewDate || "", interviewTime: f.interviewTime || "",
        clearance: freshClearance([]), documents: SupportingDocuments.resolve(f.docs, "https://files.bistasol.com/exits/"),
        audit: [{ id: pncAuditId(), action: 0, description: `${f.exitType} — effective ${f.exitDate}`, actorName: "Peter Bosrotsi (P&C)", occurredAt: new Date().toISOString(), justificationReason: f.reason || null, staffId: p.staffId || "—" }],
      }, ...es]);
      onToast("Exit Initiated", { tone: "success" });
      setView({ name: "list" });
    } else if (c.kind === "edit") {
      const f = c.form;
      patchExit(view.id, e => ({ ...e, exitType: f.exitType, exitDate: f.exitDate, reason: f.reason, note: f.note,
        interviewRequired: f.interviewRequired, interviewLocation: f.interviewLocation || "", interviewDate: f.interviewDate || "", interviewTime: f.interviewTime || "",
        documents: SupportingDocuments.resolve(f.docs, "https://files.bistasol.com/exits/"),
        audit: logEntry(e, { action: 1, description: "Exit details updated" }) }));
      onToast("Exit Updated", { tone: "success" });
      setView({ name: "details", id: view.id });
    } else if (c.kind === "archive") {
      setExits(es => es.filter(e => e.id !== c.row.id));
      onToast("Exit Archived", { tone: "error" });
      setView({ name: "list" });
    } else if (c.kind === "approveProcess") {
      patchExit(c.row.id, e => ({ ...e, status: "In Progress",
        audit: logEntry(e, { action: 3, description: "Review completed — clearance processing started" }) }));
      onToast("Review Completed", { tone: "success" });
    } else if (c.kind === "close") {
      patchExit(c.row.id, e => ({ ...e, status: "Closed",
        audit: logEntry(e, { action: 5, description: "All clearance points completed — exit process closed." }) }));
      onToast("Exit Process Closed", { tone: "success" });
      setView({ name: "list" });
    } else if (c.kind === "interview") {
      patchExit(c.row.id, e => ({ ...e, interviewDone: true, audit: logEntry(e, { action: 2, description: "Exit interview marked completed" }) }));
      onToast("Exit Interview Completed", { tone: "success" });
    } else if (c.kind === "clearItem") {
      const item = CLEARANCE_TEMPLATE.find(x => x.key === c.key);
      patchExit(c.row.id, e => ({ ...e, clearance: { ...e.clearance, [c.key]: c.on },
        audit: logEntry(e, { action: 1, description: `${item ? item.label : c.key} marked ${c.on ? "cleared" : "reopened"}` }) }));
      onToast("Clearance Updated", { tone: "success" });
    } else if (c.kind === "clearAll") {
      patchExit(c.row.id, e => ({ ...e, clearance: CLEARANCE_TEMPLATE.reduce((a, x) => (a[x.key] = c.on, a), {}),
        audit: logEntry(e, { action: 1, description: c.on ? "All clearance items marked cleared" : "All clearance items reopened" }) }));
      onToast(c.on ? "All Items Cleared" : "All Items Reopened", { tone: "success" });
    }
    setConfirm(null);
  };

  let body;
  if (view.name === "add") body = <ExitForm lookups={lookups} onCancel={() => setView({ name: "list" })} onSubmit={submitExit} />;
  else if (view.name === "edit" && current) body = <ExitForm lookups={lookups} initial={current} onCancel={() => setView({ name: "details", id: current.id })} onSubmit={submitExit} />;
  else if (view.name === "details" && current) body = <ExitDetails exit={current}
    onEdit={(r) => setView({ name: "edit", id: r.id })}
    onCancelExit={(r) => setCancelFor(r)}
    onApproveProcess={approveProcess}
    onToggleClearance={toggleClearance} onToggleAll={toggleAll}
    onSchedule={(r) => setSchedFor(r)} onMarkInterview={markInterview}
    onClose={(r) => setConfirm({ kind: "close", row: r })} />;
  else body = <ExitList rows={exits} q={q} setQ={setQ}
    onCreate={() => setView({ name: "add" })} onOpen={(r) => setView({ name: "details", id: r.id })} onArchive={(r) => setConfirm({ kind: "archive", row: r })} />;

  const CONFIRM = {
    add:     { t: "Initiate Exit", m: "initiate this employee exit", l: "Yes, Initiate", i: "check-line", c: "Cancel" },
    edit:    { t: "Save Changes", m: "save these changes to the exit", l: "Yes, Save", i: "check-line", c: "Cancel" },
    archive: { t: "Archive Exit", m: "archive this exit", l: "Yes, Archive", i: "archive-line", c: "No" },
    approveProcess: { t: "Complete Review", m: "complete the review stage and begin clearance processing", l: "Yes, Complete", i: "check-line", c: "No" },
    close:   { t: "Close Exit Process", m: "close this exit process — all clearance points are confirmed", l: "Yes, Close", i: "check-double-line", c: "No" },
    interview: { t: "Complete Exit Interview", m: "mark the exit interview as completed today", l: "Yes, Mark Completed", i: "check-line", c: "No" },
  };

  return (
    <React.Fragment>
      {body}
      {confirm && (() => { const cc = confirm.cc || CONFIRM[confirm.kind]; return (
        <ConfirmModal title={cc.t} message={`Are you sure you want to ${cc.m}?`} confirmLabel={cc.l} confirmIcon={cc.i}
          cancelLabel={cc.c} onConfirm={runConfirm} onClose={() => setConfirm(null)} />
      ); })()}
      {cancelFor && (
        <RejectionReasonModal open onClose={() => setCancelFor(null)} title="Cancel Exit" noun="exit"
          onConfirm={handleCancelExit} />
      )}
      {schedFor && (
        <ScheduleInterviewModal open exit={schedFor} marksRequired={!schedFor.interviewRequired}
          onClose={() => setSchedFor(null)} onSave={handleSaveSchedule} />
      )}
    </React.Fragment>
  );
}

Object.assign(window, { ExitScreen });

// seed the shared store once + expose an ESS-resignation builder so a self-service
// resignation (Dashboard ▸ Requests) lands here as a pending exit, reactively.
window.HRStores.exits.seed(EXIT_SEED);
window.HRExit = {
  createEssExit: ({ employee, staffId, title, dept, branch, zone, grade, exitDate, reason, note, documents }) => ({
    id: exId(), employee, staffId: staffId || "—", exitType: "Resignation", exitDate, dateSubmitted: todayEx(),
    reason, note: note || "", title: title || "—", dept: dept || "—", branch: branch || "—", zone: zone || "—", grade: grade || "—",
    source: "ESS (Employee)", status: "Pending", interviewRequired: true, interviewDone: false,
    interviewLocation: "", interviewDate: "", interviewTime: "", clearance: freshClearance([]), documents: documents || [],
  }),
};
