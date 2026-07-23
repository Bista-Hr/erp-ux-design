# BISTA HR UI Kit — Component & Props Reference

The reusable layer lives in `src/primitives/ui.jsx` and is exposed as **`window.UI`**. It mirrors
the production app's `components/ui/*` (shadcn + Tailwind) using the real tokens. Use these across
**every** screen — do not hand-roll inline-styled equivalents. Tailwind (Play CDN) is configured in
`index.html` with the `primary` (gold) and `secondary` (red) scales from `app/custom.css`.

> Read this file before building or editing any screen. If you need a component that isn't here,
> add it to `ui.jsx` and document it here.

---

## EmailInputList  (multi-email entry — People & Culture standard)
The single, consistent multi-email field used across **all** People & Culture forms (Leave Types,
Promotions, Transfers, Exit). A global (`window.EmailInputList`, from `src/primitives/controls.jsx`).
- Per-email **colored chips** (hashed pastel via `getEmailBadgeColor(email)`) sit in a bordered,
  horizontally-scrolling box; each chip has an `×` to remove it.
- Below the chips: an input (gold focus ring via `.input-wrap`) + a `+` add button, then the
  `Press Enter or click + to add email` hint. Validates format + de-dupes, surfacing an inline error.
- Props: `label`, `description` (shown as gray `(…)` after the label), `placeholder`, `emails`
  (`string[]`), `onChange(string[])`, `error` (string).
- State is a plain `string[]` (init `[]`, no empty placeholder); submit it directly as `notifyMails`.

```jsx
<EmailInputList label="Notify Department" description="Department mails only"
  placeholder="eg. financedept@starret.com" emails={mails} onChange={setMails} />
```
Do NOT hand-roll stacked email `<input>`s with an "Add another" link, and do NOT use a uniform-color
chip input — this colored-chip component is the canonical one everywhere emails are collected.

## UI.Button
Mirrors `components/ui/button.tsx`.
| prop | type | default | notes |
|---|---|---|---|
| `variant` | `default \| destructive \| outline \| secondary \| ghost \| link` | `default` | `default` = `bg-primary text-black`; `outline` = border-primary; `secondary` = white + primary border; `ghost`/`link` = text-primary |
| `size` | `default \| sm \| xs \| lg \| icon` | `default` | heights 10/9/8/11; `icon` = square |
| `icon` / `iconRight` | string (Remix slug, no `ri-`) | — | renders `<i class="ri-…">` |
| `disabled`, `onClick`, `className`, `children` | — | — | |

## UI.Tabs / UI.TabsList / UI.TabsTrigger
Mirrors `components/ui/tabs.tsx`. Controlled.
- `UI.Tabs` props: `value`, `onValueChange`, `className`.
- `UI.TabsList`: track `bg-[#F6F8FA] rounded-lg px-2 py-1`.
- `UI.TabsTrigger` props: `value`; active state → `bg-primary-100/80 shadow-sm font-semibold text-gray-900`.
- Use for BOTH the page-level view toggle and nested status sub-tabs. Labels only (no count badges).

```jsx
<UI.Tabs value={view} onValueChange={setView}>
  <UI.TabsList>{TABS.map(t => <UI.TabsTrigger key={t} value={t}>{t}</UI.TabsTrigger>)}</UI.TabsList>
</UI.Tabs>
```

## UI.Card
Mirrors `components/ui/card.tsx`: `bg-card text-card-foreground flex flex-col gap-3 rounded-xl p-6`.
Props: `className`, `children`.

## UI.StatCard
Mirrors the `StatsCard` in `JobPostingsPageClient`. Props: `title`, `value`, `index`.
Background alternates by `index`: even index (1st/3rd/5th card) → `bg-secondary-50`, odd → `bg-primary-50`.
Title `text-sm font-light`; value `text-3xl font-semibold`.

## UI.RadioPillGroup
Mirrors `components/ui/radio-pill-group.tsx`. Props: `options` (`[{value,label}]`), `value`, `onValueChange`.
Checked pill → `border-primary bg-primary-50 text-primary-700` with a filled radio dot.

## UI.RadioGroup / UI.CheckboxGroup  (FORM & QUIZ option lists)
Vertical, visible pick-lists — use these for "choose one / choose many from a list", NOT a Combobox
dropdown. Options may be plain strings or `{value,label}`.
- `UI.RadioGroup` — single value. Props: `options`, `value`, `onChange(value)`.
- `UI.CheckboxGroup` — array value. Props: `options`, `value` (array), `onChange(array)`.
Selected row → `border-primary bg-primary-50` with a check in a circle (radio) / square (checkbox).
The interactive-course form renderer uses RadioGroup for `single-select` and CheckboxGroup for
`multi-select`; quiz answers use the same radio styling.

## UI.Switch
Mirrors `components/ui/switch.tsx`. Props: `checked`, `onCheckedChange(next)`, `id`, `className`. On = `bg-primary`.

## UI.QuestionItem  (pre-screening question)
Mirrors `SortableQuestionItem.tsx`. Props: `question` (`{text, type}`), `index`, `onChange(field, value)`, `onRemove()`.
- Bordered `rounded-lg` card; gray-50 header row: grip glyph + `Question {index+1}` + two `Switch`es
  (**Short/Long Text** → `type=0`, **Yes/No** → `type=1`) + trash button; body = `Textarea` "Enter your question".

## UI.Field / UI.Label / UI.Input / UI.Textarea
Mirror `components/ui/input.tsx`/`label.tsx`.
- `UI.Field`: `label`, `required` (red `*`), `optional` ("(Optional)"), `className`, `children` (wraps in `space-y-2`).
- `UI.Label`: `required`, `optional`, `className`, `children`.
- `UI.Input`: standard props + `error`. `h-9 rounded-md border border-input`.
- `UI.Textarea`: standard props. `min-h-20 rounded-md border border-input`.

> For **searchable selects** use the existing global `Combobox` (`value`, `onChange`, `options`,
> `placeholder`, `noDataText`) — it is the kit's reusable popover select. Extra props: `header`
> (node rendered in the dropdown's search row, right of the input), `compact` (borderless muted
> trigger for embedding inside another control's toolbar — mirrors a ghost shadcn SelectTrigger),
> `disabled`, `icon`.

## DesignationCombobox (global — job-title picker with department filter)
Mirrors `components/shared/DesignationCombobox.tsx`. A `Combobox` for the **New Job Title** whose
dropdown carries a compact department filter IN THE SEARCH ROW (right of the search input) — the
department only narrows the title list; it is never part of the submitted payload. **Job titles are
NOT tied to departments** — the full catalog shows by default; the filter state is INTERNAL when
`department`/`onDepartmentChange` are omitted (the usual usage: `<DesignationCombobox value onChange />`).
Picking a title NEVER auto-populates the grade. Used by Promotions / Transfers / Job Title forms.
- Props: `value`, `onChange`, optional `options` / `department` / `onDepartmentChange` /
  `departments`, `placeholder`, `noDataText`.

## UnitBranchCombobox (global — unit/branch picker with zone filter)
SAME pattern as DesignationCombobox: the **Organizational Unit/Branch** picker with a compact ZONE
filter in the dropdown's search row (`window.unitBranchesForZone`). Pass `zone`/`onZoneChange` wired
to the form's Zones field so a selected Zone filters this list (changing zone clears a mismatched
pick). This field is MANDATORY on Promotions / Transfers / Job Title as "New Organizational
Unit/Branch". Props: `value`, `onChange`, `zone`, `onZoneChange`, `zones`.

## LineManagerField (global — New Line Manager, single field, Transfers only)
ONE reusable combobox (same pattern as the employee pickers): options show the directory name with
staff ID · dept sublabel + avatar, and once picked the SAME field shows the manager's other details
(staff ID · location) as a caption beneath the trigger — no separate auto-populated fields.
Props: `value` (employee id), `onChange`, `employees`. Used by the Transfer form only.

## NotifyPeopleField (global — Teams-style notification picker, small chips + custom emails)
Replaces raw email entry on the P&C Notification cards. Add PEOPLE from a directory combobox OR
type a CUSTOM email (Enter / Add). Entries render as SMALL chips — tiny avatar + name for people,
the colored EmailInputList chip style for custom emails — never the big employee cards. `value`
mixes employee ids and raw email strings; emails resolve and send in the background.
Props: `value`, `onChange`, `employees`, `label`, `hint`.

## SupportingDocuments — in-form preview + required
Tiles in the dropzone are now CLICKABLE and open the same `SupportingDocsGallery` lightbox used on
detail pages (images render live; docs open a same-type sample). Supporting documents are a
REQUIRED field on Promotions / Transfers / Job Title — forms gate submit on
`keptUrls.length + newFiles.length > 0`.

## UI.RichText  (rich-text editor — mirrors rich-text-input.tsx)
For ALL long description fields (Job Description, Key Duties, Qualifications, Skills, etc.) — never a
plain textarea. Quill-"snow"-style toolbar (bold/italic/underline/strike · bullet/number list · link ·
clear) over a contentEditable body; `value` is an HTML string. Props: `value`, `onChange(html)`,
`placeholder`, `error`, `className`.
**Link popover:** the Link button opens a two-tab popover instead of a URL prompt —
**In-App Page** (searchable page list grouped by section, from `window.UI_APP_PAGES`
`[{ label, path, section }]` — override it with the app's real route map) and **External URL**.
With no text selected the page's name is inserted as the link text; a selection is wrapped.
The picker itself is exported as **`UI.LinkPopover`** (`onPick(url, label?)`, `onClose`) — render it inside a
`position:relative` wrapper to attach it to any trigger (e.g. the SMS template "Insert Link" button).

## UI.Tooltip  (shadcn-style tooltip)
`<UI.Tooltip label="Bold"><button…/></UI.Tooltip>` — dark bubble on hover/focus, `side="top"|"bottom"`.
The `UI.RichText` toolbar wraps every formatting button (Bold, Italic, lists, Link, Clear…) in one.

## UI.DatePicker — weekend rule
Pass `weekendRule` and weekend dates render disabled by DEFAULT, with a compact "Allow weekends"
mini-switch in the popover footer to re-enable them. All P&C effective-date fields (Promotions /
Transfers / Job Title) pass `weekendRule`.

## UI.HtmlBodyEditor  (email/in-app body editor with Editor · HTML · Preview toggle)
For HTML EMAIL and IN-APP notification bodies (notification templates etc.). Wraps `UI.RichText` so non-technical users edit
visually; the **HTML** tab exposes the raw markup in a mono textarea; **Preview** renders the final
email on a letter-style card. `value` IS the HTML string (same contract as RichText). Props: `value`,
`onChange(html)`, `placeholder`, `rows` (HTML tab height), `insertRef` (ref that receives a
`fn(snippet)` inserting at the caret of the active view — wire merge-field buttons through it).

## UI.DatePicker  (mirrors date-picker.tsx)
shadcn-style outline trigger + popover month calendar. Use for EVERY date field — never a typed
`DD/MM/YYYY` input. Props: `value` (Date|string|null), `onSelect(date)`, `placeholder`, `withTime`
(adds a time row + Done), `error`, `className`.

## Container-query layout helpers (responsive by CONTAINER width, not viewport)
Defined in `index.html`. Use these so stat/info panels reflow with the content area, not the screen.
- **`.cq-split`** + children **`.cq-main`** / **`.cq-side`** — below 1280px container → flex **column**
  (side stacked; add `.reverse` to put the side panel on top via `column-reverse`); ≥1280px container →
  **row** with the side panel at the right (`--cq-side-w`, default 260px). Used by Posting detail
  (job-info `.cq-main` + applicant-count `.cq-side.reverse`).
- **`.cq-stats`** (the query container) wrapping **`.cq-stat-grid`** — stat tiles go 1-up → 2-up
  (≥520px) → 3-up (≥820px) by container width. Used by Moderation score tiles.
- **`.jp-split`** (Job Posts list) — stats card + table card: column on small, row at ≥1280px with the
  stats column on the right; its `.jp-stat-grid` is 1-up → 5-up (≥640px) → 1-up when docked beside the table.
- Leave planner uses its own named container (`.leave-page` / `@container leave`).
Always prefer a container query over a viewport breakpoint for in-page panel reflow.

## UI.Input / UI.Textarea font
Both set `fontFamily: inherit` — inputs use the page's default family, NOT `--font-control`.

## BulkBar (global, multi-select) — `src/primitives/controls.jsx`
The shared **bottom-right floating** bulk-action bar (yellow count pill that pops + label + Clear +
action buttons). Use for EVERY multi-select table — same bar as People & Culture.
Props: `count`, `noun` (e.g. `"candidates selected"`), `visible`, `onClear`, `children` (action `Button`s).
```jsx
<BulkBar count={n} noun="candidates selected" visible={n > 0} onClear={clear}>
  <Button variant="primary" icon="user-follow-line" onClick={…}>Add to Shortlist</Button>
</BulkBar>
```
Do NOT build a custom selection bar at the top of the table.

## SelectionActionBar (global, `src/shared/SelectionActionBar.jsx`)
The People & Culture wrapper around the floating bulk bar — same `.jt-assignbar` visual (bottom-right,
white surface, yellow count pill that pops, spring slide). Order: count pill → `<itemLabel> selected`
→ primary/secondary action → **Clear (✕)** at the far right. Used internally by
`EmployeeSelectionRoster`; reuse directly anywhere you want the design's `{primaryAction}` API.
Props: `count`, `itemLabel` (`"staff"`; pluralizes for countable nouns, never "staffs"), `primaryAction`
/`secondaryAction` (`{ label, onClick, icon, variant, disabled }`), `onClear`, `isVisible`.

## EmployeeSelectionRoster (global, `src/shared/EmployeeSelectionRoster.jsx`)
The single, reusable employee roster — the **single source of truth** for every multi-employee action
(Promotions, Transfers, Job Title, …). A checkbox table (select-all + search) with fixed columns
**Full Name (Avatar + name) · Employee ID · Current Job Title · Current Grade · Department** and **no
per-row action button** — selecting rows reveals the `SelectionActionBar`, whose primary action hands
the selected ids to the parent (which routes to the create form). Drop it straight into a `.card`
(`padding:0`) under the `FilterBar`.
- Props: `employees` (`[{ id, name, employeeNumber, jobTitle, jobGrade, department, profilePictureUrl }]`),
  `itemLabel`, `actionLabel`, `onProceed(ids)`, `searchQuery` (controlled → the roster filters by it and
  hides its own search field, e.g. when the parent owns search in the tab row), `searchPlaceholder`,
  `isActionPending`, `perPage`.
```jsx
<UI.FilterBar left={<Segmented items={["Request","Approval"]} .../>} search={q} onSearch={setQ} />
<EmployeeSelectionRoster employees={rosterRows} itemLabel="staff"
  actionLabel="Create Promotion" onProceed={(ids) => openCreate(ids)} searchQuery={q} />
```
Do NOT hand-roll a per-page roster table or add a per-row Promote/Transfer button — this component is it.

## MultiImageDropZone (global, `src/forms/MultiImageDropZone.jsx`)
The canonical multi-file dropzone for the workflow forms (Promotions / Transfers / Exit / …) — ported
1:1 from the app's `components/shared/MultiImageDropZone`. Click **or** drag & drop, multi-file, with a
horizontal gallery of 160px thumbnail cards. **Supports create AND edit** in one component:
- **New files** (this session) → blue **NEW** badge + red ✕ (✕ reveals on card hover).
- **Existing files** (edit mode, from `existingImages` URLs) → ✕ marks them removed (40% opacity +
  "REMOVED" overlay); the overlay is **click-to-restore**. Track the removed set yourself and pass it back.
- **Empty** → one large dropzone; once anything is present a compact dropzone sits above the gallery.
Image files render a live FileReader preview; everything else shows the branded `FileIcon`.
Props: `selectedFiles` (`File[]`), `onFilesSelect(files)`, `existingImages` (`string[]`),
`onRemoveExistingImage(url)`, `onRestoreImage(url)`, `removedImages` (`string[]`), `isEditMode`,
`maxFiles`, `maxSize`, `idleText`, `idleTextEmpty`, `acceptedFileTypesText`, `accept`, `multiple`.
```jsx
const [files, setFiles] = useState([]);            // new File[]
const [docs] = useState(initialData?.docUrls || []); // existing URLs
const [removed, setRemoved] = useState([]);
<MultiImageDropZone isEditMode={isEdit} selectedFiles={files} onFilesSelect={setFiles}
  existingImages={docs} removedImages={removed}
  onRemoveExistingImage={u => setRemoved(r => [...r, u])}
  onRestoreImage={u => setRemoved(r => r.filter(x => x !== u))} maxFiles={8} />
```
This is the **Supporting Documents** field on the Promotion form — do NOT fall back to a URL-text list.
`SupportingDocsUploader` (vertical list with FileIcon rows) still exists for compact single-column doc
lists, but the gallery dropzone above is the standard for promotion/transfer supporting documents.

## RejectionReasonModal (global, `src/overlays/RejectionReasonModal.jsx`)
Reason-capture modal for a People & Culture request decision. Two tones:
- `tone="danger"` (default) — **Reject**: destructive red, TERMINAL ("rejection is final; request closed").
- `tone="warning"` — **Return for Correction**: amber, sends the request back to the initiator who
  reviews the reason, corrects the request and resubmits it for approval.
Use on every detail page where a rejection/return needs a reason (Promotion / Transfer / …) instead
of a bare ConfirmModal. Bulk reject also uses it (one reason applied to the whole selection).
Props: `open`, `onClose`, `onConfirm(reason)`, `loading`, `error`, `title`, `noun`, `tone`,
`description`, `fieldLabel`, `placeholder`, `confirmLabel`, `confirmIcon` (all copy overridable).

## StatusFilter (global, `src/forms/StatusFilter.jsx`)
Filter button + popover with multi-select checkboxes (`filter-3-line` trigger + count badge → "Filter by
status" panel of checkbox + label rows + Clear). Empty selection = show all. Generic "filter by &lt;enum&gt;".
Props: `value` (`string[]`), `onChange(next)`, `options` (strings or `{value,label}`). Pass to `FilterBar`
as `filters={[{ label: "Status", node: <StatusFilter …/> }]}`.

## UI.RowActions (table row actions)
RULE: **>2 actions → `⋯` dropdown menu; ≤2 → inline icon+text buttons** — and **inline labels are
ONE WORD** (pass `short`, else the label's first word is used; the full `label` is the button title
and the dropdown text). Props: `actions` = `[{ label, short, icon, onClick, danger }]` (`danger` red),
plus `forceMenu` (bool) to force the dropdown regardless of count. **Consistency rule:** present a
table's row actions UNIFORMLY — if ANY row needs the dropdown (3+ actions), compute that once over the
rows and pass `forceMenu` to EVERY `RowActions` in the table so 2-action rows don't render inline next
to 3-action dropdowns. Job Posts = View Details / Edit / Archive → dropdown. Promotions / Transfers /
Job Title approval rows = View Details / Edit / Archive → dropdown (Edit reopens the create/assign form).
Use for every table row's actions cell.

## UI.FilterBar / UI.FilterField / UI.SearchInput (table toolbar)
Mirrors the `JobPostingsTable` toolbar. A header row with a left slot (tabs/intro) + search input +
the filter affordance. **RULE (pass `filters` as an array of `{ label, node }`):** 0 → search only;
**1 filter → inline dropdown box** in the toolbar (no toggle, applies live); **2+ filters →
“Show/Hide Filter” toggle** + `#FAFAFA` panel grid + **Reset/Apply** footer.
- `UI.FilterBar` props: `left`, `search`, `onSearch`, `searchPlaceholder`, `filters` (array of
  `{ label, node }`; a legacy JSX fragment is treated as a 2+ panel), `onReset`, `onApply`,
  `activeCount` (number of APPLIED filters — renders the primary count badge on the Show/Hide
  Filter button, and the open button gets `border-primary/60 bg-primary-50`).
- `UI.FilterField` props: `label`, `children`. `UI.SearchInput`: `value`, `onChange`, `placeholder`.
```jsx
<UI.FilterBar left={<UI.Tabs …/>} search={q} onSearch={setQ}
  filters={[{ label: "Department", node: <Combobox …/> }]}  // 1 → inline dropdown
  onReset={…} onApply={…} />
```

---

## PageHeader (global, `src/primitives/PageHeader.jsx`)
White card holding the page `title` + `subtitle` + right-side `actions`. Use at the top of every
list / detail / create / edit page. The **breadcrumb** (not a back button) provides back navigation.
Optional `children` render full-width BELOW the title/subtitle inside the same card — used for status
badge rows (e.g. the Notification event editor header: "Dispatch wired" / per-request badges).

**Container rule (always separate).** The `PageHeader` card and the table are ALWAYS distinct white
`.card` containers — never merged into one — regardless of whether stats, info panels, or anything
else sits between them. Top to bottom: `PageHeader` card → any intervening content each in its OWN
white `.card` → the table in its own white `.card` (`padding:0; overflow:hidden`) with the `FilterBar`
flush at the top (its own `border-b` divides it from the table), then table, then pagination — all
DIRECTLY inside the card (NO inner `rounded-md border` box; Job Posts is the reference). Wrapper is a
`flex flex-col gap-20`. Every section is card-wrapped; the old "merge header + table" and "inner
bordered box around the table" patterns are both retired.

## Breadcrumb navigation pattern
Screens with sub-views accept `onSubPage` and report a trail in a `useEffect([view])`:
```jsx
React.useEffect(() => {
  if (!onSubPage) return;
  const toList = () => setView({ name: "list" });
  if (view.name === "detail") onSubPage({ trail: [{ label: "Job Posts", onClick: toList }, { label: title }] });
  else onSubPage(null);
  return () => onSubPage(null);
}, [view]);
```
The shell renders `<Breadcrumb trail={…}>` in place of the horizontal tab bar. **No "Back to …" buttons.**

---

## Recruitment module map (matches the production app)
- Nav tabs: **Hiring Requests · Job Posts · Assessments**.
- **Hiring Requests** (`careers/HiringRequests.jsx`): list + create form + detail modal with Approve
  (evaluationReason + jobGrade) / Decline (rejectionReason). Status = `ApprovalStatus`.
- **Job Posts** (`careers/PostingDetails.jsx`): list (5 StatCards) → create (full page) → posting detail
  (view toggle Job Applications / Shortlist / Assessment, **Create/Edit Assessment = full-page
  `AssessmentForm`** with `Construct N` cards + Total Weight /100 + Add Another Construct) → application
  detail (`careers/ApplicationDetail.jsx`, full page, action bar + cards + timeline). Multi-select on
  Applications/Shortlist uses the bottom-right `BulkBar`. All sub-views drive the breadcrumb via `onSubPage`.
- **Assessments** (`careers/Assessments.jsx`): assessor's interview queue, weighted-construct scoring.
- Application pipeline actions follow `ApplicationActionButtons` exactly (Send/Approve/Reject Shortlist →
  Schedule for Assessment → Approve for Hiring → Send Offer → Hired).

## PncAuditTrail (shared/PncAuditTrail.jsx)
Reusable audit trail for P&C request cycles (Exit, Promotions, Transfers, Job Title).
Entries mirror the backend shape: `{ id, action (enum int), description, actorName, occurredAt (ISO), justificationReason, staffId }`.
Action enum: 0 Submitted · 1 Updated · 2 Interview Completed · 3 Approved · 4 Rejected · 5 Closed · 6 Resubmitted · 7 Employee Accepted (drives the timeline dot color).
- `PncAuditTrail({ entries })` — timeline: dot (action tone), **actorName · staffId**, right-aligned date, description, and a wrapping "Comment" panel for `justificationReason` (HTML is stripped).
- `AuditTrailDrawer({ open, onClose, name, sub, badge, entries })` — right-side Drawer with an employee header card (Avatar + name + sub + status badge) above the trail. Opened from an "Audit Trail" stroke button in the detail PageHeader — never render the trail as an in-page card.
- `pncEntry({ action, description, justificationReason?, staffId?, actorName? })` — builds a backend-shaped entry (auto id + ISO occurredAt).
Interactive cycle convention (implemented uniformly in Promotions, Transfers and Job Title): requests are never archived — an approver either **Rejects** (RejectionReasonModal, action 4, TERMINAL: red reason card "a rejection is final; this request is closed", no further actions) or **Returns for Correction** (same modal `tone="warning"`, action 4, status `Returned` — `returned` badge variant): the initiator sees a "View return reason" hint on the row + an amber "Reason For Return" card and banner, clicks **Review & Update**, corrects and resubmits — status flips back to Pending with `hasBeenCorrected: true` (amber "Corrected" chip beside the badge, "Corrected & Resubmitted" chip on the detail header), return fields clear and action 6 is logged. The approval list carries status sub-tabs **All · Pending · Returned · Drafts** (count pills on Returned/Drafts) under the FilterBar. **Save as Draft** (form footer, ≥1 employee) parks a request in the Drafts tab (`draft` badge; row actions Continue / Delete Draft; row click continues editing); submitting a draft flips it to Pending. An Approved request offers "Record Employee Acceptance" logging action 7.

## PncPermissions (shared/PncPermissions.jsx)
Request-level permission checks for the P&C cycles, mirroring production: the INITIATOR (`createdBy`) can edit/correct/resubmit/draft but never approve/reject/return; the APPROVER can approve/reject/return but never edit; the SUBJECT (employee the request is about) can do none of those. Demo actors: Peter Bosrotsi (P&CBP, initiator), Angela Osei (Head P&C, approver), Bright Manu (Employee, subject).
- `usePncActor()` — reactive current actor (`window.HRStores.pncActor`).
- `pncPermsFor(actor, record)` → `{ canEdit, canDecide, isSubject, isInitiator }` — drive row actions, detail header buttons, bulk-select checkboxes and the BulkBar from these.
- `<PncActorSwitch/>` — "Acting as" combobox rendered in every P&C PageHeader actions row (demo chrome; replace with the signed-in user in production).
- `<PncViewOnlyChip perms={P}/>` — gray "View only" chip when the actor can neither edit nor decide.
Gating conventions: create/import buttons + the Request roster segment show only for `actor.canCreate`; drafts are private (filtered to the initiator, Drafts tab hidden otherwise); pending-row checkboxes and the bulk Approve/Reject bar require `canDecide`.
