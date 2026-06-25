// BISTA HR · Button — primary action button. Self-contained (styles come from the
// design system's global stylesheet: `.btn` classes + brand tokens). Remix Icon font
// supplies the optional leading/trailing glyphs.
const BTN_VARIANTS = { primary: "btn-primary", stroke: "btn-stroke", blue: "btn-blue", ghost: "btn-ghost", danger: "btn-danger", auth: "btn-auth" };
const BTN_SIZES = { md: "", sm: "btn-sm", xs: "btn-xs" };

export function Button({ variant = "primary", size = "md", icon, iconRight, children, onClick, disabled, style, className = "" }) {
  const cls = ["btn", BTN_VARIANTS[variant] || "btn-primary", BTN_SIZES[size] || "", !children ? "btn-icon" : "", className].filter(Boolean).join(" ");
  return (
    <button className={cls} onClick={onClick} disabled={disabled} style={style}>
      {icon && <i className={"ri-" + icon} style={{ fontSize: size === "sm" ? 16 : 18, lineHeight: 1 }} />}
      {children}
      {iconRight && <i className={"ri-" + iconRight} style={{ fontSize: size === "sm" ? 16 : 18, lineHeight: 1 }} />}
    </button>
  );
}
