// BISTA HR · promotions/Promotions — People & Culture ▸ Promotions.
//   PromotionRequest  : "Request" tab — the shared EmployeeSelectionRoster (single source of
//                       truth). Select staff → floating SelectionActionBar → "Create Promotion".
//   PromotionsList    : "Approval" tab — table of promotions (employee + ID, grade-title change,
//                       effective date, status, approver) with a StatusFilter + bulk approve/reject.
//   PromotionForm     : full-page Create / Edit Promotion — three cards (Employee Information ·
//                       Justification & Budget · Approval & Notification): multi-select employee(s),
//                       new title / grade / salary / notch / rating, effective date, optional
//                       transfer, justification + budget switch, allowances, supporting document
//                       URLs, approvers and department notify.
//   PromotionDetails  : "Promotion Approval" — Employee Information, Benefits & Allowances,
//                       Approvers (per-approver status) and Approval Information, with Reason for
//                       Rejection. Reject opens the shared RejectionReasonModal.
// Reusable shared pieces: EmployeeSelectionRoster, SelectionActionBar, StatusFilter,
// RejectionReasonModal, BulkBar, MultiSelectCombobox, Combobox, EmailInputList, DetailPanel.
const { useState: usePromo, useEffect: usePromoEffect } = React;

let PROMO_SEQ = 700;
const promoId = () => ++PROMO_SEQ;
const STATUS_VARIANT = { Approved: "approved", Pending: "pending", Rejected: "rejected", Returned: "returned", Draft: "draft" };
const todayPromo = () => new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
// Map a promotion's overall status onto each approver's at-a-glance state.
const approverVariant = (status) => status === "Approved" ? "approved" : status === "Rejected" ? "rejected" : "pending";
const approverLabel = (status) => status === "Approved" ? "Approved" : status === "Rejected" ? "Rejected" : "Pending";

// roster rows from the shared employee directory (single source of truth)
function promoRosterRows() {
  return window.EMPLOYEE_LIST.map(e => ({
    id: e.id, name: e.name, employeeNumber: e.staffId, jobTitle: e.title,
    jobGrade: e.grade, department: e.dept, unit: e.unit, branch: e.branch, zone: e.zone, profilePictureUrl: e.profilePictureUrl || "",
  }));
}

/* ---------- request roster (shared EmployeeSelectionRoster) ---------- */
function PromotionRequest({ q, setQ, segment, setSegment, onCreate, title, subtitle, headerAction }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title={title} subtitle={subtitle} actions={headerAction} />
      <div className="card" style={{ padding: 20 }}>
        <div className="bh-tablebox">
          <UI.FilterBar left={<Segmented items={["Request", "Approval"]} active={segment} onChange={setSegment} />}
            search={q} onSearch={setQ} searchPlaceholder="Search staff…" />
          <EmployeeSelectionRoster employees={promoRosterRows()} itemLabel="staff"
            actionLabel="Create Promotion" onProceed={onCreate} searchQuery={q} />
        </div>
      </div>
    </div>
  );
}

/* ---------- approval queue ---------- */
function PromotionsList({ rows, q, setQ, onOpen, onEdit, onDeleteDraft, tab, setTab, segment, setSegment, segItems, permsOf, canDecide, showDrafts, sel, setSel, title, subtitle, headerAction }) {
  const PROMO_BLANK = { status: "", department: "", grade: "", zone: "", branch: "" };
  const [draft, setDraft] = usePromo(PROMO_BLANK);
  const [applied, setApplied] = usePromo(PROMO_BLANK);
  const optsOf = (key) => [...new Set(rows.map(r => r[key]).filter(Boolean))].sort();
  const shown = rows.filter(r => {
    if (tab === "All" ? r.status === "Draft" : tab === "Drafts" ? r.status !== "Draft" : r.status !== tab) return false;
    if (q !== "" && !(r.employees.join(" ").toLowerCase().includes(q.toLowerCase()) || r.newRole.toLowerCase().includes(q.toLowerCase()))) return false;
    if (applied.status && r.status !== applied.status) return false;
    if (applied.department && r.department !== applied.department) return false;
    if (applied.grade && r.grade !== applied.grade) return false;
    if (applied.zone && r.zone !== applied.zone) return false;
    if (applied.branch && r.branch !== applied.branch) return false;
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
        <UI.FilterBar left={<Segmented items={segItems || ["Request", "Approval"]} active={segment} onChange={setSegment} />}
          search={q} onSearch={setQ} searchPlaceholder="Search promotions…"
          filters={[
            { label: "Status", node: <Combobox value={draft.status} onChange={v => setDraft(s => ({ ...s, status: v }))} options={["Pending", "Approved", "Rejected", "Returned"]} placeholder="All statuses" /> },
            { label: "Department", node: <Combobox value={draft.department} onChange={v => setDraft(s => ({ ...s, department: v }))} options={optsOf("department")} placeholder="All departments" /> },
            { label: "Job Grade", node: <Combobox value={draft.grade} onChange={v => setDraft(s => ({ ...s, grade: v }))} options={optsOf("grade")} placeholder="All grades" /> },
            { label: "Zone", node: <Combobox value={draft.zone} onChange={v => setDraft(s => ({ ...s, zone: v }))} options={optsOf("zone")} placeholder="All zones" /> },
            { label: "Branch", node: <Combobox value={draft.branch} onChange={v => setDraft(s => ({ ...s, branch: v }))} options={optsOf("branch")} placeholder="All branches" /> },
          ]}
          onReset={() => { setDraft(PROMO_BLANK); setApplied(PROMO_BLANK); }}
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
          ? <EmptyState title="No promotions yet" subtitle="Select staff from the Request tab to raise a promotion." />
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
                        <span style={{ color: "var(--gray-500)" }}>{r.previousRole}</span>
                        <Icon name="arrow-right-line" size={15} color="var(--gray-400)" />
                        <span style={{ color: "var(--gray-900)", fontWeight: 500 }}>{r.newRole}</span>
                      </span>
                    </td>
                    <td>{r.effectiveDate}</td>
                    <td>
                      <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                          <StatusBadge variant={STATUS_VARIANT[r.status]} text={r.status} size="sm" />
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
                {shown.length === 0 && <tr><td colSpan={7} style={{ padding: 0 }}><EmptyState compact title={tab === "Drafts" ? "No drafts" : tab === "Returned" ? "No returned requests" : "No results found"} subtitle={tab === "Drafts" ? "Save a promotion as a draft to continue it later." : tab === "Returned" ? "Requests returned for correction will appear here." : "No promotion matches your search."} /></td></tr>}
              </tbody>
            </table>}
        {rows.length > 0 && shown.length > 0 && <div style={{ borderTop: "1px solid var(--divider)" }}><Pagination page={pg.page} pages={pg.pages} onPrev={pg.prev} onNext={pg.next} /></div>}
        </div>
      </div>
    </div>
  );
}

/* ---------- reusable section helpers (form) ---------- */
function FormCard({ title, badge, children }) {
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
// "Auto-populated" pill — marks the card that groups system-resolved values (grade, notch, benefits).
const AutoBadge = () => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap", background: "var(--brand-yellow-tint)", border: "1px solid var(--brand-yellow)", color: "var(--gray-800)", borderRadius: 999, padding: "3px 9px", fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 11.5 }}>
    <Icon name="sparkling-2-line" size={12} color="var(--brand-yellow-dark)" />Auto-populated
  </span>
);
// Shared "Resolved Salary" card — salary is fetched from grade + notch by Payroll (read-only).
// Job grade and job title are picked independently in the form; allowances are not shown here.
// Used identically by Promotions, Job Title and Transfers.
function ResolvedRoleBenefits({ grade, salary, allowances }) {
  return (
    <FormCard title="Resolved Salary" badge={<AutoBadge />}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--gray-400)" }}>
        <Icon name="information-line" size={15} color="var(--gray-400)" />
        Salary is resolved from the job grade + notch by Payroll &mdash; it is not edited here.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Field label="Salary">
          <div className="input-wrap" style={{ background: "var(--gray-50)" }}>
            <Icon name="money-dollar-circle-line" size={18} style={{ color: "var(--icon-default)" }} />
            <input value={salary || ""} readOnly placeholder="Auto from grade & notch" style={{ color: salary ? "var(--gray-900)" : "var(--gray-400)" }} />
          </div>
        </Field>
      </div>
    </FormCard>
  );
}
function AddRemoveRow({ children, onRemove }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
      <div style={{ flex: 1, display: "flex", gap: 12, minWidth: 0 }}>{children}</div>
      <Button variant="stroke" size="sm" icon="delete-bin-6-line" onClick={onRemove} style={{ color: "#DC2626" }} />
    </div>
  );
}

/* ---------- create / edit form (full page) ---------- */
function PromotionForm({ lookups, initialData, initialEmployees, onCancel, onSubmit, onSaveDraft }) {
  const LK = lookups || window.LOOKUPS;
  const EMP = window.EMPLOYEE_LIST;
  const byId = window.EMP_BY_ID;
  const isEdit = !!initialData;
  const isReturned = initialData?.status === "Returned";
  const isDraft = initialData?.status === "Draft";
  // employees state holds STAFF IDS (client requirement — names can collide). Legacy records
  // store names, so migrate them to ids on edit.
  const initIds = initialData ? (initialData.employees || []).map(window.firstIdForName).filter(Boolean) : (initialEmployees || []);
  const [employees, setEmployees] = usePromo(initIds);
  const [form, setForm] = usePromo({
    department: initialData?.department || "",
    newJobTitle: initialData?.newRole || "", grade: initialData?.grade || "", notch: initialData?.notch || "",
    zone: initialData?.zone || "", unitBranch: initialData?.unitBranch || initialData?.branch || "",
    effectiveDate: initialData?.effectiveDate || "",
    justification: initialData?.justification || "",
  });
  // Supporting documents: self-managing field reports { keptUrls, newFiles }. REQUIRED — the
  // promotion cycle cannot be completed without at least one attached document.
  const [docs, setDocs] = usePromo({ keptUrls: initialData?.docUrls || [], newFiles: [] });
  const [notifyIds, setNotifyIds] = usePromo(initialData?.notifyIds || []);
  const set = (k, v) => setForm(s => ({ ...s, [k]: v }));

  // Job title, job grade and department are all INDEPENDENT picks — titles are not tied to a
  // department and picking a title NEVER auto-populates the grade. The DesignationCombobox's
  // built-in department filter only narrows its list (never submitted).
  const selectDept = (v) => set("department", v);
  const selectTitle = (v) => setForm(s => ({ ...s, newJobTitle: v }));
  const selectGrade = (v) => setForm(s => ({ ...s, grade: v, notch: "" }));
  // A selected Zone filters the Unit/Branch list — changing zone clears a now-mismatched pick.
  const selectZone = (v) => setForm(s => ({ ...s, zone: v, unitBranch: "" }));
  const notchOptions = window.notchSalaryOptions(form.grade);

  // New salary + allowances are AUTO-FETCHED from payroll once grade + notch are resolved
  // and surfaced in the read-only Salary field (notch options stay plain).
  const payroll = window.fetchPayroll(form.grade, (form.notch || "").split(" — ")[0]);
  const salary = payroll ? payroll.salary : "";
  const allowances = payroll ? payroll.allowances : [];

  // ALL fields are mandatory in the promotion cycle — including zone, unit/branch, comments
  // and at least one supporting document.
  const hasDocs = (docs.keptUrls || []).length + (docs.newFiles || []).length > 0;
  const valid = employees.length > 0 && form.department && form.newJobTitle && form.grade && (notchOptions.length === 0 || form.notch)
    && form.zone && form.unitBranch && form.effectiveDate && form.justification.trim() && hasDocs;

  const submit = () => {
    if (!valid) return;
    onSubmit({
      employees, ...form, salary, allowances,
      docs,
      notifyIds,
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title={isReturned ? "Review & Update Promotion" : isDraft ? "Continue Draft Promotion" : isEdit ? "Edit Promotion" : "Create Promotion"}
        subtitle={isReturned ? "Address the return reason below, update the request and resubmit for approval." : isDraft ? "Pick up where you left off, then submit for approval." : isEdit ? "Update the promotion details before approval." : "Select staff, set the new role and route for approval."} />

      {isReturned && initialData?.returnReason && (
        <div className="card" style={{ padding: 0, border: "1px solid #FED7AA", background: "#FFFBEB" }}>
          <div style={{ display: "flex", gap: 12, padding: "16px 20px" }}>
            <Icon name="arrow-go-back-line" size={20} color="#D97706" style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontFamily: "var(--font-control)", fontWeight: 600, fontSize: 14, color: "var(--gray-900)" }}>Returned for correction{initialData.returnedBy ? ` by ${initialData.returnedBy}` : ""}{initialData.returnedAt && initialData.returnedAt !== "N/A" ? ` · ${initialData.returnedAt}` : ""}</span>
              <span style={{ fontFamily: "var(--font-ui)", fontSize: 13.5, lineHeight: "21px", color: "var(--gray-800)" }}>{initialData.returnReason}</span>
            </div>
          </div>
        </div>
      )}

      <FormCard title="Employee Information">
        <Field label="Employee Name(s)">
          <EmployeeAddSelect value={employees} onChange={setEmployees} employees={EMP} />
        </Field>
      </FormCard>

      <FormCard title="New Role Details">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <Field label="New Department"><Combobox value={form.department} onChange={selectDept} options={LK.departments} icon="building-line" placeholder="Select new department" noDataText="No department found" /></Field>
          <Field label="New Job Title"><DesignationCombobox value={form.newJobTitle} onChange={selectTitle} /></Field>
          <Field label="Job Grade"><Combobox value={form.grade} onChange={selectGrade} options={LK.jobGrades} icon="bar-chart-grouped-line" placeholder="Select job grade" /></Field>
          <Field label="Notch"><Combobox value={form.notch} onChange={v => set("notch", v)} options={notchOptions} icon="stack-line" placeholder={form.grade ? "Select notch" : "Select job grade first"} noDataText="Select a job grade first." /></Field>
          <Field label="Salary">
            <div className="input-wrap" style={{ background: "var(--gray-50)" }}>
              <Icon name="money-dollar-circle-line" size={18} style={{ color: "var(--icon-default)" }} />
              <input value={salary ? `${salary} / month` : ""} readOnly placeholder="Auto from grade & notch" style={{ color: salary ? "var(--gray-900)" : "var(--gray-400)" }} />
            </div>
          </Field>
          <Field label="Zones"><Combobox value={form.zone} onChange={selectZone} options={LK.zones} placeholder="Select zone" noDataText="No zone found" /></Field>
          <Field label="New Organizational Unit/Branch"><UnitBranchCombobox value={form.unitBranch} onChange={v => set("unitBranch", v)} zone={form.zone} onZoneChange={selectZone} zones={LK.zones} /></Field>
          <Field label="Effective Date"><UI.DatePicker weekendRule value={form.effectiveDate} onSelect={d => set("effectiveDate", d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }))} placeholder="Pick a date" /></Field>
        </div>
      </FormCard>

      <FormCard title="Comments & Documents">
        <Field label="Comments"><UI.RichText value={form.justification} onChange={v => set("justification", v)} placeholder="Add comments about this promotion…" /></Field>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label style={{ fontFamily: "var(--font-control)", fontWeight: 500, fontSize: 14, color: "var(--gray-900)" }}>Supporting Documents</label>
          <SupportingDocuments existingUrls={initialData?.docUrls || []} isEditMode={isEdit} onChange={setDocs} maxFiles={8} maxSizeMB={8} />
          {!hasDocs && <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-400)" }}>At least one supporting document is required before this promotion can be submitted.</span>}
        </div>
      </FormCard>

      <FormCard title="Notification">
        <NotifyPeopleField value={notifyIds} onChange={setNotifyIds} employees={EMP} />
      </FormCard>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
        <Button variant="stroke" onClick={onCancel}>Cancel</Button>
        {onSaveDraft && !isReturned && <Button variant="stroke" icon="draft-line" disabled={employees.length === 0} onClick={() => onSaveDraft({ employees, ...form, salary, allowances, docs, notifyIds })}>Save as Draft</Button>}
        <Button variant="primary" icon={isReturned ? "send-plane-line" : isEdit && !isDraft ? "check-line" : "user-add-line"} disabled={!valid} onClick={submit}>{isReturned ? "Resubmit for Approval" : isDraft ? "Submit Request" : isEdit ? "Update Promotion" : (employees.length > 1 ? `Promote ${employees.length}` : "Submit Request")}</Button>
      </div>
    </div>
  );
}

/* ---------- details — "Promotion Approval" ---------- */
function PromotionDetails({ promo, perms, onApprove, onReject, onReturn, onEdit, onAccept, onUpdate, onToast }) {
  const P = perms || { canEdit: true, canDecide: true, isSubject: false };
  const [rejectOpen, setRejectOpen] = usePromo(false);
  const [returnOpen, setReturnOpen] = usePromo(false);
  const [trailOpen, setTrailOpen] = usePromo(false);
  const empInfo = [
    { label: "Employee Name", value: promo.employees.join(", ") },
    { label: "Staff ID(s)", value: promo.staffIds || "—" },
    { label: "Previous Job Title", value: promo.previousRole },
    { label: "New Job Title", value: promo.newRole },
    { label: "Job Grade", value: promo.grade },
    { label: "Notch", value: promo.notch || "—" },
    { label: "Department", value: promo.department || promo.deptUnit },
    { label: "Unit/Branch", value: [promo.unit, promo.branch].filter(Boolean).join(" · ") || "—" },
    { label: "Zone", value: promo.zone },
    { label: "Salary", value: promo.salary },
    { label: "Performance Rating", value: promo.performanceRating || "—" },
    { label: "Effective Date", value: promo.effectiveDate },
    { label: "Status", value: <StatusBadge variant={STATUS_VARIANT[promo.status]} text={promo.status} size="sm" /> },
  ];
  const approvalInfo = [
    { label: "Approved By", value: promo.approvedBy }, { label: "Approver Email", value: promo.approverEmail }, { label: "Approved At", value: promo.approvedAt },
    { label: "Rejected By", value: promo.rejectedBy }, { label: "Rejector Email", value: promo.rejectorEmail }, { label: "Rejected At", value: promo.rejectedAt },
  ];
  const pending = promo.status === "Pending";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title="Promotion Approval" subtitle="Review and approve or reject promotions."
        actions={
          <React.Fragment>
            <StatusBadge variant={STATUS_VARIANT[promo.status]} text={promo.status} />
            {promo.status === "Pending" && promo.hasBeenCorrected && <span title="This request was corrected and resubmitted after a return" style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#FFF7ED", border: "1px solid #FED7AA", color: "#B45309", borderRadius: 999, padding: "3px 10px", fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 12 }}><Icon name="refresh-line" size={13} color="#B45309" />Corrected & Resubmitted</span>}
            <PncViewOnlyChip perms={P} />
            <Button variant="stroke" icon="history-line" onClick={() => setTrailOpen(true)}>Audit Trail</Button>
            {pending && P.canDecide && (
              <React.Fragment>
                <Button variant="stroke" icon="arrow-go-back-line" onClick={() => setReturnOpen(true)} style={{ color: "#B45309", borderColor: "#FED7AA" }}>Return for Correction</Button>
                <Button variant="stroke" icon="close-line" onClick={() => setRejectOpen(true)} style={{ color: "#DC2626", borderColor: "#F3C2C2" }}>Reject Promotion</Button>
                <Button variant="primary" icon="check-line" onClick={() => onApprove(promo)}>Approve</Button>
              </React.Fragment>
            )}
            {promo.status === "Returned" && P.canEdit && <Button variant="primary" icon="edit-2-line" onClick={() => onEdit(promo)}>Review & Update</Button>}
            {promo.status === "Approved" && !promo.accepted && P.canEdit && <Button variant="primary" icon="user-follow-line" onClick={() => onAccept(promo)}>Record Employee Acceptance</Button>}
          </React.Fragment>
        } />

      <div className="card" style={{ padding: 0 }}>
        <DetailCard icon="user-3-line" title="Employee Information"><DetailPanel items={empInfo} tint="gray" cols={4} /></DetailCard>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <DetailCard icon="attachment-2" title="Supporting Documents">
          <SupportingDocumentsList urls={promo.docUrls} emptySubtitle="No supporting documents were attached to this promotion." />
        </DetailCard>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <DetailCard icon="shield-check-line" title="Approval Information"><DetailPanel items={approvalInfo} tint="gray" cols={3} /></DetailCard>
      </div>

      {promo.status === "Returned" && promo.returnReason && (
        <div className="card" style={{ padding: 0 }}>
          <DetailCard icon="arrow-go-back-line" title="Reason For Return">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ background: "#FFFBEB", border: "1px solid #FED7AA", borderRadius: 8, padding: "14px 16px", fontFamily: "var(--font-ui)", fontSize: 14, lineHeight: "22px", color: "var(--gray-800)" }}>{promo.returnReason}</div>
              <span style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--gray-400)" }}>Returned by {promo.returnedBy || "—"}{promo.returnedAt && promo.returnedAt !== "N/A" ? ` · ${promo.returnedAt}` : ""} — review the reason, update the request and resubmit for approval.</span>
            </div>
          </DetailCard>
        </div>
      )}

      {promo.status === "Rejected" && promo.rejectionReason && (
        <div className="card" style={{ padding: 0 }}>
          <DetailCard icon="error-warning-line" title="Reason For Rejection">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ background: "#FEF2F2", border: "1px solid #FBD9D9", borderRadius: 8, padding: "14px 16px", fontFamily: "var(--font-ui)", fontSize: 14, lineHeight: "22px", color: "var(--gray-800)" }}>{promo.rejectionReason}</div>
              <span style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--gray-400)" }}>Rejected by {promo.rejectedBy || "—"}{promo.rejectedAt && promo.rejectedAt !== "N/A" ? ` · ${promo.rejectedAt}` : ""} — a rejection is final; this request is closed.</span>
            </div>
          </DetailCard>
        </div>
      )}

      <RejectionReasonModal open={rejectOpen} onClose={() => setRejectOpen(false)}
        title="Reject Promotion" noun="promotion"
        onConfirm={(reason) => { setRejectOpen(false); onReject(promo, reason); }} />

      <RejectionReasonModal open={returnOpen} onClose={() => setReturnOpen(false)}
        title="Return for Correction" noun="promotion" tone="warning"
        onConfirm={(reason) => { setReturnOpen(false); onReturn(promo, reason); }} />

      <AuditTrailDrawer open={trailOpen} onClose={() => setTrailOpen(false)} name={promo.employees[0]}
        sub={`${promo.staffIds} · ${promo.newRole}`} badge={<StatusBadge variant={STATUS_VARIANT[promo.status]} text={promo.status} />}
        entries={promo.audit || []} />
    </div>
  );
}

/* ---------- controller ---------- */
function PromotionsScreen({ onToast, onSubPage, lookups }) {
  const [promos, setPromos] = usePromo(window.PROMOTION_SEED);
  const actor = usePncActor();
  const permsOf = (r) => pncPermsFor(actor, r);
  const [segment, setSegment] = usePromo("Request");   // Request (roster) | Approval
  const [rosterQ, setRosterQ] = usePromo("");
  const [approvalSel, setApprovalSel] = usePromo([]);
  const [q, setQ] = usePromo("");
  const [tab, setTab] = usePromo("All");
  const [bulkRejectIds, setBulkRejectIds] = usePromo(null);
  const [view, setView] = usePromo({ name: "list" });   // list | add | edit | details
  const [confirm, setConfirm] = usePromo(null);

  usePromoEffect(() => {
    if (!onSubPage) return;
    if (view.name === "add") onSubPage({ trail: [{ label: "Promotions", onClick: () => setView({ name: "list" }) }, { label: "Create Promotion" }] });
    else if (view.name === "edit") { const er = promos.find(p => p.id === view.id) || {}; onSubPage({ trail: [{ label: "Promotions", onClick: () => setView({ name: "list" }) }, { label: er.status === "Returned" ? "Review & Update" : er.status === "Draft" ? "Continue Draft" : "Edit Promotion" }] }); }
    else if (view.name === "details") onSubPage({ trail: [{ label: "Promotions", onClick: () => setView({ name: "list" }) }, { label: "Promotion Approval" }] });
    else onSubPage(null);
    return () => onSubPage(null);
  }, [view]);

  const current = view.name === "details" ? promos.find(p => p.id === view.id) : null;
  const editing = view.name === "edit" ? promos.find(p => p.id === view.id) : null;

  // Demotion guard: if the picked grade/notch ranks below any selected employee's current
  // placement, warn (Proceed Anyway / Cancel) BEFORE the normal submit confirmation.
  const submitPromo = (f) => {
    const next = () => setConfirm({ kind: view.name === "edit" ? "edit" : "add", form: f, id: view.id });
    const hits = window.demotionCheck({ employeeIds: f.employees, grade: f.grade, notch: f.notch });
    if (hits.length) window.confirmDemotion({ items: hits, noun: "promotion", onProceed: next });
    else next();
  };
  const runConfirm = () => {
    const c = confirm;
    if (c.kind === "add") {
      const f = c.form;
      const byId = window.EMP_BY_ID;
      const ids = f.employees;
      const primary = ids[0] ? (byId[ids[0]] || {}) : {};
      const allDocs = SupportingDocuments.resolve(f.docs, "https://files.bistasol.com/promotions/");
      setPromos(ps => [{
        id: promoId(), employees: ids.map(id => (byId[id] || {}).name || id), staffIds: ids.join(", ") || "—", createdBy: actor.name,
        previousRole: primary.title || "—", newRole: f.newJobTitle, previousGrade: primary.grade || "—", grade: f.grade, notch: f.notch,
        deptUnit: primary.dept || "—",
        department: f.department || primary.dept || "—",
        unit: primary.unit || "—",
        zone: f.zone || primary.zone || "—",
        branch: f.unitBranch || primary.branch || "—",
        previousSalary: primary.salary || "—", salary: f.salary || "—", performanceRating: primary.rating || "—",
        effectiveDate: f.effectiveDate, dateSubmitted: todayPromo(), status: "Pending",
        justification: f.justification, allowances: f.allowances || [], docUrls: allDocs,
        notifyIds: f.notifyIds || [], notifyPeople: (f.notifyIds || []).map(id => (byId[id] || {}).name || id),
        approvedBy: "N/A", approverEmail: "N/A", approvedAt: "N/A", rejectedBy: "N/A", rejectorEmail: "N/A", rejectedAt: "N/A",
        audit: [pncEntry({ action: 0, description: `Promotion request submitted — ${primary.title || "—"} → ${f.newJobTitle}`, justificationReason: f.justification, staffId: ids.join(", ") })],
      }, ...ps]);
      onToast("Promotion Submitted", { tone: "success" });
      setView({ name: "list" }); setSegment("Approval");
    } else if (c.kind === "edit") {
      const f = c.form;
      const allDocs = SupportingDocuments.resolve(f.docs, "https://files.bistasol.com/promotions/");
      const prevStatus = (promos.find(p => p.id === c.id) || {}).status;
      const wasReturned = prevStatus === "Returned";
      const wasDraft = prevStatus === "Draft";
      setPromos(ps => ps.map(p => p.id === c.id ? {
        ...p, employees: f.employees.map(id => (window.EMP_BY_ID[id] || {}).name || id), staffIds: f.employees.join(", "),
        newRole: f.newJobTitle, grade: f.grade, notch: f.notch, salary: f.salary, allowances: f.allowances || [],
        department: f.department || p.department, zone: f.zone || p.zone, branch: f.unitBranch || p.branch,
        effectiveDate: f.effectiveDate,
        justification: f.justification, docUrls: allDocs,
        notifyIds: f.notifyIds || [], notifyPeople: (f.notifyIds || []).map(id => (window.EMP_BY_ID[id] || {}).name || id),
        ...(wasReturned ? { status: "Pending", hasBeenCorrected: true, returnedBy: "N/A", returnedAt: "N/A", returnReason: "", dateSubmitted: todayPromo(), accepted: false } : {}),
        ...(wasDraft ? { status: "Pending", dateSubmitted: todayPromo() } : {}),
        audit: [...(p.audit || []), pncEntry({ action: wasReturned ? 6 : wasDraft ? 0 : 1, description: wasReturned ? "Request corrected and resubmitted for approval after return" : wasDraft ? `Draft submitted for approval — ${f.newJobTitle}` : "Request details updated", justificationReason: f.justification, staffId: f.employees.join(", ") })],
      } : p));
      onToast(wasReturned ? "Corrected & Resubmitted for Approval" : wasDraft ? "Promotion Submitted" : "Promotion Updated", { tone: "success" });
      if (wasReturned || wasDraft) setTab("All");
      setView({ name: "list" });
    } else if (c.kind === "deleteDraft") {
      setPromos(ps => ps.filter(p => p.id !== c.row.id));
      onToast("Draft Deleted", { tone: "error" });
    } else if (c.kind === "approve") {
      const now = new Date().toLocaleString("en-US");
      setPromos(ps => ps.map(p => p.id === c.row.id ? { ...p, status: "Approved", approvedBy: actor.name, approverEmail: actor.email, approvedAt: now,
        audit: [...(p.audit || []), pncEntry({ action: 3, description: "Promotion approved", actorName: `${actor.name} (${actor.role})`, staffId: p.staffIds })] } : p));
      onToast("Promotion Approved", { tone: "success" });
    } else if (c.kind === "accept") {
      setPromos(ps => ps.map(p => p.id === c.row.id ? { ...p, accepted: true,
        audit: [...(p.audit || []), pncEntry({ action: 7, description: "Employee accepted the promotion offer", actorName: `${p.employees[0]} (Employee)`, staffId: p.staffIds })] } : p));
      onToast("Employee Acceptance Recorded", { tone: "success" });
    } else if (c.kind === "bulkApprove") {
      const now = new Date().toLocaleString("en-US");
      setPromos(ps => ps.map(p => c.ids.includes(p.id) ? { ...p, status: "Approved", approvedBy: actor.name, approverEmail: actor.email, approvedAt: now,
        audit: [...(p.audit || []), pncEntry({ action: 3, description: "Promotion approved", actorName: `${actor.name} (${actor.role})`, staffId: p.staffIds })] } : p));
      onToast(`${c.ids.length} Promotion${c.ids.length > 1 ? "s" : ""} Approved`, { tone: "success" });
      setApprovalSel([]);
    }
    setConfirm(null);
  };

  // reject from the detail page — TERMINAL: the request is closed with a captured reason
  const rejectWithReason = (promo, reason) => {
    const now = new Date().toLocaleString("en-US");
    setPromos(ps => ps.map(p => p.id === promo.id ? { ...p, status: "Rejected", rejectedBy: actor.name, rejectorEmail: actor.email, rejectedAt: now, rejectionReason: reason,
      audit: [...(p.audit || []), pncEntry({ action: 4, description: "Promotion rejected — request closed", actorName: `${actor.name} (${actor.role})`, justificationReason: reason, staffId: p.staffIds })] } : p));
    onToast("Promotion Rejected", { tone: "error" });
  };

  // return from the detail page — sends the request BACK to the initiator, who reviews the
  // reason, corrects the request and resubmits it for approval
  const returnWithReason = (promo, reason) => {
    const now = new Date().toLocaleString("en-US");
    setPromos(ps => ps.map(p => p.id === promo.id ? { ...p, status: "Returned", returnedBy: actor.name, returnedAt: now, returnReason: reason,
      audit: [...(p.audit || []), pncEntry({ action: 4, description: "Promotion returned to initiator for correction", actorName: `${actor.name} (${actor.role})`, justificationReason: reason, staffId: p.staffIds })] } : p));
    onToast("Returned to Initiator for Correction");
  };

  // bulk reject — captures ONE reason applied to the whole selection (bulk/reject API shape)
  const bulkRejectWithReason = (reason) => {
    const now = new Date().toLocaleString("en-US");
    const ids = bulkRejectIds || [];
    setPromos(ps => ps.map(p => ids.includes(p.id) ? { ...p, status: "Rejected", rejectedBy: actor.name, rejectorEmail: actor.email, rejectedAt: now, rejectionReason: reason,
      audit: [...(p.audit || []), pncEntry({ action: 4, description: "Promotion rejected — request closed", actorName: `${actor.name} (${actor.role})`, justificationReason: reason, staffId: p.staffIds })] } : p));
    onToast(`${ids.length} Promotion${ids.length > 1 ? "s" : ""} Rejected`, { tone: "error" });
    setApprovalSel([]); setBulkRejectIds(null);
  };

  // save-as-draft — no validation gate beyond ≥1 employee; drafts live in the Drafts tab
  const saveDraft = (f) => {
    const byId = window.EMP_BY_ID;
    const ids = f.employees;
    const primary = ids[0] ? (byId[ids[0]] || {}) : {};
    const allDocs = SupportingDocuments.resolve(f.docs, "https://files.bistasol.com/promotions/");
    if (view.name === "edit" && editing && editing.status === "Draft") {
      setPromos(ps => ps.map(p => p.id === editing.id ? { ...p, employees: ids.map(id => (byId[id] || {}).name || id), staffIds: ids.join(", ") || "—",
        newRole: f.newJobTitle || "—", grade: f.grade || "—", notch: f.notch, salary: f.salary || "—",
        department: f.department || p.department, zone: f.zone || p.zone, branch: f.unitBranch || p.branch,
        effectiveDate: f.effectiveDate || "—", justification: f.justification, docUrls: allDocs, notifyIds: f.notifyIds || [] } : p));
    } else {
      setPromos(ps => [{
        id: promoId(), employees: ids.map(id => (byId[id] || {}).name || id), staffIds: ids.join(", ") || "—", createdBy: actor.name,
        previousRole: primary.title || "—", newRole: f.newJobTitle || "—", previousGrade: primary.grade || "—", grade: f.grade || "—", notch: f.notch,
        deptUnit: primary.dept || "—", department: f.department || primary.dept || "—", unit: primary.unit || "—",
        zone: f.zone || primary.zone || "—", branch: f.unitBranch || primary.branch || "—",
        previousSalary: primary.salary || "—", salary: f.salary || "—", performanceRating: primary.rating || "—",
        effectiveDate: f.effectiveDate || "—", dateSubmitted: "—", status: "Draft",
        justification: f.justification, allowances: f.allowances || [], docUrls: allDocs, notifyIds: f.notifyIds || [],
        approvedBy: "N/A", approverEmail: "N/A", approvedAt: "N/A", rejectedBy: "N/A", rejectorEmail: "N/A", rejectedAt: "N/A",
        audit: [pncEntry({ action: 1, description: "Promotion drafted — saved for later completion", staffId: ids.join(", ") })],
      }, ...ps]);
    }
    onToast("Draft Saved", { tone: "success" });
    setView({ name: "list" }); setSegment("Approval"); setTab("Drafts");
  };

  const headerAction = (
    <React.Fragment>
      <PncActorSwitch />
      {actor.canCreate && (
        <React.Fragment>
          <Button variant="stroke" icon="upload-cloud-2-line" onClick={() => onToast("Import Promotions — coming soon")}>Import Promotions</Button>
          <Button variant="primary" icon="add-line" onClick={() => setView({ name: "add" })}>Assign Promotion</Button>
        </React.Fragment>
      )}
    </React.Fragment>
  );

  let body;
  if (view.name === "add") body = <PromotionForm lookups={lookups} initialEmployees={view.initialEmployees} onCancel={() => setView({ name: "list" })} onSubmit={submitPromo} onSaveDraft={saveDraft} />;
  else if (view.name === "edit" && editing) body = <PromotionForm lookups={lookups} initialData={editing} onCancel={() => setView({ name: "list" })} onSubmit={submitPromo} onSaveDraft={editing.status === "Draft" ? saveDraft : null} />;
  else if (view.name === "details" && current) body = <PromotionDetails promo={current} perms={permsOf(current)}
    onApprove={(r) => setConfirm({ kind: "approve", row: r })} onReject={rejectWithReason} onReturn={returnWithReason}
    onEdit={(r) => setView({ name: "edit", id: r.id })} onAccept={(r) => setConfirm({ kind: "accept", row: r })}
    onUpdate={(partial) => setPromos(ps => ps.map(p => p.id === current.id ? { ...p, ...partial } : p))} onToast={onToast} />;
  else body = (
    (segment === "Request" && actor.canCreate)
      ? <PromotionRequest q={rosterQ} setQ={setRosterQ} segment={segment} setSegment={setSegment}
          onCreate={(ids) => setView({ name: "add", initialEmployees: ids })}
          title="Promotions" subtitle="Select staff to promote, and track approval status." headerAction={headerAction} />
      : <PromotionsList rows={promos.filter(p => p.status !== "Draft" || permsOf(p).canEdit)} q={q} setQ={setQ}
          onOpen={(r) => setView({ name: "details", id: r.id })} onEdit={(r) => setView({ name: "edit", id: r.id })} onDeleteDraft={(r) => setConfirm({ kind: "deleteDraft", row: r })}
          tab={tab} setTab={setTab} permsOf={permsOf} canDecide={actor.canDecide} showDrafts={actor.canCreate} segItems={actor.canCreate ? ["Request", "Approval"] : ["Approval"]}
          segment={segment} setSegment={setSegment} sel={approvalSel} setSel={setApprovalSel}
          title="Promotions" subtitle="Select staff to promote, and track approval status." headerAction={headerAction} />
  );

  const CONFIRM = {
    add:     { t: "Submit Promotion", m: "submit this promotion", l: "Yes, Submit", i: "check-line", c: "Cancel" },
    edit:    { t: "Save Changes", m: "save these changes", l: "Yes, Save", i: "check-line", c: "Cancel" },
    deleteDraft: { t: "Delete Draft", m: "delete this draft", l: "Yes, Delete", i: "delete-bin-6-line", c: "No" },
    approve: { t: "Approve Promotion", m: "approve this promotion", l: "Yes, Approve", i: "check-line", c: "No" },
    accept:  { t: "Record Employee Acceptance", m: "record that the employee has accepted this promotion", l: "Yes, Record", i: "user-follow-line", c: "No" },
    bulkApprove: { t: "Approve Promotions", m: "approve", l: "Yes, Approve", i: "check-line", c: "No" },
  };
  const confirmMsg = () => {
    const c = confirm;
    if (c.kind === "bulkApprove") {
      const k = c.ids.length;
      return `Are you sure you want to ${CONFIRM[c.kind].m} ${k} selected promotion${k > 1 ? "s" : ""}?`;
    }
    return `Are you sure you want to ${CONFIRM[c.kind].m}?`;
  };

  const approvalBarVisible = view.name === "list" && segment === "Approval" && approvalSel.length > 0 && actor.canDecide;

  return (
    <React.Fragment>
      {body}

      {/* floating bulk-approval bar (Approval queue) */}
      <BulkBar count={approvalSel.length} noun="promotions selected" visible={approvalBarVisible} onClear={() => setApprovalSel([])}>
        <Button variant="stroke" icon="close-line" onClick={() => setBulkRejectIds(approvalSel)} style={{ color: "#DC2626", borderColor: "#F3C2C2" }}>Reject</Button>
        <Button variant="primary" icon="check-line" onClick={() => setConfirm({ kind: "bulkApprove", ids: approvalSel })}>Approve</Button>
      </BulkBar>

      <RejectionReasonModal open={!!bulkRejectIds} onClose={() => setBulkRejectIds(null)}
        title={`Reject ${(bulkRejectIds || []).length} Promotion${(bulkRejectIds || []).length > 1 ? "s" : ""}`} noun="selection"
        description="Provide one reason for rejecting the selected promotions. Rejection is final — the initiators will be notified."
        onConfirm={bulkRejectWithReason} />

      {confirm && (() => { const cc = CONFIRM[confirm.kind]; return (
        <ConfirmModal title={cc.t} message={confirmMsg()} confirmLabel={cc.l} confirmIcon={cc.i}
          cancelLabel={cc.c} onConfirm={runConfirm} onClose={() => setConfirm(null)} />
      ); })()}
    </React.Fragment>
  );
}

Object.assign(window, { PromotionsScreen });
