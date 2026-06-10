// BISTA HR · primitives/PageHeader — a white card holding a page title + subtitle and an
// optional right-side actions slot. Use it at the top of detail / create / edit full-page
// views (and any list intro) so every page title sits in a card, consistent with the
// Promotions screens. The breadcrumb (which replaces the horizontal submenu) provides the
// "back" navigation; this card carries the title.
//   <PageHeader title="Promotion Approval" subtitle="Review and approve or reject promotions."
//     actions={<Button>…</Button>} />
function PageHeader({ title, subtitle, icon, actions, style }) {
  return (
    <div className="card" style={{ padding: "20px 24px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", ...style }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, minWidth: 0 }}>
        {icon && <span style={{ flexShrink: 0, marginTop: 2 }}><Icon name={icon} size={24} color="var(--gray-900)" /></span>}
        <div style={{ minWidth: 0 }}>
          <div className="bh-h2" style={{ fontSize: 24 }}>{title}</div>
          {subtitle && <div className="bh-body" style={{ marginTop: 4 }}>{subtitle}</div>}
        </div>
      </div>
      {actions && <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>{actions}</div>}
    </div>
  );
}

Object.assign(window, { PageHeader });
