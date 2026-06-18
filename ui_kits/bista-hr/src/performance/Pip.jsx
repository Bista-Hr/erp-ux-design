// BISTA HR · performance/Pip — Performance Improvement Plan management.
// Mirrors the codebase exactly:
//   Two sub-tabs — "Manage PIP" (plans: Create a Plan + Name/Employees + View/Enroll) and
//   "HRBP Report" (org-wide enrolment report: search + Dept/Unit/Status filters + Export to Excel;
//    columns Name / Plan Name / Review Frequency / Progress Status / Program Status / Start / End / View).
//   Plan/enrolment DETAIL is a full page: Plan Details (name, dates, Review Frequency radios,
//   Program Status) + a Review-trail aside + Activities + Resources cards.
const { useState: usePIP, useEffect: usePIPEffect } = React;

let PIP_SEQ = 8000;
const pipId = () => ++PIP_SEQ;

const PIP_REVIEW_FREQ = ["Weekly", "Bi-weekly", "Monthly", "Quarterly"];
const PIP_DEPARTMENTS = ["People & Culture Department", "Retail Banking", "Operations", "Credit Risk"];
const PIP_UNITS = ["KN Circle / KN Circle", "P&C Business Partnering / P&C Business Partnering", "Accra Main"];
const PIP_STATUS_FILTERS = ["Not Started", "In Progress", "Completed"];

function ProgramStatusBadge({ status }) {
  const map = { "In Progress": { bg: "var(--success-tint)", c: "var(--success-deep)", b: "#ABEFC6", i: "checkbox-circle-line" }, "Completed": { bg: "var(--success-tint)", c: "var(--success-deep)", b: "#ABEFC6", i: "checkbox-circle-fill" }, "Not Started": { bg: "var(--gray-100)", c: "var(--gray-600)", b: "var(--gray-200)", i: "time-line" } };
  const s = map[status] || map["Not Started"];
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 12.5, padding: "5px 11px", borderRadius: 999, background: s.bg, color: s.c, border: `1px solid ${s.b}` }}><Icon name={s.i} size={14} color={s.c} />{status}</span>;
}
function ProgressStatusPill({ status }) {
  const map = { "On Track": { bg: "var(--success-tint)", c: "var(--success-deep)", b: "#ABEFC6" }, "At Risk": { bg: "var(--warning-tint)", c: "var(--warning-deep)", b: "#F2E6A8" }, "Off Track": { bg: "var(--error-tint)", c: "var(--error)", b: "#FECDCA" } };
  const s = map[status] || map["On Track"];
  return <span style={{ display: "inline-flex", fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 12, padding: "3px 10px", borderRadius: 999, background: s.bg, color: s.c, border: `1px solid ${s.b}` }}>{status}</span>;
}

// Manage PIP plans
const PIP_PLANS_SEED = [
  { id: pipId(), name: "Plan name", reviewFrequency: "Monthly", programStatus: "Not Started", startDate: "", endDate: "", enrollments: [], activities: [], resources: [] },
  { id: pipId(), name: "Completion of all assigned courses and other learnings", reviewFrequency: "Monthly", programStatus: "In Progress", startDate: "", endDate: "",
    enrollments: [
      { id: pipId(), employeeName: "Ruth Nkansa-Boadi", reviewer: "Ruth Nkansa-Boadi" },
      { id: pipId(), employeeName: "Leo Kyeremateng", reviewer: "Leo Kyeremateng" },
    ], activities: [], resources: [] },
];

// HRBP enrolment report rows
const HRBP_PIP_ROWS = [
  { id: pipId(), employeeName: "Ruth Nkansa-Boadi", planName: "Completion of all assigned courses and other learnings", department: "People & Culture Department", unitBranch: "KN Circle / KN Circle",
    reviewFrequency: "", progressStatus: "On Track", programStatus: "In Progress", startDate: "", endDate: "", reviewer: "Ruth Nkansa-Boadi", activities: [], resources: [] },
  { id: pipId(), employeeName: "Leo Kyeremateng", planName: "Completion of all assigned courses and other learnings", department: "People & Culture Department", unitBranch: "P&C Business Partnering / P&C Business Partnering",
    reviewFrequency: "Weekly", progressStatus: "On Track", programStatus: "In Progress", startDate: "2026-06-16", endDate: "2026-06-30", reviewer: "Leo Kyeremateng", activities: [], resources: [] },
];

const PIP_CANDIDATES = [
  { id: "emp-2", name: "Yaw Asante", number: "BG-3120" }, { id: "emp-3", name: "Efua Boateng", number: "BG-3144" },
  { id: "emp-4", name: "Kojo Antwi", number: "BG-2988" }, { id: "emp-5", name: "Adwoa Sarpong", number: "BG-3201" },
];

function CreatePlanModal({ onClose, onCreate }) {
  const [name, setName] = usePIP("");
  return (
    <Modal onClose={onClose} width={460}>
      <div style={{ padding: 24 }}>
        <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 19, color: "var(--gray-900)" }}>Create a Plan</div>
        <div className="bh-body" style={{ marginTop: 4 }}>Enter a name for the new performance improvement plan.</div>
        <div style={{ marginTop: 18 }}><Field label="Plan Name"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Type plan name" /></Field></div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: "0 24px 24px" }}>
        <Button variant="stroke" onClick={onClose}>Cancel</Button>
        <Button variant="primary" disabled={!name.trim()} onClick={() => onCreate(name.trim())}>Create Plan</Button>
      </div>
    </Modal>
  );
}

function EnrollDialog({ planName, existing, onClose, onEnroll }) {
  const [sel, setSel] = usePIP([]);
  const toggle = (id) => setSel((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  const avail = PIP_CANDIDATES.filter((c) => !(existing || []).some((e) => e.employeeName === c.name));
  return (
    <Modal onClose={onClose} width={520}>
      <div style={{ padding: 24 }}>
        <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 19, color: "var(--gray-900)" }}>Enroll Employees</div>
        <div className="bh-body" style={{ marginTop: 4 }}>Add employees to <strong>{planName}</strong>.</div>
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8, maxHeight: "44vh", overflowY: "auto" }}>
          {avail.length === 0 ? <div style={{ padding: 24, textAlign: "center", color: "var(--gray-400)", fontFamily: "var(--font-ui)", fontSize: 13.5 }}>All candidates are already enrolled.</div>
            : avail.map((c) => (
            <label key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", border: `1px solid ${sel.includes(c.id) ? "var(--brand-yellow-dark)" : "var(--border)"}`, borderRadius: 10, cursor: "pointer", background: sel.includes(c.id) ? "var(--brand-yellow-tint)" : "#fff" }}>
              <Checkbox checked={sel.includes(c.id)} onChange={() => toggle(c.id)} />
              <Avatar name={c.name} size={30} />
              <div><div style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 13.5, color: "var(--gray-900)" }}>{c.name}</div><div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-400)" }}>{c.number}</div></div>
            </label>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: "0 24px 24px" }}>
        <Button variant="stroke" onClick={onClose}>Cancel</Button>
        <Button variant="primary" disabled={!sel.length} onClick={() => onEnroll(avail.filter((c) => sel.includes(c.id)))}>Enroll {sel.length || ""}</Button>
      </div>
    </Modal>
  );
}

// shared card
function PipCard({ title, children }) {
  return <div className="card" style={{ padding: 24 }}><div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 16, color: "var(--gray-900)", marginBottom: 18 }}>{title}</div>{children}</div>;
}

// full-page plan / enrolment detail
function PipPlanDetail({ row, withTrail, onBack }) {
  const [freq, setFreq] = usePIP(row.reviewFrequency || "Monthly");
  const main = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
      <PipCard title="Plan Details">
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Field label="Plan Name"><div style={{ padding: "10px 12px", borderRadius: 10, background: "var(--gray-50)", border: "1px solid var(--border)", fontFamily: "var(--font-control)", fontSize: 14, color: "var(--gray-700)" }}>{row.planName || row.name || "—"}</div></Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <Field label="Start date"><div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 10, background: "var(--gray-50)", border: "1px solid var(--border)", fontFamily: "var(--font-control)", fontSize: 14, color: "var(--gray-500)" }}><Icon name="calendar-line" size={16} color="var(--gray-400)" />{row.startDate ? fmtDate(row.startDate) : "—"}</div></Field>
            <Field label="End date"><div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 10, background: "var(--gray-50)", border: "1px solid var(--border)", fontFamily: "var(--font-control)", fontSize: 14, color: "var(--gray-500)" }}><Icon name="calendar-line" size={16} color="var(--gray-400)" />{row.endDate ? fmtDate(row.endDate) : "—"}</div></Field>
          </div>
          <div>
            <label style={{ display: "block", fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 14, color: "var(--gray-900)", marginBottom: 12 }}>Review Frequency</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {PIP_REVIEW_FREQ.map((f) => {
                const on = f === freq;
                return (
                  <button key={f} onClick={() => setFreq(f)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 10, cursor: "pointer", textAlign: "left",
                    border: `1px solid ${on ? "var(--success)" : "var(--border)"}`, background: on ? "var(--success-tint)" : "var(--gray-25)" }}>
                    <span style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, display: "grid", placeItems: "center", border: `2px solid ${on ? "var(--success-deep)" : "var(--gray-300)"}`, background: on ? "var(--success-deep)" : "#fff" }}>{on && <Icon name="check-line" size={11} color="#fff" />}</span>
                    <span style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 13.5, color: on ? "var(--success-deep)" : "var(--gray-700)" }}>{f}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 14, color: "var(--gray-900)", marginBottom: 10 }}>Program Status</label>
            <div style={{ padding: "12px 14px", border: "1px solid var(--border)", borderRadius: 10, background: "var(--gray-25)" }}><ProgramStatusBadge status={row.programStatus || "Not Started"} /></div>
          </div>
        </div>
      </PipCard>
      <PipCard title="Activities">{(row.activities || []).length === 0 ? <p style={{ fontFamily: "var(--font-ui)", fontSize: 13.5, color: "var(--gray-400)", margin: 0 }}>No activities defined for this plan.</p> : <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{row.activities.map((a, i) => <div key={i} style={{ padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 10, fontFamily: "var(--font-ui)", fontSize: 13.5, color: "var(--gray-700)" }}>{a}</div>)}</div>}</PipCard>
      <PipCard title="Resources">{(row.resources || []).length === 0 ? <p style={{ fontFamily: "var(--font-ui)", fontSize: 13.5, color: "var(--gray-400)", margin: 0 }}>No resources defined for this plan.</p> : <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{row.resources.map((r, i) => <div key={i} style={{ padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 10, fontFamily: "var(--font-ui)", fontSize: 13.5, color: "var(--gray-700)" }}>{r}</div>)}</div>}</PipCard>
      {withTrail && (
      <PipCard title="Acknowledgement">
        <div style={{ marginBottom: 12 }}>
          {row.acknowledged
            ? <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 12.5, padding: "5px 11px", borderRadius: 999, background: "var(--success-tint)", color: "var(--success-deep)", border: "1px solid #ABEFC6" }}><Icon name="checkbox-circle-fill" size={14} color="#17B26A" />Acknowledged</span>
            : <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 12.5, padding: "5px 11px", borderRadius: 999, background: "var(--warning-tint)", color: "var(--warning-deep)", border: "1px solid #F2E6A8" }}><Icon name="time-line" size={14} color="var(--warning-deep)" />Pending</span>}
        </div>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 13.5, color: row.acknowledgementComment ? "var(--gray-700)" : "var(--gray-400)", margin: 0, lineHeight: 1.55 }}>{row.acknowledgementComment || "No acknowledgement comment provided."}</p>
      </PipCard>
      )}
    </div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div><Button variant="stroke" icon="arrow-left-line" onClick={onBack}>Back to PIP Management</Button></div>
      {withTrail ? (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 320px", gap: 20, alignItems: "start" }}>
          {main}
          <aside className="card" style={{ padding: 24, position: "sticky", top: 16 }}>
            <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 16, color: "var(--gray-900)", marginBottom: 14 }}>Review trail</div>
            <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 14, color: "var(--gray-800)", textTransform: "uppercase", marginBottom: 10 }}>{row.reviewer || row.employeeName}</div>
            <div style={{ fontFamily: "var(--font-ui)", fontSize: 13.5, color: "var(--gray-400)" }}>No review trail recorded.</div>
          </aside>
        </div>
      ) : main}
    </div>
  );
}

function Pip({ onToast, onSubPage }) {
  const [plans, setPlans] = usePIP(PIP_PLANS_SEED);
  const [hrbpRows] = usePIP(HRBP_PIP_ROWS);
  const [tab, setTab] = usePIP("manage");           // manage | hrbp
  const [view, setView] = usePIP({ name: "list" }); // list | detail{row, withTrail}
  const [creating, setCreating] = usePIP(false);
  const [enrolling, setEnrolling] = usePIP(null);
  // HRBP filters
  const [q, setQ] = usePIP(""); const [dept, setDept] = usePIP(""); const [unit, setUnit] = usePIP(""); const [status, setStatus] = usePIP("");

  usePIPEffect(() => {
    if (!onSubPage) return;
    if (view.name === "detail") onSubPage({ trail: [{ label: "PIP", onClick: () => setView({ name: "list" }) }, { label: "Plan Details" }] });
    else onSubPage(null);
    return () => onSubPage(null);
  }, [view]);

  const createPlan = (name) => { const p = { id: pipId(), name, reviewFrequency: "Monthly", programStatus: "Not Started", startDate: "", endDate: "", enrollments: [], activities: [], resources: [] }; setPlans((ps) => [p, ...ps]); setCreating(false); onToast("Plan created successfully.", { tone: "success" }); };
  const enroll = (planId, employees) => { setPlans((ps) => ps.map((p) => p.id === planId ? { ...p, enrollments: [...p.enrollments, ...employees.map((e) => ({ id: pipId(), employeeName: e.name, reviewer: e.name }))] } : p)); setEnrolling(null); onToast(`${employees.length} employee(s) enrolled.`, { tone: "success" }); };

  if (view.name === "detail") {
    return (
      <React.Fragment>
        <PipPlanDetail row={view.row} withTrail={view.withTrail} onBack={() => setView({ name: "list" })} />
        {enrolling && <EnrollDialog planName={enrolling.name} existing={enrolling.enrollments} onClose={() => setEnrolling(null)} onEnroll={(emps) => enroll(enrolling.id, emps)} />}
      </React.Fragment>
    );
  }

  let shown = hrbpRows;
  if (q.trim()) shown = shown.filter((r) => r.employeeName.toLowerCase().includes(q.trim().toLowerCase()));
  if (dept) shown = shown.filter((r) => r.department === dept);
  if (unit) shown = shown.filter((r) => r.unitBranch === unit);
  if (status) shown = shown.filter((r) => r.programStatus === status);

  return (
    <div className="card" style={{ padding: "var(--card-pad, 24px)" }}>
      {/* sub-tab toggle */}
      <div style={{ display: "inline-flex", gap: 4, background: "var(--gray-75)", borderRadius: 10, padding: 4, marginBottom: 22 }}>
        {[{ v: "manage", l: "Manage PIP" }, { v: "hrbp", l: "HRBP Report" }].map((t) => {
          const on = t.v === tab;
          return <button key={t.v} onClick={() => setTab(t.v)} style={{ border: 0, cursor: "pointer", borderRadius: 7, padding: "8px 16px", fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 13.5, background: on ? "var(--brand-yellow-tint)" : "transparent", color: on ? "var(--gray-900)" : "var(--gray-500)" }}>{t.l}</button>;
        })}
      </div>

      {tab === "manage" ? (
        <React.Fragment>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
            <Button variant="primary" icon="add-line" onClick={() => setCreating(true)}>Create a Plan</Button>
          </div>
          <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
            <table className="bh">
              <thead><tr><th>Name</th><th>Employees</th><th style={{ width: 220 }}></th></tr></thead>
              <tbody>
                {plans.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600, color: "var(--gray-900)" }}>{p.name}</td>
                    <td>{p.enrollments.length}</td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: 8 }}>
                        <ViewDetailsButton label="View" onClick={() => setView({ name: "detail", row: p, withTrail: false })} />
                        <ViewDetailsButton label="Enroll Employees" icon="user-add-line" onClick={() => setEnrolling(p)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 18, flexWrap: "wrap" }}>
            <div>
              <div className="bh-h2" style={{ fontSize: 22 }}>HRBP report</div>
              <div className="bh-body" style={{ marginTop: 4 }}>Review and export PIP enrollment status across departments, units, and branches.</div>
            </div>
            <Button variant="primary" icon="file-excel-2-line" onClick={() => onToast("Exporting to Excel…", { tone: "success" })}>Export to Excel</Button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 18 }}>
            <div className="input-wrap" style={{ padding: "8px 12px" }}><Icon name="search-2-line" size={18} style={{ color: "var(--icon-default)" }} /><input placeholder="Search by name..." value={q} onChange={(e) => setQ(e.target.value)} /></div>
            <Combobox value={dept} options={[{ value: "", label: "All Departments" }, ...PIP_DEPARTMENTS]} placeholder="All Departments" onChange={setDept} />
            <Combobox value={unit} options={[{ value: "", label: "All Units/Branches" }, ...PIP_UNITS]} placeholder="All Units/Branches" onChange={setUnit} />
            <Combobox value={status} options={[{ value: "", label: "All Statuses" }, ...PIP_STATUS_FILTERS]} placeholder="All Statuses" onChange={setStatus} />
          </div>
          <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflowX: "auto" }}>
            <table className="bh" style={{ minWidth: 920 }}>
              <thead><tr><th>Name</th><th>Plan Name</th><th>Review Frequency</th><th>Progress Status</th><th>Program Status</th><th>Start Date</th><th>End Date</th><th style={{ width: 80 }}>Actions</th></tr></thead>
              <tbody>
                {shown.length === 0 ? <tr><td colSpan={8} style={{ padding: 32, textAlign: "center", color: "var(--gray-400)" }}>No enrolments match your filters.</td></tr>
                  : shown.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600, color: "var(--gray-900)", textTransform: "uppercase" }}>{r.employeeName}</td>
                    <td style={{ color: "var(--gray-500)" }}>{r.planName}</td>
                    <td>{r.reviewFrequency || "—"}</td>
                    <td><ProgressStatusPill status={r.progressStatus} /></td>
                    <td style={{ color: "var(--gray-500)" }}>{r.programStatus}</td>
                    <td style={{ color: "var(--gray-500)" }}>{r.startDate ? fmtDate(r.startDate) : "—"}</td>
                    <td style={{ color: "var(--gray-500)" }}>{r.endDate ? fmtDate(r.endDate) : "—"}</td>
                    <td style={{ textAlign: "right" }}><ViewDetailsButton label="View" onClick={() => setView({ name: "detail", row: r, withTrail: true })} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </React.Fragment>
      )}

      {creating && <CreatePlanModal onClose={() => setCreating(false)} onCreate={createPlan} />}
      {enrolling && <EnrollDialog planName={enrolling.name} existing={enrolling.enrollments} onClose={() => setEnrolling(null)} onEnroll={(emps) => enroll(enrolling.id, emps)} />}
    </div>
  );
}

Object.assign(window, { Pip, PipPlanDetail, CreatePlanModal, EnrollDialog, ProgramStatusBadge, ProgressStatusPill });
