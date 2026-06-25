// BISTA HR · primitives/ui — REUSABLE component layer that mirrors the production
// codebase's components/ui/* EXACTLY (same Tailwind classNames + design tokens), so the
// same components can be reused across screens and other projects. Exposed on window.UI.
// Tokens (primary gold scale, secondary red scale) come from the Tailwind config in index.html,
// lifted verbatim from app/custom.css. No inline styling — className-driven, like the real app.
const cn = (...a) => a.filter(Boolean).join(" ");

// ── Button (mirrors components/ui/button.tsx cva) ──
const UI_BTN_VARIANTS = {
  default: "bg-primary text-black hover:bg-primary/90 disabled:bg-[#F6F8FA] disabled:text-[#CDD0D5]",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  outline: "border border-primary bg-background text-black hover:bg-primary/5 disabled:opacity-50",
  secondary: "bg-white text-primary border border-primary hover:bg-gray-50",
  ghost: "hover:bg-primary/5 hover:text-primary text-primary",
  link: "text-primary underline-offset-4 hover:underline"
};
const UI_BTN_SIZES = { default: "h-10 px-4 py-2", sm: "h-9 rounded-md px-3", xs: "h-8 px-2 py-1", lg: "h-11 rounded-md px-8", icon: "h-10 w-10" };
function UIButton({ variant = "default", size = "default", className, icon, iconRight, children, ...props }) {
  return (
    <button className={cn("cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:cursor-not-allowed [&_i]:text-base", UI_BTN_VARIANTS[variant], UI_BTN_SIZES[size], className)} {...props}>
      {icon && <i className={"ri-" + icon} />}{children}{iconRight && <i className={"ri-" + iconRight} />}
    </button>);

}

// ── Tabs (mirrors components/ui/tabs.tsx — Radix replaced with context) ──
const UITabsCtx = React.createContext({ value: null, onValueChange: () => {} });
function UITabs({ value, onValueChange, className, children }) {
  return <UITabsCtx.Provider value={{ value, onValueChange }}><div className={className}>{children}</div></UITabsCtx.Provider>;
}
function UITabsList({ className, children }) {
  return <div className={cn("inline-flex items-center gap-2 rounded-lg px-2 py-1 bg-[#F6F8FA] w-fit overflow-x-auto", className)}>{children}</div>;
}
function UITabsTrigger({ value, className, children }) {
  const { value: v, onValueChange } = React.useContext(UITabsCtx);
  const active = v === value;
  return (
    <button type="button" data-state={active ? "active" : "inactive"} onClick={() => onValueChange(value)}
    className={cn("inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all cursor-pointer text-gray-500",
    "hover:bg-gray-50 hover:text-gray-700 hover:shadow-sm hover:scale-[1.03]",
    "data-[state=active]:shadow-sm data-[state=active]:font-semibold data-[state=active]:text-gray-900 data-[state=active]:bg-primary-100/80 data-[state=active]:scale-[1.03]", className)}>
      {children}
    </button>);

}

// ── Card (mirrors components/ui/card.tsx) ──
function UICard({ className, children, ...props }) {
  return <div className={cn("bg-card text-card-foreground flex flex-col gap-3 rounded-xl p-6", className)} {...props}>{children}</div>;
}

// ── RadioPillGroup (mirrors components/ui/radio-pill-group.tsx) ──
function UIRadioPillGroup({ options, value, onValueChange, className }) {
  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {options.map((o) => {
        const checked = value === o.value;
        return (
          <button type="button" key={o.value} data-state={checked ? "checked" : "unchecked"} onClick={() => onValueChange(o.value)}
          className="group inline-flex items-center gap-2 rounded-md min-w-16 border px-2 py-1.5 text-sm font-medium transition-colors cursor-pointer border-muted-foreground/30 text-foreground hover:border-primary/50 data-[state=checked]:border-primary data-[state=checked]:bg-primary-50 data-[state=checked]:text-primary-700">
            <span className="flex size-4 items-center justify-center rounded-full border-2 border-gray-300 group-data-[state=checked]:bg-primary group-data-[state=checked]:border-primary">
              {checked && <i className="ri-check-line text-white" style={{ fontSize: 10, lineHeight: 1 }} />}
            </span>
            <span>{o.label}</span>
          </button>);

      })}
    </div>);

}

// ── Label / Field / Input / Textarea (mirror components/ui/input.tsx etc.) ──
function UILabel({ required, optional, className, children }) {
  return <label className={cn("text-sm font-medium leading-none text-gray-700", className)}>{children}{required && <span className="text-red-500 ml-1">*</span>}{optional && <span className="text-muted-foreground font-normal ml-1">(Optional)</span>}</label>;
}
function UIField({ label, required, optional, className, children }) {
  return <div className={cn("space-y-2", className)}>{label && <UILabel required={required} optional={optional}>{label}</UILabel>}{children}</div>;
}
function UIInput({ className, error, ...props }) {
  return <input data-slot="input" className={cn("h-9 w-full min-w-0 rounded-md border bg-white px-3 py-1 text-sm outline-none placeholder:text-muted-foreground placeholder:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed", error ? "border-destructive focus-within:border-destructive" : "border-input focus-within:border-ring", className)} {...props} />;
}
function UITextarea({ className, ...props }) {
  return <textarea className={cn("min-h-20 w-full rounded-md border border-input bg-white px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-within:border-ring", className)} {...props} />;
}

// ── Switch (mirrors components/ui/switch.tsx) ──
function UISwitch({ checked, onCheckedChange, id, className }) {
  return (
    <button type="button" role="switch" aria-checked={!!checked} id={id} onClick={() => onCheckedChange(!checked)}
    className={cn("relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors", checked ? "bg-primary" : "bg-gray-300", className)}>
      <span className={cn("inline-block h-4 w-4 transform rounded-full bg-white transition-transform", checked ? "translate-x-4" : "translate-x-0.5")} />
    </button>);

}

// ── StatCard (mirrors JobPostingsPageClient StatsCard: even:primary-50 / odd:secondary-50) ──
function UIStatCard({ title, value, index = 0 }) {
  // CSS odd children (1st,3rd,5th) → secondary-50; even (2nd,4th) → primary-50
  return (
    <div className={cn("rounded-xl px-5 py-4", index % 2 === 0 ? "bg-secondary-50" : "bg-primary-50")} style={{ height: "114px" }}>
      <p className="text-sm font-light text-gray-700">{title}</p>
      <p className="text-3xl font-semibold mt-1 text-gray-900">{value}</p>
    </div>);

}

// ── QuestionItem (mirrors SortableQuestionItem.tsx — pre-screening question) ──
function UIQuestionItem({ question, index, onChange, onRemove }) {
  const isText = question.type === 0,isYesNo = question.type === 1;
  return (
    <div className="border border-input overflow-clip rounded-lg bg-white">
      <div className="flex p-2 bg-gray-50 items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground cursor-grab"><i className="ri-draggable text-lg" /></span>
          <span className="text-sm font-medium text-gray-900">Question {index + 1}</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2"><UISwitch checked={isText} onCheckedChange={(c) => c && onChange("type", 0)} /><span className="text-sm text-gray-700">Short/Long Text</span></div>
          <div className="flex items-center gap-2"><UISwitch checked={isYesNo} onCheckedChange={(c) => c && onChange("type", 1)} /><span className="text-sm text-muted-foreground">Yes/No</span></div>
          <button type="button" className="text-red-500 hover:text-red-700 border-l border-gray-300 pl-3" onClick={onRemove}><i className="ri-delete-bin-line text-lg" /></button>
        </div>
      </div>
      <div className="px-4 py-4"><UITextarea value={question.text} onChange={(e) => onChange("text", e.target.value)} placeholder="Enter your question" /></div>
    </div>);

}

// ── SearchInput + FilterBar (mirrors JobPostingsTable toolbar: Tabs + Search + Show/Hide Filter) ──
function UISearchInput({ value, onChange, placeholder = "Search..." }) {
  return (
    <div className="input-wrap" style={{ padding: "8px 12px" }}>
      <i className="ri-search-2-line" style={{ fontSize: 18, color: "var(--icon-default)" }} />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>);

}
function UIFilterField({ label, children }) {
  return <div className="space-y-2"><p className="text-sm font-medium text-gray-700">{label}</p>{children}</div>;
}
// left = tabs/intro slot; filters = grid of <UI.FilterField>; onReset/onApply wire the footer.
function UIFilterBar({ left, search, onSearch, searchPlaceholder = "Search...", filters, onReset, onApply }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div>
      <div className="flex justify-between items-center border-b px-6 py-4 gap-3 flex-wrap">
        <div className="min-w-0">{left}</div>
        <div className="flex items-center gap-3">
          {onSearch && <div className="w-72 max-w-full"><UISearchInput value={search} onChange={onSearch} placeholder={searchPlaceholder} /></div>}
          {filters && <UIButton variant="outline" size="sm" onClick={() => setOpen((o) => !o)}><i className="ri-filter-3-line" />{open ? "Hide Filter" : "Show Filter"}</UIButton>}
        </div>
      </div>
      {open && filters &&
      <div className="mx-4 mt-3 mb-4 rounded-md border border-[#F0F1F3] bg-[#FAFAFA] px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{filters}</div>
          <div className="mt-4 flex justify-end gap-2">
            <UIButton variant="outline" onClick={() => onReset && onReset()}>Reset filter</UIButton>
            <UIButton onClick={() => {onApply && onApply();setOpen(false);}}>Apply Filters</UIButton>
          </div>
        </div>
      }
    </div>);

}

// ── RowActions — table row actions. RULE: >2 actions → ⋯ dropdown; ≤2 → inline icon+text ──
// actions: [{ label, icon, onClick, danger }]
function UIRowActions({ actions = [] }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const h = (e) => {if (ref.current && !ref.current.contains(e.target)) setOpen(false);};
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  if (actions.length <= 2) {
    return (
      <div className="flex items-center gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
        {actions.map((a) =>
        <button key={a.label} type="button" onClick={() => a.onClick()}
        className={cn("inline-flex items-center gap-1.5 rounded-md border bg-white px-3 py-1.5 text-sm font-medium hover:bg-gray-50", a.danger ? "border-red-200 text-red-600" : "border-gray-200 text-gray-700")}>
            {a.icon && <i className={"ri-" + a.icon} />}{a.label}
          </button>
        )}
      </div>);

  }
  return (
    <div ref={ref} className="relative flex justify-end" onClick={(e) => e.stopPropagation()}>
      <button type="button" onClick={() => setOpen((o) => !o)} className="h-8 w-8 inline-flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"><i className="ri-more-fill text-lg" /></button>
      {open &&
      <div className="absolute right-0 top-9 z-30 min-w-[176px] rounded-lg border border-gray-200 bg-white shadow-lg py-1">
          {actions.map((a) =>
        <button key={a.label} type="button" onClick={() => {setOpen(false);a.onClick();}}
        className={cn("flex w-full items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-50", a.danger ? "text-red-600" : "text-gray-700")}>
              {a.icon && <i className={"ri-" + a.icon} />}{a.label}
            </button>
        )}
        </div>
      }
    </div>);

}

window.UI = {
  cn, Button: UIButton, Tabs: UITabs, TabsList: UITabsList, TabsTrigger: UITabsTrigger,
  Card: UICard, RadioPillGroup: UIRadioPillGroup, Label: UILabel, Field: UIField, Input: UIInput, Textarea: UITextarea,
  Switch: UISwitch, StatCard: UIStatCard, QuestionItem: UIQuestionItem,
  SearchInput: UISearchInput, FilterField: UIFilterField, FilterBar: UIFilterBar, RowActions: UIRowActions
};