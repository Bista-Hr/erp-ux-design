// BISTA HR · shared/PncPermissions — request-level permission checks for People & Culture
// cycles (Promotions / Transfers / Job Title), mirroring the production rule set:
//   · the INITIATOR (createdBy) can edit / correct / resubmit — but can NEVER approve,
//     reject or return their own request;
//   · the APPROVER can approve / reject / return — but can NEVER edit the request;
//   · the SUBJECT (the employee the request is about) can do NONE of those, even if they
//     would otherwise qualify as initiator or approver.
// The demo ships three actors so every side of the rule is demoable live via <PncActorSwitch/>
// (rendered in each P&C PageHeader). Swap `usePncActor` for the real signed-in user + API
// permission flags when transitioning to the codebase.

const PNC_ACTORS = [
  { id: "pcbp",    name: "Peter Bosrotsi", email: "pybosrotsi@gcb.com.gh", role: "P&CBP",     canCreate: true,  canDecide: false },
  { id: "head-pc", name: "Angela Osei",    email: "aosei@gcb.com.gh",      role: "Head P&C",  canCreate: false, canDecide: true },
  { id: "subject", name: "Bright Manu",    email: "bmanu@gcb.com.gh",      role: "Employee",  canCreate: false, canDecide: false },
];
window.HRStores = window.HRStores || {};
window.HRStores.pncActor = window.HRStores.pncActor || makeStore({ actorId: "pcbp" });

const pncCurrentActor = () => PNC_ACTORS.find(a => a.id === window.HRStores.pncActor.get().actorId) || PNC_ACTORS[0];
function usePncActor() {
  useStore(window.HRStores.pncActor);
  return pncCurrentActor();
}

// Per-record capabilities. `createdBy` defaults to Peter Bosrotsi (the P&CBP) for legacy
// seed records that predate the field.
function pncPermsFor(actor, record) {
  const isSubject = (record.employees || []).includes(actor.name);
  const isInitiator = (record.createdBy || "Peter Bosrotsi") === actor.name;
  const isApprover = actor.canDecide || (record.approvers || []).includes(actor.name);
  return {
    isSubject, isInitiator, isApprover,
    canEdit: isInitiator && !isSubject,                     // edit / correct / resubmit / draft
    canDecide: isApprover && !isInitiator && !isSubject,    // approve / reject / return
  };
}

// "Acting as" switcher — compact control for the P&C PageHeader actions row.
const pncActorLabel = (a) => `${a.name} — ${a.role}`;
function PncActorSwitch() {
  const actor = usePncActor();
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, marginRight: 4 }}>
      <span style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--gray-400)", whiteSpace: "nowrap" }}>Acting as</span>
      <span style={{ width: 236, display: "inline-block" }}>
        <Combobox value={pncActorLabel(actor)} icon="user-3-line"
          onChange={(v) => { const a = PNC_ACTORS.find(x => pncActorLabel(x) === v); if (a) window.HRStores.pncActor.set({ actorId: a.id }); }}
          options={PNC_ACTORS.map(pncActorLabel)} placeholder="Select actor" />
      </span>
    </span>
  );
}

// Small "view only" chip for detail headers when the actor can neither edit nor decide.
function PncViewOnlyChip({ perms }) {
  if (perms.canEdit || perms.canDecide) return null;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "var(--gray-50)", border: "1px solid var(--gray-200)", color: "var(--gray-500)", borderRadius: 999, padding: "3px 10px", fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 12 }}>
      <Icon name="eye-line" size={13} color="var(--gray-400)" />
      View only{perms.isSubject ? " — you are the subject of this request" : ""}
    </span>
  );
}

Object.assign(window, { PNC_ACTORS, pncCurrentActor, usePncActor, pncPermsFor, PncActorSwitch, PncViewOnlyChip });
