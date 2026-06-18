// BISTA HR · engagement/disciplinary/DisciplinaryScreen — list + create + details + controller.
const { useState: useDiscS, useEffect: useDiscSEffect } = React;

/* ---------- list (Reports | Pending Decisions) ---------- */
function DisciplinaryList({ cases, q, setQ, onCreate, onOpen, departments }) {
  const [tab, setTab] = useDiscS("reports");
  const [menu, setMenu] = useDiscS(null);
  const [filterOpen, setFilterOpen] = useDiscS(false);
  const [f, setF] = useDiscS({ department: "", reportStage: "", caseNumber: "" });
  const [applied, setApplied] = useDiscS({ department: "", reportStage: "", caseNumber: "" });
  const setFilter = (k, v) => setF(s => ({ ...s, [k]: v }));

  const base = tab === "pending" ? cases.filter(c => c.status === "pending") : cases;
  const shown = base.filter(c =>
    (q === "" || `${c.title} ${c.caseNumber} ${c.department}`.toLowerCase().includes(q.toLowerCase()))
    && (!applied.department || c.department === applied.department)
    && (!applied.reportStage || c.stage === applied.reportStage)
    && (!applied.caseNumber || c.caseNumber.toLowerCase().includes(applied.caseNumber.toLowerCase())));
  const pg = usePaged(shown, 10);

  const apply = () => { setApplied(f); setFilterOpen(false); };
  const reset = () => { const e = { department: "", reportStage: "", caseNumber: "" }; setF(e); setApplied(e); };

  return (
    <div className="card" style={{ overflow: "visible", padding: 20 }}>
      <div className="bh-tablebox">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "14px 20px", borderBottom: "1px solid var(--border)", flexWrap: "wrap" }}>
        <div className="seg" style={{ background: "#F6F8FA" }}>
          <button className={tab === "reports" ? "active" : ""} onClick={() => { setTab("reports"); setMenu(null); }}>Reports</button>
          <button className={tab === "pending" ? "active" : ""} onClick={() => { setTab("pending"); setMenu(null); }}>Pending Decisions</button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="input-wrap" style={{ width: 240, padding: "7px 12px" }}>
            <Icon name="search-2-line" size={18} style={{ color: "var(--icon-default)" }} />
            <input placeholder="Search" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <Button variant="stroke" size="sm" icon="equalizer-line" onClick={() => setFilterOpen(o => !o)}>{filterOpen ? "Hide Filter" : "Show Filter"}</Button>
        </div>
      </div>

      {filterOpen && (
        <div style={{ margin: "14px 20px", border: "1px solid #F0F1F3", background: "#FAFAFA", borderRadius: 10, padding: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Department"><Combobox value={f.department} onChange={v => setFilter("department", v)} options={departments} placeholder="Select a department" /></Field>
            <Field label="Report Stage"><Select value={f.reportStage} onChange={e => setFilter("reportStage", e.target.value)} options={REPORT_STAGES} placeholder="Select a report stage" /></Field>
            <Field label="Case Number"><Input placeholder="Enter case number" value={f.caseNumber} onChange={e => setFilter("caseNumber", e.target.value)} /></Field>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
            <Button variant="stroke" size="sm" onClick={reset}>Reset filter</Button>
            <Button variant="primary" size="sm" onClick={apply}>Apply Filters</Button>
          </div>
        </div>
      )}

      {base.length === 0
        ? <EmptyState title={tab === "pending" ? "No Pending Decisions" : "No Cases Found"}
            subtitle={tab === "pending" ? "There are no cases pending decision at the moment." : "Get started by creating your first case."}
            cta={tab === "reports" ? "Create a case" : undefined} onAction={tab === "reports" ? onCreate : undefined} />
        : <table className="bh">
            <thead><tr><th>Date Created</th><th>Theme</th><th>Case Number</th><th>Department</th><th>Implicated Employee(s)</th><th>Report Stage</th><th style={{ width: 48 }}></th></tr></thead>
            <tbody>
              {pg.pageItems.map(c => (
                <tr key={c.id} style={{ cursor: "pointer" }} onClick={() => onOpen(c)}>
                  <td>{discFmt(c.createdAt)}</td><td>{c.title}</td><td>{c.caseNumber}</td><td>{c.department}</td>
                  <td><AvatarStack employees={c.implicatedEmployees} /></td>
                  <td><StageBadge stage={c.stage} /></td>
                  <td style={{ position: "relative", textAlign: "right" }} onClick={e => e.stopPropagation()}>
                    <button className="btn btn-icon btn-ghost" style={{ width: 28, height: 28, padding: 0 }} onClick={() => setMenu(menu === c.id ? null : c.id)}>
                      <Icon name="more-fill" size={18} color="var(--gray-400)" />
                    </button>
                    {menu === c.id && (
                      <div onMouseLeave={() => setMenu(null)} style={{ position: "absolute", right: 16, top: 40, zIndex: 20, background: "#fff",
                        borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-pop)", padding: 6, minWidth: 150, display: "flex", flexDirection: "column" }}>
                        <button className="menu-item" onClick={() => { setMenu(null); onOpen(c); }}><Icon name="eye-line" size={16} />View Details</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {shown.length === 0 && <tr><td colSpan={7} style={{ padding: 0 }}><EmptyState compact title="No results found" subtitle="No case matches your filters." /></td></tr>}
            </tbody>
          </table>}
      {base.length > 0 && shown.length > 0 && <div style={{ borderTop: "1px solid var(--divider)" }}><Pagination page={pg.page} pages={pg.pages} onPrev={pg.prev} onNext={pg.next} /></div>}
      </div>
    </div>
  );
}

/* ---------- create case (full page) ---------- */
function CreateCaseForm({ departments, employees, onCancel, onSubmit }) {
  const [form, setForm] = useDiscS({ title: "", departmentId: "", dateOfIncident: "", implicatedEmployeeIds: [], description: "", attachments: [] });
  const [errors, setErrors] = useDiscS({});
  const set = (k, v) => { setForm(s => ({ ...s, [k]: v })); if (errors[k]) setErrors(e => ({ ...e, [k]: "" })); };
  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.departmentId) e.departmentId = "Department is required";
    if (!form.dateOfIncident.trim()) e.dateOfIncident = "Date of incident is required";
    if (!form.description.trim()) e.description = "Description is required";
    if (form.implicatedEmployeeIds.length === 0) e.implicatedEmployeeIds = "At least one implicated employee is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  return (
    <div className="card" style={{ padding: "var(--card-pad, 24px)", overflow: "visible", maxWidth: 900 }}>
      <div style={{ marginBottom: 20 }}>
        <div className="bh-h2" style={{ fontSize: 24 }}>Create a Case</div>
        <div className="bh-body" style={{ marginTop: 4 }}>Report a disciplinary incident and the implicated employees.</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <Field label="Title of Case/Incident" hint={errors.title}><Input placeholder="Enter a theme for this case" value={form.title} onChange={e => set("title", e.target.value)} /></Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <Field label="Department" hint={errors.departmentId}><Combobox value={form.departmentId} onChange={v => set("departmentId", v)} options={departments} placeholder="Select a department" /></Field>
          <Field label="Date of incident" hint={errors.dateOfIncident}><Input placeholder="DD / MM / YYYY" value={form.dateOfIncident} onChange={e => set("dateOfIncident", e.target.value)} /></Field>
        </div>
        <Field label="Who is/are the implicated employee(s)?">
          <ImplicatedEmployeeSelector employees={employees} selectedIds={form.implicatedEmployeeIds} onChange={ids => set("implicatedEmployeeIds", ids)} error={errors.implicatedEmployeeIds} />
        </Field>
        <Field label="Describe the incident and attach evidence" hint={errors.description}><Textarea placeholder="Any additional notes or messages for this report" value={form.description} onChange={e => set("description", e.target.value)} /></Field>
        <CaseAttachmentsUploader attachments={form.attachments} onChange={urls => set("attachments", urls)} />
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
        <Button variant="stroke" onClick={onCancel}>Cancel Report</Button>
        <Button variant="primary" onClick={() => { if (validate()) onSubmit(form); }}>Submit Report</Button>
      </div>
    </div>
  );
}

/* ---------- case details: stepper + read-only standard view ---------- */
function StandardCaseDetailsView({ caseData }) {
  const statusTint = caseData.stage === "Completed" ? { bg: "#D1FADF", fg: "#027A48" }
    : caseData.stage === "Cancelled" ? { bg: "var(--gray-100)", fg: "var(--gray-700)" } : { bg: "#D1E9FF", fg: "#175CD3" };
  const Lbl = ({ children }) => <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: 500, letterSpacing: ".02em", color: "var(--gray-400)" }}>{children}</div>;
  return (
    <DetailCard icon="folder-shield-2-line" title="Case Details" action={<StatusBadge variant="default" text="Read Only" showIcon={false} />}>
      <div className="bh-body" style={{ marginTop: -8, marginBottom: 18, padding: "0 12px" }}>View all details related to this disciplinary case.</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "22px 32px", padding: "0 12px" }}>
        <div>
          <Lbl>Title of Case/Incident</Lbl>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 18, color: "var(--gray-900)", marginTop: 4 }}>{caseData.title}</div>
          <div style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--gray-400)", marginTop: 2 }}>Case Number: {caseData.caseNumber}</div>
        </div>
        <div>
          <Lbl>Current Status</Lbl>
          <div style={{ marginTop: 6 }}><span style={{ display: "inline-flex", padding: "3px 12px", borderRadius: 999, fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 12, background: statusTint.bg, color: statusTint.fg }}>{caseData.stage}</span></div>
        </div>
        <div><Lbl>Department</Lbl><div style={{ fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 14, color: "var(--gray-900)", marginTop: 4 }}>{caseData.department}</div></div>
        <div><Lbl>Date of Incident</Lbl><div style={{ fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 14, color: "var(--gray-900)", marginTop: 4 }}>{discFmt(caseData.dateOfIncident)}</div></div>
      </div>
      <div style={{ height: 1, background: "var(--border)", margin: "20px 12px" }} />
      <div style={{ padding: "0 12px" }}>
        <Lbl>Implicated Employees</Lbl>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 10 }}>
          {caseData.implicatedEmployees.map((e, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--gray-50)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 20px 10px 10px" }}>
              <Avatar name={e.fullName} size={40} />
              <div style={{ minWidth: 0 }}><div style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 14, color: "var(--gray-900)", whiteSpace: "nowrap" }}>{e.fullName}</div>
                <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-400)", whiteSpace: "nowrap" }}>{e.designation || "Employee"}</div></div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ height: 1, background: "var(--border)", margin: "20px 12px" }} />
      <div style={{ padding: "0 12px" }}>
        <Lbl>Description of Incident</Lbl>
        <div style={{ marginTop: 8, background: "var(--gray-50)", border: "1px solid var(--border)", borderRadius: 8, padding: 16, fontFamily: "var(--font-ui)", fontSize: 14, lineHeight: "22px", color: "var(--gray-700)" }}>{caseData.description || "No description provided."}</div>
        {caseData.attachments && caseData.attachments.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <Lbl>Attachments</Lbl>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 8 }}>
              {caseData.attachments.map((a, i) => (
                <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--gray-800)" }}>
                  <FileIcon name={a} size={20} />{a}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </DetailCard>
  );
}

function DisciplinaryCaseDetails({ caseData, onToast, onStageChange, onExit }) {
  // Cancelled cases have no hearing/decision data → show the read-only standard view.
  if (String(caseData.stage).toLowerCase() === "cancelled") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 1000 }}>
        <DisciplinaryStageStepper currentStage={caseData.stage} />
        <StandardCaseDetailsView caseData={caseData} />
      </div>
    );
  }
  return <DisciplinaryCaseFlow caseData={caseData} onToast={onToast} onStageChange={onStageChange} onExit={onExit} />;
}

/* ---------- controller ---------- */
function DisciplinaryScreen({ onToast, onSubPage, departments }) {
  const [cases, setCases] = useDiscS(DISCIPLINARY_SEED);
  const [q, setQ] = useDiscS("");
  const [view, setView] = useDiscS({ name: "list" });   // list | create | details
  const [confirm, setConfirm] = useDiscS(null);
  const deptOpts = (departments && departments.length ? departments : (window.LOOKUPS?.departments || []));

  useDiscSEffect(() => {
    if (!onSubPage) return;
    const back = { label: "Disciplinary Cycle", onClick: () => setView({ name: "list" }) };
    if (view.name === "create") onSubPage({ trail: [back, { label: "Create a Case" }] });
    else if (view.name === "details") onSubPage({ trail: [back, { label: view.caseData.caseNumber }] });
    else onSubPage(null);
    return () => onSubPage(null);
  }, [view]);

  const runConfirm = () => {
    const f = confirm.form;
    const dept = f.departmentId;
    const implicated = f.implicatedEmployeeIds.map(id => { const e = DISC_EMPLOYEES.find(x => x.id === id); return { employeeId: id, fullName: e.fullName, profilePictureUrl: "", designation: e.designation, department: e.department }; });
    const n = cases.length + 1;
    setCases(cs => [{ id: discId(), caseNumber: `DC-2025-${String(n).padStart(3, "0")}`, title: f.title, department: dept,
      createdAt: new Date().toISOString(), dateOfIncident: f.dateOfIncident, stage: "Investigation", status: "open",
      implicatedEmployees: implicated, attachments: f.attachments, description: f.description }, ...cs]);
    onToast("Report Submitted", { tone: "success" });
    setConfirm(null);
    setView({ name: "list" });
  };

  const header = (
    <PageHeader title="Disciplinary Cycle" subtitle="See and manage all disciplinary reports."
      actions={<Button variant="primary" icon="add-line" onClick={() => setView({ name: "create" })}>Create a case</Button>} />
  );

  const onStageChange = (id, stage) => setCases(cs => cs.map(c => c.id === id ? { ...c, stage, status: stage === "Completed" ? "closed" : stage === "Hearing" ? "pending" : c.status } : c));

  let body;
  if (view.name === "create") body = <CreateCaseForm departments={deptOpts} employees={DISC_EMPLOYEES} onCancel={() => setView({ name: "list" })} onSubmit={(form) => setConfirm({ form })} />;
  else if (view.name === "details") body = <DisciplinaryCaseDetails caseData={view.caseData} onToast={onToast} onStageChange={onStageChange} onExit={() => setView({ name: "list" })} />;
  else body = <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>{header}<DisciplinaryList cases={cases} q={q} setQ={setQ} departments={deptOpts} onCreate={() => setView({ name: "create" })} onOpen={(c) => setView({ name: "details", caseData: c })} /></div>;

  return (
    <React.Fragment>
      {body}
      {confirm && (
        <ConfirmModal title="Submit Report" message="Are you sure you want to submit this disciplinary case?"
          confirmLabel="Yes, Submit" confirmIcon="check-line" cancelLabel="Cancel"
          onConfirm={runConfirm} onClose={() => setConfirm(null)} />
      )}
    </React.Fragment>
  );
}

Object.assign(window, { DisciplinaryScreen, DisciplinaryList, CreateCaseForm, DisciplinaryCaseDetails, StandardCaseDetailsView });
