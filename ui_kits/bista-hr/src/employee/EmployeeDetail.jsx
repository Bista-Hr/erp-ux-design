// BISTA HR · employee/EmployeeDetail — profile page with 4 tabs, built from reusable
// DetailCard / DetailPanel / PersonCard / HistoryTable. Breadcrumb returns to the list.
// Every card's "Update Details" / "Add …" / per-row edit & delete run through the same
// FormModal → ConfirmModal → toast flow used elsewhere (onToast comes from the App).
const DETAIL_TABS = ["Personal Information", "Contact Details", "Employment Details", "Documents"];
const ACT_GREEN = "#086333";

// field definitions for the education / spouse panels (exact set from the design)
const EDU_FIELDS = [
  ["Course", "course"], ["Institution", "institution"], ["Qualification", "qualification"], ["Start Date", "startDate"],
  ["End Date", "endDate"], ["Major Field", "majorField"], ["GPA Grade", "gpa"], ["Verification Status", "verificationStatus"],
  ["Verification Date", "verificationDate"], ["Status", "status"],
];
const eduItems = (o) => EDU_FIELDS.map(([label, key]) => ({ label, value: o[key] }));
const eduFormFields = () => EDU_FIELDS.map(([label, key]) => ({ key, label, placeholder: `Enter ${label.toLowerCase()}`, optional: true }));

function ProfileHeader({ emp, tab, onTab, photo, onAvatarClick }) {
  const clickable = !!onAvatarClick;
  return (
    <div className="card" style={{ padding: "var(--card-pad, 24px)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={onAvatarClick} disabled={!clickable} title={clickable ? "Change profile picture" : undefined}
          style={{ position: "relative", padding: 0, border: 0, background: "none", borderRadius: "50%",
            cursor: clickable ? "pointer" : "default", lineHeight: 0 }} className={clickable ? "pp-trigger" : undefined}>
          <Avatar name={emp.name} size={64} src={photo} />
          {clickable && (
            <span className="pp-trigger-badge" style={{ position: "absolute", right: -2, bottom: -2, width: 24, height: 24, borderRadius: "50%",
              background: "var(--brand-yellow)", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="camera-line" size={13} color="var(--brand-ink)" />
            </span>
          )}
        </button>
        <div>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 30, lineHeight: "36px", color: "var(--gray-900)" }}>{emp.name}</div>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10, marginTop: 4, fontFamily: "var(--font-ui)", fontSize: 15, color: "var(--gray-500)" }}>
            <span>{emp.role}</span><span>•</span><span>#{emp.code}</span><span>•</span>
            <StatusBadge variant={emp.active ? "active" : "inactive"} text={emp.active ? "Active" : "Inactive"} size="sm" />
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginTop: 24 }}>
        {DETAIL_TABS.map(t => {
          const on = t === tab;
          return (
            <button key={t} onClick={() => onTab(t)} style={{ padding: "14px 0", borderRadius: 10, border: 0, cursor: "pointer",
              background: on ? "#FFF6E0" : "#F6F8FA",
              fontFamily: "var(--font-ui)", fontWeight: on ? 700 : 600, fontSize: 15,
              color: on ? "var(--gray-900)" : "var(--gray-500)", transition: "background .15s" }}>{t}</button>
          );
        })}
      </div>
    </div>
  );
}

const Stack = ({ children }) => <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 20 }}>{children}</div>;
const TwoCol = ({ children }) => <div className="ed-twocol">{children}</div>;

// ---- the four tabs ----------------------------------------------------------
function PersonalInfoTab({ d, edit }) {
  const upd = (noun, fields, initial, apply) => <CardActionLink label={edit.label} icon="edit-2-line" onClick={() => edit({ noun, fields, initial, apply })} />;
  const itemsEditor = (noun, items, applyArr) => upd(noun,
    items.map(it => ({ key: it.label, label: it.label, placeholder: `Enter ${it.label.toLowerCase()}`, optional: true })),
    Object.fromEntries(items.map(it => [it.label, it.value])),
    (form) => applyArr(items.map(it => ({ label: it.label, value: form[it.label] }))));

  return (
    <Stack>
      <DetailCard icon="user-3-line" title="Basic Information"
        action={itemsEditor("Basic Information", d.personal.basic, (arr) => edit.set(p => ({ ...p, personal: { ...p.personal, basic: arr } })))}>
        <DetailPanel items={d.personal.basic} tint="gray" cols={4} />
      </DetailCard>
      <TwoCol>
        <DetailCard icon="map-pin-line" title="Address"
          action={itemsEditor("Address", d.personal.address, (arr) => edit.set(p => ({ ...p, personal: { ...p.personal, address: arr } })))}>
          <DetailPanel items={d.personal.address} tint="pink" cols={3} />
        </DetailCard>
        <DetailCard icon="profile-line" title="Identification"
          action={itemsEditor("Identification", d.personal.identification, (arr) => edit.set(p => ({ ...p, personal: { ...p.personal, identification: arr } })))}>
          <DetailPanel items={d.personal.identification} tint="cream" cols={2} />
        </DetailCard>
      </TwoCol>
      <DetailCard icon="graduation-cap-line" title="Education Details"
        action={upd("Education", eduFormFields(), d.personal.education[0], (form) => edit.set(p => ({ ...p, personal: { ...p.personal, education: [{ ...form }] } })))}>
        <DetailPanel items={eduItems(d.personal.education[0])} tint="gray" cols={4} />
      </DetailCard>
      <DetailCard icon="heart-3-line" title="Spouse Details"
        action={upd("Spouse", eduFormFields(), d.personal.spouse[0], (form) => edit.set(p => ({ ...p, personal: { ...p.personal, spouse: [{ ...form }] } })))}>
        <DetailPanel items={eduItems(d.personal.spouse[0])} tint="cream" cols={4} />
      </DetailCard>
      <DetailCard icon="bear-smile-line" title="Child Details"
        action={<CardActionLink label="Add Contact" icon="add-circle-line" color={ACT_GREEN}
          onClick={() => edit({ noun: "Child", create: true,
            fields: [{ key: "name", label: "Name", placeholder: "Enter name" }, { key: "gender", label: "Gender", type: "select", lookup: "genders", placeholder: "Select gender", optional: true }, { key: "dob", label: "Date of Birth", placeholder: "Enter date of birth", optional: true }, { key: "age", label: "Age", placeholder: "Enter age", optional: true }],
            initial: null,
            apply: (form) => edit.set(p => ({ ...p, personal: { ...p.personal, children: [...p.personal.children, form] } })) })} />}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {d.personal.children.map((c, i) => (
            <PersonCard key={i} tint="gray" name={c.name}
              fields={[{ label: "Gender", value: c.gender }, { label: "Date of Birth", value: c.dob }, { label: "Age", value: c.age }]}
              onEdit={() => edit({ noun: "Child",
                fields: [{ key: "name", label: "Name" }, { key: "gender", label: "Gender", type: "select", lookup: "genders", optional: true }, { key: "dob", label: "Date of Birth", optional: true }, { key: "age", label: "Age", optional: true }],
                initial: c, apply: (form) => edit.set(p => ({ ...p, personal: { ...p.personal, children: p.personal.children.map((x, j) => j === i ? form : x) } })) })}
              onDelete={() => edit.remove({ noun: "Child", apply: () => edit.set(p => ({ ...p, personal: { ...p.personal, children: p.personal.children.filter((_, j) => j !== i) } })) })} />
          ))}
        </div>
      </DetailCard>
    </Stack>
  );
}

function ContactDetailsTab({ d, edit }) {
  const itemsEditor = (noun, items, applyArr) => <CardActionLink label={edit.label} icon="edit-2-line"
    onClick={() => edit({ noun, fields: items.map(it => ({ key: it.label, label: it.label, placeholder: `Enter ${it.label.toLowerCase()}`, optional: true })),
      initial: Object.fromEntries(items.map(it => [it.label, it.value])),
      apply: (form) => applyArr(items.map(it => ({ label: it.label, value: form[it.label] }))) })} />;
  const contactFields = [{ key: "name", label: "Name", placeholder: "Enter name" }, { key: "phone", label: "Mobile Phone", placeholder: "Enter phone", optional: true }, { key: "email", label: "Email", placeholder: "Enter email", optional: true }, { key: "address", label: "Address", placeholder: "Enter address", optional: true }];
  return (
    <Stack>
      <DetailCard icon="phone-line" title="Personal Contact"
        action={itemsEditor("Personal Contact", d.contact.personal, (arr) => edit.set(p => ({ ...p, contact: { ...p.contact, personal: arr } })))}>
        <DetailPanel items={d.contact.personal} tint="cream" cols={3} />
      </DetailCard>
      <DetailCard icon="group-line" title="Emergency Contact"
        action={<CardActionLink label="Add Contact" icon="add-circle-line" color={ACT_GREEN}
          onClick={() => edit({ noun: "Emergency Contact", create: true, fields: contactFields, initial: null,
            apply: (form) => edit.set(p => ({ ...p, contact: { ...p.contact, emergency: [...p.contact.emergency, form] } })) })} />}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {d.contact.emergency.map((c, i) => (
            <PersonCard key={i} tint="pink" name={c.name}
              fields={[{ label: "Mobile Phone", value: c.phone }, { label: "Email", value: c.email }, { label: "Address", value: c.address }]}
              onEdit={() => edit({ noun: "Emergency Contact", fields: contactFields, initial: c,
                apply: (form) => edit.set(p => ({ ...p, contact: { ...p.contact, emergency: p.contact.emergency.map((x, j) => j === i ? form : x) } })) })}
              onDelete={() => edit.remove({ noun: "Emergency Contact", apply: () => edit.set(p => ({ ...p, contact: { ...p.contact, emergency: p.contact.emergency.filter((_, j) => j !== i) } })) })} />
          ))}
        </div>
      </DetailCard>
      <DetailCard icon="user-heart-line" title="Next of Kin Details"
        action={itemsEditor("Next of Kin Details", d.contact.nextOfKin, (arr) => edit.set(p => ({ ...p, contact: { ...p.contact, nextOfKin: arr } })))}>
        <DetailPanel items={d.contact.nextOfKin} tint="cream" cols={4} />
      </DetailCard>
    </Stack>
  );
}

// avatar + name inline (used in timeline secondaries & reporting-manager table)
function NameWithAvatar({ name, muted }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
      <Avatar name={name} size={22} />
      <span style={{ color: muted ? "var(--gray-400)" : "var(--gray-900)", fontWeight: muted ? 400 : 500 }}>{name}</span>
    </span>
  );
}

const RM_COLUMNS = [
  { key: "date", label: "Date Assigned" }, { key: "name", label: "Name" }, { key: "jobTitle", label: "Job Title" },
  { key: "jobCode", label: "Job Code" }, { key: "note", label: "Note" }, { key: "status", label: "Status" },
];
const rmCell = (k, r) => k === "name" ? <NameWithAvatar name={r.name} />
  : k === "status" ? <StatusBadge variant={r.status} size="sm" />
  : r[k];

const STATUS_FIELD = { key: "status", label: "Status", type: "select",
  options: [{ value: "current", label: "Active" }, { value: "past", label: "Past" }], placeholder: "Select status", optional: true };

function EmploymentDetailsTab({ d, edit }) {
  const emp = d.employment;
  const setEmp = (key, fn) => edit.set(p => ({ ...p, employment: { ...p.employment, [key]: fn(p.employment[key]) } }));

  // "Assign X" → create form prepends a timeline entry. New assignments start as Pending
  // (they go through approval); once approved they become Current — no manual status pick.
  const addEntry = (label, noun, key, fields) => <CardActionLink label={label} icon="user-add-line" color={ACT_GREEN}
    onClick={() => edit({ noun, create: true, verb: "Assign", fields, initial: null,
      apply: (form) => setEmp(key, list => [{ ...form, status: "pending" }, ...list]) })} />;

  // secondary renderers
  const reportsToSecondary = (e) => e.reportsTo
    ? <><span>Reports To:</span><NameWithAvatar name={e.reportsTo} muted /></> : null;

  // Mirrors the People & Culture ▸ Job Title (Change of Job Title) assign flow:
  // New Job Title + Effective Date + Reason/Justification + Reports To. No status select —
  // an assignment starts Pending and becomes Current once approved.
  const jobTitleFields = [
    { key: "title", label: "New Job Title", type: "select", lookup: "jobTitles", placeholder: "Select a new job title" },
    { key: "date", label: "Effective Date", type: "date", placeholder: "Select effective date" },
    { key: "reportsTo", label: "Reports To", type: "select", lookup: "employees", placeholder: "Select manager", optional: true },
    { key: "reason", label: "Reason / Justification", type: "textarea", full: true, placeholder: "Explain the business justification for this change of job title…", optional: true },
  ];
  const branchFields = [
    { key: "date", label: "Effective Date", type: "date", placeholder: "Select effective date" },
    { key: "title", label: "Branch", type: "select", lookup: "branches", placeholder: "Select branch" },
    { key: "note", label: "Note", placeholder: "Enter note", optional: true },
  ];
  const gradeFields = [
    { key: "date", label: "Effective Date", type: "date", placeholder: "Select effective date" },
    { key: "title", label: "Job Grade", type: "select", lookup: "jobGrades", placeholder: "Select job grade" },
    { key: "note", label: "Note", placeholder: "Enter note", optional: true },
  ];
  const deptFields = [
    { key: "date", label: "Effective Date", type: "date", placeholder: "Select effective date" },
    { key: "title", label: "Department", type: "select", lookup: "departments", placeholder: "Select department" },
    { key: "note", label: "Branch", placeholder: "Enter branch", optional: true },
  ];

  const drawerTimeline = (title, icon, entries, accent, renderSecondary) =>
    edit.drawer({ title, icon, content: <TimelineList entries={entries} accent={accent} renderSecondary={renderSecondary} /> });

  // Update Details handlers (edit current record / panel)
  const updRM = <CardActionLink label={edit.label} icon="edit-2-line"
    onClick={() => edit({ noun: "Reporting Manager",
      fields: [{ key: "name", label: "Name", type: "select", lookup: "employees", placeholder: "Select manager" },
        { key: "jobTitle", label: "Job Title", type: "select", lookup: "jobTitles", placeholder: "Select job title", optional: true },
        { key: "jobCode", label: "Job Code", placeholder: "Enter job code", optional: true },
        { key: "note", label: "Note", placeholder: "Enter note", optional: true }, STATUS_FIELD],
      initial: emp.reportingManagers[0],
      apply: (form) => setEmp("reportingManagers", list => list.map((x, i) => i === 0 ? { ...x, ...form } : x)) })} />;
  const updFinance = <CardActionLink label={edit.label} icon="edit-2-line"
    onClick={() => edit({ noun: "Identification and Financial Information",
      fields: emp.finance.map(it => ({ key: it.label, label: it.label, placeholder: `Enter ${it.label.toLowerCase()}`, optional: true })),
      initial: Object.fromEntries(emp.finance.map(it => [it.label, it.value])),
      apply: (form) => setEmp("finance", list => list.map(it => ({ label: it.label, value: form[it.label] }))) })} />;
  const updInfo = <CardActionLink label={edit.label} icon="edit-2-line"
    onClick={() => edit({ noun: "Employment Information",
      fields: emp.info.map(it => ({ key: it.label, label: it.label, placeholder: `Enter ${it.label.toLowerCase()}`, optional: true })),
      initial: Object.fromEntries(emp.info.map(it => [it.label, it.value])),
      apply: (form) => setEmp("info", list => list.map(it => ({ label: it.label, value: form[it.label] }))) })} />;

  return (
    <Stack>
      <DetailCard icon="briefcase-line" title="Employment Information" action={updInfo}>
        <DetailPanel items={emp.info} tint="gray" cols={4} />
      </DetailCard>

      <TwoCol>
        <DetailCard icon="briefcase-line" title="Job Title" action={addEntry("Assign Title", "Job Title", "jobTitles", jobTitleFields)}>
          <TimelineList entries={emp.jobTitles.slice(0, 3)} accent="cream" renderSecondary={reportsToSecondary} />
          <SeeMore onClick={() => drawerTimeline("Job Title History", "briefcase-line", emp.jobTitles, "cream", reportsToSecondary)} />
        </DetailCard>
        <DetailCard icon="building-line" title="Branch" action={addEntry("Assign Branch", "Branch", "branches", branchFields)}>
          <TimelineList entries={emp.branches.slice(0, 3)} accent="pink" />
          <SeeMore onClick={() => drawerTimeline("Branch History", "building-line", emp.branches, "pink")} />
        </DetailCard>
      </TwoCol>

      <DetailCard icon="user-star-line" title="Reporting Manager" action={updRM}>
        <HistoryTable columns={RM_COLUMNS} rows={emp.reportingManagers.slice(0, 2)} renderCell={rmCell} />
        <SeeMore onClick={() => edit.drawer({ title: "Reporting Manager History", icon: "user-star-line",
          content: <HistoryTable columns={RM_COLUMNS} rows={emp.reportingManagers} renderCell={rmCell} /> })} />
      </DetailCard>

      <TwoCol>
        <DetailCard icon="bar-chart-grouped-line" title="Job Grade" action={addEntry("Assign Grade", "Job Grade", "jobGrades", gradeFields)}>
          <TimelineList entries={emp.jobGrades.slice(0, 3)} accent="pink" />
          <SeeMore onClick={() => drawerTimeline("Job Grade History", "bar-chart-grouped-line", emp.jobGrades, "pink")} />
        </DetailCard>
        <DetailCard icon="community-line" title="Department" action={addEntry("Assign Department", "Department", "departments", deptFields)}>
          <TimelineList entries={emp.departments.slice(0, 3)} accent="cream" />
          <SeeMore onClick={() => drawerTimeline("Department History", "community-line", emp.departments, "cream")} />
        </DetailCard>
      </TwoCol>

      <DetailCard icon="bank-card-line" title="Identification and Financial Information" action={updFinance}>
        <DetailPanel items={emp.finance} tint="cream" cols={3} />
      </DetailCard>
    </Stack>
  );
}

function EmployeeDetail({ employee, onBack, onToast, mode = "admin", onRequest, hideBreadcrumb = false }) {
  const isSelf = mode === "self";
  const [tab, setTab] = useState("Personal Information");
  const [d, setD] = useState(() => buildEmployeeDetail(employee));
  const [form, setForm] = useState(null);     // { noun, fields, initial, apply, create }
  const [confirm, setConfirm] = useState(null); // { verb, noun, run }
  const [drawer, setDrawer] = useState(null);   // { title, icon, content }
  const [photo, setPhoto] = useState(null);     // profile-picture data URL (self upload)
  const [picOpen, setPicOpen] = useState(false);
  useEffect(() => { setD(buildEmployeeDetail(employee)); }, [employee]);

  // `edit` is callable (open a form) and carries .set (mutate d), .remove (delete-confirm), .drawer (side sheet)
  const edit = (cfg) => setForm(cfg);
  edit.set = setD;
  edit.mode = mode;
  edit.label = isSelf ? "Request Update" : "Update Details";
  edit.remove = ({ noun, apply, verb, pastVerb }) => {
    if (isSelf) setConfirm({ verb: "Request", noun, run: () => { onRequest && onRequest({ section: noun, change: "delete" }); onToast && onToast("Request Submitted", { tone: "success" }); } });
    else { const v = verb || "Delete", pv = pastVerb || `${v}d`; setConfirm({ verb: v, noun, run: () => { apply(); onToast && onToast(`${noun} ${pv}`, { tone: "error" }); } }); }
  };
  edit.drawer = (cfg) => setDrawer(cfg);
  edit.toast = (msg) => onToast && onToast(msg);

  const submitForm = (formData) => {
    const create = form.create;
    const noun = form.noun;
    const apply = form.apply;
    if (isSelf) {
      setConfirm({ verb: "Request", noun, run: () => {
        onRequest && onRequest({ section: noun, change: create ? "add" : "update", before: form.initial, after: formData, fields: form.fields });
        onToast && onToast("Request Submitted", { tone: "success" });
      } });
    } else {
      const verb = form.verb || (create ? "Add" : "Update");
      const past = verb === "Assign" ? "Assigned" : create ? "Added" : "Updated";
      setConfirm({ verb, noun, run: () => { apply(formData); onToast && onToast(`${noun} ${past}`, { tone: "success" }); } });
    }
  };

  const CONFIRM_ICON = { Add: "add-line", Assign: "user-add-line", Update: "check-line", Delete: "delete-bin-6-line", Archive: "archive-line", Request: "send-plane-line" };

  return (
    <div className="ed-root">
      {!hideBreadcrumb && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, fontFamily: "var(--font-ui)", fontSize: 15, whiteSpace: "nowrap" }}>
          <button onClick={onBack} style={{ display: "inline-flex", alignItems: "center", gap: 6, border: 0, background: "none", cursor: "pointer", color: "var(--gray-500)", fontWeight: 600, fontFamily: "var(--font-ui)", fontSize: 15 }}>
            <Icon name="group-line" size={18} color="var(--gray-500)" />Employees
          </button>
          <Icon name="arrow-right-s-line" size={18} color="var(--gray-400)" />
          <span style={{ fontWeight: 700, color: "var(--gray-900)" }}>Employee Details</span>
        </div>
      )}
      <ProfileHeader emp={d} tab={tab} onTab={setTab} photo={photo}
        onAvatarClick={isSelf ? () => setPicOpen(true) : undefined} />
      {tab === "Personal Information" && <PersonalInfoTab d={d} edit={edit} />}
      {tab === "Contact Details" && <ContactDetailsTab d={d} edit={edit} />}
      {tab === "Employment Details" && <EmploymentDetailsTab d={d} edit={edit} />}
      {tab === "Documents" && <DocumentsTab d={d} edit={edit} />}

      {/* edit / create form */}
      {form && (
        <FormModal config={{ noun: form.noun, fields: form.fields, hideActive: true, verb: form.verb,
          subtitle: form.verb === "Assign" ? `Assign a new ${form.noun.toLowerCase()} to this employee. It stays pending until approved.`
            : form.create ? `Add a new ${form.noun.toLowerCase()}` : `Update the ${form.noun.toLowerCase()} of this employee` }}
          initial={form.initial} onClose={() => setForm(null)} onSubmit={submitForm} />
      )}

      {/* confirmation → toast */}
      {confirm && (
        <ConfirmModal
          title={confirm.verb === "Request" ? "Request Update" : `${confirm.verb} ${confirm.noun}`}
          message={confirm.verb === "Request" ? `Are you sure you want to request an update to your ${confirm.noun.toLowerCase()}?` : `Are you sure you want to ${confirm.verb.toLowerCase()} this ${confirm.noun.toLowerCase()}?`}
          confirmLabel={`Yes, ${confirm.verb}`} confirmIcon={CONFIRM_ICON[confirm.verb]}
          cancelLabel={(confirm.verb === "Add" || confirm.verb === "Assign" || confirm.verb === "Request") ? "Cancel" : "No"}
          onConfirm={() => { confirm.run(); setConfirm(null); setForm(null); }}
          onClose={() => setConfirm(null)} />
      )}

      {/* See More → right side drawer */}
      <Drawer open={!!drawer} title={drawer && drawer.title} icon={drawer && drawer.icon} onClose={() => setDrawer(null)}>
        {drawer && drawer.content}
      </Drawer>

      {/* profile-picture upload (self) */}
      {picOpen && (
        <ProfilePictureModal name={d.name} photo={photo} onClose={() => setPicOpen(false)}
          onSave={(url) => { setPhoto(url); setPicOpen(false); onToast && onToast("Profile Picture Updated", { tone: "success" }); }} />
      )}
    </div>
  );
}

Object.assign(window, { EmployeeDetail });
