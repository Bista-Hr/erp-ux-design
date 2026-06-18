// BISTA HR · performance/AppraisalWizard — performance-appraisal scoring wizard.
// Personal Information → one Perspective Score step per perspective → Behavioural Score → Summary.
// Each task is scored on a Ranking (→ Rating 1..N → Score = weight/100 × rating) with optional
// comments; the Assessee row and Assessor row are shown per the active role (employee/manager).
const { useState: useAW2 } = React;

function AprReadField({ label, value }) {
  return (
    <div style={{ minWidth: 0 }}>
      <label style={{ display: "block", fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--gray-400)", marginBottom: 6 }}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", padding: "10px 12px", borderRadius: 10, background: "var(--gray-50)", border: "1px solid var(--border)", fontFamily: "var(--font-control)", fontSize: 14, color: "var(--gray-700)", minHeight: 20 }}>{value || "—"}</div>
    </div>
  );
}

function RankingPill({ name }) {
  const info = rankingInfo(name);
  return <span style={{ display: "inline-flex", fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 11.5, padding: "3px 10px", borderRadius: 999, color: "#fff", background: info.color }}>{info.name}</span>;
}

function RankingSelect({ value, onChange, disabled }) {
  return (
    <div className="input-wrap" style={{ width: 168, padding: "7px 10px", opacity: disabled ? 0.55 : 1 }}>
      <select value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}
        style={{ flex: 1, border: 0, outline: 0, background: "transparent", appearance: "none", fontFamily: "var(--font-control)", fontSize: 13.5, color: value ? "var(--gray-900)" : "var(--gray-400)", cursor: disabled ? "not-allowed" : "pointer" }}>
        <option value="">Select ranking</option>
        {PERF_RATINGS.map((r) => <option key={r.id} value={r.name}>{r.name}</option>)}
      </select>
      <Icon name="arrow-down-s-line" size={18} style={{ color: "var(--icon-default)" }} />
    </div>
  );
}

// scored-task table for one perspective. role: "employee" | "manager"; readOnly hides editing.
function ScoredTaskTable({ task, role, readOnly, onRank, onComment, onViewComment }) {
  const showEmployee = true;
  const showManager = role === "manager" || readOnly;
  const Row = ({ who, name, ranking, rating, score, editable, onSel, comment }) => (
    <tr>
      <td>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar name={name} size={32} />
          <span style={{ fontWeight: 600 }}>{name} <span style={{ color: "var(--gray-400)", fontWeight: 500 }}>({who})</span></span>
        </div>
      </td>
      <td>{task.kpi}</td>
      <td>{task.weight}%</td>
      <td>{task.annualTarget || "—"}</td>
      <td>{editable && !readOnly ? <RankingSelect value={ranking} onChange={onSel} /> : <RankingPill name={ranking} />}</td>
      <td style={{ fontWeight: 600 }}>{rating || 0}</td>
      <td style={{ fontWeight: 600 }}>{(score || 0).toFixed(2)}</td>
      <td style={{ textAlign: "right" }}>
        {editable && !readOnly
          ? <button onClick={onComment} style={{ border: 0, background: "none", cursor: "pointer", fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 13, color: "var(--brand-yellow-dark)", whiteSpace: "nowrap" }}>{comment ? "Edit Comment" : "Add Comment"}</button>
          : <button onClick={onViewComment} style={{ border: 0, background: "none", cursor: "pointer", fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 13, color: "var(--gray-500)", whiteSpace: "nowrap" }}>View Comment</button>}
      </td>
    </tr>
  );
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid var(--divider)" }}>
        <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 14, color: "var(--gray-900)" }}>{task.taskName}</div>
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--gray-400)" }}>{task.objective}</span>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="bh">
          <thead><tr><th>Name</th><th>KPI</th><th style={{ width: 70 }}>Weight</th><th style={{ width: 110 }}>Annual Target</th><th style={{ width: 180 }}>Ranking</th><th style={{ width: 90 }}>Rating (1–{PERF_RATINGS.length})</th><th style={{ width: 70 }}>Score</th><th style={{ width: 120 }}></th></tr></thead>
          <tbody>
            {showEmployee && <Row who="Assessee" name={task.employeeName} ranking={task.employeeRanking} rating={task.employeeRating} score={task.employeeScore}
              editable={role === "employee"} onSel={(v) => onRank("employee", v)} comment={task.employeeComment}
              onComment={() => onComment("employee")} onViewComment={() => onViewComment("employee")} />}
            {showManager && <Row who="Assessor" name={task.managerName} ranking={task.managerRanking} rating={task.managerRating} score={task.managerScore}
              editable={role === "manager"} onSel={(v) => onRank("manager", v)} comment={task.managerComment}
              onComment={() => onComment("manager")} onViewComment={() => onViewComment("manager")} />}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AprCommentModal({ readOnly, value, onClose, onSave }) {
  const [text, setText] = useAW2(value || "");
  return (
    <Modal onClose={onClose} width={500}>
      <div style={{ padding: 22 }}>
        <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 18, color: "var(--gray-900)" }}>{readOnly ? "View Comment" : value ? "Edit Comment" : "Add Comment"}</div>
        <div style={{ marginTop: 16 }}>
          {readOnly
            ? <p style={{ fontFamily: "var(--font-ui)", fontSize: 14, lineHeight: 1.6, color: "var(--gray-700)", margin: 0 }}>{value || "No comment added."}</p>
            : <Textarea placeholder="Enter your comment…" value={text} onChange={(e) => setText(e.target.value)} style={{ minHeight: 110 }} />}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
          <Button variant="stroke" onClick={onClose}>{readOnly ? "Close" : "Cancel"}</Button>
          {!readOnly && <Button variant="primary" onClick={() => onSave(text)}>Save Comment</Button>}
        </div>
      </div>
    </Modal>
  );
}

// read-only behavioural scoring (competency descriptors rated) — reuses level display
function AppraisalBehavioural({ level, role, readOnly }) {
  return <BehaviouralDisplay selectedLevel={level} />;
}

function AppraisalWizard({ row, onCancel, onSubmit, onToast }) {
  const role = row.userRole; // employee | manager
  const [persp, setPersp] = useAW2(() => row.perspectives.map((p) => ({ ...p, tasks: p.tasks.map((t) => ({ ...t })) })));
  const N = persp.length;
  const totalSteps = N + 3;
  const [step, setStep] = useAW2(0);
  const [comment, setComment] = useAW2(null); // {pIdx, taskId, field, readOnly, value}

  const rankTask = (pIdx, taskId, whose, rankName) => {
    setPersp((ps) => ps.map((p, i) => i === pIdx ? { ...p, tasks: p.tasks.map((t) => {
      if (t.id !== taskId) return t;
      const info = rankingInfo(rankName); const sc = scoreFor(rankName, t.weight);
      return whose === "employee"
        ? { ...t, employeeRanking: rankName, employeeRating: info.rating, employeeScore: sc }
        : { ...t, managerRanking: rankName, managerRating: info.rating, managerScore: sc };
    }) } : p));
  };
  const saveComment = (pIdx, taskId, field, text) => {
    setPersp((ps) => ps.map((p, i) => i === pIdx ? { ...p, tasks: p.tasks.map((t) => t.id === taskId ? { ...t, [field]: text } : t) } : p));
  };

  // a perspective step is valid when every task has the active role's ranking set
  const stepValid = (pIdx) => persp[pIdx].tasks.every((t) => (role === "employee" ? t.employeeRanking : t.managerRanking));

  const isPerspStep = step >= 1 && step <= N;
  const pIdx = step - 1;

  const handleContinue = () => {
    if (isPerspStep && !stepValid(pIdx)) { onToast("Select a ranking for every task before continuing.", { tone: "error" }); return; }
    onToast("Progress saved", { tone: "success" });
    setStep((s) => s + 1);
  };

  let body;
  if (step === 0) {
    const periodName = PERF_PERIODS.find((p) => p.id === row.periodId)?.name || "";
    body = (
      <React.Fragment>
        <PageHeader title="Personal Information" subtitle="Review the employee and appraisal period details" />
        <div className="card" style={{ padding: 24, marginTop: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <AprReadField label="Employee Name" value={row.employeeName} />
            <AprReadField label="Employee ID" value={row.employeeNumber} />
            <AprReadField label="Job Title" value={row.designation} />
            <AprReadField label="Department" value={row.department} />
            <AprReadField label="Branch/Unit" value={row.branch} />
            <AprReadField label="Appraiser" value={row.appraiser} />
            <AprReadField label="Appraisal Period" value={periodName} />
            <AprReadField label="Appraisal Year" value={row.appraisalYear} />
            <AprReadField label="Start Date" value={fmtDate(row.startDate)} />
            <AprReadField label="End Date" value={fmtDate(row.endDate)} />
          </div>
        </div>
      </React.Fragment>
    );
  } else if (isPerspStep) {
    const p = persp[pIdx];
    body = (
      <React.Fragment>
        <div style={{ marginBottom: 12 }}><StepPill step={step + 1} total={totalSteps} tone="primary" /></div>
        <PageHeader title={`${p.perspectiveName} (${p.perspectiveWeight}%)`} subtitle={`Score each task under the ${p.perspectiveName.toLowerCase()} perspective on its ranking.`} />
        <div style={{ marginTop: 16 }}>
          <div style={{ background: "#FAFAFA", border: "1px solid var(--border)", borderRadius: 14, padding: 18 }}>
            <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 16, color: "var(--gray-900)", marginBottom: 14 }}>Employee Goals</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {p.tasks.map((t) => (
                <ScoredTaskTable key={t.id} task={t} role={role} readOnly={false}
                  onRank={(whose, v) => rankTask(pIdx, t.id, whose, v)}
                  onComment={(whose) => setComment({ pIdx, taskId: t.id, field: whose === "employee" ? "employeeComment" : "managerComment", value: whose === "employee" ? t.employeeComment : t.managerComment, readOnly: false })}
                  onViewComment={(whose) => setComment({ readOnly: true, value: whose === "employee" ? t.employeeComment : t.managerComment })} />
              ))}
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  } else if (step === N + 1) {
    body = (
      <React.Fragment>
        <div style={{ marginBottom: 12 }}><StepPill step={step + 1} total={totalSteps} tone="primary" /></div>
        <PageHeader title="Behavioural Score" subtitle="Score is based on behavioural performance against the competency criteria." />
        <div className="card" style={{ padding: 24, marginTop: 16 }}><AppraisalBehavioural level={row.competencyLevel} role={role} /></div>
      </React.Fragment>
    );
  } else {
    body = (
      <React.Fragment>
        <div style={{ marginBottom: 12 }}><StepPill step={step + 1} total={totalSteps} /></div>
        <div style={{ marginBottom: 16 }}>
          <div className="bh-h2" style={{ fontSize: 24 }}>Summary</div>
          <div className="bh-body" style={{ marginTop: 4 }}>Review every perspective score before submitting.</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {persp.map((p) => (
            <div key={p.perspectiveId} style={{ background: "#FAFAFA", border: "1px solid var(--border)", borderRadius: 14, padding: 18 }}>
              <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 16, color: "var(--gray-900)", marginBottom: 12 }}>{p.perspectiveName} ({p.perspectiveWeight}%)</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {p.tasks.map((t) => <ScoredTaskTable key={t.id} task={t} role={role} readOnly onViewComment={() => {}} onRank={() => {}} onComment={() => {}} />)}
              </div>
            </div>
          ))}
        </div>
      </React.Fragment>
    );
  }

  const isSummary = step === totalSteps - 1;
  return (
    <div className="card" style={{ overflow: "visible", padding: "var(--card-pad, 24px)" }}>
      {step === 0 && <div style={{ marginBottom: 4 }}><StepPill step={1} total={totalSteps} tone="primary" /></div>}
      {body}
      <WizardFooter onCancel={onCancel} onBack={step > 0 ? () => setStep((s) => s - 1) : null} backDisabled={step === 0}
        primaryLabel={isSummary ? "Submit Appraisal" : "Continue"} primaryIcon={isSummary ? "check-line" : "arrow-right-s-line"}
        onPrimary={isSummary ? () => onSubmit(persp) : handleContinue} />
      {comment && <AprCommentModal readOnly={comment.readOnly} value={comment.value}
        onClose={() => setComment(null)} onSave={(text) => { saveComment(comment.pIdx, comment.taskId, comment.field, text); setComment(null); }} />}
    </div>
  );
}

Object.assign(window, { AppraisalWizard, ScoredTaskTable, RankingPill, AprCommentModal });
