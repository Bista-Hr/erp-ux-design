// BISTA HR · admin/RolesUsers — System Administration ▸ User Management.
//   RolesScreen : list + create/edit roles with a full permission matrix. Writes to
//                 the shared window.HRStores.rbac store, so new/edited roles appear
//                 instantly in the login picker and the top-bar role switcher.
//   UsersScreen : directory of users, each assigned a role (changeable inline).
// This is the "extensible roles & permissions" surface — the six defaults are seeds.

const { useState: useRU } = React;

const ROLE_COLORS = ["#375DFB", "#007839", "#7A5AF8", "#C2540A", "#0C7792", "#C11E39", "#525866", "#B54708"];
const ROLE_ICONS = ["shield-star-line", "user-settings-line", "briefcase-line", "team-line", "user-search-line", "shield-keyhole-line", "key-2-line", "group-line"];

function groupResources() {
  const out = [];
  const seen = {};
  for (const r of window.RBAC.resources) {
    if (!seen[r.group]) { seen[r.group] = { group: r.group, items: [] }; out.push(seen[r.group]); }
    seen[r.group].items.push(r);
  }
  return out;
}

// ---- small toggle pill for an action ----------------------------------------
function PermPill({ label, on, onClick, disabled }) {
  return (
    <button type="button" onClick={disabled ? undefined : onClick} style={{
      fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 12, padding: "5px 11px", borderRadius: 999,
      cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1,
      border: on ? "1px solid var(--brand-yellow-dark)" : "1px solid var(--border-strong)",
      background: on ? "var(--brand-yellow-tint)" : "#fff", color: on ? "var(--gray-900)" : "var(--gray-500)",
      display: "inline-flex", alignItems: "center", gap: 5, transition: "all .12s" }}>
      {on && <Icon name="check-line" size={13} color="var(--brand-yellow-dark)" />}{label}
    </button>
  );
}

// ---- role create / edit modal with permission matrix ------------------------
function RoleEditor({ mode, role, onClose, onSave }) {
  const [name, setName] = useRU(role ? role.name : "");
  const [description, setDescription] = useRU(role ? role.description : "");
  const [color, setColor] = useRU(role ? role.color : ROLE_COLORS[0]);
  const [icon, setIcon] = useRU(role ? role.icon : ROLE_ICONS[5]);
  const [perms, setPerms] = useRU(new Set(role ? role.permissions : []));
  const groups = groupResources();
  const isSystem = role && role.system;

  const has = (p) => perms.has(p);
  const toggle = (p) => setPerms(s => { const n = new Set(s); n.has(p) ? n.delete(p) : n.add(p); return n; });
  const setResource = (res, on) => setPerms(s => {
    const n = new Set(s);
    res.actions.forEach(a => { const p = `${res.key}:${a}`; on ? n.add(p) : n.delete(p); });
    return n;
  });
  const resAllOn = (res) => res.actions.every(a => has(`${res.key}:${a}`));
  const setGroup = (g, on) => setPerms(s => {
    const n = new Set(s);
    g.items.forEach(res => res.actions.forEach(a => { const p = `${res.key}:${a}`; on ? n.add(p) : n.delete(p); }));
    return n;
  });
  const groupCount = (g) => g.items.reduce((acc, res) => acc + res.actions.filter(a => has(`${res.key}:${a}`)).length, 0);

  const save = () => {
    const id = role ? role.id : (name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "role") + "-" + (Date.now() % 100000);
    onSave({ id, name: name.trim() || "Untitled Role", description: description.trim(), color, icon, permissions: [...perms], system: role ? role.system : false });
  };

  return (
    <Modal onClose={onClose} width={760}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "24px 24px 0" }}>
        <div>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 20, color: "var(--gray-900)" }}>{mode === "edit" ? "Edit Role" : "Create Role"}</div>
          <div className="bh-body" style={{ marginTop: 4 }}>Name the role and choose exactly what it can access.</div>
        </div>
        <button className="btn btn-icon btn-ghost" onClick={onClose} style={{ width: 32, height: 32, padding: 0 }}><Icon name="close-line" size={20} color="var(--gray-500)" /></button>
      </div>

      <div style={{ padding: "20px 24px 0", display: "flex", gap: 16 }}>
        <div style={{ flex: 1 }}>
          <Field label="Role Name"><Input placeholder="Eg. Payroll Officer" value={name} onChange={e => setName(e.target.value)} /></Field>
        </div>
        <div style={{ width: 200 }}>
          <Field label="Colour">
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", paddingTop: 4 }}>
              {ROLE_COLORS.map(c => (
                <button key={c} type="button" onClick={() => setColor(c)} aria-label={c} style={{
                  width: 26, height: 26, borderRadius: "50%", background: c, cursor: "pointer",
                  border: color === c ? "2px solid var(--gray-900)" : "2px solid #fff", boxShadow: "0 0 0 1px var(--border)" }} />
              ))}
            </div>
          </Field>
        </div>
      </div>
      <div style={{ padding: "0 24px" }}>
        <Field label="Description"><Input placeholder="What is this role for?" value={description} onChange={e => setDescription(e.target.value)} /></Field>
      </div>

      <div style={{ padding: "8px 24px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ fontFamily: "var(--font-control)", fontWeight: 500, fontSize: 14, color: "var(--gray-800)" }}>Permissions <span style={{ color: "var(--gray-400)" }}>· {perms.size} selected</span></div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setPerms(new Set(window.RBAC.allPerms))}>Select all</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setPerms(new Set())}>Clear</button>
          </div>
        </div>
        <div style={{ maxHeight: 320, overflowY: "auto", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)" }}>
          {groups.map((g, gi) => {
            const cnt = groupCount(g);
            const total = g.items.reduce((a, r) => a + r.actions.length, 0);
            return (
              <div key={g.group} style={{ borderTop: gi ? "1px solid var(--divider)" : 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", background: "var(--gray-50)" }}>
                  <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 12.5, letterSpacing: ".02em", textTransform: "uppercase", color: "var(--gray-500)" }}>{g.group}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontFamily: "var(--font-ui)", fontSize: 11.5, color: "var(--gray-400)" }}>{cnt}/{total}</span>
                    <button className="btn btn-ghost btn-sm" onClick={() => setGroup(g, cnt < total)}>{cnt < total ? "Enable all" : "Disable all"}</button>
                  </div>
                </div>
                {g.items.map(res => (
                  <div key={res.key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", borderTop: "1px solid var(--divider)" }}>
                    <button type="button" onClick={() => setResource(res, !resAllOn(res))} title="Toggle all" style={{
                      width: 18, height: 18, flexShrink: 0, borderRadius: 5, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center",
                      border: resAllOn(res) ? "0" : "1.5px solid var(--border-strong)", background: resAllOn(res) ? "var(--brand-yellow)" : "#fff" }}>
                      {resAllOn(res) && <Icon name="check-line" size={13} color="var(--brand-ink)" />}
                    </button>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 13.5, color: "var(--gray-900)" }}>{res.label}</div>
                      <div style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--gray-400)" }}>{res.key}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end", maxWidth: 360 }}>
                      {res.actions.map(a => <PermPill key={a} label={a} on={has(`${res.key}:${a}`)} onClick={() => toggle(`${res.key}:${a}`)} />)}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        {isSystem && <div style={{ marginTop: 10, fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--warning-deep)", display: "flex", alignItems: "center", gap: 6 }}><Icon name="information-line" size={15} color="var(--warning-deep)" />This is a system role — edits apply, but it can't be deleted.</div>}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: 24 }}>
        <Button variant="stroke" onClick={onClose}>Cancel</Button>
        <Button variant="primary" icon={mode === "edit" ? "check-line" : "add-line"} disabled={!name.trim()} onClick={save}>{mode === "edit" ? "Save Changes" : "Create Role"}</Button>
      </div>
    </Modal>
  );
}

function RolesScreen({ onToast, canCreate = true, canEdit = true, canDelete = true }) {
  const [rbac, setRbac] = useStore(window.HRStores.rbac);
  const [editor, setEditor] = useRU(null);
  const [confirm, setConfirm] = useRU(null);
  const [q, setQ] = useRU("");
  const roles = rbac.roles.filter(r => r.name.toLowerCase().includes(q.toLowerCase()));

  const saveRole = (role) => {
    const isEdit = rbac.roles.some(r => r.id === role.id);
    setRbac(s => ({ ...s, roles: isEdit ? s.roles.map(r => r.id === role.id ? role : r) : [...s.roles, role] }));
    onToast && onToast(`Role ${isEdit ? "Updated" : "Created"}`, { tone: "success" });
    setEditor(null);
  };
  const removeRole = (role) => {
    setRbac(s => ({ ...s, roles: s.roles.filter(r => r.id !== role.id), roleId: s.roleId === role.id ? "super-admin" : s.roleId }));
    onToast && onToast("Role Deleted", { tone: "error" });
    setConfirm(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title="Roles" subtitle="Define roles and the permissions each one grants. Changes apply across the app instantly."
        actions={canCreate && <Button variant="primary" icon="add-line" onClick={() => setEditor({ mode: "create", role: null })}>Create Role</Button>} />

      <div className="card" style={{ padding: 20 }}>
        <div className="bh-tablebox">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "16px 20px" }}>
          <div className="input-wrap" style={{ width: 280, padding: "8px 12px" }}>
            <Icon name="search-2-line" size={18} style={{ color: "var(--icon-default)" }} />
            <input placeholder="Search roles…" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--gray-500)" }}>{rbac.roles.length} roles</span>
        </div>
        <table className="bh">
          <thead><tr><th>Role</th><th>Description</th><th>Permissions</th><th>Type</th><th style={{ width: 48 }}></th></tr></thead>
          <tbody>
            {roles.map(r => (
              <tr key={r.id}>
                <td>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 30, height: 30, borderRadius: "50%", background: (r.color || "#375DFB") + "1f", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon name={r.icon || "shield-keyhole-line"} size={16} color={r.color || "#375DFB"} />
                    </span>
                    <span style={{ fontFamily: "var(--font-head)", fontWeight: 600, color: "var(--gray-900)" }}>{r.name}</span>
                  </span>
                </td>
                <td style={{ maxWidth: 360, color: "var(--gray-500)" }}>{r.description}</td>
                <td><span className="bh-chip">{(r.permissions || []).length}</span></td>
                <td><StatusBadge variant={r.system ? "info" : "completed"} text={r.system ? "System" : "Custom"} size="sm" /></td>
                <td style={{ position: "relative", textAlign: "right" }}>
                  <RoleRowMenu role={r} canEdit={canEdit} canDelete={canDelete && !r.system}
                    onEdit={() => setEditor({ mode: "edit", role: r })} onDelete={() => setConfirm(r)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {editor && <RoleEditor mode={editor.mode} role={editor.role} onClose={() => setEditor(null)} onSave={saveRole} />}
      {confirm && (
        <ConfirmModal title="Delete Role" message={`Are you sure you want to delete the "${confirm.name}" role? Users on this role will fall back to Super Admin.`}
          confirmLabel="Yes, Delete" confirmIcon="delete-bin-line" cancelLabel="Cancel" tone="error"
          onConfirm={() => removeRole(confirm)} onClose={() => setConfirm(null)} />
      )}
    </div>
  );
}

function RoleRowMenu({ role, canEdit, canDelete, onEdit, onDelete }) {
  const [open, setOpen] = useRU(false);
  if (!canEdit && !canDelete) return null;
  return (
    <React.Fragment>
      <button className="btn btn-icon btn-ghost" style={{ width: 28, height: 28, padding: 0 }} onClick={() => setOpen(o => !o)}>
        <Icon name="more-fill" size={18} color="var(--gray-400)" />
      </button>
      {open && (
        <div onMouseLeave={() => setOpen(false)} style={{ position: "absolute", right: 16, top: 40, zIndex: 20, background: "#fff", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-pop)", padding: 6, minWidth: 160, display: "flex", flexDirection: "column" }}>
          {canEdit && <button className="menu-item" onClick={() => { setOpen(false); onEdit(); }}><Icon name="edit-2-line" size={16} />Edit Role</button>}
          {canDelete && <button className="menu-item danger" onClick={() => { setOpen(false); onDelete(); }}><Icon name="delete-bin-line" size={16} />Delete Role</button>}
        </div>
      )}
    </React.Fragment>
  );
}

// ---- Users ------------------------------------------------------------------
const USERS_SEED = [
  { id: 1, name: "Leslie Alexandre", email: "leslie.alexandre@joesam.com", dept: "Human Resource", role: "super-admin", status: "Active" },
  { id: 2, name: "Emmanuel Ansah", email: "emmanuel.ansah@joesam.com", dept: "Human Resource", role: "hr-admin", status: "Active" },
  { id: 3, name: "Olivia Bennett", email: "olivia.bennett@joesam.com", dept: "Finance", role: "hrbp", status: "Active" },
  { id: 4, name: "Franklin Brobbey", email: "franklin.brobbey@joesam.com", dept: "Finance", role: "line-manager", status: "Active" },
  { id: 5, name: "Bright Manu", email: "bright.manu@joesam.com", dept: "Information Technology", role: "line-manager", status: "Active" },
  { id: 6, name: "Samuel Boateng", email: "samuel.boateng@joesam.com", dept: "Marketing", role: "recruiter", status: "Active" },
  { id: 7, name: "Phoenix Carter", email: "phoenix.carter@joesam.com", dept: "Finance", role: "employee", status: "Active" },
  { id: 8, name: "Ama Mensah", email: "ama.mensah@joesam.com", dept: "Support Services", role: "employee", status: "Active" },
  { id: 9, name: "Kofi Owusu", email: "kofi.owusu@joesam.com", dept: "Information Technology", role: "employee", status: "Invited" },
  { id: 10, name: "Demi Owusu", email: "demi.owusu@joesam.com", dept: "Human Resource", role: "hr-admin", status: "Active" },
];
window.HRStores.users = window.HRStores.users || makeStore(USERS_SEED);

function UsersScreen({ onToast, roles = [], canEdit = true }) {
  const [users, setUsers] = useStore(window.HRStores.users);
  const [q, setQ] = useRU("");
  const [openRole, setOpenRole] = useRU(null);
  const roleOf = (id) => roles.find(r => r.id === id) || { name: "—", color: "#868C98", icon: "user-3-line" };
  const shown = users.filter(u => u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()));
  const setRole = (uid, roleId) => {
    setUsers(list => list.map(u => u.id === uid ? { ...u, role: roleId } : u));
    setOpenRole(null);
    onToast && onToast("Role Assigned", { tone: "success" });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title="Users" subtitle="People with access to BISTA HR and the role assigned to each."
        actions={canEdit && <Button variant="primary" icon="user-add-line" onClick={() => onToast && onToast("Invite sent", { tone: "success" })}>Invite User</Button>} />
      <div className="card" style={{ padding: 20 }}>
        <div className="bh-tablebox">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "16px 20px" }}>
          <div className="input-wrap" style={{ width: 280, padding: "8px 12px" }}>
            <Icon name="search-2-line" size={18} style={{ color: "var(--icon-default)" }} />
            <input placeholder="Search users…" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--gray-500)" }}>{users.length} users</span>
        </div>
        <table className="bh">
          <thead><tr><th>User</th><th>Email</th><th>Department</th><th>Role</th><th>Status</th></tr></thead>
          <tbody>
            {shown.map(u => {
              const role = roleOf(u.role);
              return (
                <tr key={u.id}>
                  <td><span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Avatar name={u.name} size={28} />{u.name}</span></td>
                  <td style={{ color: "var(--gray-500)" }}>{u.email}</td>
                  <td>{u.dept}</td>
                  <td style={{ position: "relative" }}>
                    <button onClick={() => canEdit && setOpenRole(openRole === u.id ? null : u.id)} style={{
                      display: "inline-flex", alignItems: "center", gap: 7, border: "1px solid var(--border-strong)", background: "#fff",
                      borderRadius: 999, padding: "5px 10px 5px 8px", cursor: canEdit ? "pointer" : "default" }}>
                      <span style={{ width: 18, height: 18, borderRadius: "50%", background: (role.color) + "1f", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon name={role.icon} size={11} color={role.color} />
                      </span>
                      <span style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 12.5, color: "var(--gray-900)" }}>{role.name}</span>
                      {canEdit && <Icon name="arrow-down-s-line" size={15} color="var(--gray-400)" />}
                    </button>
                    {openRole === u.id && (
                      <div onMouseLeave={() => setOpenRole(null)} style={{ position: "absolute", left: 0, top: 40, zIndex: 30, background: "#fff", border: "1px solid var(--border)", borderRadius: 12, boxShadow: "var(--shadow-pop)", padding: 6, minWidth: 220, maxHeight: 280, overflowY: "auto" }}>
                        {roles.map(r => (
                          <button key={r.id} className="menu-item" onClick={() => setRole(u.id, r.id)} style={{ justifyContent: "flex-start" }}>
                            <span style={{ width: 18, height: 18, borderRadius: "50%", background: (r.color || "#375DFB") + "1f", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                              <Icon name={r.icon || "user-3-line"} size={11} color={r.color || "#375DFB"} />
                            </span>
                            {r.name}{r.id === u.role && <Icon name="check-line" size={15} color="var(--brand-yellow-dark)" style={{ marginLeft: "auto" }} />}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                  <td><StatusBadge variant={u.status === "Active" ? "active" : "pending"} text={u.status} size="sm" /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { RolesScreen, UsersScreen, RoleEditor });
