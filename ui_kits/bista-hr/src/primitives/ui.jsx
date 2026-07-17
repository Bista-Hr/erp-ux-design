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
  link: "text-primary underline-offset-4 hover:underline",
};
const UI_BTN_SIZES = { default: "h-10 px-4 py-2", sm: "h-9 rounded-md px-3", xs: "h-8 px-2 py-1", lg: "h-11 rounded-md px-8", icon: "h-10 w-10" };
function UIButton({ variant = "default", size = "default", className, icon, iconRight, children, ...props }) {
  return (
    <button className={cn("cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:cursor-not-allowed [&_i]:text-base", UI_BTN_VARIANTS[variant], UI_BTN_SIZES[size], className)} {...props}>
      {icon && <i className={"ri-" + icon} />}{children}{iconRight && <i className={"ri-" + iconRight} />}
    </button>
  );
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
    </button>
  );
}

// ── Card (mirrors components/ui/card.tsx) ──
function UICard({ className, children, ...props }) {
  return <div className={cn("bg-card text-card-foreground flex flex-col gap-3 rounded-xl p-6", className)} {...props}>{children}</div>;
}

// ── RadioGroup / CheckboxGroup (vertical option lists — for FORM & QUIZ options) ──
// Use these for any "pick one / pick many from a visible list" — NOT a Combobox dropdown.
// RadioGroup: single value. CheckboxGroup: array value. Each option is a plain string OR {value,label}.
function UIOptionList({ options = [], value, onChange, multi }) {
  const opts = options.map(o => (typeof o === "string" ? { value: o, label: o } : o));
  const isOn = (v) => multi ? (Array.isArray(value) && value.includes(v)) : value === v;
  const toggle = (v) => { if (!multi) return onChange(v); const arr = Array.isArray(value) ? value : []; onChange(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]); };
  return (
    <div className="flex flex-col gap-2">
      {opts.map((o) => {
        const on = isOn(o.value);
        return (
          <button type="button" key={o.value} onClick={() => toggle(o.value)}
            className={cn("flex items-center gap-3 rounded-lg border px-3.5 py-2.5 text-left text-sm transition-colors cursor-pointer",
              on ? "border-primary bg-primary-50 text-gray-900" : "border-input bg-white text-gray-700 hover:border-primary/50")}>
            <span className={cn("flex size-5 flex-none items-center justify-center border-2", multi ? "rounded-[5px]" : "rounded-full", on ? "border-primary bg-primary" : "border-gray-300 bg-white")}>
              {on && <i className={multi ? "ri-check-line" : "ri-check-line"} style={{ color: "#000", fontSize: 12, lineHeight: 1 }} />}
            </span>
            <span>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
function UIRadioGroup({ options, value, onChange }) { return <UIOptionList options={options} value={value} onChange={onChange} multi={false} />; }
function UICheckboxGroup({ options, value, onChange }) { return <UIOptionList options={options} value={value || []} onChange={onChange} multi={true} />; }

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
          </button>
        );
      })}
    </div>
  );
}

// ── Label / Field / Input / Textarea (mirror components/ui/input.tsx etc.) ──
function UILabel({ required, optional, className, children }) {
  return <label className={cn("text-sm font-medium leading-none text-gray-700", className)}>{children}{required && <span className="text-red-500 ml-1">*</span>}{optional && <span className="text-muted-foreground font-normal ml-1">(Optional)</span>}</label>;
}
function UIField({ label, required, optional, className, children }) {
  return <div className={cn("space-y-2", className)}>{label && <UILabel required={required} optional={optional}>{label}</UILabel>}{children}</div>;
}
function UIInput({ className, error, ...props }) {
  return <input data-slot="input" style={{ fontFamily: "inherit" }} className={cn("h-9 w-full min-w-0 rounded-md border bg-white px-3 py-1 text-sm outline-none placeholder:text-muted-foreground placeholder:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed", error ? "border-destructive focus-within:border-destructive" : "border-input focus-within:border-ring", className)} {...props} />;
}
function UITextarea({ className, ...props }) {
  return <textarea style={{ fontFamily: "inherit" }} className={cn("min-h-20 w-full min-w-0 rounded-md border border-input bg-white px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-within:border-ring", className)} {...props} />;
}

// ── RichText (mirrors components/ui/rich-text-input.tsx — Quill “snow” look, value = HTML) ──
// APP_PAGES: registry of in-app destinations for the link popover — { label, path, section }.
// Kept flat so consuming apps can swap it for their real route map (window.UI_APP_PAGES).
const UI_APP_PAGES = [
  { label: "Dashboard", path: "/dashboard", section: "General" },
  { label: "Notifications", path: "/dashboard/notifications", section: "General" },
  { label: "Announcements", path: "/dashboard/announcements", section: "General" },
  { label: "Employees", path: "/hr-management/employees", section: "HR Management" },
  { label: "Employee Exit", path: "/hr-management/exit", section: "HR Management" },
  { label: "Transfers", path: "/hr-management/transfers", section: "HR Management" },
  { label: "Promotions", path: "/people-and-culture/promotions", section: "People & Culture" },
  { label: "Job Title", path: "/people-and-culture/job-title", section: "People & Culture" },
  { label: "Hiring Requests", path: "/recruitment/hiring-requests", section: "Recruitment" },
  { label: "Job Posts", path: "/recruitment/job-posts", section: "Recruitment" },
  { label: "Assessments", path: "/recruitment/assessments", section: "Recruitment" },
  { label: "Leave", path: "/my-requests/leave", section: "My Requests" },
  { label: "My Learning", path: "/learning/my-learning", section: "Learning & Development" },
  { label: "Program Catalog", path: "/learning/program-catalog", section: "Learning & Development" },
  { label: "Appraisals", path: "/performance/appraisals", section: "Performance" },
  { label: "Notification Configurations", path: "/system-administration/notification-configurations", section: "System Administration" },
];
window.UI_APP_PAGES = window.UI_APP_PAGES || UI_APP_PAGES;

// Link popover — two tabs: pick an in-app page (searchable, grouped by section) or paste a URL.
function UILinkPopover({ onPick, onClose }) {
  const [tab, setTab] = React.useState("page"); // page | url
  const [q, setQ] = React.useState("");
  const [url, setUrl] = React.useState("");
  const pages = window.UI_APP_PAGES || [];
  const shown = pages.filter(p => (p.label + " " + p.section + " " + p.path).toLowerCase().includes(q.toLowerCase()));
  const groups = [...new Set(shown.map(p => p.section))];
  return (
    <div className="absolute left-2 top-9 z-50 w-72 rounded-md border border-input bg-white shadow-lg" onMouseDown={e => e.stopPropagation()}>
      <div className="flex items-center gap-0.5 border-b border-input p-1.5">
        <button type="button" onClick={() => setTab("page")} className={cn("rounded px-2 py-1 text-xs font-medium", tab === "page" ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-900")}><i className="ri-apps-line mr-1" />In-App Page</button>
        <button type="button" onClick={() => setTab("url")} className={cn("rounded px-2 py-1 text-xs font-medium", tab === "url" ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-900")}><i className="ri-global-line mr-1" />External URL</button>
        <button type="button" onClick={onClose} className="ml-auto rounded p-1 text-gray-400 hover:text-gray-900"><i className="ri-close-line" /></button>
      </div>
      {tab === "page" ? (
        <div>
          <div className="border-b border-input p-1.5">
            <input autoFocus placeholder="Search pages…" value={q} onChange={e => setQ(e.target.value)}
              className="w-full rounded border-0 px-2 py-1 text-sm outline-none" />
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {shown.length === 0 && <p className="px-3 py-4 text-center text-xs text-gray-400">No page found.</p>}
            {groups.map(g => (
              <div key={g}>
                <div className="px-3 pb-0.5 pt-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-gray-400">{g}</div>
                {shown.filter(p => p.section === g).map(p => (
                  <button key={p.path} type="button" onClick={() => onPick(p.path, p.label)}
                    className="flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left text-sm text-gray-800 hover:bg-gray-50">
                    <span className="truncate">{p.label}</span>
                    <span className="truncate font-mono text-[10.5px] text-gray-400">{p.path}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex gap-1.5 p-2">
          <input autoFocus placeholder="https://…" value={url} onChange={e => setUrl(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && url.trim()) onPick(url.trim()); }}
            className="flex-1 rounded-md border border-input px-2 py-1 text-sm outline-none focus:border-ring" />
          <UIButton size="xs" disabled={!url.trim()} onClick={() => onPick(url.trim())}>Add</UIButton>
        </div>
      )}
    </div>
  );
}

// ── Tooltip (mirrors the shadcn tooltip — dark bubble on hover/focus) ──
function UITooltip({ label, children, side = "top" }) {
  const [show, setShow] = React.useState(false);
  return (
    <span className="relative inline-flex" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} onFocus={() => setShow(true)} onBlur={() => setShow(false)}>
      {children}
      {show && (
        <span className="pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[11px] font-medium text-white shadow-md"
          style={{ left: "50%", transform: "translateX(-50%)", ...(side === "top" ? { bottom: "calc(100% + 6px)" } : { top: "calc(100% + 6px)" }) }}>
          {label}
          <span style={{ position: "absolute", left: "50%", marginLeft: -4, transform: "rotate(45deg)", width: 8, height: 8, background: "#111827", ...(side === "top" ? { bottom: -3 } : { top: -3 }) }} />
        </span>
      )}
    </span>
  );
}

function UIRichText({ value = "", onChange, placeholder = "Type here...", className, error }) {
  const ref = React.useRef(null);
  const last = React.useRef(value);
  const [linkOpen, setLinkOpen] = React.useState(false);
  const savedSel = React.useRef(null);
  React.useEffect(() => { if (ref.current && value !== last.current) { ref.current.innerHTML = value || ""; last.current = value; } }, [value]);
  React.useEffect(() => { if (ref.current && !ref.current.innerHTML && value) { ref.current.innerHTML = value; } }, []);
  const exec = (cmd, arg) => { document.execCommand(cmd, false, arg); ref.current && ref.current.focus(); fire(); };
  const fire = () => { if (ref.current) { last.current = ref.current.innerHTML; onChange && onChange(ref.current.innerHTML); } };
  const Btn = ({ cmd, arg, icon, title }) => (
    <UITooltip label={title}>
      <button type="button" aria-label={title} onMouseDown={e => { e.preventDefault(); exec(cmd, arg); }}
        className="h-7 w-7 inline-flex items-center justify-center rounded text-gray-600 hover:bg-gray-100"><i className={"ri-" + icon} /></button>
    </UITooltip>
  );
  const openLink = () => {
    const sel = window.getSelection();
    savedSel.current = sel && sel.rangeCount > 0 ? sel.getRangeAt(0).cloneRange() : null;
    setLinkOpen(o => !o);
  };
  const applyLink = (href, label) => {
    setLinkOpen(false);
    const sel = window.getSelection();
    if (savedSel.current) { sel.removeAllRanges(); sel.addRange(savedSel.current); }
    if (sel && sel.isCollapsed && label) {
      document.execCommand("insertHTML", false, `<a href="${href}">${label}</a>`);
    } else {
      document.execCommand("createLink", false, href);
    }
    ref.current && ref.current.focus(); fire();
  };
  return (
    <div className={cn("relative rounded-md border bg-white flex flex-col", linkOpen ? "" : "overflow-hidden", error ? "border-destructive" : "border-input focus-within:border-ring", className)}>
      <div className="flex items-center gap-1 border-b border-input px-2 py-1.5 flex-wrap">
        <Btn cmd="bold" icon="bold" title="Bold" /><Btn cmd="italic" icon="italic" title="Italic" /><Btn cmd="underline" icon="underline" title="Underline" /><Btn cmd="strikeThrough" icon="strikethrough" title="Strikethrough" />
        <span className="w-px h-5 bg-gray-200 mx-1" />
        <Btn cmd="insertUnorderedList" icon="list-unordered" title="Bulleted list" /><Btn cmd="insertOrderedList" icon="list-ordered-2" title="Numbered list" />
        <span className="w-px h-5 bg-gray-200 mx-1" />
        <UITooltip label="Insert link"><button type="button" aria-label="Insert link" onMouseDown={e => { e.preventDefault(); openLink(); }} className={cn("h-7 w-7 inline-flex items-center justify-center rounded hover:bg-gray-100", linkOpen ? "bg-gray-100 text-gray-900" : "text-gray-600")}><i className="ri-link" /></button></UITooltip>
        <UITooltip label="Clear formatting"><button type="button" aria-label="Clear formatting" onMouseDown={e => { e.preventDefault(); exec("removeFormat"); }} className="h-7 w-7 inline-flex items-center justify-center rounded text-gray-600 hover:bg-gray-100"><i className="ri-format-clear" /></button></UITooltip>
      </div>
      {linkOpen && <UILinkPopover onPick={applyLink} onClose={() => setLinkOpen(false)} />}
      <div ref={ref} contentEditable suppressContentEditableWarning data-ph={placeholder} onInput={fire} onBlur={fire}
        className="bh-rte min-h-[120px] px-3 py-2 text-sm text-gray-900 outline-none" style={{ fontFamily: "inherit" }} />
    </div>
  );
}

// ── HtmlBodyEditor (email-body editor: Editor · HTML · Preview toggle) ──
// Wraps UIRichText so non-technical users edit visually, while the HTML view exposes the raw
// markup and Preview renders the final output. value IS the HTML string (same contract as
// RichText). insertRef (optional): receives a fn(snippet) so callers (merge-field buttons)
// can insert at the caret of whichever view is active.
function UIHtmlBodyEditor({ value = "", onChange, placeholder = "Type here...", rows = 10, insertRef }) {
  const [mode, setMode] = React.useState("editor"); // editor | html | preview
  const taRef = React.useRef(null);
  React.useEffect(() => {
    if (!insertRef) return;
    insertRef.current = (snippet) => {
      if (mode === "html" && taRef.current) {
        const t = taRef.current, start = t.selectionStart ?? t.value.length, end = t.selectionEnd ?? start;
        const next = t.value.slice(0, start) + snippet + t.value.slice(end);
        onChange && onChange(next);
        requestAnimationFrame(() => { t.focus(); const c = start + snippet.length; t.setSelectionRange(c, c); });
      } else {
        onChange && onChange((value || "") + snippet);
      }
    };
  }, [mode, value, onChange]);
  const TabBtn = ({ id, icon, label }) => (
    <button type="button" onClick={() => setMode(id)}
      className={cn("inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
        mode === id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900")}>
      <i className={"ri-" + icon} />{label}
    </button>
  );
  return (
    <div className="flex flex-col gap-2">
      <div className="inline-flex items-center gap-0.5 self-start rounded-lg p-0.5" style={{ background: "#F6F8FA", border: "1px solid var(--gray-150)" }}>
        <TabBtn id="editor" icon="edit-line" label="Editor" />
        <TabBtn id="html" icon="code-s-slash-line" label="HTML" />
        <TabBtn id="preview" icon="eye-line" label="Preview" />
      </div>
      {mode === "editor" && <UIRichText value={value} onChange={onChange} placeholder={placeholder} />}
      {mode === "html" && (
        <div className="rounded-md border border-input bg-white overflow-hidden focus-within:border-ring">
          <textarea ref={taRef} rows={rows} value={value} onChange={e => onChange && onChange(e.target.value)} spellCheck={false}
            className="w-full px-3 py-2 text-sm text-gray-900 outline-none resize-y" style={{ fontFamily: "ui-monospace, monospace", fontSize: 12.5, lineHeight: 1.6, border: 0, display: "block" }} />
        </div>
      )}
      {mode === "preview" && (
        <div className="rounded-md border border-input" style={{ background: "var(--gray-50)", padding: 16 }}>
          <div className="rounded-md bg-white text-sm text-gray-900" style={{ border: "1px solid var(--gray-150)", padding: "20px 22px", maxWidth: 640, lineHeight: 1.6, minHeight: 80 }}
            dangerouslySetInnerHTML={{ __html: value || "<span style='color:var(--gray-400)'>Nothing to preview yet.</span>" }} />
        </div>
      )}
    </div>
  );
}

// ── DatePicker (mirrors components/ui/date-picker.tsx — outline trigger + popover calendar) ──
const _MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
function UIDatePicker({ value, onSelect, placeholder = "Pick a date", error, className, withTime, weekendRule }) {
  const [open, setOpen] = React.useState(false);
  // weekendRule: weekends are OFF by default; a small inline toggle re-enables them.
  const [allowWknd, setAllowWknd] = React.useState(false);
  const ref = React.useRef(null);
  const sel = value ? new Date(value) : null;
  const valid = sel && !isNaN(sel.getTime());
  const [cursor, setCursor] = React.useState(() => valid ? new Date(sel.getFullYear(), sel.getMonth(), 1) : new Date());
  const [time, setTime] = React.useState(() => valid && withTime ? `${String(sel.getHours()).padStart(2,"0")}:${String(sel.getMinutes()).padStart(2,"0")}` : "09:00");
  React.useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, [open]);
  const y = cursor.getFullYear(), m = cursor.getMonth();
  const first = new Date(y, m, 1).getDay(), days = new Date(y, m + 1, 0).getDate();
  const cells = []; for (let i = 0; i < first; i++) cells.push(null); for (let d = 1; d <= days; d++) cells.push(d);
  const pick = (d) => {
    const dt = new Date(y, m, d);
    if (withTime) { const [hh, mm] = time.split(":"); dt.setHours(Number(hh) || 0, Number(mm) || 0); }
    onSelect && onSelect(dt); if (!withTime) setOpen(false);
  };
  const label = valid ? sel.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) + (withTime ? " · " + time : "") : placeholder;
  return (
    <div ref={ref} className={cn("relative", className)}>
      <button type="button" onClick={() => setOpen(o => !o)}
        className={cn("h-9 w-full inline-flex items-center gap-2 rounded-md border bg-white px-3 text-sm text-left font-normal", valid ? "text-gray-900" : "text-muted-foreground", error ? "border-destructive" : "border-input")}>
        <i className="ri-calendar-line text-gray-500" />{label}
      </button>
      {open && (
        <div className="absolute z-40 mt-1 rounded-md border border-input bg-white p-3 shadow-md" style={{ width: 260 }}>
          <div className="flex items-center justify-between mb-2">
            <button type="button" onClick={() => setCursor(new Date(y, m - 1, 1))} className="h-7 w-7 inline-flex items-center justify-center rounded hover:bg-gray-100"><i className="ri-arrow-left-s-line" /></button>
            <span className="text-sm font-semibold text-gray-900">{_MONTHS[m]} {y}</span>
            <button type="button" onClick={() => setCursor(new Date(y, m + 1, 1))} className="h-7 w-7 inline-flex items-center justify-center rounded hover:bg-gray-100"><i className="ri-arrow-right-s-line" /></button>
          </div>
          <div className="grid grid-cols-7 gap-0.5 text-center">
            {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => <span key={d} className="text-[11px] font-medium text-gray-400 py-1">{d}</span>)}
            {cells.map((d, i) => d === null ? <span key={i} /> : (() => {
              const isSel = valid && sel.getFullYear() === y && sel.getMonth() === m && sel.getDate() === d;
              const dow = new Date(y, m, d).getDay();
              const wkOff = weekendRule && !allowWknd && (dow === 0 || dow === 6);
              if (wkOff) return <button key={i} type="button" disabled className="h-8 w-8 rounded-md text-sm text-gray-300 cursor-not-allowed">{d}</button>;
              return <button key={i} type="button" onClick={() => pick(d)} className={cn("h-8 w-8 rounded-md text-sm hover:bg-primary/10", isSel ? "bg-primary text-black font-semibold" : "text-gray-700")}>{d}</button>;
            })())}
          </div>
          {weekendRule && (
            <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2">
              <span className="inline-flex items-center gap-1 text-[11px] text-gray-400"><i className="ri-calendar-close-line" />Weekends off</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="text-[11px] font-medium text-gray-600">Allow weekends</span>
                <span style={{ transform: "scale(.75)", transformOrigin: "right center", display: "inline-flex" }}><UISwitch checked={allowWknd} onCheckedChange={setAllowWknd} /></span>
              </span>
            </div>
          )}
          {withTime && (
            <div className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3">
              <i className="ri-time-line text-gray-500" />
              <input type="time" value={time} onChange={e => setTime(e.target.value)} className="flex-1 h-8 rounded-md border border-input px-2 text-sm" style={{ fontFamily: "inherit" }} />
              <UIButton size="sm" onClick={() => { if (valid) { const [hh, mm] = time.split(":"); const dt = new Date(sel); dt.setHours(Number(hh) || 0, Number(mm) || 0); onSelect && onSelect(dt); } setOpen(false); }}>Done</UIButton>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Switch (mirrors components/ui/switch.tsx) ──
function UISwitch({ checked, onCheckedChange, id, className }) {
  return (
    <button type="button" role="switch" aria-checked={!!checked} id={id} onClick={() => onCheckedChange(!checked)}
      style={{ boxSizing: "border-box", padding: 0, border: 0, width: 36, height: 20, flexShrink: 0 }}
      className={cn("relative inline-flex cursor-pointer items-center rounded-full align-middle transition-colors", checked ? "bg-primary" : "bg-gray-300", className)}>
      <span style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", left: checked ? 18 : 2,
        width: 16, height: 16, borderRadius: "9999px", background: "#fff", boxShadow: "0 1px 2px rgba(16,24,40,.2)", transition: "left .15s ease" }} />
    </button>
  );
}

// ── StatCard (mirrors JobPostingsPageClient StatsCard: even:primary-50 / odd:secondary-50) ──
function UIStatCard({ title, value, index = 0 }) {
  // CSS odd children (1st,3rd,5th) → secondary-50; even (2nd,4th) → primary-50
  return (
    <div className={cn("rounded-xl px-5 py-4", index % 2 === 0 ? "bg-secondary-50" : "bg-primary-50")}>
      <p className="text-sm font-light text-gray-700">{title}</p>
      <p className="text-3xl font-semibold mt-1 text-gray-900">{value}</p>
    </div>
  );
}

// ── QuestionItem (mirrors SortableQuestionItem.tsx — pre-screening question) ──
function UIQuestionItem({ question, index, onChange, onRemove }) {
  const isText = question.type === 0, isYesNo = question.type === 1;
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
    </div>
  );
}

// ── SearchInput + FilterBar (mirrors JobPostingsTable toolbar: Tabs + Search + Show/Hide Filter) ──
function UISearchInput({ value, onChange, placeholder = "Search..." }) {
  return (
    <div className="input-wrap" style={{ padding: "8px 12px" }}>
      <i className="ri-search-2-line" style={{ fontSize: 18, color: "var(--icon-default)" }} />
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}
function UIFilterField({ label, children }) {
  return <div className="space-y-2"><p className="text-sm font-medium text-gray-700">{label}</p>{children}</div>;
}
// FilterBar — RULE: 0 filters → none; 1 filter → inline dropdown box in the toolbar (no toggle);
// 2+ filters → "Show/Hide Filter" toggle + panel grid + Reset/Apply.
// `filters` = array of { label, node }  (node is the control, usually a <Combobox>).
function UIFilterBar({ left, search, onSearch, searchPlaceholder = "Search...", filters, onReset, onApply, activeCount = 0 }) {
  const [open, setOpen] = React.useState(false);
  const list = Array.isArray(filters) ? filters.filter(Boolean) : null;
  const single = list && list.length === 1;
  const many = list && list.length > 1;
  const legacy = filters && !list; // legacy JSX → panel
  return (
    <div>
      <div className="flex justify-between items-center border-b px-6 py-4 gap-3 flex-wrap">
        <div className="min-w-0">{left}</div>
        <div className="flex items-center gap-3">
          {onSearch && <div className="w-72 max-w-full"><UISearchInput value={search} onChange={onSearch} placeholder={searchPlaceholder} /></div>}
          {single && <div className="w-56">{list[0].node}</div>}
          {(many || legacy) && (
            <UIButton variant="outline" size="sm" className={open ? "border-primary/60 bg-primary-50" : undefined} onClick={() => setOpen(o => !o)}>
              <i className="ri-filter-3-line" />{open ? "Hide Filter" : "Show Filter"}
              {activeCount > 0 && <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-black">{activeCount}</span>}
            </UIButton>
          )}
        </div>
      </div>
      {open && (many || legacy) && (
        <div className="mx-4 mt-3 mb-4 rounded-md border border-[#F0F1F3] bg-[#FAFAFA] px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{legacy ? filters : list.map((f, i) => <UIFilterField key={i} label={f.label}>{f.node}</UIFilterField>)}</div>
          <div className="mt-4 flex justify-end gap-2">
            <UIButton variant="outline" onClick={() => onReset && onReset()}>Reset filter</UIButton>
            <UIButton onClick={() => { onApply && onApply(); setOpen(false); }}>Apply Filters</UIButton>
          </div>
        </div>
      )}
    </div>
  );
}

// ── RowActions — table row actions. RULES: >2 actions → ⋯ dropdown menu; ≤2 → inline icon+text,
// and inline labels are restricted to ONE WORD (use `short`, else the label's first word; the full
// `label` shows as the button title + in the dropdown). actions: [{ label, short, icon, onClick, danger }]
// CONSISTENCY RULE: a table must present its row actions UNIFORMLY — if ANY row in the table would
// need the ⋯ dropdown (3+ actions), EVERY row uses the dropdown. Compute that once per table and pass
// `forceMenu` to all rows so 2-action rows don't render as inline buttons next to 3-action dropdowns.
function UIRowActions({ actions = [], forceMenu = false }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  if (!forceMenu && actions.length <= 2) {
    const oneWord = (a) => a.short || String(a.label).trim().split(/\s+/)[0];
    return (
      <div className="flex items-center gap-2 justify-end" onClick={e => e.stopPropagation()}>
        {actions.map(a => (
          <button key={a.label} type="button" title={a.label} onClick={() => a.onClick()}
            className={cn("inline-flex items-center gap-1.5 rounded-md border bg-white px-3 py-1.5 text-sm font-medium hover:bg-gray-50", a.danger ? "border-red-200 text-red-600" : "border-gray-200 text-gray-700")}>
            {a.icon && <i className={"ri-" + a.icon} />}{oneWord(a)}
          </button>
        ))}
      </div>
    );
  }
  return (
    <div ref={ref} className="relative flex justify-end" onClick={e => e.stopPropagation()}>
      <button type="button" onClick={() => setOpen(o => !o)} className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-input bg-white text-gray-600 hover:bg-gray-50"><i className="ri-more-2-fill text-lg" /></button>
      {open && (
        <div className="absolute right-0 top-10 z-30 min-w-[180px] rounded-md border border-input bg-white p-1 shadow-md">
          {actions.map(a => (
            <button key={a.label} type="button" onClick={() => { setOpen(false); a.onClick(); }}
              className={cn("flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-left cursor-pointer", a.danger ? "text-destructive hover:bg-destructive/10" : "text-gray-700 hover:bg-primary/5")}>
              {a.icon && <i className={"ri-" + a.icon} />}{a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

window.UI = {
  cn, Button: UIButton, Tabs: UITabs, TabsList: UITabsList, TabsTrigger: UITabsTrigger,
  Card: UICard, RadioPillGroup: UIRadioPillGroup, RadioGroup: UIRadioGroup, CheckboxGroup: UICheckboxGroup, Label: UILabel, Field: UIField, Input: UIInput, Textarea: UITextarea,
  Switch: UISwitch, StatCard: UIStatCard, QuestionItem: UIQuestionItem,
  RichText: UIRichText, HtmlBodyEditor: UIHtmlBodyEditor, LinkPopover: UILinkPopover, Tooltip: UITooltip, DatePicker: UIDatePicker,
  SearchInput: UISearchInput, FilterField: UIFilterField, FilterBar: UIFilterBar, RowActions: UIRowActions,
};
