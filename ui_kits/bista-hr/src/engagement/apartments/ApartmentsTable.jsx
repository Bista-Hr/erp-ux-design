// BISTA HR · engagement/apartments/ApartmentsTable — the Accommodation table view.
// Implements ApartmentsTabs + apartmentColumns + ApartmentActionsCell:
//   Tabs: Available Apartments | All Apartments | Staff Requests
//   - Available : apartments with no assignedEmployee → Date of Vacancy, Name, Number, Type, [View Details]
//   - All       : every apartment → Occupant, Name, Number, Type, ⋯ (View Details / Archive)
//   - Staff Requests : pending requests → Request Sent On, Employee, Apartment Type, Duration, Reason
// Row click opens the apartment details / the request-details modal. Includes the Show-Filter panel.
const { useState: useApt, useMemo: useAptMemo } = React;

function ApartmentsTable({ apartments, requests, onOpenApartment, onOpenRequest, onArchive, jobGrades }) {
  const [tab, setTab] = useApt("available");
  const [q, setQ] = useApt("");
  const [menu, setMenu] = useApt(null);
  const [filterOpen, setFilterOpen] = useApt(false);
  const [f, setF] = useApt({ apartmentType: "", jobGrade: "", name: "", number: "", dateFrom: "", dateTo: "" });
  const [applied, setApplied] = useApt({ apartmentType: "", jobGrade: "", name: "", number: "", dateFrom: "", dateTo: "" });
  const setFilter = (k, v) => setF(s => ({ ...s, [k]: v }));

  const available = apartments.filter(a => !a.assignedEmployee);
  const matchSearch = (a) => q === "" || `${a.name} ${a.number} ${a.apartmentType}`.toLowerCase().includes(q.toLowerCase());
  const matchFilter = (a) => (!applied.apartmentType || a.apartmentType === applied.apartmentType)
    && (!applied.jobGrade || a.jobGrade === applied.jobGrade)
    && (!applied.name || a.name.toLowerCase().includes(applied.name.toLowerCase()))
    && (!applied.number || a.number.toLowerCase().includes(applied.number.toLowerCase()));
  const aptRows = (tab === "all" ? apartments : available).filter(a => matchSearch(a) && matchFilter(a));
  const reqRows = requests.filter(r => q === "" || `${r.employeeFullName} ${r.employeeEmail}`.toLowerCase().includes(q.toLowerCase()));
  const aptPg = usePaged(aptRows, 10);
  const reqPg = usePaged(reqRows, 10);

  const TabBtn = ({ value, label, count }) => (
    <button onClick={() => { setTab(value); setMenu(null); }} className={tab === value ? "active" : ""}>
      {count > 0 && tab === value && (
        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 18, height: 18, padding: "0 5px",
          marginRight: 6, borderRadius: 999, background: "#DC2626", color: "#fff", fontSize: 10, fontWeight: 700 }}>{count}</span>
      )}{label}
    </button>
  );

  const applyFilters = () => { setApplied(f); setFilterOpen(false); };
  const resetFilters = () => { const empty = { apartmentType: "", jobGrade: "", name: "", number: "", dateFrom: "", dateTo: "" }; setF(empty); setApplied(empty); };

  return (
    <div className="card" style={{ overflow: "visible", padding: 0 }}>
      {/* tab + search/filter header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "14px 20px", borderBottom: "1px solid var(--border)", flexWrap: "wrap" }}>
        <div className="seg" style={{ background: "#F6F8FA" }}>
          <TabBtn value="available" label="Available Apartments" count={available.length} />
          <TabBtn value="all" label="All Apartments" count={0} />
          <TabBtn value="pending" label="Staff Requests" count={requests.length} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="input-wrap" style={{ width: 240, padding: "7px 12px" }}>
            <Icon name="search-2-line" size={18} style={{ color: "var(--icon-default)" }} />
            <input placeholder="Search…" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          {tab !== "pending" && <Button variant="stroke" size="sm" icon="equalizer-line" onClick={() => setFilterOpen(o => !o)}>{filterOpen ? "Hide Filter" : "Show Filter"}</Button>}
        </div>
      </div>

      {/* filter panel */}
      {filterOpen && tab !== "pending" && (
        <div style={{ margin: "14px 20px", border: "1px solid #F0F1F3", background: "#FAFAFA", borderRadius: 10, padding: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Apartment Type"><Select value={f.apartmentType} onChange={e => setFilter("apartmentType", e.target.value)} options={APARTMENT_TYPES} placeholder="Select apartment type" /></Field>
            <Field label="Job Grade"><Combobox value={f.jobGrade} onChange={v => setFilter("jobGrade", v)} options={jobGrades} placeholder="Select a job grade" /></Field>
            <Field label="Apartment Name"><Input placeholder="Enter apartment name" value={f.name} onChange={e => setFilter("name", e.target.value)} /></Field>
            <Field label="Apartment Number"><Input placeholder="Enter apartment number" value={f.number} onChange={e => setFilter("number", e.target.value)} /></Field>
            <Field label="Date From"><Input placeholder="Select a start date" value={f.dateFrom} onChange={e => setFilter("dateFrom", e.target.value)} /></Field>
            <Field label="Date To"><Input placeholder="Select an end date" value={f.dateTo} onChange={e => setFilter("dateTo", e.target.value)} /></Field>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
            <Button variant="stroke" size="sm" onClick={resetFilters}>Reset filter</Button>
            <Button variant="primary" size="sm" onClick={applyFilters}>Apply Filters</Button>
          </div>
        </div>
      )}

      {/* table */}
      {tab === "pending" ? (
        reqRows.length === 0
          ? <EmptyState title="No Pending Requests" subtitle="There are no pending accommodation requests." />
          : <React.Fragment><table className="bh">
              <thead><tr><th>Request Sent On</th><th>Employee</th><th>Apartment Type</th><th>Duration</th><th>Reason</th></tr></thead>
              <tbody>
                {reqPg.pageItems.map(r => (
                  <tr key={r.accommodationRequestId} style={{ cursor: "pointer" }} onClick={() => onOpenRequest(r.accommodationRequestId)}>
                    <td>{fmtDate(r.requestCreatedAt)}</td>
                    <td><span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}><Avatar name={r.employeeFullName} size={30} />
                      <span style={{ display: "flex", flexDirection: "column" }}><span style={{ fontWeight: 600 }}>{r.employeeFullName}</span><span style={{ fontSize: 12.5, color: "var(--gray-400)" }}>{r.employeeEmail}</span></span></span></td>
                    <td>{r.accommodationType}</td>
                    <td style={{ textTransform: "capitalize" }}>{r.duration}</td>
                    <td><span style={{ display: "block", maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.reason}>{r.reason}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {reqRows.length > 0 && <div style={{ borderTop: "1px solid var(--divider)" }}><Pagination page={reqPg.page} pages={reqPg.pages} onPrev={reqPg.prev} onNext={reqPg.next} /></div>}</React.Fragment>
      ) : aptRows.length === 0 ? (
        <EmptyState title={tab === "all" ? "No Apartments Yet" : "No Available Apartments"}
          subtitle={tab === "all" ? "Get started by creating your first apartment record." : "All apartments are currently occupied."} />
      ) : tab === "all" ? (
        <React.Fragment>
        <table className="bh">
          <thead><tr><th>Occupant</th><th>Apartment Name</th><th>Apartment Number</th><th>Apartment Type</th><th style={{ width: 48 }}></th></tr></thead>
          <tbody>
            {aptPg.pageItems.map(a => (
              <tr key={a.id} style={{ cursor: "pointer" }} onClick={() => onOpenApartment(a)}>
                <td>{a.assignedEmployee
                  ? <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}><Avatar name={a.assignedEmployee.employeeFullName} size={30} />
                      <span style={{ display: "flex", flexDirection: "column" }}><span style={{ fontWeight: 600 }}>{a.assignedEmployee.employeeFullName}</span><span style={{ fontSize: 12.5, color: "var(--gray-400)" }}>{a.assignedEmployee.employeeEmail}</span></span></span>
                  : "—"}</td>
                <td>{a.name}</td><td>{a.number}</td><td>{a.apartmentType}</td>
                <td style={{ position: "relative", textAlign: "right" }} onClick={e => e.stopPropagation()}>
                  <button className="btn btn-icon btn-ghost" style={{ width: 28, height: 28, padding: 0 }} onClick={() => setMenu(menu === a.id ? null : a.id)}>
                    <Icon name="more-fill" size={18} color="var(--gray-400)" />
                  </button>
                  {menu === a.id && (
                    <div onMouseLeave={() => setMenu(null)} style={{ position: "absolute", right: 16, top: 40, zIndex: 20, background: "#fff",
                      borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-pop)", padding: 6, minWidth: 160, display: "flex", flexDirection: "column" }}>
                      <button className="menu-item" onClick={() => { setMenu(null); onOpenApartment(a); }}><Icon name="eye-line" size={16} />View Details</button>
                      <button className="menu-item danger" onClick={() => { setMenu(null); onArchive(a); }}><Icon name="archive-line" size={16} />Archive</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {aptRows.length > 0 && <div style={{ borderTop: "1px solid var(--divider)" }}><Pagination page={aptPg.page} pages={aptPg.pages} onPrev={aptPg.prev} onNext={aptPg.next} /></div>}
        </React.Fragment>
      ) : (
        <React.Fragment>
        <table className="bh">
          <thead><tr><th>Date of Vacancy</th><th>Apartment Name</th><th>Apartment Number</th><th>Apartment Type</th><th style={{ width: 130 }}></th></tr></thead>
          <tbody>
            {aptPg.pageItems.map(a => (
              <tr key={a.id} style={{ cursor: "pointer" }} onClick={() => onOpenApartment(a)}>
                <td>{fmtDate(a.createdAt)}</td><td>{a.name}</td><td>{a.number}</td><td>{a.apartmentType}</td>
                <td style={{ textAlign: "right" }} onClick={e => e.stopPropagation()}><ViewDetailsButton onClick={() => onOpenApartment(a)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {aptRows.length > 0 && <div style={{ borderTop: "1px solid var(--divider)" }}><Pagination page={aptPg.page} pages={aptPg.pages} onPrev={aptPg.prev} onNext={aptPg.next} /></div>}
        </React.Fragment>
      )}
    </div>
  );
}

Object.assign(window, { ApartmentsTable });
