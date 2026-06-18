// BISTA HR · careers/ApplicationDetail — full-page application detail (mirrors
// ApplicationDetailsClient): header + action bar, applicant info + documents, employment /
// education / skills / certifications, interview card, pre-screening, and a status timeline.
// The action bar follows ApplicationActionButtons EXACTLY:
//   Submitted → Send/Resend Shortlist Request · Approve/Reject Shortlist · Reject Application
//   Shortlisted → Schedule for Assessment (needs assessment rubric) · Reject Application
//   Assessment → Approve for Hiring · Reject Application
//   Offer → Send Offer → Mark as Hired · Reject Application
const { useState: useAD } = React;

const AD_LOCATIONS = ["Main Office — Interview Room 1", "Main Office — Interview Room 2", "Kumasi Branch — Boardroom", "Microsoft Teams (Online)"];

// ── dialogs ──────────────────────────────────────────────────────────────────
function ScheduleAssessmentDialog({ app, existing, onClose, onConfirm }) {
  const [f, setF] = useAD(() => existing || { assessors: [], location: "", date: "", start: "", end: "" });
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const valid = f.assessors.length && f.location && f.date && f.start && f.end;
  return (
    <Modal onClose={onClose} width={600}>
      <div style={{ padding: "22px 24px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 19, color: "var(--gray-900)" }}>{existing ? "Edit Assessment Schedule" : "Schedule for Assessment"}</div>
          <div className="bh-body" style={{ marginTop: 3 }}>Book an interview for {app.applicantName} and assign assessors.</div>
        </div>
        <button className="btn btn-icon btn-ghost" onClick={onClose} style={{ width: 32, height: 32, padding: 0 }}><Icon name="close-line" size={20} color="var(--gray-500)" /></button>
      </div>
      <div style={{ padding: "18px 24px 6px", display: "flex", flexDirection: "column", gap: 16 }}>
        <Field label="Assessors"><MultiSelectCombobox value={f.assessors} onChange={v => set("assessors", v)} options={(window.LOOKUPS && window.LOOKUPS.employees) || []} placeholder="Select assessors" avatar /></Field>
        <Field label="Location"><Combobox value={f.location} onChange={v => set("location", v)} options={AD_LOCATIONS} icon="map-pin-line" placeholder="Select location" /></Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <Field label="Date"><UI.DatePicker value={f.date} onSelect={d => set("date", d ? d.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }) : "")} placeholder="Pick date" /></Field>
          <Field label="Start"><Input value={f.start} onChange={e => set("start", e.target.value)} placeholder="10:00" /></Field>
          <Field label="End"><Input value={f.end} onChange={e => set("end", e.target.value)} placeholder="11:00" /></Field>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: 20, borderTop: "1px solid var(--divider)" }}>
        <Button variant="stroke" onClick={onClose}>Cancel</Button>
        <Button variant="primary" icon="calendar-check-line" disabled={!valid} onClick={() => onConfirm(f)}>{existing ? "Update Schedule" : "Schedule Interview"}</Button>
      </div>
    </Modal>
  );
}

function SendOfferDialog({ app, onClose, onConfirm }) {
  const [f, setF] = useAD({ salary: "", startDate: "", offerExpiryDate: "" });
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const valid = f.salary && f.startDate && f.offerExpiryDate;
  return (
    <Modal onClose={onClose} width={520}>
      <div style={{ padding: "22px 24px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 19, color: "var(--gray-900)" }}>Send Offer</div>
          <div className="bh-body" style={{ marginTop: 3 }}>Send a formal offer to {app.applicantName}.</div>
        </div>
        <button className="btn btn-icon btn-ghost" onClick={onClose} style={{ width: 32, height: 32, padding: 0 }}><Icon name="close-line" size={20} color="var(--gray-500)" /></button>
      </div>
      <div style={{ padding: "18px 24px 6px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 18px" }}>
        <Field label="Annual Salary (GHS)" style={{ gridColumn: "1 / -1" }}><Input icon="money-dollar-circle-line" type="number" value={f.salary} onChange={e => set("salary", e.target.value)} placeholder="Eg. 120000" /></Field>
        <Field label="Start Date"><UI.DatePicker value={f.startDate} onSelect={d => set("startDate", d ? d.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }) : "")} placeholder="Pick start date" /></Field>
        <Field label="Offer Expiry"><UI.DatePicker value={f.offerExpiryDate} onSelect={d => set("offerExpiryDate", d ? d.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }) : "")} placeholder="Pick expiry date" /></Field>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: 20, borderTop: "1px solid var(--divider)" }}>
        <Button variant="stroke" onClick={onClose}>Cancel</Button>
        <Button variant="primary" icon="mail-send-line" disabled={!valid} onClick={() => onConfirm(f)}>Send Offer</Button>
      </div>
    </Modal>
  );
}

function RejectAppDialog({ app, onClose, onConfirm }) {
  const [reason, setReason] = useAD("");
  return (
    <Modal onClose={onClose} width={460}>
      <div style={{ padding: "22px 24px 0" }}>
        <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 18, color: "var(--gray-900)" }}>Reject Application</div>
        <div className="bh-body" style={{ marginTop: 3 }}>Are you sure you want to reject {app.applicantName}'s application? This action cannot be undone.</div>
      </div>
      <div style={{ padding: "16px 24px 6px" }}><Field label="Reason" optional><Textarea rows={3} value={reason} onChange={e => setReason(e.target.value)} placeholder="Optional reason" /></Field></div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: 20, borderTop: "1px solid var(--divider)" }}>
        <Button variant="stroke" onClick={onClose}>Cancel</Button>
        <Button variant="primary" icon="close-line" onClick={() => onConfirm(reason)} style={{ background: "var(--error)", borderColor: "var(--error)" }}>Yes, Reject</Button>
      </div>
    </Modal>
  );
}

// ── small card primitives ─────────────────────────────────────────────────────
function ADCard({ title, action, children, pad = 22 }) {
  return (
    <div className="card" style={{ padding: pad }}>
      {(title || action) && <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 15, color: "var(--gray-900)" }}>{title}</span>{action}
      </div>}
      {children}
    </div>
  );
}

function adScoreColor(s) { return s == null ? "var(--gray-400)" : s >= 80 ? "var(--success-deep)" : s >= 50 ? "var(--warning-deep)" : "var(--error)"; }

function ApplicationActionBar({ app, posting, onAct }) {
  const sl = app.shortlist;
  const terminal = app.status === 4 || app.status === 5;
  if (terminal) return <StatusBadge variant={app.status === 4 ? "success" : "error"} text={app.status === 4 ? "Hired" : "Rejected"} />;
  const btns = [];
  const rejectBtn = { label: "Reject Application", icon: "close-circle-line", act: "reject", danger: true };
  if (app.status === 0) {
    if (!sl || sl.status === "rejected") btns.push({ label: sl && sl.status === "rejected" ? "Resend Shortlist Request" : "Send Shortlist Request", icon: "user-follow-line", act: "sendShortlist" });
    if (sl && sl.status === "pending") { btns.push({ label: "Approve Shortlist", icon: "check-line", act: "approveShortlist" }); btns.push({ label: "Reject Shortlist", icon: "close-line", act: "rejectShortlist", danger: true }); }
    btns.push(rejectBtn);
  } else if (app.status === 1) {
    if (posting.isInterviewAssessmentCreated && !app.interview) btns.push({ label: "Schedule for Assessment", icon: "calendar-schedule-line", act: "schedule" });
    else if (app.interview) btns.push({ label: "Reschedule Assessment", icon: "calendar-schedule-line", act: "schedule", outline: true });
    btns.push(rejectBtn);
  } else if (app.status === 2) {
    btns.push({ label: "Approve for Hiring", icon: "thumb-up-line", act: "approveHiring" });
    btns.push(rejectBtn);
  } else if (app.status === 3) {
    if (!app.offer) btns.push({ label: "Send Offer", icon: "mail-send-line", act: "sendOffer" });
    else btns.push({ label: "Mark as Hired", icon: "checkbox-circle-line", act: "hire" });
    btns.push(rejectBtn);
  }
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "flex-end" }}>
      {btns.map(b => <Button key={b.label} variant={b.danger || b.outline ? "stroke" : "primary"} icon={b.icon} onClick={() => onAct(b.act)}
        style={b.danger ? { color: "var(--error)", borderColor: "var(--error-tint)" } : undefined}>{b.label}</Button>)}
    </div>
  );
}

// vertical status timeline
function Timeline({ app }) {
  const stages = [
    { label: "Submitted", done: true, date: app.createdAt },
    { label: "Shortlisted", state: app.shortlist ? (app.shortlist.status === "approved" || app.status >= 1 ? "done" : app.shortlist.status === "pending" ? "current" : "pending") : (app.status >= 1 ? "done" : "pending") },
    { label: "Assessment", state: app.status > 2 ? "done" : app.interview ? "current" : "pending" },
    { label: "Offer", state: app.status > 3 ? "done" : app.offer ? "current" : "pending" },
    { label: "Hired", state: app.status === 4 ? "done" : "pending" },
  ];
  if (app.status === 5) stages.push({ label: "Rejected", state: "rejected" });
  const dot = (st, first) => {
    const done = st === "done" || first;
    const bg = st === "rejected" ? "var(--error)" : done ? "var(--success)" : st === "current" ? "var(--brand-yellow)" : "var(--gray-200)";
    const ic = st === "rejected" ? "close-line" : done ? "check-line" : null;
    return <span style={{ width: 22, height: 22, borderRadius: "50%", background: bg, display: "grid", placeItems: "center", flex: "none", color: st === "current" ? "var(--brand-ink)" : "#fff" }}>{ic ? <Icon name={ic} size={13} /> : <span style={{ width: 7, height: 7, borderRadius: "50%", background: st === "current" ? "var(--brand-ink)" : "#fff" }} />}</span>;
  };
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {stages.map((s, i) => (
        <div key={s.label} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {dot(s.state || (s.done ? "done" : "pending"), i === 0)}
            {i < stages.length - 1 && <span style={{ width: 2, height: 26, background: "var(--gray-200)" }} />}
          </div>
          <div style={{ paddingBottom: 14 }}>
            <div style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 13.5, color: (s.state === "done" || s.done || s.state === "current") ? "var(--gray-900)" : "var(--gray-400)" }}>{s.label}</div>
            {s.date && <div className="bh-caption">{s.date}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

function ApplicationDetailScreen({ postingId, appId, onBack, onToast }) {
  const [careers, setCareers] = useStore(window.HRStores.careers);
  const [dialog, setDialog] = useAD(null);
  const posting = careers.postings.find(p => p.id === postingId);
  const app = (careers.applications[postingId] || []).find(a => a.id === appId);
  if (!posting || !app) return null;
  const st = APP_STATUS[app.status];

  const patch = (p, msg, tone) => {
    setCareers(s => {
      const ap = { ...s.applications };
      ap[postingId] = ap[postingId].map(a => a.id === appId ? { ...a, ...(typeof p === "function" ? p(a) : p) } : a);
      return { ...s, applications: ap };
    });
    if (msg) onToast && onToast(msg, { tone: tone || "success" });
  };
  const onAct = (act) => {
    switch (act) {
      case "sendShortlist": patch({ shortlist: { status: "pending", createdAt: "Today" }, hasShortlistRequest: true }, "Shortlist Request Sent"); break;
      case "approveShortlist": patch({ shortlist: { status: "approved", createdAt: "Today" }, status: 1 }, "Shortlist Approved"); break;
      case "rejectShortlist": patch({ shortlist: { status: "rejected", createdAt: "Today" } }, "Shortlist Rejected", "error"); break;
      case "approveHiring": patch({ status: 3 }, "Approved for Hiring"); break;
      case "hire": patch({ status: 4 }, "Applicant Hired"); break;
      case "schedule": setDialog("schedule"); break;
      case "sendOffer": setDialog("offer"); break;
      case "reject": setDialog("reject"); break;
      default: break;
    }
  };

  const Detail = ({ label, value }) => <div><div className="bh-caption">{label}</div><div style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 14, color: "var(--gray-900)", marginTop: 2 }}>{value || "—"}</div></div>;
  const listOrEmpty = (arr, render, empty) => (arr && arr.length) ? arr.map(render) : <div className="bh-caption">{empty}</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <PageHeader title="Application Details" actions={<ApplicationActionBar app={app} posting={posting} onAct={onAct} />} />

      {/* applicant info + documents */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 360px", gap: 16 }}>
        <ADCard pad={22}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Avatar name={app.applicantName} size={52} />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 19, color: "var(--gray-900)" }}>{app.applicantName}</span>
                <StatusBadge variant={st.variant} text={st.label} size="sm" />
              </div>
              <div style={{ display: "flex", gap: 16, marginTop: 8, flexWrap: "wrap" }}>
                <span className="bh-caption"><Icon name="mail-line" size={13} color="var(--gray-400)" style={{ marginRight: 5 }} />{app.applicantEmail}</span>
                <span className="bh-caption"><Icon name="phone-line" size={13} color="var(--gray-400)" style={{ marginRight: 5 }} />{app.applicantPhone}</span>
                <span className="bh-caption"><Icon name="calendar-line" size={13} color="var(--gray-400)" style={{ marginRight: 5 }} />Applied {app.createdAt}</span>
              </div>
            </div>
          </div>
        </ADCard>
        <ADCard title="Documents" pad={22}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[{ n: app.cv, l: "Résumé" }, { n: app.coverLetter, l: "Cover Letter" }].map((d, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "9px 12px" }}>
                <Icon name="file-pdf-2-line" size={22} color="var(--error)" />
                <div style={{ flex: 1 }}><div style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 13, color: "var(--gray-900)" }}>{d.l}</div><div className="bh-caption">{d.n}</div></div>
                <Icon name="download-2-line" size={17} color="var(--gray-400)" />
              </div>
            ))}
          </div>
        </ADCard>
      </div>

      {/* history + side rail */}
      <div style={{ display: "grid", gridTemplateColumns: "40% minmax(0,1fr)", gap: 16, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <ADCard title="Employment History">
            {listOrEmpty(app.employmentHistory, (e, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 14, color: "var(--gray-900)" }}>{e.title} · {e.employer}</div>
                <div className="bh-caption">{e.start} – {e.end || "Present"}</div>
              </div>
            ), "No employment history")}
          </ADCard>
          <ADCard title="Education">
            {listOrEmpty(app.education, (e, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 14, color: "var(--gray-900)" }}>{e.degree} {e.field} · {e.institution}</div>
                <div className="bh-caption">{e.start} – {e.end || "Present"} · {e.grade}</div>
              </div>
            ), "No education records")}
          </ADCard>
          <ADCard title="Skills"><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{listOrEmpty(app.skills, (s, i) => <span key={i} className="bh-chip">{s}</span>, "No skills listed")}</div></ADCard>
          <ADCard title="Certifications"><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{listOrEmpty((app.certifications || []).filter(c => c && c !== "—"), (s, i) => <span key={i} className="bh-chip">{s}</span>, "No certifications listed")}</div></ADCard>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {app.interview && (
            <ADCard title="Interview Assessment" action={app.status < 4 && app.status !== 5 ? <Button variant="stroke" size="sm" icon="edit-line" onClick={() => setDialog("schedule")}>Edit</Button> : null}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Detail label="Date & Time" value={`${app.interview.date} · ${app.interview.start}–${app.interview.end}`} />
                <Detail label="Location" value={app.interview.location} />
                <div style={{ gridColumn: "1 / -1" }}>
                  <div className="bh-caption" style={{ marginBottom: 6 }}>Assessors</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{app.interview.assessors.map((a, i) => <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6 }} className="bh-chip"><Avatar name={a} size={18} />{a}</span>)}</div>
                </div>
                {app.matchScore != null && <Detail label="Score" value={<span style={{ color: adScoreColor(app.matchScore) }}>{app.matchScore}%</span>} />}
              </div>
            </ADCard>
          )}
          {app.offer && (
            <ADCard title="Offer">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Detail label="Salary" value={`GHS ${Number(app.offer.salary).toLocaleString()}`} />
                <Detail label="Start Date" value={app.offer.startDate} />
                <Detail label="Expires" value={app.offer.offerExpiryDate} />
              </div>
            </ADCard>
          )}
          <ADCard title="Pre-screening">
            {(posting.preScreeningQuestions && posting.preScreeningQuestions.length)
              ? posting.preScreeningQuestions.map((q, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <div style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--gray-500)" }}>{q.text}</div>
                    <div style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 14, color: "var(--gray-900)" }}>{(app.preScreeningAnswers && app.preScreeningAnswers[i]) || "—"}</div>
                  </div>
                ))
              : <div className="bh-caption">No pre-screening questions.</div>}
          </ADCard>
          <ADCard title="Application Timeline"><Timeline app={app} /></ADCard>
        </div>
      </div>

      {dialog === "schedule" && <ScheduleAssessmentDialog app={app} existing={app.interview} onClose={() => setDialog(null)}
        onConfirm={(f) => { patch(a => ({ status: a.status < 2 ? 2 : a.status, interview: { ...f, status: 0 } }), app.interview ? "Assessment Rescheduled" : "Scheduled for Assessment"); setDialog(null); }} />}
      {dialog === "offer" && <SendOfferDialog app={app} onClose={() => setDialog(null)}
        onConfirm={(f) => { patch({ offer: f }, "Offer Sent"); setDialog(null); }} />}
      {dialog === "reject" && <RejectAppDialog app={app} onClose={() => setDialog(null)}
        onConfirm={(reason) => { patch({ status: 5, rejectionReason: reason }, "Application Rejected", "error"); setDialog(null); }} />}
    </div>
  );
}

Object.assign(window, { ApplicationDetailScreen, ScheduleAssessmentDialog, SendOfferDialog, RejectAppDialog });
