// BISTA HR UI Kit — screens: Login, CRUD table screen, Create/Edit + Archive modals.

/* ---- LOGIN ---- */
const LOGIN_SLIDES = [
{
  img: "../../assets/login/slide-1.jpg",
  title: "BISTA HR & Workforce Management",
  body: "Manage recruitment, onboarding, promotions, transfers, and employee relations\u2014all in one streamlined platform. Save time and reduce manual errors with automated workflows"
},
{
  img: "../../assets/login/slide-2.jpg",
  title: "People-first HR, simplified",
  body: "Track leave, appraisals, and approvals in one place. Give every employee a clear, self-service experience from day one."
},
{
  img: "../../assets/login/slide-3.png",
  title: "Insights that move teams forward",
  body: "Real-time dashboards on headcount, performance, and engagement\u2014so you can act with confidence and keep teams aligned."
}];


function LoginScreen({ onContinue }) {
  const [domain, setDomain] = useState("");
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % LOGIN_SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);
  const slide = LOGIN_SLIDES[i];
  return (
    <div style={{ display: "flex", height: "100%", background: "#fff" }}>
      {/* LEFT — yellow auto-swiping carousel */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden", background: "var(--brand-yellow)",
        display: "flex", flexDirection: "column", justifyContent: "center", padding: "56px 64px" }}>
        {/* oil-droplet watermark blended into the yellow */}
        <div style={{ position: "absolute", left: "-8%", top: "50%", transform: "translateY(-50%)",
          width: 600, height: 760, backgroundImage: "url(../../assets/oil-droplet-bg.png)",
          backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "center",
          mixBlendMode: "soft-light", opacity: .7, pointerEvents: "none",
          WebkitMaskImage: "radial-gradient(115% 85% at 45% 42%, #000 30%, rgba(0,0,0,.35) 62%, transparent 84%)",
          maskImage: "radial-gradient(115% 85% at 45% 42%, #000 30%, rgba(0,0,0,.35) 62%, transparent 84%)" }} />

        <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 560, margin: "0 auto" }}>
          {/* sliding image track — edges feathered so the photo melts into the yellow */}
          <div style={{ overflow: "hidden", borderRadius: "var(--radius-xl)" }}>
            <div style={{ display: "flex", transition: "transform .7s cubic-bezier(.4,0,.2,1)", transform: `translateX(-${i * 100}%)` }}>
              {LOGIN_SLIDES.map((s, idx) =>
              <div key={idx} style={{ flex: "0 0 100%" }}>
                  <img src={s.img} alt="" style={{ width: "100%", display: "block", borderRadius: "var(--radius-xl)",
                  WebkitMaskImage: "radial-gradient(125% 120% at 50% 45%, #000 62%, rgba(0,0,0,.6) 82%, transparent 100%)",
                  maskImage: "radial-gradient(125% 120% at 50% 45%, #000 62%, rgba(0,0,0,.6) 82%, transparent 100%)" }} />
                </div>
              )}
            </div>
          </div>

          {/* rotating headline + body */}
          <div style={{ marginTop: 36 }}>
            <div style={{ fontFamily: "var(--font-ui)", fontSize: 38, lineHeight: 1.08,
              letterSpacing: "-0.02em", color: "var(--brand-ink)", fontWeight: "500" }}>{slide.title}</div>
            <p style={{ fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 17, lineHeight: 1.55,
              color: "rgba(16,16,16,.82)", marginTop: 16, marginBottom: 0, maxWidth: 560 }}>{slide.body}</p>
          </div>

          {/* progress indicator */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 32 }}>
            {LOGIN_SLIDES.map((_, idx) =>
            <button key={idx} onClick={() => setI(idx)} aria-label={`Go to slide ${idx + 1}`}
            style={{ height: 8, width: idx === i ? 36 : 8, borderRadius: 999, border: 0, padding: 0,
              background: idx === i ? "var(--brand-ink)" : "rgba(16,16,16,.30)", cursor: "pointer",
              transition: "width .4s ease, background .3s ease" }} />
            )}
          </div>
        </div>
      </div>

      {/* RIGHT — form */}
      <div style={{ flex: 1, background: "#fff", position: "relative", display: "flex",
        flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 56 }}>
        <div style={{ width: 416, display: "flex", flexDirection: "column", gap: 30, alignItems: "center" }}>
          <img src="../../assets/logo/gcb-logo.svg" style={{ width: 72, height: 72 }} alt="GCB logo" />
          <div style={{ textAlign: "center" }}>
            <div className="bh-h1">Welcome</div>
            <div className="bh-body" style={{ marginTop: 6, fontSize: 16 }}>Enter your organization domain to continue</div>
          </div>
          <Field label="Organizational Domain" style={{ width: "100%" }}>
            <Input icon="building-line" placeholder="eg. Starett-ltd" value={domain} onChange={(e) => setDomain(e.target.value)} />
          </Field>
          <button onClick={onContinue} style={{ width: "100%", border: 0, borderRadius: "var(--radius-md)",
            color: "#fff", fontFamily: "var(--font-control)", fontWeight: 600,
            fontSize: 15, padding: "16px 0", cursor: "pointer", transition: "background .15s", background: "rgb(22, 69, 100)" }}
          onMouseEnter={(e) => e.currentTarget.style.background = "#0B2C3C"}
          onMouseLeave={(e) => e.currentTarget.style.background = "#103B4F"}>Continue</button>
        </div>
        <div style={{ position: "absolute", bottom: 40, display: "flex", gap: 24 }}>
          <button className="btn btn-ghost btn-sm">Terms of Service</button>
          <button className="btn btn-ghost btn-sm">Privacy Policy</button>
        </div>
      </div>
    </div>);

}

/* ---- CRUD TABLE SCREEN ---- */
function CrudScreen({ config, rows, onCreate, onEdit, onArchive }) {
  const [filter, setFilter] = useState("All");
  const [q, setQ] = useState("");
  const [menu, setMenu] = useState(null);
  const shown = rows.filter((r) =>
  (filter === "All" || (filter === "Active" ? r.active : !r.active)) && (
  q === "" || r[config.cols[0].key].toLowerCase().includes(q.toLowerCase()))
  );
  return (
    <div className="card" style={{ overflow: "visible" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "20px 20px 16px" }}>
        <div>
          <div className="bh-h2" style={{ fontSize: 20 }}>{config.title}</div>
          <div className="bh-body" style={{ marginTop: 2 }}>{config.subtitle}</div>
        </div>
        <Button variant="primary" icon="add-line" onClick={onCreate}>{config.cta}</Button>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 20px 16px" }}>
        <Segmented items={["All", "Active", "Inactive"]} active={filter} onChange={setFilter} />
        <div className="input-wrap" style={{ flex: 1, maxWidth: 280, padding: "8px 12px" }}>
          <Icon name="search-2-line" size={18} style={{ color: "var(--icon-default)" }} />
          <input placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Button variant="stroke" size="sm" icon="equalizer-line">Show Filter</Button>
      </div>
      <table className="bh">
        <thead><tr>
          {config.cols.map((c) => <th key={c.key}>{c.label}</th>)}
          <th>Status</th><th style={{ width: 48 }}></th>
        </tr></thead>
        <tbody>
          {shown.map((r) =>
          <tr key={r.id}>
              {config.cols.map((c) => <td key={c.key}>{r[c.key]}</td>)}
              <td><StatusDot active={r.active} /></td>
              <td style={{ position: "relative", textAlign: "right" }}>
                <button className="btn btn-icon btn-ghost" style={{ width: 28, height: 28, padding: 0 }}
              onClick={() => setMenu(menu === r.id ? null : r.id)}>
                  <Icon name="more-2-fill" size={18} color="var(--gray-400)" />
                </button>
                {menu === r.id &&
              <div onMouseLeave={() => setMenu(null)} style={{ position: "absolute", right: 16, top: 40, zIndex: 20,
                background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-pop)",
                padding: 6, minWidth: 150, display: "flex", flexDirection: "column" }}>
                    <button className="menu-item" onClick={() => {setMenu(null);onEdit(r);}}><Icon name="edit-2-line" size={16} />Edit {config.noun}</button>
                    <button className="menu-item danger" onClick={() => {setMenu(null);onArchive(r);}}><Icon name="archive-line" size={16} />Archive {config.noun}</button>
                  </div>
              }
              </td>
            </tr>
          )}
          {shown.length === 0 &&
          <tr><td colSpan={config.cols.length + 2} style={{ textAlign: "center", padding: "48px 0", color: "var(--gray-400)" }}>
              <Icon name="inbox-line" size={28} /><div style={{ marginTop: 8, fontFamily: "var(--font-head)", fontWeight: 700, color: "var(--gray-500)" }}>No Data</div>
              <div className="bh-caption">There is no data to show you right now</div>
            </td></tr>
          }
        </tbody>
      </table>
      <div style={{ borderTop: "1px solid var(--divider)" }}><Pagination page={1} pages={1} /></div>
    </div>);

}

/* ---- CREATE / EDIT MODAL ---- */
function FormModal({ config, initial, onClose, onSave }) {
  const editing = !!initial;
  const [form, setForm] = useState(() => {
    const f = { active: true };
    config.fields.forEach((fl) => f[fl.key] = initial ? initial[fl.key] ?? "" : "");
    if (initial) f.active = initial.active;
    return f;
  });
  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));
  return (
    <Modal onClose={onClose} width={600}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "24px 24px 0" }}>
        <div>
          <div className="bh-title">{editing ? "Edit" : "Create"} {config.noun}</div>
          <div className="bh-body" style={{ marginTop: 2 }}>{editing ? `Update ${config.noun.toLowerCase()} information` : `Add a new ${config.noun.toLowerCase()} to your organization`}</div>
        </div>
        <button className="btn btn-icon btn-ghost" onClick={onClose} style={{ width: 32, height: 32, padding: 0 }}><Icon name="close-line" size={20} color="var(--gray-500)" /></button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, padding: 24 }}>
        {config.fields.map((fl) =>
        <Field key={fl.key} label={fl.label} optional={fl.optional} style={{ gridColumn: fl.full ? "1 / -1" : "auto" }}>
            {fl.type === "select" ?
          <Select value={form[fl.key]} onChange={(e) => set(fl.key, e.target.value)} options={fl.options} placeholder={fl.placeholder} /> :
          fl.type === "textarea" ?
          <Textarea placeholder={fl.placeholder} value={form[fl.key]} onChange={(e) => set(fl.key, e.target.value)} /> :
          <Input placeholder={fl.placeholder} value={form[fl.key]} onChange={(e) => set(fl.key, e.target.value)} />}
          </Field>
        )}
        <div style={{ gridColumn: "1 / -1" }}>
          <Checkbox checked={form.active} onChange={(v) => set("active", v)} label="Active" />
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: "0 24px 24px" }}>
        <Button variant="stroke" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={() => onSave(form)}>{editing ? "Update" : "Create"} {config.noun}</Button>
      </div>
    </Modal>);

}

/* ---- ARCHIVE / WARNING MODAL ---- */
function WarnModal({ noun, onClose, onConfirm }) {
  return (
    <Modal onClose={onClose} width={400}>
      <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center" }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--warning-tint)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="error-warning-fill" size={24} color="var(--warning)" />
        </div>
        <div>
          <div className="bh-title">Archive {noun}</div>
          <div className="bh-body" style={{ marginTop: 4 }}>Are you sure you want to archive this {noun.toLowerCase()}?</div>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
          <Button variant="stroke" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={onConfirm}>Yes, Archive</Button>
        </div>
      </div>
    </Modal>);

}

Object.assign(window, { LoginScreen, CrudScreen, FormModal, WarnModal });