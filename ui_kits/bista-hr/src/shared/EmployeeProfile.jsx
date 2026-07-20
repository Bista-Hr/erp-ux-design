// BISTA HR · shared/EmployeeProfile — ONE consistent affordance for "who is this person?":
//   ProfileAvatar             — drop-in replacement for Avatar wherever an employee id is at hand.
//                               Clicking the avatar slides in the employment-details sheet, so the
//                               client always knows what to do — no per-screen explanation needed.
//   EmployeeEmploymentDrawer  — the right-side sheet itself (same Drawer as Employee → Employment
//                               Details). Reusable standalone; the details it shows are CONFIGURABLE
//                               per call-site since each flow may need different context.
// Data resolves from EMP_BY_ID — the same employee record Core HR / payroll back in production.

// Field catalog — call-sites pick by key (fields={["staffId","reportingManager",…]}), pass custom
// { label, value } objects, or append via extraFields. Defaults cover the promotion-reference set.
const EMP_FIELD_DEFS = {
  staffId:          (e) => ({ label: "Staff ID", value: e.staffId }),
  jobTitle:         (e) => ({ label: "Job Title", value: e.title }),
  department:       (e) => ({ label: "Department", value: e.dept }),
  unit:             (e) => ({ label: "Unit", value: e.unit }),
  zone:             (e) => ({ label: "Zone", value: e.zone }),
  branch:           (e) => ({ label: "Branch", value: e.branch }),
  reportingManager: (e) => ({ label: "Reporting Manager", value: e.reportingManager }),
  dateEmployed:     (e) => ({ label: "Date Employed", value: e.dateEmployed }),
  employmentType:   (e) => ({ label: "Employment Type", value: e.employmentType }),
  yearsOfService:   (e) => ({ label: "Years of Service", value: e.yearsOfService != null ? `${e.yearsOfService} year${e.yearsOfService === 1 ? "" : "s"}` : "" }),
  status:           (e) => ({ label: "Status", value: e.isConfirmed == null ? "" : (e.isConfirmed ? "Active · Confirmed" : "Active · Not Confirmed") }),
  rating:           (e) => ({ label: "Performance Rating", value: e.rating }),
};
const EMP_FIELD_DEFAULTS = ["staffId", "jobTitle", "department", "unit", "zone", "branch", "reportingManager", "dateEmployed", "employmentType", "yearsOfService", "status", "rating"];

function EmployeeEmploymentDrawer({ employeeId, open, onClose, title = "Current Employment Details", showPlacement = true, fields, extraFields }) {
  // header avatar → reuses ProfilePictureModal as a read-only large preview (upload lives in ESS My Info only)
  const [pic, setPic] = React.useState(false);
  const e = (window.EMP_BY_ID || {})[employeeId];
  if (!open || !e) return null;
  const picked = (fields || EMP_FIELD_DEFAULTS)
    .map(f => (typeof f === "string" ? (EMP_FIELD_DEFS[f] ? EMP_FIELD_DEFS[f](e) : null) : f))
    .filter(Boolean)
    .concat(extraFields || []);
  const stat = (label, value) => (
    <div style={{ padding: "12px 16px" }}>
      <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-400)" }}>{label}</div>
      <div style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 15, color: "var(--gray-900)", marginTop: 2 }}>{value || "—"}</div>
    </div>
  );
  return (
    <Drawer open={open} onClose={onClose} title={title} icon="briefcase-4-line" width={520}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button type="button" title="Preview profile picture" onClick={() => setPic(true)}
            onMouseEnter={(ev) => { ev.currentTarget.style.boxShadow = "0 0 0 2px var(--brand-yellow)"; }}
            onMouseLeave={(ev) => { ev.currentTarget.style.boxShadow = "none"; }}
            style={{ border: 0, background: "none", padding: 0, cursor: "pointer", borderRadius: "50%", display: "inline-flex", flexShrink: 0, transition: "box-shadow .12s ease" }}>
            <Avatar name={e.name} size={44} src={e.profilePictureUrl || undefined} />
          </button>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 16, color: "var(--gray-900)" }}>{e.name}</div>
            <div style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--gray-400)", lineHeight: 1.4 }}>{[e.title, e.dept].filter(Boolean).join(" · ")}</div>
          </div>
        </div>
        {showPlacement && (
          <div style={{ border: "1px solid #F2E6A8", background: "var(--brand-yellow-tint)", borderRadius: 10,
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
            {stat("Job Grade", e.grade)}
            {stat("Notch", e.notch)}
            {stat("Monthly Salary", e.salary)}
          </div>
        )}
        <div style={{ border: "1px solid var(--gray-150)", borderRadius: 10, display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          {picked.map((f, i) => (
            <div key={f.label} style={{ padding: "12px 16px", borderTop: i > 1 ? "1px solid var(--gray-100, #F2F4F7)" : "none" }}>
              <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-400)" }}>{f.label}</div>
              <div style={{ fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 13.5, color: "var(--gray-900)", marginTop: 2 }}>{f.value || "—"}</div>
            </div>
          ))}
        </div>
      </div>
      {pic && <ProfilePictureModal previewOnly name={e.name} photo={e.profilePictureUrl || undefined}
        onClose={() => setPic(false)} />}
    </Drawer>
  );
}

// ProfileAvatar — use INSTEAD of Avatar whenever the employee id is known. Falls back to a plain
// Avatar when the id doesn't resolve (or disabled). `drawer` forwards per-context overrides:
// { title, fields, extraFields, showPlacement } — so each flow shows exactly the details it needs.
function ProfileAvatar({ employeeId, name, src, size = 36, disabled, drawer }) {
  const [open, setOpen] = React.useState(false);
  const e = (window.EMP_BY_ID || {})[employeeId];
  const display = name || (e && e.name) || "";
  const photo = src || (e && e.profilePictureUrl) || undefined;
  if (!e || disabled) return <Avatar name={display} size={size} src={photo} />;
  return (
    <React.Fragment>
      <button type="button" title={`View ${e.name}'s employment details`}
        onClick={(ev) => { ev.stopPropagation(); setOpen(true); }}
        onMouseEnter={(ev) => { ev.currentTarget.style.boxShadow = "0 0 0 2px var(--brand-yellow)"; }}
        onMouseLeave={(ev) => { ev.currentTarget.style.boxShadow = "none"; }}
        style={{ border: 0, background: "none", padding: 0, cursor: "pointer", borderRadius: "50%", display: "inline-flex", flexShrink: 0, transition: "box-shadow .12s ease" }}>
        <Avatar name={display} size={size} src={photo} />
      </button>
      {/* wrapper stops clicks inside the sheet (incl. its backdrop close) from bubbling to row handlers like table selection */}
      <span onClick={(ev) => ev.stopPropagation()}>
        <EmployeeEmploymentDrawer employeeId={employeeId} open={open} onClose={() => setOpen(false)} {...(drawer || {})} />
      </span>
    </React.Fragment>
  );
}

Object.assign(window, { EmployeeEmploymentDrawer, ProfileAvatar, EMP_FIELD_DEFS });
