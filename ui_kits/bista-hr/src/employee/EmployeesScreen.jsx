// BISTA HR · employee/EmployeesScreen — "All Employees" list (Figma).
// Outer card holds header (title + Import/Add). Inner bordered container holds the
// toolbar (filter + search + Show Filter), the table, and pagination. Rows are clickable
// → onOpen(emp) navigates to the employee detail page. Avatar/getStringColor come from
// primitives/controls (shared so the TopNav profile avatar uses the same colors).
function EmployeesScreen({ employees, onOpen, onAdd, onEdit, onArchive, onImport }) {
  const [filter, setFilter] = useState("All");
  const [q, setQ] = useState("");
  const [menu, setMenu] = useState(null);
  const shown = employees.filter(e =>
    (filter === "All" || (filter === "Active" ? e.active : !e.active)) &&
    (q === "" || e.name.toLowerCase().includes(q.toLowerCase()) || e.email.toLowerCase().includes(q.toLowerCase()))
  );
  const pg = usePaged(shown);
  return (
    <div className="card" style={{ overflow: "visible", padding: "var(--card-pad, 24px)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
        <div>
          <div className="bh-h2" style={{ fontSize: 24 }}>All Employees</div>
          <div className="bh-body" style={{ marginTop: 4 }}>Manage all your employees</div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Button variant="stroke" icon="upload-2-line" onClick={onImport}>Import Employees</Button>
          <Button variant="primary" icon="add-line" onClick={onAdd}>Add Employee</Button>
        </div>
      </div>

      <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "16px 20px" }}>
          <Segmented items={["All", "Active", "Inactive"]} active={filter} onChange={setFilter} />
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="input-wrap" style={{ width: 280, padding: "8px 12px" }}>
              <Icon name="search-2-line" size={18} style={{ color: "var(--icon-default)" }} />
              <input placeholder="Search…" value={q} onChange={e => setQ(e.target.value)} />
            </div>
            <Button variant="stroke" size="sm" icon="equalizer-line">Show Filter</Button>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
        <table className="bh">
          <thead><tr>
            <th>Full Name</th><th>Employee ID</th><th>Role</th>
            <th>Dept/Unit</th><th>Branch</th><th>Date Employed</th><th>Status</th><th style={{ width: 48 }}></th>
          </tr></thead>
          <tbody>
            {pg.pageItems.map(e => (
              <tr key={e.id} onClick={() => onOpen(e)} style={{ cursor: "pointer" }}
                onMouseEnter={ev => ev.currentTarget.style.background = "var(--gray-50)"}
                onMouseLeave={ev => ev.currentTarget.style.background = ""}>
                <td>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                    <Avatar name={e.name} />
                    <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.3 }}>
                      <span>{e.name}</span>
                      <span style={{ fontSize: 12, color: "var(--gray-400)" }}>{e.email}</span>
                    </span>
                  </span>
                </td>
                <td>{e.code}</td>
                <td>{e.role}</td>
                <td>{e.dept}</td>
                <td>{e.branch}</td>
                <td>{e.dateEmployed}</td>
                <td><StatusDot active={e.active} /></td>
                <td style={{ textAlign: "right" }} onClick={ev => ev.stopPropagation()}>
                  <button className="btn btn-icon btn-ghost" style={{ width: 28, height: 28, padding: 0 }}
                    onClick={ev => {
                      if (menu && menu.emp.id === e.id) { setMenu(null); return; }
                      const r = ev.currentTarget.getBoundingClientRect();
                      setMenu({ emp: e, top: r.bottom + 4, right: window.innerWidth - r.right });
                    }}>
                    <Icon name="more-fill" size={18} color="var(--gray-400)" />
                  </button>
                </td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr><td colSpan={8} style={{ padding: 0 }}>
                <EmptyState compact title="No results found" subtitle="No employees match your search." />
              </td></tr>
            )}
          </tbody>
        </table>
        </div>
        <div style={{ borderTop: "1px solid var(--divider)" }}><Pagination page={pg.page} pages={pg.pages} onPrev={pg.prev} onNext={pg.next} /></div>
      </div>

      {/* row action menu — fixed-positioned so it escapes the table's overflow clip */}
      {menu && (
        <React.Fragment>
          <div onClick={() => setMenu(null)} style={{ position: "fixed", inset: 0, zIndex: 60 }} />
          <div style={{ position: "fixed", top: menu.top, right: menu.right, zIndex: 61,
            background: "#fff", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-pop)",
            padding: 6, minWidth: 180, display: "flex", flexDirection: "column" }}>
            <button className="menu-item" onClick={() => { const e = menu.emp; setMenu(null); onOpen(e); }}><Icon name="eye-line" size={16} />View Details</button>
            <button className="menu-item" onClick={() => { const e = menu.emp; setMenu(null); onEdit && onEdit(e); }}><Icon name="edit-2-line" size={16} />Edit Employee</button>
            <button className="menu-item danger" onClick={() => { const e = menu.emp; setMenu(null); onArchive && onArchive(e); }}><Icon name="archive-line" size={16} />Archive Employee</button>
          </div>
        </React.Fragment>
      )}
    </div>
  );
}

Object.assign(window, { EmployeesScreen });
