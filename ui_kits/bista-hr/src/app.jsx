// BISTA HR · app — root orchestrator.
// Wires the phased CRUD flows exactly like the Figma "Adding Department" section:
//
//   CREATE : Add button → FormModal → "Create X" → ConfirmModal("Add X?") → Yes,Add
//            → commit row + "X Added" toast
//   EDIT   : row ⋯ Edit → FormModal(prefilled) → "Update X" → ConfirmModal("Update X?")
//            → Yes,Update → commit changes + "X Updated" toast
//   ARCHIVE: row ⋯ Archive → ConfirmModal("Archive X?") → Yes,Archive
//            → remove row + "X Archived" toast
//
// `form` drives the FormModal; `confirm` drives the ConfirmModal (it can sit on top of
// the form during create/edit). Cancelling the confirm returns to the form.
const { useState: useS, useRef: useR } = React;

// ---- Tweaks: global density / padding controls (toolbar “Tweaks” toggle) ----
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "density": "regular",
  "pagePad": 32,
  "cardPad": 24,
  "rowPad": 16
}/*EDITMODE-END*/;
const DENSITY_PRESETS = {
  compact:  { pagePad: 16, cardPad: 16, rowPad: 10 },
  regular:  { pagePad: 32, cardPad: 24, rowPad: 16 },
  comfy:    { pagePad: 44, cardPad: 32, rowPad: 22 },
};
function TweaksLayer() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  React.useEffect(() => {
    const r = document.documentElement.style;
    r.setProperty("--page-pad", t.pagePad + "px");
    r.setProperty("--card-pad", t.cardPad + "px");
    r.setProperty("--bh-cell-py", t.rowPad + "px");
  }, [t.pagePad, t.cardPad, t.rowPad]);
  return (
    <TweaksPanel>
      <TweakSection label="Density" />
      <TweakRadio label="Preset" value={t.density} options={["compact", "regular", "comfy"]}
        onChange={(v) => setTweak({ density: v, ...DENSITY_PRESETS[v] })} />
      <TweakSection label="Fine-tune padding" />
      <TweakSlider label="Page gutter" value={t.pagePad} min={8} max={48} unit="px"
        onChange={(v) => setTweak({ pagePad: v, density: "custom" })} />
      <TweakSlider label="Card padding" value={t.cardPad} min={8} max={40} unit="px"
        onChange={(v) => setTweak({ cardPad: v, density: "custom" })} />
      <TweakSlider label="Table row padding" value={t.rowPad} min={6} max={24} unit="px"
        onChange={(v) => setTweak({ rowPad: v, density: "custom" })} />
    </TweaksPanel>
  );
}

const CONFIRM_COPY = {
  add:     { verb: "Add",     icon: "add-line",      done: "Added" },
  update:  { verb: "Update",  icon: "check-line",    done: "Updated" },
  archive: { verb: "Archive", icon: "archive-line",  done: "Archived" },
};

// kind ("list"/"info"/"dashboard") of the top section that owns `parent`
const sectionKindOf = (parent) => {
  const t = NAV_MAIN.find(n => n.name === parent) || (parent === NAV_ADMIN.name ? NAV_ADMIN : null);
  return (t && t.kind) || "list";
};

// first nav destination the given permission-set can actually open (role landing)
function firstDestination(perms) {
  const tryNode = (node, parent, kind) => {
    if (node.tabs && node.tabs.length) {
      const t = firstAllowedTab(perms, kind, node.tabs);
      return t ? { node, parent, tab: t } : null;
    }
    return tabAllowed(perms, kind, node.name) ? { node, parent, tab: null } : null;
  };
  for (const top of NAV_MAIN) {
    if (top.children) { for (const c of top.children) { const d = tryNode(c, top.name, top.kind); if (d) return d; } }
    else { const d = tryNode(top, top.name, top.kind); if (d) return d; }
  }
  for (const c of NAV_ADMIN.children) { const d = tryNode(c, NAV_ADMIN.name, NAV_ADMIN.kind); if (d) return d; }
  return null;
}

function App() {
  const [route, setRoute] = useS("role-select");
  const [rbac, setRbac] = useStore(window.HRStores.rbac);
  const perms = React.useMemo(() => permsForRole(rbac.roleId, rbac.roles), [rbac.roleId, rbac.roles]);
  const [nav, setNav] = useS({ node: CORE_HR, parent: "HR Management", tab: "Departments" });
  const [data, setData] = useS({ ...SEED, Employees: EMPLOYEES });
  const [form, setForm] = useS(null);       // { mode: 'create'|'edit', row? }
  const [confirm, setConfirm] = useS(null);  // { intent: 'add'|'update'|'archive', form?, row? }
  const [employee, setEmployee] = useS(null); // selected employee → detail page
  const [collapsed, setCollapsed] = useS(false); // sidebar collapse
  const [importOpen, setImportOpen] = useS(false); // bulk-import modal
  const [preview, setPreview] = useS(null);   // parsed rows awaiting import
  const [announce, setAnnounce] = useS(null);  // null | { view:'list' } | { view:'detail', a }
  const [orgTree, setOrgTree] = useS(false);   // "View Organizational Tree" modal
  const [subPage, setSubPage] = useS(null);    // breadcrumb trail when a full-page sub-view replaces the tabbar
  const [requests, setRequests] = useS([
    { id: 1, employee: "Ama Mensah", type: "Profile Update", section: "Address",        change: "update", date: "12 Nov, 2025", status: "pending" },
    { id: 2, employee: "Kofi Owusu", type: "Profile Update", section: "Identification", change: "update", date: "10 Nov, 2025", status: "approved" },
  ]);
  const [toasts, setToasts] = useS([]);
  const seq = useR(100);

  const pushToast = (msg, opts = {}) => {
    const id = ++seq.current;
    setToasts(t => [...t, { id, msg, tone: opts.tone, kind: opts.kind }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200);
  };
  const dismissToast = (id) => setToasts(t => t.filter(x => x.id !== id));

  const navigate = (node, parent) => {
    const tabs = tabsFor(node);
    const kind = sectionKindOf(parent || node.name);
    const tab = tabs ? (firstAllowedTab(perms, kind, tabs) || tabs[0]) : null;
    setNav({ node, parent: parent || node.name, tab });
    setForm(null); setConfirm(null); setEmployee(null); setImportOpen(false); setPreview(null); setAnnounce(null); setSubPage(null); setOrgTree(false);
  };
  // live role switch (top bar) — reshape nav + jump to a page the role can open
  const switchRole = (roleId) => {
    setRbac(s => ({ ...s, roleId }));
    const dest = firstDestination(permsForRole(roleId, rbac.roles));
    if (dest) setNav(dest);
    setForm(null); setConfirm(null); setEmployee(null); setImportOpen(false); setPreview(null); setAnnounce(null); setSubPage(null); setOrgTree(false);
  };
  const goDashboard = () => { const d = NAV_MAIN[0]; navigate(d, d.name); };  const setTab = (tab) => { setEmployee(null); setAnnounce(null); setSubPage(null); setOrgTree(false); setNav(n => ({ ...n, tab })); };

  // profile menu → open My Info; sign out → back to the login screen
  const goProfile = () => {
    const dash = NAV_MAIN[0];
    setNav({ node: dash, parent: dash.name, tab: "My Info" });
    setForm(null); setConfirm(null); setEmployee(null); setImportOpen(false); setPreview(null); setAnnounce(null);
  };
  const signOut = () => {
    setRoute("role-select");
    setForm(null); setConfirm(null); setEmployee(null); setImportOpen(false); setPreview(null); setAnnounce(null); setToasts([]);
  };

  // section kind drives list vs info rendering
  const topNode = NAV_MAIN.find(n => n.name === nav.parent) || (nav.parent === NAV_ADMIN.name ? NAV_ADMIN : null);
  const kind = (topNode && topNode.kind) || "list";
  const tabs = tabsFor(nav.node);
  const pageName = nav.tab || nav.node.name;
  const visTabs = tabs ? tabs.filter(t => tabAllowed(perms, kind, t)) : tabs;
  const allowed = tabAllowed(perms, kind, pageName);
  // hide the sidebar entirely when the role has only one nav destination (e.g. ESS → Dashboard)
  const showSidebar = visibleNavCount(perms) > 1;
  const isList = kind === "list";
  const cfg = isList ? (CONFIGS[pageName] || genConfig(pageName)) : null;
  // lookups derived from LIVE data → managed Departments/Grades/etc. feed every dropdown
  const lookups = deriveLookups(data);
  const rows = (isList && data[pageName]) || [];
  const isEmployees = isList && pageName === "Employees";
  const viewingEmployee = isEmployees && !!employee;
  const isLeaveAdmin = isList && nav.node && nav.node.name === "Leave Management";
  // Core HR ▸ Approvals shows the same employee-submitted requests as Dashboard ▸ Requests
  const isApprovals = isList && pageName === "Approvals";
  // System Administration ▸ Configuration ▸ Competencies (custom: levels + traits + rankings)
  const isCompetencies = isList && pageName === "Competencies";
  // HR Management ▸ Promotions (custom: list + full-page add + details)
  const isPromotions = isList && pageName === "Promotions";
  // People & Culture ▸ Transfers (custom: list + full-page add + details)
  const isTransfers = isList && pageName === "Transfers";
  // People & Culture ▸ Job Title (Change of Job Title — custom: list + full-page add + details)
  const isJobTitle = isList && pageName === "Job Title";
  // People & Culture ▸ Employee Exit (custom: list + initiate + clearance processing)
  const isExit = isList && pageName === "Employee Exit";
  // HR Management ▸ Employee Engagement ▸ Accommodation / Welfare / Disciplinary (custom flows)
  const isAccommodation = isList && pageName === "Accommodation";
  const isWelfare = isList && pageName === "Welfare";
  const isDisciplinary = isList && pageName === "Disciplinary Cycle";
  // System Administration ▸ User Management ▸ Roles / Users (RBAC management)
  const isRoles = isList && pageName === "Roles";
  const isUsers = isList && pageName === "Users";
  // Recruitment ▸ Job Posts (admin posting details + applicant pipeline)
  const isJobPosts = isList && pageName === "Job Posts";

  // ---- phase transitions ----
  const openCreate = () => setForm({ mode: "create" });
  const openEdit = (row) => setForm({ mode: "edit", row });
  const askArchive = (row) => setConfirm({ intent: "archive", row });
  // extra per-entity row-menu actions (e.g. Zones ▸ "View Branches") + header actions
  const handleMenuAction = (key) => {
    if (key === "viewBranches") setTab("Branches/Units");
    else if (key === "orgTree") setOrgTree(true);
  };

  // FormModal submit → raise the confirmation phase
  const submitForm = (formData) => {
    setConfirm({ intent: form.mode === "edit" ? "update" : "add", form: formData, row: form.row });
  };

  // ConfirmModal "Yes" → commit + toast + close everything
  const commit = () => {
    const noun = cfg.noun;
    if (confirm.intent === "add") {
      const id = ++seq.current;
      setData(d => ({ ...d, [pageName]: [...(d[pageName] || []), { id, ...confirm.form }] }));
    } else if (confirm.intent === "update") {
      setData(d => ({ ...d, [pageName]: d[pageName].map(r => r.id === confirm.row.id ? { ...r, ...confirm.form } : r) }));
    } else if (confirm.intent === "archive") {
      setData(d => ({ ...d, [pageName]: d[pageName].filter(r => r.id !== confirm.row.id) }));
    }
    pushToast(`${noun} ${CONFIRM_COPY[confirm.intent].done}`, { tone: confirm.intent === "archive" ? "error" : "success" });
    setConfirm(null);
    setForm(null);
  };

  // bulk import: modal → preview → confirm → append rows + green success toast
  const confirmImport = (importRows) => {
    setData(d => ({ ...d, Employees: [...importRows.map((r, i) => ({ ...r, id: ++seq.current })), ...(d.Employees || [])] }));
    setPreview(null);
    pushToast("Employees Added", { tone: "success" });
  };

  // self-service profile-update requests (created from My Info, actioned on Requests)
  const addRequest = (r) => { const id = ++seq.current; setRequests(rs => [{ id, employee: ME.name, type: "Profile Update", date: "Today", status: "pending", ...r }, ...rs]); };
  const resolveRequest = (id, status) => {
    setRequests(rs => rs.map(r => r.id === id ? { ...r, status } : r));
    pushToast(status === "approved" ? "Request Accepted" : "Request Rejected", { tone: status === "approved" ? "success" : "error" });
  };

  if (route === "role-select") return <RoleSelectScreen roles={rbac.roles} initial={rbac.roleId}
    onContinue={(roleId) => { setRbac(s => ({ ...s, roleId })); setRoute("login"); }} />;
  if (route === "login") return <LoginScreen onContinue={() => {
    const dest = firstDestination(perms);
    if (dest) setNav(dest);
    setRoute("app");
  }} />;

  // Overview & My Info manage their own internal scrolling (so the announcements rail can
  // scroll independently of the page); every other screen scrolls in the content wrapper.
  const selfScroll = kind === "dashboard" && (pageName === "Overview" || pageName === "My Info" || pageName === "Leave Requests" || pageName === "Target Requests" || pageName === "Appraisals" || pageName === "Requests");
  const showTabs = ((visTabs && visTabs.length) || subPage) && !viewingEmployee && !preview;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: "var(--gray-75)" }}>
      <TopNav title={nav.node.name} onToggleNav={showSidebar ? () => setCollapsed(c => !c) : null}
        user={{ name: ME.name, email: ME.email, org: ME.dept }} onProfile={goProfile} onSignOut={signOut} />
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        {showSidebar && <Sidebar current={nav.node.name} onNavigate={navigate} collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} perms={perms} />}
        <div style={{ flex: 1, minWidth: 0, minHeight: 0, display: "flex", flexDirection: "column" }}>
          {showTabs && (
            <div className="tabbar">
              {subPage
                ? <Breadcrumb trail={subPage.trail} style={{ marginBottom: 0, paddingBottom: 13 }} />
                : <Tabs items={visTabs} active={nav.tab} onChange={setTab} />}
            </div>
          )}
          <div style={{ flex: 1, minHeight: 0, minWidth: 0, overflow: selfScroll ? "hidden" : "auto", padding: selfScroll ? 0 : "var(--page-pad, 32px)", boxSizing: "border-box" }}>
            {!allowed
              ? <ForbiddenScreen onHome={goDashboard} />
              : !isList
              ? (kind === "dashboard"
                  ? <DashboardArea tab={pageName} requests={requests} onAddRequest={addRequest} onResolve={resolveRequest} onToast={pushToast}
                      announce={announce}
                      onViewAnnouncements={() => setAnnounce({ view: "list" })}
                      onOpenAnnouncement={(a) => setAnnounce({ view: "detail", a })}
                      onCloseAnnouncements={() => setAnnounce(null)}
                      onSubPage={setSubPage} />
                  : <InfoPage title={pageName} />)
              : isEmployees
                ? (preview
                    ? <PreviewEmployeesScreen rows={preview} onCancel={() => setPreview(null)} onConfirm={confirmImport} onAddEmployee={openCreate} />
                    : employee
                      ? <EmployeeDetail employee={employee} onBack={() => setEmployee(null)} onToast={pushToast} />
                      : <EmployeesScreen employees={rows} onOpen={setEmployee} onAdd={openCreate} onEdit={openEdit} onArchive={askArchive} onImport={() => setImportOpen(true)} />)
                : isLeaveAdmin
                  ? <LeaveManagement tab={pageName} onToast={pushToast} onSubPage={setSubPage} jobGrades={data["Job Grades"] || []} />
                  : isApprovals
                    ? <AdminApprovalsScreen onToast={pushToast} />
                    : isCompetencies
                      ? <CompetenciesScreen onToast={pushToast} onSubPage={setSubPage} />
                      : isPromotions
                        ? <PromotionsScreen onToast={pushToast} onSubPage={setSubPage} lookups={lookups} />
                        : isTransfers
                          ? <TransfersScreen onToast={pushToast} onSubPage={setSubPage} lookups={lookups} />
                          : isJobTitle
                            ? <JobTitleScreen onToast={pushToast} onSubPage={setSubPage} lookups={lookups} />
                            : isExit
                              ? <ExitScreen onToast={pushToast} onSubPage={setSubPage} lookups={lookups} />
                        : isAccommodation
                          ? <AccommodationScreen onToast={pushToast} onSubPage={setSubPage} jobGrades={data["Job Grades"] || []} />
                          : isWelfare
                            ? <WelfareScreen onToast={pushToast} onSubPage={setSubPage} departments={lookups.departments} />
                            : isDisciplinary
                              ? <DisciplinaryScreen onToast={pushToast} onSubPage={setSubPage} departments={lookups.departments} />
                              : isJobPosts
                                ? <JobPostsScreen onToast={pushToast} />
                                : isRoles
                                ? <RolesScreen onToast={pushToast} canCreate={pageCan(perms, "Roles", "Create")} canEdit={pageCan(perms, "Roles", "Update")} canDelete={pageCan(perms, "Roles", "Delete")} />
                                : isUsers
                                  ? <UsersScreen onToast={pushToast} roles={rbac.roles} canEdit={pageCan(perms, "Users", "Update")} />
                                  : <CrudScreen key={pageName} config={cfg} rows={rows}
                                  onCreate={openCreate} onEdit={openEdit} onArchive={askArchive} onMenuAction={handleMenuAction}
                                  canCreate={pageCan(perms, pageName, "Create")} canEdit={pageCan(perms, pageName, "Update")} canArchive={pageCan(perms, pageName, "Delete")} />}
            {!selfScroll && <div aria-hidden="true" style={{ height: 56 }} />}
          </div>
        </div>
      </div>

      {importOpen && (
        <ImportEmployeesModal onClose={() => setImportOpen(false)}
          onSeePreview={() => { setImportOpen(false); setPreview(IMPORT_SAMPLE); }} />
      )}

      {/* Phase 2: the form (create / edit) */}
      {form && (
        <FormModal config={cfg} initial={form.mode === "edit" ? form.row : null}
          onClose={() => setForm(null)} onSubmit={submitForm} lookups={lookups} />
      )}

      {/* Phase 3: the confirmation (sits above the form for create/edit) */}
      {confirm && (() => {
        const c = CONFIRM_COPY[confirm.intent];
        const noun = cfg.noun;
        const cancelLabel = confirm.intent === "add" ? "Cancel" : "No";
        return (
          <ConfirmModal
            title={`${c.verb} ${noun}`}
            message={`Are you sure you want to ${c.verb.toLowerCase()} this ${noun.toLowerCase()}?`}
            confirmLabel={`Yes, ${c.verb}`} confirmIcon={c.icon} cancelLabel={cancelLabel}
            onConfirm={commit} onClose={() => setConfirm(null)} />
        );
      })()}

      {/* Phase 4: toast */}
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      {orgTree && <OrgTreeModal units={data["Branches/Units"] || []} onClose={() => setOrgTree(false)} />}
      <TweaksLayer />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
