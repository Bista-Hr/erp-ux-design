// BISTA HR · crud/CrudScreen — list page: header (title + primary action) inside an
// outer card, with a bordered inner container wrapping toolbar + table + pagination.
// Row "⋯" opens an action menu (Edit / Archive). Empty data AND no-search-results both
// use the shared <EmptyState> (one canonical illustration across the project).

function CrudScreen({ config, rows, onCreate, onEdit, onArchive, onMenuAction, canCreate = true, canEdit = true, canArchive = true }) {
  const hasRowMenu = canEdit || canArchive || (config.menu || []).length > 0;
  const [filter, setFilter] = useState("All");
  const [q, setQ] = useState("");
  const [menu, setMenu] = useState(null);
  const shown = rows.filter(r =>
    (filter === "All" || (filter === "Active" ? r.active : !r.active)) &&
    (q === "" || String(r[config.cols[0].key]).toLowerCase().includes(q.toLowerCase()))
  );
  const pg = usePaged(shown);
  return (
    <div className="card" style={{ overflow: "visible", padding: "var(--card-pad, 24px)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
        <div>
          <div className="bh-h2" style={{ fontSize: 24 }}>{config.title}</div>
          <div className="bh-body" style={{ marginTop: 4 }}>{config.subtitle}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {config.headerAction && (
            <Button variant="stroke" icon={config.headerAction.icon}
              onClick={() => onMenuAction && onMenuAction(config.headerAction.key)}>{config.headerAction.label}</Button>
          )}
          {canCreate && <Button variant="primary" icon="add-line" onClick={onCreate}>{config.cta}</Button>}
        </div>
      </div>

      <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "16px 20px" }}>
          {config.hideSegment
            ? <div className="input-wrap" style={{ width: 280, padding: "8px 12px" }}>
                <Icon name="search-2-line" size={18} style={{ color: "var(--icon-default)" }} />
                <input placeholder="Search…" value={q} onChange={e => setQ(e.target.value)} />
              </div>
            : <Segmented items={["All", "Active", "Inactive"]} active={filter} onChange={setFilter} />}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {!config.hideSegment && (
              <div className="input-wrap" style={{ width: 280, padding: "8px 12px" }}>
                <Icon name="search-2-line" size={18} style={{ color: "var(--icon-default)" }} />
                <input placeholder="Search…" value={q} onChange={e => setQ(e.target.value)} />
              </div>
            )}
            <Button variant="stroke" size="sm" icon="equalizer-line">Show Filter</Button>
          </div>
        </div>

        {rows.length === 0
          ? <EmptyState title="Nothing here yet" subtitle={canCreate ? `Get started by adding your first ${config.noun.toLowerCase()}.` : `There is no data to show you right now.`} cta={canCreate ? config.cta : null} onAction={canCreate ? onCreate : null} />
          : <React.Fragment>
            <table className="bh">
              <thead><tr>
                {config.cols.map(c => <th key={c.key}>{c.label}</th>)}
                {!config.hideStatus && <th>Status</th>}{hasRowMenu && <th style={{ width: 48 }}></th>}
              </tr></thead>
              <tbody>
                {pg.pageItems.map(r => (
                  <tr key={r.id}>
                    {config.cols.map(c => (
                      <td key={c.key}>
                        {c.type === "avatar"
                          ? <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Avatar name={r[c.key]} size={28} />{r[c.key]}</span>
                          : c.type === "badge"
                            ? <StatusBadge variant={String(r[c.key] || "").toLowerCase()} text={r[c.key]} size="sm" />
                            : r[c.key]}
                      </td>
                    ))}
                    {!config.hideStatus && <td><StatusDot active={r.active} /></td>}
                    {hasRowMenu && <td style={{ position: "relative", textAlign: "right" }}>
                      <button className="btn btn-icon btn-ghost" style={{ width: 28, height: 28, padding: 0 }}
                        onClick={() => setMenu(menu === r.id ? null : r.id)}>
                        <Icon name="more-fill" size={18} color="var(--gray-400)" />
                      </button>
                      {menu === r.id && (
                        <div onMouseLeave={() => setMenu(null)} style={{ position: "absolute", right: 16, top: 40, zIndex: 20,
                          background: "#fff", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-pop)",
                          padding: 6, minWidth: 170, display: "flex", flexDirection: "column" }}>
                          {canEdit && <button className="menu-item" onClick={() => { setMenu(null); onEdit(r); }}><Icon name="edit-2-line" size={16} />Edit {config.noun}</button>}
                          {(config.menu || []).map(m => (
                            <button key={m.key} className="menu-item" onClick={() => { setMenu(null); onMenuAction && onMenuAction(m.key, r); }}><Icon name={m.icon} size={16} />{m.label}</button>
                          ))}
                          {canArchive && <button className="menu-item danger" onClick={() => { setMenu(null); onArchive(r); }}><Icon name="archive-line" size={16} />Archive {config.noun}</button>}
                        </div>
                      )}
                    </td>}
                  </tr>
                ))}
                {shown.length === 0 && (
                  <tr><td colSpan={config.cols.length + (config.hideStatus ? 0 : 1) + (hasRowMenu ? 1 : 0)} style={{ padding: 0 }}>
                    <EmptyState compact title="No results found" subtitle={`No ${config.noun.toLowerCase()} matches your search.`} />
                  </td></tr>
                )}
              </tbody>
            </table>
            <div style={{ borderTop: "1px solid var(--divider)" }}><Pagination page={pg.page} pages={pg.pages} onPrev={pg.prev} onNext={pg.next} /></div>
          </React.Fragment>}
      </div>
    </div>
  );
}

/* analytics / info modules (Dashboard, Reports) — not list screens */
function InfoPage({ title }) {
  return (
    <div className="card" style={{ padding: 72, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center" }}>
      <div style={{ width: 88, height: 88, borderRadius: "50%", background: "var(--brand-yellow-tint)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name="bar-chart-box-line" size={38} color="var(--brand-yellow-dark)" />
      </div>
      <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 18, color: "var(--gray-900)", marginTop: 6 }}>{title}</div>
      <div className="bh-body" style={{ maxWidth: 380 }}>Analytics and insights for {title.toLowerCase()} live here. This view is part of the BISTA HR dashboard experience.</div>
    </div>
  );
}

/* Organizational Tree — read-only hierarchy view (opened from "View Organizational Tree").
   Reads the same Organizational Units data; indents each node by its hierarchy level. */
function OrgTreeModal({ units = [], onClose }) {
  const sorted = [...units].sort((a, b) => (Number(a.level) || 0) - (Number(b.level) || 0) || String(a.name).localeCompare(String(b.name)));
  return (
    <Modal onClose={onClose} width={560}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "24px 24px 0" }}>
        <div>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 20, color: "var(--gray-900)" }}>Organizational Tree</div>
          <div className="bh-body" style={{ marginTop: 4 }}>Your organization's structure and hierarchy</div>
        </div>
        <button className="btn btn-icon btn-ghost" onClick={onClose} style={{ width: 32, height: 32, padding: 0 }}><Icon name="close-line" size={20} color="var(--gray-500)" /></button>
      </div>
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 8 }}>
        {sorted.length === 0
          ? <EmptyState compact title="No units yet" subtitle="Create a unit to see the hierarchy." />
          : sorted.map(u => {
            const depth = Math.max(0, (Number(u.level) || 1) - 1);
            const isMgmt = u.type === "Management";
            return (
              <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: depth * 28,
                padding: "12px 14px", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", background: "#fff" }}>
                <Icon name={depth === 0 ? "building-4-line" : "node-tree"} size={18} color="var(--gray-500)" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 14, color: "var(--gray-900)" }}>{u.name}</div>
                  <div className="bh-caption">{u.head}</div>
                </div>
                <span style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 12, padding: "3px 8px", borderRadius: 6,
                  background: isMgmt ? "var(--brand-yellow-tint)" : "var(--gray-100)", color: "var(--gray-700)" }}>{u.type}</span>
              </div>
            );
          })}
      </div>
    </Modal>
  );
}

/* /forbidden — shown when the current role lacks access to a hard-navigated page */
function ForbiddenScreen({ onHome }) {
  return (
    <div className="card" style={{ padding: 72, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center" }}>
      <div style={{ width: 88, height: 88, borderRadius: "50%", background: "var(--error-tint)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name="lock-2-line" size={38} color="var(--error)" />
      </div>
      <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 20, color: "var(--gray-900)", marginTop: 6 }}>Access Denied</div>
      <div className="bh-body" style={{ maxWidth: 420 }}>You don't have permission to view this page with your current role. Switch roles from the top bar, or contact your administrator.</div>
      {onHome && <Button variant="primary" icon="home-4-line" onClick={onHome}>Go to Dashboard</Button>}
    </div>
  );
}

Object.assign(window, { CrudScreen, InfoPage, OrgTreeModal, ForbiddenScreen });
