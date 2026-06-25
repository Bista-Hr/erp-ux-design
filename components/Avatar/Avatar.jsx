// BISTA HR · Avatar — circular persona chip. Color is deterministically hashed from the
// name so the same person is always the same color. Pass `src` for a photo. Self-contained.
const AVATAR_COLORS = [
  "#2563EB", "#9333EA", "#16A34A", "#EA580C", "#DB2777", "#4F46E5",
  "#0D9488", "#DC2626", "#0891B2", "#D97706", "#65A30D", "#059669",
  "#7C3AED", "#C026D3", "#E11D48", "#0284C7",
];
function avatarColor(str) {
  let hash = 0;
  for (let i = 0; i < (str || "").length; i++) {
    const ch = str.codePointAt(i) || 0;
    hash = (hash << 5) - hash + ch;
    hash = hash & hash;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function Avatar({ name = "", size = 36, src }) {
  if (src) {
    return <img src={src} alt={name} style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0, objectFit: "cover", display: "inline-block" }} />;
  }
  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <span style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: avatarColor(name), display: "inline-flex", alignItems: "center", justifyContent: "center",
      fontFamily: "var(--font-head)", fontWeight: 700, fontSize: size * 0.38, color: "#fff" }}>{initials}</span>
  );
}
