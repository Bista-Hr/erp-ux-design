// BISTA HR · engagement/disciplinary/Disciplinary — HR Management ▸ Employee Engagement ▸ Disciplinary Cycle.
// Implements DisciplinaryPageClient + DisciplinaryComponent + CreateCaseForm + ImplicatedEmployeeSelector
// + CaseAttachmentsUploader + DisciplinaryStageStepper + StandardCaseDetailsView.
//   List   : Reports | Pending Decisions tabs → columns (Date Created, Theme, Case Number, Department,
//            Implicated Employees, Report Stage, ⋯ View Details) + Show-Filter panel + "Create a case".
//   Create : full-page form → "Submit Report" confirm → toast → new Investigation-stage case.
//   Details: DisciplinaryStageStepper + read-only StandardCaseDetailsView (the stage-specific
//            Investigation / Hearing / Decision step views are pending and will slot in here).
const { useState: useDisc, useEffect: useDiscEffect } = React;

let DISC_SEQ = 800;
const discId = () => `case-${++DISC_SEQ}`;
const discFmt = (d) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "N/A");

/* ---------- report-stage badge (white pill, gray text, colored glyph) ---------- */
const STAGE_GLYPH = {
  investigation: { icon: "time-line", color: "var(--gray-500)", label: "Investigation" },
  hearing:       { icon: "time-line", color: "#F97316", label: "Hearing" },
  completed:     { icon: "check-line", color: "#1F8A5B", label: "Completed" },
  cancelled:     { icon: "close-line", color: "#DC2626", label: "Cancelled" },
};
function StageBadge({ stage }) {
  const c = STAGE_GLYPH[String(stage || "").toLowerCase()] || { icon: "circle-line", color: "var(--gray-400)", label: stage };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, border: "1px solid var(--gray-200)", borderRadius: 6,
      background: "#fff", padding: "3px 9px", fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 12, color: "var(--gray-600)" }}>
      <Icon name={c.icon} size={14} color={c.color} />{c.label}
    </span>
  );
}

/* ---------- overlapping implicated-employee avatars ---------- */
function AvatarStack({ employees = [], max = 3 }) {
  const shown = employees.slice(0, max);
  const extra = employees.length - shown.length;
  return (
    <div style={{ display: "inline-flex", alignItems: "center" }}>
      {shown.map((e, i) => (
        <span key={e.employeeId || i} style={{ marginLeft: i === 0 ? 0 : -8, border: "2px solid #fff", borderRadius: "50%", display: "inline-flex" }}>
          <Avatar name={e.fullName} size={30} src={e.profilePictureUrl || undefined} />
        </span>
      ))}
      {extra > 0 && <span style={{ paddingLeft: 8, fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--gray-500)" }}>+{extra}</span>}
    </div>
  );
}

/* ---------- stage stepper (mirrors DisciplinaryStageStepper) ---------- */
const DISC_STAGES = ["Report Submitted", "Disciplinary Hearing", "Investigating Report", "Decision"];
function DisciplinaryStageStepper({ currentStage }) {
  const stage = String(currentStage || "").toLowerCase();
  let idx = 1;
  if (stage.includes("decision") || stage.includes("completed")) idx = 3;
  else if (stage.includes("hearing")) idx = 2;
  else if (stage.includes("investigation")) idx = 1;
  else if (stage.includes("report") || stage.includes("submit")) idx = 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, overflowX: "auto", background: "var(--gray-50)", border: "1px solid var(--border)", borderRadius: 12, padding: 14 }}>
      {DISC_STAGES.map((s, i) => {
        const done = i < idx, cur = i === idx, last = i === DISC_STAGES.length - 1;
        const bg = done ? "#10b981" : cur ? "#ff8a00" : "#fff";
        const col = done || cur ? "#fff" : "var(--gray-400)";
        return (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 18, height: 18, borderRadius: "50%", background: bg, border: done || cur ? "0" : "1px solid var(--gray-200)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: col }}>
                {done ? <Icon name="check-line" size={11} color="#fff" /> : i + 1}
              </span>
              <span style={{ whiteSpace: "nowrap", fontFamily: "var(--font-ui)", fontSize: 14, fontWeight: cur ? 700 : 500, color: cur ? "var(--gray-900)" : "var(--gray-400)" }}>{s}</span>
            </div>
            {!last && <Icon name="arrow-right-s-line" size={18} color="var(--gray-300)" />}
          </div>
        );
      })}
    </div>
  );
}

/* ---------- implicated-employee selector (multi-select + chips) ---------- */
function ImplicatedEmployeeSelector({ employees, selectedIds, onChange, error }) {
  const opts = employees.map(e => ({ value: e.id, label: e.fullName }));
  const selected = selectedIds.map(id => employees.find(e => e.id === id)).filter(Boolean);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <MultiSelectCombobox value={selectedIds} onChange={onChange} options={opts} placeholder="Search and find employee(s)" avatar />
      {selected.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {selected.map(e => (
            <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 10, border: "1px solid var(--border)", background: "#fff",
              borderRadius: 10, padding: "8px 10px", boxShadow: "var(--shadow-input)", minWidth: 200 }}>
              <Avatar name={e.fullName} size={32} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 13, color: "var(--gray-900)" }}>{e.fullName}</div>
                <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-400)" }}>{e.designation || e.department}</div>
              </div>
              <button onClick={() => onChange(selectedIds.filter(id => id !== e.id))} style={{ border: 0, background: "none", cursor: "pointer", display: "flex", padding: 4 }}>
                <Icon name="close-line" size={16} color="var(--gray-500)" />
              </button>
            </div>
          ))}
        </div>
      )}
      {error && <span style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--error)" }}>{error}</span>}
    </div>
  );
}

/* ---------- attachments uploader (real file picker) ---------- */
function CaseAttachmentsUploader({ attachments, onChange }) {
  const inputRef = React.useRef(null);
  const add = (list) => {
    const names = Array.from(list || []).map(f => f.name);
    if (names.length) onChange([...attachments, ...names]);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <input ref={inputRef} type="file" accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.xls,.xlsx" multiple hidden
        onChange={e => { add(e.target.files); e.target.value = ""; }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <label style={{ fontFamily: "var(--font-control)", fontWeight: 500, fontSize: 14, color: "var(--gray-900)" }}>Attachments</label>
        <Button variant="stroke" size="sm" icon="upload-2-line" onClick={() => inputRef.current && inputRef.current.click()}>Upload File</Button>
      </div>
      {attachments.length === 0
        ? <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, fontStyle: "italic", color: "var(--gray-400)", margin: 0 }}>No attachments yet.</p>
        : <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {attachments.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", background: "var(--gray-50)" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 10, fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--gray-800)" }}>
                  <FileIcon name={f} size={22} />{f}
                </span>
                <button onClick={() => onChange(attachments.filter((_, j) => j !== i))} style={{ border: 0, background: "none", cursor: "pointer", display: "flex" }}>
                  <Icon name="delete-bin-6-line" size={17} color="var(--error)" />
                </button>
              </div>
            ))}
          </div>}
    </div>
  );
}

Object.assign(window, { StageBadge, AvatarStack, DisciplinaryStageStepper, ImplicatedEmployeeSelector, CaseAttachmentsUploader, discFmt, discId });
