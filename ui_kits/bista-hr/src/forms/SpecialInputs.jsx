// BISTA HR · forms/SpecialInputs — GhanaCardInput (GHA- prefixed masked number) and
// GpsInput (lat/long via map pick or current location). Used by the employee-info edit
// dialogs; reusable anywhere via window.
const { useState: useSI, useRef: useSIRef, useEffect: useSIEffect } = React;

/* ── GhanaCardInput — fixed GHA prefix + digits-only body, auto-hyphenated 9+1 ── */
function ghFormat(raw) {
  const d = String(raw || "").replace(/\D/g, "").slice(0, 10);
  return d.length > 9 ? d.slice(0, 9) + "-" + d.slice(9) : d;
}
function GhanaCardInput({ value, onChange, placeholder = "123456789-0", disabled }) {
  const body = ghFormat(String(value || "").replace(/^GHA-?/i, ""));
  const emit = (raw) => { const f = ghFormat(raw); onChange(f ? `GHA-${f}` : ""); };
  return (
    <div style={{ display: "flex", alignItems: "stretch", border: "1px solid var(--border)", borderRadius: "var(--radius-sm, 8px)", overflow: "hidden", background: disabled ? "var(--gray-50)" : "#fff", boxShadow: "var(--shadow-input)" }}>
      <span style={{ display: "flex", alignItems: "center", padding: "0 14px", background: "var(--gray-50)", borderRight: "1px solid var(--border)",
        fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 14, color: "var(--gray-700)", letterSpacing: ".04em" }}>GHA</span>
      <input value={body} onChange={e => emit(e.target.value)} placeholder={placeholder} disabled={disabled} inputMode="numeric"
        style={{ flex: 1, minWidth: 0, border: 0, outline: 0, padding: "10px 14px", background: "transparent",
          fontFamily: "var(--font-control)", fontSize: 14, color: "var(--gray-900)", letterSpacing: ".06em" }} />
    </div>
  );
}

/* ── Leaflet lazy loader (OpenStreetMap tiles) ── */
let _leafletP = null;
function loadLeaflet() {
  if (window.L && window.L.map) return Promise.resolve(window.L);
  if (!_leafletP) _leafletP = new Promise((res, rej) => {
    const css = document.createElement("link");
    css.rel = "stylesheet"; css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(css);
    const s = document.createElement("script");
    s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    s.onload = () => res(window.L); s.onerror = rej;
    document.head.appendChild(s);
  });
  return _leafletP;
}
const gpsParse = (v) => {
  const m = String(v || "").match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
  return m ? [parseFloat(m[1]), parseFloat(m[2])] : null;
};

function MapPickerModal({ initial, onSelect, onClose }) {
  const boxRef = useSIRef(null); const mapRef = useSIRef(null); const markRef = useSIRef(null);
  const [pick, setPick] = useSI(gpsParse(initial));
  const [ready, setReady] = useSI(false);
  const [locating, setLocating] = useSI(false);
  const [locError, setLocError] = useSI("");
  const dropPin = (lat, lng, zoom) => {
    setPick([lat, lng]);
    const L = window.L, map = mapRef.current;
    if (!L || !map) return;
    if (markRef.current) markRef.current.setLatLng([lat, lng]);
    else markRef.current = L.marker([lat, lng]).addTo(map);
    map.setView([lat, lng], zoom || map.getZoom());
  };
  // Current location: browser geolocation first; if blocked/unavailable, fall back to an
  // approximate IP-based lookup so the button always resolves something.
  const ipFallback = () => fetch("https://ipapi.co/json/").then(r => r.json()).then(d => {
    if (d && d.latitude != null) { dropPin(d.latitude, d.longitude, 13); setLocError("Approximate location (from your network) — click the map to fine-tune."); }
    else throw new Error();
  });
  const useCurrent = () => {
    setLocError(""); setLocating(true);
    const fail = () => ipFallback().catch(() => setLocError("Couldn't detect your location — allow location access or click the map.")).finally(() => setLocating(false));
    if (!navigator.geolocation) { fail(); return; }
    navigator.geolocation.getCurrentPosition(
      p => { dropPin(p.coords.latitude, p.coords.longitude, 16); setLocating(false); },
      fail,
      { timeout: 8000, enableHighAccuracy: true }
    );
  };
  useSIEffect(() => {
    let dead = false;
    loadLeaflet().then(L => {
      if (dead || !boxRef.current) return;
      const start = gpsParse(initial) || [5.6037, -0.1870]; // Accra
      const map = L.map(boxRef.current).setView(start, gpsParse(initial) ? 15 : 12);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "&copy; OpenStreetMap contributors" }).addTo(map);
      if (gpsParse(initial)) markRef.current = L.marker(start).addTo(map);
      map.on("click", (e) => {
        setPick([e.latlng.lat, e.latlng.lng]);
        if (markRef.current) markRef.current.setLatLng(e.latlng);
        else markRef.current = L.marker(e.latlng).addTo(map);
      });
      mapRef.current = map; setReady(true);
    }).catch(() => setReady(false));
    return () => { dead = true; if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, []);
  return (
    <Modal onClose={onClose} width={820} flexBody>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "20px 24px 12px", flex: "none" }}>
        <div>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 18, color: "var(--gray-900)" }}>Pick Location</div>
          <div className="bh-body" style={{ marginTop: 2 }}>Click on the map to drop a pin — we take the latitude and longitude.</div>
        </div>
        <button className="btn btn-icon btn-ghost" onClick={onClose} style={{ width: 32, height: 32, padding: 0 }}><Icon name="close-line" size={20} color="var(--gray-500)" /></button>
      </div>
      <div style={{ padding: "0 24px", flex: "1 1 auto", minHeight: 0 }}>
        <div ref={boxRef} style={{ height: 420, borderRadius: 10, overflow: "hidden", border: "1px solid var(--border)", background: "var(--gray-50)",
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          {!ready && <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--gray-400)" }}>Loading map…</span>}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 24px 20px", flex: "none" }}>
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: locError ? "#B45309" : pick ? "var(--gray-700)" : "var(--gray-400)", flex: 1, minWidth: 0 }}>
          {locError || (pick ? `${pick[0].toFixed(5)}, ${pick[1].toFixed(5)}` : "No location selected yet")}
        </span>
        <div style={{ display: "flex", gap: 10 }}>
          <Button variant="stroke" icon="focus-3-line" onClick={useCurrent}>{locating ? "Locating…" : "Use Current Location"}</Button>
          <Button variant="stroke" onClick={onClose}>Cancel</Button>
          <Button variant="primary" icon="map-pin-line" disabled={!pick} onClick={() => pick && onSelect(pick[0], pick[1])}>Use this Location</Button>
        </div>
      </div>
    </Modal>
  );
}

/* ── GpsInput — coordinates field with a "Pick on Map" suffix button (PrefixedInput-style);
   "Use Current Location" lives inside the map modal ── */
function GpsInput({ value, onChange, disabled }) {
  const [mapOpen, setMapOpen] = useSI(false);
  return (
    <div style={{ display: "flex", alignItems: "stretch", border: "1px solid var(--border)", borderRadius: "var(--radius-sm, 8px)", overflow: "hidden", background: disabled ? "var(--gray-50)" : "#fff", boxShadow: "var(--shadow-input)" }}>
      <input value={value || ""} onChange={e => onChange(e.target.value)} placeholder="Latitude, Longitude" disabled={disabled}
        style={{ flex: 1, minWidth: 0, border: 0, outline: 0, padding: "10px 14px", background: "transparent",
          fontFamily: "var(--font-control)", fontSize: 14, color: "var(--gray-900)" }} />
      <button type="button" onClick={() => !disabled && setMapOpen(true)} disabled={disabled}
        style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 14px", border: 0, borderLeft: "1px solid var(--border)",
          background: "var(--gray-50)", cursor: disabled ? "not-allowed" : "pointer",
          fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 13, color: "var(--gray-700)", whiteSpace: "nowrap" }}>
        <Icon name="road-map-line" size={16} color="var(--gray-700)" />Pick on Map
      </button>
      {mapOpen && <MapPickerModal initial={value} onClose={() => setMapOpen(false)}
        onSelect={(lat, lng) => { onChange(`${lat.toFixed(5)}, ${lng.toFixed(5)}`); setMapOpen(false); }} />}
    </div>
  );
}

Object.assign(window, { GhanaCardInput, GpsInput, MapPickerModal });
