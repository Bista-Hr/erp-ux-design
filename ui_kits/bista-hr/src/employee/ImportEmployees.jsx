// BISTA HR · employee/ImportEmployees — bulk-import flow.
//   ImportEmployeesModal : dashed drop zone + "Browse File" (simulated pick) → animated
//     upload progress → Complete, with Download Template + See Preview actions.
//   PreviewEmployeesScreen : full "Employees List Preview" page (breadcrumb + table of
//     parsed rows) → Cancel / Add Employee / Import N Employees → confirm → success.
const IMPORT_SAMPLE = [
  { id: "i1", name: "Leslie Alexandre", code: "emp1", email: "leslie@starret.com",  role: "HR Manager",    dept: "HR",      branch: "Kumasi", dateEmployed: "25/09/2025", active: true },
  { id: "i2", name: "Leslie Alexandre", code: "emp1", email: "olivia@starret.com",  role: "Accountant",    dept: "Finance", branch: "Accra",  dateEmployed: "25/09/2025", active: true },
  { id: "i3", name: "Leslie Alexandre", code: "emp1", email: "phoenix@starret.com", role: "Accountant",    dept: "Finance", branch: "Tamale", dateEmployed: "25/09/2025", active: true },
  { id: "i4", name: "Leslie Alexandre", code: "emp1", email: "lana@starret.com",    role: "Sales Officer", dept: "Sales",   branch: "Accra",  dateEmployed: "25/09/2025", active: true },
  { id: "i5", name: "Leslie Alexandre", code: "emp1", email: "demi@starret.com",    role: "Sales Officer", dept: "Sales",   branch: "Kumasi", dateEmployed: "25/09/2025", active: true },
  { id: "i6", name: "Leslie Alexandre", code: "emp1", email: "natali@starret.com",  role: "Teller",        dept: "Finance", branch: "Kumasi", dateEmployed: "25/09/2025", active: true },
  { id: "i7", name: "Leslie Alexandre", code: "emp1", email: "drew@starret.com",    role: "Teller",        dept: "Finance", branch: "Accra",  dateEmployed: "25/09/2025", active: true },
  { id: "i8", name: "Leslie Alexandre", code: "emp1", email: "orlando@starret.com", role: "Sales Officer", dept: "Sales",   branch: "Accra",  dateEmployed: "25/09/2025", active: true },
];

function XlsBadge({ size = 34 }) {
  return (
    <span style={{ width: size, height: size, borderRadius: 7, background: "#1FA363", flexShrink: 0,
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      fontFamily: "var(--font-head)", fontWeight: 800, fontSize: size * 0.26, color: "#fff", letterSpacing: ".02em" }}>XLSX</span>
  );
}

function ImportEmployeesModal({ onClose, onSeePreview }) {
  const [file, setFile] = useState(null); // { name, progress, done }
  useEffect(() => {
    if (!file || file.done) return;
    if (file.progress >= 100) { const t = setTimeout(() => setFile(f => ({ ...f, done: true })), 150); return () => clearTimeout(t); }
    const t = setTimeout(() => setFile(f => ({ ...f, progress: Math.min(100, f.progress + 20) })), 170);
    return () => clearTimeout(t);
  }, [file]);
  const browse = () => setFile({ name: "employee-list.xlsx", progress: 0, done: false });

  return (
    <Modal onClose={onClose} width={520}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "24px 24px 0" }}>
        <div>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 20, lineHeight: "28px", color: "var(--gray-900)" }}>Import Employees</div>
          <div className="bh-body" style={{ marginTop: 4 }}>Upload multiple employee records using the the Excel template</div>
        </div>
        <button className="btn btn-icon btn-ghost" onClick={onClose} style={{ width: 32, height: 32, padding: 0 }}><Icon name="close-line" size={20} color="var(--gray-500)" /></button>
      </div>

      <div style={{ padding: 24 }}>
        {/* drop zone */}
        <div style={{ border: "1.5px dashed var(--gray-300)", background: "#FCFCFD", borderRadius: 14,
          padding: "32px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <Icon name="upload-cloud-2-line" size={34} color="var(--gray-400)" />
          <div style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 14, color: "var(--gray-700)" }}>Choose a file or drag & drop here.</div>
          <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-400)" }}>xls, xlsx or csv file formats, up to 50 MB</div>
          <button onClick={browse} className="btn btn-stroke btn-sm" style={{ marginTop: 10 }}>Browse File</button>
        </div>

        {/* file chip */}
        {file && (
          <div style={{ marginTop: 16, borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
            <XlsBadge />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 14, color: "var(--gray-900)" }}>{file.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: file.done ? "#1FA363" : "var(--gray-400)" }}>
                  {file.done ? "64 kb of 64 kb · Complete" : `64 kb of 100 kb · uploading`}
                </span>
                {file.done && <Icon name="checkbox-circle-fill" size={15} color="#1FA363" />}
              </div>
              {!file.done && (
                <div style={{ height: 5, borderRadius: 3, background: "var(--gray-100)", marginTop: 8, overflow: "hidden" }}>
                  <div style={{ width: `${file.progress}%`, height: "100%", background: "var(--brand-yellow-dark)", borderRadius: 3, transition: "width .15s" }} />
                </div>
              )}
            </div>
            <button onClick={() => setFile(null)} style={{ border: 0, background: "none", cursor: "pointer", display: "flex" }}>
              <Icon name={file.done ? "delete-bin-6-line" : "close-line"} size={18} color={file.done ? "#E5484D" : "var(--gray-400)"} />
            </button>
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: "0 24px 24px" }}>
        <Button variant="stroke" icon="download-2-line" onClick={() => {}}>Download Template</Button>
        <Button variant="primary" disabled={!file || !file.done} onClick={onSeePreview}>See Preview</Button>
      </div>
    </Modal>
  );
}

function PreviewEmployeesScreen({ rows: initial, onCancel, onConfirm, onAddEmployee }) {
  const [rows, setRows] = useState(initial);
  const [q, setQ] = useState("");
  const [menu, setMenu] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const shown = rows.filter(r => q === "" || r.name.toLowerCase().includes(q.toLowerCase()) || r.email.toLowerCase().includes(q.toLowerCase()));
  const pg = usePaged(shown);

  return (
    <div>
      {/* breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, fontFamily: "var(--font-ui)", fontSize: 15, whiteSpace: "nowrap" }}>
        <button onClick={onCancel} style={{ border: 0, background: "none", cursor: "pointer", color: "var(--gray-500)", fontWeight: 600, fontFamily: "var(--font-ui)", fontSize: 15 }}>Employees</button>
        <Icon name="arrow-right-s-line" size={18} color="var(--gray-400)" />
        <span style={{ fontWeight: 700, color: "var(--gray-900)" }}>Preview Employees</span>
      </div>

      <div className="card" style={{ overflow: "visible", padding: "var(--card-pad, 24px)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
          <div>
            <div className="bh-h2" style={{ fontSize: 24 }}>Employees List Preview</div>
            <div className="bh-body" style={{ marginTop: 4 }}>Review and confirm all uploaded employee details before editing.</div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <Button variant="stroke" icon="close-line" onClick={onCancel}>Cancel</Button>
            <Button variant="primary" icon="add-line" onClick={() => setConfirming(true)}>Import {rows.length} Employees</Button>
          </div>
        </div>

        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "16px 20px" }}>
            <div className="input-wrap" style={{ width: 280, padding: "8px 12px" }}>
              <Icon name="search-2-line" size={18} style={{ color: "var(--icon-default)" }} />
              <input placeholder="Search…" value={q} onChange={e => setQ(e.target.value)} />
            </div>
            <Button variant="stroke" size="sm" icon="equalizer-line">Show Filter</Button>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="bh">
              <thead><tr>
                <th>Full Name</th><th>Employee ID</th><th>Email</th><th>Role</th>
                <th>Dept/Unit</th><th>Branch</th><th>Date Employed</th><th style={{ width: 48 }}></th>
              </tr></thead>
              <tbody>
                {pg.pageItems.map(e => (
                  <tr key={e.id}>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                        <Avatar name={e.name} />{e.name}
                      </span>
                    </td>
                    <td>{e.code}</td><td>{e.email}</td><td>{e.role}</td><td>{e.dept}</td><td>{e.branch}</td><td>{e.dateEmployed}</td>
                    <td style={{ textAlign: "right" }}>
                      <button className="btn btn-icon btn-ghost" style={{ width: 28, height: 28, padding: 0 }}
                        onClick={ev => { if (menu && menu.id === e.id) { setMenu(null); return; } const r = ev.currentTarget.getBoundingClientRect(); setMenu({ id: e.id, top: r.bottom + 4, right: window.innerWidth - r.right }); }}>
                        <Icon name="more-fill" size={18} color="var(--gray-400)" />
                      </button>
                    </td>
                  </tr>
                ))}
                {shown.length === 0 && (
                  <tr><td colSpan={8} style={{ padding: 0 }}><EmptyState compact title="No results found" subtitle="No employees match your search." /></td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div style={{ borderTop: "1px solid var(--divider)" }}><Pagination page={pg.page} pages={pg.pages} onPrev={pg.prev} onNext={pg.next} /></div>
        </div>
      </div>

      {menu && (
        <React.Fragment>
          <div onClick={() => setMenu(null)} style={{ position: "fixed", inset: 0, zIndex: 60 }} />
          <div style={{ position: "fixed", top: menu.top, right: menu.right, zIndex: 61, background: "#fff",
            borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-pop)", padding: 6, minWidth: 180, display: "flex", flexDirection: "column" }}>
            <button className="menu-item danger" onClick={() => { setRows(rs => rs.filter(x => x.id !== menu.id)); setMenu(null); }}><Icon name="delete-bin-6-line" size={16} />Remove from import</button>
          </div>
        </React.Fragment>
      )}

      {confirming && (
        <ConfirmModal title="Import Employees" message={`Are you sure you want to import these ${rows.length} employees?`}
          confirmLabel="Yes, Import" confirmIcon="upload-2-line" cancelLabel="Cancel"
          onConfirm={() => { onConfirm(rows); }} onClose={() => setConfirming(false)} />
      )}
    </div>
  );
}

Object.assign(window, { ImportEmployeesModal, PreviewEmployeesScreen, IMPORT_SAMPLE });
