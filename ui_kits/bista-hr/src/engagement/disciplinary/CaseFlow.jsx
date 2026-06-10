// BISTA HR · engagement/disciplinary/CaseFlow — the per-stage case workflow.
// Implements InvestigatingReportStep, ScheduleHearingStep, DisciplinaryHearingStep,
// DisciplinaryHearingSummary, DisciplinaryDecisionStep and DisciplinaryReportView, wired
// by DisciplinaryCaseFlow into one stage machine (routes in the real app → local steps here):
//   investigation → report → schedule hearing
//   hearing       → feedback → summary → decision → report
//   completed     → report
// onStageChange persists the stage back to the list; onToast/ConfirmModal mirror the app.
const { useState: useCF, useMemo: useCFMemo } = React;

function FlowLabel({ children }) {
  return <div style={{ fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 500, color: "var(--gray-400)" }}>{children}</div>;
}
const FlowDivider = () => <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />;
function FlowHead({ title, subtitle, stage }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <PageHeader title={title} subtitle={subtitle} />
      <div className="card" style={{ padding: "20px 24px" }}>
        <DisciplinaryStageStepper currentStage={stage} />
      </div>
    </div>
  );
}
const empName = (e) => e.fullName;
const empKey = (e) => e.employeeId || e.id;

/* ---------- employee outcome card (assigned avatar + name + designation) ---------- */
function EmpRow({ e, right, onClick, selected, completed }) {
  return (
    <div onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12,
      border: `1px solid ${selected ? "#10b981" : "var(--border)"}`, background: selected ? "#ECFDF3" : "var(--gray-50)", cursor: onClick ? "pointer" : "default" }}>
      <div style={{ position: "relative", display: "flex" }}>
        <Avatar name={empName(e)} size={40} />
        {completed && <span style={{ position: "absolute", top: -3, right: -3, width: 16, height: 16, borderRadius: "50%", background: "#10b981", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="check-line" size={9} color="#fff" /></span>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 14, color: "var(--gray-900)", whiteSpace: "nowrap" }}>{empName(e)}</div>
        <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-400)", whiteSpace: "nowrap" }}>{e.designation || "Employee"}</div>
      </div>
      {right}
    </div>
  );
}

/* ---------- 1 · investigating report ---------- */
function InvestigatingReportView({ caseData, onCancel, onSetupHearing }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 1000 }}>
      <FlowHead title="Investigating Report" subtitle="Review all details and documents attached to this case." stage={caseData.stage} />
      <div className="card" style={{ padding: "var(--card-pad, 24px)" }}>
        <FlowLabel>Title of Case/Incident</FlowLabel>
        <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 18, color: "var(--gray-900)", marginTop: 4 }}>{caseData.title}</div>
        <div style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--gray-400)", marginTop: 2 }}>Case Number: {caseData.caseNumber}</div>
        <div style={{ margin: "18px 0" }}><FlowDivider /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 32px" }}>
          <div><FlowLabel>Department</FlowLabel><div style={{ fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 14, color: "var(--gray-900)", marginTop: 4 }}>{caseData.department}</div></div>
          <div><FlowLabel>Date of Incident</FlowLabel><div style={{ fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 14, color: "var(--gray-900)", marginTop: 4 }}>{discFmt(caseData.dateOfIncident)}</div></div>
        </div>
        <div style={{ margin: "18px 0" }}><FlowDivider /></div>
        <FlowLabel>Implicated Employees</FlowLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 10 }}>
          {caseData.implicatedEmployees.map((e, i) => <div key={i} style={{ minWidth: 200 }}><EmpRow e={e} /></div>)}
        </div>
        <div style={{ margin: "18px 0" }}><FlowDivider /></div>
        <FlowLabel>Description of Incident</FlowLabel>
        <div style={{ marginTop: 8, background: "var(--gray-50)", border: "1px solid var(--border)", borderRadius: 10, padding: 16, fontFamily: "var(--font-ui)", fontSize: 14, lineHeight: "24px", color: "var(--gray-700)" }}>{caseData.description}</div>
        {caseData.attachments && caseData.attachments.length > 0 && (
          <div style={{ marginTop: 18 }}>
            <FlowLabel>Attachments</FlowLabel>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12, marginTop: 8 }}>
              {caseData.attachments.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, border: "1px solid var(--border)", borderRadius: 10, padding: 12, background: "#fff" }}>
                  <FileIcon name={f} size={40} />
                  <div style={{ minWidth: 0 }}><div style={{ fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 13, color: "var(--gray-900)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f}</div>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--brand-yellow-dark)", marginTop: 2 }}><Icon name="download-2-line" size={13} color="var(--brand-yellow-dark)" />Download</span></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
        <Button variant="stroke" onClick={onCancel}>Cancel Report</Button>
        <Button variant="primary" onClick={onSetupHearing}>Set Up Disciplinary Hearing</Button>
      </div>
    </div>
  );
}

/* ---------- 2 · schedule hearing ---------- */
function ScheduleHearingView({ caseData, onBack, onSchedule }) {
  const [rows, setRows] = useCF(caseData.implicatedEmployees.map(e => ({ employeeId: empKey(e), date: "", from: "", to: "" })));
  const upd = (i, k, v) => setRows(rs => rs.map((r, j) => j === i ? { ...r, [k]: v } : r));
  const valid = rows.every(r => r.date.trim() && r.from.trim() && r.to.trim());
  return (
    <div className="card" style={{ padding: "var(--card-pad, 24px)", maxWidth: 1000 }}>
      <div style={{ marginBottom: 20 }}>
        <div className="bh-h2" style={{ fontSize: 24 }}>Set Up Disciplinary Hearing</div>
        <div className="bh-body" style={{ marginTop: 4 }}>Schedule a date and time for the disciplinary hearing.</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {caseData.implicatedEmployees.map((e, i) => (
          <div key={i} style={{ display: "flex", flexWrap: "wrap", gap: 18, alignItems: "flex-end", padding: 16, background: "var(--gray-50)", borderRadius: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 200 }}>
              <Avatar name={empName(e)} size={44} />
              <div><div style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 14, color: "var(--gray-900)" }}>{empName(e)}</div>
                <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-400)" }}>{e.designation || "Employee"}</div></div>
            </div>
            <Field label="Date of hearing" style={{ width: 200, margin: 0 }}><Input icon="calendar-line" placeholder="DD / MM / YYYY" value={rows[i].date} onChange={ev => upd(i, "date", ev.target.value)} /></Field>
            <Field label="From" style={{ flex: 1, minWidth: 130, margin: 0 }}><Input placeholder="09:00 AM" value={rows[i].from} onChange={ev => upd(i, "from", ev.target.value)} /></Field>
            <Field label="To" style={{ flex: 1, minWidth: 130, margin: 0 }}><Input placeholder="10:00 AM" value={rows[i].to} onChange={ev => upd(i, "to", ev.target.value)} /></Field>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
        <Button variant="stroke" onClick={onBack}>Back</Button>
        <Button variant="primary" disabled={!valid} onClick={() => onSchedule(rows)}>Schedule Hearing</Button>
      </div>
    </div>
  );
}

/* ---------- 3 · hearing feedback ---------- */
function HearingFeedbackView({ caseData, onBack, onSubmit }) {
  const emps = caseData.implicatedEmployees;
  const [sel, setSel] = useCF(empKey(emps[0]));
  const [fb, setFb] = useCF({});
  const [done, setDone] = useCF(new Set());
  const cur = fb[sel] || "";
  const complete = () => { if (!cur.trim()) return; setDone(d => new Set(d).add(sel)); };
  const allDone = emps.length > 0 && emps.every(e => done.has(empKey(e)));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 1000 }}>
      <FlowHead title="Disciplinary Hearing" subtitle="Submit all feedback from the disciplinary hearing." stage={caseData.stage} />
      <div className="card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, background: "var(--gray-50)", padding: 10, borderRadius: 10 }}>
          {emps.map(e => <div key={empKey(e)} style={{ flex: "1 1 200px", maxWidth: "50%" }}><EmpRow e={e} selected={sel === empKey(e)} completed={done.has(empKey(e))} onClick={() => setSel(empKey(e))} /></div>)}
        </div>
        <Field label="Feedback from investigative hearing" style={{ margin: 0 }}>
          <Textarea key={sel} placeholder="Any additional notes or messages for this report" value={cur} onChange={e => setFb(s => ({ ...s, [sel]: e.target.value }))} style={{ minHeight: 120 }} />
        </Field>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button variant="primary" disabled={!cur.trim() || done.has(sel)} onClick={complete} icon={done.has(sel) ? "check-line" : undefined}>
            {done.has(sel) ? "Completed" : "Complete Feedback From This Hearing"}
          </Button>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
        <Button variant="stroke" onClick={onBack}>Back</Button>
        <Button variant="primary" disabled={!allDone} onClick={() => onSubmit(fb)}>Submit All Feedbacks</Button>
      </div>
    </div>
  );
}

/* ---------- 4 · hearing summary ---------- */
function HearingSummaryView({ caseData, feedbacks, onBack, onNext }) {
  const emps = caseData.implicatedEmployees;
  const [sel, setSel] = useCF(empKey(emps[0]));
  const fb = (feedbacks && feedbacks[sel]) || hearingFeedback(caseData, sel);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 1000 }}>
      <FlowHead title="Disciplinary Case Decision" subtitle="Review hearing outcomes and finalize the decision." stage="decision" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {emps.map(e => <EmpRow key={empKey(e)} e={e} selected={sel === empKey(e)} onClick={() => setSel(empKey(e))}
          right={sel === empKey(e) ? <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="check-line" size={13} color="#fff" /></span> : null} />)}
      </div>
      <div className="card" style={{ padding: "var(--card-pad, 24px)", border: "1px solid var(--border)" }}>
        <FlowLabel>Feedback</FlowLabel>
        <div style={{ marginTop: 8, background: "var(--gray-50)", border: "1px solid var(--border)", borderRadius: 12, padding: 18, fontFamily: "var(--font-ui)", fontSize: 14, lineHeight: "23px", color: "var(--gray-700)" }}>
          {fb || "No detailed feedback available for this employee."}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
        <Button variant="stroke" onClick={onBack}>Back</Button>
        <Button variant="primary" onClick={onNext}>Next</Button>
      </div>
    </div>
  );
}
const hearingFeedback = (caseData, empId) => { const h = (caseData.hearings || []).find(x => x.employeeId === empId); return h ? h.feedback : ""; };

/* ---------- 5 · decision step ---------- */
const DECISION_ACTIONS = ["Suspension", "Termination", "Warning", "Exoneration"];
function DecisionStepView({ caseData, onBack, onSubmit }) {
  const emps = caseData.implicatedEmployees;
  const [sel, setSel] = useCF(empKey(emps[0]));
  const [dec, setDec] = useCF(() => emps.reduce((a, e) => (a[empKey(e)] = { employeeId: empKey(e), status: "", action: "", notes: "", completed: false }, a), {}));
  const cur = dec[sel];
  const upd = (k, v) => setDec(s => ({ ...s, [sel]: { ...s[sel], [k]: v } }));
  const setStatus = (st) => setDec(s => ({ ...s, [sel]: { ...s[sel], status: s[sel].status === st ? "" : st } }));
  const markComplete = () => upd("completed", true);
  const allDone = Object.values(dec).every(d => d.completed);
  const Box = ({ st, title, sub }) => (
    <button onClick={() => !cur.completed && setStatus(st)} style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, borderRadius: 12, textAlign: "left",
      border: `1px solid ${cur.status === st ? "var(--gray-300)" : "transparent"}`, background: cur.status === st ? "#fff" : "var(--gray-50)", cursor: cur.completed ? "default" : "pointer" }}>
      <span style={{ width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${cur.status === st ? "var(--brand-yellow-dark)" : "var(--gray-300)"}`, background: cur.status === st ? "var(--brand-yellow)" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{cur.status === st && <Icon name="check-line" size={12} color="var(--brand-ink)" />}</span>
      <div><div style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 14, color: "var(--gray-900)" }}>{title}</div><div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-400)" }}>{sub}</div></div>
    </button>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 1000 }}>
      <FlowHead title="Submit Decision" subtitle="Make a decision after reviewing all details." stage="decision" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {emps.map(e => <EmpRow key={empKey(e)} e={e} selected={sel === empKey(e)} completed={dec[empKey(e)].completed} onClick={() => setSel(empKey(e))} />)}
      </div>
      {cur && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Box st="Substantiated" title="Substantiated" sub="All allegations are true" />
            <Box st="Not Substantiated" title="Not Substantiated" sub="All allegations are false" />
          </div>
          <Field label="Action Taken" style={{ margin: 0 }}><Select value={cur.action} onChange={e => upd("action", e.target.value)} options={DECISION_ACTIONS} placeholder="Select a decision" /></Field>
          <Field label="Notes" style={{ margin: 0 }}><Textarea placeholder="Any additional notes or messages for this report" value={cur.notes} onChange={e => upd("notes", e.target.value)} style={{ minHeight: 110 }} /></Field>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            {cur.completed
              ? <Button variant="stroke" onClick={() => upd("completed", false)}>Edit Decision</Button>
              : <Button variant="primary" disabled={!cur.action || !cur.status} onClick={markComplete}>Complete {empName(emps.find(e => empKey(e) === sel))}'s Decision</Button>}
          </div>
        </div>
      )}
      <FlowDivider />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
        <Button variant="stroke" onClick={onBack}>Cancel</Button>
        <Button variant="primary" disabled={!allDone} onClick={() => onSubmit(Object.values(dec))}>Submit Decision</Button>
      </div>
    </div>
  );
}

/* ---------- 6 · report view (completed) ---------- */
function ReportView({ caseData, feedbacks, decisions, onClose }) {
  const getFb = (id) => (feedbacks && feedbacks[id]) || hearingFeedback(caseData, id);
  const getDec = (id) => (decisions || caseData.decisions || []).find(d => d.employeeId === id);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 1000 }}>
      <PageHeader title="Report Details" subtitle="Review the reported incident, implicated employees and attachments." />
      <div className="card" style={{ padding: "var(--card-pad, 24px)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div><FlowLabel>Description of Incident</FlowLabel><p style={{ fontFamily: "var(--font-ui)", fontSize: 14, lineHeight: "23px", color: "var(--gray-700)", marginTop: 8 }}>{caseData.description}</p></div>
          <div><FlowLabel>Attachments</FlowLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 8 }}>
              {(caseData.attachments || []).length === 0 ? <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--gray-400)" }}>None</span>
                : caseData.attachments.map((f, i) => (
                  <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid var(--border)", borderRadius: 10, padding: "8px 12px", fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--gray-800)" }}><FileIcon name={f} size={18} />{f}</span>
                ))}
            </div>
          </div>
        </div>
        <div style={{ margin: "20px 0" }}><FlowDivider /></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {caseData.implicatedEmployees.map((e, i) => {
            const d = getDec(empKey(e));
            const subst = d ? d.status === "Substantiated" : true;
            return (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, background: "var(--gray-50)", borderRadius: 12, padding: 14 }}>
                  <Avatar name={empName(e)} size={44} />
                  <div style={{ minWidth: 0 }}><div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 15, color: "var(--gray-900)", whiteSpace: "nowrap" }}>{empName(e)}</div>
                    <div style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--gray-400)", whiteSpace: "nowrap" }}>{e.designation || "Employee"}</div></div>
                </div>
                <div style={{ paddingLeft: 18, borderLeft: "2px solid var(--border)", marginLeft: 22, display: "flex", flexDirection: "column", gap: 14 }}>
                  <div><FlowLabel>Feedback from investigative hearing</FlowLabel><p style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--gray-600)", marginTop: 6 }}>{getFb(empKey(e)) || "No feedback recorded."}</p></div>
                  <div>
                    <FlowLabel>Decision</FlowLabel>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 6, background: subst ? "#16A34A" : "var(--gray-500)", color: "#fff", padding: "5px 14px", borderRadius: 999, fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", lineHeight: 1.4 }}>
                      <Icon name="checkbox-circle-line" size={15} color="#fff" />{subst ? "Substantiated (All allegations are true)" : "Not Substantiated (All allegations are false)"}
                    </div>
                    <div style={{ marginTop: 10, fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--gray-700)" }}><strong style={{ color: "var(--gray-900)" }}>Action Taken: </strong>{d ? d.action : "—"}</div>
                    {d && d.notes && <div style={{ marginTop: 6, fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--gray-700)" }}>{d.notes}</div>}
                  </div>
                </div>
                {i < caseData.implicatedEmployees.length - 1 && <FlowDivider />}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}><Button variant="stroke" onClick={onClose}>Close Ticket</Button></div>
    </div>
  );
}

/* ---------- orchestrator ---------- */
function DisciplinaryCaseFlow({ caseData, onToast, onStageChange, onExit }) {
  const initStep = () => {
    const s = String(caseData.stage).toLowerCase();
    if (s === "investigation") return "report";
    if (s === "hearing") return "feedback";
    if (s === "decision") return "summary";
    return "reportview"; // completed / cancelled
  };
  const [step, setStep] = useCF(initStep);
  const [feedbacks, setFeedbacks] = useCF(null);
  const [decisions, setDecisions] = useCF(null);
  const [confirm, setConfirm] = useCF(null);
  const scrollTop = () => { const el = document.querySelector(".bh-scroll"); if (el) el.scrollTop = 0; };
  const go = (s) => { setStep(s); scrollTop(); };

  const doSchedule = () => { setConfirm(null); onStageChange(caseData.id, "Hearing"); onToast("Hearing Scheduled", { tone: "success" }); onExit(); };
  const doSubmitFeedback = () => { setConfirm(null); go("summary"); onToast("Feedback Submitted", { tone: "success" }); };
  const doSubmitDecision = () => { setConfirm(null); onStageChange(caseData.id, "Completed"); onToast("Decision Submitted", { tone: "success" }); go("reportview"); };

  let body;
  if (step === "report") body = <InvestigatingReportView caseData={caseData} onCancel={onExit} onSetupHearing={() => go("schedule")} />;
  else if (step === "schedule") body = <ScheduleHearingView caseData={caseData} onBack={() => go("report")} onSchedule={() => setConfirm("schedule")} />;
  else if (step === "feedback") body = <HearingFeedbackView caseData={caseData} onBack={onExit} onSubmit={(fb) => { setFeedbacks(fb); setConfirm("feedback"); }} />;
  else if (step === "summary") body = <HearingSummaryView caseData={caseData} feedbacks={feedbacks} onBack={() => go("feedback")} onNext={() => go("decision")} />;
  else if (step === "decision") body = <DecisionStepView caseData={caseData} onBack={() => go("summary")} onSubmit={(d) => { setDecisions(d); setConfirm("decision"); }} />;
  else body = <ReportView caseData={caseData} feedbacks={feedbacks} decisions={decisions} onClose={onExit} />;

  return (
    <React.Fragment>
      {body}
      {confirm === "schedule" && <ConfirmModal title="Scheduling Hearing" message="In submitting this schedule, all attendees will be notified. Are you sure you want to proceed?" confirmLabel="Yes, Schedule" confirmIcon="calendar-check-line" cancelLabel="Cancel" onConfirm={doSchedule} onClose={() => setConfirm(null)} />}
      {confirm === "feedback" && <ConfirmModal title="Submit Report" message="Are you sure you want to submit this disciplinary case?" confirmLabel="Yes, Submit" confirmIcon="check-line" cancelLabel="Cancel" onConfirm={doSubmitFeedback} onClose={() => setConfirm(null)} />}
      {confirm === "decision" && <ConfirmModal title="Submit Decision" message="Are you sure you want to submit this decision?" confirmLabel="Yes, Submit" confirmIcon="check-line" cancelLabel="Cancel" onConfirm={doSubmitDecision} onClose={() => setConfirm(null)} />}
    </React.Fragment>
  );
}

Object.assign(window, { DisciplinaryCaseFlow });
