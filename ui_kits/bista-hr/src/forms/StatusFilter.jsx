// BISTA HR · forms/StatusFilter — popover multi-select status filter button.
// Mirrors components/shared/StatusFilter: a ListFilter trigger with a count badge + a
// "Filter by status" popover of checkbox + label rows. Click to toggle which statuses are
// shown; an empty selection means "all". Generic enough to reuse for any "filter by <enum>"
// case (Promotions, Transfers, Job Title, Exit, …). The panel reuses the portal-popover
// approach from Combobox so it is never clipped.

function StatusFilter({ value = [], onChange, options = ["Approved", "Pending", "Declined"] }) {
  const { ref, open, setOpen, rect } = usePopover();
  const opts = options.map(o => (typeof o === "string" ? { value: o, label: o } : o));
  const count = value.length;
  const toggle = (v) => onChange(value.includes(v) ? value.filter(x => x !== v) : [...value, v]);

  const panel = rect && {
    position: "fixed", zIndex: 1001, width: 224,
    top: rect.bottom + 6, left: Math.max(12, Math.min(rect.left, rect.right - 224)),
    background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
    boxShadow: "var(--shadow-pop)", overflow: "hidden",
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button className="btn btn-stroke btn-sm" onClick={() => setOpen(o => !o)}
        style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <Icon name="filter-3-line" size={16} color="var(--gray-500)" />
        Status
        {count > 0 && (
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 18, height: 18,
            padding: "0 5px", borderRadius: 999, background: "var(--brand-yellow)", color: "var(--brand-ink)",
            fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 11.5 }}>{count}</span>
        )}
        <Icon name="arrow-down-s-line" size={18} color="var(--gray-400)" style={{ transition: "transform .15s", transform: open ? "rotate(180deg)" : "none" }} />
      </button>

      {open && ReactDOM.createPortal(
        <React.Fragment>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 1000 }} />
          <div style={panel}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "10px 12px", borderBottom: "1px solid var(--divider)" }}>
              <span style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 12.5, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: ".03em" }}>Filter by status</span>
              {count > 0 && (
                <button onClick={() => onChange([])} style={{ border: 0, background: "none", cursor: "pointer", padding: 0,
                  fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 12.5, color: "var(--brand-yellow-dark)" }}>Clear</button>
              )}
            </div>
            <div style={{ padding: 6, display: "flex", flexDirection: "column" }}>
              {opts.map(o => {
                const on = value.includes(o.value);
                return (
                  <button key={o.value} onClick={() => toggle(o.value)}
                    style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", border: 0, background: on ? "var(--gray-50)" : "none",
                      padding: "8px 10px", borderRadius: 8, cursor: "pointer", textAlign: "left" }}
                    onMouseEnter={e => { if (!on) e.currentTarget.style.background = "var(--gray-50)"; }}
                    onMouseLeave={e => { if (!on) e.currentTarget.style.background = "none"; }}>
                    <Checkbox checked={on} onChange={() => toggle(o.value)} />
                    <span style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--gray-800)" }}>{o.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </React.Fragment>,
        document.body
      )}
    </div>
  );
}

Object.assign(window, { StatusFilter });
