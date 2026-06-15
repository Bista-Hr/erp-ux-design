// BISTA HR · workflow/WorkflowPanel — audit trail for detail views.
// Renders a single Audit Trail card (matching the DetailCard pattern): a
// date/time · actor · action · decision log. The trail is the single source of
// truth for what happened and when — each stage (approval, decline, etc.) is
// stamped as it occurs, so a separate Workflow Status stepper and Closure
// Controls checklist are no longer needed.
function WorkflowPanel({ record }) {
  const audit = record.audit || [];
  return (
    <div className="card" style={{ padding: 0 }}>
      <DetailCard icon="history-line" title="Audit Trail">
        <AuditTrail entries={audit} />
      </DetailCard>
    </div>
  );
}

Object.assign(window, { WorkflowPanel });
