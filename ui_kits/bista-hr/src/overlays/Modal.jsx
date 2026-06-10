// BISTA HR · overlays/Modal — dimmed backdrop + centered card shell.
function Modal({ children, onClose, width = 600 }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(16,24,40,.45)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div onClick={e => e.stopPropagation()} style={{ width, maxWidth: "92vw", maxHeight: "90vh", overflow: "auto", background: "#fff",
        borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-modal)", animation: "bhRise .18s ease" }}>
        {children}
      </div>
    </div>
  );
}
Object.assign(window, { Modal });
