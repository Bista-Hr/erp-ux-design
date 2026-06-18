// BISTA HR · overlays/RejectionReasonModal — reason-capture modal for rejecting a People &
// Culture request (Promotion / Transfer / …). Mirrors components/promotions/RejectionReasonModal:
// a required "Reason for rejection" textarea + Cancel / Confirm Reject (destructive red).
// Surfaces an inline error and a loading state. Reuse anywhere a rejection needs a reason.
//   Props: open, onClose, onConfirm(reason), loading, error, title, noun.
const { useState: useRRM, useEffect: useRRMEffect } = React;

function RejectionReasonModal({ open, onClose, onConfirm, loading = false, error, title = "Reject Request", noun = "request" }) {
  const [reason, setReason] = useRRM("");
  useRRMEffect(() => { if (open) setReason(""); }, [open]);
  if (!open) return null;
  const submit = () => { if (reason.trim() && !loading) onConfirm(reason.trim()); };

  return ReactDOM.createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 1200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={loading ? undefined : onClose} style={{ position: "absolute", inset: 0, background: "rgba(16,24,40,.45)" }} />
      <div style={{ position: "relative", width: 480, maxWidth: "100%", background: "#fff", borderRadius: 16, boxShadow: "var(--shadow-pop)", padding: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16 }}>
          <span style={{ width: 44, height: 44, borderRadius: 999, background: "#FEECEC", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name="close-circle-line" size={24} color="#DC2626" />
          </span>
          <div>
            <div className="bh-h2" style={{ fontSize: 18 }}>{title}</div>
            <div className="bh-body" style={{ marginTop: 2 }}>Provide a reason for rejecting this {noun}. The requester will be notified.</div>
          </div>
        </div>

        <Field label="Reason for rejection">
          <Textarea rows={4} value={reason} onChange={e => setReason(e.target.value)} placeholder="Explain why this is being rejected…" autoFocus />
        </Field>

        {error && <div style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "#DC2626", marginTop: 8 }}>{error}</div>}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 20 }}>
          <Button variant="stroke" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="primary" icon="close-line" disabled={!reason.trim() || loading} onClick={submit}
            style={{ background: "#DC2626", borderColor: "#DC2626", color: "#fff" }}>Confirm Reject</Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

Object.assign(window, { RejectionReasonModal });
