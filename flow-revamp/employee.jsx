// FLOW REVAMP (standalone proposal) · employee — the regrouped Employee Self-Service.
// Four grouped areas (Home · My Performance · Learning & Career · My Requests) replace the
// old flat 8-tab bar. Full fidelity on the NEW piece: Request Training → manager → L&D.
const { useState: useEmp } = React;

/* ---------- tiny modal ---------- */
function Modal({ width = 560, onClose, children }) {
  return ReactDOM.createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(16,24,40,.45)" }} />
      <div style={{ position: "relative", width, maxWidth: "100%", maxHeight: "90vh", overflowY: "auto", background: "#fff", borderRadius: 16, boxShadow: "var(--shadow-pop)" }}>{children}</div>
    </div>, document.body);
}

/* ===================== HOME ===================== */
function EmployeeOverview({ go }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 24, display: "flex", alignItems: "center", gap: 18, background: "linear-gradient(110deg, var(--brand-yellow-tint), #fff 60%)", boxShadow: "var(--shadow-card)" }}>
        <Avatar name={ME.name} size={56} />
        <div style={{ flex: 1 }}>
          <div className="bh-h2" style={{ fontSize: 22 }}>Welcome back, {ME.name.split(" ")[0]} 👋</div>
          <div className="bh-body" style={{ marginTop: 2 }}>{ME.title} · {ME.dept} · Reports to {ME.manager}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <StatCard idx={0} icon="focus-3-line" label="Goal progress" value="62%" sub="Q2 cycle on track" />
        <StatCard idx={1} icon="graduation-cap-line" label="Active courses" value="2" sub="1 due this month" />
        <StatCard idx={2} icon="calendar-check-line" label="Leave balance" value="14d" sub="of 24 annual" />
        <StatCard idx={3} icon="send-plane-line" label="Open requests" value="3" sub="1 awaiting manager" />
      </div>

      <div className="card" style={{ padding: 24, boxShadow: "var(--shadow-card)" }}>
        <div className="bh-h4" style={{ fontSize: 16, marginBottom: 14 }}>Jump back in</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))", gap: 12 }}>
          {[
            { t: "Set / review my goals", i: "focus-3-line", go: ["My Performance", "My Goals"] },
            { t: "Request a training program", i: "open-arm-line", go: ["Learning & Career", "Request Training"] },
            { t: "Continue my courses", i: "play-circle-line", go: ["Learning & Career", "My Learning"] },
            { t: "Apply for leave", i: "calendar-line", go: ["My Requests", "Leave"] },
          ].map(q => (
            <button key={q.t} onClick={() => go(q.go[0], q.go[1])} style={{ display: "flex", alignItems: "center", gap: 12, textAlign: "left",
              border: "1px solid var(--border)", borderRadius: 12, padding: "14px 16px", background: "#fff", cursor: "pointer" }}>
              <span style={{ width: 38, height: 38, borderRadius: 10, background: "var(--gray-50)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name={q.i} size={20} color="var(--brand-yellow-dark)" />
              </span>
              <span style={{ fontFamily: "var(--font-control)", fontWeight: 600, fontSize: 14, color: "var(--gray-900)" }}>{q.t}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function MyInfo() {
  const rows = [
    ["Employee ID", ME.code], ["Job Title", ME.title], ["Department", ME.dept], ["Branch", ME.branch],
    ["Job Grade", ME.grade], ["Reports To", ME.manager], ["Email", ME.email], ["Date Joined", ME.joined],
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader icon="user-3-line" title={ME.name} subtitle={`${ME.title} · ${ME.dept}`}
        actions={<Btn variant="stroke" size="sm" icon="edit-2-line">Request Update</Btn>} />
      <div className="card" style={{ padding: 24, boxShadow: "var(--shadow-card)" }}>
        <div className="ed-panel-wrap"><div className="ed-personfields">
          {rows.map(([k, v]) => (
            <div key={k} style={{ padding: "12px 16px 12px 0" }}>
              <div className="bh-caption" style={{ marginBottom: 3 }}>{k}</div>
              <div style={{ fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 14, color: "var(--gray-900)" }}>{v}</div>
            </div>
          ))}
        </div></div>
      </div>
    </div>
  );
}

/* ===================== MY PERFORMANCE ===================== */
function MyGoals() {
  const total = ME_GOALS.reduce((s, g) => s + g.weight, 0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader icon="focus-3-line" title="My Goals" subtitle="Your goals for the current appraisal cycle, weighted to 100%."
        actions={<Badge variant="pending">Submitted · awaiting {ME.manager.split(" ")[0]}</Badge>} />
      <div className="card" style={{ padding: 20, boxShadow: "var(--shadow-card)" }}>
        <div className="bh-tablebox">
          <table className="bh">
            <thead><tr><th>Goal</th><th>Perspective</th><th>KPI / Measure</th><th style={{ width: 90 }}>Weight</th><th style={{ width: 160 }}>Progress</th></tr></thead>
            <tbody>
              {ME_GOALS.map(g => (
                <tr key={g.id}>
                  <td style={{ fontWeight: 500, color: "var(--gray-900)" }}>{g.title}</td>
                  <td><Badge variant="neutral" size="sm">{g.perspective}</Badge></td>
                  <td style={{ color: "var(--gray-500)" }}>{g.kpi}</td>
                  <td>{g.weight}%</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 6, borderRadius: 999, background: "var(--gray-150)", overflow: "hidden" }}>
                        <div style={{ width: g.progress + "%", height: "100%", background: "var(--success)" }} />
                      </div>
                      <span style={{ fontSize: 12.5, color: "var(--gray-500)", width: 32 }}>{g.progress}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 24, padding: "12px 16px", borderTop: "1px solid var(--divider)", fontFamily: "var(--font-control)", fontSize: 13.5 }}>
            <span style={{ color: "var(--gray-500)" }}>Total weight</span>
            <strong style={{ color: total === 100 ? "var(--success-deep)" : "var(--error)" }}>{total} / 100</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

function MyAppraisals() {
  const items = [
    { period: "2026 · Mid-Year", status: "Pending Review", score: null, tone: "pending" },
    { period: "2025 · Year-End", status: "Completed", score: "3.8 / 5", tone: "approved" },
    { period: "2025 · Mid-Year", status: "Completed", score: "3.5 / 5", tone: "approved" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader icon="award-line" title="My Appraisals" subtitle="Self-assessments and the outcomes signed off by your manager." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 16 }}>
        {items.map(it => (
          <div key={it.period} className="card" style={{ padding: 20, boxShadow: "var(--shadow-card)", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div className="bh-h4" style={{ fontSize: 15.5 }}>{it.period}</div>
              <Badge variant={it.tone} size="sm">{it.status}</Badge>
            </div>
            <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 26, color: it.score ? "var(--gray-900)" : "var(--gray-300)" }}>{it.score || "—"}</div>
            <Btn variant="stroke" size="sm" icon="eye-line">View appraisal</Btn>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===================== LEARNING & CAREER ===================== */
function MyLearning({ go }) {
  const tone = { "In Progress": "info", "Completed": "approved", "Not Started": "neutral" };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader icon="graduation-cap-line" title="My Learning" subtitle="Courses assigned to you, plus anything you've enrolled in."
        actions={<Btn variant="primary" size="sm" icon="open-arm-line" onClick={() => go("Learning & Career", "Request Training")}>Request Training</Btn>} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px,1fr))", gap: 16 }}>
        {ME_COURSES.map(c => (
          <div key={c.id} className="card" style={{ padding: 0, overflow: "hidden", boxShadow: "var(--shadow-card)" }}>
            <div style={{ height: 84, background: "linear-gradient(120deg, var(--brand-blue), #6941C6)", display: "flex", alignItems: "flex-end", padding: 14 }}>
              <Badge variant={tone[c.status]} size="sm">{c.status}</Badge>
            </div>
            <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              <div className="bh-h4" style={{ fontSize: 15.5 }}>{c.title}</div>
              <div className="bh-caption">{c.provider} · due {c.due}</div>
              <div style={{ height: 6, borderRadius: 999, background: "var(--gray-150)", overflow: "hidden" }}>
                <div style={{ width: c.pct + "%", height: "100%", background: "var(--success)" }} />
              </div>
              <Btn variant="stroke" size="sm" icon={c.status === "Completed" ? "checkbox-circle-line" : "play-circle-line"}>{c.status === "Completed" ? "Review" : c.status === "Not Started" ? "Start" : "Continue"}</Btn>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// the route strip showing employee → manager → L&D
function RouteStrip() {
  const step = (icon, label, sub, tint) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
      <span style={{ width: 38, height: 38, borderRadius: 10, background: tint, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon name={icon} size={19} color="#fff" />
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 13.5, color: "var(--gray-900)" }}>{label}</div>
        <div className="bh-caption">{sub}</div>
      </div>
    </div>
  );
  const arrow = <Icon name="arrow-right-line" size={18} color="var(--gray-300)" />;
  return (
    <div className="card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 14, boxShadow: "var(--shadow-card)", flexWrap: "wrap" }}>
      {step("user-3-line", "You request", "Tied to a goal or gap", "var(--brand-blue)")}{arrow}
      {step("team-line", "Manager approves", ME.manager, "var(--warning)")}{arrow}
      {step("graduation-cap-line", "L&D Needs Assessment", "Becomes demand for a program", "#6941C6")}
    </div>
  );
}

function RequestTraining({ requests, onSubmit, onToast }) {
  const [open, setOpen] = useEmp(false);
  const tone = { "Pending Manager": "pending", "Approved": "approved", "Declined": "rejected" };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader icon="open-arm-line" title="Request Training" subtitle="Ask for a development program. Approved requests flow into L&D's Needs Assessment."
        actions={<Btn variant="primary" icon="add-line" onClick={() => setOpen(true)}>New Request</Btn>} />
      <RouteStrip />
      <div className="card" style={{ padding: 20, boxShadow: "var(--shadow-card)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div className="bh-h4" style={{ fontSize: 15.5 }}>My development requests</div>
          <span className="bh-caption">{requests.length} total</span>
        </div>
        <div className="bh-tablebox">
          {requests.length === 0
            ? <EmptyState compact icon="open-arm-line" title="No requests yet" subtitle="Raise a request for a program you need to grow in your role." />
            : <table className="bh">
                <thead><tr><th>Program</th><th>Category</th><th>Priority</th><th>Date</th><th>Status</th></tr></thead>
                <tbody>
                  {requests.map(r => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 500, color: "var(--gray-900)", maxWidth: 280 }}>
                        {r.program}
                        {r.status === "Declined" && r.reason && <div style={{ fontSize: 12, color: "var(--error)", marginTop: 3, whiteSpace: "normal" }}><Icon name="information-line" size={13} /> {r.reason}</div>}
                        {r.status === "Approved" && <div style={{ fontSize: 12, color: "var(--success-deep)", marginTop: 3 }}><Icon name="checkbox-circle-line" size={13} /> {r.ldStatus || "In Needs Assessment"}</div>}
                      </td>
                      <td>{r.category}</td>
                      <td><Badge variant={r.priority === "High" ? "rejected" : r.priority === "Medium" ? "pending" : "neutral"} size="sm">{r.priority}</Badge></td>
                      <td>{r.date}</td>
                      <td><Badge variant={tone[r.status]} size="sm">{r.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>}
        </div>
      </div>

      {open && <RequestForm onClose={() => setOpen(false)} onSubmit={(payload) => { onSubmit(payload); setOpen(false); onToast("Training request submitted to " + ME.manager.split(" ")[0]); }} />}
    </div>
  );
}

function RequestForm({ onClose, onSubmit }) {
  const [program, setProgram] = useEmp("");
  const [custom, setCustom] = useEmp("");
  const [category, setCategory] = useEmp("");
  const [method, setMethod] = useEmp("");
  const [priority, setPriority] = useEmp("");
  const [goal, setGoal] = useEmp("");
  const [need, setNeed] = useEmp("");
  const finalProgram = program === "Other (type below)" ? custom : program;
  const valid = finalProgram && category && priority && need.trim();
  return (
    <Modal width={580} onClose={onClose}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: "1px solid var(--border)" }}>
        <div><div className="bh-h4" style={{ fontSize: 17 }}>New Training Request</div><div className="bh-body" style={{ marginTop: 1 }}>Goes to {ME.manager} for approval.</div></div>
        <button onClick={onClose} style={{ border: 0, background: "none", cursor: "pointer", display: "flex" }}><Icon name="close-line" size={22} color="var(--gray-500)" /></button>
      </div>
      <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 16 }}>
        <Field label="Program / Course"><Select value={program} onChange={setProgram} options={[...PROGRAM_CATALOG, "Other (type below)"]} placeholder="Select a program" /></Field>
        {program === "Other (type below)" && <Field label="Describe the program"><Input value={custom} onChange={e => setCustom(e.target.value)} placeholder="e.g. SME Lending Bootcamp" /></Field>}
        <div style={{ display: "flex", gap: 14 }}>
          <Field label="Category"><Select value={category} onChange={setCategory} options={PROGRAM_CATEGORIES} placeholder="Select category" /></Field>
          <Field label="Priority"><Select value={priority} onChange={setPriority} options={PRIORITIES} placeholder="Select priority" /></Field>
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          <Field label="Development method" optional><Select value={method} onChange={setMethod} options={DEV_METHODS} placeholder="70 / 20 / 10" /></Field>
          <Field label="Link to a goal" optional><Select value={goal} onChange={setGoal} options={ME_GOALS.map(g => g.title)} placeholder="Tie to a goal" /></Field>
        </div>
        <Field label="What problem will this solve?" hint="State the gap or outcome — not a wish-list."><Textarea rows={3} value={need} onChange={e => setNeed(e.target.value)} placeholder="e.g. Reduce credit appraisal turnaround flagged in my mid-year review." /></Field>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: "16px 22px", borderTop: "1px solid var(--border)" }}>
        <Btn variant="stroke" onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" icon="send-plane-line" disabled={!valid}
          onClick={() => onSubmit({ program: finalProgram, category, method, priority, goal, need })}>Submit Request</Btn>
      </div>
    </Modal>
  );
}

function Careers({ onToast }) {
  const [applied, setApplied] = useEmp({});
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader icon="briefcase-4-line" title="Careers" subtitle="Explore and apply for internal opportunities across the bank."
        actions={<Badge variant="open">{OPEN_ROLES.length} open roles</Badge>} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px,1fr))", gap: 16 }}>
        {OPEN_ROLES.map(p => (
          <div key={p.id} className="card" style={{ padding: 20, boxShadow: "var(--shadow-card)", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div><div className="bh-h4" style={{ fontSize: 16 }}>{p.title}</div><div className="bh-caption" style={{ marginTop: 2 }}>{p.dept}</div></div>
              <Badge variant="open" size="sm">Open</Badge>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {[["map-pin-line", p.location], ["calendar-line", "Closes " + p.closes], ["group-line", p.applicants + " applied"]].map(([i, t]) => (
                <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--gray-500)", background: "var(--gray-50)", border: "1px solid var(--border)", borderRadius: 999, padding: "4px 10px" }}><Icon name={i} size={13} color="var(--gray-500)" />{t}</span>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 2 }}>
              <Btn variant="stroke" size="sm" icon="eye-line">View</Btn>
              <Btn variant="primary" size="sm" icon={applied[p.id] ? "check-line" : "send-plane-line"} disabled={applied[p.id]}
                onClick={() => { setApplied(a => ({ ...a, [p.id]: true })); onToast("Application submitted"); }}>{applied[p.id] ? "Applied" : "Apply"}</Btn>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===================== MY REQUESTS ===================== */
function MyLeave({ onToast }) {
  const rows = [
    { type: "Annual Leave", from: "08 Jul 2026", to: "12 Jul 2026", days: 5, status: "pending" },
    { type: "Sick Leave", from: "21 Apr 2026", to: "22 Apr 2026", days: 2, status: "approved" },
    { type: "Casual Leave", from: "03 Mar 2026", to: "03 Mar 2026", days: 1, status: "approved" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader icon="calendar-line" title="Leave" subtitle="Apply for leave and track your requests."
        actions={<Btn variant="primary" size="sm" icon="add-line" onClick={() => onToast("Leave application — opens the planner")}>Apply for Leave</Btn>} />
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <StatCard idx={0} icon="calendar-check-line" label="Annual balance" value="14d" sub="of 24" />
        <StatCard idx={1} icon="time-line" label="Pending" value="1" sub="awaiting manager" />
        <StatCard idx={0} icon="checkbox-circle-line" label="Taken this year" value="10d" />
      </div>
      <div className="card" style={{ padding: 20, boxShadow: "var(--shadow-card)" }}>
        <div className="bh-tablebox">
          <table className="bh">
            <thead><tr><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Status</th></tr></thead>
            <tbody>{rows.map((r, i) => (
              <tr key={i}><td style={{ fontWeight: 500 }}>{r.type}</td><td>{r.from}</td><td>{r.to}</td><td>{r.days}</td>
                <td><Badge variant={r.status === "pending" ? "pending" : "approved"} size="sm">{r.status === "pending" ? "Pending" : "Approved"}</Badge></td></tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MyProfileRequests() {
  const rows = [
    { type: "Address Update", section: "Contact", date: "12 Nov 2025", status: "pending" },
    { type: "Bank Details", section: "Payroll", date: "02 Oct 2025", status: "approved" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader icon="file-edit-line" title="Profile Changes" subtitle="Changes to your record that need HR approval." />
      <div className="card" style={{ padding: 20, boxShadow: "var(--shadow-card)" }}>
        <div className="bh-tablebox">
          <table className="bh">
            <thead><tr><th>Request</th><th>Section</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>{rows.map((r, i) => (
              <tr key={i}><td style={{ fontWeight: 500 }}>{r.type}</td><td>{r.section}</td><td>{r.date}</td>
                <td><Badge variant={r.status === "pending" ? "pending" : "approved"} size="sm">{r.status === "pending" ? "Pending" : "Approved"}</Badge></td></tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ---------- employee router ---------- */
function EmployeeArea({ group, page, go, devRequests, onSubmitDevRequest, onToast }) {
  const myReqs = devRequests.filter(r => r.employeeId === ME.id);
  switch (page) {
    case "Overview": return <EmployeeOverview go={go} />;
    case "My Info": return <MyInfo />;
    case "My Goals": return <MyGoals />;
    case "Appraisals": return <MyAppraisals />;
    case "My Learning": return <MyLearning go={go} />;
    case "Request Training": return <RequestTraining requests={myReqs} onSubmit={onSubmitDevRequest} onToast={onToast} />;
    case "Careers": return <Careers onToast={onToast} />;
    case "Leave": return <MyLeave onToast={onToast} />;
    case "Profile Changes": return <MyProfileRequests />;
    default: return <EmptyState title={page} subtitle="Coming soon." />;
  }
}

Object.assign(window, { EmployeeArea, Modal });
