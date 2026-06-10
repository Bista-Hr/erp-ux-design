// BISTA HR · appraisal/AppraisalScoring — multi-step appraisal scoring wizard.
// Steps 1–4: one weighted perspective each (score every task: Actual / Score / Rating →
// derived Ranking, plus a per-task comment). Step 5: Behavioural Score (rated competencies).
// Cancel raises the "Cancel Assessment" (save-as-draft) confirm; the last step submits.
const { useState: useAS } = React;

// small numeric cell input
function NumCell({ value, onChange, max }) {
  return <input type="number" min="0" max={max} value={value} onChange={e => onChange(e.target.value === "" ? "" : Number(e.target.value))}
    style={{ width: 56, border: "1px solid var(--gray-200)", borderRadius: 7, padding: "6px 8px", fontFamily: "var(--font-control)", fontSize: 13.5, color: "var(--gray-900)", textAlign: "center" }} />;
}
const commentLink = { border: 0, background: "none", cursor: "pointer", padding: 0, fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 13, color: "var(--brand-yellow-dark)", whiteSpace: "nowrap" };

function CommentModal({ scope, value, readOnly, onClose, onSave }) {
  const [text, setText] = useAS(value || "");
  return (
    <Modal onClose={onClose} width={460}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "22px 22px 0" }}>
        <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 18, color: "var(--gray-900)" }}>{readOnly ? "View Comment" : value ? "Edit Comment" : "Add Comment"}</div>
        <button className="btn btn-icon btn-ghost" onClick={onClose} style={{ width: 30, height: 30, padding: 0 }}><Icon name="close-line" size={19} color="var(--gray-500)" /></button>
      </div>
      <div style={{ padding: 22 }}>
        {readOnly
          ? <p style={{ fontFamily: "var(--font-ui)", fontSize: 14, lineHeight: 1.6, color: "var(--gray-700)", margin: 0 }}>{value || "No comment."}</p>
          : <Textarea placeholder={`Type under ${scope} perspective...`} value={text} onChange={e => setText(e.target.value)} />}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: "0 22px 22px" }}>
        <Button variant="stroke" onClick={onClose}>{readOnly ? "Close" : "Cancel"}</Button>
        {!readOnly && <Button variant="primary" onClick={() => onSave(text)}>Save Comment</Button>}
      </div>
    </Modal>
  );
}

function AppraisalScoring({ card, initialStep = 0, onCancel, onSubmit }) {
  const STEPS = APP_PERSPECTIVES.length + 1; // + behavioural
  const [step, setStep] = useAS(initialStep);
  const [data, setData] = useAS(() => APP_PERSPECTIVES.map(() => blankAppPerspective()));
  const [behavioural, setBehavioural] = useAS(() => seedBehavioural());
  const [comment, setComment] = useAS(null); // { ref, value, readOnly, save }
  const behaviouralStep = step === APP_PERSPECTIVES.length;
  const last = step === STEPS - 1;
  const p = APP_PERSPECTIVES[step];

  // perspective task updates
  const patchTask = (oid, tid, patch) => setData(d => d.map((ps, i) => i === step
    ? { ...ps, objectives: ps.objectives.map(o => o.id === oid ? { ...o, tasks: o.tasks.map(t => t.id === tid ? { ...t, ...patch } : t) } : o) } : ps));
  const patchBeh = (sid, tid, patch) => setBehavioural(secs => secs.map(s => s.id === sid ? { ...s, tasks: s.tasks.map(t => t.id === tid ? { ...t, ...patch } : t) } : s));

  const next = () => last ? onSubmit({ scores: data, behavioural }) : setStep(s => s + 1);

  return (
    <div className="card" style={{ overflow: "visible", padding: "var(--card-pad, 24px)" }}>
      <span style={{ display: "inline-flex", background: "#2A2D34", color: "#fff", borderRadius: 8, padding: "5px 12px",
        fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 12.5 }}>Step {step + 1} of {STEPS}</span>

      {behaviouralStep ? (
        <React.Fragment>
          <div style={{ marginTop: 14 }}>
            <div className="bh-h2" style={{ fontSize: 22 }}>Behavioural Score</div>
            <div className="bh-body" style={{ marginTop: 4 }}>Score is based on your behavioural performance against our criteria.</div>
          </div>
          <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 22 }}>
            {behavioural.map(sec => (
              <div key={sec.id}>
                <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 16, color: "var(--gray-900)", marginBottom: 10 }}>{sec.title}</div>
                <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid var(--divider)" }}>
                  <div style={{ overflowX: "auto" }}>
                    <table className="bh">
                      <thead><tr><th>Task</th><th style={{ width: 110 }}>Rating (1–5)</th><th style={{ width: 150 }}>Ranking</th><th style={{ width: 120 }}></th></tr></thead>
                      <tbody>
                        {sec.tasks.map(t => (
                          <tr key={t.id}>
                            <td>{t.task}</td>
                            <td><NumCell value={t.rating} max={5} onChange={v => patchBeh(sec.id, t.id, { rating: v })} /></td>
                            <td>{rankLabel(t.rating)}</td>
                            <td style={{ textAlign: "right" }}>
                              <button style={commentLink} onClick={() => setComment({ value: t.comment, readOnly: false, save: (v) => patchBeh(sec.id, t.id, { comment: v }) })}>{t.comment ? "Edit Comment" : "Add Comment"}</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <div style={{ marginTop: 14 }}>
            <div className="bh-h2" style={{ fontSize: 22 }}>{p.name} ({p.weight}%)</div>
            <div className="bh-body" style={{ marginTop: 4 }}>Score each task under the {p.name.toLowerCase()} perspective against its KPI and weight.</div>
          </div>
          <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 18 }}>
            {data[step].objectives.map(o => (
              <div key={o.id} style={{ borderRadius: 12, overflow: "hidden", border: "1px solid var(--divider)" }}>
                <div style={{ padding: "13px 16px", background: o.id % 2 ? "#FDF4F4" : "#FEFBEF" }}>
                  <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-400)" }}>Objective</div>
                  <div style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 14, color: "var(--gray-900)", marginTop: 3 }}>{o.objective}</div>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table className="bh">
                    <thead><tr><th>Task</th><th>KPI</th><th style={{ width: 70 }}>Weight</th><th style={{ width: 90 }}>Actual Score</th><th style={{ width: 80 }}>Rating</th><th style={{ width: 130 }}>Ranking</th><th style={{ width: 120 }}></th></tr></thead>
                    <tbody>
                      {o.tasks.map(t => (
                        <tr key={t.id}>
                          <td>{t.task}</td>
                          <td>{t.kpi}</td>
                          <td>{t.weight}</td>
                          <td><NumCell value={t.actual} onChange={v => patchTask(o.id, t.id, { actual: v, score: v })} /></td>
                          <td><NumCell value={t.rating} max={5} onChange={v => patchTask(o.id, t.id, { rating: v })} /></td>
                          <td>{rankLabel(t.rating)}</td>
                          <td style={{ textAlign: "right" }}>
                            <button style={commentLink} onClick={() => setComment({ scope: p.name, value: t.comment, readOnly: false, save: (v) => patchTask(o.id, t.id, { comment: v }) })}>{t.comment ? "Edit Comment" : "Add Comment"}</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </React.Fragment>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 24 }}>
        <div>{step > 0 && <Button variant="stroke" icon="arrow-left-line" onClick={() => setStep(s => s - 1)}>Back</Button>}</div>
        <div style={{ display: "flex", gap: 12 }}>
          <Button variant="stroke" onClick={onCancel}>Cancel</Button>
          <Button variant="primary" iconRight={last ? "check-line" : "arrow-right-s-line"} onClick={next}>{last ? "Submit Appraisal" : "Continue"}</Button>
        </div>
      </div>

      {comment && <CommentModal scope={comment.scope} value={comment.value} readOnly={comment.readOnly}
        onClose={() => setComment(null)} onSave={(v) => { comment.save(v); setComment(null); }} />}
    </div>
  );
}

Object.assign(window, { AppraisalScoring, CommentModal });
