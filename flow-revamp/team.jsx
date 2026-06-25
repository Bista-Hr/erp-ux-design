// FLOW REVAMP (standalone proposal) · team — the NEW Line-Manager "My Team" area.
// Snapshot · Team Roster (drill into a report) · Approvals (goals + training requests) ·
// Appraisals. This is where a training request gets approved and handed to L&D.
const { useState: useTeam } = React;

const scoreTone = (s) => s == null ? "neutral" : s >= 4 ? "approved" : s >= 3 ? "info" : "rejected";
const idpTone = { "On Track": "approved", "At Risk": "rejected", "Not Started": "neutral" };

/* ---------- snapshot ---------- */
function TeamSnapshot({ go }) {
  const n = TEAM.length;
  const scored = TEAM.filter(t => t.appraisal);
  const avg = (scored.reduce((s, t) => s + t.appraisal.score, 0) / scored.length).toFixed(1);
  const approved = TEAM.filter(t => t.goalStatus === "Approved").length;
  const atRisk = TEAM.filter(t => t.idp === "At Risk").length;
  const pendingGoals = TEAM.filter(t => t.goalStatus === "Submitted").length;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader icon="team-line" title="Team Snapshot" subtitle={`${MGR.title} · ${MGR.dept} · ${n} direct reports`} />
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <StatCard idx={0} icon="group-line" label="Direct reports" value={n} />
        <StatCard idx={1} icon="award-line" label="Avg. appraisal" value={avg} sub="of 5.0" />
        <StatCard idx={2} icon="checkbox-circle-line" label="Goals approved" value={`${approved}/${n}`} />
        <StatCard idx={3} icon="error-warning-line" label="IDPs at risk" value={atRisk} />
      </div>
      <div className="card" style={{ padding: 24, boxShadow: "var(--shadow-card)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div className="bh-h4" style={{ fontSize: 16 }}>Needs your attention</div>
          <Btn variant="stroke" size="sm" icon="arrow-right-line" iconRight onClick={() => go("My Team", "Approvals")}>Go to approvals</Btn>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))", gap: 12 }}>
          {[
            { i: "focus-3-line", n: pendingGoals, t: "goal submissions to approve", tint: "var(--warning-tint)", c: "var(--warning-deep)" },
            { i: "open-arm-line", n: 1, t: "training requests pending", tint: "#F4F0FF", c: "#6941C6" },
            { i: "award-line", n: 3, t: "appraisals to review", tint: "#EFF4FF", c: "var(--brand-blue)" },
          ].map(x => (
            <div key={x.t} style={{ display: "flex", alignItems: "center", gap: 12, border: "1px solid var(--border)", borderRadius: 12, padding: "14px 16px" }}>
              <span style={{ width: 40, height: 40, borderRadius: 10, background: x.tint, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name={x.i} size={20} color={x.c} /></span>
              <div><div style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 22, color: "var(--gray-900)" }}>{x.n}</div><div className="bh-caption">{x.t}</div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- roster + drill-in ---------- */
function TeamRoster({ onToast }) {
  const [open, setOpen] = useTeam(null);
  const [q, setQ] = useTeam("");
  const rows = TEAM.filter(t => `${t.name} ${t.title} ${t.code}`.toLowerCase().includes(q.toLowerCase()));
  if (open) return <MemberDetail member={open} onBack={() => setOpen(null)} onToast={onToast} />;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader icon="group-line" title="My Team" subtitle="Your direct reports. Open anyone to review goals, appraisal and development." />
      <TableBox toolbar={<Toolbar search={q} onSearch={setQ} placeholder="Search team…" />}>
        <table className="bh">
          <thead><tr><th>Employee</th><th>Goals</th><th>Appraisal</th><th>IDP</th><th style={{ width: 60 }}></th></tr></thead>
          <tbody>
            {rows.map(t => (
              <tr key={t.id} style={{ cursor: "pointer" }} onClick={() => setOpen(t)}>
                <td>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                    <Avatar name={t.name} size={32} />
                    <span style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontWeight: 500, color: "var(--gray-900)" }}>{t.name}</span>
                      <span style={{ fontSize: 12, color: "var(--gray-400)" }}>{t.title} · {t.code}</span>
                    </span>
                  </span>
                </td>
                <td><Badge variant={t.goalStatus === "Approved" ? "approved" : t.goalStatus === "Submitted" ? "pending" : "neutral"} size="sm">{t.goalStatus}</Badge></td>
                <td>{t.appraisal ? <Badge variant={scoreTone(t.appraisal.score)} size="sm">{t.appraisal.score.toFixed(1)} · {t.appraisal.status}</Badge> : <span style={{ color: "var(--gray-400)" }}>—</span>}</td>
                <td><Badge variant={idpTone[t.idp]} size="sm">{t.idp}</Badge></td>
                <td style={{ textAlign: "right" }}><Icon name="arrow-right-s-line" size={20} color="var(--gray-400)" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableBox>
    </div>
  );
}

function MemberDetail({ member, onBack, onToast }) {
  const [goalsApproved, setGoalsApproved] = useTeam(member.goalStatus === "Approved");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <button onClick={onBack} style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 6, border: 0, background: "none", cursor: "pointer", fontFamily: "var(--font-control)", fontWeight: 600, fontSize: 13.5, color: "var(--gray-500)" }}>
        <Icon name="arrow-left-line" size={17} /> My Team
      </button>
      <PageHeader icon="user-3-line" title={member.name} subtitle={`${member.title} · ${member.dept} · ${member.code}`}
        actions={member.appraisal && <Badge variant={scoreTone(member.appraisal.score)}>Appraisal {member.appraisal.score.toFixed(1)} / 5</Badge>} />

      {/* goals + approval */}
      <div className="card" style={{ padding: 20, boxShadow: "var(--shadow-card)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div className="bh-h4" style={{ fontSize: 15.5 }}>Goals <span style={{ color: "var(--gray-400)", fontWeight: 500 }}>· {member.goalsWeight}% weighted</span></div>
          {goalsApproved
            ? <Badge variant="approved">Approved</Badge>
            : member.goalStatus === "Submitted"
              ? <Btn variant="primary" size="sm" icon="check-line" onClick={() => { setGoalsApproved(true); onToast(`${member.name.split(" ")[0]}'s goals approved`); }}>Approve Goals</Btn>
              : <Badge variant="neutral">Draft — not submitted</Badge>}
        </div>
        <div className="bh-tablebox">
          {member.id === "emp-ama"
            ? <table className="bh">
                <thead><tr><th>Goal</th><th>Perspective</th><th style={{ width: 80 }}>Weight</th><th style={{ width: 150 }}>Progress</th></tr></thead>
                <tbody>{ME_GOALS.map(g => (
                  <tr key={g.id}><td style={{ fontWeight: 500 }}>{g.title}</td><td><Badge variant="neutral" size="sm">{g.perspective}</Badge></td><td>{g.weight}%</td>
                    <td><div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ flex: 1, height: 6, borderRadius: 999, background: "var(--gray-150)", overflow: "hidden" }}><div style={{ width: g.progress + "%", height: "100%", background: "var(--success)" }} /></div><span style={{ fontSize: 12, color: "var(--gray-500)" }}>{g.progress}%</span></div></td></tr>
                ))}</tbody>
              </table>
            : <EmptyState compact icon="focus-3-line" title={member.goalStatus === "Draft" ? "Goals still in draft" : "Goals submitted"} subtitle={member.goalStatus === "Draft" ? "This report hasn't submitted goals for the cycle yet." : "Open to review each goal and weighting."} />}
        </div>
      </div>

      {/* IDP + appraisal mini-cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card" style={{ padding: 20, boxShadow: "var(--shadow-card)", display: "flex", alignItems: "center", gap: 16 }}>
          <Ring value={member.idpPct} color={member.idp === "At Risk" ? "var(--error)" : "var(--success)"} />
          <div><div className="bh-caption">Development plan (IDP)</div><div className="bh-h4" style={{ fontSize: 16, marginTop: 2 }}>{member.idp}</div><div className="bh-caption" style={{ marginTop: 1 }}>{member.idpPct}% complete</div></div>
        </div>
        <div className="card" style={{ padding: 20, boxShadow: "var(--shadow-card)", display: "flex", flexDirection: "column", gap: 10, justifyContent: "center" }}>
          <div className="bh-caption">Latest appraisal</div>
          {member.appraisal
            ? <React.Fragment><div className="bh-h2" style={{ fontSize: 26 }}>{member.appraisal.score.toFixed(1)} <span style={{ fontSize: 15, color: "var(--gray-400)" }}>/ 5</span></div><div><Badge variant={member.appraisal.status === "Completed" ? "approved" : "pending"} size="sm">{member.appraisal.status}</Badge></div></React.Fragment>
            : <div className="bh-body">No appraisal this cycle yet.</div>}
        </div>
      </div>
    </div>
  );
}

/* ---------- approvals (goals + training requests) ---------- */
function TeamApprovals({ devRequests, onActionDevRequest, onToast }) {
  const pendingTraining = devRequests.filter(r => r.status === "Pending Manager");
  const submittedGoals = TEAM.filter(t => t.goalStatus === "Submitted");
  const [goalsDone, setGoalsDone] = useTeam({});
  const [declineFor, setDeclineFor] = useTeam(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader icon="checkbox-multiple-line" title="Team Approvals" subtitle="Approve goal submissions and training requests from your reports." />

      {/* training requests — the new cross-role handoff */}
      <div className="card" style={{ padding: 20, boxShadow: "var(--shadow-card)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Icon name="open-arm-line" size={18} color="#6941C6" />
          <div className="bh-h4" style={{ fontSize: 15.5 }}>Training requests</div>
          <Badge variant="ld" size="sm">{pendingTraining.length} pending</Badge>
          <span className="bh-caption" style={{ marginLeft: "auto" }}>Approved requests flow into L&D's Needs Assessment</span>
        </div>
        <div className="bh-tablebox">
          {pendingTraining.length === 0
            ? <EmptyState compact icon="checkbox-circle-line" title="All caught up" subtitle="No training requests are awaiting your approval." />
            : <table className="bh">
                <thead><tr><th>Employee</th><th>Program</th><th>Need</th><th>Priority</th><th style={{ width: 200 }}></th></tr></thead>
                <tbody>{pendingTraining.map(r => (
                  <tr key={r.id}>
                    <td><span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}><Avatar name={r.employee} size={30} /><span style={{ fontWeight: 500 }}>{r.employee}</span></span></td>
                    <td style={{ fontWeight: 500, color: "var(--gray-900)" }}>{r.program}<div style={{ fontSize: 12, color: "var(--gray-400)" }}>{r.category}</div></td>
                    <td style={{ maxWidth: 240, whiteSpace: "normal", color: "var(--gray-500)", fontSize: 13 }}>{r.need}</td>
                    <td><Badge variant={r.priority === "High" ? "rejected" : r.priority === "Medium" ? "pending" : "neutral"} size="sm">{r.priority}</Badge></td>
                    <td style={{ textAlign: "right" }}>
                      <span style={{ display: "inline-flex", gap: 8, justifyContent: "flex-end" }}>
                        <Btn variant="stroke" size="sm" icon="close-line" danger onClick={() => setDeclineFor(r)}>Decline</Btn>
                        <Btn variant="primary" size="sm" icon="check-line" onClick={() => { onActionDevRequest(r.id, "approve"); onToast(`Approved · sent to L&D Needs Assessment`); }}>Approve</Btn>
                      </span>
                    </td>
                  </tr>
                ))}</tbody>
              </table>}
        </div>
      </div>

      {/* goal submissions */}
      <div className="card" style={{ padding: 20, boxShadow: "var(--shadow-card)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Icon name="focus-3-line" size={18} color="var(--warning-deep)" />
          <div className="bh-h4" style={{ fontSize: 15.5 }}>Goal submissions</div>
          <Badge variant="pending" size="sm">{submittedGoals.filter(t => !goalsDone[t.id]).length} pending</Badge>
        </div>
        <div className="bh-tablebox">
          {submittedGoals.length === 0
            ? <EmptyState compact icon="checkbox-circle-line" title="No goals to approve" subtitle="Nobody has a goal set awaiting approval." />
            : <table className="bh">
                <thead><tr><th>Employee</th><th>Weight</th><th>Status</th><th style={{ width: 150 }}></th></tr></thead>
                <tbody>{submittedGoals.map(t => (
                  <tr key={t.id}>
                    <td><span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}><Avatar name={t.name} size={30} /><span style={{ fontWeight: 500 }}>{t.name}</span></span></td>
                    <td>{t.goalsWeight}%</td>
                    <td>{goalsDone[t.id] ? <Badge variant="approved" size="sm">Approved</Badge> : <Badge variant="pending" size="sm">Submitted</Badge>}</td>
                    <td style={{ textAlign: "right" }}>{goalsDone[t.id] ? <span style={{ color: "var(--gray-400)", fontSize: 13 }}>Done</span> : <Btn variant="primary" size="sm" icon="check-line" onClick={() => { setGoalsDone(g => ({ ...g, [t.id]: true })); onToast(`${t.name.split(" ")[0]}'s goals approved`); }}>Approve</Btn>}</td>
                  </tr>
                ))}</tbody>
              </table>}
        </div>
      </div>

      {declineFor && <DeclineModal req={declineFor} onClose={() => setDeclineFor(null)} onConfirm={(reason) => { onActionDevRequest(declineFor.id, "decline", reason); setDeclineFor(null); onToast("Training request declined", "error"); }} />}
    </div>
  );
}

function DeclineModal({ req, onClose, onConfirm }) {
  const [reason, setReason] = useTeam("");
  return (
    <Modal width={460} onClose={onClose}>
      <div style={{ padding: 22 }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
          <span style={{ width: 42, height: 42, borderRadius: 999, background: "var(--error-tint)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name="close-circle-line" size={22} color="var(--error)" /></span>
          <div><div className="bh-h4" style={{ fontSize: 16 }}>Decline training request</div><div className="bh-body" style={{ marginTop: 1 }}>{req.employee} · {req.program}</div></div>
        </div>
        <Field label="Reason for declining"><Textarea rows={3} value={reason} onChange={e => setReason(e.target.value)} placeholder="Let the requester know why…" /></Field>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 18 }}>
          <Btn variant="stroke" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" danger icon="close-line" disabled={!reason.trim()} onClick={() => onConfirm(reason.trim())}>Confirm Decline</Btn>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- team appraisals ---------- */
function TeamAppraisals({ onToast }) {
  const rows = TEAM.filter(t => t.appraisal);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader icon="award-line" title="Team Appraisals" subtitle="Review and sign off your reports' appraisals." />
      <TableBox toolbar={<Toolbar left={<span className="bh-caption">{rows.filter(r => r.appraisal.status !== "Completed").length} awaiting your review</span>} />}>
        <table className="bh">
          <thead><tr><th>Employee</th><th>Score</th><th>Status</th><th style={{ width: 150 }}></th></tr></thead>
          <tbody>{rows.map(t => (
            <tr key={t.id}>
              <td><span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}><Avatar name={t.name} size={30} /><span style={{ display: "flex", flexDirection: "column" }}><span style={{ fontWeight: 500 }}>{t.name}</span><span style={{ fontSize: 12, color: "var(--gray-400)" }}>{t.title}</span></span></span></td>
              <td><span style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 16 }}>{t.appraisal.score.toFixed(1)}</span> <span style={{ color: "var(--gray-400)", fontSize: 13 }}>/ 5</span></td>
              <td><Badge variant={t.appraisal.status === "Completed" ? "approved" : "pending"} size="sm">{t.appraisal.status}</Badge></td>
              <td style={{ textAlign: "right" }}>{t.appraisal.status === "Completed" ? <Btn variant="stroke" size="sm" icon="eye-line">View</Btn> : <Btn variant="primary" size="sm" icon="edit-2-line" onClick={() => onToast("Opening appraisal review")}>Review</Btn>}</td>
            </tr>
          ))}</tbody>
        </table>
      </TableBox>
    </div>
  );
}

/* ---------- manager L&D-handoff preview (shows the demand landing) ---------- */
function LdInboxPreview({ devRequests }) {
  const inLd = devRequests.filter(r => r.status === "Approved");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader icon="graduation-cap-line" title="L&D Needs Assessment — inbox (preview)" subtitle="How approved training requests surface to the L&D team as demand." />
      <div className="card" style={{ padding: 20, boxShadow: "var(--shadow-card)" }}>
        <div className="bh-tablebox">
          {inLd.length === 0
            ? <EmptyState compact icon="inbox-line" title="No demand yet" subtitle="Approve a training request to see it land here as an L&D need." />
            : <table className="bh">
                <thead><tr><th>Requester</th><th>Program</th><th>Category</th><th>Priority</th><th>Source</th></tr></thead>
                <tbody>{inLd.map(r => (
                  <tr key={r.id}>
                    <td><span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}><Avatar name={r.employee} size={30} /><span style={{ fontWeight: 500 }}>{r.employee}</span></span></td>
                    <td style={{ fontWeight: 500, color: "var(--gray-900)" }}>{r.program}</td>
                    <td>{r.category}</td>
                    <td><Badge variant={r.priority === "High" ? "rejected" : r.priority === "Medium" ? "pending" : "neutral"} size="sm">{r.priority}</Badge></td>
                    <td><Badge variant="ld" size="sm">Tier 3 · Individual (IDP)</Badge></td>
                  </tr>
                ))}</tbody>
              </table>}
        </div>
      </div>
    </div>
  );
}

/* ---------- team router ---------- */
function TeamArea({ page, go, devRequests, onActionDevRequest, onToast }) {
  switch (page) {
    case "Snapshot": return <TeamSnapshot go={go} />;
    case "Team Roster": return <TeamRoster onToast={onToast} />;
    case "Approvals": return <TeamApprovals devRequests={devRequests} onActionDevRequest={onActionDevRequest} onToast={onToast} />;
    case "Appraisals": return <TeamAppraisals onToast={onToast} />;
    case "L&D Inbox": return <LdInboxPreview devRequests={devRequests} />;
    default: return <EmptyState title={page} subtitle="Coming soon." />;
  }
}

Object.assign(window, { TeamArea });
