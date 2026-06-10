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
    documents: [TR_DOC("Transfer Recommendation.pdf", "PDF", "1.1 MB", "Reference Letter"), TR_DOC("Handover Checklist.docx", "DOCX", "92 KB", "Other")],
    approvedBy: "Peter Bosrotsi", approverEmail: "pybosrotsi@gcb.com.gh", approvedAt: "5/16/2026, 2:08:34 PM",
    rejectedBy: "N/A", rejectorEmail: "N/A", rejectedAt: "N/A" },
  { id: 2, employees: ["Abass Abdul Mumin"], staffIds: "EMP-17431", classification: "Intra-Departmental",
    previousLocation: "Cape Coast", newLocation: "Takoradi", previousDept: "Operations", newDept: "Operations",
    previousUnit: "Branch Support", currentTitle: "Branch Support", newTitle: "",
    grade: "Grade 3", zone: "Central Zones",
    effectiveDate: "May 28, 2026", dateSubmitted: "May 10, 2026", status: "Approved",
    reason: "Relocation to cover staffing gap at the Takoradi branch within the same department.",
    documents: [TR_DOC("Approval Memo.pdf", "PDF", "640 KB", "Contract")],
    approvedBy: "Peter Bosrotsi", approverEmail: "pybosrotsi@gcb.com.gh", approvedAt: "5/12/2026, 10:22:10 AM",
    rejectedBy: "N/A", rejectorEmail: "N/A", rejectedAt: "N/A" },
  { id: 3, employees: ["Aba Odum"], staffIds: "EMP-18389", classification: "Inter-Departmental",
    previousLocation: "Ridge", newLocation: "Tema", previousDept: "Information Technology", newDept: "Operations",
    previousUnit: "Data & Analytics", currentTitle: "Data Scientist", newTitle: "Analytics Lead",
    grade: "Grade 5", zone: "Accra West",
    effectiveDate: "Jul 08, 2026", dateSubmitted: "May 18, 2026", status: "Pending",
    reason: "Cross-functional move to embed analytics capability within the Operations department.",
    documents: [TR_DOC("Business Case.pdf", "PDF", "2.1 MB", "Other")],
    approvedBy: "N/A", approverEmail: "N/A", approvedAt: "N/A",
    rejectedBy: "N/A", rejectorEmail: "N/A", rejectedAt: "N/A" },
  { id: 4, employees: ["Franklin Brobbey"], staffIds: "EMP-10231", classification: "Intra-Departmental",
    previousLocation: "Accra", newLocation: "Kumasi", previousDept: "Finance", newDept: "Finance",
    previousUnit: "Accounts", currentTitle: "Accountant", newTitle: "",
    grade: "Grade 2", zone: "South Zone",
    effectiveDate: "May 28, 2026", dateSubmitted: "May 09, 2026", status: "Pending",
    reason: "Employee request to transfer closer to family; role available at the Kumasi branch.",
    documents: [TR_DOC("Employee Request.docx", "DOCX", "64 KB", "Other"), TR_DOC("ID Verification.jpg", "JPG", "1.4 MB", "ID Card")],
    approvedBy: "N/A", approverEmail: "N/A", approvedAt: "N/A",
    rejectedBy: "N/A", rejectorEmail: "N/A", rejectedAt: "N/A" },
  { id: 5, employees: ["Samuel Boateng"], staffIds: "EMP-11002", classification: "Inter-Departmental",
    previousLocation: "Kumasi", newLocation: "Accra", previousDept: "Marketing", newDept: "Operations",
    previousUnit: "Sales", currentTitle: "Sales Officer", newTitle: "Retail Officer",
    grade: "Grade 1", zone: "West Zone",
    effectiveDate: "Apr 30, 2026", dateSubmitted: "Apr 12, 2026", status: "Declined",
    reason: "Proposed move to Retail Operations; deferred pending replacement at current branch.",
    documents: [TR_DOC("Transfer Proposal.pdf", "PDF", "210 KB", "Other")],
    approvedBy: "N/A", approverEmail: "N/A", approvedAt: "N/A",
    rejectedBy: "Peter Bosrotsi", rejectorEmail: "pybosrotsi@gcb.com.gh", rejectedAt: "4/18/2026, 9:14:02 AM" },
];

/* ---------- requests list (approval queue) ---------- */
function TransfersList({ rows, q, setQ, tab, setTab, onOpen, onArchive, segment, setSegment, sel, setSel }) {
  const [menu, setMenu] = useTr(null);
  const byTab = rows.filter(r => tab === "All" || r.status === tab);
  const shown = byTab.filter(r => q === "" || r.employees.join(" ").toLowerCase().includes(q.toLowerCase()) || r.newLocation.toLowerCase().includes(q.toLowerCase()));
  const pg = usePaged(shown, 10);
  const pendingShown = shown.filter(r => r.status === "Pending");
  const allPendingSel = pendingShown.length > 0 && pendingShown.every(r => sel.includes(r.id));
  const toggle = (id) => setSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll = () => setSel(allPendingSel ? sel.filter(id => !pendingShown.some(r => r.id === id)) : [...new Set([...sel, ...pendingShown.map(r => r.id)])]);
  return (
    <div className="card" style={{ overflow: "visible", padding: "var(--card-pad, 24px)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 18, flexWrap: "wrap" }}>
        <Segmented items={["Requests", "Approvals"]} active={segment} onChange={setSegment} />
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <Segmented items={["All", "Approved", "Pending"]} active={tab} onChange={setTab} />
          <div className="input-wrap" style={{ width: 260, padding: "9px 12px" }}>
            <Icon name="search-2-line" size={18} style={{ color: "var(--icon-default)" }} />
            <input placeholder="Search transfers…" value={q} onChange={e => setQ(e.target.value)} />
          </div>
        </div>
      </div>

      <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
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
                    <td style={{ position: "relative", textAlign: "right" }} onClick={e => e.stopPropagation()}>
                      <button className="btn btn-icon btn-ghost" style={{ width: 28, height: 28, padding: 0 }} onClick={() => setMenu(menu === r.id ? null : r.id)}>
                        <Icon name="more-fill" size={18} color="var(--gray-400)" />
                      </button>
                      {menu === r.id && (
                        <div onMouseLeave={() => setMenu(null)} style={{ position: "absolute", right: 16, top: 40, zIndex: 20, background: "#fff",
                          borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-pop)", padding: 6, minWidth: 170, display: "flex", flexDirection: "column" }}>
                          <button className="menu-item" onClick={() => { setMenu(null); onOpen(r); }}><Icon name="eye-line" size={16} />View Details</button>
                          <button className="menu-item danger" onClick={() => { setMenu(null); onArchive(r); }}><Icon name="archive-line" size={16} />Archive Transfer</button>
                        </div>
                      )}
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
  );
}

/* ---------- bulk transfer modal (one transfer target → many employees) ---------- */
function BulkTransferForm({ names, lookups, onCancel, onSubmit }) {
  const LK = lookups || window.LOOKUPS;
  const DIR = window.EMPLOYEE_DIRECTORY;
  const [classification, setClassification] = useTr("");
  const [location, setLocation] = useTr("");
  const [department, setDepartment] = useTr("");
  const [date, setDate] = useTr("");
  const [reason, setReason] = useTr("");
  const [docs, setDocs] = useTr([]);
  const isInter = classification === "Inter-Departmental";
  const setClass = (v) => { setClassification(v); if (v !== "Inter-Departmental") setDepartment(""); };
  const valid = classification && location && date && reason.trim() && (!isInter || department);
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
        <div className="bh-h2" style={{ fontSize: 24 }}>Assign Transfer</div>
        <div className="bh-body" style={{ marginTop: 4 }}>Assign one transfer target to {names.length} selected employee{multi ? "s" : ""}. Each becomes a pending request.</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 880 }}>
        {sectionTitle("Selected Employees", `${names.length} employee${multi ? "s" : ""} will be transferred.`)}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
          {names.map(n => {
            const e = DIR[n] || {};
            return (
              <div key={n} style={{ display: "flex", alignItems: "center", gap: 12, border: "1px solid var(--border)", borderRadius: 10, padding: "10px 12px", minWidth: 0 }}>
                <Avatar name={n} size={36} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 14, color: "var(--gray-900)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n}</div>
                  <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-400)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.staffId} · {e.dept}{e.branch ? ` · ${e.branch}` : ""}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ height: 1, background: "var(--border)" }} />
        {sectionTitle("Transfer Details")}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <Field label="Transfer Classification"><Combobox value={classification} onChange={setClass} options={TRANSFER_CLASSES} placeholder="Select classification" /></Field>
          <Field label="Proposed / New Location"><Combobox value={location} onChange={setLocation} options={LK.branches} placeholder="Select new location / branch" /></Field>
          {isInter && <Field label="New Department"><Combobox value={department} onChange={setDepartment} options={LK.departments} placeholder="Select new department" /></Field>}
          <Field label="Proposed Effective Transfer Date"><Input type="date" value={date} onChange={e => setDate(e.target.value)} /></Field>
        </div>

        <div style={{ height: 1, background: "var(--border)" }} />
        {sectionTitle("Justification")}
        <Field label="Reason / Justification"><Textarea rows={3} value={reason} onChange={e => setReason(e.target.value)} placeholder="Explain the business justification for this transfer…" /></Field>

        <div style={{ height: 1, background: "var(--border)" }} />
        {sectionTitle("Supporting Documents")}
        <SupportingDocsUploader files={docs} onChange={setDocs} />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
        <Button variant="stroke" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" icon="exchange-line" disabled={!valid} onClick={() => valid && onSubmit({ names, classification, location, department, date, reason, documents: docs })}>Assign Transfer</Button>
      </div>
    </div>
  );
}

/* ---------- employee roster (checkboxes; bulk action lives in the floating bar) ---------- */
function TransferRoster({ q, setQ, selected, setSelected, onTransferOne, segment, setSegment }) {
  const DIR = window.EMPLOYEE_DIRECTORY;
  const names = window.EMPLOYEE_NAMES;
  const [menu, setMenu] = useTr(null);
  const shown = names.filter(n => {
    if (q === "") return true;
    const e = DIR[n] || {};
    return `${n} ${e.staffId} ${e.title} ${e.dept} ${e.branch}`.toLowerCase().includes(q.toLowerCase());
  });
  const toggle = (n) => setSelected(s => s.includes(n) ? s.filter(x => x !== n) : [...s, n]);
  const allShownSelected = shown.length > 0 && shown.every(n => selected.includes(n));
  const toggleAll = () => setSelected(allShownSelected ? selected.filter(n => !shown.includes(n)) : [...new Set([...selected, ...shown])]);
  const pg = usePaged(shown, 10);
  return (
    <div className="card" style={{ overflow: "visible", padding: "var(--card-pad, 24px)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 18, flexWrap: "wrap" }}>
        <Segmented items={["Requests", "Approvals"]} active={segment} onChange={setSegment} />
        <div className="input-wrap" style={{ width: 300, padding: "9px 12px" }}>
          <Icon name="search-2-line" size={18} style={{ color: "var(--icon-default)" }} />
          <input placeholder="Search staff…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
      </div>
      <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
        <table className="bh">
          <thead><tr>
            <th style={{ width: 44 }}><Checkbox checked={allShownSelected} onChange={toggleAll} /></th>
            <th>Full Name</th><th>Employee ID</th><th>Department</th><th>Current Location</th><th>Zone</th><th style={{ width: 48 }}></th>
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
                        <span style={{ fontSize: 12, color: "var(--gray-400)" }}>{e.title || ""}</span>
                      </span>
                    </span>
                  </td>
                  <td>{e.staffId}</td>
                  <td>{e.dept}</td>
                  <td>{e.branch}</td>
                  <td>{e.zone}</td>
                  <td style={{ position: "relative", textAlign: "right" }} onClick={ev => ev.stopPropagation()}>
                    <button className="btn btn-icon btn-ghost" style={{ width: 28, height: 28, padding: 0 }} onClick={() => setMenu(menu === n ? null : n)}>
                      <Icon name="more-fill" size={18} color="var(--gray-400)" />
                    </button>
                    {menu === n && (
                      <div onMouseLeave={() => setMenu(null)} style={{ position: "absolute", right: 16, top: 40, zIndex: 20, background: "#fff",
                        borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-pop)", padding: 6, minWidth: 190, display: "flex", flexDirection: "column" }}>
                        <button className="menu-item" onClick={() => { setMenu(null); onTransferOne(n); }}><Icon name="exchange-line" size={16} />Transfer (full form)</button>
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
function TransferForm({ lookups, initialEmployees, onCancel, onSubmit }) {
  const LK = lookups || window.LOOKUPS;
  const DIR = window.EMPLOYEE_DIRECTORY;
  const empOptions = window.EMPLOYEE_NAMES;
  const [employees, setEmployees] = useTr(initialEmployees || []);
  const [form, setForm] = useTr({ classification: "", newLocation: "", newDepartment: "", newUnit: "", newJobTitle: "",
    effectiveDate: "", reason: "" });
  const [docs, setDocs] = useTr([]);
  const [mails, setMails] = useTr([""]);
  const set = (k, v) => setForm(s => ({ ...s, [k]: v }));
  // Intra-Departmental stays within the same department → hide New Department (and clear it).
  const isInter = form.classification === "Inter-Departmental";
  const setClassification = (v) => setForm(s => ({ ...s, classification: v, newDepartment: v === "Inter-Departmental" ? s.newDepartment : "" }));

  const primary = employees[0] ? DIR[employees[0]] : null;
  const staffIds = employees.map(n => (DIR[n] || {}).staffId).filter(Boolean).join(", ");
  const autoItems = primary ? [
    { label: "Staff ID(s)", value: staffIds },
    { label: "Current Job Title", value: primary.title },
    { label: "Current Grade", value: primary.grade },
    { label: "Current Department / Unit", value: primary.dept },
    { label: "Current Location / Branch", value: primary.branch },
    { label: "Zone", value: primary.zone },
  ] : [];

  const valid = employees.length > 0 && form.classification && form.newLocation && form.effectiveDate && form.reason.trim() && docs.length > 0;

  const sectionTitle = (t, sub) => (
    <div style={{ marginTop: 4 }}>
      <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 18, color: "var(--gray-900)" }}>{t}</div>
      {sub && <div className="bh-body" style={{ marginTop: 2 }}>{sub}</div>}
    </div>
  );

  return (
    <div className="card" style={{ padding: "var(--card-pad, 24px)", overflow: "visible" }}>
      <div style={{ marginBottom: 8 }}>
        <div className="bh-h2" style={{ fontSize: 24 }}>Create Transfer</div>
        <div className="bh-body" style={{ marginTop: 4 }}>Create a new transfer record. Request type: <strong style={{ color: "var(--gray-700)" }}>Employee Transfer</strong>.</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 880 }}>
        {sectionTitle("Employee Information")}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <Field label="Transfer Classification"><Combobox value={form.classification} onChange={setClassification} options={TRANSFER_CLASSES} placeholder="Select classification" /></Field>
          <Field label="Employee Name(s)"><MultiSelectCombobox value={employees} onChange={setEmployees} options={empOptions} placeholder="Select one or more employees" avatar /></Field>
        </div>

        {primary && (
          <div>
            <div style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--gray-400)", marginBottom: 6 }}>Auto-populated from employee record</div>
            <DetailPanel items={autoItems} tint="gray" cols={3} />
          </div>
        )}

        <div style={{ height: 1, background: "var(--border)" }} />
        {sectionTitle("Transfer Details")}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <Field label="Proposed / New Location"><Combobox value={form.newLocation} onChange={v => set("newLocation", v)} options={LK.branches} placeholder="Select new location / branch" /></Field>
          {isInter && <Field label="New Department"><Combobox value={form.newDepartment} onChange={v => set("newDepartment", v)} options={LK.departments} placeholder="Select new department" /></Field>}
          <Field label="New Unit" optional><Combobox value={form.newUnit} onChange={v => set("newUnit", v)} options={LK.orgUnits || []} placeholder="Select new unit" /></Field>
          <Field label="New Job Title" optional><Combobox value={form.newJobTitle} onChange={v => set("newJobTitle", v)} options={LK.jobTitles} placeholder="Select new job title (optional)" /></Field>
          <Field label="Proposed Effective Transfer Date"><Input type="date" value={form.effectiveDate} onChange={e => set("effectiveDate", e.target.value)} /></Field>
        </div>

        <div style={{ height: 1, background: "var(--border)" }} />
        {sectionTitle("Justification")}
        <Field label="Reason / Justification"><Textarea rows={4} value={form.reason} onChange={e => set("reason", e.target.value)} placeholder="Explain the business justification for this transfer…" /></Field>

        <div style={{ height: 1, background: "var(--border)" }} />
        {sectionTitle("Supporting Documents", "Upload transfer recommendation, handover and approval documents (where applicable).")}
        <SupportingDocsUploader files={docs} onChange={setDocs} />

        <div style={{ height: 1, background: "var(--border)" }} />
        {sectionTitle("Stakeholder Notification")}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={{ fontFamily: "var(--font-control)", fontWeight: 500, fontSize: 14, color: "var(--gray-900)" }}>Notify Stakeholders <span style={{ color: "var(--gray-400)", fontWeight: 400 }}>(Department / stakeholder mails)</span></label>
          {mails.map((m, i) => (
            <div key={i} className="input-wrap">
              <input placeholder="e.g. S&IT, BOBS, line.manager@company.com" value={m} onChange={e => setMails(ms => ms.map((x, j) => j === i ? e.target.value : x))} />
            </div>
          ))}
          <button onClick={() => setMails(ms => [...ms, ""])} style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 6,
            border: 0, background: "none", cursor: "pointer", padding: 0, fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 13, color: "var(--brand-yellow-dark)" }}>
            <Icon name="add-line" size={16} color="var(--brand-yellow-dark)" />Add another mail / stakeholder
          </button>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
        <Button variant="stroke" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" disabled={!valid} onClick={() => valid && onSubmit({ employees, primary, staffIds, ...form, documents: docs, notifyMails: mails.filter(Boolean) })}>Create Transfer</Button>
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
          {t.documents && t.documents.length > 0
            ? <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {t.documents.map((doc, i) => (
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
  const [tab, setTab] = useTr("All");
  const [view, setView] = useTr({ name: "list" });   // list | add | details
  const [confirm, setConfirm] = useTr(null);

  useTrEffect(() => {
    if (!onSubPage) return;
    if (view.name === "add") onSubPage({ trail: [{ label: "Transfers", onClick: () => setView({ name: "list" }) }, { label: "Create Transfer" }] });
    else if (view.name === "assign") onSubPage({ trail: [{ label: "Transfers", onClick: () => setView({ name: "list" }) }, { label: "Assign Transfer" }] });
    else if (view.name === "details") onSubPage({ trail: [{ label: "Transfers", onClick: () => setView({ name: "list" }) }, { label: "Transfer Approval" }] });
    else onSubPage(null);
    return () => onSubPage(null);
  }, [view]);

  useTrEffect(() => { if (selected.length) setLastCount(selected.length); }, [selected.length]);

  const current = view.name === "details" ? transfers.find(t => t.id === view.id) : null;

  const submitTransfer = (f) => setConfirm({ kind: "add", form: f });
  const submitBulk = (f) => setConfirm({ kind: "bulk", form: f });
  const runConfirm = () => {
    const c = confirm;
    if (c.kind === "add") {
      const f = c.form, p = f.primary || {};
      setTransfers(ts => [{
        id: trId(), employees: f.employees, staffIds: f.staffIds || "—", classification: f.classification,
        previousLocation: p.branch || "—", newLocation: f.newLocation,
        previousDept: p.dept || "—", newDept: f.newDepartment || p.dept || "—",
        previousUnit: p.dept || "—", currentTitle: p.title || "—", newTitle: f.newJobTitle || "",
        grade: p.grade || "—", zone: p.zone || "—",
        effectiveDate: f.effectiveDate, dateSubmitted: todayTr(), status: "Pending",
        reason: f.reason, documents: f.documents,
        approvedBy: "N/A", approverEmail: "N/A", approvedAt: "N/A", rejectedBy: "N/A", rejectorEmail: "N/A", rejectedAt: "N/A",
      }, ...ts]);
      onToast("Transfer Submitted", { tone: "success" });
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
  if (view.name === "add") body = <TransferForm lookups={lookups} initialEmployees={view.initialEmployees} onCancel={() => setView({ name: "list" })} onSubmit={submitTransfer} />;
  else if (view.name === "assign") body = <BulkTransferForm names={view.names} lookups={lookups} onCancel={() => setView({ name: "list" })} onSubmit={submitBulk} />;
  else if (view.name === "details" && current) body = <TransferDetails transfer={current}
    onApprove={(r) => setConfirm({ kind: "approve", row: r })} onReject={(r) => setConfirm({ kind: "reject", row: r })}
    onUpdate={(partial) => setTransfers(ts => ts.map(t => t.id === current.id ? { ...t, ...partial } : t))} onToast={onToast} />;
  else body = (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title="Transfers" subtitle="Transfer or bulk-transfer staff, and track approval status."
        actions={
          <React.Fragment>
            <Button variant="stroke" icon="download-2-line" onClick={() => onToast("Import Transfers — coming soon")}>Import Transfers</Button>
            <Button variant="primary" icon="add-line" onClick={() => setView({ name: "add" })}>Add Transfer</Button>
          </React.Fragment>
        } />
      {segment === "Requests"
        ? <TransferRoster q={rosterQ} setQ={setRosterQ} selected={selected} setSelected={setSelected}
            onTransferOne={(n) => setView({ name: "add", initialEmployees: [n] })} segment={segment} setSegment={setSegment} />
        : <TransfersList rows={transfers} q={q} setQ={setQ} tab={tab} setTab={setTab}
            onOpen={(r) => setView({ name: "details", id: r.id })} onArchive={(r) => setConfirm({ kind: "archive", row: r })}
            segment={segment} setSegment={setSegment} sel={approvalSel} setSel={setApprovalSel} />}
    </div>
  );

  const CONFIRM = {
    add:     { t: "Submit Transfer", m: "submit this transfer", l: "Yes, Submit", i: "check-line", c: "Cancel" },
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

  const barVisible = view.name === "list" && segment === "Requests" && selected.length > 0;
  const barCount = selected.length || lastCount;
  const approvalBarVisible = view.name === "list" && segment === "Approvals" && approvalSel.length > 0;

  return (
    <React.Fragment>
      {body}

      {/* floating bulk-transfer bar (Requests roster) */}
      <div className={`jt-assignbar ${barVisible ? "" : "hidden"}`}>
        <span className="jt-count" key={barCount}>{barCount}</span>
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--gray-700)" }}>staff selected</span>
        <button className="jt-clear" onClick={() => setSelected([])}>Clear</button>
        <Button variant="primary" icon="exchange-line" onClick={() => setView({ name: "assign", names: selected })}>Assign Transfer</Button>
      </div>

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
