// BISTA HR · performance/GoalSetting — admin/HRBP Goal Setting (Target Requests) flow.
//   LIST     : "My Goals" + "Goals to review" tables (period/year filter), "Set a Goal" → wizard
//   WIZARD   : GoalWizard (create / edit)  →  Goal Created / Goal Updated
//   DETAILS  : Objectives Scores / Behavioural Scores tabs (+ perspective sub-tabs);
//              reviewers can Approve / Reject (rejection captures a reason)
// Breadcrumb (onSubPage) replaces the Performance tab bar while in a sub-view.
const { useState: useGS, useEffect: useGSEffect } = React;

// ---- list table ----
function GoalBadge({ text, tone }) {
  const map = {
    assessing: { bg: "var(--gray-100)", color: "var(--gray-700)", border: "var(--gray-200)" },
    reviewing: { bg: "#fff", color: "var(--gray-700)", border: "var(--gray-300)" },
    pendingReview: { bg: "var(--brand-yellow-tint)", color: "var(--warning-deep)", border: "#F2E6A8" },
    reviewed: { bg: "var(--success-tint)", color: "var(--success-deep)", border: "#ABEFC6" },
  };
  const c = map[tone] || map.assessing;
  return <span style={{ display: "inline-flex", fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 11.5, padding: "2px 8px", borderRadius: 6, background: c.bg, color: c.color, border: `1px solid ${c.border}`, whiteSpace: "nowrap" }}>{text}</span>;
}

function GoalTable({ rows, hideReviewerBadge, onView, onEdit, onArchive, emptyText }) {
  const [menu, setMenu] = useGS(null);
  if (!rows.length) {
    return (
      <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
        <div style={{ padding: 40, textAlign: "center", fontFamily: "var(--font-ui)", fontSize: 13.5, color: "var(--gray-400)" }}>{emptyText || "No data available"}</div>
      </div>
    );
  }
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "visible" }}>
      <table className="bh">
        <thead><tr>
          <th>Employee Name</th><th>Appraisal Year</th><th>Start Date</th><th>End Date</th><th>Status</th><th>Date Submitted</th><th style={{ width: 48 }}></th>
        </tr></thead>
        <tbody>
          {rows.map((r) => {
            const canEdit = r.status !== "approved";
            const canArchive = r.status !== "approved";
            return (
              <tr key={r.id}>
                <td>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 600, color: "var(--gray-900)" }}>{r.employeeName}</span>
                      {r.isAppraisee && <GoalBadge text="You're assessing" tone="assessing" />}
                      {r.isReviewer && !hideReviewerBadge && <GoalBadge text="You're reviewing" tone="reviewing" />}
                    </div>
                    {r.isReviewer && r.reviewStatus && (
                      <GoalBadge text={r.reviewStatus === "Reviewed" ? "Reviewed" : "Pending your review"} tone={r.reviewStatus === "Reviewed" ? "reviewed" : "pendingReview"} />
                    )}
                  </div>
                </td>
                <td>{r.appraisalYear}</td>
                <td>{fmtDate(r.startDate)}</td>
                <td>{fmtDate(r.endDate)}</td>
                <td><StatusBadge variant={APPROVAL_VARIANT[r.status]} text={r.status.charAt(0).toUpperCase() + r.status.slice(1)} size="sm" /></td>
                <td>{fmtDate(r.createdAt)}</td>
                <td style={{ position: "relative", textAlign: "right" }}>
                  <button className="btn btn-icon btn-ghost" style={{ width: 28, height: 28, padding: 0 }} onClick={() => setMenu(menu === r.id ? null : r.id)}>
                    <Icon name="more-fill" size={18} color="var(--gray-400)" />
                  </button>
                  {menu === r.id && (
                    <div onMouseLeave={() => setMenu(null)} style={{ position: "absolute", right: 16, top: 40, zIndex: 30, background: "#fff", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-pop)", padding: 6, minWidth: 180, display: "flex", flexDirection: "column" }}>
                      <button className="menu-item" onClick={() => { setMenu(null); onView(r); }}><Icon name="eye-line" size={16} />View Details</button>
                      {canEdit && <button className="menu-item" onClick={() => { setMenu(null); onEdit(r); }}><Icon name="edit-2-line" size={16} />Edit Goal</button>}
                      {canArchive && <button className="menu-item danger" onClick={() => { setMenu(null); onArchive(r); }}><Icon name="archive-line" size={16} />Archive Goal Request</button>}
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

// ---- rejection-reason modal ----
function RejectModal({ onClose, onConfirm }) {
  const [reason, setReason] = useGS("");
  return (
    <Modal onClose={onClose} width={520}>
      <div style={{ padding: 24 }}>
        <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 20, color: "var(--gray-900)" }}>Reject Goal Request</div>
        <div className="bh-body" style={{ marginTop: 4 }}>Provide a reason so the employee can revise and resubmit.</div>
        <div style={{ marginTop: 18 }}>
          <label style={{ display: "block", fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--gray-400)", marginBottom: 6 }}>Reason for rejection</label>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Enter your reason…" style={{ minHeight: 110 }} />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 22 }}>
          <Button variant="stroke" onClick={onClose}>Cancel</Button>
          <Button variant="primary" disabled={!reason.trim()} onClick={() => onConfirm(reason.trim())} style={{ background: "var(--error)", color: "#fff" }}>Reject Request</Button>
        </div>
      </div>
    </Modal>
  );
}

// ---- goal details (read-only + reviewer actions) ----
function GoalDetails({ row, onApprove, onReject }) {
  const [mainTab, setMainTab] = useGS("objectives");
  const [pIdx, setPIdx] = useGS(0);
  const canAction = row.isReviewer && (row.status === "pending" || row.status === "rejected");
  const persp = row.perspectives[pIdx];
  const tint = DEPT_PERSPECTIVES.find((d) => d.id === persp?.perspectiveId)?.tint || "cream";
  return (
    <div className="card" style={{ padding: "var(--card-pad, 24px)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 18, flexWrap: "wrap" }}>
        <div>
          <div className="bh-h2" style={{ fontSize: 24 }}>Goal Setting</div>
          <div className="bh-body" style={{ marginTop: 4 }}>View details of the goal — {row.employeeName} · {row.appraisalYear}</div>
        </div>
        {canAction && (
          <div style={{ display: "flex", gap: 12 }}>
            <Button variant="stroke" onClick={onReject} style={{ color: "var(--error)", borderColor: "var(--error)" }}>Reject Request</Button>
            <Button variant="primary" onClick={onApprove}>Approve Request</Button>
          </div>
        )}
      </div>

      {row.status === "rejected" && row.rejectionReason && (
        <div style={{ display: "flex", gap: 10, background: "#FFF4ED", border: "1px solid #FFD6AE", borderRadius: 10, padding: "12px 14px", marginBottom: 18 }}>
          <Icon name="error-warning-line" size={18} color="#B93815" style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 13.5, color: "#B93815", lineHeight: 1.5 }}>{row.rejectionReason}</span>
        </div>
      )}

      <PillTabs active={mainTab} onChange={setMainTab} items={[
        { value: "objectives", label: `Objectives Scores (${OBJECTIVE_SCORE_PCT}%)` },
        { value: "behavioural", label: `Behavioural Scores (${BEHAVIOURAL_SCORE_PCT}%)` },
      ]} />

      {mainTab === "objectives" ? (
        <div style={{ marginTop: 18 }}>
          <PillTabs active={String(pIdx)} onChange={(v) => setPIdx(Number(v))}
            items={row.perspectives.map((p, i) => ({ value: String(i), label: p.perspectiveName }))} />
          <div style={{ marginTop: 16 }}>
            <ObjectiveSectionDisplay objectives={persp?.objectives || []} tint={tint} />
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 18 }}><BehaviouralDisplay selectedLevel={row.competencyLevel} /></div>
      )}
    </div>
  );
}

// ---- period/year filter for the review table ----
function ReviewFilters({ year, periodId, onYear, onPeriod }) {
  const years = [...new Set(PERF_PERIODS.map((p) => p.year))].sort((a, b) => b - a);
  const periodsForYear = year ? PERF_PERIODS.filter((p) => String(p.year) === String(year)) : PERF_PERIODS;
  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
      <div style={{ width: 180 }}>
        <Select value={year} placeholder="All years" options={years.map(String)} onChange={(e) => { onYear(e.target.value); onPeriod(""); }} />
      </div>
      <div style={{ width: 220 }}>
        <Select value={periodsForYear.find((p) => p.id === periodId)?.name || ""} placeholder="All periods"
          options={periodsForYear.map((p) => p.name)}
          onChange={(e) => onPeriod(periodsForYear.find((p) => p.name === e.target.value)?.id || "")} />
      </div>
    </div>
  );
}

function GoalSetting({ onToast, onSubPage }) {
  const [rows, setRows] = useGS(GOAL_ROWS);
  const [view, setView] = useGS({ name: "list" });   // list | wizard{mode,row,jump} | details{row}
  const [confirm, setConfirm] = useGS(null);          // archive | approve
  const [rejecting, setRejecting] = useGS(null);      // row being rejected
  const [reviewYear, setReviewYear] = useGS("");
  const [reviewPeriod, setReviewPeriod] = useGS("");

  useGSEffect(() => {
    if (!onSubPage) return;
    if (view.name === "wizard") onSubPage({ trail: [{ label: "Goal Setting", onClick: () => setView({ name: "list" }) }, { label: view.mode === "edit" ? "Edit Goal" : "Set a Goal" }] });
    else if (view.name === "details") onSubPage({ trail: [{ label: "Goal Setting", onClick: () => setView({ name: "list" }) }, { label: "Goal Details" }] });
    else onSubPage(null);
    return () => onSubPage(null);
  }, [view]);

  const myGoals = rows.filter((r) => r.isAppraisee);
  let toReview = rows.filter((r) => r.isReviewer);
  if (reviewYear) toReview = toReview.filter((r) => String(r.appraisalYear) === String(reviewYear));
  if (reviewPeriod) toReview = toReview.filter((r) => r.periodId === reviewPeriod);

  const submitGoal = (form, level) => {
    const editing = view.mode === "edit";
    if (editing) {
      setRows((rs) => rs.map((r) => r.id === view.row.id ? { ...r, ...form, competencyLevel: level, perspectives: form.perspectives, startDate: form.startDate, endDate: form.endDate, appraisalYear: form.appraisalYear, periodId: form.periodId } : r));
      onToast("Goal Updated", { tone: "success" });
    } else {
      const period = PERF_PERIODS.find((p) => p.id === form.periodId);
      const row = {
        id: perfId(), employeeId: PERF_ME.id, employeeName: PERF_ME.name, employeeNumber: PERF_ME.employeeNumber,
        designation: PERF_ME.designation, department: PERF_ME.department, branch: PERF_ME.branch, appraiser: PERF_ME.appraiser,
        isAppraisee: true, isReviewer: false, reviewStatus: null,
        appraisalYear: form.appraisalYear, periodId: form.periodId, startDate: form.startDate, endDate: form.endDate,
        status: "pending", createdAt: new Date().toISOString().slice(0, 10), competencyLevel: level, perspectives: form.perspectives,
      };
      setRows((rs) => [row, ...rs]);
      onToast("Goal Created", { tone: "success" });
    }
    setView({ name: "list" });
  };

  const doApprove = () => {
    const id = confirm.row.id;
    setRows((rs) => rs.map((r) => r.id === id ? { ...r, status: "approved", reviewStatus: "Reviewed" } : r));
    setConfirm(null); setView({ name: "list" });
    onToast("Goal Approved", { tone: "success" });
  };
  const doReject = (reason) => {
    const id = rejecting.id;
    setRows((rs) => rs.map((r) => r.id === id ? { ...r, status: "rejected", reviewStatus: "Reviewed", rejectionReason: reason } : r));
    setRejecting(null); setView({ name: "list" });
    onToast("Goal Rejected", { tone: "error" });
  };

  let main;
  if (view.name === "wizard") {
    main = <GoalWizard employee={PERF_ME} initial={view.row} jumpStep={view.jump}
      onCancel={() => setView({ name: "list" })} onSubmit={submitGoal} onToast={onToast} />;
  } else if (view.name === "details") {
    const row = rows.find((r) => r.id === view.row.id) || view.row;
    main = <GoalDetails row={row} onApprove={() => setConfirm({ intent: "approve", row })} onReject={() => setRejecting(row)} />;
  } else {
    main = (
      <div className="card" style={{ padding: "var(--card-pad, 24px)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 22, flexWrap: "wrap" }}>
          <div>
            <div className="bh-h2" style={{ fontSize: 24 }}>Goal Setting</div>
            <div className="bh-body" style={{ marginTop: 4 }}>See and manage all goals submitted</div>
          </div>
          <Button variant="primary" icon="add-line" onClick={() => setView({ name: "wizard", mode: "create" })}>Set a Goal</Button>
        </div>

        <div style={{ marginBottom: 28 }}>
          <h3 style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 13.5, color: "var(--gray-500)", margin: "0 0 12px" }}>My Goals</h3>
          <GoalTable rows={myGoals} onView={(r) => setView({ name: "details", row: r })}
            onEdit={(r) => setView({ name: "wizard", mode: "edit", row: r })}
            onArchive={(r) => setConfirm({ intent: "archive", row: r })} emptyText="You haven't set any goals yet." />
        </div>

        <div>
          <h3 style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 13.5, color: "var(--gray-500)", margin: "0 0 12px" }}>Goals to review</h3>
          <ReviewFilters year={reviewYear} periodId={reviewPeriod} onYear={setReviewYear} onPeriod={setReviewPeriod} />
          <GoalTable rows={toReview} hideReviewerBadge onView={(r) => setView({ name: "details", row: r })}
            onEdit={(r) => setView({ name: "wizard", mode: "edit", row: r })}
            onArchive={(r) => setConfirm({ intent: "archive", row: r })} emptyText="No goals awaiting your review." />
        </div>
      </div>
    );
  }

  return (
    <React.Fragment>
      {main}
      {confirm && confirm.intent === "archive" && (
        <ConfirmModal title="Archive Goal" message="Are you sure you want to archive this goal? This action cannot be undone."
          confirmLabel="Yes, Archive" confirmIcon="archive-line" cancelLabel="No"
          onConfirm={() => { setRows((rs) => rs.filter((r) => r.id !== confirm.row.id)); setConfirm(null); onToast("Goal Archived", { tone: "error" }); }}
          onClose={() => setConfirm(null)} />
      )}
      {confirm && confirm.intent === "approve" && (
        <ConfirmModal title="Approve Goal" message="Are you sure you want to approve this goal?"
          confirmLabel="Yes, Approve" confirmIcon="check-line" cancelLabel="No"
          onConfirm={doApprove} onClose={() => setConfirm(null)} />
      )}
      {rejecting && <RejectModal onClose={() => setRejecting(null)} onConfirm={doReject} />}
    </React.Fragment>
  );
}

Object.assign(window, { GoalSetting, GoalTable, GoalDetails });
