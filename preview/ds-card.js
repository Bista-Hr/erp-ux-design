// Shared Tailwind (Play CDN) config for the live component cards — mirrors the UI kit's
// index.html so window.UI.* utility classes (bg-primary, secondary-50, …) render identically.
const _hslScale = (h) => ({ 50: `hsl(${h} 100% 98% / <alpha-value>)`, 100: `hsl(${h} 100% 94% / <alpha-value>)`, 200: `hsl(${h} 100% 88% / <alpha-value>)`, 300: `hsl(${h} 100% 78% / <alpha-value>)`, 400: `hsl(${h} 100% 62% / <alpha-value>)`, 500: `hsl(${h} 100% 46% / <alpha-value>)`, 600: `hsl(${h} 100% 38% / <alpha-value>)`, 700: `hsl(${h} 100% 33% / <alpha-value>)`, 800: `hsl(${h} 100% 25% / <alpha-value>)`, 900: `hsl(${h} 100% 15% / <alpha-value>)`, 950: `hsl(${h} 100% 8% / <alpha-value>)`, DEFAULT: `hsl(${h} 100% 46% / <alpha-value>)` });
const _secScale = { 50: "hsl(0 100% 98% / <alpha-value>)", 100: "hsl(0 100% 95% / <alpha-value>)", 200: "hsl(0 100% 90% / <alpha-value>)", 300: "hsl(0 100% 80% / <alpha-value>)", 400: "hsl(0 100% 70% / <alpha-value>)", 500: "hsl(0 100% 60% / <alpha-value>)", 600: "hsl(0 100% 50% / <alpha-value>)", 700: "hsl(0 100% 40% / <alpha-value>)", 800: "hsl(0 100% 30% / <alpha-value>)", 900: "hsl(0 100% 20% / <alpha-value>)", 950: "hsl(0 100% 10% / <alpha-value>)", DEFAULT: "hsl(0 100% 60% / <alpha-value>)" };
tailwind.config = {
  corePlugins: { preflight: false },
  theme: { extend: { colors: {
    primary: { ..._hslScale(51), foreground: "oklch(0.2 0.02 85)" },
    secondary: _secScale,
    destructive: "hsl(0 74% 50% / <alpha-value>)",
    "destructive-foreground": "#ffffff",
    card: "#ffffff", "card-foreground": "hsl(0 0% 14.5%)",
    background: "#ffffff", foreground: "hsl(0 0% 14.5%)",
    border: "hsl(0 0% 92%)", input: "hsl(0 0% 92%)", ring: "hsl(51 100% 46%)",
    "muted-foreground": "hsl(0 0% 45% / <alpha-value>)",
  }, fontFamily: { sans: ["Manrope", "sans-serif"] } } },
};
