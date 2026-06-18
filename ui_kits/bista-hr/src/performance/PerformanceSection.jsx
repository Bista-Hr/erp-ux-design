// BISTA HR · performance/PerformanceSection — router for the Performance nav section.
// Maps the active Performance tab to its full flow (list → create → detail → edit).
// Screens are added here as each flow is built; PERF_BUILT (in app.jsx) gates which
// tabs route here vs. fall back to the generic CRUD placeholder.
function PerformanceSection({ page, onToast, onSubPage, lookups }) {
  switch (page) {
    case "Department Perspectives":
      return <DeptPerspectives onToast={onToast} />;
    case "Goal Setting":
      return <GoalSetting onToast={onToast} onSubPage={onSubPage} />;
    case "Performance Appraisals":
      return <PerformanceAppraisals onToast={onToast} onSubPage={onSubPage} />;
    case "Objectives":
      return <Objectives onToast={onToast} onSubPage={onSubPage} />;
    case "IDP":
      return <Idp onToast={onToast} onSubPage={onSubPage} />;
    case "PIP":
      return <Pip onToast={onToast} onSubPage={onSubPage} />;
    case "360 Feedback":
      return <Feedback360 onToast={onToast} onSubPage={onSubPage} />;
    case "Moderation":
      return <Moderation onToast={onToast} onSubPage={onSubPage} />;
    case "Portfolio of Evidence":
      return <Evidence onToast={onToast} />;
    default:
      return <InfoPage title={page} />;
  }
}

Object.assign(window, { PerformanceSection });
