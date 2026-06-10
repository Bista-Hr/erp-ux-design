// BISTA HR · target/TargetRequests — self-service quarterly Target Appraisal area.
//   LANDING : 4 quarterly cards (status pill + tinted 3D clipboard + action) + rail
//   WIZARD  : multi-step Target Assessment builder (Cancel → "Cancel Assessment" confirm)
//   DETAILS : read-only Assessment Details (reached from a submitted card / after submit)
// Breadcrumb replaces the dashboard tabs while in the wizard/details (via onSubPage).
const { useState: useTR, useEffect: useTREffect } = React;

// 3D clipboard recolored to the status tint via luminosity blend over a solid color
function ClipboardArt({ tint }) {
  return (
    <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", background: CLIP_TINT[tint] || CLIP_TINT.lavender, aspectRatio: "16 / 8" }}>
      <img src="../../assets/clipboard-3d.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", mixBlendMode: "luminosity" }} />
    </div>
  );
}

function AppraisalCard({ card, onAction }) {
  const st = TARGET_STATUS[card.status];
  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: 16, display: "flex", flexDirection: "column" }}>
      <ClipboardArt tint={st.tint} />
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

function TargetLanding({ cards, onAction }) {
  return (
    <div className="tgt-cards">
      {cards.map(c => <AppraisalCard key={c.id} card={c} onAction={onAction} />)}
    </div>
  );
}

function TargetRequests({ onToast, onViewAnnouncements, onOpenAnnouncement, onSubPage }) {
  const [cards, setCards] = useTR(TARGET_CARDS);
  const [subs, setSubs] = useTR({});            // cardId → submitted perspectives data
  const [view, setView] = useTR({ name: "landing" }); // {name:'landing'} | {name:'wizard', card, step} | {name:'details', card}
  const [confirm, setConfirm] = useTR(null);     // {kind:'cancel'|'complete', data?}

  // breadcrumb replaces the dashboard tabs while in a sub-view
  useTREffect(() => {
    if (!onSubPage) return;
    if (view.name === "wizard") onSubPage({ trail: [{ label: "Target Requests", onClick: () => setView({ name: "landing" }) }, { label: "Target Assessment" }] });
    else if (view.name === "details") onSubPage({ trail: [{ label: "Target Requests", onClick: () => setView({ name: "landing" }) }, { label: "Details" }] });
    else onSubPage(null);
    return () => onSubPage(null);
  }, [view]);

  const openAction = (card) => {
    if (card.status === "submitted") setView({ name: "details", card });
    else setView({ name: "wizard", card, step: 0 });
  };
  const completeWizard = (data) => {
    const card = view.card;
    setSubs(s => ({ ...s, [card.id]: data }));
    setCards(cs => cs.map(c => c.id === card.id ? { ...c, status: "submitted" } : c));
    setView({ name: "details", card });
    onToast("Assessment Submitted", { tone: "success" });
  };

  let main;
  if (view.name === "wizard") {
    main = <AssessmentWizard card={view.card} initialStep={view.step} onCancel={() => setConfirm({ kind: "cancel" })} onSubmit={completeWizard} />;
  } else if (view.name === "details") {
    const data = subs[view.card.id] || PERSPECTIVES.map(() => blankPerspective());
    main = <AssessmentDetails card={view.card} perspectives={data} onEdit={(step) => setView({ name: "wizard", card: view.card, step })} />;
  } else {
    main = <TargetLanding cards={cards} onAction={openAction} />;
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

Object.assign(window, { TargetRequests, AppraisalCard, ClipboardArt, TargetLanding });
