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
    zone: initialData?.zone || "",
    unitBranch: initialData?.unitBranch || "",
    date: "",
    reason: initialData?.reason || "",
  });
  const [docs, setDocs] = useJt({ keptUrls: initialData?.documents || [], newFiles: [] });
  const [notifyIds, setNotifyIds] = useJt(initialData?.notifyIds || []);
  const set = (k, v) => setForm(s => ({ ...s, [k]: v }));
  // Job title, grade and department are INDEPENDENT picks — titles are not tied to departments
  // and picking a title never auto-populates the grade. The DesignationCombobox's built-in
  // department filter only narrows its list.
  const selectDept = (v) => set("department", v);
  const selectTitle = (v) => set("newTitle", v);
  const selectGrade = (v) => setForm(s => ({ ...s, grade: v, notch: "" }));
  // A selected Zone filters the Unit/Branch list — changing zone clears a mismatched pick.
  const selectZone = (v) => setForm(s => ({ ...s, zone: v, unitBranch: "" }));
  const notchOptions = window.notchSalaryOptions(form.grade);
  // Salary is resolved from (grade, notch) into a read-only field — same as Promotions/Transfers.
  const jtPayroll = window.fetchPayroll(form.grade, (form.notch || "").split(" — ")[0]);
  const jtSalary = jtPayroll ? jtPayroll.salary : "";
  const hasDocs = (docs.keptUrls || []).length + (docs.newFiles || []).length > 0;
  const valid = people.length > 0 && form.department && form.newTitle && form.grade && (notchOptions.length === 0 || form.notch)
    && form.zone && form.unitBranch && form.date && form.reason.trim() && hasDocs;
  const multi = people.length > 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title={isEdit ? "Edit Job Title Change" : "Assign Job Title"}
        subtitle={isEdit ? "Update this job title change request before approval."
          : "Select staff, choose the new job title and route the change for approval."} />

      <JtFormCard title="Employee Information">
        <Field label="Employee(s)">
          <EmployeeAddSelect value={people} onChange={setPeople} employees={EMP} />
        </Field>
      </JtFormCard>

      <JtFormCard title="New Role Details">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <Field label="New Department"><Combobox value={form.department} onChange={selectDept} options={LK.departments} icon="building-line" placeholder="Select new department" noDataText="No department found" /></Field>
          <Field label="New Job Title"><DesignationCombobox value={form.newTitle} onChange={selectTitle} /></Field>
          <Field label="Job Grade"><Combobox value={form.grade} onChange={selectGrade} options={LK.jobGrades} icon="bar-chart-grouped-line" placeholder="Select job grade" /></Field>
          <Field label="Notch"><Combobox value={form.notch} onChange={v => set("notch", v)} options={notchOptions} icon="stack-line" placeholder={form.grade ? "Select notch" : "Select job grade first"} noDataText="Select a job grade first." /></Field>
          <Field label="Salary">
            <div className="input-wrap" style={{ background: "var(--gray-50)" }}>
              <Icon name="money-dollar-circle-line" size={18} style={{ color: "var(--icon-default)" }} />
              <input value={jtSalary ? `${jtSalary} / month` : ""} readOnly placeholder="Auto from grade & notch" style={{ color: jtSalary ? "var(--gray-900)" : "var(--gray-400)" }} />
            </div>
          </Field>
          <Field label="Zones"><Combobox value={form.zone} onChange={selectZone} options={LK.zones} placeholder="Select zone" noDataText="No zone found" /></Field>
          <Field label="New Organizational Unit/Branch"><UnitBranchCombobox value={form.unitBranch} onChange={v => set("unitBranch", v)} zone={form.zone} onZoneChange={selectZone} zones={LK.zones} /></Field>
          <Field label="Effective Date"><UI.DatePicker weekendRule value={form.date} onSelect={d => set("date", d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }))} placeholder="Pick a date" /></Field>
        </div>
      </JtFormCard>

      <JtFormCard title="Comments & Documents">
        <Field label="Comments"><UI.RichText value={form.reason} onChange={v => set("reason", v)} placeholder="Add comments for this change of job title…" /></Field>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label style={{ fontFamily: "var(--font-control)", fontWeight: 500, fontSize: 14, color: "var(--gray-900)" }}>Supporting Documents</label>
          <SupportingDocuments existingUrls={initialData?.documents || []} isEditMode={isEdit} onChange={setDocs} maxFiles={8} maxSizeMB={8} />
          {!hasDocs && <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-400)" }}>At least one supporting document is required before this request can be submitted.</span>}
        </div>
      </JtFormCard>

      <JtFormCard title="Notification">
        <NotifyPeopleField value={notifyIds} onChange={setNotifyIds} employees={EMP} />
      </JtFormCard>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
        <Button variant="stroke" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" icon={isEdit ? "check-line" : "user-add-line"} disabled={!valid}
          onClick={() => valid && onSubmit({ names: people, department: form.department, title: form.newTitle, grade: form.grade, notch: form.notch, zone: form.zone, unitBranch: form.unitBranch, notifyIds, date: form.date, reason: form.reason, docs, editId: initialData?.id })}>
          {isEdit ? "Update Request" : (multi ? `Assign Job Title to ${people.length}` : "Assign Job Title")}
        </Button>
      </div>
    </div>
  );
}

/* ---------- employee roster (shared EmployeeSelectionRoster — single source of truth) ---------- */
function JobTitleRoster({ q, setQ, onCreate, segment, setSegment, title, subtitle, headerAction }) {
  const rows = window.EMPLOYEE_LIST.map(e => ({
    id: e.id, name: e.name, employeeNumber: e.staffId, jobTitle: e.title,
    jobGrade: e.grade, department: e.dept, branch: e.branch, profilePictureUrl: e.profilePictureUrl || "",
  }));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title={title} subtitle={subtitle} actions={headerAction} />
      <div className="card" style={{ padding: 20 }}>
        <div className="bh-tablebox">
        <UI.FilterBar left={<Segmented items={["Request", "Approvals"]} active={segment} onChange={setSegment} />}
          search={q} onSearch={setQ} searchPlaceholder="Search staff…" />
        <EmployeeSelectionRoster employees={rows} itemLabel="staff"
          actionLabel="Assign Job Title" onProceed={onCreate} searchQuery={q} />
        </div>
      </div>
    </div>
  );
}

/* ---------- requests list (approval queue) ---------- */
function JobTitleList({ rows, q, setQ, onOpen, onEdit, onArchive, segment, setSegment, sel, setSel, title, subtitle, headerAction }) {
  const [menu, setMenu] = useJt(null);
  const JT_BLANK = { status: "", department: "", archived: "" };
  const [draft, setDraft] = useJt(JT_BLANK);
  const [applied, setApplied] = useJt(JT_BLANK);
  const optsOf = (key) => [...new Set(rows.map(r => r[key]).filter(Boolean))].sort();
  const shown = rows.filter(r => {
    if (r.archived && applied.archived !== "Include archived") return false;
    if (q !== "" && !(r.employees.join(" ").toLowerCase().includes(q.toLowerCase()) || r.newTitle.toLowerCase().includes(q.toLowerCase()))) return false;
    if (applied.status && r.status !== applied.status) return false;
    if (applied.department && r.department !== applied.department) return false;
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
        <UI.FilterBar left={<Segmented items={["Request", "Approvals"]} active={segment} onChange={setSegment} />}
          search={q} onSearch={setQ} searchPlaceholder="Search job title changes…"
          filters={[
            { label: "Status", node: <Combobox value={draft.status} onChange={v => setDraft(s => ({ ...s, status: v }))} options={["Pending", "Approved", "Declined"]} placeholder="All statuses" /> },
            { label: "Department", node: <Combobox value={draft.department} onChange={v => setDraft(s => ({ ...s, department: v }))} options={optsOf("department")} placeholder="All departments" /> },
            { label: "Archived Requests", node: <Combobox value={draft.archived} onChange={v => setDraft(s => ({ ...s, archived: v }))} options={["Include archived"]} placeholder="Exclude archived" /> },
          ]}
          onReset={() => { setDraft(JT_BLANK); setApplied(JT_BLANK); }}
          onApply={() => setApplied(draft)} activeCount={Object.values(applied).filter(Boolean).length} />
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
                      <UI.RowActions forceMenu actions={r.status === "Pending" ? [
                        { label: "View Details", short: "View", icon: "eye-line", onClick: () => onOpen(r) },
                        { label: "Edit Details", short: "Edit", icon: "edit-2-line", onClick: () => onEdit(r) },
                        { label: "Archive", short: "Archive", icon: "archive-line", danger: true, onClick: () => onArchive(r) },
                      ] : [
                        { label: "View Details", short: "View", icon: "eye-line", onClick: () => onOpen(r) },
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
    { label: "Notch", value: r.notch || "—" },
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
  const [segment, setSegment] = useJt("Request");   // Request (roster) | Approvals
  const [rosterQ, setRosterQ] = useJt("");
  const [approvalSel, setApprovalSel] = useJt([]);
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

  const current = view.name === "details" ? records.find(r => r.id === view.id) : null;
  const editing = view.name === "edit" ? records.find(r => r.id === view.id) : null;

  // Demotion guard: warn (Proceed Anyway / Cancel) before the normal submit confirmation
  // when the picked grade/notch ranks below an employee's current placement.
  const submitAssign = (f) => {
    const next = () => setConfirm({ kind: "assign", form: f });
    const hits = window.demotionCheck({ employeeIds: f.names, grade: f.grade, notch: f.notch });
    if (hits.length) window.confirmDemotion({ items: hits, noun: "job title change", onProceed: next });
    else next();
  };
  const runConfirm = () => {
    const c = confirm;
    if (c.kind === "assign") {
      const f = c.form;
      const allDocs = SupportingDocuments.resolve(f.docs, "https://files.bistasol.com/jobtitle/");
      if (f.editId) {
        setRecords(rs => rs.map(r => r.id === f.editId ? { ...r, employees: f.names.map(id => (window.EMP_BY_ID[id] || {}).name || id), staffIds: f.names.join(", "), newTitle: f.title, grade: f.grade || r.grade, notch: f.notch || r.notch, zone: f.zone || r.zone, branch: f.unitBranch || r.branch,
          notifyIds: f.notifyIds || r.notifyIds || [],
          effectiveDate: fmtJtDate(f.date), reason: f.reason || "", approvers: f.approvers || [], documents: allDocs } : r));
        onToast("Job Title Change Updated", { tone: "success" });
        setView({ name: "list" });
        setConfirm(null); return;
      }
      const recs = f.names.map(id => {
        const e = window.EMP_BY_ID[id] || {};
        return { id: jtId(), employees: [e.name || id], staffIds: e.staffId || id,
          previousTitle: e.title || "—", newTitle: f.title, grade: f.grade || e.grade || "—", notch: f.notch || "—",
          department: e.dept || "—", unit: e.unit || "—", zone: f.zone || e.zone || "—", branch: f.unitBranch || e.branch || "—",
          notifyIds: f.notifyIds || [],
          effectiveDate: fmtJtDate(f.date), dateSubmitted: todayJt(), status: "Pending",
          reason: f.reason || "", documents: allDocs, approvers: f.approvers || [],
          approvedBy: "N/A", approverEmail: "N/A", approvedAt: "N/A", rejectedBy: "N/A", rejectorEmail: "N/A", rejectedAt: "N/A" };
      });
      setRecords(rs => [...recs, ...rs]);
      onToast(f.names.length > 1 ? `Job Title Assigned to ${f.names.length} Employees` : "Job Title Assigned", { tone: "success" });
      setView({ name: "list" }); setSegment("Approvals");
    } else if (c.kind === "archive") {
      setRecords(rs => rs.map(r => r.id === c.row.id ? { ...r, archived: true } : r));
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
    const addAction = <Button variant="primary" icon="add-line" onClick={() => setView({ name: "add", initialEmployees: [] })}>Assign Job Title</Button>;
    body = (
      <React.Fragment>
        {segment === "Request"
          ? <JobTitleRoster q={rosterQ} setQ={setRosterQ}
              onCreate={(ids) => setView({ name: "add", initialEmployees: ids })} segment={segment} setSegment={setSegment}
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

  const approvalBarVisible = view.name === "list" && segment === "Approvals" && approvalSel.length > 0;

  return (
    <React.Fragment>
      {body}

      {/* floating bulk-approval bar (Approvals queue) */}
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
