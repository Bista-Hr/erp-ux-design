// BISTA HR · careers/PostingDetails — admin Recruitment ▸ Job Posts, faithful to the codebase:
//   • JobPostsScreen  — "Job Postings" list with 5 stat cards; Create → full-page JobPostingForm.
//   • PostingDetailScreen — header (Create/Edit Assessment + Close/Open), job-info + applicant
//     count cards, and a top-level VIEW TOGGLE: Job Applications | Shortlist | Assessment.
//       – Job Applications: status sub-tabs (Applications·Shortlisted·Assessment·Offer·Hired·
//         Rejected) + multi-select "Add to Shortlist".
//       – Shortlist: All·Approved·Rejected + multi-select Approve/Reject.
//       – Assessment: All·Pending·Completed (scheduled interviews).
//   Rows open the full-page ApplicationDetailScreen. Create Assessment builds the weighted
//   constructs rubric (AssessmentConstruct[]) that gates "Schedule for Assessment".
const { useState: usePD } = React;

let _pdid = 100;
const pdScoreColor = (s) => s == null ? "var(--gray-400)" : s >= 80 ? "var(--success-deep)" : s >= 50 ? "var(--warning-deep)" : "var(--error)";
const PD_EMP_TYPES = ["Permanent", "Contract", "Temporary", "National Service", "Internship"];
const PD_POST_TYPES = [{ v: 0, l: "Internal Posting" }, { v: 1, l: "External Posting" }, { v: 2, l: "Internal & External Posting" }];

// ── reusable bits ──────────────────────────────────────────────────────────
function ViewToggle({ tabs, active, onChange }) {
  return (
    <UI.Tabs value={active} onValueChange={onChange}>
      <UI.TabsList>{tabs.map(t => <UI.TabsTrigger key={t} value={t}>{t}</UI.TabsTrigger>)}</UI.TabsList>
    </UI.Tabs>
  );
}

function SubTabs({ tabs, active, onChange }) {
  return (
    <UI.Tabs value={active} onValueChange={onChange}>
      <UI.TabsList>{tabs.map(t => <UI.TabsTrigger key={t.value} value={t.value}>{t.label}</UI.TabsTrigger>)}</UI.TabsList>
    </UI.Tabs>
  );
}

// ── Create / Edit Assessment (full page) — mirrors AssessmentForm.tsx + SortableConstructItem.tsx ──
const ASSESSMENT_MAX_WEIGHT = 100;
function ConstructItem({ c, index, count, onChange, onRemove }) {
  return (
    <UI.Card className="p-6 bg-gray-50 gap-4 border border-input">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><span className="text-muted-foreground cursor-grab"><i className="ri-draggable text-lg" /></span><span className="text-sm font-medium text-gray-900">Construct {index + 1}</span></div>
        {count > 1 && <button type="button" onClick={onRemove} className="flex items-center gap-2 text-red-500 hover:text-red-600"><i className="ri-delete-bin-line" />Remove</button>}
      </div>
      <div className="grid grid-cols-[1fr_10rem] gap-4">
        <UI.Field label="Construct Name"><UI.Input value={c.constructName} onChange={e => onChange("constructName", e.target.value)} placeholder="E.g. Education (Academic Certification)" /></UI.Field>
        <UI.Field label="Weight"><UI.Input type="number" min="1" max={ASSESSMENT_MAX_WEIGHT} value={c.weight} onChange={e => onChange("weight", e.target.value)} placeholder="E.g. 5" /></UI.Field>
      </div>
      <UI.Field label="Requirements"><UI.Textarea value={c.requirements} onChange={e => onChange("requirements", e.target.value)} placeholder="e.g. First Degree in Project Management, Business Management" /></UI.Field>
    </UI.Card>
  );
}
function AssessmentForm({ posting, onCancel, onSave }) {
  const edit = posting.isInterviewAssessmentCreated;
  const [constructs, setConstructs] = usePD(() => {
    const src = posting.assessment && posting.assessment.constructs;
    return (src && src.length) ? src.map(c => ({ constructName: c.constructName, weight: String(c.weight), requirements: Array.isArray(c.requirements) ? c.requirements.join(", ") : (c.requirements || "") })) : [{ constructName: "", weight: "", requirements: "" }];
  });
  const set = (i, k, v) => setConstructs(cs => cs.map((c, j) => j === i ? { ...c, [k]: v } : c));
  const total = constructs.reduce((s, c) => s + (Number(c.weight) || 0), 0);
  const valid = constructs.length && constructs.every(c => c.constructName.trim() && c.weight && c.requirements.trim()) && total <= ASSESSMENT_MAX_WEIGHT;
  const submit = () => onSave(constructs.map(c => ({ constructName: c.constructName.trim(), weight: Number(c.weight), requirements: String(c.requirements).split(",").map(x => x.trim()).filter(Boolean) })));
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title={edit ? "Edit Assessment" : "Create Assessment"} subtitle={`Define the weighted constructs assessors score for ${posting.designation}.`} />
      <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          {constructs.map((c, i) => <ConstructItem key={i} c={c} index={i} count={constructs.length} onChange={(k, v) => set(i, k, v)} onRemove={() => setConstructs(cs => cs.filter((_, j) => j !== i))} />)}
        </div>
        <div className="flex items-center justify-between px-4 py-3 bg-gray-100 rounded-lg">
          <span className="text-sm font-medium text-gray-700">Total Weight</span>
          <span className={UI.cn("text-sm font-bold", total > ASSESSMENT_MAX_WEIGHT ? "text-red-600" : "text-gray-900")}>{total} / {ASSESSMENT_MAX_WEIGHT}</span>
        </div>
        <button type="button" onClick={() => setConstructs(cs => [...cs, { constructName: "", weight: "", requirements: "" }])} className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium self-start"><i className="ri-add-line" />Add Another Construct</button>
        <div className="flex justify-end gap-3 pt-4">
          <UI.Button variant="outline" onClick={onCancel}>Cancel</UI.Button>
          <UI.Button disabled={!valid} onClick={submit}>{edit ? "Update Assessment" : "Create Assessment"}</UI.Button>
        </div>
      </div>
    </div>
  );
}

// name with email stacked below — matches the Employees table (default-weight name, 12px gray email)
function NameEmailCell({ name, email }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <Avatar name={name} />
      <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.3 }}>
        <span>{name}</span>
        <span style={{ fontSize: 12, color: "var(--gray-400)" }}>{email}</span>
      </span>
    </span>
  );
}
// ── table shell (matches the app: gray header, hover rows, view chip) ──
function PostingTable({ columns, rows, onRow, empty }) {
  if (!rows.length) return <EmptyState compact title={empty.title} subtitle={empty.sub} />;
  return (
    <table className="bh">
      <thead><tr>{columns.map((c, i) => <th key={i} style={c.thStyle}>{c.header}</th>)}</tr></thead>
      <tbody>
        {rows.map(r => (
          <tr key={r.id} style={{ cursor: onRow ? "pointer" : "default" }} onClick={onRow ? () => onRow(r) : undefined}>
            {columns.map((c, i) => <td key={i} style={c.tdStyle}>{c.cell(r)}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
// inner bordered panel for a posting-detail view: sub-tab header (border-b) + table + pager footer
const PanelPager = () => (
  <div className="flex items-center justify-between px-4 py-4 border-t border-gray-100">
    <span className="text-sm font-medium text-gray-900">Page 1 of 1</span>
    <div className="flex gap-2"><UI.Button variant="outline" size="sm" disabled>Previous</UI.Button><UI.Button variant="outline" size="sm" disabled>Next</UI.Button></div>
  </div>
);
function PostingPanel({ subtabsRow, children }) {
  return (
    <div className="rounded-md border overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">{subtabsRow}</div>
      <div style={{ overflowX: "auto" }}>{children}</div>
      <PanelPager />
    </div>
  );
}

// (multi-select uses the shared bottom-right BulkBar — see ApplicationsView / ShortlistView)
const CB = ({ on, onToggle }) => (
  <span onClick={e => { e.stopPropagation(); onToggle(); }} style={{ width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${on ? "var(--brand-yellow-dark)" : "var(--gray-300)"}`, background: on ? "var(--brand-yellow)" : "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>{on && <Icon name="check-line" size={13} color="var(--brand-ink)" />}</span>
);
const ViewChip = () => <span style={{ display: "inline-flex", alignItems: "center", gap: 5, border: "1px solid var(--gray-200)", borderRadius: 6, padding: "3px 10px", fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 12, color: "var(--gray-700)" }}><Icon name="eye-line" size={14} color="var(--gray-500)" />View</span>;

const APPLICATION_SUBTABS = [
  { value: 0, label: "Applications" }, { value: 1, label: "Shortlisted" }, { value: 2, label: "Assessment" },
  { value: 3, label: "Offer" }, { value: 4, label: "Hired" }, { value: 5, label: "Rejected" },
];

// ── Job Applications view ──
function ApplicationsView({ posting, apps, onOpen, onToast }) {
  const [tab, setTab] = usePD(0);
  const [sel, setSel] = usePD({});
  const setCareers = useStore(window.HRStores.careers)[1];
  const rows = apps.filter(a => a.status === tab);
  const counts = APPLICATION_SUBTABS.reduce((m, t) => { m[t.value] = apps.filter(a => a.status === t.value).length; return m; }, {});
  const selectable = tab === 0 ? rows.filter(a => !a.shortlist) : [];
  const selIds = Object.keys(sel).filter(k => sel[k]);
  const addToShortlist = () => {
    setCareers(s => { const ap = { ...s.applications }; ap[posting.id] = ap[posting.id].map(a => selIds.includes(a.id) ? { ...a, shortlist: { status: "pending", createdAt: "Today" }, hasShortlistRequest: true } : a); return { ...s, applications: ap }; });
    onToast && onToast(`${selIds.length} candidate(s) added to shortlist`, { tone: "success" }); setSel({});
  };
  const statusCell = (a) => (a.shortlist && a.shortlist.status === "pending" && a.status === 0)
    ? <StatusBadge variant="review" text="Shortlist Pending" size="sm" />
    : <StatusBadge variant={APP_STATUS[a.status].variant} text={APP_STATUS[a.status].label} size="sm" />;
  const cols = [
    ...(tab === 0 && selectable.length ? [{ header: <CB on={selectable.length && selectable.every(a => sel[a.id])} onToggle={() => { const all = selectable.every(a => sel[a.id]); setSel(all ? {} : Object.fromEntries(selectable.map(a => [a.id, true]))); }} />, thStyle: { width: 44 }, cell: (a) => (!a.shortlist ? <CB on={!!sel[a.id]} onToggle={() => setSel(s => ({ ...s, [a.id]: !s[a.id] }))} /> : null) }] : []),
    { header: "Name", cell: (a) => <NameEmailCell name={a.applicantName} email={a.applicantEmail} /> },
    { header: "Contact", cell: (a) => <span style={{ color: "var(--gray-500)" }}>{a.applicantPhone}</span> },
    { header: "Status", cell: statusCell },
    { header: "Match Score", cell: (a) => a.matchScore == null ? <span style={{ color: "var(--gray-400)" }}>—</span> : <span style={{ fontWeight: 700, color: pdScoreColor(a.matchScore) }}>{a.matchScore}%</span> },
    { header: "Application Date", cell: (a) => <span style={{ color: "var(--gray-500)" }}>{a.createdAt}</span> },
    { header: "", thStyle: { width: 70 }, tdStyle: { textAlign: "right" }, cell: () => <ViewChip /> },
  ];
  return (
    <div>
      <BulkBar count={selIds.length} noun="candidates selected" visible={tab === 0 && selIds.length > 0} onClear={() => setSel({})}><Button variant="primary" icon="user-follow-line" onClick={addToShortlist}>Add to Shortlist</Button></BulkBar>
      <PostingPanel subtabsRow={<SubTabs tabs={APPLICATION_SUBTABS} active={tab} onChange={(v) => { setTab(v); setSel({}); }} counts={counts} />}>
        <PostingTable columns={cols} rows={rows} onRow={(r) => onOpen(r.id)} empty={{ title: "No applications", sub: "No applications found in this category." }} />
      </PostingPanel>
    </div>
  );
}

const SHORTLIST_SUBTABS = [{ value: "all", label: "All" }, { value: "approved", label: "Approved" }, { value: "rejected", label: "Rejected" }];

// ── Shortlist view ──
function ShortlistView({ posting, apps, onOpen, onToast }) {
  const [tab, setTab] = usePD("all");
  const [sel, setSel] = usePD({});
  const setCareers = useStore(window.HRStores.careers)[1];
  const all = apps.filter(a => a.shortlist);
  const rows = tab === "all" ? all : all.filter(a => a.shortlist.status === tab);
  const pending = all.filter(a => a.shortlist.status === "pending");
  const selIds = Object.keys(sel).filter(k => sel[k]);
  const act = (decision) => {
    setCareers(s => { const ap = { ...s.applications }; ap[posting.id] = ap[posting.id].map(a => selIds.includes(a.id) ? (decision === "approved" ? { ...a, shortlist: { ...a.shortlist, status: "approved" }, status: 1 } : { ...a, shortlist: { ...a.shortlist, status: "rejected" } }) : a); return { ...s, applications: ap }; });
    onToast && onToast(`${selIds.length} candidate(s) ${decision}`, { tone: decision === "approved" ? "success" : "error" }); setSel({});
  };
  const slVariant = { pending: "pending", approved: "success", rejected: "error" };
  const slLabel = { pending: "Pending", approved: "Approved", rejected: "Rejected" };
  const cols = [
    ...(tab === "all" && pending.length ? [{ header: <CB on={pending.length && pending.every(a => sel[a.id])} onToggle={() => { const a = pending.every(x => sel[x.id]); setSel(a ? {} : Object.fromEntries(pending.map(x => [x.id, true]))); }} />, thStyle: { width: 44 }, cell: (a) => a.shortlist.status === "pending" ? <CB on={!!sel[a.id]} onToggle={() => setSel(s => ({ ...s, [a.id]: !s[a.id] }))} /> : null }] : []),
    { header: "Name", cell: (a) => <NameEmailCell name={a.applicantName} email={a.applicantEmail} /> },
    { header: "Contact", cell: (a) => <span style={{ color: "var(--gray-500)" }}>{a.applicantPhone}</span> },
    { header: "Application Date", cell: (a) => <span style={{ color: "var(--gray-500)" }}>{a.createdAt}</span> },
    { header: "Status", cell: (a) => <StatusBadge variant={slVariant[a.shortlist.status]} text={slLabel[a.shortlist.status]} size="sm" /> },
    { header: "", thStyle: { width: 70 }, tdStyle: { textAlign: "right" }, cell: () => <ViewChip /> },
  ];
  return (
    <div>
      <div style={{ marginBottom: 14 }}><div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 16, color: "var(--gray-900)" }}>Shortlisted Candidates</div><div className="bh-body" style={{ marginTop: 2 }}>View and approve or reject shortlisted candidates.</div></div>
      <BulkBar count={selIds.length} noun="candidates selected" visible={selIds.length > 0} onClear={() => setSel({})}><Button variant="stroke" icon="close-line" onClick={() => act("rejected")} style={{ color: "var(--error)", borderColor: "var(--error-tint)" }}>Reject</Button><Button variant="primary" icon="check-line" onClick={() => act("approved")}>Approve</Button></BulkBar>
      <PostingPanel subtabsRow={<SubTabs tabs={SHORTLIST_SUBTABS} active={tab} onChange={(v) => { setTab(v); setSel({}); }} />}>
        <PostingTable columns={cols} rows={rows} onRow={(r) => onOpen(r.id)} empty={{ title: "No shortlist requests", sub: "No shortlist requests found in this category." }} />
      </PostingPanel>
    </div>
  );
}

const ASSESS_SUBTABS = [{ value: "all", label: "All" }, { value: 0, label: "Pending" }, { value: 2, label: "Completed" }];

// ── Assessment view (scheduled interviews) ──
function AssessmentView({ apps, onOpen }) {
  const [tab, setTab] = usePD("all");
  const all = apps.filter(a => a.interview);
  const rows = tab === "all" ? all : all.filter(a => (a.interview.status || 0) === tab);
  const aVariant = { 0: "pending", 1: "info", 2: "success" };
  const aLabel = { 0: "Pending", 1: "In Progress", 2: "Completed" };
  const cols = [
    { header: "Name", cell: (a) => <NameEmailCell name={a.applicantName} email={a.applicantEmail} /> },
    { header: "Contact", cell: (a) => <span style={{ color: "var(--gray-500)" }}>{a.applicantPhone}</span> },
    { header: "Score", cell: (a) => a.matchScore == null ? <span style={{ color: "var(--gray-400)" }}>—</span> : <span style={{ fontWeight: 700, color: pdScoreColor(a.matchScore) }}>{a.matchScore}%</span> },
    { header: "Status", cell: (a) => <StatusBadge variant={aVariant[a.interview.status || 0]} text={aLabel[a.interview.status || 0]} size="sm" /> },
    { header: "Date", cell: (a) => <span style={{ color: "var(--gray-500)" }}>{a.interview.date}</span> },
    { header: "", thStyle: { width: 70 }, tdStyle: { textAlign: "right" }, cell: () => <ViewChip /> },
  ];
  return (
    <div>
      <div style={{ marginBottom: 14 }}><div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 16, color: "var(--gray-900)" }}>Interview Assessments</div><div className="bh-body" style={{ marginTop: 2 }}>Candidates scheduled for or completed assessment.</div></div>
      <PostingPanel subtabsRow={<SubTabs tabs={ASSESS_SUBTABS} active={tab} onChange={setTab} />}>
        <PostingTable columns={cols} rows={rows} onRow={(r) => onOpen(r.id)} empty={{ title: "No assessments", sub: "No assessments found in this category." }} />
      </PostingPanel>
    </div>
  );
}

function PostingDetailScreen({ postingId, onOpenApp, onEditAssessment, onToast }) {
  const [careers, setCareers] = useStore(window.HRStores.careers);
  const [view, setView] = usePD("Job Applications");
  const posting = careers.postings.find(p => p.id === postingId);
  const apps = careers.applications[postingId] || [];
  if (!posting) return null;
  const closed = posting.status === "Closed";

  const togglePosting = () => {
    setCareers(s => ({ ...s, postings: s.postings.map(p => p.id === postingId ? { ...p, status: closed ? "Active" : "Closed" } : p) }));
    onToast && onToast(closed ? "Job posting reopened successfully" : "Job posting closed successfully", { tone: "success" });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <PageHeader title="Posting Details" actions={<React.Fragment>
        <UI.Button variant="outline" icon="file-list-3-line" onClick={onEditAssessment}>{posting.isInterviewAssessmentCreated ? "Edit Assessment" : "Create Assessment"}</UI.Button>
        <UI.Button icon={closed ? "lock-unlock-line" : "lock-line"} onClick={togglePosting}>{closed ? "Open Posting" : "Close Posting"}</UI.Button>
      </React.Fragment>} />

      <div className="pd-split">
        <div className="card pd-main" style={{ padding: 24 }}>
          <div style={{ marginBottom: 18 }}><ViewToggle tabs={["Job Applications", "Shortlist", "Assessment"]} active={view} onChange={setView} /></div>
          {view === "Job Applications" && <ApplicationsView posting={posting} apps={apps} onOpen={onOpenApp} onToast={onToast} />}
          {view === "Shortlist" && <ShortlistView posting={posting} apps={apps} onOpen={onOpenApp} onToast={onToast} />}
          {view === "Assessment" && <AssessmentView apps={apps} onOpen={onOpenApp} />}
        </div>
        <div className="pd-side">
          <div className="pd-cards">
            <div className="card pd-info" style={{ padding: 22 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
                <span style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 18, color: "var(--gray-900)" }}>{posting.designation}</span>
                <StatusBadge variant={closed ? "closed" : "active"} text={closed ? "Closed" : "Active"} />
              </div>
              <div className="pd-info-grid">
                {[["Department/Unit", posting.department], ["Employment Type", empLabel(posting.employmentType)], ["Closing Date", posting.closingDate + (posting.closingTime ? " · " + posting.closingTime : "")]].map(([l, v]) => (
                  <div key={l}><div className="bh-caption">{l}</div><div style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 14, color: "var(--gray-900)", marginTop: 2 }}>{v}</div></div>
                ))}
              </div>
            </div>
            <div className="card pd-count" style={{ padding: 22, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <span className="bh-caption">Number of Applicants</span>
              <span style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 40, color: "var(--gray-900)", lineHeight: 1.1 }}>{apps.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Create Job Posting (full page) — mirrors JobPostingForm.tsx + create/page.tsx ──
const JOB_TYPES = [{ value: "0", label: "Internal Posting" }, { value: "1", label: "External Posting" }, { value: "2", label: "Internal & External Posting" }];
function JobPostingForm({ onCancel, onSubmit, lookups, initial }) {
  const [f, setF] = usePD(() => initial ? {
    designation: initial.designation || "", unit: initial.organizationalUnit || "", department: initial.department || "",
    employmentType: initial.employmentType || "", type: initial.type || 0, closingDate: initial.closingDate || "", closingTime: initial.closingTime || "",
    jobDescription: initial.jobDescription || "", keyDuties: (initial.keyDuties || []).join("\n"), qualifications: (initial.qualifications || []).join("\n"), skills: (initial.skills || []).join("\n"),
    questions: (initial.preScreeningQuestions || []).map(q => ({ text: q.text, type: q.type || 0 })),
  } : { designation: "", unit: "", department: "", employmentType: "", type: 0, closingDate: "", closingTime: "", jobDescription: "", keyDuties: "", qualifications: "", skills: "", questions: [] });
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const L = lookups || {};
  const valid = f.designation && f.department && f.unit && f.employmentType && f.closingDate && f.jobDescription && f.keyDuties;
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title={initial ? "Edit Job Posting" : "Create Job Posting"} subtitle="Provide request details for hiring a staff." />
      <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UI.Field label="Job Title" required className="min-w-0"><Combobox value={f.designation} onChange={v => set("designation", v)} options={L.jobTitles || []} placeholder="Select job title" noDataText="No job title found" /></UI.Field>
          <UI.Field label="Unit/Branch" required className="min-w-0"><Combobox value={f.unit} onChange={v => set("unit", v)} options={L.orgUnits || []} placeholder="Select unit/branch" noDataText="No unit/branch found" /></UI.Field>
          <UI.Field label="Department" required className="min-w-0"><Combobox value={f.department} onChange={v => set("department", v)} options={L.departments || []} placeholder="Select department" noDataText="No department found" /></UI.Field>
          <UI.Field label="Employment Type" required className="min-w-0"><Combobox value={f.employmentType} onChange={v => set("employmentType", v)} options={PD_EMP_TYPES} placeholder="Select employment type" noDataText="No employment type found" /></UI.Field>
          <UI.Field label="Closing Date" required className="min-w-0"><UI.DatePicker withTime value={f.closingDate} onSelect={d => { set("closingDate", d ? d.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }) : ""); if (d) set("closingTime", d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })); }} placeholder="Pick closing date & time" /></UI.Field>
        </div>
        <UI.Field label="Job Description" required><UI.RichText value={f.jobDescription} onChange={v => set("jobDescription", v)} placeholder="Enter job description" /></UI.Field>
        <UI.Field label="Key Duties" required><UI.RichText value={f.keyDuties} onChange={v => set("keyDuties", v)} placeholder="Enter key duties" /></UI.Field>
        <UI.Field label="Qualifications and Experience"><UI.RichText value={f.qualifications} onChange={v => set("qualifications", v)} placeholder="Enter qualifications and experience requirements" /></UI.Field>
        <UI.Field label="Skills Required"><UI.RichText value={f.skills} onChange={v => set("skills", v)} placeholder="Enter required skills" /></UI.Field>
        <UI.Field label="Posting Type"><UI.RadioPillGroup options={JOB_TYPES} value={String(f.type)} onValueChange={v => set("type", Number(v))} /></UI.Field>
        <div className="space-y-3">
          <UI.Label>Pre-screening Questions</UI.Label>
          {f.questions.length === 0 && <p className="text-sm text-muted-foreground">No pre-screening questions added. Click “Add Pre-screening Questions” to add one.</p>}
          <div className="flex flex-col gap-4">
            {f.questions.map((q, i) => (
              <UI.QuestionItem key={i} question={q} index={i}
                onChange={(field, val) => set("questions", f.questions.map((x, j) => j === i ? { ...x, [field]: val } : x))}
                onRemove={() => set("questions", f.questions.filter((_, j) => j !== i))} />
            ))}
            <button type="button" className="flex items-center gap-2 font-medium text-sm text-primary self-start" onClick={() => set("questions", [...f.questions, { text: "", type: 0 }])}><i className="ri-add-line" />Add Pre-screening Questions</button>
          </div>
        </div>
        <div className="flex justify-end gap-4 pt-4">
          <UI.Button variant="outline" onClick={onCancel}>Cancel</UI.Button>
          <UI.Button disabled={!valid} onClick={() => valid && onSubmit(f)}>{initial ? "Update Posting" : "Post Job"}</UI.Button>
        </div>
      </div>
    </div>
  );
}

// ── list ──
function JobPostsScreen({ onToast, lookups, onSubPage }) {
  const [careers, setCareers] = useStore(window.HRStores.careers);
  const [view, setView] = usePD({ name: "list" });
  const [q, setQ] = usePD("");
  const [statusTab, setStatusTab] = usePD("all");
  const [fJob, setFJob] = usePD(""); const [fDept, setFDept] = usePD("");
  const [applied, setApplied] = usePD({ job: "", dept: "" });

  React.useEffect(() => {
    if (!onSubPage) return;
    const toList = () => setView({ name: "list" });
    if (view.name === "create") onSubPage({ trail: [{ label: "Job Posts", onClick: toList }, { label: "Create Job Posting" }] });
    else if (view.name === "detail") { const p = careers.postings.find(x => x.id === view.postingId); onSubPage({ trail: [{ label: "Job Posts", onClick: toList }, { label: (p && p.designation) || "Posting Details" }] }); }
    else if (view.name === "application") { const p = careers.postings.find(x => x.id === view.postingId); const a = (careers.applications[view.postingId] || []).find(x => x.id === view.appId); onSubPage({ trail: [{ label: "Job Posts", onClick: toList }, { label: (p && p.designation) || "Posting", onClick: () => setView({ name: "detail", postingId: view.postingId }) }, { label: (a && a.applicantName) || "Application" }] }); }
    else if (view.name === "assessment") { const p = careers.postings.find(x => x.id === view.postingId); onSubPage({ trail: [{ label: "Job Posts", onClick: toList }, { label: (p && p.designation) || "Posting", onClick: () => setView({ name: "detail", postingId: view.postingId }) }, { label: (p && p.isInterviewAssessmentCreated) ? "Edit Assessment" : "Create Assessment" }] }); }
    else if (view.name === "edit") onSubPage({ trail: [{ label: "Job Posts", onClick: toList }, { label: "Edit Job Posting" }] });
    else onSubPage(null);
    return () => onSubPage(null);
  }, [view]);

  const lines = (s) => (s || "").split("\n").map(x => x.trim()).filter(Boolean);
  const formToPosting = (f) => ({ designation: f.designation, department: f.department, organizationalUnit: f.unit, employmentType: f.employmentType, type: f.type, closingDate: f.closingDate, closingTime: f.closingTime, jobDescription: f.jobDescription, keyDuties: lines(f.keyDuties), qualifications: lines(f.qualifications), skills: lines(f.skills), preScreeningQuestions: f.questions.filter(q => q.text && q.text.trim()).map(q => ({ text: q.text, type: q.type })) });
  const archivePost = (p) => { setCareers(s => ({ ...s, postings: s.postings.filter(x => x.id !== p.id) })); onToast && onToast("Job Posting Archived", { tone: "error" }); };

  if (view.name === "create") {
    const submit = (f) => {
      const id = "jp-" + (++_pdid);
      setCareers(s => ({ ...s, postings: [{ id, status: "Active", isInterviewAssessmentCreated: false, assessment: null, ...formToPosting(f) }, ...s.postings], applications: { ...s.applications, [id]: [] } }));
      setView({ name: "list" }); onToast && onToast("Job Posting Created", { tone: "success" });
    };
    return <JobPostingForm onCancel={() => setView({ name: "list" })} onSubmit={submit} lookups={lookups} />;
  }
  if (view.name === "edit") {
    const p = careers.postings.find(x => x.id === view.postingId);
    const submit = (f) => { setCareers(s => ({ ...s, postings: s.postings.map(x => x.id === view.postingId ? { ...x, ...formToPosting(f) } : x) })); onToast && onToast("Job Posting Updated", { tone: "success" }); setView({ name: "list" }); };
    return <JobPostingForm initial={p} onCancel={() => setView({ name: "list" })} onSubmit={submit} lookups={lookups} />;
  }
  if (view.name === "application") return <ApplicationDetailScreen postingId={view.postingId} appId={view.appId} onBack={() => setView({ name: "detail", postingId: view.postingId })} onToast={onToast} />;
  if (view.name === "assessment") return <AssessmentForm posting={careers.postings.find(p => p.id === view.postingId)} onCancel={() => setView({ name: "detail", postingId: view.postingId })} onSave={(constructs) => { setCareers(s => ({ ...s, postings: s.postings.map(p => p.id === view.postingId ? { ...p, assessment: { constructs }, isInterviewAssessmentCreated: true } : p) })); onToast && onToast("Assessment Saved", { tone: "success" }); setView({ name: "detail", postingId: view.postingId }); }} />;
  if (view.name === "detail") return <PostingDetailScreen postingId={view.postingId} onOpenApp={(appId) => setView({ name: "application", postingId: view.postingId, appId })} onEditAssessment={() => setView({ name: "assessment", postingId: view.postingId })} onToast={onToast} />;

  // ---- list ----
  const posts = careers.postings;
  const appsAll = Object.values(careers.applications).flat();
  const stats = {
    total: posts.length,
    active: posts.filter(p => p.status !== "Closed").length,
    interviewed: appsAll.filter(a => a.interview || a.status >= 2).length,
    applications: appsAll.length,
    shortlisted: appsAll.filter(a => a.status === 1 || (a.shortlist && a.shortlist.status === "approved")).length,
  };
  const rows = posts.filter(p =>
    p.designation.toLowerCase().includes(q.toLowerCase()) &&
    (statusTab === "all" || (statusTab === "active" ? p.status !== "Closed" : p.status === "Closed")) &&
    (!applied.job || p.designation === applied.job) &&
    (!applied.dept || p.department === applied.dept));
  const countFor = (id) => (careers.applications[id] || []).length;
  const L = lookups || {};
  const jpTabs = (
    <UI.Tabs value={statusTab} onValueChange={setStatusTab}>
      <UI.TabsList><UI.TabsTrigger value="all">All</UI.TabsTrigger><UI.TabsTrigger value="active">Active</UI.TabsTrigger><UI.TabsTrigger value="closed">Closed</UI.TabsTrigger></UI.TabsList>
    </UI.Tabs>
  );
  const jpFilters = (
    <React.Fragment>
      <UI.FilterField label="Job Title"><Combobox value={fJob} onChange={setFJob} options={L.jobTitles || []} placeholder="Select a job title" noDataText="No job title found" /></UI.FilterField>
      <UI.FilterField label="Department"><Combobox value={fDept} onChange={setFDept} options={L.departments || []} placeholder="Select a department" noDataText="No department found" /></UI.FilterField>
    </React.Fragment>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title="Job Postings" subtitle="Manage and track all job postings"
        actions={<UI.Button icon="add-line" onClick={() => setView({ name: "create" })}>Create Job Post</UI.Button>} />
      <div className="jp-split">
        <div className="card jp-stats" style={{ padding: 20 }}>
          <div className="jp-stat-grid">
            {[["Total Job Posts", stats.total], ["Active Job Posts", stats.active], ["Total Interviewed", stats.interviewed], ["Total Applications", stats.applications], ["Shortlisted", stats.shortlisted]].map(([t, v], i) => <UI.StatCard key={t} title={t} value={v} index={i} />)}
          </div>
        </div>
        <div className="card jp-table" style={{ padding: 20 }}>
          <div className="bh-tablebox">
          <UI.FilterBar left={jpTabs} search={q} onSearch={setQ} searchPlaceholder="Search postings…"
            filters={jpFilters} onReset={() => { setFJob(""); setFDept(""); setApplied({ job: "", dept: "" }); }}
            onApply={() => setApplied({ job: fJob, dept: fDept })} />
        <table className="bh">
          <thead><tr><th>Date Posted</th><th>Job Title</th><th>Department</th><th>No. of Applicants</th><th>Closing Date</th><th>Status</th><th style={{ width: 60 }}></th></tr></thead>
          <tbody>
            {rows.map(p => (
              <tr key={p.id} style={{ cursor: "pointer" }} onClick={() => setView({ name: "detail", postingId: p.id })}>
                <td style={{ color: "var(--gray-500)" }}>{p.datePosted || p.postedAgo || "—"}</td>
                <td style={{ fontWeight: 600 }}>{p.designation}</td>
                <td>{p.department}</td>
                <td>{countFor(p.id)}</td>
                <td style={{ color: "var(--gray-500)" }}>{p.closingDate}</td>
                <td><StatusBadge variant={p.status === "Closed" ? "closed" : "active"} text={p.status === "Closed" ? "Closed" : "Active"} size="sm" /></td>
                <td style={{ textAlign: "right" }}>
                  <UI.RowActions actions={[
                    { label: "View Details", icon: "eye-line", onClick: () => setView({ name: "detail", postingId: p.id }) },
                    { label: "Edit", icon: "edit-line", onClick: () => setView({ name: "edit", postingId: p.id }) },
                    { label: "Archive", icon: "delete-bin-line", danger: true, onClick: () => archivePost(p) },
                  ]} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between px-4 py-4 border-t border-gray-100">
          <span className="text-sm font-medium text-gray-900">Page 1 of 1</span>
          <div className="flex gap-2"><UI.Button variant="outline" size="sm" disabled>Previous</UI.Button><UI.Button variant="outline" size="sm" disabled>Next</UI.Button></div>
        </div>
          </div>
      </div>
      </div>
    </div>
  );
}

Object.assign(window, { JobPostsScreen, PostingDetailScreen, JobPostingForm, AssessmentForm });
