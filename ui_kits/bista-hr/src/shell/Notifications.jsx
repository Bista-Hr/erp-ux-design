// BISTA HR · shell/Notifications — full-page notifications inbox (two-pane master-detail).
// Left rail (header + tabs + list) and a right reading pane — the layout we're sticking to.
// Items follow the API's DashboardNotification field structure — { id, title, message,
// employeeName, createdAt } (lib/types/hr-types.ts) — no icon/category/CTA fields exist on the
// endpoint, so rows render title + message + employeeName + time only. `unread` is client-side
// read tracking. Sources: live HRStores (L&D invitations/assignments) mapped into the same shape.
// Responsive: ≥820px container shows both panes; narrower shows list, then the reading pane on select.
const { useState: useNt } = React;

function buildNotifications() {
  const S = window.HRStores || {}; const me = window.LD_ME;
  const get = (k) => (S[k] && S[k].get && S[k].get()) || [];
  const out = [];
  get("ldEnrollments").filter(e => e.learner === me && e.status === "Invited").forEach(e => {
    const p = get("ldPrograms").find(x => x.id === e.programId) || {};
    out.push({ id: "inv" + e.id, title: "Program invitation", employeeName: "Learning & Development", createdAt: "Just now", unread: true,
      message: `You've been invited to ${p.title}. Please confirm your attendance — or decline with a reason — in My Learning. ${p.startDate ? "Starts " + p.startDate + "." : ""}` });
  });
  get("ldAssignments").filter(a => a.learner === me && a.status !== "Completed").forEach(a => {
    const c = get("ldCourses").find(x => x.id === a.courseId) || {};
    out.push({ id: "asg" + a.id, title: a.status === "Not Started" ? "New course assigned" : "Course in progress", employeeName: "Learning & Development", createdAt: "Today", unread: a.status === "Not Started",
      message: `"${c.title}" is in your classroom. ${a.due && a.due !== "—" ? "Complete it by " + a.due + "." : ""} You're ${a.progress || 0}% through.` });
  });
  get("ldEnrollments").filter(e => e.learner === me && e.status === "Confirmed").forEach(e => {
    const ev = get("ldEvaluations").find(r => r.programId === e.programId && r.learner === me);
    if (ev && ev.l2Pre != null) return;
    const p = get("ldPrograms").find(x => x.id === e.programId) || {};
    out.push({ id: "l2" + e.id, title: "Pre-course self-assessment", employeeName: "Learning & Development", createdAt: "Today", unread: true,
      message: `Rate yourself before ${p.title} — the same questions repeat afterwards to evidence your learning (Level 2).` });
  });
  get("ldPrograms").filter(p => p.coordinator === me).forEach(p => {
    const att = get("ldEnrollments").filter(e => e.programId === p.id);
    const going = att.filter(e => e.status === "Confirmed" || e.status === "Attended").length;
    out.push({ id: "coord" + p.id, title: "You coordinate this event", employeeName: "Learning & Development", createdAt: "This week", unread: false,
      message: `You're the coordinator for ${p.title} (${p.startDate || "date TBC"} · ${p.venue || p.mode}). ${going} confirmed so far — manage attendance and the roster.` });
  });
  out.push(
    { id: "leave1", title: "Leave request approved", employeeName: "Line Manager", createdAt: "2h ago", unread: false, message: "Your annual leave request (3 days) has been approved. The dates are now reflected on your leave calendar." },
    { id: "appr1", title: "Action needed — appraisal sign-off", employeeName: "Performance", createdAt: "Yesterday", unread: true, message: "Your mid-year appraisal is ready for your acknowledgement. Review your ratings and sign off in Performance ▸ Appraisals." },
    { id: "pay1", title: "Payslip available", employeeName: "Payroll", createdAt: "Yesterday", unread: true, message: "Your June 2026 payslip is now available. Open Documents ▸ Pay Slips to download it." },
    { id: "ann1", title: "New announcement", employeeName: "Internal Comms", createdAt: "2d ago", unread: false, message: "A staff town hall has been scheduled for this Friday at 3:00 PM. See Announcements for the agenda and joining details." },
  );
  return out;
}

const NT_TABS = ["All", "Unread"];
const NT_NO_MESSAGE = "assets/illustrations/no-message.svg";

function NotifRow({ n, active, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{ width: "100%", display: "flex", gap: 12, alignItems: "flex-start", padding: "14px 18px", border: 0, borderBottom: "1px solid var(--divider)",
      background: active ? "var(--gray-50)" : "#fff", cursor: "pointer", textAlign: "left", transition: "background .12s" }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--gray-50)"; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = "#fff"; }}>
      <span style={{ flex: "none", width: 8, display: "flex", justifyContent: "center", paddingTop: 6 }}>
        {n.unread && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--brand-yellow-dark)" }} />}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, marginBottom: 2 }}>
          <span style={{ fontFamily: "var(--font-ui)", fontWeight: n.unread ? 400 : 500, fontSize: 13.5, color: "var(--gray-900)", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.title}</span>
          <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--gray-400)", flex: "none" }}>{n.createdAt}</span>
        </span>
        <span style={{ display: "block", fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--gray-500)", lineHeight: 1.45, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.message}</span>
        <span style={{ display: "block", fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--gray-400)", marginTop: 4 }}>{n.employeeName}</span>
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

  const filtered = items.filter(n => tab === "All" ? true : n.unread);
  const active = items.find(n => n.id === activeId) || null;
  const unreadCount = items.filter(n => n.unread).length;
  const open = (n) => { setActiveId(n.id); setItems(list => list.map(x => x.id === n.id ? { ...x, unread: false } : x)); };
  const PAGE_SIZE = 8;
  const [page, setPage] = useNt(1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const shown = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div style={{ height: "100%" }}>
      <div className="nt-shell" style={{ overflow: "hidden", display: "flex", height: "100%", background: "#fff" }}>
        {/* LEFT RAIL — solid header + tabs + list */}
        <div className="nt-rail">
          <div style={{ padding: "20px 20px", borderBottom: "1px solid var(--divider)", background: "var(--primary-50, #FFF9E0)" }}>
            <div style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 20, color: "var(--gray-900)", letterSpacing: "-.01em" }}>Notifications</div>
            <div style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--gray-500)", marginTop: 2 }}>Notifications addressed to you for this organisation</div>
          </div>
          <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--divider)", background: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1, minWidth: 0, overflowX: "auto" }}>
              <UI.Tabs value={tab} onValueChange={(t) => { setTab(t); setActiveId(null); setPage(1); }}>
                <UI.TabsList>
                  {NT_TABS.map(t => (
                    <UI.TabsTrigger key={t} value={t}>{t}{t === "Unread" && unreadCount > 0 ? ` (${unreadCount})` : ""}</UI.TabsTrigger>
                  ))}
                </UI.TabsList>
              </UI.Tabs>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", background: "#fff" }}>
            {shown.length === 0
              ? <div style={{ padding: "56px 24px", textAlign: "center", fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--gray-400)" }}>No notifications in this view.</div>
              : shown.map(n => <NotifRow key={n.id} n={n} active={n.id === activeId} onClick={() => open(n)} />)}
          </div>
          {totalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--divider)", background: "#fff", padding: "6px 12px", flex: "none" }}>
              <button type="button" disabled={safePage <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} style={{ display: "inline-flex", alignItems: "center", gap: 4, border: 0, background: "none", borderRadius: 8, padding: "6px 10px", cursor: safePage <= 1 ? "default" : "pointer", opacity: safePage <= 1 ? 0.45 : 1, fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 500, color: "var(--gray-700)" }}><Icon name="arrow-left-s-line" size={16} color="var(--gray-700)" />Prev</button>
              <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-400)" }}>Page {safePage} of {totalPages}</span>
              <button type="button" disabled={safePage >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} style={{ display: "inline-flex", alignItems: "center", gap: 4, border: 0, background: "none", borderRadius: 8, padding: "6px 10px", cursor: safePage >= totalPages ? "default" : "pointer", opacity: safePage >= totalPages ? 0.45 : 1, fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 500, color: "var(--gray-700)" }}>Next<Icon name="arrow-right-s-line" size={16} color="var(--gray-700)" /></button>
            </div>
          )}
        </div>

        {/* RIGHT PANE — reading view */}
        <div className={"nt-read" + (active ? " open" : "")}>
          {active ? (
            <React.Fragment>
              <div className="nt-backbar" style={{ display: "none", alignItems: "center", gap: 8, padding: "10px 16px", borderBottom: "1px solid var(--divider)", background: "#fff", flex: "none" }}>
                <button type="button" onClick={() => setActiveId(null)} aria-label="Back to list" style={{ border: 0, background: "none", cursor: "pointer", padding: 6, borderRadius: 8, display: "inline-flex" }}><Icon name="arrow-left-line" size={20} color="var(--gray-600)" /></button>
                <span style={{ fontFamily: "var(--font-ui)", fontSize: 13.5, fontWeight: 500, color: "var(--gray-700)" }}>Back</span>
              </div>
              <div style={{ flex: 1, overflowY: "auto" }}>
                <div style={{ padding: "24px 28px" }}>
                  <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 20, color: "var(--gray-900)", lineHeight: 1.35 }}>{active.title}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 10 }}>
                    <span style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 14, color: "var(--gray-900)" }}>{active.employeeName}</span>
                    <span style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--gray-400)" }}>to me · {active.createdAt}</span>
                  </div>
                  <div style={{ height: 1, background: "var(--divider)", margin: "20px 0" }} />
                  <div style={{ fontFamily: "var(--font-ui)", fontSize: 15, color: "var(--gray-700)", lineHeight: 1.85, maxWidth: 672, whiteSpace: "pre-line" }}>{active.message}</div>
                </div>
              </div>
            </React.Fragment>
          ) : (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, textAlign: "center", background: "#fff" }}>
              <img src={NT_NO_MESSAGE} alt="" style={{ width: 80, height: "auto", marginBottom: 12 }} />
              <div style={{ fontFamily: "var(--font-head)", fontWeight: 500, fontSize: 18, color: "var(--gray-700)" }}>Select a notification</div>
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
          .nt-read .nt-backbar{ display:flex !important; }
        }
      `}</style>
    </div>
  );
}

window.hrUnreadCount = () => buildNotifications().filter(n => n.unread).length;
Object.assign(window, { NotificationsPage });
