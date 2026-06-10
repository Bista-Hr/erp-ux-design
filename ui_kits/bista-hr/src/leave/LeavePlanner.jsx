// BISTA HR · leave/LeavePlanner — the self-service Leave Requests area.
// Phases mirror the Figma boards:
//   LANDING : Annual Leave Planner hero + balance tiles + Active Leave Requests + Leave History
//   REQUEST : Request {Type} Leave modal → confirm("Request Leave") → "Leave Request Added"
//   PLANNER : full "Leave Planner" schedule page (table of periods) reached via "View Your Leave Plan"
//   ADD     : Add a Leave Period modal → confirm("Add Leave Plan") → "Leave Plan Submitted"
//   EDIT    : Update Leave Period modal → confirm("Update Leave Plan") → "Leave Plan Updated"
//   DELETE  : confirm("Delete Leave Period") → "Leave Period Deleted"
//   BUILDER : empty planner → inline multi-row schedule builder → Continue commits all rows
// State is local (self-service); onToast is lifted from the dashboard. The data shapes come
// from leave/data so the future admin side can reuse them.
const { useState: useLP } = React;

const leaveLink = { display: "inline-flex", alignItems: "center", gap: 4, border: 0, background: "none", cursor: "pointer",
  padding: 0, fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 14, color: "var(--brand-yellow-dark)" };

/* ---- balance tile ---- */
function BalanceTile({ tile, index, onApply }) {
  return (
    <div className={`leave-stat ${index % 2 === 0 ? "leave-stat--a" : "leave-stat--b"}`}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 13.5, color: "var(--gray-500)" }}>{tile.label}</span>
        {tile.apply && (
          <button onClick={() => onApply(tile.apply)} style={{ ...leaveLink, fontSize: 13 }}>
            Apply <Icon name="arrow-right-s-line" size={16} color="var(--brand-yellow-dark)" />
          </button>
        )}
      </div>
      <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 30, lineHeight: 1.1, color: "var(--gray-900)", marginTop: 10 }}>{tile.value}</div>
    </div>
  );
}

/* ===========================================================================
   LANDING
   =========================================================================== */
function LeaveLanding({ periods, history, onView, onApply, onRequest, onEdit, onDelete }) {
  const periodsPg = usePaged(periods, 10);
  const historyPg = usePaged(history, 10);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* hero */}
      <div style={{ background: "#fff", borderRadius: 16, padding: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 24, letterSpacing: "-0.01em", color: "var(--gray-900)" }}>Annual Leave Planner</div>
            <div style={{ fontFamily: "var(--font-ui)", fontSize: 14.5, color: "var(--gray-500)", marginTop: 4 }}>Schedule your casual leave days for the entire year</div>
          </div>
          <Button variant="primary" iconRight="arrow-right-s-line" onClick={onView}>Plan Your Leave</Button>
        </div>
      </div>

      {/* balance tiles (separate container) */}
      <div style={{ background: "#fff", borderRadius: 16, padding: 24 }}>
        <div className="leave-stats">
          {LEAVE_BALANCE.map((t, i) => <BalanceTile key={t.key} tile={t} index={i} onApply={onApply} />)}
        </div>
      </div>

      {/* active requests */}
      <div style={{ background: "#fff", borderRadius: 16, padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
          <Icon name="calendar-check-line" size={20} color="var(--brand-yellow-dark)" />
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 18, color: "var(--gray-900)" }}>Active Leave Requests</div>
        </div>
        {periods.length === 0
          ? <EmptyState compact title="Nothing here yet" subtitle="Request your annual leave to get started."
              cta="Request Leave" onAction={() => onRequest()} />
          : <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table className="bh">
                  <thead><tr><th>Leave Type</th><th>From</th><th>To</th><th>Number of Days</th><th>Reliever</th><th>Status</th><th style={{ width: 90 }}></th></tr></thead>
                  <tbody>
                    {periodsPg.pageItems.map(p => {
                      const st = LEAVE_STATUS[p.status] || LEAVE_STATUS.pending;
                      return (
                        <tr key={p.id}>
                          <td>{p.type}</td>
                          <td>{fmtLeaveDate(p.from)}</td>
                          <td>{fmtLeaveDate(p.to)}</td>
                          <td>{p.days || leaveDays(p.from, p.to)}</td>
                          <td><span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Avatar name={p.reliever} size={26} />{p.reliever}</span></td>
                          <td><StatusBadge variant={st.variant} text={st.text} size="sm" /></td>
                          <td style={{ textAlign: "right" }}>
                            <span style={{ display: "inline-flex", gap: 6, justifyContent: "flex-end" }}>
                              <button className="row-act" onClick={() => onEdit(p)} title="Edit"><Icon name="edit-2-line" size={18} /></button>
                              <button className="row-act" onClick={() => onDelete(p)} title="Delete" style={{ color: "var(--error)" }}><Icon name="delete-bin-6-line" size={18} /></button>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {periods.length > 0 && <div style={{ borderTop: "1px solid var(--divider)" }}><Pagination page={periodsPg.page} pages={periodsPg.pages} onPrev={periodsPg.prev} onNext={periodsPg.next} /></div>}
            </div>}
      </div>

      {/* leave history */}
      <div style={{ background: "#fff", borderRadius: 16, padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
          <Icon name="history-line" size={20} color="var(--brand-yellow-dark)" />
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 18, color: "var(--gray-900)" }}>Leave History</div>
        </div>
        <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          {history.length === 0
            ? <EmptyState compact title="No leave history" subtitle="Approved and past leave will appear here." />
            : <div style={{ overflowX: "auto" }}>
                <table className="bh">
                  <thead><tr><th>Date</th><th>Leave Type</th><th>Number of Days</th><th>Pending Time</th></tr></thead>
                  <tbody>
                    {historyPg.pageItems.map(h => (
                      <tr key={h.id}><td>{fmtLeaveDate(h.date)}</td><td>{h.type}</td><td>{h.days}</td><td>{h.pendingTime}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>}
          {history.length > 0 && <div style={{ borderTop: "1px solid var(--divider)" }}><Pagination page={historyPg.page} pages={historyPg.pages} onPrev={historyPg.prev} onNext={historyPg.next} /></div>}
        </div>
      </div>
    </div>
  );
}

/* ===========================================================================
   FULL PLANNER PAGE (schedule table) + inline builder empty-state
   =========================================================================== */
function Breadcrumb({ trail, onCrumb, style }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, ...style }}>
      {trail.map((c, i) => (
        <React.Fragment key={i}>
          {i > 0 && <Icon name="arrow-right-s-line" size={16} color="var(--gray-300)" />}
          <button onClick={() => c.onClick && c.onClick()} disabled={!c.onClick}
            style={{ border: 0, background: "none", padding: 0, cursor: c.onClick ? "pointer" : "default",
              fontFamily: "var(--font-ui)", fontSize: 14, fontWeight: i === trail.length - 1 ? 600 : 500,
              color: i === trail.length - 1 ? "var(--gray-900)" : "var(--gray-500)" }}>{c.label}</button>
        </React.Fragment>
      ))}
    </div>
  );
}

// inline schedule builder rows (empty planner state)
function ScheduleBuilder({ onCancel, onContinue }) {
  const blank = () => ({ key: Math.random().toString(36).slice(2), from: "", to: "", reliever: "" });
  const [rows, setRows] = useLP([blank()]);
  const setRow = (key, patch) => setRows(rs => rs.map(r => r.key === key ? { ...r, ...patch } : r));
  const addRow = () => setRows(rs => [...rs, blank()]);
  const removeRow = (key) => setRows(rs => rs.length > 1 ? rs.filter(r => r.key !== key) : rs);
  const ready = rows.filter(r => r.from && r.to);
  return (
    <div className="card" style={{ padding: "var(--card-pad, 24px)" }}>
      <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 20, color: "var(--gray-900)" }}>Leave Planner</div>
      <div style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--gray-500)", marginTop: 4, marginBottom: 20 }}>Set your leave schedule for the year</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {rows.map(r => (
          <div key={r.key} className="leave-build-row">
            <Field label="From" style={{ margin: 0 }}><DateField value={r.from} onChange={v => setRow(r.key, { from: v })} /></Field>
            <Field label="To" style={{ margin: 0 }}><DateField value={r.to} onChange={v => setRow(r.key, { to: v })} /></Field>
            <Field label="Reliever" style={{ margin: 0 }}>
              <Combobox value={r.reliever} onChange={v => setRow(r.key, { reliever: v })} options={LEAVE_PEOPLE} avatar placeholder="Select reliever" />
            </Field>
            <button className="row-act" onClick={() => removeRow(r.key)} title="Remove" style={{ color: "var(--error)", alignSelf: "end", marginBottom: 5 }}>
              <Icon name="delete-bin-6-line" size={18} />
            </button>
          </div>
        ))}
      </div>
      <button onClick={addRow} style={{ ...leaveLink, marginTop: 18 }}><Icon name="add-line" size={18} color="var(--brand-yellow-dark)" />Add Another</button>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 22 }}>
        <Button variant="stroke" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" disabled={ready.length === 0} onClick={() => onContinue(ready)}>Continue</Button>
      </div>
    </div>
  );
}

function PlannerTable({ periods, onAdd, onEdit, onDelete }) {
  const pg = usePaged(periods, 10);
  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <div className="table-head" style={{ alignItems: "center", paddingBottom: 16, borderBottom: "1px solid var(--divider)" }}>
        <div>
          <div className="bh-h2" style={{ fontSize: 20 }}>Leave Planner</div>
          <p style={{ marginTop: 4 }}>View your leave schedule for the year</p>
        </div>
        <button onClick={onAdd} style={leaveLink}><Icon name="add-line" size={18} color="var(--brand-yellow-dark)" />Add Leave Period</button>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="bh">
          <thead><tr><th>From</th><th>To</th><th>Number of Days</th><th>Reliever</th><th style={{ width: 90 }}></th></tr></thead>
          <tbody>
            {pg.pageItems.map(p => (
              <tr key={p.id}>
                <td>{fmtLeaveDate(p.from)}</td>
                <td>{fmtLeaveDate(p.to)}</td>
                <td>{p.days || leaveDays(p.from, p.to)}</td>
                <td><span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Avatar name={p.reliever} size={26} />{p.reliever}</span></td>
                <td style={{ textAlign: "right" }}>
                  <span style={{ display: "inline-flex", gap: 6, justifyContent: "flex-end" }}>
                    <button className="row-act" onClick={() => onEdit(p)} title="Edit"><Icon name="edit-2-line" size={18} /></button>
                    <button className="row-act" onClick={() => onDelete(p)} title="Delete" style={{ color: "var(--error)" }}><Icon name="delete-bin-6-line" size={18} /></button>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ borderTop: "1px solid var(--divider)" }}>
        <Pagination page={pg.page} pages={pg.pages} onPrev={pg.prev} onNext={pg.next} />
      </div>
    </div>
  );
}

/* ===========================================================================
   CONTROLLER
   =========================================================================== */
function LeaveRequests({ onToast, onViewAnnouncements, onOpenAnnouncement }) {
  const [periods, setPeriods] = useLP(LEAVE_PERIODS_SEED);
  const [history] = useLP(LEAVE_HISTORY_SEED);
  const [view, setView] = useLP("landing");          // 'landing' | 'planner'
  const [modal, setModal] = useLP(null);             // { kind:'request', presetType } | { kind:'period', initial }
  const [confirm, setConfirm] = useLP(null);         // { intent, payload, row }

  const openRequest = (presetType) => setModal({ kind: "request", presetType });
  const openAdd = () => setModal({ kind: "period", initial: null });
  const openEdit = (row) => setModal({ kind: "period", initial: row });
  const askDelete = (row) => setConfirm({ intent: "delete", row });

  // modal submit → raise the confirm phase
  const submitModal = (payload) => {
    if (modal.kind === "request") setConfirm({ intent: "request", payload });
    else setConfirm({ intent: modal.initial ? "update" : "add", payload, row: modal.initial });
  };

  // builder Continue → commit all rows + toast
  const commitBuilder = (rows) => {
    const added = rows.map(r => ({ id: nextLeaveId(), type: r.type || "Casual Leave", from: r.from, to: r.to,
      reliever: r.reliever, days: leaveDays(r.from, r.to), status: "pending" }));
    setPeriods(p => [...added, ...p]);
    onToast("Leave Plan Submitted", { tone: "success" });
  };

  const commitConfirm = () => {
    const c = confirm;
    if (c.intent === "request") {
      setPeriods(p => [{ id: nextLeaveId(), ...c.payload, status: "pending" }, ...p]);
      onToast("Leave Request Added", { tone: "success" });
    } else if (c.intent === "add") {
      setPeriods(p => [{ id: nextLeaveId(), ...c.payload, status: "pending" }, ...p]);
      onToast("Leave Plan Submitted", { tone: "success" });
    } else if (c.intent === "update") {
      setPeriods(p => p.map(x => x.id === c.row.id ? { ...x, ...c.payload } : x));
      onToast("Leave Plan Updated", { tone: "success" });
    } else if (c.intent === "delete") {
      setPeriods(p => p.filter(x => x.id !== c.row.id));
      onToast("Leave Period Deleted", { tone: "error" });
    }
    setConfirm(null); setModal(null);
  };

  const CONFIRM = {
    request: { title: "Request Leave",        message: "Are you sure you want to submit a request?",       label: "Yes, Submit", icon: "check-line" },
    add:     { title: "Add Leave Plan",        message: "Are you sure you want to submit this leave plan?",  label: "Yes, Submit", icon: "check-line" },
    update:  { title: "Update Leave Plan",     message: "Are you sure you want to update this leave period?", label: "Yes, Update", icon: "check-line" },
    delete:  { title: "Delete Leave Period",   message: "Are you sure you want to delete this leave period?", label: "Yes, Delete", icon: "delete-bin-6-line" },
  };

  // main content per view
  const main = view === "planner"
    ? (periods.length === 0
        ? <ScheduleBuilder onCancel={() => setView("landing")} onContinue={(rows) => { commitBuilder(rows); }} />
        : <PlannerTable periods={periods} onAdd={openAdd} onEdit={openEdit} onDelete={askDelete} />)
    : <LeaveLanding periods={periods} history={history} onView={() => setView("planner")} onApply={openRequest}
        onRequest={openRequest} onEdit={openEdit} onDelete={askDelete} />;

  return (
    <div className="leave-page" style={{ display: "flex", gap: 24, height: "100%", padding: "0 0 0 32px", boxSizing: "border-box" }}>
      <div style={{ flex: 1, minWidth: 0, height: "100%", overflowY: "auto", paddingRight: 4 }}>
        <div style={{ paddingTop: 24, paddingBottom: 72 }}>
          {view === "planner" && <Breadcrumb trail={[{ label: "Leave Requests", onClick: () => setView("landing") }, { label: "Leave Planner" }]} />}
          {main}
        </div>
      </div>
      <AnnouncementsRail onViewAll={onViewAnnouncements} onOpen={onOpenAnnouncement} />

      {modal && modal.kind === "request" && (
        <RequestLeaveModal presetType={modal.presetType} onClose={() => setModal(null)} onSubmit={submitModal} />
      )}
      {modal && modal.kind === "period" && (
        <LeavePeriodModal initial={modal.initial} onClose={() => setModal(null)} onSubmit={submitModal} />
      )}
      {confirm && (() => {
        const c = CONFIRM[confirm.intent];
        return <ConfirmModal title={c.title} message={c.message} confirmLabel={c.label} confirmIcon={c.icon}
          onConfirm={commitConfirm} onClose={() => setConfirm(null)} />;
      })()}
    </div>
  );
}

Object.assign(window, { LeaveRequests });
