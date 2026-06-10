# BISTA HR — UI Kit (Core HR admin app)

A high-fidelity, interactive recreation of the **BISTA HR** Core-HR admin surface, recreated from the `Bistasol ERP.fig` source. Components are cosmetic (no real backend) but pixel-faithful and modular.

Open **`index.html`** for the click-through prototype:
1. **Login** — organization-domain screen (yellow oil-droplet panel + white form). Click **Continue** to enter.
2. **Core HR** — full app shell: yellow side-nav, white top-nav (tenant card + page title + bell + avatar), tabbed content.
3. **CRUD screens** — *Job Grades*, *Departments*, *Units / Branches* are fully interactive: switch tabs, filter (All/Active/Inactive), search, **Create/Add** (form modal), row **⋯ menu → Edit / Archive**, archive confirm modal, and success toasts. Other tabs show a documented placeholder (not in scope of this recreation).

## Files
| File | Contents |
|---|---|
| `index.html` | Loads React + Babel, fonts, CSS, and mounts the app. |
| `components.jsx` | Primitives: `Button`, `Field`/`Input`/`Select`/`Textarea`/`Checkbox`, `StatusDot`, `Pill`, `Tabs`, `Segmented`, `Pagination`, `Modal`, `ToastStack`, `Icon`. |
| `shell.jsx` | `Sidebar` (yellow, droplet bg, solid-gold active) + `TopNav`. |
| `screens.jsx` | `LoginScreen`, `CrudScreen` (data-driven table), `FormModal`, `WarnModal`. |
| `app.jsx` | State, tab configs, seed data, toast logic. |

Styling comes from the root `../../colors_and_type.css` + `../../bista-components.css`; brand assets from `../../assets/`.

> Faithful to source: yellow primary CTA with black text, gold (`#C8A900`) active nav, Remix Icon glyphs, Manrope/Mona Sans/Inter type, 10px control radius / 16px modal radius, border-first elevation. Sample data uses Ghana branches (Accra, Cape Coast, Kumasi, Takoradi) as in the Figma.
