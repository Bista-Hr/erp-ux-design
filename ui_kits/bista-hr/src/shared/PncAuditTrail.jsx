// BISTA HR · shared/PncAuditTrail — reusable audit trail for P&C request cycles
// (Exit, Promotions, Transfers, Job Title). Entries mirror the backend shape:
//   { id, action (enum int), description, actorName, occurredAt (ISO), justificationReason, staffId }
// Action enum: 0 Submitted · 1 Updated · 2 Interview Completed · 3 Approved · 4 Rejected
//              5 Closed · 6 Resubmitted (after rejection review) · 7 Employee Accepted
const PNC_AUDIT_ACTIONS = {
  0: { tone: "var(--brand-yellow-dark)" },
  1: { tone: "var(--brand-yellow-dark)" },
  2: { tone: "#10B981" },
  3: { tone: "#10B981" },
  4: { tone: "#EF4444" },
  5: { tone: "#10B981" },
  6: { tone: "var(--brand-yellow-dark)" },
  7: { tone: "#10B981" },
};
const pncAuditAt = (iso) => { const d = new Date(iso); return isNaN(d) ? iso : d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) + " · " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }); };
const pncAuditId = () => (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now() + Math.random());
const pncText = (s) => String(s || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const pncEntry = ({ action, description, justificationReason = null, staffId = "", actorName = "Peter Bosrotsi (P&C)" }) =>
  ({ id: pncAuditId(), action, description, actorName, occurredAt: new Date().toISOString(), justificationReason, staffId });

function PncAuditTrail({ entries }) {
  if (!entries || entries.length === 0) return <div style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--gray-400)", padding: "8px 0" }}>No activity recorded yet.</div>;
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {entries.map((e, i) => { const meta = PNC_AUDIT_ACTIONS[e.action] || { tone: "var(--brand-yellow-dark)" }; return (
        <div key={e.id || i} style={{ display: "flex", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "0 0 auto" }}>
            <span style={{ width: 11, height: 11, borderRadius: "50%", background: meta.tone, marginTop: 5 }} />
            {i < entries.length - 1 && <span style={{ width: 2, flex: 1, background: "var(--gray-200)", minHeight: 16 }} />}
          </div>
          <div style={{ flex: 1, minWidth: 0, paddingBottom: i < entries.length - 1 ? 18 : 0 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <span style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 13.5, color: "var(--gray-900)" }}>{e.actorName}{e.staffId ? <span style={{ fontFamily: "var(--font-ui)", fontWeight: 400, fontSize: 12, color: "var(--gray-400)" }}> · {e.staffId}</span> : null}</span>
              <span style={{ marginLeft: "auto", fontFamily: "var(--font-ui)", fontSize: 11.5, color: "var(--gray-400)", whiteSpace: "nowrap" }}>{pncAuditAt(e.occurredAt)}</span>
            </div>
            {e.description && <div style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--gray-600)", marginTop: 4, lineHeight: "18px" }}>{pncText(e.description)}</div>}
            {e.justificationReason && (
              <div style={{ marginTop: 8, background: "#F6F8FA", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px" }}>
                <div style={{ fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 600, letterSpacing: .3, textTransform: "uppercase", color: "var(--gray-400)", marginBottom: 4 }}>Comment</div>
                <div style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, lineHeight: "19px", color: "var(--gray-700)", whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{pncText(e.justificationReason)}</div>
              </div>
            )}
          </div>
        </div>
      ); })}
    </div>
  );
}

// Right-side drawer wrapper: employee header card (avatar + name + sub + status badge) + trail.
function AuditTrailDrawer({ open, onClose, name, sub, badge, entries }) {
  return (
    <Drawer open={open} onClose={onClose} title="Audit Trail" icon="history-line" width={520}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#F6F8FA", borderRadius: 10, padding: "14px 16px" }}>
          <Avatar name={name} />
          <div>
            <div style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 14.5, color: "var(--gray-900)" }}>{name}</div>
            <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-400)", lineHeight: 1.3 }}>{sub}</div>
          </div>
          {badge && <div style={{ marginLeft: "auto" }}>{badge}</div>}
        </div>
        <PncAuditTrail entries={entries} />
      </div>
    </Drawer>
  );
}

Object.assign(window, { PNC_AUDIT_ACTIONS, pncAuditAt, pncAuditId, pncEntry, PncAuditTrail, AuditTrailDrawer });
