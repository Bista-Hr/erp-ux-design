// BISTA HR · shell/TopNav — full-width header bar: org identity + collapse toggle on the
// left, page title, then notifications + profile. The sidebar toggle lives here (next to
// the logo) rather than inside the sidebar, matching the product header.
// The profile cluster is a button that opens a dropdown (Profile · Sign out).
const { useState: useTopState, useRef: useTopRef, useEffect: useTopEffect } = React;

function ProfileMenu({ user, onProfile, onSignOut, compact = false }) {
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
        {!compact && <div style={{ display: "flex", flexDirection: "column", whiteSpace: "nowrap", textAlign: "left" }}>
          <span style={{ fontFamily: "var(--font-head)", fontWeight: 500, fontSize: 14, lineHeight: "20px", color: "var(--gray-900)" }}>{user.name}</span>
          <span style={{ fontFamily: "var(--font-head)", fontSize: 12, lineHeight: "16px", color: "var(--gray-500)" }}>{user.email}</span>
        </div>}
        {!compact && <Icon name={open ? "arrow-up-s-line" : "arrow-down-s-line"} size={18} color="var(--gray-400)" />}
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

// ---- live role switcher (demo): reshapes the whole app by signed-in role ----
function RoleSwitcher({ roles = [], roleId, onSwitchRole }) {
  const [open, setOpen] = useTopState(false);
  const ref = useTopRef(null);
  useTopEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc); document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, [open]);
  const role = roles.find(r => r.id === roleId) || roles[0];
  if (!role) return null;
  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      <button onClick={() => setOpen(o => !o)} title="Switch role (demo)" style={{
        display: "flex", alignItems: "center", gap: 9, border: "1px solid var(--border)",
        background: open ? "var(--gray-50)" : "#fff", cursor: "pointer", padding: "7px 12px", borderRadius: 999,
        transition: "background .15s" }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.background = "var(--gray-50)"; }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = "#fff"; }}>
        <span style={{ width: 22, height: 22, borderRadius: "50%", background: (role.color || "#375DFB") + "1f",
          display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name={role.icon || "user-3-line"} size={13} color={role.color || "#375DFB"} />
        </span>
        <div style={{ display: "flex", flexDirection: "column", textAlign: "left", whiteSpace: "nowrap" }}>
          <span style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 12.5, lineHeight: "15px", color: "var(--gray-900)" }}>{role.name}</span>
          <span style={{ fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 10.5, lineHeight: "13px", color: "var(--gray-400)", letterSpacing: ".02em" }}>VIEWING AS</span>
        </div>
        <Icon name={open ? "arrow-up-s-line" : "arrow-down-s-line"} size={16} color="var(--gray-400)" />
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 10px)", right: 0, width: 300, background: "#fff",
          border: "1px solid var(--border)", borderRadius: 14, boxShadow: "0 12px 32px rgba(16,24,40,.16)", overflow: "hidden", zIndex: 60 }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--divider)" }}>
            <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 13, color: "var(--gray-900)" }}>Switch role</div>
            <div style={{ fontFamily: "var(--font-ui)", fontSize: 11.5, color: "var(--gray-500)", marginTop: 2 }}>Preview the app as a different role &amp; permission set.</div>
          </div>
          <div style={{ padding: 8, maxHeight: 360, overflowY: "auto" }}>
            {roles.map(r => {
              const on = r.id === roleId;
              return (
                <button key={r.id} onClick={() => { setOpen(false); onSwitchRole && onSwitchRole(r.id); }} style={{
                  display: "flex", alignItems: "center", gap: 11, width: "100%", border: 0, textAlign: "left",
                  background: on ? "var(--brand-yellow-tint)" : "transparent", cursor: "pointer", padding: "9px 10px", borderRadius: 10 }}
                  onMouseEnter={e => { if (!on) e.currentTarget.style.background = "var(--gray-50)"; }}
                  onMouseLeave={e => { if (!on) e.currentTarget.style.background = "transparent"; }}>
                  <span style={{ width: 28, height: 28, borderRadius: "50%", background: (r.color || "#375DFB") + "1f",
                    display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon name={r.icon || "user-3-line"} size={15} color={r.color || "#375DFB"} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 13.5, color: "var(--gray-900)" }}>{r.name}</div>
                    <div style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--gray-500)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{(r.permissions || []).length} permissions</div>
                  </div>
                  {on && <Icon name="check-line" size={17} color="var(--brand-yellow-dark)" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function TopNav({ title, onToggleNav, user = ME, onProfile, onSignOut, onNotifications, hasUnread = false, compact = false }) {
  return (
    <header style={{
      height: 72, flex: "0 0 72px", boxSizing: "border-box", background: "#fff",
      display: "flex", alignItems: "center", gap: compact ? 10 : 18, padding: compact ? "12px 14px" : "16px 24px", borderBottom: "1px solid var(--border)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <img src="../../assets/logo/gcb-logo.svg" alt="GCB logo" style={{ width: compact ? 34 : 42, height: compact ? 34 : 42 }} />
        {!compact && <div style={{ display: "flex", flexDirection: "column", whiteSpace: "nowrap" }}>
          <span style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 14, lineHeight: "20px", color: "var(--gray-900)" }}>JoeSam Ltd.</span>
          <span style={{ fontFamily: "var(--font-head)", fontSize: 12, lineHeight: "16px", color: "var(--gray-500)" }}>Main Office</span>
        </div>}
      </div>
      {!compact && <div style={{ width: 1, height: 40, background: "var(--gray-100)", flexShrink: 0 }} />}
      {onToggleNav && <button onClick={onToggleNav} title="Toggle sidebar" style={{
        width: 38, height: 38, flexShrink: 0, padding: 0, borderRadius: 9, cursor: "pointer",
        border: 0, background: "transparent", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
        onMouseEnter={e => e.currentTarget.style.background = "var(--brand-yellow-tint)"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
        <Icon name={compact ? "menu-line" : "layout-left-line"} size={20} color="var(--gray-700)" />
      </button>}
      <span className="bh-h3" style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: compact ? 17 : undefined }}>{title}</span>
      {!compact && <button className="btn btn-icon btn-ghost" onClick={onNotifications} title="Notifications" style={{ position: "relative" }}>
        <Icon name="notification-3-line" size={20} color="var(--gray-800)" />
        {hasUnread && <span style={{ position: "absolute", top: 7, right: 8, width: 8, height: 8, borderRadius: "50%", background: "var(--error)", border: "2px solid #fff" }} />}
      </button>}
      <ProfileMenu user={user} onProfile={onProfile} onSignOut={onSignOut} compact={compact} />
    </header>
  );
}
Object.assign(window, { TopNav, ProfileMenu, RoleSwitcher });
