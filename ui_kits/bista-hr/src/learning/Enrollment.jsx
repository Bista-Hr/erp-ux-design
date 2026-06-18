// BISTA HR · learning/Enrollment — Learning & Development ▸ Enrollment.
//   records : every enrollment (program ↔ learner) with lifecycle status + admin actions
//   enroll  : pick a program → roster with CONFLICT CHECKS (on leave / already enrolled / busy),
//             bulk-select by dept/grade, then send invitations (auto "enrolled" notice).
//   waitlist auto-promotion: cancelling / declining a seat promotes the next waitlisted learner.
// All reads/writes go through the shared window.HRStores.ldEnrollments store.
const { useState: useEnr, useEffect: useEnrEffect } = React;

// deterministic "on leave" flag for the demo (a stable subset of the directory)
const ON_LEAVE = new Set(["Emmanuel Ansah", "Samuel Asante"]);

function EnrollmentRecords({ enrollments, programs, q, setQ, status, setStatus, prog, setProg, onEnroll, onAction }) {
  const progName = (id) => (programs.find(p => p.id === id) || {}).title || "—";
  const filtered = enrollments.filter(e =>
    (status.length === 0 || status.includes(e.status)) &&
    (prog === "All programs" || progName(e.programId) === prog) &&
    (q === "" || (e.learner + " " + progName(e.programId) + " " + e.staffId).toLowerCase().includes(q.toLowerCase())));
  const pg = usePaged(filtered, 9);
  const stats = [
    { title: "Total enrolled", value: enrollments.filter(e => e.status !== "Declined").length },
    { title: "Confirmed", value: enrollments.filter(e => e.status === "Confirmed").length },
    { title: "Awaiting ack.", value: enrollments.filter(e => e.status === "Invited").length },
    { title: "Waitlisted", value: enrollments.filter(e => e.status === "Waitlisted").length },
    { title: "Declined", value: enrollments.filter(e => e.status === "Declined").length },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title="Enrollment & Notifications" subtitle="Assign learners to programs, run conflict checks and track acknowledgements."
        actions={<Button variant="primary" icon="user-add-line" onClick={onEnroll}>Enroll Learners</Button>} />
      <div className="card cq-stats" style={{ padding: "var(--card-pad, 24px)" }}>
        <div className="cq-stat-grid">{stats.map((s, i) => <UI.StatCard key={s.title} title={s.title} value={s.value} index={i} />)}</div>
      </div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="rounded-md border m-6 overflow-hidden">
          <UI.FilterBar search={q} onSearch={setQ} searchPlaceholder="Search learners or programs…"
            filters={[
              { label: "Program", node: <Combobox value={prog} onChange={v => setProg(v || "All programs")} options={["All programs", ...programs.map(p => p.title)]} placeholder="All programs" /> },
              { label: "Status", node: <StatusFilter value={status} onChange={setStatus} options={LD_ENROLL_STATUS} /> },
            ]} onReset={() => { setProg("All programs"); setStatus([]); }} onApply={() => {}} />
          {filtered.length === 0
            ? <EmptyState title="No enrollments" subtitle="Enroll learners onto a program to populate this list." />
            : <table className="bh">
                <thead><tr><th>Learner</th><th>Program</th><th>Source</th><th>Invited</th><th>Status</th><th style={{ width: 48 }}></th></tr></thead>
                <tbody>
                  {pg.pageItems.map(e => {
                    const actions = [];
                    if (e.status === "Invited") { actions.push({ label: "Resend Invite", short: "Resend", icon: "mail-send-line", onClick: () => onAction("resend", e) }); actions.push({ label: "Mark Confirmed", short: "Confirm", icon: "check-line", onClick: () => onAction("confirm", e) }); actions.push({ label: "Cancel Enrollment", short: "Cancel", icon: "close-line", danger: true, onClick: () => onAction("cancel", e) }); }
                    else if (e.status === "Waitlisted") { actions.push({ label: "Promote to Invited", short: "Promote", icon: "arrow-up-line", onClick: () => onAction("promote", e) }); actions.push({ label: "Remove", icon: "close-line", danger: true, onClick: () => onAction("cancel", e) }); }
                    else if (e.status === "Confirmed") { actions.push({ label: "Mark Attended", short: "Attended", icon: "user-follow-line", onClick: () => onAction("attended", e) }); actions.push({ label: "Mark No-show", short: "No-show", icon: "user-unfollow-line", danger: true, onClick: () => onAction("noshow", e) }); }
                    else actions.push({ label: "View", icon: "eye-line", onClick: () => {} });
                    return (
                      <tr key={e.id}>
                        <td><span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}><Avatar name={e.learner} size={32} />
                          <span style={{ display: "flex", flexDirection: "column" }}><span style={{ fontWeight: 500, color: "var(--gray-900)" }}>{e.learner}</span><span style={{ fontSize: 12, color: "var(--gray-400)" }}>{e.staffId} · {e.dept}</span></span></span></td>
                        <td>{progName(e.programId)}</td>
                        <td>{e.source}</td>
                        <td>{e.invitedOn}</td>
                        <td>
                          <StatusBadge variant={LD_ENROLL_VARIANT[e.status]} text={e.status} size="sm" />
                          {e.status === "Declined" && e.declineReason && <div style={{ fontSize: 11.5, color: "var(--gray-400)", marginTop: 4, maxWidth: 220 }}>{e.declineReason}</div>}
                        </td>
                        <td style={{ textAlign: "right" }}><UI.RowActions actions={actions} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>}
          {filtered.length > 0 && <div style={{ borderTop: "1px solid var(--divider)" }}><Pagination page={pg.page} pages={pg.pages} onPrev={pg.prev} onNext={pg.next} /></div>}
        </div>
      </div>
    </div>
  );
}

/* ---------- ENROLL ROSTER (full page) ---------- */
function EnrollRoster({ programs, enrollments, initialProgramId, onCancel, onEnroll }) {
  const DIR = window.EMPLOYEE_DIRECTORY || {};
  const [programId, setProgramId] = useEnr(initialProgramId || (programs[0] || {}).id);
  const program = programs.find(p => p.id === programId) || {};
  const [q, setQ] = useEnr("");
  const [dept, setDept] = useEnr("All");
  const [grade, setGrade] = useEnr("All");
  const [sel, setSel] = useEnr([]);
  const [waitlist, setWaitlist] = useEnr(false);

  const enrolledNames = new Set(enrollments.filter(e => e.programId === programId && e.status !== "Declined").map(e => e.learner));
  // "busy" = confirmed/invited on a *different* program (overlapping schedule, simplified)
  const busyNames = new Set(enrollments.filter(e => e.programId !== programId && (e.status === "Confirmed" || e.status === "Invited")).map(e => e.learner));
  const depts = ["All", ...new Set(LD_LEARNERS.map(n => (DIR[n] || {}).dept).filter(Boolean))];
  const grades = ["All", ...new Set(LD_LEARNERS.map(n => (DIR[n] || {}).grade).filter(Boolean))];

  const conflictOf = (n) => {
    if (enrolledNames.has(n)) return { kind: "enrolled", label: "Already enrolled", color: "var(--brand-blue)", bg: "#F4F7FF" };
    if (ON_LEAVE.has(n)) return { kind: "leave", label: "On leave", color: "var(--error)", bg: "var(--error-tint)" };
    if (busyNames.has(n)) return { kind: "busy", label: "Busy — other program", color: "var(--warning-deep)", bg: "var(--warning-tint)" };
    return null;
  };
  const shown = LD_LEARNERS.filter(n => {
    const e = DIR[n] || {};
    if (dept !== "All" && e.dept !== dept) return false;
    if (grade !== "All" && e.grade !== grade) return false;
    if (q && !`${n} ${e.staffId} ${e.title} ${e.dept}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });
  const selectable = shown.filter(n => !enrolledNames.has(n));
  const allSel = selectable.length > 0 && selectable.every(n => sel.includes(n));
  const toggle = (n) => { if (enrolledNames.has(n)) return; setSel(s => s.includes(n) ? s.filter(x => x !== n) : [...s, n]); };
  const toggleAll = () => setSel(allSel ? sel.filter(n => !selectable.includes(n)) : [...new Set([...sel, ...selectable])]);
  const pg = usePaged(shown, 9);
  const conflicts = sel.filter(n => conflictOf(n)).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: "var(--card-pad, 24px)" }}>
        <div className="bh-h2" style={{ fontSize: 24 }}>Enroll Learners</div>
        <div className="bh-body" style={{ marginTop: 4, marginBottom: 16 }}>Pick a program, select learners (by department, grade or individually) — the system flags conflicts before you send invitations.</div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 16 }}>
          <Field label="Program"><Combobox value={program.title} onChange={(t) => { const p = programs.find(x => x.title === t); if (p) { setProgramId(p.id); setSel([]); } }} options={programs.map(p => p.title)} placeholder="Select a program" /></Field>
          <Field label="Department"><Combobox value={dept} onChange={v => setDept(v || "All")} options={depts} placeholder="All" /></Field>
          <Field label="Job Grade"><Combobox value={grade} onChange={v => setGrade(v || "All")} options={grades} placeholder="All" /></Field>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 12, alignItems: "center" }}>
          <span className="bh-chip"><Icon name="calendar-event-line" size={13} color="var(--gray-500)" style={{ marginRight: 5 }} />{program.startDate || "—"}</span>
          <span className="bh-chip"><Icon name="map-pin-line" size={13} color="var(--gray-500)" style={{ marginRight: 5 }} />{program.venue || "—"}</span>
          {program.seats && <span className="bh-chip"><Icon name="group-line" size={13} color="var(--gray-500)" style={{ marginRight: 5 }} />{enrolledNames.size} / {program.seats} seats</span>}
          <Checkbox checked={waitlist} onChange={setWaitlist} label="Add selection to waitlist (reserve) instead of inviting" />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="rounded-md border m-6 overflow-hidden">
          <UI.FilterBar search={q} onSearch={setQ} searchPlaceholder="Search staff…" />
          <table className="bh">
            <thead><tr>
              <th style={{ width: 44 }}><Checkbox checked={allSel} onChange={toggleAll} /></th>
              <th>Learner</th><th>Job Title</th><th>Department</th><th>Grade</th><th>Conflict check</th>
            </tr></thead>
            <tbody>
              {pg.pageItems.map(n => {
                const e = DIR[n] || {}; const on = sel.includes(n); const cf = conflictOf(n); const locked = enrolledNames.has(n);
                return (
                  <tr key={n} style={{ cursor: locked ? "default" : "pointer", background: on ? "#FFFBEB" : undefined, opacity: locked ? 0.6 : 1 }} onClick={() => toggle(n)}>
                    <td onClick={ev => ev.stopPropagation()}>{locked ? <Icon name="lock-line" size={16} color="var(--gray-300)" /> : <Checkbox checked={on} onChange={() => toggle(n)} />}</td>
                    <td><span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}><Avatar name={n} size={32} />
                      <span style={{ display: "flex", flexDirection: "column" }}><span style={{ fontWeight: 500, color: "var(--gray-900)" }}>{n}</span><span style={{ fontSize: 12, color: "var(--gray-400)" }}>{e.staffId}</span></span></span></td>
                    <td>{e.title}</td><td>{e.dept}</td><td>{e.grade}</td>
                    <td>{cf ? <span className="bh-chip" style={{ color: cf.color, background: cf.bg }}><Icon name="error-warning-line" size={13} color={cf.color} style={{ marginRight: 5 }} />{cf.label}</span> : <span style={{ color: "var(--success-deep)", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 5 }}><Icon name="checkbox-circle-line" size={15} color="var(--success)" />Clear</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ borderTop: "1px solid var(--divider)" }}><Pagination page={pg.page} pages={pg.pages} onPrev={pg.prev} onNext={pg.next} /></div>
        </div>
      </div>

      <BulkBar count={sel.length} noun={waitlist ? "to waitlist" : "learners selected"} visible={sel.length > 0} onClear={() => setSel([])}>
        {conflicts > 0 && <span style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--warning-deep)", display: "inline-flex", alignItems: "center", gap: 5 }}><Icon name="error-warning-line" size={15} color="var(--warning)" />{conflicts} conflict{conflicts > 1 ? "s" : ""}</span>}
        <Button variant="primary" icon={waitlist ? "list-ordered" : "mail-send-line"} onClick={() => onEnroll(programId, sel, waitlist)}>{waitlist ? "Add to Waitlist" : "Send Invitations"}</Button>
      </BulkBar>
      <div style={{ display: "flex", justifyContent: "flex-start" }}><Button variant="stroke" onClick={onCancel}>Cancel</Button></div>
    </div>
  );
}

/* ---------- CONTROLLER ---------- */
function EnrollmentScreen({ onToast, onSubPage, enrollProgramId, onConsumeEnroll }) {
  const [enrollments, setEnrollments] = useStore(window.HRStores.ldEnrollments);
  const [programs] = useStore(window.HRStores.ldPrograms);
  const [q, setQ] = useEnr("");
  const [status, setStatus] = useEnr([]);
  const [prog, setProg] = useEnr("All programs");
  const [view, setView] = useEnr({ name: "records" });
  const [confirm, setConfirm] = useEnr(null);
  const DIR = window.EMPLOYEE_DIRECTORY || {};

  // deep-link from Catalog "Enroll Learners"
  useEnrEffect(() => {
    if (enrollProgramId) { setView({ name: "enroll", programId: enrollProgramId }); onConsumeEnroll && onConsumeEnroll(); }
  }, [enrollProgramId]);

  useEnrEffect(() => {
    if (!onSubPage) return;
    if (view.name === "enroll") onSubPage({ trail: [{ label: "Enrollment", onClick: () => setView({ name: "records" }) }, { label: "Enroll Learners" }] });
    else onSubPage(null);
    return () => onSubPage(null);
  }, [view]);

  const doEnroll = (programId, names, waitlist) => {
    const existing = new Set(enrollments.filter(e => e.programId === programId && e.status !== "Declined").map(e => e.learner));
    const fresh = names.filter(n => !existing.has(n)).map(n => {
      const e = DIR[n] || {};
      return { id: ldId(), programId, learner: n, staffId: e.staffId || "—", dept: e.dept || "—", grade: e.grade || "—",
        status: waitlist ? "Waitlisted" : "Invited", source: "Selected", invitedOn: ldToday() };
    });
    setEnrollments(es => [...fresh, ...es]);
    onToast(waitlist ? `${fresh.length} added to waitlist` : `Invitations sent to ${fresh.length} learner${fresh.length !== 1 ? "s" : ""}`, { tone: "success" });
    setView({ name: "records" });
  };

  // waitlist auto-promotion: when a seat frees up, promote the first waitlisted learner
  const promoteWaitlist = (programId, list) => {
    const next = list.find(e => e.programId === programId && e.status === "Waitlisted");
    if (next) { onToast(`${next.learner} auto-promoted from the waitlist`, { tone: "success" }); return list.map(e => e.id === next.id ? { ...e, status: "Invited", source: "Waitlist → promoted", invitedOn: ldToday() } : e); }
    return list;
  };

  const onAction = (kind, e) => {
    if (kind === "resend") { onToast(`Invitation resent to ${e.learner}`, {}); return; }
    if (kind === "confirm") { setEnrollments(es => es.map(x => x.id === e.id ? { ...x, status: "Confirmed" } : x)); onToast(`${e.learner} confirmed`, { tone: "success" }); return; }
    if (kind === "promote") { setEnrollments(es => es.map(x => x.id === e.id ? { ...x, status: "Invited", source: "Waitlist → promoted", invitedOn: ldToday() } : x)); onToast(`${e.learner} promoted to invited`, { tone: "success" }); return; }
    if (kind === "attended") { setEnrollments(es => es.map(x => x.id === e.id ? { ...x, status: "Attended" } : x)); onToast(`${e.learner} marked attended`, { tone: "success" }); return; }
    if (kind === "noshow") { setEnrollments(es => es.map(x => x.id === e.id ? { ...x, status: "No-show" } : x)); onToast(`${e.learner} marked no-show`, { tone: "error" }); return; }
    if (kind === "cancel") setConfirm({ kind: "cancel", row: e });
  };
  const run = () => {
    const e = confirm.row;
    setEnrollments(es => { const removed = es.filter(x => x.id !== e.id); return promoteWaitlist(e.programId, removed); });
    onToast(`${e.learner}'s enrollment cancelled`, { tone: "error" });
    setConfirm(null);
  };

  const body = view.name === "enroll"
    ? <EnrollRoster programs={programs} enrollments={enrollments} initialProgramId={view.programId} onCancel={() => setView({ name: "records" })} onEnroll={doEnroll} />
    : <EnrollmentRecords enrollments={enrollments} programs={programs} q={q} setQ={setQ} status={status} setStatus={setStatus} prog={prog} setProg={setProg} onEnroll={() => setView({ name: "enroll" })} onAction={onAction} />;

  return (
    <React.Fragment>
      {body}
      {confirm && <ConfirmModal title="Cancel Enrollment" message={`Cancel ${confirm.row.learner}'s enrollment? The next waitlisted learner (if any) will be auto-promoted.`}
        confirmLabel="Yes, Cancel" confirmIcon="close-line" cancelLabel="No" onConfirm={run} onClose={() => setConfirm(null)} />}
    </React.Fragment>
  );
}

Object.assign(window, { EnrollmentScreen });
