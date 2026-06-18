// BISTA HR · performance/GoalWizard — create/edit goal-setting wizard.
// Mirrors the codebase TargetRequestForm step sequence exactly:
//   Step 1  Personal Information (readonly employee + appraisal year/period → auto dates)
//   Step 2..N  one step per department perspective (objective → goal → task builder)
//   Step N+1  Behavioural Score (pick competency level 1–4 → descriptors)
//   Step N+2  Summary (review per-perspective + behavioural, Edit any step, Submit)
// Each "Continue" persists progress ("Progress saved" toast). The last perspective step
// validates that all goal/task weights sum to 100%. Submitting raises "Goal Created/Updated".
const { useState: useGW } = React;

const gwLink = { display: "inline-flex", alignItems: "center", gap: 6, border: 0, background: "none", cursor: "pointer", padding: 0,
  fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 14, color: "var(--brand-yellow-dark)" };

function GWField({ label, children }) {
  return <div style={{ minWidth: 0 }}><label style={{ display: "block", fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--gray-400)", marginBottom: 6 }}>{label}</label>{children}</div>;
}
function ReadField({ label, value }) {
  return (
    <GWField label={label}>
      <div style={{ display: "flex", alignItems: "center", padding: "10px 12px", borderRadius: 10, background: "var(--gray-50)", border: "1px solid var(--border)",
        fontFamily: "var(--font-control)", fontSize: 14, color: "var(--gray-700)", minHeight: 20 }}>{value || "—"}</div>
    </GWField>
  );
}

// ---- Personal Information step ----
function PersonalInfoStep({ form, employee, onChange }) {
  const years = [...new Set([...PERF_PERIODS.map((p) => p.year), new Date().getFullYear(), form.appraisalYear])].sort((a, b) => b - a);
  const periodsForYear = PERF_PERIODS.filter((p) => p.year === form.appraisalYear);
  return (
    <React.Fragment>
      <PageHeader title="Personal Information" subtitle="Provide the personal details of the employee" />
      <div className="card" style={{ padding: 24, marginTop: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <ReadField label="Employee Name" value={employee.name} />
          <ReadField label="Employee ID" value={employee.employeeNumber} />
          <ReadField label="Job Title" value={employee.designation} />
          <ReadField label="Department" value={employee.department} />
          <ReadField label="Branch/Unit" value={employee.branch} />
          <ReadField label="Appraiser" value={employee.appraiser} />
          <GWField label="Appraisal Year">
            <Select value={String(form.appraisalYear)} placeholder="Select appraisal year"
              options={years.map(String)}
              onChange={(e) => onChange({ appraisalYear: Number(e.target.value), periodId: "", startDate: "", endDate: "" })} />
          </GWField>
          <GWField label="Appraisal Period">
            <Select value={periodsForYear.find((p) => p.id === form.periodId)?.name || ""} placeholder="Select appraisal period"
              options={periodsForYear.map((p) => p.name)}
              onChange={(e) => { const p = periodsForYear.find((x) => x.name === e.target.value); onChange({ periodId: p?.id || "", startDate: p?.start || "", endDate: p?.end || "" }); }} />
          </GWField>
          <ReadField label="Start Date" value={form.startDate ? fmtDate(form.startDate) : ""} />
          <ReadField label="End Date" value={form.endDate ? fmtDate(form.endDate) : ""} />
        </div>
      </div>
    </React.Fragment>
  );
}

// ---- one perspective builder step ----
function PerspectiveStep({ persp, onPatch }) {
  const objOptions = objectivesForPerspective(persp.perspectiveKey).map((o) => o.name);
  const setObjectives = (fn) => onPatch({ objectives: fn(persp.objectives) });
  const patchObj = (oid, patch) => setObjectives((os) => os.map((o) => o.id === oid ? { ...o, ...patch } : o));
  const addObj = () => setObjectives((os) => [...os, blankPerfObjective(persp.perspectiveWeight)]);
  const delObj = (oid) => setObjectives((os) => os.length > 1 ? os.filter((o) => o.id !== oid) : os);
  const patchGoal = (oid, gid, patch) => setObjectives((os) => os.map((o) => o.id === oid ? { ...o, goals: o.goals.map((g) => g.id === gid ? { ...g, ...patch } : g) } : o));
  const addGoal = (oid) => setObjectives((os) => os.map((o) => o.id === oid ? { ...o, goals: [...o.goals, { id: perfId(), goal: "", target: "", kpi: "", weight: "", tasks: [] }] } : o));
  const delGoal = (oid, gid) => setObjectives((os) => os.map((o) => o.id === oid ? { ...o, goals: o.goals.filter((g) => g.id !== gid) } : o));
  const patchTask = (oid, gid, tid, patch) => setObjectives((os) => os.map((o) => o.id === oid ? { ...o, goals: o.goals.map((g) => g.id === gid ? { ...g, tasks: g.tasks.map((t) => t.id === tid ? { ...t, ...patch } : t) } : g) } : o));
  const addTask = (oid, gid) => setObjectives((os) => os.map((o) => o.id === oid ? { ...o, goals: o.goals.map((g) => g.id === gid ? { ...g, tasks: [...g.tasks, { id: perfId(), task: "", target: "", kpi: "", weight: "" }] } : g) } : o));
  const delTask = (oid, gid, tid) => setObjectives((os) => os.map((o) => o.id === oid ? { ...o, goals: o.goals.map((g) => g.id === gid ? { ...g, tasks: g.tasks.filter((t) => t.id !== tid) } : g) } : o));

  return (
    <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 20 }}>
      {persp.objectives.map((o) => (
        <div key={o.id} style={{ border: "1px solid var(--border)", borderRadius: 14, padding: 18 }}>
          <div className="tgt-obj-row">
            <GWField label="Objective"><Combobox value={o.objective} onChange={(v) => patchObj(o.id, { objective: v, kpi: "" })} options={objOptions} placeholder="Select objective" /></GWField>
            <GWField label="KPI"><Combobox value={o.kpi} onChange={(v) => patchObj(o.id, { kpi: v })} options={kpisForObjective(o.objective)} placeholder="Select a KPI" /></GWField>
            <GWField label="Weight"><Input type="number" min="0" value={o.weight} onChange={(e) => patchObj(o.id, { weight: e.target.value })} placeholder="0" /></GWField>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
            {o.goals.map((g) => (
              <div key={g.id} style={{ borderTop: "1px solid var(--divider)", paddingTop: 14 }}>
                <div className="tgt-goal-row">
                  <GWField label="Employee Goal"><Combobox value={g.goal} onChange={(v) => patchGoal(o.id, g.id, { goal: v })} options={objOptions} placeholder="Select a goal" /></GWField>
                  <GWField label="Annual Target"><Input value={g.target} onChange={(e) => patchGoal(o.id, g.id, { target: e.target.value })} placeholder="Eg. 5%" /></GWField>
                  <GWField label="KPI"><Combobox value={g.kpi} onChange={(v) => patchGoal(o.id, g.id, { kpi: v })} options={kpisForObjective(o.objective)} placeholder="Select a KPI" /></GWField>
                  <GWField label="Weight"><Input type="number" min="0" value={g.weight} onChange={(e) => patchGoal(o.id, g.id, { weight: e.target.value })} placeholder="0" /></GWField>
                  <button className="row-act" onClick={() => delGoal(o.id, g.id)} title="Remove goal" style={{ color: "var(--error)", alignSelf: "end", marginBottom: 4 }}><Icon name="delete-bin-6-line" size={18} /></button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12, paddingLeft: 14, borderLeft: "2px solid var(--divider)" }}>
                  {g.tasks.map((t) => (
                    <div key={t.id} className="tgt-goal-row">
                      <GWField label="Task"><Combobox value={t.task} onChange={(v) => patchTask(o.id, g.id, t.id, { task: v })} options={objOptions} placeholder="Select a task" /></GWField>
                      <GWField label="Annual Target"><Input value={t.target} onChange={(e) => patchTask(o.id, g.id, t.id, { target: e.target.value })} placeholder="Eg. 5%" /></GWField>
                      <GWField label="KPI"><Combobox value={t.kpi} onChange={(v) => patchTask(o.id, g.id, t.id, { kpi: v })} options={kpisForObjective(o.objective)} placeholder="Select a KPI" /></GWField>
                      <GWField label="Weight"><Input type="number" min="0" value={t.weight} onChange={(e) => patchTask(o.id, g.id, t.id, { weight: e.target.value })} placeholder="0" /></GWField>
                      <button className="row-act" onClick={() => delTask(o.id, g.id, t.id)} title="Remove task" style={{ color: "var(--error)", alignSelf: "end", marginBottom: 4 }}><Icon name="delete-bin-6-line" size={18} /></button>
                    </div>
                  ))}
                  <button onClick={() => addTask(o.id, g.id)} style={{ ...gwLink, alignSelf: "flex-start" }}><Icon name="add-line" size={16} color="var(--brand-yellow-dark)" />Add Task</button>
                </div>
              </div>
            ))}
            <button onClick={() => addGoal(o.id)} style={{ ...gwLink, alignSelf: "flex-start" }}><Icon name="add-line" size={16} color="var(--brand-yellow-dark)" />Add Another Employee Goal</button>
          </div>
          {persp.objectives.length > 1 && (
            <div style={{ marginTop: 14, textAlign: "right" }}>
              <button onClick={() => delObj(o.id)} style={{ ...gwLink, color: "var(--error)" }}><Icon name="delete-bin-6-line" size={16} color="var(--error)" />Remove Objective</button>
            </div>
          )}
        </div>
      ))}
      <button onClick={addObj} style={{ ...gwLink, alignSelf: "flex-start" }}><Icon name="add-line" size={18} color="var(--brand-yellow-dark)" />Add Objective</button>
    </div>
  );
}

// ---- Behavioural step (level select 1–4) ----
function BehaviouralStep({ level, onLevel }) {
  return (
    <React.Fragment>
      <PageHeader title="Behavioural Score" subtitle="Score yourself based on your Behavioural Score or competencies." />
      <div className="card" style={{ padding: 24, marginTop: 16 }}>
        <label style={{ display: "block", fontFamily: "var(--font-head)", fontWeight: 500, fontSize: 14, color: "var(--gray-900)", marginBottom: 12 }}>Level</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {[1, 2, 3, 4].map((lv) => {
            const on = lv === level;
            return (
              <button key={lv} onClick={() => onLevel(lv)} style={{ display: "inline-flex", alignItems: "center", gap: 9,
                border: `1px solid ${on ? "var(--brand-yellow-dark)" : "var(--border)"}`, background: on ? "var(--brand-yellow-tint)" : "#fff", borderRadius: 10,
                padding: "12px 16px", cursor: "pointer", fontFamily: "var(--font-ui)", fontWeight: on ? 700 : 500, fontSize: 13.5, color: on ? "var(--warning-deep)" : "var(--gray-700)" }}>
                <span style={{ width: 16, height: 16, borderRadius: "50%", border: `1.5px solid ${on ? "var(--brand-yellow-dark)" : "var(--gray-300)"}`,
                  background: on ? "var(--brand-yellow)" : "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  {on && <Icon name="check-line" size={11} color="var(--brand-ink)" />}
                </span>
                {COMPETENCY_LEVELS[lv]}
              </button>
            );
          })}
        </div>
        {level && <div style={{ marginTop: 22 }}><BehaviouralDisplay selectedLevel={level} /></div>}
      </div>
    </React.Fragment>
  );
}

// ---- Summary step ----
function SummaryStep({ form, level, onEdit }) {
  const [tab, setTab] = useGW("objectives");
  return (
    <React.Fragment>
      <div style={{ marginBottom: 16 }}>
        <div className="bh-h2" style={{ fontSize: 24 }}>Summary</div>
        <div className="bh-body" style={{ marginTop: 4 }}>Review and make sure all weights of the perspectives and objectives sum up to 100%</div>
      </div>
      <PillTabs active={tab} onChange={setTab} items={[
        { value: "objectives", label: `Objectives Scores (${OBJECTIVE_SCORE_PCT}%)` },
        { value: "behavioural", label: `Behavioural Scores (${BEHAVIOURAL_SCORE_PCT}%)` },
      ]} />
      {tab === "objectives" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 18 }}>
          {form.perspectives.map((p, i) => {
            const tint = DEPT_PERSPECTIVES.find((d) => d.id === p.perspectiveId)?.tint || "cream";
            return (
              <div key={p.perspectiveId} style={{ background: "#FAFAFA", border: "1px solid var(--border)", borderRadius: 14, padding: 18 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 16, color: "var(--gray-900)" }}>{p.perspectiveName} ({p.perspectiveWeight}%)</div>
                  <button onClick={() => onEdit(i + 1)} style={{ ...gwLink }}><Icon name="edit-2-line" size={15} color="var(--brand-yellow-dark)" />Edit</button>
                </div>
                <ObjectiveSectionDisplay objectives={p.objectives} tint={tint} />
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ marginTop: 18 }}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <button onClick={() => onEdit(form.perspectives.length + 1)} style={{ ...gwLink }}><Icon name="edit-2-line" size={15} color="var(--brand-yellow-dark)" />Edit</button>
          </div>
          <BehaviouralDisplay selectedLevel={level} />
        </div>
      )}
    </React.Fragment>
  );
}

function GoalWizard({ employee, initial, onCancel, onSubmit, onToast, jumpStep }) {
  const [form, setForm] = useGW(() => initial || blankGoalForm(employee));
  const [level, setLevel] = useGW(initial?.competencyLevel || null);
  const N = form.perspectives.length;
  const totalSteps = N + 3; // personal + perspectives + behavioural + summary
  const [step, setStep] = useGW(jumpStep != null ? jumpStep : 0);

  const patchPerspective = (idx, patch) => setForm((f) => ({ ...f, perspectives: f.perspectives.map((p, i) => i === idx ? { ...p, ...patch } : p) }));

  const isPerspectiveStep = step >= 1 && step <= N;
  const perspectiveIdx = step - 1;

  const handleContinue = () => {
    // last perspective step → validate total weights sum to 100
    if (step === N) {
      const total = totalGoalWeight(form.perspectives);
      if (total !== 100) {
        onToast(`All goal weights must sum to 100%. Current total is ${total > 100 ? "more" : "less"}: ${total}%`, { tone: "error" });
        return;
      }
    }
    if (step === 0 && !form.periodId) {
      onToast("Appraisal period is required.", { tone: "error" });
      return;
    }
    onToast("Progress saved", { tone: "success" });
    setStep((s) => s + 1);
  };

  let body;
  if (step === 0) {
    body = <PersonalInfoStep form={form} employee={employee} onChange={(patch) => setForm((f) => ({ ...f, ...patch }))} />;
  } else if (isPerspectiveStep) {
    const p = form.perspectives[perspectiveIdx];
    body = (
      <React.Fragment>
        <div style={{ marginBottom: 12 }}><StepPill step={step + 1} total={totalSteps} tone="primary" /></div>
        <PageHeader title={`${p.perspectiveName} (${p.perspectiveWeight}%)`}
          subtitle={`Set your employee goals for the ${p.perspectiveName.toLowerCase()} perspective. All goal weights across all perspectives must sum to 100%.`} />
        <PerspectiveStep persp={p} onPatch={(patch) => patchPerspective(perspectiveIdx, patch)} />
      </React.Fragment>
    );
  } else if (step === N + 1) {
    body = (
      <React.Fragment>
        <div style={{ marginBottom: 12 }}><StepPill step={step + 1} total={totalSteps} tone="primary" /></div>
        <BehaviouralStep level={level} onLevel={setLevel} />
      </React.Fragment>
    );
  } else {
    body = (
      <React.Fragment>
        <div style={{ marginBottom: 12 }}><StepPill step={step + 1} total={totalSteps} /></div>
        <SummaryStep form={form} level={level} onEdit={(s) => setStep(s)} />
      </React.Fragment>
    );
  }

  const isSummary = step === totalSteps - 1;
  const isBehavioural = step === N + 1;
  return (
    <div className="card" style={{ overflow: "visible", padding: "var(--card-pad, 24px)" }}>
      {step === 0 && <div style={{ marginBottom: 4 }}><StepPill step={1} total={totalSteps} tone="primary" /></div>}
      {body}
      <WizardFooter
        onCancel={onCancel}
        onBack={step > 0 ? () => setStep((s) => s - 1) : null}
        backDisabled={step === 0}
        primaryLabel={isSummary ? "Submit Request" : "Continue"}
        primaryIcon={isSummary ? "check-line" : "arrow-right-s-line"}
        primaryDisabled={isBehavioural && !level}
        onPrimary={isSummary ? () => onSubmit(form, level) : handleContinue}
      />
    </div>
  );
}

Object.assign(window, { GoalWizard });
