// FLOW REVAMP (standalone proposal) · app — the shell that ties the two role journeys
// together: a grouped sidebar (replaces the overloaded flat tab bar) + per-group sub-tabs,
// a "Viewing as" role switch, and ONE shared training-request store so an employee request,
// the manager's approval, and the L&D inbox all reflect the same data live.
const { useState: useApp } = React;

// ---- the proposed navigation model (groups → items) ----
const PERSONAL_GROUPS = [
  { group: "Home", icon: "home-5-line", items: ["Overview", "My Info"] },
  { group: "My Performance", icon: "award-line", items: ["My Goals", "Appraisals"] },
  { group: "Learning & Career", icon: "graduation-cap-line", items: ["My Learning", "Request Training", "Careers"] },
  { group: "My Requests", icon: "send-plane-line", items: ["Leave", "Profile Changes"] },
];
const NAV = {
  employee: PERSONAL_GROUPS,
  manager: [
    { group: "My Team", icon: "team-line", items: ["Snapshot", "Team Roster", "Approvals", "Appraisals", "L&D Inbox"], isNew: true },
    ...PERSONAL_GROUPS,
  ],
};
// items that are brand-new in this proposal (get a NEW dot)
const NEW_ITEMS = new Set(["Request Training", "Snapshot", "Team Roster", "Approvals", "L&D Inbox"]);

function Toast({ toasts }) {
  return (
    <div style={{ position: "fixed", left: "50%", bottom: 24, transform: "translateX(-50%)", zIndex: 1500, display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
      {toasts.map(t => (
        <div key={t.id} className={"toast " + (t.tone === "error" ? "toast-error" : "toast-success")} style={{ padding: "10px 14px", fontSize: 13.5 }}>
          <Icon name={t.tone === "error" ? "close-circle-line" : "checkbox-circle-line"} size={17} />{t.msg}
        </div>
      ))}
    </div>
  );
}

function Sidebar({ role, nav, group, page, onPick }) {
  return (
    <div style={{ width: 256, flexShrink: 0, background: "#fff", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", height: "100%", overflowY: "auto" }}>
      <div style={{ padding: "18px 18px 12px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
          <span style={{ width: 30, height: 30, borderRadius: 8, background: "var(--brand-yellow)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Icon name="bank-line" size={18} color="var(--brand-ink)" /></span>
          <span style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 16, color: "var(--gray-900)" }}>BISTA HR</span>
        </div>
      </div>
      <nav style={{ padding: "4px 12px 16px", display: "flex", flexDirection: "column", gap: 2 }}>
        {nav.map(g => {
          const activeGroup = g.group === group;
          return (
            <div key={g.group} style={{ marginBottom: 4 }}>
              <button onClick={() => onPick(g.group, g.items[0])} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 9, border: 0, cursor: "pointer",
                background: activeGroup ? "var(--brand-yellow-tint)" : "transparent", textAlign: "left" }}>
                <Icon name={g.icon} size={19} color={activeGroup ? "var(--brand-yellow-dark)" : "var(--gray-500)"} />
                <span style={{ flex: 1, fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 13.5, color: activeGroup ? "var(--gray-900)" : "var(--gray-700)" }}>{g.group}</span>
                {g.isNew && <span style={{ fontFamily: "var(--font-control)", fontWeight: 700, fontSize: 9.5, letterSpacing: ".05em", color: "#fff", background: "#6941C6", borderRadius: 999, padding: "2px 6px" }}>NEW</span>}
              </button>
              {activeGroup && (
                <div style={{ display: "flex", flexDirection: "column", gap: 1, margin: "2px 0 2px 30px", paddingLeft: 10, borderLeft: "1.5px solid var(--gray-150)" }}>
                  {g.items.map(it => {
                    const on = it === page;
                    return (
                      <button key={it} onClick={() => onPick(g.group, it)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 8px", borderRadius: 7, border: 0, cursor: "pointer",
                        background: on ? "var(--gray-50)" : "transparent", textAlign: "left",
                        fontFamily: "var(--font-ui)", fontWeight: on ? 600 : 500, fontSize: 13, color: on ? "var(--gray-900)" : "var(--gray-500)" }}>
                        {it}
                        {NEW_ITEMS.has(it) && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6941C6", marginLeft: "auto" }} title="New in this proposal" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      <div style={{ marginTop: "auto", padding: 16 }}>
        <div style={{ borderRadius: 12, background: "var(--gray-50)", border: "1px solid var(--border)", padding: "12px 14px" }}>
          <div className="bh-caption" style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6941C6" }} /> Purple = new in this revamp</div>
        </div>
      </div>
    </div>
  );
}

function TopBar({ role, onRole, user }) {
  return (
    <div style={{ height: 60, flexShrink: 0, background: "#fff", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 16, padding: "0 24px" }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "var(--font-control)", fontWeight: 700, fontSize: 11, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--brand-blue)", background: "#EFF4FF", border: "1px solid #D6E0FF", borderRadius: 999, padding: "5px 11px" }}>
        <Icon name="flask-line" size={14} /> Flow Revamp · Proposal
      </span>
      <div style={{ flex: 1 }} />
      {/* role switch */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span className="bh-caption">Viewing as</span>
        <div className="seg" style={{ background: "var(--gray-50)" }}>
          {[["employee", "Employee"], ["manager", "Line Manager"]].map(([k, label]) => (
            <button key={k} className={role === k ? "active" : ""} onClick={() => onRole(k)} style={{ padding: "7px 16px" }}>{label}</button>
          ))}
        </div>
      </div>
      <div style={{ width: 1, height: 28, background: "var(--border)" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Avatar name={user.name} size={34} />
        <div style={{ lineHeight: 1.2 }}>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 13.5, color: "var(--gray-900)" }}>{user.name}</div>
          <div className="bh-caption">{user.title}</div>
        </div>
      </div>
    </div>
  );
}

function IntroBanner({ role, onClose }) {
  return (
    <div style={{ margin: "20px 24px 0", borderRadius: 14, background: "linear-gradient(110deg, #F4F0FF, #fff 65%)", border: "1px solid #E4D8FF", padding: "16px 18px", display: "flex", alignItems: "flex-start", gap: 14 }}>
      <span style={{ width: 40, height: 40, borderRadius: 10, background: "#6941C6", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name="route-line" size={20} color="#fff" /></span>
      <div style={{ flex: 1 }}>
        <div className="bh-h4" style={{ fontSize: 15.5 }}>This is a proposed revamp — completing the totality of the flow</div>
        <div className="bh-body" style={{ marginTop: 3, maxWidth: "72ch" }}>
          Two gaps are closed and the overloaded tab bar is regrouped. <strong>Employees</strong> can now request training (→ manager → L&D). <strong>Line managers</strong> get a real <strong>My Team</strong> home. Use “Viewing as” above to switch roles{role === "employee" ? " — switch to Line Manager to approve a request." : " — approve a request and watch it land in the L&D inbox."}
        </div>
      </div>
      <button onClick={onClose} style={{ border: 0, background: "none", cursor: "pointer", display: "flex" }}><Icon name="close-line" size={20} color="var(--gray-400)" /></button>
    </div>
  );
}

function App() {
  const [role, setRole] = useApp("employee");
  const [intro, setIntro] = useApp(true);
  const [nav, setNav] = useApp({ group: "Home", page: "Overview" });
  const [toasts, setToasts] = useApp([]);
  const [devRequests, setDevRequests] = useApp(DEV_REQUESTS_SEED.slice());
  const seq = React.useRef(900);

  const pushToast = (msg, tone) => {
    const id = ++seq.current;
    setToasts(t => [...t, { id, msg, tone }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2800);
  };

  const switchRole = (r) => {
    setRole(r);
    const first = NAV[r][0];
    setNav({ group: first.group, page: first.items[0] });
  };
  const go = (group, page) => setNav({ group, page });

  const submitDevRequest = (payload) => {
    setDevRequests(rs => [{
      id: devReqId(), employee: ME.name, employeeId: ME.id, manager: ME.manager,
      program: payload.program, category: payload.category, method: payload.method, priority: payload.priority,
      need: payload.need, goal: payload.goal, date: "Today", status: "Pending Manager",
    }, ...rs]);
  };
  const actionDevRequest = (id, action, reason) => {
    setDevRequests(rs => rs.map(r => r.id === id
      ? (action === "approve"
          ? { ...r, status: "Approved", ldStatus: "In Needs Assessment" }
          : { ...r, status: "Declined", reason })
      : r));
  };

  const navModel = NAV[role];
  const user = role === "manager" ? MGR : ME;
  const isTeam = nav.group === "My Team";

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "var(--bg-canvas)" }}>
      <TopBar role={role} onRole={switchRole} user={user} />
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        <Sidebar role={role} nav={navModel} group={nav.group} page={nav.page} onPick={go} />
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflowY: "auto" }}>
          {intro && <IntroBanner role={role} onClose={() => setIntro(false)} />}
          <div className="bh-main" style={{ flex: 1, minHeight: 0, padding: "20px 24px 64px" }}>
            {isTeam
              ? <TeamArea page={nav.page} go={go} devRequests={devRequests} onActionDevRequest={actionDevRequest} onToast={pushToast} />
              : <EmployeeArea group={nav.group} page={nav.page} go={go} devRequests={devRequests} onSubmitDevRequest={submitDevRequest} onToast={pushToast} />}
          </div>
        </div>
      </div>
      <Toast toasts={toasts} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
