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
const TR_STATUS_VARIANT = { Approved: "approved", Pending: "pending", Declined: "rejected" };
const todayTr = () => new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
const TRANSFER_CLASSES = ["Intra-Departmental", "Inter-Departmental"];
const TR_DOC = (name, ext, size, docType) => ({ name, ext, size, docType });

const TRANSFER_SEED = [
  { id: 1, employees: ["Aaron Appiah"], staffIds: "EMP-18330", classification: "Inter-Departmental",
    previousLocation: "Abossey Okai", newLocation: "Ridge", previousDept: "Finance", newDept: "Operations",
    previousUnit: "Assurance", currentTitle: "Ag. Assurance Supervisor", newTitle: "Operations Supervisor",
    grade: "Grade 4", zone: "Accra East",
    effectiveDate: "Jun 01, 2026", dateSubmitted: "May 14, 2026", status: "Approved",
    reason: "Workforce realignment to strengthen the Operations team at the Ridge branch.",
    documents: ["https://files.bistasol.com/transfers/Transfer-Recommendation.pdf", "https://files.bistasol.com/transfers/Handover-Checklist.docx"],
    approvedBy: "Peter Bosrotsi", approverEmail: "pybosrotsi@gcb.com.gh", approvedAt: "5/16/2026, 2:08:34 PM",
    rejectedBy: "N/A", rejectorEmail: "N/A", rejectedAt: "N/A" },
  { id: 2, employees: ["Abass Abdul Mumin"], staffIds: "EMP-17431", classification: "Intra-Departmental",
    previousLocation: "Cape Coast", newLocation: "Takoradi", previousDept: "Operations", newDept: "Operations",
    previousUnit: "Branch Support", currentTitle: "Branch Support", newTitle: "",
    grade: "Grade 3", zone: "Central Zones",
    effectiveDate: "May 28, 2026", dateSubmitted: "May 10, 2026", status: "Approved",
    reason: "Relocation to cover staffing gap at the Takoradi branch within the same department.",
    documents: ["https://files.bistasol.com/transfers/Approval-Memo.pdf"],
    approvedBy: "Peter Bosrotsi", approverEmail: "pybosrotsi@gcb.com.gh", approvedAt: "5/12/2026, 10:22:10 AM",
    rejectedBy: "N/A", rejectorEmail: "N/A", rejectedAt: "N/A" },
  { id: 3, employees: ["Aba Odum"], staffIds: "EMP-18389", classification: "Inter-Departmental",
    previousLocation: "Ridge", newLocation: "Tema", previousDept: "Information Technology", newDept: "Operations",
    previousUnit: "Data & Analytics", currentTitle: "Data Scientist", newTitle: "Analytics Lead",
    grade: "Grade 5", zone: "Accra West",
    effectiveDate: "Jul 08, 2026", dateSubmitted: "May 18, 2026", status: "Pending",
    reason: "Cross-functional move to embed analytics capability within the Operations department.",
    documents: ["https://files.bistasol.com/transfers/Business-Case.pdf"],
    approvedBy: "N/A", approverEmail: "N/A", approvedAt: "N/A",
    rejectedBy: "N/A", rejectorEmail: "N/A", rejectedAt: "N/A" },
  { id: 4, employees: ["Franklin Brobbey"], staffIds: "EMP-10231", classification: "Intra-Departmental",
    previousLocation: "Accra", newLocation: "Kumasi", previousDept: "Finance", newDept: "Finance",
    previousUnit: "Accounts", currentTitle: "Accountant", newTitle: "",
    grade: "Grade 2", zone: "South Zone",
    effectiveDate: "May 28, 2026", dateSubmitted: "May 09, 2026", status: "Pending",
    reason: "Employee request to transfer closer to family; role available at the Kumasi branch.",
    documents: ["https://files.bistasol.com/transfers/Employee-Request.docx", "https://files.bistasol.com/transfers/ID-Verification.jpg"],
    approvedBy: "N/A", approverEmail: "N/A", approvedAt: "N/A",
    rejectedBy: "N/A", rejectorEmail: "N/A", rejectedAt: "N/A" },
  { id: 5, employees: ["Samuel Boateng"], staffIds: "EMP-11002", classification: "Inter-Departmental",
    previousLocation: "Kumasi", newLocation: "Accra", previousDept: "Marketing", newDept: "Operations",
    previousUnit: "Sales", currentTitle: "Sales Officer", newTitle: "Retail Officer",
    grade: "Grade 1", zone: "West Zone",
    effectiveDate: "Apr 30, 2026", dateSubmitted: "Apr 12, 2026", status: "Declined",
    reason: "Proposed move to Retail Operations; deferred pending replacement at current branch.",
    documents: ["https://files.bistasol.com/transfers/Transfer-Proposal.pdf"],
    approvedBy: "N/A", approverEmail: "N/A", approvedAt: "N/A",
    rejectedBy: "Peter Bosrotsi", rejectorEmail: "pybosrotsi@gcb.com.gh", rejectedAt: "4/18/2026, 9:14:02 AM" },
];

/* ---------- requests list (approval queue) ---------- */
function TransfersList({ rows, q, setQ, tab, setTab, onOpen, onEdit, onArchive, segment, setSegment, sel, setSel, title, subtitle, headerAction }) {
  const [menu, setMenu] = useTr(null);
  const byTab = rows.filter(r => tab.length === 0 || tab.includes(r.status));
  const shown = byTab.filter(r => q === "" || r.employees.join(" ").toLowerCase().includes(q.toLowerCase()) || r.newLocation.toLowerCase().includes(q.toLowerCase()));
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
        <UI.FilterBar left={<Segmented items={["Requests", "Approvals"]} active={segment} onChange={setSegment} />}
          search={q} onSearch={setQ} searchPlaceholder="Search transfers…"
          filters={[{ label: "Status", node: <StatusFilter value={tab} onChange={setTab} /> }]} />
        {rows.length === 0
          ? <EmptyState title="No transfers yet" subtitle="Select staff from the Transfer tab to raise a transfer." />
          : <table className="bh">
              <thead><tr>
                <th style={{ width: 44 }}><Checkbox checked={allPendingSel} onChange={toggleAll} /></th>
                <th>Employee Name</th><th>Location / Department</th><th>Effective Date</th><th>Classification</th><th>Status</th><th>Approved By</th><th style={{ width: 48 }}></th>
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
                        <span style={{ color: "var(--gray-500)" }}>{r.previousLocation}</span>
                        <Icon name="arrow-right-line" size={15} color="var(--gray-400)" />
                        <span style={{ color: "var(--gray-900)", fontWeight: 500 }}>{r.newLocation}</span>
                      </span>
                    </td>
                    <td>{r.effectiveDate}</td>
                    <td><span style={{ fontSize: 13, color: "var(--gray-700)" }}>{r.classification}</span></td>
                    <td><StatusBadge variant={TR_STATUS_VARIANT[r.status]} text={r.status} size="sm" /></td>
                    <td>{r.approvedBy && r.approvedBy !== "N/A" ? r.approvedBy : "—"}</td>
                    <td style={{ textAlign: "right" }} onClick={e => e.stopPropagation()}>
                      <UI.RowActions actions={[
                        { label: "View Details", short: "View", icon: "eye-line", onClick: () => onOpen(r) },
                        { label: "Edit Transfer", short: "Edit", icon: "edit-2-line", onClick: () => onEdit(r) },
                        { label: "Archive Transfer", short: "Archive", icon: "archive-line", danger: true, onClick: () => onArchive(r) },
                      ]} />
                    </td>
                  </tr>
                  );
                })}
                {shown.length === 0 && <tr><td colSpan={8} style={{ padding: 0 }}><EmptyState compact title="No results found" subtitle="No transfer matches your search." /></td></tr>}
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
    jobGrade: e.grade, department: e.dept, profilePictureUrl: "",
  }));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title={title} subtitle={subtitle} actions={headerAction} />
      <div className="card" style={{ padding: 20 }}>
        <div className="bh-tablebox">
        <UI.FilterBar left={<Segmented items={["Requests", "Approvals"]} active={segment} onChange={setSegment} />}
          search={q} onSearch={setQ} searchPlaceholder="Search staff…" />
        <EmployeeSelectionRoster employees={rows} itemLabel="staff"
          actionLabel="Create Transfer" onProceed={onCreate} searchQuery={q} />
        </div>
      </div>
    </div>
  );
}

/* ---------- create form (full page) ---------- */
function TransferForm({ lookups, initialEmployees, initialData, onCancel, onSubmit }) {
  const LK = lookups || window.LOOKUPS;
  const byId = window.EMP_BY_ID;
  const EMP = window.EMPLOYEE_LIST;
  const isEdit = !!initialData;
  const initIds = initialData ? (initialData.employees || []).map(window.firstIdForName).filter(Boolean) : (initialEmployees || []);
  const [employees, setEmployees] = useTr(initIds);
  const [form, setForm] = useTr({
    classification: initialData?.classification || "", newLocation: initialData?.newLocation || "",
    newDepartment: initialData?.newDept || "", newUnit: initialData?.newUnit || "", newJobTitle: initialData?.newTitle || "",
    newGrade: initialData?.grade || "", newNotch: initialData?.notch || "",
    effectiveDate: initialData?.effectiveDate || "", reason: initialData?.reason || "" });
  const [docs, setDocs] = useTr({ keptUrls: initialData?.documents || [], newFiles: [] });
  const [mails, setMails] = useTr([]);
  const set = (k, v) => setForm(s => ({ ...s, [k]: v }));

  const primary = employees[0] ? byId[employees[0]] : null;
  // A job title belongs to a department, so an intra-departmental transfer is only valid when
  // every selected employee is in the SAME department. If a mix is selected, force Inter-
  // Departmental and surface an error.
  const deptList = [...new Set(employees.map(id => (byId[id] || {}).dept).filter(Boolean))];
  const mixedDepts = deptList.length > 1;
  useTrEffect(() => {
    // A department conflict makes intra-departmental impossible — force Inter-Departmental whether
    // the field was empty or set to Intra, so the banner's claim always matches the actual value.
    if (mixedDepts && form.classification !== "Inter-Departmental") {
      setForm(s => ({ ...s, classification: "Inter-Departmental", newJobTitle: "", newGrade: "", newNotch: "" }));
    }
  }, [mixedDepts, form.classification]);
  // Cascade (mirrors Promotions / Job Title): the effective department narrows the Job Title list;
  // picking a Job Title auto-resolves its Job Grade + Notch → Salary + Allowances. For an intra-
  // departmental transfer the department is unchanged, so titles come from the employee's department.
  const effDept = form.classification === "Intra-Departmental" ? (primary && primary.dept) || "" : form.newDepartment;
  const titleOptions = window.jobTitlesForDepartment(effDept);
  const selectTitle = (v) => { const info = window.jobTitleInfo(v) || {}; setForm(s => ({ ...s, newJobTitle: v, newGrade: info.grade || "", newNotch: "" })); };
  const selectNewDept = (v) => setForm(s => ({ ...s, newDepartment: v, newJobTitle: "", newGrade: "", newNotch: "" }));
  const notchOptions = window.notchesForGrade(form.newGrade);
  // Salary + allowances auto-fetched from Payroll once the title resolves grade + notch.
  const payroll = window.fetchPayroll(form.newGrade, form.newNotch);
  const salary = payroll ? payroll.salary : "";
  const allowances = payroll ? payroll.allowances : [];
  const staffIds = employees.join(", ");
  const autoItems = primary ? [
    { label: "Staff ID(s)", value: staffIds },
    { label: "Current Job Title", value: primary.title },
    { label: "Current Grade", value: primary.grade },
    { label: "Current Department / Unit", value: primary.dept },
    { label: "Current Location / Branch", value: primary.branch },
    { label: "Zone", value: primary.zone },
  ] : [];

  const valid = employees.length > 0 && form.classification && form.newLocation && form.effectiveDate && form.reason.trim();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title={isEdit ? "Edit Transfer" : "Create Transfer"}
        subtitle={isEdit ? "Update this transfer record." : "Select staff, set the new posting and route for approval."} />

      <FormCard title="Employee Information">
        <Field label="Employee(s)"><EmployeeAddSelect value={employees} onChange={setEmployees} employees={EMP} /></Field>
        {primary && employees.length === 1 && (
          <div>
            <div style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--gray-400)", marginBottom: 6 }}>Auto-populated from employee record</div>
            <DetailPanel items={autoItems} tint="gray" cols={3} />
          </div>
        )}
      </FormCard>

      <FormCard title="Transfer Details">
        {mixedDepts && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "#FEF3F2", border: "1px solid #FECDCA", borderRadius: "var(--radius-md)", padding: "10px 14px" }}>
            <Icon name="error-warning-line" size={18} color="#D92D20" style={{ marginTop: 1, flexShrink: 0 }} />
            <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "#B42318", lineHeight: 1.45 }}>
              Selected employees belong to different departments ({deptList.join(", ")}). An intra-departmental transfer requires a single department, so this has been set to <b>Inter-Departmental</b>.
            </span>
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <Field label="Transfer Classification"><Combobox value={form.classification} disabled={mixedDepts} onChange={v => setForm(s => ({ ...s, classification: v, newDepartment: v === "Intra-Departmental" ? "" : s.newDepartment, newJobTitle: "", newGrade: "", newNotch: "" }))} options={TRANSFER_CLASSES} placeholder="Select classification" /></Field>
          <Field label="Proposed / New Location"><Combobox value={form.newLocation} onChange={v => set("newLocation", v)} options={LK.branches} placeholder="Select new location / branch" /></Field>
        </div>
        {/* Department + Job Title always sit side by side (cascade pair) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {form.classification === "Intra-Departmental"
            ? <Field label="Department">
                <div className="input-wrap" style={{ background: "var(--gray-50)" }}>
                  <Icon name="building-line" size={18} style={{ color: "var(--icon-default)" }} />
                  <input value={effDept} readOnly placeholder="Current department (unchanged)" style={{ color: effDept ? "var(--gray-900)" : "var(--gray-400)" }} />
                </div>
              </Field>
            : <Field label="New Department"><Combobox value={form.newDepartment} onChange={selectNewDept} options={LK.departments} placeholder="Select new department" /></Field>}
          <Field label="New Job Title" optional><Combobox value={form.newJobTitle} onChange={selectTitle} options={titleOptions} placeholder={effDept ? "Select new job title (optional)" : (form.classification === "Intra-Departmental" ? "Select employee(s) first" : "Select a department first")} noDataText={form.classification === "Intra-Departmental" ? "Select employee(s) first." : "Select a department first."} /></Field>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <Field label="Notch" optional><Combobox value={form.newNotch} onChange={v => set("newNotch", v)} options={notchOptions} icon="stack-line" placeholder={form.newGrade ? "Select notch" : "Select job title first"} noDataText="Select a job title first." /></Field>
          <Field label="Unit/Branch" optional><Combobox value={form.newUnit} onChange={v => set("newUnit", v)} options={LK.orgUnits || []} placeholder="Select unit / branch" /></Field>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <Field label="Proposed Effective Transfer Date"><UI.DatePicker value={form.effectiveDate} onSelect={d => set("effectiveDate", d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }))} placeholder="Pick a date" /></Field>
        </div>
      </FormCard>

      <ResolvedRoleBenefits grade={form.newGrade} salary={salary} allowances={allowances} />

      <FormCard title="Justification & Documents">
        <Field label="Reason / Justification"><Textarea rows={4} value={form.reason} onChange={e => set("reason", e.target.value)} placeholder="Explain the business justification for this transfer…" /></Field>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label style={{ fontFamily: "var(--font-control)", fontWeight: 500, fontSize: 14, color: "var(--gray-900)" }}>Supporting Documents</label>
          <SupportingDocuments existingUrls={initialData?.documents || []} isEditMode={isEdit} onChange={setDocs} maxFiles={8} maxSizeMB={8} />
        </div>
      </FormCard>

      <FormCard title="Notification">
        <EmailInputList label="Notify Stakeholders" description="Department / stakeholder mails" placeholder="eg. financedept@starret.com"
          emails={mails} onChange={setMails} />
      </FormCard>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
        <Button variant="stroke" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" disabled={!valid} onClick={() => valid && onSubmit({ employees: employees.map(id => (byId[id] || {}).name || id), employeeIds: employees, primary, staffIds, ...form, docs, notifyMails: mails })}>{isEdit ? "Save Changes" : "Create Transfer"}</Button>
      </div>
    </div>
  );
}

/* ---------- details — "Transfer Approval" ---------- */
function TransferDetails({ transfer, onApprove, onReject, onUpdate, onToast }) {
  const t = transfer;
  const info = [
    { label: "Employee Name", value: t.employees.join(", ") },
    { label: "Transfer Classification", value: t.classification },
    { label: "Current Location", value: t.previousLocation },
    { label: "New Location", value: t.newLocation },
    { label: "Current Department", value: t.previousDept },
    { label: "New Department", value: t.newDept },
    { label: "Current Job Title", value: t.currentTitle },
    { label: "New Job Title", value: t.newTitle || "—" },
    { label: "Job Grade", value: t.grade },
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
            {pending && (
              <React.Fragment>
                <Button variant="stroke" icon="close-line" onClick={() => onReject(t)}>Reject</Button>
                <Button variant="primary" icon="check-line" onClick={() => onApprove(t)}>Approve</Button>
              </React.Fragment>
            )}
          </React.Fragment>
        } />

      <div className="card" style={{ padding: 0 }}>
        <DetailCard icon="exchange-line" title="Transfer Information"><DetailPanel items={info} tint="gray" cols={4} /></DetailCard>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <DetailCard icon="file-text-line" title="Reason / Justification">
          <div style={{ background: "#F6F8FA", borderRadius: 8, padding: "14px 16px", fontFamily: "var(--font-ui)", fontSize: 14, lineHeight: "22px", color: "var(--gray-800)" }}>{t.reason}</div>
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

      <WorkflowPanel workflowType="Transfer" record={t} onChange={(partial) => onUpdate(partial)} onToast={onToast} />
    </div>
  );
}

/* ---------- controller ---------- */
function TransfersScreen({ onToast, onSubPage, lookups }) {
  const DIR = window.EMPLOYEE_DIRECTORY;
  const [transfers, setTransfers] = useTr(TRANSFER_SEED);
  const [segment, setSegment] = useTr("Requests");   // Requests (roster) | Approval
  const [rosterQ, setRosterQ] = useTr("");
  const [selected, setSelected] = useTr([]);
  const [approvalSel, setApprovalSel] = useTr([]);   // selected pending rows in Approvals queue
  const [lastCount, setLastCount] = useTr(0);
  const [q, setQ] = useTr("");
  const [tab, setTab] = useTr([]);
  const [view, setView] = useTr({ name: "list" });   // list | add | details
  const [confirm, setConfirm] = useTr(null);

  useTrEffect(() => {
    if (!onSubPage) return;
    if (view.name === "add") onSubPage({ trail: [{ label: "Transfers", onClick: () => setView({ name: "list" }) }, { label: "Create Transfer" }] });
    else if (view.name === "details") onSubPage({ trail: [{ label: "Transfers", onClick: () => setView({ name: "list" }) }, { label: "Transfer Approval" }] });
    else onSubPage(null);
    return () => onSubPage(null);
  }, [view]);

  useTrEffect(() => { if (selected.length) setLastCount(selected.length); }, [selected.length]);

  const current = view.name === "details" ? transfers.find(t => t.id === view.id) : null;

  const submitTransfer = (f) => setConfirm({ kind: view.initialData ? "edit" : "add", form: f, id: view.initialData?.id });
  const submitBulk = (f) => setConfirm({ kind: "bulk", form: f });
  const runConfirm = () => {
    const c = confirm;
    if (c.kind === "add") {
      const f = c.form, p = f.primary || {};
      const allDocs = SupportingDocuments.resolve(f.docs, "https://files.bistasol.com/transfers/");
      setTransfers(ts => [{
        id: trId(), employees: f.employees, staffIds: f.staffIds || "—", classification: f.classification,
        previousLocation: p.branch || "—", newLocation: f.newLocation,
        previousDept: p.dept || "—", newDept: f.newDepartment || p.dept || "—",
        previousUnit: p.dept || "—", currentTitle: p.title || "—", newTitle: f.newJobTitle || "",
        grade: p.grade || "—", zone: p.zone || "—",
        effectiveDate: f.effectiveDate, dateSubmitted: todayTr(), status: "Pending",
        reason: f.reason, documents: allDocs, approvers: f.approvers || [],
        approvedBy: "N/A", approverEmail: "N/A", approvedAt: "N/A", rejectedBy: "N/A", rejectorEmail: "N/A", rejectedAt: "N/A",
      }, ...ts]);
      onToast("Transfer Submitted", { tone: "success" });
      setView({ name: "list" });
    } else if (c.kind === "edit") {
      const f = c.form;
      const allDocs = SupportingDocuments.resolve(f.docs, "https://files.bistasol.com/transfers/");
      setTransfers(ts => ts.map(t => t.id === c.id ? { ...t, employees: f.employees, classification: f.classification,
        newLocation: f.newLocation, newDept: f.newDepartment || t.newDept, newUnit: f.newUnit, newTitle: f.newJobTitle || "",
        effectiveDate: f.effectiveDate, reason: f.reason, documents: allDocs, approvers: f.approvers || [] } : t));
      onToast("Transfer Updated", { tone: "success" });
      setView({ name: "list" });
    } else if (c.kind === "bulk") {
      const f = c.form;
      const recs = f.names.map(n => {
        const p = DIR[n] || {};
        return {
          id: trId(), employees: [n], staffIds: p.staffId || "—", classification: f.classification,
          previousLocation: p.branch || "—", newLocation: f.location,
          previousDept: p.dept || "—", newDept: f.department || p.dept || "—",
          previousUnit: p.dept || "—", currentTitle: p.title || "—", newTitle: "",
          grade: p.grade || "—", zone: p.zone || "—",
          effectiveDate: f.date, dateSubmitted: todayTr(), status: "Pending",
          reason: f.reason, documents: f.documents || [],
          approvedBy: "N/A", approverEmail: "N/A", approvedAt: "N/A", rejectedBy: "N/A", rejectorEmail: "N/A", rejectedAt: "N/A",
        };
      });
      setTransfers(ts => [...recs, ...ts]);
      onToast(f.names.length > 1 ? `Transfer Raised for ${f.names.length} Employees` : "Transfer Raised", { tone: "success" });
      setSelected([]); setView({ name: "list" }); setSegment("Approvals");
    } else if (c.kind === "archive") {
      setTransfers(ts => ts.filter(t => t.id !== c.row.id));
      onToast("Transfer Archived", { tone: "error" });
      setView({ name: "list" });
    } else if (c.kind === "approve") {
      const now = new Date().toLocaleString("en-US");
      const stamp = window.wfNow();
      setTransfers(ts => ts.map(t => t.id === c.row.id ? { ...t, status: "Approved", wfStatus: "Approved", approvedBy: "Peter Bosrotsi", approverEmail: "pybosrotsi@gcb.com.gh", approvedAt: now,
        audit: [...(t.audit || []), { action: "Transfer approved", decision: "Approved", actor: "Peter Bosrotsi (Head P&C)", at: stamp }] } : t));
      onToast("Transfer Approved", { tone: "success" });
    } else if (c.kind === "reject") {
      const now = new Date().toLocaleString("en-US");
      const stamp = window.wfNow();
      setTransfers(ts => ts.map(t => t.id === c.row.id ? { ...t, status: "Declined", wfStatus: "Declined", rejectedBy: "Peter Bosrotsi", rejectorEmail: "pybosrotsi@gcb.com.gh", rejectedAt: now,
        audit: [...(t.audit || []), { action: "Transfer declined", decision: "Declined", actor: "Peter Bosrotsi (Head P&C)", at: stamp }] } : t));
      onToast("Transfer Rejected", { tone: "error" });
    } else if (c.kind === "bulkApprove") {
      const now = new Date().toLocaleString("en-US");
      const ids = c.ids;
      setTransfers(ts => ts.map(t => ids.includes(t.id) ? { ...t, status: "Approved", approvedBy: "Peter Bosrotsi", approverEmail: "pybosrotsi@gcb.com.gh", approvedAt: now } : t));
      onToast(`${ids.length} Transfer${ids.length > 1 ? "s" : ""} Approved`, { tone: "success" });
      setApprovalSel([]);
    } else if (c.kind === "bulkReject") {
      const now = new Date().toLocaleString("en-US");
      const ids = c.ids;
      setTransfers(ts => ts.map(t => ids.includes(t.id) ? { ...t, status: "Declined", rejectedBy: "Peter Bosrotsi", rejectorEmail: "pybosrotsi@gcb.com.gh", rejectedAt: now } : t));
      onToast(`${ids.length} Transfer${ids.length > 1 ? "s" : ""} Rejected`, { tone: "error" });
      setApprovalSel([]);
    }
    setConfirm(null);
  };

  let body;
  if (view.name === "add") body = <TransferForm lookups={lookups} initialEmployees={view.initialEmployees} initialData={view.initialData} onCancel={() => setView({ name: "list" })} onSubmit={submitTransfer} />;
  else if (view.name === "details" && current) body = <TransferDetails transfer={current}
    onApprove={(r) => setConfirm({ kind: "approve", row: r })} onReject={(r) => setConfirm({ kind: "reject", row: r })}
    onUpdate={(partial) => setTransfers(ts => ts.map(t => t.id === current.id ? { ...t, ...partial } : t))} onToast={onToast} />;
  else body = (
    <React.Fragment>
      {segment === "Requests"
        ? <TransferRoster q={rosterQ} setQ={setRosterQ} segment={segment} setSegment={setSegment}
            onCreate={(ids) => setView({ name: "add", initialEmployees: ids })}
            title="Transfers" subtitle="Transfer or bulk-transfer staff, and track approval status."
            headerAction={<React.Fragment>
              <Button variant="stroke" icon="download-2-line" onClick={() => onToast("Import Transfers — coming soon")}>Import Transfers</Button>
              <Button variant="primary" icon="add-line" onClick={() => setView({ name: "add" })}>Add Transfer</Button>
            </React.Fragment>} />
        : <TransfersList rows={transfers} q={q} setQ={setQ} tab={tab} setTab={setTab}
            onOpen={(r) => setView({ name: "details", id: r.id })} onEdit={(r) => setView({ name: "add", initialData: r })} onArchive={(r) => setConfirm({ kind: "archive", row: r })}
            segment={segment} setSegment={setSegment} sel={approvalSel} setSel={setApprovalSel}
            title="Transfers" subtitle="Transfer or bulk-transfer staff, and track approval status."
            headerAction={<React.Fragment>
              <Button variant="stroke" icon="download-2-line" onClick={() => onToast("Import Transfers — coming soon")}>Import Transfers</Button>
              <Button variant="primary" icon="add-line" onClick={() => setView({ name: "add" })}>Add Transfer</Button>
            </React.Fragment>} />}
    </React.Fragment>
  );

  const CONFIRM = {
    add:     { t: "Submit Transfer", m: "submit this transfer", l: "Yes, Submit", i: "check-line", c: "Cancel" },
    edit:    { t: "Save Changes", m: "save these changes", l: "Yes, Save", i: "check-line", c: "Cancel" },
    bulk:    { t: "Raise Transfer", m: "raise this transfer", l: "Yes, Transfer", i: "exchange-line", c: "Cancel" },
    archive: { t: "Archive Transfer", m: "archive this transfer", l: "Yes, Archive", i: "archive-line", c: "No" },
    approve: { t: "Approve Transfer", m: "approve this transfer", l: "Yes, Approve", i: "check-line", c: "No" },
    reject:  { t: "Reject Transfer", m: "reject this transfer", l: "Yes, Reject", i: "close-line", c: "No" },
    bulkApprove: { t: "Approve Transfers", m: "approve", l: "Yes, Approve", i: "check-line", c: "No" },
    bulkReject:  { t: "Reject Transfers", m: "reject", l: "Yes, Reject", i: "close-line", c: "No" },
  };
  const confirmMsg = () => {
    const c = confirm;
    if (c.kind === "bulk") {
      const k = c.form.names.length;
      return k > 1 ? `Are you sure you want to raise this transfer for ${k} employees? Each will be pending approval.`
        : "Are you sure you want to raise this transfer? It will be pending approval.";
    }
    if (c.kind === "bulkApprove" || c.kind === "bulkReject") {
      const k = c.ids.length;
      return `Are you sure you want to ${CONFIRM[c.kind].m} ${k} selected transfer${k > 1 ? "s" : ""}?`;
    }
    return `Are you sure you want to ${CONFIRM[c.kind].m}?`;
  };

  const approvalBarVisible = view.name === "list" && segment === "Approvals" && approvalSel.length > 0;

  return (
    <React.Fragment>
      {body}

      {/* floating bulk-approval bar (Approvals queue) */}
      <BulkBar count={approvalSel.length} noun="transfers selected" visible={approvalBarVisible} onClear={() => setApprovalSel([])}>
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

Object.assign(window, { TransfersScreen });
