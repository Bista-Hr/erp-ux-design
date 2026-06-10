// BISTA HR · overlays/Toast — toast stack (top-right). Default tone is the brand yellow
// (ink text + close). Pass tone:"success" for a green confirmation (used by bulk actions)
// or tone:"error" for red. kind:"error" also maps to the error glyph/tone.
const TOAST_TONES = {
  brand:   { bg: "var(--brand-yellow)", fg: "var(--brand-ink)", icon: "checkbox-circle-fill" },
  success: { bg: "#1FA363",             fg: "#fff",             icon: "checkbox-circle-fill" },
  error:   { bg: "#DC2626",             fg: "#fff",             icon: "close-circle-fill" },
};
function ToastStack({ toasts, onDismiss }) {
  return (
    <div style={{ position: "fixed", top: 84, right: 24, display: "flex", flexDirection: "column", gap: 10, zIndex: 2000 }}>
      {toasts.map(t => {
        const tone = TOAST_TONES[t.tone] || (t.kind === "error" ? TOAST_TONES.error : TOAST_TONES.brand);
        return (
          <div key={t.id} style={{ display: "inline-flex", alignItems: "center", gap: 8, minWidth: 212,
            background: tone.bg, color: tone.fg, borderRadius: 10, padding: "8px 10px",
            boxShadow: "0 8px 20px -8px rgba(16,24,40,.4)", animation: "bhSlide .2s ease",
            fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 13 }}>
            <Icon name={tone.icon} size={18} color={tone.fg} />
            <span style={{ flex: 1, whiteSpace: "nowrap" }}>{t.msg}</span>
            <button onClick={() => onDismiss && onDismiss(t.id)} style={{ border: 0, background: "none", padding: 0,
              cursor: "pointer", display: "flex", alignItems: "center" }}>
              <Icon name="close-line" size={16} color={tone.fg} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
Object.assign(window, { ToastStack });
