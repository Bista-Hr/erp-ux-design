// BISTA HR · leave-admin/HolidaysBalances — Holidays, Leave Balances, Leave Recalls tabs.
const { useState: useHB } = React;

/* ============================ HOLIDAYS ============================ */
function HolidaysView({ rows, onCreate, onEdit, onArchive }) {
  const [q, setQ] = useHB("");
  const [menu, setMenu] = useHB(null);
  const shown = rows.filter(r => q === "" || r.name.toLowerCase().includes(q.toLowerCase()));
  const pg = usePaged(shown, 10);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title="Holidays" subtitle="Manage your organization's holidays"
        actions={<Button variant="primary" icon="add-line" onClick={onCreate}>Create Holiday</Button>} />
      <div className="card" style={{ padding: 20, overflow: "visible" }}>
        <div className="bh-tablebox">
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "16px 20px" }}>
          <div className="input-wrap" style={{ width: 280, padding: "8px 12px" }}>
            <Icon name="search-2-line" size={18} style={{ color: "var(--icon-default)" }} /><input placeholder="search..." value={q} onChange={e => setQ(e.target.value)} />
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="bh">
            <thead><tr><th>Holiday Name</th><th>Date</th><th style={{ width: 48 }}></th></tr></thead>
            <tbody>
              {pg.pageItems.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600 }}>{r.name}</td>
                  <td>{r.day} {r.month}</td>
                  <td style={{ textAlign: "right" }}>
                    <RowMenu open={menu === r.id} onToggle={() => setMenu(menu === r.id ? null : r.id)}
                      items={[{ label: "Edit holiday", icon: "edit-2-line", onClick: () => onEdit(r) }, { label: "Archive", icon: "archive-line", danger: true, onClick: () => onArchive(r) }]} />
                  </td>
                </tr>
              ))}
              {shown.length === 0 && <tr><td colSpan={3} style={{ padding: 0 }}><EmptyState compact title="No holidays yet" subtitle="Create your first holiday to get started." /></td></tr>}
            </tbody>
          </table>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderTop: "1px solid var(--divider)" }}>
          <span className="bh-caption">Showing {shown.length === 0 ? 0 : (pg.page - 1) * 10 + 1} to {Math.min(pg.page * 10, shown.length)} of {shown.length} records</span>
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="stroke" size="sm" disabled={pg.page <= 1} onClick={pg.prev}>Previous</Button>
            <Button variant="stroke" size="sm" disabled={pg.page >= pg.pages} onClick={pg.next}>Next</Button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

function HolidayModal({ initial, onClose, onSubmit }) {
  const editing = !!initial;
  const [form, setForm] = useHB(() => ({ name: initial?.name || "", month: initial?.month || "", day: initial?.day || "" }));
  const set = (k, v) => setForm(s => ({ ...s, [k]: v }));
  const dayOpts = Array.from({ length: form.month ? daysInMonth(form.month) : 31 }, (_, i) => String(i + 1));
  const valid = form.name.trim() && form.month && form.day;
  return (
    <Modal onClose={onClose} width={520}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "24px 24px 0" }}>
        <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 20, color: "var(--gray-900)" }}>{editing ? "Edit Holiday" : "Create Holiday"}</div>
        <button className="btn btn-icon btn-ghost" onClick={onClose} style={{ width: 32, height: 32, padding: 0 }}><Icon name="close-line" size={20} color="var(--gray-500)" /></button>
      </div>
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
        <Field label="Holiday Name"><Input placeholder="e.g. Founders Day" value={form.name} onChange={e => set("name", e.target.value)} /></Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Field label="Month" style={{ margin: 0 }}><Combobox value={form.month} onChange={v => set("month", v)} options={MONTHS} placeholder="Select month" /></Field>
          <Field label="Day" style={{ margin: 0 }}><Combobox value={String(form.day || "")} onChange={v => set("day", v)} options={dayOpts} placeholder="Select day" /></Field>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: "0 24px 24px" }}>
        <Button variant="stroke" onClick={onClose}>Cancel</Button>
        <Button variant="primary" disabled={!valid} onClick={() => valid && onSubmit(form)}>{editing ? "Save Changes" : "Create Holiday"}</Button>
      </div>
    </Modal>
  );
}

/* ============================ LEAVE BALANCES ============================ */
function LeaveBalancesView({ rows, onToast }) {
  const [type, setType] = useHB("");
  const [year, setYear] = useHB("2026");
  const [fileName, setFileName] = useHB("");
  const [perPage, setPerPage] = useHB("10");
  const [q, setQ] = useHB("");
  const shown = rows.filter(r => q === "" || r.employee.toLowerCase().includes(q.toLowerCase()) || r.type.toLowerCase().includes(q.toLowerCase()));
  const pg = usePaged(shown, Number(perPage));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ marginBottom: -8 }}><div className="bh-h2" style={{ fontSize: 24 }}>Leave Balances</div><div className="bh-body" style={{ marginTop: 4 }}>View employee leave balances by leave type</div></div>

      {/* upload card */}
      <div className="card" style={{ padding: "var(--card-pad, 24px)" }}>
        <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 17, color: "var(--gray-900)", marginBottom: 18 }}>Upload File</div>
        <div className="lb-upload">
          <Field label="Leave Type" style={{ margin: 0 }}><Combobox value={type} onChange={setType} options={LEAVE_TYPE_NAMES} placeholder="Select leave type" /></Field>
          <Field label="Year" style={{ margin: 0 }}><Input value={year} onChange={e => setYear(e.target.value)} /></Field>
          <Field label="Select file" style={{ margin: 0 }}>
            <label className="input-wrap" style={{ cursor: "pointer" }}>
              <Icon name="upload-2-line" size={18} style={{ color: "var(--icon-default)" }} />
              <span style={{ flex: 1, fontFamily: "var(--font-control)", fontSize: 14, color: fileName ? "var(--gray-900)" : "var(--gray-400)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{fileName || "Choose file — no file chosen"}</span>
              <input type="file" style={{ display: "none" }} onChange={e => setFileName(e.target.files?.[0]?.name || "")} />
            </label>
          </Field>
          <Button variant="primary" icon="upload-2-line" onClick={() => onToast(fileName ? "Balances Uploaded" : "Choose a file first", { tone: fileName ? "success" : "error" })}>Upload</Button>
        </div>
      </div>

      {/* table card */}
      <div className="card" style={{ padding: "var(--card-pad, 24px)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="bh-caption">Rows per page</span>
            <div style={{ width: 90 }}><Combobox value={perPage} onChange={setPerPage} options={["10", "25", "50"]} /></div>
          </div>
          <div className="input-wrap" style={{ width: 320, padding: "8px 12px" }}>
            <Icon name="search-2-line" size={18} style={{ color: "var(--icon-default)" }} /><input placeholder="Search by employee or leave type..." value={q} onChange={e => setQ(e.target.value)} />
          </div>
        </div>
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="bh">
              <thead><tr><th>Employee</th><th>Leave Type</th><th>Year</th><th>Entitled</th><th>Used</th><th>Remaining</th></tr></thead>
              <tbody>
                {pg.pageItems.map(r => (
                  <tr key={r.id}><td style={{ fontWeight: 600, textTransform: "uppercase" }}><span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}><Avatar name={r.employee} size={32} />{r.employee}</span></td><td>{r.type}</td><td>{r.year}</td><td>{r.entitled}</td><td>{r.used}</td><td style={{ fontWeight: 600 }}>{r.remaining}</td></tr>
                ))}
                {shown.length === 0 && <tr><td colSpan={6} style={{ padding: 0 }}><EmptyState compact variant="money" title="No balances found" subtitle="No employee balances match your search." /></td></tr>}
              </tbody>
            </table>
          </div>
          <div style={{ borderTop: "1px solid var(--divider)" }}><Pagination page={pg.page} pages={pg.pages} onPrev={pg.prev} onNext={pg.next} /></div>
        </div>
      </div>
    </div>
  );
}

/* ============================ LEAVE RECALLS ============================ */
function LeaveRecallsView({ onToast }) {
  return (
    <div className="card" style={{ padding: "var(--card-pad, 24px)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
        <div><div className="bh-h2" style={{ fontSize: 24 }}>Leave Recalls</div><div className="bh-body" style={{ marginTop: 4 }}>Recall employees from approved leave when needed</div></div>
        <Button variant="primary" icon="add-line" onClick={() => onToast("Recall flow coming soon")}>Create Recall</Button>
      </div>
      <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
        <EmptyState variant="leave" title="No leave recalls" subtitle="When you recall an employee from approved leave, it will appear here." />
      </div>
    </div>
  );
}

Object.assign(window, { HolidaysView, HolidayModal, LeaveBalancesView, LeaveRecallsView });
