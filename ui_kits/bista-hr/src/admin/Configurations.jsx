// BISTA HR · admin/Configurations — System Administration ▸ Configuration custom screens.
//   CompetenciesScreen : list → full-page Add/Edit (with 4 competency levels + traits)
//                        + a "Performance Rankings" sub-page (reached via "View Ranking
//                        Descriptions"). Every create / edit / archive / save routes through
//                        a ConfirmModal, then a success/error toast — same pattern as the
//                        rest of the app. Perspectives, Periods and Employee Goals are plain
//                        CrudScreen configs; only these two views need bespoke layouts.
const { useState: useCfg, useEffect: useCfgEffect } = React;

const COMP_LEVELS = [
  { key: "Apprentice", label: "Level 1 (Apprentice)" },
  { key: "Developing", label: "Level 2 (Developing)" },
  { key: "Competent",  label: "Level 3 (Competent)" },
  { key: "Mastery",    label: "Level 4 (Mastery)" },
];
let CFG_SEQ = 900;
const cfgId = () => ++CFG_SEQ;
const emptyLevels = () => COMP_LEVELS.reduce((a, l) => (a[l.key] = [], a), {});
const traitCount = (levels) => COMP_LEVELS.reduce((n, l) => n + (levels[l.key] ? levels[l.key].length : 0), 0);

const mkTrait = (text) => ({ id: cfgId(), text });
const COMPETENCY_SEED = [
  { id: 1, name: "Strategic Leadership Execution", description: "Customer satisfaction and service excellence",
    levels: { Apprentice: [mkTrait("Understands team goals and priorities"), mkTrait("Follows direction with guidance")],
      Developing: [mkTrait("Coordinates small team tasks independently")], Competent: [mkTrait("Leads cross-functional initiatives")], Mastery: [] } },
  { id: 2, name: "Performance Data Appraisal and Analytics", description: "Revenue growth and cost management",
    levels: { Apprentice: [mkTrait("Reads standard performance reports")], Developing: [], Competent: [], Mastery: [] } },
  { id: 3, name: "Patient Safety", description: "Employee development and innovation",
    levels: { Apprentice: [mkTrait("Knows core safety protocols")], Developing: [mkTrait("Applies protocols under supervision")], Competent: [], Mastery: [] } },
];

const RANKING_SEED = [
  { id: 1, name: "Outstanding", max: "100", min: "90", color: "#1F8A5B" },
  { id: 2, name: "Very Good", max: "89", min: "75", color: "#2A6FDB" },
  { id: 3, name: "Good", max: "74", min: "60", color: "#F08C25" },
  { id: 4, name: "Above Average", max: "59", min: "40", color: "#8B5CF6" },
  { id: 5, name: "Below Average", max: "39", min: "0", color: "#D5503A" },
];
const RANKING_SWATCHES = ["#1F8A5B", "#2A6FDB", "#F08C25", "#8B5CF6", "#D5503A", "#0EA5A5", "#E11D8F", "#525866"];

/* ---------- color cell + popover ---------- */
function ColorCell({ value, onChange }) {
  const [open, setOpen] = useCfg(false);
  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)} style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid var(--border)",
        borderRadius: "var(--radius-sm)", background: "#fff", padding: "6px 10px", cursor: "pointer", fontFamily: "var(--font-control)", fontSize: 13, color: "var(--gray-700)" }}>
        <span style={{ width: 18, height: 18, borderRadius: 5, background: value }} />
        <span style={{ textTransform: "uppercase" }}>{value}</span>
      </button>
      {open && (
        <React.Fragment>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 30 }} />
          <div style={{ position: "absolute", top: 40, left: 0, zIndex: 31, background: "#fff", border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-pop)", padding: 12, width: 196 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 10 }}>
              {RANKING_SWATCHES.map(c => (
                <button key={c} onClick={() => { onChange(c); setOpen(false); }} title={c}
                  style={{ width: 32, height: 32, borderRadius: 8, background: c, border: value === c ? "2px solid var(--gray-900)" : "2px solid transparent", cursor: "pointer" }} />
              ))}
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-500)" }}>
              Custom
              <input type="color" value={value} onChange={e => onChange(e.target.value)} style={{ width: 32, height: 24, border: 0, background: "none", cursor: "pointer" }} />
            </label>
          </div>
        </React.Fragment>
      )}
    </div>
  );
}

/* ---------- competency add / edit (full page) ---------- */
function CompetencyForm({ initial, onCancel, onSubmit }) {
  const editing = !!initial;
  const [name, setName] = useCfg(initial?.name || "");
  const [description, setDescription] = useCfg(initial?.description || "");
  const [levels, setLevels] = useCfg(() => {
    const base = emptyLevels();
    if (initial) COMP_LEVELS.forEach(l => base[l.key] = (initial.levels[l.key] || []).map(t => ({ ...t })));
    return base;
  });
  const addTrait = (k) => setLevels(s => ({ ...s, [k]: [...s[k], mkTrait("")] }));
  const setTrait = (k, id, text) => setLevels(s => ({ ...s, [k]: s[k].map(t => t.id === id ? { ...t, text } : t) }));
  const delTrait = (k, id) => setLevels(s => ({ ...s, [k]: s[k].filter(t => t.id !== id) }));
  const valid = name.trim() !== "";

  return (
    <div className="card" style={{ padding: "var(--card-pad, 24px)" }}>
      <div style={{ marginBottom: 20 }}>
        <div className="bh-h2" style={{ fontSize: 24 }}>{editing ? "Edit Competency" : "Add Competency"}</div>
        <div className="bh-body" style={{ marginTop: 4 }}>{editing ? "Update competency definition" : "Define a new competency for performance assessments"}</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 720 }}>
        <Field label="Competency Name"><Input placeholder="Eg. Strategic Leadership" value={name} onChange={e => setName(e.target.value)} /></Field>
        <Field label="Description"><Textarea placeholder="Describe what this competency evaluates" value={description} onChange={e => setDescription(e.target.value)} /></Field>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 24 }}>
        {COMP_LEVELS.map(l => (
          <div key={l.key} style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 15, color: "var(--gray-900)" }}>{l.label}</div>
              <Button variant="stroke" size="sm" icon="add-line" onClick={() => addTrait(l.key)}>Add Trait</Button>
            </div>
            {levels[l.key].length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
                {levels[l.key].map(t => (
                  <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="input-wrap" style={{ flex: 1 }}>
                      <input placeholder="Describe the behaviour or trait for this level" value={t.text} onChange={e => setTrait(l.key, t.id, e.target.value)} />
                    </div>
                    <button className="btn btn-icon btn-ghost" onClick={() => delTrait(l.key, t.id)} style={{ width: 32, height: 32, padding: 0 }}>
                      <Icon name="delete-bin-6-line" size={18} color="var(--error)" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
        <Button variant="stroke" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" disabled={!valid} onClick={() => valid && onSubmit({ name: name.trim(), description: description.trim(), levels })}>
          {editing ? "Update Competency" : "Add Competency"}
        </Button>
      </div>
    </div>
  );
}

/* ---------- competencies list ---------- */
function CompetenciesList({ rows, q, setQ, onCreate, onEdit, onArchive, onViewRankings }) {
  const [menu, setMenu] = useCfg(null);
  const shown = rows.filter(r => q === "" || r.name.toLowerCase().includes(q.toLowerCase()));
  const pg = usePaged(shown, 10);
  return (
    <div className="card" style={{ overflow: "visible", padding: "var(--card-pad, 24px)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
        <div>
          <div className="bh-h2" style={{ fontSize: 24 }}>Competencies</div>
          <div className="bh-body" style={{ marginTop: 4 }}>Manage competencies and the behavioural traits used for performance appraisals.</div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Button variant="stroke" icon="list-check-2" onClick={onViewRankings}>View Ranking Descriptions</Button>
          <Button variant="primary" icon="add-line" onClick={onCreate}>Add Competency</Button>
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
        {rows.length === 0
          ? <EmptyState title="No competencies yet" subtitle="Get started by adding your first competency." cta="Add Competency" onAction={onCreate} />
          : <table className="bh">
              <thead><tr><th>Name</th><th>Description</th><th>Number of Traits</th><th style={{ width: 48 }}></th></tr></thead>
              <tbody>
                {pg.pageItems.map(r => (
                  <tr key={r.id}>
                    <td>{r.name}</td><td>{r.description}</td><td>{traitCount(r.levels)}</td>
                    <td style={{ position: "relative", textAlign: "right" }}>
                      <button className="btn btn-icon btn-ghost" style={{ width: 28, height: 28, padding: 0 }} onClick={() => setMenu(menu === r.id ? null : r.id)}>
                        <Icon name="more-fill" size={18} color="var(--gray-400)" />
                      </button>
                      {menu === r.id && (
                        <div onMouseLeave={() => setMenu(null)} style={{ position: "absolute", right: 16, top: 40, zIndex: 20, background: "#fff",
                          borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-pop)", padding: 6, minWidth: 180, display: "flex", flexDirection: "column" }}>
                          <button className="menu-item" onClick={() => { setMenu(null); onEdit(r); }}><Icon name="edit-2-line" size={16} />Edit Competency</button>
                          <button className="menu-item danger" onClick={() => { setMenu(null); onArchive(r); }}><Icon name="archive-line" size={16} />Archive Competency</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {shown.length === 0 && <tr><td colSpan={4} style={{ padding: 0 }}><EmptyState compact title="No results found" subtitle="No competency matches your search." /></td></tr>}
              </tbody>
            </table>}
        {rows.length > 0 && shown.length > 0 && <div style={{ borderTop: "1px solid var(--divider)" }}><Pagination page={pg.page} pages={pg.pages} onPrev={pg.prev} onNext={pg.next} /></div>}
      </div>
    </div>
  );
}

/* ---------- performance rankings sub-page ---------- */
function PerformanceRankingsView({ rankings, onBack, onSave }) {
  const [rows, setRows] = useCfg(() => rankings.map(r => ({ ...r })));
  const [editing, setEditing] = useCfg(rankings.length === 0);
  const addRow = () => setRows(rs => [...rs, { id: cfgId(), name: "", max: "", min: "", color: RANKING_SWATCHES[rs.length % RANKING_SWATCHES.length] }]);
  const setRow = (id, k, v) => setRows(rs => rs.map(r => r.id === id ? { ...r, [k]: v } : r));
  const delRow = (id) => setRows(rs => rs.filter(r => r.id !== id));

  const header = (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
      <div>
        <div className="bh-h2" style={{ fontSize: 24 }}>Performance Rankings</div>
        <div className="bh-body" style={{ marginTop: 4 }}>Define score ranges and their colour coding for performance evaluations.</div>
      </div>
      {!editing && rows.length > 0 && <Button variant="primary" icon="edit-2-line" onClick={() => setEditing(true)}>Edit Rankings</Button>}
    </div>
  );

  if (!editing && rows.length === 0) {
    return <div className="card" style={{ padding: "var(--card-pad, 24px)" }}>{header}
      <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)" }}>
        <EmptyState title="Nothing here yet" subtitle="Define performance ranking ranges to grade appraisals." cta="Add Rankings" onAction={() => { addRow(); setEditing(true); }} />
      </div>
    </div>;
  }

  if (!editing) {
    return <div className="card" style={{ padding: "var(--card-pad, 24px)" }}>{header}
      <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
        <table className="bh">
          <thead><tr><th>Ranking</th><th>Maximum Score</th><th>Minimum Score</th><th>Colour</th></tr></thead>
          <tbody>{rows.map(r => (
            <tr key={r.id}><td>{r.name}</td><td>{r.max}</td><td>{r.min}</td>
              <td><span style={{ width: 22, height: 22, borderRadius: 6, background: r.color, display: "inline-block", verticalAlign: "middle" }} /></td></tr>
          ))}</tbody>
        </table>
      </div>
    </div>;
  }

  return (
    <div className="card" style={{ padding: "var(--card-pad, 24px)", overflow: "visible" }}>{header}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {rows.map(r => (
          <div key={r.id} style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr auto auto", gap: 12, alignItems: "end" }}>
            <Field label="Name" style={{ margin: 0 }}><Input placeholder="Eg. Outstanding" value={r.name} onChange={e => setRow(r.id, "name", e.target.value)} /></Field>
            <Field label="Maximum Score" style={{ margin: 0 }}><Input type="number" placeholder="100" value={r.max} onChange={e => setRow(r.id, "max", e.target.value)} /></Field>
            <Field label="Minimum Score" style={{ margin: 0 }}><Input type="number" placeholder="0" value={r.min} onChange={e => setRow(r.id, "min", e.target.value)} /></Field>
            <Field label="Colour" style={{ margin: 0 }}><ColorCell value={r.color} onChange={v => setRow(r.id, "color", v)} /></Field>
            <button className="btn btn-icon btn-ghost" onClick={() => delRow(r.id)} style={{ width: 40, height: 40, padding: 0 }}>
              <Icon name="delete-bin-6-line" size={18} color="var(--error)" />
            </button>
          </div>
        ))}
      </div>
      <button onClick={addRow} style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 16, border: 0, background: "none", cursor: "pointer",
        padding: 0, fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 14, color: "var(--brand-yellow-dark)" }}>
        <Icon name="add-line" size={16} color="var(--brand-yellow-dark)" />Add Ranking
      </button>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
        <Button variant="stroke" onClick={onBack}>Cancel</Button>
        <Button variant="primary" disabled={!rows.length || rows.some(r => !r.name.trim())} onClick={() => onSave(rows)}>Save Rankings</Button>
      </div>
    </div>
  );
}

/* ---------- controller ---------- */
function CompetenciesScreen({ onToast, onSubPage }) {
  const [comps, setComps] = useCfg(COMPETENCY_SEED);
  const [rankings, setRankings] = useCfg(RANKING_SEED);
  const [q, setQ] = useCfg("");
  const [view, setView] = useCfg({ name: "list" });   // list | form | rankings
  const [confirm, setConfirm] = useCfg(null);

  useCfgEffect(() => {
    if (!onSubPage) return;
    if (view.name === "form") onSubPage({ trail: [{ label: "Competencies", onClick: () => setView({ name: "list" }) }, { label: view.initial ? "Edit Competency" : "Add Competency" }] });
    else if (view.name === "rankings") onSubPage({ trail: [{ label: "Competencies", onClick: () => setView({ name: "list" }) }, { label: "Performance Rankings" }] });
    else onSubPage(null);
    return () => onSubPage(null);
  }, [view]);

  const submitComp = (form) => setConfirm({ kind: view.initial ? "updateComp" : "addComp", form });
  const saveRankings = (rows) => setConfirm({ kind: rankings.length ? "updateRanking" : "addRanking", rows });

  const CONFIRM = {
    addComp:       { t: "Add Competency",            m: "add this competency",            l: "Yes, Add",     i: "add-line",     c: "Cancel", tone: "success", done: "Competency Added" },
    updateComp:    { t: "Update Competency",         m: "update this competency",         l: "Yes, Update",  i: "check-line",   c: "No",     tone: "success", done: "Competency Updated" },
    archiveComp:   { t: "Archive Competency",        m: "archive this competency",        l: "Yes, Archive", i: "archive-line", c: "No",     tone: "error",   done: "Competency Archived" },
    addRanking:    { t: "Add Performance Ranking",    m: "add this performance ranking",   l: "Yes, Add",     i: "add-line",     c: "Cancel", tone: "success", done: "Performance Ranking Added" },
    updateRanking: { t: "Update Performance Ranking", m: "update this performance ranking", l: "Yes, Update", i: "check-line",  c: "No",     tone: "success", done: "Performance Ranking Updated" },
  };

  const runConfirm = () => {
    const c = confirm, cc = CONFIRM[c.kind];
    if (c.kind === "addComp") { setComps(cs => [{ id: cfgId(), ...c.form }, ...cs]); setView({ name: "list" }); }
    else if (c.kind === "updateComp") { setComps(cs => cs.map(x => x.id === view.initial.id ? { ...x, ...c.form } : x)); setView({ name: "list" }); }
    else if (c.kind === "archiveComp") { setComps(cs => cs.filter(x => x.id !== c.row.id)); }
    else if (c.kind === "addRanking" || c.kind === "updateRanking") { setRankings(c.rows); setView({ name: "list" }); }
    onToast(cc.done, { tone: cc.tone });
    setConfirm(null);
  };

  let body;
  if (view.name === "form") body = <CompetencyForm initial={view.initial} onCancel={() => setView({ name: "list" })} onSubmit={submitComp} />;
  else if (view.name === "rankings") body = <PerformanceRankingsView rankings={rankings} onBack={() => setView({ name: "list" })} onSave={saveRankings} />;
  else body = <CompetenciesList rows={comps} q={q} setQ={setQ}
    onCreate={() => setView({ name: "form", initial: null })}
    onEdit={(r) => setView({ name: "form", initial: r })}
    onArchive={(r) => setConfirm({ kind: "archiveComp", row: r })}
    onViewRankings={() => setView({ name: "rankings" })} />;

  return (
    <React.Fragment>
      {body}
      {confirm && (() => {
        const c = CONFIRM[confirm.kind];
        return <ConfirmModal title={c.t} message={`Are you sure you want to ${c.m}?`} confirmLabel={c.l} confirmIcon={c.i} cancelLabel={c.c}
          onConfirm={runConfirm} onClose={() => setConfirm(null)} />;
      })()}
    </React.Fragment>
  );
}

Object.assign(window, { CompetenciesScreen });
