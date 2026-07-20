// BISTA HR · shared/EmployeeAddSelect — staff picker that ADDS one employee at a time.
// The client requires selection keyed on STAFF ID (employees may share a name), so this is
// NOT a multi-select chip box: the dropdown acts as "Add Employee", and each added person
// becomes a card showing their Avatar + name + staff ID with a remove (×). An added employee
// is removed from the dropdown list so they can't be added twice.
//   Props: value (string[] of staff ids), onChange(string[]), employees ([{ id, name, staffId,
//          title, grade, dept }]), placeholder, emptyText.
// Reusable across every multi-employee People & Culture form (Promotions / Transfers / Job Title).
// The card's ProfileAvatar is the app-wide affordance: click the avatar → employment-details sheet.
function EmployeeAddSelect({ value = [], onChange, employees = [], placeholder = "Add employee — search by name or staff ID", emptyText = "No employees added yet." }) {
  const byId = {};
  employees.forEach(e => { byId[e.id] = e; });
  const available = employees
    .filter(e => !value.includes(e.id))
    .map(e => ({ value: e.id, label: e.name, name: e.name, sublabel: `${e.staffId || e.id}${e.dept ? " · " + e.dept : ""}` }));
  const add = (id) => { if (id && !value.includes(id)) onChange([...value, id]); };
  const remove = (id) => onChange(value.filter(x => x !== id));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", minWidth: 0 }}>
      <Combobox value="" onChange={add} options={available} placeholder={placeholder} icon="user-add-line" avatar
        noDataText="No more employees to add." />
      {value.length === 0
        ? <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--gray-400)" }}>{emptyText}</span>
        : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {value.map(id => {
              const e = byId[id] || { id, name: id, staffId: id };
              return (
                <div key={id} style={{ display: "inline-flex", alignItems: "center", gap: 10, minWidth: 0,
                  border: "1px solid var(--gray-200)", borderRadius: 10, padding: "7px 8px 7px 8px", background: "#fff", boxShadow: "var(--shadow-input)" }}>
                  <ProfileAvatar employeeId={id} name={e.name} size={32} />
                  <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                    <span style={{ display: "flex", alignItems: "baseline", gap: 8, minWidth: 0 }}>
                      <span style={{ fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 14, color: "var(--gray-900)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.name}</span>
                      <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-400)", whiteSpace: "nowrap", flexShrink: 0 }}>{e.staffId || e.id}</span>
                    </span>
                    <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-400)", lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{[e.dept, [e.unit, e.branch].filter(Boolean).join(" · ")].filter(Boolean).join(" · ") || "—"}</span>
                  </span>
                  <button type="button" onClick={() => remove(id)} title="Remove employee"
                    style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, marginLeft: 2,
                      border: 0, background: "none", cursor: "pointer", borderRadius: 999, color: "var(--gray-500)" }}
                    onMouseEnter={ev => { ev.currentTarget.style.background = "var(--gray-100)"; }}
                    onMouseLeave={ev => { ev.currentTarget.style.background = "none"; }}>
                    <Icon name="close-line" size={16} color="var(--gray-500)" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
}

Object.assign(window, { EmployeeAddSelect });

// DesignationCombobox — mirrors components/shared/DesignationCombobox.tsx: the "New Job Title"
// picker with a department FILTER built into the dropdown's SEARCH ROW (compact borderless
// select, right of the search input). Job titles are NOT tied to departments — the full title
// catalog shows by default; the filter only narrows the list, reads as part of the search, is
// NOT an employee-department change and is never submitted. The filter state is INTERNAL unless
// `department`/`onDepartmentChange` are passed. Shared by every P&C role form.
function DesignationCombobox({ value, onChange, options, department, onDepartmentChange, departments, placeholder = "Select job title", noDataText = "No job title found for this department." }) {
  const [localDept, setLocalDept] = React.useState("");
  const controlled = typeof onDepartmentChange === "function";
  const dept = controlled ? department : localDept;
  const setDept = controlled ? onDepartmentChange : setLocalDept;
  const opts = options !== undefined ? options : window.jobTitlesForDepartment(dept);
  const deptList = departments || (window.LOOKUPS || {}).departments || [];
  return (
    <Combobox value={value} onChange={onChange} options={opts} placeholder={placeholder} noDataText={noDataText}
      header={<JobTitleFilterHeader department={dept} onChange={setDept} departments={deptList} />} />
  );
}

// The compact department filter that sits in the dropdown's search row (right of the input).
function JobTitleFilterHeader({ department, onChange, departments = [] }) {
  const opts = [{ value: "", label: "All departments" }, ...departments.map(d => ({ value: d, label: d }))];
  return (
    <Combobox compact value={department} onChange={v => onChange(v || "")} options={opts} placeholder="All departments" noDataText="No department found." />
  );
}

Object.assign(window, { DesignationCombobox, JobTitleFilterHeader });

// UnitBranchCombobox — the "Organizational Unit/Branch" picker, SAME pattern as
// DesignationCombobox: a compact ZONE filter sits in the dropdown's search row and narrows the
// unit/branch list (window.unitBranchesForZone). Pass zone/onZoneChange to keep it in sync with
// the form's Zones field (picking a zone in either place filters here).
function UnitBranchCombobox({ value, onChange, zone, onZoneChange, zones, placeholder = "Select unit/branch", noDataText = "No unit/branch found for this zone." }) {
  const [localZone, setLocalZone] = React.useState("");
  const controlled = typeof onZoneChange === "function";
  const z = controlled ? zone : localZone;
  const setZ = controlled ? onZoneChange : setLocalZone;
  const zoneList = zones || (window.LOOKUPS || {}).zones || [];
  const opts = window.unitBranchesForZone(z);
  return (
    <Combobox value={value} onChange={onChange} options={opts} placeholder={placeholder} noDataText={noDataText}
      header={<Combobox compact value={z} onChange={v => setZ(v || "")} options={[{ value: "", label: "All zones" }, ...zoneList.map(x => ({ value: x, label: x }))]} placeholder="All zones" noDataText="No zone found." />} />
  );
}

// LineManagerField — ONE reusable combobox for "New Line Manager" (Transfers only): options are
// directory employees (avatar + staff ID · location sublabel); once picked, the SAME trigger row
// shows the details right-aligned — single-height field, no extra lines or separate fields.
function LineManagerField({ value, onChange, employees = [] }) {
  const opts = employees.map(x => ({ value: x.id, label: x.name, name: x.name, sublabel: `${x.staffId || x.id} · ${[x.zone, x.branch].filter(Boolean).join(" · ") || "—"}` }));
  return <Combobox avatar value={value} onChange={onChange} options={opts} icon="user-star-line" placeholder="Select line manager" noDataText="No employee found" />;
}

// NotifyPeopleField — Teams-style notification picker rendered as SMALL chips (the EmailInputList
// chip style), not big employee cards: add PEOPLE from the directory via the combobox, or type a
// CUSTOM email and press Enter/Add. value mixes employee ids and raw email strings; emails are
// resolved and sent in the background. Replaces raw email entry on Promotions / Transfers / Job Title.
function NotifyPeopleField({ value = [], onChange, employees = [], label = "Notify People", hint = "Pick people from the directory or add a custom email — they are emailed in the background." }) {
  const byId = {};
  employees.forEach(e => { byId[e.id] = e; });
  const [draft, setDraft] = React.useState("");
  const [err, setErr] = React.useState("");
  const npEmail = (e) => e.email || (e.name || "").toLowerCase().split(/\s+/).filter(Boolean).join(".") + "@bistasol.com";
  const opts = employees.filter(e => !value.includes(e.id)).map(e => ({ value: e.id, label: e.name, name: e.name, sublabel: `${e.staffId || e.id} · ${npEmail(e)}` }));
  const addCustom = () => {
    const v = draft.trim();
    if (!v) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { setErr("Enter a valid email address"); return; }
    if (value.includes(v)) { setErr("Already added"); return; }
    setErr(""); onChange([...value, v]); setDraft("");
  };
  const remove = (x) => onChange(value.filter(i => i !== x));
  return (
    <Field label={label} hint={hint}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 240px", minWidth: 0 }}><Combobox avatar value="" onChange={(id) => { if (id && !value.includes(id)) onChange([...value, id]); }} options={opts} icon="user-add-line" placeholder="Add person from directory…" noDataText="No employee found" /></div>
        <div className="input-wrap" style={{ flex: "1 1 200px" }}>
          <input placeholder="or type an email and press Enter" value={draft} onChange={e => { setDraft(e.target.value); setErr(""); }}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }} />
        </div>
        <Button variant="stroke" disabled={!draft.trim()} onClick={addCustom}>Add</Button>
      </div>
      {err && <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "#DC2626", marginTop: 6, display: "block" }}>{err}</span>}
      {value.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
          {value.map(x => {
            const e = byId[x];
            const c = !e ? getEmailBadgeColor(x) : null;
            return (
              <span key={x} style={{ display: "inline-flex", alignItems: "center", gap: 5, borderRadius: 7, padding: "3px 6px 3px 5px", fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: 500, whiteSpace: "nowrap",
                background: c ? c.bg : "var(--gray-100)", color: c ? c.color : "var(--gray-800)", border: `1px solid ${c ? c.border : "var(--gray-200)"}` }}>
                {e && <Avatar name={e.name} size={16} />}
                {e ? e.name : x}
                <button onClick={() => remove(x)} title="Remove" style={{ border: 0, background: "none", cursor: "pointer", display: "inline-flex", padding: 1, color: "inherit" }}><Icon name="close-line" size={12} color="currentColor" /></button>
              </span>
            );
          })}
        </div>
      )}
    </Field>
  );
}

Object.assign(window, { UnitBranchCombobox, LineManagerField, NotifyPeopleField });
