// BISTA HR · screens/Login — domain-entry screen with auto-swiping yellow carousel.
const LOGIN_SLIDES = [
  {
    img: "../../assets/login/slide-1.jpg",
    title: "BISTA HR & Workforce Management",
    body: "Manage recruitment, onboarding, promotions, transfers, and employee relations\u2014all in one streamlined platform. Save time and reduce manual errors with automated workflows",
  },
  {
    img: "../../assets/login/slide-2.jpg",
    title: "People-first HR, simplified",
    body: "Track leave, appraisals, and approvals in one place. Give every employee a clear, self-service experience from day one.",
  },
  {
    img: "../../assets/login/slide-3.png",
    title: "Insights that move teams forward",
    body: "Real-time dashboards on headcount, performance, and engagement\u2014so you can act with confidence and keep teams aligned.",
  },
];

function LoginScreen({ onContinue }) {
  const [domain, setDomain] = useState("");
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI(p => (p + 1) % LOGIN_SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);
  const slide = LOGIN_SLIDES[i];
  const narrow = useViewportWidth() <= 860;

  // ---- Mobile: brand panel on top, white form card full-width below ----
  if (narrow) {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "var(--brand-yellow)", overflow: "hidden" }}>
        <div style={{ flexShrink: 0, position: "relative", overflow: "hidden", padding: "52px 24px 40px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "url(../../assets/oil-droplet-bg.png)", backgroundSize: "280px",
            backgroundRepeat: "no-repeat", backgroundPosition: "center -30px", mixBlendMode: "soft-light", opacity: .7, pointerEvents: "none" }} />
          <img src="../../assets/logo/gcb-logo.svg" alt="GCB" style={{ width: 60, height: 60, position: "relative" }} />
          <div style={{ position: "relative", marginTop: 18, fontFamily: "var(--font-ui)", fontWeight: 800, fontSize: 23, lineHeight: 1.15, letterSpacing: "-0.02em", color: "var(--brand-ink)", maxWidth: 320 }}>{slide.title}</div>
          <div style={{ position: "relative", display: "flex", gap: 7, marginTop: 16 }}>
            {LOGIN_SLIDES.map((_, idx) => <span key={idx} style={{ height: 7, width: idx === i ? 22 : 7, borderRadius: 999, background: idx === i ? "var(--brand-ink)" : "rgba(16,16,16,.3)", transition: "width .4s ease" }} />)}
          </div>
        </div>
        <div style={{ flex: 1, background: "#fff", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: "36px 24px 28px", display: "flex", flexDirection: "column", boxShadow: "0 -8px 30px rgba(16,24,40,.08)" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, width: "min(416px, 100%)", margin: "0 auto", flex: 1 }}>
            <div style={{ textAlign: "center" }}>
              <div className="bh-h1" style={{ fontSize: 26 }}>Welcome</div>
              <div className="bh-body" style={{ marginTop: 6, fontSize: 15 }}>Enter your organization domain to continue</div>
            </div>
            <Field label="Organizational Domain" style={{ width: "100%" }}>
              <Input icon="building-line" placeholder="eg. Starett-ltd" value={domain} onChange={e => setDomain(e.target.value)} />
            </Field>
            <button className="btn btn-auth" onClick={onContinue}>Continue</button>
            <div style={{ marginTop: "auto", display: "flex", justifyContent: "center", gap: 20 }}>
              <button className="btn btn-ghost btn-sm">Terms of Service</button>
              <button className="btn btn-ghost btn-sm">Privacy Policy</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-split" style={{ display: "flex", height: "100%", background: "#fff" }}>
      {/* LEFT — yellow auto-swiping carousel */}
      <div className="login-carousel" style={{ flex: 1, position: "relative", overflow: "hidden", background: "var(--brand-yellow)",
        display: "flex", flexDirection: "column", justifyContent: "center", padding: "56px 64px" }}>
        <div style={{ position: "absolute", left: "-8%", top: "50%", transform: "translateY(-50%)",
          width: 600, height: 760, backgroundImage: "url(../../assets/oil-droplet-bg.png)",
          backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "center",
          mixBlendMode: "soft-light", opacity: .7, pointerEvents: "none",
          WebkitMaskImage: "radial-gradient(115% 85% at 45% 42%, #000 30%, rgba(0,0,0,.35) 62%, transparent 84%)",
          maskImage: "radial-gradient(115% 85% at 45% 42%, #000 30%, rgba(0,0,0,.35) 62%, transparent 84%)" }} />

        <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 560, margin: "0 auto" }}>
          <div style={{ overflow: "hidden", borderRadius: "var(--radius-xl)" }}>
            <div style={{ display: "flex", transition: "transform .7s cubic-bezier(.4,0,.2,1)", transform: `translateX(-${i * 100}%)` }}>
              {LOGIN_SLIDES.map((s, idx) => (
                <div key={idx} style={{ flex: "0 0 100%" }}>
                  <img src={s.img} alt="" style={{ width: "100%", display: "block", borderRadius: "var(--radius-xl)",
                    WebkitMaskImage: "radial-gradient(125% 120% at 50% 45%, #000 62%, rgba(0,0,0,.6) 82%, transparent 100%)",
                    maskImage: "radial-gradient(125% 120% at 50% 45%, #000 62%, rgba(0,0,0,.6) 82%, transparent 100%)" }} />
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 36 }}>
            <div style={{ fontFamily: "var(--font-ui)", fontWeight: 800, fontSize: 38, lineHeight: 1.08,
              letterSpacing: "-0.02em", color: "var(--brand-ink)" }}>{slide.title}</div>
            <p style={{ fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 17, lineHeight: 1.55,
              color: "rgba(16,16,16,.82)", marginTop: 16, marginBottom: 0, maxWidth: 560 }}>{slide.body}</p>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 32 }}>
            {LOGIN_SLIDES.map((_, idx) => (
              <button key={idx} onClick={() => setI(idx)} aria-label={`Go to slide ${idx + 1}`}
                style={{ height: 8, width: idx === i ? 36 : 8, borderRadius: 999, border: 0, padding: 0,
                  background: idx === i ? "var(--brand-ink)" : "rgba(16,16,16,.30)", cursor: "pointer",
                  transition: "width .4s ease, background .3s ease" }} />
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — form */}
      <div style={{ flex: 1, background: "#fff", position: "relative", display: "flex",
        flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 56 }}>
        <div style={{ width: "min(416px, 100%)", display: "flex", flexDirection: "column", gap: 30, alignItems: "center" }}>
          <img src="../../assets/logo/gcb-logo.svg" style={{ width: 72, height: 72 }} alt="GCB logo" />
          <div style={{ textAlign: "center" }}>
            <div className="bh-h1">Welcome</div>
            <div className="bh-body" style={{ marginTop: 6, fontSize: 16 }}>Enter your organization domain to continue</div>
          </div>
          <Field label="Organizational Domain" style={{ width: "100%" }}>
            <Input icon="building-line" placeholder="eg. Starett-ltd" value={domain} onChange={e => setDomain(e.target.value)} />
          </Field>
          <button className="btn btn-auth" onClick={onContinue}>Continue</button>
        </div>
        <div style={{ position: "absolute", bottom: 40, display: "flex", gap: 24 }}>
          <button className="btn btn-ghost btn-sm">Terms of Service</button>
          <button className="btn btn-ghost btn-sm">Privacy Policy</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LoginScreen });
