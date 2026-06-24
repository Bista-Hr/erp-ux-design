// BISTA HR · admin/RolesUsers — System Administration ▸ User Management.
// Ported 1:1 from the production app (components/configurations/user-management/*):
//   RolesScreen          : list (Role Name · Description · ⋯) + Add/Edit RoleFormModal
//                          (Name + Description + "Clone permissions from" on create) + a
//                          dedicated full-page ManagePermissions view (Permissions (Role)).
//   ManagePermissions    : groups → resource cards, per-resource Edit/Save, "Select all in
//                          this section", per-permission Switch. Writes to window.HRStores.rbac.
//   UsersScreen          : insights cards + role filter + search + table (Name · Email · Roles ·
//                          Action) + Edit UserFormModal (read-only name/email + change-email,
//                          multi-role MultiSelectCombobox, Active switch).
// Roles still feed the login picker + top-bar switcher, so a created role auto-gets a colour/icon
// (not surfaced in the form — the codebase has none) to keep those surfaces consistent.

const { useState: useRU, useEffect: useRUEffect } = React;

const ROLE_COLORS = ["#375DFB", "#007839", "#7A5AF8", "#C2540A", "#0C7792", "#C11E39", "#6941C6", "#B54708"];
const ROLE_ICONS = ["shield-keyhole-line", "user-settings-line", "briefcase-line", "team-line", "user-search-line", "key-2-line", "group-line", "shield-star-line"];
const pickColor = (n) => ROLE_COLORS[n % ROLE_COLORS.length];
const pickIcon = (n) => ROLE_ICONS[n % ROLE_ICONS.length];

/* ============================ ROLE CREATE / EDIT MODAL ============================ */
// Mirrors RoleFormModal.tsx: Role Name + Description (both required) + "Clone permissions
// from (optional)" — clone only shows on create and copies the chosen role's permissions.
function RoleFormModal({ mode, role, existingRoles, onClose, onSave }) {
  const editing = mode === "edit";
  const [name, setName] = useRU(role ? role.name : "");
  const [description, setDescription] = useRU(role ? role.description : "");
  const [cloneFrom, setCloneFrom] = useRU("__none__");
  const valid = name.trim() !== "" && description.trim() !== "";

  const cloneOptions = [{ value: "__none__", label: "None" }].concat(
    (existingRoles || []).map(r => ({ value: r.id, label: `${r.name}${(r.permissions || []).length ? ` (${r.permissions.length} permission${r.permissions.length !== 1 ? "s" : ""})` : ""}` }))
  );

  const submit = () => {
    if (!valid) return;
    onSave({ name: name.trim(), description: description.trim(), cloneFromRoleId: cloneFrom !== "__none__" ? cloneFrom : null });
  };

  return (
    <Modal onClose={onClose} width={600}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "24px 24px 0" }}>
        <div>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 20, lineHeight: "28px", color: "var(--gray-900)" }}>{editing ? "Edit Role" : "Add Role"}</div>
          <div className="bh-body" style={{ marginTop: 4 }}>{editing ? "Update this role's details" : "Create a new user role"}</div>
        </div>
        <button className="btn btn-icon btn-ghost" onClick={onClose} style={{ width: 32, height: 32, padding: 0 }}><Icon name="close-line" size={20} color="var(--gray-500)" /></button>
      </div>

      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
        <Field label="Role Name"><Input placeholder="Eg. Administrator" value={name} onChange={e => setName(e.target.value)} /></Field>
        <Field label="Description"><Textarea rows={4} placeholder="Describe what this role is for and which permissions it grants…" value={description} onChange={e => setDescription(e.target.value)} /></Field>
        {!editing && (existingRoles || []).length > 0 && (
          <Field label="Clone permissions from" optional>
            <Combobox value={cloneFrom} onChange={setCloneFrom} options={cloneOptions} placeholder="Select a role to copy its permissions…" />
          </Field>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: "0 24px 24px" }}>
        <Button variant="stroke" onClick={onClose}>Cancel</Button>
        <Button variant="primary" disabled={!valid} onClick={submit}>{editing ? "Update" : "Add"}</Button>
      </div>
    </Modal>
  );
}

/* ============================ MANAGE PERMISSIONS (full page) ============================ */
// Mirrors PermissionsForm.tsx: groups → resource cards; one resource editable at a time
// (Edit → Cancel/Save Changes), "Select all in this section", per-permission Switch.
function groupedResources() {
  const out = [];
  const seen = {};
  for (const r of window.RBAC.resources) {
    if (!seen[r.group]) { seen[r.group] = { groupName: r.group, resources: [] }; out.push(seen[r.group]); }
    seen[r.group].resources.push(r);
  }
  return out;
}

function ManagePermissions({ role, onSave, onToast }) {
  const [permIds, setPermIds] = useRU(() => new Set(role.permissions || []));
  const [editingRes, setEditingRes] = useRU(null);     // only one resource open at a time
  const [q, setQ] = useRU("");
  const modules = groupedResources();

  const permName = (res, action) => `${res.key}:${action}`;
  const has = (res, action) => permIds.has(permName(res, action));
  const toggle = (res, action) => setPermIds(s => { const n = new Set(s); const p = permName(res, action); n.has(p) ? n.delete(p) : n.add(p); return n; });
  const selectedInRes = (res) => res.actions.filter(a => has(res, a)).length;
  const allInRes = (res) => res.actions.length > 0 && selectedInRes(res) === res.actions.length;
  const toggleResAll = (res) => setPermIds(s => {
    const n = new Set(s); const on = allInRes(res);
    res.actions.forEach(a => { const p = permName(res, a); on ? n.delete(p) : n.add(p); });
    return n;
  });

  const save = () => {
    onSave([...permIds]);
    setEditingRes(null);
    onToast && onToast("Permissions Assigned", { tone: "success" });
  };
  const cancelEdit = () => { setPermIds(new Set(role.permissions || [])); setEditingRes(null); };

  const ql = q.trim().toLowerCase();
  const matchRes = (res) => !ql || res.label.toLowerCase().includes(ql) || res.group.toLowerCase().includes(ql) || res.actions.some(a => a.toLowerCase().includes(ql)) || res.key.toLowerCase().includes(ql);
  const shownModules = modules
    .map(m => ({ ...m, resources: m.resources.filter(matchRes) }))
    .filter(m => m.resources.length > 0 || (ql && m.groupName.toLowerCase().includes(ql)));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title={`Permissions (${role.name})`} subtitle="Manage permissions for this role." />
      <div className="input-wrap" style={{ width: 380, maxWidth: "100%", padding: "9px 12px" }}>
        <Icon name="search-2-line" size={18} style={{ color: "var(--icon-default)" }} />
        <input placeholder="Search permissions, modules, or features…" value={q} onChange={e => setQ(e.target.value)} />
      </div>

      {shownModules.map(m => (
        <div key={m.groupName} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 20, color: "var(--gray-900)" }}>{m.groupName}</div>
          {m.resources.map(res => {
            const open = editingRes === res.key;
            return (
              <div key={res.key} className="card" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px" }}>
                  <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 16, color: "var(--gray-900)" }}>{res.label}</div>
                  {open
                    ? <div style={{ display: "flex", gap: 10 }}>
                        <Button variant="stroke" size="sm" onClick={cancelEdit}>Cancel</Button>
                        <Button variant="primary" size="sm" onClick={save}>Save Changes</Button>
                      </div>
                    : <Button variant="ghost" size="sm" icon="edit-2-line" onClick={() => setEditingRes(res.key)}>Edit</Button>}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#FAFAFA", borderTop: "1px solid var(--divider)", borderBottom: "1px solid var(--divider)", fontFamily: "var(--font-control)", fontWeight: 500, fontSize: 13.5, color: "var(--gray-800)" }}>
                  <span>Modules &amp; Features</span>
                  {open && <Checkbox checked={allInRes(res)} onChange={() => toggleResAll(res)} label="Select all in this section" />}
                </div>
                <div style={{ opacity: open ? 1 : 0.55, pointerEvents: open ? "auto" : "none" }}>
                  {res.actions.map((a, i) => (
                    <div key={a} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderTop: i ? "1px solid var(--divider)" : 0 }}>
                      <span style={{ fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 14, color: "var(--gray-700)" }}>{a} {res.label}</span>
                      <UI.Switch checked={has(res, a)} onCheckedChange={() => toggle(res, a)} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ))}
      {shownModules.length === 0 && <EmptyState compact title="No permissions found" subtitle="No module or feature matches your search." />}
    </div>
  );
}

/* ============================ ROLES SCREEN ============================ */
function RolesScreen({ onToast, onSubPage, canCreate = true, canEdit = true, canDelete = true, canManage = true }) {
  const [rbac, setRbac] = useStore(window.HRStores.rbac);
  const [editor, setEditor] = useRU(null);             // { mode, role }
  const [confirm, setConfirm] = useRU(null);           // role pending delete
  const [q, setQ] = useRU("");
  const [view, setView] = useRU({ name: "list" });     // list | permissions
  const roles = rbac.roles.filter(r => r.name.toLowerCase().includes(q.toLowerCase()) || (r.description || "").toLowerCase().includes(q.toLowerCase()));
  const pg = usePaged(roles, 10);

  useRUEffect(() => {
    if (!onSubPage) return;
    if (view.name === "permissions") {
      const r = rbac.roles.find(x => x.id === view.id);
      onSubPage({ trail: [{ label: "Roles", onClick: () => setView({ name: "list" }) }, { label: `Permissions (${r ? r.name : ""})` }] });
    } else onSubPage(null);
    return () => onSubPage(null);
  }, [view, rbac.roles]);

  const saveRole = (data) => {
    if (editor.mode === "edit") {
      setRbac(s => ({ ...s, roles: s.roles.map(r => r.id === editor.role.id ? { ...r, name: data.name, description: data.description } : r) }));
      onToast && onToast("Role updated successfully", { tone: "success" });
    } else {
      const idx = rbac.roles.length;
      const id = (data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "role") + "-" + (Date.now() % 100000);
      const cloned = data.cloneFromRoleId ? (rbac.roles.find(r => r.id === data.cloneFromRoleId)?.permissions || []).slice() : [];
      const role = { id, name: data.name, description: data.description, color: pickColor(idx), icon: pickIcon(idx), permissions: cloned, system: false };
      setRbac(s => ({ ...s, roles: [...s.roles, role] }));
      onToast && onToast(cloned.length ? "Role created successfully with permissions copied." : "Role created successfully.", { tone: "success" });
    }
    setEditor(null);
  };
  const removeRole = (role) => {
    setRbac(s => ({ ...s, roles: s.roles.filter(r => r.id !== role.id), roleId: s.roleId === role.id ? "super-admin" : s.roleId }));
    onToast && onToast("Role archived successfully", { tone: "error" });
    setConfirm(null);
  };

  if (view.name === "permissions") {
    const role = rbac.roles.find(r => r.id === view.id);
    if (!role) { setView({ name: "list" }); return null; }
    return (
      <ManagePermissions role={role} onToast={onToast}
        onSave={(perms) => setRbac(s => ({ ...s, roles: s.roles.map(r => r.id === role.id ? { ...r, permissions: perms } : r) }))} />
    );
  }

  const rowActions = (r) => {
    const acts = [];
    if (canEdit) acts.push({ label: "Edit Role", short: "Edit", icon: "edit-2-line", onClick: () => setEditor({ mode: "edit", role: r }) });
    if (canManage) acts.push({ label: "Manage Permissions", short: "Permissions", icon: "shield-keyhole-line", onClick: () => setView({ name: "permissions", id: r.id }) });
    if (canDelete && !r.system) acts.push({ label: "Archive Role", short: "Archive", icon: "archive-line", danger: true, onClick: () => setConfirm(r) });
    return acts;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title="Roles" subtitle="Manage roles and permissions for users."
        actions={canCreate && <Button variant="primary" icon="add-line" onClick={() => setEditor({ mode: "create", role: null })}>Add Role</Button>} />

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "16px 20px", borderBottom: "1px solid var(--divider)" }}>
          <div className="input-wrap" style={{ width: 300, padding: "8px 12px" }}>
            <Icon name="search-2-line" size={18} style={{ color: "var(--icon-default)" }} />
            <input placeholder="Search roles…" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--gray-500)" }}>{rbac.roles.length} roles</span>
        </div>
        <table className="bh">
          <thead><tr><th>Role Name</th><th>Description</th><th style={{ width: 48 }}></th></tr></thead>
          <tbody>
            {pg.pageItems.map(r => (
              <tr key={r.id}>
                <td>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 30, height: 30, borderRadius: "50%", background: (r.color || "#375DFB") + "1f", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon name={r.icon || "shield-keyhole-line"} size={16} color={r.color || "#375DFB"} />
                    </span>
                    <span style={{ fontFamily: "var(--font-head)", fontWeight: 600, color: "var(--gray-900)" }}>{r.name}</span>
                  </span>
                </td>
                <td style={{ maxWidth: 460, color: "var(--gray-500)" }}>{r.description}</td>
                <td style={{ textAlign: "right" }}><UI.RowActions actions={rowActions(r)} forceMenu /></td>
              </tr>
            ))}
            {roles.length === 0 && <tr><td colSpan={3} style={{ padding: 0 }}><EmptyState compact title="No results found" subtitle="No role matches your search." /></td></tr>}
          </tbody>
        </table>
        {roles.length > 0 && <div style={{ borderTop: "1px solid var(--divider)" }}><Pagination page={pg.page} pages={pg.pages} onPrev={pg.prev} onNext={pg.next} /></div>}
      </div>

      {editor && <RoleFormModal mode={editor.mode} role={editor.role} existingRoles={rbac.roles} onClose={() => setEditor(null)} onSave={saveRole} />}
      {confirm && (
        <ConfirmModal title="Archive Role" message={`Are you sure you want to archive "${confirm.name}"? This action cannot be undone.`}
          confirmLabel="Yes, Archive" confirmIcon="archive-line" cancelLabel="Cancel" tone="error"
          onConfirm={() => removeRole(confirm)} onClose={() => setConfirm(null)} />
      )}
    </div>
  );
}

/* ============================ USERS ============================ */
const USERS_SEED = [
  { id: 1, name: "Leslie Alexandre", email: "leslie.alexandre@joesam.com", dept: "Human Resource", roleIds: ["super-admin"], isActive: true },
  { id: 2, name: "Emmanuel Ansah", email: "emmanuel.ansah@joesam.com", dept: "Human Resource", roleIds: ["hr-admin"], isActive: true },
  { id: 3, name: "Olivia Bennett", email: "olivia.bennett@joesam.com", dept: "Finance", roleIds: ["hrbp", "line-manager"], isActive: true },
  { id: 4, name: "Franklin Brobbey", email: "franklin.brobbey@joesam.com", dept: "Finance", roleIds: ["line-manager"], isActive: true },
  { id: 5, name: "Bright Manu", email: "bright.manu@joesam.com", dept: "Information Technology", roleIds: ["line-manager"], isActive: true },
  { id: 6, name: "Samuel Boateng", email: "samuel.boateng@joesam.com", dept: "Marketing", roleIds: ["recruiter"], isActive: true },
  { id: 7, name: "Phoenix Carter", email: "phoenix.carter@joesam.com", dept: "Finance", roleIds: ["employee"], isActive: true },
  { id: 8, name: "Ama Mensah", email: "ama.mensah@joesam.com", dept: "Support Services", roleIds: ["employee"], isActive: true },
  { id: 9, name: "Kofi Owusu", email: "kofi.owusu@joesam.com", dept: "Information Technology", roleIds: ["employee"], isActive: false },
  { id: 10, name: "Demi Owusu", email: "demi.owusu@joesam.com", dept: "Human Resource", roleIds: ["hr-admin", "ld-admin"], isActive: true },
  { id: 11, name: "Grace Adjei", email: "grace.adjei@joesam.com", dept: "Marketing", roleIds: ["ld-admin"], isActive: true },
  { id: 12, name: "Daniel Quaye", email: "daniel.quaye@joesam.com", dept: "Information Technology", roleIds: ["employee"], isActive: true },
];
window.HRStores.users = window.HRStores.users || makeStore(USERS_SEED);

// ---- User insights (3 cards + dialogs) — mirrors UserInsightsCards.tsx, seeded with demo data ----
const LOGIN_ISSUES_SEED = [
  { email: "kofi.owusu@joesam.com", failCount: 5, lastError: "Invalid password", lastAttemptAt: "24 Jun 2026 08:14" },
  { email: "j.doe@joesam.com", failCount: 3, lastError: "Account locked after 3 attempts", lastAttemptAt: "23 Jun 2026 17:42" },
  { email: "test.user@joesam.com", failCount: 2, lastError: "User not found", lastAttemptAt: "22 Jun 2026 11:05" },
];
const DUPLICATE_GROUPS_SEED = [
  { email: "a.mensah@joesam.com", users: [
    { id: "usr_8841", fullName: "Ama Mensah", email: "a.mensah@joesam.com" },
    { id: "usr_9123", fullName: "Ama Mensah (import)", email: "a.mensah@joesam.com" },
  ] },
];

function InsightDialog({ title, onClose, children }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 120, background: "rgba(16,24,40,.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-pop)", width: 680, maxWidth: "100%", maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid var(--divider)" }}>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 16, color: "var(--gray-900)" }}>{title}</div>
          <button className="btn btn-icon btn-ghost" onClick={onClose} style={{ width: 32, height: 32, padding: 0 }}><Icon name="close-line" size={20} color="var(--gray-500)" /></button>
        </div>
        <div style={{ padding: 24, overflowY: "auto" }}>{children}</div>
      </div>
    </div>
  );
}

function UserInsightsCards() {
  const [dialog, setDialog] = useRU(null);   // "login" | "dups" | null
  const [dups, setDups] = useRU(DUPLICATE_GROUPS_SEED);
  const [checking, setChecking] = useRU(false);
  const card = { borderRadius: "var(--radius-md)", padding: "14px 16px", border: "1px solid" };
  const recheck = () => { setChecking(true); setTimeout(() => setChecking(false), 900); };

  return (
    <React.Fragment>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
        {/* Login Issues */}
        <button onClick={() => setDialog("login")} style={{ ...card, textAlign: "left", cursor: "pointer", background: "#FEF3F2", borderColor: "#FECDCA" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--font-ui)", fontSize: 12.5, fontWeight: 500, color: "var(--gray-500)" }}><Icon name="error-warning-line" size={14} color="#F04438" />Login Issues</span>
            <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "#F04438" }}>View →</span>
          </div>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 26, color: "var(--gray-900)", marginTop: 6 }}>{LOGIN_ISSUES_SEED.length}</div>
          <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-400)" }}>users with failed attempts</div>
        </button>
        {/* Successful Logins */}
        <div style={{ ...card, background: "#ECFDF3", borderColor: "#ABEFC6" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--font-ui)", fontSize: 12.5, fontWeight: 500, color: "var(--gray-500)" }}><Icon name="checkbox-circle-line" size={14} color="#12B76A" />Successful Logins</span>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 26, color: "var(--gray-900)", marginTop: 6 }}>1,240</div>
          <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-400)" }}>in the last 30 days</div>
        </div>
        {/* Duplicate Users */}
        <div style={{ ...card, background: "var(--gray-50)", borderColor: "var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--font-ui)", fontSize: 12.5, fontWeight: 500, color: "var(--gray-500)" }}><Icon name="group-line" size={14} color="var(--gray-500)" />Duplicate Users</span>
            <button className="btn btn-icon btn-ghost" onClick={recheck} title="Refresh duplicate count" style={{ width: 24, height: 24, padding: 0 }}><Icon name="refresh-line" size={14} color="var(--gray-400)" /></button>
          </div>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 26, color: "var(--gray-900)", marginTop: 6 }}>{checking ? "…" : dups.length}</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-400)" }}>duplicate email groups</span>
            {dups.length > 0 && <button onClick={() => setDialog("dups")} style={{ border: 0, background: "none", cursor: "pointer", padding: 0, fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--brand-yellow-dark)" }}>View →</button>}
          </div>
        </div>
      </div>

      {dialog === "login" && (
        <InsightDialog title="Users with Login Issues" onClose={() => setDialog(null)}>
          <table className="bh">
            <thead><tr><th>Email</th><th style={{ textAlign: "center" }}>Fails</th><th>Last Error</th><th>Last Attempt</th></tr></thead>
            <tbody>{LOGIN_ISSUES_SEED.map(it => (
              <tr key={it.email}>
                <td style={{ fontWeight: 500, color: "var(--gray-800)" }}>{it.email}</td>
                <td style={{ textAlign: "center" }}><span style={{ display: "inline-block", background: "#FEE4E2", color: "#B42318", fontWeight: 600, fontSize: 12, borderRadius: 999, padding: "2px 9px" }}>{it.failCount}</span></td>
                <td style={{ color: "var(--gray-500)" }}>{it.lastError}</td>
                <td style={{ color: "var(--gray-400)", whiteSpace: "nowrap" }}>{it.lastAttemptAt}</td>
              </tr>
            ))}</tbody>
          </table>
        </InsightDialog>
      )}
      {dialog === "dups" && (
        <InsightDialog title="Duplicate Email Groups" onClose={() => setDialog(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {dups.map(g => (
              <div key={g.email} style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 14, color: "var(--gray-700)" }}>{g.email}</span>
                  <button onClick={() => { setDups(d => d.filter(x => x.email !== g.email)); }} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--brand-yellow-dark)", border: "1px solid var(--brand-yellow)", borderRadius: 6, padding: "3px 8px", background: "var(--brand-yellow-tint)", cursor: "pointer" }}><Icon name="tools-line" size={12} color="var(--brand-yellow-dark)" />Quick Fix</button>
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                  {g.users.map(u => (
                    <li key={u.id} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-ui)", fontSize: 13.5, color: "var(--gray-600)" }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--gray-400)" }} />
                      <span style={{ fontWeight: 500 }}>{u.fullName}</span>
                      <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 11, color: "var(--gray-400)" }}>{u.id}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {dups.length === 0 && <div style={{ textAlign: "center", color: "var(--gray-400)", fontSize: 14, padding: "24px 0" }}>No duplicate users found.</div>}
          </div>
        </InsightDialog>
      )}
    </React.Fragment>
  );
}

// ---- Edit User modal — mirrors UserFormModal.tsx ----
function UserFormModal({ user, roleOptions, onClose, onSubmit, onChangeEmail }) {
  const [roleIds, setRoleIds] = useRU(user.roleIds || []);
  const [isActive, setIsActive] = useRU(!!user.isActive);
  const [emailEdit, setEmailEdit] = useRU(false);
  const [newEmail, setNewEmail] = useRU("");
  const [err, setErr] = useRU("");
  const valid = roleIds.length > 0;
  const isEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

  const changeEmail = () => {
    const t = newEmail.trim();
    if (!t || !isEmail(t)) { setErr(t ? "Enter a valid email address." : "Enter a new email address."); return; }
    if (t === user.email) { setErr("New email must be different from the current one."); return; }
    setErr(""); onChangeEmail(t); setEmailEdit(false); setNewEmail("");
  };

  return (
    <Modal onClose={onClose} width={600}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "24px 24px 0" }}>
        <div>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 20, lineHeight: "28px", color: "var(--gray-900)" }}>Edit User</div>
          <div className="bh-body" style={{ marginTop: 4 }}>Update user role and status.</div>
        </div>
        <button className="btn btn-icon btn-ghost" onClick={onClose} style={{ width: 32, height: 32, padding: 0 }}><Icon name="close-line" size={20} color="var(--gray-500)" /></button>
      </div>

      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
        <Field label="Full Name">
          <div className="input-wrap" style={{ background: "var(--gray-50)" }}><input value={user.name} readOnly disabled style={{ color: "var(--gray-600)" }} /></div>
        </Field>
        <Field label="Email">
          <div style={{ display: "flex", gap: 8 }}>
            <div className="input-wrap" style={{ flex: 1, background: "var(--gray-50)" }}><input value={user.email} readOnly disabled style={{ color: "var(--gray-600)" }} /></div>
            <button className="btn btn-icon btn-stroke" title="Change email" onClick={() => { setEmailEdit(v => !v); setNewEmail(""); setErr(""); }} style={{ width: 38, height: 38, padding: 0, flexShrink: 0 }}><Icon name="pencil-line" size={16} color="var(--gray-600)" /></button>
          </div>
          {emailEdit && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 10, marginTop: 10, borderTop: "1px solid var(--divider)" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                <div className="input-wrap" style={{ flex: 1 }}><input placeholder="New email address" value={newEmail} onChange={e => { setNewEmail(e.target.value); setErr(""); }} onKeyDown={e => e.key === "Enter" && changeEmail()} /></div>
                <Button variant="primary" disabled={!newEmail.trim()} onClick={changeEmail}>Change email</Button>
              </div>
              {err && <div style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--error)" }}>{err}</div>}
            </div>
          )}
        </Field>
        <Field label="Roles"><MultiSelectCombobox value={roleIds} onChange={setRoleIds} options={roleOptions} placeholder="Select roles" noDataText="No roles found." /></Field>
        <Field label="Status">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <UI.Switch checked={isActive} onCheckedChange={setIsActive} />
            <span style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--gray-700)" }}>{isActive ? "Active" : "Inactive"}</span>
          </div>
        </Field>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: "0 24px 24px" }}>
        <Button variant="stroke" onClick={onClose}>Cancel</Button>
        <Button variant="primary" disabled={!valid} onClick={() => valid && onSubmit({ roleIds, isActive })}>Update</Button>
      </div>
    </Modal>
  );
}

function UsersScreen({ onToast, roles = [], canEdit = true }) {
  const [users, setUsers] = useStore(window.HRStores.users);
  const [q, setQ] = useRU("");
  const [roleFilter, setRoleFilter] = useRU("all");
  const [edit, setEdit] = useRU(null);    // user being edited
  const roleOptions = roles.map(r => ({ value: r.id, label: r.name }));
  const roleName = (id) => (roles.find(r => r.id === id) || {}).name || id;

  const shown = users.filter(u =>
    (roleFilter === "all" || (u.roleIds || []).includes(roleFilter)) &&
    (u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()))
  );
  const pg = usePaged(shown, 10);

  const submit = ({ roleIds, isActive }) => {
    setUsers(list => list.map(u => u.id === edit.id ? { ...u, roleIds, isActive } : u));
    setEdit(null);
    onToast && onToast("User updated successfully", { tone: "success" });
  };
  const changeEmail = (uid, email) => {
    setUsers(list => list.map(u => u.id === uid ? { ...u, email } : u));
    setEdit(e => e && e.id === uid ? { ...e, email } : e);
    onToast && onToast("Email updated successfully", { tone: "success" });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title="Users" subtitle="Manage users and their access." />

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {/* insights cards */}
        <div style={{ padding: 20, borderBottom: "1px solid var(--divider)" }}><UserInsightsCards /></div>

        {/* toolbar — role filter + search (right-aligned) */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "flex-end", gap: 16, padding: "16px 20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 200 }}>
            <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--gray-500)" }}>Filter by role</span>
            <Combobox value={roleFilter} onChange={setRoleFilter} options={[{ value: "all", label: "All roles" }].concat(roleOptions)} placeholder="All roles" />
          </div>
          <div className="input-wrap" style={{ width: 280, padding: "8px 12px" }}>
            <Icon name="search-2-line" size={18} style={{ color: "var(--icon-default)" }} />
            <input placeholder="Search…" value={q} onChange={e => setQ(e.target.value)} />
          </div>
        </div>

        <table className="bh">
          <thead><tr><th>Name</th><th>Email</th><th>Roles</th><th style={{ textAlign: "right" }}>Action</th></tr></thead>
          <tbody>
            {pg.pageItems.map(u => (
              <tr key={u.id}>
                <td><span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}><Avatar name={u.name} size={32} /><span style={{ fontWeight: 500, color: "var(--gray-900)" }}>{u.name}</span></span></td>
                <td style={{ color: "var(--gray-500)" }}>{u.email}</td>
                <td>
                  <span style={{ display: "inline-flex", flexWrap: "wrap", gap: 6 }}>
                    {(u.roleIds || []).length
                      ? (u.roleIds || []).map(id => <span key={id} className="bh-chip" style={{ background: "var(--gray-100)", color: "var(--gray-700)" }}>{roleName(id)}</span>)
                      : <span style={{ color: "var(--gray-400)", fontSize: 12 }}>No role</span>}
                  </span>
                </td>
                <td style={{ textAlign: "right" }}>
                  {canEdit && <button className="btn btn-icon btn-ghost" title="Edit user" onClick={() => setEdit(u)} style={{ width: 32, height: 32, padding: 0 }}><Icon name="pencil-line" size={16} color="var(--gray-500)" /></button>}
                </td>
              </tr>
            ))}
            {shown.length === 0 && <tr><td colSpan={4} style={{ padding: 0 }}><EmptyState compact title="No users found" subtitle="No user matches your filters." /></td></tr>}
          </tbody>
        </table>
        {shown.length > 0 && <div style={{ borderTop: "1px solid var(--divider)" }}><Pagination page={pg.page} pages={pg.pages} onPrev={pg.prev} onNext={pg.next} /></div>}
      </div>

      {edit && <UserFormModal user={edit} roleOptions={roleOptions} onClose={() => setEdit(null)} onSubmit={submit} onChangeEmail={(email) => changeEmail(edit.id, email)} />}
    </div>
  );
}

Object.assign(window, { RolesScreen, UsersScreen });
