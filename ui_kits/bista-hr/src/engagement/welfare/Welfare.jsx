// BISTA HR · engagement/welfare/Welfare — HR Management ▸ Employee Engagement ▸ Welfare.
// Implements WelfareTabs + WelfareColumns + WelfareActionsCell + WelfareDetailsClient:
//   Tabs: Pending Approval (pending circulars → approve/reject) | Approved (status + archive).
//   Row → WelfareDetails (attachments, fields, target departments, submitted-by, announcement
//   details, approved-by). Create Circular → modal → submit for approval. Mirrors CircularDetail.
const { useState: useWel, useEffect: useWelEffect } = React;

let WEL_SEQ = 600;
const welId = () => `circ-${++WEL_SEQ}`;
const welFmt = (d) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—");
const welFmtLong = (d) => (d ? new Date(d).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "—");
const CIRCULAR_TYPES = ["Announcement", "Bereavement"];
const statusVariant = (s) => ({ approved: "approved", pending: "pending", rejected: "rejected" }[String(s).toLowerCase()] || "default");

/* ---------- list table ---------- */
function CircularsTable({ rows, q, setQ, tab, onOpen, onApprove, onReject, onArchive, departments }) {
  const [menu, setMenu] = useWel(null);
  const [filterOpen, setFilterOpen] = useWel(false);
  const [f, setF] = useWel({ type: "", department: "" });
  const [applied, setApplied] = useWel({ type: "", department: "" });
  const pending = tab === "pending";
  const shown = rows.filter(r => (q === "" || `${r.title} ${r.submittedByEmployeeName}`.toLowerCase().includes(q.toLowerCase()))
    && (!applied.type || r.type === applied.type)
    && (!applied.department || r.sendToDepartments.some(d => d.name === applied.department)));
  const pg = usePaged(shown, 10);

  return (
    <div className="card" style={{ overflow: "visible", padding: 20 }}>
      <div className="bh-tablebox">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12, padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
        <div className="input-wrap" style={{ width: 260, padding: "7px 12px" }}>
          <Icon name="search-2-line" size={18} style={{ color: "var(--icon-default)" }} />
          <input placeholder="Search circulars…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <Button variant="stroke" size="sm" icon="equalizer-line" onClick={() => setFilterOpen(o => !o)}>{filterOpen ? "Hide Filter" : "Show Filter"}</Button>
      </div>

      {filterOpen && (
        <div style={{ margin: "14px 20px", border: "1px solid #F0F1F3", background: "#FAFAFA", borderRadius: 10, padding: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Announcement Type"><Select value={f.type} onChange={e => setF(s => ({ ...s, type: e.target.value }))} options={CIRCULAR_TYPES} placeholder="Select type" /></Field>
            <Field label="Department"><Combobox value={f.department} onChange={v => setF(s => ({ ...s, department: v }))} options={departments} placeholder="Select department" /></Field>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
            <Button variant="stroke" size="sm" onClick={() => { setF({ type: "", department: "" }); setApplied({ type: "", department: "" }); }}>Reset filter</Button>
            <Button variant="primary" size="sm" onClick={() => setApplied(f)}>Apply Filters</Button>
          </div>
        </div>
      )}

      {rows.length === 0
        ? <EmptyState variant="message" title={pending ? "No Pending Circulars" : "No Circulars Yet"} subtitle={pending ? "There are no circulars awaiting approval." : "Published circulars will appear here."} />
        : <table className="bh">
            <thead><tr>
              <th>{pending ? "Submitted Date" : "Created Date"}</th><th>Title</th><th>Type</th>
              {pending ? <th>Event Date</th> : <th>Status</th>}
              <th>Submitted By</th><th style={{ width: 48 }}></th>
            </tr></thead>
            <tbody>
              {pg.pageItems.map(c => (
                <tr key={c.id} style={{ cursor: "pointer" }} onClick={() => onOpen(c)}>
                  <td>{welFmt(c.createdAt)}</td><td>{c.title}</td><td>{c.type}</td>
                  {pending ? <td>{welFmt(c.dateOfEvent)}</td> : <td><StatusBadge variant={statusVariant(c.status)} text={c.status} size="sm" /></td>}
                  <td><span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}><Avatar name={c.submittedByEmployeeName} size={28} />
                    <span style={{ display: "flex", flexDirection: "column" }}><span style={{ fontWeight: 600 }}>{c.submittedByEmployeeName}</span><span style={{ fontSize: 12, color: "var(--gray-400)" }}>{c.submittedByEmployeeJobTitle}</span></span></span></td>
                  <td style={{ position: "relative", textAlign: "right" }} onClick={e => e.stopPropagation()}>
                    <button className="btn btn-icon btn-ghost" style={{ width: 28, height: 28, padding: 0 }} onClick={() => setMenu(menu === c.id ? null : c.id)}><Icon name="more-fill" size={18} color="var(--gray-400)" /></button>
                    {menu === c.id && (
                      <div onMouseLeave={() => setMenu(null)} style={{ position: "absolute", right: 16, top: 40, zIndex: 20, background: "#fff", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-pop)", padding: 6, minWidth: 160, display: "flex", flexDirection: "column" }}>
                        <button className="menu-item" onClick={() => { setMenu(null); onOpen(c); }}><Icon name="eye-line" size={16} />View Details</button>
                        {pending ? <React.Fragment>
                          <button className="menu-item" style={{ color: "#16A34A" }} onClick={() => { setMenu(null); onApprove(c); }}><Icon name="check-line" size={16} />Approve</button>
                          <button className="menu-item danger" onClick={() => { setMenu(null); onReject(c); }}><Icon name="close-line" size={16} />Reject</button>
                        </React.Fragment>
                        : <button className="menu-item danger" onClick={() => { setMenu(null); onArchive(c); }}><Icon name="archive-line" size={16} />Archive</button>}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {shown.length === 0 && <tr><td colSpan={6} style={{ padding: 0 }}><EmptyState compact variant="message" title="No results found" subtitle="No circular matches your filters." /></td></tr>}
            </tbody>
          </table>}
      {rows.length > 0 && shown.length > 0 && <div style={{ borderTop: "1px solid var(--divider)" }}><Pagination page={pg.page} pages={pg.pages} onPrev={pg.prev} onNext={pg.next} /></div>}
      </div>
    </div>
  );
}

/* ---------- details (WelfareDetailsClient) ---------- */
function WelfareDetails({ circular, onApprove, onReject }) {
  const pending = String(circular.status).toLowerCase() === "pending";
  const fieldItems = [
    { label: "Title", value: circular.title }, { label: "Type", value: circular.type },
    { label: "Status", value: circular.status }, { label: "Event Date", value: welFmtLong(circular.dateOfEvent) },
    { label: "Created Date", value: welFmt(circular.createdAt) }, { label: "Departments", value: `${circular.sendToDepartments.length} department${circular.sendToDepartments.length === 1 ? "" : "s"}` },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 1080 }}>
      <DetailCard icon="megaphone-line" title={circular.title}
        action={pending ? <div style={{ display: "flex", gap: 10 }}>
          <Button variant="stroke" onClick={onApprove}>Approve Request</Button>
          <Button variant="stroke" style={{ borderColor: "var(--error)", color: "var(--error)" }} onClick={onReject}>Reject Request</Button>
        </div> : <StatusBadge variant={statusVariant(circular.status)} text={circular.status} />}>
        {circular.attachments && circular.attachments.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 14, color: "var(--gray-900)", marginBottom: 8 }}>Attachments</div>
            <div className="acc-imggrid">{circular.attachments.map((a, i) => <PropertyImage key={i} seed={a} height={150} icon="image-line" />)}</div>
          </div>
        )}
        <DetailPanel items={fieldItems} tint="gray" cols={3} />
        {circular.sendToDepartments.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-400)", marginBottom: 8 }}>Target Departments</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{circular.sendToDepartments.map(d => <span key={d.id} className="bh-chip">{d.name}</span>)}</div>
          </div>
        )}
        <div style={{ marginTop: 18 }}>
          <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-400)", marginBottom: 8 }}>Submitted by</div>
          <RequesterInfoCard title={circular.submittedBy.fullName} subtitle={circular.submittedBy.email} />
        </div>
      </DetailCard>

      <DetailCard icon="article-line" title="Announcement Details">
        <div style={{ padding: "0 12px", fontFamily: "var(--font-ui)", fontSize: 14, lineHeight: "23px", color: "var(--gray-700)" }}>{circular.eventDetails || "No description provided."}</div>
      </DetailCard>

      {!pending && circular.approvedBy && (
        <DetailCard icon="user-follow-line" title={`${circular.status} By`}>
          <DetailPanel items={[{ label: "Employee Name", value: circular.approvedBy.fullName }, { label: "Email", value: circular.approvedBy.email }, { label: "Phone", value: circular.approvedBy.phoneNumber }]} tint="green" cols={4} />
        </DetailCard>
      )}
    </div>
  );
}

/* ---------- create circular modal ---------- */
function CreateCircularModal({ departments, onClose, onCreate }) {
  const [form, setForm] = useWel({ title: "", type: "Announcement", departments: [], dateOfEvent: "", eventDetails: "" });
  const set = (k, v) => setForm(s => ({ ...s, [k]: v }));
  const valid = form.title.trim() && form.type && form.eventDetails.trim();
  const deptOpts = departments.map(d => ({ value: d, label: d }));
  return (
    <Modal onClose={onClose} width={640}>
      <div style={{ padding: "24px 24px 0" }}>
        <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 20, color: "var(--gray-900)" }}>Create Circular</div>
        <div className="bh-body" style={{ marginTop: 4 }}>Draft an announcement to send for approval.</div>
      </div>
      <div style={{ padding: "18px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <Field label="Title" style={{ gridColumn: "1 / -1" }}><Input placeholder="Eg. Year-End Welfare Package" value={form.title} onChange={e => set("title", e.target.value)} /></Field>
        <Field label="Announcement Type"><Select value={form.type} onChange={e => set("type", e.target.value)} options={CIRCULAR_TYPES} placeholder="Select type" /></Field>
        <Field label="Event Date"><Input icon="calendar-line" placeholder="DD / MM / YYYY" value={form.dateOfEvent} onChange={e => set("dateOfEvent", e.target.value)} /></Field>
        <Field label="Target Departments" style={{ gridColumn: "1 / -1" }}><MultiSelectCombobox value={form.departments} onChange={v => set("departments", v)} options={deptOpts} placeholder="Select departments" /></Field>
        <Field label="Announcement Details" style={{ gridColumn: "1 / -1" }}><Textarea placeholder="Describe this circular…" value={form.eventDetails} onChange={e => set("eventDetails", e.target.value)} /></Field>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: "0 24px 24px" }}>
        <Button variant="stroke" onClick={onClose}>Cancel</Button>
        <Button variant="primary" disabled={!valid} onClick={() => onCreate(form)}>Submit for Approval</Button>
      </div>
    </Modal>
  );
}

/* ---------- controller ---------- */
function WelfareScreen({ onToast, onSubPage, departments }) {
  const [approved, setApproved] = useWel(CIRCULARS_SEED);
  const [pending, setPending] = useStore(window.HRStores.pendingCirculars);
  const [tab, setTab] = useWel("pending");      // pending (Pending Approval) | approved (Approved)
  const [q, setQ] = useWel("");
  const [view, setView] = useWel({ name: "list" });
  const [create, setCreate] = useWel(false);
  const [confirm, setConfirm] = useWel(null);
  const deptNames = (departments && departments.length ? departments : (window.LOOKUPS?.departments || []));
  const deptObjs = deptNames.map((n, i) => ({ id: `d${i}`, name: n }));

  useWelEffect(() => {
    if (!onSubPage) return;
    if (view.name === "details") onSubPage({ trail: [{ label: "Welfare", onClick: () => setView({ name: "list" }) }, { label: view.circular.title }] });
    else onSubPage(null);
    return () => onSubPage(null);
  }, [view]);

  const approveCircular = (c) => { setPending(p => p.filter(x => x.id !== c.id)); setApproved(a => [{ ...c, status: "Approved", approvedBy: { fullName: ME.name, email: ME.email, phoneNumber: "+233 24 000 0000" } }, ...a]); onToast("Circular Approved", { tone: "success" }); if (view.name === "details") setView({ name: "list" }); };
  const rejectCircular = (c) => { setPending(p => p.filter(x => x.id !== c.id)); onToast("Circular Rejected", { tone: "error" }); if (view.name === "details") setView({ name: "list" }); };
  const archiveCircular = (c) => { setApproved(a => a.filter(x => x.id !== c.id)); onToast("Circular Archived", { tone: "error" }); };

  const runConfirm = () => {
    const c = confirm;
    if (c.kind === "approve") approveCircular(c.row);
    else if (c.kind === "reject") rejectCircular(c.row);
    else if (c.kind === "archive") archiveCircular(c.row);
    else if (c.kind === "create") {
      const f = c.form;
      setPending(p => [{ id: welId(), title: f.title, type: f.type, status: "Pending", createdAt: new Date().toISOString(), dateOfEvent: f.dateOfEvent,
        submittedByEmployeeName: ME.name, submittedByEmployeeJobTitle: ME.role || "HR", submittedByEmployeeProfileImage: "",
        submittedBy: { fullName: ME.name, email: ME.email, profileImage: "" }, approvedBy: null,
        sendToDepartments: f.departments.map((n, i) => ({ id: `nd${i}`, name: n })), attachments: [], eventDetails: f.eventDetails }, ...p]);
      onToast("Circular Submitted", { tone: "success" }); setCreate(false); setTab("pending");
    }
    setConfirm(null);
  };

  const header = (
    <PageHeader title="Announcement & Circulars" subtitle="See and manage all staff announcements and circulars."
      actions={<Button variant="primary" icon="add-line" onClick={() => setCreate(true)}>Create Circular</Button>} />
  );

  if (view.name === "details") {
    return (
      <React.Fragment>
        <WelfareDetails circular={view.circular}
          onApprove={() => setConfirm({ kind: "approve", row: view.circular })}
          onReject={() => setConfirm({ kind: "reject", row: view.circular })} />
        {confirm && <WelfareConfirm confirm={confirm} onConfirm={runConfirm} onClose={() => setConfirm(null)} />}
      </React.Fragment>
    );
  }

  const rows = tab === "pending" ? pending : approved;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {header}
      <div className="card" style={{ overflow: "visible", padding: 0 }}>
        <div style={{ padding: "14px 20px 0" }}>
          <div className="seg" style={{ background: "#F6F8FA" }}>
            <button className={tab === "pending" ? "active" : ""} onClick={() => setTab("pending")}>Pending Approval</button>
            <button className={tab === "approved" ? "active" : ""} onClick={() => setTab("approved")}>Approved</button>
          </div>
        </div>
        <div style={{ padding: "14px 0 0" }}>
          <CircularsTable rows={rows} q={q} setQ={setQ} tab={tab} departments={deptNames}
            onOpen={(c) => setView({ name: "details", circular: c })}
            onApprove={(c) => setConfirm({ kind: "approve", row: c })}
            onReject={(c) => setConfirm({ kind: "reject", row: c })}
            onArchive={(c) => setConfirm({ kind: "archive", row: c })} />
        </div>
      </div>
      {create && <CreateCircularModal departments={deptNames} onClose={() => setCreate(false)} onCreate={(form) => setConfirm({ kind: "create", form })} />}
      {confirm && <WelfareConfirm confirm={confirm} onConfirm={runConfirm} onClose={() => setConfirm(null)} />}
    </div>
  );
}

function WelfareConfirm({ confirm, onConfirm, onClose }) {
  const map = {
    approve: { t: "Approve Circular", m: "Are you sure you want to approve this circular?", l: "Yes, Approve", i: "check-line" },
    reject:  { t: "Reject Circular", m: "Are you sure you want to reject this circular?", l: "Yes, Reject", i: "close-line" },
    archive: { t: "Archive Circular", m: "Are you sure you want to archive this circular? This action cannot be undone.", l: "Yes, Archive", i: "archive-line" },
    create:  { t: "Submit Circular", m: "Submit this circular for approval?", l: "Yes, Submit", i: "check-line" },
  };
  const c = map[confirm.kind];
  return <ConfirmModal title={c.t} message={c.m} confirmLabel={c.l} confirmIcon={c.i} cancelLabel="Cancel" onConfirm={onConfirm} onClose={onClose} />;
}

Object.assign(window, { WelfareScreen });

// seed the shared store once + expose an ESS circular builder so a self-service Circular /
// Bereavement notice (Dashboard ▸ Requests) lands here under Pending Approval, reactively.
window.HRStores.pendingCirculars.seed(PENDING_CIRCULARS_SEED);
window.HRWelfare = {
  createEssCircular: ({ title, type, departments, dateOfEvent, eventDetails, employeeName, employeeJobTitle, employeeEmail }) => ({
    id: welId(), title, type: type || "Announcement", status: "Pending", createdAt: new Date().toISOString(), dateOfEvent: dateOfEvent || "",
    submittedByEmployeeName: employeeName, submittedByEmployeeJobTitle: employeeJobTitle || "Employee", submittedByEmployeeProfileImage: "",
    submittedBy: { fullName: employeeName, email: employeeEmail || "", profileImage: "" }, approvedBy: null,
    sendToDepartments: (departments || []).map((n, i) => ({ id: `nd${i}`, name: n })), attachments: [], eventDetails: eventDetails || "" }),
};
