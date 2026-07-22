// BISTA HR · forms/Combobox — searchable popover selects (single + multi).
// Options may be plain strings or { value, label, image }. When an option has an `image`
// (e.g. a country flag URL), it renders beside the label in both the trigger and the list.
// The popover is rendered in a PORTAL with fixed positioning anchored to the trigger, so
// it is never clipped by a scrolling modal/card and flips upward near the viewport bottom.

const normOpts = (options = []) => options.map(o => (typeof o === "string" ? { value: o, label: o } : o));

// trigger measurement + open state, with live re-measure on scroll/resize
function usePopover() {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState(null);
  const measure = () => { if (ref.current) setRect(ref.current.getBoundingClientRect()); };
  useEffect(() => {
    if (!open) return;
    measure();
    const on = () => measure();
    window.addEventListener("scroll", on, true);
    window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on, true); window.removeEventListener("resize", on); };
  }, [open]);
  return { ref, open, setOpen, rect };
}

function OptionRow({ opt, selected, onClick, avatar }) {
  return (
    <button onClick={onClick}
      style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", border: 0, background: selected ? "var(--gray-50)" : "none",
        padding: "9px 10px", borderRadius: 8, cursor: "pointer", textAlign: "left", fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--gray-900)" }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.background = "var(--gray-50)"; }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.background = "none"; }}>
      <span style={{ width: 16, display: "inline-flex", flexShrink: 0 }}>
        {selected && <Icon name="check-line" size={16} color="var(--brand-yellow-dark)" />}
      </span>
      {opt.image ? <img src={opt.image} alt="" width={20} height={20} style={{ borderRadius: "50%", flexShrink: 0 }} />
        : avatar ? <Avatar name={opt.name || opt.label} size={20} /> : null}
      <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{opt.label}</span>
        {opt.sublabel && <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-400)", lineHeight: 1.3 }}>{opt.sublabel}</span>}
      </span>
    </button>
  );
}

// portal popover — fixed to the trigger rect, flips up near the bottom of the viewport
function ComboPopover({ rect, options, search, setSearch, isSelected, onPick, onClose, noDataText = "No option found.", avatar, header }) {
  if (!rect) return null;
  const filtered = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));
  const GAP = 6, EST = 300;
  const width = Math.max(rect.width, 208);
  const left = Math.min(rect.left, window.innerWidth - width - 8);
  const spaceBelow = window.innerHeight - rect.bottom;
  const openUp = spaceBelow < EST && rect.top > spaceBelow;
  const panel = {
    position: "fixed", zIndex: 1001, width, left,
    ...(openUp ? { bottom: window.innerHeight - rect.top + GAP, maxHeight: rect.top - 16 }
               : { top: rect.bottom + GAP, maxHeight: spaceBelow - 16 }),
    background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
    boxShadow: "var(--shadow-pop)", overflow: "hidden", display: "flex", flexDirection: "column",
  };
  return ReactDOM.createPortal(
    <React.Fragment>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 1000 }} />
      <div style={panel}>
        {header ? (
          /* flush search row — borderless input | vertical divider | compact filter cell */
          <div style={{ display: "flex", alignItems: "stretch", borderBottom: "1px solid var(--divider)", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "1 1 auto", minWidth: 0, padding: "10px 12px" }}>
              <Icon name="search-2-line" size={16} style={{ color: "var(--icon-default)", flexShrink: 0 }} />
              <input autoFocus placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ flex: 1, minWidth: 0, border: 0, outline: "none", background: "none", fontFamily: "var(--font-control)", fontSize: 14, color: "var(--gray-900)" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", flexShrink: 0, borderLeft: "1px solid var(--divider)", padding: "0 8px" }}>{header}</div>
          </div>
        ) : (
          <div style={{ padding: 8, borderBottom: "1px solid var(--divider)", flexShrink: 0 }}>
            <div className="input-wrap" style={{ padding: "7px 10px" }}>
              <Icon name="search-2-line" size={16} style={{ color: "var(--icon-default)" }} />
              <input autoFocus placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
        )}
        <div style={{ overflowY: "auto", padding: 6 }}>
          {filtered.length === 0
            ? <div style={{ padding: "16px 10px", textAlign: "center", fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--gray-400)" }}>{noDataText}</div>
            : filtered.map(o => <OptionRow key={o.value} opt={o} selected={isSelected(o.value)} onClick={() => onPick(o.value)} avatar={avatar} />)}
        </div>
      </div>
    </React.Fragment>,
    document.body
  );
}

function Combobox({ value, onChange, options, placeholder = "Select option...", icon, noDataText, avatar, disabled, header, compact }) {
  const { ref, open, setOpen, rect } = usePopover();
  const [search, setSearch] = useState("");
  const opts = normOpts(options);
  const sel = opts.find(o => o.value === value) || (value ? { value, label: String(value) } : null);
  const close = () => { setOpen(false); setSearch(""); };
  // compact — borderless, muted trigger used INSIDE another control's search row (e.g. the
  // department filter of DesignationCombobox). Mirrors the shadcn ghost SelectTrigger.
  if (compact) {
    return (
      <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
        <button type="button" disabled={disabled} onClick={() => (open ? close() : setOpen(true))}
          onMouseEnter={e => { e.currentTarget.style.color = "var(--gray-900)"; }}
          onMouseLeave={e => { if (!open) e.currentTarget.style.color = sel ? "var(--gray-700)" : "var(--gray-500)"; }}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, border: 0, background: "none", borderRadius: 6,
            padding: "6px 8px", cursor: "pointer", fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: 500,
            color: open ? "var(--gray-900)" : sel ? "var(--gray-700)" : "var(--gray-500)", maxWidth: 192, whiteSpace: "nowrap" }}>
          <Icon name="filter-3-line" size={12} style={{ flexShrink: 0 }} />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{sel ? sel.label : placeholder}</span>
          <Icon name="arrow-down-s-line" size={14} style={{ flexShrink: 0, opacity: 0.5, transition: "transform .15s", transform: open ? "rotate(180deg)" : "none" }} />
        </button>
        {open && !disabled && (
          <ComboPopover rect={rect} options={opts} search={search} setSearch={setSearch} noDataText={noDataText}
            isSelected={v => v === value} onClose={close}
            onPick={v => { onChange(v === value ? "" : v); close(); }} />
        )}
      </div>
    );
  }
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div className="input-wrap" style={{ cursor: disabled ? "not-allowed" : "pointer", background: disabled ? "var(--gray-50)" : undefined, opacity: disabled ? 0.7 : 1 }} onClick={() => { if (disabled) return; open ? close() : setOpen(true); }}>
        {icon && !(avatar && sel) && <Icon name={icon} size={18} style={{ color: "var(--icon-default)" }} />}
        {sel
          ? <span style={{ flex: 1, minWidth: 0, display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "var(--font-control)", fontSize: 14, color: "var(--gray-900)" }}>
              {sel.image ? <img src={sel.image} alt="" width={20} height={20} style={{ borderRadius: "50%" }} /> : avatar ? <Avatar name={sel.name || sel.label} size={20} /> : null}
              <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sel.label}</span>
              {sel.sublabel && <span style={{ marginLeft: "auto", flexShrink: 1, minWidth: 0, fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-400)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sel.sublabel}</span>}
            </span>
          : <span style={{ flex: 1, fontFamily: "var(--font-control)", fontSize: 14, color: "var(--gray-400)" }}>{placeholder}</span>}
        <Icon name="arrow-down-s-line" size={20} style={{ color: "var(--icon-default)", transition: "transform .15s", transform: open ? "rotate(180deg)" : "none" }} />
      </div>
      {open && !disabled && (
        <ComboPopover rect={rect} options={opts} search={search} setSearch={setSearch} noDataText={noDataText} avatar={avatar} header={header}
          isSelected={v => v === value} onClose={close}
          onPick={v => { onChange(v === value ? "" : v); close(); }} />
      )}
    </div>
  );
}

function MultiSelectCombobox({ value = [], onChange, options, placeholder = "Select options...", maxDisplay = 3, noDataText, avatar }) {
  const { ref, open, setOpen, rect } = usePopover();
  const [search, setSearch] = useState("");
  const opts = normOpts(options);
  const selected = opts.filter(o => value.includes(o.value));
  const shown = selected.slice(0, maxDisplay);
  const extra = selected.length - shown.length;
  const close = () => { setOpen(false); setSearch(""); };
  const toggle = (v) => onChange(value.includes(v) ? value.filter(x => x !== v) : [...value, v]);
  const remove = (v, e) => { e.stopPropagation(); onChange(value.filter(x => x !== v)); };
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div className="input-wrap" style={{ cursor: "pointer", flexWrap: "wrap", gap: 6 }} onClick={() => (open ? close() : setOpen(true))}>
        {selected.length === 0
          ? <span style={{ flex: 1, fontFamily: "var(--font-control)", fontSize: 14, lineHeight: "20px", color: "var(--gray-400)" }}>{placeholder}</span>
          : <span style={{ flex: 1, display: "inline-flex", flexWrap: "wrap", gap: 6 }}>
              {shown.map(o => (
                <span key={o.value} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "var(--gray-100)",
                  borderRadius: 6, padding: avatar ? "2px 6px 2px 3px" : "3px 8px", fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-800)" }}>
                  {o.image ? <img src={o.image} alt="" width={16} height={16} style={{ borderRadius: "50%" }} /> : avatar ? <Avatar name={o.label} size={16} /> : null}{o.label}
                  <span onClick={e => remove(o.value, e)} style={{ display: "inline-flex", cursor: "pointer" }}><Icon name="close-line" size={13} color="var(--gray-500)" /></span>
                </span>
              ))}
              {extra > 0 && <span style={{ display: "inline-flex", alignItems: "center", background: "var(--gray-100)", borderRadius: 6, padding: "3px 8px", fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-800)" }}>+{extra}</span>}
            </span>}
        <Icon name="arrow-down-s-line" size={20} style={{ color: "var(--icon-default)", transition: "transform .15s", transform: open ? "rotate(180deg)" : "none" }} />
      </div>
      {open && (
        <ComboPopover rect={rect} options={opts} search={search} setSearch={setSearch} noDataText={noDataText} avatar={avatar}
          isSelected={v => value.includes(v)} onClose={close} onPick={toggle} />
      )}
    </div>
  );
}

Object.assign(window, { Combobox, MultiSelectCombobox });
