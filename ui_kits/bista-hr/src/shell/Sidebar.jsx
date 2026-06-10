// BISTA HR · shell/Sidebar — full-height yellow nav driven by the nav model.
// Collapsible groups with a continuous guide line + sliding indicator; System
// Administration is pinned at the bottom and expands UPWARD.
const SUB_ROW = 40;

/* sub-menu: continuous guide line (each row's border-left) + one sliding indicator pill */
function SubMenu({ items, open, current, parent, onSelect }) {
  const idx = Math.max(0, items.findIndex(n => n.name === current));
  const has = items.some(n => n.name === current);
  return (
    <div className="bh-sub" style={{ maxHeight: open ? items.length * SUB_ROW + 8 : 0, opacity: open ? 1 : 0, paddingTop: open ? 4 : 0 }}>
      {has && <div className="bh-ind" style={{ top: idx * SUB_ROW + 4 + (SUB_ROW - 16) / 2 }} />}
      {items.map(n => (
        <a key={n.name} className={"bh-child" + (n.name === current ? " on" : "")} onClick={() => onSelect(n, parent)}>
          <span className="lbl">{n.name}</span>
        </a>
      ))}
    </div>
  );
}

function NavRow({ it, expanded, onClick, chevDir, collapsed }) {
  return (
    <div onClick={onClick} title={collapsed ? it.name : undefined} style={{
      display: "flex", alignItems: "center", gap: 8, padding: collapsed ? "11px 0" : "10px 12px",
      justifyContent: collapsed ? "center" : "flex-start",
      borderRadius: "var(--radius-sm)", cursor: "pointer", userSelect: "none",
      background: "transparent",
    }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,.07)"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
      <Icon name={it.icon} size={18} color="var(--brand-ink)" />
      {!collapsed && <span style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 14, letterSpacing: ".01em", color: "var(--brand-ink)" }}>{it.name}</span>}
      {!collapsed && it.children && <Icon name="arrow-down-s-line" size={18} color="var(--brand-ink)"
        style={{ marginLeft: "auto", transition: "transform .3s ease",
          transform: expanded ? (chevDir === "up" ? "rotate(0deg)" : "rotate(180deg)") : (chevDir === "up" ? "rotate(180deg)" : "rotate(0deg)") }} />}
    </div>
  );
}

function Sidebar({ current, onNavigate, collapsed = false, onToggle }) {
  const sectionOf = (name) => {
    const top = NAV_MAIN.find(it => it.children && it.children.some(c => c.name === name));
    if (top) return top.name;
    if (NAV_ADMIN.children.some(c => c.name === name)) return NAV_ADMIN.name;
    return null;
  };
  const [openKey, setOpenKey] = useState(sectionOf(current) || "HR Management");
  useEffect(() => { setOpenKey(sectionOf(current)); }, [current]);
  const adminOpen = !collapsed && openKey === NAV_ADMIN.name;
  const toggle = (key) => setOpenKey(k => (k === key ? null : key));
  // collapsed: clicking a group expands the rail first, then opens that group
  const onGroup = (key) => { if (collapsed) { onToggle && onToggle(); setOpenKey(key); } else { toggle(key); } };

  const topLeaf = (it) => {
    const on = it.name === current;
    return (
      <div key={it.name} onClick={() => { onNavigate(it, it.name); }} title={collapsed ? it.name : undefined} style={{
        display: "flex", alignItems: "center", gap: 8, padding: collapsed ? "11px 0" : "10px 12px",
        justifyContent: collapsed ? "center" : "flex-start",
        borderRadius: "var(--radius-sm)", cursor: "pointer", userSelect: "none",
        background: on ? "var(--brand-yellow-dark)" : "transparent",
      }}
        onMouseEnter={e => { if (!on) e.currentTarget.style.background = "rgba(0,0,0,.07)"; }}
        onMouseLeave={e => { if (!on) e.currentTarget.style.background = "transparent"; }}>
        <Icon name={it.icon} size={18} color="var(--brand-ink)" />
        {!collapsed && <span style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 14, letterSpacing: ".01em", color: "var(--brand-ink)" }}>{it.name}</span>}
      </div>
    );
  };

  return (
    <aside style={{
      width: collapsed ? 76 : 272, flex: collapsed ? "0 0 76px" : "0 0 272px", height: "100%", boxSizing: "border-box",
      background: "var(--brand-yellow)", position: "relative", overflow: "hidden",
      display: "flex", flexDirection: "column", padding: collapsed ? "16px 12px 16px" : "16px 16px 16px",
      transition: "width .22s ease, flex-basis .22s ease",
    }}>
      {/* oil-droplet watermark — blended into the yellow (soft-light + radial fade) */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 80,
        height: 380, backgroundImage: "url(../../assets/oil-droplet-bg.png)",
        backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "center",
        mixBlendMode: "soft-light", opacity: .7, pointerEvents: "none", zIndex: 0,
        WebkitMaskImage: "radial-gradient(120% 90% at 50% 40%, #000 26%, rgba(0,0,0,.35) 60%, transparent 82%)",
        maskImage: "radial-gradient(120% 90% at 50% 40%, #000 26%, rgba(0,0,0,.35) 60%, transparent 82%)" }} />
      {/* nav (collapse toggle now lives in the header) */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, overflowY: "auto", overflowX: "hidden", minHeight: 0, position: "relative", zIndex: 1, paddingTop: 8 }}>
        {NAV_MAIN.map(it => {
          if (!it.children) return topLeaf(it);
          const expanded = !collapsed && openKey === it.name;
          return (
            <div key={it.name}>
              <NavRow it={it} expanded={expanded} onClick={() => onGroup(it.name)} chevDir="down" collapsed={collapsed} />
              {!collapsed && <SubMenu items={it.children} open={expanded} current={current} parent={it.name} onSelect={onNavigate} />}
            </div>
          );
        })}
      </nav>
      <div style={{ borderTop: "1px solid rgba(0,0,0,.18)", marginTop: 8, paddingTop: 12, flexShrink: 0, position: "relative", zIndex: 1 }}>
        {!collapsed && <SubMenu items={NAV_ADMIN.children} open={adminOpen} current={current} parent={NAV_ADMIN.name} onSelect={onNavigate} />}
        <NavRow it={NAV_ADMIN} expanded={adminOpen} onClick={() => onGroup(NAV_ADMIN.name)} chevDir="up" collapsed={collapsed} />
      </div>
    </aside>
  );
}
Object.assign(window, { Sidebar });
