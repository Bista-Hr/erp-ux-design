// BISTA HR UI Kit — primitives. Cosmetic recreations of the Figma library.
// Exposes components on window for sibling Babel scripts.
const { useState, useRef, useEffect } = React;

/* ---- Icon (Remix Icon font) ---- */
function Icon({ name, size = 18, color, style }) {
  return <i className={`ri-${name}`} style={{ fontSize: size, color, lineHeight: 1, ...style }} />;
}

/* ---- Button ---- */
function Button({ variant = "primary", size = "md", icon, iconRight, children, onClick, disabled, style }) {
  const cls = `btn btn-${variant}` + (size === "sm" ? " btn-sm" : size === "xs" ? " btn-xs" : "") + (
  !children ? " btn-icon" : "");
  return (
    <button className={cls} onClick={onClick} disabled={disabled} style={style}>
      {icon && <Icon name={icon} size={size === "sm" ? 16 : 18} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === "sm" ? 16 : 18} />}
    </button>);

}

/* ---- Field / Input ---- */
function Field({ label, optional, hint, icon, infoIcon, children, style }) {
  return (
    <div className="field" style={style}>
      {label && <label>{label}{optional && <span className="opt"> (optional)</span>}</label>}
      {children}
      {hint && <span className="hint">{hint}</span>}
    </div>);

}
function Input({ icon, infoIcon, ...props }) {
  return (
    <div className="input-wrap">
      {icon && <Icon name={icon} size={20} style={{ color: "var(--icon-default)" }} />}
      <input {...props} />
      {infoIcon && <Icon name={infoIcon} size={20} style={{ color: "var(--gray-300)" }} />}
    </div>);

}
function Textarea(props) {
  return <div className="input-wrap"><textarea {...props} /></div>;
}
function Select({ value, onChange, options, placeholder }) {
  return (
    <div className="input-wrap" style={{ cursor: "pointer" }}>
      <select value={value} onChange={onChange}
      style={{ flex: 1, border: 0, outline: 0, background: "transparent", appearance: "none",
        fontFamily: "var(--font-control)", fontSize: 14, color: value ? "var(--gray-900)" : "var(--gray-400)", cursor: "pointer" }}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <Icon name="arrow-down-s-line" size={20} style={{ color: "var(--icon-default)" }} />
    </div>);

}
function Checkbox({ checked, onChange, label }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--gray-900)" }}>
      <span onClick={() => onChange(!checked)} style={{ width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${checked ? "var(--brand-yellow-dark)" : "var(--gray-300)"}`,
        background: checked ? "var(--brand-yellow)" : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {checked && <Icon name="check-line" size={14} color="var(--brand-ink)" />}
      </span>
      {label}
    </label>);

}

/* ---- Status ---- */
function StatusDot({ active }) {
  return <span className={`status ${active ? "status-active" : "status-inactive"}`}>{active ? "Active" : "Inactive"}</span>;
}
function Pill({ kind = "pending", children }) {
  const map = { pending: "time-fill", completed: "checkbox-circle-fill", failed: "close-circle-fill" };
  return <span className={`pill pill-${kind}`}><Icon name={map[kind]} size={16} />{children}</span>;
}

/* ---- Tabs / Segmented ---- */
function Tabs({ items, active, onChange }) {
  return (
    <div className="tabs" style={{ color: "rgb(255, 255, 255)" }}>
      {items.map((t) => <button key={t} className={`tab ${t === active ? "active" : ""}`} onClick={() => onChange(t)}>{t}</button>)}
    </div>);

}
function Segmented({ items, active, onChange }) {
  return (
    <div className="seg">
      {items.map((t) => <button key={t} className={t === active ? "active" : ""} onClick={() => onChange(t)}>{t}</button>)}
    </div>);

}

/* ---- Pagination ---- */
function Pagination({ page = 1, pages = 1 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px" }}>
      <span className="bh-caption">Page {page} of {pages}</span>
      <div style={{ display: "flex", gap: 8 }}>
        <Button variant="stroke" size="sm" disabled>Previous</Button>
        <Button variant="stroke" size="sm" disabled>Next</Button>
      </div>
    </div>);

}

/* ---- Modal shell ---- */
function Modal({ children, onClose, width = 600 }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(16,24,40,.45)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 100, animation: "bhFade .15s ease" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width, maxWidth: "92vw", maxHeight: "90vh", overflow: "auto", background: "#fff",
        borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-modal)", animation: "bhRise .18s ease" }}>
        {children}
      </div>
    </div>);

}

/* ---- Toast stack ---- */
function ToastStack({ toasts }) {
  return (
    <div style={{ position: "fixed", top: 84, right: 24, display: "flex", flexDirection: "column", gap: 8, zIndex: 200 }}>
      {toasts.map((t) =>
      <span key={t.id} className={`toast toast-${t.kind}`} style={{ animation: "bhSlide .2s ease" }}>
          <Icon name={t.kind === "success" ? "checkbox-circle-fill" : "close-circle-fill"} size={16} />
          {t.msg}
        </span>
      )}
    </div>);

}

Object.assign(window, { Icon, Button, Field, Input, Textarea, Select, Checkbox, StatusDot, Pill, Tabs, Segmented, Pagination, Modal, ToastStack });