// BISTA HR · overlays/RejectionReasonModal — reason-capture modal for a People & Culture
// request decision. Two tones:
//   tone="danger" (default) — REJECT: destructive red, terminal ("rejection is final").
//   tone="warning"          — RETURN: amber, sends the request back to the initiator who can
//                             correct and resubmit it for approval.
// All copy is overridable: title, description, fieldLabel, placeholder, confirmLabel, confirmIcon.
//   Props: open, onClose, onConfirm(reason), loading, error, title, noun, tone, description,
//          fieldLabel, placeholder, confirmLabel, confirmIcon.
const { useState: useRRM, useEffect: useRRMEffect } = React;

const RRM_TONES = {
  danger: { iconBg: "#FEECEC", icon: "close-circle-line", iconColor: "#DC2626", btn: "#DC2626",
    title: "Reject Request", field: "Reason for rejection", ph: "Explain why this is being rejected…",
    btnLabel: "Confirm Reject", btnIcon: "close-line",
    desc: (noun) => `Provide a reason for rejecting this ${noun}. Rejection is final — the requester will be notified.` },
  warning: { iconBg: "#FFF7ED", icon: "arrow-go-back-line", iconColor: "#D97706", btn: "#D97706",
    title: "Return for Correction", field: "Reason for return", ph: "Explain what needs to be corrected…",
    btnLabel: "Return to Initiator", btnIcon: "arrow-go-back-line",
    desc: (noun) => `Provide a reason for returning this ${noun}. The initiator can correct it and resubmit for approval.` },
};

function RejectionReasonModal({ open, onClose, onConfirm, loading = false, error, title, noun = "request",
  tone = "danger", description, fieldLabel, placeholder, confirmLabel, confirmIcon }) {
  const T = RRM_TONES[tone] || RRM_TONES.danger;
  const [reason, setReason] = useRRM("");
  useRRMEffect(() => { if (open) setReason(""); }, [open]);
  if (!open) return null;
  const submit = () => { if (reason.trim() && !loading) onConfirm(reason.trim()); };

  return ReactDOM.createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 1200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={loading ? undefined : onClose} style={{ position: "absolute", inset: 0, background: "rgba(16,24,40,.45)" }} />
      <div style={{ position: "relative", width: 480, maxWidth: "100%", background: "#fff", borderRadius: 16, boxShadow: "var(--shadow-pop)", padding: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16 }}>
          <span style={{ width: 44, height: 44, borderRadius: 999, background: T.iconBg, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name={T.icon} size={24} color={T.iconColor} />
          </span>
          <div>
            <div className="bh-h2" style={{ fontSize: 18 }}>{title || T.title}</div>
            <div className="bh-body" style={{ marginTop: 2 }}>{description || T.desc(noun)}</div>
          </div>
        </div>

        <Field label={fieldLabel || T.field}>
          <Textarea rows={4} value={reason} onChange={e => setReason(e.target.value)} placeholder={placeholder || T.ph} autoFocus />
        </Field>

        {error && <div style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "#DC2626", marginTop: 8 }}>{error}</div>}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 20 }}>
          <Button variant="stroke" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="primary" icon={confirmIcon || T.btnIcon} disabled={!reason.trim() || loading} onClick={submit}
            style={{ background: T.btn, borderColor: T.btn, color: "#fff" }}>{confirmLabel || T.btnLabel}</Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

Object.assign(window, { RejectionReasonModal });
