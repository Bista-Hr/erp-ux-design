// FLOW REVAMP (standalone proposal) · kit — minimal UI primitives that reuse the live
// BISTA HR CSS classes (../colors_and_type.css + ../bista-components.css) so this prototype
// looks identical to the product without importing the whole src/ tree. Self-contained.
const { useState: useKitState } = React;

function Icon({ name, size = 18, color, style }) {
  return <i className={"ri-" + name} style={{ fontSize: size, color, lineHeight: 1, ...style }} />;
}

function Btn({ variant = "primary", size, icon, iconRight, children, onClick, disabled, style, danger, title }) {
  const cls = ["btn", `btn-${variant}`, size === "sm" ? "btn-sm" : size === "xs" ? "btn-xs" : "", !children ? "btn-icon" : ""].filter(Boolean).join(" ");
  const ds = danger ? { color: "#fff", background: "var(--error)", borderColor: "var(--error)" } : {};
  return (
    <button className={cls} onClick={onClick} disabled={disabled} title={title} style={{ ...ds, ...style }}>
      {icon && <Icon name={icon} size={size === "sm" ? 16 : 18} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === "sm" ? 16 : 18} />}
    </button>
  );
}

// deterministic soft avatar color from a name
const AV_COLORS = ["#375DFB", "#C11574", "#6941C6", "#0C7792", "#C2540A", "#086333", "#B42318", "#5925DC"];
function avatarColor(name = "") { let h = 0; for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h); return AV_COLORS[Math.abs(h) % AV_COLORS.length]; }
function initials(name = "") { return name.split(" ").filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase(); }
function Avatar({ name, size = 36, src }) {
  const bg = avatarColor(name);
  return (
    <span style={{ width: size, height: size, borderRadius: "50%", background: src ? "#eee" : bg, color: "#fff",
      display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      fontFamily: "var(--font-head)", fontWeight: 700, fontSize: size * 0.4, overflow: "hidden" }}>
      {src ? <img src={src} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials(name)}
    </span>
  );
}

// status badge — bordered tinted pill with a leading dot
const BADGE = {
  approved:  { bg: "var(--success-tint)", fg: "var(--success-deep)", dot: "var(--success-bright)" },
  pending:   { bg: "var(--warning-tint)", fg: "var(--warning-deep)", dot: "#F79009" },
  rejected:  { bg: "var(--error-tint)",   fg: "var(--error)",        dot: "var(--error)" },
  open:      { bg: "#EFF4FF",             fg: "var(--brand-blue)",   dot: "var(--brand-blue)" },
  neutral:   { bg: "var(--gray-100)",     fg: "var(--gray-600, var(--gray-700))", dot: "var(--gray-400)" },
  info:      { bg: "#EFF4FF",             fg: "var(--brand-blue)",   dot: "var(--brand-blue)" },
  ld:        { bg: "#F4F0FF",             fg: "#6941C6",             dot: "#6941C6" },
};
function Badge({ variant = "neutral", children, size }) {
  const c = BADGE[variant] || BADGE.neutral;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: c.bg, color: c.fg,
      borderRadius: 999, padding: size === "sm" ? "3px 10px 3px 9px" : "4px 12px 4px 10px",
      fontFamily: "var(--font-control)", fontWeight: 600, fontSize: size === "sm" ? 12 : 12.5, lineHeight: 1.4, whiteSpace: "nowrap" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
      {children}
    </span>
  );
}

// page-header card (title + subtitle + actions) — always its own white card
function PageHeader({ title, subtitle, actions, icon }) {
  return (
    <div className="card" style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: 16, boxShadow: "var(--shadow-card)" }}>
      {icon && (
        <span style={{ width: 46, height: 46, borderRadius: 13, background: "var(--brand-yellow-tint)", border: "1px solid #F2E6A8",
          display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name={icon} size={24} color="var(--brand-yellow-dark)" />
        </span>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="bh-h2" style={{ fontSize: 22 }}>{title}</div>
        {subtitle && <div className="bh-body" style={{ marginTop: 3 }}>{subtitle}</div>}
      </div>
      {actions && <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>{actions}</div>}
    </div>
  );
}

function EmptyState({ title, subtitle, icon = "inbox-line", action, compact }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: compact ? "44px 24px" : "64px 24px" }}>
      <span style={{ width: 60, height: 60, borderRadius: 16, background: "var(--gray-50)", border: "1px solid var(--border)",
        display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
        <Icon name={icon} size={28} color="var(--gray-400)" />
      </span>
      <div className="bh-h4" style={{ fontSize: 17 }}>{title}</div>
      {subtitle && <div className="bh-body" style={{ marginTop: 4, maxWidth: 360 }}>{subtitle}</div>}
      {action && <div style={{ marginTop: 18 }}>{action}</div>}
    </div>
  );
}

// stat tile — alternating tints per the BISTA convention (odd=red-50, even=yellow-50)
function StatCard({ label, value, sub, idx = 0, icon }) {
  const tint = idx % 2 === 0 ? "var(--error-tint)" : "var(--brand-yellow-tint)";
  return (
    <div style={{ background: tint, border: "1px solid var(--border)", borderRadius: 14, padding: "16px 18px", flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {icon && <Icon name={icon} size={16} color="var(--gray-500)" />}
        <span style={{ fontFamily: "var(--font-ui)", fontWeight: 300, fontSize: 13.5, color: "var(--gray-500)" }}>{label}</span>
      </div>
      <div style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 30, color: "var(--gray-900)", marginTop: 6, letterSpacing: "-0.02em" }}>{value}</div>
      {sub && <div className="bh-caption" style={{ marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// segmented sub-tab control
function SubTabs({ items, active, onChange }) {
  return (
    <div className="tabs" style={{ gap: 22 }}>
      {items.map(it => (
        <button key={it} className={"tab" + (it === active ? " active" : "")} onClick={() => onChange(it)}>{it}</button>
      ))}
    </div>
  );
}

// labelled field + input/textarea/select (reuses .field / .input-wrap)
function Field({ label, optional, hint, children }) {
  return (
    <div className="field" style={{ flex: 1, minWidth: 0 }}>
      {label && <label>{label}{optional && <span className="opt"> (optional)</span>}</label>}
      {children}
      {hint && <span className="hint">{hint}</span>}
    </div>
  );
}
function Input({ icon, ...p }) {
  return <div className="input-wrap">{icon && <Icon name={icon} />}<input {...p} /></div>;
}
function Textarea({ rows = 4, ...p }) {
  return <div className="input-wrap" style={{ alignItems: "flex-start" }}><textarea rows={rows} {...p} /></div>;
}
function Select({ value, onChange, options, placeholder }) {
  return (
    <div className="input-wrap" style={{ paddingRight: 8 }}>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ flex: 1, border: 0, outline: 0, background: "transparent", fontFamily: "var(--font-control)", fontSize: 14, color: value ? "var(--gray-900)" : "var(--gray-400)", cursor: "pointer" }}>
        <option value="" disabled>{placeholder || "Select…"}</option>
        {options.map(o => <option key={o} value={o} style={{ color: "var(--gray-900)" }}>{o}</option>)}
      </select>
      <Icon name="arrow-down-s-line" color="var(--gray-400)" />
    </div>
  );
}

// progress ring
function Ring({ value = 0, size = 52, stroke = 5, color = "var(--success)" }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, off = c * (1 - value / 100);
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--gray-150)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} />
    </svg>
  );
}

// the bordered table box (PageHeader card stays separate; search + table live here)
function TableBox({ toolbar, children }) {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div className="bh-tablebox">
        {toolbar}
        {children}
      </div>
    </div>
  );
}

// a search-only / search+filter toolbar flush at the top of a TableBox
function Toolbar({ left, search, onSearch, placeholder = "Search…", right }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "14px 16px", borderBottom: "1px solid var(--divider)", flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>{left}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {onSearch && <div style={{ width: 260, maxWidth: "100%" }}><Input icon="search-line" placeholder={placeholder} value={search} onChange={e => onSearch(e.target.value)} /></div>}
        {right}
      </div>
    </div>
  );
}

Object.assign(window, { Icon, Btn, Avatar, Badge, PageHeader, EmptyState, StatCard, SubTabs, Field, Input, Textarea, Select, Ring, TableBox, Toolbar, avatarColor, initials });
