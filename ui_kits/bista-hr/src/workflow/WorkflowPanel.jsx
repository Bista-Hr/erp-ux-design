// BISTA HR · workflow/WorkflowPanel — drop-in closure manager for detail views.
// Renders three cards (matching the DetailCard pattern): Workflow Status (phase
// stepper), Closure Controls (mandatory-activity checklist, interactive once the
// record is Approved), and Audit Trail. Gates "Mark as Completed" on every
// applicable control being confirmed. Persists via onChange({ ...partial }) which
// the host screen merges into the record; logs every action to the audit trail.
const { useState: useWfp } = React;
const WF_ACTOR = "Peter Bosrotsi (P&C)";

function WorkflowPanel({ workflowType, record, onChange, onToast, readOnly }) {
  const [confirm, setConfirm] = useWfp(false);
  const applicable = (window.WF_CONTROLS[workflowType] || []).slice();
  const status = window.wfNormalize(record.wfStatus || record.status);
  const phase = window.wfPhase(status);
  const closure = record.closure || {};
  const audit = record.audit || [];
  const completed = status === "Completed";
  const declined = status === "Declined";
  // closure controls become actionable once the record clears approval
  const inClosure = !readOnly && !declined && (status === "Approved" || phase === "Processing" || phase === "Closure") && !completed;
  const allConfirmed = applicable.every(id => (closure[id] || {}).done);

  const toggleControl = (id) => {
    const cur = closure[id] || {};
    const next = cur.done ? { done: false } : { done: true, actor: WF_ACTOR, at: window.wfNow() };
    const nextClosure = { ...closure, [id]: next };
    const nextAudit = next.done
      ? [...audit, { action: `${window.CLOSURE_CONTROLS[id].label} confirmed`, decision: "Confirmed", actor: WF_ACTOR, at: window.wfNow() }]
      : audit;
    // advancing into the processing phase the moment the first control is confirmed
    const bump = (status === "Approved" && next.done) ? { wfStatus: "Submitted in HR System", status: "Submitted in HR System" } : {};
    onChange({ closure: nextClosure, audit: nextAudit, ...bump });
  };

  const doComplete = () => {
    const entry = { action: "Workflow closed", decision: "Completed", actor: WF_ACTOR, at: window.wfNow(), note: "All mandatory closure controls confirmed." };
    onChange({ wfStatus: "Completed", status: "Completed", audit: [...audit, entry] });
    setConfirm(false);
    onToast && onToast(`${workflowType === "JobTitle" ? "Job Title" : workflowType} Workflow Completed`, { tone: "success" });
  };

  return (
    <React.Fragment>
      <div className="card" style={{ padding: 0 }}>
        <DetailCard icon="route-line" title="Workflow Status">
          <WorkflowProgress status={status} />
        </DetailCard>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <DetailCard icon="shield-check-line" title="Closure Controls"
          action={<span style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: allConfirmed ? "#16A34A" : "var(--gray-500)" }}>
            {applicable.filter(id => (closure[id] || {}).done).length} / {applicable.length} confirmed</span>}>
          {!inClosure && !completed && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--gray-500)" }}>
              <Icon name="lock-2-line" size={15} color="var(--gray-400)" />
              {declined ? "Workflow was declined — closure controls do not apply." : "Closure controls unlock once the request is approved."}
            </div>
          )}
          <ClosureControls applicable={applicable} state={closure} onToggle={toggleControl} readOnly={!inClosure} />
          {inClosure && (
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
              <Button variant="primary" icon="checkbox-circle-line" disabled={!allConfirmed} onClick={() => setConfirm(true)}>Mark as Completed</Button>
            </div>
          )}
          {completed && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, fontFamily: "var(--font-ui)", fontSize: 13, color: "#16A34A" }}>
              <Icon name="checkbox-circle-fill" size={18} color="#16A34A" />Workflow completed — all mandatory closure controls confirmed.
            </div>
          )}
        </DetailCard>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <DetailCard icon="history-line" title="Audit Trail">
          <AuditTrail entries={audit} />
        </DetailCard>
      </div>

      {confirm && (
        <ConfirmModal title="Complete Workflow" message="Confirm that all mandatory closure controls are satisfied and mark this workflow as Completed?"
          confirmLabel="Yes, Complete" confirmIcon="checkbox-circle-line" cancelLabel="No"
          onConfirm={doComplete} onClose={() => setConfirm(false)} />
      )}
    </React.Fragment>
  );
}

Object.assign(window, { WorkflowPanel });
