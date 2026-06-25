// BISTA HR · careers/Assessments — Recruitment ▸ Assessments (assessor's own queue).
// Mirrors the codebase AssessorInterviews flow: the signed-in assessor sees interviews
// assigned to them (Pending / Completed), opens one and scores the posting's weighted
// assessment constructs (ConstructScore { constructName, score }), then submits.
const { useState: useAS } = React;

// weighted constructs attached to a posting's interview assessment (AssessmentConstruct)
const AS_CONSTRUCTS = {
  "Software Engineer": [
    { constructName: "Technical Proficiency", weight: 40, requirements: ["Data structures & algorithms", "System design", "Code quality"] },
    { constructName: "Problem Solving", weight: 30, requirements: ["Breaks down ambiguity", "Reasons through trade-offs"] },
    { constructName: "Communication", weight: 15, requirements: ["Explains decisions clearly"] },
    { constructName: "Culture & Values", weight: 15, requirements: ["Collaboration", "Ownership"] },
  ],
  "Finance Analyst": [
    { constructName: "Analytical Skills", weight: 40, requirements: ["Financial modelling", "Variance analysis"] },
    { constructName: "Domain Knowledge", weight: 35, requirements: ["IFRS", "Reporting standards"] },
    { constructName: "Communication", weight: 25, requirements: ["Presents findings clearly"] },
  ],
  "HR Officer": [
    { constructName: "People Skills", weight: 40, requirements: ["Empathy", "Conflict handling"] },
    { constructName: "HR Knowledge", weight: 35, requirements: ["Labour law", "HR operations"] },
    { constructName: "Communication", weight: 25, requirements: ["Clear written & verbal"] },
  ],
};
const _defConstructs = [
  { constructName: "Role Competence", weight: 50, requirements: ["Core skills for the role"] },
  { constructName: "Communication", weight: 25, requirements: ["Clarity"] },
  { constructName: "Culture & Values", weight: 25, requirements: ["Alignment with values"] },
];

let _iid = 8000;
const _interview = (i) => ({
  id: ++_iid, status: "pending", myScores: null,
  constructs: AS_CONSTRUCTS[i.designation] || _defConstructs,
  locationName: i.locationName || "Main Office — Interview Room 2",
  ...i,
});

const SCHEDULED_INTERVIEWS = [
  _interview({ applicantName: "Kofi Boadu", applicantEmail: "kofi.boadu@email.com", designation: "Software Engineer", department: "Information Technology", scheduledStartAt: "24 Feb, 2025 · 10:00", scheduledEndAt: "11:00" }),
  _interview({ applicantName: "Michael Asare", applicantEmail: "michael.asare@email.com", designation: "Finance Analyst", department: "Finance", scheduledStartAt: "24 Feb, 2025 · 14:00", scheduledEndAt: "15:00" }),
  _interview({ applicantName: "Nana Addo", applicantEmail: "nana.addo@email.com", designation: "HR Officer", department: "Human Resource", scheduledStartAt: "25 Feb, 2025 · 09:30", scheduledEndAt: "10:30" }),
  _interview({ applicantName: "Daniel Quaye", applicantEmail: "daniel.quaye@email.com", designation: "Software Engineer", department: "Information Technology", scheduledStartAt: "20 Feb, 2025 · 11:00", scheduledEndAt: "12:00", status: "completed", myScores: { "Technical Proficiency": 85, "Problem Solving": 80, "Communication": 90, "Culture & Values": 88 } }),
];

window.HRStores = window.HRStores || {};
window.HRStores.assessor = window.HRStores.assessor || makeStore({ interviews: SCHEDULED_INTERVIEWS });

const _weighted = (constructs, scores) => Math.round(constructs.reduce((sum, c) => sum + (Number(scores[c.constructName]) || 0) * c.weight, 0) / constructs.reduce((s, c) => s + c.weight, 0));

// ---- score one interview ----
function InterviewScoreForm({ interview, onClose, onSubmit }) {
  const done = interview.status === "completed";
  const [scores, setScores] = useAS(() => {
    const init = {};
    interview.constructs.forEach(c => { init[c.constructName] = done && interview.myScores ? interview.myScores[c.constructName] : ""; });
    return init;
  });
  const set = (name, v) => setScores(s => ({ ...s, [name]: v }));
  const allScored = interview.constructs.every(c => scores[c.constructName] !== "" && scores[c.constructName] != null);
  const preview = allScored ? _weighted(interview.constructs, scores) : null;
  return (
    <Modal onClose={onClose} width={680}>
      <div style={{ padding: "22px 24px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar name={interview.applicantName} size={44} />
          <div>
            <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 18, color: "var(--gray-900)" }}>{interview.applicantName}</div>
            <div className="bh-caption">{interview.designation} · {interview.department}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <StatusBadge variant={done ? "completed" : "pending"} text={done ? "Submitted" : "Pending"} />
          <button className="btn btn-icon btn-ghost" onClick={onClose} style={{ width: 32, height: 32, padding: 0 }}><Icon name="close-line" size={20} color="var(--gray-500)" /></button>
        </div>
      </div>
      <div style={{ padding: "16px 24px 8px", maxHeight: "62vh", overflowY: "auto" }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
          <span className="bh-chip"><Icon name="calendar-line" size={13} color="var(--gray-500)" style={{ marginRight: 5 }} />{interview.scheduledStartAt} – {interview.scheduledEndAt}</span>
          <span className="bh-chip"><Icon name="map-pin-line" size={13} color="var(--gray-500)" style={{ marginRight: 5 }} />{interview.locationName}</span>
        </div>
        <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 13, letterSpacing: ".02em", textTransform: "uppercase", color: "var(--gray-500)", margin: "14px 0 4px" }}>Assessment Constructs</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {interview.constructs.map(c => (
            <div key={c.constructName} style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "13px 15px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 14, color: "var(--gray-900)" }}>{c.constructName} <span style={{ color: "var(--brand-blue)", fontSize: 12 }}>· {c.weight}%</span></div>
                  <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-500)", marginTop: 2 }}>{c.requirements.join(" · ")}</div>
                </div>
                <div style={{ width: 92, flexShrink: 0 }}>
                  <Input type="number" min="0" max="100" disabled={done} value={scores[c.constructName]} onChange={e => set(c.constructName, e.target.value)} placeholder="0–100" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: "var(--radius-md)", background: "var(--gray-25)", border: "1px solid var(--border)" }}>
          <span style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 13, color: "var(--gray-700)" }}>Weighted score</span>
          <span style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 24, color: preview == null ? "var(--gray-300)" : "var(--gray-900)" }}>{preview == null ? "—" : preview + "%"}</span>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: 20, borderTop: "1px solid var(--divider)" }}>
        <Button variant="stroke" onClick={onClose}>{done ? "Close" : "Cancel"}</Button>
        {!done && <Button variant="primary" icon="check-line" disabled={!allScored} onClick={() => onSubmit(interview.id, scores)}>Submit Assessment</Button>}
      </div>
    </Modal>
  );
}

const AS_TABS = [{ value: "all", label: "All" }, { value: "pending", label: "Pending" }, { value: "completed", label: "Completed" }];

function AssessmentsScreen({ onToast }) {
  const [store, setStore] = useStore(window.HRStores.assessor);
  const [tab, setTab] = useAS("all");
  const [q, setQ] = useAS("");
  const [open, setOpen] = useAS(null);
  const rows = store.interviews.filter(i =>
    (tab === "all" || i.status === tab) &&
    (i.applicantName.toLowerCase().includes(q.toLowerCase()) || i.designation.toLowerCase().includes(q.toLowerCase())));

  const submit = (id, scores) => {
    setStore(s => ({ ...s, interviews: s.interviews.map(i => i.id === id ? { ...i, status: "completed", myScores: scores } : i) }));
    setOpen(null);
    onToast && onToast("Assessment submitted successfully", { tone: "success" });
  };

  const asTabs = <UI.Tabs value={tab} onValueChange={setTab}><UI.TabsList>{AS_TABS.map(t => <UI.TabsTrigger key={t.value} value={t.value}>{t.label}</UI.TabsTrigger>)}</UI.TabsList></UI.Tabs>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title="Assessments" subtitle="Interviews assigned to you as an assessor. Open one to score its weighted constructs." />
      <div className="card" style={{ padding: 20 }}>
        <div className="bh-tablebox">
        <UI.FilterBar left={asTabs} search={q} onSearch={setQ} searchPlaceholder="Search…" />
        {rows.length === 0
          ? <EmptyState compact variant="assessment" title="No assessments" subtitle="No assessments found in this category." />
          : <table className="bh">
              <thead><tr><th>Name</th><th>Job Title</th><th>Department</th><th>Scheduled</th><th>Status</th><th style={{ width: 60 }}></th></tr></thead>
              <tbody>
                {rows.map(i => (
                  <tr key={i.id} style={{ cursor: "pointer" }} onClick={() => setOpen(i)}>
                    <td><span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Avatar name={i.applicantName} size={28} /><span style={{ fontWeight: 600 }}>{i.applicantName}</span></span></td>
                    <td>{i.designation}</td>
                    <td style={{ color: "var(--gray-500)" }}>{i.department}</td>
                    <td style={{ color: "var(--gray-500)" }}>{i.scheduledStartAt}</td>
                    <td>{i.status === "completed" && i.myScores
                      ? <StatusBadge variant="success" text={`Completed · ${_weighted(i.constructs, i.myScores)}%`} size="sm" />
                      : <StatusBadge variant="pending" text="Pending" size="sm" />}</td>
                    <td style={{ textAlign: "right" }}><UI.RowActions actions={[i.status === "completed"
                      ? { label: "View", icon: "eye-line", onClick: () => setOpen(i) }
                      : { label: "Start Assessment", short: "Start", icon: "edit-line", onClick: () => setOpen(i) }]} /></td>
                  </tr>
                ))}
              </tbody>
            </table>}
        <div className="flex items-center justify-between px-4 py-4 border-t border-gray-100">
          <span className="text-sm font-medium text-gray-900">Page 1 of 1</span>
          <div className="flex gap-2"><UI.Button variant="outline" size="sm" disabled>Previous</UI.Button><UI.Button variant="outline" size="sm" disabled>Next</UI.Button></div>
        </div>
        </div>
      </div>

      {open && <InterviewScoreForm interview={store.interviews.find(i => i.id === open.id) || open} onClose={() => setOpen(null)} onSubmit={submit} />}
    </div>
  );
}

Object.assign(window, { AssessmentsScreen, InterviewScoreForm, SCHEDULED_INTERVIEWS });
