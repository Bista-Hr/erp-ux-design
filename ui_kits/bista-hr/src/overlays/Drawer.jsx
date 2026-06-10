// BISTA HR · overlays/Drawer — right-side sheet (mirrors the app's <Sheet side="right">).
// Dimmed backdrop, panel slides in from the right, sticky header with icon + title + close.
// Resting state is fully visible (transform-only entrance) so it captures/prints cleanly.
function Drawer({ open, onClose, title, icon, width = 680, children }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(16,24,40,.45)", zIndex: 130,
      display: "flex", justifyContent: "flex-end" }}>
      <div onClick={e => e.stopPropagation()} style={{ width, maxWidth: "94vw", height: "100%", background: "#fff",
        boxShadow: "-12px 0 40px -12px rgba(16,24,40,.35)", display: "flex", flexDirection: "column", animation: "bhDrawer .22s ease" }}>
        <header style={{ display: "flex", alignItems: "center", gap: 10, padding: "20px 24px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
          {icon && <Icon name={icon} size={22} color="var(--gray-900)" />}
          <span style={{ flex: 1, fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 18, color: "var(--gray-900)" }}>{title}</span>
          <button onClick={onClose} className="btn btn-icon btn-ghost" style={{ width: 32, height: 32, padding: 0 }}>
            <Icon name="close-line" size={20} color="var(--gray-500)" />
          </button>
        </header>
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}
Object.assign(window, { Drawer });
