// BISTA HR · performance/Feedback360 — 360° feedback assignments.
//   LIST : "360 Feedback" — colleagues you've been asked to give feedback on (relationship,
//          period, status). Pending → "Give Feedback" full page; submitted → "View Details" page.
//   FORM : full page — rate competencies (1–5) + an overall comment, then Submit Feedback.
const { useState: useFB, useEffect: useFBEffect } = React;

let FB_SEQ = 9000;
const fbId = () => ++FB_SEQ;
const FB_COMPETENCIES = ["Collaboration & teamwork", "Communication", "Reliability & ownership", "Customer focus", "Problem solving"];

const FB_ROWS = [
  { id: fbId(), subject: "Yaw Asante", relationship: "Peer", period: "2026 First Half", status: "pending", scores: {}, comment: "" },
  { id: fbId(), subject: "Adwoa Owusu", relationship: "Line Manager", period: "2026 First Half", status: "pending", scores: {}, comment: "" },
  { id: fbId(), subject: "Efua Boateng", relationship: "Direct Report", period: "2026 First Half", status: "submitted",
    scores: { "Collaboration & teamwork": 4, "Communication": 5, "Reliability & ownership": 4, "Customer focus": 5, "Problem solving": 3 }, comment: "Consistently dependable and a strong communicator." },
];

function RatingDots({ value, onChange, readOnly }) {
  return (
    <div style={{ display: "inline-flex", gap: 6 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} disabled={readOnly} onClick={() => onChange && onChange(n)} title={`${n}`}
          style={{ width: 30, height: 30, borderRadius: 8, cursor: readOnly ? "default" : "pointer",
            border: `1px solid ${n <= value ? "var(--brand-yellow-dark)" : "var(--border)"}`,
            background: n <= value ? "var(--brand-yellow)" : "#fff", color: n <= value ? "var(--brand-ink)" : "var(--gray-400)",
            fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 13 }}>{n}</button>
      ))}
    </div>
  );
}

function FeedbackForm({ row, readOnly, onCancel, onSubmit }) {
  const [scores, setScores] = useFB(row.scores || {});
  const [comment, setComment] = useFB(row.comment || "");
  const valid = FB_COMPETENCIES.every((c) => scores[c]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <PageHeader title={readOnly ? "360 Feedback" : "Give 360 Feedback"} subtitle={`${row.relationship} feedback for ${row.subject} · ${row.period}`}
        actions={<Button variant="stroke" icon="arrow-left-line" onClick={onCancel}>Back to 360 Feedback</Button>} />
      <div className="card" style={{ padding: 24 }}>
        <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 16, color: "var(--gray-900)", marginBottom: 16 }}>Rate each competency (1–5)</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {FB_COMPETENCIES.map((c) => (
            <div key={c} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 14px", border: "1px solid var(--border)", borderRadius: 10 }}>
              <span style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 14, color: "var(--gray-900)" }}>{c}</span>
              <RatingDots value={scores[c] || 0} readOnly={readOnly} onChange={(n) => setScores((s) => ({ ...s, [c]: n }))} />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 18 }}>
          <Field label="Overall comments"><Textarea value={comment} onChange={(e) => setComment(e.target.value)} readOnly={readOnly} placeholder="Share specific, constructive feedback…" style={{ minHeight: 100 }} /></Field>
        </div>
      </div>
      {!readOnly && (
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <Button variant="stroke" onClick={onCancel}>Cancel</Button>
          <Button variant="primary" disabled={!valid} onClick={() => onSubmit({ scores, comment })}>Submit Feedback</Button>
        </div>
      )}
    </div>
  );
}

function Feedback360({ onToast, onSubPage }) {
  const [rows, setRows] = useFB(FB_ROWS);
  const [view, setView] = useFB({ name: "list" });
  const [menu, setMenu] = useFB(null);

  useFBEffect(() => {
    if (!onSubPage) return;
    if (view.name === "form") onSubPage({ trail: [{ label: "360 Feedback", onClick: () => setView({ name: "list" }) }, { label: view.readOnly ? "Feedback Details" : "Give Feedback" }] });
    else onSubPage(null);
    return () => onSubPage(null);
  }, [view]);

  if (view.name === "form") {
    const row = rows.find((r) => r.id === view.id);
    return <FeedbackForm row={row} readOnly={view.readOnly} onCancel={() => setView({ name: "list" })}
      onSubmit={({ scores, comment }) => { setRows((rs) => rs.map((r) => r.id === row.id ? { ...r, status: "submitted", scores, comment } : r)); setView({ name: "list" }); onToast("Feedback Submitted", { tone: "success" }); }} />;
  }

  return (
    <div className="card" style={{ padding: "var(--card-pad, 24px)" }}>
      <div style={{ marginBottom: 22 }}>
        <div className="bh-h2" style={{ fontSize: 24 }}>360 Feedback</div>
        <div className="bh-body" style={{ marginTop: 4 }}>See and manage all 360 feedback submissions</div>
      </div>
      <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "visible" }}>
        <table className="bh">
          <thead><tr><th>Employee</th><th>Relationship</th><th>Period</th><th>Status</th><th style={{ width: 48 }}></th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td><span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Avatar name={r.subject} size={28} /><span style={{ fontWeight: 600, color: "var(--gray-900)" }}>{r.subject}</span></span></td>
                <td>{r.relationship}</td>
                <td>{r.period}</td>
                <td><StatusBadge variant={r.status === "submitted" ? "approved" : "pending"} text={r.status === "submitted" ? "Submitted" : "Pending"} size="sm" /></td>
                <td style={{ position: "relative", textAlign: "right" }}>
                  <button className="btn btn-icon btn-ghost" style={{ width: 28, height: 28, padding: 0 }} onClick={() => setMenu(menu === r.id ? null : r.id)}><Icon name="more-fill" size={18} color="var(--gray-400)" /></button>
                  {menu === r.id && (
                    <div onMouseLeave={() => setMenu(null)} style={{ position: "absolute", right: 16, top: 40, zIndex: 30, background: "#fff", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-pop)", padding: 6, minWidth: 160, display: "flex", flexDirection: "column" }}>
                      {r.status === "submitted"
                        ? <button className="menu-item" onClick={() => { setMenu(null); setView({ name: "form", id: r.id, readOnly: true }); }}><Icon name="eye-line" size={16} />View Details</button>
                        : <button className="menu-item" onClick={() => { setMenu(null); setView({ name: "form", id: r.id }); }}><Icon name="feedback-line" size={16} />Give Feedback</button>}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

Object.assign(window, { Feedback360, FeedbackForm });
