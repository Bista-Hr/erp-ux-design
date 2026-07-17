// BISTA HR · admin/NotificationConfig — System Administration ▸ Notification Configurations.
// Mirrors the production flow (notification-config-types.ts):
//   Features list  : card grid — one card per workflow feature (Active badge, N events, N wired).
//   Events list    : rows for the selected feature (name, mono code, wired badge).
//   Event editor   : Event & channels toggles · Recipient rules (static emails/phones,
//                    department → emails map, dynamic recipient flags) · Templates per channel
//                    (Email / SMS / In-App) with merge-field insert + reset-to-default.
// The employee-facing notifications INBOX (shell/Notifications.jsx) is untouched — this is
// the admin configuration side only.
const { useState: useNc, useEffect: useNcEffect, useRef: useNcRef } = React;

/* ---------------- seed data (FeatureDto / EventConfigDto / TemplateDto shapes) ---------------- */
const NC_DYNAMIC_FLAGS = [
  { type: "LineManager", label: "Line manager" },
  { type: "RequestInitiator", label: "Request initiator" },
  { type: "AffectedEmployee", label: "Affected employee" },
  { type: "RequestAdditionalEmails", label: "Additional request emails" },
  { type: "ApprovalStepApprovers", label: "Approval step approvers" },
  { type: "ClearanceDepartmentEmails", label: "Clearance department emails" },
];

const NC_MERGE = {
  common: ["EmployeeName", "StaffId", "Department", "EffectiveDate", "RequestId", "InitiatorName", "OrganizationName"],
  exit: ["ExitType", "LastWorkingDay", "ClearanceStep"],
  leave: ["LeaveType", "StartDate", "EndDate", "DaysRequested"],
  recruitment: ["JobTitle", "CandidateName", "InterviewDate"],
};

const ncTpl = (channel, subject, body) => ({ channel, subject, body, isHtml: channel !== "Sms", isUsingSystemDefault: true });
const ncEvent = (code, name, description, isWired, extra = {}) => ({
  code, name, description, isWired,
  config: {
    eventCode: code, isEnabled: true, inAppEnabled: true, emailEnabled: true, smsEnabled: false,
    supportsPerRequestEmails: !!extra.perRequest,
    recipientRules: extra.rules || [{ ruleType: "AffectedEmployee", ruleValue: {}, sortOrder: 0, isActive: true }, { ruleType: "LineManager", ruleValue: {}, sortOrder: 1, isActive: true }],
    mergeFields: [...NC_MERGE.common, ...(extra.merge || [])],
  },
  templates: [
    ncTpl("Email", extra.subject || `${name} — {{EmployeeName}}`, extra.emailBody || `<p>Dear team,</p><p>A "${name.toLowerCase()}" event has occurred for <strong>{{EmployeeName}}</strong> ({{StaffId}}, {{Department}}).<br>Reference: {{RequestId}} · Effective: {{EffectiveDate}}</p><p>Regards,<br>{{OrganizationName}} HR</p>`),
    ncTpl("Sms", null, `${name}: {{EmployeeName}} ({{StaffId}}) — ref {{RequestId}}.`),
    ncTpl("InApp", extra.subject || name, `<p>${name} for <strong>{{EmployeeName}}</strong> — reference {{RequestId}}.</p>`),
  ],
});

const NC_FEATURES_SEED = [
  { code: "HR.Exit", name: "Employee Exit", description: "Resignations, retirements and terminations — clearance and closure notices.", isActive: true, events: [
    ncEvent("Exit.RequestSubmitted", "Exit request submitted", "Fires when an exit request is raised.", true, { perRequest: true, merge: NC_MERGE.exit }),
    ncEvent("Exit.Approved", "Exit approved", "Fires when the exit request passes final approval.", true, { perRequest: true, merge: NC_MERGE.exit }),
    ncEvent("Exit.ClearanceStepCompleted", "Clearance step completed", "Fires as each clearance department signs off.", false, { merge: NC_MERGE.exit, rules: [{ ruleType: "ClearanceDepartmentEmails", ruleValue: {}, sortOrder: 0, isActive: true }, { ruleType: "RequestInitiator", ruleValue: {}, sortOrder: 1, isActive: true }] }),
    ncEvent("Exit.Closed", "Exit closed", "Fires when the exit is fully processed and closed.", false, { merge: NC_MERGE.exit }),
  ]},
  { code: "HR.Promotions", name: "Promotions", description: "Promotion requests and approval outcomes.", isActive: true, events: [
    ncEvent("Promotion.Requested", "Promotion requested", "Fires when a promotion request is submitted.", true, { perRequest: true }),
    ncEvent("Promotion.Approved", "Promotion approved", "Fires when a promotion is approved.", true, { perRequest: true }),
    ncEvent("Promotion.Declined", "Promotion declined", "Fires when a promotion is declined.", false),
  ]},
  { code: "HR.Transfers", name: "Transfers", description: "Inter/intra-departmental transfer requests and outcomes.", isActive: true, events: [
    ncEvent("Transfer.Requested", "Transfer requested", "Fires when a transfer request is submitted.", true, { perRequest: true }),
    ncEvent("Transfer.Approved", "Transfer approved", "Fires when a transfer is approved.", true, { perRequest: true }),
    ncEvent("Transfer.Declined", "Transfer declined", "Fires when a transfer is declined.", false),
  ]},
  { code: "HR.JobTitle", name: "Job Title Change", description: "Assign / change of job title requests and outcomes.", isActive: true, events: [
    ncEvent("JobTitle.ChangeRequested", "Job title change requested", "Fires when a change of job title is submitted.", true),
    ncEvent("JobTitle.ChangeApproved", "Job title change approved", "Fires when the change is approved.", false),
  ]},
  { code: "HR.Leave", name: "Leave Management", description: "Leave requests, approvals and recalls.", isActive: true, events: [
    ncEvent("Leave.Requested", "Leave requested", "Fires when an employee submits a leave request.", true, { merge: NC_MERGE.leave }),
    ncEvent("Leave.Approved", "Leave approved", "Fires when a leave request is approved.", true, { merge: NC_MERGE.leave }),
    ncEvent("Leave.Recalled", "Leave recalled", "Fires when an employee is recalled from leave.", false, { merge: NC_MERGE.leave }),
  ]},
  { code: "HR.Recruitment", name: "Recruitment", description: "Applications, shortlisting and interview scheduling.", isActive: false, events: [
    ncEvent("Recruitment.ApplicationReceived", "Application received", "Fires when a candidate applies to a posting.", false, { merge: NC_MERGE.recruitment }),
    ncEvent("Recruitment.InterviewScheduled", "Interview scheduled", "Fires when an assessment/interview is scheduled.", false, { merge: NC_MERGE.recruitment, rules: [{ ruleType: "ApprovalStepApprovers", ruleValue: {}, sortOrder: 0, isActive: true }] }),
  ]},
];

/* ---------------- small pieces ---------------- */
function NcBadge({ children, tone = "gray" }) {
  const tones = {
    gray:   { bg: "var(--gray-100)", fg: "var(--gray-600)", bd: "1px solid var(--gray-200)" },
    yellow: { bg: "var(--primary-200, var(--brand-yellow-tint))", fg: "var(--primary-900, var(--brand-ink))", bd: "1px solid var(--primary-300, var(--brand-yellow))" },
    green:  { bg: "#EAF6EF", fg: "#1F8A5B" },
    blue:   { bg: "#EFF6FF", fg: "#1D4ED8", bd: "1px solid #BFDBFE" },
    outline:{ bg: "transparent", fg: "var(--gray-700)", bd: "1px solid var(--gray-200)" },
  };
  const t = tones[tone] || tones.gray;
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: t.bg, color: t.fg, border: t.bd || 0, borderRadius: 999, padding: "3px 10px", fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: 500, whiteSpace: "nowrap" }}>{children}</span>;
}

function NcToggleRow({ label, description, badge, checked, disabled, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "12px 14px", opacity: disabled ? 0.55 : 1 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 14, color: "var(--gray-900)" }}>{label}</span>
          {badge && <NcBadge tone="gray">{badge}</NcBadge>}
        </div>
        {description && <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-400)", marginTop: 3, lineHeight: 1.45 }}>{description}</div>}
      </div>
      <UI.Switch checked={checked} disabled={disabled} onCheckedChange={onChange} />
    </div>
  );
}

function NcChipInput({ label, description, placeholder, values, onChange, onToast }) {
  const [input, setInput] = useNc("");
  const add = () => {
    const v = input.trim(); if (!v) return;
    if (values.includes(v)) { onToast && onToast("Already added", { tone: "error" }); return; }
    onChange([...values, v]); setInput("");
  };
  return (
    <Field label={label} hint={description}>
      <div style={{ display: "flex", gap: 10 }}>
        <div className="input-wrap" style={{ flex: 1 }}>
          <input placeholder={placeholder} value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } }} />
        </div>
        <Button variant="stroke" onClick={add}>Add</Button>
      </div>
      {values.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
          {values.map(v => (
            <span key={v} style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "1px solid var(--gray-200)", borderRadius: 999, padding: "4px 6px 4px 12px", fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--gray-800)", background: "#fff" }}>
              {v}
              <button onClick={() => onChange(values.filter(x => x !== v))} style={{ border: 0, background: "none", cursor: "pointer", display: "inline-flex", padding: 2 }}>
                <Icon name="close-line" size={14} color="var(--gray-400)" />
              </button>
            </span>
          ))}
        </div>
      )}
    </Field>
  );
}

function NcCard({ title, children }) {
  return (
    <div className="card" style={{ padding: "var(--card-pad, 24px)", overflow: "visible", display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 18, color: "var(--gray-900)" }}>{title}</div>
      {children}
    </div>
  );
}

/* ---------------- features list ---------------- */
const NC_FEATURE_ICONS = {
  "HR.Exit": "logout-circle-r-line", "HR.Promotions": "arrow-up-circle-line", "HR.Transfers": "arrow-left-right-line",
  "HR.JobTitle": "briefcase-line", "HR.Leave": "calendar-event-line", "HR.Recruitment": "user-search-line",
};
function NcFeaturesView({ features, onOpen }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title="Notification Configurations" subtitle="Configure which channels fire and who gets notified for each workflow event." />
      <style>{`
        .nc-fcard{ transition: background .15s; }
        .nc-fcard:hover{ background: var(--primary-50, #FFF9E0) !important; }
        .nc-fcard .nc-fmark{ position:absolute; bottom:-4px; right:-4px; transform: rotate(-12deg); transition: transform .3s, opacity .3s; opacity:.6; pointer-events:none; }
        .nc-fcard:hover .nc-fmark{ transform: rotate(0deg) scale(1.1); }
        .nc-fcard:hover .nc-fchev{ transform: translateX(2px); }
      `}</style>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 1, background: "var(--divider)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        {features.map(f => {
          const wired = f.events.filter(e => e.isWired).length;
          return (
            <button key={f.code} onClick={() => onOpen(f)} className="nc-fcard" style={{ position: "relative", overflow: "hidden", padding: "14px 16px", textAlign: "left", cursor: "pointer", border: 0, display: "flex", flexDirection: "column", gap: 8, background: "#fff" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div style={{ fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 16, color: "var(--gray-900)", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
                <span className="nc-fchev" style={{ flexShrink: 0, marginTop: 4, display: "inline-flex", transition: "transform .15s" }}><Icon name="arrow-right-s-line" size={16} color="var(--gray-400)" /></span>
              </div>
              <div style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--gray-500)", lineHeight: 1.5, minHeight: 36, position: "relative", zIndex: 1 }}>{f.description || `${f.events.length} event(s)`}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: "auto", position: "relative", zIndex: 1 }}>
                <NcBadge tone={f.isActive ? "green" : "gray"}>{f.isActive ? "Active" : "Inactive"}</NcBadge>
                <NcBadge tone="outline">{f.events.length} events</NcBadge>
                <NcBadge tone="outline">{wired} wired</NcBadge>
              </div>
              <span className="nc-fmark"><Icon name={NC_FEATURE_ICONS[f.code] || "notification-3-line"} size={56} color="var(--gray-100)" /></span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- events list ---------------- */
function NcEventsView({ feature, onOpen }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title={feature.name} subtitle={feature.description || "Events for this feature"} />
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {feature.events.map((e, i) => (
          <button key={e.code} onClick={() => onOpen(e)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, width: "100%", textAlign: "left", background: "#fff", border: 0, borderTop: i > 0 ? "1px solid var(--divider)" : 0, padding: "16px 20px", cursor: "pointer" }}
            onMouseEnter={ev => ev.currentTarget.style.background = "var(--gray-50)"} onMouseLeave={ev => ev.currentTarget.style.background = "#fff"}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 14, color: "var(--gray-900)" }}>{e.name}</span>
                {e.isWired
                  ? <NcBadge tone="yellow"><Icon name="flashlight-line" size={12} color="var(--primary-900, var(--brand-ink))" />Dispatch wired</NcBadge>
                  : <NcBadge tone="gray"><Icon name="water-flash-line" size={12} color="var(--gray-600)" />Configurable, dispatch later</NcBadge>}
              </div>
              {e.description && <div style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--gray-500)", marginTop: 4 }}>{e.description}</div>}
            </div>
            <Icon name="arrow-right-s-line" size={16} color="var(--gray-400)" style={{ flexShrink: 0 }} />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------- event editor ---------------- */
const ncFindRule = (rules, t) => rules.find(r => r.ruleType === t);
const ncStrList = (v) => (Array.isArray(v) ? v : []);
function ncUpsertRule(rules, ruleType, ruleValue, isActive) {
  const i = rules.findIndex(r => r.ruleType === ruleType);
  const next = { ruleType, ruleValue, sortOrder: i >= 0 ? rules[i].sortOrder : rules.length, isActive };
  if (i >= 0) { const c = [...rules]; c[i] = next; return c; }
  return [...rules, next];
}
const ncRemoveRule = (rules, t) => rules.filter(r => r.ruleType !== t);

function NcEditorView({ feature, event, onSave, onToast }) {
  const cfg = event.config;
  const [toggles, setToggles] = useNc({ isEnabled: cfg.isEnabled, inAppEnabled: cfg.inAppEnabled, emailEnabled: cfg.emailEnabled, smsEnabled: cfg.smsEnabled });
  const [rules, setRules] = useNc(cfg.recipientRules);
  const [templates, setTemplates] = useNc(event.templates);
  const [channel, setChannel] = useNc("Email");
  const [deptKey, setDeptKey] = useNc("");
  const [deptEmails, setDeptEmails] = useNc("");
  const bodyRef = useNcRef(null);
  const subjectRef = useNcRef(null);
  const htmlInsertRef = useNcRef(null);   // caret-insert fn exposed by UI.HtmlBodyEditor (Email / In-App)
  const [linkOpen, setLinkOpen] = useNc(false);

  const tpl = templates.find(t => t.channel === channel) || {};
  const [subjectDraft, setSubjectDraft] = useNc(tpl.subject || "");
  const [bodyDraft, setBodyDraft] = useNc(tpl.body || "");
  const pickChannel = (c) => { setChannel(c); const t = templates.find(x => x.channel === c) || {}; setSubjectDraft(t.subject || ""); setBodyDraft(t.body || ""); };

  const staticEmails = ncStrList((ncFindRule(rules, "StaticEmails") || {}).ruleValue);
  const staticPhones = ncStrList((ncFindRule(rules, "StaticPhones") || {}).ruleValue);
  const deptMap = ((ncFindRule(rules, "DepartmentEmailMap") || {}).ruleValue) || {};

  const insertText = (snippet) => {
    if (document.activeElement === subjectRef.current && subjectRef.current) {
      const t = subjectRef.current, start = t.selectionStart ?? t.value.length, end = t.selectionEnd ?? start;
      setSubjectDraft(t.value.slice(0, start) + snippet + t.value.slice(end));
      requestAnimationFrame(() => { t.focus(); const c = start + snippet.length; t.setSelectionRange(c, c); });
      return;
    }
    if (channel === "Email" || channel === "InApp") { htmlInsertRef.current && htmlInsertRef.current(snippet); return; }
    const target = bodyRef.current;
    if (!target) { setBodyDraft(p => p + snippet); return; }
    const start = target.selectionStart ?? target.value.length, end = target.selectionEnd ?? start;
    setBodyDraft(target.value.slice(0, start) + snippet + target.value.slice(end));
    requestAnimationFrame(() => { target.focus(); const c = start + snippet.length; target.setSelectionRange(c, c); });
  };
  const insertMerge = (token) => insertText(`{{${token}}}`);

  const saveToggles = () => { onSave({ toggles }); onToast("Channel toggles saved", { tone: "success" }); };
  const saveRules = () => { const norm = rules.map((r, i) => ({ ...r, sortOrder: i })); setRules(norm); onSave({ rules: norm }); onToast("Recipient rules saved", { tone: "success" }); };
  const saveTemplate = () => {
    const next = templates.map(t => t.channel === channel ? { ...t, subject: channel === "Sms" ? null : subjectDraft, body: bodyDraft, isUsingSystemDefault: false } : t);
    setTemplates(next); onSave({ templates: next }); onToast(`${channel === "Sms" ? "SMS" : channel === "InApp" ? "In-App" : "Email"} template saved`, { tone: "success" });
  };
  const resetTemplate = () => {
    const seed = ncEvent(event.code, event.name, event.description, event.isWired).templates.find(t => t.channel === channel);
    const next = templates.map(t => t.channel === channel ? { ...seed } : t);
    setTemplates(next); setSubjectDraft(seed.subject || ""); setBodyDraft(seed.body || "");
    onSave({ templates: next }); onToast("Template reset to system default", { tone: "success" });
  };

  const chOff = !toggles.isEnabled;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title={event.name} subtitle={`${feature.name} · ${event.code}`}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {event.isWired
            ? <NcBadge tone="yellow"><Icon name="flashlight-line" size={12} color="var(--primary-900, var(--brand-ink))" />Dispatch wired</NcBadge>
            : <NcBadge tone="gray"><Icon name="water-flash-line" size={12} color="var(--gray-600)" />Configurable — dispatch enabled in a later phase</NcBadge>}
          {cfg.supportsPerRequestEmails && <NcBadge tone="blue">Per-request emails on workflow forms are merged when enabled</NcBadge>}
        </div>
      </PageHeader>

      <NcCard title="Event & Channels">
        <div className="bh-body" style={{ marginTop: -6 }}>Master switch disables all channels. Each channel is independent when the event is enabled.</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <NcToggleRow label="Event enabled" description="When off, no channel delivers for this event." checked={toggles.isEnabled} onChange={v => setToggles(t => ({ ...t, isEnabled: v }))} />
          <NcToggleRow label="In-App" description="Writes to the employee notification inbox." checked={toggles.inAppEnabled} disabled={chOff} onChange={v => setToggles(t => ({ ...t, inAppEnabled: v }))} />
          <NcToggleRow label="Email" description="Publishes email payloads to messaging events." checked={toggles.emailEnabled} disabled={chOff} onChange={v => setToggles(t => ({ ...t, emailEnabled: v }))} />
          <NcToggleRow label="SMS" badge="Not yet live" description="Publishes SMS payloads. Provider integration is not live yet — delivery logs will show skipped when unset." checked={toggles.smsEnabled} disabled={chOff} onChange={v => setToggles(t => ({ ...t, smsEnabled: v }))} />
        </div>
        <div><Button variant="primary" onClick={saveToggles}>Save Toggles</Button></div>
      </NcCard>

      <NcCard title="Recipient Rules">
        <div className="bh-body" style={{ marginTop: -6 }}>Combine static contacts, department maps, and dynamic role-based recipients.</div>
        <EmailInputList label="Static Emails" description="Always notified when Email is enabled" placeholder="eg. hrops@bistasol.com"
          emails={staticEmails} onChange={(emails) => setRules(prev => emails.length === 0 ? ncRemoveRule(prev, "StaticEmails") : ncUpsertRule(prev, "StaticEmails", emails, true))} />
        <NcChipInput label="Static Phones" description="Always notified when SMS is enabled" placeholder="eg. +233 24 000 0000" values={staticPhones} onToast={onToast}
          onChange={(phones) => setRules(prev => phones.length === 0 ? ncRemoveRule(prev, "StaticPhones") : ncUpsertRule(prev, "StaticPhones", phones, true))} />

        <Field label="Department → Emails" hint="Used for clearance/department stakeholder maps on exit events.">
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div className="input-wrap" style={{ flex: "1 1 180px" }}><input placeholder="Department key (eg. Payroll)" value={deptKey} onChange={e => setDeptKey(e.target.value)} /></div>
            <div className="input-wrap" style={{ flex: "2 1 260px" }}><input placeholder="email1@x.com, email2@x.com" value={deptEmails} onChange={e => setDeptEmails(e.target.value)} /></div>
            <Button variant="stroke" disabled={!deptKey.trim()} onClick={() => {
              const emails = deptEmails.split(",").map(s => s.trim()).filter(Boolean);
              const nextMap = { ...deptMap, [deptKey.trim()]: emails };
              setRules(prev => ncUpsertRule(prev, "DepartmentEmailMap", nextMap, true));
              setDeptKey(""); setDeptEmails("");
            }}>Add / Update</Button>
          </div>
          {Object.keys(deptMap).length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
              {Object.entries(deptMap).map(([dept, emails]) => (
                <span key={dept} style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid var(--gray-200)", borderRadius: 999, padding: "5px 8px 5px 12px", fontFamily: "var(--font-ui)", fontSize: 12.5, background: "#fff" }}>
                  <span style={{ fontWeight: 600, color: "var(--gray-900)" }}>{dept}</span>
                  <span style={{ color: "var(--gray-400)" }}>{emails.join(", ") || "(none)"}</span>
                  <button onClick={() => {
                    const nextMap = { ...deptMap }; delete nextMap[dept];
                    setRules(prev => Object.keys(nextMap).length === 0 ? ncRemoveRule(prev, "DepartmentEmailMap") : ncUpsertRule(prev, "DepartmentEmailMap", nextMap, true));
                  }} style={{ border: 0, background: "none", cursor: "pointer", display: "inline-flex", padding: 2 }}>
                    <Icon name="close-line" size={14} color="var(--gray-400)" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </Field>

        <Field label="Dynamic Recipients">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
            {NC_DYNAMIC_FLAGS.map(f => {
              const active = (ncFindRule(rules, f.type) || {}).isActive === true;
              return <NcToggleRow key={f.type} label={f.label} checked={active}
                onChange={(v) => setRules(prev => v ? ncUpsertRule(prev, f.type, {}, true) : ncRemoveRule(prev, f.type))} />;
            })}
          </div>
        </Field>
        <div><Button variant="primary" onClick={saveRules}>Save Recipient Rules</Button></div>
      </NcCard>

      <NcCard title="Templates">
        <div className="bh-body" style={{ marginTop: -6 }}>Edit per-channel copy. Merge fields insert at the caret. Reset restores the seeded default.</div>
        <UI.Tabs value={channel} onValueChange={pickChannel}>
          <UI.TabsList>
            <UI.TabsTrigger value="Email">Email</UI.TabsTrigger>
            <UI.TabsTrigger value="Sms">SMS</UI.TabsTrigger>
            <UI.TabsTrigger value="InApp">In-App</UI.TabsTrigger>
          </UI.TabsList>
        </UI.Tabs>
        <div>
          {tpl.isUsingSystemDefault
            ? <NcBadge tone="gray">Showing seeded default — saving creates a tenant override</NcBadge>
            : <NcBadge tone="outline">Tenant override</NcBadge>}
        </div>
        {channel !== "Sms" && (
          <Field label={channel === "InApp" ? "Title" : "Subject"}>
            <div className="input-wrap"><input ref={subjectRef} value={subjectDraft} onChange={e => setSubjectDraft(e.target.value)} /></div>
          </Field>
        )}
        <Field label="Body" hint={channel === "Sms" ? `${bodyDraft.length} chars (aim ≤160)` : "Toggle Editor / HTML / Preview — the message is stored and sent as HTML."}>
          {channel === "Sms"
            ? <div className="input-wrap"><textarea ref={bodyRef} rows={4} value={bodyDraft} onChange={e => setBodyDraft(e.target.value)} /></div>
            : <UI.HtmlBodyEditor value={bodyDraft} onChange={setBodyDraft} insertRef={htmlInsertRef} placeholder={channel === "Email" ? "Compose the email body…" : "Compose the in-app message body…"} />}
        </Field>
        <Field label="Merge Fields">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {(cfg.mergeFields || []).map(f => (
              <Button key={f} variant="stroke" size="sm" onClick={() => insertMerge(f)}><span style={{ fontFamily: "ui-monospace, monospace", fontSize: 12 }}>{`{{${f}}}`}</span></Button>
            ))}
            {channel === "Sms" && (
              <span style={{ position: "relative", display: "inline-flex" }}>
                <Button variant="stroke" size="sm" icon="link" onClick={() => setLinkOpen(o => !o)}>Insert Link</Button>
                {linkOpen && <UI.LinkPopover onPick={(url) => { insertText(url); setLinkOpen(false); }} onClose={() => setLinkOpen(false)} />}
              </span>
            )}
          </div>
        </Field>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Button variant="primary" onClick={saveTemplate}>Save {channel === "Sms" ? "SMS" : channel === "InApp" ? "In-App" : "Email"} Template</Button>
          <Button variant="stroke" icon="restart-line" onClick={resetTemplate}>Reset to Default</Button>
        </div>
      </NcCard>
    </div>
  );
}

/* ---------------- controller ---------------- */
function NotificationConfigScreen({ onToast, onSubPage }) {
  const [features, setFeatures] = useNc(NC_FEATURES_SEED);
  const [view, setView] = useNc({ name: "features" });   // features | events | editor

  useNcEffect(() => {
    if (!onSubPage) return;
    if (view.name === "events") onSubPage({ trail: [
      { label: "Notification Configurations", onClick: () => setView({ name: "features" }) },
      { label: view.feature.name }] });
    else if (view.name === "editor") onSubPage({ trail: [
      { label: "Notification Configurations", onClick: () => setView({ name: "features" }) },
      { label: view.feature.name, onClick: () => setView({ name: "events", feature: view.feature }) },
      { label: view.event.name }] });
    else onSubPage(null);
    return () => onSubPage(null);
  }, [view]);

  const persist = (featureCode, eventCode, patch) => setFeatures(fs => fs.map(f => f.code !== featureCode ? f : {
    ...f, events: f.events.map(e => e.code !== eventCode ? e : {
      ...e,
      config: { ...e.config, ...(patch.toggles || {}), recipientRules: patch.rules || e.config.recipientRules },
      templates: patch.templates || e.templates,
    }),
  }));

  if (view.name === "editor") return <NcEditorView feature={view.feature} event={view.event} onToast={onToast}
    onSave={(patch) => persist(view.feature.code, view.event.code, patch)} />;
  if (view.name === "events") {
    const feature = features.find(f => f.code === view.feature.code) || view.feature;
    return <NcEventsView feature={feature} onOpen={(e) => setView({ name: "editor", feature, event: e })} />;
  }
  return <NcFeaturesView features={features} onOpen={(f) => setView({ name: "events", feature: f })} />;
}

Object.assign(window, { NotificationConfigScreen });
