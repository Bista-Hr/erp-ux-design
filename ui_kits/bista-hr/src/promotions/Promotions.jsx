// BISTA HR · promotions/Promotions — HR Management ▸ Promotions.
//   PromotionsList    : All / Approved / Pending tabs; table of promotions (employee + ID,
//                       grade-title change, effective date, status, approver) + Import/Add.
//   PromotionForm     : full-page "Create Promotion" matching the Electronic Promotion Form
//                       spec — multi-select employee(s) → auto-populated current details,
//                       proposed title/grade, effective date, performance rating, optional
//                       transfer, justification, budget confirmation, supporting documents
//                       (reuses SupportingDocsUploader + FileIcon) and department notify.
//   PromotionDetails  : "Promotion Approval" — Employee Information, Benefits & Allowances,
//                       Supporting Documents and Approval Information, with Approve / Reject
//                       for pending records.
// Every create / approve / reject / archive routes through a ConfirmModal then a toast.
const { useState: usePromo, useEffect: usePromoEffect } = React;

let PROMO_SEQ = 700;
const promoId = () => ++PROMO_SEQ;
const STATUS_VARIANT = { Approved: "approved", Pending: "pending", Declined: "rejected" };
const todayPromo = () => new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

/* ---------- requests list (approval queue) ---------- */
function PromotionsList({ rows, q, setQ, tab, setTab, onOpen, onArchive, segment, setSegment, sel, setSel }) {
  const [menu, setMenu] = usePromo(null);
  const byTab = rows.filter(r => tab.length === 0 || tab.includes(r.status));
  const shown = byTab.filter(r => q === "" || r.employees.join(" ").toLowerCase().includes(q.toLowerCase()) || r.newRole.toLowerCase().includes(q.toLowerCase()));
  const pg = usePaged(shown, 10);
  const pendingShown = shown.filter(r => r.status === "Pending");
  const allPendingSel = pendingShown.length > 0 && pendingShown.every(r => sel.includes(r.id));
  const toggle = (id) => setSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll = () => setSel(allPendingSel ? sel.filter(id => !pendingShown.some(r => r.id === id)) : [...new Set([...sel, ...pendingShown.map(r => r.id)])]);
  return (
    <div className="card" style={{ overflow: "visible", padding: "var(--card-pad, 24px)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 18, flexWrap: "wrap" }}>
        <Segmented items={["Request", "Approval"]} active={segment} onChange={setSegment} />
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div className="input-wrap" style={{ width: 260, padding: "9px 12px" }}>
            <Icon name="search-2-line" size={18} style={{ color: "var(--icon-default)" }} />
            <input placeholder="Search promotions…" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <StatusFilter value={tab} onChange={setTab} />
        </div>
      </div>

      <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
        {rows.length === 0
          ? <EmptyState title="No promotions yet" subtitle="Select staff from the Promote tab to raise a promotion." />
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
                    <td style={{ position: "relative", textAlign: "right" }} onClick={e => e.stopPropagation()}>
                      <button className="btn btn-icon btn-ghost" style={{ width: 28, height: 28, padding: 0 }} onClick={() => setMenu(menu === r.id ? null : r.id)}>
                        <Icon name="more-fill" size={18} color="var(--gray-400)" />
                      </button>
                      {menu === r.id && (
                        <div onMouseLeave={() => setMenu(null)} style={{ position: "absolute", right: 16, top: 40, zIndex: 20, background: "#fff",
                          borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-pop)", padding: 6, minWidth: 170, display: "flex", flexDirection: "column" }}>
                          <button className="menu-item" onClick={() => { setMenu(null); onOpen(r); }}><Icon name="eye-line" size={16} />View Details</button>
                          <button className="menu-item danger" onClick={() => { setMenu(null); onArchive(r); }}><Icon name="archive-line" size={16} />Archive Promotion</button>
                        </div>
                      )}
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
  );
}

/* ---------- assign promotion (full page) — one promotion target → many employees ---------- */
function BulkPromoteForm({ names, lookups, onCancel, onSubmit }) {
  const LK = lookups || window.LOOKUPS;
  const DIR = window.EMPLOYEE_DIRECTORY;
  const [title, setTitle] = usePromo("");
  const [grade, setGrade] = usePromo("");
  const [date, setDate] = usePromo("");
  const [rating, setRating] = usePromo("");
  const [reason, setReason] = usePromo("");
  const [docs, setDocs] = usePromo([]);
  const valid = title && grade && date && reason.trim();
  const multi = names.length > 1;
  const sectionTitle = (t, sub) => (
    <div style={{ marginTop: 4 }}>
      <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 18, color: "var(--gray-900)" }}>{t}</div>
      {sub && <div className="bh-body" style={{ marginTop: 2 }}>{sub}</div>}
    </div>
  );
  return (
    <div className="card" style={{ padding: "var(--card-pad, 24px)", overflow: "visible" }}>
      <div style={{ marginBottom: 8 }}>
        <div className="bh-h2" style={{ fontSize: 24 }}>Assign Promotion</div>
        <div className="bh-body" style={{ marginTop: 4 }}>Assign one promotion target to {names.length} selected employee{multi ? "s" : ""}. Each becomes a pending request.</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 880 }}>
        {sectionTitle("Selected Employees", `${names.length} employee${multi ? "s" : ""} will receive this promotion.`)}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
          {names.map(n => {
            const e = DIR[n] || {};
            return (
              <div key={n} style={{ display: "flex", alignItems: "center", gap: 12, border: "1px solid var(--border)", borderRadius: 10, padding: "10px 12px", minWidth: 0 }}>
                <Avatar name={n} size={36} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 14, color: "var(--gray-900)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n}</div>
                  <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-400)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.staffId} · {e.title}{e.grade ? ` · ${e.grade}` : ""}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ height: 1, background: "var(--border)" }} />
        {sectionTitle("Promotion Details")}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <Field label="Proposed Job Title"><Combobox value={title} onChange={setTitle} options={LK.jobTitles} placeholder="Select job title" /></Field>
          <Field label="Proposed Job Grade"><Combobox value={grade} onChange={setGrade} options={LK.jobGrades} placeholder="Select job grade" /></Field>
          <Field label="Proposed Effective Date"><Input type="date" value={date} onChange={e => setDate(e.target.value)} /></Field>
          <Field label="Performance Rating" optional><Combobox value={rating} onChange={setRating} options={LK.performanceRatings} placeholder="Select rating" /></Field>
        </div>

        <div style={{ height: 1, background: "var(--border)" }} />
        {sectionTitle("Justification & Validation")}
        <Field label="Promotion Justification"><Textarea rows={3} value={reason} onChange={e => setReason(e.target.value)} placeholder="Explain the business justification for this promotion…" /></Field>

        <div style={{ height: 1, background: "var(--border)" }} />
        {sectionTitle("Supporting Documents")}
        <SupportingDocsUploader files={docs} onChange={setDocs} />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
        <Button variant="stroke" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" icon="arrow-up-circle-line" disabled={!valid} onClick={() => valid && onSubmit({ names, title, grade, date, rating, reason, documents: docs })}>Assign Promotion</Button>
      </div>
    </div>
  );
}

/* ---------- employee roster (checkboxes; bulk action lives in the floating bar) ---------- */
function PromotionRoster({ q, setQ, selected, setSelected, onPromoteOne, segment, setSegment }) {
  const DIR = window.EMPLOYEE_DIRECTORY;
  const names = window.EMPLOYEE_NAMES;
  const [menu, setMenu] = usePromo(null);
  const shown = names.filter(n => {
    if (q === "") return true;
    const e = DIR[n] || {};
    return `${n} ${e.staffId} ${e.title} ${e.dept} ${e.grade}`.toLowerCase().includes(q.toLowerCase());
  });
  const toggle = (n) => setSelected(s => s.includes(n) ? s.filter(x => x !== n) : [...s, n]);
  const allShownSelected = shown.length > 0 && shown.every(n => selected.includes(n));
  const toggleAll = () => setSelected(allShownSelected ? selected.filter(n => !shown.includes(n)) : [...new Set([...selected, ...shown])]);
  const pg = usePaged(shown, 10);
  return (
    <div className="card" style={{ overflow: "visible", padding: "var(--card-pad, 24px)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 18, flexWrap: "wrap" }}>
        <Segmented items={["Request", "Approval"]} active={segment} onChange={setSegment} />
        <div className="input-wrap" style={{ width: 300, padding: "9px 12px" }}>
          <Icon name="search-2-line" size={18} style={{ color: "var(--icon-default)" }} />
          <input placeholder="Search staff…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
      </div>
      <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
        <table className="bh">
          <thead><tr>
            <th style={{ width: 44 }}><Checkbox checked={allShownSelected} onChange={toggleAll} /></th>
            <th>Full Name</th><th>Employee ID</th><th>Current Job Title</th><th>Current Grade</th><th>Department</th><th style={{ width: 48 }}></th>
          </tr></thead>
          <tbody>
            {pg.pageItems.map(n => {
              const e = DIR[n] || {};
              const on = selected.includes(n);
              return (
                <tr key={n} className="jt-roster-row" style={{ cursor: "pointer", background: on ? "#FFFBEB" : undefined }} onClick={() => toggle(n)}>
                  <td onClick={ev => ev.stopPropagation()}><Checkbox checked={on} onChange={() => toggle(n)} /></td>
                  <td>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                      <Avatar name={n} size={32} />
                      <span style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: 500, color: "var(--gray-900)" }}>{n}</span>
                        <span style={{ fontSize: 12, color: "var(--gray-400)" }}>{e.email || ""}</span>
                      </span>
                    </span>
                  </td>
                  <td>{e.staffId}</td>
                  <td>{e.title}</td>
                  <td>{e.grade}</td>
                  <td>{e.dept}</td>
                  <td style={{ position: "relative", textAlign: "right" }} onClick={ev => ev.stopPropagation()}>
                    <button className="btn btn-icon btn-ghost" style={{ width: 28, height: 28, padding: 0 }} onClick={() => setMenu(menu === n ? null : n)}>
                      <Icon name="more-fill" size={18} color="var(--gray-400)" />
                    </button>
                    {menu === n && (
                      <div onMouseLeave={() => setMenu(null)} style={{ position: "absolute", right: 16, top: 40, zIndex: 20, background: "#fff",
                        borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-pop)", padding: 6, minWidth: 190, display: "flex", flexDirection: "column" }}>
                        <button className="menu-item" onClick={() => { setMenu(null); onPromoteOne(n); }}><Icon name="arrow-up-circle-line" size={16} />Promote (full form)</button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {shown.length === 0 && <tr><td colSpan={7} style={{ padding: 0 }}><EmptyState compact title="No results found" subtitle="No staff matches your search." /></td></tr>}
          </tbody>
        </table>
      </div>
      {shown.length > 0 && <div style={{ marginTop: 4 }}><Pagination page={pg.page} pages={pg.pages} onPrev={pg.prev} onNext={pg.next} /></div>}
    </div>
  );
}

/* ---------- create form (full page) ---------- */
function PromotionForm({ lookups, initialEmployees, onCancel, onSubmit }) {
  const LK = lookups || window.LOOKUPS;
  const DIR = window.EMPLOYEE_DIRECTORY;
  const empOptions = window.EMPLOYEE_NAMES;
  const [employees, setEmployees] = usePromo(initialEmployees || []);
  const [form, setForm] = usePromo({ newJobTitle: "", grade: "", effectiveDate: "", salary: "", performanceRating: "",
    includeTransfer: false, newBranch: "", newZone: "", newDepartment: "", justification: "", budgetConfirmed: false });
  const [docs, setDocs] = usePromo([]);
  const [approvers, setApprovers] = usePromo([]);
  const [mails, setMails] = usePromo([""]);
  const set = (k, v) => setForm(s => ({ ...s, [k]: v }));

  // auto-populate from the first selected employee (mirrors the spec's auto-populated fields)
  const primary = employees[0] ? DIR[employees[0]] : null;
  usePromoEffect(() => {
    if (primary && !form.performanceRating) set("performanceRating", primary.rating);
  }, [employees]);
  const staffIds = employees.map(n => (DIR[n] || {}).staffId).filter(Boolean).join(", ");
  // approvers are chosen from staff, excluding the employees being promoted (no self-approval)
  const approverOptions = empOptions.filter(n => !employees.includes(n));
  const autoItems = primary ? [
    { label: "Staff ID(s)", value: staffIds },
    { label: "Current Job Title", value: primary.title },
    { label: "Current Grade", value: primary.grade },
    { label: "Department / Unit", value: primary.dept },
    { label: "Zone", value: primary.zone },
    { label: "Branch", value: primary.branch },
    { label: "Current Salary", value: primary.salary },
  ] : [];

  const valid = employees.length > 0 && form.newJobTitle && form.grade && form.effectiveDate
    && form.performanceRating && form.justification.trim() && form.budgetConfirmed && docs.length > 0 && approvers.length > 0;

  const sectionTitle = (t, sub) => (
    <div style={{ marginTop: 4 }}>
      <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 18, color: "var(--gray-900)" }}>{t}</div>
      {sub && <div className="bh-body" style={{ marginTop: 2 }}>{sub}</div>}
    </div>
  );

  return (
    <div className="card" style={{ padding: "var(--card-pad, 24px)", overflow: "visible" }}>
      <div style={{ marginBottom: 8 }}>
        <div className="bh-h2" style={{ fontSize: 24 }}>Create Promotion</div>
        <div className="bh-body" style={{ marginTop: 4 }}>Create a new promotion record. Request type: <strong style={{ color: "var(--gray-700)" }}>Employee Promotion</strong>.</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 880 }}>
        {sectionTitle("Employee Information")}
        <Field label="Employee Name(s)">
          <MultiSelectCombobox value={employees} onChange={setEmployees} options={empOptions} placeholder="Select one or more employees" avatar />
        </Field>

        {primary && (
          <div>
            <div style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--gray-400)", marginBottom: 6 }}>Auto-populated from employee record</div>
            <DetailPanel items={autoItems} tint="gray" cols={4} />
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <Field label="Proposed Job Title"><Combobox value={form.newJobTitle} onChange={v => set("newJobTitle", v)} options={LK.jobTitles} placeholder="Select a new job title" /></Field>
          <Field label="Proposed Job Grade"><Combobox value={form.grade} onChange={v => set("grade", v)} options={LK.jobGrades} placeholder="Select a new job grade" /></Field>
          <Field label="Proposed Effective Date"><Input type="date" value={form.effectiveDate} onChange={e => set("effectiveDate", e.target.value)} /></Field>
          <Field label="New Salary"><Input placeholder="GHS 0.00" value={form.salary} onChange={e => set("salary", e.target.value)} /></Field>
          <Field label="Performance Rating"><Combobox value={form.performanceRating} onChange={v => set("performanceRating", v)} options={LK.performanceRatings} placeholder="Select rating" /></Field>
        </div>

        <Checkbox checked={form.includeTransfer} onChange={v => set("includeTransfer", v)} label="Include transfer (new branch / zone / department)" />
        {form.includeTransfer && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
            <Field label="New Branch"><Combobox value={form.newBranch} onChange={v => set("newBranch", v)} options={LK.branches} placeholder="Select branch" /></Field>
            <Field label="New Zone"><Combobox value={form.newZone} onChange={v => set("newZone", v)} options={LK.zones} placeholder="Select zone" /></Field>
            <Field label="New Department"><Combobox value={form.newDepartment} onChange={v => set("newDepartment", v)} options={LK.departments} placeholder="Select department" /></Field>
          </div>
        )}

        <div style={{ height: 1, background: "var(--border)" }} />
        {sectionTitle("Justification & Validation")}
        <Field label="Promotion Justification"><Textarea rows={4} value={form.justification} onChange={e => set("justification", e.target.value)} placeholder="Explain the business justification for this promotion…" /></Field>
        <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px", background: "var(--gray-50)" }}>
          <Checkbox checked={form.budgetConfirmed} onChange={v => set("budgetConfirmed", v)} label="Budget / Grade Confirmation — I confirm budget and grade availability for this promotion." />
        </div>

        <div style={{ height: 1, background: "var(--border)" }} />
        {sectionTitle("Supporting Documents", "Upload promotion recommendation, performance summary and approvals (required).")}
        <SupportingDocsUploader files={docs} onChange={setDocs} />

        <div style={{ height: 1, background: "var(--border)" }} />
        {sectionTitle("Approval Routing", "Select the approver(s) who must sign off on this promotion.")}
        <Field label="Approvers">
          <MultiSelectCombobox value={approvers} onChange={setApprovers} options={approverOptions} placeholder="Select one or more approvers" avatar />
        </Field>

        <div style={{ height: 1, background: "var(--border)" }} />
        {sectionTitle("Notification")}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={{ fontFamily: "var(--font-control)", fontWeight: 500, fontSize: 14, color: "var(--gray-900)" }}>Notify Departments <span style={{ color: "var(--gray-400)", fontWeight: 400 }}>(Department mails only)</span></label>
          {mails.map((m, i) => (
            <div key={i} className="input-wrap">
              <input placeholder="e.g. HR, Finance, it@company.com" value={m} onChange={e => setMails(ms => ms.map((x, j) => j === i ? e.target.value : x))} />
            </div>
          ))}
          <button onClick={() => setMails(ms => [...ms, ""])} style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 6,
            border: 0, background: "none", cursor: "pointer", padding: 0, fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 13, color: "var(--brand-yellow-dark)" }}>
            <Icon name="add-line" size={16} color="var(--brand-yellow-dark)" />Add another mail / department
          </button>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
        <Button variant="stroke" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" disabled={!valid} onClick={() => valid && onSubmit({ employees, primary, staffIds, ...form, approvers, documents: docs, notifyMails: mails.filter(Boolean) })}>Create Promotion</Button>
      </div>
    </div>
  );
}

/* ---------- details — "Promotion Approval" ---------- */
function PromotionDetails({ promo, onApprove, onReject, onUpdate, onToast }) {
  const empInfo = [
    { label: "Employee Name", value: promo.employees.join(", ") },
    { label: "Previous Job Title", value: promo.previousRole },
    { label: "New Job Title", value: promo.newRole },
    { label: "Job Grade", value: promo.grade },
    { label: "Department / Unit", value: promo.deptUnit },
    { label: "Zone", value: promo.zone },
    { label: "Branch", value: promo.branch },
    { label: "Salary", value: promo.salary },
    { label: "Performance Rating", value: promo.performanceRating },
    { label: "Effective Date", value: promo.effectiveDate },
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
                <Button variant="stroke" icon="close-line" onClick={() => onReject(promo)}>Reject</Button>
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
          {promo.documents && promo.documents.length > 0
            ? <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {promo.documents.map((doc, i) => (
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
        <DetailCard icon="user-follow-line" title="Approvers">
          {promo.approvers && promo.approvers.length > 0
            ? <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {promo.approvers.map(n => (
                  <span key={n} style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid var(--border)", borderRadius: 999, padding: "5px 12px 5px 5px" }}>
                    <Avatar name={n} size={26} />
                    <span style={{ fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 13.5, color: "var(--gray-900)" }}>{n}</span>
                  </span>
                ))}
              </div>
            : <EmptyState compact title="No approvers" subtitle="No approvers were assigned to this promotion." />}
        </DetailCard>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <DetailCard icon="shield-check-line" title="Approval Information"><DetailPanel items={approvalInfo} tint="gray" cols={3} /></DetailCard>
      </div>

      <WorkflowPanel workflowType="Promotion" record={promo} onChange={(partial) => onUpdate(partial)} onToast={onToast} />
    </div>
  );
}

/* ---------- controller ---------- */
function PromotionsScreen({ onToast, onSubPage, lookups }) {
  const DIR = window.EMPLOYEE_DIRECTORY;
  const [promos, setPromos] = usePromo(window.PROMOTION_SEED);
  const [segment, setSegment] = usePromo("Request");   // Request (roster) | Approval
  const [rosterQ, setRosterQ] = usePromo("");
  const [selected, setSelected] = usePromo([]);
  const [approvalSel, setApprovalSel] = usePromo([]);
  const [lastCount, setLastCount] = usePromo(0);
  const [q, setQ] = usePromo("");
  const [tab, setTab] = usePromo([]);
  const [view, setView] = usePromo({ name: "list" });   // list | add | details
  const [confirm, setConfirm] = usePromo(null);

  usePromoEffect(() => {
    if (!onSubPage) return;
    if (view.name === "add") onSubPage({ trail: [{ label: "Promotions", onClick: () => setView({ name: "list" }) }, { label: "Create Promotion" }] });
    else if (view.name === "details") onSubPage({ trail: [{ label: "Promotions", onClick: () => setView({ name: "list" }) }, { label: "Promotion Approval" }] });
    else onSubPage(null);
    return () => onSubPage(null);
  }, [view]);

  usePromoEffect(() => { if (selected.length) setLastCount(selected.length); }, [selected.length]);

  // keep the open details view in sync after approve/reject
  const current = view.name === "details" ? promos.find(p => p.id === view.id) : null;

  const submitPromo = (f) => setConfirm({ kind: "add", form: f });
  const submitBulk = (f) => setConfirm({ kind: "bulk", form: f });
  const runConfirm = () => {
    const c = confirm;
    if (c.kind === "add") {
      const f = c.form, p = f.primary || {};
      setPromos(ps => [{
        id: promoId(), employees: f.employees, staffIds: f.staffIds || "—",
        previousRole: p.title || "—", newRole: f.newJobTitle, previousGrade: p.grade || "—", grade: f.grade,
        deptUnit: f.includeTransfer && f.newDepartment ? f.newDepartment : (p.dept || "—"),
        department: f.includeTransfer && f.newDepartment ? f.newDepartment : (p.dept || "—"),
        zone: f.includeTransfer && f.newZone ? f.newZone : (p.zone || "—"),
        branch: f.includeTransfer && f.newBranch ? f.newBranch : (p.branch || "—"),
        previousSalary: p.salary || "—", salary: f.salary || "—", performanceRating: f.performanceRating,
        effectiveDate: f.effectiveDate, dateSubmitted: todayPromo(), status: "Pending",
        justification: f.justification, allowances: [], documents: f.documents, approvers: f.approvers || [],
        approvedBy: "N/A", approverEmail: "N/A", approvedAt: "N/A", rejectedBy: "N/A", rejectorEmail: "N/A", rejectedAt: "N/A",
      }, ...ps]);
      onToast("Promotion Submitted", { tone: "success" });
      setView({ name: "list" });
    } else if (c.kind === "bulk") {
      const f = c.form;
      const recs = f.names.map(n => {
        const p = DIR[n] || {};
        return {
          id: promoId(), employees: [n], staffIds: p.staffId || "—",
          previousRole: p.title || "—", newRole: f.title, previousGrade: p.grade || "—", grade: f.grade,
          deptUnit: p.dept || "—", department: p.dept || "—", zone: p.zone || "—", branch: p.branch || "—",
          previousSalary: p.salary || "—", salary: p.salary || "—", performanceRating: f.rating || p.rating || "—",
          effectiveDate: f.date, dateSubmitted: todayPromo(), status: "Pending",
          justification: f.reason, allowances: [], documents: f.documents || [],
          approvedBy: "N/A", approverEmail: "N/A", approvedAt: "N/A", rejectedBy: "N/A", rejectorEmail: "N/A", rejectedAt: "N/A",
        };
      });
      setPromos(ps => [...recs, ...ps]);
      onToast(f.names.length > 1 ? `Promotion Raised for ${f.names.length} Employees` : "Promotion Raised", { tone: "success" });
      setSelected([]); setView({ name: "list" }); setSegment("Approval");
    } else if (c.kind === "archive") {
      setPromos(ps => ps.filter(p => p.id !== c.row.id));
      onToast("Promotion Archived", { tone: "error" });
      setView({ name: "list" });
    } else if (c.kind === "approve") {
      const now = new Date().toLocaleString("en-US");
      const stamp = window.wfNow();
      setPromos(ps => ps.map(p => p.id === c.row.id ? { ...p, status: "Approved", wfStatus: "Approved", approvedBy: "Peter Bosrotsi", approverEmail: "pybosrotsi@gcb.com.gh", approvedAt: now,
        audit: [...(p.audit || []), { action: "Promotion approved", decision: "Approved", actor: "Peter Bosrotsi (Head P&C)", at: stamp }] } : p));
      onToast("Promotion Approved", { tone: "success" });
    } else if (c.kind === "reject") {
      const now = new Date().toLocaleString("en-US");
      const stamp = window.wfNow();
      setPromos(ps => ps.map(p => p.id === c.row.id ? { ...p, status: "Declined", wfStatus: "Declined", rejectedBy: "Peter Bosrotsi", rejectorEmail: "pybosrotsi@gcb.com.gh", rejectedAt: now,
        audit: [...(p.audit || []), { action: "Promotion declined", decision: "Declined", actor: "Peter Bosrotsi (Head P&C)", at: stamp }] } : p));
      onToast("Promotion Rejected", { tone: "error" });
    } else if (c.kind === "bulkApprove") {
      const now = new Date().toLocaleString("en-US");
      const ids = c.ids;
      setPromos(ps => ps.map(p => ids.includes(p.id) ? { ...p, status: "Approved", approvedBy: "Peter Bosrotsi", approverEmail: "pybosrotsi@gcb.com.gh", approvedAt: now } : p));
      onToast(`${ids.length} Promotion${ids.length > 1 ? "s" : ""} Approved`, { tone: "success" });
      setApprovalSel([]);
    } else if (c.kind === "bulkReject") {
      const now = new Date().toLocaleString("en-US");
      const ids = c.ids;
      setPromos(ps => ps.map(p => ids.includes(p.id) ? { ...p, status: "Declined", rejectedBy: "Peter Bosrotsi", rejectorEmail: "pybosrotsi@gcb.com.gh", rejectedAt: now } : p));
      onToast(`${ids.length} Promotion${ids.length > 1 ? "s" : ""} Rejected`, { tone: "error" });
      setApprovalSel([]);
    }
    setConfirm(null);
  };

  let body;
  if (view.name === "add") body = <PromotionForm lookups={lookups} initialEmployees={view.initialEmployees} onCancel={() => setView({ name: "list" })} onSubmit={submitPromo} />;
  else if (view.name === "details" && current) body = <PromotionDetails promo={current}
    onApprove={(r) => setConfirm({ kind: "approve", row: r })} onReject={(r) => setConfirm({ kind: "reject", row: r })}
    onUpdate={(partial) => setPromos(ps => ps.map(p => p.id === current.id ? { ...p, ...partial } : p))} onToast={onToast} />;
  else body = (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title="Promotions" subtitle="Promote or bulk-promote staff, and track approval status."
        actions={
          <Button variant="stroke" icon="download-2-line" onClick={() => onToast("Import Promotions — coming soon")}>Import Promotions</Button>
        } />
      {segment === "Request"
        ? <PromotionRoster q={rosterQ} setQ={setRosterQ} selected={selected} setSelected={setSelected}
            onPromoteOne={(n) => setView({ name: "add", initialEmployees: [n] })} segment={segment} setSegment={setSegment} />
        : <PromotionsList rows={promos} q={q} setQ={setQ} tab={tab} setTab={setTab}
            onOpen={(r) => setView({ name: "details", id: r.id })} onArchive={(r) => setConfirm({ kind: "archive", row: r })}
            segment={segment} setSegment={setSegment} sel={approvalSel} setSel={setApprovalSel} />}
    </div>
  );

  const CONFIRM = {
    add:     { t: "Submit Promotion", m: "submit this promotion", l: "Yes, Submit", i: "check-line", c: "Cancel" },
    bulk:    { t: "Raise Promotion", m: "raise this promotion", l: "Yes, Promote", i: "arrow-up-circle-line", c: "Cancel" },
    archive: { t: "Archive Promotion", m: "archive this promotion", l: "Yes, Archive", i: "archive-line", c: "No" },
    approve: { t: "Approve Promotion", m: "approve this promotion", l: "Yes, Approve", i: "check-line", c: "No" },
    reject:  { t: "Reject Promotion", m: "reject this promotion", l: "Yes, Reject", i: "close-line", c: "No" },
    bulkApprove: { t: "Approve Promotions", m: "approve", l: "Yes, Approve", i: "check-line", c: "No" },
    bulkReject:  { t: "Reject Promotions", m: "reject", l: "Yes, Reject", i: "close-line", c: "No" },
  };
  const confirmMsg = () => {
    const c = confirm;
    if (c.kind === "bulk") {
      const k = c.form.names.length;
      return k > 1 ? `Are you sure you want to raise this promotion for ${k} employees? Each will be pending approval.`
        : "Are you sure you want to raise this promotion? It will be pending approval.";
    }
    if (c.kind === "bulkApprove" || c.kind === "bulkReject") {
      const k = c.ids.length;
      return `Are you sure you want to ${CONFIRM[c.kind].m} ${k} selected promotion${k > 1 ? "s" : ""}?`;
    }
    return `Are you sure you want to ${CONFIRM[c.kind].m}?`;
  };

  const approvalBarVisible = view.name === "list" && segment === "Approval" && approvalSel.length > 0;

  const barVisible = view.name === "list" && segment === "Request" && selected.length > 0;
  const barCount = selected.length || lastCount;

  return (
    <React.Fragment>
      {body}

      {/* floating bulk-promote bar */}
      <div className={`jt-assignbar ${barVisible ? "" : "hidden"}`}>
        <span className="jt-count" key={barCount}>{barCount}</span>
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--gray-700)" }}>staff selected</span>
        <button className="jt-clear" onClick={() => setSelected([])}>Clear</button>
        <Button variant="primary" icon="arrow-up-circle-line" onClick={() => setView({ name: "add", initialEmployees: selected })}>Create Promotion</Button>
      </div>

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
