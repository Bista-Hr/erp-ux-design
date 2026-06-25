# BISTA HR — Bistasol ERP Design System

> Brand-accurate design foundations, components and UI kit for **BISTA HR & Workforce Management**, the human-resources/ERP product built for **Bistasol** (an edible-oil manufacturer). Use it to generate on-brand interfaces, mocks, and prototypes.

---

## 1 · Product context

**BISTA HR** is an internal HR & workforce-management platform. Its tagline:
> "Manage recruitment, onboarding, promotions, transfers, and employee relations — all in one streamlined platform. Save time and reduce manual errors with automated workflows."

It is a dense, **table-and-form-driven enterprise admin tool** — think Core HR records, org structure (departments, branches, units, zones, job grades, job titles), recruitment pipelines, performance appraisals, target requests, leave, promotions, and a portfolio-of-evidence module. Each tenant is a company (e.g. "JoeSam Ltd. / Main Office") logging in via an organization domain.

Two product surfaces appear in the source file:
- **UI-Revamp** — the core HR admin app (Core HR, org setup, employee records, approvals, performance). 167 frames.
- **Recruitment** — hiring manager job requests, job evaluation by committee, HR recruitment, learning & development, development goals. 81 frames.

Both share one design language, so this system serves both.

### Sources
- **Figma:** `Bistasol ERP.fig` — pages `UI-Revamp` (guid `0:1`), `Recruitment` (guid `55:23585`), `Trash` (guid `107:30158`). Mounted read-only at the time of authoring; not assumed accessible to the reader.
- No codebase or live URL was provided. All values below are lifted directly from the Figma binary (pseudocode JSX + node inspection), which is the source of truth.

---

## 2 · Index — what's in this folder

| File / folder | Purpose |
|---|---|
| `README.md` | This file — context, content + visual foundations, iconography. |
| `colors_and_type.css` | All color, type, radius, shadow and spacing tokens as CSS vars + semantic type classes. **Import this in every artifact.** |
| `styles.css` | Single entry point — `@import`s `colors_and_type.css` then `bista-components.css`. Consumers (and the DS compiler) can link this one file. |
| `components/` | **Compiled design-system components** exposed on `window.BISTAHRDesignSystem_c5941c` (`Button`, `StatusBadge`, `Avatar`, `StatCard`, `EmptyState`) — each a self-contained `Name.jsx` + `Name.d.ts` + `@dsCard` preview. Use these from consuming projects via the bound `_ds_bundle.js`. |
| `assets/` | Brand assets: Apex logo vectors, the Bistasol oil-droplet background. |
| `assets/logo/` | `apex-vector-1.svg`, `apex-vector-2.svg` — the droplet glyph inside the Apex logo. |
| `preview/` | Design-system specimen cards (colors, type, **live interactive component cards**) shown in the Design System tab. |
| `ui_kits/bista-hr/` | High-fidelity, interactive recreation of the Core HR admin app (sidebar, top nav, tables, modals, forms, login). Its `src/primitives/ui.jsx` (`window.UI`) + global controls are the broad reusable layer; the compiled `components/` are the subset exported on the DS namespace. |
| `SKILL.md` | Agent-Skill manifest so this system is usable from Claude Code. |

---

## 3 · Content fundamentals

How BISTA HR writes copy.

- **Voice:** plain, functional, operational. It tells the user what a screen *does*, never markets. Short. No exclamation points outside success toasts.
- **Person:** addresses the user as **"you" / "your"** ("Manage your organization's job grades", "Sign in with your work credentials to continue", "Are you sure you want to archive this job grade?"). Confirmations are framed as direct questions.
- **Casing:** **Title Case** for buttons, tab labels, page titles, nav items, and modal titles ("Create Job Grade", "Job Grades", "System Administration", "Yes, Archive"). **Sentence case** for descriptions, supporting text, hints and placeholders ("Add a new job grade to your organization", "Enter job grade name", "There is no data to show you right now").
- **Buttons are verb-first and specific:** "Create Job Grade", "Update Job Grade", "Close Posting", "Continue". Destructive/confirm buttons restate the verb: **"Yes, Archive", "Yes, Add", "Yes, Update"**, paired with a plain **"Cancel"**.
- **Labels:** noun phrases, short ("Name", "Code", "Description", "Status", "Main Office"). Form labels in Title Case; placeholders give an example, often prefixed "eg." ("eg. Starett-ltd", "Enter grade code").
- **Empty / system states:** terse two-part — a short Title Case label + one sentence-case line ("No Data" / "There is no data to show you right now").
- **Toasts:** noun + past-tense verb, no period ("Department Added"). Green = success, red = error.
- **Emoji:** **none in product copy.** (Emoji appear only as internal labels on Figma component variants — 🧩📌📏 — never in the UI itself.) Do not use emoji in generated BISTA UI.
- **Tone summary:** competent, quiet, get-out-of-the-way enterprise software. Clarity over personality.

---

## 4 · Visual foundations

### Color
- **Brand primary is yellow `#FFD800`** — the Bistasol house color. It owns the **left sidebar** (full yellow fill) and the **primary call-to-action buttons** (yellow fill, **black** text). Active/hover yellow is `#C8A900`.
- **Brand blue `#375DFB`** is the secondary signature — it's the color of the **Apex logo mark** and is used for info/primary-blue buttons and focus states.
- **Surfaces:** app canvas is a cool off-white `#F6F8FA`; cards, top nav, modals, inputs are pure white. Generous use of white space; content sits in white cards on the gray canvas.
- **Borders** are the workhorse of separation, not shadow: hairline `#EAECF0` (default) / `#E2E4E9` (inputs, cards), 1px. Dividers `#F2F2F7`.
- **Text** is near-black `#0A0D14` for headings, `#525866` for secondary, `#868C98` for muted/placeholder. Very high contrast, no light-gray body text.
- **Semantics:** success green `#007839`, error red `#C11E39`, warning orange `#F87A25` (on a `#FEF3EB` tint). Status dots: green = Active, red = Inactive.
- **Imagery vibe:** warm and golden. The hero asset is a glossy 3-D **oil droplet** on a cream backdrop; the login uses a warm photographic panel under the yellow.

### Type
- **Manrope** is the primary UI typeface — nav labels (700), body, most 14px text.
- **Mona Sans** handles headers and titles — top-nav page title (20/700), modal & card titles (16/700), card headers (24/700), and a lot of medium-weight body (14/500).
- **Inter** is used inside **controls** — input text/placeholders and button labels (14/500).
- **Bricolage Grotesque** is a rare display face (20–32, bold) for occasional big moments.
- The workhorse size is **14px**; 12px for captions/badges; 20–32px for headings. Tight tracking (~-0.006 to -0.011em) on headings and body.
- See `colors_and_type.css` for the full role scale (`.bh-h1`…`.bh-caption`).

### Shape, elevation & layout
- **Corner radii:** buttons & inputs **10px**, nav items & toasts **8px**, badges/pills **6px**, cards **12px** (media) / **16px** (modals & big cards), avatars/dots fully round.
- **Elevation is subtle.** Cards rely on a 1px border + a barely-there shadow; real shadow appears only on **modals** (`0 16px 32px -12px rgba(88,92,95,.10)`) and popovers. Inputs carry a 1px-2px hairline shadow. No heavy/colored drop shadows except the faint blue under the logo.
- **Layout shell:** fixed **272px** yellow left sidebar + **72px** white top nav + scrolling gray content. Content max-width is generous; pages are organized as a page-header (title + subtitle + primary action), an optional tab bar, a filter/search row, then a white table or form card. Pagination sits at the card's foot.
- **Cards:** white fill, 1px `#EAECF0` border, 12–16px radius, minimal shadow, 16–24px padding.
- **Modals:** 440px (confirm) – 600px+ (forms), white, 16px radius, soft modal shadow, centered icon-title-text for confirmations.

### Motion, hover & press
- The Figma file is static; no animation is specified. Keep motion **minimal and functional** — short 120–200 ms fades/slides for modals, toasts and dropdowns; no bounces or playful easing. Use ease-out for enters.
- **Hover:** darken fills slightly (yellow → `#C8A900`, blue → `#2244D3`); neutral/ghost buttons pick up a faint gray fill. Rows get a `#F9FAFB`/`#F6F8FA` hover tint.
- **Press:** deepen color one more step; optionally nudge translucency. No scale-down.
- **Focus:** brand-blue ring on inputs/controls.
- **Transparency/blur:** used sparingly — the active side-nav item is a `rgba(50,50,50,0.3)` dark wash over the yellow; the oil-droplet watermark sits at low opacity behind the sidebar.

### Backgrounds
- The **yellow sidebar** is overlaid with the **oil-droplet image** as a faint, large watermark — warm, premium, brand-specific. The **login** splits a yellow+photo left panel from a white form right panel. Otherwise content is flat `#F6F8FA`; **no gradients** in the product chrome (the only gradients are inside the logo mark and the 3-D droplet render).

---

## 5 · Iconography

- **Primary icon set: [Remix Icon](https://remixicon.com/).** The Figma layer names are literal Remix Icon slugs — `arrow-right-s-line`, `arrow-left-s-line`, `user-3-line`, `time-fill`, `alert-fill`, `notification-3-line`, `close-line`, `select-box-circle-fill`, `info-custom-fill`, `search-2-line`, `add-line`, `buildings-alt`, `settings`. Both **line** (`-line`) and **fill** (`-fill`) styles are used: line for nav/actions, fill for status/semantic icons.
- **Delivery:** link the Remix Icon webfont from CDN and use `<i class="ri-time-fill"></i>` style classes — this is faithful to source and avoids hand-drawing SVGs:
  ```html
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/remixicon@4.5.0/fonts/remixicon.css">
  ```
- Icons render at **16px** (inside badges/inputs) and **18–20px** (nav, buttons), tinted with the surrounding text/semantic color (`#8A8F93` default, `#FFFFFF` on filled buttons, semantic colors on status).
- **Logo — "Apex" mark:** a blue (`#375DFB`) rounded-square/circle holding a white droplet+swoosh glyph (a stylized oil drop), with an inner highlight (`inset 0 -4px 8px rgba(255,255,255,.64)`) and a faint blue cast shadow. Vectors are in `assets/logo/`. In the top nav it pairs with the tenant company name + office; on login it sits above "Welcome". A second logo lockup ("Synergy") appears as the in-app header card icon.
- **Empty states:** a family of soft, monochrome **gray line-art illustrations** (database stack + magnifier for "No Data", plus No-Result, No-Access, No-Network, Empty-Trash, No-Notifications, etc.) — ~170×215, light gray strokes on white, with a small Title + supporting line beneath. They live as multi-layer vector art in Figma (`Empty-State-Illustrations_Light-Mode_*`); recreate as light-gray line illustrations, do not invent colorful ones.
- **Avatars:** circular photo personas (e.g. "Matthew Johnson") at 32px in the top nav.
- **No emoji or unicode glyphs** are used as functional icons.

> **Substitution flags:** **Mona Sans** is GitHub's open-source font (not on Google Fonts) — loaded here from the Fontsource CDN; if it fails it falls back to Manrope. If you have the licensed/official font files, drop them in `fonts/` and update `colors_and_type.css`. **Remix Icon** is the genuine set used in the source, linked from CDN (no substitution).
