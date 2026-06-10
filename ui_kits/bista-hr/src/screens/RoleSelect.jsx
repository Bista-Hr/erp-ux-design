// BISTA HR · screens/RoleSelect — minimal "preview as" gate shown BEFORE login.
// A single combobox to pick the role, then continue to the normal (role-free) login.
function RoleSelectScreen({ roles = [], initial, onContinue }) {
  const [sel, setSel] = useState(initial || (roles[0] && roles[0].id));
  const options = roles.map(r => ({ value: r.id, label: r.name }));
  return (
    <div style={{ height: "100%", background: "var(--gray-75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, boxSizing: "border-box" }}>
      <div style={{ width: "min(416px, 100%)", background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)", padding: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        <img src="../../assets/logo/gcb-logo.svg" alt="GCB logo" style={{ width: 60, height: 60 }} />
        <div style={{ textAlign: "center" }}>
          <div className="bh-h1" style={{ fontSize: 26 }}>Select a role</div>
          <div className="bh-body" style={{ marginTop: 6, fontSize: 15 }}>Choose a role to preview BISTA HR with its permissions.</div>
        </div>
        <Field label="Role" style={{ width: "100%" }}>
          <Combobox value={sel} onChange={setSel} options={options} placeholder="Select a role" icon="shield-keyhole-line" />
        </Field>
        <button className="btn btn-auth" disabled={!sel} onClick={() => onContinue(sel)}>Continue</button>
      </div>
    </div>
  );
}

Object.assign(window, { RoleSelectScreen });
