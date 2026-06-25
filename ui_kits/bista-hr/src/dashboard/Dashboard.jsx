// BISTA HR · dashboard/Dashboard — the self-service area (sidebar "Dashboard").
// Routes the top tabs: Overview, My Info (reuses <EmployeeDetail> in self/"Request Update"
// mode + announcements rail), Requests (admin-style accept/reject of submitted requests),
// and light placeholders for the rest. ME is the signed-in user.
const ME = { id: "me", name: "James Brown", code: "EMP100", email: "jamesbrown@starret.com",
  role: "Accountant", dept: "Finance", branch: "Accra", dateEmployed: "25/09/2025", active: true };

function RequestsScreen({ requests, onResolve, title = "Requests", subtitle = "Review and action employee profile-update requests." }) {
  const pending = requests.filter(r => r.status === "pending").length;
  const pg = usePaged(requests);
  return (
    <div className="card" style={{ overflow: "visible", padding: "var(--card-pad, 24px)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
        <div>
          <div className="bh-h2" style={{ fontSize: 24 }}>{title}</div>
          <div className="bh-body" style={{ marginTop: 4 }}>{subtitle}</div>
        </div>
        {pending > 0 && <StatusBadge variant="pending" text={`${pending} Pending`} />}
      </div>

      <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
        {requests.length === 0
          ? <EmptyState compact title="No requests yet" subtitle="Update requests submitted from My Info will appear here for review." />
          : <table className="bh">
              <thead><tr>
                <th>Requested By</th><th>Type</th><th>Section</th><th>Date</th><th>Status</th><th style={{ width: 170 }}></th>
              </tr></thead>
              <tbody>
                {pg.pageItems.map(r => (
                  <tr key={r.id}>
                    <td><span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}><Avatar name={r.employee} />{r.employee}</span></td>
                    <td>{r.type}</td>
                    <td>{r.section}</td>
                    <td>{r.date}</td>
                    <td><StatusBadge variant={r.status} text={r.status === "pending" ? "Pending" : r.status === "approved" ? "Approved" : "Rejected"} size="sm" /></td>
                    <td style={{ textAlign: "right" }}>
                      {r.status === "pending"
                        ? <span style={{ display: "inline-flex", gap: 8, justifyContent: "flex-end" }}>
                            <Button variant="stroke" size="sm" icon="close-line" onClick={() => onResolve(r.id, "rejected")}>Reject</Button>
                            <Button variant="primary" size="sm" icon="check-line" onClick={() => onResolve(r.id, "approved")}>Accept</Button>
                          </span>
                        : <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--gray-400)" }}>{r.status === "approved" ? "Accepted" : "Rejected"}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>}
      </div>
      {requests.length > 0 && <Pagination page={pg.page} pages={pg.pages} onPrev={pg.prev} onNext={pg.next} />}
    </div>
  );
}

function DashboardPlaceholder({ title }) {
  return (
    <div className="card" style={{ padding: 8 }}>
      <EmptyState title={`${title}`} subtitle="This area is part of the self-service dashboard and is coming soon." />
    </div>
  );
}

// Careers — internal opportunities the employee can browse + apply to (reads open Job Posts).
function CareersScreen({ onToast }) {
  const posts = (window.SEED && window.SEED["Job Posts"] || []).filter(p => String(p.status).toLowerCase() === "open");
  const [applied, setApplied] = React.useState({});
  const apply = (p) => { setApplied(a => ({ ...a, [p.id]: true })); onToast && onToast("Application Submitted", { tone: "success" }); };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: "var(--card-pad, 24px)", display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: "var(--brand-yellow-tint)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name="briefcase-4-line" size={26} color="var(--brand-yellow-dark)" />
        </div>
        <div style={{ flex: 1 }}>
          <div className="bh-h2" style={{ fontSize: 22 }}>Careers</div>
          <div className="bh-body" style={{ marginTop: 2 }}>Explore open roles across the organization and apply for internal opportunities.</div>
        </div>
        <span className="bh-chip">{posts.length} open roles</span>
      </div>
      {posts.length === 0
        ? <div className="card" style={{ padding: 8 }}><EmptyState variant="job" title="No open roles" subtitle="There are no open positions to apply for right now." /></div>
        : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
            {posts.map(p => {
              const isApplied = applied[p.id];
              return (
                <div key={p.id} className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                    <div>
                      <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 16, color: "var(--gray-900)" }}>{p.title}</div>
                      <div className="bh-caption" style={{ marginTop: 2 }}>{p.department}</div>
                    </div>
                    <StatusBadge variant="open" text="Open" size="sm" />
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    <span className="bh-chip"><Icon name="map-pin-line" size={13} color="var(--gray-500)" style={{ marginRight: 5 }} />{p.location}</span>
                    <span className="bh-chip"><Icon name="calendar-line" size={13} color="var(--gray-500)" style={{ marginRight: 5 }} />Closes {p.closing}</span>
                    <span className="bh-chip"><Icon name="group-line" size={13} color="var(--gray-500)" style={{ marginRight: 5 }} />{p.applicants} applied</span>
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 2 }}>
                    <Button variant="stroke" size="sm" icon="eye-line" onClick={() => onToast && onToast("Opening role details", {})}>View</Button>
                    <Button variant="primary" size="sm" icon={isApplied ? "check-line" : "send-plane-line"} disabled={isApplied} onClick={() => apply(p)}>{isApplied ? "Applied" : "Apply"}</Button>
                  </div>
                </div>
              );
            })}
          </div>}
    </div>
  );
}

function DashboardArea({ tab, requests, onAddRequest, onResolve, onToast, announce, onViewAnnouncements, onOpenAnnouncement, onCloseAnnouncements, onSubPage }) {
  // Announcements full-page / detail (reached from any rail's View All / Read More).
  if (announce) {
    return (
      <div style={{ height: "100%", overflowY: "auto", padding: 32, boxSizing: "border-box" }}>
        {announce.view === "detail"
          ? <AnnouncementDetail a={announce.a} onBack={onViewAnnouncements} />
          : <AnnouncementsPage onBack={onCloseAnnouncements} onOpen={onOpenAnnouncement} />}
      </div>
    );
  }
  if (tab === "Overview") return <Overview onViewAnnouncements={onViewAnnouncements} onOpenAnnouncement={onOpenAnnouncement} />;
  if (tab === "My Info") {
    return (
      <div style={{ display: "flex", gap: 24, height: "100%", padding: "0 0 0 32px", boxSizing: "border-box" }}>
        <div style={{ flex: 1, minWidth: 0, height: "100%", overflowY: "auto", paddingRight: 4 }}>
          <div style={{ paddingTop: 24, paddingBottom: 72 }}>
            <EmployeeDetail employee={ME} mode="self" hideBreadcrumb onRequest={onAddRequest} onToast={onToast} />
          </div>
        </div>
        <AnnouncementsRail onViewAll={onViewAnnouncements} onOpen={onOpenAnnouncement} />
      </div>
    );
  }
  if (tab === "Requests") return <EmployeeRequests onToast={onToast} onSubPage={onSubPage} onViewAnnouncements={onViewAnnouncements} onOpenAnnouncement={onOpenAnnouncement} />;
  if (tab === "Leave Requests") return <LeaveRequests onToast={onToast} onViewAnnouncements={onViewAnnouncements} onOpenAnnouncement={onOpenAnnouncement} />;
  if (tab === "Target Requests") return <TargetRequests onToast={onToast} onViewAnnouncements={onViewAnnouncements} onOpenAnnouncement={onOpenAnnouncement} onSubPage={onSubPage} />;
  if (tab === "Appraisals") return <Appraisals onToast={onToast} onViewAnnouncements={onViewAnnouncements} onOpenAnnouncement={onOpenAnnouncement} onSubPage={onSubPage} />;
  if (tab === "My Learning") return <MyClassroom onToast={onToast} onSubPage={onSubPage} />;
  if (tab === "Careers") return <CareersFlow onToast={onToast} />;
  return <DashboardPlaceholder title={tab} />;
}

Object.assign(window, { DashboardArea, RequestsScreen, ME });
