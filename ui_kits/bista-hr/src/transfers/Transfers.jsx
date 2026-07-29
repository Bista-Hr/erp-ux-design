// BISTA HR · transfers/Transfers — HR Management ▸ Transfers.
// Implements the Employee Transfer Workflow / Electronic Transfer Request Form:
//   TransfersList    : All / Approved / Pending tabs; table of transfers (employee + ID,
//                      location/department change, effective date, classification, status,
//                      approver) + Import / Add.
//   TransferForm     : full-page "Create Transfer" matching the Electronic Transfer Request
//                      Form fields — Transfer Classification (Intra/Inter-Departmental),
//                      multi-select employee(s) → auto-populated current details, proposed
//                      new location / department / unit, optional new job title, effective
//                      date, reason/justification, supporting documents (reuses
//                      SupportingDocsUploader + FileIcon) and stakeholder notification.
//   TransferDetails  : "Transfer Approval" — Transfer Information, Supporting Documents and
//                      Approval Information, with Approve / Reject for pending records.
// Every create / approve / reject / archive routes through a ConfirmModal then a toast.
// Reuses EMPLOYEE_DIRECTORY, PageHeader, DetailCard / DetailPanel, StatusBadge, Segmented.
const { useState: useTr, useEffect: useTrEffect } = React;

let TR_SEQ = 800;
const trId = () => ++TR_SEQ;
const TR_STATUS_VARIANT = { Approved: "approved", Pending: "pending", Rejected: "rejected", Returned: "returned", Draft: "draft" };
const todayTr = () => new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
const TRANSFER_CLASSES = ["Intra-Departmental", "Inter-Departmental"];
const TR_DOC = (name, ext, size, docType) => ({ name, ext, size, docType });

const TRANSFER_SEED = [
  { id: 1, employees: ["Aaron Appiah"], staffIds: "EMP-18330", classification: "Inter-Departmental",
    previousLocation: "Accra East", newLocation: "Central Zones", previousDept: "Finance", newDept: "Operations",
    previousUnit: "Assurance", currentTitle: "Ag. Assurance Supervisor", newTitle: "Operations Supervisor",
    grade: "Grade 4", zone: "Accra East",
    effectiveDate: "Jun 01, 2026", dateSubmitted: "May 14, 2026", status: "Approved",
    reason: "Workforce realignment to strengthen the Operations team at the Ridge branch.",
    documents: ["https://files.bistasol.com/transfers/Transfer-Recommendation.pdf", "https://files.bistasol.com/transfers/Handover-Checklist.docx"],
    approvedBy: "Angela Osei", approverEmail: "aosei@gcb.com.gh", approvedAt: "5/16/2026, 2:08:34 PM",
    rejectedBy: "N/A", rejectorEmail: "N/A", rejectedAt: "N/A",
    audit: [
      { id: "tr1-1", action: 0, description: "Inter-Departmental transfer submitted — Finance → Operations, effective Jun 01, 2026", actorName: "Peter Bosrotsi (P&C)", occurredAt: "2026-05-14T10:20:00Z", justificationReason: "Workforce realignment to strengthen the Operations team at the Ridge branch.", staffId: "EMP-18330" },
      { id: "tr1-2", action: 3, description: "Transfer approved", actorName: "Angela Osei (Head P&C)", occurredAt: "2026-05-16T14:08:00Z", justificationReason: null, staffId: "EMP-18330" },
    ] },
  { id: 2, employees: ["Abass Abdul Mumin"], staffIds: "EMP-17431", classification: "Intra-Departmental",
    previousLocation: "Central Zones", newLocation: "West Zone", previousDept: "Operations", newDept: "Operations",
    previousUnit: "Branch Support", currentTitle: "Branch Support", newTitle: "",
    grade: "Grade 3", zone: "Central Zones",
    effectiveDate: "May 28, 2026", dateSubmitted: "May 10, 2026", status: "Approved",
    reason: "Relocation to cover staffing gap at the Takoradi branch within the same department.",
    documents: ["https://files.bistasol.com/transfers/Approval-Memo.pdf"],
    approvedBy: "Angela Osei", approverEmail: "aosei@gcb.com.gh", approvedAt: "5/12/2026, 10:22:10 AM",
    rejectedBy: "N/A", rejectorEmail: "N/A", rejectedAt: "N/A",
    audit: [
      { id: "tr2-1", action: 0, description: "Intra-Departmental transfer submitted — Operations → Operations, effective May 28, 2026", actorName: "Peter Bosrotsi (P&C)", occurredAt: "2026-05-10T09:00:00Z", justificationReason: "Relocation to cover staffing gap at the Takoradi branch within the same department.", staffId: "EMP-17431" },
      { id: "tr2-2", action: 3, description: "Transfer approved", actorName: "Angela Osei (Head P&C)", occurredAt: "2026-05-12T10:22:00Z", justificationReason: null, staffId: "EMP-17431" },
    ] },
  { id: 3, employees: ["Aba Odum"], staffIds: "EMP-18389", classification: "Inter-Departmental",
    previousLocation: "Accra West", newLocation: "North Zone", previousDept: "Information Technology", newDept: "Operations",
    previousUnit: "Data & Analytics", currentTitle: "Data Scientist", newTitle: "Analytics Lead",
    grade: "Grade 5", zone: "Accra West",
    effectiveDate: "Jul 08, 2026", dateSubmitted: "May 18, 2026", status: "Pending",
    reason: "Cross-functional move to embed analytics capability within the Operations department.",
    documents: ["https://files.bistasol.com/transfers/Business-Case.pdf"],
    approvedBy: "N/A", approverEmail: "N/A", approvedAt: "N/A",
    rejectedBy: "N/A", rejectorEmail: "N/A", rejectedAt: "N/A",
    audit: [{ id: "tr3-1", action: 0, description: "Inter-Departmental transfer submitted — Information Technology → Operations, effective Jul 08, 2026", actorName: "Peter Bosrotsi (P&C)", occurredAt: "2026-05-18T11:30:00Z", justificationReason: "Cross-functional move to embed analytics capability within the Operations department.", staffId: "EMP-18389" }] },
  { id: 4, employees: ["Franklin Brobbey"], staffIds: "EMP-10231", classification: "Intra-Departmental",
    previousLocation: "South Zone", newLocation: "West Zone", previousDept: "Finance", newDept: "Finance",
    previousUnit: "Accounts", currentTitle: "Accountant", newTitle: "",
    grade: "Grade 2", zone: "South Zone",
    effectiveDate: "May 28, 2026", dateSubmitted: "May 09, 2026", status: "Pending",
    reason: "Employee request to transfer closer to family; role available at the Kumasi branch.",
    documents: ["https://files.bistasol.com/transfers/Employee-Request.docx", "https://files.bistasol.com/transfers/ID-Verification.jpg"],
    approvedBy: "N/A", approverEmail: "N/A", approvedAt: "N/A",
    rejectedBy: "N/A", rejectorEmail: "N/A", rejectedAt: "N/A",
    audit: [{ id: "tr4-1", action: 0, description: "Intra-Departmental transfer submitted — Finance → Finance, effective May 28, 2026", actorName: "Peter Bosrotsi (P&C)", occurredAt: "2026-05-09T08:15:00Z", justificationReason: "Employee request to transfer closer to family; role available at the Kumasi branch.", staffId: "EMP-10231" }] },
  { id: 5, employees: ["Samuel Boateng"], staffIds: "EMP-11002", classification: "Inter-Departmental",
    previousLocation: "West Zone", newLocation: "Central Zones", previousDept: "Marketing", newDept: "Operations",
    previousUnit: "Sales", currentTitle: "Sales Officer", newTitle: "Retail Officer",
    grade: "Grade 1", zone: "West Zone",
    effectiveDate: "Apr 30, 2026", dateSubmitted: "Apr 12, 2026", status: "Rejected",
    reason: "Proposed move to Retail Operations; deferred pending replacement at current branch.",
    documents: ["https://files.bistasol.com/transfers/Transfer-Proposal.pdf"],
    approvedBy: "N/A", approverEmail: "N/A", approvedAt: "N/A",
    rejectedBy: "Angela Osei", rejectorEmail: "aosei@gcb.com.gh", rejectedAt: "4/18/2026, 9:14:02 AM",
    rejectionReason: "Deferred until a replacement Sales Officer is confirmed for the Kumasi branch — the branch cannot run below minimum staffing. Revise the effective date once the replacement's start date is known and resubmit.",
    audit: [
      { id: "tr5-1", action: 0, description: "Inter-Departmental transfer submitted — Marketing → Operations, effective Apr 30, 2026", actorName: "Peter Bosrotsi (P&C)", occurredAt: "2026-04-12T10:05:00Z", justificationReason: "Proposed move to Retail Operations to broaden branch-level experience.", staffId: "EMP-11002" },
      { id: "tr5-2", action: 4, description: "Transfer rejected — request closed", actorName: "Angela Osei (Head P&C)", occurredAt: "2026-04-18T09:14:00Z", justificationReason: "Deferred until a replacement Sales Officer is confirmed for the Kumasi branch — the branch cannot run below minimum staffing. Revise the effective date once the replacement's start date is known and resubmit.", staffId: "EMP-11002" },
    ] },
  { id: 6, employees: ["Samuel Asante"], staffIds: "EMP-11233", classification: "Intra-Departmental",
    previousLocation: "West Zone", newLocation: "South Zone", previousDept: "Finance", newDept: "Finance",
    previousUnit: "Retail", currentTitle: "Teller", newTitle: "",
    grade: "Grade 1", zone: "West Zone",
    effectiveDate: "Jul 15, 2026", dateSubmitted: "Jun 22, 2026", status: "Returned",
    reason: "Employee requested relocation to Accra for family reasons; a Teller vacancy is confirmed at the Accra branch.",
    documents: ["https://files.bistasol.com/transfers/Employee-Request-Letter.pdf"],
    approvedBy: "N/A", approverEmail: "N/A", approvedAt: "N/A",
    rejectedBy: "N/A", rejectorEmail: "N/A", rejectedAt: "N/A",
    returnedBy: "Angela Osei", returnedAt: "6/24/2026, 10:15:21 AM",
    returnReason: "The receiving branch's headcount approval is missing — attach the Accra branch manager's confirmation and align the effective date to the start of a pay period.",
    audit: [
      { id: "tr6-1", action: 0, description: "Intra-Departmental transfer submitted — Finance → Finance, effective Jul 15, 2026", actorName: "Peter Bosrotsi (P&C)", occurredAt: "2026-06-22T09:05:00Z", justificationReason: "Employee requested relocation to Accra for family reasons; a Teller vacancy is confirmed at the Accra branch.", staffId: "EMP-11233" },
      { id: "tr6-2", action: 4, description: "Transfer returned to initiator for correction", actorName: "Angela Osei (Head P&C)", occurredAt: "2026-06-24T10:15:00Z", justificationReason: "The receiving branch's headcount approval is missing — attach the Accra branch manager's confirmation and align the effective date to the start of a pay period.", staffId: "EMP-11233" },
    ] },
  { id: 7, employees: ["Emmanuel Ansah"], staffIds: "EMP-10412", classification: "Inter-Departmental",
    previousLocation: "South Zone", newLocation: "East Zone", previousDept: "Human Resource", newDept: "Operations",
    previousUnit: "HR Operations", currentTitle: "HR Officer", newTitle: "",
    grade: "Grade 2", zone: "South Zone",
    effectiveDate: "—", dateSubmitted: "—", status: "Draft",
    reason: "Move to Operations to support the Tema expansion; awaiting line-manager confirmation.",
    documents: [],
    approvedBy: "N/A", approverEmail: "N/A", approvedAt: "N/A",
    rejectedBy: "N/A", rejectorEmail: "N/A", rejectedAt: "N/A",
    audit: [{ id: "tr7-1", action: 1, description: "Transfer drafted — saved for later completion", actorName: "Peter Bosrotsi (P&C)", occurredAt: "2026-07-21T16:40:00Z", justificationReason: null, staffId: "EMP-10412" }] },
];

/* ---------- requests list (approval queue) ---------- */
function TransfersList({ rows, q, setQ, onOpen, onEdit, onDeleteDraft, tab, setTab, segItems, permsOf, canDecide, showDrafts, segment, setSegment, sel, setSel, title, subtitle, headerAction }) {
  const [menu, setMenu] = useTr(null);
  const TR_BLANK = { status: "", newDept: "" };
  const [draft, setDraft] = useTr(TR_BLANK);
  const [applied, setApplied] = useTr(TR_BLANK);
  const optsOf = (key) => [...new Set(rows.map(r => r[key]).filter(Boolean))].sort();
  const shown = rows.filter(r => {
    if (tab === "All" ? r.status === "Draft" : tab === "Drafts" ? r.status !== "Draft" : r.status !== tab) return false;
    if (q !== "" && !(r.employees.join(" ").toLowerCase().includes(q.toLowerCase()) || r.newLocation.toLowerCase().includes(q.toLowerCase()))) return false;
    if (applied.status && r.status !== applied.status) return false;
    if (applied.newDept && r.newDept !== applied.newDept) return false;
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
          search={q} onSearch={setQ} searchPlaceholder="Search transfers…"
          filters={[
            { label: "Status", node: <Combobox value={draft.status} onChange={v => setDraft(s => ({ ...s, status: v }))} options={["Pending", "Approved", "Rejected", "Returned"]} placeholder="All statuses" /> },
            { label: "Department", node: <Combobox value={draft.newDept} onChange={v => setDraft(s => ({ ...s, newDept: v }))} options={optsOf("newDept")} placeholder="All departments" /> },
          ]}
          onReset={() => { setDraft(TR_BLANK); setApplied(TR_BLANK); }}
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
          ? <EmptyState title="No transfers yet" subtitle="Select staff from the Transfer tab to raise a transfer." />
          : <table className="bh">
              <thead><tr>
                <th style={{ width: 44 }}>{canDecide ? <Checkbox checked={allPendingSel} onChange={toggleAll} /> : null}</th>
                <th>Employee Name</th><th>Department</th><th>Classification</th><th>Effective Date</th><th>Status</th><th>Approved By</th><th style={{ width: 48 }}></th>
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
                        <span style={{ color: "var(--gray-500)" }}>{r.previousDept}</span>
                        <Icon name="arrow-right-line" size={15} color="var(--gray-400)" />
                        <span style={{ color: "var(--gray-900)", fontWeight: 500 }}>{r.newDept}</span>
                      </span>
                    </td>
                    <td><span style={{ fontSize: 13, color: "var(--gray-700)" }}>{r.classification}</span></td>
                    <td>{r.effectiveDate}</td>
                    <td>
                      <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                          <StatusBadge variant={TR_STATUS_VARIANT[r.status]} text={r.status} size="sm" />
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
                        { label: "Edit Transfer", short: "Edit", icon: "edit-2-line", onClick: () => onEdit(r) },
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
                {shown.length === 0 && <tr><td colSpan={8} style={{ padding: 0 }}><EmptyState compact title={tab === "Drafts" ? "No drafts" : tab === "Returned" ? "No returned requests" : "No results found"} subtitle={tab === "Drafts" ? "Save a transfer as a draft to continue it later." : tab === "Returned" ? "Requests returned for correction will appear here." : "No transfer matches your search."} /></td></tr>}
              </tbody>
            </table>}
        {rows.length > 0 && shown.length > 0 && <div style={{ borderTop: "1px solid var(--divider)" }}><Pagination page={pg.page} pages={pg.pages} onPrev={pg.prev} onNext={pg.next} /></div>}
        </div>
      </div>
    </div>
  );
}

/* ---------- employee roster (shared EmployeeSelectionRoster — single source of truth) ---------- */
function TransferRoster({ q, setQ, segment, setSegment, onCreate, title, subtitle, headerAction }) {
  const rows = window.EMPLOYEE_LIST.map(e => ({
    id: e.id, name: e.name, employeeNumber: e.staffId, jobTitle: e.title,
    jobGrade: e.grade, department: e.dept, unit: e.unit, branch: e.branch, zone: e.zone, profilePictureUrl: e.profilePictureUrl || "",
  }));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title={title} subtitle={subtitle} actions={headerAction} />
      <div className="card" style={{ padding: 20 }}>
        <div className="bh-tablebox">
        <UI.FilterBar left={<Segmented items={["Request", "Approvals"]} active={segment} onChange={setSegment} />}
          search={q} onSearch={setQ} searchPlaceholder="Search staff…" />
        <EmployeeSelectionRoster employees={rows} itemLabel="staff"
          actionLabel="Create Transfer" onProceed={onCreate} searchQuery={q} />
        </div>
      </div>
    </div>
  );
}

/* ---------- create form (full page) ---------- */
function TransferForm({ lookups, initialEmployees, initialData, onCancel, onSubmit, onSaveDraft }) {
  const LK = lookups || window.LOOKUPS;
  const byId = window.EMP_BY_ID;
  const EMP = window.EMPLOYEE_LIST;
  const isEdit = !!initialData;
  const isReturned = initialData?.status === "Returned";
  const isDraft = initialData?.status === "Draft";
  const isAssignMode = !initialData && (initialEmployees || []).length > 0;
  const initIds = initialData ? (initialData.employees || []).map(window.firstIdForName).filter(Boolean) : (initialEmployees || []);
  const [employees, setEmployees] = useTr(initIds);
  const [form, setForm] = useTr({
    classification: initialData?.classification || "", newLocation: initialData?.newLocation || "",
    newDepartment: initialData?.newDept || "", newUnit: initialData?.newUnit || "", newJobTitle: initialData?.newTitle || "",
    newGrade: initialData?.grade || "", newNotch: initialData?.notch || "",
    lineManager: initialData?.lineManagerId || "",
    effectiveDate: initialData?.effectiveDate || "", reason: initialData?.reason || "" });
  const [docs, setDocs] = useTr({ keptUrls: initialData?.documents || [], newFiles: [] });
  const [notifyIds, setNotifyIds] = useTr(initialData?.notifyIds || []);
  const set = (k, v) => setForm(s => ({ ...s, [k]: v }));

  const primary = employees[0] ? byId[employees[0]] : null;
  // Job title, grade and department are INDEPENDENT picks — titles are not tied to departments
  // and picking a title never auto-populates the grade. The DesignationCombobox's built-in
  // department filter only narrows its list.
  const selectTitle = (v) => set("newJobTitle", v);
  const selectGrade = (v) => setForm(s => ({ ...s, newGrade: v, newNotch: "" }));
  const selectNewDept = (v) => set("newDepartment", v);
  // The selected New Zone filters the Unit/Branch list — changing zone clears a mismatched pick.
  const selectZone = (v) => setForm(s => ({ ...s, newLocation: v, newUnit: "" }));
  const notchOptions = window.notchSalaryOptions(form.newGrade);
  // Salary is resolved from (grade, notch) into a read-only field — same as Promotions/Job Title.
  const trPayroll = window.fetchPayroll(form.newGrade, (form.newNotch || "").split(" — ")[0]);
  const trSalary = trPayroll ? trPayroll.salary : "";
  const staffIds = employees.join(", ");
  // One payload builder shared by Save-as-Draft and Submit (was duplicated inline on both buttons).
  const payload = () => ({ employees: employees.map(id => (byId[id] || {}).name || id), employeeIds: employees, primary, staffIds, ...form, docs, notifyIds });

  const hasDocs = (docs.keptUrls || []).length + (docs.newFiles || []).length > 0;
  const valid = employees.length > 0 && form.classification && form.newLocation && form.newUnit && form.lineManager && form.effectiveDate
    && (notchOptions.length === 0 || form.newNotch) && form.reason.trim() && hasDocs;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title={isReturned ? "Review & Update Transfer" : isDraft ? "Continue Draft Transfer" : isAssignMode ? "Assign Transfer" : isEdit ? "Edit Transfer" : "Create Transfer"}
        subtitle={isReturned ? "Address the return reason below, update the request and resubmit for approval."
          : isDraft ? "Pick up where you left off, then submit for approval."
          : isAssignMode ? "Review the selected employees, then fill in the transfer details."
          : isEdit ? "Update the transfer details." : "Select staff, set the new posting and route for approval."} />

      <PncReturnedBanner record={initialData} />

      <FormCard title="Employee Information">
        <Field label="Employee(s)"><EmployeeAddSelect value={employees} onChange={setEmployees} employees={EMP} disabled={isEdit} /></Field>
      </FormCard>

      <FormCard title="Transfer Details">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <Field label="Transfer Classification"><Combobox value={form.classification} onChange={v => set("classification", v)} options={TRANSFER_CLASSES} placeholder="Select classification" /></Field>
          <Field label="New Zone"><Combobox value={form.newLocation} onChange={selectZone} options={LK.zones} placeholder="Select zone" noDataText="No zone found" /></Field>
          <Field label="New Organizational Unit/Branch"><UnitBranchCombobox value={form.newUnit} onChange={v => set("newUnit", v)} zone={form.newLocation} onZoneChange={selectZone} zones={LK.zones} /></Field>
          <Field label="New Department"><Combobox value={form.newDepartment} onChange={selectNewDept} options={LK.departments} placeholder="Select new department" noDataText="No department found" /></Field>
          <Field label="New Job Title" optional><DesignationCombobox value={form.newJobTitle} onChange={selectTitle} /></Field>
          <Field label="New Job Grade"><Combobox value={form.newGrade} onChange={selectGrade} options={LK.jobGrades} icon="bar-chart-grouped-line" placeholder="Select job grade" /></Field>
          <Field label="Notch"><Combobox value={form.newNotch} onChange={v => set("newNotch", v)} options={notchOptions} icon="stack-line" placeholder={form.newGrade ? "Select notch" : "Select job grade first"} noDataText="Select a job grade first." /></Field>
          <PncSalaryField salary={trSalary} />
          <Field label="New Line Manager"><LineManagerField value={form.lineManager} onChange={v => set("lineManager", v)} employees={EMP} /></Field>
          <Field label="Proposed Effective Transfer Date"><UI.DatePicker weekendRule value={form.effectiveDate} onSelect={d => set("effectiveDate", d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }))} placeholder="Pick a date" /></Field>
        </div>
      </FormCard>

      <FormCard title="Comments & Documents">
        <Field label="Comments"><UI.RichText value={form.reason} onChange={v => set("reason", v)} placeholder="Add comments for this transfer…" /></Field>
        <PncDocsField existingUrls={initialData?.documents || []} isEditMode={isEdit} onChange={setDocs} hasDocs={hasDocs} noun="transfer" />
      </FormCard>

      <FormCard title="Notification">
        <NotifyPeopleField value={notifyIds} onChange={setNotifyIds} employees={EMP} />
      </FormCard>

      <PncFormFooter onCancel={onCancel} isReturned={isReturned} isDraft={isDraft} valid={valid}
        onSaveDraft={onSaveDraft ? () => onSaveDraft(payload()) : null} draftDisabled={employees.length === 0}
        onSubmit={() => valid && onSubmit(payload())} submitIcon="exchange-line"
        submitLabel={isAssignMode ? `Assign Transfer${employees.length !== 1 ? "s" : ""}` : isEdit ? "Save Changes" : "Create Transfer"} />
    </div>
  );
}

/* ---------- details — "Transfer Approval" ---------- */
function TransferDetails({ transfer, perms, onApprove, onReject, onReturn, onEdit, onAccept, onUpdate, onToast }) {
  const t = transfer;
  const P = perms || { canEdit: true, canDecide: true, isSubject: false };
  const [rejectOpen, setRejectOpen] = useTr(false);
  const [returnOpen, setReturnOpen] = useTr(false);
  const [trailOpen, setTrailOpen] = useTr(false);
  const info = [
    { label: "Employee Name", value: t.employees.join(", ") },
    { label: "Transfer Classification", value: t.classification },
    { label: "Current Zone", value: t.previousLocation },
    { label: "New Zone", value: t.newLocation },
    { label: "Current Department", value: t.previousDept },
    { label: "New Department", value: t.newDept },
    { label: "Unit/Branch", value: t.newUnit || t.previousUnit || "—" },
    { label: "Current Job Title", value: t.currentTitle },
    { label: "New Job Title", value: t.newTitle || "—" },
    { label: "Job Grade", value: t.grade },
    { label: "New Line Manager", value: t.lineManager || "—" },
    { label: "Effective Date", value: t.effectiveDate },
  ];
  const approvalInfo = [
    { label: "Approved By", value: t.approvedBy }, { label: "Approver Email", value: t.approverEmail }, { label: "Approved At", value: t.approvedAt },
    { label: "Rejected By", value: t.rejectedBy }, { label: "Rejector Email", value: t.rejectorEmail }, { label: "Rejected At", value: t.rejectedAt },
  ];
  const pending = t.status === "Pending";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title="Transfer Approval" subtitle="Review and approve or reject transfers."
        actions={
          <React.Fragment>
            <StatusBadge variant={TR_STATUS_VARIANT[t.status]} text={t.status} />
            {t.status === "Pending" && t.hasBeenCorrected && <span title="This request was corrected and resubmitted after a return" style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#FFF7ED", border: "1px solid #FED7AA", color: "#B45309", borderRadius: 999, padding: "3px 10px", fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 12 }}><Icon name="refresh-line" size={13} color="#B45309" />Corrected & Resubmitted</span>}
            <PncViewOnlyChip perms={P} />
            <Button variant="stroke" icon="history-line" onClick={() => setTrailOpen(true)}>Audit Trail</Button>
            {pending && P.canDecide && (
              <React.Fragment>
                <Button variant="stroke" icon="arrow-go-back-line" onClick={() => setReturnOpen(true)} style={{ color: "#B45309", borderColor: "#FED7AA" }}>Return for Correction</Button>
                <Button variant="stroke" icon="close-line" onClick={() => setRejectOpen(true)} style={{ color: "#DC2626", borderColor: "#F3C2C2" }}>Reject</Button>
                <Button variant="primary" icon="check-line" onClick={() => onApprove(t)}>Approve</Button>
              </React.Fragment>
            )}
            {t.status === "Returned" && P.canEdit && <Button variant="primary" icon="edit-2-line" onClick={() => onEdit(t)}>Review & Update</Button>}
            {t.status === "Approved" && !t.accepted && P.canEdit && <Button variant="primary" icon="user-follow-line" onClick={() => onAccept(t)}>Record Employee Acceptance</Button>}
          </React.Fragment>
        } />

      <div className="card" style={{ padding: 0 }}>
        <DetailCard icon="exchange-line" title="Transfer Information"><DetailPanel items={info} tint="gray" cols={4} /></DetailCard>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <DetailCard icon="file-text-line" title="Comments">
          <div className="rt-content" style={{ background: "#F6F8FA", borderRadius: 8, padding: "14px 16px", fontFamily: "var(--font-ui)", fontSize: 14, lineHeight: "22px", color: "var(--gray-800)" }} dangerouslySetInnerHTML={{ __html: t.reason || "—" }} />
        </DetailCard>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <DetailCard icon="attachment-2" title="Supporting Documents">
          <SupportingDocumentsList urls={t.documents} />
        </DetailCard>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <DetailCard icon="user-follow-line" title="Approvers">
          {t.approvers && t.approvers.length > 0
            ? <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {t.approvers.map(n => (
                  <span key={n} style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid var(--border)", borderRadius: 999, padding: "5px 12px 5px 5px" }}>
                    <Avatar name={n} size={26} />
                    <span style={{ fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 13.5, color: "var(--gray-900)" }}>{n}</span>
                  </span>
                ))}
              </div>
            : <EmptyState compact title="No approvers" subtitle="No approvers were assigned to this transfer." />}
        </DetailCard>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <DetailCard icon="shield-check-line" title="Approval Information"><DetailPanel items={approvalInfo} tint="gray" cols={3} /></DetailCard>
      </div>

      {t.status === "Returned" && t.returnReason && (
        <div className="card" style={{ padding: 0 }}>
          <DetailCard icon="arrow-go-back-line" title="Reason For Return">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ background: "#FFFBEB", border: "1px solid #FED7AA", borderRadius: 8, padding: "14px 16px", fontFamily: "var(--font-ui)", fontSize: 14, lineHeight: "22px", color: "var(--gray-800)" }}>{t.returnReason}</div>
              <span style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--gray-400)" }}>Returned by {t.returnedBy || "—"}{t.returnedAt && t.returnedAt !== "N/A" ? ` · ${t.returnedAt}` : ""} — review the reason, update the request and resubmit for approval.</span>
            </div>
          </DetailCard>
        </div>
      )}

      {t.status === "Rejected" && t.rejectionReason && (
        <div className="card" style={{ padding: 0 }}>
          <DetailCard icon="error-warning-line" title="Reason For Rejection">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ background: "#FEF2F2", border: "1px solid #FBD9D9", borderRadius: 8, padding: "14px 16px", fontFamily: "var(--font-ui)", fontSize: 14, lineHeight: "22px", color: "var(--gray-800)" }}>{t.rejectionReason}</div>
              <span style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--gray-400)" }}>Rejected by {t.rejectedBy || "—"}{t.rejectedAt && t.rejectedAt !== "N/A" ? ` · ${t.rejectedAt}` : ""} — a rejection is final; this request is closed.</span>
            </div>
          </DetailCard>
        </div>
      )}

      <RejectionReasonModal open={rejectOpen} onClose={() => setRejectOpen(false)}
        title="Reject Transfer" noun="transfer"
        onConfirm={(reason) => { setRejectOpen(false); onReject(t, reason); }} />

      <RejectionReasonModal open={returnOpen} onClose={() => setReturnOpen(false)}
        title="Return for Correction" noun="transfer" tone="warning"
        onConfirm={(reason) => { setReturnOpen(false); onReturn(t, reason); }} />

      <AuditTrailDrawer open={trailOpen} onClose={() => setTrailOpen(false)} name={t.employees[0]}
        sub={`${t.staffIds} · ${t.classification}`} badge={<StatusBadge variant={TR_STATUS_VARIANT[t.status]} text={t.status} />}
        entries={t.audit || []} />
    </div>
  );
}

/* ---------- controller ---------- */
function TransfersScreen({ onToast, onSubPage, lookups }) {
  const DIR = window.EMPLOYEE_DIRECTORY;
  const [transfers, setTransfers] = useTr(TRANSFER_SEED);
  const actor = usePncActor();
  const permsOf = (r) => pncPermsFor(actor, r);
  const [segment, setSegment] = useTr("Request");   // Request (roster) | Approvals
  const [rosterQ, setRosterQ] = useTr("");
  const [selected, setSelected] = useTr([]);
  const [approvalSel, setApprovalSel] = useTr([]);   // selected pending rows in Approvals queue
  const [lastCount, setLastCount] = useTr(0);
  const [q, setQ] = useTr("");
  const [tab, setTab] = useTr("All");
  const [bulkRejectIds, setBulkRejectIds] = useTr(null);
  const [view, setView] = useTr({ name: "list" });   // list | add | details
  const [confirm, setConfirm] = useTr(null);

  useTrEffect(() => {
    if (!onSubPage) return;
    if (view.name === "add") onSubPage({ trail: [{ label: "Transfers", onClick: () => setView({ name: "list" }) }, { label: view.initialData ? (view.initialData.status === "Returned" ? "Review & Update" : view.initialData.status === "Draft" ? "Continue Draft" : "Edit Transfer") : "Create Transfer" }] });
    else if (view.name === "details") onSubPage({ trail: [{ label: "Transfers", onClick: () => setView({ name: "list" }) }, { label: "Transfer Approval" }] });
    else onSubPage(null);
    return () => onSubPage(null);
  }, [view]);

  useTrEffect(() => { if (selected.length) setLastCount(selected.length); }, [selected.length]);

  const current = view.name === "details" ? transfers.find(t => t.id === view.id) : null;

  // Demotion guard: warn (Proceed Anyway / Cancel) before the normal submit confirmation
  // when the new grade/notch ranks below an employee's current placement.
  const submitTransfer = (f) => {
    const next = () => setConfirm({ kind: view.initialData ? "edit" : "add", form: f, id: view.initialData?.id });
    const hits = window.demotionCheck({ employeeIds: f.employeeIds, grade: f.newGrade, notch: f.newNotch });
    if (hits.length) window.confirmDemotion({ items: hits, noun: "transfer", onProceed: next });
    else next();
  };
  const submitBulk = (f) => setConfirm({ kind: "bulk", form: f });
  const runConfirm = () => {
    const c = confirm;
    if (c.kind === "add") {
      const f = c.form, p = f.primary || {};
      const allDocs = SupportingDocuments.resolve(f.docs, "https://files.bistasol.com/transfers/");
      PncApi.create("transfer", { ...f, documents: allDocs });   // POST /transfers — the non-draft upload endpoint
      setTransfers(ts => [{
        id: trId(), employees: f.employees, staffIds: f.staffIds || "—", createdBy: actor.name, classification: f.classification,
        previousLocation: p.zone || "—", newLocation: f.newLocation,
        previousDept: p.dept || "—", newDept: f.newDepartment || p.dept || "—",
        previousUnit: p.unit || "—", newUnit: f.newUnit || "", currentTitle: p.title || "—", newTitle: f.newJobTitle || "",
        grade: f.newGrade || p.grade || "—", zone: p.zone || "—",
        lineManagerId: f.lineManager || "", lineManager: (window.EMP_BY_ID[f.lineManager] || {}).name || "—",
        notifyIds: f.notifyIds || [],
        effectiveDate: f.effectiveDate, dateSubmitted: todayTr(), status: "Pending",
        reason: f.reason, documents: allDocs, approvers: f.approvers || [],
        approvedBy: "N/A", approverEmail: "N/A", approvedAt: "N/A", rejectedBy: "N/A", rejectorEmail: "N/A", rejectedAt: "N/A",
        audit: [pncEntry({ action: 0, description: `${f.classification} transfer submitted — ${p.dept || "—"} → ${f.newDepartment || p.dept || "—"}, effective ${f.effectiveDate}`, justificationReason: f.reason, staffId: f.staffIds })],
      }, ...ts]);
      onToast("Transfer Submitted", { tone: "success" });
      setView({ name: "list" });
    } else if (c.kind === "edit") {
      const f = c.form;
      const allDocs = SupportingDocuments.resolve(f.docs, "https://files.bistasol.com/transfers/");
      // Drafts being finally submitted go to POST /transfers/{id}/submit; everything else PUTs.
      const tr = pncEditTransition({ kind: "transfer", id: c.id, prevStatus: (transfers.find(t => t.id === c.id) || {}).status,
        payload: { ...f, documents: allDocs }, today: todayTr(), draftLabel: `${f.classification} transfer`, reason: f.reason, staffId: f.staffIds });
      setTransfers(ts => ts.map(t => t.id === c.id ? { ...t, employees: f.employees, classification: f.classification,
        newLocation: f.newLocation, newDept: f.newDepartment || t.newDept, newUnit: f.newUnit, newTitle: f.newJobTitle || "",
        grade: f.newGrade || t.grade,
        lineManagerId: f.lineManager || t.lineManagerId || "", lineManager: (window.EMP_BY_ID[f.lineManager] || {}).name || t.lineManager || "—",
        notifyIds: f.notifyIds || t.notifyIds || [],
        effectiveDate: f.effectiveDate, reason: f.reason, documents: allDocs, approvers: f.approvers || [],
        ...tr.patch, audit: [...(t.audit || []), tr.entry] } : t));
      onToast(tr.wasReturned ? "Corrected & Resubmitted for Approval" : tr.wasDraft ? "Transfer Submitted" : "Transfer Updated", { tone: "success" });
      if (tr.wasReturned || tr.wasDraft) setTab("All");
      setView({ name: "list" });
    } else if (c.kind === "bulk") {
      const f = c.form;
      const recs = f.names.map(n => {
        const p = DIR[n] || {};
        return {
          id: trId(), employees: [n], staffIds: p.staffId || "—", createdBy: actor.name, classification: f.classification,
          previousLocation: p.zone || "—", newLocation: f.location,
          previousDept: p.dept || "—", newDept: f.department || p.dept || "—",
          previousUnit: p.unit || "—", currentTitle: p.title || "—", newTitle: "",
          grade: p.grade || "—", zone: p.zone || "—",
          effectiveDate: f.date, dateSubmitted: todayTr(), status: "Pending",
          reason: f.reason, documents: f.documents || [],
          approvedBy: "N/A", approverEmail: "N/A", approvedAt: "N/A", rejectedBy: "N/A", rejectorEmail: "N/A", rejectedAt: "N/A",
        };
      });
      setTransfers(ts => [...recs, ...ts]);
      onToast(f.names.length > 1 ? `Transfer Raised for ${f.names.length} Employees` : "Transfer Raised", { tone: "success" });
      setSelected([]); setView({ name: "list" }); setSegment("Approvals");
    } else if (c.kind === "deleteDraft") {
      setTransfers(ts => ts.filter(t => t.id !== c.row.id));
      onToast("Draft Deleted", { tone: "error" });
    } else if (c.kind === "approve") {
      const now = new Date().toLocaleString("en-US");
      setTransfers(ts => ts.map(t => t.id === c.row.id ? { ...t, status: "Approved", wfStatus: "Approved", approvedBy: actor.name, approverEmail: actor.email, approvedAt: now,
        audit: [...(t.audit || []), pncEntry({ action: 3, description: "Transfer approved", actorName: `${actor.name} (${actor.role})`, staffId: t.staffIds })] } : t));
      onToast("Transfer Approved", { tone: "success" });
    } else if (c.kind === "accept") {
      setTransfers(ts => ts.map(t => t.id === c.row.id ? { ...t, accepted: true,
        audit: [...(t.audit || []), pncEntry({ action: 7, description: "Employee accepted the transfer", actorName: `${t.employees[0]} (Employee)`, staffId: t.staffIds })] } : t));
      onToast("Employee Acceptance Recorded", { tone: "success" });
    } else if (c.kind === "bulkApprove") {
      const now = new Date().toLocaleString("en-US");
      const ids = c.ids;
      setTransfers(ts => ts.map(t => ids.includes(t.id) ? { ...t, status: "Approved", approvedBy: actor.name, approverEmail: actor.email, approvedAt: now,
        audit: [...(t.audit || []), pncEntry({ action: 3, description: "Transfer approved", actorName: `${actor.name} (${actor.role})`, staffId: t.staffIds })] } : t));
      onToast(`${ids.length} Transfer${ids.length > 1 ? "s" : ""} Approved`, { tone: "success" });
      setApprovalSel([]);
    }
    setConfirm(null);
  };

  // reject from the detail page — TERMINAL: the request is closed with a captured reason
  const rejectWithReason = (row, reason) => {
    const now = new Date().toLocaleString("en-US");
    setTransfers(ts => ts.map(t => t.id === row.id ? { ...t, status: "Rejected", wfStatus: "Rejected", rejectedBy: actor.name, rejectorEmail: actor.email, rejectedAt: now, rejectionReason: reason,
      audit: [...(t.audit || []), pncEntry({ action: 4, description: "Transfer rejected — request closed", actorName: `${actor.name} (${actor.role})`, justificationReason: reason, staffId: t.staffIds })] } : t));
    onToast("Transfer Rejected", { tone: "error" });
  };

  // return from the detail page — sends the request BACK to the initiator for correction + resubmit
  const returnWithReason = (row, reason) => {
    const now = new Date().toLocaleString("en-US");
    setTransfers(ts => ts.map(t => t.id === row.id ? { ...t, status: "Returned", returnedBy: actor.name, returnedAt: now, returnReason: reason,
      audit: [...(t.audit || []), pncEntry({ action: 4, description: "Transfer returned to initiator for correction", actorName: `${actor.name} (${actor.role})`, justificationReason: reason, staffId: t.staffIds })] } : t));
    onToast("Returned to Initiator for Correction");
  };

  // bulk reject — captures ONE reason applied to the whole selection
  const bulkRejectWithReason = (reason) => {
    const now = new Date().toLocaleString("en-US");
    const ids = bulkRejectIds || [];
    setTransfers(ts => ts.map(t => ids.includes(t.id) ? { ...t, status: "Rejected", rejectedBy: actor.name, rejectorEmail: actor.email, rejectedAt: now, rejectionReason: reason,
      audit: [...(t.audit || []), pncEntry({ action: 4, description: "Transfer rejected — request closed", actorName: `${actor.name} (${actor.role})`, justificationReason: reason, staffId: t.staffIds })] } : t));
    onToast(`${ids.length} Transfer${ids.length > 1 ? "s" : ""} Rejected`, { tone: "error" });
    setApprovalSel([]); setBulkRejectIds(null);
  };

  // save-as-draft — ≥1 employee, no other validation; drafts live in the Drafts tab
  const saveDraft = (f) => {
    const p = f.primary || {};
    const allDocs = SupportingDocuments.resolve(f.docs, "https://files.bistasol.com/transfers/");
    const editingDraft = view.initialData && view.initialData.status === "Draft" ? view.initialData : null;
    if (editingDraft) {
      PncApi.updateDraft("transfer", editingDraft.id, f);   // drafts persist via the draft endpoints — never /submit
      setTransfers(ts => ts.map(t => t.id === editingDraft.id ? { ...t, employees: f.employees, staffIds: f.staffIds || "—", classification: f.classification || "—",
        newLocation: f.newLocation || "—", newDept: f.newDepartment || t.newDept, newUnit: f.newUnit || "", newTitle: f.newJobTitle || "",
        grade: f.newGrade || t.grade,
        lineManagerId: f.lineManager || "", lineManager: (window.EMP_BY_ID[f.lineManager] || {}).name || "—",
        notifyIds: f.notifyIds || [], effectiveDate: f.effectiveDate || "—", reason: f.reason, documents: allDocs } : t));
    } else {
      PncApi.saveDraft("transfer", f);
      setTransfers(ts => [{
        id: trId(), employees: f.employees, staffIds: f.staffIds || "—", createdBy: actor.name, classification: f.classification || "—",
        previousLocation: p.zone || "—", newLocation: f.newLocation || "—",
        previousDept: p.dept || "—", newDept: f.newDepartment || p.dept || "—",
        previousUnit: p.unit || "—", newUnit: f.newUnit || "", currentTitle: p.title || "—", newTitle: f.newJobTitle || "",
        grade: f.newGrade || p.grade || "—", zone: p.zone || "—",
        lineManagerId: f.lineManager || "", lineManager: (window.EMP_BY_ID[f.lineManager] || {}).name || "—",
        notifyIds: f.notifyIds || [],
        effectiveDate: f.effectiveDate || "—", dateSubmitted: "—", status: "Draft",
        reason: f.reason, documents: allDocs,
        approvedBy: "N/A", approverEmail: "N/A", approvedAt: "N/A", rejectedBy: "N/A", rejectorEmail: "N/A", rejectedAt: "N/A",
        audit: [pncEntry({ action: 1, description: "Transfer drafted — saved for later completion", staffId: f.staffIds })],
      }, ...ts]);
    }
    onToast("Draft Saved", { tone: "success" });
    setView({ name: "list" }); setSegment("Approvals"); setTab("Drafts");
  };

  let body;
  if (view.name === "add") body = <TransferForm lookups={lookups} initialEmployees={view.initialEmployees} initialData={view.initialData} onCancel={() => setView({ name: "list" })} onSubmit={submitTransfer} onSaveDraft={!view.initialData || view.initialData.status === "Draft" ? saveDraft : null} />;
  else if (view.name === "details" && current) body = <TransferDetails transfer={current} perms={permsOf(current)}
    onApprove={(r) => setConfirm({ kind: "approve", row: r })} onReject={rejectWithReason} onReturn={returnWithReason}
    onEdit={(r) => setView({ name: "add", initialData: r })} onAccept={(r) => setConfirm({ kind: "accept", row: r })}
    onUpdate={(partial) => setTransfers(ts => ts.map(t => t.id === current.id ? { ...t, ...partial } : t))} onToast={onToast} />;
  else {
    const trHeaderAction = (
      <React.Fragment>
        <PncActorSwitch />
        {actor.canCreate && (
          <React.Fragment>
            <Button variant="stroke" icon="download-2-line" onClick={() => onToast("Import Transfers — coming soon")}>Import Transfers</Button>
            <Button variant="primary" icon="add-line" onClick={() => setView({ name: "add" })}>Add Transfer</Button>
          </React.Fragment>
        )}
      </React.Fragment>
    );
    body = (segment === "Request" && actor.canCreate)
      ? <TransferRoster q={rosterQ} setQ={setRosterQ} segment={segment} setSegment={setSegment}
          onCreate={(ids) => setView({ name: "add", initialEmployees: ids })}
          title="Transfers" subtitle="Transfer or bulk-transfer staff, and track approval status."
          headerAction={trHeaderAction} />
      : <TransfersList rows={transfers.filter(t => t.status !== "Draft" || permsOf(t).canEdit)} q={q} setQ={setQ}
          onOpen={(r) => setView({ name: "details", id: r.id })} onEdit={(r) => setView({ name: "add", initialData: r })} onDeleteDraft={(r) => setConfirm({ kind: "deleteDraft", row: r })}
          tab={tab} setTab={setTab} permsOf={permsOf} canDecide={actor.canDecide} showDrafts={actor.canCreate} segItems={actor.canCreate ? ["Request", "Approvals"] : ["Approvals"]}
          segment={segment} setSegment={setSegment} sel={approvalSel} setSel={setApprovalSel}
          title="Transfers" subtitle="Transfer or bulk-transfer staff, and track approval status."
          headerAction={trHeaderAction} />;
  }

  const CONFIRM = {
    add:     { t: "Submit Transfer", m: "submit this transfer", l: "Yes, Submit", i: "check-line", c: "Cancel" },
    edit:    { t: "Save Changes", m: "save these changes", l: "Yes, Save", i: "check-line", c: "Cancel" },
    bulk:    { t: "Raise Transfer", m: "raise this transfer", l: "Yes, Transfer", i: "exchange-line", c: "Cancel" },
    deleteDraft: { t: "Delete Draft", m: "delete this draft", l: "Yes, Delete", i: "delete-bin-6-line", c: "No" },
    approve: { t: "Approve Transfer", m: "approve this transfer", l: "Yes, Approve", i: "check-line", c: "No" },
    accept:  { t: "Record Employee Acceptance", m: "record that the employee has accepted this transfer", l: "Yes, Record", i: "user-follow-line", c: "No" },
    bulkApprove: { t: "Approve Transfers", m: "approve", l: "Yes, Approve", i: "check-line", c: "No" },
  };
  const confirmMsg = () => {
    const c = confirm;
    if (c.kind === "bulk") {
      const k = c.form.names.length;
      return k > 1 ? `Are you sure you want to raise this transfer for ${k} employees? Each will be pending approval.`
        : "Are you sure you want to raise this transfer? It will be pending approval.";
    }
    if (c.kind === "bulkApprove") {
      const k = c.ids.length;
      return `Are you sure you want to ${CONFIRM[c.kind].m} ${k} selected transfer${k > 1 ? "s" : ""}?`;
    }
    return `Are you sure you want to ${CONFIRM[c.kind].m}?`;
  };

  const approvalBarVisible = view.name === "list" && segment === "Approvals" && approvalSel.length > 0 && actor.canDecide;

  return (
    <React.Fragment>
      {body}

      {/* floating bulk-approval bar (Approvals queue) */}
      <BulkBar count={approvalSel.length} noun="transfers selected" visible={approvalBarVisible} onClear={() => setApprovalSel([])}>
        <Button variant="stroke" icon="close-line" onClick={() => setBulkRejectIds(approvalSel)} style={{ color: "#DC2626", borderColor: "#F3C2C2" }}>Reject</Button>
        <Button variant="primary" icon="check-line" onClick={() => setConfirm({ kind: "bulkApprove", ids: approvalSel })}>Approve</Button>
      </BulkBar>

      <RejectionReasonModal open={!!bulkRejectIds} onClose={() => setBulkRejectIds(null)}
        title={`Reject ${(bulkRejectIds || []).length} Transfer${(bulkRejectIds || []).length > 1 ? "s" : ""}`} noun="selection"
        description="Provide one reason for rejecting the selected transfers. Rejection is final — the initiators will be notified."
        onConfirm={bulkRejectWithReason} />

      {confirm && (() => { const cc = CONFIRM[confirm.kind]; return (
        <ConfirmModal title={cc.t} message={confirmMsg()} confirmLabel={cc.l} confirmIcon={cc.i}
          cancelLabel={cc.c} onConfirm={runConfirm} onClose={() => setConfirm(null)} />
      ); })()}
    </React.Fragment>
  );
}

Object.assign(window, { TransfersScreen });
