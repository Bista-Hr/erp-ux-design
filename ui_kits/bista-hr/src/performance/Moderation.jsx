// BISTA HR · performance/Moderation — upload moderated scores + view moderated results.
//   "Upload Moderated Score": pick a period + an Excel file → Upload. Below, a table of
//   moderated employees (original vs moderated score) with a read-only detail view.
const { useState: useMOD, useEffect: useMODEffect } = React;

let MOD_SEQ = 9500;
const modId = () => ++MOD_SEQ;
const MOD_ROWS = [
  { id: modId(), employeeName: "Yaw Asante", department: "Retail Banking", period: "2026 First Half", original: 3.4, moderated: 3.6, rating: "Very Good" },
  { id: modId(), employeeName: "Efua Boateng", department: "Retail Banking", period: "2026 First Half", original: 2.8, moderated: 2.6, rating: "Needs Improvement" },
  { id: modId(), employeeName: "Kojo Antwi", department: "Retail Banking", period: "2026 First Half", original: 4.2, moderated: 4.0, rating: "Very Good" },
];

function Moderation({ onToast, onSubPage }) {
  const [rows, setRows] = useMOD(MOD_ROWS);
  const [period, setPeriod] = useMOD("");
  const [file, setFile] = useMOD(null);
  const [viewing, setViewing] = useMOD(null);

  useMODEffect(() => {
    if (!onSubPage) return;
    if (viewing) onSubPage({ trail: [{ label: "Moderation", onClick: () => setViewing(null) }, { label: "Moderation Details" }] });
    else onSubPage(null);
    return () => onSubPage(null);
  }, [viewing]);

  const upload = () => {
    if (!period) { onToast("Please select a period", { tone: "error" }); return; }
    if (!file) { onToast("Please choose a file to upload", { tone: "error" }); return; }
    onToast("Moderation score upload successful", { tone: "success" });
    setFile(null);
  };

  if (viewing) {
    const delta = (viewing.moderated - viewing.original).toFixed(1);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <PageHeader title="Moderation Details" subtitle={`${viewing.employeeName} · ${viewing.period}`}
          actions={<Button variant="stroke" icon="arrow-left-line" onClick={() => setViewing(null)}>Back to Moderation</Button>} />
        <div className="card cq-stats" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="cq-stat-grid">
            {[{ k: "Original Score", v: viewing.original }, { k: "Moderated Score", v: viewing.moderated }, { k: "Adjustment", v: `${delta > 0 ? "+" : ""}${delta}` }].map((x) => (
              <div key={x.k} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 18 }}>
                <div style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--gray-500)" }}>{x.k}</div>
                <div style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 26, color: "var(--gray-900)", marginTop: 4 }}>{x.v}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: "var(--font-ui)", fontSize: 13.5, color: "var(--gray-500)" }}>Final rating:</span>
            <StatusBadge variant="approved" text={viewing.rating} size="md" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="card" style={{ padding: "var(--card-pad, 24px)" }}>
        <div style={{ marginBottom: 18 }}>
          <div className="bh-h2" style={{ fontSize: 24 }}>Upload Moderated Score</div>
          <div className="bh-body" style={{ marginTop: 4 }}>Upload a moderated score file for a selected period</div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
          <div style={{ width: 260 }}><Field label="Period"><Select value={period} options={PERF_PERIODS.map((p) => p.name)} placeholder="Select period" onChange={(e) => setPeriod(e.target.value)} /></Field></div>
          <div style={{ minWidth: 280 }}>
            <Field label="Upload file">
              <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", border: "1px dashed var(--border-strong)", borderRadius: 10, cursor: "pointer", background: "var(--gray-25)" }}>
                <Icon name="file-excel-2-line" size={18} color="var(--success-deep)" />
                <span style={{ fontFamily: "var(--font-ui)", fontSize: 13.5, color: file ? "var(--gray-900)" : "var(--gray-400)" }}>{file ? file.name : "Choose .xlsx / .xls file"}</span>
                <input type="file" accept=".xlsx,.xls" style={{ display: "none" }} onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </label>
            </Field>
          </div>
          <Button variant="primary" icon="upload-cloud-2-line" onClick={upload}>Upload</Button>
        </div>
      </div>

      <div className="card" style={{ padding: "var(--card-pad, 24px)" }}>
        <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 16, color: "var(--gray-900)", marginBottom: 14 }}>Moderated Scores</div>
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
          <table className="bh">
            <thead><tr><th>Employee</th><th>Department</th><th>Period</th><th>Original</th><th>Moderated</th><th style={{ width: 120 }}></th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600, color: "var(--gray-900)" }}>{r.employeeName}</td>
                  <td>{r.department}</td>
                  <td>{r.period}</td>
                  <td>{r.original}</td>
                  <td style={{ fontWeight: 600 }}>{r.moderated}</td>
                  <td style={{ textAlign: "right" }}><ViewDetailsButton onClick={() => setViewing(r)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Moderation });
