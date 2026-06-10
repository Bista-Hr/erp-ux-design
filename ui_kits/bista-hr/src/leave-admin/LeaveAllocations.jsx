// BISTA HR · leave-admin/LeaveAllocations — entitlement days by job grade.
//   LeaveAllocationsView : stacked grade cards, each with an Edit button
//   EditAllocationModal  : number-per-leave-type editor (Save enabled once changed)
const { useState: useLA } = React;

function AllocationCard({ alloc, onEdit }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 22, color: "var(--gray-900)", whiteSpace: "nowrap" }}>{alloc.grade}</div>
        <Button variant="ghost" size="sm" icon="edit-2-line" onClick={() => onEdit(alloc)} style={{ background: "var(--brand-yellow-tint)", color: "var(--gray-800)" }}>Edit</Button>
      </div>
      <div className="alloc-grid">
        {LEAVE_TYPE_NAMES.map(name => (
          <div key={name}>
            <div style={{ fontFamily: "var(--font-ui)", fontSize: 13.5, color: "var(--gray-400)" }}>{name}</div>
            <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 16, color: "var(--gray-900)", marginTop: 4 }}>{alloc.days[name] ?? 0} Days</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LeaveAllocationsView({ allocations, onEdit }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ marginBottom: 8 }}>
        <div className="bh-h2" style={{ fontSize: 24 }}>Leave Allocations</div>
        <div className="bh-body" style={{ marginTop: 4 }}>Manage leave entitlements by job grade</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {allocations.length === 0
          ? <EmptyState compact title="No job grades yet" subtitle="Create a job grade on the Job Grades page to set its leave allocation." />
          : allocations.map(a => <AllocationCard key={a.id} alloc={a} onEdit={onEdit} />)}
      </div>
    </div>
  );
}

function EditAllocationModal({ alloc, onClose, onSave }) {
  const [days, setDays] = useLA(() => ({ ...alloc.days }));
  const [dirty, setDirty] = useLA(false);
  const set = (name, v) => { setDays(d => ({ ...d, [name]: v })); setDirty(true); };
  return (
    <Modal onClose={onClose} width={620}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "24px 24px 0" }}>
        <div>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 20, color: "var(--gray-900)" }}>Edit Leave Allocation ({alloc.grade})</div>
          <div className="bh-body" style={{ marginTop: 4 }}>Update the number of days allocated to each leave type</div>
        </div>
        <button className="btn btn-icon btn-ghost" onClick={onClose} style={{ width: 32, height: 32, padding: 0 }}><Icon name="close-line" size={20} color="var(--gray-500)" /></button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18, padding: 24 }}>
        {LEAVE_TYPE_NAMES.map(name => (
          <div key={name}>
            <label style={{ display: "block", fontFamily: "var(--font-head)", fontWeight: 500, fontSize: 14, color: "var(--gray-900)", marginBottom: 8 }}>{name}</label>
            <div className="input-wrap">
              <input type="number" min="0" value={days[name] ?? 0} onChange={e => set(name, e.target.value === "" ? "" : Number(e.target.value))} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: "0 24px 24px" }}>
        <Button variant="stroke" onClick={onClose}>Cancel</Button>
        <Button variant="primary" disabled={!dirty} onClick={() => onSave({ ...alloc, days })}>Save Changes</Button>
      </div>
    </Modal>
  );
}

Object.assign(window, { LeaveAllocationsView, EditAllocationModal });
