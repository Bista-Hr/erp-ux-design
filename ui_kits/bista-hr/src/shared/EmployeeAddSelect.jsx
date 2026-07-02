// BISTA HR · shared/EmployeeAddSelect — staff picker that ADDS one employee at a time.
// The client requires selection keyed on STAFF ID (employees may share a name), so this is
// NOT a multi-select chip box: the dropdown acts as "Add Employee", and each added person
// becomes a card showing their Avatar + name + staff ID with a remove (×). An added employee
// is removed from the dropdown list so they can't be added twice.
//   Props: value (string[] of staff ids), onChange(string[]), employees ([{ id, name, staffId,
//          title, grade, dept }]), placeholder, emptyText.
// Reusable across every multi-employee People & Culture form (Promotions / Transfers / Job Title).
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
                  <Avatar name={e.name} size={32} />
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

// JobTitleFilterHeader — the "Filter by department" control that lives INSIDE the New Job Title
// dropdown (via Combobox's `header` slot). It is a searchable department select (scales to any
// number of departments) that only narrows the title list — it is NOT an employee-department
// change and is never submitted. Shared by Promotions and Job Title.
function JobTitleFilterHeader({ department, onChange, departments = [] }) {
  const opts = [{ value: "", label: "All departments" }, ...departments.map(d => ({ value: d, label: d }))];
  return (
    <Combobox value={department} onChange={v => onChange(v || "")} options={opts} icon="filter-3-line" placeholder="All departments" noDataText="No department found." />
  );
}

Object.assign(window, { JobTitleFilterHeader });
