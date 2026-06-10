// BISTA HR · appraisal/Appraisals — self-service quarterly Employee Appraisal area.
//   LANDING : 4 quarterly cards (photo art tinted by status) + announcements rail
//   WIZARD  : multi-step scoring (AppraisalScoring) — Cancel → "Cancel Assessment" confirm
//   DETAILS : read-only Assessment Details (Objective / Behavioural Scores tabs)
const { useState: useAP, useEffect: useAPEffect } = React;

// professional photo recolored to the status tint (active = natural full colour)
function PhotoArt({ tint }) {
  const blend = tint !== "natural";
  return (
    <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", background: blend ? APP_PHOTO_TINT[tint] : "#1a1a1a", aspectRatio: "16 / 8" }}>
      <img src="../../assets/appraisal-photo.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", mixBlendMode: blend ? "luminosity" : "normal" }} />
    </div>
  );
}

function AppraisalCard({ card, onAction }) {
  const st = APP_STATUS[card.status];
  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: 16, display: "flex", flexDirection: "column" }}>
      <PhotoArt tint={st.tint} />
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
        <StatusBadge variant={st.variant} text={st.text} size="sm" />
        <span style={{ color: "var(--gray-300)" }}>•</span>
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 13.5, color: "var(--gray-500)" }}>{card.year}</span>
        {card.due && <React.Fragment>
          <span style={{ color: "var(--gray-300)" }}>•</span>
          <span style={{ fontFamily: "var(--font-ui)", fontSize: 13.5, color: "var(--gray-500)", whiteSpace: "nowrap" }}>To be completed before: <strong style={{ color: "var(--error)" }}>{card.due}</strong></span>
        </React.Fragment>}
      </div>
      <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 19, color: "var(--gray-900)", marginTop: 12 }}>{card.title}</div>
      <p style={{ fontFamily: "var(--font-ui)", fontSize: 14, lineHeight: 1.55, color: "var(--gray-500)", margin: "8px 0 0" }}>{card.desc}</p>
      <div style={{ marginTop: 16 }}>
        {st.disabled
          ? <button disabled style={{ width: "100%", border: 0, borderRadius: 10, padding: "12px", background: "var(--gray-100)", color: "var(--gray-400)",
              fontFamily: "var(--font-control)", fontWeight: 600, fontSize: 14, cursor: "not-allowed" }}>{st.cta}</button>
          : <Button variant={card.status === "submitted" ? "stroke" : "primary"} style={{ width: "100%" }} onClick={() => onAction(card)}>{st.cta}</Button>}
      </div>
    </div>
  );
}

function Appraisals({ onToast, onViewAnnouncements, onOpenAnnouncement, onSubPage }) {
  const [cards, setCards] = useAP(APP_CARDS);
  const [subs, setSubs] = useAP({});            // cardId → { scores, behavioural }
  const [view, setView] = useAP({ name: "landing" });
  const [confirm, setConfirm] = useAP(null);

  useAPEffect(() => {
    if (!onSubPage) return;
    if (view.name === "wizard") onSubPage({ trail: [{ label: "Appraisals", onClick: () => setView({ name: "landing" }) }, { label: "Assessment" }] });
    else if (view.name === "details") onSubPage({ trail: [{ label: "Appraisals", onClick: () => setView({ name: "landing" }) }, { label: "Details" }] });
    else onSubPage(null);
    return () => onSubPage(null);
  }, [view]);

  const openAction = (card) => card.status === "submitted" ? setView({ name: "details", card }) : setView({ name: "wizard", card, step: 0 });
  const completeWizard = ({ scores, behavioural }) => {
    const card = view.card;
    setSubs(s => ({ ...s, [card.id]: { scores, behavioural } }));
    setCards(cs => cs.map(c => c.id === card.id ? { ...c, status: "submitted" } : c));
    setView({ name: "details", card });
    onToast("Appraisal Submitted", { tone: "success" });
  };

  let main;
  if (view.name === "wizard") {
    main = <AppraisalScoring card={view.card} initialStep={view.step} onCancel={() => setConfirm({ kind: "cancel" })} onSubmit={completeWizard} />;
  } else if (view.name === "details") {
    const sub = subs[view.card.id] || { scores: APP_PERSPECTIVES.map(() => blankAppPerspective()), behavioural: seedBehavioural() };
    main = <AppraisalDetails card={view.card} scores={sub.scores} behavioural={sub.behavioural} onEdit={(step) => setView({ name: "wizard", card: view.card, step })} />;
  } else {
    main = <div className="tgt-cards">{cards.map(c => <AppraisalCard key={c.id} card={c} onAction={openAction} />)}</div>;
  }

  return (
    <div style={{ display: "flex", gap: 24, height: "100%", padding: "0 0 0 32px", boxSizing: "border-box" }}>
      <div style={{ flex: 1, minWidth: 0, height: "100%", overflowY: "auto", paddingRight: 4 }}>
        <div style={{ paddingTop: 24, paddingBottom: 72 }}>
          {main}
        </div>
      </div>
      <AnnouncementsRail onViewAll={onViewAnnouncements} onOpen={onOpenAnnouncement} />

      {confirm && confirm.kind === "cancel" && (
        <ConfirmModal title="Cancel Assessment"
          message="Cancelling this assessment will save your progress automatically as a draft."
          confirmLabel="Yes, Proceed" cancelLabel="Cancel"
          onConfirm={() => { setConfirm(null); setView({ name: "landing" }); onToast("Saved as draft"); }}
          onClose={() => setConfirm(null)} />
      )}
    </div>
  );
}

Object.assign(window, { Appraisals, AppraisalCard, PhotoArt });
