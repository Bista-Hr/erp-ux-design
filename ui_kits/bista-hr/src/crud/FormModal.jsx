// BISTA HR · crud/FormModal — Create / Edit entity form.
// Submitting does NOT save directly — it calls onSubmit(form) so the orchestrator can
// raise the confirmation modal (the Figma "Are you sure…?" phase) before committing.
// The primary button stays disabled until every required field has a value.
function FormModal({ config, initial, onClose, onSubmit, lookups }) {
  const LK = lookups || window.LOOKUPS;
  const editing = !!initial;
  const [form, setForm] = useState(() => {
    const f = { active: editing ? initial.active : true };
    config.fields.forEach(fl => f[fl.key] = initial ? (initial[fl.key] ?? "") : "");
    return f;
  });
  const set = (k, v) => setForm(s => ({ ...s, [k]: v }));
  const requiredKeys = config.fields.filter(fl => !fl.optional).map(fl => fl.key);
  const valid = requiredKeys.every(k => String(form[k] || "").trim() !== "");
  const verb = config.verb || "Create";
  const createTitle = config.addTitle || `${verb} ${config.noun}`;

  // "Autofill with AI" — fills empty text/description fields with a plausible sample
  const AI_SAMPLES = {
    Perspective: { name: "Customer", desc: "Customer satisfaction and service excellence" },
    Period: { name: "Quarter 4", desc: "Appraisal period for fourth quarter" },
    KPI: { name: "Quality", desc: "Quality of output" },
  };
  const aiFill = () => setForm(s => {
    const next = { ...s };
    const sample = AI_SAMPLES[config.noun] || { name: config.noun, desc: `Auto-generated ${config.noun.toLowerCase()} description.` };
    const firstText = config.fields.find(fl => !fl.type);
    const textarea = config.fields.find(fl => fl.type === "textarea");
    if (firstText && !next[firstText.key]) next[firstText.key] = sample.name;
    if (textarea && !next[textarea.key]) next[textarea.key] = sample.desc;
    return next;
  });

  return (
    <Modal onClose={onClose} width={config.modalWidth || 770}>
      {/* header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "24px 24px 0" }}>
        <div>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 20, lineHeight: "28px", color: "var(--gray-900)" }}>
            {editing ? `Edit ${config.noun}` : createTitle}
          </div>
          <div className="bh-body" style={{ marginTop: 4 }}>
            {config.subtitle || (editing ? `Update ${config.noun.toLowerCase()} information` : `Add a new ${config.noun.toLowerCase()} to your organization`)}
          </div>
        </div>
        <button className="btn btn-icon btn-ghost" onClick={onClose} style={{ width: 32, height: 32, padding: 0 }}>
          <Icon name="close-line" size={20} color="var(--gray-500)" />
        </button>
      </div>

      {/* fields — two-column grid, full-width rows for textareas */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, padding: 24 }}>
        {config.fields.map(fl => {
          const opts = fl.lookup ? (LK[fl.lookup] || []) : fl.options;
          const isUser = fl.lookup === "employees" || fl.avatar;
          return (
            <Field key={fl.key} label={fl.label} optional={fl.optional} style={{ gridColumn: fl.full ? "1 / -1" : "auto" }}>
              {fl.type === "select"
                ? <Combobox value={form[fl.key]} onChange={v => set(fl.key, v)} options={opts} placeholder={fl.placeholder} icon={fl.icon} avatar={isUser} />
                : fl.type === "multiselect"
                  ? <MultiSelectCombobox value={form[fl.key] || []} onChange={v => set(fl.key, v)} options={opts} placeholder={fl.placeholder} avatar={isUser} />
                  : fl.type === "textarea"
                    ? <Textarea placeholder={fl.placeholder} value={form[fl.key]} onChange={e => set(fl.key, e.target.value)} />
                    : fl.type === "date"
                      ? <Input type="date" value={form[fl.key]} onChange={e => set(fl.key, e.target.value)} />
                      : <Input placeholder={fl.placeholder} value={form[fl.key]} onChange={e => set(fl.key, e.target.value)} />}
            </Field>
          );
        })}
        <div style={{ gridColumn: "1 / -1", display: config.hideActive ? "none" : "block" }}>
          <Checkbox checked={form.active} onChange={v => set("active", v)} label="Active" />
        </div>
        {config.aiAssist && (
          <button onClick={aiFill} style={{ gridColumn: "1 / -1", justifySelf: "start", display: "inline-flex", alignItems: "center", gap: 6,
            border: 0, background: "none", cursor: "pointer", padding: 0, fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 13, color: "var(--brand-yellow-dark)" }}>
            <Icon name="sparkling-2-line" size={16} color="var(--brand-yellow-dark)" />Autofill with AI
          </button>
        )}
      </div>

      {/* footer */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: "0 24px 24px" }}>
        <Button variant="stroke" onClick={onClose}>Cancel</Button>
        <Button variant="primary" disabled={!valid} onClick={() => valid && onSubmit(form)}>
          {editing ? `Update ${config.noun}` : `${verb} ${config.noun}`}
        </Button>
      </div>
    </Modal>
  );
}
Object.assign(window, { FormModal });
