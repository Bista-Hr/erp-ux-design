// BISTA HR · performance/Idp — Individual Development Plans (HRBP "IDP management" report).
//   LIST    : org-wide plans — search + Department / Unit / Status filters + Export to Excel;
//             columns Employee / Period / Year / Status / Progress / Department / Unit-Branch /
//             Review Completed / End-Year Status / Actions (View).
//   DETAILS : "Back to IDP management" + header card (job title, dept/unit, reports to, period,
//             date) with a circular progress ring; tabs Plan Goals & Activities / Plan Reviews
//             (mid-year + end-of-year, employee & line-manager comments, achievement) / Plan Reflections.
const { useState: useIDP, useEffect: useIDPEffect } = React;

function IdpGoalCard({ goal }) {
  const tone = { Technical: { bg: "#F4F7FF", c: "var(--brand-blue)" }, Behavioral: { bg: "var(--success-tint)", c: "var(--success-deep)" }, Leadership: { bg: "#EDE7F9", c: "#6941C6" } }[goal.type] || { bg: "var(--gray-100)", c: "var(--gray-600)" };
  const prio = { High: "var(--error)", Medium: "var(--warning-deep)", Low: "var(--gray-500)" }[goal.priority] || "var(--gray-500)";
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 16px", background: "var(--gray-25)", borderBottom: "1px solid var(--divider)", flexWrap: "wrap" }}>
        <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 15, color: "var(--gray-900)" }}>{goal.developmentGoal}</div>
        <div style={{ display: "flex", gap: 8 }}>
          <span style={{ fontFamily: "var(--font-control)", fontWeight: 600, fontSize: 11, padding: "3px 9px", borderRadius: 999, background: tone.bg, color: tone.c }}>{goal.type}</span>
          <span style={{ fontFamily: "var(--font-control)", fontWeight: 600, fontSize: 11, padding: "3px 9px", borderRadius: 999, background: "#fff", border: `1px solid ${prio}`, color: prio }}>{goal.priority} priority</span>
        </div>
      </div>
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        {goal.comments && <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, lineHeight: 1.5, color: "var(--gray-500)", margin: 0 }}>{goal.comments}</p>}
        {goal.activities.map((a) => (
          <div key={a.id} style={{ border: "1px solid var(--divider)", borderRadius: 10, padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 13.5, color: "var(--gray-900)" }}>{a.description}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-500)" }}><Icon name="calendar-line" size={14} color="var(--gray-400)" />{fmtDate(a.endDate)} · {a.status}</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {a.onJob && <span className="bh-chip" style={{ background: "var(--success-tint)", color: "var(--success-deep)", border: "1px solid #ABEFC6" }}>70% · {a.onJob}</span>}
              {a.social && <span className="bh-chip" style={{ background: "#F4F7FF", color: "var(--brand-blue)", border: "1px solid #D6E0FF" }}>20% · {a.social}</span>}
              {a.formal && <span className="bh-chip" style={{ background: "var(--brand-yellow-tint)", color: "var(--warning-deep)", border: "1px solid #F2E6A8" }}>10% · {a.formal}</span>}
              {(a.additionalFormal || []).map((m) => <span key={m} className="bh-chip">{m}</span>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CircularProgress({ value, size = 64 }) {
  const pct = value == null ? 0 : value;
  const r = (size - 8) / 2, c = 2 * Math.PI * r, off = c - (pct / 100) * c;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--gray-100)" strokeWidth="6" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={pct >= 100 ? "var(--success)" : "var(--brand-yellow-dark)"} strokeWidth="6"
        strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 13, fill: "var(--gray-900)" }}>{(value == null ? 0 : value).toFixed(1)}%</text>
    </svg>
  );
}

function AchievementBadge({ text }) {
  if (!text) return null;
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 12.5, padding: "5px 11px", borderRadius: 999, background: "var(--success-tint)", color: "var(--success-deep)", border: "1px solid #ABEFC6" }}><Icon name="checkbox-circle-fill" size={14} color="#17B26A" />{text}</span>;
}

function IdpHeaderField({ label, value }) {
  return <div style={{ minWidth: 0 }}><div style={{ fontFamily: "var(--font-ui)", fontSize: 11.5, letterSpacing: ".02em", textTransform: "uppercase", color: "var(--gray-400)" }}>{label}</div>
    <div style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 14, color: "var(--gray-900)", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value || "—"}</div></div>;
}

function ReviewBlock({ title, rows }) {
  return (
    <div>
      <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 16, color: "var(--gray-900)", paddingBottom: 10, borderBottom: "1px solid var(--divider)", marginBottom: 14 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {rows.length === 0
          ? <div style={{ fontFamily: "var(--font-ui)", fontSize: 13.5, color: "var(--gray-400)", padding: "8px 0" }}>No review recorded yet.</div>
          : rows.map((r, i) => (
            <div key={i} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "var(--font-ui)", fontSize: 13.5, color: "var(--gray-500)" }}>Review Date: <strong style={{ color: "var(--gray-800)" }}>{r.date}</strong></span>
                <AchievementBadge text={r.achievement} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div>
                  <div style={{ fontFamily: "var(--font-ui)", fontSize: 11.5, letterSpacing: ".02em", textTransform: "uppercase", color: "var(--gray-400)", marginBottom: 6 }}>{r.leftLabel}</div>
                  <div style={{ fontFamily: "var(--font-ui)", fontSize: 13.5, lineHeight: 1.55, color: r.left ? "var(--gray-700)" : "var(--gray-300)" }}>{r.left || "—"}</div>
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-ui)", fontSize: 11.5, letterSpacing: ".02em", textTransform: "uppercase", color: "var(--gray-400)", marginBottom: 6 }}>Line Manager Comments</div>
                  <div style={{ fontFamily: "var(--font-ui)", fontSize: 13.5, lineHeight: 1.55, color: r.right ? "var(--gray-700)" : "var(--gray-300)" }}>{r.right || "—"}</div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

function IdpDetails({ plan, onBack }) {
  const [tab, setTab] = useIDP("goals");
  const st = IDP_STATUS[plan.status] || IDP_STATUS.draft;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div><Button variant="stroke" icon="arrow-left-line" onClick={onBack}>Back to IDP management</Button></div>
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, paddingBottom: 18, borderBottom: "1px solid var(--divider)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <div style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 24, color: "var(--gray-900)", textTransform: "uppercase" }}>{plan.employeeName}</div>
            <StatusBadge variant={st.variant} text={st.text} size="md" />
          </div>
          <CircularProgress value={plan.progress} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 18, marginTop: 18 }}>
          <IdpHeaderField label="Job Title" value={plan.jobTitle} />
          <IdpHeaderField label="Department/Unit" value={plan.department} />
          <IdpHeaderField label="Reports To" value={plan.reportsTo} />
          <IdpHeaderField label="Appraisal Period" value={plan.period} />
          <IdpHeaderField label="Date" value={`${fmtDate(plan.startDate)} - ${fmtDate(plan.endDate)}`} />
        </div>
      </div>

      <PillTabs active={tab} onChange={setTab} items={[
        { value: "goals", label: "Plan Goals & Activities" },
        { value: "reviews", label: "Plan Reviews" },
        { value: "reflections", label: "Plan Reflections" },
      ]} />

      {tab === "goals" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>{plan.goals.map((g) => <IdpGoalCard key={g.id} goal={g} />)}</div>
      )}
      {tab === "reviews" && (
        <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 26 }}>
          <ReviewBlock title="Mid-Year Reviews" rows={(plan.midYearReviews || []).map((m) => ({ date: m.date ? fmtDate(m.date) : "—", leftLabel: "Employee Comments", left: m.employeeComments, right: m.managerComments, achievement: m.achievement }))} />
          <ReviewBlock title="End-of-Year Review" rows={plan.endYearReview ? [{ date: plan.endYearReview.date ? fmtDate(plan.endYearReview.date) : "—", leftLabel: "Employee Self-Assessment", left: plan.endYearReview.employeeSelfAssessment, right: plan.endYearReview.managerComments, achievement: plan.endYearReview.achievement }] : []} />
        </div>
      )}
      {tab === "reflections" && (
        <div className="card" style={{ padding: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div>
            <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 14, color: "var(--gray-900)", marginBottom: 8 }}>What I'm most proud of</div>
            <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 14, minHeight: 90, fontFamily: "var(--font-ui)", fontSize: 13.5, lineHeight: 1.55, color: plan.proudOf ? "var(--gray-700)" : "var(--gray-300)" }}>{plan.proudOf || "No reflection recorded."}</div>
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 14, color: "var(--gray-900)", marginBottom: 8 }}>What I still want to work on</div>
            <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 14, minHeight: 90, fontFamily: "var(--font-ui)", fontSize: 13.5, lineHeight: 1.55, color: plan.stillToWorkOn ? "var(--gray-700)" : "var(--gray-300)" }}>{plan.stillToWorkOn || "No reflection recorded."}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function Idp({ onToast, onSubPage }) {
  const [rows] = useIDP(IDP_PLAN_ROWS);
  const [view, setView] = useIDP({ name: "list" });
  const [q, setQ] = useIDP("");
  const [dept, setDept] = useIDP("");
  const [unit, setUnit] = useIDP("");
  const [status, setStatus] = useIDP("");

  useIDPEffect(() => {
    if (!onSubPage) return;
    if (view.name === "details") onSubPage({ trail: [{ label: "IDP", onClick: () => setView({ name: "list" }) }, { label: "Plan Details" }] });
    else onSubPage(null);
    return () => onSubPage(null);
  }, [view]);

  if (view.name === "details") {
    const plan = rows.find((r) => r.id === view.id);
    return <IdpDetails plan={plan} onBack={() => setView({ name: "list" })} />;
  }

  let shown = rows;
  if (q.trim()) shown = shown.filter((r) => r.employeeName.toLowerCase().includes(q.trim().toLowerCase()));
  if (dept) shown = shown.filter((r) => r.department === dept);
  if (unit) shown = shown.filter((r) => r.unitBranch === unit);
  if (status) shown = shown.filter((r) => (IDP_STATUS[r.status] || {}).text === status);

  return (
    <div className="card" style={{ padding: "var(--card-pad, 24px)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 22, flexWrap: "wrap" }}>
        <div>
          <div className="bh-h2" style={{ fontSize: 24 }}>Individual Development Plans</div>
          <div className="bh-body" style={{ marginTop: 4 }}>Organization development plans — filter and export by department, unit, and status.</div>
        </div>
        <Button variant="primary" icon="file-excel-2-line" onClick={() => onToast("Exporting to Excel…", { tone: "success" })}>Export to Excel</Button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 18 }}>
        <div className="input-wrap" style={{ padding: "8px 12px" }}>
          <Icon name="search-2-line" size={18} style={{ color: "var(--icon-default)" }} />
          <input placeholder="Search IDP report" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Combobox value={dept} options={[{ value: "", label: "All Departments" }, ...IDP_DEPARTMENTS]} placeholder="All Departments" onChange={setDept} />
        <Combobox value={unit} options={[{ value: "", label: "All Units / Branches" }, ...IDP_UNITS]} placeholder="All Units / Branches" onChange={setUnit} />
        <Combobox value={status} options={[{ value: "", label: "All Statuses" }, ...IDP_STATUS_FILTERS]} placeholder="All Statuses" onChange={setStatus} />
      </div>

      <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflowX: "auto" }}>
        <table className="bh" style={{ minWidth: 920 }}>
          <thead><tr><th>Employee</th><th>Period</th><th>Year</th><th>Status</th><th>Progress</th><th>Department</th><th>Unit/Branch</th><th>Review Completed</th><th>End-Year Status</th><th style={{ width: 90 }}>Actions</th></tr></thead>
          <tbody>
            {shown.length === 0
              ? <tr><td colSpan={10} style={{ padding: 32, textAlign: "center", color: "var(--gray-400)" }}>No development plans match your filters.</td></tr>
              : shown.map((r) => {
                const st = IDP_STATUS[r.status] || IDP_STATUS.draft;
                return (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600, color: "var(--gray-900)", textTransform: "uppercase" }}>{r.employeeName}</td>
                    <td style={{ color: "var(--gray-500)" }}>{r.period}</td>
                    <td>{r.year}</td>
                    <td><StatusBadge variant={st.variant} text={st.text} size="sm" /></td>
                    <td>{r.progress == null ? "—" : `${r.progress}%`}</td>
                    <td style={{ color: "var(--gray-500)", textTransform: "uppercase", fontSize: 12.5 }}>{r.department}</td>
                    <td style={{ color: "var(--gray-500)", textTransform: "uppercase", fontSize: 12.5 }}>{r.unitBranch}</td>
                    <td style={{ color: "var(--gray-500)" }}>{r.reviewCompleted ? fmtDate(r.reviewCompleted) : "-"}</td>
                    <td style={{ color: "var(--gray-500)" }}>{r.endYearStatus || "—"}</td>
                    <td style={{ textAlign: "right" }}><ViewDetailsButton label="View" onClick={() => setView({ name: "details", id: r.id })} /></td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

Object.assign(window, { Idp, IdpDetails, CircularProgress });
