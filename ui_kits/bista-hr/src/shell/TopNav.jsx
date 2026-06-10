// BISTA HR · shell/TopNav — full-width header bar: org identity + collapse toggle on the
// left, page title, then notifications + profile. The sidebar toggle lives here (next to
// the logo) rather than inside the sidebar, matching the product header.
// The profile cluster is a button that opens a dropdown (Profile · Sign out).
const { useState: useTopState, useRef: useTopRef, useEffect: useTopEffect } = React;

function ProfileMenu({ user, onProfile, onSignOut }) {
  const [open, setOpen] = useTopState(false);
  const ref = useTopRef(null);
  useTopEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: "flex", alignItems: "center", gap: 10, border: 0, background: open ? "var(--gray-50)" : "transparent",
        cursor: "pointer", padding: "6px 8px", borderRadius: 10, transition: "background .15s" }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.background = "var(--gray-50)"; }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = "transparent"; }}>
        <Avatar name={user.name} size={32} />
        <div style={{ display: "flex", flexDirection: "column", whiteSpace: "nowrap", textAlign: "left" }}>
          <span style={{ fontFamily: "var(--font-head)", fontWeight: 500, fontSize: 14, lineHeight: "20px", color: "var(--gray-900)" }}>{user.name}</span>
          <span style={{ fontFamily: "var(--font-head)", fontSize: 12, lineHeight: "16px", color: "var(--gray-500)" }}>{user.email}</span>
        </div>
        <Icon name={open ? "arrow-up-s-line" : "arrow-down-s-line"} size={18} color="var(--gray-400)" />
      </button>

      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 10px)", right: 0, width: 280, background: "#fff",
          border: "1px solid var(--border)", borderRadius: 14, boxShadow: "0 12px 32px rgba(16,24,40,.16)", overflow: "hidden", zIndex: 60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 16px 14px" }}>
            <Avatar name={user.name} size={44} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 15, color: "var(--gray-900)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</div>
              <div style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--gray-500)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.email}</div>
              {user.org && <div style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--gray-500)" }}>{user.org}</div>}
            </div>
          </div>
          <div style={{ borderTop: "1px solid var(--divider)", padding: 8 }}>
            <button onClick={() => { setOpen(false); onProfile && onProfile(); }} style={menuItemStyle}
              onMouseEnter={e => e.currentTarget.style.background = "var(--gray-50)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <Icon name="user-3-line" size={19} color="var(--gray-700)" />
              <span>Profile</span>
            </button>
            <button onClick={() => { setOpen(false); onSignOut && onSignOut(); }} style={{ ...menuItemStyle, color: "var(--error)" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(229,72,77,.07)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <Icon name="logout-box-r-line" size={19} color="var(--error)" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const menuItemStyle = { display: "flex", alignItems: "center", gap: 12, width: "100%", border: 0, background: "transparent",
  cursor: "pointer", padding: "11px 12px", borderRadius: 9, fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 14.5,
  color: "var(--gray-800)", transition: "background .12s", textAlign: "left" };

function TopNav({ title, onToggleNav, user = ME, onProfile, onSignOut }) {
  return (
    <header style={{
      height: 72, flex: "0 0 72px", boxSizing: "border-box", background: "#fff",
      display: "flex", alignItems: "center", gap: 18, padding: "16px 24px", borderBottom: "1px solid var(--border)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <img src="../../assets/logo/gcb-logo.svg" alt="GCB logo" style={{ width: 42, height: 42 }} />
        <div style={{ display: "flex", flexDirection: "column", whiteSpace: "nowrap" }}>
          <span style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 14, lineHeight: "20px", color: "var(--gray-900)" }}>JoeSam Ltd.</span>
          <span style={{ fontFamily: "var(--font-head)", fontSize: 12, lineHeight: "16px", color: "var(--gray-500)" }}>Main Office</span>
        </div>
      </div>
      <div style={{ width: 1, height: 40, background: "var(--gray-100)", flexShrink: 0 }} />
      <button onClick={onToggleNav} title="Toggle sidebar" style={{
        width: 38, height: 38, flexShrink: 0, padding: 0, borderRadius: 9, cursor: "pointer",
        border: 0, background: "transparent", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
        onMouseEnter={e => e.currentTarget.style.background = "var(--brand-yellow-tint)"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
        <Icon name="layout-left-line" size={20} color="var(--gray-700)" />
      </button>
      <span className="bh-h3" style={{ flex: 1 }}>{title}</span>
      <button className="btn btn-icon btn-ghost"><Icon name="notification-3-line" size={20} color="var(--gray-800)" /></button>
      <ProfileMenu user={user} onProfile={onProfile} onSignOut={onSignOut} />
    </header>
  );
}
Object.assign(window, { TopNav, ProfileMenu });
