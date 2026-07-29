// BISTA HR · dashboard/Announcements — company news.
//   <AnnouncementsRail/>   right-hand rail used on Overview / My Info (header + stack of cards)
//   <AnnouncementsPage/>   full listing grid reached via "View All" (back arrow + count + grid)
//   <AnnouncementDetail/>  single announcement reached via "Read More" (hero + full body)
// onViewAll / onOpen thread up to App, which keeps the `announce` route.
const ANN_IMGS = ["../../assets/login/slide-1.jpg", "../../assets/login/slide-2.jpg", "../../assets/login/slide-3.png"];

const ANNOUNCEMENTS = [
  { id: 1, date: "Jan 09, 2026", title: "Welcome to the HR System",
    excerpt: "Welcome aboard! We're excited to have you join our team. Please complete your profile information.",
    body: "Welcome aboard! We're excited to have you join our team and can't wait to see the impact you'll make.\n\nTo get started, please log in and complete your profile information — personal details, contact information, emergency contacts, and any documents requested by your manager. A complete profile helps HR support you faster and keeps everyone's records accurate.\n\nIf you run into any issues, reach out to the People team at people@company.com. We're here to help you settle in." },
  { id: 2, date: "Jan 09, 2026", title: "Upcoming Holiday",
    excerpt: "Reminder: The office will be closed next Friday for the national holiday. Enjoy your long weekend!",
    body: "Reminder: The office will be closed next Friday in observance of the national holiday. All teams will resume normal operations the following Monday.\n\nIf you provide a customer-facing or on-call service, please coordinate coverage with your manager ahead of time and update your status in the system.\n\nEnjoy the long weekend — you've earned it!" },
  { id: 3, date: "Jan 09, 2026", title: "Performance Review Period",
    excerpt: "The quarterly performance review period has begun. Please schedule a meeting with your manager.",
    body: "The quarterly performance review period is now open. This is your opportunity to reflect on your goals, celebrate wins, and align on priorities for the quarter ahead.\n\nPlease schedule a one-on-one with your manager before the end of the month. Come prepared with your self-assessment and any development areas you'd like to discuss.\n\nManagers: submit completed reviews through the Appraisals module by the closing date." },
  { id: 4, date: "Jan 07, 2026", title: "New Health Insurance Plan",
    excerpt: "We've upgraded our health coverage for 2026. Review the new benefits and update your beneficiaries.",
    body: "We're pleased to announce an upgraded health insurance plan for 2026 with expanded coverage, lower co-pays, and added dental and optical benefits.\n\nPlease review the updated benefits summary and confirm or update your listed beneficiaries before the enrollment window closes.\n\nA benefits Q&A session will be held in the main hall — details to follow." },
  { id: 5, date: "Jan 05, 2026", title: "Office Renovation Update",
    excerpt: "The third-floor workspace renovation is complete. New collaboration zones are now open.",
    body: "The third-floor renovation is complete! You now have access to redesigned collaboration zones, quiet focus pods, and a refreshed kitchen area.\n\nDesks have been reassigned — check the seating map at reception. Please be patient as we finish the last few touches over the coming days." },
  { id: 6, date: "Jan 02, 2026", title: "2026 Annual Staff Campaign",
    excerpt: "Our annual staff campaign kicks off this month. Get involved and help shape our culture.",
    body: "Our annual staff campaign is back! This year's theme focuses on wellbeing, growth, and community.\n\nExpect workshops, volunteering days, and team challenges throughout the quarter. Keep an eye on this space for sign-up links and event dates." },
  { id: 7, date: "Dec 28, 2025", title: "Year-End Closing Schedule",
    excerpt: "Finance has published the year-end closing timeline. Submit expenses before the deadline.",
    body: "Finance has published the year-end closing schedule. To ensure all transactions land in the correct fiscal year, please submit outstanding expense claims and purchase requests before the published cut-off.\n\nLate submissions will be processed in the new year. Reach out to finance@company.com with questions." },
  { id: 8, date: "Dec 20, 2025", title: "Holiday Party Invitation",
    excerpt: "You're invited! Join us for the end-of-year celebration at the Main Hall on Dec 19.",
    body: "You're invited to our end-of-year celebration! Join colleagues from across the company for an evening of food, music, and awards.\n\nDate: 19 December · Venue: Main Hall · Time: 6:00 PM\n\nPlease RSVP through the events page so we can plan catering. Plus-ones are welcome." },
  { id: 9, date: "Dec 15, 2025", title: "Learning & Development Catalog",
    excerpt: "New courses are live in the L&D catalog. Enroll to earn this quarter's growth credits.",
    body: "The new Learning & Development catalog is live, featuring courses in leadership, data literacy, and people management.\n\nEach employee has growth credits to spend this quarter. Browse the catalog, enroll, and track your progress from your profile." },
  { id: 10, date: "Dec 10, 2025", title: "Updated Remote Work Policy",
    excerpt: "Our flexible work policy has been refreshed. Review the new guidelines for hybrid schedules.",
    body: "Our flexible work policy has been refreshed to better support hybrid schedules and cross-team collaboration.\n\nThe updated guidelines cover core collaboration hours, equipment support, and expectations for in-office days. Please read the full policy in the Documents section and acknowledge receipt." },
].map((a, i) => ({ ...a, img: ANN_IMGS[i % ANN_IMGS.length] }));

const yellowLink = { display: "inline-flex", alignItems: "center", gap: 4, border: 0, background: "none", cursor: "pointer", padding: 0,
  fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 14, color: "var(--brand-yellow-dark)" };

// Compact card for the rail.
function AnnouncementCard({ a, onOpen }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", border: "1px solid var(--border)", borderRadius: 14, padding: 12 }}>
      <img src={a.img} alt="" style={{ width: "100%", height: 150, objectFit: "cover", borderRadius: 10, display: "block" }} />
      <div style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--gray-400)", marginTop: 14 }}>{a.date}</div>
      <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 16, color: "var(--gray-900)", marginTop: 4 }}>{a.title}</div>
      <p style={{ fontFamily: "var(--font-ui)", fontSize: 13.5, lineHeight: 1.5, color: "var(--gray-500)", margin: "8px 0 0" }}>{a.excerpt}</p>
      <button onClick={() => onOpen && onOpen(a)} style={{ ...yellowLink, marginTop: 12 }}>
        Read More <Icon name="arrow-right-s-line" size={18} color="var(--brand-yellow-dark)" />
      </button>
    </div>
  );
}

// Larger card used in the full listing grid (matches the mock).
function AnnouncementGridCard({ a, onOpen }) {
  return (
    <button onClick={() => onOpen && onOpen(a)} style={{ textAlign: "left", cursor: "pointer", display: "flex", flexDirection: "column",
      background: "#fff", border: "1px solid var(--border)", borderRadius: 16, padding: 14, transition: "border-color .15s" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--brand-yellow)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; }}>
      <img src={a.img} alt="" style={{ width: "100%", height: 200, objectFit: "cover", borderRadius: 12, display: "block" }} />
      <div style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--gray-400)", marginTop: 18 }}>{a.date}</div>
      <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 19, color: "var(--gray-900)", marginTop: 6 }}>{a.title}</div>
      <p style={{ fontFamily: "var(--font-ui)", fontSize: 14, lineHeight: 1.55, color: "var(--gray-500)", margin: "10px 0 0" }}>{a.excerpt}</p>
      <span style={{ ...yellowLink, marginTop: 16 }}>
        Read More <Icon name="arrow-right-s-line" size={18} color="var(--brand-yellow-dark)" />
      </span>
    </button>
  );
}

// Self-scrolling rail inside a white panel: the header (Announcements + View All) stays
// static while only the cards below scroll. Fills the height of its parent (which bounds it).
function AnnouncementsRail({ items = ANNOUNCEMENTS, width = 360, onViewAll, onOpen, top }) {
  // the profile-completion card rides the rail on EVERY page unless a caller overrides `top`
  const topNode = top !== undefined ? top
    : (window.ProfileCompletionCard ? <ProfileCompletionCard onGo={(sec) => window.__goMyInfo && window.__goMyInfo(sec)} /> : null);
  return (
    <React.Fragment>
    <aside className="ann-rail" style={{ width, flexShrink: 0, height: "100%", minHeight: 0, display: "flex", flexDirection: "column",
      background: "#fff", borderTop: 0, borderRadius: "0 0 16px 16px", overflow: "hidden" }}>
      {topNode && <div style={{ flexShrink: 0, padding: "16px 16px 14px", borderBottom: "1px solid var(--divider)" }}>{topNode}</div>}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px 16px", borderBottom: "1px solid var(--divider)" }}>
        <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 18, color: "var(--gray-900)" }}>Announcements</div>
        <button onClick={onViewAll} style={{ ...yellowLink, gap: 2 }}>
          View All <Icon name="arrow-right-s-line" size={18} color="var(--brand-yellow-dark)" />
        </button>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16, padding: "16px 20px 20px" }}>
        {items.map(a => <AnnouncementCard key={a.id} a={a} onOpen={onOpen} />)}
      </div>
    </aside>
    {/* small-screen floating button → opens the full announcements page */}
    <button className="ann-fab" onClick={onViewAll} aria-label="Announcements" title="Announcements">
      <Icon name="notification-3-line" size={24} color="var(--brand-ink)" />
      <span className="ann-fab-dot" />
    </button>
    </React.Fragment>
  );
}

// Full listing page (the mock): white card shell, header row with back arrow + bell +
// title + count, then a responsive 3-up grid of cards.
function AnnouncementsPage({ items = ANNOUNCEMENTS, onBack, onOpen }) {
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "22px 28px", borderBottom: "1px solid var(--divider)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={onBack} aria-label="Back" style={{ display: "inline-flex", border: 0, background: "none", cursor: "pointer", padding: 0 }}>
            <Icon name="arrow-left-line" size={22} color="var(--brand-yellow-dark)" />
          </button>
          <Icon name="notification-3-line" size={22} color="var(--brand-yellow-dark)" />
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 24, color: "var(--gray-900)" }}>Announcements</div>
        </div>
        <div style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--gray-400)" }}>{items.length} announcements</div>
      </div>
      <div className="ann-grid" style={{ padding: 28 }}>
        {items.map(a => <AnnouncementGridCard key={a.id} a={a} onOpen={onOpen} />)}
      </div>
    </div>
  );
}

// Single announcement detail page.
function AnnouncementDetail({ a, onBack }) {
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden", maxWidth: 860, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "22px 28px", borderBottom: "1px solid var(--divider)" }}>
        <button onClick={onBack} aria-label="Back" style={{ display: "inline-flex", border: 0, background: "none", cursor: "pointer", padding: 0 }}>
          <Icon name="arrow-left-line" size={22} color="var(--brand-yellow-dark)" />
        </button>
        <Icon name="notification-3-line" size={22} color="var(--brand-yellow-dark)" />
        <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 20, color: "var(--gray-900)" }}>Announcement</div>
      </div>
      <div style={{ padding: 28 }}>
        <img src={a.img} alt="" style={{ width: "100%", height: 320, objectFit: "cover", borderRadius: 14, display: "block" }} />
        <div style={{ fontFamily: "var(--font-ui)", fontSize: 13.5, color: "var(--gray-400)", marginTop: 22 }}>{a.date}</div>
        <h1 style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 30, lineHeight: 1.2, letterSpacing: "-0.01em", color: "var(--gray-900)", margin: "6px 0 0" }}>{a.title}</h1>
        <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 16 }}>
          {a.body.split("\n\n").map((para, i) => (
            <p key={i} style={{ fontFamily: "var(--font-ui)", fontSize: 16, lineHeight: 1.7, color: "var(--gray-600)", margin: 0, textWrap: "pretty" }}>{para}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ANNOUNCEMENTS, AnnouncementsRail, AnnouncementCard, AnnouncementsPage, AnnouncementDetail });
