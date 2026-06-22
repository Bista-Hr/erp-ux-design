// BISTA HR · performance/IdpWizard — Individual Development Plan create/edit stepper.
// Step 1 Personal Info → one step per Development Goal (min 3 to submit, max 5). Each goal:
// name, description, type, priority, and activities — every activity tagged with 70-20-10
// learning methods (on-the-job / social / formal) + optional supplementary formal training.
// Footer: Save as Draft / Back / Continue / Add Additional Goal / Complete & Submit.
const { useState: useIW } = React;
const MIN_IDP_GOALS = 3, MAX_IDP_GOALS = 5;

function IwField({ label, required, optional, children }) {
  return (
    <div style={{ minWidth: 0 }}>
      <label style={{ display: "block", fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--gray-500)", marginBottom: 6, fontWeight: 500 }}>
        {label}{required && <span style={{ color: "var(--error)" }}> *</span>}{optional && <span style={{ color: "var(--gray-400)" }}> (Optional)</span>}
      </label>
      {children}
    </div>
  );
}
function IwReadField({ label, value }) {
  return <IwField label={label}><div style={{ display: "flex", alignItems: "center", padding: "10px 12px", borderRadius: 10, background: "var(--gray-50)", border: "1px solid var(--border)", fontFamily: "var(--font-control)", fontSize: 14, color: "var(--gray-700)", minHeight: 20 }}>{value || "—"}</div></IwField>;
}

// IDP stepper header
function IdpStepper({ step, total }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 18 }}>
      {Array.from({ length: total }).map((_, i) => {
        const n = i + 1, done = n < step, active = n === step;
        return (
          <React.Fragment key={i}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 26, height: 26, borderRadius: "50%", display: "grid", placeItems: "center", flexShrink: 0,
                background: done ? "var(--success)" : active ? "var(--brand-yellow)" : "var(--gray-100)",
                color: done ? "#fff" : active ? "var(--brand-ink)" : "var(--gray-400)",
                fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 12 }}>
                {done ? <Icon name="check-line" size={14} color="#fff" /> : n}
              </span>
              <span style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, fontWeight: active ? 700 : 500, color: active ? "var(--gray-900)" : "var(--gray-400)" }}>{i === 0 ? "Personal Info" : `Goal ${i}`}</span>
            </div>
            {i < total - 1 && <div style={{ flex: 1, height: 2, background: done ? "var(--success)" : "var(--gray-150, #E5E7EB)", margin: "0 10px", minWidth: 14 }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// single/multi-select learning-method chip group
function ChipGroup({ label, options, value, onToggle, multi }) {
  const selected = multi ? (value || []) : [value];
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 10, background: "#fff", padding: 12 }}>
      <div style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 12, color: "var(--gray-700)", marginBottom: 9 }}>{label}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {options.map((opt) => {
          const on = selected.includes(opt);
          const dim = !on && !multi && value;
          return (
            <button key={opt} onClick={() => onToggle(opt)} style={{ display: "inline-flex", alignItems: "center", gap: 6,
              border: `1px solid ${on ? "var(--brand-yellow-dark)" : "var(--border)"}`, background: on ? "var(--brand-yellow-tint)" : "#fff",
              borderRadius: 999, padding: "6px 12px", cursor: "pointer", opacity: dim ? 0.55 : 1,
              fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 12.5, color: on ? "var(--warning-deep)" : "var(--gray-600)" }}>
              {on && <Icon name="check-line" size={13} color="var(--brand-yellow-dark)" />}{opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PersonalInfoStepIdp({ form, onChange }) {
  const years = [...new Set([...PERF_PERIODS.map((p) => p.year), 2026, form.appraisalYear].filter(Boolean))].sort((a, b) => b - a);
  const periodsForYear = PERF_PERIODS.filter((p) => String(p.year) === String(form.appraisalYear));
  return (
    <React.Fragment>
      <PageHeader title="Personal Information" subtitle="Confirm your details and the appraisal cycle for this development plan" />
      <div className="card" style={{ padding: 24, marginTop: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <IwReadField label="Employee Name" value={idpEmployee.fullName} />
          <IwReadField label="Employee ID" value={idpEmployee.employeeId} />
          <IwReadField label="Job Title" value={idpEmployee.designation} />
          <IwReadField label="Department" value={idpEmployee.department} />
          <IwReadField label="Branch/Unit" value={idpEmployee.branch} />
          <IwReadField label="Line Manager" value={idpEmployee.reportingManager} />
          <IwField label="Appraisal Year" required>
            <Select value={String(form.appraisalYear || "")} options={years.map(String)} placeholder="Select year"
              onChange={(e) => onChange({ appraisalYear: Number(e.target.value), periodId: "", startDate: "", endDate: "" })} />
          </IwField>
          <IwField label="Appraisal Period" required>
            <Select value={periodsForYear.find((p) => p.id === form.periodId)?.name || ""} options={periodsForYear.map((p) => p.name)} placeholder="Select period"
              onChange={(e) => { const p = periodsForYear.find((x) => x.name === e.target.value); onChange({ periodId: p?.id || "", startDate: p?.start || "", endDate: p?.end || "" }); }} />
          </IwField>
          <IwReadField label="Start Date" value={form.startDate ? fmtDate(form.startDate) : ""} />
          <IwReadField label="End Date" value={form.endDate ? fmtDate(form.endDate) : ""} />
        </div>
      </div>
    </React.Fragment>
  );
}

function GoalStepIdp({ goal, index, onChange, planEndDate }) {
  const patch = (k, v) => onChange({ ...goal, [k]: v });
  const patchAct = (aid, p) => onChange({ ...goal, activities: goal.activities.map((a) => a.id === aid ? { ...a, ...p } : a) });
  const addAct = () => onChange({ ...goal, activities: [...goal.activities, newActivity(planEndDate)] });
  const delAct = (aid) => goal.activities.length > 1 && onChange({ ...goal, activities: goal.activities.filter((a) => a.id !== aid) });
  const toggleMulti = (aid, code) => { const a = goal.activities.find((x) => x.id === aid); const cur = a.additionalFormal || []; patchAct(aid, { additionalFormal: cur.includes(code) ? cur.filter((c) => c !== code) : [...cur, code] }); };

  return (
    <React.Fragment>
      <PageHeader title={`Development Goal ${index + 1}`} subtitle="Define the capability, skill, or leadership goal to develop" />
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
        <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <IwField label="Development Goal" required><Input value={goal.developmentGoal} onChange={(e) => patch("developmentGoal", e.target.value)} placeholder="Enter name of development goal" /></IwField>
          <IwField label="Goal Description / Comments"><Textarea value={goal.comments} onChange={(e) => patch("comments", e.target.value)} placeholder="Describe the goal, expected outcomes, or additional context…" style={{ minHeight: 80 }} /></IwField>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <IwField label="Goal Type" required><Select value={goal.type} options={GOAL_TYPES} placeholder="Select a goal type" onChange={(e) => patch("type", e.target.value)} /></IwField>
            <IwField label="Priority" required><Select value={goal.priority} options={GOAL_PRIORITIES} placeholder="Select priority of goal" onChange={(e) => patch("priority", e.target.value)} /></IwField>
          </div>
        </div>

        {goal.activities.map((a, ai) => (
          <div key={a.id} className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14, background: "var(--gray-25)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 14, color: "var(--gray-900)" }}>Action &amp; Activity <span style={{ color: "var(--error)" }}>*</span></div>
              {goal.activities.length > 1 && <button onClick={() => delAct(a.id)} style={{ border: 0, background: "none", cursor: "pointer", color: "var(--gray-400)" }}><Icon name="close-line" size={18} /></button>}
            </div>
            <Input value={a.description} onChange={(e) => patchAct(a.id, { description: e.target.value })} placeholder="Type activity here" />
            <div style={{ maxWidth: 280 }}><IwField label="End Date" required><UI.DatePicker value={a.endDate || ""} onSelect={(d) => patchAct(a.id, { endDate: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}` })} placeholder="Pick a date" /></IwField></div>
            <div style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 11.5, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--gray-400)" }}>Learning Methods — pick one per tier (70-20-10)</div>
            <ChipGroup label={LEARNING_METHODS.onJob.label} options={LEARNING_METHODS.onJob.options} value={a.onJob} onToggle={(v) => patchAct(a.id, { onJob: a.onJob === v ? "" : v })} />
            <ChipGroup label={LEARNING_METHODS.social.label} options={LEARNING_METHODS.social.options} value={a.social} onToggle={(v) => patchAct(a.id, { social: a.social === v ? "" : v })} />
            <ChipGroup label={LEARNING_METHODS.formal.label} options={LEARNING_METHODS.formal.options} value={a.formal} onToggle={(v) => patchAct(a.id, { formal: a.formal === v ? "" : v })} />
            <ChipGroup label="Additional formal training methods" options={FORMAL_SUPPLEMENTARY} value={a.additionalFormal} onToggle={(v) => toggleMulti(a.id, v)} multi />
            <IwField label="Activity Comments"><Textarea value={a.comments} onChange={(e) => patchAct(a.id, { comments: e.target.value })} placeholder="Add notes or comments about this activity…" style={{ minHeight: 64 }} /></IwField>
          </div>
        ))}
        <button onClick={addAct} style={{ display: "inline-flex", alignItems: "center", gap: 6, border: 0, background: "none", cursor: "pointer", padding: 0, fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 14, color: "var(--brand-yellow-dark)", alignSelf: "flex-start" }}>
          <Icon name="add-line" size={16} color="var(--brand-yellow-dark)" />Add another activity
        </button>
      </div>
    </React.Fragment>
  );
}

function IdpWizard({ initial, onCancel, onSubmit, onSaveDraft, onToast }) {
  const [form, setForm] = useIW(() => initial || { appraisalYear: 2026, periodId: "", startDate: "", endDate: "", goals: [newGoal("")] });
  const [step, setStep] = useIW(0);
  const totalSteps = 1 + Math.max(form.goals.length, MIN_IDP_GOALS);

  const setGoal = (idx, g) => setForm((f) => ({ ...f, goals: f.goals.map((x, i) => i === idx ? g : x) }));
  const addGoal = () => { if (form.goals.length >= MAX_IDP_GOALS) return; setForm((f) => ({ ...f, goals: [...f.goals, newGoal(f.endDate)] })); setStep((s) => s + 1); };

  const onPersonalContinue = () => {
    if (!form.periodId) { onToast("Select an appraisal period to continue.", { tone: "error" }); return; }
    setStep(1);
  };
  const goalIdx = step - 1;
  const goal = form.goals[goalIdx];
  const canContinue = goalIdx + 1 < form.goals.length; // more goals already exist after this one
  const canSubmit = form.goals.length >= MIN_IDP_GOALS && goalIdx + 1 === form.goals.length;
  const canAddGoal = goalIdx + 1 >= MIN_IDP_GOALS && form.goals.length < MAX_IDP_GOALS && goalIdx + 1 === form.goals.length;

  const onGoalNext = () => {
    if (!idpGoalValid(goal)) { onToast("Complete the goal — name, type, priority and each activity's methods & end date.", { tone: "error" }); return; }
    if (goalIdx + 1 < form.goals.length) setStep((s) => s + 1);
    else if (form.goals.length < MIN_IDP_GOALS) addGoal();
  };

  return (
    <div className="card" style={{ overflow: "visible", padding: "var(--card-pad, 24px)" }}>
      <IdpStepper step={step + 1} total={totalSteps} />
      {step === 0
        ? <PersonalInfoStepIdp form={form} onChange={(p) => setForm((f) => ({ ...f, ...p }))} />
        : <GoalStepIdp goal={goal} index={goalIdx} onChange={(g) => setGoal(goalIdx, g)} planEndDate={form.endDate} />}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--divider)" }}>
        <div>
          {step > 0 && canAddGoal && <Button variant="stroke" icon="add-line" onClick={addGoal} style={{ borderColor: "var(--brand-yellow-dark)", color: "var(--brand-yellow-dark)" }}>Add Additional Goal</Button>}
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {step > 0 && <Button variant="stroke" icon="arrow-left-line" onClick={() => setStep((s) => s - 1)}>Back</Button>}
          <Button variant="stroke" onClick={() => onSaveDraft(form)}>Save as Draft</Button>
          {step === 0
            ? <Button variant="primary" iconRight="arrow-right-s-line" onClick={onPersonalContinue}>Continue</Button>
            : canSubmit
              ? <Button variant="primary" iconRight="check-line" onClick={() => { if (!idpGoalValid(goal)) { onToast("Complete this goal before submitting.", { tone: "error" }); return; } onSubmit(form); }}>Complete &amp; Submit</Button>
              : <Button variant="primary" iconRight="arrow-right-s-line" onClick={onGoalNext}>Continue</Button>}
        </div>
      </div>
      {step > 0 && (
        <div style={{ marginTop: 10, textAlign: "right", fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-400)" }}>
          {form.goals.length < MIN_IDP_GOALS ? `Add at least ${MIN_IDP_GOALS} goals to submit (${form.goals.length}/${MIN_IDP_GOALS}).` : `${form.goals.length} of ${MAX_IDP_GOALS} goals`}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { IdpWizard, IdpStepper, ChipGroup, GoalStepIdp });
