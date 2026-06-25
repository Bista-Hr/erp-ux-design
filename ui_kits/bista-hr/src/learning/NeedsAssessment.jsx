// BISTA HR · learning/NeedsAssessment — Learning & Development ▸ Needs Assessment.
// Three tiers, each with its own owner/entry point, presented in one consolidated, export-ready
// table (the "Excel-like" view the brief calls for). Guardrails: a need states the PROBLEM to
// solve + a priority — not an open-ended shopping list. Writes to window.HRStores.ldNeeds.
const { useState: useNA, useEffect: useNAEffect } = React;

const NA_TABS = ["All", "Tier 1", "Tier 2", "Tier 3"];
const PRIORITIES = ["Must", "Should", "Could"];
const NA_STATUSES = ["Open", "Under review", "Mapped"];
const PRI_VARIANT = { Must: { c: "var(--error)", b: "var(--error-tint)" }, Should: { c: "var(--warning-deep)", b: "var(--warning-tint)" }, Could: { c: "var(--gray-600)", b: "var(--gray-100)" } };
const NA_STATUS_VARIANT = { Open: "draft", "Under review": "pending", Mapped: "approved" };

function NeedsForm({ initial, onCancel, onSubmit }) {
  const [f, setF] = useNA(initial || { tier: "Tier 1", title: "", area: "", rationale: "", priority: "Must", target: "", status: "Open", linkedProgram: "—" });
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const valid = f.title && f.rationale.trim() && f.target;
  const tierHint = { "Tier 1": "Strategic / mandatory — bank-wide (compliance, management decisions).", "Tier 2": "Department-specific — line-manager initiated; states the problem to solve.", "Tier 3": "Individual — IDP-fed (70-20-10 intervention type)." };
  return (
    <div className="card" style={{ padding: "var(--card-pad, 24px)", overflow: "visible" }}>
      <div style={{ marginBottom: 8 }}>
        <div className="bh-h2" style={{ fontSize: 24 }}>{initial ? "Edit Training Need" : "Add Training Need"}</div>
        <div className="bh-body" style={{ marginTop: 4 }}>Capture a need by the problem to solve and its priority — not an open-ended request.</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 820 }}>
        <Field label="Needs Tier" hint={tierHint[f.tier]}><Combobox value={f.tier} onChange={v => set("tier", v)} options={["Tier 1", "Tier 2", "Tier 3"]} placeholder="Select tier" /></Field>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
          <Field label="Need / Capability"><Input value={f.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Build data-analytics capacity" /></Field>
          <Field label="Area / Department"><Input value={f.area} onChange={e => set("area", e.target.value)} placeholder="e.g. Operations" /></Field>
        </div>
        <Field label="Target Population"><Input value={f.target} onChange={e => set("target", e.target.value)} placeholder="e.g. All credit officers" /></Field>
        <Field label="Problem to Solve / Rationale"><Textarea rows={3} value={f.rationale} onChange={e => set("rationale", e.target.value)} placeholder="What problem will this training solve? (e.g. reduce manual reporting and improve MI turnaround)" /></Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
          <Field label="Priority"><Combobox value={f.priority} onChange={v => set("priority", v)} options={PRIORITIES} placeholder="Select" /></Field>
          <Field label="Status"><Combobox value={f.status} onChange={v => set("status", v)} options={NA_STATUSES} placeholder="Select" /></Field>
          <Field label="Linked Program" optional><Input value={f.linkedProgram} onChange={e => set("linkedProgram", e.target.value)} placeholder="Map to a program" /></Field>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
        <Button variant="stroke" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" icon={initial ? "check-line" : "add-line"} disabled={!valid} onClick={() => valid && onSubmit(f)}>{initial ? "Save Changes" : "Add Need"}</Button>
      </div>
    </div>
  );
}

function NeedsDetail({ need }) {
  const n = need; const tinfo = LD_TIER[n.tier] || {}; const pv = PRI_VARIANT[n.priority] || PRI_VARIANT.Could;
  const items = [
    { label: "Needs Tier", value: `${n.tier} · ${tinfo.label || ""}` },
    { label: "Area / Department", value: n.area || "—" },
    { label: "Target Population", value: n.target },
    { label: "Priority", value: n.priority },
    { label: "Status", value: n.status },
    { label: "Linked Program", value: n.linkedProgram === "—" ? "Not mapped" : n.linkedProgram },
    { label: "Created by", value: n.createdBy || "—" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title={n.title} subtitle={`${n.tier} · ${tinfo.label || ""}`}
        actions={<React.Fragment>
          <span className="bh-chip" style={{ color: pv.c, background: pv.b }}>{n.priority}</span>
          <StatusBadge variant={NA_STATUS_VARIANT[n.status] || "draft"} text={n.status} />
        </React.Fragment>} />
      <div className="card" style={{ padding: 0 }}>
        <DetailCard icon="clipboard-line" title="Training Need">
          <div style={{ marginBottom: 16, padding: "14px 16px", borderRadius: 12, background: "var(--gray-50)" }}>
            <div className="bh-caption" style={{ marginBottom: 4 }}>Problem to solve / rationale</div>
            <div style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--gray-800)", lineHeight: 1.6 }}>{n.rationale}</div>
          </div>
          <DetailPanel items={items} tint="gray" cols={3} />
        </DetailCard>
      </div>
    </div>
  );
}

function NeedsAssessmentScreen({ onToast, onSubPage }) {
  const [needs, setNeeds] = useStore(window.HRStores.ldNeeds);
  const [q, setQ] = useNA("");
  const [tier, setTier] = useNA("All");
  const [view, setView] = useNA({ name: "list" });
  const [confirm, setConfirm] = useNA(null);

  useNAEffect(() => {
    if (!onSubPage) return;
    if (view.name === "create") onSubPage({ trail: [{ label: "Needs Assessment", onClick: () => setView({ name: "list" }) }, { label: "Add Training Need" }] });
    if (view.name === "create") onSubPage({ trail: [{ label: "Needs Assessment", onClick: () => setView({ name: "list" }) }, { label: "Add Training Need" }] });
    else if (view.name === "edit") onSubPage({ trail: [{ label: "Needs Assessment", onClick: () => setView({ name: "list" }) }, { label: "Edit Training Need" }] });
    else if (view.name === "detail") { const r = needs.find(x => x.id === view.id); onSubPage({ trail: [{ label: "Needs Assessment", onClick: () => setView({ name: "list" }) }, { label: r ? r.title : "Training Need" }] }); }
    else onSubPage(null);
    return () => onSubPage(null);
  }, [view]);

  const filtered = needs.filter(n => (tier === "All" || n.tier === tier) && (q === "" || (n.title + n.createdBy + n.area + n.target).toLowerCase().includes(q.toLowerCase())));
  const pg = usePaged(filtered, 9);
  const byTier = (t) => needs.filter(n => n.tier === t).length;

  const submit = (f) => setConfirm({ kind: view.name === "edit" ? "edit" : "add", form: f, id: view.id });
  const run = () => {
    const c = confirm;
    if (c.kind === "add") { setNeeds(ns => [{ id: ldId(), createdBy: LD_ME, ...c.form }, ...ns]); onToast("Training Need Added", { tone: "success" }); }
    else if (c.kind === "edit") { setNeeds(ns => ns.map(n => n.id === c.id ? { ...n, ...c.form } : n)); onToast("Training Need Updated", { tone: "success" }); }
    else if (c.kind === "archive") { setNeeds(ns => ns.filter(n => n.id !== c.row.id)); onToast("Training Need Removed", { tone: "error" }); }
    setConfirm(null); setView({ name: "list" });
  };

  if (view.name === "create") return wrap(<NeedsForm onCancel={() => setView({ name: "list" })} onSubmit={submit} />);
  if (view.name === "edit") return wrap(<NeedsForm initial={needs.find(n => n.id === view.id)} onCancel={() => setView({ name: "list" })} onSubmit={submit} />);
  if (view.name === "detail") { const r = needs.find(n => n.id === view.id); if (r) return wrap(<NeedsDetail need={r} />); }

  function wrap(node) {
    return (<React.Fragment>{node}{confirmModal()}</React.Fragment>);
  }
  function confirmModal() {
    if (!confirm) return null;
    const CC = { add: ["Add Training Need", "add this training need", "Yes, Add", "add-line", "Cancel"], edit: ["Save Changes", "save changes", "Yes, Save", "check-line", "Cancel"], archive: ["Remove Training Need", "remove this training need", "Yes, Remove", "delete-bin-line", "No"] };
    const [t, m, l, i, cancel] = CC[confirm.kind];
    return <ConfirmModal title={t} message={`Are you sure you want to ${m}?`} confirmLabel={l} confirmIcon={i} cancelLabel={cancel} onConfirm={run} onClose={() => setConfirm(null)} />;
  }

  return wrap(
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title="Needs Assessment" subtitle="Three tiers of training needs — strategic, departmental and individual (IDP-fed) — in one consolidated view."
        actions={<React.Fragment>
          <Button variant="stroke" icon="file-excel-2-line" onClick={() => onToast("Exported to Excel", { tone: "success" })}>Export</Button>
          <Button variant="primary" icon="add-line" onClick={() => setView({ name: "create" })}>Add Need</Button>
        </React.Fragment>} />

      <div className="card cq-stats" style={{ padding: "var(--card-pad, 24px)" }}>
        <div className="cq-stat-grid">
          {[{ title: "Training needs", value: needs.length },
            { title: "Tier 1 · Strategic", value: byTier("Tier 1") },
            { title: "Tier 2 · Department", value: byTier("Tier 2") },
            { title: "Tier 3 · Individual", value: byTier("Tier 3") },
            { title: "Mapped", value: needs.filter(n => n.status === "Mapped").length }].map((s, i) => (
            <UI.StatCard key={s.title} title={s.title} value={s.value} index={i} />
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 20 }}>
          <div className="bh-tablebox">
          <UI.FilterBar left={<Segmented items={NA_TABS} active={tier} onChange={setTier} />} search={q} onSearch={setQ} searchPlaceholder="Search needs…" />
          {filtered.length === 0
            ? <EmptyState variant="assessment" title="No training needs" subtitle="Add a need or adjust your filters." />
            : <table className="bh">
                <thead><tr><th>Need / Capability</th><th>Tier</th><th>Target</th><th>Priority</th><th>Status</th><th>Linked Program</th><th style={{ width: 48 }}></th></tr></thead>
                <tbody>
                  {pg.pageItems.map(n => { const tinfo = LD_TIER[n.tier] || {}; const pv = PRI_VARIANT[n.priority] || PRI_VARIANT.Could; return (
                    <tr key={n.id} style={{ cursor: "pointer" }} onClick={() => setView({ name: "detail", id: n.id })}>
                      <td><span style={{ display: "flex", flexDirection: "column" }}><span style={{ fontWeight: 600, color: "var(--gray-900)" }}>{n.title}</span><span style={{ fontSize: 12, color: "var(--gray-400)", maxWidth: 320 }}>{n.rationale}</span></span></td>
                      <td><span className="bh-chip" style={{ color: tinfo.color, background: tinfo.tint }}>{n.tier}</span></td>
                      <td>{n.target}</td>
                      <td><span className="bh-chip" style={{ color: pv.c, background: pv.b }}>{n.priority}</span></td>
                      <td><StatusBadge variant={NA_STATUS_VARIANT[n.status] || "draft"} text={n.status} size="sm" /></td>
                      <td style={{ color: n.linkedProgram === "—" ? "var(--gray-300)" : "var(--gray-700)" }}>{n.linkedProgram}</td>
                      <td style={{ textAlign: "right" }} onClick={e => e.stopPropagation()}><UI.RowActions actions={[
                        { label: "View Details", short: "View", icon: "eye-line", onClick: () => setView({ name: "detail", id: n.id }) },
                        { label: "Edit Need", short: "Edit", icon: "edit-2-line", onClick: () => setView({ name: "edit", id: n.id }) },
                        { label: "Remove Need", short: "Remove", icon: "delete-bin-line", danger: true, onClick: () => setConfirm({ kind: "archive", row: n }) },
                      ]} /></td>
                    </tr>
                  ); })}
                </tbody>
              </table>}
          {filtered.length > 0 && <div style={{ borderTop: "1px solid var(--divider)" }}><Pagination page={pg.page} pages={pg.pages} onPrev={pg.prev} onNext={pg.next} /></div>}
          </div>
      </div>
    </div>
  );
}

Object.assign(window, { NeedsAssessmentScreen });
