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
const JT_STATUS_VARIANT = { Approved: "approved", Pending: "pending", Rejected: "rejected", Returned: "returned", Draft: "draft" };
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
    approvedBy: "Angela Osei", approverEmail: "aosei@gcb.com.gh", approvedAt: "5/16/2026, 2:08:34 PM",
    rejectedBy: "N/A", rejectorEmail: "N/A", rejectedAt: "N/A",
    audit: [
      { id: "jt1-1", action: 0, description: "Job title change submitted — Ag. Assurance Supervisor → Assurance Supervisor", actorName: "Peter Bosrotsi (P&C)", occurredAt: "2026-05-14T10:00:00Z", justificationReason: "Confirmation in substantive role following a successful acting period.", staffId: "EMP-18330" },
      { id: "jt1-2", action: 3, description: "Job title change approved", actorName: "Angela Osei (Head P&C)", occurredAt: "2026-05-16T14:08:00Z", justificationReason: null, staffId: "EMP-18330" },
    ] },
  { id: 2, employees: ["Bright Manu"], staffIds: "EMP-10876",
    previousTitle: "Software Engineer", newTitle: "Senior Software Engineer", grade: "Grade 3",
    department: "Information Technology", unit: "Engineering", zone: "East Zone", branch: "Tema",
    effectiveDate: "May 28, 2026", dateSubmitted: "May 10, 2026", status: "Pending",
    reason: "Re-designation to reflect expanded technical leadership responsibilities.",
    documents: ["https://files.bistasol.com/jobtitle/Role-Justification.docx"],
    approvedBy: "N/A", approverEmail: "N/A", approvedAt: "N/A",
    rejectedBy: "N/A", rejectorEmail: "N/A", rejectedAt: "N/A",
    audit: [{ id: "jt2-1", action: 0, description: "Job title change submitted — Software Engineer → Senior Software Engineer", actorName: "Peter Bosrotsi (P&C)", occurredAt: "2026-05-10T09:30:00Z", justificationReason: "Re-designation to reflect expanded technical leadership responsibilities.", staffId: "EMP-10876" }] },
  { id: 3, employees: ["Emmanuel Ansah"], staffIds: "EMP-10412",
    previousTitle: "HR Officer", newTitle: "HR Generalist", grade: "Grade 2",
    department: "Human Resource", unit: "HR Operations", zone: "South Zone", branch: "Accra",
    effectiveDate: "Jul 08, 2026", dateSubmitted: "May 18, 2026", status: "Pending",
    reason: "Title alignment with the new HR operating model and job architecture.",
    documents: ["https://files.bistasol.com/jobtitle/Job-Architecture-Memo.pdf"],
    approvedBy: "N/A", approverEmail: "N/A", approvedAt: "N/A",
    rejectedBy: "N/A", rejectorEmail: "N/A", rejectedAt: "N/A",
    audit: [{ id: "jt3-1", action: 0, description: "Job title change submitted — HR Officer → HR Generalist", actorName: "Peter Bosrotsi (P&C)", occurredAt: "2026-05-18T11:45:00Z", justificationReason: "Title alignment with the new HR operating model and job architecture.", staffId: "EMP-10412" }] },
  { id: 4, employees: ["Samuel Asante"], staffIds: "EMP-11233",
    previousTitle: "Teller", newTitle: "Senior Teller", grade: "Grade 1",
    department: "Finance", unit: "Retail", zone: "West Zone", branch: "Takoradi",
    effectiveDate: "Apr 30, 2026", dateSubmitted: "Apr 12, 2026", status: "Rejected",
    reason: "Proposed re-designation; deferred pending completion of the role-banding review.",
    documents: ["https://files.bistasol.com/jobtitle/Banding-Review.xlsx"],
    approvedBy: "N/A", approverEmail: "N/A", approvedAt: "N/A",
    rejectedBy: "Angela Osei", rejectorEmail: "aosei@gcb.com.gh", rejectedAt: "4/18/2026, 9:14:02 AM",
    rejectionReason: "Deferred pending completion of the role-banding review — the Senior Teller band has not been ratified. Resubmit once the banding committee publishes the approved structure.",
    audit: [
      { id: "jt4-1", action: 0, description: "Job title change submitted — Teller → Senior Teller", actorName: "Peter Bosrotsi (P&C)", occurredAt: "2026-04-12T10:10:00Z", justificationReason: "Proposed re-designation in recognition of consistent front-line performance.", staffId: "EMP-11233" },
      { id: "jt4-2", action: 4, description: "Job title change rejected — request closed", actorName: "Angela Osei (Head P&C)", occurredAt: "2026-04-18T09:14:00Z", justificationReason: "Deferred pending completion of the role-banding review — the Senior Teller band has not been ratified. Resubmit once the banding committee publishes the approved structure.", staffId: "EMP-11233" },
    ] },
  { id: 5, employees: ["Aba Odum"], staffIds: "EMP-18389",
    previousTitle: "Data Scientist", newTitle: "Senior Data Scientist", grade: "Grade 5", notch: "Notch 2",
    department: "Information Technology", unit: "Data & Analytics", zone: "Accra West", branch: "Ridge",
    effectiveDate: "Jul 20, 2026", dateSubmitted: "Jun 25, 2026", status: "Returned",
    reason: "Re-designation to reflect the senior analytics scope taken on since the platform rebuild.",
    documents: ["https://files.bistasol.com/jobtitle/Scope-Summary.pdf"],
    approvedBy: "N/A", approverEmail: "N/A", approvedAt: "N/A",
    rejectedBy: "N/A", rejectorEmail: "N/A", rejectedAt: "N/A",
    returnedBy: "Angela Osei", returnedAt: "6/27/2026, 9:41:12 AM",
    returnReason: "The proposed title is not in the ratified job architecture — use 'Lead Data Scientist' or raise the new title with Org Design first, then resubmit.",
    audit: [
      { id: "jt5-1", action: 0, description: "Job title change submitted — Data Scientist → Senior Data Scientist", actorName: "Peter Bosrotsi (P&C)", occurredAt: "2026-06-25T10:10:00Z", justificationReason: "Re-designation to reflect the senior analytics scope taken on since the platform rebuild.", staffId: "EMP-18389" },
      { id: "jt5-2", action: 4, description: "Job title change returned to initiator for correction", actorName: "Angela Osei (Head P&C)", occurredAt: "2026-06-27T09:41:00Z", justificationReason: "The proposed title is not in the ratified job architecture — use 'Lead Data Scientist' or raise the new title with Org Design first, then resubmit.", staffId: "EMP-18389" },
    ] },
  { id: 6, employees: ["Samuel Boateng"], staffIds: "EMP-11002",
    previousTitle: "Sales Officer", newTitle: "Senior Sales Officer", grade: "Grade 2", notch: "",
    department: "Marketing", unit: "Sales", zone: "West Zone", branch: "Kumasi",
    effectiveDate: "—", dateSubmitted: "—", status: "Draft",
    reason: "Pending confirmation of the Q3 sales structure before routing for approval.",
    documents: [],
    approvedBy: "N/A", approverEmail: "N/A", approvedAt: "N/A",
    rejectedBy: "N/A", rejectorEmail: "N/A", rejectedAt: "N/A",
    audit: [{ id: "jt6-1", action: 1, description: "Job title change drafted — saved for later completion", actorName: "Peter Bosrotsi (P&C)", occurredAt: "2026-07-21T14:20:00Z", justificationReason: null, staffId: "EMP-11002" }] },
];

/* JtFormCard / JtAutoBadge → shared FormCard / AutoBadge (src/shared/PncRequestKit.jsx). */
const JtFormCard = FormCard;
const JtAutoBadge = AutoBadge;

/* ---------- assign / edit (FULL PAGE — mirrors the Promotion form for consistency) ---------- */
// Department narrows the Job Title list; picking a Job Title auto-resolves its Grade (read-only).
function JobTitleForm({ lookups, initialData, initialEmployees, onCancel, onSubmit, onSaveDraft }) {
  const LK = lookups || window.LOOKUPS;
  const EMP = window.EMPLOYEE_LIST;
  const isEdit = !!initialData;
  const isReturned = initialData?.status === "Returned";
  const isDraft = initialData?.status === "Draft";
  const initIds = initialData ? (initialData.employees || []).map(window.firstIdForName).filter(Boolean) : (initialEmployees || []);
  const [people, setPeople] = useJt(initIds);
  const [form, setForm] = useJt({
    department: initialData?.department || "",
    newTitle: initialData?.newTitle || "",
    grade: initialData?.grade || "",
    notch: initialData?.notch || "",
    zone: initialData?.zone || "",
    unitBranch: initialData?.unitBranch || initialData?.branch || "",
    date: initialData?.effectiveDate && initialData.effectiveDate !== "—" ? initialData.effectiveDate : "",
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
  // One payload builder shared by Save-as-Draft and Submit (was duplicated inline on both buttons).
  const payload = () => ({ names: people, department: form.department, title: form.newTitle, grade: form.grade, notch: form.notch, zone: form.zone, unitBranch: form.unitBranch, notifyIds, date: form.date, reason: form.reason, docs, editId: initialData?.id });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title={isReturned ? "Review & Update Job Title Change" : isDraft ? "Continue Draft Job Title Change" : isEdit ? "Edit Job Title Change" : "Assign Job Title"}
        subtitle={isReturned ? "Address the return reason below, update the request and resubmit for approval."
          : isDraft ? "Pick up where you left off, then submit for approval."
          : isEdit ? "Update this job title change request before approval."
          : "Select staff, choose the new job title and route the change for approval."} />

      <PncReturnedBanner record={initialData} />

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
          <PncSalaryField salary={jtSalary} />
          <Field label="Zones"><Combobox value={form.zone} onChange={selectZone} options={LK.zones} placeholder="Select zone" noDataText="No zone found" /></Field>
          <Field label="New Organizational Unit/Branch"><UnitBranchCombobox value={form.unitBranch} onChange={v => set("unitBranch", v)} zone={form.zone} onZoneChange={selectZone} zones={LK.zones} /></Field>
          <Field label="Effective Date"><UI.DatePicker weekendRule value={form.date} onSelect={d => set("date", d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }))} placeholder="Pick a date" /></Field>
        </div>
      </JtFormCard>

      <JtFormCard title="Comments & Documents">
        <Field label="Comments"><UI.RichText value={form.reason} onChange={v => set("reason", v)} placeholder="Add comments for this change of job title…" /></Field>
        <PncDocsField existingUrls={initialData?.documents || []} isEditMode={isEdit} onChange={setDocs} hasDocs={hasDocs} noun="request" />
      </JtFormCard>

      <JtFormCard title="Notification">
        <NotifyPeopleField value={notifyIds} onChange={setNotifyIds} employees={EMP} />
      </JtFormCard>

      <PncFormFooter onCancel={onCancel} isReturned={isReturned} isDraft={isDraft} valid={valid}
        onSaveDraft={onSaveDraft ? () => onSaveDraft(payload()) : null} draftDisabled={people.length === 0}
        onSubmit={() => valid && onSubmit(payload())}
        submitIcon={isEdit && !isDraft ? "check-line" : "user-add-line"}
        submitLabel={isEdit ? "Update Request" : (multi ? `Assign Job Title to ${people.length}` : "Assign Job Title")} />
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
function JobTitleList({ rows, q, setQ, onOpen, onEdit, onDeleteDraft, tab, setTab, segItems, permsOf, canDecide, showDrafts, segment, setSegment, sel, setSel, title, subtitle, headerAction }) {
  const [menu, setMenu] = useJt(null);
  const JT_BLANK = { status: "", department: "" };
  const [draft, setDraft] = useJt(JT_BLANK);
  const [applied, setApplied] = useJt(JT_BLANK);
  const optsOf = (key) => [...new Set(rows.map(r => r[key]).filter(Boolean))].sort();
  const shown = rows.filter(r => {
    if (tab === "All" ? r.status === "Draft" : tab === "Drafts" ? r.status !== "Draft" : r.status !== tab) return false;
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
        <UI.FilterBar left={<Segmented items={segItems || ["Request", "Approvals"]} active={segment} onChange={setSegment} />}
          search={q} onSearch={setQ} searchPlaceholder="Search job title changes…"
          filters={[
            { label: "Status", node: <Combobox value={draft.status} onChange={v => setDraft(s => ({ ...s, status: v }))} options={["Pending", "Approved", "Rejected", "Returned"]} placeholder="All statuses" /> },
            { label: "Department", node: <Combobox value={draft.department} onChange={v => setDraft(s => ({ ...s, department: v }))} options={optsOf("department")} placeholder="All departments" /> },
          ]}
          onReset={() => { setDraft(JT_BLANK); setApplied(JT_BLANK); }}
          onApply={() => setApplied(draft)} activeCount={Object.values(applied).filter(Boolean).length} />
        <div style={{ display: "flex", gap: 2, padding: "0 16px", borderBottom: "1px solid var(--divider)" }}>
          {["All", "Pending", "Returned", ...(showDrafts ? ["Drafts"] : [])].map(t => {
            const n = t === "Returned" ? rows.filter(r => r.status === "Returned").length : t === "Drafts" ? rows.filter(r => r.status === "Draft").length : 0;
            const on = tab === t;
            return (
              <button key={t} type="button" onClick={() => setTab(t)}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, border: 0, background: "none", cursor: "pointer", padding: "11px 12px",
                  fontFamily: "var(--font-control)", fontSize: 14, fontWeight: on ? 600 : 500, color: on ? "var(--gray-900)" : "var(--gray-400)",
                  boxShadow: on ? "inset 0 -2px 0 var(--brand-yellow)" : "none" }}>
                {t}
                {n > 0 && <span style={{ background: t === "Returned" ? "#FFF7ED" : "var(--gray-100)", border: t === "Returned" ? "1px solid #FED7AA" : "1px solid var(--gray-200)", color: t === "Returned" ? "#B45309" : "var(--gray-500)", borderRadius: 999, padding: "1px 7px", fontSize: 11.5, fontWeight: 600, fontFamily: "var(--font-ui)" }}>{n}</span>}
              </button>
            );
          })}
        </div>
        {rows.length === 0
          ? <EmptyState title="No assignments yet" subtitle="Assign a job title from the Assign tab to create a request." />
          : <table className="bh">
              <thead><tr>
                <th style={{ width: 44 }}>{canDecide ? <Checkbox checked={allPendingSel} onChange={toggleAll} /> : null}</th>
                <th>Employee Name</th><th>Job Title</th><th>Effective Date</th><th>Status</th><th>Approved By</th><th style={{ width: 48 }}></th>
              </tr></thead>
              <tbody>
                {pg.pageItems.map(r => {
                  const P = permsOf ? permsOf(r) : { canEdit: true, canDecide: true };
                  const canSelect = r.status === "Pending" && canDecide;
                  const on = sel.includes(r.id);
                  return (
                  <tr key={r.id} style={{ cursor: "pointer", background: on ? "#FFFBEB" : undefined }} onClick={() => r.status === "Draft" ? onEdit(r) : onOpen(r)}>
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
                    <td>
                      <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                          <StatusBadge variant={JT_STATUS_VARIANT[r.status]} text={r.status} size="sm" />
                          {r.status === "Pending" && r.hasBeenCorrected && <span title="Corrected and resubmitted after a return" style={{ background: "#FFF7ED", border: "1px solid #FED7AA", color: "#B45309", borderRadius: 999, padding: "2px 8px", fontSize: 11, fontWeight: 600, fontFamily: "var(--font-ui)" }}>Corrected</span>}
                        </span>
                        {r.status === "Returned" && <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "#B45309", textDecoration: "underline", textUnderlineOffset: 2 }}>View return reason</span>}
                      </span>
                    </td>
                    <td>{r.approvedBy && r.approvedBy !== "N/A" ? r.approvedBy : "—"}</td>
                    <td style={{ textAlign: "right" }} onClick={e => e.stopPropagation()}>
                      <UI.RowActions actions={r.status === "Draft" ? [
                        { label: "Continue Editing", short: "Continue", icon: "edit-2-line", onClick: () => onEdit(r) },
                        { label: "Delete Draft", short: "Delete", icon: "delete-bin-6-line", danger: true, onClick: () => onDeleteDraft(r) },
                      ] : r.status === "Pending" && P.canEdit ? [
                        { label: "View Details", short: "View", icon: "eye-line", onClick: () => onOpen(r) },
                        { label: "Edit Details", short: "Edit", icon: "edit-2-line", onClick: () => onEdit(r) },
                      ] : r.status === "Returned" && P.canEdit ? [
                        { label: "View Details", short: "View", icon: "eye-line", onClick: () => onOpen(r) },
                        { label: "Review & Update", short: "Review", icon: "edit-2-line", onClick: () => onEdit(r) },
                      ] : [
                        { label: "View Details", short: "View", icon: "eye-line", onClick: () => onOpen(r) },
                      ]} />
                    </td>
                  </tr>
                  );
                })}
                {shown.length === 0 && <tr><td colSpan={7} style={{ padding: 0 }}><EmptyState compact title={tab === "Drafts" ? "No drafts" : tab === "Returned" ? "No returned requests" : "No results found"} subtitle={tab === "Drafts" ? "Save a job title change as a draft to continue it later." : tab === "Returned" ? "Requests returned for correction will appear here." : "No job title change matches your search."} /></td></tr>}
              </tbody>
            </table>}
        {rows.length > 0 && shown.length > 0 && <div style={{ borderTop: "1px solid var(--divider)" }}><Pagination page={pg.page} pages={pg.pages} onPrev={pg.prev} onNext={pg.next} /></div>}
        </div>
      </div>
    </div>
  );
}

/* ---------- details — "Job Title Change Approval" ---------- */
function JobTitleDetails({ record, perms, onApprove, onReject, onReturn, onEdit, onAccept, onUpdate, onToast }) {
  const r = record;
  const P = perms || { canEdit: true, canDecide: true, isSubject: false };
  const [rejectOpen, setRejectOpen] = useJt(false);
  const [returnOpen, setReturnOpen] = useJt(false);
  const [trailOpen, setTrailOpen] = useJt(false);
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
            {r.status === "Pending" && r.hasBeenCorrected && <span title="This request was corrected and resubmitted after a return" style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#FFF7ED", border: "1px solid #FED7AA", color: "#B45309", borderRadius: 999, padding: "3px 10px", fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 12 }}><Icon name="refresh-line" size={13} color="#B45309" />Corrected & Resubmitted</span>}
            <PncViewOnlyChip perms={P} />
            <Button variant="stroke" icon="history-line" onClick={() => setTrailOpen(true)}>Audit Trail</Button>
            {pending && P.canDecide && (
              <React.Fragment>
                <Button variant="stroke" icon="arrow-go-back-line" onClick={() => setReturnOpen(true)} style={{ color: "#B45309", borderColor: "#FED7AA" }}>Return for Correction</Button>
                <Button variant="stroke" icon="close-line" onClick={() => setRejectOpen(true)} style={{ color: "#DC2626", borderColor: "#F3C2C2" }}>Reject</Button>
                <Button variant="primary" icon="check-line" onClick={() => onApprove(r)}>Approve</Button>
              </React.Fragment>
            )}
            {r.status === "Returned" && P.canEdit && <Button variant="primary" icon="edit-2-line" onClick={() => onEdit(r)}>Review & Update</Button>}
            {r.status === "Approved" && !r.accepted && P.canEdit && <Button variant="primary" icon="user-follow-line" onClick={() => onAccept(r)}>Record Employee Acceptance</Button>}
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

      {r.status === "Returned" && r.returnReason && (
        <div className="card" style={{ padding: 0 }}>
          <DetailCard icon="arrow-go-back-line" title="Reason For Return">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ background: "#FFFBEB", border: "1px solid #FED7AA", borderRadius: 8, padding: "14px 16px", fontFamily: "var(--font-ui)", fontSize: 14, lineHeight: "22px", color: "var(--gray-800)" }}>{r.returnReason}</div>
              <span style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--gray-400)" }}>Returned by {r.returnedBy || "—"}{r.returnedAt && r.returnedAt !== "N/A" ? ` · ${r.returnedAt}` : ""} — review the reason, update the request and resubmit for approval.</span>
            </div>
          </DetailCard>
        </div>
      )}

      {r.status === "Rejected" && r.rejectionReason && (
        <div className="card" style={{ padding: 0 }}>
          <DetailCard icon="error-warning-line" title="Reason For Rejection">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ background: "#FEF2F2", border: "1px solid #FBD9D9", borderRadius: 8, padding: "14px 16px", fontFamily: "var(--font-ui)", fontSize: 14, lineHeight: "22px", color: "var(--gray-800)" }}>{r.rejectionReason}</div>
              <span style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--gray-400)" }}>Rejected by {r.rejectedBy || "—"}{r.rejectedAt && r.rejectedAt !== "N/A" ? ` · ${r.rejectedAt}` : ""} — a rejection is final; this request is closed.</span>
            </div>
          </DetailCard>
        </div>
      )}

      <RejectionReasonModal open={rejectOpen} onClose={() => setRejectOpen(false)}
        title="Reject Job Title Change" noun="job title change"
        onConfirm={(reason) => { setRejectOpen(false); onReject(r, reason); }} />

      <RejectionReasonModal open={returnOpen} onClose={() => setReturnOpen(false)}
        title="Return for Correction" noun="job title change" tone="warning"
        onConfirm={(reason) => { setReturnOpen(false); onReturn(r, reason); }} />

      <AuditTrailDrawer open={trailOpen} onClose={() => setTrailOpen(false)} name={r.employees[0]}
        sub={`${r.staffIds} · ${r.newTitle}`} badge={<StatusBadge variant={JT_STATUS_VARIANT[r.status]} text={r.status} />}
        entries={r.audit || []} />
    </div>
  );
}

/* ---------- controller ---------- */
function JobTitleScreen({ onToast, onSubPage, lookups }) {
  const DIR = window.EMPLOYEE_DIRECTORY;
  const [records, setRecords] = useJt(JOBTITLE_SEED);
  const actor = usePncActor();
  const permsOf = (r) => pncPermsFor(actor, r);
  const [segment, setSegment] = useJt("Request");   // Request (roster) | Approvals
  const [rosterQ, setRosterQ] = useJt("");
  const [approvalSel, setApprovalSel] = useJt([]);
  const [q, setQ] = useJt("");
  const [tab, setTab] = useJt("All");
  const [bulkRejectIds, setBulkRejectIds] = useJt(null);
  const [view, setView] = useJt({ name: "list" });   // list | add | edit | details
  const [confirm, setConfirm] = useJt(null);

  useJtEffect(() => {
    if (!onSubPage) return;
    const toList = () => setView({ name: "list" });
    if (view.name === "add") onSubPage({ trail: [{ label: "Job Title", onClick: toList }, { label: "Assign Job Title" }] });
    else if (view.name === "edit") { const er = records.find(r => r.id === view.id) || {}; onSubPage({ trail: [{ label: "Job Title", onClick: toList }, { label: er.status === "Returned" ? "Review & Update" : er.status === "Draft" ? "Continue Draft" : "Edit Job Title Change" }] }); }
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
        // Drafts being finally submitted go to POST /job-title-change-requests/{id}/submit; everything else PUTs.
        const tr = pncEditTransition({ kind: "jobTitle", id: f.editId, prevStatus: (records.find(r => r.id === f.editId) || {}).status,
          payload: { ...f, documents: allDocs }, today: todayJt(), draftLabel: f.title, reason: f.reason, staffId: f.names.join(", ") });
        setRecords(rs => rs.map(r => r.id === f.editId ? { ...r, employees: f.names.map(id => (window.EMP_BY_ID[id] || {}).name || id), staffIds: f.names.join(", "), newTitle: f.title, grade: f.grade || r.grade, notch: f.notch || r.notch, zone: f.zone || r.zone, branch: f.unitBranch || r.branch,
          notifyIds: f.notifyIds || r.notifyIds || [],
          effectiveDate: fmtJtDate(f.date), reason: f.reason || "", approvers: f.approvers || [], documents: allDocs,
          ...tr.patch, audit: [...(r.audit || []), tr.entry] } : r));
        onToast(tr.wasReturned ? "Corrected & Resubmitted for Approval" : tr.wasDraft ? "Job Title Change Submitted" : "Job Title Change Updated", { tone: "success" });
        if (tr.wasReturned || tr.wasDraft) setTab("All");
        setView({ name: "list" });
        setConfirm(null); return;
      }
      const recs = f.names.map(id => {
        const e = window.EMP_BY_ID[id] || {};
        return { id: jtId(), employees: [e.name || id], staffIds: e.staffId || id, createdBy: actor.name,
          previousTitle: e.title || "—", newTitle: f.title, grade: f.grade || e.grade || "—", notch: f.notch || "—",
          department: e.dept || "—", unit: e.unit || "—", zone: f.zone || e.zone || "—", branch: f.unitBranch || e.branch || "—",
          notifyIds: f.notifyIds || [],
          effectiveDate: fmtJtDate(f.date), dateSubmitted: todayJt(), status: "Pending",
          reason: f.reason || "", documents: allDocs, approvers: f.approvers || [],
          approvedBy: "N/A", approverEmail: "N/A", approvedAt: "N/A", rejectedBy: "N/A", rejectorEmail: "N/A", rejectedAt: "N/A",
          audit: [pncEntry({ action: 0, description: `Job title change submitted — ${e.title || "—"} → ${f.title}`, justificationReason: f.reason, staffId: e.staffId || id })] };
      });
      PncApi.create("jobTitle", { ...f, documents: allDocs });   // POST /job-title-change-requests — the non-draft upload endpoint
      setRecords(rs => [...recs, ...rs]);
      onToast(f.names.length > 1 ? `Job Title Assigned to ${f.names.length} Employees` : "Job Title Assigned", { tone: "success" });
      setView({ name: "list" }); setSegment("Approvals");
    } else if (c.kind === "deleteDraft") {
      setRecords(rs => rs.filter(r => r.id !== c.row.id));
      onToast("Draft Deleted", { tone: "error" });
    } else if (c.kind === "approve") {
      const now = new Date().toLocaleString("en-US");
      setRecords(rs => rs.map(r => r.id === c.row.id ? { ...r, status: "Approved", wfStatus: "Approved", approvedBy: actor.name, approverEmail: actor.email, approvedAt: now,
        audit: [...(r.audit || []), pncEntry({ action: 3, description: "Job title change approved", actorName: `${actor.name} (${actor.role})`, staffId: r.staffIds })] } : r));
      onToast("Job Title Change Approved", { tone: "success" });
    } else if (c.kind === "accept") {
      setRecords(rs => rs.map(r => r.id === c.row.id ? { ...r, accepted: true,
        audit: [...(r.audit || []), pncEntry({ action: 7, description: "Employee accepted the job title change", actorName: `${r.employees[0]} (Employee)`, staffId: r.staffIds })] } : r));
      onToast("Employee Acceptance Recorded", { tone: "success" });
    } else if (c.kind === "bulkApprove") {
      const now = new Date().toLocaleString("en-US");
      const ids = c.ids;
      setRecords(rs => rs.map(r => ids.includes(r.id) ? { ...r, status: "Approved", approvedBy: actor.name, approverEmail: actor.email, approvedAt: now,
        audit: [...(r.audit || []), pncEntry({ action: 3, description: "Job title change approved", actorName: `${actor.name} (${actor.role})`, staffId: r.staffIds })] } : r));
      onToast(`${ids.length} Job Title Change${ids.length > 1 ? "s" : ""} Approved`, { tone: "success" });
      setApprovalSel([]);
    }
    setConfirm(null);
  };

  // reject from the detail page — TERMINAL: the request is closed with a captured reason
  const rejectWithReason = (row, reason) => {
    const now = new Date().toLocaleString("en-US");
    setRecords(rs => rs.map(r => r.id === row.id ? { ...r, status: "Rejected", wfStatus: "Rejected", rejectedBy: actor.name, rejectorEmail: actor.email, rejectedAt: now, rejectionReason: reason,
      audit: [...(r.audit || []), pncEntry({ action: 4, description: "Job title change rejected — request closed", actorName: `${actor.name} (${actor.role})`, justificationReason: reason, staffId: r.staffIds })] } : r));
    onToast("Job Title Change Rejected", { tone: "error" });
  };

  // return from the detail page — sends the request BACK to the initiator for correction + resubmit
  const returnWithReason = (row, reason) => {
    const now = new Date().toLocaleString("en-US");
    setRecords(rs => rs.map(r => r.id === row.id ? { ...r, status: "Returned", returnedBy: actor.name, returnedAt: now, returnReason: reason,
      audit: [...(r.audit || []), pncEntry({ action: 4, description: "Job title change returned to initiator for correction", actorName: `${actor.name} (${actor.role})`, justificationReason: reason, staffId: r.staffIds })] } : r));
    onToast("Returned to Initiator for Correction");
  };

  // bulk reject — captures ONE reason applied to the whole selection
  const bulkRejectWithReason = (reason) => {
    const now = new Date().toLocaleString("en-US");
    const ids = bulkRejectIds || [];
    setRecords(rs => rs.map(r => ids.includes(r.id) ? { ...r, status: "Rejected", rejectedBy: actor.name, rejectorEmail: actor.email, rejectedAt: now, rejectionReason: reason,
      audit: [...(r.audit || []), pncEntry({ action: 4, description: "Job title change rejected — request closed", actorName: `${actor.name} (${actor.role})`, justificationReason: reason, staffId: r.staffIds })] } : r));
    onToast(`${ids.length} Job Title Change${ids.length > 1 ? "s" : ""} Rejected`, { tone: "error" });
    setApprovalSel([]); setBulkRejectIds(null);
  };

  // save-as-draft — ≥1 employee, no other validation; drafts live in the Drafts tab
  const saveDraft = (f) => {
    const allDocs = SupportingDocuments.resolve(f.docs, "https://files.bistasol.com/jobtitle/");
    const names = f.names.map(id => (window.EMP_BY_ID[id] || {}).name || id);
    const first = window.EMP_BY_ID[f.names[0]] || {};
    const editingDraft = f.editId && (records.find(r => r.id === f.editId) || {}).status === "Draft";
    if (editingDraft) {
      PncApi.updateDraft("jobTitle", f.editId, f);   // drafts persist via the draft endpoints — never /submit
      setRecords(rs => rs.map(r => r.id === f.editId ? { ...r, employees: names, staffIds: f.names.join(", ") || "—", newTitle: f.title || "—", grade: f.grade || r.grade, notch: f.notch || "",
        department: f.department || r.department, zone: f.zone || r.zone, branch: f.unitBranch || r.branch,
        notifyIds: f.notifyIds || [], effectiveDate: f.date ? fmtJtDate(f.date) : "—", reason: f.reason || "", documents: allDocs } : r));
    } else {
      PncApi.saveDraft("jobTitle", f);
      setRecords(rs => [{ id: jtId(), employees: names, staffIds: f.names.join(", ") || "—", createdBy: actor.name,
        previousTitle: first.title || "—", newTitle: f.title || "—", grade: f.grade || first.grade || "—", notch: f.notch || "",
        department: f.department || first.dept || "—", unit: first.unit || "—", zone: f.zone || first.zone || "—", branch: f.unitBranch || first.branch || "—",
        notifyIds: f.notifyIds || [],
        effectiveDate: f.date ? fmtJtDate(f.date) : "—", dateSubmitted: "—", status: "Draft",
        reason: f.reason || "", documents: allDocs,
        approvedBy: "N/A", approverEmail: "N/A", approvedAt: "N/A", rejectedBy: "N/A", rejectorEmail: "N/A", rejectedAt: "N/A",
        audit: [pncEntry({ action: 1, description: "Job title change drafted — saved for later completion", staffId: f.names.join(", ") })],
      }, ...rs]);
    }
    onToast("Draft Saved", { tone: "success" });
    setView({ name: "list" }); setSegment("Approvals"); setTab("Drafts");
  };

  let body;
  if (view.name === "add") {
    body = <JobTitleForm lookups={lookups} initialEmployees={view.initialEmployees} onCancel={() => setView({ name: "list" })} onSubmit={submitAssign} onSaveDraft={saveDraft} />;
  } else if (view.name === "edit" && editing) {
    body = <JobTitleForm lookups={lookups} initialData={editing} onCancel={() => setView({ name: "list" })} onSubmit={submitAssign} onSaveDraft={editing.status === "Draft" ? saveDraft : null} />;
  } else if (view.name === "details" && current) {
    body = <JobTitleDetails record={current} perms={permsOf(current)}
      onApprove={(r) => setConfirm({ kind: "approve", row: r })} onReject={rejectWithReason} onReturn={returnWithReason}
      onEdit={(r) => setView({ name: "edit", id: r.id })} onAccept={(r) => setConfirm({ kind: "accept", row: r })}
      onUpdate={(partial) => setRecords(rs => rs.map(x => x.id === current.id ? { ...x, ...partial } : x))} onToast={onToast} />;
  } else {
    const addAction = (
      <React.Fragment>
        <PncActorSwitch />
        {actor.canCreate && <Button variant="primary" icon="add-line" onClick={() => setView({ name: "add", initialEmployees: [] })}>Assign Job Title</Button>}
      </React.Fragment>
    );
    body = (
      <React.Fragment>
        {(segment === "Request" && actor.canCreate)
          ? <JobTitleRoster q={rosterQ} setQ={setRosterQ}
              onCreate={(ids) => setView({ name: "add", initialEmployees: ids })} segment={segment} setSegment={setSegment}
              title="Job Title" subtitle="Assign or bulk-assign job titles to staff, and track approval status."
              headerAction={addAction} />
          : <JobTitleList rows={records.filter(r => r.status !== "Draft" || permsOf(r).canEdit)} q={q} setQ={setQ}
              onOpen={(r) => setView({ name: "details", id: r.id })} onEdit={(r) => setView({ name: "edit", id: r.id })} onDeleteDraft={(r) => setConfirm({ kind: "deleteDraft", row: r })}
              tab={tab} setTab={setTab} permsOf={permsOf} canDecide={actor.canDecide} showDrafts={actor.canCreate} segItems={actor.canCreate ? ["Request", "Approvals"] : ["Approvals"]}
              segment={segment} setSegment={setSegment} sel={approvalSel} setSel={setApprovalSel}
              title="Job Title" subtitle="Assign or bulk-assign job titles to staff, and track approval status."
              headerAction={addAction} />}
      </React.Fragment>
    );
  }

  const CONFIRM = {
    assign:  { t: "Assign Job Title", m: "assign this job title", l: "Yes, Assign", i: "user-add-line", c: "Cancel" },
    deleteDraft: { t: "Delete Draft", m: "delete this draft", l: "Yes, Delete", i: "delete-bin-6-line", c: "No" },
    approve: { t: "Approve Job Title Change", m: "approve this job title change", l: "Yes, Approve", i: "check-line", c: "No" },
    accept:  { t: "Record Employee Acceptance", m: "record that the employee has accepted this job title change", l: "Yes, Record", i: "user-follow-line", c: "No" },
    bulkApprove: { t: "Approve Job Title Changes", m: "approve", l: "Yes, Approve", i: "check-line", c: "No" },
  };
  const confirmMsg = () => {
    const c = confirm;
    if (c.kind === "assign") {
      const k = c.form.names.length;
      return k > 1 ? `Are you sure you want to assign this job title to ${k} employees? Each assignment will be pending approval.`
        : "Are you sure you want to assign this job title? It will be pending approval.";
    }
    if (c.kind === "bulkApprove") {
      const k = c.ids.length;
      return `Are you sure you want to ${CONFIRM[c.kind].m} ${k} selected job title change${k > 1 ? "s" : ""}?`;
    }
    return `Are you sure you want to ${CONFIRM[c.kind].m}?`;
  };

  const approvalBarVisible = view.name === "list" && segment === "Approvals" && approvalSel.length > 0 && actor.canDecide;

  return (
    <React.Fragment>
      {body}

      {/* floating bulk-approval bar (Approvals queue) */}
      <BulkBar count={approvalSel.length} noun="changes selected" visible={approvalBarVisible} onClear={() => setApprovalSel([])}>
        <Button variant="stroke" icon="close-line" onClick={() => setBulkRejectIds(approvalSel)} style={{ color: "#DC2626", borderColor: "#F3C2C2" }}>Reject</Button>
        <Button variant="primary" icon="check-line" onClick={() => setConfirm({ kind: "bulkApprove", ids: approvalSel })}>Approve</Button>
      </BulkBar>

      <RejectionReasonModal open={!!bulkRejectIds} onClose={() => setBulkRejectIds(null)}
        title={`Reject ${(bulkRejectIds || []).length} Job Title Change${(bulkRejectIds || []).length > 1 ? "s" : ""}`} noun="selection"
        description="Provide one reason for rejecting the selected job title changes. Rejection is final — the initiators will be notified."
        onConfirm={bulkRejectWithReason} />

      {confirm && (() => { const cc = CONFIRM[confirm.kind]; return (
        <ConfirmModal title={cc.t} message={confirmMsg()} confirmLabel={cc.l} confirmIcon={cc.i}
          cancelLabel={cc.c} onConfirm={runConfirm} onClose={() => setConfirm(null)} />
      ); })()}
    </React.Fragment>
  );
}

Object.assign(window, { JobTitleScreen });
