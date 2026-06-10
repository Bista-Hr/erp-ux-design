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
  return <DashboardPlaceholder title={tab} />;
}

Object.assign(window, { DashboardArea, RequestsScreen, ME });
