// BISTA HR · shared/DemotionGuard — pre-submission demotion check for People & Culture flows
// (Promotions · Transfers · Job Title). Ranks job grades by their Core HR "level" (window.HR_DATA
// ["Job Grades"], falling back to the digits in the grade name) and notches by number within the
// SAME grade. If the requested (grade, notch) ranks BELOW an employee's current placement, the
// flow calls window.confirmDemotion(...) which shows DemotionWarningModal BEFORE the normal
// submit-confirm — the user chooses Proceed Anyway or Cancel.

function demotionGradeLevel(gradeName) {
  if (!gradeName) return null;
  const rows = (window.HR_DATA && window.HR_DATA["Job Grades"]) || [];
  const row = rows.find(r => r.name === gradeName);
  if (row && row.level != null && row.level !== "") { const n = +row.level; if (!isNaN(n)) return n; }
  const m = String(gradeName).match(/\d+/);
  return m ? +m[0] : null;
}
const demotionNotchNum = (notch) => { const m = String(notch || "").match(/\d+/); return m ? +m[0] : null; };

// Returns one item per affected employee: { id, name, fromGrade, fromNotch, toGrade, toNotch, kind: "grade"|"notch", delta }
function demotionCheck({ employeeIds, grade, notch }) {
  const byId = window.EMP_BY_ID || {};
  const newL = demotionGradeLevel(grade);
  if (newL == null) return [];
  const newN = demotionNotchNum(notch);
  const items = [];
  (employeeIds || []).forEach(id => {
    const e = byId[id];
    if (!e || !e.grade) return;
    const curL = demotionGradeLevel(e.grade);
    if (curL == null) return;
    const base = { id, name: e.name || id, fromGrade: e.grade, fromNotch: e.notch || "", toGrade: grade, toNotch: notch || "" };
    if (newL < curL) items.push({ ...base, kind: "grade", delta: curL - newL });
    else if (newL === curL) {
      const curN = demotionNotchNum(e.notch);
      if (curN != null && newN != null && newN < curN) items.push({ ...base, kind: "notch", delta: curN - newN });
    }
  });
  return items;
}

const demoPlacement = (g, n) => [g, n].filter(Boolean).join(" · ");
// Reusable employee-change card — the ProfileAvatar is the universal "see details" affordance
// (click the avatar → employment sheet), consistent with everywhere else in the app.
function DemotionChangeRow({ item }) {
  const chip = (text, danger) => (
    <span style={{ whiteSpace: "nowrap", fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 12, padding: "3px 10px", borderRadius: 999,
      background: danger ? "#FEF3F2" : "var(--gray-50)", border: `1px solid ${danger ? "#FECDCA" : "var(--gray-150)"}`, color: danger ? "#B42318" : "var(--gray-700)" }}>{text}</span>
  );
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, padding: "12px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
        <ProfileAvatar employeeId={item.id} name={item.name} size={34} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 13.5, color: "var(--gray-900)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</div>
          <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-400)", lineHeight: 1.3 }}>{item.id}</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {chip(demoPlacement(item.fromGrade, item.fromNotch), false)}
          <Icon name="arrow-right-line" size={14} color="var(--gray-400)" />
          {chip(demoPlacement(item.toGrade, item.toNotch), true)}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap", fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 11.5, color: "#B42318" }}>
          <Icon name="arrow-down-line" size={13} color="#B42318" />
          {item.kind === "grade" ? `${item.delta} grade level${item.delta > 1 ? "s" : ""} down` : "Same grade — lower notch"}
        </div>
      </div>
    </div>
  );
}

// Mirrors the ConfirmModal anatomy (centered icon + title + message, centered actions) with a red
// demotion treatment and a per-employee before → after breakdown.
function DemotionWarningModal({ items, noun = "request", onProceed, onCancel }) {
  const multi = items.length > 1;
  return (
    <Modal onClose={onCancel} width={580}>
      <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#FEF3F2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 4v11" stroke="#D92D20" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M6.8 10.6 12 15.8l5.2-5.2" stroke="#D92D20" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5.5 19.5h13" stroke="#D92D20" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 16, lineHeight: "24px", letterSpacing: "-0.011em", color: "#0A0D14" }}>This {noun} is a demotion</div>
            <div style={{ fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: "-0.006em", color: "#525866" }}>
              The new job grade &amp; notch rank below the current placement {multi ? `for ${items.length} of the selected employees` : "for this employee"}. Review the change before initiating this {noun}.
            </div>
          </div>
        </div>
        <div style={{ border: "1px solid var(--gray-150)", borderRadius: 10, overflow: "hidden", maxHeight: 264, overflowY: "auto" }}>
          {items.map((it, i) => (
            <div key={it.id} style={i ? { borderTop: "1px solid var(--gray-100, #F2F4F7)" } : null}><DemotionChangeRow item={it} /></div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Button variant="stroke" onClick={onCancel}>Cancel</Button>
          <button className="btn" onClick={onProceed} style={{ background: "#D92D20", color: "#fff", boxShadow: "0 1px 2px rgba(16,24,40,.05)" }}>
            <i className="ri-arrow-down-line" />Proceed Anyway
          </button>
        </div>
      </div>
    </Modal>
  );
}

// Imperative helper — renders the modal in its own root so each screen wires the guard with one
// line inside its submit handler (no extra per-screen state).
let demotionHostRoot = null;
function confirmDemotion({ items, noun, onProceed, onCancel }) {
  if (!demotionHostRoot) {
    const host = document.createElement("div");
    document.body.appendChild(host);
    demotionHostRoot = ReactDOM.createRoot(host);
  }
  const close = () => demotionHostRoot.render(null);
  demotionHostRoot.render(
    <DemotionWarningModal items={items} noun={noun}
      onProceed={() => { close(); onProceed && onProceed(); }}
      onCancel={() => { close(); onCancel && onCancel(); }} />
  );
}

Object.assign(window, { demotionCheck, confirmDemotion, DemotionWarningModal, DemotionChangeRow });
