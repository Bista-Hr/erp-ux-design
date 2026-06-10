// BISTA HR · target/AssessmentDetails — read-only view of a submitted assessment.
// Renders each perspective as a section (Objective → Employee Goal → Tasks) with the
// perspective tint on the objective row, a green job-level pill, and per-section Edit.
function DCell({ label, children }) {
  return <div style={{ minWidth: 0 }}><div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-400)" }}>{label}</div>
    <div style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 14, color: "var(--gray-900)", marginTop: 3 }}>{children}</div></div>;
}

const TINT_BG = { cream: "#FEFBEF", pink: "#FDF4F4", lavender: "#F4F5FE" };

function PerspectiveSection({ persp, data, onEdit }) {
  return (
    <div style={{ borderRadius: 14, padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 18, color: "var(--gray-900)" }}>{persp.name} ({persp.weight}%)</div>
        <button onClick={onEdit} style={{ display: "inline-flex", alignItems: "center", gap: 5, border: 0, background: "none", cursor: "pointer",
          fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 13.5, color: "var(--brand-yellow-dark)" }}>Edit <Icon name="edit-2-line" size={15} color="var(--brand-yellow-dark)" /></button>
      </div>
      <div style={{ border: "1px solid var(--divider)", borderRadius: 12, overflow: "hidden" }}>
        {data.objectives.map((o, oi) => (
          <React.Fragment key={o.id}>
            {/* objective row (tinted) */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, padding: "14px 16px", background: TINT_BG[persp.tint] || "#fff", borderTop: oi === 0 ? 0 : "1px solid var(--divider)" }}>
              <DCell label="Objective">{o.objective || "—"}</DCell>
              <div style={{ minWidth: 90 }}><DCell label="Weight">{o.weight || 0}</DCell></div>
            </div>
            {o.goals.map(g => (
              <React.Fragment key={g.id}>
                <div className="tgt-d-row" style={{ background: "var(--gray-50)", borderTop: "1px solid var(--divider)" }}>
                  <DCell label="Employee Goal">{g.goal || "—"}</DCell>
                  <DCell label="Annual Target">{g.target || "—"}</DCell>
                  <DCell label="KPI">{g.kpi || "—"}</DCell>
                  <DCell label="Weight">{g.weight || 0}</DCell>
                </div>
                {g.tasks.map(t => (
                  <div key={t.id} className="tgt-d-row" style={{ borderTop: "1px solid var(--divider)" }}>
                    <DCell label="Task">{t.task || "—"}</DCell>
                    <DCell label="Annual Target">{t.target || "—"}</DCell>
                    <DCell label="KPI">{t.kpi || "—"}</DCell>
                    <DCell label="Weight">{t.weight || 0}</DCell>
                  </div>
                ))}
              </React.Fragment>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function AssessmentDetails({ card, perspectives, onEdit }) {
  const level = perspectives?.[0]?.level || JOB_LEVELS[0];
  return (
    <div className="card" style={{ padding: "var(--card-pad, 24px)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 22 }}>
        <div>
          <div className="bh-h2" style={{ fontSize: 24 }}>Assessment Details</div>
          <div className="bh-body" style={{ marginTop: 4 }}>View all weight of the perspectives and objectives you submitted</div>
        </div>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#ECFDF3", border: "1px solid #ABEFC6", borderRadius: 999,
          padding: "7px 14px", fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 13.5, color: "#16794C" }}>
          <Icon name="checkbox-circle-fill" size={16} color="#17B26A" />{level}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {PERSPECTIVES.map((p, i) => <PerspectiveSection key={p.key} persp={p} data={perspectives[i]} onEdit={() => onEdit(i)} />)}
      </div>
    </div>
  );
}

Object.assign(window, { AssessmentDetails, PerspectiveSection });
