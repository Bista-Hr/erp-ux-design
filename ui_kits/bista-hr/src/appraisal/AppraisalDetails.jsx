// BISTA HR · appraisal/AppraisalDetails — read-only appraisal summary.
//   Objective Scores tab : per-perspective sections (Objective → scored Tasks)
//   Behavioural Scores tab : behavioural competency sections (Task → Rating → Ranking)
const { useState: useAD } = React;

const APP_TINT_BG = { cream: "#FEFBEF", pink: "#FDF4F4" };

function ScoreSection({ persp, data, onEdit }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 18, color: "var(--gray-900)" }}>{persp.name} ({persp.weight}%)</div>
        <button onClick={onEdit} style={{ display: "inline-flex", alignItems: "center", gap: 5, border: 0, background: "none", cursor: "pointer",
          fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 13.5, color: "var(--brand-yellow-dark)" }}>Edit <Icon name="edit-2-line" size={15} color="var(--brand-yellow-dark)" /></button>
      </div>
      <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid var(--divider)" }}>
        {data.objectives.map((o, oi) => (
          <React.Fragment key={o.id}>
            <div style={{ padding: "13px 16px", background: oi % 2 ? APP_TINT_BG.pink : APP_TINT_BG.cream }}>
              <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-400)" }}>Objective</div>
              <div style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 14, color: "var(--gray-900)", marginTop: 3 }}>{o.objective}</div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="bh">
                <thead><tr><th>Task</th><th>KPI</th><th>Actual Score</th><th>Score</th><th>Rating</th><th>Ranking</th></tr></thead>
                <tbody>
                  {o.tasks.map(t => (
                    <tr key={t.id}><td>{t.task}</td><td>{t.kpi}</td><td>{t.actual}</td><td>{t.score}</td><td>{t.rating}</td><td>{rankLabel(t.rating)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function BehaviouralSection({ sec }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 16, color: "var(--gray-900)", marginBottom: 10 }}>{sec.title}</div>
      <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid var(--divider)" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="bh">
            <thead><tr><th>Task</th><th style={{ width: 120 }}>Rating (1–5)</th><th style={{ width: 160 }}>Ranking</th></tr></thead>
            <tbody>
              {sec.tasks.map(t => <tr key={t.id}><td>{t.task}</td><td>{t.rating}</td><td>{rankLabel(t.rating)}</td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AppraisalDetails({ card, scores, behavioural, onEdit }) {
  const [tab, setTab] = useAD("Objective Scores");
  return (
    <div className="card" style={{ padding: "var(--card-pad, 24px)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 18 }}>
        <div>
          <div className="bh-h2" style={{ fontSize: 24 }}>Assessment Details</div>
          <div className="bh-body" style={{ marginTop: 4 }}>View all weight of the perspectives and objectives you submitted</div>
        </div>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#ECFDF3", border: "1px solid #ABEFC6", borderRadius: 999,
          padding: "7px 14px", fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 13.5, color: "#16794C" }}>
          <Icon name="checkbox-circle-fill" size={16} color="#17B26A" />Submitted
        </span>
      </div>
      <div style={{ marginBottom: 22 }}><Segmented items={["Objective Scores", "Behavioural Scores"]} active={tab} onChange={setTab} /></div>
      {tab === "Objective Scores"
        ? APP_PERSPECTIVES.map((p, i) => <ScoreSection key={p.key} persp={p} data={scores[i]} onEdit={() => onEdit(i)} />)
        : behavioural.map(sec => <BehaviouralSection key={sec.id} sec={sec} />)}
    </div>
  );
}

Object.assign(window, { AppraisalDetails, ScoreSection, BehaviouralSection });
