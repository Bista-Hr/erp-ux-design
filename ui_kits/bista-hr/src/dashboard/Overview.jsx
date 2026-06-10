// BISTA HR · dashboard/Overview — self-service landing: greeting + tip, hero video,
// mission/vision/values, on-leave & new-employee people stacks, events & celebrations,
// plus the reusable AnnouncementsRail on the right.
function AvatarStack({ names, max = 7 }) {
  const shown = names.slice(0, max);
  const extra = names.length - shown.length;
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {shown.map((n, i) => (
        <span key={i} style={{ marginLeft: i === 0 ? 0 : -10, border: "2px solid #fff", borderRadius: "50%", display: "inline-flex" }}>
          <Avatar name={n} size={36} />
        </span>
      ))}
      {extra > 0 && (
        <span style={{ marginLeft: -10, width: 36, height: 36, borderRadius: "50%", border: "2px solid #fff", background: "var(--gray-100)",
          display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 12, color: "var(--gray-600)" }}>+{extra}</span>
      )}
    </div>
  );
}

const SWIRL = "radial-gradient(120% 140% at 100% 0%, rgba(255,216,0,.10), transparent 45%), radial-gradient(120% 140% at 0% 100%, rgba(229,72,77,.05), transparent 50%)";

function SectionCard({ title, children, onViewAll, pad = 24 }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: pad }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 19, color: "var(--gray-900)" }}>{title}</div>
        {onViewAll && (
          <button onClick={onViewAll} style={{ display: "inline-flex", alignItems: "center", gap: 2, border: 0, background: "none", cursor: "pointer",
            fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 14, color: "var(--brand-yellow-dark)" }}>
            View All <Icon name="arrow-right-s-line" size={18} color="var(--brand-yellow-dark)" />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function PeopleGroups({ groups }) {
  return (
    <div style={{ borderRadius: 12, overflow: "hidden" }}>
      {groups.map((g, i) => (
        <div key={g.label} style={{ display: "flex", flexDirection: "column", gap: 12, padding: "16px 18px", background: i % 2 ? "var(--brand-yellow-tint)" : "var(--gray-50)" }}>
          <span style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--gray-500)" }}>{g.label}</span>
          <AvatarStack names={g.people} />
        </div>
      ))}
    </div>
  );
}

// Card with a faded background image kept INSIDE an inset frame, so a clean white
// border shows around the artwork (used by Tip for the Week + Mission/Vision/Values).
function FadedCard({ image, opacity = 0.3, bg = "#fff", mask, position = "center", children }) {
  return (
    <div style={{ position: "relative", overflow: "hidden", background: bg, borderRadius: 16, padding: 24 }}>
      <div style={{ position: "absolute", inset: 8, borderRadius: 11, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${image})`, backgroundSize: "cover", backgroundPosition: position, opacity,
          ...(mask ? { WebkitMaskImage: mask, maskImage: mask } : {}) }} />
      </div>
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}

// Mission / Vision / Values — faint pink paper-ribbon swirl, framed by inner white padding.
function ValueCard({ title }) {
  return (
    <FadedCard image="../../assets/pink-swirl-bg.png" opacity={0.28} position="right center"
      mask="linear-gradient(90deg, transparent 0%, rgba(0,0,0,.35) 45%, #000 100%)">
      <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 18, color: "var(--brand-yellow-dark)", marginBottom: 12 }}>{title}</div>
      <p style={{ fontFamily: "var(--font-ui)", fontSize: 14.5, lineHeight: 1.6, color: "var(--gray-600)", margin: 0, maxWidth: "68%" }}>
        <strong style={{ color: "var(--gray-800)" }}>Remember:</strong> even your procrastination has potential—just nudge it a little and call it progress!
      </p>
    </FadedCard>
  );
}

function EventRow({ icon, title, meta, tint }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 12, background: tint || "var(--gray-50)" }}>
      <span style={{ width: 40, height: 40, borderRadius: 10, background: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon name={icon} size={20} color="var(--brand-yellow-dark)" />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 14, color: "var(--gray-900)" }}>{title}</div>
        <div style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--gray-400)", marginTop: 1 }}>{meta}</div>
      </div>
    </div>
  );
}

function Overview({ onViewAnnouncements, onOpenAnnouncement }) {
  const leave = [
    { label: "Today", people: ["Kofi Owusu", "Ama Serwaa", "Yaw Boateng"] },
    { label: "Tomorrow", people: ["Akua Mensah", "Kojo Asante", "Esi Darko", "Nana Adjei", "Abena Sika", "Kwame Tetteh", "Adwoa Owusu", "Yaa Asantewaa", "Kofi Mensah", "Ama Owusu"] },
  ];
  const joiners = [
    { label: "Today", people: ["Linda Quaye", "Michael Tetteh", "Grace Anane"] },
    { label: "Yesterday", people: ["Daniel Boateng", "Patience Owusu", "Sam Addo", "Ruth Mensah", "Joel Nyarko", "Vida Asare", "Eric Danso", "Comfort Owusu", "Nii Lamptey", "Akosua Boateng"] },
  ];
  return (
    <div style={{ display: "flex", gap: 24, height: "100%", padding: "0 0 0 32px", boxSizing: "border-box" }}>
      <div style={{ flex: 1, minWidth: 0, height: "100%", overflowY: "auto" }}>
        <div className="dash-scroll" style={{ display: "flex", flexDirection: "column", gap: 24, padding: "24px 4px 48px 0" }}>
        {/* greeting + tip | hero (hero goes full width in a narrow container) */}
        <div className="dash-hero">
          <div className="dash-greet">
            <div style={{ background: "#fff", borderRadius: 16, padding: 24 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 17, color: "var(--gray-900)" }}>Friday, 14th Nov, 2025</div>
                  <div style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--gray-400)", marginTop: 2 }}>11:16 AM GMT</div>
                </div>
                <img src="https://cdn.jsdelivr.net/npm/@bybas/weather-icons@2.0.0/production/fill/all/partly-cloudy-day.svg"
                  alt="Partly cloudy" width={58} height={58} style={{ display: "block", flexShrink: 0 }} />
              </div>
              <div style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 38, lineHeight: 1.1, letterSpacing: "-0.02em", color: "var(--gray-900)", marginTop: 28 }}>Hi there,</div>
              <div style={{ fontFamily: "var(--font-ui)", fontSize: 16, color: "var(--gray-500)", marginTop: 6 }}>Track and manage your activities</div>
            </div>
            <FadedCard image="../../assets/oil-droplet-bg.png" opacity={0.32} bg="#FEFBF0" position="center"
              mask="radial-gradient(120% 110% at 70% 45%, #000 30%, rgba(0,0,0,.5) 62%, transparent 90%)">
              <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 18, color: "var(--brand-yellow-dark)", marginBottom: 10 }}>Tip for the Week</div>
              <p style={{ fontFamily: "var(--font-ui)", fontSize: 14.5, lineHeight: 1.6, color: "var(--gray-600)", margin: 0 }}>
                <strong style={{ color: "var(--gray-800)" }}>Remember:</strong> even your procrastination has potential—just nudge it a little and call it progress!
              </p>
            </FadedCard>
          </div>
          {/* hero */}
          <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", minHeight: 360 }}>
            <img src="../../assets/login/slide-2.jpg" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,.05), rgba(0,0,0,.55))" }} />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(255,255,255,.18)", border: "2px solid rgba(255,255,255,.9)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(2px)" }}>
                <Icon name="play-fill" size={32} color="#fff" />
              </span>
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "0 36px 32px", textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 26, color: "#fff", letterSpacing: "-0.01em" }}>Put people at the heart of your business.</div>
              <div style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "rgba(255,255,255,.88)", marginTop: 8, maxWidth: 560, marginInline: "auto" }}>
                From onboarding to performance reviews, our HRM software helps you manage your team with care, clarity, and efficiency.
              </div>
            </div>
          </div>
        </div>

        {/* mission / vision / values */}
        <div className="dash-3">
          <ValueCard title="Our Mission" /><ValueCard title="Our Vision" /><ValueCard title="Core Values" />
        </div>

        {/* people stacks */}
        <div className="dash-2">
          <SectionCard title="Employees On Leave" onViewAll={() => {}}><PeopleGroups groups={leave} /></SectionCard>
          <SectionCard title="New Employee" onViewAll={() => {}}><PeopleGroups groups={joiners} /></SectionCard>
        </div>

        {/* events / celebrations */}
        <div className="dash-2">
          <SectionCard title="Annual Company Events" onViewAll={() => {}}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <EventRow icon="calendar-event-line" title="End of Year Party" meta="19 Dec, 2025 · Main Hall" tint="var(--brand-yellow-tint)" />
              <EventRow icon="calendar-event-line" title="Town Hall Meeting" meta="05 Dec, 2025 · Auditorium" />
              <EventRow icon="calendar-event-line" title="Founders' Day" meta="28 Nov, 2025 · Head Office" />
            </div>
          </SectionCard>
          <SectionCard title="Upcoming Celebrations" onViewAll={() => {}}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <EventRow icon="cake-2-line" title="Ama Serwaa · Birthday" meta="Tomorrow" tint="#FFF3F3" />
              <EventRow icon="award-line" title="Kofi Owusu · 5 Year Anniversary" meta="16 Nov, 2025" />
              <EventRow icon="cake-2-line" title="Esi Darko · Birthday" meta="18 Nov, 2025" />
            </div>
          </SectionCard>
        </div>
        </div>
      </div>

      <AnnouncementsRail onViewAll={onViewAnnouncements} onOpen={onOpenAnnouncement} />
    </div>
  );
}

Object.assign(window, { Overview });
