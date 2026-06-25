// BISTA HR · engagement/Accommodation — HR Management ▸ Employee Engagement ▸ Accommodation.
//   Tabs: Apartments (grid) | Pending Requests (list)
//   Apartments  → grid of property cards → AccommodationDetails (shared DetailCard/DetailPanel)
//   Add         → AccommodationForm (full page) → AccommodationPreview → confirm → toast
//   Details     → "Assign to staff" → AssignDialog (pick a pending request) → confirm → toast
//   Requests    → row → RequestDetailsModal (employee + accommodation details + requester)
// Mirrors the real Apartment / PendingAccommodationRequest / AccommodationRequestDetails shapes.
const { useState: useAcc, useEffect: useAccEffect } = React;

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—");

/* ---------- property image placeholder (no real uploads in the mock) ---------- */
function PropertyImage({ seed = "", radius = 10, height = 150, icon = "building-2-line" }) {
  const tint = getStringColor(seed);
  return (
    <div style={{ height, borderRadius: radius, background: `${tint}14`, border: "1px solid var(--border)",
      display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <Icon name={icon} size={Math.min(48, height * 0.32)} color={`${tint}AA`} />
    </div>
  );
}

/* ---------- apartments grid ---------- */
function ApartmentCard({ apt, onOpen }) {
  const assigned = !!apt.assignedEmployee;
  return (
    <button onClick={() => onOpen(apt)} style={{ textAlign: "left", border: "1px solid var(--border)", background: "#fff",
      borderRadius: 14, padding: 12, cursor: "pointer", display: "flex", flexDirection: "column", gap: 12, transition: "box-shadow .15s, border-color .15s" }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--shadow-card)"; e.currentTarget.style.borderColor = "var(--gray-300)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "var(--border)"; }}>
      <div style={{ position: "relative" }}>
        <PropertyImage seed={apt.name} />
        <span style={{ position: "absolute", top: 10, right: 10 }}>
          <StatusBadge variant={assigned ? "inactive" : "active"} text={assigned ? "Assigned" : "Available"} size="sm" />
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "0 4px 4px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
          <span style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 16, color: "var(--gray-900)" }}>{apt.name}</span>
          <span style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--gray-400)" }}>{apt.number}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--gray-500)" }}>
          <Icon name="map-pin-2-line" size={15} color="var(--gray-400)" />{apt.location}
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
          <span className="bh-chip">{apt.apartmentType}</span>
          <span className="bh-chip">{apt.jobGrade || "N/A"}</span>
        </div>
      </div>
    </button>
  );
}

function ApartmentsGrid({ rows, q, setQ, onOpen }) {
  const shown = rows.filter(r => q === "" || `${r.name} ${r.location} ${r.apartmentType}`.toLowerCase().includes(q.toLowerCase()));
  if (rows.length === 0) return <EmptyState variant="place" title="No accommodations yet" subtitle="Add a property to start managing staff accommodation." />;
  return (
    <React.Fragment>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 18 }}>
        <div className="input-wrap" style={{ width: 300, padding: "8px 12px" }}>
          <Icon name="search-2-line" size={18} style={{ color: "var(--icon-default)" }} />
          <input placeholder="Search accommodations…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <Button variant="stroke" size="sm" icon="equalizer-line">Show Filter</Button>
      </div>
      {shown.length === 0
        ? <EmptyState compact variant="place" title="No results found" subtitle="No accommodation matches your search." />
        : <div className="acc-grid">{shown.map(a => <ApartmentCard key={a.id} apt={a} onOpen={onOpen} />)}</div>}
    </React.Fragment>
  );
}

/* ---------- pending requests list ---------- */
function PendingRequestsList({ rows, q, setQ, onOpen }) {
  const shown = rows.filter(r => q === "" || `${r.employeeFullName} ${r.employeeEmail}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "16px 20px" }}>
        <div className="input-wrap" style={{ width: 280, padding: "8px 12px" }}>
          <Icon name="search-2-line" size={18} style={{ color: "var(--icon-default)" }} />
          <input placeholder="Search requests…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
      </div>
      {rows.length === 0
        ? <EmptyState variant="message" title="No pending requests" subtitle="Accommodation requests submitted by staff will appear here." />
        : <table className="bh">
            <thead><tr><th>Employee</th><th>Duration</th><th>Period</th><th>Requested On</th><th style={{ width: 130 }}></th></tr></thead>
            <tbody>
              {shown.map(r => (
                <tr key={r.accommodationRequestId}>
                  <td><span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                    <Avatar name={r.employeeFullName} size={30} />
                    <span style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontWeight: 600 }}>{r.employeeFullName}</span>
                      <span style={{ fontSize: 12.5, color: "var(--gray-400)" }}>{r.employeeEmail}</span>
                    </span></span></td>
                  <td style={{ textTransform: "capitalize" }}>{r.duration}</td>
                  <td>{r.startDate ? `${fmtDate(r.startDate)} – ${fmtDate(r.endDate)}` : "—"}</td>
                  <td>{fmtDate(r.requestCreatedAt)}</td>
                  <td style={{ textAlign: "right" }}><ViewDetailsButton icon="eye-line" onClick={() => onOpen(r.accommodationRequestId)} /></td>
                </tr>
              ))}
              {shown.length === 0 && <tr><td colSpan={5} style={{ padding: 0 }}><EmptyState compact variant="message" title="No results found" subtitle="No request matches your search." /></td></tr>}
            </tbody>
          </table>}
    </div>
  );
}

/* ---------- accommodation details (shared DetailCard/DetailPanel) ---------- */
function AccommodationDetails({ apt, onAssign }) {
  const ae = apt.assignedEmployee;
  const propItems = [
    { label: "Property Name", value: apt.name }, { label: "Property Number", value: apt.number },
    { label: "Apartment Type", value: apt.apartmentType }, { label: "Job Grade", value: apt.jobGrade || "N/A" },
    { label: "Location", value: apt.location },
  ];
  const assignedItems = ae
    ? [{ label: "Staff Name", value: ae.employeeFullName }, { label: "Email", value: ae.employeeEmail }, { label: "Phone", value: ae.employeePhoneNumber }]
    : [{ label: "Staff Name", value: "—" }, { label: "Email", value: "—" }, { label: "Phone", value: "—" }];
  const rentItems = ae
    ? [{ label: "Allocation Date", value: fmtDate(ae.assignmentStartDate) }, { label: "Handing Over Date", value: fmtDate(ae.handingOverDate) },
       { label: "Assignment End Date", value: fmtDate(ae.assignmentEndDate) }, { label: "Approved Rent", value: ae.approvedRent || "—" },
       { label: "Previous Rent", value: ae.previousRent || "—" }, { label: "Comments", value: ae.comments || "—" }]
    : [{ label: "Allocation Date", value: "—" }, { label: "Handing Over Date", value: "—" }, { label: "Assignment End Date", value: "—" },
       { label: "Approved Rent", value: "—" }, { label: "Previous Rent", value: "—" }, { label: "Comments", value: "—" }];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 1080 }}>
      <DetailCard icon="home-4-line" title={`${apt.name} (${apt.apartmentType})`}
        action={<Button variant="primary" disabled={!!ae} onClick={onAssign}>{ae ? "Already Assigned" : "Assign to staff"}</Button>}>
        <DetailPanel items={propItems} tint="gray" cols={4} />
        {apt.description && <div style={{ marginTop: 14, padding: "0 12px", fontFamily: "var(--font-ui)", fontSize: 14, lineHeight: "22px", color: "var(--gray-700)" }}>{apt.description}</div>}
      </DetailCard>

      {apt.attachments && apt.attachments.length > 0 && (
        <DetailCard icon="image-2-line" title="Property Images">
          <div className="acc-imggrid">
            {apt.attachments.map((f, i) => <PropertyImage key={i} seed={`${apt.name}-${f}`} height={130} icon="image-line" />)}
          </div>
        </DetailCard>
      )}

      <DetailCard icon="user-follow-line" title="Assigned To">
        <DetailPanel items={assignedItems} tint={ae ? "green" : "gray"} cols={4} />
      </DetailCard>

      <DetailCard icon="bill-line" title="Rent Details">
        <DetailPanel items={rentItems} tint="cream" cols={3} />
      </DetailCard>
    </div>
  );
}

/* ---------- request details modal ---------- */
function RequestDetailsModal({ details, onClose }) {
  const empItems = [
    { label: "Name", value: details.employeeFullName }, { label: "Staff ID", value: details.employeeStaffId },
    { label: "Job Grade", value: details.employeeJobGrade }, { label: "Job Title", value: details.employeeDesignation },
    { label: "Department/Unit", value: details.employeeDepartment }, { label: "Phone Number", value: details.employeePhoneNumber },
    { label: "Requested On", value: fmtDate(details.createdAt) },
  ];
  const accItems = [
    { label: "Accommodation Type", value: details.accommodationType }, { label: "Apartment Type", value: details.apartmentType },
    { label: "Location", value: details.location }, { label: "Duration", value: details.duration },
    ...(String(details.duration).toLowerCase() === "temporary"
      ? [{ label: "Start Date", value: fmtDate(details.startDate) }, { label: "End Date", value: fmtDate(details.endDate) }] : []),
  ];
  return (
    <Modal onClose={onClose} width={680}>
      <div style={{ padding: "24px 24px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 20, color: "var(--gray-900)" }}>Accommodation Request Details</div>
          <div className="bh-body" style={{ marginTop: 4 }}>Review all details of this request to approve or decline.</div>
        </div>
        <button onClick={onClose} className="btn btn-icon btn-ghost" style={{ width: 32, height: 32, padding: 0 }}><Icon name="close-line" size={20} color="var(--gray-500)" /></button>
      </div>
      <div style={{ padding: "18px 24px 24px", display: "flex", flexDirection: "column", gap: 18 }}>
        <DetailPanel items={empItems} tint="gray" cols={3} />
        <DetailPanel items={accItems} tint="gray" cols={3} />
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
          <DetailItem label="Reason for Request" value={details.reason} />
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-400)", marginBottom: 8 }}>Requested by</div>
          <RequesterInfoCard title={details.employeeFullName} subtitle={details.employeeEmail} />
        </div>
      </div>
    </Modal>
  );
}

/* ---------- assign dialog (pick a pending request) ---------- */
function RequestSelectCard({ request, selected, onSelect }) {
  return (
    <label onClick={onSelect} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 12,
      border: `1px solid ${selected ? "#007839" : "var(--border)"}`, background: selected ? "#ECFDF3" : "#fff", cursor: "pointer", transition: "border-color .15s, background .15s" }}>
      <Avatar name={request.employeeFullName} size={36} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 14, color: "var(--gray-900)" }}>{request.employeeFullName}</div>
        <div style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--gray-400)" }}>
          {request.employeeEmail} · <span style={{ textTransform: "capitalize" }}>{request.duration}</span>
          {request.startDate && ` · ${fmtDate(request.startDate)}–${fmtDate(request.endDate)}`}
        </div>
      </div>
      <span style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, border: `2px solid ${selected ? "#007839" : "var(--gray-300)"}`,
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        {selected && <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#007839" }} />}
      </span>
    </label>
  );
}

function AssignDialog({ apt, requests, onClose, onAssign }) {
  const [sel, setSel] = useAcc("");
  const [q, setQ] = useAcc("");
  const shown = requests.filter(r => q === "" || r.employeeFullName.toLowerCase().includes(q.toLowerCase()));
  return (
    <Modal onClose={onClose} width={560}>
      <div style={{ padding: "24px 24px 0" }}>
        <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 20, color: "var(--gray-900)" }}>Assign To Staff</div>
        <div className="bh-body" style={{ marginTop: 4 }}>Select a pending request to assign <strong>{apt.name}</strong>.</div>
      </div>
      <div style={{ padding: "16px 24px 0" }}>
        <div className="input-wrap" style={{ padding: "8px 12px" }}>
          <Icon name="search-2-line" size={18} style={{ color: "var(--icon-default)" }} />
          <input placeholder="Search staff…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
      </div>
      <div style={{ padding: "14px 24px", display: "flex", flexDirection: "column", gap: 10, maxHeight: 320, overflowY: "auto" }}>
        {shown.length === 0
          ? <div style={{ textAlign: "center", padding: "32px 0", color: "var(--gray-400)", fontFamily: "var(--font-ui)", fontSize: 14 }}>No pending requests found.</div>
          : shown.map(r => <RequestSelectCard key={r.accommodationRequestId} request={r} selected={sel === r.accommodationRequestId} onSelect={() => setSel(r.accommodationRequestId)} />)}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: "0 24px 24px" }}>
        <Button variant="stroke" onClick={onClose}>Cancel</Button>
        <Button variant="primary" disabled={!sel} onClick={() => onAssign(sel)}>Assign</Button>
      </div>
    </Modal>
  );
}

Object.assign(window, { AccommodationDetails, RequestDetailsModal, AssignDialog, PendingRequestsList, ApartmentsGrid, PropertyImage, fmtDate });
