// BISTA HR · engagement/AccommodationScreen — controller for the Accommodation page.
// Owns: apartments + pending requests state, the Apartments/Pending Requests sub-tabs,
// the add-property form → preview → confirm flow, the request-details modal and the
// assign-to-staff dialog. Every commit routes through a ConfirmModal then a toast.
const { useState: useAccS, useEffect: useAccSEffect } = React;

let ACC_SEQ = 500;
const accId = (p) => `${p}-${++ACC_SEQ}`;

/* ---------- simple image dropzone (mock — adds placeholder tiles) ---------- */
function ImageDropZone({ files, onAdd, onRemove }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <button type="button" onClick={onAdd} style={{ border: "1.5px dashed var(--gray-300)", background: "var(--gray-50)", borderRadius: 12,
        padding: "26px 16px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <Icon name="upload-cloud-2-line" size={26} color="var(--gray-400)" />
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--gray-600)" }}><strong style={{ color: "var(--brand-yellow-dark)" }}>Click to upload</strong> or drag and drop</span>
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-400)" }}>PNG, JPG up to 8MB (max 8 images)</span>
      </button>
      {files.length > 0 && (
        <div className="acc-imggrid">
          {files.map((f, i) => (
            <div key={i} style={{ position: "relative" }}>
              <PropertyImage seed={f} height={110} icon="image-line" />
              <button type="button" onClick={() => onRemove(i)} style={{ position: "absolute", top: 6, right: 6, width: 24, height: 24, borderRadius: "50%",
                border: 0, background: "rgba(16,24,40,.6)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="close-line" size={15} color="#fff" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- add / edit form (full page) ---------- */
function AccommodationForm({ initial, jobGrades, onCancel, onPreview }) {
  const editing = !!initial;
  const [form, setForm] = useAccS(() => ({
    name: initial?.name || "", number: initial?.number || "", apartmentType: initial?.apartmentType || "",
    jobGrade: initial?.jobGrade || "", location: initial?.location || "", description: initial?.description || "",
    attachments: initial?.attachments ? [...initial.attachments] : [],
  }));
  const [errors, setErrors] = useAccS({});
  const set = (k, v) => { setForm(s => ({ ...s, [k]: v })); if (errors[k]) setErrors(e => ({ ...e, [k]: "" })); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Property name is required";
    if (!form.number.trim()) e.number = "Property number is required";
    if (!form.apartmentType) e.apartmentType = "Apartment type is required";
    if (!form.jobGrade) e.jobGrade = "Job grade is required";
    if (!form.location.trim()) e.location = "Location is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const submit = () => { if (validate()) onPreview(form); };

  return (
    <div className="card" style={{ padding: "var(--card-pad, 24px)", overflow: "visible", maxWidth: 900 }}>
      <div style={{ marginBottom: 20 }}>
        <div className="bh-h2" style={{ fontSize: 24 }}>{editing ? "Edit Property" : "Property"}</div>
        <div className="bh-body" style={{ marginTop: 4 }}>{editing ? "Update this accommodation's details." : "Add a property to your accommodation list."}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Field label="Property Name" hint={errors.name}><Input placeholder="Enter a name for this apartment" value={form.name} onChange={e => set("name", e.target.value)} /></Field>
        <Field label="Property Number" hint={errors.number}><Input placeholder="Enter a property number" value={form.number} onChange={e => set("number", e.target.value)} /></Field>
        <Field label="Apartment Type" hint={errors.apartmentType}><Select value={form.apartmentType} onChange={e => set("apartmentType", e.target.value)} options={APARTMENT_TYPES} placeholder="Select a type of apartment" /></Field>
        <Field label="Job Grade" hint={errors.jobGrade}><Combobox value={form.jobGrade} onChange={v => set("jobGrade", v)} options={jobGrades} placeholder="Select a job grade" /></Field>
        <Field label="Location" hint={errors.location} style={{ gridColumn: "1 / -1" }}><Input placeholder="Enter location of apartment" value={form.location} onChange={e => set("location", e.target.value)} /></Field>
        <div style={{ gridColumn: "1 / -1" }}>
          <Field label="Property Images">
            <ImageDropZone files={form.attachments}
              onAdd={() => set("attachments", [...form.attachments, accId("img")])}
              onRemove={(i) => set("attachments", form.attachments.filter((_, j) => j !== i))} />
          </Field>
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <Field label="Describe the apartment" optional><Textarea placeholder="Any additional notes or messages for this apartment" value={form.description} onChange={e => set("description", e.target.value)} /></Field>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
        <Button variant="stroke" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" onClick={submit}>Preview</Button>
      </div>
    </div>
  );
}

/* ---------- preview ---------- */
function AccommodationPreview({ data, editing, onBack, onSubmit }) {
  const items = [
    { label: "Property Name", value: data.name }, { label: "Property Number", value: data.number },
    { label: "Apartment Type", value: data.apartmentType }, { label: "Job Grade", value: data.jobGrade },
    { label: "Location", value: data.location },
  ];
  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: 16 }}>
        <div className="bh-h2" style={{ fontSize: 24 }}>Preview Apartment Details</div>
        <div className="bh-body" style={{ marginTop: 4 }}>Review the information before submitting.</div>
      </div>
      <DetailCard icon="home-4-line" title={`${data.name || "Apartment"} (${data.apartmentType || "—"})`}>
        <DetailPanel items={items} tint="gray" cols={4} />
        {data.description && <div style={{ marginTop: 14, padding: "0 12px", fontFamily: "var(--font-ui)", fontSize: 14, lineHeight: "22px", color: "var(--gray-700)" }}>{data.description}</div>}
        {data.attachments.length > 0 && (
          <div style={{ marginTop: 18 }}>
            <div style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 14, color: "var(--gray-900)", marginBottom: 10 }}>Property Images</div>
            <div className="acc-imggrid">{data.attachments.map((f, i) => <PropertyImage key={i} seed={f} height={120} icon="image-line" />)}</div>
          </div>
        )}
      </DetailCard>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 20 }}>
        <Button variant="stroke" onClick={onBack}>Back</Button>
        <Button variant="primary" onClick={onSubmit}>{editing ? "Update Apartment" : "Create Apartment"}</Button>
      </div>
    </div>
  );
}

/* ---------- controller ---------- */
function AccommodationScreen({ onToast, onSubPage, jobGrades }) {
  const [apartments, setApartments] = useAccS(APARTMENTS_SEED);
  const [requests, setRequests] = useStore(window.HRStores.accommodationRequests);
  const [view, setView] = useAccS({ name: "list" });        // list | details | add | edit | preview
  const [reqModal, setReqModal] = useAccS(null);            // accommodationRequestId
  const [assign, setAssign] = useAccS(null);                // apartment being assigned
  const [confirm, setConfirm] = useAccS(null);

  const gradeOpts = (jobGrades && jobGrades.length ? jobGrades.map(g => g.name) : (window.LOOKUPS?.jobGrades || []));

  useAccSEffect(() => {
    if (!onSubPage) return;
    const back = { label: "Accommodation", onClick: () => setView({ name: "list" }) };
    if (view.name === "details") onSubPage({ trail: [back, { label: view.apt.name }] });
    else if (view.name === "add") onSubPage({ trail: [back, { label: "Add Accommodation" }] });
    else if (view.name === "edit") onSubPage({ trail: [back, { label: `Edit ${view.apt.name}` }] });
    else if (view.name === "preview") onSubPage({ trail: [back, { label: "Preview" }] });
    else onSubPage(null);
    return () => onSubPage(null);
  }, [view]);

  const askSubmit = () => setConfirm({ kind: view.editing ? "update" : "create" });
  const runConfirm = () => {
    const c = confirm;
    if (c.kind === "create") {
      setApartments(a => [{ id: accId("apt"), ...view.data, assignedEmployee: null }, ...a]);
      onToast("Apartment Created", { tone: "success" });
      setView({ name: "list" });
    } else if (c.kind === "update") {
      setApartments(a => a.map(x => x.id === view.aptId ? { ...x, ...view.data } : x));
      onToast("Apartment Updated", { tone: "success" });
      setView({ name: "list" });
    } else if (c.kind === "archive") {
      setApartments(a => a.filter(x => x.id !== c.row.id));
      onToast("Apartment Archived", { tone: "error" });
    } else if (c.kind === "assign") {
      const req = requests.find(r => r.accommodationRequestId === c.requestId);
      setApartments(a => a.map(x => x.id === assign.id ? { ...x, assignedEmployee: {
        employeeFullName: req.employeeFullName, employeeEmail: req.employeeEmail, employeePhoneNumber: "—",
        assignmentStartDate: req.startDate || new Date().toISOString(), assignmentEndDate: req.endDate || "",
        approvedRent: "—", previousRent: "—", handingOverDate: "", comments: "" } } : x));
      setRequests(rs => rs.filter(r => r.accommodationRequestId !== c.requestId));
      onToast("Apartment Assigned", { tone: "success" });
      setView(v => v.name === "details" ? { name: "details", apt: { ...assign, assignedEmployee: { employeeFullName: req.employeeFullName, employeeEmail: req.employeeEmail, employeePhoneNumber: "—", assignmentStartDate: req.startDate || new Date().toISOString(), assignmentEndDate: req.endDate || "" } } } : v);
      setAssign(null);
    }
    setConfirm(null);
  };

  // header (only on the list view)
  const header = (
    <PageHeader title="Accommodations" subtitle="See and manage all staff engagements."
      actions={<Button variant="primary" icon="add-line" onClick={() => setView({ name: "add" })}>Add Accommodation</Button>} />
  );

  let body;
  if (view.name === "add") body = <AccommodationForm jobGrades={gradeOpts} onCancel={() => setView({ name: "list" })} onPreview={(data) => setView({ name: "preview", data, editing: false })} />;
  else if (view.name === "edit") body = <AccommodationForm initial={view.apt} jobGrades={gradeOpts} onCancel={() => setView({ name: "list" })} onPreview={(data) => setView({ name: "preview", data, editing: true, aptId: view.apt.id })} />;
  else if (view.name === "preview") body = <AccommodationPreview data={view.data} editing={view.editing} aptId={view.aptId} onBack={() => setView(view.editing ? { name: "edit", apt: apartments.find(a => a.id === view.aptId) } : { name: "add" })} onSubmit={askSubmit} />;
  else if (view.name === "details") body = <AccommodationDetails apt={view.apt} onAssign={() => setAssign(view.apt)} />;
  else body = (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {header}
      <ApartmentsTable apartments={apartments} requests={requests} jobGrades={gradeOpts}
        onOpenApartment={(apt) => setView({ name: "details", apt })}
        onOpenRequest={(id) => setReqModal(id)}
        onArchive={(row) => setConfirm({ kind: "archive", row })} />
    </div>
  );

  return (
    <React.Fragment>
      {body}
      {reqModal && REQUEST_DETAILS[reqModal] && <RequestDetailsModal details={REQUEST_DETAILS[reqModal]} onClose={() => setReqModal(null)} />}
      {assign && <AssignDialog apt={assign} requests={requests} onClose={() => setAssign(null)} onAssign={(requestId) => setConfirm({ kind: "assign", requestId })} />}
      {confirm && (
        <ConfirmModal
          title={confirm.kind === "assign" ? "Assign Apartment" : confirm.kind === "archive" ? "Archive Apartment" : confirm.kind === "update" ? "Update Apartment" : "Add Apartment"}
          message={confirm.kind === "assign" ? "Are you sure you want to assign this apartment to the selected staff?" : confirm.kind === "archive" ? `Are you sure you want to archive ${confirm.row.name}? This will hide it from the active list.` : `Are you sure you want to ${confirm.kind} this apartment?`}
          confirmLabel={confirm.kind === "assign" ? "Yes, Assign" : confirm.kind === "archive" ? "Yes, Archive" : "Yes, Submit"}
          confirmIcon={confirm.kind === "assign" ? "user-follow-line" : confirm.kind === "archive" ? "archive-line" : "check-line"}
          cancelLabel="Cancel" onConfirm={runConfirm} onClose={() => setConfirm(null)} />
      )}
    </React.Fragment>
  );
}

Object.assign(window, { AccommodationScreen, AccommodationForm, AccommodationPreview });

// seed the shared store once + expose an ESS accommodation-request builder. A self-service
// accommodation request (Dashboard ▸ Requests) appears here under Staff Requests, reactively,
// and its detail modal works (we add a matching REQUEST_DETAILS entry).
window.HRStores.accommodationRequests.seed(PENDING_REQUESTS_SEED);
window.HRAccommodation = {
  createEssRequest: ({ employeeFullName, employeeEmail, staffId, jobGrade, designation, department, phone,
    accommodationType, apartmentType, location, duration, startDate, endDate, reason }) => {
    const id = `req-ess-${++ACC_SEQ}`;
    const createdAt = new Date().toISOString().slice(0, 10);
    REQUEST_DETAILS[id] = { employeeFullName, employeeStaffId: staffId || "—", employeeJobGrade: jobGrade || "—",
      employeeDesignation: designation || "—", employeeDepartment: department || "—", employeePhoneNumber: phone || "—",
      createdAt, accommodationType: accommodationType || "—", apartmentType: apartmentType || "—", location: location || "—",
      duration: duration || "—", startDate: startDate || null, endDate: endDate || null, employeeEmail, reason: reason || "" };
    return { accommodationRequestId: id, employeeFullName, employeeEmail, duration: duration || "Permanent",
      accommodationType: apartmentType || accommodationType || "—", reason: reason || "", startDate: startDate || null, endDate: endDate || null, requestCreatedAt: createdAt };
  },
};
