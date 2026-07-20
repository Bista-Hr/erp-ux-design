// BISTA HR · primitives/controls — base form & layout controls.
// Each Babel <script> gets its own scope, so everything shared is exported on window.
const { useState, useRef, useEffect } = React;

/* ---- Avatar (deterministic color from a string, mirrors getStringColor) ---- */
const AVATAR_COLORS = [
  "#2563EB", "#9333EA", "#16A34A", "#EA580C", "#DB2777", "#4F46E5",
  "#0D9488", "#DC2626", "#0891B2", "#D97706", "#65A30D", "#059669",
  "#7C3AED", "#C026D3", "#E11D48", "#0284C7",
];
function getStringColor(str) {
  let hash = 0;
  for (let i = 0; i < (str || "").length; i++) {
    const ch = str.codePointAt(i) || 0;
    hash = (hash << 5) - hash + ch;
    hash = hash & hash;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
function Avatar({ name = "", size = 36, src }) {
  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  if (src) {
    return <img src={src} alt={name} style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0, objectFit: "cover", display: "inline-block" }} />;
  }
  return (
    <span style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: getStringColor(name), display: "inline-flex",
      alignItems: "center", justifyContent: "center", fontFamily: "var(--font-head)",
      fontWeight: 700, fontSize: size * 0.38, color: "#fff" }}>{initials}</span>
  );
}

/* ---- Icon (Remix Icon font) ---- */
function Icon({ name, size = 18, color, style }) {
  return <i className={`ri-${name}`} style={{ fontSize: size, color, lineHeight: 1, ...style }} />;
}

/* ---- Button ---- */
function Button({ variant = "primary", size = "md", icon, iconRight, children, onClick, disabled, style }) {
  const cls = `btn btn-${variant}` + (size === "sm" ? " btn-sm" : size === "xs" ? " btn-xs" : "")
    + (!children ? " btn-icon" : "");
  return (
    <button className={cls} onClick={onClick} disabled={disabled} style={style}>
      {icon && <Icon name={icon} size={size === "sm" ? 16 : 18} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === "sm" ? 16 : 18} />}
    </button>
  );
}

/* ---- ViewDetailsButton — small light-gray-bordered pill used in table rows to open a
   detail view. Reusable across any list page (Approvals, etc.). ---- */
function ViewDetailsButton({ label = "View Details", icon, onClick, style }) {
  return (
    <button onClick={onClick} style={{ display: "inline-flex", alignItems: "center", gap: 6,
      border: "1px solid var(--gray-200)", background: "#fff", borderRadius: 8, padding: "7px 14px",
      cursor: "pointer", fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 13, color: "var(--gray-800)",
      whiteSpace: "nowrap", transition: "background .15s, border-color .15s", ...style }}
      onMouseEnter={e => { e.currentTarget.style.background = "var(--gray-50)"; e.currentTarget.style.borderColor = "var(--gray-300)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "var(--gray-200)"; }}>
      {icon && <Icon name={icon} size={15} color="var(--gray-500)" />}{label}
    </button>
  );
}

/* ---- Field / Input ---- */
function Field({ label, optional, hint, children, style }) {
  return (
    <div className="field" style={style}>
      {label && <label>{label}{optional && <span className="opt"> (Optional)</span>}</label>}
      {children}
      {hint && <span className="hint">{hint}</span>}
    </div>
  );
}
function Input({ icon, infoIcon, ...props }) {
  return (
    <div className="input-wrap">
      {icon && <Icon name={icon} size={20} style={{ color: "var(--icon-default)" }} />}
      <input {...props} />
      {infoIcon && <Icon name={infoIcon} size={20} style={{ color: "var(--gray-300)" }} />}
    </div>
  );
}
function Textarea(props) {
  return <div className="input-wrap"><textarea {...props} /></div>;
}
function Select({ value, onChange, options, placeholder, icon }) {
  return (
    <div className="input-wrap" style={{ cursor: "pointer" }}>
      {icon && <Icon name={icon} size={18} style={{ color: "var(--icon-default)" }} />}
      <select value={value} onChange={onChange}
        style={{ flex: 1, border: 0, outline: 0, background: "transparent", appearance: "none",
          fontFamily: "var(--font-control)", fontSize: 14, color: value ? "var(--gray-900)" : "var(--gray-400)", cursor: "pointer" }}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <Icon name="arrow-down-s-line" size={20} style={{ color: "var(--icon-default)" }} />
    </div>
  );
}
function Checkbox({ checked, onChange, label }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--gray-900)" }}>
      <span onClick={() => onChange(!checked)} style={{ width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${checked ? "var(--brand-yellow-dark)" : "var(--gray-300)"}`,
        background: checked ? "var(--brand-yellow)" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {checked && <Icon name="check-line" size={14} color="var(--brand-ink)" />}
      </span>
      {label}
    </label>
  );
}

/* ---- Tabs / Segmented ---- */
function Tabs({ items, active, onChange }) {
  return (
    <div className="tabs">
      {items.map(t => <button key={t} className={`tab ${t === active ? "active" : ""}`} onClick={() => onChange(t)}>{t}</button>)}
    </div>
  );
}
function Segmented({ items, active, onChange, style }) {
  return (
    <div className="seg" style={{ background: "#F6F8FA", ...style }}>
      {items.map(t => <button key={t} className={t === active ? "active" : ""} onClick={() => onChange(t)}>{t}</button>)}
    </div>
  );
}

/* ---- Pagination (functional) ---- */
function Pagination({ page = 1, pages = 1, onPrev, onNext }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px" }}>
      <span className="bh-caption">Page {page} of {pages}</span>
      <div style={{ display: "flex", gap: 8 }}>
        <Button variant="stroke" size="sm" disabled={page <= 1} onClick={onPrev}>Previous</Button>
        <Button variant="stroke" size="sm" disabled={page >= pages} onClick={onNext}>Next</Button>
      </div>
    </div>
  );
}

/* viewport width hook — reusable responsive breakpoints (shell, login, etc.) */
function useViewportWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1280);
  useEffect(() => {
    const on = () => setW(window.innerWidth);
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return w;
}

/* paginate any list at `perPage` (default 10); resets to page 1 when the list size changes */
function usePaged(items, perPage = 10) {
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(items.length / perPage));
  useEffect(() => { setPage(1); }, [items.length]);
  const safe = Math.min(page, pages);
  const start = (safe - 1) * perPage;
  return { page: safe, pages, pageItems: items.slice(start, start + perPage),
    prev: () => setPage(p => Math.max(1, p - 1)), next: () => setPage(p => Math.min(pages, p + 1)) };
}

/* ---- Email chip palette + hash (per-email pastel color, mirrors getEmailBadgeColor) ---- */
const EMAIL_BADGE_COLORS = [
  { bg: "#EAF1FF", color: "#2563EB", border: "#BFD3FF" }, // blue
  { bg: "#F3EEFF", color: "#7C3AED", border: "#D9C9FF" }, // purple
  { bg: "#E9FBF1", color: "#0E9F6E", border: "#BDEBD2" }, // green
  { bg: "#FFF4E5", color: "#D97706", border: "#FBD9A5" }, // amber
  { bg: "#FDECF3", color: "#DB2777", border: "#F8C6DD" }, // pink
  { bg: "#E7FAF8", color: "#0D9488", border: "#BCEBE6" }, // teal
  { bg: "#ECEEFF", color: "#4F46E5", border: "#CBD0FF" }, // indigo
  { bg: "#FFEFEF", color: "#E11D48", border: "#FBCBD2" }, // rose
];
function getEmailBadgeColor(email) {
  let hash = 0;
  const s = (email || "").toLowerCase();
  for (let i = 0; i < s.length; i++) hash = s.charCodeAt(i) + ((hash << 5) - hash);
  return EMAIL_BADGE_COLORS[Math.abs(hash) % EMAIL_BADGE_COLORS.length];
}
const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

/* ---- EmailInputList — the standard multi-email entry across People & Culture ----
   Colored chips per email (in a bordered scroll box) + an input with a "+" add button +
   the "Press Enter or click + to add email" hint. Validates + de-dupes, surfacing an inline
   error. Props: label, description, placeholder, emails (string[]), onChange(string[]), error. */
function EmailInputList({ label, description, placeholder = "Enter email address", emails = [], onChange, error }) {
  const [draft, setDraft] = React.useState("");
  const [localError, setLocalError] = React.useState("");
  const add = () => {
    const v = draft.trim();
    if (!v) return;
    if (!isValidEmail(v)) { setLocalError("Please enter a valid email address"); return; }
    if (emails.includes(v)) { setLocalError("This email has already been added"); return; }
    onChange([...emails, v]);
    setDraft("");
    setLocalError("");
  };
  const remove = (t) => onChange(emails.filter(x => x !== t));
  const shownError = (typeof error === "string" && error) || localError;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", minWidth: 0 }}>
      {label && (
        <label style={{ fontFamily: "var(--font-control)", fontWeight: 500, fontSize: 14, color: "var(--gray-900)" }}>
          {label}{description && <span style={{ color: "var(--gray-400)", fontWeight: 400 }}> ({description})</span>}
        </label>
      )}
      {emails.length > 0 && (
        <div style={{ display: "flex", gap: 6, padding: 6, border: "1px solid var(--gray-200)", borderRadius: "var(--radius-md)",
          minHeight: 38, overflowX: "auto", background: "#fff" }}>
          {emails.map(t => {
            const c = getEmailBadgeColor(t);
            return (
              <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0, padding: "4px 6px 4px 10px",
                borderRadius: 7, fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: 500, whiteSpace: "nowrap",
                background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
                {t}
                <span onClick={() => remove(t)} title="Remove" style={{ display: "inline-flex", cursor: "pointer", borderRadius: 999, padding: 1 }}>
                  <Icon name="close-line" size={13} color={c.color} />
                </span>
              </span>
            );
          })}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div className="input-wrap" style={{ flex: 1 }}>
          <input type="email" placeholder={placeholder} value={draft}
            onChange={e => { setDraft(e.target.value); if (localError) setLocalError(""); }}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } }} />
        </div>
        <button type="button" onClick={add} title="Add email" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 38, height: 38, flexShrink: 0, border: 0, background: "none", cursor: "pointer", borderRadius: "var(--radius-md)", color: "var(--brand-yellow-dark)" }}>
          <Icon name="add-line" size={20} color="var(--brand-yellow-dark)" />
        </button>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-400)" }}>Press Enter or click + to add email</span>
        {shownError && <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "#DC2626" }}>{shownError}</span>}
      </div>
    </div>
  );
}

/* ---- Floating bulk-action bar (fixed bottom-right; reused by every multi-select table) ----
   Pass a count, the noun for the count label, an onClear, and the action Buttons as children. */
function BulkBar({ count, noun = "selected", visible, onClear, children }) {
  const [lastCount, setLastCount] = useState(0);
  useEffect(() => { if (count > 0) setLastCount(count); }, [count]);
  const shown = count || lastCount;
  return (
    <div className={`jt-assignbar ${visible ? "" : "hidden"}`}>
      <span className="jt-count" key={shown}>{shown}</span>
      <span style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--gray-700)" }}>{noun}</span>
      <button className="jt-clear" onClick={onClear}>Clear</button>
      {children}
    </div>
  );
}

Object.assign(window, { Icon, Button, ViewDetailsButton, Field, Input, Textarea, Select, Checkbox, Tabs, Segmented, Pagination, usePaged, useViewportWidth, Avatar, getStringColor, getEmailBadgeColor, EmailInputList, BulkBar });
