// BISTA HR · performance/DeptPerspectives — Department Perspectives setup.
// Mirrors the codebase DepartmentPerspectivesSetup + SetPerspectiveWeights exactly:
//   LIST  : "Departments Perspectives (DEPT)" + "Update Weights" (or "Set Weights") button,
//           a department selector, and a Name / Description / Weight(%) table.
//   MODAL : "Set Department Perspective Weightings" — per-perspective number input + slider,
//           weights redistribute proportionally to always total 100%; Save is gated on total=100.
const { useState: useDP, useEffect: useDPEffect } = React;

// the four balanced-scorecard corporate perspectives + descriptions (from the codebase screens)
const CORP_PERSPECTIVES = [
  { id: "cp-learn", name: "Learning and Growth", description: "Employee development, training, innovation, and organizational capability building" },
  { id: "cp-fin", name: "Financial", description: "Financial performance, profitability, revenue growth, and cost management" },
  { id: "cp-proc", name: "Internal Processes", description: "Operational efficiency, process improvement, and internal business operations" },
  { id: "cp-cust", name: "Customer", description: "Customer satisfaction, experience, and service delivery excellence" },
];
const DEPT_OPTIONS = ["Human Resources", "Retail Banking", "Operations", "Credit Risk", "Information Technology", "Finance"];

// seed weights per department (default equal 25% each)
const seedDeptWeights = () => {
  const m = {};
  DEPT_OPTIONS.forEach((d) => { m[d] = CORP_PERSPECTIVES.map((p) => ({ id: p.id, weight: 25 })); });
  // a couple of departments with custom splits
  m["Retail Banking"] = [{ id: "cp-learn", weight: 15 }, { id: "cp-fin", weight: 40 }, { id: "cp-proc", weight: 20 }, { id: "cp-cust", weight: 25 }];
  return m;
};

// proportional redistribution helpers (faithful to SetPerspectiveWeights.tsx)
const normalizeToHundred = (list) => {
  const total = list.reduce((s, p) => s + p.weight, 0);
  const adj = 100 - total;
  if (adj === 0) return list;
  const maxP = list.reduce((m, p) => (p.weight > m.weight ? p : m));
  return list.map((p) => p.id === maxP.id ? { ...p, weight: Math.max(0, Math.min(100, p.weight + adj)) } : p);
};
const redistribute = (list, id, newWeight) => {
  const cur = list.find((p) => p.id === id);
  if (!cur) return list;
  const toDist = -(newWeight - cur.weight);
  const others = list.filter((p) => p.id !== id);
  const otherTotal = others.reduce((s, o) => s + o.weight, 0);
  const updated = list.map((p) => {
    if (p.id === id) return { ...p, weight: newWeight };
    if (others.length) {
      const prop = otherTotal > 0 ? p.weight / otherTotal : 1 / others.length;
      return { ...p, weight: Math.max(0, Math.min(100, p.weight + Math.round(toDist * prop))) };
    }
    return p;
  });
  return normalizeToHundred(updated);
};

function WeightSlider({ value, onChange }) {
  return (
    <input type="range" className="pp-range" min="0" max="100" step="1" value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{ width: "100%", background: `linear-gradient(var(--brand-yellow),var(--brand-yellow)) 0/${value}% 100% no-repeat var(--gray-150, #E5E7EB)` }} />
  );
}

function SetWeightingsModal({ deptLabel, initial, onClose, onSave }) {
  const [rows, setRows] = useDP(() => CORP_PERSPECTIVES.map((p) => ({ ...p, weight: (initial.find((x) => x.id === p.id) || {}).weight ?? 0 })));
  const total = rows.reduce((s, p) => s + p.weight, 0);
  const valid = total === 100 && rows.every((p) => p.weight >= 1 && p.weight <= 100);
  const setWeight = (id, w) => setRows((rs) => redistribute(rs, id, Math.max(0, Math.min(100, w))));
  const resetEqual = () => {
    const eq = Math.floor(100 / rows.length); const rem = 100 - eq * rows.length;
    setRows((rs) => rs.map((p, i) => ({ ...p, weight: eq + (i < rem ? 1 : 0) })));
  };
  return (
    <Modal onClose={onClose} width={700}>
      <div style={{ padding: "24px 24px 0" }}>
        <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 20, color: "var(--gray-900)" }}>Set Department Perspective Weightings</div>
        <div className="bh-body" style={{ marginTop: 4 }}>Assign percentage weights to each perspective for {deptLabel}. Total must equal 100%.</div>
      </div>
      <div style={{ padding: 24, maxHeight: "60vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
        {rows.map((p) => {
          const err = p.weight < 1 ? "Weight must be at least 1%" : null;
          return (
            <div key={p.id} style={{ border: `1px solid ${err ? "var(--error)" : "var(--border)"}`, borderRadius: 12, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 14 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 15, color: "var(--gray-900)" }}>{p.name}</div>
                  <div style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--gray-500)", marginTop: 2, lineHeight: 1.45 }}>{p.description}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <input type="number" min="1" max="100" value={p.weight} onFocus={(e) => e.target.select()}
                    onChange={(e) => setWeight(p.id, Number.parseInt(e.target.value, 10) || 0)}
                    style={{ width: 64, height: 36, textAlign: "center", border: "1px solid var(--gray-200)", borderRadius: 8, fontFamily: "var(--font-control)", fontWeight: 700, fontSize: 14, color: "var(--gray-900)" }} />
                  <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--gray-500)" }}>%</span>
                </div>
              </div>
              <WeightSlider value={p.weight} onChange={(w) => setWeight(p.id, w)} />
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-ui)", fontSize: 11.5, color: "var(--gray-400)", marginTop: 6 }}><span>0%</span><span>100%</span></div>
            </div>
          );
        })}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 14, borderTop: "1px solid var(--divider)" }}>
          <span style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 14, color: "var(--gray-700)" }}>Total Weight:</span>
          <span style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 18, color: total === 100 ? "var(--success-deep)" : "var(--error)" }}>{total}%</span>
        </div>
        <div style={{ paddingTop: 14, borderTop: "1px solid var(--divider)" }}>
          <Button variant="stroke" size="sm" icon="refresh-line" onClick={resetEqual}>Reset to Equal</Button>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: "0 24px 24px" }}>
        <Button variant="stroke" onClick={onClose}>Cancel</Button>
        <Button variant="primary" disabled={!valid} onClick={() => onSave(rows)}>Save Weightings</Button>
      </div>
    </Modal>
  );
}

function DeptPerspectives({ onToast }) {
  const [weights, setWeights] = useDP(seedDeptWeights);
  const [dept, setDept] = useDP(DEPT_OPTIONS[0]);
  const [modal, setModal] = useDP(false);
  const rows = weights[dept] || [];
  const hasData = rows.some((r) => r.weight > 0);

  return (
    <div className="card" style={{ padding: "var(--card-pad, 24px)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 22, flexWrap: "wrap" }}>
        <div>
          <div className="bh-h2" style={{ fontSize: 24 }}>Departments Perspectives ({dept})</div>
          <div className="bh-body" style={{ marginTop: 4 }}>Manage department-specific perspective weights and allocations</div>
        </div>
        <Button variant="primary" onClick={() => setModal(true)}>{hasData ? "Update Weights" : "Set Weights"}</Button>
      </div>

      <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
        <div style={{ padding: 18, borderBottom: "1px solid var(--divider)" }}>
          <div style={{ maxWidth: 440 }}>
            <Select value={dept} options={DEPT_OPTIONS} onChange={(e) => setDept(e.target.value)} placeholder="Select a department" />
          </div>
        </div>
        <table className="bh">
          <thead><tr><th>Name</th><th>Description</th><th style={{ width: 130 }}>Weight (%)</th></tr></thead>
          <tbody>
            {CORP_PERSPECTIVES.map((p) => {
              const w = (rows.find((r) => r.id === p.id) || {}).weight ?? 0;
              return (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600, color: "var(--gray-900)" }}>{p.name}</td>
                  <td style={{ color: "var(--gray-500)", maxWidth: 560 }}>{p.description}</td>
                  <td style={{ fontWeight: 600 }}>{w}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modal && (
        <SetWeightingsModal deptLabel={dept} initial={rows}
          onClose={() => setModal(false)}
          onSave={(newRows) => { setWeights((m) => ({ ...m, [dept]: newRows.map((r) => ({ id: r.id, weight: r.weight })) })); setModal(false); onToast(`Department perspectives ${hasData ? "updated" : "created"} successfully!`, { tone: "success" }); }} />
      )}
    </div>
  );
}

Object.assign(window, { DeptPerspectives, CORP_PERSPECTIVES, DEPT_OPTIONS, SetWeightingsModal });
