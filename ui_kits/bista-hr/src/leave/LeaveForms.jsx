// BISTA HR · leave/LeaveForms — the modals for the leave flow.
//   RequestLeaveModal — self-service "Request {Type} Leave" (Type, From, To, Reliever, Note)
//   LeavePeriodModal  — Add / Update a planned leave period (Type, From, To, Reliever, +Private Approver)
// Both raise onSubmit(form) so the controller can show the confirm phase before committing.
const { useState: useLeaveState } = React;

// date field — native picker, styled like the kit's inputs, with a calendar affordance
function DateField({ value, onChange, placeholder }) {
  return (
    <div className="input-wrap" style={{ cursor: "pointer" }}>
      <input type="date" value={value || ""} onChange={e => onChange(e.target.value)}
        style={{ flex: 1, border: 0, outline: 0, background: "transparent", fontFamily: "var(--font-control)",
          fontSize: 14, color: value ? "var(--gray-900)" : "var(--gray-400)", cursor: "pointer" }} />
      <Icon name="calendar-line" size={18} style={{ color: "var(--icon-default)" }} />
    </div>
  );
}

function ModalHeader({ title, subtitle, onClose }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "24px 24px 0" }}>
      <div>
        <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 20, lineHeight: "28px", color: "var(--gray-900)" }}>{title}</div>
        {subtitle && <div className="bh-body" style={{ marginTop: 4 }}>{subtitle}</div>}
      </div>
      <button className="btn btn-icon btn-ghost" onClick={onClose} style={{ width: 32, height: 32, padding: 0 }}>
        <Icon name="close-line" size={20} color="var(--gray-500)" />
      </button>
    </div>
  );
}

// shared Type / From / To / Reliever block (used by both modals)
function LeaveFieldsCore({ form, set, lockType }) {
  return (
    <React.Fragment>
      <Field label="Leave Type" style={{ gridColumn: "1 / -1" }}>
        {lockType
          ? <Input value={form.type} readOnly style={{ color: "var(--gray-900)" }} />
          : <Combobox value={form.type} onChange={v => set("type", v)} options={LEAVE_TYPES} placeholder="Select a leave type" />}
      </Field>
      <Field label="From"><DateField value={form.from} onChange={v => set("from", v)} /></Field>
      <Field label="To"><DateField value={form.to} onChange={v => set("to", v)} /></Field>
      <Field label="Reliever" style={{ gridColumn: "1 / -1" }}>
        <Combobox value={form.reliever} onChange={v => set("reliever", v)} options={LEAVE_PEOPLE} avatar
          placeholder="Select a staff to whom you wish to hand over" />
      </Field>
    </React.Fragment>
  );
}

// "Request {Type} Leave" — self-service single request
function RequestLeaveModal({ presetType, onClose, onSubmit }) {
  const [form, setForm] = useLeaveState({ type: presetType || "", from: "", to: "", reliever: "", note: "" });
  const set = (k, v) => setForm(s => ({ ...s, [k]: v }));
  const valid = form.type && form.from && form.to;
  const title = presetType ? `Request ${presetType}` : "Request Leave";
  return (
    <Modal onClose={onClose} width={620}>
      <ModalHeader title={title} subtitle="Fill in the details below to submit your leave request" onClose={onClose} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, padding: 24 }}>
        <LeaveFieldsCore form={form} set={set} lockType={!!presetType} />
        <Field label="Note" optional style={{ gridColumn: "1 / -1" }}>
          <Textarea placeholder="Enter a note for this request" value={form.note} onChange={e => set("note", e.target.value)} />
        </Field>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: "0 24px 24px" }}>
        <Button variant="stroke" onClick={onClose}>Cancel</Button>
        <Button variant="primary" disabled={!valid} onClick={() => valid && onSubmit({ ...form, days: leaveDays(form.from, form.to) })}>Send Request</Button>
      </div>
    </Modal>
  );
}

// Add / Update a planned leave period (annual schedule)
function LeavePeriodModal({ initial, onClose, onSubmit }) {
  const editing = !!initial;
  const [form, setForm] = useLeaveState(() => ({
    type: initial?.type || "", from: initial?.from || "", to: initial?.to || "",
    reliever: initial?.reliever || "", privateApprover: initial?.privateApprover || false,
  }));
  const set = (k, v) => setForm(s => ({ ...s, [k]: v }));
  const valid = form.type && form.from && form.to;
  return (
    <Modal onClose={onClose} width={620}>
      <ModalHeader title={editing ? "Update Leave Period" : "Add a Leave Period"}
        subtitle={editing ? "Edit the details below to update your leave period" : "Fill in the details below to submit your leave period"} onClose={onClose} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, padding: 24 }}>
        <LeaveFieldsCore form={form} set={set} />
        <div style={{ gridColumn: "1 / -1" }}>
          <Checkbox checked={form.privateApprover} onChange={v => set("privateApprover", v)} label="Private Approver" />
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: "0 24px 24px" }}>
        <Button variant="stroke" onClick={onClose}>Cancel</Button>
        <Button variant="primary" disabled={!valid} onClick={() => valid && onSubmit({ ...form, days: leaveDays(form.from, form.to) })}>
          {editing ? "Update Leave" : "Send Request"}
        </Button>
      </div>
    </Modal>
  );
}

Object.assign(window, { DateField, RequestLeaveModal, LeavePeriodModal });
