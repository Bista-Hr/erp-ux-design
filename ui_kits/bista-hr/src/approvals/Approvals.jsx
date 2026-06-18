// BISTA HR · approvals/Approvals — Core HR ▸ Approvals (admin side).
// Pending Approvals / Completed tabs → "View Details" opens an Updated Details modal that
// compares Old vs Updated staff details (changed fields highlighted) with the affidavit
// attachment. Pending requests can be Approved / Rejected, each via a confirmation modal,
// then a success/error toast; completed requests are read-only with an Approved/Rejected badge.
const { useState: useAppr } = React;

const APPR_FIELDS = ["Title", "First Name", "Middle Name", "Last Name", "Date of Birth", "Gender", "Marital Status", "Nationality"];
const baseDetails = { "Title": "Mr", "First Name": "Leslie", "Middle Name": "Alexandre", "Last Name": "Alexandre",
  "Date of Birth": "08 June, 1990", "Gender": "Male", "Marital Status": "Married", "Nationality": "Ghanaian" };

let APPR_SEQ = 800;
const apprId = () => ++APPR_SEQ;
const mkReq = (requestedOn, requestType, requestedBy, role, department, status, updated) => ({
  id: apprId(), requestedOn, requestType, requestedBy, role, department, status,
  old: { ...baseDetails },
  updated: { ...baseDetails, ...updated },
  affidavit: { name: "Affidavit", size: "30 mb · PDF" },
});
const APPROVAL_SEED = [
  mkReq("08 Oct, 2020", "Update Address", "James Brown", "IT Officer", "IT", "pending", { "Middle Name": "Kwame", "Last Name": "Adu-Poku" }),
  mkReq("08 Oct, 2020", "Update Personal Information", "James Brown", "HR Officer", "HR", "pending", { "Marital Status": "Single" }),
  mkReq("08 Oct, 2020", "Update Education Details", "James Brown", "Analyst", "Accounts & Finance", "pending", { "Last Name": "Adu-Poku" }),
  mkReq("08 Oct, 2020", "Update Address", "James Brown", "Analyst", "Accounts & Finance", "pending", { "Nationality": "Nigerian" }),
  mkReq("08 Oct, 2020", "Update Education Details", "James Brown", "Analyst", "Accounts & Finance", "pending", { "Middle Name": "Kwame" }),
  mkReq("08 Oct, 2020", "Update Personal Details", "James Brown", "IT Officer", "IT", "approved", { "Middle Name": "Kwame", "Last Name": "Adu-Poku" }),
  mkReq("08 Oct, 2020", "Update Personal Details", "James Brown", "HR Officer", "HR", "rejected", { "Marital Status": "Single" }),
  mkReq("08 Oct, 2020", "Update Address", "James Brown", "Analyst", "Accounts & Finance", "approved", { "Nationality": "Nigerian" }),
];

const changedKeys = (req) => APPR_FIELDS.filter(f => req.old[f] !== req.updated[f]);
const STATUS_TINT = { pending: "var(--brand-yellow-tint)", approved: "#ECFDF3", rejected: "#FEF3F2" };

// per-status highlight for the SHARED <DetailPanel> (same component used on the employee
// info page): tint = panel fill, accent + changeBg = changed-field emphasis.
const PANEL_STYLE = {
  pending:  { tint: "cream", accent: "var(--brand-yellow-dark)", change: "#FBF1C7" },
  approved: { tint: "green", accent: "#007839", change: "#D1FADF" },
  rejected: { tint: "red",   accent: "#C11E39", change: "#FEE4E2" },
};
const toItems = (data, changed) => APPR_FIELDS.map(f => ({ label: f, value: data[f], changed: changed.includes(f) }));

function UpdatedDetailsModal({ req, onClose, onApprove, onReject }) {
  const changed = changedKeys(req);
  const badgeVariant = req.status === "approved" ? "approved" : req.status === "rejected" ? "rejected" : "pending";
  const badgeText = req.status === "approved" ? "Approved" : req.status === "rejected" ? "Rejected" : "Pending Approval";
  const st = PANEL_STYLE[req.status] || PANEL_STYLE.pending;
  return (
    <Modal onClose={onClose} width={680}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "24px 24px 0" }}>
        <div>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 20, color: "var(--gray-900)" }}>Updated Details</div>
          <div className="bh-body" style={{ marginTop: 2 }}>{req.status === "pending" ? "Review update details request from staff" : "View update details request from staff"}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <StatusBadge variant={badgeVariant} text={badgeText} size="sm" />
          <button className="btn btn-icon btn-ghost" onClick={onClose} style={{ width: 32, height: 32, padding: 0 }}><Icon name="close-line" size={20} color="var(--gray-500)" /></button>
        </div>
      </div>

      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 14, color: "var(--gray-900)", marginBottom: 10 }}>Old Details</div>
          <DetailPanel items={toItems(req.old, [])} tint="gray" cols={4} />
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 14, color: "var(--gray-900)", marginBottom: 10 }}>Updated Details</div>
          <DetailPanel items={toItems(req.updated, changed)} tint={st.tint} cols={4} accent={st.accent} changeBg={st.change} />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", border: "1px solid var(--border)", borderRadius: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 34, height: 34, borderRadius: 8, background: "var(--error-tint, #FEF3F2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="file-pdf-2-line" size={20} color="var(--error)" />
            </span>
            <div>
              <div style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 14, color: "var(--gray-900)" }}>{req.affidavit.name}</div>
              <div className="bh-caption">{req.affidavit.size}</div>
            </div>
          </div>
          <button className="btn btn-icon btn-ghost" style={{ width: 34, height: 34, padding: 0 }}><Icon name="download-2-line" size={18} color="var(--gray-500)" /></button>
        </div>
      </div>

      {req.status === "pending" && (
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: "0 24px 24px" }}>
          <Button variant="stroke" onClick={() => onReject(req)}>Reject Request</Button>
          <Button variant="primary" onClick={() => onApprove(req)}>Approve Request</Button>
        </div>
      )}
    </Modal>
  );
}

function AdminApprovalsScreen({ onToast }) {
  const [reqs, setReqs] = useAppr(APPROVAL_SEED);
  const [tab, setTab] = useAppr("Pending Approvals");
  const [q, setQ] = useAppr("");
  const [detailId, setDetailId] = useAppr(null);
  const [confirm, setConfirm] = useAppr(null);   // { kind: 'approve'|'reject', id }

  const pending = tab === "Pending Approvals";
  const shown = reqs.filter(r => (pending ? r.status === "pending" : r.status !== "pending")
    && (q === "" || r.requestType.toLowerCase().includes(q.toLowerCase()) || r.requestedBy.toLowerCase().includes(q.toLowerCase())));
  const pg = usePaged(shown, 10);
  const detail = reqs.find(r => r.id === detailId);
  const pendingCount = reqs.filter(r => r.status === "pending").length;

  const createCase = () => {
    setReqs(rs => [mkReq("Today", "Update Personal Details", "James Brown", "Line Manager", "HR", "pending", { "Middle Name": "Kwame" }), ...rs]);
    onToast("Case Created", { tone: "success" });
  };

  const runConfirm = () => {
    const { kind, id } = confirm;
    const status = kind === "approve" ? "approved" : "rejected";
    setReqs(rs => rs.map(r => r.id === id ? { ...r, status } : r));
    onToast(kind === "approve" ? "Request Approved" : "Request Rejected", { tone: kind === "approve" ? "success" : "error" });
    setConfirm(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title="Approvals" subtitle="See and manage all updated reports."
        actions={<Button variant="primary" icon="add-line" onClick={createCase}>Create a case</Button>} />

      <div className="card" style={{ padding: 20 }}>
        <div className="bh-tablebox">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "16px 20px" }}>
          <div className="seg">
            <button className={pending ? "active" : ""} onClick={() => setTab("Pending Approvals")} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              {pendingCount > 0 && <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 18, height: 18, padding: "0 5px", borderRadius: 999, background: "var(--error)", color: "#fff", fontSize: 11, fontWeight: 700 }}>{pendingCount}</span>}
              Pending Approvals
            </button>
            <button className={!pending ? "active" : ""} onClick={() => setTab("Completed")}>Completed</button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="input-wrap" style={{ width: 260, padding: "8px 12px" }}>
              <Icon name="search-2-line" size={18} style={{ color: "var(--icon-default)" }} />
              <input placeholder="Search…" value={q} onChange={e => setQ(e.target.value)} />
            </div>
            <Button variant="stroke" size="sm" icon="equalizer-line">Show Filter</Button>
          </div>
        </div>

        {shown.length === 0
          ? <EmptyState compact title="No requests" subtitle={pending ? "There are no pending approval requests." : "No completed requests yet."} />
          : <table className="bh">
              <thead><tr>
                <th>Requested On</th><th>Request Type</th><th>Requested By</th><th>Department</th>
                {!pending && <th>Report Stage</th>}<th style={{ width: 110 }}></th>
              </tr></thead>
              <tbody>
                {pg.pageItems.map(r => (
                  <tr key={r.id}>
                    <td>{r.requestedOn}</td>
                    <td>{r.requestType}</td>
                    <td><span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                      <Avatar name={r.requestedBy} size={30} />
                      <span><span style={{ display: "block", fontWeight: 500, color: "var(--gray-900)" }}>{r.requestedBy}</span>
                      <span className="bh-caption">{r.role}</span></span>
                    </span></td>
                    <td>{r.department}</td>
                    {!pending && <td><StatusBadge variant={r.status} text={r.status === "approved" ? "Approved" : "Rejected"} size="sm" /></td>}
                    <td style={{ textAlign: "right" }}>
                      <ViewDetailsButton onClick={() => setDetailId(r.id)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>}
        {shown.length > 0 && <div style={{ borderTop: "1px solid var(--divider)" }}><Pagination page={pg.page} pages={pg.pages} onPrev={pg.prev} onNext={pg.next} /></div>}
        </div>
      </div>

      {detail && (
        <UpdatedDetailsModal req={detail} onClose={() => setDetailId(null)}
          onApprove={(r) => setConfirm({ kind: "approve", id: r.id })}
          onReject={(r) => setConfirm({ kind: "reject", id: r.id })} />
      )}

      {confirm && (
        <ConfirmModal
          title={confirm.kind === "approve" ? "Approving Request" : "Rejecting Request"}
          message={`Are you sure you want to ${confirm.kind} this update request?`}
          confirmLabel={confirm.kind === "approve" ? "Yes, Approve" : "Yes, Reject"}
          confirmIcon={confirm.kind === "approve" ? "check-line" : "close-line"}
          cancelLabel="Cancel" onConfirm={runConfirm} onClose={() => setConfirm(null)} />
      )}
    </div>
  );
}

Object.assign(window, { AdminApprovalsScreen });
