// BISTA HR · careers/HiringRequests — Recruitment ▸ Hiring Requests.
// Mirrors the codebase JobHireRequests flow:
//   raise (CreateHiringRequestPayload) → Pending → approver reviews in a detail modal
//   → Approve (optional evaluationReason + jobGrade override) or Reject (rejectionReason).
// Status enum = ApprovalStatus (Pending 0 / Approved 1 / Rejected 2). On approval an
// approved request can be handed to "Create Job Post".
const { useState: useHR } = React;

// ---- seed store (shape mirrors HiringRequestDetail) ----
const HR_VACANCY_REASONS = ["New Position", "Replacement", "Business Expansion", "Restructuring", "Seasonal Demand"];
const HR_JOB_STATUS = { 0: "New Role", 1: "Existing Role" };

let _hrid = 7000;
const _hr = (r) => ({
  id: ++_hrid,
  numberOfVacancies: 1, jobStatus: 0, status: "Pending",
  evaluatedBy: null, evaluatedAt: null, evaluationReason: null, rejectionReason: null,
  ...r,
});

const HIRING_REQUESTS = [
  _hr({ designation: "Finance Analyst", department: "Finance", jobGrade: "Grade 2", numberOfVacancies: 1, vacancyReason: "Replacement", justificationForHire: "Backfill following the resignation of the previous analyst; the role is critical to monthly close.", startDate: "01 Mar, 2025", jobStatus: 1, status: "Approved", requestedBy: "Franklin Brobbey", createdAt: "04 Jan, 2025", evaluatedBy: "Olivia Bennett", evaluatedAt: "07 Jan, 2025", evaluationReason: "Approved — replacement is budgeted for FY25." }),
  _hr({ designation: "Software Engineer", department: "Information Technology", jobGrade: "Grade 2", numberOfVacancies: 2, vacancyReason: "Business Expansion", justificationForHire: "Two additional engineers needed to deliver the internal HR platform roadmap on schedule.", startDate: "15 Mar, 2025", jobStatus: 0, status: "Pending", requestedBy: "Bright Manu", createdAt: "09 Jan, 2025" }),
  _hr({ designation: "HR Officer", department: "Human Resource", jobGrade: "Grade 2", numberOfVacancies: 1, vacancyReason: "Replacement", justificationForHire: "Maintain HR operations coverage after internal transfer of the current officer.", startDate: "20 Feb, 2025", jobStatus: 1, status: "Approved", requestedBy: "Emmanuel Ansah", createdAt: "12 Jan, 2025", evaluatedBy: "Olivia Bennett", evaluatedAt: "14 Jan, 2025", evaluationReason: "Approved." }),
  _hr({ designation: "Marketing Lead", department: "Marketing", jobGrade: "Grade 3", numberOfVacancies: 1, vacancyReason: "New Position", justificationForHire: "New leadership role to own brand and growth across the Bistasol portfolio.", startDate: "01 Apr, 2025", jobStatus: 0, status: "Pending", requestedBy: "Samuel Boateng", createdAt: "15 Jan, 2025" }),
  _hr({ designation: "Procurement Officer", department: "Operations", jobGrade: "Grade 2", numberOfVacancies: 1, vacancyReason: "Replacement", justificationForHire: "Cover sourcing and supplier management at the Tema depot.", startDate: "10 Mar, 2025", jobStatus: 1, status: "Rejected", requestedBy: "Leslie Alexandre", createdAt: "18 Jan, 2025", evaluatedBy: "Olivia Bennett", evaluatedAt: "21 Jan, 2025", rejectionReason: "On hold — depot headcount frozen pending Q2 review." }),
  _hr({ designation: "Data Engineer", department: "Information Technology", jobGrade: "Grade 3", numberOfVacancies: 1, vacancyReason: "Business Expansion", justificationForHire: "Build and own the reporting data pipeline feeding the analytics dashboards.", startDate: "01 Apr, 2025", jobStatus: 0, status: "Approved", requestedBy: "Bright Manu", createdAt: "22 Jan, 2025", evaluatedBy: "Olivia Bennett", evaluatedAt: "24 Jan, 2025", evaluationReason: "Approved at Grade 3." }),
  _hr({ designation: "Internal Auditor", department: "Finance", jobGrade: "Grade 3", numberOfVacancies: 1, vacancyReason: "New Position", justificationForHire: "Stand up an internal audit function to strengthen controls across the group.", startDate: "15 Apr, 2025", jobStatus: 0, status: "Pending", requestedBy: "Olivia Bennett", createdAt: "03 Feb, 2025" }),
];

window.HRStores = window.HRStores || {};
window.HRStores.hiring = window.HRStores.hiring || makeStore({ requests: HIRING_REQUESTS });

const HR_STATUS_VARIANT = { Pending: "pending", Approved: "approved", Rejected: "rejected" };
const HR_TABS = ["All", "Pending", "Approved"];
const HR_STATUSES = ["Pending", "Approved", "Rejected"];

// ---- create form (full page) — mirrors HiringRequestForm.tsx ----
function HiringRequestForm({ onCancel, onSubmit, lookups }) {
  const [f, setF] = useHR({ designation: "", numberOfVacancies: "", vacancyReason: "", department: "", justificationForHire: "", startDate: "", jobStatus: "", jobGrade: "" });
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const L = lookups || {};
  const valid = f.designation && f.numberOfVacancies && f.vacancyReason && f.department && f.justificationForHire.trim() && f.startDate && f.jobStatus && f.jobGrade;
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Create Hiring Request" subtitle="Provide request details for hiring new staff members." />
      <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UI.Field label="Job Title" required className="min-w-0"><Combobox value={f.designation} onChange={v => set("designation", v)} options={L.jobTitles || []} placeholder="Select a job title" noDataText="No job titles found" /></UI.Field>
          <UI.Field label="Number of Vacancies" required className="min-w-0"><UI.Input type="number" min="1" value={f.numberOfVacancies} onChange={e => set("numberOfVacancies", e.target.value)} placeholder="Enter number of vacancies" /></UI.Field>
          <UI.Field label="Vacancy Reason" required className="min-w-0"><Combobox value={f.vacancyReason} onChange={v => set("vacancyReason", v)} options={HR_VACANCY_REASONS} placeholder="Select a reason for the vacancy" /></UI.Field>
          <UI.Field label="Department" required className="min-w-0"><Combobox value={f.department} onChange={v => set("department", v)} options={L.departments || []} placeholder="Select a department" noDataText="No departments found" /></UI.Field>
        </div>
        <UI.Field label="Justification for Hire" required><UI.Textarea rows={4} value={f.justificationForHire} onChange={e => set("justificationForHire", e.target.value)} placeholder="Provide a detailed justification for this hiring request..." /></UI.Field>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UI.Field label="Start Date" required className="min-w-0"><UI.DatePicker value={f.startDate} onSelect={d => set("startDate", d ? d.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }) : "")} placeholder="Pick a date" /></UI.Field>
          <UI.Field label="Job Status" required className="min-w-0">
            <div className="pt-2 flex flex-row gap-6 items-center">
              {[["new", "New Job Title"], ["existing", "Existing Job Title"]].map(([v, l]) => (
                <label key={v} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={f.jobStatus === v} onChange={() => set("jobStatus", v)} />
                  <span className="text-sm font-medium text-gray-900">{l}</span>
                </label>
              ))}
            </div>
          </UI.Field>
          <UI.Field label="Job Grade" required className="min-w-0"><Combobox value={f.jobGrade} onChange={v => set("jobGrade", v)} options={L.jobGrades || []} placeholder="Select a job grade" noDataText="No job grades found" /></UI.Field>
        </div>
        <div className="flex justify-end gap-4 pt-4">
          <UI.Button variant="outline" onClick={onCancel}>Cancel</UI.Button>
          <UI.Button disabled={!valid} onClick={() => valid && onSubmit(f)}>Submit Request</UI.Button>
        </div>
      </div>
    </div>
  );
}

// ---- detail + approve / reject ----
function HiringRequestDetailModal({ req, onClose, onApprove, onReject, onCreatePost, lookups }) {
  const [mode, setMode] = useHR(null); // null | 'approve' | 'reject'
  const [reason, setReason] = useHR("");
  const [grade, setGrade] = useHR(req.jobGrade);
  const editable = req.status === "Pending";
  const Item = ({ label, value, full }) => (
    <div style={full ? { gridColumn: "1 / -1" } : null}>
      <div className="bh-caption">{label}</div>
      <div style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 14, color: "var(--gray-900)", marginTop: 3, textWrap: "pretty" }}>{value || "—"}</div>
    </div>
  );
  return (
    <Modal onClose={onClose} width={680}>
      <div style={{ padding: "22px 24px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 20, color: "var(--gray-900)" }}>Hiring Request Details</div>
          <div className="bh-body" style={{ marginTop: 3 }}>Review all details to approve or decline this request.</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <StatusBadge variant={HR_STATUS_VARIANT[req.status]} text={req.status} />
          <button className="btn btn-icon btn-ghost" onClick={onClose} style={{ width: 32, height: 32, padding: 0 }}><Icon name="close-line" size={20} color="var(--gray-500)" /></button>
        </div>
      </div>

      <div style={{ padding: "18px 24px 8px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "18px 16px" }}>
          <Item label="Designation" value={req.designation} />
          <Item label="Department" value={req.department} />
          <Item label="Job Grade" value={req.jobGrade} />
          <Item label="Vacancies" value={req.numberOfVacancies} />
          <Item label="Role Type" value={HR_JOB_STATUS[req.jobStatus]} />
          <Item label="Expected Start" value={req.startDate} />
          <Item label="Vacancy Reason" value={req.vacancyReason} />
          <Item label="Requested By" value={req.requestedBy} />
          <Item label="Date Requested" value={req.createdAt} />
          <Item label="Justification for Hire" value={req.justificationForHire} full />
        </div>

        {req.status !== "Pending" && (
          <div style={{ marginTop: 18, padding: "14px 16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)",
            background: req.status === "Approved" ? "var(--success-tint)" : "var(--error-tint)" }}>
            <div className="bh-caption">{req.status === "Approved" ? "Approved By" : "Rejected By"}</div>
            <div style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 14, color: "var(--gray-900)", marginTop: 3 }}>{req.evaluatedBy} · {req.evaluatedAt}</div>
            <div style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--gray-700)", marginTop: 6 }}>{req.evaluationReason || req.rejectionReason}</div>
          </div>
        )}

        {editable && mode === "approve" && (
          <div style={{ marginTop: 18, padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--gray-25)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Confirm Job Grade"><Combobox value={grade} onChange={setGrade} options={(lookups && lookups.jobGrades) || []} placeholder="Select grade" /></Field>
              <Field label="Evaluation Note" optional><Input value={reason} onChange={e => setReason(e.target.value)} placeholder="Optional note" /></Field>
            </div>
          </div>
        )}
        {editable && mode === "reject" && (
          <div style={{ marginTop: 18 }}>
            <Field label="Rejection Reason"><Textarea rows={2} value={reason} onChange={e => setReason(e.target.value)} placeholder="Explain why this request is declined" /></Field>
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: 20, borderTop: "1px solid var(--divider)" }}>
        {!editable
          ? (req.status === "Approved"
              ? <Button variant="primary" icon="megaphone-line" onClick={() => onCreatePost(req)}>Create Job Post</Button>
              : <Button variant="stroke" onClick={onClose}>Close</Button>)
          : mode === null
            ? <React.Fragment>
                <Button variant="stroke" icon="close-line" onClick={() => { setMode("reject"); setReason(""); }} style={{ color: "var(--error)", borderColor: "var(--error-tint)" }}>Decline</Button>
                <Button variant="primary" icon="check-line" onClick={() => { setMode("approve"); setReason(""); }}>Approve</Button>
              </React.Fragment>
            : mode === "approve"
              ? <React.Fragment>
                  <Button variant="stroke" onClick={() => setMode(null)}>Back</Button>
                  <Button variant="primary" icon="check-line" onClick={() => onApprove(req.id, { evaluationReason: reason, jobGrade: grade })}>Confirm Approval</Button>
                </React.Fragment>
              : <React.Fragment>
                  <Button variant="stroke" onClick={() => setMode(null)}>Back</Button>
                  <Button variant="primary" icon="close-line" disabled={!reason.trim()} onClick={() => onReject(req.id, reason)} style={{ background: "var(--error)", borderColor: "var(--error)" }}>Confirm Decline</Button>
                </React.Fragment>}
      </div>
    </Modal>
  );
}

function HiringRequestsScreen({ onToast, lookups, onCreatePost, onSubPage }) {
  const [store, setStore] = useStore(window.HRStores.hiring);
  const [view, setView] = useHR("list");
  const [filter, setFilter] = useHR("All");
  const [q, setQ] = useHR("");
  const [fDept, setFDept] = useHR(""); const [fStatus, setFStatus] = useHR(""); const [fStart, setFStart] = useHR(""); const [fCreated, setFCreated] = useHR("");
  const [applied, setApplied] = useHR({ dept: "", status: "" });
  const [detail, setDetail] = useHR(null);
  const L = lookups || {};

  React.useEffect(() => {
    if (!onSubPage) return;
    if (view === "create") onSubPage({ trail: [{ label: "Hiring Requests", onClick: () => setView("list") }, { label: "Create Hiring Request" }] });
    else onSubPage(null);
    return () => onSubPage(null);
  }, [view]);

  const rows = store.requests.filter(r =>
    (filter === "All" || r.status === filter) &&
    (!applied.dept || r.department === applied.dept) &&
    (!applied.status || r.status === applied.status) &&
    (r.designation.toLowerCase().includes(q.toLowerCase()) || r.department.toLowerCase().includes(q.toLowerCase())));

  const create = (f) => {
    setStore(s => ({ ...s, requests: [_hr({ ...f, numberOfVacancies: Number(f.numberOfVacancies) || 1, jobStatus: f.jobStatus === "existing" ? 1 : 0, requestedBy: (window.ME && window.ME.name) || "You", createdAt: "Today", status: "Pending" }), ...s.requests] }));
    setView("list");
    onToast && onToast("Hiring request created successfully", { tone: "success" });
  };
  const approve = (id, { evaluationReason, jobGrade }) => {
    setStore(s => ({ ...s, requests: s.requests.map(r => r.id === id ? { ...r, status: "Approved", jobGrade: jobGrade || r.jobGrade, evaluatedBy: (window.ME && window.ME.name) || "You", evaluatedAt: "Today", evaluationReason: evaluationReason || "Approved." } : r) }));
    setDetail(null);
    onToast && onToast("Hiring request approved successfully", { tone: "success" });
  };
  const reject = (id, rejectionReason) => {
    setStore(s => ({ ...s, requests: s.requests.map(r => r.id === id ? { ...r, status: "Rejected", evaluatedBy: (window.ME && window.ME.name) || "You", evaluatedAt: "Today", rejectionReason } : r) }));
    setDetail(null);
    onToast && onToast("Hiring request rejected successfully", { tone: "error" });
  };
  const cancelReq = (id) => {
    setStore(s => ({ ...s, requests: s.requests.filter(r => r.id !== id) }));
    onToast && onToast("Hiring request cancelled", { tone: "error" });
  };

  if (view === "create") return <HiringRequestForm onCancel={() => setView("list")} onSubmit={create} lookups={lookups} />;

  const hrTabs = <UI.Tabs value={filter} onValueChange={setFilter}><UI.TabsList>{HR_TABS.map(s => <UI.TabsTrigger key={s} value={s}>{s}</UI.TabsTrigger>)}</UI.TabsList></UI.Tabs>;
  const hrFilters = (
    <React.Fragment>
      <UI.FilterField label="Department"><Combobox value={fDept} onChange={setFDept} options={L.departments || []} placeholder="Select a department" noDataText="No department found" /></UI.FilterField>
      <UI.FilterField label="Status"><Combobox value={fStatus} onChange={setFStatus} options={HR_STATUSES} placeholder="Select a status" noDataText="No status found" /></UI.FilterField>
      <UI.FilterField label="Start Date"><UI.DatePicker value={fStart} onSelect={d => setFStart(d ? d.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }) : "")} placeholder="Select a start date" /></UI.FilterField>
      <UI.FilterField label="Date Created"><UI.DatePicker value={fCreated} onSelect={d => setFCreated(d ? d.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }) : "")} placeholder="Select a date created" /></UI.FilterField>
    </React.Fragment>
  );
  const rowActions = (r) => r.status === "Approved"
    ? [{ label: "View Details", short: "View", icon: "eye-line", onClick: () => setDetail(r) }, { label: "Post Job", short: "Post", icon: "megaphone-line", onClick: () => onCreatePost && onCreatePost(r) }]
    : r.status === "Pending"
      ? [{ label: "View Details", short: "View", icon: "eye-line", onClick: () => setDetail(r) }, { label: "Cancel Request", short: "Cancel", icon: "close-circle-line", danger: true, onClick: () => cancelReq(r.id) }]
      : [{ label: "View Details", short: "View", icon: "eye-line", onClick: () => setDetail(r) }];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title="Hiring Request" subtitle="See all hiring requests submitted"
        actions={<UI.Button icon="add-line" onClick={() => setView("create")}>Request to Hire</UI.Button>} />
      <div className="card" style={{ padding: 20 }}>
        <div className="bh-tablebox">
        <UI.FilterBar left={hrTabs} search={q} onSearch={setQ} searchPlaceholder="Search…"
          filters={hrFilters} onReset={() => { setFDept(""); setFStatus(""); setFStart(""); setFCreated(""); setApplied({ dept: "", status: "" }); }}
          onApply={() => setApplied({ dept: fDept, status: fStatus })} />
        {rows.length === 0
          ? <EmptyState compact title="No hiring requests" subtitle="There is no data to show you right now." />
          : <table className="bh">
              <thead><tr><th>Date Created</th><th>Job Title</th><th>Vacancies</th><th>Department</th><th>Start Date</th><th>Status</th><th style={{ width: 60 }}></th></tr></thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id} style={{ cursor: "pointer" }} onClick={() => setDetail(r)}>
                    <td style={{ color: "var(--gray-500)" }}>{r.createdAt}</td>
                    <td style={{ fontWeight: 600 }}>{r.designation}</td>
                    <td>{r.numberOfVacancies}</td>
                    <td>{r.department}</td>
                    <td style={{ color: "var(--gray-500)" }}>{r.startDate}</td>
                    <td><StatusBadge variant={HR_STATUS_VARIANT[r.status]} text={r.status} size="sm" /></td>
                    <td style={{ textAlign: "right" }}><UI.RowActions actions={rowActions(r)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>}
        <div className="flex items-center justify-between px-4 py-4 border-t border-gray-100">
          <span className="text-sm font-medium text-gray-900">Page 1 of 1</span>
          <div className="flex gap-2"><UI.Button variant="outline" size="sm" disabled>Previous</UI.Button><UI.Button variant="outline" size="sm" disabled>Next</UI.Button></div>
        </div>
        </div>
      </div>

      {detail && <HiringRequestDetailModal req={store.requests.find(r => r.id === detail.id) || detail}
        onClose={() => setDetail(null)} onApprove={approve} onReject={reject} lookups={lookups}
        onCreatePost={(req) => { setDetail(null); onCreatePost && onCreatePost(req); }} />}
    </div>
  );
}

Object.assign(window, { HiringRequestsScreen, HiringRequestForm, HiringRequestDetailModal, HIRING_REQUESTS });
