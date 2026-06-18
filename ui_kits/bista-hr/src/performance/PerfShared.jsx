// BISTA HR · performance/PerfShared — display + layout pieces shared across Performance screens.
// ObjectiveSectionDisplay (read-only objective→goal→task table), BehaviouralDisplay
// (competency descriptors for a chosen level), the "Step X of Y" pill, and a wizard footer.
const PERF_TINT_BG = { cream: "#FEFBEF", pink: "#FDF4F4", lavender: "#F4F5FE" };

function PerfDCell({ label, children, minWidth }) {
  return (
    <div style={{ minWidth: minWidth || 0 }}>
      <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-400)" }}>{label}</div>
      <div style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 14, color: "var(--gray-900)", marginTop: 3 }}>{children}</div>
    </div>
  );
}

// read-only objective → goal → task breakdown for one perspective
function ObjectiveSectionDisplay({ objectives = [], tint = "cream" }) {
  if (!objectives.length) {
    return <div style={{ padding: "20px 16px", fontFamily: "var(--font-ui)", fontSize: 13.5, color: "var(--gray-400)" }}>No objectives set for this perspective.</div>;
  }
  return (
    <div style={{ border: "1px solid var(--divider)", borderRadius: 12, overflow: "hidden" }}>
      {objectives.map((o, oi) => (
        <React.Fragment key={o.id}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, padding: "14px 16px", background: PERF_TINT_BG[tint] || "#fff", borderTop: oi === 0 ? 0 : "1px solid var(--divider)" }}>
            <PerfDCell label="Objective">{o.objective || "—"}</PerfDCell>
            <PerfDCell label="Weight" minWidth={90}>{o.weight || 0}%</PerfDCell>
          </div>
          {(o.goals || []).map((g) => (
            <React.Fragment key={g.id}>
              <div className="tgt-d-row" style={{ background: "var(--gray-50)", borderTop: "1px solid var(--divider)" }}>
                <PerfDCell label="Employee Goal">{g.goal || "—"}</PerfDCell>
                <PerfDCell label="Annual Target">{g.target || "—"}</PerfDCell>
                <PerfDCell label="KPI">{g.kpi || "—"}</PerfDCell>
                <PerfDCell label="Weight">{g.weight || 0}%</PerfDCell>
              </div>
              {(g.tasks || []).map((t) => (
                <div key={t.id} className="tgt-d-row" style={{ borderTop: "1px solid var(--divider)" }}>
                  <PerfDCell label="Task">{t.task || "—"}</PerfDCell>
                  <PerfDCell label="Annual Target">{t.target || "—"}</PerfDCell>
                  <PerfDCell label="KPI">{t.kpi || "—"}</PerfDCell>
                  <PerfDCell label="Weight">{t.weight || 0}%</PerfDCell>
                </div>
              ))}
            </React.Fragment>
          ))}
        </React.Fragment>
      ))}
    </div>
  );
}

// read-only competency descriptors for the selected level
function BehaviouralDisplay({ selectedLevel }) {
  if (!selectedLevel) {
    return <div style={{ padding: "20px 0", fontFamily: "var(--font-ui)", fontSize: 13.5, color: "var(--gray-400)" }}>No behavioural level selected.</div>;
  }
  const comps = competenciesForLevel(selectedLevel);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "inline-flex", width: "fit-content", alignItems: "center", gap: 7, background: "var(--brand-yellow-tint)", border: "1px solid #F2E6A8", borderRadius: 999, padding: "6px 13px", fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 13, color: "var(--warning-deep)" }}>
        <Icon name="award-line" size={15} color="var(--brand-yellow-dark)" />{COMPETENCY_LEVELS[selectedLevel]}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
        {comps.map((c) => (
          <div key={c.id} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 16, background: "#fff" }}>
            <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 14.5, color: "var(--gray-900)", marginBottom: 10 }}>{c.name}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {c.descriptors.map((d, i) => (
                <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                  <Icon name="checkbox-circle-line" size={16} color="var(--brand-yellow-dark)" style={{ marginTop: 1, flexShrink: 0 }} />
                  <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, lineHeight: 1.5, color: "var(--gray-600)" }}>{d}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// dark "Step X of Y" indicator pill
function StepPill({ step, total, tone = "dark" }) {
  const bg = tone === "primary" ? "var(--brand-yellow)" : "#2A2D34";
  const color = tone === "primary" ? "var(--brand-ink)" : "#fff";
  return (
    <span style={{ display: "inline-flex", background: bg, color, borderRadius: 8, padding: "5px 12px",
      fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 12.5, width: "fit-content" }}>Step {step} of {total}</span>
  );
}

// wizard footer: Cancel on the left; Back + primary (Continue/Submit) on the right
function WizardFooter({ onCancel, onBack, backDisabled, primaryLabel, primaryIcon, onPrimary, primaryDisabled }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--divider)" }}>
      <Button variant="stroke" onClick={onCancel}>Cancel</Button>
      <div style={{ display: "flex", gap: 12 }}>
        {onBack && <Button variant="stroke" icon="arrow-left-line" onClick={onBack} disabled={backDisabled}>Back</Button>}
        <Button variant="primary" iconRight={primaryIcon} onClick={onPrimary} disabled={primaryDisabled}>{primaryLabel}</Button>
      </div>
    </div>
  );
}

// tab strip used on detail/summary views (Objectives Scores / Behavioural Scores, perspective tabs)
function PillTabs({ items, active, onChange }) {
  return (
    <div style={{ display: "inline-flex", gap: 4, background: "var(--gray-75)", borderRadius: 10, padding: 4, flexWrap: "wrap" }}>
      {items.map((t) => {
        const on = t.value === active;
        return (
          <button key={t.value} onClick={() => onChange(t.value)} style={{ border: 0, cursor: "pointer", borderRadius: 7,
            padding: "8px 14px", fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 13.5,
            background: on ? "#fff" : "transparent", color: on ? "var(--gray-900)" : "var(--gray-500)",
            boxShadow: on ? "var(--shadow-btn)" : "none" }}>{t.label}</button>
        );
      })}
    </div>
  );
}

Object.assign(window, { PERF_TINT_BG, PerfDCell, ObjectiveSectionDisplay, BehaviouralDisplay, StepPill, WizardFooter, PillTabs });
