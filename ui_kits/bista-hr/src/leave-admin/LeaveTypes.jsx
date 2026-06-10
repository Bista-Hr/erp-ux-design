// BISTA HR · leave-admin/LeaveTypes — Leave Types table + full-page Create/Edit form.
//   LeaveTypesTable : list with ⋯ (Edit leave type / Archive)
//   LeaveTypeForm   : full-page create/edit (breadcrumb lives in the controller)
//   Toggle, TagInput, RowMenu exported for reuse across the admin module.
const { useState: useLT } = React;

/* iOS-style switch */
function Toggle({ checked, onChange, label }) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
      <span onClick={() => onChange(!checked)} style={{ width: 40, height: 22, borderRadius: 999, flexShrink: 0,
        background: checked ? "var(--brand-yellow)" : "var(--gray-200)", position: "relative", transition: "background .18s" }}>
        <span style={{ position: "absolute", top: 2, left: checked ? 20 : 2, width: 18, height: 18, borderRadius: "50%",
          background: "#fff", boxShadow: "0 1px 2px rgba(16,24,40,.25)", transition: "left .18s" }} />
      </span>
      {label && <span style={{ fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 14, color: "var(--gray-800)" }}>{label}</span>}
    </label>
  );
}

/* email chip input — chips + add field, Enter or + to add */
function TagInput({ value = [], onChange, placeholder }) {
  const [draft, setDraft] = useLT("");
  const add = () => {
    const v = draft.trim();
    if (v && !value.includes(v)) onChange([...value, v]);
    setDraft("");
  };
  const remove = (t) => onChange(value.filter(x => x !== t));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {value.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {value.map(t => (
            <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--brand-yellow-tint)",
              border: "1px solid var(--brand-yellow)", borderRadius: 7, padding: "5px 8px 5px 10px", fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--gray-800)" }}>
              {t}<span onClick={() => remove(t)} style={{ display: "inline-flex", cursor: "pointer" }}><Icon name="close-line" size={14} color="var(--gray-500)" /></span>
            </span>
          ))}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div className="input-wrap" style={{ flex: 1 }}>
          <input placeholder={placeholder} value={draft} onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } }} />
        </div>
        <button className="btn btn-icon btn-stroke" onClick={add} title="Add email" style={{ width: 42, height: 42, flexShrink: 0 }}>
          <Icon name="add-line" size={18} />
        </button>
      </div>
      <span className="hint" style={{ margin: 0 }}>Press Enter or click + to add email</span>
    </div>
  );
}

/* reusable row ⋯ menu (label/onClick + optional danger) */
function RowMenu({ open, onToggle, items }) {
  return (
    <span style={{ position: "relative", display: "inline-flex" }}>
      <button className="btn btn-icon btn-ghost" style={{ width: 28, height: 28, padding: 0 }} onClick={onToggle}>
        <Icon name="more-fill" size={18} color="var(--gray-400)" />
      </button>
      {open && (
        <div onMouseLeave={onToggle} style={{ position: "absolute", right: 0, top: 34, zIndex: 30, background: "#fff",
          borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-pop)", padding: 6, minWidth: 180,
          display: "flex", flexDirection: "column" }}>
          {items.map((it, i) => (
            <button key={i} className={`menu-item${it.danger ? " danger" : ""}`} onClick={() => { onToggle(); it.onClick(); }}>
              {it.icon && <Icon name={it.icon} size={16} />}{it.label}
            </button>
          ))}
        </div>
      )}
    </span>
  );
}

/* ---- Leave Types table ---- */
function LeaveTypesTable({ rows, onCreate, onEdit, onArchive }) {
  const [q, setQ] = useLT("");
  const [menu, setMenu] = useLT(null);
  const shown = rows.filter(r => q === "" || r.name.toLowerCase().includes(q.toLowerCase()));
  const pg = usePaged(shown, 10);
  return (
    <div className="card" style={{ overflow: "visible", padding: "var(--card-pad, 24px)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
        <div>
          <div className="bh-h2" style={{ fontSize: 24 }}>Leave Types</div>
          <div className="bh-body" style={{ marginTop: 4 }}>Manage your organization's leave types</div>
        </div>
        <Button variant="primary" icon="add-line" onClick={onCreate}>Create Leave Type</Button>
      </div>
      <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "visible" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "16px 20px" }}>
          <div className="input-wrap" style={{ width: 280, padding: "8px 12px" }}>
            <Icon name="search-2-line" size={18} style={{ color: "var(--icon-default)" }} />
            <input placeholder="search..." value={q} onChange={e => setQ(e.target.value)} />
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="bh">
            <thead><tr><th>Leave Name</th><th>Gender</th><th>Entitled</th><th>Requires Documents</th><th>Documents After(Days)</th><th style={{ width: 48 }}></th></tr></thead>
            <tbody>
              {pg.pageItems.map(r => (
                <tr key={r.id}>
                  <td><button onClick={() => onEdit(r)} style={{ border: 0, background: "none", padding: 0, cursor: "pointer", fontFamily: "var(--font-ui)", fontSize: 14, fontWeight: 600, color: "var(--gray-900)" }}>{r.name}</button></td>
                  <td>{r.gender}</td>
                  <td>{r.entitled ? "Yes" : "No"}</td>
                  <td>{r.requiresDocs ? "Yes" : "No"}</td>
                  <td>{r.docsAfter ?? "—"}</td>
                  <td style={{ textAlign: "right" }}>
                    <RowMenu open={menu === r.id} onToggle={() => setMenu(menu === r.id ? null : r.id)}
                      items={[{ label: "Edit leave type", icon: "edit-2-line", onClick: () => onEdit(r) },
                              { label: "Archive", icon: "archive-line", danger: true, onClick: () => onArchive(r) }]} />
                  </td>
                </tr>
              ))}
              {shown.length === 0 && <tr><td colSpan={6} style={{ padding: 0 }}><EmptyState compact title="No results found" subtitle="No leave type matches your search." /></td></tr>}
            </tbody>
          </table>
        </div>
        <div style={{ borderTop: "1px solid var(--divider)" }}><Pagination page={pg.page} pages={pg.pages} onPrev={pg.prev} onNext={pg.next} /></div>
      </div>
    </div>
  );
}

/* ---- full-page Create / Edit Leave Type form ---- */
function LeaveTypeForm({ initial, onBack, onSubmit }) {
  const editing = !!initial;
  const [form, setForm] = useLT(() => ({
    name: initial?.name || "", description: initial?.description || "", gender: initial?.gender || "",
    entitled: initial?.entitled || false, requiresDocs: initial?.requiresDocs || false, dependent: initial?.dependent || false,
    roles: initial?.roles || ["Head of HR"], emails: initial?.emails || [],
  }));
  const set = (k, v) => setForm(s => ({ ...s, [k]: v }));
  const setRole = (i, v) => setForm(s => ({ ...s, roles: s.roles.map((r, idx) => idx === i ? v : r) }));
  const valid = form.name.trim() !== "";
  const FieldLabel = ({ children }) => <label style={{ display: "block", fontFamily: "var(--font-head)", fontWeight: 500, fontSize: 14, color: "var(--gray-900)", marginBottom: 8 }}>{children}</label>;
  return (
    <div className="card" style={{ overflow: "visible", padding: "var(--card-pad, 24px)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 22 }}>
        <div>
          <div className="bh-h2" style={{ fontSize: 24 }}>{editing ? "Edit" : "Create"} Leave Type</div>
          <div className="bh-body" style={{ marginTop: 4 }}>{editing ? "Update an existing leave type" : "Add a new leave type to your organization"}</div>
        </div>
        <Button variant="stroke" icon="arrow-left-line" onClick={onBack}>Back</Button>
      </div>

      <div style={{ borderRadius: "var(--radius-lg)", padding: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div><FieldLabel>Leave Name</FieldLabel><Input placeholder="Eg. Maternity leave" value={form.name} onChange={e => set("name", e.target.value)} /></div>
          <div><FieldLabel>Description</FieldLabel><Textarea placeholder="Enter description" value={form.description} onChange={e => set("description", e.target.value)} /></div>
          <div style={{ maxWidth: 520 }}><FieldLabel>Gender</FieldLabel><Combobox value={form.gender} onChange={v => set("gender", v)} options={GENDER_OPTIONS} placeholder="Select a gender" /></div>

          <div>
            <FieldLabel>Leave Policies</FieldLabel>
            <div className="lt-policies">
              <Toggle checked={form.entitled} onChange={v => set("entitled", v)} label="Is Entitled" />
              <Toggle checked={form.requiresDocs} onChange={v => set("requiresDocs", v)} label="Requires a document" />
              <Toggle checked={form.dependent} onChange={v => set("dependent", v)} label="Dependent on another leave" />
            </div>
          </div>

          <div className="lt-approval">
            <div>
              <FieldLabel>Approval Role</FieldLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {form.roles.map((r, i) => (
                  <Combobox key={i} value={r} onChange={v => setRole(i, v)} options={APPROVAL_ROLES} placeholder="Select a role" />
                ))}
              </div>
              <button onClick={() => set("roles", [...form.roles, ""])} style={{ display: "inline-flex", alignItems: "center", gap: 6, border: 0, background: "none", cursor: "pointer",
                padding: 0, marginTop: 14, fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 14, color: "var(--brand-yellow-dark)" }}>
                <Icon name="add-line" size={18} color="var(--brand-yellow-dark)" />Add Another Role
              </button>
            </div>
            <div>
              <FieldLabel>Notify Department <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>(Department mails only)</span></FieldLabel>
              <TagInput value={form.emails} onChange={v => set("emails", v)} placeholder="eg. financedept@starret.com" />
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 22 }}>
        <Button variant="stroke" onClick={onBack}>Cancel</Button>
        <Button variant="primary" disabled={!valid} onClick={() => valid && onSubmit(form)}>{editing ? "Save Changes" : "Add Leave Type"}</Button>
      </div>
    </div>
  );
}

Object.assign(window, { Toggle, TagInput, RowMenu, LeaveTypesTable, LeaveTypeForm });
