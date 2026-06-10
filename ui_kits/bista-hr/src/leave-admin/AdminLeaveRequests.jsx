// BISTA HR · leave-admin/AdminLeaveRequests — all-employee leave requests (admin).
//   AdminLeaveRequestsView : segmented filter (All/Approved/Rejected/Recalled) + search + table
//   LeaveRequestDetail     : review modal with Approve / Reject
//   CreateLeaveRequestModal: submit a request on behalf (Type, Reliever*, dates, notes)
const { useState: useALR } = React;

const fmtDash = (iso) => { if (!iso) return "—"; const [y, m, d] = iso.split("-"); return d ? `${d}-${m}-${y}` : iso; };
const REQ_STATUS = { pending: { variant: "pending", text: "Pending" }, approved: { variant: "approved", text: "Approved" },
  rejected: { variant: "rejected", text: "Rejected" }, recalled: { variant: "cancelled", text: "Recalled" } };

function AdminLeaveRequestsView({ rows, onCreate, onOpen, onApprove, onReject }) {
  const [filter, setFilter] = useALR("All");
  const [q, setQ] = useALR("");
  const [menu, setMenu] = useALR(null);
  const shown = rows.filter(r =>
    (filter === "All" || r.status === filter.toLowerCase()) &&
    (q === "" || r.name.toLowerCase().includes(q.toLowerCase()) || r.type.toLowerCase().includes(q.toLowerCase())));
  const pg = usePaged(shown, 10);
  return (
    <div className="card" style={{ overflow: "visible", padding: "var(--card-pad, 24px)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
        <div>
          <div className="bh-h2" style={{ fontSize: 24 }}>Leave Requests</div>
          <div className="bh-body" style={{ marginTop: 4 }}>Track and manage all employee leave requests</div>
        </div>
        <Button variant="primary" icon="add-line" onClick={onCreate}>Create Leave Request</Button>
      </div>
      <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "visible" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "16px 20px", flexWrap: "wrap" }}>
          <Segmented items={["All", "Approved", "Rejected", "Recalled"]} active={filter} onChange={setFilter} />
          <div className="input-wrap" style={{ width: 280, padding: "8px 12px" }}>
            <Icon name="search-2-line" size={18} style={{ color: "var(--icon-default)" }} />
            <input placeholder="Search leave requests..." value={q} onChange={e => setQ(e.target.value)} />
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="bh">
            <thead><tr><th>Full Name</th><th>Leave Type</th><th>Start Date</th><th>End Date</th><th>Days</th><th>Status</th><th style={{ width: 48 }}></th></tr></thead>
            <tbody>
              {pg.pageItems.map(r => {
                const st = REQ_STATUS[r.status] || REQ_STATUS.pending;
                return (
                  <tr key={r.id} style={{ cursor: "pointer" }} onClick={() => onOpen(r)}>
                    <td><span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}><Avatar name={r.name} size={32} /><span style={{ fontWeight: 600 }}>{r.name}</span></span></td>
                    <td>{r.type}</td>
                    <td>{fmtDash(r.start)}</td>
                    <td>{fmtDash(r.end)}</td>
                    <td>{r.days} days</td>
                    <td><StatusBadge variant={st.variant} text={st.text} size="sm" /></td>
                    <td style={{ textAlign: "right" }} onClick={e => e.stopPropagation()}>
                      {r.status === "pending"
                        ? <RowMenu open={menu === r.id} onToggle={() => setMenu(menu === r.id ? null : r.id)}
                            items={[{ label: "Approve Leave", icon: "check-line", onClick: () => onApprove(r) },
                                    { label: "Reject Request", icon: "close-line", danger: true, onClick: () => onReject(r) }]} />
                        : <span style={{ color: "var(--gray-300)" }}><Icon name="more-fill" size={18} /></span>}
                    </td>
                  </tr>
                );
              })}
              {shown.length === 0 && <tr><td colSpan={7} style={{ padding: 0 }}><EmptyState compact title="No requests found" subtitle="No leave requests match this view." /></td></tr>}
            </tbody>
          </table>
        </div>
        <div style={{ borderTop: "1px solid var(--divider)" }}><Pagination page={pg.page} pages={pg.pages} onPrev={pg.prev} onNext={pg.next} /></div>
      </div>
    </div>
  );
}

function DetailField({ label, children }) {
  return (
    <div><div style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--gray-400)" }}>{label}</div>
      <div style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 14.5, color: "var(--gray-900)", marginTop: 4 }}>{children}</div></div>
  );
}

function LeaveRequestDetail({ req, onClose, onApprove, onReject }) {
  const st = REQ_STATUS[req.status] || REQ_STATUS.pending;
  return (
    <Modal onClose={onClose} width={520}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "24px 24px 0" }}>
        <div><div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 20, color: "var(--gray-900)" }}>Leave Request</div>
          <div className="bh-body" style={{ marginTop: 4 }}>Review leave request details</div></div>
        <button className="btn btn-icon btn-ghost" onClick={onClose} style={{ width: 32, height: 32, padding: 0 }}><Icon name="close-line" size={20} color="var(--gray-500)" /></button>
      </div>
      <div style={{ padding: 24, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 22 }}>
        <DetailField label="Employee"><span style={{ textTransform: "uppercase" }}>{req.name}</span></DetailField>
        <DetailField label="Leave Type">{req.type}</DetailField>
        <DetailField label="Status"><StatusBadge variant={st.variant} text={st.text} size="sm" /></DetailField>
        <DetailField label="Start Date">{fmtDash(req.start)}</DetailField>
        <DetailField label="End Date">{fmtDash(req.end)}</DetailField>
        <DetailField label="Total Days">{req.days} days</DetailField>
        <div style={{ gridColumn: "1 / -1" }}><DetailField label="Reason"><span style={{ textTransform: "uppercase", fontWeight: 500 }}>{req.reason}</span></DetailField></div>
      </div>
      {req.status === "pending" && (
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: "0 24px 24px" }}>
          <Button variant="stroke" onClick={() => onReject(req)} style={{ color: "var(--error)", borderColor: "var(--error)" }}>Reject</Button>
          <Button variant="primary" onClick={() => onApprove(req)}>Approve</Button>
        </div>
      )}
    </Modal>
  );
}

function CreateLeaveRequestModal({ onClose, onSubmit }) {
  const [form, setForm] = useALR({ type: "", reliever: "", start: "", end: "", notes: "" });
  const set = (k, v) => setForm(s => ({ ...s, [k]: v }));
  const days = leaveDays(form.start, form.end);
  const valid = form.type && form.reliever && form.start && form.end;
  return (
    <Modal onClose={onClose} width={640}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "24px 24px 0" }}>
        <div><div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 20, color: "var(--gray-900)" }}>Create Leave Request</div>
          <div className="bh-body" style={{ marginTop: 4 }}>Submit a new leave request</div></div>
        <button className="btn btn-icon btn-ghost" onClick={onClose} style={{ width: 32, height: 32, padding: 0 }}><Icon name="close-line" size={20} color="var(--gray-500)" /></button>
      </div>
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
        <Field label="Leave Type"><Combobox value={form.type} onChange={v => set("type", v)} options={LEAVE_TYPE_NAMES} placeholder="Select a leave type" /></Field>
        <Field label="Reliever"><Combobox value={form.reliever} onChange={v => set("reliever", v)} options={LEAVE_PEOPLE} avatar placeholder="Select a reliever" /></Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 120px", gap: 14 }}>
          <Field label="Start Date" style={{ margin: 0 }}><DateField value={form.start} onChange={v => set("start", v)} /></Field>
          <Field label="End Date" style={{ margin: 0 }}><DateField value={form.end} onChange={v => set("end", v)} /></Field>
          <Field label="Days" style={{ margin: 0 }}>
            <div className="input-wrap" style={{ background: "var(--gray-50)" }}><input value={`${days} days`} readOnly style={{ color: "var(--gray-600)" }} /></div>
          </Field>
        </div>
        <Field label="Notes"><Textarea placeholder="Please provide a reason for your leave request..." value={form.notes} onChange={e => set("notes", e.target.value)} /></Field>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: "0 24px 24px" }}>
        <Button variant="stroke" onClick={onClose}>Cancel</Button>
        <Button variant="primary" disabled={!valid} onClick={() => valid && onSubmit({ ...form, days })}>Create Leave Request</Button>
      </div>
    </Modal>
  );
}

Object.assign(window, { AdminLeaveRequestsView, LeaveRequestDetail, CreateLeaveRequestModal, fmtDash, REQ_STATUS });
