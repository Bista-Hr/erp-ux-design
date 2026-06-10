// BISTA HR · workflow/Workflow — shared cross-workflow lifecycle system.
// Implements the customer's governance spec:
//   • 16 recommended workflow status values, grouped into 4 phases.
//   • Cross-Workflow Closure Controls (approval, documents, system, payroll,
//     access, audit, closure) — a mandatory checklist gating completion.
//   • An audit trail (date/time · actor · action · decision · evidence).
// Reused by Promotions, Transfers, Job Title and Exit detail views via
// <WorkflowPanel>. Presentational pieces (WorkflowProgress / ClosureControls /
// AuditTrail) are exported too so screens can compose their own layouts.
const { useState: useWf } = React;

// ---- 16 status values → phase + badge variant (StatusBadge variants) ----
const WF_STATUS = [
  { key: "Draft",                     phase: "Review",     variant: "draft"     },
  { key: "Submitted",                 phase: "Review",     variant: "info"      },
  { key: "Under P&C/P&CBP Review",    phase: "Review",     variant: "review"    },
  { key: "Returned for Clarification",phase: "Review",     variant: "warning"   },
  { key: "Pending Head P&C Approval", phase: "Approval",   variant: "pending"   },
  { key: "Approved",                  phase: "Approval",   variant: "approved"  },
  { key: "Declined",                  phase: "Approval",   variant: "rejected"  },
  { key: "Submitted in HR System",    phase: "Processing", variant: "info"      },
  { key: "Employee Notified",         phase: "Processing", variant: "info"      },
  { key: "Handover Pending",          phase: "Processing", variant: "warning"   },
  { key: "Stakeholder Action Pending",phase: "Processing", variant: "warning"   },
  { key: "System Update Completed",   phase: "Processing", variant: "success"   },
  { key: "Payroll Action Completed",  phase: "Processing", variant: "success"   },
  { key: "Access Revocation Completed",phase:"Processing", variant: "success"   },
  { key: "Closure Review",            phase: "Closure",    variant: "review"    },
  { key: "Completed",                 phase: "Closure",    variant: "completed" },
];
const WF_PHASES = ["Review", "Approval", "Processing", "Closure"];
const WF_INDEX = WF_STATUS.reduce((a, s, i) => (a[s.key] = i, a), {});
const wfVariant = (status) => (WF_STATUS[WF_INDEX[status]] || {}).variant || "default";
const wfPhase = (status) => (WF_STATUS[WF_INDEX[status]] || {}).phase || "Review";
// legacy short statuses → lifecycle status (so existing seed data keeps working)
const WF_ALIAS = { Pending: "Pending Head P&C Approval", "In Progress": "Submitted in HR System",
  Cleared: "Closure Review", Closed: "Completed", Rejected: "Declined" };
const wfNormalize = (s) => WF_ALIAS[s] || s;

// ---- Cross-workflow closure controls (the spec table, section 6) ----
const CLOSURE_CONTROLS = {
  approval:  { label: "Approval Control",  icon: "shield-check-line",   req: "Clear approval point before system submission or employee notification." },
  documents: { label: "Document Upload",   icon: "attachment-2",        req: "Letters, approvals, handover notes & supporting documents uploaded." },
  system:    { label: "System Control",    icon: "database-2-line",     req: "Core HR updated as the source of truth before downstream systems." },
  payroll:   { label: "Payroll Control",   icon: "money-dollar-circle-line", req: "Payroll impact assessed and actioned where applicable." },
  access:    { label: "Access Control",    icon: "key-2-line",          req: "S&IT and BOBS notified where access, location or status changes." },
  audit:     { label: "Audit Trail",       icon: "history-line",        req: "Each stage carries date/time, actor, action, decision & evidence." },
  closure:   { label: "Closure Control",   icon: "checkbox-circle-line",req: "P&C/P&CBP confirm all mandatory activities before completion." },
};
// which controls apply to each workflow type
const WF_CONTROLS = {
  Promotion: ["approval", "documents", "system", "payroll", "audit", "closure"],
  Transfer:  ["approval", "documents", "system", "payroll", "access", "audit", "closure"],
  JobTitle:  ["approval", "documents", "system", "payroll", "audit", "closure"],
  Exit:      ["approval", "documents", "system", "payroll", "access", "audit", "closure"],
};

const wfNow = () => new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

/* ---------- WorkflowProgress: 4-phase stepper + exact status ---------- */
function WorkflowProgress({ status }) {
  const cur = wfNormalize(status);
  const declined = cur === "Declined" || cur === "Returned for Clarification";
  const curPhase = wfPhase(cur);
  const curPhaseIdx = WF_PHASES.indexOf(curPhase);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
        {WF_PHASES.map((p, i) => {
          const done = i < curPhaseIdx || cur === "Completed";
          const active = i === curPhaseIdx && cur !== "Completed";
          const tone = declined && active ? "#EF4444" : done ? "#10B981" : active ? "var(--brand-yellow-dark)" : "var(--gray-200)";
          const txt = declined && active ? "#EF4444" : (done || active) ? "var(--gray-900)" : "var(--gray-400)";
          return (
            <React.Fragment key={p}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 92 }}>
                <span style={{ width: 30, height: 30, borderRadius: "50%", background: (done || active) ? tone : "#fff",
                  border: `2px solid ${tone}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto" }}>
                  {done
                    ? <Icon name="check-line" size={16} color="#fff" />
                    : <span style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 13, color: active ? "#fff" : "var(--gray-400)" }}>{i + 1}</span>}
                </span>
                <span style={{ fontFamily: "var(--font-ui)", fontWeight: active ? 600 : 500, fontSize: 12, color: txt, textAlign: "center" }}>{p}</span>
              </div>
              {i < WF_PHASES.length - 1 && <span style={{ flex: 1, height: 2, background: i < curPhaseIdx || cur === "Completed" ? "#10B981" : "var(--gray-200)", marginTop: -18 }} />}
            </React.Fragment>
          );
        })}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--gray-500)" }}>Current status:</span>
        <StatusBadge variant={wfVariant(cur)} text={cur} size="sm" />
      </div>
    </div>
  );
}

/* ---------- ClosureControls: mandatory-activity checklist ---------- */
function ClosureControls({ applicable, state, onToggle, readOnly }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {applicable.map(id => {
        const c = CLOSURE_CONTROLS[id];
        const st = state[id] || {};
        const done = !!st.done;
        return (
          <div key={id} style={{ display: "flex", alignItems: "flex-start", gap: 12, border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)", padding: "12px 14px", background: done ? "#F0FDF4" : "#fff" }}>
            <span style={{ width: 34, height: 34, borderRadius: 8, background: done ? "#DCFCE7" : "var(--gray-50)",
              display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto" }}>
              <Icon name={c.icon} size={18} color={done ? "#16A34A" : "var(--gray-500)"} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 14, color: "var(--gray-900)" }}>{c.label}</span>
                {done && <StatusBadge variant="success" text="Confirmed" size="sm" />}
              </div>
              <div style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--gray-500)", marginTop: 2 }}>{c.req}</div>
              {done && st.at && <div style={{ fontFamily: "var(--font-ui)", fontSize: 11.5, color: "var(--gray-400)", marginTop: 4 }}>{st.actor} · {st.at}</div>}
            </div>
            {!readOnly && <div style={{ flex: "0 0 auto", paddingTop: 2 }}><Checkbox checked={done} onChange={() => onToggle(id)} /></div>}
          </div>
        );
      })}
    </div>
  );
}

/* ---------- AuditTrail: stamped action timeline ---------- */
function AuditTrail({ entries }) {
  if (!entries || entries.length === 0) {
    return <div style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--gray-400)", padding: "8px 0" }}>No activity recorded yet.</div>;
  }
  const toneFor = (d) => /declin|reject|return/i.test(d || "") ? "#EF4444" : /approv|complet|confirm/i.test(d || "") ? "#10B981" : "var(--brand-yellow-dark)";
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {entries.map((e, i) => (
        <div key={i} style={{ display: "flex", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "0 0 auto" }}>
            <span style={{ width: 11, height: 11, borderRadius: "50%", background: toneFor(e.decision || e.action), marginTop: 4 }} />
            {i < entries.length - 1 && <span style={{ width: 2, flex: 1, background: "var(--gray-200)", minHeight: 16 }} />}
          </div>
          <div style={{ paddingBottom: i < entries.length - 1 ? 16 : 0 }}>
            <div style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 13.5, color: "var(--gray-900)" }}>{e.action}{e.decision ? ` — ${e.decision}` : ""}</div>
            <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-500)", marginTop: 2 }}>{e.actor} · {e.at}</div>
            {e.note && <div style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--gray-600)", marginTop: 3 }}>{e.note}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, {
  WF_STATUS, WF_PHASES, WF_INDEX, WF_CONTROLS, CLOSURE_CONTROLS,
  wfVariant, wfPhase, wfNormalize, wfNow,
  WorkflowProgress, ClosureControls, AuditTrail,
});
