// BISTA HR · employee/ProfileCompletion — onboarding profile-completion card for the ESS
// dashboard rail. Computes a percentage across the labeled My Info sections and points the
// employee at the NEXT section to update; each row jumps straight to that section in My Info.
const PC_SECTIONS = [
  { label: "Personal Information", tab: "Personal Information", id: "sec-personal-info", items: d => d.personal.basic },
  { label: "Address Information",  tab: "Personal Information", id: "sec-address", items: d => d.personal.address },
  { label: "Identification",       tab: "Personal Information", id: "sec-identification", items: d => d.personal.identification },
  { label: "Spouse Details",       tab: "Personal Information", id: "sec-spouse", items: d => d.personal.spouse },
  { label: "Children Details",     tab: "Personal Information", id: "sec-children", list: d => d.personal.children },
  { label: "Education Details",    tab: "Personal Information", id: "sec-education", list: d => d.personal.education },
  { label: "Contact Information",  tab: "Contact Details", id: "sec-contact-info", items: d => d.contact.personal },
  { label: "Emergency Contact",    tab: "Contact Details", id: "sec-emergency-contact", list: d => d.contact.emergency },
];
const pcFilled = (v) => { const s = String(v ?? "").trim(); return s !== "" && s !== "-"; };

function profileCompletion(emp) {
  const d = buildEmployeeDetail(emp);
  const sections = PC_SECTIONS.map(s => {
    let frac;
    if (s.items) { const its = s.items(d) || []; frac = its.length ? its.filter(it => pcFilled(it.value)).length / its.length : 0; }
    else { frac = ((s.list(d) || []).length > 0) ? 1 : 0; }
    return { ...s, frac, complete: frac >= 1 };
  });
  const pct = Math.round(sections.reduce((a, s) => a + s.frac, 0) / sections.length * 100);
  return { pct, sections, pending: sections.filter(s => !s.complete) };
}

function ProfileCompletionCard({ onGo }) {
  const me = window.ME || (window.EMPLOYEES || [])[0];
  if (!me) return null;
  const { pct, sections, pending } = profileCompletion(me);
  if (pct >= 100) return null;
  const done = sections.length - pending.length;
  return (
    <div style={{ background: "var(--brand-yellow-tint, #FFF6E0)", border: "1px solid #FDE68A", borderRadius: 14, padding: "16px 18px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 15.5, color: "var(--gray-900)" }}>Complete your profile</div>
          <div style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--gray-500)", marginTop: 2 }}>{done} of {sections.length} sections complete</div>
        </div>
        <span style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 22, color: "var(--brand-yellow-dark)" }}>{pct}%</span>
      </div>
      <div style={{ height: 8, borderRadius: 999, background: "rgba(16,24,40,.08)", marginTop: 12, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 999, background: "var(--brand-yellow)", transition: "width .3s" }}></div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 14 }}>
        {pending.map((s, i) => (
          <button key={s.id} onClick={() => onGo && onGo({ tab: s.tab, id: s.id })}
            style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", border: 0, cursor: "pointer",
              background: "#fff", borderRadius: 10, padding: "10px 12px" }}>
            <Icon name="checkbox-blank-circle-line" size={16} color="var(--gray-300)" />
            <span style={{ flex: 1, minWidth: 0, fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 13.5, color: "var(--gray-900)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.label}</span>
            {i === 0 && <span style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 10.5, letterSpacing: ".04em", color: "#B45309", background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 999, padding: "2px 8px" }}>NEXT</span>}
            <Icon name="arrow-right-s-line" size={18} color="var(--brand-yellow-dark)" />
          </button>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { ProfileCompletionCard, profileCompletion });
