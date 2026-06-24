// BISTA HR · primitives/StatusBadge — mirrors the app's <StatusBadge>:
// bordered pill, gray text, small filled colored circle with a white glyph.
// Glyphs are inline SVG so they render crisply on the colored circle.
function StatusGlyph({ shape, size }) {
  const common = { fill: "none", stroke: "#fff", strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round" };
  const paths = {
    check: <polyline points="5,12.5 10,17.5 19,7.5" {...common} />,
    minus: <line x1="6" y1="12" x2="18" y2="12" {...common} />,
    x:     <g {...common}><line x1="7" y1="7" x2="17" y2="17" /><line x1="17" y1="7" x2="7" y2="17" /></g>,
    clock: <g {...common}><circle cx="12" cy="12" r="6" /><polyline points="12,8.5 12,12 14.5,13.5" /></g>,
    ban:   <g {...common}><circle cx="12" cy="12" r="6.5" /><line x1="7.4" y1="7.4" x2="16.6" y2="16.6" /></g>,
    alert: <g {...common}><line x1="12" y1="7" x2="12" y2="13" /><line x1="12" y1="16.5" x2="12" y2="16.6" /></g>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block" }}>{paths[shape] || paths.minus}</svg>;
}

const STATUS_CONFIG = {
  active:    { shape: "check", bg: "#38C793", text: "Active" },
  inactive:  { shape: "minus", bg: "#DC2626", text: "Archived" },
  approved:  { shape: "check", bg: "#38C793", text: "Approved" },
  completed: { shape: "check", bg: "#38C793", text: "Completed" },
  pending:   { shape: "clock", bg: "#F59E0B", text: "Pending" },
  review:    { shape: "clock", bg: "#F59E0B", text: "In Review" },
  rejected:  { shape: "x",     bg: "#EF4444", text: "Rejected" },
  cancelled: { shape: "ban",   bg: "#6B7280", text: "Cancelled" },
  warning:   { shape: "alert", bg: "#F97316", text: "Warning" },
  success:   { shape: "check", bg: "#10B981", text: "Success" },
  current:   { shape: "check", bg: "#10B981", text: "Current" },
  past:      { shape: "minus", bg: "#64748B", text: "Past" },
  draft:     { shape: "clock", bg: "#3B82F6", text: "Draft" },
  open:        { shape: "check", bg: "#38C793", text: "Open" },
  shortlisted: { shape: "check", bg: "#38C793", text: "Shortlisted" },
  closed:    { shape: "x",     bg: "#EF4444", text: "Closed" },
  info:      { shape: "clock", bg: "#3B82F6", text: "Info" },
  error:     { shape: "x",     bg: "#EF4444", text: "Error" },
  default:   { shape: "minus", bg: "#6B7280", text: "" },
};
const STATUS_SIZES = {
  sm: { pad: "3px 8px", font: 12, circle: 14, glyph: 10 },
  md: { pad: "3px 9px", font: 12, circle: 15, glyph: 11 },
  lg: { pad: "5px 11px", font: 14, circle: 18, glyph: 13 },
};
function StatusBadge({ variant = "default", text, showIcon = true, size = "md" }) {
  const c = STATUS_CONFIG[(variant || "").toLowerCase()] || STATUS_CONFIG.default;
  const s = STATUS_SIZES[size] || STATUS_SIZES.md;
  return (
    <span style={{ display: "inline-flex", width: "fit-content", alignItems: "center", gap: 6,
      border: "1px solid var(--gray-200)", borderRadius: 6, background: "#fff", padding: s.pad,
      fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: s.font, color: "var(--gray-700)" }}>
      {showIcon && (
        <span style={{ width: s.circle, height: s.circle, borderRadius: "50%", background: c.bg,
          display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto" }}>
          <StatusGlyph shape={c.shape} size={s.glyph} />
        </span>
      )}
      {text || c.text || variant}
    </span>
  );
}
/* legacy boolean wrapper used by the CRUD tables */
function StatusDot({ active, activeText = "Active", inactiveText = "Inactive" }) {
  return <StatusBadge variant={active ? "active" : "inactive"} text={active ? activeText : inactiveText} />;
}

Object.assign(window, { StatusGlyph, StatusBadge, StatusDot });
