// BISTA HR · jobtitle/JobTitle — People & Culture ▸ Job Title (Assign / Change of Job Title).
// Bulk-assign flow (mirrors the Reporting Managers screen):
//   JobTitleRoster   : employee roster with row checkboxes + search. Select one or many →
//                      an "Assign Job Title (N)" button → AssignJobTitleModal assigns ONE
//                      new job title to all selected. A per-row "Assign" handles a single
//                      employee. No status pick — an assignment is created Pending and
//                      becomes Current once approved.
//   AssignJobTitleModal : "N employee(s) selected. Choose one job title to assign to all of
//                      them." → selected employees list + Job Title + Effective Date + Reason.
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
    department: "Finance", zone: "Accra East", branch: "Abossey Okai",
    effectiveDate: "Jun 01, 2026", dateSubmitted: "May 14, 2026", status: "Approved",
    reason: "Confirmation in substantive role following a successful acting period.",
    documents: [JT_DOC("Confirmation Letter.pdf", "PDF", "880 KB", "Reference Letter")],
    approvedBy: "Peter Bosrotsi", approverEmail: "pybosrotsi@gcb.com.gh", approvedAt: "5/16/2026, 2:08:34 PM",
    rejectedBy: "N/A", rejectorEmail: "N/A", rejectedAt: "N/A" },
  { id: 2, employees: ["Bright Manu"], staffIds: "EMP-10876",
    previousTitle: "Software Engineer", newTitle: "Senior Software Engineer", grade: "Grade 3",
    department: "Information Technology", zone: "East Zone", branch: "Tema",
    effectiveDate: "May 28, 2026", dateSubmitted: "May 10, 2026", status: "Pending",
    reason: "Re-designation to reflect expanded technical leadership responsibilities.",
    documents: [JT_DOC("Role Justification.docx", "DOCX", "76 KB", "Other")],
    approvedBy: "N/A", approverEmail: "N/A", approvedAt: "N/A",
    rejectedBy: "N/A", rejectorEmail: "N/A", rejectedAt: "N/A" },
  { id: 3, employees: ["Emmanuel Ansah"], staffIds: "EMP-10412",
    previousTitle: "HR Officer", newTitle: "HR Generalist", grade: "Grade 2",
    department: "Human Resource", zone: "South Zone", branch: "Accra",
    effectiveDate: "Jul 08, 2026", dateSubmitted: "May 18, 2026", status: "Pending",
    reason: "Title alignment with the new HR operating model and job architecture.",
    documents: [JT_DOC("Job Architecture Memo.pdf", "PDF", "1.0 MB", "Other")],
    approvedBy: "N/A", approverEmail: "N/A", approvedAt: "N/A",
    rejectedBy: "N/A", rejectorEmail: "N/A", rejectedAt: "N/A" },
  { id: 4, employees: ["Samuel Asante"], staffIds: "EMP-11233",
    previousTitle: "Teller", newTitle: "Senior Teller", grade: "Grade 1",
    department: "Finance", zone: "West Zone", branch: "Takoradi",
    effectiveDate: "Apr 30, 2026", dateSubmitted: "Apr 12, 2026", status: "Declined",
    reason: "Proposed re-designation; deferred pending completion of the role-banding review.",
    documents: [JT_DOC("Banding Review.xlsx", "XLSX", "120 KB", "Other")],
    approvedBy: "N/A", approverEmail: "N/A", approvedAt: "N/A",
    rejectedBy: "Peter Bosrotsi", rejectorEmail: "pybosrotsi@gcb.com.gh", rejectedAt: "4/18/2026, 9:14:02 AM" },
];

/* ---------- assign modal (one job title → many employees) ---------- */
function AssignJobTitleModal({ names, lookups, onClose, onSubmit }) {
  const LK = lookups || window.LOOKUPS;
  const DIR = window.EMPLOYEE_DIRECTORY;
  const [title, setTitle] = useJt("");
  const [date, setDate] = useJt("");
  const [reason, setReason] = useJt("");
  const valid = title && date;
  const multi = names.length > 1;
  return (
    <Modal onClose={onClose} width={620}>
      <div style={{ padding: "24px 24px 0" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 20, lineHeight: "28px", color: "var(--gray-900)" }}>Assign job title</div>
          <button className="btn btn-icon btn-ghost" onClick={onClose} style={{ width: 32, height: 32, padding: 0 }}><Icon name="close-line" size={20} color="var(--gray-500)" /></button>
        </div>
        <div className="bh-body" style={{ marginTop: 4 }}>
          {names.length} employee{multi ? "s" : ""} selected. Choose one job title to assign to {multi ? "all of them" : "them"}.
        </div>
      </div>

      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <div style={{ fontFamily: "var(--font-control)", fontWeight: 500, fontSize: 14, color: "var(--gray-900)", marginBottom: 8 }}>Selected employees</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 220, overflowY: "auto" }}>
            {names.map(n => {
              const e = DIR[n] || {};
              return (
                <div key={n} style={{ display: "flex", alignItems: "center", gap: 12, border: "1px solid var(--border)", borderRadius: 10, padding: "10px 12px" }}>
                  <Avatar name={n} size={36} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 14, color: "var(--gray-900)" }}>{n}</div>
                    <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-400)" }}>{e.staffId} · {e.title}{e.dept ? ` · ${e.dept}` : ""}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Field label="Job Title"><Combobox value={title} onChange={setTitle} options={LK.jobTitles} placeholder="Select job title" /></Field>
          <Field label="Effective Date"><Input type="date" value={date} onChange={e => setDate(e.target.value)} /></Field>
        </div>
        <Field label="Reason / Note" optional><Textarea rows={3} value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason or note for this assignment…" /></Field>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: "0 24px 24px" }}>
        <Button variant="stroke" onClick={onClose}>Cancel</Button>
        <Button variant="primary" icon="user-add-line" disabled={!valid} onClick={() => valid && onSubmit({ names, title, date, reason })}>Assign job title</Button>
      </div>
    </Modal>
  );
}

/* ---------- employee roster (checkboxes; bulk action lives in the floating bar) ---------- */
function JobTitleRoster({ q, setQ, selected, setSelected, onAssignOne, segment, setSegment }) {
  const DIR = window.EMPLOYEE_DIRECTORY;
  const names = window.EMPLOYEE_NAMES;
  const [menu, setMenu] = useJt(null);
  const shown = names.filter(n => {
    if (q === "") return true;
    const e = DIR[n] || {};
    return `${n} ${e.staffId} ${e.title} ${e.dept}`.toLowerCase().includes(q.toLowerCase());
  });
  const toggle = (n) => setSelected(s => s.includes(n) ? s.filter(x => x !== n) : [...s, n]);
  const allShownSelected = shown.length > 0 && shown.every(n => selected.includes(n));
  const toggleAll = () => setSelected(allShownSelected ? selected.filter(n => !shown.includes(n)) : [...new Set([...selected, ...shown])]);
  const pg = usePaged(shown, 10);

  return (
    <div className="card" style={{ overflow: "visible", padding: "var(--card-pad, 24px)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 18, flexWrap: "wrap" }}>
        <Segmented items={["Assign", "Requests"]} active={segment} onChange={setSegment} />
        <div className="input-wrap" style={{ width: 300, padding: "9px 12px" }}>
          <Icon name="search-2-line" size={18} style={{ color: "var(--icon-default)" }} />
          <input placeholder="Search staff…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
      </div>

      <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
        <table className="bh">
          <thead><tr>
            <th style={{ width: 44 }}><Checkbox checked={allShownSelected} onChange={toggleAll} /></th>
            <th>Full Name</th><th>Employee ID</th><th>Current Job Title</th><th>Department</th><th>Branch</th><th style={{ width: 48 }}></th>
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
                        <span style={{ fontSize: 12, color: "var(--gray-400)" }}>{jtEmail(n)}</span>
                      </span>
                    </span>
                  </td>
                  <td>{e.staffId}</td>
                  <td>{e.title}</td>
                  <td>{e.dept}</td>
                  <td>{e.branch}</td>
                  <td style={{ position: "relative", textAlign: "right" }} onClick={ev => ev.stopPropagation()}>
                    <button className="btn btn-icon btn-ghost" style={{ width: 28, height: 28, padding: 0 }} onClick={() => setMenu(menu === n ? null : n)}>
                      <Icon name="more-fill" size={18} color="var(--gray-400)" />
                    </button>
                    {menu === n && (
                      <div onMouseLeave={() => setMenu(null)} style={{ position: "absolute", right: 16, top: 40, zIndex: 20, background: "#fff",
                        borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-pop)", padding: 6, minWidth: 160, display: "flex", flexDirection: "column" }}>
                        <button className="menu-item" onClick={() => { setMenu(null); onAssignOne(n); }}><Icon name="user-add-line" size={16} />Assign Job Title</button>
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

/* ---------- requests list (approval queue) ---------- */
function JobTitleList({ rows, q, setQ, tab, setTab, onOpen, onArchive, segment, setSegment, sel, setSel }) {
  const [menu, setMenu] = useJt(null);
  const byTab = rows.filter(r => tab === "All" || r.status === tab);
  const shown = byTab.filter(r => q === "" || r.employees.join(" ").toLowerCase().includes(q.toLowerCase()) || r.newTitle.toLowerCase().includes(q.toLowerCase()));
  const pg = usePaged(shown, 10);
  const pendingShown = shown.filter(r => r.status === "Pending");
  const allPendingSel = pendingShown.length > 0 && pendingShown.every(r => sel.includes(r.id));
  const toggle = (id) => setSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll = () => setSel(allPendingSel ? sel.filter(id => !pendingShown.some(r => r.id === id)) : [...new Set([...sel, ...pendingShown.map(r => r.id)])]);
  return (
    <div className="card" style={{ overflow: "visible", padding: "var(--card-pad, 24px)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 18, flexWrap: "wrap" }}>
        <Segmented items={["Assign", "Requests"]} active={segment} onChange={setSegment} />
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <Segmented items={["All", "Approved", "Pending"]} active={tab} onChange={setTab} />
          <div className="input-wrap" style={{ width: 260, padding: "9px 12px" }}>
            <Icon name="search-2-line" size={18} style={{ color: "var(--icon-default)" }} />
            <input placeholder="Search job title changes…" value={q} onChange={e => setQ(e.target.value)} />
          </div>
        </div>
      </div>

      <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
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
                    <td style={{ position: "relative", textAlign: "right" }} onClick={e => e.stopPropagation()}>
                      <button className="btn btn-icon btn-ghost" style={{ width: 28, height: 28, padding: 0 }} onClick={() => setMenu(menu === r.id ? null : r.id)}>
                        <Icon name="more-fill" size={18} color="var(--gray-400)" />
                      </button>
                      {menu === r.id && (
                        <div onMouseLeave={() => setMenu(null)} style={{ position: "absolute", right: 16, top: 40, zIndex: 20, background: "#fff",
                          borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-pop)", padding: 6, minWidth: 170, display: "flex", flexDirection: "column" }}>
                          <button className="menu-item" onClick={() => { setMenu(null); onOpen(r); }}><Icon name="eye-line" size={16} />View Details</button>
                          <button className="menu-item danger" onClick={() => { setMenu(null); onArchive(r); }}><Icon name="archive-line" size={16} />Archive Request</button>
                        </div>
                      )}
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
  );
}

/* ---------- details — "Job Title Change Approval" ---------- */
function JobTitleDetails({ record, onApprove, onReject, onUpdate, onToast }) {
  const r = record;
  const info = [
    { label: "Employee Name", value: r.employees.join(", ") },
    { label: "Previous Job Title", value: r.previousTitle },
    { label: "New Job Title", value: r.newTitle },
    { label: "Job Grade", value: r.grade },
    { label: "Department / Unit", value: r.department },
    { label: "Branch", value: r.branch },
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
        <DetailCard icon="file-text-line" title="Reason / Justification">
          <div style={{ background: "#F6F8FA", borderRadius: 8, padding: "14px 16px", fontFamily: "var(--font-ui)", fontSize: 14, lineHeight: "22px", color: "var(--gray-800)" }}>{r.reason || "—"}</div>
        </DetailCard>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <DetailCard icon="attachment-2" title="Supporting Documents">
          {r.documents && r.documents.length > 0
            ? <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {r.documents.map((doc, i) => (
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
  const [assign, setAssign] = useJt(null);          // names[] being assigned (modal)
  const [lastCount, setLastCount] = useJt(0);        // held count so the bar shows it while sliding out
  const [q, setQ] = useJt("");
  const [tab, setTab] = useJt("All");
  const [view, setView] = useJt({ name: "list" });   // list | details
  const [confirm, setConfirm] = useJt(null);

  useJtEffect(() => {
    if (!onSubPage) return;
    if (view.name === "details") onSubPage({ trail: [{ label: "Job Title", onClick: () => setView({ name: "list" }) }, { label: "Job Title Change Approval" }] });
    else onSubPage(null);
    return () => onSubPage(null);
  }, [view]);

  useJtEffect(() => { if (selected.length) setLastCount(selected.length); }, [selected.length]);

  const current = view.name === "details" ? records.find(r => r.id === view.id) : null;

  const submitAssign = (f) => setConfirm({ kind: "assign", form: f });
  const runConfirm = () => {
    const c = confirm;
    if (c.kind === "assign") {
      const f = c.form;
      const recs = f.names.map(n => {
        const e = DIR[n] || {};
        return { id: jtId(), employees: [n], staffIds: e.staffId || "—",
          previousTitle: e.title || "—", newTitle: f.title, grade: e.grade || "—",
          department: e.dept || "—", zone: e.zone || "—", branch: e.branch || "—",
          effectiveDate: fmtJtDate(f.date), dateSubmitted: todayJt(), status: "Pending",
          reason: f.reason || "", documents: [],
          approvedBy: "N/A", approverEmail: "N/A", approvedAt: "N/A", rejectedBy: "N/A", rejectorEmail: "N/A", rejectedAt: "N/A" };
      });
      setRecords(rs => [...recs, ...rs]);
      onToast(f.names.length > 1 ? `Job Title Assigned to ${f.names.length} Employees` : "Job Title Assigned", { tone: "success" });
      setAssign(null); setSelected([]); setSegment("Requests");
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
  if (view.name === "details" && current) {
    body = <JobTitleDetails record={current}
      onApprove={(r) => setConfirm({ kind: "approve", row: r })} onReject={(r) => setConfirm({ kind: "reject", row: r })}
      onUpdate={(partial) => setRecords(rs => rs.map(x => x.id === current.id ? { ...x, ...partial } : x))} onToast={onToast} />;
  } else {
    const pendingCount = records.filter(r => r.status === "Pending").length;
    body = (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <PageHeader title="Job Title" subtitle="Assign or bulk-assign job titles to staff, and track approval status." />
        {segment === "Assign"
          ? <JobTitleRoster q={rosterQ} setQ={setRosterQ} selected={selected} setSelected={setSelected}
              onAssignOne={(n) => setAssign([n])} segment={segment} setSegment={setSegment} />
          : <JobTitleList rows={records} q={q} setQ={setQ} tab={tab} setTab={setTab}
              onOpen={(r) => setView({ name: "details", id: r.id })} onArchive={(r) => setConfirm({ kind: "archive", row: r })}
              segment={segment} setSegment={setSegment} sel={approvalSel} setSel={setApprovalSel} />}
      </div>
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

  const barVisible = view.name !== "details" && segment === "Assign" && selected.length > 0;
  const barCount = selected.length || lastCount;
  const approvalBarVisible = view.name !== "details" && segment === "Requests" && approvalSel.length > 0;

  return (
    <React.Fragment>
      {body}

      {/* floating bulk-assign bar (fixed bottom-right, animates in/out; count pops) */}
      <div className={`jt-assignbar ${barVisible ? "" : "hidden"}`}>
        <span className="jt-count" key={barCount}>{barCount}</span>
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--gray-700)" }}>staff selected</span>
        <button className="jt-clear" onClick={() => setSelected([])}>Clear</button>
        <Button variant="primary" icon="user-add-line" onClick={() => setAssign(selected)}>Assign Job Title</Button>
      </div>

      {/* floating bulk-approval bar (Requests queue) */}
      <BulkBar count={approvalSel.length} noun="changes selected" visible={approvalBarVisible} onClear={() => setApprovalSel([])}>
        <Button variant="stroke" icon="close-line" onClick={() => setConfirm({ kind: "bulkReject", ids: approvalSel })}>Reject</Button>
        <Button variant="primary" icon="check-line" onClick={() => setConfirm({ kind: "bulkApprove", ids: approvalSel })}>Approve</Button>
      </BulkBar>

      {assign && <AssignJobTitleModal names={assign} lookups={lookups} onClose={() => setAssign(null)} onSubmit={submitAssign} />}
      {confirm && (() => { const cc = CONFIRM[confirm.kind]; return (
        <ConfirmModal title={cc.t} message={confirmMsg()} confirmLabel={cc.l} confirmIcon={cc.i}
          cancelLabel={cc.c} onConfirm={runConfirm} onClose={() => setConfirm(null)} />
      ); })()}
    </React.Fragment>
  );
}

Object.assign(window, { JobTitleScreen });
