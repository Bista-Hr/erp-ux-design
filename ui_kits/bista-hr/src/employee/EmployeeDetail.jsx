// BISTA HR · employee/EmployeeDetail — profile page with 4 tabs, built from reusable
// DetailCard / DetailPanel / PersonCard / HistoryTable. Breadcrumb returns to the list.
// Every card's "Update Details" / "Add …" / per-row edit & delete run through the same
// FormModal → ConfirmModal → toast flow used elsewhere (onToast comes from the App).
const DETAIL_TABS = ["Personal Information", "Contact Details", "Employment Details", "Documents"];
const ACT_GREEN = "#086333";

// Amber pending pill — mirrors PendingUpdateBadge in the production My Info cards:
// "Pending Approval" text opens the change-request preview; Cancel sits inside the pill.
function PendingPill({ onView, onCancel }) {
  const [hov, setHov] = React.useState(false);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid #FDE68A", background: "#FFFBEB", borderRadius: 999, padding: "5px 6px 5px 12px" }}>
      <button onClick={onView} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{ border: 0, background: "none", padding: 0, cursor: "pointer", fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 12.5, color: "#D97706", textDecoration: hov ? "underline" : "none" }}>Pending Approval</button>
      <button onClick={onCancel} style={{ border: "1px solid #FDE68A", background: "none", borderRadius: 6, padding: "2px 9px", cursor: "pointer", fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 12, color: "#B45309" }}>Cancel</button>
    </span>
  );
}

// Change-request preview — mirrors EssChangeRequestDetailsDialog: Current Details (pink
// panel, changed fields highlighted) then Requested Details (gray panel, same highlights).
function ChangeRequestModal({ noun, req, onClose }) {
  const after = req.after || {};
  const allFields = (req.fields || []).filter(f => !f.showIf || f.showIf(after));
  const fields = allFields.filter(f => f.type !== "docs");
  const docsF = allFields.find(f => f.type === "docs");
  const docsVal = docsF ? after[docsF.key] : null;
  const docUrls = (docsVal && typeof docsVal === "object") ? SupportingDocuments.resolve(docsVal, "https://files.bistasol.com/ess/") : [];
  const v = (obj, f) => { const x = obj ? (obj[f.key] ?? "-") : "-"; return (x === "" || typeof x === "object") ? "-" : x; };
  const rows = fields.map(f => { const before = v(req.before, f), after = v(req.after, f); return { label: f.label, before, after, changed: before !== after }; });
  const secLabel = (t) => <div style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 13.5, color: "var(--gray-700)" }}>{t}</div>;
  return (
    <Modal onClose={onClose} width={960} flexBody>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "24px 24px 16px", flex: "none" }}>
        <div>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 20, lineHeight: "28px", color: "var(--gray-900)" }}>Change Request Details</div>
          <div className="bh-body" style={{ marginTop: 4 }}>Review your pending {noun.toLowerCase()} update request</div>
        </div>
        <button className="btn btn-icon btn-ghost" onClick={onClose} style={{ width: 32, height: 32, padding: 0 }}>
          <Icon name="close-line" size={20} color="var(--gray-500)" />
        </button>
      </div>
      <div style={{ padding: "0 24px 24px", overflowY: "auto", flex: "1 1 auto", minHeight: 0, display: "flex", flexDirection: "column", gap: 20 }}>
        {req.change === "delete" ? (
          <div style={{ background: "#FFF3F3", borderRadius: 8, padding: "16px 18px", fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--gray-700)" }}>
            You requested the removal of this {noun.toLowerCase()} record. It stays in place until an administrator approves the request.
          </div>
        ) : (
          <React.Fragment>
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                {secLabel("Current Details")}
                <StatusBadge variant="pending" text="Pending" size="sm" />
              </div>
              <DetailPanel items={rows.map(r => ({ label: r.label, value: r.before, changed: r.changed }))} tint="pink" cols={3} accent="#FFC9C9" changeBg="#FFE0E0" />
            </div>
            <div>
              <div style={{ marginBottom: 10 }}>{secLabel("Requested Details")}</div>
              <DetailPanel items={rows.map(r => ({ label: r.label, value: r.after, changed: r.changed }))} tint="gray" cols={3} accent="#EAECF0" changeBg="#F2F4F7" />
            </div>
            {docUrls.length > 0 && (
              <div>
                <div style={{ marginBottom: 10 }}>{secLabel("Supporting Documents")}</div>
                <SupportingDocumentsList urls={docUrls} />
              </div>
            )}
          </React.Fragment>
        )}
      </div>
    </Modal>
  );
}

// field definitions for the education panel — exact set from EducationDisplay.tsx
const EDU_FIELDS = [
  ["Degree", "degree"], ["Qualification", "qualification"], ["Field of Study", "fieldOfStudy"],
  ["Start Date", "startDate"], ["End Date", "endDate"], ["Status", "status"],
];
const eduItems = (o) => EDU_FIELDS.map(([label, key]) => ({ label, value: o[key] }));
// editor types per label — mirror the production edit dialogs (selects, date pickers,
// country dropdown with flag) instead of plain text inputs
const EDU_TYPES = { "Start Date": { type: "date", placeholder: "Select start date" }, "End Date": { type: "date", placeholder: "Select end date" },
  "Status": { type: "select", options: ["Completed", "Ongoing"], placeholder: "Select status" } };
const eduFormFields = () => [{ key: "institution", label: "Institution", placeholder: "Enter institution" },
  ...EDU_FIELDS.map(([label, key]) => ({ key, label, placeholder: `Enter ${label.toLowerCase()}`, optional: true, ...(EDU_TYPES[label] || {}) })),
  { key: "__docs", label: "Supporting Documents", type: "docs", full: true }];
const SEL = (lookup, noun) => ({ type: "select", lookup, placeholder: `Select ${noun}` });
const BASIC_TYPES = {
  "Title": SEL("titles", "title"), "Gender": SEL("genders", "gender"),
  "Marital Status": SEL("maritalStatus", "marital status"), "Nationality": SEL("countries", "country"),
  "Date of Birth": { type: "date", placeholder: "Select date of birth" },
};
const ADDRESS_TYPES = { "Country": SEL("countries", "country"), "GPS Code": { type: "gps" } };
const ID_TYPES = { "ID Type": SEL("idTypes", "ID type"), "ID Number": { ghanaCardIf: "ID Type", placeholder: "Enter ID number" },
  "Created On": { type: "date", placeholder: "Select date" }, "Expiry Date": { type: "date", placeholder: "Select date" } };
const SPOUSE_TYPES = { "Gender": SEL("genders", "gender"), "Phone Number": { optional: false }, "Ghana Card Number": { type: "ghanaCard" },
  "Date of Birth": { type: "date", placeholder: "Select date of birth" }, "Date of Marriage": { type: "date", placeholder: "Select date of marriage" } };
// shared multi-doc upload field (SupportingDocuments — the same P&C component with preview)
const DOCS_FIELD = (required) => ({ key: "__docs", label: "Supporting Documents", type: "docs", full: true, optional: !required });
// attach a circular flag to Nationality / Country display values
const withFlags = (items) => items.map(it => {
  if (it.label !== "Nationality" && it.label !== "Country") return it;
  const c = (window.COUNTRY_LIST || []).find(x => x.name === it.value);
  return c ? { ...it, flag: flagUrl(c.code) } : it;
});
// age is always derived from date of birth (never a form field)
const childAge = (dob) => {
  const d = new Date(dob); if (isNaN(d)) return "-";
  const t = new Date(); let a = t.getFullYear() - d.getFullYear();
  const m = t.getMonth() - d.getMonth(); if (m < 0 || (m === 0 && t.getDate() < d.getDate())) a--;
  return a >= 0 ? String(a) : "-";
};
const EC_RELATIONSHIPS = ["Spouse", "Parent", "Sibling", "Friend", "Family Relative", "Work Colleague"];

// scroll a section card into view WITHOUT scrollIntoView (finds the scrollable ancestor)
function scrollToSection(id) {
  const el = document.getElementById(id); if (!el) return;
  let p = el.parentElement;
  while (p && !(p.scrollHeight > p.clientHeight + 4 && /(auto|scroll)/.test(getComputedStyle(p).overflowY))) p = p.parentElement;
  const top = el.getBoundingClientRect().top;
  if (p) p.scrollTo({ top: p.scrollTop + top - p.getBoundingClientRect().top - 84, behavior: "smooth" });
  else window.scrollTo({ top: window.scrollY + top - 84, behavior: "smooth" });
}

// Warning card shown to the logged-in employee when marital status is Married — click to
// jump to (and edit) Spouse Details; dismissable, with "never show again" kept in sessionStorage.
function SpouseAlert({ onUpdate, onClose, onNever }) {
  return (
    <div role="button" tabIndex={0} onClick={onUpdate}
      onKeyDown={e => { if (e.key === "Enter") onUpdate(); }}
      style={{ display: "flex", alignItems: "flex-start", gap: 12, background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 12, padding: "14px 18px", cursor: "pointer" }}>
      <Icon name="alert-line" size={20} color="#D97706" style={{ marginTop: 2 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 14.5, color: "var(--gray-900)" }}>Update your spouse details</div>
        <div style={{ fontFamily: "var(--font-ui)", fontSize: 13.5, color: "var(--gray-700)", marginTop: 2 }}>
          Your marital status is set to Married — please make sure your spouse information is complete and up to date.
        </div>
        <div style={{ display: "flex", gap: 18, marginTop: 8 }} onClick={e => e.stopPropagation()}>
          <CardActionLink label="Update Spouse Details" icon="arrow-right-line" color="#B45309" onClick={onUpdate} />
          <button onClick={onNever} style={{ border: 0, background: "none", padding: 0, cursor: "pointer", fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 13, color: "var(--gray-400)", textDecoration: "underline" }}>Never show this again</button>
        </div>
      </div>
      <button onClick={e => { e.stopPropagation(); onClose(); }} style={{ border: 0, background: "none", padding: 0, cursor: "pointer", display: "flex" }}>
        <Icon name="close-line" size={18} color="#B45309" />
      </button>
    </div>
  );
}

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
  const isSelf = edit.mode === "self";
  const upd = (noun, fields, initial, apply, noApproval) => edit.action(noun,
    <CardActionLink label={noApproval ? "Update Details" : edit.label} icon="edit-2-line" onClick={() => edit({ noun, fields, initial, apply, noApproval })} />);
  // opts: skip (labels excluded from the form), types (per-label field overrides),
  // docs ("required"|"optional" multi-doc upload), noApproval (applies directly, even in ESS)
  const itemsCfg = (noun, items, applyArr, opts = {}) => {
    const { skip = [], types = {}, docs, noApproval } = opts;
    return { noun, noApproval,
      fields: [
        ...items.filter(it => !skip.includes(it.label)).map(it => ({ key: it.label, label: it.label, placeholder: `Enter ${it.label.toLowerCase()}`, optional: true, ...(types[it.label] || {}) })),
        ...(docs ? [DOCS_FIELD(docs === "required")] : []),
      ],
      initial: Object.fromEntries(items.map(it => [it.label, it.value])),
      apply: (form) => applyArr(items.map(it => ({ label: it.label, value: skip.includes(it.label) ? it.value : form[it.label] }))) };
  };
  const itemsEditor = (noun, items, applyArr, opts = {}) => {
    const cfg = itemsCfg(noun, items, applyArr, opts);
    return upd(cfg.noun, cfg.fields, cfg.initial, cfg.apply, cfg.noApproval);
  };
  // ESS: Gender and Nationality are managed by HR — shown but disabled
  const basicTypes = isSelf ? { ...BASIC_TYPES, "Gender": { disabled: true }, "Nationality": { disabled: true } } : BASIC_TYPES;
  const childFields = (withName) => [
    { key: "name", label: "Name", placeholder: "Enter name" },
    { key: "gender", label: "Gender", type: "select", lookup: "genders", placeholder: "Select gender", optional: true },
    { key: "dob", label: "Date of Birth", type: "date", placeholder: "Select date of birth", optional: true },
  ];
  // Married → nudge the employee to keep spouse details current (My Info only)
  const spouseApply = (arr) => edit.set(p => ({ ...p, personal: { ...p.personal, spouse: arr } }));
  const spouseCfg = () => itemsCfg("Spouse Details", d.personal.spouse, spouseApply, { types: SPOUSE_TYPES, docs: "required" });
  const married = (d.personal.basic.find(it => it.label === "Marital Status") || {}).value === "Married";
  const alertKey = `bh-spouse-alert-${d.code || d.id}`;
  const [alertNever, setAlertNever] = React.useState(() => { try { return sessionStorage.getItem(alertKey) === "never"; } catch (e) { return false; } });
  const [alertClosed, setAlertClosed] = React.useState(false);

  return (
    <Stack>
      {isSelf && married && !alertNever && !alertClosed && (
        <SpouseAlert
          onUpdate={() => { scrollToSection("sec-spouse"); edit(spouseCfg()); }}
          onClose={() => setAlertClosed(true)}
          onNever={() => { try { sessionStorage.setItem(alertKey, "never"); } catch (e) {} setAlertNever(true); }} />
      )}
      <DetailCard id="sec-personal-info" icon="user-3-line" title="Personal Information"
        action={itemsEditor("Personal Information", d.personal.basic, (arr) => edit.set(p => ({ ...p, personal: { ...p.personal, basic: arr } })), { skip: ["Employee ID"], types: basicTypes, docs: "required" })}>
        <DetailPanel items={withFlags(d.personal.basic)} tint="gray" cols={4} />
      </DetailCard>
      <TwoCol>
        <DetailCard id="sec-address" icon="map-pin-line" title="Address Information"
          action={itemsEditor("Address Information", d.personal.address, (arr) => edit.set(p => ({ ...p, personal: { ...p.personal, address: arr } })), { types: ADDRESS_TYPES, docs: "optional", noApproval: true })}>
          <DetailPanel items={withFlags(d.personal.address)} tint="pink" cols={3} />
        </DetailCard>
        <DetailCard id="sec-identification" icon="profile-line" title="Identification Information"
          action={itemsEditor("Identification Information", d.personal.identification, (arr) => edit.set(p => ({ ...p, personal: { ...p.personal, identification: arr } })), { types: ID_TYPES, docs: "optional" })}>
          <DetailPanel items={d.personal.identification} tint="cream" cols={2} />
        </DetailCard>
      </TwoCol>
      <TwoCol>
        <DetailCard id="sec-spouse" icon="heart-3-line" title="Spouse Details"
          action={itemsEditor("Spouse Details", d.personal.spouse, spouseApply, { types: SPOUSE_TYPES, docs: "required" })}>
          <DetailPanel items={d.personal.spouse} tint="cream" cols={2} />
        </DetailCard>
        <DetailCard id="sec-children" icon="bear-smile-line" title="Children Details"
          action={edit.action("Child", <CardActionLink label="Add Child" icon="add-circle-line" color={ACT_GREEN}
            onClick={() => edit({ noun: "Child", create: true, fields: childFields(), initial: null,
              apply: (form) => edit.set(p => ({ ...p, personal: { ...p.personal, children: [...p.personal.children, form] } })) })} />)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {d.personal.children.map((c, i) => (
              <PersonCard key={i} tint="gray" name={c.name}
                fields={[{ label: "Gender", value: c.gender }, { label: "Date of Birth", value: c.dob }, { label: "Age", value: childAge(c.dob) }]}
                onEdit={() => edit({ noun: "Child", fields: childFields(),
                  initial: c, apply: (form) => edit.set(p => ({ ...p, personal: { ...p.personal, children: p.personal.children.map((x, j) => j === i ? form : x) } })) })}
                onDelete={() => edit.remove({ noun: "Child", apply: () => edit.set(p => ({ ...p, personal: { ...p.personal, children: p.personal.children.filter((_, j) => j !== i) } })) })} />
            ))}
          </div>
        </DetailCard>
      </TwoCol>
      <DetailCard id="sec-education" icon="graduation-cap-line" title="Education Details"
        action={edit.action("Education", <CardActionLink label="Add Education" icon="add-circle-line" color={ACT_GREEN}
          onClick={() => edit({ noun: "Education", create: true, fields: eduFormFields(), initial: null,
            apply: (form) => edit.set(p => ({ ...p, personal: { ...p.personal, education: [...p.personal.education, form] } })) })} />)}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {d.personal.education.map((e, i) => (
            <PersonCard key={i} tint="gray" name={e.institution} fields={eduItems(e)}
              onEdit={() => edit({ noun: "Education", fields: eduFormFields(), initial: e,
                apply: (form) => edit.set(p => ({ ...p, personal: { ...p.personal, education: p.personal.education.map((x, j) => j === i ? form : x) } })) })}
              onDelete={() => edit.remove({ noun: "Education", apply: () => edit.set(p => ({ ...p, personal: { ...p.personal, education: p.personal.education.filter((_, j) => j !== i) } })) })} />
          ))}
        </div>
      </DetailCard>
    </Stack>
  );
}

function ContactDetailsTab({ d, edit }) {
  const isSelf = edit.mode === "self";
  // Contact Information applies directly — it does NOT go through approval
  const itemsEditor = (noun, items, applyArr, types = {}) => edit.action(noun, <CardActionLink label="Update Details" icon="edit-2-line"
    onClick={() => edit({ noun, noApproval: true, fields: items.map(it => ({ key: it.label, label: it.label, placeholder: `Enter ${it.label.toLowerCase()}`, optional: true, ...(types[it.label] || {}) })),
      initial: Object.fromEntries(items.map(it => [it.label, it.value])),
      apply: (form) => applyArr(items.map(it => ({ label: it.label, value: (types[it.label] || {}).disabled ? it.value : form[it.label] }))) })} />);
  // ESS: the work email is system-managed — visible but disabled
  const contactTypes = isSelf ? { "Work Email": { disabled: true } } : {};
  const contactFields = [
    { key: "name", label: "Name", placeholder: "Enter name" },
    { key: "relationship", label: "Relationship", type: "select", options: EC_RELATIONSHIPS, placeholder: "Select relationship" },
    { key: "colleague", label: "Work Colleague", type: "select", lookup: "employees", placeholder: "Select colleague", optional: true,
      showIf: (f) => f.relationship === "Work Colleague",
      // colleague details already live in the system — populate everything except Priority Order
      autofill: (v) => { const e = (window.EMPLOYEES || []).find(x => x.name === v);
        return e ? { name: e.name, gender: e.gender || "", phone: e.phone || "", homePhone: "-", workPhone: "030201234567",
          email: e.email, address: `${e.branch} Branch · ${e.dept}` } : { name: v }; } },
    { key: "gender", label: "Gender", type: "select", lookup: "genders", placeholder: "Select gender", optional: true },
    { key: "phone", label: "Primary Phone", placeholder: "Enter primary phone", optional: true },
    { key: "homePhone", label: "Home Phone", placeholder: "Enter home phone", optional: true },
    { key: "workPhone", label: "Work Phone", placeholder: "Enter work phone", optional: true },
    { key: "email", label: "Email", placeholder: "Enter email", optional: true },
    { key: "address", label: "Address", placeholder: "Enter address", optional: true },
    { key: "priority", label: "Priority Order", placeholder: "Enter priority order", optional: true },
  ];
  const contactItemFields = (c) => [
    { label: "Relationship", value: c.relationship }, { label: "Gender", value: c.gender },
    { label: "Primary Phone", value: c.phone }, { label: "Home Phone", value: c.homePhone },
    { label: "Work Phone", value: c.workPhone }, { label: "Email", value: c.email },
    { label: "Address", value: c.address }, { label: "Priority Order", value: c.priority },
  ];
  return (
    <Stack>
      <DetailCard id="sec-contact-info" icon="phone-line" title="Contact Information"
        action={itemsEditor("Contact Information", d.contact.personal, (arr) => edit.set(p => ({ ...p, contact: { ...p.contact, personal: arr } })), contactTypes)}>
        <DetailPanel items={d.contact.personal} tint="cream" cols={3} />
      </DetailCard>
      <DetailCard id="sec-emergency-contact" icon="group-line" title="Emergency Contact"
        action={edit.action("Emergency Contact", <CardActionLink label="Add Contact" icon="add-circle-line" color={ACT_GREEN}
          onClick={() => edit({ noun: "Emergency Contact", create: true, fields: contactFields, initial: null,
            apply: (form) => edit.set(p => ({ ...p, contact: { ...p.contact, emergency: [...p.contact.emergency, form] } })) })} />)}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {d.contact.emergency.map((c, i) => (
            <PersonCard key={i} tint="pink" name={c.name} fields={contactItemFields(c)}
              onEdit={() => edit({ noun: "Emergency Contact", fields: contactFields, initial: c,
                apply: (form) => edit.set(p => ({ ...p, contact: { ...p.contact, emergency: p.contact.emergency.map((x, j) => j === i ? form : x) } })) })}
              onDelete={() => edit.remove({ noun: "Emergency Contact", apply: () => edit.set(p => ({ ...p, contact: { ...p.contact, emergency: p.contact.emergency.filter((_, j) => j !== i) } })) })} />
          ))}
        </div>
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
  { key: "effectiveDate", label: "Effective Date" }, { key: "date", label: "Date Assigned" },
  { key: "name", label: "Manager" }, { key: "note", label: "Note" }, { key: "status", label: "Status" },
];
const rmCell = (k, r) => k === "name" ? <NameWithAvatar name={r.name} />
  : k === "status" ? <StatusBadge variant={r.status} size="sm" />
  : r[k];

const EH_COLUMNS = [
  { key: "date", label: "Date Assigned" }, { key: "type", label: "Name" },
  { key: "note", label: "Note" }, { key: "status", label: "Status" },
];
const ehCell = (k, r) => k === "status" ? <StatusBadge variant={r.status} size="sm" /> : r[k];

const STATUS_FIELD = { key: "status", label: "Status", type: "select",
  options: [{ value: "current", label: "Active" }, { value: "past", label: "Past" }], placeholder: "Select status", optional: true };

function EmploymentDetailsTab({ d, edit }) {
  const emp = d.employment;
  // ESS: employment is VIEW ONLY — no update / assign actions
  const viewOnly = edit.mode === "self";
  const act = (el) => viewOnly ? undefined : el;
  const setEmp = (key, fn) => edit.set(p => ({ ...p, employment: { ...p.employment, [key]: fn(p.employment[key]) } }));

  // "Assign X" → create form prepends a timeline entry. New assignments start as Pending
  // (they go through approval); once approved they become Current — no manual status pick.
  const addEntry = (label, noun, key, fields) => act(edit.action(noun, <CardActionLink label={label} icon="user-add-line" color={ACT_GREEN}
    onClick={() => edit({ noun, create: true, verb: "Assign", fields, initial: null,
      apply: (form) => setEmp(key, list => [{ ...form, status: "pending" }, ...list]) })} />));

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
  const updRM = act(edit.action("Reporting Manager", <CardActionLink label={edit.label} icon="edit-2-line"
    onClick={() => edit({ noun: "Reporting Manager",
      fields: [{ key: "name", label: "Manager", type: "select", lookup: "employees", placeholder: "Select manager" },
        { key: "effectiveDate", label: "Effective Date", type: "date", placeholder: "Select effective date", optional: true },
        { key: "note", label: "Note", placeholder: "Enter note", optional: true }, STATUS_FIELD],
      initial: emp.reportingManagers[0],
      apply: (form) => setEmp("reportingManagers", list => list.map((x, i) => i === 0 ? { ...x, ...form } : x)) })} />));
  const updFinance = act(edit.action("National Identification and Financial Information", <CardActionLink label={edit.label} icon="edit-2-line"
    onClick={() => edit({ noun: "National Identification and Financial Information",
      fields: emp.finance.map(it => ({ key: it.label, label: it.label, placeholder: `Enter ${it.label.toLowerCase()}`, optional: true })),
      initial: Object.fromEntries(emp.finance.map(it => [it.label, it.value])),
      apply: (form) => setEmp("finance", list => list.map(it => ({ label: it.label, value: form[it.label] }))) })} />));
  // Employment Information edit — same filterable pickers as People & Culture:
  // Branch/ Unit uses the zone-filtered UnitBranchCombobox (synced with the Zone field),
  // Job Title uses the department-filtered DesignationCombobox (synced with Department).
  const EMP_INFO_TYPES = {
    "Employee Status": { type: "select", options: ["Active", "Inactive"], placeholder: "Select status" },
    "Employee Type": { type: "select", options: ["Full-time", "Part-time", "Contract", "National Service"], placeholder: "Select type" },
    "Zone": { type: "select", lookup: "zones", placeholder: "Select zone" },
    "Branch/ Unit": { type: "unitBranch", zoneKey: "Zone" },
    "Department": { type: "select", lookup: "departments", placeholder: "Select department" },
    "Job Title": { type: "designation", deptKey: "Department" },
    "Job Grade": { type: "select", lookup: "jobGrades", placeholder: "Select job grade" },
    "Notch": { type: "select", placeholder: "Select notch", optionsFor: (f) => {
      const n = (window.gradeNotchCount && gradeNotchCount(f["Job Grade"])) || 10;
      return Array.from({ length: n }, (_, i) => String(i + 1)); } },
    "Annual Salary": { disabled: true },
    "Date Employed": { type: "date", placeholder: "Select date" },
    "Date Confirmed": { type: "date", placeholder: "Select date" },
    "Date of Termination/Resignation": { type: "date", placeholder: "Select date" },
  };
  const updInfo = act(edit.action("Employment Information", <CardActionLink label={edit.label} icon="edit-2-line"
    onClick={() => edit({ noun: "Employment Information",
      fields: emp.info.map(it => ({ key: it.label, label: it.label, placeholder: `Enter ${it.label.toLowerCase()}`, optional: true, ...(EMP_INFO_TYPES[it.label] || {}) })),
      initial: Object.fromEntries(emp.info.map(it => [it.label, it.value])),
      apply: (form) => setEmp("info", list => list.map(it => ({ label: it.label, value: form[it.label] }))) })} />));

  return (
    <Stack>
      <DetailCard icon="briefcase-line" title="Employment Information" action={updInfo}>
        <DetailPanel items={emp.info} tint="gray" cols={4} />
      </DetailCard>

      <DetailCard icon="history-line" title="Employment History"
        action={addEntry("Add History", "Employment History", "history", [
          { key: "date", label: "Date Assigned", type: "date", placeholder: "Select date" },
          { key: "type", label: "Employment Type", placeholder: "Enter employment type" },
          { key: "note", label: "Note", placeholder: "Enter note", optional: true },
        ])}>
        <HistoryTable columns={EH_COLUMNS} rows={emp.history} renderCell={ehCell} />
      </DetailCard>

      <DetailCard icon="time-line" title="Employment status timeline">
        <TimelineList entries={emp.statusTimeline} accent="gray" />
      </DetailCard>

      <TwoCol>
        <DetailCard icon="building-line" title="Branch/ Unit" action={addEntry("Assign Branch", "Branch/ Unit", "branches", branchFields)}>
          <TimelineList entries={emp.branches.slice(0, 3)} accent="pink" />
          <SeeMore onClick={() => drawerTimeline("Branch/ Unit History", "building-line", emp.branches, "pink")} />
        </DetailCard>
        <DetailCard icon="briefcase-line" title="Job Title" action={addEntry("Assign Title", "Job Title", "jobTitles", jobTitleFields)}>
          <TimelineList entries={emp.jobTitles.slice(0, 3)} accent="cream" renderSecondary={reportsToSecondary} />
          <SeeMore onClick={() => drawerTimeline("Job Title History", "briefcase-line", emp.jobTitles, "cream", reportsToSecondary)} />
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

      <DetailCard icon="wallet-line" title="Compensation">
        <DetailPanel items={emp.compensation} tint="gray" cols={4} />
      </DetailCard>

      <DetailCard icon="bank-card-line" title="National Identification and Financial Information" action={updFinance}>
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
  const [pendingReq, setPendingReq] = useState({}); // self mode: section noun → { before, after, fields, change }
  const [viewReq, setViewReq] = useState(null);     // change-request preview modal
  useEffect(() => { setD(buildEmployeeDetail(employee)); }, [employee]);
  // dashboard completion card → open My Info focused on a section: switch to its tab and scroll
  useEffect(() => {
    if (!isSelf) return;
    const consume = () => {
      const f = window.__myInfoFocus; if (!f) return;
      window.__myInfoFocus = null;
      if (f.tab) setTab(f.tab);
      setTimeout(() => scrollToSection(f.id), 300);
    };
    consume();
    window.addEventListener("myinfo-focus", consume);
    return () => window.removeEventListener("myinfo-focus", consume);
  }, []);

  // `edit` is callable (open a form) and carries .set (mutate d), .remove (delete-confirm), .drawer (side sheet)
  const edit = (cfg) => setForm(cfg);
  edit.set = setD;
  edit.mode = mode;
  edit.label = isSelf ? "Request Update" : "Update Details";
  edit.remove = ({ noun, apply, verb, pastVerb }) => {
    if (isSelf) setConfirm({ verb: "Request", noun, run: () => { onRequest && onRequest({ section: noun, change: "delete" }); setPendingReq(p => ({ ...p, [noun]: { change: "delete" } })); onToast && onToast("Request Submitted", { tone: "success" }); } });
    else { const v = verb || "Delete", pv = pastVerb || `${v}d`; setConfirm({ verb: v, noun, run: () => { apply(); onToast && onToast(`${noun} ${pv}`, { tone: "error" }); } }); }
  };
  edit.drawer = (cfg) => setDrawer(cfg);
  edit.toast = (msg) => onToast && onToast(msg);
  // wraps a section's header action: while that section has a request pending (self mode),
  // show the amber Pending Approval pill (click = preview the changes) with its Cancel —
  // cancelling confirms first, like sending does
  edit.action = (noun, el) => (isSelf && pendingReq[noun])
    ? <PendingPill onView={() => setViewReq({ noun, req: pendingReq[noun] })}
        onCancel={() => setConfirm({ verb: "CancelReq", noun, run: () => {
          setPendingReq(p => { const n = { ...p }; delete n[noun]; return n; });
          onToast && onToast("Request Cancelled", { tone: "error" });
        } })} />
    : el;

  const submitForm = (formData) => {
    const create = form.create;
    const noun = form.noun;
    const apply = form.apply;
    if (isSelf && !form.noApproval) {
      setConfirm({ verb: "Request", noun, run: () => {
        onRequest && onRequest({ section: noun, change: create ? "add" : "update", before: form.initial, after: formData, fields: form.fields });
        setPendingReq(p => ({ ...p, [noun]: { change: create ? "add" : "update", before: form.initial, after: formData, fields: form.fields } }));
        onToast && onToast("Request Submitted", { tone: "success" });
      } });
    } else {
      const verb = form.verb || (create ? "Add" : "Update");
      const past = verb === "Assign" ? "Assigned" : create ? "Added" : "Updated";
      setConfirm({ verb, noun, run: () => { apply(formData); onToast && onToast(`${noun} ${past}`, { tone: "success" }); } });
    }
  };

  const CONFIRM_ICON = { Add: "add-line", Assign: "user-add-line", Update: "check-line", Delete: "delete-bin-6-line", Archive: "archive-line", Request: "send-plane-line", CancelReq: "close-circle-line" };

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
          title={confirm.verb === "Request" ? "Request Update" : confirm.verb === "CancelReq" ? "Cancel Request" : `${confirm.verb} ${confirm.noun}`}
          message={confirm.verb === "Request" ? `Are you sure you want to request an update to your ${confirm.noun.toLowerCase()}?`
            : confirm.verb === "CancelReq" ? `Are you sure you want to cancel your ${confirm.noun.toLowerCase()} update request?`
            : `Are you sure you want to ${confirm.verb.toLowerCase()} this ${confirm.noun.toLowerCase()}?`}
          confirmLabel={confirm.verb === "CancelReq" ? "Yes, Cancel" : `Yes, ${confirm.verb}`} confirmIcon={CONFIRM_ICON[confirm.verb]}
          cancelLabel={confirm.verb === "CancelReq" ? "No" : (confirm.verb === "Add" || confirm.verb === "Assign" || confirm.verb === "Request") ? "Cancel" : "No"}
          onConfirm={() => { confirm.run(); setConfirm(null); setForm(null); }}
          onClose={() => setConfirm(null)} />
      )}

      {/* See More → right side drawer */}
      <Drawer open={!!drawer} title={drawer && drawer.title} icon={drawer && drawer.icon} onClose={() => setDrawer(null)}>
        {drawer && drawer.content}
      </Drawer>

      {/* pending change-request preview */}
      {viewReq && <ChangeRequestModal noun={viewReq.noun} req={viewReq.req} onClose={() => setViewReq(null)} />}

      {/* profile-picture upload (self) */}
      {picOpen && (
        <ProfilePictureModal name={d.name} photo={photo} onClose={() => setPicOpen(false)}
          onSave={(url) => { setPhoto(url); setPicOpen(false); onToast && onToast("Profile Picture Updated", { tone: "success" }); }} />
      )}
    </div>
  );
}

Object.assign(window, { EmployeeDetail });
