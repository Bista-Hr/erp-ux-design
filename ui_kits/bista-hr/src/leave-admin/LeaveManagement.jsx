// BISTA HR · leave-admin/LeaveManagement — controller for the admin Leave Management
// section (HR Management ▸ Leave Management). Routes the 6 sub-tabs and owns all state,
// confirmation, and toast wiring. Receives the active `tab` + `onToast` from the app shell.
const { useState: useLM, useEffect: useLMEffect } = React;

// confirmation copy for every create / edit / archive mutation in Leave Management
const LM_CONFIRM = {
  addType:        { t: "Add Leave Type",       m: "add this leave type",        l: "Yes, Add",     i: "add-line",     c: "Cancel" },
  updateType:     { t: "Update Leave Type",    m: "update this leave type",     l: "Yes, Update",  i: "check-line",   c: "No" },
  archiveType:    { t: "Archive Leave Type",   m: "archive this leave type",    l: "Yes, Archive", i: "archive-line", c: "No" },
  saveAlloc:      { t: "Update Allocation",     m: "update this leave allocation", l: "Yes, Update", i: "check-line",   c: "No" },
  addHoliday:     { t: "Add Holiday",          m: "add this holiday",           l: "Yes, Add",     i: "add-line",     c: "Cancel" },
  updateHoliday:  { t: "Update Holiday",       m: "update this holiday",        l: "Yes, Update",  i: "check-line",   c: "No" },
  archiveHoliday: { t: "Archive Holiday",      m: "archive this holiday",       l: "Yes, Archive", i: "archive-line", c: "No" },
  createRequest:  { t: "Create Leave Request", m: "create this leave request",  l: "Yes, Create",  i: "add-line",     c: "Cancel" },
};

function LeaveManagement({ tab, onToast, onSubPage, jobGrades = [] }) {
  const [types, setTypes] = useLM(LEAVE_TYPES_DATA);
  // per-grade day overrides keyed by grade NAME; the visible allocation list is derived
  // from the live Job Grades entity so every available grade always shows up.
  const [allocDays, setAllocDays] = useLM(SEED_ALLOC_DAYS);
  const [requests, setRequests] = useLM(ADMIN_LEAVE_REQUESTS);
  const [holidays, setHolidays] = useLM(HOLIDAYS_DATA);
  const [balances] = useLM(LEAVE_BALANCES);

  // Derive one allocation row per available job grade (managed on the Job Grades page).
  const allocations = jobGrades.map(g => ({
    id: g.id, grade: g.name, code: g.code,
    days: allocDays[g.name] || DEFAULT_ALLOC_DAYS,
  }));

  // sub-views / modals
  const [typeForm, setTypeForm] = useLM(null);       // null | { initial }  (full-page)
  const [allocEdit, setAllocEdit] = useLM(null);     // alloc being edited
  const [holidayModal, setHolidayModal] = useLM(null); // null | { initial }
  const [reqDetail, setReqDetail] = useLM(null);     // request being reviewed
  const [reqCreate, setReqCreate] = useLM(false);
  const [confirm, setConfirm] = useLM(null);         // { kind, row, label... }

  // clear the full-page form when switching tabs
  useLMEffect(() => { setTypeForm(null); }, [tab]);
  // report breadcrumb to the shell so it replaces the horizontal tab menu while a
  // full-page sub-view (create / edit leave type) is open
  useLMEffect(() => {
    if (!onSubPage) return;
    if (tab === "Leave Types" && typeForm) {
      onSubPage({ trail: [{ label: "Leave Types", onClick: () => setTypeForm(null) }, { label: typeForm.initial ? "Edit" : "New" }] });
    } else {
      onSubPage(null);
    }
    return () => onSubPage(null);
  }, [tab, typeForm]);

  // ----- mutations: every create / edit / save stages a confirmation, then commits + toasts -----
  const submitType = (form) => setConfirm({ kind: typeForm.initial ? "updateType" : "addType", form });
  const saveAlloc = (updated) => setConfirm({ kind: "saveAlloc", payload: updated });
  const submitHoliday = (form) => setConfirm({ kind: holidayModal.initial ? "updateHoliday" : "addHoliday", form });
  const createRequest = (form) => setConfirm({ kind: "createRequest", form });

  // ----- requests: approve / reject act immediately (with success/error toast) -----
  const setReqStatus = (req, status) => {
    setRequests(rs => rs.map(r => r.id === req.id ? { ...r, status } : r));
    setReqDetail(null);
    onToast(status === "approved" ? "Leave Approved" : "Leave Rejected", { tone: status === "approved" ? "success" : "error" });
  };

  // ----- commit the staged confirmation -----
  const runConfirm = () => {
    const c = confirm;
    if (c.kind === "addType") { setTypes(t => [{ id: ladmId(), docsAfter: null, ...c.form }, ...t]); onToast("Leave Type Added", { tone: "success" }); setTypeForm(null); }
    else if (c.kind === "updateType") { setTypes(t => t.map(x => x.id === typeForm.initial.id ? { ...x, ...c.form } : x)); onToast("Leave Type Updated", { tone: "success" }); setTypeForm(null); }
    else if (c.kind === "archiveType") { setTypes(t => t.filter(x => x.id !== c.row.id)); onToast("Leave Type Archived", { tone: "error" }); }
    else if (c.kind === "saveAlloc") { setAllocDays(m => ({ ...m, [c.payload.grade]: c.payload.days })); onToast("Allocation Updated", { tone: "success" }); setAllocEdit(null); }
    else if (c.kind === "addHoliday") { setHolidays(h => [{ id: ladmId(), ...c.form }, ...h]); onToast("Holiday Created", { tone: "success" }); setHolidayModal(null); }
    else if (c.kind === "updateHoliday") { setHolidays(h => h.map(x => x.id === holidayModal.initial.id ? { ...x, ...c.form } : x)); onToast("Holiday Updated", { tone: "success" }); setHolidayModal(null); }
    else if (c.kind === "archiveHoliday") { setHolidays(h => h.filter(x => x.id !== c.row.id)); onToast("Holiday Archived", { tone: "error" }); }
    else if (c.kind === "createRequest") { const f = c.form; setRequests(rs => [{ id: ladmId(), name: ME?.name || "New Employee", type: f.type, start: f.start, end: f.end, days: f.days, status: "pending", reason: f.notes || f.type, reliever: f.reliever }, ...rs]); onToast("Leave Request Created", { tone: "success" }); setReqCreate(false); }
    setConfirm(null);
  };

  let body;
  if (tab === "Leave Types") {
    body = typeForm
      ? <LeaveTypeForm initial={typeForm.initial} onBack={() => setTypeForm(null)} onSubmit={submitType} />
      : <LeaveTypesTable rows={types} onCreate={() => setTypeForm({ initial: null })}
          onEdit={(r) => setTypeForm({ initial: r })} onArchive={(r) => setConfirm({ kind: "archiveType", row: r })} />;
  } else if (tab === "Leave Allocations") {
    body = <LeaveAllocationsView allocations={allocations} onEdit={setAllocEdit} />;
  } else if (tab === "Leave Requests") {
    body = <AdminLeaveRequestsView rows={requests} onCreate={() => setReqCreate(true)} onOpen={setReqDetail}
      onApprove={(r) => setReqStatus(r, "approved")} onReject={(r) => setReqStatus(r, "rejected")} />;
  } else if (tab === "Leave Recalls") {
    body = <LeaveRecallsView onToast={onToast} />;
  } else if (tab === "Holidays") {
    body = <HolidaysView rows={holidays} onCreate={() => setHolidayModal({ initial: null })}
      onEdit={(r) => setHolidayModal({ initial: r })} onArchive={(r) => setConfirm({ kind: "archiveHoliday", row: r })} />;
  } else if (tab === "Leave Balances") {
    body = <LeaveBalancesView rows={balances} onToast={onToast} />;
  } else {
    body = <LeaveRecallsView onToast={onToast} />;
  }

  return (
    <React.Fragment>
      <div className="leave-admin">{body}</div>

      {allocEdit && <EditAllocationModal alloc={allocEdit} onClose={() => setAllocEdit(null)} onSave={saveAlloc} />}
      {holidayModal && <HolidayModal initial={holidayModal.initial} onClose={() => setHolidayModal(null)} onSubmit={submitHoliday} />}
      {reqDetail && <LeaveRequestDetail req={reqDetail} onClose={() => setReqDetail(null)}
        onApprove={(r) => setReqStatus(r, "approved")} onReject={(r) => setReqStatus(r, "rejected")} />}
      {reqCreate && <CreateLeaveRequestModal onClose={() => setReqCreate(false)} onSubmit={createRequest} />}
      {confirm && (() => {
        const c = LM_CONFIRM[confirm.kind];
        return (
          <ConfirmModal
            title={c.t} message={`Are you sure you want to ${c.m}?`}
            confirmLabel={c.l} confirmIcon={c.i} cancelLabel={c.c}
            onConfirm={runConfirm} onClose={() => setConfirm(null)} />
        );
      })()}
    </React.Fragment>
  );
}

Object.assign(window, { LeaveManagement });
