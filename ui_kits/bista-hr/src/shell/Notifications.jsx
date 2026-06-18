// BISTA HR · shell/Notifications — full-page notifications inbox (two-pane master-detail).
// Mirrors the attached "Inbox" reference: a left rail (soft gradient header + tabs + list) and a
// right reading pane (the selected notification, or an empty state). Notifications are derived LIVE
// from the shared window.HRStores — L&D program invitations and course assignments for the signed-in
// user — plus a few standard HR notices, so it stays consistent with the single source of truth.
// Responsive: ≥1000px container shows both panes; narrower shows list, then the reading pane on select.
const { useState: useNt } = React;

function buildNotifications() {
  const S = window.HRStores || {}; const me = window.LD_ME;
  const get = (k) => (S[k] && S[k].get && S[k].get()) || [];
  const out = [];
  get("ldEnrollments").filter(e => e.learner === me && e.status === "Invited").forEach(e => {
    const p = get("ldPrograms").find(x => x.id === e.programId) || {};
    out.push({ id: "inv" + e.id, cat: "Learning", icon: "calendar-event-line", tint: "#F4F7FF", color: "var(--brand-blue)",
      title: "Program invitation", from: "Learning & Development", time: "Just now", unread: true,
      body: `You've been invited to ${p.title}. Please confirm your attendance — or decline with a reason — in My Learning. ${p.startDate ? "Starts " + p.startDate + "." : ""}`,
      cta: { label: "Open My Learning", icon: "graduation-cap-line" } });
  });
  get("ldAssignments").filter(a => a.learner === me && a.status !== "Completed").forEach(a => {
    const c = get("ldCourses").find(x => x.id === a.courseId) || {};
    out.push({ id: "asg" + a.id, cat: "Learning", icon: "graduation-cap-line", tint: "var(--brand-yellow-tint)", color: "var(--brand-yellow-dark)",
      title: a.status === "Not Started" ? "New course assigned" : "Course in progress", from: "Learning & Development", time: "Today", unread: a.status === "Not Started",
      body: `"${c.title}" is in your classroom. ${a.due && a.due !== "—" ? "Complete it by " + a.due + "." : ""} You're ${a.progress || 0}% through.`,
      cta: { label: "Go to course", icon: "play-line" } });
  });
  // pre-course self-assessment pending (confirmed program, no L2 pre score yet)
  get("ldEnrollments").filter(e => e.learner === me && e.status === "Confirmed").forEach(e => {
    const ev = get("ldEvaluations").find(r => r.programId === e.programId && r.learner === me);
    if (ev && ev.l2Pre != null) return;
    const p = get("ldPrograms").find(x => x.id === e.programId) || {};
    out.push({ id: "l2" + e.id, cat: "Learning", icon: "scales-3-line", tint: "var(--brand-yellow-tint)", color: "var(--brand-yellow-dark)",
      title: "Pre-course self-assessment", from: "Learning & Development", time: "Today", unread: true,
      body: `Rate yourself before ${p.title} — the same questions repeat afterwards to evidence your learning (Level 2).`,
      cta: { label: "Start assessment", icon: "edit-line" } });
  });
  // programs I coordinate
  get("ldPrograms").filter(p => p.coordinator === me).forEach(p => {
    const att = get("ldEnrollments").filter(e => e.programId === p.id);
    const going = att.filter(e => e.status === "Confirmed" || e.status === "Attended").length;
    out.push({ id: "coord" + p.id, cat: "Events", icon: "user-star-line", tint: "var(--brand-yellow-tint)", color: "var(--brand-yellow-dark)",
      title: "You coordinate this event", from: "Learning & Development", time: "This week", unread: false,
      body: `You're the coordinator for ${p.title} (${p.startDate || "date TBC"} · ${p.venue || p.mode}). ${going} confirmed so far — manage attendance and the roster.`,
      cta: { label: "Manage event", icon: "user-follow-line" } });
  });
  out.push(
    { id: "leave1", cat: "Approvals", icon: "checkbox-circle-line", tint: "var(--success-tint)", color: "var(--success-deep)", title: "Leave request approved", from: "Line Manager", time: "2h ago", unread: false, body: "Your annual leave request (3 days) has been approved. The dates are now reflected on your leave calendar." },
    { id: "appr1", cat: "Approvals", icon: "user-follow-line", tint: "var(--brand-yellow-tint)", color: "var(--brand-yellow-dark)", title: "Action needed — appraisal sign-off", from: "Performance", time: "Yesterday", unread: true, body: "Your mid-year appraisal is ready for your acknowledgement. Review your ratings and sign off in Performance ▸ Appraisals." },
    { id: "pay1", cat: "Updates", icon: "bank-card-line", tint: "var(--gray-100)", color: "var(--gray-600)", title: "Payslip available", from: "Payroll", time: "Yesterday", unread: true, body: "Your June 2026 payslip is now available. Open Documents ▸ Pay Slips to download it." },
    { id: "ann1", cat: "Updates", icon: "notification-3-line", tint: "var(--brand-yellow-tint)", color: "var(--brand-yellow-dark)", title: "New announcement", from: "Internal Comms", time: "2d ago", unread: false, body: "A staff town hall has been scheduled for this Friday at 3:00 PM. See Announcements for the agenda and joining details." },
  );
  return out;
}

const NT_TABS = ["All", "Unread", "Learning", "Events", "Approvals"];
const NT_NO_USERS = "assets/illustrations/no-users.svg";
const NT_NO_MESSAGE = "assets/illustrations/no-message.svg";

function NotifRow({ n, active, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{ width: "100%", display: "flex", gap: 12, alignItems: "flex-start", padding: "14px 18px", border: 0, borderBottom: "1px solid var(--divider)",
      background: active ? "var(--gray-50)" : "#fff", cursor: "pointer", textAlign: "left", transition: "background .12s" }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--gray-50)"; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = "#fff"; }}>
      <span style={{ position: "relative", flex: "none" }}>
        <span style={{ width: 40, height: 40, borderRadius: "50%", background: n.tint, display: "grid", placeItems: "center" }}><Icon name={n.icon} size={19} color={n.color} /></span>
        {n.unread && <span style={{ position: "absolute", top: 0, right: 0, width: 11, height: 11, borderRadius: "50%", background: "var(--brand-yellow-dark)", border: "2px solid #fff" }} />}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, marginBottom: 2 }}>
          <span style={{ fontFamily: "var(--font-ui)", fontWeight: n.unread ? 700 : 600, fontSize: 13.5, color: "var(--gray-900)", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.title}</span>
          <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--gray-400)", flex: "none" }}>{n.time}</span>
        </span>
        <span style={{ display: "block", fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--gray-500)", lineHeight: 1.45, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.body}</span>
        <span style={{ display: "block", fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--gray-400)", marginTop: 4 }}>{n.from}</span>
      </span>
    </button>
  );
}

function NotificationsPage({ onToast, onActiveChange }) {
  const [items, setItems] = useNt(() => buildNotifications());
  const [tab, setTab] = useNt("All");
  const [activeId, setActiveId] = useNt(null);

  React.useEffect(() => { onActiveChange && onActiveChange(activeId != null); }, [activeId]);
  React.useEffect(() => () => { onActiveChange && onActiveChange(false); }, []);

  const filtered = items.filter(n => tab === "All" ? true : tab === "Unread" ? n.unread : n.cat === tab);
  const active = items.find(n => n.id === activeId) || null;
  const unreadCount = items.filter(n => n.unread).length;
  const open = (n) => { setActiveId(n.id); setItems(list => list.map(x => x.id === n.id ? { ...x, unread: false } : x)); };
  const markAllRead = () => { setItems(list => list.map(x => ({ ...x, unread: false }))); onToast && onToast("All notifications marked read", { tone: "success" }); };

  return (
    <div style={{ height: "100%" }}>
      <div className="nt-shell" style={{ overflow: "hidden", display: "flex", height: "100%", background: "#fff" }}>
        {/* LEFT RAIL — solid header + tabs + list */}
        <div className="nt-rail">
          <div style={{ position: "relative", padding: "22px 22px", borderBottom: "1px solid var(--divider)", background: "var(--primary-50, #FFF9E0)", overflow: "hidden" }}>
            <svg viewBox="0 0 220 120" preserveAspectRatio="none" style={{ position: "absolute", top: 0, right: 0, width: 220, height: "100%", pointerEvents: "none" }}>
              <path d="M120 0 C150 30, 170 50, 230 40" fill="none" stroke="var(--primary)" strokeWidth="1.5" opacity="0.55" />
              <path d="M140 0 C170 34, 192 56, 250 48" fill="none" stroke="var(--primary)" strokeWidth="1.5" opacity="0.4" />
              <path d="M160 -6 C190 30, 214 54, 268 44" fill="none" stroke="var(--primary)" strokeWidth="1.5" opacity="0.28" />
            </svg>
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 22, color: "var(--gray-900)", letterSpacing: "-.01em" }}>Notifications</div>
              <div style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--gray-500)", marginTop: 3 }}>Approvals, learning and updates</div>
            </div>
          </div>
          <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--divider)", background: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1, minWidth: 0, overflowX: "auto" }}>
              <UI.Tabs value={tab} onValueChange={(t) => { setTab(t); setActiveId(null); }}>
                <UI.TabsList>
                  {NT_TABS.map(t => (
                    <UI.TabsTrigger key={t} value={t}>{t}{t === "Unread" && unreadCount > 0 ? ` (${unreadCount})` : ""}</UI.TabsTrigger>
                  ))}
                </UI.TabsList>
              </UI.Tabs>
            </div>
            <button type="button" onClick={markAllRead} title="Mark all read" style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: 8, border: "1px solid var(--border)", background: "#fff", cursor: "pointer", color: "var(--gray-500)" }}><Icon name="check-double-line" size={18} color="var(--gray-500)" /></button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", background: "#fff" }}>
            {filtered.length === 0
              ? <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "56px 24px", textAlign: "center" }}>
                  <img src={NT_NO_USERS} alt="" style={{ width: 92, height: "auto", marginBottom: 16 }} />
                  <div style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--gray-400)", maxWidth: 200, lineHeight: 1.5 }}>No notifications in this view</div>
                </div>
              : filtered.map(n => <NotifRow key={n.id} n={n} active={n.id === activeId} onClick={() => open(n)} />)}
          </div>
        </div>

        {/* RIGHT PANE — email-style reading view */}
        <div className={"nt-read" + (active ? " open" : "")}>
          {active ? (
            <React.Fragment>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 20px", borderBottom: "1px solid var(--divider)", background: "#fff", flex: "none" }}>
                <button type="button" onClick={() => setActiveId(null)} className="nt-back" style={{ border: 0, background: "none", cursor: "pointer", display: "none", padding: 4 }}><Icon name="arrow-left-line" size={20} color="var(--gray-600)" /></button>
                <span className="bh-chip" style={{ color: active.color, background: active.tint }}>{active.cat}</span>
                <span style={{ flex: 1 }} />
                <button type="button" title="Archive" style={{ border: 0, background: "none", cursor: "pointer", padding: 6, borderRadius: 8 }}><Icon name="archive-line" size={18} color="var(--gray-400)" /></button>
              </div>
              <div style={{ flex: 1, overflowY: "auto" }}>
                <div style={{ padding: "24px 28px" }}>
                  <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 22, color: "var(--gray-900)", lineHeight: 1.3 }}>{active.title}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 18 }}>
                    <span style={{ width: 44, height: 44, borderRadius: "50%", background: active.tint, display: "grid", placeItems: "center", flex: "none" }}><Icon name={active.icon} size={21} color={active.color} /></span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 14, color: "var(--gray-900)" }}>{active.from}</div>
                      <div style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--gray-400)" }}>to me · {active.time}</div>
                    </div>
                  </div>
                  <div style={{ height: 1, background: "var(--divider)", margin: "22px 0" }} />
                  <div style={{ fontFamily: "var(--font-ui)", fontSize: 15, color: "var(--gray-700)", lineHeight: 1.75, maxWidth: 640 }}>{active.body}</div>
                  {active.cta && <div style={{ marginTop: 26 }}><Button variant="primary" icon={active.cta.icon} onClick={() => onToast && onToast(active.cta.label, {})}>{active.cta.label}</Button></div>}
                </div>
              </div>
            </React.Fragment>
          ) : (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, textAlign: "center", background: "#fff" }}>
              <img src={NT_NO_MESSAGE} alt="" style={{ width: 150, height: "auto", marginBottom: 24 }} />
              <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 18, color: "var(--gray-700)" }}>Select a notification</div>
              <div style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--gray-400)", marginTop: 6, lineHeight: 1.6, maxWidth: 320 }}>Choose an item from the list to read it here.</div>
            </div>
          )}
        </div>
      </div>
      <style>{`
        .nt-rail{ width:100%; display:flex; flex-direction:column; min-height:0; }
        .nt-read{ flex:1; min-width:0; display:flex; flex-direction:column; min-height:0; background:#fff; }
        @container (min-width:820px){ .nt-rail{ width:420px; flex:none; border-right:1px solid var(--divider); } }
        @container (max-width:819px){
          .nt-read{ position:fixed; inset:0; transform:translateX(100%); transition:transform .25s ease; z-index:300; }
          .nt-read.open{ transform:none; }
          .nt-shell:has(.nt-read.open) .nt-rail{ display:none; }
          .nt-read .nt-back{ display:flex !important; }
        }
      `}</style>
    </div>
  );
}

window.hrUnreadCount = () => buildNotifications().filter(n => n.unread).length;
Object.assign(window, { NotificationsPage });
