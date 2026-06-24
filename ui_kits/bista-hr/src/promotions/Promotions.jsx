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
const STATUS_VARIANT = { Approved: "approved", Pending: "pending", Declined: "rejected" };
const todayPromo = () => new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
// Map a promotion's overall status onto each approver's at-a-glance state.
const approverVariant = (status) => status === "Approved" ? "approved" : status === "Declined" ? "rejected" : "pending";
const approverLabel = (status) => status === "Approved" ? "Approved" : status === "Declined" ? "Rejected" : "Pending";

// roster rows from the shared employee directory (single source of truth)
function promoRosterRows() {
  return window.EMPLOYEE_LIST.map(e => ({
    id: e.id, name: e.name, employeeNumber: e.staffId, jobTitle: e.title,
    jobGrade: e.grade, department: e.dept, profilePictureUrl: "",
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
function PromotionsList({ rows, q, setQ, tab, setTab, onOpen, onEdit, onArchive, segment, setSegment, sel, setSel, title, subtitle, headerAction }) {
  const byTab = rows.filter(r => tab.length === 0 || tab.includes(r.status));
  const shown = byTab.filter(r => q === "" || r.employees.join(" ").toLowerCase().includes(q.toLowerCase()) || r.newRole.toLowerCase().includes(q.toLowerCase()));
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
        <UI.FilterBar left={<Segmented items={["Request", "Approval"]} active={segment} onChange={setSegment} />}
          search={q} onSearch={setQ} searchPlaceholder="Search promotions…"
          filters={[{ label: "Status", node: <StatusFilter value={tab} onChange={setTab} /> }]} />
        {rows.length === 0
          ? <EmptyState title="No promotions yet" subtitle="Select staff from the Request tab to raise a promotion." />
          : <table className="bh">
              <thead><tr>
                <th style={{ width: 44 }}><Checkbox checked={allPendingSel} onChange={toggleAll} /></th>
                <th>Employee Name</th><th>Grade Title</th><th>Effective Date</th><th>Status</th><th>Approved By</th><th style={{ width: 48 }}></th>
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
                        <span style={{ color: "var(--gray-500)" }}>{r.previousRole}</span>
                        <Icon name="arrow-right-line" size={15} color="var(--gray-400)" />
                        <span style={{ color: "var(--gray-900)", fontWeight: 500 }}>{r.newRole}</span>
                      </span>
                    </td>
                    <td>{r.effectiveDate}</td>
                    <td><StatusBadge variant={STATUS_VARIANT[r.status]} text={r.status} size="sm" /></td>
                    <td>{r.approvedBy && r.approvedBy !== "N/A" ? r.approvedBy : "—"}</td>
                    <td style={{ textAlign: "right" }} onClick={e => e.stopPropagation()}>
                      <UI.RowActions actions={[
                        { label: "View Details", short: "View", icon: "eye-line", onClick: () => onOpen(r) },
                        { label: "Edit Promotion", short: "Edit", icon: "edit-2-line", onClick: () => onEdit(r) },
                        { label: "Archive Promotion", short: "Archive", icon: "archive-line", danger: true, onClick: () => onArchive(r) },
                      ]} />
                    </td>
                  </tr>
                  );
                })}
                {shown.length === 0 && <tr><td colSpan={7} style={{ padding: 0 }}><EmptyState compact title="No results found" subtitle="No promotion matches your search." /></td></tr>}
              </tbody>
            </table>}
        {rows.length > 0 && shown.length > 0 && <div style={{ borderTop: "1px solid var(--divider)" }}><Pagination page={pg.page} pages={pg.pages} onPrev={pg.prev} onNext={pg.next} /></div>}
        </div>
      </div>
    </div>
  );
}

/* ---------- reusable section helpers (form) ---------- */
function FormCard({ title, children }) {
  return (
    <div className="card" style={{ padding: "var(--card-pad, 24px)", overflow: "visible" }}>
      <div className="bh-h2" style={{ fontSize: 20, marginBottom: 18 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>{children}</div>
    </div>
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
function PromotionForm({ lookups, initialData, initialEmployees, onCancel, onSubmit }) {
  const LK = lookups || window.LOOKUPS;
  const EMP = window.EMPLOYEE_LIST;
  const byId = window.EMP_BY_ID;
  const isEdit = !!initialData;
  // employees state holds STAFF IDS (client requirement — names can collide). Legacy records
  // store names, so migrate them to ids on edit.
  const initIds = initialData ? (initialData.employees || []).map(window.firstIdForName).filter(Boolean) : (initialEmployees || []);
  const [employees, setEmployees] = usePromo(initIds);
  const [form, setForm] = usePromo({
    newJobTitle: initialData?.newRole || "", grade: initialData?.grade || "", notch: initialData?.notch || "",
    effectiveDate: initialData?.effectiveDate || "",
    justification: initialData?.justification || "", budgetConfirmed: initialData?.budgetConfirmed || false,
  });
  // Supporting documents: self-managing field reports { keptUrls, newFiles }.
  const [docs, setDocs] = usePromo({ keptUrls: initialData?.docUrls || [], newFiles: [] });
  const [mails, setMails] = usePromo(initialData?.notifyMails || []);
  const set = (k, v) => setForm(s => ({ ...s, [k]: v }));

  // New salary + allowances are AUTO-FETCHED from payroll once grade + notch are chosen.
  const payroll = window.fetchPayroll(form.grade, form.notch);
  const salary = payroll ? payroll.salary : "";
  const allowances = payroll ? payroll.allowances : [];

  const valid = employees.length > 0 && form.newJobTitle && form.grade && form.notch && salary && form.effectiveDate
    && form.justification.trim() && mails.length > 0;

  const submit = () => {
    if (!valid) return;
    onSubmit({
      employees, ...form, salary, allowances,
      docs,
      notifyMails: mails,
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title={isEdit ? "Edit Promotion" : "Create Promotion"}
        subtitle={isEdit ? "Update the promotion details." : "Select staff, set the new role and route for approval."} />

      <FormCard title="Employee Information">
        <Field label="Employee(s)">
          <EmployeeAddSelect value={employees} onChange={setEmployees} employees={EMP} />
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <Field label="New Job Title"><Combobox value={form.newJobTitle} onChange={v => set("newJobTitle", v)} options={LK.jobTitles} placeholder="Select job title" /></Field>
          <Field label="Effective Date"><UI.DatePicker value={form.effectiveDate} onSelect={d => set("effectiveDate", d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }))} placeholder="Pick a date" /></Field>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <Field label="New Job Grade"><Combobox value={form.grade} onChange={v => setForm(s => ({ ...s, grade: v, notch: "" }))} options={LK.jobGrades} placeholder="Select job grade" /></Field>
          <Field label="Notch"><Combobox value={form.notch} onChange={v => set("notch", v)} options={window.notchesForGrade(form.grade)} placeholder={form.grade ? "Select notch" : "Select job grade first"} noDataText="Select a job grade first." /></Field>
        </div>
      </FormCard>

      <FormCard title="Compensation">
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--gray-400)" }}>
          <Icon name="information-line" size={15} color="var(--gray-400)" />
          Auto-fetched from Payroll once a Job Grade and Notch are selected.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <Field label="New Salary">
            <div className="input-wrap" style={{ background: "var(--gray-50)" }}>
              <Icon name="money-dollar-circle-line" size={18} style={{ color: "var(--icon-default)" }} />
              <input value={salary} readOnly placeholder="Select grade & notch" style={{ color: salary ? "var(--gray-900)" : "var(--gray-400)" }} />
            </div>
          </Field>
          <Field label="Allowances">
            {allowances.length === 0
              ? <div className="input-wrap" style={{ background: "var(--gray-50)" }}><span style={{ flex: 1, fontFamily: "var(--font-control)", fontSize: 14, color: "var(--gray-400)" }}>Select grade & notch</span></div>
              : <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {allowances.map(a => (
                    <span key={a.label} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--gray-50)", border: "1px solid var(--gray-200)", borderRadius: 8, padding: "6px 10px", fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--gray-800)" }}>
                      <span style={{ color: "var(--gray-500)" }}>{a.label}</span>
                      <span style={{ fontWeight: 600, color: "var(--gray-900)" }}>{a.value}</span>
                    </span>
                  ))}
                </div>}
          </Field>
        </div>
      </FormCard>

      <FormCard title="Justification & Budget">
        <Field label="Promotion Justification"><Textarea rows={4} value={form.justification} onChange={e => set("justification", e.target.value)} placeholder="Explain the rationale for this promotion…" /></Field>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <UI.Switch checked={form.budgetConfirmed} onCheckedChange={v => set("budgetConfirmed", v)} />
          <span style={{ fontFamily: "var(--font-control)", fontWeight: 500, fontSize: 14, color: "var(--gray-900)" }}>Budget confirmed for this promotion</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label style={{ fontFamily: "var(--font-control)", fontWeight: 500, fontSize: 14, color: "var(--gray-900)" }}>Supporting Documents</label>
          <SupportingDocuments existingUrls={initialData?.docUrls || []} isEditMode={isEdit} onChange={setDocs} maxFiles={8} maxSizeMB={8} />
        </div>
      </FormCard>

      <FormCard title="Notification">
        <EmailInputList label="Notify Departments" description="Department mails only" placeholder="eg. financedept@starret.com"
          emails={mails} onChange={setMails} />
      </FormCard>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
        <Button variant="stroke" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" disabled={!valid} onClick={submit}>{isEdit ? "Save Changes" : "Create Promotion"}</Button>
      </div>
    </div>
  );
}

/* ---------- details — "Promotion Approval" ---------- */
function PromotionDetails({ promo, onApprove, onReject, onUpdate, onToast }) {
  const [rejectOpen, setRejectOpen] = usePromo(false);
  const empInfo = [
    { label: "Employee Name", value: promo.employees.join(", ") },
    { label: "Staff ID(s)", value: promo.staffIds || "—" },
    { label: "Previous Job Title", value: promo.previousRole },
    { label: "New Job Title", value: promo.newRole },
    { label: "Job Grade", value: promo.grade },
    { label: "Notch", value: promo.notch || "—" },
    { label: "Department / Unit", value: promo.deptUnit },
    { label: "Zone", value: promo.zone },
    { label: "Branch", value: promo.branch },
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
            {pending && (
              <React.Fragment>
                <Button variant="stroke" icon="close-line" onClick={() => setRejectOpen(true)} style={{ color: "#DC2626", borderColor: "#F3C2C2" }}>Reject Promotion</Button>
                <Button variant="primary" icon="check-line" onClick={() => onApprove(promo)}>Approve</Button>
              </React.Fragment>
            )}
          </React.Fragment>
        } />

      <div className="card" style={{ padding: 0 }}>
        <DetailCard icon="user-3-line" title="Employee Information"><DetailPanel items={empInfo} tint="gray" cols={4} /></DetailCard>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <DetailCard icon="hand-coin-line" title="Benefits & Allowances">
          {promo.allowances && promo.allowances.length > 0
            ? <DetailPanel items={promo.allowances} tint="cream" cols={3} />
            : <EmptyState compact title="No allowances available" subtitle="No benefits or allowances are attached to this promotion." />}
        </DetailCard>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <DetailCard icon="attachment-2" title="Supporting Documents">
          <SupportingDocumentsList urls={promo.docUrls} emptySubtitle="No supporting documents were attached to this promotion." />
        </DetailCard>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <DetailCard icon="shield-check-line" title="Approval Information"><DetailPanel items={approvalInfo} tint="gray" cols={3} /></DetailCard>
      </div>

      {promo.rejectionReason && (
        <div className="card" style={{ padding: 0 }}>
          <DetailCard icon="error-warning-line" title="Reason For Rejection">
            <div style={{ background: "#FEF2F2", border: "1px solid #FBD9D9", borderRadius: 8, padding: "14px 16px", fontFamily: "var(--font-ui)", fontSize: 14, lineHeight: "22px", color: "var(--gray-800)" }}>{promo.rejectionReason}</div>
          </DetailCard>
        </div>
      )}

      <RejectionReasonModal open={rejectOpen} onClose={() => setRejectOpen(false)}
        title="Reject Promotion" noun="promotion"
        onConfirm={(reason) => { setRejectOpen(false); onReject(promo, reason); }} />
    </div>
  );
}

/* ---------- controller ---------- */
function PromotionsScreen({ onToast, onSubPage, lookups }) {
  const [promos, setPromos] = usePromo(window.PROMOTION_SEED);
  const [segment, setSegment] = usePromo("Request");   // Request (roster) | Approval
  const [rosterQ, setRosterQ] = usePromo("");
  const [approvalSel, setApprovalSel] = usePromo([]);
  const [q, setQ] = usePromo("");
  const [tab, setTab] = usePromo([]);
  const [view, setView] = usePromo({ name: "list" });   // list | add | edit | details
  const [confirm, setConfirm] = usePromo(null);

  usePromoEffect(() => {
    if (!onSubPage) return;
    if (view.name === "add") onSubPage({ trail: [{ label: "Promotions", onClick: () => setView({ name: "list" }) }, { label: "Create Promotion" }] });
    else if (view.name === "edit") onSubPage({ trail: [{ label: "Promotions", onClick: () => setView({ name: "list" }) }, { label: "Edit Promotion" }] });
    else if (view.name === "details") onSubPage({ trail: [{ label: "Promotions", onClick: () => setView({ name: "list" }) }, { label: "Promotion Approval" }] });
    else onSubPage(null);
    return () => onSubPage(null);
  }, [view]);

  const current = view.name === "details" ? promos.find(p => p.id === view.id) : null;
  const editing = view.name === "edit" ? promos.find(p => p.id === view.id) : null;

  const submitPromo = (f) => setConfirm({ kind: view.name === "edit" ? "edit" : "add", form: f, id: view.id });
  const runConfirm = () => {
    const c = confirm;
    if (c.kind === "add") {
      const f = c.form;
      const byId = window.EMP_BY_ID;
      const ids = f.employees;
      const primary = ids[0] ? (byId[ids[0]] || {}) : {};
      const allDocs = SupportingDocuments.resolve(f.docs, "https://files.bistasol.com/promotions/");
      setPromos(ps => [{
        id: promoId(), employees: ids.map(id => (byId[id] || {}).name || id), staffIds: ids.join(", ") || "—",
        previousRole: primary.title || "—", newRole: f.newJobTitle, previousGrade: primary.grade || "—", grade: f.grade, notch: f.notch,
        deptUnit: primary.dept || "—",
        department: primary.dept || "—",
        zone: primary.zone || "—",
        branch: primary.branch || "—",
        previousSalary: primary.salary || "—", salary: f.salary || "—", performanceRating: primary.rating || "—",
        effectiveDate: f.effectiveDate, dateSubmitted: todayPromo(), status: "Pending",
        justification: f.justification, budgetConfirmed: f.budgetConfirmed, allowances: f.allowances || [], docUrls: allDocs, notifyMails: f.notifyMails || [],
        approvedBy: "N/A", approverEmail: "N/A", approvedAt: "N/A", rejectedBy: "N/A", rejectorEmail: "N/A", rejectedAt: "N/A",
      }, ...ps]);
      onToast("Promotion Submitted", { tone: "success" });
      setView({ name: "list" }); setSegment("Approval");
    } else if (c.kind === "edit") {
      const f = c.form;
      const allDocs = SupportingDocuments.resolve(f.docs, "https://files.bistasol.com/promotions/");
      setPromos(ps => ps.map(p => p.id === c.id ? {
        ...p, employees: f.employees.map(id => (window.EMP_BY_ID[id] || {}).name || id), staffIds: f.employees.join(", "),
        newRole: f.newJobTitle, grade: f.grade, notch: f.notch, salary: f.salary, allowances: f.allowances || [],
        effectiveDate: f.effectiveDate,
        justification: f.justification, budgetConfirmed: f.budgetConfirmed, docUrls: allDocs, notifyMails: f.notifyMails || [],
      } : p));
      onToast("Promotion Updated", { tone: "success" });
      setView({ name: "list" });
    } else if (c.kind === "archive") {
      setPromos(ps => ps.filter(p => p.id !== c.row.id));
      onToast("Promotion Archived", { tone: "error" });
      setView({ name: "list" });
    } else if (c.kind === "approve") {
      const now = new Date().toLocaleString("en-US");
      setPromos(ps => ps.map(p => p.id === c.row.id ? { ...p, status: "Approved", approvedBy: "Peter Bosrotsi", approverEmail: "pybosrotsi@gcb.com.gh", approvedAt: now } : p));
      onToast("Promotion Approved", { tone: "success" });
    } else if (c.kind === "bulkApprove") {
      const now = new Date().toLocaleString("en-US");
      setPromos(ps => ps.map(p => c.ids.includes(p.id) ? { ...p, status: "Approved", approvedBy: "Peter Bosrotsi", approverEmail: "pybosrotsi@gcb.com.gh", approvedAt: now } : p));
      onToast(`${c.ids.length} Promotion${c.ids.length > 1 ? "s" : ""} Approved`, { tone: "success" });
      setApprovalSel([]);
    } else if (c.kind === "bulkReject") {
      const now = new Date().toLocaleString("en-US");
      setPromos(ps => ps.map(p => c.ids.includes(p.id) ? { ...p, status: "Declined", rejectedBy: "Peter Bosrotsi", rejectorEmail: "pybosrotsi@gcb.com.gh", rejectedAt: now } : p));
      onToast(`${c.ids.length} Promotion${c.ids.length > 1 ? "s" : ""} Rejected`, { tone: "error" });
      setApprovalSel([]);
    }
    setConfirm(null);
  };

  // reject from the detail page (with a captured reason) — commits immediately
  const rejectWithReason = (promo, reason) => {
    const now = new Date().toLocaleString("en-US");
    setPromos(ps => ps.map(p => p.id === promo.id ? { ...p, status: "Declined", rejectedBy: "Peter Bosrotsi", rejectorEmail: "pybosrotsi@gcb.com.gh", rejectedAt: now, rejectionReason: reason } : p));
    onToast("Promotion Rejected", { tone: "error" });
  };

  const headerAction = (
    <React.Fragment>
      <Button variant="stroke" icon="download-2-line" onClick={() => onToast("Import Promotions — coming soon")}>Import Promotions</Button>
      <Button variant="primary" icon="add-line" onClick={() => setView({ name: "add" })}>Add Promotion</Button>
    </React.Fragment>
  );

  let body;
  if (view.name === "add") body = <PromotionForm lookups={lookups} initialEmployees={view.initialEmployees} onCancel={() => setView({ name: "list" })} onSubmit={submitPromo} />;
  else if (view.name === "edit" && editing) body = <PromotionForm lookups={lookups} initialData={editing} onCancel={() => setView({ name: "list" })} onSubmit={submitPromo} />;
  else if (view.name === "details" && current) body = <PromotionDetails promo={current}
    onApprove={(r) => setConfirm({ kind: "approve", row: r })} onReject={rejectWithReason}
    onUpdate={(partial) => setPromos(ps => ps.map(p => p.id === current.id ? { ...p, ...partial } : p))} onToast={onToast} />;
  else body = (
    segment === "Request"
      ? <PromotionRequest q={rosterQ} setQ={setRosterQ} segment={segment} setSegment={setSegment}
          onCreate={(ids) => setView({ name: "add", initialEmployees: ids })}
          title="Promotions" subtitle="Select staff to promote, and track approval status." headerAction={headerAction} />
      : <PromotionsList rows={promos} q={q} setQ={setQ} tab={tab} setTab={setTab}
          onOpen={(r) => setView({ name: "details", id: r.id })} onEdit={(r) => setView({ name: "edit", id: r.id })} onArchive={(r) => setConfirm({ kind: "archive", row: r })}
          segment={segment} setSegment={setSegment} sel={approvalSel} setSel={setApprovalSel}
          title="Promotions" subtitle="Select staff to promote, and track approval status." headerAction={headerAction} />
  );

  const CONFIRM = {
    add:     { t: "Submit Promotion", m: "submit this promotion", l: "Yes, Submit", i: "check-line", c: "Cancel" },
    edit:    { t: "Save Changes", m: "save these changes", l: "Yes, Save", i: "check-line", c: "Cancel" },
    archive: { t: "Archive Promotion", m: "archive this promotion", l: "Yes, Archive", i: "archive-line", c: "No" },
    approve: { t: "Approve Promotion", m: "approve this promotion", l: "Yes, Approve", i: "check-line", c: "No" },
    bulkApprove: { t: "Approve Promotions", m: "approve", l: "Yes, Approve", i: "check-line", c: "No" },
    bulkReject:  { t: "Reject Promotions", m: "reject", l: "Yes, Reject", i: "close-line", c: "No" },
  };
  const confirmMsg = () => {
    const c = confirm;
    if (c.kind === "bulkApprove" || c.kind === "bulkReject") {
      const k = c.ids.length;
      return `Are you sure you want to ${CONFIRM[c.kind].m} ${k} selected promotion${k > 1 ? "s" : ""}?`;
    }
    return `Are you sure you want to ${CONFIRM[c.kind].m}?`;
  };

  const approvalBarVisible = view.name === "list" && segment === "Approval" && approvalSel.length > 0;

  return (
    <React.Fragment>
      {body}

      {/* floating bulk-approval bar (Approval queue) */}
      <BulkBar count={approvalSel.length} noun="promotions selected" visible={approvalBarVisible} onClear={() => setApprovalSel([])}>
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

Object.assign(window, { PromotionsScreen });
