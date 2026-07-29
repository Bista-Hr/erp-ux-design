// BISTA HR · employee/DetailCard — reusable building blocks for the employee profile.
//   DetailCard   : white card with icon + title + optional action link, divider, content.
//   DetailPanel  : tinted rounded panel holding a grid of DetailItems (gray/cream/pink).
//   DetailItem   : stacked label (muted) + value.
//   PersonCard   : tinted entry card (name + edit/delete) with a row of fields — used for
//                  emergency contacts, spouse, children.
//   HistoryTable : light table for employment history / similar.
const PANEL_TINT = {
  gray:  "#F6F8FA",
  cream: "#FEFBF0",
  pink:  "#FFF3F3",
  green: "#ECFDF3",
  red:   "#FEF3F2",
  plain: "transparent",
};

function CardActionLink({ label, icon = "edit-2-line", color = "var(--brand-yellow-dark)", onClick }) {
  return (
    <button onClick={onClick} style={{ display: "inline-flex", alignItems: "center", gap: 6, border: 0, background: "none",
      cursor: "pointer", fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 14, color }}>
      {label}
      <Icon name={icon} size={16} color={color} />
    </button>
  );
}

function DetailCard({ icon, title, action, children, id }) {
  return (
    <div id={id} style={{ background: "#fff", borderRadius: 12,
      overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "20px 24px" }}>
        {icon && <Icon name={icon} size={22} color="var(--gray-900)" />}
        <span style={{ flex: 1, fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 20, lineHeight: "28px", color: "var(--gray-900)" }}>{title}</span>
        {action}
      </div>
      <div style={{ height: 1, background: "var(--border)", margin: "0 24px" }} />
      <div style={{ padding: "16px 24px 24px" }}>{children}</div>
    </div>
  );
}

function DetailItem({ label, value, highlight, accent, changeBg, flag }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0, padding: "8px 12px" }}>
      <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, lineHeight: "16px", color: "var(--gray-400)" }}>{label}</span>
      <span style={{ fontFamily: "var(--font-ui)", fontWeight: 400, fontSize: 14, lineHeight: "20px", color: "#000", wordBreak: "break-word",
        ...(flag ? { display: "inline-flex", alignItems: "center", gap: 7 } : {}),
        ...(highlight ? { borderRight: `2px solid ${accent || "var(--brand-yellow)"}`, background: changeBg || "transparent", padding: "4px 8px", borderRadius: 2, alignSelf: "stretch" } : {}) }}>
        {flag && <img src={flag} alt="" style={{ width: 17, height: 17, borderRadius: "50%", flex: "none" }} />}{value || "-"}</span>
    </div>
  );
}

function DetailPanel({ items, tint = "gray", cols = 4, accent, changeBg }) {
  return (
    <div className="ed-panel-wrap">
      <div className={`ed-panel cols-${cols}`} style={{ background: PANEL_TINT[tint], borderRadius: 8, padding: 4 }}>
        {items.map((it, i) => <DetailItem key={i} label={it.label} value={it.value} flag={it.flag} highlight={it.changed} accent={accent} changeBg={changeBg} />)}
      </div>
    </div>
  );
}

function PersonCard({ tint = "pink", name, fields, onEdit, onDelete }) {
  return (
    <div style={{ background: PANEL_TINT[tint], borderRadius: 10, padding: "16px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid rgba(16,24,40,.08)" }}>
        <span style={{ flex: 1, fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 16, color: "var(--gray-900)" }}>{name}</span>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onEdit} style={{ border: 0, background: "none", padding: 0, cursor: "pointer", display: "flex" }}><Icon name="edit-2-line" size={18} color="var(--gray-500)" /></button>
          <button onClick={onDelete} style={{ border: 0, background: "none", padding: 0, cursor: "pointer", display: "flex" }}><Icon name="delete-bin-6-line" size={18} color="#EF4444" /></button>
        </div>
      </div>
      <div className="ed-panel-wrap">
        <div className="ed-personfields">
          {fields.map((f, i) => <DetailItem key={i} label={f.label} value={f.value} />)}
        </div>
      </div>
    </div>
  );
}

function HistoryTable({ columns, rows, renderCell }) {
  return (
    <div style={{ borderRadius: 10, overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table className="bh" style={{ margin: 0, minWidth: 560 }}>
          <thead><tr>{columns.map(c => <th key={c.key}>{c.label}</th>)}</tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>{columns.map(c => <td key={c.key}>{renderCell ? renderCell(c.key, r) : r[c.key]}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Timeline entry: date (muted) + bold primary + optional secondary node, with a status
// badge on the right. The current (index 0) entry takes the card's accent tint, the last
// takes gray, others stay transparent — matching the striped look in the design.
function TimelineEntry({ date, title, secondary, status, bg }) {
  return (
    <div style={{ background: bg, borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "var(--font-ui)", fontSize: 13, lineHeight: "18px", color: "var(--gray-400)" }}>{date}</div>
        <div style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 16, lineHeight: "22px", color: "var(--gray-900)", marginTop: 2 }}>{title}</div>
        {secondary != null && secondary !== "" && (
          <div style={{ fontFamily: "var(--font-ui)", fontSize: 14, lineHeight: "20px", color: "var(--gray-400)", marginTop: 5, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>{secondary}</div>
        )}
      </div>
      <StatusBadge variant={status} size="sm" />
    </div>
  );
}

function TimelineList({ entries, accent = "cream", renderSecondary }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {entries.map((e, i) => {
        const bg = i === 0 ? PANEL_TINT[accent] : (i === entries.length - 1 && entries.length > 1) ? PANEL_TINT.gray : "transparent";
        return <TimelineEntry key={i} date={e.date} title={e.title} status={e.status}
          secondary={renderSecondary ? renderSecondary(e) : e.note} bg={bg} />;
      })}
    </div>
  );
}

function SeeMore({ onClick }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
      <CardActionLink label="See More" icon="arrow-right-line" color="var(--brand-yellow-dark)" onClick={onClick} />
    </div>
  );
}

// RequesterInfoCard — compact avatar + name + subtitle chip used wherever we attribute a
// record to a person (request details, assignment, etc.). Reusable across pages.
function RequesterInfoCard({ title, subtitle, src, tint = "gray", style }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 12, background: PANEL_TINT[tint],
      borderRadius: 10, padding: "10px 16px", width: "fit-content", ...style }}>
      <Avatar name={title} size={40} src={src} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 14, color: "var(--gray-900)" }}>{title}</div>
        {subtitle && <div style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--gray-400)", marginTop: 1 }}>{subtitle}</div>}
      </div>
    </div>
  );
}

Object.assign(window, { DetailCard, DetailItem, DetailPanel, PersonCard, HistoryTable, TimelineList, TimelineEntry, SeeMore, CardActionLink, RequesterInfoCard });
