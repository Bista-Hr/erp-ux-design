// BISTA HR · overlays/ConfirmModal — the Figma "Warning modal".
// 440px card, orange alert circle, centered title + question, Cancel/No + confirm action.
// tone "warning" → orange alert (add / update); "danger" → orange alert (archive) — Figma uses
// the same orange alert glyph for all three intents.
function ConfirmModal({ title, message, confirmLabel, confirmIcon, cancelLabel = "Cancel", onConfirm, onClose }) {
  return (
    <Modal onClose={onClose} width={440}>
      <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          {/* orange alert circle — bg #FEF3EB, inline SVG glyph #F87A25 (font icons drop in capture) */}
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#FEF3EB",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 3.2 1.6 21h20.8L12 3.2Z" fill="#F87A25" />
              <line x1="12" y1="9.5" x2="12" y2="14.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="17.6" r="1.25" fill="#fff" />
            </svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 16, lineHeight: "24px",
              letterSpacing: "-0.011em", color: "#0A0D14" }}>{title}</div>
            <div style={{ fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 14, lineHeight: "20px",
              letterSpacing: "-0.006em", color: "#525866" }}>{message}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Button variant="stroke" onClick={onClose}>{cancelLabel}</Button>
          <Button variant="primary" icon={confirmIcon} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </Modal>
  );
}
Object.assign(window, { ConfirmModal });
