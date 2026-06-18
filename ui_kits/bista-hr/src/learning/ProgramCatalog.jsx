// BISTA HR · learning/ProgramCatalog — Learning & Development ▸ Program Catalog.
//   list    : programs library (stats + filterable table; total cost per row) — Add / open detail
//   create  : full-page form — details, MODE-aware logistics (online meeting link with auto-detected
//             platform, or in-person location/Google-Maps link), thumbnail + flier, event coordinator,
//             multi-currency cost. Status is DERIVED from the dates (never chosen).
//   detail  : overview, logistics (platform/location), cost breakdown, coordinator, enrollment +
//             ATTENDANCE marking (admin or the assigned coordinator).
// Writes to the shared window.HRStores.ldPrograms / ldEnrollments stores (single source of truth).
const { useState: useCat, useEffect: useCatEffect, useRef: useCatRef } = React;

const PROGRAM_TABS = ["All", "Tier 1", "Tier 2", "Tier 3"];
const MODES = ["In-person", "Online", "Hybrid"];
const CURRENCIES = ["GHS", "USD", "GBP"];
const isOnlineMode = (m) => m === "Online" || m === "Hybrid";
const isPhysicalMode = (m) => m === "In-person" || m === "Hybrid";
const modeIcon = (m) => m === "In-person" ? "map-pin-line" : m === "Hybrid" ? "split-cells-horizontal" : "global-line";

function ldCostSummary(p) {
  const parts = [];
  if (p.cost) {
    if (p.cost.directFee.amount) parts.push(ldMoney(p.cost.directFee.amount, p.cost.directFee.currency));
    (p.cost.associated || []).forEach(a => parts.push(ldMoney(a.amount, a.currency)));
  }
  return parts.length ? parts.join(" + ") : "No cost";
}

/* ---------- compact image slot (thumbnail / flier) ---------- */
function ImageSlot({ value, onChange, label, hint, aspect = "16 / 9" }) {
  const ref = useCatRef(null);
  const pick = (file) => { if (!file) return; const r = new FileReader(); r.onload = e => onChange(e.target.result); r.readAsDataURL(file); };
  return (
    <div>
      <input ref={ref} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={e => { pick(e.target.files && e.target.files[0]); e.target.value = ""; }} />
      {value ? (
        <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)" }}>
          <img src={value} alt="" style={{ display: "block", width: "100%", aspectRatio: aspect, objectFit: "cover" }} />
          <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 6 }}>
            <button onClick={() => ref.current && ref.current.click()} style={{ border: 0, borderRadius: 8, padding: "6px 8px", cursor: "pointer", background: "rgba(13,27,42,.6)", color: "#fff", display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "var(--font-ui)", fontSize: 12 }}><Icon name="image-edit-line" size={14} color="#fff" />Replace</button>
            <button onClick={() => onChange("")} style={{ border: 0, borderRadius: 8, padding: "6px 8px", cursor: "pointer", background: "rgba(239,68,68,.85)", color: "#fff", display: "inline-flex", alignItems: "center", fontFamily: "var(--font-ui)", fontSize: 12 }}><Icon name="delete-bin-line" size={14} color="#fff" /></button>
          </div>
        </div>
      ) : (
        <div role="button" tabIndex={0} onClick={() => ref.current && ref.current.click()}
          onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); ref.current && ref.current.click(); } }}
          style={{ border: "2px dashed var(--gray-300)", background: "#FCFCFD", borderRadius: 12, padding: "22px 18px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, textAlign: "center", cursor: "pointer", aspectRatio: aspect, justifyContent: "center" }}>
          <Icon name="image-add-line" size={30} color="var(--gray-400)" />
          <div style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 13.5, color: "var(--gray-700)" }}>{label}</div>
          {hint && <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-400)" }}>{hint}</div>}
        </div>
      )}
    </div>
  );
}

/* ---------- brand platform logos (rendered after a meeting link is detected) ---------- */
function PlatformLogo({ url, size = 22 }) {
  const p = ldMeetingPlatform(url);
  const k = p ? p.key : "online";
  const s = { width: size, height: size, display: "block", flex: "none" };
  switch (k) {
    case "teams": return (
      <svg viewBox="0 0 24 24" style={s} aria-label="Microsoft Teams"><rect x="2" y="5" width="14" height="14" rx="3" fill="#5059C9"/><circle cx="18.5" cy="8" r="3" fill="#7B83EB"/><rect x="14.5" y="10.5" width="8" height="8" rx="2.4" fill="#7B83EB"/><text x="9" y="16" fontSize="9.5" fontWeight="700" fill="#fff" textAnchor="middle" fontFamily="Arial">T</text></svg>
    );
    case "zoom": return (
      <svg viewBox="0 0 24 24" style={s} aria-label="Zoom"><rect x="1.5" y="1.5" width="21" height="21" rx="6" fill="#2D8CFF"/><path d="M6 9.2c0-.66.54-1.2 1.2-1.2h5.1c.66 0 1.2.54 1.2 1.2v5.6c0 .66-.54 1.2-1.2 1.2H7.2c-.66 0-1.2-.54-1.2-1.2V9.2Z" fill="#fff"/><path d="M14.3 11.1l3.1-2.1c.4-.27.9.02.9.5v5c0 .48-.5.77-.9.5l-3.1-2.1v-1.8Z" fill="#fff"/></svg>
    );
    case "meet": return (
      <svg viewBox="0 0 24 24" style={s} aria-label="Google Meet"><path d="M13 7.5V5H4.2C3.5 5 3 5.6 3 6.2v11.6c0 .6.5 1.2 1.2 1.2H13v-2.5l-4.5-3.9L13 7.5Z" fill="#00897B"/><path d="M13 7.5l4.5 3.9V7.6l-.1-.1H13Z" fill="#00832D"/><path d="M13 16.5V19h7.8c.7 0 1.2-.6 1.2-1.2v-2.6L17.5 12 13 16.5Z" fill="#0066DA"/><path d="M22 8.5c0-.7-.8-1.1-1.4-.7l-3.1 2.2v4l3.1 2.2c.6.4 1.4 0 1.4-.7V8.5Z" fill="#FBBC04"/><path d="M13 7.5L8.5 11.4 13 15.3V7.5Z" fill="#E94235"/><path d="M17.5 7.6V11.4L13 7.5h4.4l.1.1Z" fill="#2684FC"/></svg>
    );
    case "webex": return (
      <svg viewBox="0 0 24 24" style={s} aria-label="Webex"><circle cx="12" cy="12" r="10" fill="#16A98D"/><circle cx="12" cy="12" r="6.2" fill="none" stroke="#fff" strokeWidth="2.2"/><circle cx="12" cy="4.6" r="2.1" fill="#0E7A66"/></svg>
    );
    case "whatsapp": return (
      <svg viewBox="0 0 24 24" style={s} aria-label="WhatsApp"><circle cx="12" cy="12" r="11" fill="#25D366"/><path d="M12 5.6a6.3 6.3 0 0 0-5.4 9.5L5.7 18.4l3.4-.9A6.3 6.3 0 1 0 12 5.6Z" fill="#fff"/><path d="M9.5 8.4c-.2-.4-.3-.4-.5-.4h-.4c-.15 0-.4.06-.6.3-.2.24-.78.76-.78 1.85 0 1.1.8 2.15.9 2.3.12.15 1.57 2.5 3.9 3.4 1.93.76 2.32.6 2.74.57.42-.04 1.36-.56 1.55-1.1.2-.54.2-1 .14-1.1-.06-.1-.22-.16-.46-.28-.24-.12-1.36-.67-1.57-.75-.21-.08-.36-.12-.52.12-.15.24-.59.75-.72.9-.13.15-.26.17-.5.06-.24-.12-1-.37-1.9-1.18-.7-.62-1.18-1.4-1.31-1.64-.13-.24-.01-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.52-1.3-.72-1.78Z" fill="#25D366"/></svg>
    );
    case "facebook": return (
      <svg viewBox="0 0 24 24" style={s} aria-label="Facebook"><rect x="1.5" y="1.5" width="21" height="21" rx="6" fill="#1877F2"/><path d="M14.6 12.3h-1.9V19h-2.8v-6.7H8.5V9.9h1.4V8.5c0-1.9 1.1-2.9 2.8-2.9.8 0 1.5.06 1.7.09v2h-1.2c-.9 0-1.1.43-1.1 1.06v1.2h2.2l-.3 2.4Z" fill="#fff"/></svg>
    );
    case "youtube": return (
      <svg viewBox="0 0 24 24" style={s} aria-label="YouTube"><rect x="1.5" y="4.5" width="21" height="15" rx="4" fill="#FF0000"/><path d="M10 9.2l5 2.8-5 2.8V9.2Z" fill="#fff"/></svg>
    );
    default: return (
      <svg viewBox="0 0 24 24" style={s} aria-label="Online"><circle cx="12" cy="12" r="10" fill="none" stroke="var(--brand-blue)" strokeWidth="1.8"/><path d="M2 12h20M12 2c3 3 3 17 0 20M12 2c-3 3-3 17 0 20" fill="none" stroke="var(--brand-blue)" strokeWidth="1.8"/></svg>
    );
  }
}

/* ---------- platform / location chips (shared by form preview + detail) ---------- */
function PlatformChip({ url }) {
  const p = ldMeetingPlatform(url);
  if (!p) return null;
  return <span className="bh-chip" style={{ color: p.color, background: "var(--gray-50)", display: "inline-flex", alignItems: "center", gap: 6 }}><PlatformLogo url={url} size={16} />{p.name}</span>;
}

/* ---------- LIST ---------- */
function CatalogList({ rows, enrollments, q, setQ, tier, setTier, onOpen, onAdd, onArchive }) {
  const byTier = rows.filter(r => tier === "All" || r.tier === tier);
  const shown = byTier.filter(r => q === "" || (r.title + r.code + r.provider).toLowerCase().includes(q.toLowerCase()));
  const pg = usePaged(shown, 8);
  const enrolledCount = (pid) => enrollments.filter(e => e.programId === pid && e.status !== "Declined" && e.status !== "Waitlisted").length;
  const totalSpend = rows.reduce((s, p) => s + ldProgramTotalGhs(p), 0);
  const stats = [
    { title: "Programs", value: rows.length },
    { title: "Running now", value: rows.filter(p => ldProgramStatus(p) === "In Progress").length },
    { title: "Mandatory", value: rows.filter(p => p.mandatory).length },
    { title: "Scheduled", value: rows.filter(p => ldProgramStatus(p) === "Scheduled").length },
    { title: "Est. spend", value: "GHS " + Math.round(totalSpend).toLocaleString() },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title="Program Catalog" subtitle="Build, schedule and cost every training program — instructor-led or hosted."
        actions={<Button variant="primary" icon="add-line" onClick={onAdd}>Add Program</Button>} />

      <div className="card cq-stats" style={{ padding: "var(--card-pad, 24px)" }}>
        <div className="cq-stat-grid">{stats.map((s, i) => <UI.StatCard key={s.title} title={s.title} value={s.value} index={i} />)}</div>
      </div>

      <div className="card" style={{ padding: 20 }}>
          <div className="bh-tablebox">
          <UI.FilterBar left={<Segmented items={PROGRAM_TABS} active={tier} onChange={setTier} />}
            search={q} onSearch={setQ} searchPlaceholder="Search programs…" />
          {shown.length === 0
            ? <EmptyState title="No programs found" subtitle="Add a program or adjust your filters." />
            : <table className="bh">
                <thead><tr>
                  <th>Program</th><th>Tier</th><th>Mode</th><th>Schedule</th><th>Enrolled</th><th>Total Cost</th><th>Status</th><th style={{ width: 48 }}></th>
                </tr></thead>
                <tbody>
                  {pg.pageItems.map(p => {
                    const tier = LD_TIER[p.tier] || {};
                    const status = ldProgramStatus(p);
                    const plat = isOnlineMode(p.mode) ? ldMeetingPlatform(p.meetingLink) : null;
                    return (
                      <tr key={p.id} style={{ cursor: "pointer" }} onClick={() => onOpen(p)}>
                        <td>
                          <span style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontWeight: 600, color: "var(--gray-900)" }}>{p.title}{p.mandatory && <span className="bh-chip" style={{ marginLeft: 8, fontSize: 11, color: "var(--brand-blue)", background: "#F4F7FF" }}>Mandatory</span>}</span>
                            <span style={{ fontSize: 12, color: "var(--gray-400)" }}>{p.code} · {p.provider}</span>
                          </span>
                        </td>
                        <td><span className="bh-chip" style={{ color: tier.color, background: tier.tint }}>{p.tier}</span></td>
                        <td>{p.mode === "In-person" ? <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Icon name={modeIcon(p.mode)} size={15} color="var(--gray-500)" />{p.mode}</span> : <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>{plat ? <PlatformLogo url={p.meetingLink} size={16} /> : <Icon name={modeIcon(p.mode)} size={15} color="var(--gray-500)" />}{p.mode}</span>}</td>
                        <td>{p.startDate}</td>
                        <td>{enrolledCount(p.id)}{p.seats ? <span style={{ color: "var(--gray-400)" }}> / {p.seats}</span> : ""}</td>
                        <td style={{ whiteSpace: "nowrap", fontWeight: 600, color: "var(--gray-900)" }}>{ldProgramTotalGhs(p) ? "GHS " + Math.round(ldProgramTotalGhs(p)).toLocaleString() : "Free"}</td>
                        <td><StatusBadge variant={LD_PROGRAM_VARIANT[status] || "draft"} text={status} size="sm" /></td>
                        <td style={{ textAlign: "right" }} onClick={e => e.stopPropagation()}>
                          <UI.RowActions actions={[
                            { label: "View Details", short: "View", icon: "eye-line", onClick: () => onOpen(p) },
                            { label: "Edit Program", short: "Edit", icon: "edit-2-line", onClick: () => onOpen(p, true) },
                            { label: "Archive Program", short: "Archive", icon: "archive-line", danger: true, onClick: () => onArchive(p) },
                          ]} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>}
          {shown.length > 0 && <div style={{ borderTop: "1px solid var(--divider)" }}><Pagination page={pg.page} pages={pg.pages} onPrev={pg.prev} onNext={pg.next} /></div>}
          </div>
      </div>
    </div>
  );
}

/* ---------- CREATE / EDIT (full page) ---------- */
function CatalogForm({ initial, onCancel, onSubmit }) {
  const [f, setF] = useCat(initial || {
    title: "", code: "", tier: "Tier 1", provider: "", mode: "In-person",
    objectives: "", startDate: "", endDate: "", dueDate: "", venue: "", seats: "", mandatory: false,
    meetingLink: "", locationLink: "", coordinator: "", flier: "",
    feeAmount: "", feeCurrency: "GHS", associated: [],
  });
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const setAssoc = (i, k, v) => setF(s => ({ ...s, associated: s.associated.map((a, j) => j === i ? { ...a, [k]: v } : a) }));
  const addAssoc = () => setF(s => ({ ...s, associated: [...s.associated, { label: "", amount: "", currency: "GHS" }] }));
  const rmAssoc = (i) => setF(s => ({ ...s, associated: s.associated.filter((_, j) => j !== i) }));
  const valid = f.title && f.code && f.provider && f.startDate && f.tier &&
    (!isOnlineMode(f.mode) || f.meetingLink) && (!isPhysicalMode(f.mode) || f.venue);
  const section = (t, sub) => (
    <div style={{ marginTop: 4 }}>
      <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 18, color: "var(--gray-900)" }}>{t}</div>
      {sub && <div className="bh-body" style={{ marginTop: 2 }}>{sub}</div>}
    </div>
  );
  const dateOpt = { month: "short", day: "2-digit", year: "numeric" };
  return (
    <div className="card" style={{ padding: "var(--card-pad, 24px)", overflow: "visible" }}>
      <div style={{ marginBottom: 8 }}>
        <div className="bh-h2" style={{ fontSize: 24 }}>{initial ? "Edit Program" : "Create Program"}</div>
        <div className="bh-body" style={{ marginTop: 4 }}>Define a program, set how it's delivered, and capture its multi-currency cost. The status is set automatically from the dates.</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {section("Program Details")}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
          <Field label="Program Title"><Input value={f.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Leadership Development Programme" /></Field>
          <Field label="Program Code"><Input value={f.code} onChange={e => set("code", e.target.value)} placeholder="e.g. LEAD-26" /></Field>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <Field label="Needs Tier"><Combobox value={f.tier} onChange={v => set("tier", v)} options={["Tier 1", "Tier 2", "Tier 3"]} placeholder="Select tier" /></Field>
          <Field label="Provider"><Input value={f.provider} onChange={e => set("provider", e.target.value)} placeholder="e.g. National Banking College" /></Field>
        </div>
        <Field label="Objectives"><UI.RichText value={f.objectives} onChange={v => set("objectives", v)} placeholder="What capability will this program build?" /></Field>
        <Checkbox checked={f.mandatory} onChange={v => set("mandatory", v)} label="Mandatory / compliance program (recurring)" />

        <div style={{ height: 1, background: "var(--border)" }} />
        {section("Delivery", "How will participants attend? Online programs take a meeting link; in-person programs take a venue & map location.")}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 20 }}>
          <Field label="Delivery Mode"><UI.RadioPillGroup value={f.mode} onValueChange={v => set("mode", v)} options={MODES.map(m => ({ value: m, label: m }))} /></Field>
          <Field label="Seats / Capacity"><Input type="number" value={f.seats} onChange={e => set("seats", e.target.value)} placeholder="e.g. 30" /></Field>
        </div>
        {isOnlineMode(f.mode) && (
          <Field label="Meeting Link" hint="Paste a Teams / Zoom / Google Meet / Webex link — we detect the platform automatically.">
            <Input value={f.meetingLink} onChange={e => set("meetingLink", e.target.value)} placeholder="https://teams.microsoft.com/… or https://zoom.us/j/…" />
            {f.meetingLink && <div style={{ marginTop: 8 }}><PlatformChip url={f.meetingLink} /></div>}
          </Field>
        )}
        {isPhysicalMode(f.mode) && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <Field label="Venue"><Input value={f.venue} onChange={e => set("venue", e.target.value)} placeholder="e.g. NBC Accra, Training Room 2" /></Field>
            <Field label="Location Link" hint="Google Maps link or address" optional>
              <Input value={f.locationLink} onChange={e => set("locationLink", e.target.value)} placeholder="https://maps.google.com/?q=…" />
              {f.locationLink && <a href={f.locationLink} target="_blank" rel="noreferrer" style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 13, color: "var(--brand-blue)" }}><Icon name="map-pin-2-line" size={14} color="var(--brand-blue)" />Open in Maps</a>}
            </Field>
          </div>
        )}
        {isOnlineMode(f.mode) && !isPhysicalMode(f.mode) && (
          <Field label="Platform / Host (label)" optional><Input value={f.venue} onChange={e => set("venue", e.target.value)} placeholder="e.g. MS Teams, Intuition LMS" /></Field>
        )}
        <Field label="Internal Event Coordinator" hint="An employee who can view attendees and mark attendance for this program — alongside L&D admins." optional>
          <Combobox value={f.coordinator} onChange={v => set("coordinator", v || "")} options={LD_LEARNERS} placeholder="Select an employee" avatar />
        </Field>

        <div style={{ height: 1, background: "var(--border)" }} />
        {section("Schedule", "Dates drive the program status automatically — participants are auto-notified of any change.")}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
          <Field label="Start Date"><UI.DatePicker value={f.startDate} onSelect={d => set("startDate", d.toLocaleDateString("en-US", dateOpt))} placeholder="Pick start date" /></Field>
          <Field label="End Date"><UI.DatePicker value={f.endDate} onSelect={d => set("endDate", d.toLocaleDateString("en-US", dateOpt))} placeholder="Pick end date" /></Field>
          <Field label="Completion Due"><UI.DatePicker value={f.dueDate} onSelect={d => set("dueDate", d.toLocaleDateString("en-US", dateOpt))} placeholder="Pick due date" /></Field>
        </div>

        <div style={{ height: 1, background: "var(--border)" }} />
        {section("Media", "A flier / cover image represents the program in lists and as a banner on its page.")}
        <Field label="Flier / Cover Image" optional><div style={{ maxWidth: 360 }}><ImageSlot value={f.flier} onChange={v => set("flier", v)} label="Add a flier" hint="PNG, JPG or WEBP — 16:9 looks best" /></div></Field>

        <div style={{ height: 1, background: "var(--border)" }} />
        {section("Cost Model", "A single program may mix currencies — direct course fee plus associated costs.")}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, alignItems: "end" }}>
          <Field label="Direct / Course Fee"><Input type="number" value={f.feeAmount} onChange={e => set("feeAmount", e.target.value)} placeholder="0.00" /></Field>
          <Field label="Currency"><Combobox value={f.feeCurrency} onChange={v => set("feeCurrency", v)} options={CURRENCIES} placeholder="GHS" /></Field>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {f.associated.map((a, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 40px", gap: 12, alignItems: "center" }}>
              <Input value={a.label} onChange={e => setAssoc(i, "label", e.target.value)} placeholder="Associated cost (meals, travel, emoluments…)" />
              <Input type="number" value={a.amount} onChange={e => setAssoc(i, "amount", e.target.value)} placeholder="0.00" />
              <Combobox value={a.currency} onChange={v => setAssoc(i, "currency", v)} options={CURRENCIES} placeholder="GHS" />
              <button onClick={() => rmAssoc(i)} style={{ border: 0, background: "none", cursor: "pointer", display: "flex", justifyContent: "center" }}><Icon name="delete-bin-line" size={18} color="#EF4444" /></button>
            </div>
          ))}
          <button onClick={addAssoc} style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 6, border: 0, background: "none", cursor: "pointer", padding: 0, fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 13, color: "var(--brand-yellow-dark)" }}>
            <Icon name="add-line" size={16} color="var(--brand-yellow-dark)" />Add associated cost
          </button>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
        <Button variant="stroke" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" icon={initial ? "check-line" : "add-line"} disabled={!valid} onClick={() => valid && onSubmit(f)}>{initial ? "Save Changes" : "Create Program"}</Button>
      </div>
    </div>
  );
}

/* ---------- DETAIL ---------- */
function CatalogDetail({ program, enrollments, canMarkAttendance, onMarkAttendance, onEnroll, onEdit, onBack }) {
  const p = program;
  const status = ldProgramStatus(p);
  const enrolled = enrollments.filter(e => e.programId === p.id);
  const [attMode, setAttMode] = useCat(false);
  const plat = isOnlineMode(p.mode) ? ldMeetingPlatform(p.meetingLink) : null;
  const info = [
    { label: "Program Code", value: p.code }, { label: "Needs Tier", value: (LD_TIER[p.tier] || {}).label || p.tier },
    { label: "Provider", value: p.provider }, { label: "Delivery Mode", value: p.mode },
    { label: "Capacity", value: p.seats ? `${p.seats} seats` : "—" }, { label: "Coordinator", value: p.coordinator || "—" },
    { label: "Start Date", value: p.startDate }, { label: "End Date", value: p.endDate },
    { label: "Completion Due", value: p.dueDate },
  ];
  const costRows = [];
  if (p.cost) {
    costRows.push({ label: "Direct / Course Fee", value: ldMoney(p.cost.directFee.amount, p.cost.directFee.currency) });
    (p.cost.associated || []).forEach(a => costRows.push({ label: a.label, value: ldMoney(a.amount, a.currency) }));
  }
  const byStatus = (s) => enrolled.filter(e => e.status === s).length;
  const markable = (e) => e.status === "Confirmed" || e.status === "Attended" || e.status === "No-show" || e.status === "Invited";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title={p.title} subtitle={`${p.code} · ${p.provider}`}
        actions={onBack
          ? <React.Fragment>
              <StatusBadge variant={LD_PROGRAM_VARIANT[status] || "draft"} text={status} />
              <Button variant="stroke" icon="arrow-left-line" onClick={onBack}>Back</Button>
            </React.Fragment>
          : <React.Fragment>
              <StatusBadge variant={LD_PROGRAM_VARIANT[status] || "draft"} text={status} />
              <Button variant="stroke" icon="edit-2-line" onClick={onEdit}>Edit</Button>
              <Button variant="primary" icon="user-add-line" onClick={onEnroll}>Enroll Learners</Button>
            </React.Fragment>} />

      {p.flier && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ display: "flex", gap: 0, flexWrap: "wrap" }}>
            <img src={p.flier} alt="Program flier" style={{ width: 260, maxWidth: "100%", objectFit: "cover", display: "block" }} />
            <div style={{ flex: 1, minWidth: 240, padding: "18px 20px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 10 }}>
              <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 15, color: "var(--gray-900)" }}>Program flier</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <span className="bh-chip"><Icon name={modeIcon(p.mode)} size={13} color="var(--gray-500)" style={{ marginRight: 5 }} />{p.mode}</span>
                {plat && <PlatformChip url={p.meetingLink} />}
                <span className="bh-chip"><Icon name="calendar-event-line" size={13} color="var(--gray-500)" style={{ marginRight: 5 }} />{p.startDate}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="pd-split">
        <div className="pd-main" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card" style={{ padding: 0 }}>
            <DetailCard icon="information-line" title="Program Information">
              {p.objectives && <div className="bh-rte" style={{ marginBottom: 16, color: "var(--gray-700)", fontSize: 14, lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: p.objectives }} />}
              <DetailPanel items={info} tint="gray" cols={3} />
            </DetailCard>
          </div>

          {/* Logistics — meeting link / location */}
          <div className="card" style={{ padding: 0 }}>
            <DetailCard icon={modeIcon(p.mode)} title="How to attend">
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {isOnlineMode(p.mode) && (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", border: "1px solid var(--border)", borderRadius: 10 }}>
                    <span style={{ width: 38, height: 38, borderRadius: 9, background: "var(--gray-50)", display: "grid", placeItems: "center", flex: "none" }}>{plat ? <PlatformLogo url={p.meetingLink} size={22} /> : <Icon name="global-line" size={20} color="var(--brand-blue)" />}</span>
                    <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 14, color: "var(--gray-900)" }}>{(plat && plat.name) || "Online"}</div><div style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--gray-400)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 320 }}>{p.meetingLink || "—"}</div></div>
                    {p.meetingLink && <a href={p.meetingLink} target="_blank" rel="noreferrer"><Button variant="primary" size="sm" icon="vidicon-line">Join</Button></a>}
                  </div>
                )}
                {isPhysicalMode(p.mode) && (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", border: "1px solid var(--border)", borderRadius: 10 }}>
                    <span style={{ width: 38, height: 38, borderRadius: 9, background: "var(--gray-50)", display: "grid", placeItems: "center", flex: "none" }}><Icon name="map-pin-2-line" size={20} color="var(--error)" /></span>
                    <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 14, color: "var(--gray-900)" }}>{p.venue || "Venue TBC"}</div><div style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--gray-400)" }}>In-person</div></div>
                    {p.locationLink && <a href={p.locationLink} target="_blank" rel="noreferrer"><Button variant="stroke" size="sm" icon="road-map-line">Directions</Button></a>}
                  </div>
                )}
              </div>
            </DetailCard>
          </div>

          {/* Enrolled learners + attendance */}
          <div className="card" style={{ padding: 0 }}>
            <DetailCard icon="group-line" title={`Enrolled Learners (${enrolled.length})`}
              action={canMarkAttendance && enrolled.length > 0 ? <Button variant={attMode ? "primary" : "stroke"} size="sm" icon={attMode ? "check-line" : "user-follow-line"} onClick={() => setAttMode(m => !m)}>{attMode ? "Done" : "Mark Attendance"}</Button> : null}>
              {canMarkAttendance && (
                <div style={{ marginBottom: 12, padding: "8px 12px", borderRadius: 8, background: "var(--brand-yellow-tint)", fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--brand-yellow-dark)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <Icon name="shield-user-line" size={14} color="var(--brand-yellow-dark)" />{p.coordinator === LD_ME ? "You are the event coordinator — you can mark attendance." : "Admin — you can mark attendance."}
                </div>
              )}
              {enrolled.length === 0
                ? <EmptyState compact title="No one enrolled yet" subtitle="Use Enroll Learners to add participants to this program." />
                : <table className="bh" style={{ margin: 0 }}>
                    <thead><tr><th>Learner</th><th>Department</th><th>Source</th><th>{attMode ? "Attendance" : "Status"}</th></tr></thead>
                    <tbody>
                      {enrolled.map(e => (
                        <tr key={e.id}>
                          <td><span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}><Avatar name={e.learner} size={32} />
                            <span style={{ display: "flex", flexDirection: "column" }}><span style={{ fontWeight: 500, color: "var(--gray-900)" }}>{e.learner}</span><span style={{ fontSize: 12, color: "var(--gray-400)" }}>{e.staffId}</span></span></span></td>
                          <td>{e.dept}</td><td>{e.source}</td>
                          <td>
                            {attMode && markable(e)
                              ? <div style={{ display: "flex", gap: 8 }}>
                                  <button onClick={() => onMarkAttendance(e.id, "Attended")} style={{ cursor: "pointer", border: `1.5px solid ${e.status === "Attended" ? "var(--success)" : "var(--gray-200)"}`, background: e.status === "Attended" ? "var(--success-tint)" : "#fff", color: e.status === "Attended" ? "var(--success-deep)" : "var(--gray-500)", borderRadius: 8, padding: "5px 12px", fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 12.5, display: "inline-flex", alignItems: "center", gap: 5 }}><Icon name="check-line" size={14} color={e.status === "Attended" ? "var(--success-deep)" : "var(--gray-400)"} />Present</button>
                                  <button onClick={() => onMarkAttendance(e.id, "No-show")} style={{ cursor: "pointer", border: `1.5px solid ${e.status === "No-show" ? "var(--error)" : "var(--gray-200)"}`, background: e.status === "No-show" ? "var(--error-tint)" : "#fff", color: e.status === "No-show" ? "var(--error)" : "var(--gray-500)", borderRadius: 8, padding: "5px 12px", fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 12.5, display: "inline-flex", alignItems: "center", gap: 5 }}><Icon name="close-line" size={14} color={e.status === "No-show" ? "var(--error)" : "var(--gray-400)"} />Absent</button>
                                </div>
                              : <StatusBadge variant={LD_ENROLL_VARIANT[e.status]} text={e.status} size="sm" />}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>}
            </DetailCard>
          </div>
        </div>
        <div className="pd-side" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card" style={{ padding: 0 }}>
            <DetailCard icon="money-dollar-circle-line" title="Cost Breakdown">
              <DetailPanel items={costRows} tint="cream" cols={1} />
              <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 10, background: "var(--gray-50)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--gray-500)" }}>Est. total (≈GHS)</span>
                <span style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 18, color: "var(--gray-900)" }}>GHS {Math.round(ldProgramTotalGhs(p)).toLocaleString()}</span>
              </div>
            </DetailCard>
          </div>
          {p.coordinator && (
            <div className="card" style={{ padding: 0 }}>
              <DetailCard icon="user-star-line" title="Event Coordinator">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar name={p.coordinator} size={42} />
                  <div><div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 14.5, color: "var(--gray-900)" }}>{p.coordinator}</div><div style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--gray-400)" }}>Can view attendees & mark attendance</div></div>
                </div>
              </DetailCard>
            </div>
          )}
          <div className="card" style={{ padding: 0 }}>
            <DetailCard icon="bar-chart-grouped-line" title="Enrollment">
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[["Confirmed", "approved"], ["Invited", "pending"], ["Waitlisted", "draft"], ["Attended", "completed"], ["Declined", "rejected"]].map(([s]) => (
                  <div key={s} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <StatusBadge variant={LD_ENROLL_VARIANT[s]} text={s} size="sm" />
                    <span style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 15, color: "var(--gray-900)" }}>{byStatus(s)}</span>
                  </div>
                ))}
              </div>
            </DetailCard>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- CONTROLLER ---------- */
function ProgramCatalogScreen({ onToast, onSubPage, onEnrollProgram }) {
  const [programs, setPrograms] = useStore(window.HRStores.ldPrograms);
  const [enrollments, setEnrollments] = useStore(window.HRStores.ldEnrollments);
  const [q, setQ] = useCat("");
  const [tier, setTier] = useCat("All");
  const [view, setView] = useCat({ name: "list" });
  const [confirm, setConfirm] = useCat(null);

  useCatEffect(() => {
    if (!onSubPage) return;
    const toList = () => setView({ name: "list" });
    if (view.name === "create") onSubPage({ trail: [{ label: "Program Catalog", onClick: toList }, { label: "Create Program" }] });
    else if (view.name === "edit") onSubPage({ trail: [{ label: "Program Catalog", onClick: toList }, { label: "Edit Program" }] });
    else if (view.name === "detail") onSubPage({ trail: [{ label: "Program Catalog", onClick: toList }, { label: (programs.find(p => p.id === view.id) || {}).title || "Program" }] });
    else onSubPage(null);
    return () => onSubPage(null);
  }, [view, programs]);

  const current = view.id ? programs.find(p => p.id === view.id) : null;
  const toProgram = (f) => {
    const cost = { directFee: { amount: Number(f.feeAmount) || 0, currency: f.feeCurrency }, associated: (f.associated || []).filter(a => a.label).map(a => ({ label: a.label, amount: Number(a.amount) || 0, currency: a.currency })) };
    const { feeAmount, feeCurrency, associated, ...rest } = f;
    return { ...rest, cost };
  };
  const markAttendance = (enrollmentId, status) => {
    setEnrollments(es => es.map(e => e.id === enrollmentId ? { ...e, status } : e));
    onToast(status === "Attended" ? "Marked present" : "Marked absent", { tone: status === "Attended" ? "success" : "error" });
  };
  const submit = (f) => setConfirm({ kind: view.name === "edit" ? "edit" : "add", form: f, id: view.id });
  const run = () => {
    const c = confirm;
    if (c.kind === "add") {
      const p = { id: ldId(), ...toProgram(c.form) };
      setPrograms(ps => [p, ...ps]); onToast("Program Created", { tone: "success" }); setView({ name: "list" });
    } else if (c.kind === "edit") {
      const p = toProgram(c.form);
      setPrograms(ps => ps.map(x => x.id === c.id ? { ...x, ...p } : x)); onToast("Program Updated", { tone: "success" }); setView({ name: "detail", id: c.id });
    } else if (c.kind === "archive") {
      setPrograms(ps => ps.filter(x => x.id !== c.row.id)); onToast("Program Archived", { tone: "error" }); setView({ name: "list" });
    }
    setConfirm(null);
  };

  let body;
  if (view.name === "create") body = <CatalogForm onCancel={() => setView({ name: "list" })} onSubmit={submit} />;
  else if (view.name === "edit" && current) {
    const init = { ...current, feeAmount: current.cost.directFee.amount, feeCurrency: current.cost.directFee.currency, associated: (current.cost.associated || []).map(a => ({ ...a })) };
    body = <CatalogForm initial={init} onCancel={() => setView({ name: "detail", id: current.id })} onSubmit={submit} />;
  } else if (view.name === "detail" && current) body = <CatalogDetail program={current} enrollments={enrollments}
    canMarkAttendance={true} onMarkAttendance={markAttendance}
    onEnroll={() => onEnrollProgram && onEnrollProgram(current.id)} onEdit={() => setView({ name: "edit", id: current.id })} />;
  else body = <CatalogList rows={programs} enrollments={enrollments} q={q} setQ={setQ} tier={tier} setTier={setTier}
    onOpen={(p, edit) => setView({ name: edit ? "edit" : "detail", id: p.id })} onAdd={() => setView({ name: "create" })}
    onArchive={(p) => setConfirm({ kind: "archive", row: p })} />;

  const CC = { add: ["Create Program", "create this program", "Yes, Create", "add-line", "Cancel"], edit: ["Save Changes", "save changes to this program", "Yes, Save", "check-line", "Cancel"], archive: ["Archive Program", "archive this program", "Yes, Archive", "archive-line", "No"] };
  return (
    <React.Fragment>
      {body}
      {confirm && (() => { const [t, m, l, i, cancel] = CC[confirm.kind]; return (
        <ConfirmModal title={t} message={`Are you sure you want to ${m}?`} confirmLabel={l} confirmIcon={i} cancelLabel={cancel} onConfirm={run} onClose={() => setConfirm(null)} />
      ); })()}
    </React.Fragment>
  );
}

Object.assign(window, { ProgramCatalogScreen, CatalogDetail, modeIcon });
