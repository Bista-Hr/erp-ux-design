// BISTA HR · learning/Evaluation — Learning & Development ▸ Evaluation (Kirkpatrick).
//   list   : evaluation records (L2 learning shift · L3 application · L4 impact) per learner/program
//   detail : L2 pre/post bars + delta, L3 action-plan progress, L4 impact scoring
//            (the MANAGER's L4 score is the one the bank uses). Writes window.HRStores.ldEvaluations.
const { useState: useEv, useEffect: useEvEffect } = React;

const IMPACT_CATEGORIES = ["Improved customer experience", "Faster turnaround", "Error reduction", "Increased income", "Cost saving", "Risk reduction"];
const EV_STAGE_VARIANT = { "Learning (L2)": "info", "Application (L3)": "pending", "Impact (L4)": "approved" };

function Bar({ label, value, color }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--gray-600)" }}>{label}</span>
        <span style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 13, color: "var(--gray-900)" }}>{value == null ? "—" : value + "%"}</span>
      </div>
      <div style={{ height: 10, borderRadius: 999, background: "var(--gray-100)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: (value || 0) + "%", background: color, borderRadius: 999, transition: "width .4s" }} />
      </div>
    </div>
  );
}
function ScorePicker({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} onClick={() => onChange(n)} style={{ width: 34, height: 34, borderRadius: 8, cursor: "pointer",
          border: `1.5px solid ${value === n ? "var(--brand-yellow-dark)" : "var(--gray-200)"}`,
          background: value === n ? "var(--brand-yellow)" : "#fff", color: value === n ? "var(--brand-ink)" : "var(--gray-500)",
          fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 14 }}>{n}</button>
      ))}
    </div>
  );
}

function EvaluationDetail({ rec, onScore, onToast }) {
  const delta = (rec.l2Pre != null && rec.l2Post != null) ? rec.l2Post - rec.l2Pre : null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title={rec.learner} subtitle={rec.program}
        actions={<StatusBadge variant={EV_STAGE_VARIANT[rec.stage] || "info"} text={rec.stage} />} />
      <div className="pd-split">
        <div className="pd-main" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card" style={{ padding: 0 }}>
            <DetailCard icon="scales-3-line" title="Level 2 · Learning (pre / post)">
              {rec.l2Pre == null
                ? <EmptyState compact title="Not assessed yet" subtitle="The learner completes the pre-course self-assessment at acceptance, and the same questions post-course." />
                : <div>
                    <Bar label="Pre-course self-assessment" value={rec.l2Pre} color="var(--gray-400)" />
                    <Bar label="Post-course self-assessment" value={rec.l2Post} color="var(--brand-blue)" />
                    <div style={{ marginTop: 8, padding: "12px 14px", borderRadius: 10, background: "var(--success-tint)", display: "flex", alignItems: "center", gap: 10 }}>
                      <Icon name="arrow-up-line" size={18} color="var(--success-deep)" />
                      <span style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--success-deep)" }}><b>+{delta}% shift</b> — evidences that learning took place.</span>
                    </div>
                  </div>}
            </DetailCard>
          </div>
          <div className="card" style={{ padding: 0 }}>
            <DetailCard icon="task-line" title="Level 3 · Application (action plan)">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <StatusBadge variant={rec.l3Status === "Completed" ? "completed" : rec.l3Status === "In Progress" ? "pending" : "draft"} text={rec.l3Status} size="sm" />
                <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--gray-500)" }}>{rec.l3Done} / {rec.l3Actions} actions complete</span>
              </div>
              <div style={{ height: 10, borderRadius: 999, background: "var(--gray-100)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: (rec.l3Actions ? (rec.l3Done / rec.l3Actions) * 100 : 0) + "%", background: "var(--success)", borderRadius: 999 }} />
              </div>
              <div style={{ marginTop: 12, fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--gray-500)" }}>The learner builds an IDP-style action plan post-course; the line manager tracks progress and has final sign-off. Visible to the HRBP alongside IDP / PIP / objectives.</div>
            </DetailCard>
          </div>
        </div>
        <div className="pd-side">
          <div className="card" style={{ padding: 0 }}>
            <DetailCard icon="rocket-2-line" title="Level 4 · Business Impact">
              <DetailPanel items={[{ label: "Impact category", value: rec.impactCategory }]} tint="cream" cols={1} />
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <div style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--gray-500)", marginBottom: 6 }}>Learner's self-score</div>
                  <ScorePicker value={rec.l4LearnerScore} onChange={(n) => onScore(rec.id, "l4LearnerScore", n)} />
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--gray-900)", fontWeight: 600, marginBottom: 6, display: "inline-flex", alignItems: "center", gap: 6 }}>Manager's score <span className="bh-chip" style={{ color: "var(--brand-blue)", background: "#F4F7FF", fontSize: 11 }}>used by the bank</span></div>
                  <ScorePicker value={rec.l4ManagerScore} onChange={(n) => { onScore(rec.id, "l4ManagerScore", n); onToast("Manager impact score saved", { tone: "success" }); }} />
                </div>
              </div>
            </DetailCard>
          </div>
        </div>
      </div>
    </div>
  );
}

function EvaluationScreen({ onToast, onSubPage }) {
  const [records, setRecords] = useStore(window.HRStores.ldEvaluations);
  const [q, setQ] = useEv("");
  const [stage, setStage] = useEv("All");
  const [view, setView] = useEv({ name: "list" });

  useEvEffect(() => {
    if (!onSubPage) return;
    if (view.name === "detail") { const r = records.find(x => x.id === view.id); onSubPage({ trail: [{ label: "Evaluation", onClick: () => setView({ name: "list" }) }, { label: r ? r.learner : "Evaluation" }] }); }
    else onSubPage(null);
    return () => onSubPage(null);
  }, [view, records]);

  const onScore = (id, field, val) => setRecords(rs => rs.map(r => r.id === id ? { ...r, [field]: val } : r));

  // all hooks must run before any conditional return (rules of hooks) — compute list + pagination first
  const STAGES = ["All", "Learning (L2)", "Application (L3)", "Impact (L4)"];
  const filtered = records.filter(r => (stage === "All" || r.stage === stage) && (q === "" || (r.learner + r.program).toLowerCase().includes(q.toLowerCase())));
  const pg = usePaged(filtered, 9);

  if (view.name === "detail") { const r = records.find(x => x.id === view.id); if (r) return <EvaluationDetail rec={r} onScore={onScore} onToast={onToast} />; }

  const avgShift = (() => { const w = records.filter(r => r.l2Pre != null && r.l2Post != null); return w.length ? Math.round(w.reduce((s, r) => s + (r.l2Post - r.l2Pre), 0) / w.length) : 0; })();
  const stats = [
    { title: "Evaluations", value: records.length },
    { title: "Avg L2 shift", value: "+" + avgShift + "%" },
    { title: "L3 in progress", value: records.filter(r => r.l3Status === "In Progress").length },
    { title: "L4 manager-scored", value: records.filter(r => r.l4ManagerScore != null).length },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title="Evaluation" subtitle="Kirkpatrick L2–L4 — did learning happen, was it applied, and did it have impact?" />
      <div className="card cq-stats" style={{ padding: "var(--card-pad, 24px)" }}>
        <div className="cq-stat-grid">{stats.map((s, i) => <UI.StatCard key={s.title} title={s.title} value={s.value} index={i} />)}</div>
      </div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="rounded-md border m-6 overflow-hidden">
          <UI.FilterBar left={<Segmented items={STAGES} active={stage} onChange={setStage} />} search={q} onSearch={setQ} searchPlaceholder="Search learners…" />
          {filtered.length === 0
            ? <EmptyState title="No evaluations" subtitle="Evaluation records appear once learners accept a program." />
            : <table className="bh">
                <thead><tr><th>Learner</th><th>Program</th><th>L2 Learning</th><th>L3 Application</th><th>L4 Impact (mgr)</th><th>Stage</th><th style={{ width: 48 }}></th></tr></thead>
                <tbody>
                  {pg.pageItems.map(r => { const delta = (r.l2Pre != null && r.l2Post != null) ? r.l2Post - r.l2Pre : null; return (
                    <tr key={r.id} style={{ cursor: "pointer" }} onClick={() => setView({ name: "detail", id: r.id })}>
                      <td><span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}><Avatar name={r.learner} size={32} /><span style={{ fontWeight: 500, color: "var(--gray-900)" }}>{r.learner}</span></span></td>
                      <td>{r.program}</td>
                      <td>{delta == null ? <span style={{ color: "var(--gray-300)" }}>—</span> : <span style={{ color: "var(--success-deep)", fontWeight: 600 }}>+{delta}%</span>}</td>
                      <td>{r.l3Actions ? `${r.l3Done}/${r.l3Actions}` : "—"}</td>
                      <td>{r.l4ManagerScore != null ? <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Icon name="star-fill" size={14} color="var(--brand-yellow-dark)" />{r.l4ManagerScore}/5</span> : <span style={{ color: "var(--gray-300)" }}>—</span>}</td>
                      <td><StatusBadge variant={EV_STAGE_VARIANT[r.stage] || "info"} text={r.stage} size="sm" /></td>
                      <td style={{ textAlign: "right" }} onClick={e => e.stopPropagation()}><UI.RowActions actions={[{ label: "View Details", short: "View", icon: "eye-line", onClick: () => setView({ name: "detail", id: r.id }) }]} /></td>
                    </tr>
                  ); })}
                </tbody>
              </table>}
          {filtered.length > 0 && <div style={{ borderTop: "1px solid var(--divider)" }}><Pagination page={pg.page} pages={pg.pages} onPrev={pg.prev} onNext={pg.next} /></div>}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { EvaluationScreen });
