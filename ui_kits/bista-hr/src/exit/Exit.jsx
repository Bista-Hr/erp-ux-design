// BISTA HR · exit/Exit — People & Culture ▸ Employee Exit.
// Single standardized workflow covering voluntary (resignation) and involuntary exits
// (retirement / deceased / termination / vacation of post / dismissal), per the Employee
// Exit Workflow spec.
//   ExitList     : All / In Progress / Closed tabs; table of exits (employee + ID, exit
//                  type + classification, exit date, status) + Initiate Exit.
//   ExitForm     : full-page "Initiate Employee Exit" (P&C-initiated) — Exit Type →
//                  classification + exit-interview applicability shown automatically,
//                  multi-… no, single employee → auto-populated details, approved exit
//                  date, reason, supporting documents, notification.
//   ExitDetails  : "Exit Processing" — Exit Information, Exit Interview (resignation /
//                  retirement only), and an interactive CLEARANCE CHECKLIST (indebtedness,
//                  annual-leave cash impact, asset return/retention, physical & electronic
//                  access revocation, Core HR update, payroll closure, stakeholder
//                  clearance) with per-item responsible party. Closing requires all items
//                  cleared → ConfirmModal → toast.
// Reuses EMPLOYEE_DIRECTORY, PageHeader, DetailCard/DetailPanel, StatusBadge, Segmented,
// SupportingDocsUploader, FileIcon, Checkbox.
const { useState: useEx, useEffect: useExEffect } = React;

let EX_SEQ = 950;
const exId = () => ++EX_SEQ;
const todayEx = () => new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
const EX_DOC = (name, ext, size, docType) => ({ name, ext, size, docType });

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
const EXIT_REASONS = ["Better Opportunity", "Personal Reasons", "Relocation", "Attained Retirement Age",
  "Health Reasons", "Performance", "Misconduct", "Redundancy", "End of Contract", "Other"];

const EX_STATUS_VARIANT = { Pending: "pending", "In Progress": "draft", Cleared: "success", Closed: "past" };

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

const EXIT_SEED = [
  { id: 1, employee: "Aba Odum", staffId: "EMP-18389", exitType: "Resignation", exitDate: "Jun 30, 2026", dateSubmitted: "May 02, 2026",
    reason: "Better Opportunity", note: "Accepted a senior role at another institution; serving one-month notice.",
    title: "Data Scientist", dept: "Information Technology", branch: "Ridge", zone: "Accra West", grade: "Grade 5",
    source: "ESS (Employee)", status: "In Progress", interviewDone: true,
    clearance: freshClearance(["indebtedness", "leaveCash", "assets"]),
    documents: [EX_DOC("Resignation Letter.pdf", "PDF", "240 KB", "Reference Letter")] },
  { id: 2, employee: "Abass Abdul Mumin", staffId: "EMP-17431", exitType: "Retirement", exitDate: "Aug 15, 2026", dateSubmitted: "Jun 15, 2026",
    reason: "Attained Retirement Age", note: "Auto-triggered two months before attaining 60 years.",
    title: "Branch Support", dept: "Operations", branch: "Cape Coast", zone: "Central Zones", grade: "Grade 3",
    source: "System Auto-Trigger", status: "Pending", interviewDone: false,
    clearance: freshClearance([]),
    documents: [EX_DOC("Retirement Notice.pdf", "PDF", "180 KB", "Other")] },
  { id: 3, employee: "Samuel Boateng", staffId: "EMP-11002", exitType: "Termination", exitDate: "May 20, 2026", dateSubmitted: "May 06, 2026",
    reason: "Performance", note: "Termination following the performance improvement process.",
    title: "Sales Officer", dept: "Marketing", branch: "Kumasi", zone: "West Zone", grade: "Grade 1",
    source: "P&C/P&CBP", status: "Pending", interviewDone: false,
    clearance: freshClearance([]),
    documents: [EX_DOC("Termination Approval.pdf", "PDF", "320 KB", "Contract")] },
  { id: 4, employee: "Franklin Brobbey", staffId: "EMP-10231", exitType: "Resignation", exitDate: "Mar 31, 2026", dateSubmitted: "Feb 28, 2026",
    reason: "Relocation", note: "Relocating abroad with family.",
    title: "Accountant", dept: "Finance", branch: "Accra", zone: "South Zone", grade: "Grade 2",
    source: "ESS (Employee)", status: "Closed", interviewDone: true,
    clearance: freshClearance(CLEARANCE_TEMPLATE.map(c => c.key)),
    documents: [EX_DOC("Resignation Letter.pdf", "PDF", "210 KB", "Reference Letter"), EX_DOC("Clearance Form.pdf", "PDF", "560 KB", "Other")] },
];

/* ---------- list ---------- */
function ExitList({ rows, q, setQ, tab, setTab, onCreate, onOpen, onArchive }) {
  const [menu, setMenu] = useEx(null);
  const byTab = rows.filter(r => tab === "All" || r.status === tab);
  const shown = byTab.filter(r => q === "" || `${r.employee} ${r.exitType}`.toLowerCase().includes(q.toLowerCase()));
  const pg = usePaged(shown, 10);
  return (
    <div className="card" style={{ overflow: "visible", padding: "var(--card-pad, 24px)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
        <div>
          <div className="bh-h2" style={{ fontSize: 24 }}>Employee Exits</div>
          <div className="bh-body" style={{ marginTop: 4 }}>Manage voluntary and involuntary exits and track clearance to closure.</div>
        </div>
        <Button variant="primary" icon="add-line" onClick={onCreate}>Initiate Exit</Button>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 18, flexWrap: "wrap" }}>
        <Segmented items={["All", "Pending", "In Progress", "Closed"]} active={tab} onChange={setTab} />
        <div className="input-wrap" style={{ width: 300, padding: "9px 12px" }}>
          <Icon name="search-2-line" size={18} style={{ color: "var(--icon-default)" }} />
          <input placeholder="Search exits…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
      </div>

      <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
        {rows.length === 0
          ? <EmptyState title="No exits yet" subtitle="Initiate an employee exit to begin the clearance process." cta="Initiate Exit" onAction={onCreate} />
          : <table className="bh">
              <thead><tr>
                <th>Employee</th><th>Exit Type</th><th>Classification</th><th>Exit Date</th><th>Clearance</th><th>Status</th><th style={{ width: 48 }}></th>
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
                      <td><span style={{ fontSize: 13, color: meta.classification === "Voluntary" ? "#1F8A5B" : "#B54708" }}>{meta.classification}</span></td>
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
                {shown.length === 0 && <tr><td colSpan={7} style={{ padding: 0 }}><EmptyState compact title="No results found" subtitle="No exit matches your search." /></td></tr>}
              </tbody>
            </table>}
        {shown.length > 0 && <div style={{ borderTop: "1px solid var(--divider)" }}><Pagination page={pg.page} pages={pg.pages} onPrev={pg.prev} onNext={pg.next} /></div>}
      </div>
    </div>
  );
}

/* ---------- initiate form (full page) ---------- */
function ExitForm({ lookups, onCancel, onSubmit }) {
  const DIR = window.EMPLOYEE_DIRECTORY;
  const empOptions = window.EMPLOYEE_NAMES;
  const [employee, setEmployee] = useEx("");
  const [form, setForm] = useEx({ exitType: "", exitDate: "", reason: "", note: "" });
  const [docs, setDocs] = useEx([]);
  const [approvers, setApprovers] = useEx([]);
  const [mails, setMails] = useEx([""]);
  const set = (k, v) => setForm(s => ({ ...s, [k]: v }));
  // approvers are chosen from staff, excluding the exiting employee (no self-approval)
  const approverOptions = empOptions.filter(n => n !== employee);

  const meta = form.exitType ? exitMeta(form.exitType) : null;
  const primary = employee ? DIR[employee] : null;
  const autoItems = primary ? [
    { label: "Staff ID", value: primary.staffId },
    { label: "Current Job Title", value: primary.title },
    { label: "Grade", value: primary.grade },
    { label: "Department / Unit", value: primary.dept },
    { label: "Branch", value: primary.branch },
    { label: "Zone", value: primary.zone },
  ] : [];

  const valid = employee && form.exitType && form.exitDate && form.reason && approvers.length > 0;

  const sectionTitle = (t, sub) => (
    <div style={{ marginTop: 4 }}>
      <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 18, color: "var(--gray-900)" }}>{t}</div>
      {sub && <div className="bh-body" style={{ marginTop: 2 }}>{sub}</div>}
    </div>
  );

  return (
    <div className="card" style={{ padding: "var(--card-pad, 24px)", overflow: "visible" }}>
      <div style={{ marginBottom: 8 }}>
        <div className="bh-h2" style={{ fontSize: 24 }}>Initiate Employee Exit</div>
        <div className="bh-body" style={{ marginTop: 4 }}>Initiate a voluntary or involuntary exit and start the clearance process.</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 880 }}>
        {sectionTitle("Exit Information")}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <Field label="Exit Type"><Combobox value={form.exitType} onChange={v => set("exitType", v)} options={EXIT_TYPES.map(t => t.value)} placeholder="Select exit type" /></Field>
          <Field label="Employee Name"><Combobox value={employee} onChange={setEmployee} options={empOptions} placeholder="Select employee" avatar /></Field>
        </div>

        {meta && (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 8, padding: "6px 12px", fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 12.5,
              background: meta.classification === "Voluntary" ? "#E7F7EF" : "#FEF0E6", color: meta.classification === "Voluntary" ? "#1F8A5B" : "#B54708" }}>
              <Icon name={meta.classification === "Voluntary" ? "user-follow-line" : "government-line"} size={15} color={meta.classification === "Voluntary" ? "#1F8A5B" : "#B54708"} />
              {meta.classification} Exit
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 8, padding: "6px 12px", fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 12.5,
              background: "var(--gray-100)", color: "var(--gray-600)" }}>
              <Icon name={meta.interview ? "chat-check-line" : "chat-off-line"} size={15} color="var(--gray-500)" />
              {meta.interview ? "Exit interview applies" : "No exit interview"}
            </span>
          </div>
        )}

        {primary && (
          <div>
            <div style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--gray-400)", marginBottom: 6 }}>Auto-populated from employee record</div>
            <DetailPanel items={autoItems} tint="gray" cols={3} />
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <Field label="Proposed / Approved Exit Date"><Input type="date" value={form.exitDate} onChange={e => set("exitDate", e.target.value)} /></Field>
          <Field label="Reason for Exit"><Combobox value={form.reason} onChange={v => set("reason", v)} options={EXIT_REASONS} placeholder="Select reason" /></Field>
        </div>
        <Field label="Notes" optional><Textarea rows={3} value={form.note} onChange={e => set("note", e.target.value)} placeholder="Additional context for this exit…" /></Field>

        <div style={{ height: 1, background: "var(--border)" }} />
        {sectionTitle("Supporting Documents", "Upload resignation letter, approval memo or other supporting documentation.")}
        <SupportingDocsUploader files={docs} onChange={setDocs} />

        <div style={{ height: 1, background: "var(--border)" }} />
        {sectionTitle("Approval Routing", "Select the approver(s) who must sign off on this exit.")}
        <Field label="Approvers">
          <MultiSelectCombobox value={approvers} onChange={setApprovers} options={approverOptions} placeholder="Select one or more approvers" avatar />
        </Field>

        <div style={{ height: 1, background: "var(--border)" }} />
        {sectionTitle("Stakeholder Notification", "P&C, Line Manager, BOBS, S&IT, Payroll, Finance, Admin, Security and Medicals are notified for closure actions.")}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {mails.map((m, i) => (
            <div key={i} className="input-wrap">
              <input placeholder="e.g. S&IT, BOBS, payroll@company.com" value={m} onChange={e => setMails(ms => ms.map((x, j) => j === i ? e.target.value : x))} />
            </div>
          ))}
          <button onClick={() => setMails(ms => [...ms, ""])} style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 6,
            border: 0, background: "none", cursor: "pointer", padding: 0, fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 13, color: "var(--brand-yellow-dark)" }}>
            <Icon name="add-line" size={16} color="var(--brand-yellow-dark)" />Add another stakeholder
          </button>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
        <Button variant="stroke" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" disabled={!valid} onClick={() => valid && onSubmit({ employee, primary, ...form, approvers, documents: docs, notifyMails: mails.filter(Boolean) })}>Initiate Exit</Button>
      </div>
    </div>
  );
}

/* ---------- details — "Exit Processing" with clearance checklist ---------- */
function ExitDetails({ exit, onToggleClearance, onToggleAll, onMarkInterview, onClose }) {
  const meta = exitMeta(exit.exitType);
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
  const allClear = clearanceDone(exit.clearance);
  const isClosed = exit.status === "Closed";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title="Exit Processing" subtitle="Review the exit and complete every clearance point before closing the process."
        actions={
          <React.Fragment>
            <StatusBadge variant={EX_STATUS_VARIANT[exit.status]} text={exit.status} />
            {!isClosed && <Button variant="primary" icon="check-double-line" disabled={!allClear} onClick={() => onClose(exit)}>Close Exit Process</Button>}
          </React.Fragment>
        } />

      <div className="card" style={{ padding: 0 }}>
        <DetailCard icon="logout-box-r-line" title="Exit Information"><DetailPanel items={info} tint="gray" cols={4} /></DetailCard>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <DetailCard icon="user-follow-line" title="Approvers">
          {exit.approvers && exit.approvers.length > 0
            ? <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {exit.approvers.map(n => (
                  <span key={n} style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid var(--border)", borderRadius: 999, padding: "5px 12px 5px 5px" }}>
                    <Avatar name={n} size={26} />
                    <span style={{ fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 13.5, color: "var(--gray-900)" }}>{n}</span>
                  </span>
                ))}
              </div>
            : <EmptyState compact title="No approvers" subtitle="No approvers were assigned to this exit." />}
        </DetailCard>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <DetailCard icon="route-line" title="Workflow Status"><WorkflowProgress status={exit.status} /></DetailCard>
      </div>

      {exit.note && (
        <div className="card" style={{ padding: 0 }}>
          <DetailCard icon="file-text-line" title="Notes">
            <div style={{ background: "#F6F8FA", borderRadius: 8, padding: "14px 16px", fontFamily: "var(--font-ui)", fontSize: 14, lineHeight: "22px", color: "var(--gray-800)" }}>{exit.note}</div>
          </DetailCard>
        </div>
      )}

      {/* Exit interview — resignation & retirement only */}
      <div className="card" style={{ padding: 0 }}>
        <DetailCard icon="chat-check-line" title="Exit Interview">
          {meta.interview
            ? <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap",
                background: exit.interviewDone ? "#E7F7EF" : "var(--gray-50)", border: `1px solid ${exit.interviewDone ? "#A6E9C8" : "var(--border)"}`, borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Icon name={exit.interviewDone ? "checkbox-circle-fill" : "chat-3-line"} size={22} color={exit.interviewDone ? "#1F8A5B" : "var(--gray-400)"} />
                  <div>
                    <div style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 14.5, color: "var(--gray-900)" }}>{exit.interviewDone ? "Exit interview completed" : "Exit interview pending"}</div>
                    <div className="bh-body" style={{ marginTop: 2 }}>Applicable to resignation and retirement. Feedback is captured for analytics and improvement.</div>
                  </div>
                </div>
                {!exit.interviewDone && !isClosed && <Button variant="stroke" size="sm" icon="check-line" onClick={() => onMarkInterview(exit)}>Mark Completed</Button>}
              </div>
            : <div style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--gray-50)", border: "1px dashed var(--gray-300)", borderRadius: 10, padding: "14px 16px" }}>
                <Icon name="chat-off-line" size={20} color="var(--gray-400)" />
                <div className="bh-body">No exit interview applies to <strong style={{ color: "var(--gray-700)" }}>{exit.exitType}</strong>.</div>
              </div>}
        </DetailCard>
      </div>

      {/* Clearance checklist */}
      <div className="card" style={{ padding: 0 }}>
        <DetailCard icon="list-check-3" title="Clearance Checklist"
          action={
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 600, color: allClear ? "#1F8A5B" : "var(--gray-500)" }}>{done} / {total} cleared</span>
              {!isClosed && (
                <button onClick={() => onToggleAll(exit, !allClear)} style={{ display: "inline-flex", alignItems: "center", gap: 7, border: "1px solid var(--border)",
                  background: "#fff", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 13, color: "var(--gray-700)" }}>
                  <Icon name={allClear ? "checkbox-multiple-blank-line" : "checkbox-multiple-line"} size={16} color="var(--gray-500)" />
                  {allClear ? "Uncheck All" : "Check All"}
                </button>
              )}
            </div>
          }>
          {/* progress bar */}
          <div style={{ height: 6, borderRadius: 3, background: "var(--gray-100)", overflow: "hidden", marginBottom: 16 }}>
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
                  {!isClosed && <Checkbox checked={checked} onChange={() => onToggleClearance(exit, c.key)} />}
                </div>
              );
            })}
          </div>
        </DetailCard>
      </div>

      {/* Supporting documents */}
      <div className="card" style={{ padding: 0 }}>
        <DetailCard icon="attachment-2" title="Supporting Documents">
          {exit.documents && exit.documents.length > 0
            ? <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {exit.documents.map((doc, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 10 }}>
                    <FileIcon type={doc.docType} name={doc.name} ext={doc.ext} size={30} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 14, color: "var(--gray-900)" }}>{doc.name}</div>
                      <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-400)" }}>{doc.size} · {doc.ext}</div>
                    </div>
                    <button style={{ display: "inline-flex", alignItems: "center", gap: 6, border: 0, background: "none", cursor: "pointer",
                      fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 14, color: "var(--gray-700)" }}>
                      <Icon name="download-2-line" size={18} color="var(--gray-500)" />Download
                    </button>
                  </div>
                ))}
              </div>
            : <EmptyState compact title="No documents" subtitle="No supporting documents were attached." />}
        </DetailCard>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <DetailCard icon="history-line" title="Audit Trail"><AuditTrail entries={exit.audit || []} /></DetailCard>
      </div>
    </div>
  );
}

/* ---------- controller ---------- */
function ExitScreen({ onToast, onSubPage, lookups }) {
  const [exits, setExits] = useStore(window.HRStores.exits);
  const [q, setQ] = useEx("");
  const [tab, setTab] = useEx("All");
  const [view, setView] = useEx({ name: "list" });   // list | add | details
  const [confirm, setConfirm] = useEx(null);

  useExEffect(() => {
    if (!onSubPage) return;
    if (view.name === "add") onSubPage({ trail: [{ label: "Employee Exit", onClick: () => setView({ name: "list" }) }, { label: "Initiate Employee Exit" }] });
    else if (view.name === "details") onSubPage({ trail: [{ label: "Employee Exit", onClick: () => setView({ name: "list" }) }, { label: "Exit Processing" }] });
    else onSubPage(null);
    return () => onSubPage(null);
  }, [view]);

  const current = view.name === "details" ? exits.find(e => e.id === view.id) : null;

  // clearance toggles & interview update directly (in-progress edits); status auto-advances Pending → In Progress
  const toggleClearance = (exit, key) => setExits(es => es.map(e => {
    if (e.id !== exit.id) return e;
    const clearance = { ...e.clearance, [key]: !e.clearance[key] };
    const anyDone = CLEARANCE_TEMPLATE.some(c => clearance[c.key]);
    const status = e.status === "Closed" ? "Closed" : (anyDone ? "In Progress" : "Pending");
    return { ...e, clearance, status };
  }));
  const markInterview = (exit) => setConfirm({ kind: "interview", row: exit });
  const toggleAll = (exit, on) => setExits(es => es.map(e => {
    if (e.id !== exit.id) return e;
    const clearance = CLEARANCE_TEMPLATE.reduce((a, c) => (a[c.key] = on, a), {});
    const status = e.status === "Closed" ? "Closed" : (on ? "In Progress" : "Pending");
    return { ...e, clearance, status };
  }));

  const submitExit = (f) => setConfirm({ kind: "add", form: f });
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
        status: "Pending", interviewDone: false, clearance: freshClearance([]), documents: f.documents, approvers: f.approvers || [],
      }, ...es]);
      onToast("Exit Initiated", { tone: "success" });
      setView({ name: "list" });
    } else if (c.kind === "archive") {
      setExits(es => es.filter(e => e.id !== c.row.id));
      onToast("Exit Archived", { tone: "error" });
      setView({ name: "list" });
    } else if (c.kind === "close") {
      const stamp = window.wfNow();
      setExits(es => es.map(e => e.id === c.row.id ? { ...e, status: "Closed",
        audit: [...(e.audit || []), { action: "Exit process closed", decision: "Completed", actor: "Peter Bosrotsi (P&C)", at: stamp, note: "All clearance points completed." }] } : e));
      onToast("Exit Process Closed", { tone: "success" });
    } else if (c.kind === "interview") {
      setExits(es => es.map(e => e.id === c.row.id ? { ...e, interviewDone: true } : e));
      onToast("Exit Interview Completed", { tone: "success" });
    }
    setConfirm(null);
  };

  let body;
  if (view.name === "add") body = <ExitForm lookups={lookups} onCancel={() => setView({ name: "list" })} onSubmit={submitExit} />;
  else if (view.name === "details" && current) body = <ExitDetails exit={current}
    onToggleClearance={toggleClearance} onToggleAll={toggleAll} onMarkInterview={markInterview} onClose={(r) => setConfirm({ kind: "close", row: r })} />;
  else body = <ExitList rows={exits} q={q} setQ={setQ} tab={tab} setTab={setTab}
    onCreate={() => setView({ name: "add" })} onOpen={(r) => setView({ name: "details", id: r.id })} onArchive={(r) => setConfirm({ kind: "archive", row: r })} />;

  const CONFIRM = {
    add:     { t: "Initiate Exit", m: "initiate this employee exit", l: "Yes, Initiate", i: "check-line", c: "Cancel" },
    archive: { t: "Archive Exit", m: "archive this exit", l: "Yes, Archive", i: "archive-line", c: "No" },
    close:   { t: "Close Exit Process", m: "close this exit process — all clearance points are confirmed", l: "Yes, Close", i: "check-double-line", c: "No" },
    interview: { t: "Complete Exit Interview", m: "mark the exit interview as completed", l: "Yes, Mark Completed", i: "check-line", c: "No" },
  };

  return (
    <React.Fragment>
      {body}
      {confirm && (() => { const cc = CONFIRM[confirm.kind]; return (
        <ConfirmModal title={cc.t} message={`Are you sure you want to ${cc.m}?`} confirmLabel={cc.l} confirmIcon={cc.i}
          cancelLabel={cc.c} onConfirm={runConfirm} onClose={() => setConfirm(null)} />
      ); })()}
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
    source: "ESS (Employee)", status: "Pending", interviewDone: false, clearance: freshClearance([]), documents: documents || [],
  }),
};
