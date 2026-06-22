// BISTA HR · dashboard/EmployeeRequests — self-service request launcher (Dashboard ▸ Requests).
//   Grid of request-type cards (Accommodation, Circular, Bereavement, …) + a "Request
//   Activity History" table of what the signed-in user has submitted. Launching a card
//   opens a full-page form (announcement or accommodation), routed through onSubPage for
//   the breadcrumb; submit → ConfirmModal → toast → prepend a row to the activity history.
//
//   EXTENSIBLE: add an entry to REQUEST_TYPES to surface a new card. `form` selects which
//   form component renders ("announcement" | "accommodation"); add a new branch in
//   RequestForm to support a new form shape. Everything else (cards, history, confirm,
//   toast) is generic.
const { useState: useReq } = React;

// Department[] (mirrors hr-types Department) — circular recipients.
const REQ_DEPARTMENTS = [
  { value: "d1", label: "Human Resource" },
  { value: "d2", label: "Finance" },
  { value: "d3", label: "Operations" },
  { value: "d4", label: "Information Technology" },
  { value: "d5", label: "Support Services" },
];

const REQUEST_TYPES = [
  { key: "accommodation", title: "Accommodation", icon: "home-4-line", tint: "#FFF1CC", chip: "#fff", iconColor: "#A87900",
    desc: "Request company accommodation close to your workplace, with the duration and apartment type you need.",
    cta: "Request Accommodation", form: "accommodation", activityLabel: "Accommodation" },
  { key: "circular", title: "Circular", icon: "megaphone-line", tint: "#E2EDFF", chip: "#fff", iconColor: "#2A6FDB",
    desc: "Create circular announcements like company-wide updates or policy changes for selected departments.",
    cta: "Create a Circular", form: "announcement", announcementType: "announcement", activityLabel: "Circular" },
  { key: "bereavement", title: "Bereavement", icon: "heart-3-line", tint: "#FCE5EC", chip: "#fff", iconColor: "#C11E39",
    desc: "Submit a bereavement notice to inform staff and rally welfare support for a colleague.",
    cta: "Submit Notice", form: "announcement", announcementType: "bereavement", activityLabel: "Bereavement" },
  { key: "resignation", title: "Resignation", icon: "logout-box-r-line", tint: "#E7F0EC", chip: "#fff", iconColor: "#1F8A5B",
    desc: "Submit a voluntary resignation with your proposed exit date and reason. P&C will begin the exit and clearance process.",
    cta: "Submit Resignation", form: "resignation", activityLabel: "Resignation" },
];

const ANNOUNCEMENT_TYPE_OPTS = [
  { value: "announcement", label: "Announcement" },
  { value: "bereavement", label: "Bereavement" },
];

const todayLabel = () => new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
// YYYY-MM-DD (from <input type=date>) → "02 Apr, 2025"; passes through any other string.
const fmtDate = (v) => {
  if (!v) return "—";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  if (!m) return v;
  return new Date(+m[1], +m[2] - 1, +m[3]).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
const deptLabels = (vals) => vals.map(v => (REQ_DEPARTMENTS.find(d => d.value === v) || {}).label || v).join(", ");
const typeLabelOf = (v) => (ANNOUNCEMENT_TYPE_OPTS.find(o => o.value === v) || {}).label || v;

/* ---------- launcher card ---------- */
function RequestTypeCard({ t, onLaunch }) {
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ background: t.tint, height: 124, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ width: 60, height: 60, borderRadius: 16, background: "rgba(255,255,255,.72)",
          display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 2px rgba(16,24,40,.06)" }}>
          <Icon name={t.icon} size={30} color={t.iconColor} />
        </span>
      </div>
      <div style={{ padding: 20, display: "flex", flexDirection: "column", flex: 1 }}>
        <div className="bh-h2" style={{ fontSize: 20 }}>{t.title}</div>
        <div className="bh-body" style={{ marginTop: 6, flex: 1 }}>{t.desc}</div>
        <Button variant="primary" style={{ marginTop: 18, width: "100%", justifyContent: "center" }}
          icon="add-line" onClick={() => onLaunch(t)}>{t.cta}</Button>
      </div>
    </div>
  );
}

function ComingSoonCard() {
  return (
    <div style={{ border: "1.5px dashed var(--gray-200)", borderRadius: "var(--radius-lg)", background: "var(--gray-50)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 32, minHeight: 280 }}>
      <span style={{ width: 54, height: 54, borderRadius: "50%", background: "#fff", border: "1px solid var(--gray-200)",
        display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
        <Icon name="clipboard-line" size={24} color="var(--gray-300)" />
      </span>
      <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 18, color: "var(--gray-400)" }}>More Coming Soon</div>
      <div className="bh-body" style={{ marginTop: 6, color: "var(--gray-400)" }}>Additional request types will be available here.</div>
    </div>
  );
}

/* ---------- activity history ---------- */
const HISTORY_TONE = { Pending: "pending", Approved: "approved", Rejected: "rejected" };
function ActivityHistory({ items, onView }) {
  const [q, setQ] = useReq("");
  const filtered = items.filter(r => q === "" || `${r.title} ${r.typeLabel}`.toLowerCase().includes(q.toLowerCase()));
  const pg = usePaged(filtered, 10);
  return (
    <div className="card" style={{ padding: "var(--card-pad, 24px)", marginTop: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 18, flexWrap: "wrap" }}>
        <div className="bh-h2" style={{ fontSize: 22 }}>Request Activity History</div>
        <div className="input-wrap" style={{ width: 280, padding: "9px 12px" }}>
          <Icon name="search-2-line" size={18} style={{ color: "var(--icon-default)" }} />
          <input placeholder="Search activity history…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
      </div>
      {items.length === 0
        ? <EmptyState compact title="No Activity Yet" subtitle="Your activity history will appear here." />
        : <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
            <table className="bh">
              <thead><tr><th>Request Type</th><th>Title</th><th>Date Submitted</th><th>Status</th><th style={{ width: 1 }}></th></tr></thead>
              <tbody>
                {pg.pageItems.map(r => (
                  <tr key={r.id}>
                    <td>{r.typeLabel}</td>
                    <td>{r.title}</td>
                    <td>{r.date}</td>
                    <td><StatusBadge variant={HISTORY_TONE[r.status]} text={r.status} size="sm" /></td>
                    <td style={{ textAlign: "right" }}><ViewDetailsButton onClick={() => onView(r)} /></td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={5} style={{ padding: 0 }}><EmptyState compact title="No results found" subtitle="No activity matches your search." /></td></tr>}
              </tbody>
            </table>
            {filtered.length > 0 && <Pagination page={pg.page} pages={pg.pages} onPrev={pg.prev} onNext={pg.next} />}
          </div>}
    </div>
  );
}

/* ---------- submitted-request detail drawer (reuses DetailCard / DetailPanel) ---------- */
const REQ_ICON = { Accommodation: "home-4-line", Circular: "megaphone-line", Bereavement: "heart-3-line", Resignation: "logout-box-r-line" };
function RequestDetailDrawer({ item, onClose }) {
  if (!item) return null;
  const fields = item.fields || [];
  const grid = fields.filter(f => !f.wide);
  const wide = fields.filter(f => f.wide);
  return (
    <Drawer open={!!item} onClose={onClose} title="Request Details" icon={REQ_ICON[item.typeLabel] || "file-list-3-line"} width={620}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <RequesterInfoCard title="Ama Mensah" subtitle={`${item.typeLabel} · ${item.date}`} tint="cream" />
        <StatusBadge variant={HISTORY_TONE[item.status]} text={item.status} size="sm" />
      </div>
      <DetailCard icon={REQ_ICON[item.typeLabel] || "file-list-3-line"} title={item.title}>
        <DetailPanel items={grid} tint="gray" cols={2} />
        {wide.map((f, i) => (
          <div key={i} style={{ background: "#F6F8FA", borderRadius: 8, padding: "12px 16px", marginTop: 12 }}>
            <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-400)", marginBottom: 4 }}>{f.label}</div>
            <div style={{ fontFamily: "var(--font-ui)", fontSize: 14, lineHeight: "21px", color: "var(--gray-900)", whiteSpace: "pre-wrap" }}>{f.value || "—"}</div>
          </div>
        ))}
      </DetailCard>
    </Drawer>
  );
}

/* ---------- poster dropzone (mock upload) ---------- */
function PosterDropzone({ files, onChange }) {
  const inputRef = React.useRef(null);
  const add = (list) => onChange([...files, ...Array.from(list).map(f => ({ id: `${Date.now()}-${f.name}`, name: f.name }))].slice(0, 5));
  return (
    <div>
      <div onClick={() => inputRef.current && inputRef.current.click()}
        onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); add(e.dataTransfer.files); }}
        style={{ border: "1.5px dashed var(--gray-300)", borderRadius: "var(--radius-md)", background: "var(--gray-50)",
          padding: "26px 20px", textAlign: "center", cursor: "pointer" }}>
        <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={e => add(e.target.files)} />
        <span style={{ width: 42, height: 42, borderRadius: "50%", background: "#fff", border: "1px solid var(--gray-200)",
          display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
          <Icon name="upload-cloud-2-line" size={20} color="var(--brand-yellow-dark)" />
        </span>
        <div style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--gray-700)" }}>
          <span style={{ color: "var(--brand-yellow-dark)", fontWeight: 600 }}>Click to upload</span> or drag and drop
        </div>
        <div className="bh-caption" style={{ marginTop: 4 }}>PNG or JPG up to 8MB · 5 images max</div>
      </div>
      {files.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
          {files.map(f => (
            <span key={f.id} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--gray-100)",
              borderRadius: 8, padding: "6px 10px", fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--gray-800)" }}>
              <Icon name="image-line" size={15} color="var(--gray-500)" />{f.name}
              <span onClick={() => onChange(files.filter(x => x.id !== f.id))} style={{ cursor: "pointer", display: "inline-flex" }}>
                <Icon name="close-line" size={14} color="var(--gray-500)" />
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- announcement form (Circular / Bereavement) ---------- */
function AnnouncementForm({ launch, onCancel, onSubmit }) {
  const isBereavement = launch.announcementType === "bereavement";
  const [title, setTitle] = useReq("");
  const [type, setType] = useReq(launch.announcementType || "");
  const [dateOfEvent, setDateOfEvent] = useReq("");
  const [depts, setDepts] = useReq([]);
  const [files, setFiles] = useReq([]);
  const [details, setDetails] = useReq("");
  const valid = title.trim() && type && dateOfEvent && depts.length > 0 && details.trim();
  return (
    <div className="card" style={{ padding: "var(--card-pad, 24px)", maxWidth: 760 }}>
      <div style={{ marginBottom: 20 }}>
        <div className="bh-h2" style={{ fontSize: 24 }}>{isBereavement ? "Submit a Bereavement Notice" : "Create a Circular"}</div>
        <div className="bh-body" style={{ marginTop: 4 }}>
          {isBereavement ? "Inform staff and rally welfare support for a colleague." : "Share a company-wide update or policy change with selected departments."}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <Field label="Title"><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter circular title" /></Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Field label="Announcement Type"><Combobox value={type} onChange={setType} options={ANNOUNCEMENT_TYPE_OPTS} placeholder="Select type" /></Field>
          <Field label="Date of Event"><UI.DatePicker value={dateOfEvent} onSelect={d => setDateOfEvent(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`)} placeholder="Pick a date" /></Field>
        </div>
        <Field label="Send to (Department)">
          <MultiSelectCombobox value={depts} onChange={setDepts} options={REQ_DEPARTMENTS} placeholder="Select departments" />
        </Field>
        <Field label="Poster" optional><PosterDropzone files={files} onChange={setFiles} /></Field>
        <Field label="Event Details"><Textarea rows={5} value={details} onChange={e => setDetails(e.target.value)} placeholder="Event details" /></Field>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
        <Button variant="stroke" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" disabled={!valid} onClick={() => valid && onSubmit({
          title: title.trim(),
          meta: { kind: "circular", type: typeLabelOf(type), departments: depts.map(v => (REQ_DEPARTMENTS.find(d => d.value === v) || {}).label || v), dateOfEvent: fmtDate(dateOfEvent), eventDetails: details.trim() },
          fields: [
            { label: "Title", value: title.trim() },
            { label: "Announcement Type", value: typeLabelOf(type) },
            { label: "Date of Event", value: fmtDate(dateOfEvent) },
            { label: "Sent to", value: deptLabels(depts) },
            { label: "Poster", value: files.length ? `${files.length} image${files.length > 1 ? "s" : ""} attached` : "None" },
            { label: "Event Details", value: details.trim(), wide: true },
          ],
        })}>
          {isBereavement ? "Submit Notice" : "Submit Circular"}
        </Button>
      </div>
    </div>
  );
}

/* ---------- accommodation request form ---------- */
function AccommodationRequestForm({ onCancel, onSubmit }) {
  const [accType, setAccType] = useReq("");
  const [aptType, setAptType] = useReq("");
  const [duration, setDuration] = useReq("");
  const [location, setLocation] = useReq("");
  const [startDate, setStartDate] = useReq("");
  const [endDate, setEndDate] = useReq("");
  const [reason, setReason] = useReq("");
  const temporary = duration === "Temporary";
  const valid = accType && aptType && duration && location.trim() && reason.trim() && (!temporary || (startDate && endDate));
  return (
    <div className="card" style={{ padding: "var(--card-pad, 24px)", maxWidth: 760 }}>
      <div style={{ marginBottom: 20 }}>
        <div className="bh-h2" style={{ fontSize: 24 }}>Request Accommodation</div>
        <div className="bh-body" style={{ marginTop: 4 }}>Tell us the accommodation you need; HR will review and assign an available unit.</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Field label="Accommodation Type"><Combobox value={accType} onChange={setAccType} options={ACCOMMODATION_TYPES} placeholder="Select type" /></Field>
          <Field label="Apartment Type"><Combobox value={aptType} onChange={setAptType} options={APARTMENT_TYPES} placeholder="Select apartment type" /></Field>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Field label="Duration"><Combobox value={duration} onChange={setDuration} options={REQUEST_DURATIONS} placeholder="Select duration" /></Field>
          <Field label="Preferred Location"><Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Eg. Accra" /></Field>
        </div>
        {temporary && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Start Date"><UI.DatePicker value={startDate} onSelect={d => setStartDate(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`)} placeholder="Pick a date" /></Field>
            <Field label="End Date"><UI.DatePicker value={endDate} onSelect={d => setEndDate(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`)} placeholder="Pick a date" /></Field>
          </div>
        )}
        <Field label="Reason"><Textarea rows={4} value={reason} onChange={e => setReason(e.target.value)} placeholder="Why do you need company accommodation?" /></Field>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
        <Button variant="stroke" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" disabled={!valid} onClick={() => valid && onSubmit({
          title: `${aptType} · ${duration}`,
          meta: { kind: "accommodation", accType, aptType, duration, location: location.trim(), startDate: temporary ? startDate : null, endDate: temporary ? endDate : null, reason: reason.trim() },
          fields: [
            { label: "Accommodation Type", value: accType },
            { label: "Apartment Type", value: aptType },
            { label: "Duration", value: duration },
            { label: "Preferred Location", value: location.trim() },
            { label: "Start Date", value: temporary ? fmtDate(startDate) : "—" },
            { label: "End Date", value: temporary ? fmtDate(endDate) : "—" },
            { label: "Reason", value: reason.trim(), wide: true },
          ],
        })}>Submit Request</Button>
      </div>
    </div>
  );
}

const RESIGNATION_REASONS = ["Better Opportunity", "Personal Reasons", "Relocation", "Health Reasons", "Further Studies", "Career Change", "Other"];

/* ---------- resignation request form (voluntary exit via ESS) ---------- */
function ResignationRequestForm({ onCancel, onSubmit }) {
  const [exitDate, setExitDate] = useReq("");
  const [reason, setReason] = useReq("");
  const [notice, setNotice] = useReq("");
  const [details, setDetails] = useReq("");
  const [docs, setDocs] = useReq([]);
  const valid = exitDate && reason && details.trim();
  return (
    <div className="card" style={{ padding: "var(--card-pad, 24px)", maxWidth: 760 }}>
      <div style={{ marginBottom: 8 }}>
        <div className="bh-h2" style={{ fontSize: 24 }}>Submit Resignation</div>
        <div className="bh-body" style={{ marginTop: 4 }}>Submit your voluntary resignation. Once reviewed, P&amp;C will begin the exit, clearance and final-settlement process.</div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#E7F0EC", border: "1px solid #BFE2D0", borderRadius: 10, padding: "12px 16px", marginBottom: 18 }}>
        <Icon name="information-line" size={20} color="#1F8A5B" />
        <div className="bh-body" style={{ color: "#226B4B" }}>An exit interview will be scheduled for you. Final settlement covers indebtedness, notice pay and any annual-leave cash impact.</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Field label="Proposed Exit Date"><UI.DatePicker value={exitDate} onSelect={d => setExitDate(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`)} placeholder="Pick a date" /></Field>
          <Field label="Reason for Resignation"><Combobox value={reason} onChange={setReason} options={RESIGNATION_REASONS} placeholder="Select reason" /></Field>
        </div>
        <Field label="Notice Period" optional><Input value={notice} onChange={e => setNotice(e.target.value)} placeholder="Eg. 1 month" /></Field>
        <Field label="Details / Message"><Textarea rows={5} value={details} onChange={e => setDetails(e.target.value)} placeholder="Share any context for your resignation…" /></Field>
        <Field label="Supporting Documents" optional><SupportingDocsUploader files={docs} onChange={setDocs} hint="Resignation letter or other documents — PDF, DOC, DOCX up to 10MB" /></Field>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
        <Button variant="stroke" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" disabled={!valid} onClick={() => valid && onSubmit({
          title: `Resignation · ${reason}`,
          meta: { kind: "resignation", exitDate: fmtDate(exitDate), reason, note: details.trim(), documents: docs },
          fields: [
            { label: "Exit Type", value: "Resignation (Voluntary)" },
            { label: "Proposed Exit Date", value: fmtDate(exitDate) },
            { label: "Reason", value: reason },
            { label: "Notice Period", value: notice.trim() || "—" },
            { label: "Supporting Documents", value: docs.length ? `${docs.length} file${docs.length > 1 ? "s" : ""} attached` : "None" },
            { label: "Details / Message", value: details.trim(), wide: true },
          ],
        })}>Submit Resignation</Button>
      </div>
    </div>
  );
}

const SEED_HISTORY = [
  { id: 2, typeLabel: "Circular", title: "Q2 Town Hall Schedule", date: "18 Mar, 2025", status: "Approved",
    fields: [
      { label: "Title", value: "Q2 Town Hall Schedule" },
      { label: "Announcement Type", value: "Announcement" },
      { label: "Date of Event", value: "02 Apr, 2025" },
      { label: "Sent to", value: "Operations, Information Technology" },
      { label: "Poster", value: "1 image attached" },
      { label: "Event Details", value: "All staff are invited to the quarterly town hall. Attendance is mandatory for team leads.", wide: true },
    ] },
  { id: 1, typeLabel: "Accommodation", title: "2-Bedroom · Permanent", date: "04 Mar, 2025", status: "Pending",
    fields: [
      { label: "Accommodation Type", value: "Company Provided" },
      { label: "Apartment Type", value: "2-Bedroom" },
      { label: "Duration", value: "Permanent" },
      { label: "Preferred Location", value: "Accra" },
      { label: "Start Date", value: "—" },
      { label: "End Date", value: "—" },
      { label: "Reason", value: "Relocating closer to the head office to reduce daily commute time.", wide: true },
    ] },
];

/* ---------- controller ---------- */
function EmployeeRequests({ onToast, onSubPage, onViewAnnouncements, onOpenAnnouncement }) {
  const [history, setHistory] = useReq(SEED_HISTORY);
  const [launch, setLaunch] = useReq(null);     // active request type (form open)
  const [confirm, setConfirm] = useReq(null);    // { title, fields } payload pending confirmation
  const [detail, setDetail] = useReq(null);      // history row being viewed

  React.useEffect(() => {
    if (!onSubPage) return;
    if (launch) onSubPage({ trail: [{ label: "Requests", onClick: () => setLaunch(null) }, { label: launch.cta }] });
    else onSubPage(null);
    return () => onSubPage(null);
  }, [launch]);

  const doSubmit = () => {
    const id = Date.now();
    setHistory(h => [{ id, typeLabel: launch.activityLabel, title: confirm.title, date: todayLabel(), status: "Pending", fields: confirm.fields }, ...h]);
    // route the submission to the matching admin screen's shared store (reactive CRUD)
    const me = window.ME || {}, meta = confirm.meta;
    if (meta && meta.kind === "resignation" && window.HRExit && window.HRStores) {
      window.HRStores.exits.set(es => [window.HRExit.createEssExit({
        employee: me.name, staffId: me.code, title: me.role, dept: me.dept, branch: me.branch, zone: me.zone, grade: me.grade,
        exitDate: meta.exitDate, reason: meta.reason, note: meta.note, documents: meta.documents }), ...(es || [])]);
    } else if (meta && meta.kind === "accommodation" && window.HRAccommodation && window.HRStores) {
      window.HRStores.accommodationRequests.set(rs => [window.HRAccommodation.createEssRequest({
        employeeFullName: me.name, employeeEmail: me.email, staffId: me.code, designation: me.role, department: me.dept,
        accommodationType: meta.accType, apartmentType: meta.aptType, location: meta.location, duration: meta.duration,
        startDate: meta.startDate, endDate: meta.endDate, reason: meta.reason }), ...(rs || [])]);
    } else if (meta && meta.kind === "circular" && window.HRWelfare && window.HRStores) {
      window.HRStores.pendingCirculars.set(cs => [window.HRWelfare.createEssCircular({
        title: confirm.title, type: meta.type, departments: meta.departments, dateOfEvent: meta.dateOfEvent, eventDetails: meta.eventDetails,
        employeeName: me.name, employeeJobTitle: me.role, employeeEmail: me.email }), ...(cs || [])]);
    }
    onToast(`${launch.activityLabel} request submitted`, { tone: "success" });
    setConfirm(null);
    setLaunch(null);
  };

  const main = launch
    ? (launch.form === "accommodation"
        ? <AccommodationRequestForm onCancel={() => setLaunch(null)} onSubmit={setConfirm} />
        : launch.form === "resignation"
          ? <ResignationRequestForm onCancel={() => setLaunch(null)} onSubmit={setConfirm} />
          : <AnnouncementForm launch={launch} onCancel={() => setLaunch(null)} onSubmit={setConfirm} />)
    : (
      <div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
          {REQUEST_TYPES.map(t => <RequestTypeCard key={t.key} t={t} onLaunch={setLaunch} />)}
          <ComingSoonCard />
        </div>
        <ActivityHistory items={history} onView={setDetail} />
      </div>
    );

  return (
    <div style={{ display: "flex", gap: 24, height: "100%", padding: "0 0 0 32px", boxSizing: "border-box" }}>
      <div style={{ flex: 1, minWidth: 0, height: "100%", overflowY: "auto", paddingRight: 4 }}>
        <div style={{ paddingTop: 24, paddingBottom: 72 }}>{main}</div>
      </div>
      <AnnouncementsRail onViewAll={onViewAnnouncements} onOpen={onOpenAnnouncement} />

      <RequestDetailDrawer item={detail} onClose={() => setDetail(null)} />

      {confirm && (
        <ConfirmModal title={`Submit ${launch.activityLabel} Request`}
          message={`Are you sure you want to submit this ${launch.activityLabel.toLowerCase()} request?`}
          confirmLabel="Yes, Submit" confirmIcon="check-line" cancelLabel="Cancel"
          onConfirm={doSubmit} onClose={() => setConfirm(null)} />
      )}
    </div>
  );
}

Object.assign(window, { EmployeeRequests });
