// BISTA HR · shared/EmployeeSelectionRoster — the single, reusable employee roster.
// Mirrors components/shared/EmployeeSelectionRoster. A checkbox table (select-all + search)
// that is the SINGLE SOURCE OF TRUTH for any multi-employee action (Promotions, Transfers,
// Job Title, …). Selecting rows reveals the shared SelectionActionBar; its primary action
// hands the selected ids back to the parent, which routes to the relevant create form.
// There is intentionally NO per-row action button — selection is the only path.
//
//   employees      : [{ id, name, employeeNumber, jobTitle, jobGrade, department, profilePictureUrl }]
//   itemLabel      : singular noun for the bar, e.g. "staff"
//   actionLabel    : primary action label, e.g. "Create Promotion"
//   onProceed(ids) : called with the selected ids when the action is clicked
//   searchQuery    : controlled search value. When provided the roster filters by it and does
//                    NOT render its own search field (the parent owns the search UI — e.g. in
//                    the tab/filter row). Omit to let the roster manage search internally.
//   searchPlaceholder, isActionPending, perPage.
const { useState: useESR, useMemo: useESRMemo } = React;

function EmployeeSelectionRoster({ employees = [], itemLabel = "staff", actionLabel = "Continue", onProceed,
  searchPlaceholder = "Search staff…", searchQuery, isActionPending = false, perPage = 10 }) {
  const [selection, setSelection] = useESR({});          // { [id]: true }
  const [internalQuery, setInternalQuery] = useESR("");
  const controlled = searchQuery !== undefined;
  const query = controlled ? searchQuery : internalQuery;

  const rows = useESRMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return employees;
    return employees.filter(e =>
      `${e.name} ${e.employeeNumber || ""} ${e.jobTitle || ""} ${e.jobGrade || ""} ${e.department || ""}`
        .toLowerCase().includes(q));
  }, [employees, query]);

  const pg = usePaged(rows, perPage);
  const selectedIds = Object.keys(selection).filter(id => selection[id]);
  const allShown = rows.length > 0 && rows.every(r => selection[r.id]);

  const toggle = (id) => setSelection(s => ({ ...s, [id]: !s[id] }));
  const toggleAll = () => setSelection(s => {
    const next = { ...s };
    if (allShown) rows.forEach(r => { delete next[r.id]; });
    else rows.forEach(r => { next[r.id] = true; });
    return next;
  });

  return (
    <React.Fragment>
      {!controlled && (
        <div style={{ borderBottom: "1px solid var(--divider)", padding: "14px 20px", display: "flex", justifyContent: "flex-end" }}>
          <div style={{ width: 288, maxWidth: "100%" }}>
            <Input icon="search-line" placeholder={searchPlaceholder} value={internalQuery} onChange={e => setInternalQuery(e.target.value)} />
          </div>
        </div>
      )}

      {rows.length === 0
        ? <EmptyState compact title="No staff found" subtitle="No staff match your search." />
        : <table className="bh">
            <thead><tr>
              <th style={{ width: 44 }}><Checkbox checked={allShown} onChange={toggleAll} /></th>
              <th>Full Name</th><th>Employee ID</th><th>Current Job Title</th><th>Current Grade</th><th>Department</th>
            </tr></thead>
            <tbody>
              {pg.pageItems.map(r => {
                const on = !!selection[r.id];
                return (
                  <tr key={r.id} className="jt-roster-row" style={{ cursor: "pointer", background: on ? "#FFFBEB" : undefined }} onClick={() => toggle(r.id)}>
                    <td onClick={ev => ev.stopPropagation()}><Checkbox checked={on} onChange={() => toggle(r.id)} /></td>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                        <Avatar name={r.name} src={r.profilePictureUrl || undefined} size={32} />
                        <span style={{ fontWeight: 500, color: "var(--gray-900)" }}>{r.name}</span>
                      </span>
                    </td>
                    <td>{r.employeeNumber || "—"}</td>
                    <td>{r.jobTitle || "—"}</td>
                    <td>{r.jobGrade || "—"}</td>
                    <td>{r.department || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>}

      {rows.length > 0 && <div style={{ borderTop: "1px solid var(--divider)" }}><Pagination page={pg.page} pages={pg.pages} onPrev={pg.prev} onNext={pg.next} /></div>}

      <SelectionActionBar
        count={selectedIds.length}
        itemLabel={itemLabel}
        primaryAction={{ label: actionLabel, onClick: () => onProceed && onProceed(selectedIds), disabled: isActionPending || selectedIds.length === 0 }}
        onClear={() => setSelection({})}
      />
    </React.Fragment>
  );
}

Object.assign(window, { EmployeeSelectionRoster });
