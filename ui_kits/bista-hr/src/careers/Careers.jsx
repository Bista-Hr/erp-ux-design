// BISTA HR · careers/Careers — ESS careers flow (Dashboard ▸ Careers).
// list (with filters) → detail → apply (résumé / cover letter / pre-screening) → success.
// Applying pushes a Submitted application into the shared careers store, so it appears
// live on the admin side (Recruitment ▸ Job Posts ▸ Posting Details).
const { useState: useCS } = React;

function TypePill({ type, size = "sm" }) {
  const c = empColor(type);
  const pad = size === "lg" ? "4px 12px" : "3px 9px";
  const fs = size === "lg" ? 13 : 12;
  return <span style={{ display: "inline-flex", alignItems: "center", fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: fs, padding: pad, borderRadius: 999, background: c.bg, color: c.fg, border: `1px solid ${c.bd}` }}>{empLabel(type)}</span>;
}

function MetaRow({ type, department, closingDate, size = "sm" }) {
  const fs = size === "lg" ? 14 : 12.5;
  const ico = size === "lg" ? 16 : 14;
  const item = (icon, txt) => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--font-ui)", fontSize: fs, color: "var(--gray-500)" }}>
      <Icon name={icon} size={ico} color="var(--gray-400)" />{txt}
    </span>
  );
  return <div style={{ display: "flex", flexWrap: "wrap", gap: 18 }}>{item("briefcase-line", empLabel(type))}{item("building-2-line", department)}{item("time-line", "Closes " + closingDate)}</div>;
}

function CareerCardView({ posting, onOpen }) {
  return (
    <button type="button" onClick={() => onOpen(posting.id)} style={{ textAlign: "left", cursor: "pointer", background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 20, display: "flex", flexDirection: "column", gap: 12, transition: "box-shadow .15s, border-color .15s" }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--shadow-pop)"; e.currentTarget.style.borderColor = "var(--border-strong)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "var(--border)"; }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 18, color: "var(--gray-900)" }}>{posting.designation}</span>
          <TypePill type={posting.employmentType} />
        </div>
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-400)", whiteSpace: "nowrap" }}>{posting.postedAgo} ago</span>
      </div>
      <p style={{ fontFamily: "var(--font-ui)", fontSize: 13.5, lineHeight: 1.5, color: "var(--gray-600)", margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{posting.description}</p>
      <MetaRow type={posting.employmentType} department={posting.department} closingDate={posting.closingDate} />
    </button>
  );
}

function HtmlSection({ title, children }) {
  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 16, color: "var(--gray-900)", marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}
const Bullets = ({ items }) => (
  <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 7 }}>
    {items.map((t, i) => <li key={i} style={{ fontFamily: "var(--font-ui)", fontSize: 14, lineHeight: 1.5, color: "var(--gray-700)" }}>{t}</li>)}
  </ul>
);

function CareerDetailView({ posting, onBack, onApply }) {
  return (
    <div style={{ maxWidth: 880, margin: "0 auto" }}>
      <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ marginBottom: 16 }}><Icon name="arrow-left-line" size={16} />Back to Careers</button>
      <div className="card" style={{ padding: 28 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
              <span className="bh-h2" style={{ fontSize: 24 }}>{posting.designation}</span>
              <TypePill type={posting.employmentType} size="lg" />
            </div>
            <MetaRow type={posting.employmentType} department={posting.department} closingDate={posting.closingDate} size="lg" />
          </div>
          {posting.status === "Active"
            ? <Button variant="primary" icon="arrow-right-line" onClick={() => onApply(posting.id)}>Apply Now</Button>
            : <StatusBadge variant="closed" text="Closed" />}
        </div>
        <HtmlSection title="Job Description"><p style={{ fontFamily: "var(--font-ui)", fontSize: 14, lineHeight: 1.6, color: "var(--gray-700)", margin: 0 }}>{posting.jobDescription}</p></HtmlSection>
        <HtmlSection title="Key Duties"><Bullets items={posting.keyDuties} /></HtmlSection>
        <HtmlSection title="Qualifications & Experience"><Bullets items={posting.qualifications} /></HtmlSection>
        <HtmlSection title="Skills Required">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{posting.skills.map((s, i) => <span key={i} className="bh-chip">{s}</span>)}</div>
        </HtmlSection>
      </div>
    </div>
  );
}

function FileDrop({ label, value, onChange }) {
  return (
    <div style={{ flex: 1, minWidth: 220 }}>
      <div style={{ fontFamily: "var(--font-control)", fontWeight: 500, fontSize: 14, color: "var(--gray-800)", marginBottom: 8 }}>{label}</div>
      {value
        ? <div style={{ display: "flex", alignItems: "center", gap: 10, border: "1px solid var(--border-strong)", borderRadius: "var(--radius-md)", padding: "12px 14px", background: "var(--gray-25)" }}>
            <Icon name="file-pdf-2-line" size={20} color="var(--error)" />
            <span style={{ flex: 1, fontFamily: "var(--font-ui)", fontSize: 13.5, color: "var(--gray-800)" }}>{value}</span>
            <button className="btn btn-icon btn-ghost" style={{ width: 26, height: 26, padding: 0 }} onClick={() => onChange(null)}><Icon name="close-line" size={16} color="var(--gray-500)" /></button>
          </div>
        : <button type="button" onClick={() => onChange(label.toLowerCase().includes("resume") ? "resume.pdf" : "cover-letter.pdf")} style={{ width: "100%", cursor: "pointer", border: "1.5px dashed var(--border-strong)", borderRadius: "var(--radius-md)", padding: "20px 14px", background: "var(--gray-25)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <Icon name="upload-cloud-2-line" size={24} color="var(--gray-400)" />
            <span style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 13, color: "var(--gray-700)" }}>Upload {label.toLowerCase()}</span>
            <span style={{ fontFamily: "var(--font-ui)", fontSize: 11.5, color: "var(--gray-400)" }}>PDF, DOC, DOCX</span>
          </button>}
    </div>
  );
}

function ApplyForm({ posting, onBack, onSubmit }) {
  const [name, setName] = useCS(ME.name);
  const [email, setEmail] = useCS(ME.email);
  const [cv, setCv] = useCS(null);
  const [cover, setCover] = useCS(null);
  const [answers, setAnswers] = useCS({});
  const qs = posting.preScreeningQuestions || [];
  const ready = email.trim() && cv && cover && qs.every((_, i) => (answers[i] || "").trim());
  const setA = (i, v) => setAnswers(a => ({ ...a, [i]: v }));
  return (
    <div style={{ maxWidth: 880, margin: "0 auto" }}>
      <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ marginBottom: 16 }}><Icon name="arrow-left-line" size={16} />Back to role</button>
      <div className="card" style={{ padding: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
          <span className="bh-h2" style={{ fontSize: 22 }}>{posting.designation}</span>
          <TypePill type={posting.employmentType} size="lg" />
        </div>
        <MetaRow type={posting.employmentType} department={posting.department} closingDate={posting.closingDate} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 24 }}>
          <Field label="Full Name"><Input placeholder="Enter your full name" value={name} onChange={e => setName(e.target.value)} /></Field>
          <Field label="Email"><Input placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} /></Field>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginTop: 16 }}>
          <FileDrop label="Resume" value={cv} onChange={setCv} />
          <FileDrop label="Cover Letter" value={cover} onChange={setCover} />
        </div>

        {qs.length > 0 && (
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--divider)", display: "flex", flexDirection: "column", gap: 18 }}>
            {qs.map((q, i) => (
              <div key={i}>
                <div style={{ fontFamily: "var(--font-control)", fontWeight: 500, fontSize: 14, color: "var(--gray-800)", marginBottom: 8 }}>{q.text}</div>
                {q.type === "yesno"
                  ? <Segmented items={["Yes", "No"]} active={answers[i] || ""} onChange={v => setA(i, v)} />
                  : <Input placeholder="e.g. BSc. Accounting" value={answers[i] || ""} onChange={e => setA(i, e.target.value)} />}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--divider)" }}>
          <Button variant="stroke" onClick={onBack}>Cancel</Button>
          <Button variant="primary" icon="send-plane-line" disabled={!ready} onClick={() => onSubmit({ name, email, answers: qs.map((_, i) => answers[i] || "") })}>Apply Now</Button>
        </div>
      </div>
    </div>
  );
}

function ApplySuccess({ onDone }) {
  return (
    <div style={{ maxWidth: 560, margin: "40px auto 0" }}>
      <div className="card" style={{ padding: 56, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--success-tint)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="checkbox-circle-fill" size={36} color="var(--success)" />
        </div>
        <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 20, color: "var(--gray-900)" }}>Application Submitted</div>
        <div className="bh-body" style={{ maxWidth: 380 }}>Your application has been submitted successfully. The hiring team will review it and get back to you.</div>
        <Button variant="primary" icon="briefcase-line" onClick={onDone}>Go To Careers</Button>
      </div>
    </div>
  );
}

function CareersFlow({ onToast }) {
  const [careers, setCareers] = useStore(window.HRStores.careers);
  const [view, setView] = useCS({ mode: "list" });
  const [jobTitle, setJobTitle] = useCS("");
  const [dept, setDept] = useCS("");
  const [type, setType] = useCS("All");

  const postings = careers.postings.filter(p => p.status === "Active");
  const designations = [...new Set(postings.map(p => p.designation))].map(d => ({ value: d, label: d }));
  const departments = [...new Set(postings.map(p => p.department))].map(d => ({ value: d, label: d }));
  const filtered = postings.filter(p =>
    (!jobTitle || p.designation === jobTitle) && (!dept || p.department === dept) &&
    (type === "All" || empLabel(p.employmentType) === type));
  const posting = (id) => careers.postings.find(p => p.id === id);

  const submit = (id, data) => {
    setCareers(s => {
      const apps = { ...s.applications };
      const list = apps[id] ? [...apps[id]] : [];
      apps[id] = [{ id: "me-" + Date.now(), applicantName: data.name || ME.name, applicantEmail: data.email || ME.email,
        applicantPhone: "+233 24 123 4567", status: 0, matchScore: null, createdAt: "Just now",
        cv: "resume.pdf", coverLetter: "cover-letter.pdf",
        employmentHistory: [{ employer: "Bistasol", title: ME.role, start: "Sep 2025", end: null, note: "Current role." }],
        education: [{ institution: "University of Ghana", degree: "BSc", field: "Accounting", start: "2016", end: "2020", grade: "Second Upper" }],
        skills: ["Excel", "Reporting", "Analysis"], certifications: ["—"], preScreeningAnswers: data.answers }, ...list];
      return { ...s, applications: apps };
    });
    onToast && onToast("Application Submitted", { tone: "success" });
    setView({ mode: "success" });
  };

  if (view.mode === "detail") return <CareerDetailView posting={posting(view.id)} onBack={() => setView({ mode: "list" })} onApply={(id) => setView({ mode: "apply", id })} />;
  if (view.mode === "apply") return <ApplyForm posting={posting(view.id)} onBack={() => setView({ mode: "detail", id: view.id })} onSubmit={(d) => submit(view.id, d)} />;
  if (view.mode === "success") return <ApplySuccess onDone={() => setView({ mode: "list" })} />;

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div className="bh-h2" style={{ fontSize: 26 }}>Grow Your Career with Us</div>
        <div className="bh-body" style={{ marginTop: 6, fontSize: 15 }}>Explore current opportunities across the organization and apply for roles that match your skills.</div>
      </div>
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        <div className="card" style={{ width: 280, flexShrink: 0, padding: 20, display: "flex", flexDirection: "column", gap: 18, position: "sticky", top: 0 }}>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 16, color: "var(--gray-900)" }}>Filters</div>
          <Field label="Job Title"><Combobox value={jobTitle} onChange={setJobTitle} options={designations} placeholder="Select a job title" /></Field>
          <Field label="Department"><Combobox value={dept} onChange={setDept} options={departments} placeholder="Select a department" /></Field>
          <div>
            <div style={{ fontFamily: "var(--font-control)", fontWeight: 500, fontSize: 14, color: "var(--gray-800)", marginBottom: 8 }}>Job Type</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {["All", "Permanent", "Contract", "Internship", "Temporary"].map(t => (
                <button key={t} type="button" onClick={() => setType(t)} style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 12.5, padding: "6px 12px", borderRadius: 999, cursor: "pointer",
                  border: type === t ? "1px solid var(--brand-ink)" : "1px solid var(--border-strong)", background: type === t ? "var(--brand-yellow-tint)" : "#fff", color: "var(--gray-800)" }}>{t}</button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {filtered.length === 0
            ? <div className="card" style={{ padding: 8 }}><EmptyState title="No Open Positions" subtitle="There are no open positions matching your filters. Please check back later." /></div>
            : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
                {filtered.map(p => <CareerCardView key={p.id} posting={p} onOpen={(id) => setView({ mode: "detail", id })} />)}
              </div>}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { CareersFlow, TypePill, MetaRow });
