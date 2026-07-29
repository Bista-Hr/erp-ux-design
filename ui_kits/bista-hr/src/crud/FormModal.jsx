// BISTA HR · crud/FormModal — Create / Edit entity form.
// Submitting does NOT save directly — it calls onSubmit(form) so the orchestrator can
// raise the confirmation modal (the Figma "Are you sure…?" phase) before committing.
// The primary button stays disabled until every required field has a value.

// NotchEditor — manages a grade's NOTCHES (sequential integers starting at 1). New grades start
// with 10 notches. Add appends the next number; only the LAST notch can be removed (asks for
// confirmation), keeping the band a contiguous 1..N.
const DEFAULT_NOTCHES = Array.from({ length: 10 }, (_, i) => i + 1);
function NotchEditor({ value, onChange }) {
  const list = Array.isArray(value) ? value : [];
  const [confirmIdx, setConfirmIdx] = React.useState(null);
  const [hover, setHover] = React.useState(false);
  const resequence = (arr) => arr.map((_, i) => i + 1);
  const add = () => onChange(resequence([...list, 0]));
  const remove = () => { onChange(resequence(list.slice(0, -1))); setConfirmIdx(null); };
  const last = list.length - 1;
  const sq = { width: 40, height: 40, borderRadius: "var(--radius-sm)", display: "inline-flex", alignItems: "center", justifyContent: "center",
    fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 15, position: "relative" };
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {list.map((n, idx) => (
          <div key={idx} onMouseEnter={() => idx === last && setHover(true)} onMouseLeave={() => setHover(false)}
            style={{ ...sq, background: "var(--brand-yellow-tint)", border: "1px solid var(--brand-yellow)", color: "var(--gray-900)" }}>
            {n}
            {idx === last && (
              <button type="button" title="Remove last notch" onClick={() => setConfirmIdx(idx)}
                style={{ position: "absolute", top: -7, right: -7, width: 18, height: 18, borderRadius: "50%", border: "1px solid var(--border)",
                  background: "#fff", color: "var(--error)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center",
                  padding: 0, boxShadow: "var(--shadow-input)", opacity: hover ? 1 : 0.6, transition: "opacity .12s" }}>
                <Icon name="close-line" size={12} color="var(--error)" />
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={add} title="Add notch"
          style={{ ...sq, background: "#fff", border: "1.5px dashed var(--border-strong)", color: "var(--gray-500)", cursor: "pointer" }}>
          <Icon name="add-line" size={20} color="var(--gray-500)" />
        </button>
      </div>
      <div style={{ marginTop: 8, fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--gray-400)" }}>
        Notches start at 1 (default 10). Add a notch to extend this grade's band; only the last notch can be removed.
      </div>
      {confirmIdx !== null && (
        <ConfirmModal title="Remove Notch" message={`Are you sure you want to remove Notch ${list[confirmIdx]}? It is the last notch in this grade's band.`}
          confirmLabel="Yes, Remove" confirmIcon="delete-bin-6-line" cancelLabel="Cancel" tone="error"
          onConfirm={remove} onClose={() => setConfirmIdx(null)} />
      )}
    </div>
  );
}

function FormModal({ config, initial, onClose, onSubmit, lookups, rows }) {
  const LK = lookups || window.LOOKUPS;
  const editing = !!initial;
  const [form, setForm] = useState(() => {
    const f = { active: editing ? initial.active : true };
    config.fields.forEach(fl => f[fl.key] = initial ? (initial[fl.key] ?? (fl.type === "notches" ? DEFAULT_NOTCHES.slice() : "")) : (fl.type === "notches" ? DEFAULT_NOTCHES.slice() : ""));
    return f;
  });
  // set() also handles fillTarget: changing the source field populates the target when it's
  // empty or still holds the previous auto-filled value (user edits win). fillTemplate derives
  // "Grade {value}"-style strings; fillInitials derives initials ("Senior Executive" → "SE").
  const initialsOf = (str) => String(str || "").trim().split(/\s+/).map(w => (w.match(/[A-Za-z0-9]/) || [""])[0].toUpperCase()).join("");
  const set = (k, v) => setForm(s => {
    const next = { ...s, [k]: v };
    // autofill: a field may derive other values from its pick (e.g. Work Colleague → contact info)
    const src = config.fields.find(f => f.key === k);
    if (src && src.autofill) Object.assign(next, src.autofill(v, next) || {});
    // cascade: an auto-filled target may itself have a fillTarget (Grade → Name → Code)
    const applyFill = (key, val, prevVal) => {
      const fl = config.fields.find(f => f.key === key);
      if (!fl || !fl.fillTarget || !(fl.fillTemplate || fl.fillInitials)) return;
      const derive = (src) => fl.fillInitials ? initialsOf(src) : fl.fillTemplate.replace("{value}", String(src ?? "").trim());
      const cur = String(next[fl.fillTarget] || "").trim();
      const auto = derive(val);
      if (String(val).trim() !== "" && auto !== "" && (cur === "" || cur === derive(prevVal))) {
        const prevTarget = next[fl.fillTarget];
        next[fl.fillTarget] = auto;
        applyFill(fl.fillTarget, auto, prevTarget);
      }
    };
    applyFill(k, v, s[k]);
    return next;
  });
  // required-field errors show BEFORE submission: a field reveals "X is required" once
  // the user has touched it (blur or edit) and left it empty.
  const [touched, setTouched] = React.useState({});
  const markTouched = k => setTouched(t => t[k] ? t : ({ ...t, [k]: true }));
  const requiredKeys = config.fields.filter(fl => !fl.optional).map(fl => fl.key);
  // conditional fields (showIf) render + validate only when their condition holds
  const visibleFields = config.fields.filter(fl => !fl.showIf || fl.showIf(form));
  const hasVal = (fl) => {
    const v = form[fl.key];
    if (fl.type === "docs") return !!v && (((v.newFiles || []).length + (v.keptUrls || []).length) > 0);
    return String(v ?? "").trim() !== "";
  };
  // unique fields: an already-existing value (excluding the row being edited) raises an inline error
  const dupErrors = {};
  config.fields.forEach(fl => {
    if (!fl.unique) return;
    const v = String(form[fl.key] ?? "").trim();
    if (v === "") return;
    if ((rows || []).some(r => (!initial || r.id !== initial.id) && String(r[fl.key] ?? "").trim() === v))
      dupErrors[fl.key] = (fl.uniqueError || `This ${fl.label.toLowerCase()} already exists.`).replace("{value}", v);
  });
  // pattern fields: invalid characters raise the same inline error treatment, live as the user types
  config.fields.forEach(fl => {
    if (!fl.pattern) return;
    const v = String(form[fl.key] ?? "").trim();
    if (v !== "" && !(new RegExp(fl.pattern)).test(v)) dupErrors[fl.key] = fl.patternError || `Invalid ${fl.label.toLowerCase()}.`;
  });
  const valid = visibleFields.filter(fl => !fl.optional && !fl.disabled && fl.type !== "notches").every(hasVal) && Object.keys(dupErrors).length === 0;
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
    <Modal onClose={onClose} width={config.modalWidth || 770} flexBody>
      {/* header (fixed) */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "24px 24px 16px", flex: "none" }}>
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

      {/* fields — two-column grid, scrolls between the fixed header and footer */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, padding: "8px 24px 24px", overflowY: "auto", flex: "1 1 auto", minHeight: 0 }}>
        {visibleFields.map(fl => {
          const opts = fl.optionsFor ? fl.optionsFor(form) : (fl.lookup ? (LK[fl.lookup] || []) : fl.options);
          const isUser = fl.lookup === "employees" || fl.avatar;
          const asGhanaCard = fl.type === "ghanaCard" || (fl.ghanaCardIf && form[fl.ghanaCardIf] === "Ghana Card");
          const fieldError = dupErrors[fl.key] || (touched[fl.key] && !fl.optional && fl.type !== "notches" && !hasVal(fl) ? `${fl.label} is required` : "");
          return (
            <Field key={fl.key} label={fl.label} required={!fl.optional && !fl.disabled} style={{ gridColumn: (fl.full || fl.type === "docs") ? "1 / -1" : "auto" }}>
              {fl.disabled
                ? <Input value={form[fl.key]} disabled />
                : fl.type === "docs"
                ? <SupportingDocuments existingUrls={fl.existingUrls || []} isEditMode={!!(fl.existingUrls && fl.existingUrls.length)} onChange={v => set(fl.key, v)} />
                : asGhanaCard
                ? <GhanaCardInput value={form[fl.key]} onChange={v => set(fl.key, v)} />
                : fl.type === "gps"
                ? <GpsInput value={form[fl.key]} onChange={v => set(fl.key, v)} />
                : fl.type === "unitBranch"
                ? <UnitBranchCombobox value={form[fl.key]} onChange={v => set(fl.key, v)}
                    zone={form[fl.zoneKey] || ""} onZoneChange={fl.zoneKey ? (v => set(fl.zoneKey, v)) : undefined} zones={LK.zones} />
                : fl.type === "designation"
                ? <DesignationCombobox value={form[fl.key]} onChange={v => set(fl.key, v)}
                    department={form[fl.deptKey] || ""} onDepartmentChange={fl.deptKey ? (v => set(fl.deptKey, v)) : undefined} departments={LK.departments} />
                : fl.type === "select"
                ? <Combobox value={form[fl.key]} onChange={v => set(fl.key, v)} options={opts} placeholder={fl.placeholder} icon={fl.icon} avatar={isUser} />
                : fl.type === "multiselect"
                  ? <MultiSelectCombobox value={form[fl.key] || []} onChange={v => set(fl.key, v)} options={opts} placeholder={fl.placeholder} avatar={isUser} />
                  : fl.type === "textarea"
                    ? <Textarea placeholder={fl.placeholder} value={form[fl.key]} onChange={e => set(fl.key, e.target.value)} onBlur={() => markTouched(fl.key)} />
                    : fl.type === "date"
                      ? <UI.DatePicker value={form[fl.key] || ""} onSelect={d => set(fl.key, `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`)} placeholder={fl.placeholder || "Pick a date"} />
                      : fl.type === "number"
                        ? <Input type="number" min={fl.min ?? 0} placeholder={fl.placeholder} value={form[fl.key]} onChange={e => set(fl.key, e.target.value)} onBlur={() => markTouched(fl.key)} />
                        : fl.type === "notches"
                          ? <NotchEditor value={form[fl.key]} onChange={v => set(fl.key, v)} />
                          : <Input placeholder={fl.placeholder} value={form[fl.key]} onChange={e => set(fl.key, e.target.value)} onBlur={() => markTouched(fl.key)} />}
              {fieldError && (
                <div style={{ marginTop: 2, display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--error)" }}>
                  <Icon name="error-warning-line" size={14} color="var(--error)" />{fieldError}
                </div>
              )}
            </Field>
          );
        })}
        <div style={{ gridColumn: "1 / -1", display: config.hideActive ? "none" : "flex", alignItems: "center", gap: 10 }}>
          <UI.Switch checked={form.active} onCheckedChange={v => set("active", v)} />
          <span style={{ fontFamily: "var(--font-control)", fontWeight: 500, fontSize: 14, color: "var(--gray-900)" }}>{config.activeLabel || "Active"}</span>
        </div>
        {config.aiAssist && (
          <button onClick={aiFill} style={{ gridColumn: "1 / -1", justifySelf: "start", display: "inline-flex", alignItems: "center", gap: 6,
            border: 0, background: "none", cursor: "pointer", padding: 0, fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 13, color: "var(--brand-yellow-dark)" }}>
            <Icon name="sparkling-2-line" size={16} color="var(--brand-yellow-dark)" />Autofill with AI
          </button>
        )}
      </div>

      {/* footer (fixed) */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: "16px 24px 24px", flex: "none", borderTop: "1px solid var(--border)" }}>
        <Button variant="stroke" onClick={onClose}>Cancel</Button>
        <Button variant="primary" disabled={!valid} onClick={() => valid && onSubmit(form)}>
          {editing ? `Update ${config.noun}` : `${verb} ${config.noun}`}
        </Button>
      </div>
    </Modal>
  );
}
Object.assign(window, { FormModal });
