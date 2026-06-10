---
name: bista-hr-design
description: Use this skill to generate well-branded interfaces and assets for BISTA HR (Bistasol's HR & Workforce Management ERP), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files (`colors_and_type.css`, `bista-components.css`, `assets/`, `preview/`, `ui_kits/bista-hr/`).

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view — always `<link>` `colors_and_type.css` then `bista-components.css`, load the three webfonts + Remix Icon from CDN (see the top of `colors_and_type.css`), and reuse the JSX components in `ui_kits/bista-hr/` for app screens. If working on production code, copy assets and read the rules here to become an expert in designing with this brand.

Key reminders:
- **Brand primary is yellow `#FFD800`** (sidebar + primary CTA with **black** text); brand blue `#375DFB` is the logo/secondary signature.
- Fonts: **Manrope** (UI/body), **Mona Sans** (titles/headers), **Inter** (controls), **Bricolage Grotesque** (rare display). Workhorse size 14px.
- Icons: **Remix Icon** font from CDN (`ri-*`). No emoji, no hand-drawn SVG icons.
- Copy: Title Case for buttons/labels/titles, sentence case for descriptions; address the user as "you"; confirm actions with "Yes, <Verb>".

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.
