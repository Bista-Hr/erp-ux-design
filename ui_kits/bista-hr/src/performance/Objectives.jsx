// BISTA HR · performance/Objectives — Objectives + Employee Goals (KPIs) flow.
// Mirrors the codebase exactly: list → CREATE/EDIT open a FULL PAGE (not a modal); a row's
// "View Details" opens a read-only modal; archive uses a confirm dialog.
//   LIST   : "Objectives" + "Add Objective"; columns Name / Perspective / Employee Goals / Status
//   FORM   : full page — Objective Name, KPI, Perspective, Description + a repeatable
//            "Set Employee Goals" section; Cancel / Create Objective (or Save Changes)
//   VIEW   : modal — objective summary + its Employee Goals
const { useState: useOB, useEffect: useOBEffect } = React;

const MEASURE_OPTIONS = ["Total deposits (GHS)", "Loan book value", "CSAT score", "Net Promoter Score", "Avg. request TAT", "SLA adherence %", "Training hours", "Cost-to-income ratio", "New customers onboarded"];
const PERSPECTIVE_NAMES = ["Financial", "Customer", "Internal Processes", "Learning and Growth"];

let OBJ_SEQ = 6000;
const objSeq = () => ++OBJ_SEQ;
const OBJECTIVE_ROWS = [
  { id: objSeq(), name: "Grow deposit mobilisation", perspectiveName: "Financial", measureName: "Total deposits (GHS)", active: true,
    description: "Increase the branch's total deposit base through new and existing customers.",
    kpIs: [
      { id: objSeq(), name: "New deposit accounts opened", measureName: "Total deposits (GHS)", description: "Number of new deposit accounts onboarded in the period." },
      { id: objSeq(), name: "CASA growth", measureName: "Total deposits (GHS)", description: "Growth in current & savings account balances." },
    ] },
  { id: objSeq(), name: "Improve customer satisfaction", perspectiveName: "Customer", measureName: "CSAT score", active: true,
    description: "Raise customer satisfaction across service touchpoints.",
    kpIs: [
      { id: objSeq(), name: "Resolve complaints within SLA", measureName: "SLA adherence %", description: "Percentage of complaints resolved within the service window." },
      { id: objSeq(), name: "Improve CSAT score", measureName: "CSAT score", description: "Quarterly customer-satisfaction survey result." },
    ] },
  { id: objSeq(), name: "Improve turnaround time", perspectiveName: "Internal Processes", measureName: "Avg. request TAT", active: true,
    description: "Reduce processing time for core customer requests.",
    kpIs: [{ id: objSeq(), name: "Reduce average request TAT", measureName: "Avg. request TAT", description: "Average turnaround time across logged requests." }] },
  { id: objSeq(), name: "Build team capability", perspectiveName: "Learning and Growth", measureName: "Training hours", active: false,
    description: "Develop the team's technical and behavioural capability.",
    kpIs: [{ id: objSeq(), name: "Complete training hours", measureName: "Training hours", description: "Training hours completed per team member." }] },
];

const blankKpi = () => ({ id: objSeq(), name: "", measureName: "", description: "" });

// ---- full-page create / edit form ----
function ObjectiveForm({ initial, onCancel, onSave }) {
  const [name, setName] = useOB(initial?.name || "");
  const [measureName, setMeasure] = useOB(initial?.measureName || "");
  const [perspectiveName, setPerspective] = useOB(initial?.perspectiveName || "");
  const [description, setDescription] = useOB(initial?.description || "");
  const [kpis, setKpis] = useOB(() => initial?.kpIs?.map((k) => ({ ...k })) || [blankKpi()]);
  const editing = !!initial;

  const patchKpi = (id, patch) => setKpis((ks) => ks.map((k) => k.id === id ? { ...k, ...patch } : k));
  const addKpi = () => setKpis((ks) => [...ks, blankKpi()]);
  const delKpi = (id) => setKpis((ks) => ks.length > 1 ? ks.filter((k) => k.id !== id) : ks);

  const valid = name.trim() && perspectiveName && measureName && description.trim() && kpis.every((k) => k.name.trim() && k.measureName);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <PageHeader title={editing ? "Edit Objective" : "Create Objective"}
        subtitle={editing ? "Update the objective and its Employee Goals" : "Create a new objective with associated Employee Goals"}
        actions={<Button variant="stroke" icon="arrow-left-line" onClick={onCancel}>Back to Objectives</Button>} />

      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <Field label="Objective Name"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Improve customer satisfaction" /></Field>
          <Field label="KPI"><Select value={measureName} options={MEASURE_OPTIONS} placeholder="Select a KPI" onChange={(e) => setMeasure(e.target.value)} /></Field>
          <Field label="Perspective"><Select value={perspectiveName} options={PERSPECTIVE_NAMES} placeholder="Select perspective" onChange={(e) => setPerspective(e.target.value)} /></Field>
        </div>
        <div style={{ marginTop: 18 }}>
          <Field label="Description"><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the objective" style={{ minHeight: 90 }} /></Field>
        </div>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 18, color: "var(--gray-900)", marginBottom: 16 }}>Set Employee Goals</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {kpis.map((k) => (
            <div key={k.id} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
              {kpis.length > 1 && (
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 6 }}>
                  <button onClick={() => delKpi(k.id)} title="Remove" style={{ border: 0, background: "none", cursor: "pointer", color: "var(--error)" }}><Icon name="delete-bin-6-line" size={18} /></button>
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
                <Field label="Employee Goal"><Input value={k.name} onChange={(e) => patchKpi(k.id, { name: e.target.value })} placeholder="e.g. Customer Satisfaction Score" /></Field>
                <Field label="KPI"><Select value={k.measureName} options={MEASURE_OPTIONS} placeholder="Select a KPI" onChange={(e) => patchKpi(k.id, { measureName: e.target.value })} /></Field>
              </div>
              <div style={{ marginTop: 14 }}>
                <Field label="Description" optional><Textarea value={k.description} onChange={(e) => patchKpi(k.id, { description: e.target.value })} placeholder="Describe this Employee Goal." style={{ minHeight: 70 }} /></Field>
              </div>
            </div>
          ))}
          <button onClick={addKpi} style={{ display: "inline-flex", alignItems: "center", gap: 6, border: 0, background: "none", cursor: "pointer", padding: 0, fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 14, color: "var(--brand-yellow-dark)", alignSelf: "flex-start" }}>
            <Icon name="add-line" size={16} color="var(--brand-yellow-dark)" />Add Another Employee Goal
          </button>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, paddingTop: 6 }}>
        <Button variant="stroke" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" disabled={!valid} onClick={() => onSave({ id: initial?.id, name, measureName, perspectiveName, description, kpIs: kpis, active: initial?.active ?? true })}>{editing ? "Save Changes" : "Create Objective"}</Button>
      </div>
    </div>
  );
}

// ---- view modal ----
function ViewObjectiveModal({ objective, onClose }) {
  return (
    <Modal onClose={onClose} width={780}>
      <div style={{ padding: "24px 24px 0" }}>
        <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 20, color: "var(--gray-900)" }}>View Objective</div>
        <div className="bh-body" style={{ marginTop: 4 }}>View objective details and related Employee Goals</div>
      </div>
      <div style={{ padding: 24, maxHeight: "70vh", overflowY: "auto" }}>
        <div style={{ background: "linear-gradient(120deg, var(--success-tint), #F0FBF5)", border: "1px solid #ABEFC6", borderRadius: 14, padding: 20, display: "flex", justifyContent: "space-between", gap: 16 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 19, color: "var(--gray-900)", marginBottom: 6 }}>{objective.name}</div>
            <p style={{ fontFamily: "var(--font-ui)", fontSize: 14, lineHeight: 1.55, color: "var(--gray-600)", margin: "0 0 12px" }}>{objective.description}</p>
            <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 600, color: "var(--gray-600)" }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--brand-blue)" }} />Perspective: {objective.perspectiveName}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 600, color: "var(--gray-600)" }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#7A5AF8" }} />{objective.kpIs?.length || 0} Employee Goals</span>
            </div>
          </div>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--success-tint)", border: "1px solid #ABEFC6", display: "grid", placeItems: "center", flexShrink: 0 }}><Icon name="focus-3-line" size={28} color="var(--success-deep)" /></div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0 14px" }}>
          <h4 style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 15, color: "var(--gray-900)", margin: 0 }}>Employee Goals</h4>
          <div style={{ flex: 1, height: 1, background: "var(--divider)" }} />
          <span style={{ fontFamily: "var(--font-control)", fontWeight: 600, fontSize: 12, color: "var(--gray-500)", background: "var(--gray-100)", padding: "3px 10px", borderRadius: 999 }}>{objective.kpIs?.length || 0}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {(objective.kpIs || []).map((k, i) => (
            <div key={k.id} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 16, display: "flex", gap: 12 }}>
              <span style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--success-tint)", color: "var(--success-deep)", display: "grid", placeItems: "center", fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{i + 1}</span>
              <div>
                <div style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 14, color: "var(--gray-900)", marginBottom: 3 }}>{k.name}</div>
                <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, lineHeight: 1.5, color: "var(--gray-500)", margin: 0 }}>{k.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "0 24px 24px" }}><Button variant="stroke" onClick={onClose}>Close</Button></div>
    </Modal>
  );
}

function Objectives({ onToast, onSubPage }) {
  const [rows, setRows] = useOB(OBJECTIVE_ROWS);
  const [view, setView] = useOB({ name: "list" }); // list | form{mode,row}
  const [viewing, setViewing] = useOB(null);       // objective for the view modal
  const [archiving, setArchiving] = useOB(null);
  const [menu, setMenu] = useOB(null);

  useOBEffect(() => {
    if (!onSubPage) return;
    if (view.name === "form") onSubPage({ trail: [{ label: "Objectives", onClick: () => setView({ name: "list" }) }, { label: view.mode === "edit" ? "Edit Objective" : "Create Objective" }] });
    else onSubPage(null);
    return () => onSubPage(null);
  }, [view]);

  const save = (obj) => {
    if (view.mode === "edit") { setRows((rs) => rs.map((r) => r.id === obj.id ? { ...r, ...obj } : r)); onToast("Objective Updated", { tone: "success" }); }
    else { setRows((rs) => [{ ...obj, id: objSeq() }, ...rs]); onToast("Objective Created", { tone: "success" }); }
    setView({ name: "list" });
  };

  if (view.name === "form") {
    return <ObjectiveForm initial={view.row} onCancel={() => setView({ name: "list" })} onSave={save} />;
  }

  return (
    <div className="card" style={{ padding: "var(--card-pad, 24px)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 22, flexWrap: "wrap" }}>
        <div>
          <div className="bh-h2" style={{ fontSize: 24 }}>Objectives</div>
          <div className="bh-body" style={{ marginTop: 4 }}>Manage performance objectives and their related Employee Goals</div>
        </div>
        <Button variant="primary" icon="add-line" onClick={() => setView({ name: "form", mode: "create" })}>Add Objective</Button>
      </div>

      <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "visible" }}>
        <table className="bh">
          <thead><tr><th>Objective Name</th><th>Perspective</th><th>Employee Goals</th><th>Status</th><th style={{ width: 48 }}></th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td style={{ fontWeight: 600, color: "var(--gray-900)" }}>{r.name}</td>
                <td>{r.perspectiveName}</td>
                <td>{r.kpIs?.length || 0}</td>
                <td><StatusBadge variant={r.active ? "active" : "inactive"} text={r.active ? "Active" : "Archived"} size="sm" /></td>
                <td style={{ position: "relative", textAlign: "right" }}>
                  <button className="btn btn-icon btn-ghost" style={{ width: 28, height: 28, padding: 0 }} onClick={() => setMenu(menu === r.id ? null : r.id)}>
                    <Icon name="more-fill" size={18} color="var(--gray-400)" />
                  </button>
                  {menu === r.id && (
                    <div onMouseLeave={() => setMenu(null)} style={{ position: "absolute", right: 16, top: 40, zIndex: 30, background: "#fff", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-pop)", padding: 6, minWidth: 170, display: "flex", flexDirection: "column" }}>
                      <button className="menu-item" onClick={() => { setMenu(null); setViewing(r); }}><Icon name="eye-line" size={16} />View Details</button>
                      <button className="menu-item" onClick={() => { setMenu(null); setView({ name: "form", mode: "edit", row: r }); }}><Icon name="edit-2-line" size={16} />Edit Objective</button>
                      <button className="menu-item danger" onClick={() => { setMenu(null); setArchiving(r); }}><Icon name="archive-line" size={16} />Archive Objective</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {viewing && <ViewObjectiveModal objective={viewing} onClose={() => setViewing(null)} />}
      {archiving && (
        <ConfirmModal title="Archive Objective" message="Are you sure you want to archive this objective? This action cannot be undone."
          confirmLabel="Yes, Archive" confirmIcon="archive-line" cancelLabel="Cancel"
          onConfirm={() => { setRows((rs) => rs.map((r) => r.id === archiving.id ? { ...r, active: false } : r)); setArchiving(null); onToast("Objective archived successfully", { tone: "error" }); }}
          onClose={() => setArchiving(null)} />
      )}
    </div>
  );
}

Object.assign(window, { Objectives, ObjectiveForm, ViewObjectiveModal });
