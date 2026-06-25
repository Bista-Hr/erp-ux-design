# BISTA HR — project rules (read before building anything)

These are non-negotiable. They exist because the same mistakes kept recurring. When working
in `ui_kits/bista-hr/`, **read `ui_kits/bista-hr/UI_KIT_DOCS.md` first** — it documents every
reusable component and its props. Match the production codebase (`components/ui/*`,
`components/recruitment/*`) exactly; never invent styling "your way".

## 1. Use the reusable component layer — for the WHOLE project, not one screen
- `ui_kits/bista-hr/src/primitives/ui.jsx` exposes **`window.UI`** — `Button, Tabs/TabsList/TabsTrigger,
  Card, RadioPillGroup, Switch, Label, Field, Input, Textarea, StatCard, QuestionItem` — copied
  className-for-className from the real `components/ui/*`.
- **Always reach for `UI.*` (className-driven) before hand-rolling.** Do NOT create new
  inline-styled one-off components. If a needed component is missing, ADD it to `ui.jsx` (so it is
  reusable everywhere) and document it in `UI_KIT_DOCS.md` — do not inline it in a screen.

## 2. Design tokens (from `app/custom.css`, wired into Tailwind in `index.html`)
- **primary** = gold `hsl(51 100% 46%)` with full 50–950 scale. Primary buttons = `bg-primary` + **black** text.
- **secondary** = red `hsl(0 100% 60%)` with full 50–950 scale.
- Use Tailwind classes (`bg-primary`, `bg-primary-100/80`, `bg-secondary-50`, `text-primary-700`,
  `border-input`, `text-muted-foreground`…). Don't invent ad-hoc colors/tints.

## 3. Navigation — breadcrumb REPLACES the horizontal tabs
- Sub-views (create / detail / application / edit) report a trail via the
  **`onSubPage({ trail: [{ label, onClick }, …] })`** prop; the shell swaps the tab bar for a
  `<Breadcrumb>`. On the list view call `onSubPage(null)`; clean up with `return () => onSubPage(null)`.
- **NEVER add a "← Back to …" button on a page.** The breadcrumb is the back navigation.
- Drive it from a `React.useEffect([view])` (see `TargetRequests`, `Exit`, `PostingDetails`).

## 4. Page titles
- Every list/detail/create page title sits in a **`PageHeader`** card (`title`, `subtitle`, `actions`).

## 5. Known exact specs (do not re-derive)
- **Employee name cells (every table).** An employee/person name in ANY table ALWAYS renders with its
  `Avatar` to the left (default size, `gap:10`, `align-items:center`). When that same table would
  otherwise carry the person's **email or employee ID/code in its own column, DROP that column** and
  stack the value directly UNDER the name instead: name in the table's default weight, the secondary
  line at `font-size:12px; color:var(--gray-400); line-height:1.3`. This is the Employees-table
  treatment (`NameEmailCell` in PostingDetails is the shared renderer). Never show name and email/ID as
  two separate columns, and never show a bare name without its avatar.
- **Stat cards** = `UI.StatCard` — odd card (1st,3rd,5th) `bg-secondary-50`, even (2nd,4th) `bg-primary-50`;
  `text-sm font-light` title, `text-3xl font-semibold` value.
- **Pre-screening question** = `UI.QuestionItem` — bordered card, gray-50 header with grip +
  "Question N" + two `Switch`es ("Short/Long Text"=type 0, "Yes/No"=type 1) + trash, body `Textarea`.
- **Recruitment nav tabs** = only **Hiring Requests · Job Posts · Assessments** (Job Requests / Job
  Reopenings / Talent Pool are NOT tabs — they live as detail of a Job Post or are not built).
- **Hiring Requests** = `PageHeader` ("Hiring Request" / "See all hiring requests submitted" + **Request
  to Hire**) → one bordered card: `FilterBar` (tabs All·Pending·Approved + search + Department/Status/
  Start Date/Date Created filters) + table (Date Created · Job Title · Vacancies · Department · Start
  Date · Status · `RowActions`) + pagination. RowActions: Approved → View Details + **Post Job**; Pending
  → View Details + **Cancel Request** (red); else → View Details. **Create is a full page** (breadcrumb),
  not a modal: Job Title*/Vacancies* · Vacancy Reason*/Department* → Justification* (textarea) → Start
  Date* (`DatePicker`)/Job Status* (two checkboxes New·Existing)/Job Grade* → Cancel / Submit Request.
- **Assessments** = `PageHeader` ("Assessments") → one bordered card: `FilterBar` (tabs All·Pending·
  Completed + search, no filter panel) + table (Name · Job Title · Department · Scheduled · Status ·
  `RowActions`) + pagination. RowActions: Pending → **Start Assessment**; Completed → **View**.
- **Posting detail** = `PageHeader` (Create/Edit Assessment + Close/Open Posting) → job-info card +
  applicant-count card → `Tabs` view toggle **Job Applications · Shortlist · Assessment** → each with
  its own status sub-`Tabs` (label only, no count badges).
- **Create Job Posting** field order: Job Title* / Unit-Branch* · Department* / Employment Type* ·
  Closing Date* (`UI.DatePicker withTime`) → Job Description* → Key Duties* → Qualifications → Skills
  (all four are `UI.RichText`) → Posting Type (`RadioPillGroup`: Internal/External/Internal & External)
  → Pre-screening (`QuestionItem`) → Cancel / **Post Job**. Forms/detail pages are full-width (NO max-width).
- **Create/Edit Assessment** is a **full page** (breadcrumb `Job Posts › <posting> › Create Assessment`),
  NOT a modal: `Construct N` cards (Construct Name + Weight + Requirements) + **Total Weight n / 100** box
  + "Add Another Construct" link + Cancel / Create Assessment. Reached from the posting-detail
  "Create/Edit Assessment" header button.
- **Row actions** use `UI.RowActions` with this RULE: **more than 2 actions → `⋯` dropdown menu**;
  **2 or fewer → inline icon+text buttons, and inline labels are restricted to ONE WORD** (pass
  `short` or it auto-uses the label's first word; full `label` shows as title + in the dropdown).
  **Consistency rule:** a table presents its row actions UNIFORMLY — if ANY row would need the `⋯`
  dropdown (3+ actions), EVERY row in that table uses the dropdown (compute it once and pass
  `forceMenu` to all rows) so 2-action rows never sit as inline buttons beside 3-action dropdowns.
  Job Posts rows = View Details / Edit / Archive (3 → dropdown, Archive in red). Archive removes the row.
  **Promotions / Transfers / Job Title request (approval) rows** = View Details / **Edit** / Archive
  (3 → dropdown; Edit reopens the create/assign form). Hiring Requests stays inline (no 3-action row):
  Approved → View Details + Post Job; Pending → View Details + Cancel Request; else → View Details.
- **Filters** use `UI.FilterBar` with this RULE: pass `filters` as an array of `{ label, node }` —
  **1 filter → inline dropdown box** in the toolbar (no toggle); **2+ filters → “Show/Hide Filter”
  toggle + `#FAFAFA` panel grid + Reset/Apply** (Job Posts style). 0 → search only.
- **Container rule (always separate).** The `PageHeader` card and the table are **ALWAYS** distinct
  white `.card` containers — never merged into one — regardless of whether anything sits between them.
  Layout, top to bottom: a `PageHeader` card (title + subtitle + primary action), then any intervening
  content each in its OWN white `.card` (e.g. the 5 `StatCard` tiles inside a white `.card`, info
  panels in their own `.card`), then the table in its own white `.card` (`padding:0; overflow:hidden`)
  with the `FilterBar` flush at its top (the FilterBar's own `border-b` separates it from the table),
  then the table, then pagination — all DIRECTLY inside the card, NO inner `rounded-md border` box.
  EVERY section is card-wrapped (never bare). The wrapper is a `flex flex-col gap-20` (`PageHeader` +
  cards). Applies to Hiring Requests, Assessments, Promotions, Transfers, Job Title, Job Posts list,
  Program Catalog, Needs Assessment, and the posting detail alike — same separated, flush card-per-
  section treatment everywhere. (Previously some list pages merged header+table into one card, and some
  wrapped the table in an inner `rounded-md border` box; both are retired — Job Posts is the reference.)
- **Posting detail** is the separated pattern: the applications tabs/table card is the MAIN panel and
  the job-info + applicant-count cards group as ONE right-side container (`.pd-split` → `.pd-main` +
  `.pd-side`): <1280 main width → column (group below the table, inner cards `column-reverse` so the
  count sits above job-info); ≥1280 → row with the group docked to the RIGHT. The job-info card's inner
  grid (`.pd-info-grid`) steps 1→2→3 columns by its own width. The view-toggle sits at the top of the
  main panel; sub-tabs sit in a `border-b` header row above the table inside a `rounded-md border`
  panel with a pager footer (`PostingPanel`).
- `StatCard` uses compact `px-5 py-4`.
- **Multi-select** (Add to Shortlist on Applications; Approve/Reject on Shortlist) uses the shared
  **bottom-right floating `BulkBar`** (yellow count pill + "<noun> selected" + Clear + action buttons) —
  the SAME bar People & Culture (Promotions/Transfers/Job Title) uses. NEVER a bar at the top of the table.

## 6. Data model lives in the real codebase types
- Mirror `lib/types/recruitment/*` enums exactly: `ApplicationStatus` (Submitted 0→Shortlisted 1→
  Assessment 2→Offer 3→Hired 4 / Rejected 5), `ShortlistRequestStatus`, `InterviewAssessmentStatus`,
  `OfferStatus`, `ApprovalStatus`.
