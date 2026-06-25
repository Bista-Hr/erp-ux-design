// BISTA HR · StatCard — KPI tile. Alternating brand tints by `index`: even index
// (1st / 3rd / 5th) → secondary-50 (red tint), odd → primary-50 (gold tint). Self-contained.
export function StatCard({ title, value, index = 0 }) {
  const bg = index % 2 === 0 ? "hsl(0 100% 98%)" : "hsl(51 100% 96%)";
  return (
    <div style={{ borderRadius: 14, padding: "16px 20px", background: bg }}>
      <p style={{ margin: 0, fontFamily: "var(--font-ui)", fontWeight: 300, fontSize: 14, color: "var(--gray-700)" }}>{title}</p>
      <p style={{ margin: "4px 0 0", fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 30, lineHeight: 1.1, color: "var(--gray-900)" }}>{value}</p>
    </div>
  );
}
