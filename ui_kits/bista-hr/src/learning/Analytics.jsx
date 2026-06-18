// BISTA HR · learning/Analytics — Learning & Development ▸ Analytics & Reporting.
// The "answer engine": who's enrolled, how many trained, what it cost, budget burn, learning impact,
// plus standard + custom reports (export). Reads every L&D store live (single source of truth).
const { useState: useAn } = React;

const LD_BANK_BUDGET = 500000; // GHS — demo approved L&D budget
const DEPT_BUDGET = { Finance: 90000, "Information Technology": 80000, Operations: 70000, "Human Resource": 40000, Marketing: 45000, Credit: 60000 };

function Donut({ segments, size = 132, label, value }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = size / 2 - 10, c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--gray-100)" strokeWidth={14} />
        {segments.map((s, i) => { const len = (s.value / total) * c; const el = <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.color} strokeWidth={14} strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} transform={`rotate(-90 ${size / 2} ${size / 2})`} strokeLinecap="butt" />; offset += len; return el; })}
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 24, color: "var(--gray-900)" }}>{value}</span>
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--gray-400)" }}>{label}</span>
      </div>
    </div>
  );
}
function HBar({ label, value, max, color }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--gray-600)" }}>{label}</span>
        <span style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 13, color: "var(--gray-900)" }}>{value}</span>
      </div>
      <div style={{ height: 9, borderRadius: 999, background: "var(--gray-100)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: (max ? (value / max) * 100 : 0) + "%", background: color, borderRadius: 999 }} />
      </div>
    </div>
  );
}

const STANDARD_REPORTS = [
  { name: "Number trained (YTD)", icon: "team-line", desc: "Headcount of attendees this year." },
  { name: "Enrollment by category", icon: "folder-chart-line", desc: "Enrollment grouped by program tier / category." },
  { name: "Total cost of training", icon: "money-dollar-circle-line", desc: "Direct + associated cost across all programs." },
  { name: "Cost per employee", icon: "user-3-line", desc: "Fully-loaded training cost per head." },
  { name: "Cost per department", icon: "building-2-line", desc: "Spend rolled up by department." },
  { name: "Attendance report", icon: "checkbox-circle-line", desc: "Attended vs declined / no-show." },
];

function AnalyticsScreen({ onToast }) {
  const [programs] = useStore(window.HRStores.ldPrograms);
  const [enrollments] = useStore(window.HRStores.ldEnrollments);
  const [evaluations] = useStore(window.HRStores.ldEvaluations);
  const [assignments] = useStore(window.HRStores.ldAssignments);

  const spend = programs.reduce((s, p) => s + ldProgramTotalGhs(p), 0);
  const remaining = LD_BANK_BUDGET - spend;
  const trained = enrollments.filter(e => e.status === "Attended").length;
  const activeEnroll = enrollments.filter(e => e.status !== "Declined" && e.status !== "No-show").length;

  const attendance = [
    { label: "Attended", value: enrollments.filter(e => e.status === "Attended").length, color: "#38C793" },
    { label: "Confirmed", value: enrollments.filter(e => e.status === "Confirmed").length, color: "#375DFB" },
    { label: "Invited", value: enrollments.filter(e => e.status === "Invited").length, color: "#F59E0B" },
    { label: "Declined / no-show", value: enrollments.filter(e => e.status === "Declined" || e.status === "No-show").length, color: "#EF4444" },
  ];
  // enrollment by tier
  const progTier = (id) => (programs.find(p => p.id === id) || {}).tier;
  const tierCounts = ["Tier 1", "Tier 2", "Tier 3"].map(t => ({ label: (LD_TIER[t] || {}).label || t, value: enrollments.filter(e => progTier(e.programId) === t).length, color: (LD_TIER[t] || {}).color }));
  const maxTier = Math.max(1, ...tierCounts.map(t => t.value));
  // spend by department (rough: split each program total across its enrolled depts)
  const deptSpend = {};
  programs.forEach(p => { const ppl = enrollments.filter(e => e.programId === p.id && e.status !== "Declined"); const per = ppl.length ? ldProgramTotalGhs(p) / ppl.length : 0; ppl.forEach(e => { deptSpend[e.dept] = (deptSpend[e.dept] || 0) + per; }); });
  const deptRows = Object.entries(deptSpend).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxDept = Math.max(1, ...deptRows.map(d => d[1]));
  const avgShift = (() => { const w = evaluations.filter(r => r.l2Pre != null && r.l2Post != null); return w.length ? Math.round(w.reduce((s, r) => s + (r.l2Post - r.l2Pre), 0) / w.length) : 0; })();

  const stats = [
    { title: "People enrolled", value: activeEnroll },
    { title: "Trained (attended)", value: trained },
    { title: "Programs", value: programs.length },
    { title: "Spend to date", value: "GHS " + Math.round(spend).toLocaleString() },
    { title: "Avg L2 shift", value: "+" + avgShift + "%" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title="Analytics & Reporting" subtitle="The answer engine — enrollment, spend, budget burn and learning impact, all in one place."
        actions={<Button variant="stroke" icon="file-excel-2-line" onClick={() => onToast("Dashboard exported to Excel", { tone: "success" })}>Export</Button>} />

      <div className="card cq-stats" style={{ padding: "var(--card-pad, 24px)" }}>
        <div className="cq-stat-grid">{stats.map((s, i) => <UI.StatCard key={s.title} title={s.title} value={s.value} index={i} />)}</div>
      </div>

      {/* budget burn */}
      <div className="card" style={{ padding: "var(--card-pad, 24px)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
          <div><div className="bh-h2" style={{ fontSize: 18 }}>Budget burn</div><div className="bh-body">Approved bank L&D budget vs spend to date.</div></div>
          <div style={{ textAlign: "right" }}><div style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 22, color: remaining < 0 ? "var(--error)" : "var(--gray-900)" }}>GHS {Math.round(remaining).toLocaleString()}</div><div className="bh-caption">remaining of GHS {LD_BANK_BUDGET.toLocaleString()}</div></div>
        </div>
        <div style={{ height: 14, borderRadius: 999, background: "var(--gray-100)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: Math.min(100, (spend / LD_BANK_BUDGET) * 100) + "%", background: spend / LD_BANK_BUDGET > 0.85 ? "var(--error)" : "var(--brand-yellow-dark)", borderRadius: 999 }} />
        </div>
        <div style={{ marginTop: 8, fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--gray-500)" }}>{Math.round((spend / LD_BANK_BUDGET) * 100)}% utilised · {Math.round(spend).toLocaleString()} GHS spent</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
        <div className="card" style={{ padding: "var(--card-pad, 24px)" }}>
          <div className="bh-h2" style={{ fontSize: 18, marginBottom: 4 }}>Attendance mix</div>
          <div className="bh-body" style={{ marginBottom: 16 }}>Reports count attendees only; declines are retained.</div>
          <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
            <Donut segments={attendance} value={enrollments.length} label="records" />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {attendance.map(s => <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 11, height: 11, borderRadius: 3, background: s.color }} /><span style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--gray-600)" }}>{s.label}</span><span style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 13, color: "var(--gray-900)", marginLeft: "auto" }}>{s.value}</span></div>)}
            </div>
          </div>
        </div>
        <div className="card" style={{ padding: "var(--card-pad, 24px)" }}>
          <div className="bh-h2" style={{ fontSize: 18, marginBottom: 4 }}>Enrollment by tier</div>
          <div className="bh-body" style={{ marginBottom: 16 }}>Strategic vs departmental vs individual.</div>
          {tierCounts.map(t => <HBar key={t.label} label={t.label} value={t.value} max={maxTier} color={t.color} />)}
        </div>
        <div className="card" style={{ padding: "var(--card-pad, 24px)" }}>
          <div className="bh-h2" style={{ fontSize: 18, marginBottom: 4 }}>Spend by department</div>
          <div className="bh-body" style={{ marginBottom: 16 }}>Top departments by training cost (≈GHS).</div>
          {deptRows.length === 0 ? <div className="bh-caption">No spend yet.</div> : deptRows.map(([d, v]) => <HBar key={d} label={d} value={Math.round(v).toLocaleString()} max={maxDept} color="var(--brand-blue)" />)}
        </div>
      </div>

      {/* standard reports */}
      <div className="card" style={{ padding: "var(--card-pad, 24px)" }}>
        <div className="bh-h2" style={{ fontSize: 18, marginBottom: 4 }}>Standard reports</div>
        <div className="bh-body" style={{ marginBottom: 16 }}>One click to spool and export — or build a custom report across any in-system parameter.</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {STANDARD_REPORTS.map(r => (
            <button key={r.name} onClick={() => onToast(`${r.name} — exported`, { tone: "success" })} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", border: "1px solid var(--border)", borderRadius: 12, background: "#fff", cursor: "pointer", textAlign: "left" }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--gray-50)"} onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
              <span style={{ width: 36, height: 36, borderRadius: 9, background: "var(--brand-yellow-tint)", display: "grid", placeItems: "center", flex: "none" }}><Icon name={r.icon} size={19} color="var(--brand-yellow-dark)" /></span>
              <span><span style={{ display: "block", fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 14, color: "var(--gray-900)" }}>{r.name}</span><span style={{ display: "block", fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--gray-500)", marginTop: 2 }}>{r.desc}</span></span>
              <Icon name="download-2-line" size={17} color="var(--gray-300)" style={{ marginLeft: "auto", flex: "none" }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AnalyticsScreen });
