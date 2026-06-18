// BISTA HR · learning/LearningSection — router for the Learning & Development nav section.
// Maps the active L&D tab to its full flow, exactly like PerformanceSection. Cross-tab deep-link:
// Catalog "Enroll Learners" stashes a program id on window.__ldEnrollIntent and switches to the
// Enrollment tab via onTab; Enrollment consumes it on mount.
function LearningSection({ page, onToast, onSubPage, onTab }) {
  switch (page) {
    case "Needs Assessment":
      return <NeedsAssessmentScreen onToast={onToast} onSubPage={onSubPage} />;
    case "Program Catalog":
      return <ProgramCatalogScreen onToast={onToast} onSubPage={onSubPage}
        onEnrollProgram={(id) => { window.__ldEnrollIntent = id; onTab && onTab("Enrollment"); }} />;
    case "Enrollment":
      return <EnrollmentScreen onToast={onToast} onSubPage={onSubPage}
        enrollProgramId={window.__ldEnrollIntent} onConsumeEnroll={() => { window.__ldEnrollIntent = null; }} />;
    case "Evaluation":
      return <EvaluationScreen onToast={onToast} onSubPage={onSubPage} />;
    case "Courses":
      return <CoursesScreen onToast={onToast} onSubPage={onSubPage} />;
    case "Analytics":
      return <AnalyticsScreen onToast={onToast} />;
    default:
      return <InfoPage title={page} />;
  }
}

Object.assign(window, { LearningSection });
