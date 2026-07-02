// BISTA HR · jobtitle/JobTitle — People & Culture ▸ Job Title (Assign / Change of Job Title).
// Bulk-assign flow (mirrors Promotions / Transfers — full-page forms, not modals):
//   JobTitleRoster   : employee roster with row checkboxes + search. Select one or many →
//                      an "Assign Job Title (N)" button → the full-page JobTitleForm assigns
//                      ONE new job title to all selected. A per-row "Assign" handles a single
//                      employee. No status pick — an assignment is created Pending and
//                      becomes Current once approved.
//   JobTitleForm     : full-page Assign / Edit (breadcrumb, not a modal). Employee(s) +
//                      Department → New Job Title (filtered) → auto Job Grade, Effective Date,
//                      Reason and Supporting Documents — consistent with the Promotion form.
//   JobTitleList     : Requests tab — All / Approved / Pending change requests + approval.
//   JobTitleDetails  : "Job Title Change Approval" — Change Information, Reason, Supporting
//                      Documents, Approval Information, with Approve / Reject for pending.
// Reuses EMPLOYEE_DIRECTORY, PageHeader, DetailCard / DetailPanel, StatusBadge, Segmented.
const { useState: useJt, useEffect: useJtEffect } = React;

let JT_SEQ = 850;
const jtId = () => ++JT_SEQ;
const JT_STATUS_VARIANT = { Approved: "approved", Pending: "pending", Declined: "rejected" };
const todayJt = () => new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
const fmtJtDate = (v) => {
  if (!v) return "—";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  if (!m) return v;
  return new Date(+m[1], +m[2] - 1, +m[3]).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
const JT_DOC = (name, ext, size, docType) => ({ name, ext, size, docType });
const jtEmail = (name) => name.toLowerCase().split(/\s+/).map((p, i) => i === 0 ? p[0] : p).join("") + "@gcb.com.gh";

const JOBTITLE_SEED = [
  { id: 1, employees: ["Aaron Appiah"], staffIds: "EMP-18330",
    previousTitle: "Ag. Assurance Supervisor", newTitle: "Assurance Supervisor", grade: "Grade 4",
    department: "Finance", unit: "Assurance", zone: "Accra East", branch: "Abossey Okai",
    effectiveDate: "Jun 01, 2026", dateSubmitted: "May 14, 2026", status: "Approved",
    reason: "Confirmation in substantive role following a successful acting period.",
    documents: ["https://files.bistasol.com/jobtitle/Confirmation-Letter.pdf"],
    approvedBy: "Peter Bosrotsi", approverEmail: "pybosrotsi@gcb.com.gh", approvedAt: "5/16/2026, 2:08:34 PM",
    rejectedBy: "N/A", rejectorEmail: "N/A", rejectedAt: "N/A" },
  { id: 2, employees: ["Bright Manu"], staffIds: "EMP-10876",
    previousTitle: "Software Engineer", newTitle: "Senior Software Engineer", grade: "Grade 3",
    department: "Information Technology", unit: "Engineering", zone: "East Zone", branch: "Tema",
    effectiveDate: "May 28, 2026", dateSubmitted: "May 10, 2026", status: "Pending",
    reason: "Re-designation to reflect expanded technical leadership responsibilities.",
    documents: ["https://files.bistasol.com/jobtitle/Role-Justification.docx"],
    approvedBy: "N/A", approverEmail: "N/A", approvedAt: "N/A",
    rejectedBy: "N/A", rejectorEmail: "N/A", rejectedAt: "N/A" },
  { id: 3, employees: ["Emmanuel Ansah"], staffIds: "EMP-10412",
    previousTitle: "HR Officer", newTitle: "HR Generalist", grade: "Grade 2",
    department: "Human Resource", unit: "HR Operations", zone: "South Zone", branch: "Accra",
    effectiveDate: "Jul 08, 2026", dateSubmitted: "May 18, 2026", status: "Pending",
    reason: "Title alignment with the new HR operating model and job architecture.",
    documents: ["https://files.bistasol.com/jobtitle/Job-Architecture-Memo.pdf"],
    approvedBy: "N/A", approverEmail: "N/A", approvedAt: "N/A",
    rejectedBy: "N/A", rejectorEmail: "N/A", rejectedAt: "N/A" },
  { id: 4, employees: ["Samuel Asante"], staffIds: "EMP-11233",
    previousTitle: "Teller", newTitle: "Senior Teller", grade: "Grade 1",
    department: "Finance", unit: "Retail", zone: "West Zone", branch: "Takoradi",
    effectiveDate: "Apr 30, 2026", dateSubmitted: "Apr 12, 2026", status: "Declined",
    reason: "Proposed re-designation; deferred pending completion of the role-banding review.",
    documents: ["https://files.bistasol.com/jobtitle/Banding-Review.xlsx"],
    approvedBy: "N/A", approverEmail: "N/A", approvedAt: "N/A",
    rejectedBy: "Peter Bosrotsi", rejectorEmail: "pybosrotsi@gcb.com.gh", rejectedAt: "4/18/2026, 9:14:02 AM" },
];

/* ---------- form section card (matches the Promotions full-page form) ---------- */
function JtFormCard({ title, badge, children }) {
  return (
    <div className="card" style={{ padding: "var(--card-pad, 24px)", overflow: "visible" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <div className="bh-h2" style={{ fontSize: 20 }}>{title}</div>
        {badge}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>{children}</div>
    </div>
  );
}
// "Auto-populated" pill — marks the card grouping system-resolved values (job grade).
const JtAutoBadge = () => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap", background: "var(--brand-yellow-tint)", border: "1px solid var(--brand-yellow)", color: "var(--gray-800)", borderRadius: 999, padding: "3px 9px", fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 11.5 }}>
    <Icon name="sparkling-2-line" size={12} color="var(--brand-yellow-dark)" />Auto-populated
  </span>
);

/* ---------- assign / edit (FULL PAGE — mirrors the Promotion form for consistency) ---------- */
// Department narrows the Job Title list; picking a Job Title auto-resolves its Grade (read-only).
function JobTitleForm({ lookups, initialData, initialEmployees, onCancel, onSubmit }) {
  const LK = lookups || window.LOOKUPS;
  const EMP = window.EMPLOYEE_LIST;
  const isEdit = !!initialData;
  const initIds = initialData ? (initialData.employees || []).map(window.firstIdForName).filter(Boolean) : (initialEmployees || []);
  const [people, setPeople] = useJt(initIds);
  const [form, setForm] = useJt({
    department: initialData?.department || "",
    newTitle: initialData?.newTitle || "",
    grade: initialData?.grade || "",
    notch: initialData?.notch || "",
    date: "",
    reason: initialData?.reason || "",
  });
  const [docs, setDocs] = useJt({ keptUrls: initialData?.documents || [], newFiles: [] });
  const set = (k, v) => setForm(s => ({ ...s, [k]: v }));
  const selectDept = (v) => setForm(s => ({ ...s, department: v, newTitle: "" }));
  const selectTitle = (v) => setForm(s => { const info = window.jobTitleInfo(v) || {}; const grade = info.grade || s.grade; return { ...s, newTitle: v, grade, notch: grade === s.grade ? s.notch : "" }; });
  const selectGrade = (v) => setForm(s => ({ ...s, grade: v, notch: "" }));
  const titleOptions = window.jobTitlesForDepartment(form.department);
  const notchOptions = window.notchesForGrade(form.grade);
  // Salary + allowances auto-fetched from Payroll once the title resolves grade + notch.
  const payroll = window.fetchPayroll(form.grade, form.notch);
  const salary = payroll ? payroll.salary : "";
  const allowances = payroll ? payroll.allowances : [];
  const valid = people.length > 0 && form.newTitle && form.date;
  const multi = people.length > 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title={isEdit ? "Edit Job Title Change" : "Assign Job Title"}
        subtitle={isEdit ? "Update this change of job title request."
          : "Select staff, choose the new job title and route the change for approval."} />

      <JtFormCard title="Employee Information">
        <Field label="Employee(s)">
          <EmployeeAddSelect value={people} onChange={setPeople} employees={EMP} />
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
          <Field label="New Job Title"><Combobox value={form.newTitle} onChange={selectTitle} options={titleOptions} placeholder="Select job title" header={<JobTitleFilterHeader department={form.department} onChange={selectDept} departments={LK.departments} />} noDataText="No job title found for this department." /></Field>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <Field label="Job Grade" optional><Combobox value={form.grade} onChange={selectGrade} options={LK.jobGrades} icon="bar-chart-grouped-line" placeholder="Select job grade" /></Field>
          <Field label="Notch" optional><Combobox value={form.notch} onChange={v => set("notch", v)} options={notchOptions} icon="stack-line" placeholder={form.grade ? "Select notch" : "Select job grade first"} noDataText="Select a job grade first." /></Field>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <Field label="Effective Date"><UI.DatePicker value={form.date} onSelect={d => set("date", d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }))} placeholder="Pick a date" /></Field>
        </div>
      </JtFormCard>

      <ResolvedRoleBenefits grade={form.grade} salary={salary} allowances={allowances} />

      <JtFormCard title="Comments & Documents">
        <Field label="Comments" optional><UI.RichText value={form.reason} onChange={v => set("reason", v)} placeholder="Add comments for this change of job title…" /></Field>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label style={{ fontFamily: "var(--font-control)", fontWeight: 500, fontSize: 14, color: "var(--gray-900)" }}>Supporting Documents</label>
          <SupportingDocuments existingUrls={initialData?.documents || []} isEditMode={isEdit} onChange={setDocs} maxFiles={8} maxSizeMB={8} />
        </div>
      </JtFormCard>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
        <Button variant="stroke" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" icon={isEdit ? "check-line" : "user-add-line"} disabled={!valid}
          onClick={() => valid && onSubmit({ names: people, title: form.newTitle, grade: form.grade, notch: form.notch, date: form.date, reason: form.reason, docs, editId: initialData?.id })}>
          {isEdit ? "Save Changes" : (multi ? `Assign Job Title to ${people.length}` : "Assign Job Title")}
        </Button>
      </div>
    </div>
  );
}

/* ---------- employee roster (checkboxes; bulk action lives in the floating bar) ---------- */
function JobTitleRoster({ q, setQ, selected, setSelected, onAssignOne, segment, setSegment, title, subtitle, headerAction }) {
  const EMP = window.EMPLOYEE_LIST;
  const [menu, setMenu] = useJt(null);
  const shown = EMP.filter(e => {
    if (q === "") return true;
    return `${e.name} ${e.staffId} ${e.title} ${e.dept}`.toLowerCase().includes(q.toLowerCase());
  });
  const shownIds = shown.map(e => e.id);
  const toggle = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const allShownSelected = shown.length > 0 && shownIds.every(id => selected.includes(id));
  const toggleAll = () => setSelected(allShownSelected ? selected.filter(id => !shownIds.includes(id)) : [...new Set([...selected, ...shownIds])]);
  const pg = usePaged(shown, 10);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title={title} subtitle={subtitle} actions={headerAction} />
      <div className="card" style={{ padding: 20 }}>
        <div className="bh-tablebox">
        <UI.FilterBar left={<Segmented items={["Assign", "Requests"]} active={segment} onChange={setSegment} />}
          search={q} onSearch={setQ} searchPlaceholder="Search staff…" />
        <table className="bh">
          <thead><tr>
            <th style={{ width: 44 }}><Checkbox checked={allShownSelected} onChange={toggleAll} /></th>
            <th>Full Name</th><th>Employee ID</th><th>Current Job Title</th><th>Department</th><th>Unit/Branch</th><th>Zone</th><th style={{ width: 48 }}></th>
          </tr></thead>
          <tbody>
            {pg.pageItems.map(e => {
              const on = selected.includes(e.id);
              return (
                <tr key={e.id} className="jt-roster-row" style={{ cursor: "pointer", background: on ? "#FFFBEB" : undefined }} onClick={() => toggle(e.id)}>
                  <td onClick={ev => ev.stopPropagation()}><Checkbox checked={on} onChange={() => toggle(e.id)} /></td>
                  <td>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                      <Avatar name={e.name} size={32} />
                      <span style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: 500, color: "var(--gray-900)" }}>{e.name}</span>
                        <span style={{ fontSize: 12, color: "var(--gray-400)" }}>{jtEmail(e.name)}</span>
                      </span>
                    </span>
                  </td>
                  <td>{e.staffId}</td>
                  <td>{e.title}</td>
                  <td>{e.dept}</td>
                  <td>{[e.unit, e.branch].filter(Boolean).join(" · ") || "—"}</td>
                  <td>{e.zone || "—"}</td>
                  <td style={{ textAlign: "right" }} onClick={ev => ev.stopPropagation()}>
                    <UI.RowActions actions={[{ label: "Assign Job Title", short: "Assign", icon: "user-add-line", onClick: () => onAssignOne(e.id) }]} />
                  </td>
                </tr>
              );
            })}
            {shown.length === 0 && <tr><td colSpan={8} style={{ padding: 0 }}><EmptyState compact title="No results found" subtitle="No staff matches your search." /></td></tr>}
          </tbody>
        </table>
      {shown.length > 0 && <div style={{ borderTop: "1px solid var(--divider)" }}><Pagination page={pg.page} pages={pg.pages} onPrev={pg.prev} onNext={pg.next} /></div>}
        </div>
      </div>
    </div>
  );
}

/* ---------- requests list (approval queue) ---------- */
function JobTitleList({ rows, q, setQ, onOpen, onEdit, onArchive, segment, setSegment, sel, setSel, title, subtitle, headerAction }) {
  const [menu, setMenu] = useJt(null);
  const JT_BLANK = { status: "", department: "", unit: "", zone: "", grade: "" };
  const [draft, setDraft] = useJt(JT_BLANK);
  const [applied, setApplied] = useJt(JT_BLANK);
  const optsOf = (key) => [...new Set(rows.map(r => r[key]).filter(Boolean))].sort();
  const shown = rows.filter(r => {
    if (q !== "" && !(r.employees.join(" ").toLowerCase().includes(q.toLowerCase()) || r.newTitle.toLowerCase().includes(q.toLowerCase()))) return false;
    if (applied.status && r.status !== applied.status) return false;
    if (applied.department && r.department !== applied.department) return false;
    if (applied.unit && r.unit !== applied.unit) return false;
    if (applied.zone && r.zone !== applied.zone) return false;
    if (applied.grade && r.grade !== applied.grade) return false;
    return true;
  });
  const pg = usePaged(shown, 10);
  const pendingShown = shown.filter(r => r.status === "Pending");
  const allPendingSel = pendingShown.length > 0 && pendingShown.every(r => sel.includes(r.id));
  const toggle = (id) => setSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll = () => setSel(allPendingSel ? sel.filter(id => !pendingShown.some(r => r.id === id)) : [...new Set([...sel, ...pendingShown.map(r => r.id)])]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title={title} subtitle={subtitle} actions={headerAction} />
      <div className="card" style={{ padding: 20 }}>
        <div className="bh-tablebox">
        <UI.FilterBar left={<Segmented items={["Assign", "Requests"]} active={segment} onChange={setSegment} />}
          search={q} onSearch={setQ} searchPlaceholder="Search job title changes…"
          filters={[
            { label: "Status", node: <Combobox value={draft.status} onChange={v => setDraft(s => ({ ...s, status: v }))} options={["Pending", "Approved", "Declined"]} placeholder="All statuses" /> },
            { label: "Department", node: <Combobox value={draft.department} onChange={v => setDraft(s => ({ ...s, department: v }))} options={optsOf("department")} placeholder="All departments" /> },
            { label: "Unit/Branch", node: <Combobox value={draft.unit} onChange={v => setDraft(s => ({ ...s, unit: v }))} options={optsOf("unit")} placeholder="All units/branches" /> },
            { label: "Zone", node: <Combobox value={draft.zone} onChange={v => setDraft(s => ({ ...s, zone: v }))} options={optsOf("zone")} placeholder="All zones" /> },
            { label: "Job Grade", node: <Combobox value={draft.grade} onChange={v => setDraft(s => ({ ...s, grade: v }))} options={optsOf("grade")} placeholder="All grades" /> },
          ]}
          onReset={() => { setDraft(JT_BLANK); setApplied(JT_BLANK); }}
          onApply={() => setApplied(draft)} />
        {rows.length === 0
          ? <EmptyState title="No assignments yet" subtitle="Assign a job title from the Assign tab to create a request." />
          : <table className="bh">
              <thead><tr>
                <th style={{ width: 44 }}><Checkbox checked={allPendingSel} onChange={toggleAll} /></th>
                <th>Employee Name</th><th>Job Title</th><th>Effective Date</th><th>Status</th><th>Approved By</th><th style={{ width: 48 }}></th>
              </tr></thead>
              <tbody>
                {pg.pageItems.map(r => {
                  const canSelect = r.status === "Pending";
                  const on = sel.includes(r.id);
                  return (
                  <tr key={r.id} style={{ cursor: "pointer", background: on ? "#FFFBEB" : undefined }} onClick={() => onOpen(r)}>
                    <td onClick={ev => ev.stopPropagation()}>{canSelect ? <Checkbox checked={on} onChange={() => toggle(r.id)} /> : null}</td>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                        <Avatar name={r.employees[0]} size={32} />
                        <span style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontWeight: 500, color: "var(--gray-900)" }}>{r.employees[0]}{r.employees.length > 1 ? ` +${r.employees.length - 1}` : ""}</span>
                          <span style={{ fontSize: 12, color: "var(--gray-400)" }}>ID: {r.staffIds}</span>
                        </span>
                      </span>
                    </td>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <span style={{ color: "var(--gray-500)" }}>{r.previousTitle}</span>
                        <Icon name="arrow-right-line" size={15} color="var(--gray-400)" />
                        <span style={{ color: "var(--gray-900)", fontWeight: 500 }}>{r.newTitle}</span>
                      </span>
                    </td>
                    <td>{r.effectiveDate}</td>
                    <td><StatusBadge variant={JT_STATUS_VARIANT[r.status]} text={r.status} size="sm" /></td>
                    <td>{r.approvedBy && r.approvedBy !== "N/A" ? r.approvedBy : "—"}</td>
                    <td style={{ textAlign: "right" }} onClick={e => e.stopPropagation()}>
                      <UI.RowActions actions={[
                        { label: "View Details", short: "View", icon: "eye-line", onClick: () => onOpen(r) },
                        { label: "Edit Request", short: "Edit", icon: "edit-2-line", onClick: () => onEdit(r) },
                        { label: "Archive Request", short: "Archive", icon: "archive-line", danger: true, onClick: () => onArchive(r) },
                      ]} />
                    </td>
                  </tr>
                  );
                })}
                {shown.length === 0 && <tr><td colSpan={7} style={{ padding: 0 }}><EmptyState compact title="No results found" subtitle="No job title change matches your search." /></td></tr>}
              </tbody>
            </table>}
        {rows.length > 0 && shown.length > 0 && <div style={{ borderTop: "1px solid var(--divider)" }}><Pagination page={pg.page} pages={pg.pages} onPrev={pg.prev} onNext={pg.next} /></div>}
        </div>
      </div>
    </div>
  );
}

/* ---------- details — "Job Title Change Approval" ---------- */
function JobTitleDetails({ record, onApprove, onReject, onUpdate, onToast }) {
  const r = record;
  const info = [
    { label: "Employee Name", value: r.employees.join(", ") },
    { label: "Previous Job Title", value: r.previousTitle },
    { label: "New Job Title", value: r.newTitle },
    { label: "Job Grade", value: r.grade || "—" },
    { label: "Department", value: r.department },
    { label: "Unit/Branch", value: [r.unit, r.branch].filter(Boolean).join(" · ") || "—" },
    { label: "Zone", value: r.zone },
    { label: "Effective Date", value: r.effectiveDate },
  ];
  const approvalInfo = [
    { label: "Approved By", value: r.approvedBy }, { label: "Approver Email", value: r.approverEmail }, { label: "Approved At", value: r.approvedAt },
    { label: "Rejected By", value: r.rejectedBy }, { label: "Rejector Email", value: r.rejectorEmail }, { label: "Rejected At", value: r.rejectedAt },
  ];
  const pending = r.status === "Pending";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title="Job Title Change Approval" subtitle="Review and approve or reject change of job title requests."
        actions={
          <React.Fragment>
            <StatusBadge variant={JT_STATUS_VARIANT[r.status]} text={r.status} />
            {pending && (
              <React.Fragment>
                <Button variant="stroke" icon="close-line" onClick={() => onReject(r)}>Reject</Button>
                <Button variant="primary" icon="check-line" onClick={() => onApprove(r)}>Approve</Button>
              </React.Fragment>
            )}
          </React.Fragment>
        } />

      <div className="card" style={{ padding: 0 }}>
        <DetailCard icon="briefcase-4-line" title="Change Information"><DetailPanel items={info} tint="gray" cols={4} /></DetailCard>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <DetailCard icon="file-text-line" title="Comments">
          <div className="rt-content" style={{ background: "#F6F8FA", borderRadius: 8, padding: "14px 16px", fontFamily: "var(--font-ui)", fontSize: 14, lineHeight: "22px", color: "var(--gray-800)" }} dangerouslySetInnerHTML={{ __html: r.reason || "—" }} />
        </DetailCard>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <DetailCard icon="attachment-2" title="Supporting Documents">
          <SupportingDocumentsList urls={r.documents} />
        </DetailCard>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <DetailCard icon="shield-check-line" title="Approval Information"><DetailPanel items={approvalInfo} tint="gray" cols={3} /></DetailCard>
      </div>

      <WorkflowPanel workflowType="JobTitle" record={r} onChange={(partial) => onUpdate(partial)} onToast={onToast} />
    </div>
  );
}

/* ---------- controller ---------- */
function JobTitleScreen({ onToast, onSubPage, lookups }) {
  const DIR = window.EMPLOYEE_DIRECTORY;
  const [records, setRecords] = useJt(JOBTITLE_SEED);
  const [segment, setSegment] = useJt("Assign");   // Assign (roster) | Requests
  const [rosterQ, setRosterQ] = useJt("");
  const [selected, setSelected] = useJt([]);
  const [approvalSel, setApprovalSel] = useJt([]);
  const [lastCount, setLastCount] = useJt(0);        // held count so the bar shows it while sliding out
  const [q, setQ] = useJt("");
  const [view, setView] = useJt({ name: "list" });   // list | add | edit | details
  const [confirm, setConfirm] = useJt(null);

  useJtEffect(() => {
    if (!onSubPage) return;
    const toList = () => setView({ name: "list" });
    if (view.name === "add") onSubPage({ trail: [{ label: "Job Title", onClick: toList }, { label: "Assign Job Title" }] });
    else if (view.name === "edit") onSubPage({ trail: [{ label: "Job Title", onClick: toList }, { label: "Edit Job Title Change" }] });
    else if (view.name === "details") onSubPage({ trail: [{ label: "Job Title", onClick: toList }, { label: "Job Title Change Approval" }] });
    else onSubPage(null);
    return () => onSubPage(null);
  }, [view]);

  useJtEffect(() => { if (selected.length) setLastCount(selected.length); }, [selected.length]);

  const current = view.name === "details" ? records.find(r => r.id === view.id) : null;
  const editing = view.name === "edit" ? records.find(r => r.id === view.id) : null;

  const submitAssign = (f) => setConfirm({ kind: "assign", form: f });
  const runConfirm = () => {
    const c = confirm;
    if (c.kind === "assign") {
      const f = c.form;
      const allDocs = SupportingDocuments.resolve(f.docs, "https://files.bistasol.com/jobtitle/");
      if (f.editId) {
        setRecords(rs => rs.map(r => r.id === f.editId ? { ...r, employees: f.names.map(id => (window.EMP_BY_ID[id] || {}).name || id), staffIds: f.names.join(", "), newTitle: f.title, grade: f.grade || r.grade,
          effectiveDate: fmtJtDate(f.date), reason: f.reason || "", approvers: f.approvers || [], documents: allDocs } : r));
        onToast("Job Title Change Updated", { tone: "success" });
        setView({ name: "list" });
        setConfirm(null); return;
      }
      const recs = f.names.map(id => {
        const e = window.EMP_BY_ID[id] || {};
        return { id: jtId(), employees: [e.name || id], staffIds: e.staffId || id,
          previousTitle: e.title || "—", newTitle: f.title, grade: f.grade || e.grade || "—",
          department: e.dept || "—", unit: e.unit || "—", zone: e.zone || "—", branch: e.branch || "—",
          effectiveDate: fmtJtDate(f.date), dateSubmitted: todayJt(), status: "Pending",
          reason: f.reason || "", documents: allDocs, approvers: f.approvers || [],
          approvedBy: "N/A", approverEmail: "N/A", approvedAt: "N/A", rejectedBy: "N/A", rejectorEmail: "N/A", rejectedAt: "N/A" };
      });
      setRecords(rs => [...recs, ...rs]);
      onToast(f.names.length > 1 ? `Job Title Assigned to ${f.names.length} Employees` : "Job Title Assigned", { tone: "success" });
      setSelected([]); setView({ name: "list" }); setSegment("Requests");
    } else if (c.kind === "archive") {
      setRecords(rs => rs.filter(r => r.id !== c.row.id));
      onToast("Job Title Change Archived", { tone: "error" });
      setView({ name: "list" });
    } else if (c.kind === "approve") {
      const now = new Date().toLocaleString("en-US");
      const stamp = window.wfNow();
      setRecords(rs => rs.map(r => r.id === c.row.id ? { ...r, status: "Approved", wfStatus: "Approved", approvedBy: "Peter Bosrotsi", approverEmail: "pybosrotsi@gcb.com.gh", approvedAt: now,
        audit: [...(r.audit || []), { action: "Job title change approved", decision: "Approved", actor: "Peter Bosrotsi (Head P&C)", at: stamp }] } : r));
      onToast("Job Title Change Approved", { tone: "success" });
    } else if (c.kind === "reject") {
      const now = new Date().toLocaleString("en-US");
      const stamp = window.wfNow();
      setRecords(rs => rs.map(r => r.id === c.row.id ? { ...r, status: "Declined", wfStatus: "Declined", rejectedBy: "Peter Bosrotsi", rejectorEmail: "pybosrotsi@gcb.com.gh", rejectedAt: now,
        audit: [...(r.audit || []), { action: "Job title change declined", decision: "Declined", actor: "Peter Bosrotsi (Head P&C)", at: stamp }] } : r));
      onToast("Job Title Change Rejected", { tone: "error" });
    } else if (c.kind === "bulkApprove") {
      const now = new Date().toLocaleString("en-US");
      const ids = c.ids;
      setRecords(rs => rs.map(r => ids.includes(r.id) ? { ...r, status: "Approved", approvedBy: "Peter Bosrotsi", approverEmail: "pybosrotsi@gcb.com.gh", approvedAt: now } : r));
      onToast(`${ids.length} Job Title Change${ids.length > 1 ? "s" : ""} Approved`, { tone: "success" });
      setApprovalSel([]);
    } else if (c.kind === "bulkReject") {
      const now = new Date().toLocaleString("en-US");
      const ids = c.ids;
      setRecords(rs => rs.map(r => ids.includes(r.id) ? { ...r, status: "Declined", rejectedBy: "Peter Bosrotsi", rejectorEmail: "pybosrotsi@gcb.com.gh", rejectedAt: now } : r));
      onToast(`${ids.length} Job Title Change${ids.length > 1 ? "s" : ""} Rejected`, { tone: "error" });
      setApprovalSel([]);
    }
    setConfirm(null);
  };

  let body;
  if (view.name === "add") {
    body = <JobTitleForm lookups={lookups} initialEmployees={view.initialEmployees} onCancel={() => setView({ name: "list" })} onSubmit={submitAssign} />;
  } else if (view.name === "edit" && editing) {
    body = <JobTitleForm lookups={lookups} initialData={editing} onCancel={() => setView({ name: "list" })} onSubmit={submitAssign} />;
  } else if (view.name === "details" && current) {
    body = <JobTitleDetails record={current}
      onApprove={(r) => setConfirm({ kind: "approve", row: r })} onReject={(r) => setConfirm({ kind: "reject", row: r })}
      onUpdate={(partial) => setRecords(rs => rs.map(x => x.id === current.id ? { ...x, ...partial } : x))} onToast={onToast} />;
  } else {
    const addAction = <Button variant="primary" icon="add-line" onClick={() => setView({ name: "add", initialEmployees: [] })}>Add Job Title</Button>;
    body = (
      <React.Fragment>
        {segment === "Assign"
          ? <JobTitleRoster q={rosterQ} setQ={setRosterQ} selected={selected} setSelected={setSelected}
              onAssignOne={(n) => setView({ name: "add", initialEmployees: [n] })} segment={segment} setSegment={setSegment}
              title="Job Title" subtitle="Assign or bulk-assign job titles to staff, and track approval status."
              headerAction={addAction} />
          : <JobTitleList rows={records} q={q} setQ={setQ}
              onOpen={(r) => setView({ name: "details", id: r.id })} onEdit={(r) => setView({ name: "edit", id: r.id })} onArchive={(r) => setConfirm({ kind: "archive", row: r })}
              segment={segment} setSegment={setSegment} sel={approvalSel} setSel={setApprovalSel}
              title="Job Title" subtitle="Assign or bulk-assign job titles to staff, and track approval status."
              headerAction={addAction} />}
      </React.Fragment>
    );
  }

  const CONFIRM = {
    assign:  { t: "Assign Job Title", m: "assign this job title", l: "Yes, Assign", i: "user-add-line", c: "Cancel" },
    archive: { t: "Archive Job Title Change", m: "archive this job title change", l: "Yes, Archive", i: "archive-line", c: "No" },
    approve: { t: "Approve Job Title Change", m: "approve this job title change", l: "Yes, Approve", i: "check-line", c: "No" },
    reject:  { t: "Reject Job Title Change", m: "reject this job title change", l: "Yes, Reject", i: "close-line", c: "No" },
    bulkApprove: { t: "Approve Job Title Changes", m: "approve", l: "Yes, Approve", i: "check-line", c: "No" },
    bulkReject:  { t: "Reject Job Title Changes", m: "reject", l: "Yes, Reject", i: "close-line", c: "No" },
  };
  const confirmMsg = () => {
    const c = confirm;
    if (c.kind === "assign") {
      const k = c.form.names.length;
      return k > 1 ? `Are you sure you want to assign this job title to ${k} employees? Each assignment will be pending approval.`
        : "Are you sure you want to assign this job title? It will be pending approval.";
    }
    if (c.kind === "bulkApprove" || c.kind === "bulkReject") {
      const k = c.ids.length;
      return `Are you sure you want to ${CONFIRM[c.kind].m} ${k} selected job title change${k > 1 ? "s" : ""}?`;
    }
    return `Are you sure you want to ${CONFIRM[c.kind].m}?`;
  };

  const barVisible = view.name === "list" && segment === "Assign" && selected.length > 0;
  const barCount = selected.length || lastCount;
  const approvalBarVisible = view.name === "list" && segment === "Requests" && approvalSel.length > 0;

  return (
    <React.Fragment>
      {body}

      {/* floating bulk-assign bar (fixed bottom-right, animates in/out; count pops) */}
      <div className={`jt-assignbar ${barVisible ? "" : "hidden"}`}>
        <span className="jt-count" key={barCount}>{barCount}</span>
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--gray-700)" }}>staff selected</span>
        <button className="jt-clear" onClick={() => setSelected([])}>Clear</button>
        <Button variant="primary" icon="user-add-line" onClick={() => setView({ name: "add", initialEmployees: selected })}>Assign Job Title</Button>
      </div>

      {/* floating bulk-approval bar (Requests queue) */}
      <BulkBar count={approvalSel.length} noun="changes selected" visible={approvalBarVisible} onClear={() => setApprovalSel([])}>
        <Button variant="stroke" icon="close-line" onClick={() => setConfirm({ kind: "bulkReject", ids: approvalSel })}>Reject</Button>
        <Button variant="primary" icon="check-line" onClick={() => setConfirm({ kind: "bulkApprove", ids: approvalSel })}>Approve</Button>
      </BulkBar>

      {confirm && (() => { const cc = CONFIRM[confirm.kind]; return (
        <ConfirmModal title={cc.t} message={confirmMsg()} confirmLabel={cc.l} confirmIcon={cc.i}
          cancelLabel={cc.c} onConfirm={runConfirm} onClose={() => setConfirm(null)} />
      ); })()}
    </React.Fragment>
  );
}

Object.assign(window, { JobTitleScreen });
