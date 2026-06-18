// BISTA HR · performance/PerformanceAppraisals — admin performance-appraisal flow.
//   LIST    : "My Appraisals" + "Appraisals to review" tables (status-driven actions)
//   WIZARD  : AppraisalWizard (Start / Continue scoring) → "Appraisal Submitted"
//   DETAILS : read-only scored view — Objectives Scores (perspective tabs) + Behavioural
// Appraisals derive from approved goals. Breadcrumb (onSubPage) replaces the tab bar in a sub-view.
const { useState: usePA, useEffect: usePAEffect } = React;

function AprBadge({ text, tone }) {
  const map = {
    assessing: { bg: "var(--gray-100)", color: "var(--gray-700)", border: "var(--gray-200)" },
    reviewing: { bg: "#fff", color: "var(--gray-700)", border: "var(--gray-300)" },
    pendingReview: { bg: "var(--brand-yellow-tint)", color: "var(--warning-deep)", border: "#F2E6A8" },
    reviewed: { bg: "var(--success-tint)", color: "var(--success-deep)", border: "#ABEFC6" },
  };
  const c = map[tone] || map.assessing;
  return <span style={{ display: "inline-flex", fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 11.5, padding: "2px 8px", borderRadius: 6, background: c.bg, color: c.color, border: `1px solid ${c.border}`, whiteSpace: "nowrap" }}>{text}</span>;
}

function AppraisalTable({ rows, hideReviewerBadge, onView, onAct, emptyText }) {
  const [menu, setMenu] = usePA(null);
  if (!rows.length) {
    return <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
      <div style={{ padding: 40, textAlign: "center", fontFamily: "var(--font-ui)", fontSize: 13.5, color: "var(--gray-400)" }}>{emptyText || "No data available"}</div>
    </div>;
  }
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "visible" }}>
      <table className="bh">
        <thead><tr>
          <th>Employee Name</th><th>Appraisal Year</th><th>Start Date</th><th>End Date</th><th>Status</th><th>Date Submitted</th><th style={{ width: 48 }}></th>
        </tr></thead>
        <tbody>
          {rows.map((r) => {
            const st = APPRAISAL_STATUS[r.status] || APPRAISAL_STATUS["not-started"];
            const action = appraisalAction(r.status);
            return (
              <tr key={r.id}>
                <td>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 600, color: "var(--gray-900)" }}>{r.employeeName}</span>
                      {r.isAppraisee && <AprBadge text="You're assessing" tone="assessing" />}
                      {r.isReviewer && !hideReviewerBadge && <AprBadge text="You're reviewing" tone="reviewing" />}
                    </div>
                    {r.isReviewer && r.reviewStatus && <AprBadge text={r.reviewStatus === "Reviewed" ? "Reviewed" : "Pending your review"} tone={r.reviewStatus === "Reviewed" ? "reviewed" : "pendingReview"} />}
                  </div>
                </td>
                <td>{r.appraisalYear}</td>
                <td>{fmtDate(r.startDate)}</td>
                <td>{fmtDate(r.endDate)}</td>
                <td><StatusBadge variant={st.variant} text={st.text} size="sm" /></td>
                <td>{fmtDate(r.createdAt)}</td>
                <td style={{ position: "relative", textAlign: "right" }}>
                  <button className="btn btn-icon btn-ghost" style={{ width: 28, height: 28, padding: 0 }} onClick={() => setMenu(menu === r.id ? null : r.id)}>
                    <Icon name="more-fill" size={18} color="var(--gray-400)" />
                  </button>
                  {menu === r.id && (
                    <div onMouseLeave={() => setMenu(null)} style={{ position: "absolute", right: 16, top: 40, zIndex: 30, background: "#fff", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-pop)", padding: 6, minWidth: 180, display: "flex", flexDirection: "column" }}>
                      <button className="menu-item" onClick={() => { setMenu(null); onView(r); }}><Icon name="eye-line" size={16} />View Details</button>
                      {action && <button className="menu-item" onClick={() => { setMenu(null); onAct(r); }}><Icon name="edit-2-line" size={16} />{action.label}</button>}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// read-only scored details: Objectives Scores (perspective tabs) + Behavioural Scores
function AppraisalDetailsView({ row }) {
  const [mainTab, setMainTab] = usePA("objectives");
  const [pIdx, setPIdx] = usePA(0);
  const persp = row.perspectives[pIdx];
  return (
    <div className="card" style={{ padding: "var(--card-pad, 24px)" }}>
      <div style={{ marginBottom: 18 }}>
        <div className="bh-h2" style={{ fontSize: 24 }}>Performance Appraisal</div>
        <div className="bh-body" style={{ marginTop: 4 }}>{row.employeeName} · {row.appraisalYear} · {(APPRAISAL_STATUS[row.status] || {}).text}</div>
      </div>
      <PillTabs active={mainTab} onChange={setMainTab} items={[
        { value: "objectives", label: `Objectives Scores (${OBJECTIVE_SCORE_PCT}%)` },
        { value: "behavioural", label: `Behavioural Scores (${BEHAVIOURAL_SCORE_PCT}%)` },
      ]} />
      {mainTab === "objectives" ? (
        <div style={{ marginTop: 18 }}>
          <PillTabs active={String(pIdx)} onChange={(v) => setPIdx(Number(v))} items={row.perspectives.map((p, i) => ({ value: String(i), label: p.perspectiveName }))} />
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 14 }}>
            {(persp?.tasks || []).map((t) => (
              <ScoredTaskTable key={t.id} task={t} role={row.userRole} readOnly onViewComment={() => {}} onRank={() => {}} onComment={() => {}} />
            ))}
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 18 }}><BehaviouralDisplay selectedLevel={row.competencyLevel} /></div>
      )}
    </div>
  );
}

function PerformanceAppraisals({ onToast, onSubPage }) {
  const [rows, setRows] = usePA(APPRAISAL_ROWS);
  const [view, setView] = usePA({ name: "list" });

  usePAEffect(() => {
    if (!onSubPage) return;
    if (view.name === "wizard") onSubPage({ trail: [{ label: "Performance Appraisals", onClick: () => setView({ name: "list" }) }, { label: appraisalAction(view.row.status)?.label || "Appraisal" }] });
    else if (view.name === "details") onSubPage({ trail: [{ label: "Performance Appraisals", onClick: () => setView({ name: "list" }) }, { label: "Appraisal Details" }] });
    else onSubPage(null);
    return () => onSubPage(null);
  }, [view]);

  const myAppraisals = rows.filter((r) => r.isAppraisee);
  const toReview = rows.filter((r) => r.isReviewer);

  const submit = (perspectives) => {
    const id = view.row.id;
    const isManager = view.row.userRole === "manager";
    setRows((rs) => rs.map((r) => r.id === id ? {
      ...r, perspectives,
      status: isManager ? "completed" : "submitted",
      reviewStatus: isManager ? "Reviewed" : r.reviewStatus,
    } : r));
    setView({ name: "list" });
    onToast("Appraisal Submitted", { tone: "success" });
  };

  let main;
  if (view.name === "wizard") {
    const row = rows.find((r) => r.id === view.row.id) || view.row;
    main = <AppraisalWizard row={row} onCancel={() => setView({ name: "list" })} onSubmit={submit} onToast={onToast} />;
  } else if (view.name === "details") {
    const row = rows.find((r) => r.id === view.row.id) || view.row;
    main = <AppraisalDetailsView row={row} />;
  } else {
    main = (
      <div className="card" style={{ padding: "var(--card-pad, 24px)" }}>
        <div style={{ marginBottom: 22 }}>
          <div className="bh-h2" style={{ fontSize: 24 }}>Performance Appraisals</div>
          <div className="bh-body" style={{ marginTop: 4 }}>See and manage all performance appraisals submitted</div>
        </div>
        <div style={{ marginBottom: 28 }}>
          <h3 style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 13.5, color: "var(--gray-500)", margin: "0 0 12px" }}>My Appraisals</h3>
          <AppraisalTable rows={myAppraisals} onView={(r) => setView({ name: "details", row: r })} onAct={(r) => setView({ name: "wizard", row: r })} emptyText="You have no appraisals to complete." />
        </div>
        <div>
          <h3 style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 13.5, color: "var(--gray-500)", margin: "0 0 12px" }}>Appraisals to review</h3>
          <AppraisalTable rows={toReview} hideReviewerBadge onView={(r) => setView({ name: "details", row: r })} onAct={(r) => setView({ name: "wizard", row: r })} emptyText="No appraisals awaiting your review." />
        </div>
      </div>
    );
  }

  return <React.Fragment>{main}</React.Fragment>;
}

Object.assign(window, { PerformanceAppraisals, AppraisalTable, AppraisalDetailsView });
