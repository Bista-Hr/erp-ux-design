// BISTA HR · target/AssessmentWizard — multi-step "Target Assessment" builder.
// One step per balanced-scorecard perspective; each step picks a job level and builds
// Objectives → Employee Goals → Tasks (each with Annual Target / KPI / Weight).
// Cancel raises the "Cancel Assessment" (save-as-draft) confirm; the last step submits.
const { useState: useAW } = React;

function LevelChips({ value, onChange }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
      {JOB_LEVELS.map(lv => {
        const on = lv === value;
        return (
          <button key={lv} onClick={() => onChange(lv)} style={{ display: "inline-flex", alignItems: "center", gap: 8,
            border: `1px solid ${on ? "#16A34A" : "var(--border)"}`, background: on ? "#ECFDF3" : "#fff", borderRadius: 999,
            padding: "8px 14px", cursor: "pointer", fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 13.5, color: on ? "#16794C" : "var(--gray-600)" }}>
            <span style={{ width: 16, height: 16, borderRadius: "50%", border: `1.5px solid ${on ? "#16A34A" : "var(--gray-300)"}`,
              background: on ? "#16A34A" : "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              {on && <Icon name="check-line" size={11} color="#fff" />}
            </span>
            {lv}
          </button>
        );
      })}
    </div>
  );
}

const yLink = { display: "inline-flex", alignItems: "center", gap: 6, border: 0, background: "none", cursor: "pointer", padding: 0,
  fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 14, color: "var(--brand-yellow-dark)" };

function RowField({ label, children }) {
  return <div style={{ minWidth: 0 }}><label style={{ display: "block", fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--gray-400)", marginBottom: 6 }}>{label}</label>{children}</div>;
}

function AssessmentWizard({ card, initialStep = 0, onCancel, onSubmit }) {
  const [step, setStep] = useAW(initialStep);
  const [data, setData] = useAW(() => PERSPECTIVES.map(() => blankPerspective()));
  const p = PERSPECTIVES[step];
  const cur = data[step];
  const last = step === PERSPECTIVES.length - 1;

  // immutable updates scoped to the current step's objectives
  const setObjectives = (fn) => setData(d => d.map((ps, i) => i === step ? { ...ps, objectives: fn(ps.objectives) } : ps));
  const setLevel = (lv) => setData(d => d.map((ps, i) => i === step ? { ...ps, level: lv } : ps));
  const patchObj = (oid, patch) => setObjectives(os => os.map(o => o.id === oid ? { ...o, ...patch } : o));
  const addObj = () => setObjectives(os => [...os, { id: tgtId(), objective: "", kpi: "", weight: "", goals: [] }]);
  const delObj = (oid) => setObjectives(os => os.length > 1 ? os.filter(o => o.id !== oid) : os);
  const patchGoal = (oid, gid, patch) => setObjectives(os => os.map(o => o.id === oid ? { ...o, goals: o.goals.map(g => g.id === gid ? { ...g, ...patch } : g) } : o));
  const addGoal = (oid) => setObjectives(os => os.map(o => o.id === oid ? { ...o, goals: [...o.goals, { id: tgtId(), goal: "", target: "", kpi: "", weight: "", tasks: [] }] } : o));
  const delGoal = (oid, gid) => setObjectives(os => os.map(o => o.id === oid ? { ...o, goals: o.goals.filter(g => g.id !== gid) } : o));
  const patchTask = (oid, gid, tid, patch) => setObjectives(os => os.map(o => o.id === oid ? { ...o, goals: o.goals.map(g => g.id === gid ? { ...g, tasks: g.tasks.map(t => t.id === tid ? { ...t, ...patch } : t) } : g) } : o));
  const addTask = (oid, gid) => setObjectives(os => os.map(o => o.id === oid ? { ...o, goals: o.goals.map(g => g.id === gid ? { ...g, tasks: [...g.tasks, { id: tgtId(), task: "", target: "", kpi: "", weight: "" }] } : g) } : o));
  const delTask = (oid, gid, tid) => setObjectives(os => os.map(o => o.id === oid ? { ...o, goals: o.goals.map(g => g.id === gid ? { ...g, tasks: g.tasks.filter(t => t.id !== tid) } : g) } : o));

  const next = () => last ? onSubmit(data) : setStep(s => s + 1);

  return (
    <div className="card" style={{ overflow: "visible", padding: "var(--card-pad, 24px)" }}>
      <span style={{ display: "inline-flex", background: "#2A2D34", color: "#fff", borderRadius: 8, padding: "5px 12px",
        fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 12.5 }}>Step {step + 1} of {PERSPECTIVES.length}</span>
      <div style={{ marginTop: 14 }}>
        <div className="bh-h2" style={{ fontSize: 22 }}>{p.name} ({p.weight}%)</div>
        <div className="bh-body" style={{ marginTop: 4 }}>Set your target for the {p.name.toLowerCase()} perspective to make sure it sums to the weight of {p.weight}%</div>
      </div>

      <div style={{ marginTop: 22 }}>
        <label style={{ display: "block", fontFamily: "var(--font-head)", fontWeight: 500, fontSize: 14, color: "var(--gray-900)", marginBottom: 10 }}>Select a job level</label>
        <LevelChips value={cur.level} onChange={setLevel} />
      </div>

      <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 20 }}>
        {cur.objectives.map(o => (
          <div key={o.id} style={{ borderRadius: 14, padding: 18 }}>
            {/* objective header */}
            <div className="tgt-obj-row">
              <RowField label="Objective"><Combobox value={o.objective} onChange={v => patchObj(o.id, { objective: v })} options={OBJECTIVE_OPTS} placeholder="Select objective" /></RowField>
              <RowField label="KPI"><Combobox value={o.kpi} onChange={v => patchObj(o.id, { kpi: v })} options={KPI_OPTS} placeholder="Select a KPI" /></RowField>
              <RowField label="Weight"><Input type="number" min="0" value={o.weight} onChange={e => patchObj(o.id, { weight: e.target.value })} placeholder="0" /></RowField>
            </div>

            {/* goals */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
              {o.goals.map(g => (
                <div key={g.id} style={{ borderTop: "1px solid var(--divider)", paddingTop: 14 }}>
                  <div className="tgt-goal-row">
                    <RowField label="Employee Goal"><Combobox value={g.goal} onChange={v => patchGoal(o.id, g.id, { goal: v })} options={GOAL_OPTS} placeholder="Select a goal" /></RowField>
                    <RowField label="Annual Target"><Input value={g.target} onChange={e => patchGoal(o.id, g.id, { target: e.target.value })} placeholder="Eg. 5%" /></RowField>
                    <RowField label="KPI"><Combobox value={g.kpi} onChange={v => patchGoal(o.id, g.id, { kpi: v })} options={KPI_OPTS} placeholder="Select a KPI" /></RowField>
                    <RowField label="Weight"><Input type="number" min="0" value={g.weight} onChange={e => patchGoal(o.id, g.id, { weight: e.target.value })} placeholder="0" /></RowField>
                    <button className="row-act" onClick={() => delGoal(o.id, g.id)} title="Remove goal" style={{ color: "var(--error)", alignSelf: "end", marginBottom: 4 }}><Icon name="delete-bin-6-line" size={18} /></button>
                  </div>
                  {/* tasks */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12, paddingLeft: 14, borderLeft: "2px solid var(--divider)" }}>
                    {g.tasks.map(t => (
                      <div key={t.id} className="tgt-goal-row">
                        <RowField label="Task"><Combobox value={t.task} onChange={v => patchTask(o.id, g.id, t.id, { task: v })} options={GOAL_OPTS} placeholder="Select a task" /></RowField>
                        <RowField label="Annual Target"><Input value={t.target} onChange={e => patchTask(o.id, g.id, t.id, { target: e.target.value })} placeholder="Eg. 5%" /></RowField>
                        <RowField label="KPI"><Combobox value={t.kpi} onChange={v => patchTask(o.id, g.id, t.id, { kpi: v })} options={KPI_OPTS} placeholder="Select a KPI" /></RowField>
                        <RowField label="Weight"><Input type="number" min="0" value={t.weight} onChange={e => patchTask(o.id, g.id, t.id, { weight: e.target.value })} placeholder="0" /></RowField>
                        <button className="row-act" onClick={() => delTask(o.id, g.id, t.id)} title="Remove task" style={{ color: "var(--error)", alignSelf: "end", marginBottom: 4 }}><Icon name="delete-bin-6-line" size={18} /></button>
                      </div>
                    ))}
                    <button onClick={() => addTask(o.id, g.id)} style={{ ...yLink, alignSelf: "flex-start" }}><Icon name="add-line" size={16} color="var(--brand-yellow-dark)" />Add Task</button>
                  </div>
                </div>
              ))}
              <button onClick={() => addGoal(o.id)} style={{ ...yLink, alignSelf: "flex-start" }}><Icon name="add-line" size={16} color="var(--brand-yellow-dark)" />Add Another Employee Goal</button>
            </div>
            {cur.objectives.length > 1 && (
              <div style={{ marginTop: 14, textAlign: "right" }}>
                <button onClick={() => delObj(o.id)} style={{ ...yLink, color: "var(--error)" }}><Icon name="delete-bin-6-line" size={16} color="var(--error)" />Remove Objective</button>
              </div>
            )}
          </div>
        ))}
        <button onClick={addObj} style={{ ...yLink, alignSelf: "flex-start" }}><Icon name="add-line" size={18} color="var(--brand-yellow-dark)" />Add Objective</button>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 24 }}>
        <div>{step > 0 && <Button variant="stroke" icon="arrow-left-line" onClick={() => setStep(s => s - 1)}>Back</Button>}</div>
        <div style={{ display: "flex", gap: 12 }}>
          <Button variant="stroke" onClick={onCancel}>Cancel</Button>
          <Button variant="primary" iconRight={last ? "check-line" : "arrow-right-s-line"} onClick={next}>{last ? "Submit Assessment" : "Continue"}</Button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AssessmentWizard, LevelChips });
