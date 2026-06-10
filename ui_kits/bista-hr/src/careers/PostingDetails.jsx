// BISTA HR · careers/PostingDetails — admin side (Recruitment ▸ Job Posts).
// JobPostsScreen: list of postings → click View → PostingDetailScreen:
//   posting summary + applicant count, status pipeline tabs (Applications → Shortlisted →
//   Assessment → Offer → Hired / Rejected), applicant table, and an applicant review modal
//   whose actions advance the application through the pipeline (writing to the shared store).
const { useState: usePD } = React;

const scoreColor = (s) => s == null ? "var(--gray-400)" : s >= 80 ? "var(--success-deep)" : s >= 50 ? "var(--warning-deep)" : "var(--error)";

// next-step actions available for each pipeline status
function actionsFor(status) {
  switch (status) {
    case 0: return [{ label: "Shortlist", icon: "user-star-line", to: 1, tone: "primary" }, { label: "Reject", icon: "close-line", to: 5, tone: "danger" }];
    case 1: return [{ label: "Move to Assessment", icon: "clipboard-line", to: 2, tone: "primary" }, { label: "Reject", icon: "close-line", to: 5, tone: "danger" }];
    case 2: return [{ label: "Send Offer", icon: "mail-send-line", to: 3, tone: "primary" }, { label: "Reject", icon: "close-line", to: 5, tone: "danger" }];
    case 3: return [{ label: "Mark Hired", icon: "checkbox-circle-line", to: 4, tone: "primary" }, { label: "Reject", icon: "close-line", to: 5, tone: "danger" }];
    case 5: return [{ label: "Reopen", icon: "refresh-line", to: 0, tone: "stroke" }];
    default: return [];
  }
}

function ApplicantReview({ app, posting, onClose, onAction }) {
  const st = APP_STATUS[app.status];
  const actions = actionsFor(app.status);
  const Section = ({ title, children }) => (
    <div style={{ marginTop: 18 }}>
      <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 13, letterSpacing: ".02em", textTransform: "uppercase", color: "var(--gray-500)", marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
  return (
    <Modal onClose={onClose} width={720}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "24px 24px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar name={app.applicantName} size={44} />
          <div>
            <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 18, color: "var(--gray-900)" }}>{app.applicantName}</div>
            <div className="bh-caption">{app.applicantEmail} · {app.applicantPhone}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <StatusBadge variant={st.variant} text={st.label} />
          <button className="btn btn-icon btn-ghost" onClick={onClose} style={{ width: 32, height: 32, padding: 0 }}><Icon name="close-line" size={20} color="var(--gray-500)" /></button>
        </div>
      </div>

      <div style={{ padding: "16px 24px 8px", maxHeight: "60vh", overflowY: "auto" }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <span className="bh-chip"><Icon name="briefcase-line" size={13} color="var(--gray-500)" style={{ marginRight: 5 }} />{posting.designation}</span>
          <span className="bh-chip"><Icon name="building-2-line" size={13} color="var(--gray-500)" style={{ marginRight: 5 }} />{posting.department}</span>
          <span className="bh-chip"><Icon name="calendar-line" size={13} color="var(--gray-500)" style={{ marginRight: 5 }} />Applied {app.createdAt}</span>
          {app.matchScore != null && <span className="bh-chip" style={{ color: scoreColor(app.matchScore), fontWeight: 700 }}>Match {app.matchScore}%</span>}
        </div>

        <Section title="Documents">
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[{ n: app.cv, l: "Résumé" }, { n: app.coverLetter, l: "Cover Letter" }].map((d, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "9px 12px", background: "#fff" }}>
                <Icon name="file-pdf-2-line" size={20} color="var(--error)" />
                <div><div style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 13, color: "var(--gray-900)" }}>{d.l}</div><div className="bh-caption">{d.n}</div></div>
                <Icon name="download-2-line" size={16} color="var(--gray-400)" style={{ marginLeft: 6 }} />
              </div>
            ))}
          </div>
        </Section>

        {app.preScreeningAnswers && posting.preScreeningQuestions && (
          <Section title="Pre-screening">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {posting.preScreeningQuestions.map((q, i) => (
                <div key={i}>
                  <div style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--gray-500)" }}>{q.text}</div>
                  <div style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 14, color: "var(--gray-900)" }}>{app.preScreeningAnswers[i] || "—"}</div>
                </div>
              ))}
            </div>
          </Section>
        )}

        <Section title="Employment History">
          {app.employmentHistory.map((e, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <div style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 14, color: "var(--gray-900)" }}>{e.title} · {e.employer}</div>
              <div className="bh-caption">{e.start} – {e.end || "Present"}</div>
            </div>
          ))}
        </Section>
        <Section title="Education">
          {app.education.map((e, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <div style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 14, color: "var(--gray-900)" }}>{e.degree} {e.field} · {e.institution}</div>
              <div className="bh-caption">{e.start} – {e.end || "Present"} · {e.grade}</div>
            </div>
          ))}
        </Section>
        <Section title="Skills">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{app.skills.map((s, i) => <span key={i} className="bh-chip">{s}</span>)}</div>
        </Section>
      </div>

      {actions.length > 0 && (
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: 20, borderTop: "1px solid var(--divider)" }}>
          {actions.map(a => (
            <Button key={a.label} variant={a.tone === "danger" ? "stroke" : a.tone} icon={a.icon}
              onClick={() => onAction(app.id, a.to)} style={a.tone === "danger" ? { color: "var(--error)", borderColor: "var(--error-tint)" } : undefined}>{a.label}</Button>
          ))}
        </div>
      )}
    </Modal>
  );
}

function PostingDetailScreen({ postingId, onBack, onToast }) {
  const [careers, setCareers] = useStore(window.HRStores.careers);
  const [tab, setTab] = usePD("all");
  const [review, setReview] = usePD(null);
  const posting = careers.postings.find(p => p.id === postingId);
  const apps = careers.applications[postingId] || [];
  if (!posting) return null;
  const counts = APP_TABS.reduce((m, t) => { m[t.value] = apps.filter(a => a.status === t.status).length; return m; }, {});
  const activeStatus = APP_TABS.find(t => t.value === tab).status;
  const shown = apps.filter(a => a.status === activeStatus);

  const setStatus = (appId, status) => {
    setCareers(s => {
      const ap = { ...s.applications };
      ap[postingId] = ap[postingId].map(a => a.id === appId ? { ...a, status } : a);
      return { ...s, applications: ap };
    });
    setReview(null);
    onToast && onToast(`Applicant ${APP_STATUS[status].label}`, { tone: status === 5 ? "error" : "success" });
  };
  const togglePosting = () => {
    setCareers(s => ({ ...s, postings: s.postings.map(p => p.id === postingId ? { ...p, status: p.status === "Closed" ? "Active" : "Closed" } : p) }));
    onToast && onToast(posting.status === "Closed" ? "Posting Reopened" : "Posting Closed", { tone: "success" });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ alignSelf: "flex-start" }}><Icon name="arrow-left-line" size={16} />Back to Job Posts</button>
      <div className="card" style={{ padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <span className="bh-h2" style={{ fontSize: 22 }}>Posting Details</span>
        <Button variant={posting.status === "Closed" ? "primary" : "stroke"} icon={posting.status === "Closed" ? "lock-unlock-line" : "lock-line"} onClick={togglePosting}>{posting.status === "Closed" ? "Open Posting" : "Close Posting"}</Button>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div className="card" style={{ flex: 1, minWidth: 320, padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
            <span style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 18, color: "var(--gray-900)" }}>{posting.designation}</span>
            <StatusBadge variant={posting.status === "Closed" ? "closed" : "active"} text={posting.status} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[["Department/Unit", posting.department], ["Employment Type", empLabel(posting.employmentType)], ["Closing Date", posting.closingDate]].map(([l, v]) => (
              <div key={l}><div className="bh-caption">{l}</div><div style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 14, color: "var(--gray-900)", marginTop: 2 }}>{v}</div></div>
            ))}
          </div>
        </div>
        <div className="card" style={{ width: 220, padding: 22, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <span className="bh-caption">Number of Applicants</span>
          <span style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 36, color: "var(--gray-900)", lineHeight: 1.1 }}>{apps.length}</span>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "visible" }}>
        <div style={{ display: "flex", gap: 4, padding: "12px 16px", borderBottom: "1px solid var(--border)", flexWrap: "wrap" }}>
          {APP_TABS.map(t => {
            const on = t.value === tab;
            return (
              <button key={t.value} onClick={() => setTab(t.value)} style={{ display: "inline-flex", alignItems: "center", gap: 7, border: 0, cursor: "pointer",
                fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 13, padding: "7px 12px", borderRadius: 8,
                background: on ? "var(--brand-yellow-tint)" : "transparent", color: on ? "var(--gray-900)" : "var(--gray-500)" }}>
                {t.label}
                <span style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 11, padding: "1px 7px", borderRadius: 999, background: on ? "var(--brand-yellow)" : "var(--gray-100)", color: on ? "var(--brand-ink)" : "var(--gray-500)" }}>{counts[t.value]}</span>
              </button>
            );
          })}
        </div>
        {shown.length === 0
          ? <EmptyState compact title="No applicants" subtitle={`No applications in the ${APP_TABS.find(t => t.value === tab).label} stage.`} />
          : <table className="bh">
              <thead><tr><th>Name</th><th>Email</th><th>Contact</th><th>Status</th><th>Match Score</th><th>Application Date</th><th style={{ width: 48 }}></th></tr></thead>
              <tbody>
                {shown.map(a => (
                  <tr key={a.id} style={{ cursor: "pointer" }} onClick={() => setReview(a)}>
                    <td><span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Avatar name={a.applicantName} size={28} /><span style={{ fontWeight: 600 }}>{a.applicantName}</span></span></td>
                    <td style={{ color: "var(--gray-500)" }}>{a.applicantEmail}</td>
                    <td style={{ color: "var(--gray-500)" }}>{a.applicantPhone}</td>
                    <td><StatusBadge variant={APP_STATUS[a.status].variant} text={APP_STATUS[a.status].label} size="sm" /></td>
                    <td>{a.matchScore == null ? <span style={{ color: "var(--gray-400)" }}>—</span> : <span style={{ fontWeight: 700, color: scoreColor(a.matchScore) }}>{a.matchScore}%</span>}</td>
                    <td style={{ color: "var(--gray-500)" }}>{a.createdAt}</td>
                    <td style={{ textAlign: "right" }}><Button variant="stroke" size="sm" icon="eye-line" onClick={(e) => { e.stopPropagation(); setReview(a); }}>View</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>}
      </div>

      {review && <ApplicantReview app={review} posting={posting} onClose={() => setReview(null)} onAction={setStatus} />}
    </div>
  );
}

function JobPostsScreen({ onToast }) {
  const [careers] = useStore(window.HRStores.careers);
  const [detailId, setDetailId] = usePD(null);
  const [q, setQ] = usePD("");
  if (detailId) return <PostingDetailScreen postingId={detailId} onBack={() => setDetailId(null)} onToast={onToast} />;
  const rows = careers.postings.filter(p => p.designation.toLowerCase().includes(q.toLowerCase()));
  const countFor = (id) => (careers.applications[id] || []).length;

  return (
    <div className="card" style={{ overflow: "visible", padding: "var(--card-pad, 24px)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
        <div>
          <div className="bh-h2" style={{ fontSize: 24 }}>Job Posts</div>
          <div className="bh-body" style={{ marginTop: 4 }}>Published vacancies and their applicant pipelines. Open a posting to review applicants.</div>
        </div>
        <Button variant="primary" icon="add-line" onClick={() => onToast && onToast("Opening create posting", {})}>Create Job Post</Button>
      </div>
      <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "16px 20px" }}>
          <div className="input-wrap" style={{ width: 280, padding: "8px 12px" }}>
            <Icon name="search-2-line" size={18} style={{ color: "var(--icon-default)" }} />
            <input placeholder="Search postings…" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--gray-500)" }}>{careers.postings.length} postings</span>
        </div>
        <table className="bh">
          <thead><tr><th>Title</th><th>Department</th><th>Type</th><th>Applicants</th><th>Closing Date</th><th>Status</th><th style={{ width: 48 }}></th></tr></thead>
          <tbody>
            {rows.map(p => (
              <tr key={p.id} style={{ cursor: "pointer" }} onClick={() => setDetailId(p.id)}>
                <td style={{ fontWeight: 600 }}>{p.designation}</td>
                <td>{p.department}</td>
                <td><TypePill type={p.employmentType} /></td>
                <td><span className="bh-chip">{countFor(p.id)}</span></td>
                <td style={{ color: "var(--gray-500)" }}>{p.closingDate}</td>
                <td><StatusBadge variant={p.status === "Closed" ? "closed" : "active"} text={p.status} size="sm" /></td>
                <td style={{ textAlign: "right" }}><Button variant="stroke" size="sm" icon="eye-line" onClick={(e) => { e.stopPropagation(); setDetailId(p.id); }}>View</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

Object.assign(window, { JobPostsScreen, PostingDetailScreen, ApplicantReview });
