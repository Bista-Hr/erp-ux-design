// BISTA HR · shared/SelectionActionBar — the canonical floating bulk-action bar.
// Mirrors components/shared/SelectionActionBar: anchored bottom-right, white surface with a
// soft shadow, a yellow count pill that pops on change, and a spring slide-in/out. The count
// pill + label sit first, then the action button(s), then Clear (✕) at the far right.
// Use for EVERY multi-select roster/table that drives a bulk action — never a bar at the
// top of a table. Reuses the shared `.jt-assignbar` styling so it matches BulkBar everywhere.
//   Props: count, itemLabel ("staff"), primaryAction {label,onClick,icon,variant,disabled},
//          secondaryAction {…}, onClear, isVisible (defaults to count > 0), className.
const { useState: useSAB, useEffect: useSABEffect } = React;

function SelectionActionBar({ count = 0, itemLabel = "item", primaryAction, secondaryAction, onClear, isVisible, className = "" }) {
  const show = (isVisible === undefined ? true : isVisible) && count > 0;
  // Keep the last non-zero count so the label/pill don't flash to 0 during the slide-out.
  const [last, setLast] = useSAB(0);
  useSABEffect(() => { if (count > 0) setLast(count); }, [count]);
  const shown = count || last;

  const actionBtn = (a, fallback) => a && (
    <Button variant={a.variant || fallback} size="sm" icon={a.icon} disabled={a.disabled} onClick={a.onClick}>{a.label}</Button>
  );

  return (
    <div className={`jt-assignbar ${show ? "" : "hidden"} ${className}`.trim()}>
      <span className="jt-count" key={shown}>{shown}</span>
      <span style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--gray-700)" }}>
        {itemLabel}{(shown === 1 || /(s|staff)$/i.test(itemLabel)) ? "" : "s"} selected
      </span>
      {actionBtn(primaryAction, "primary")}
      {actionBtn(secondaryAction, "stroke")}
      <button className="jt-clear" onClick={onClear} aria-label="Clear selection"
        style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "6px 8px" }}>
        <Icon name="close-line" size={18} />
      </button>
    </div>
  );
}

Object.assign(window, { SelectionActionBar });
