// BISTA HR · shared/PncRequestKit — shared plumbing for the People & Culture request cycles
// (Promotions · Transfers · Job Title). One place for:
//   1. PncApi — the mock API client + endpoint map,
//   2. pncEditTransition — the Draft / Returned → Pending transition (patch + audit + endpoint),
//   3. the form chrome every request form repeats (FormCard, AutoBadge, PncReturnedBanner,
//      PncSalaryField, PncDocsField, PncFormFooter).
//
// Endpoint contract (mirrors the production API — same shape for all three resources):
//   POST /promotions                            create (the NON-DRAFT upload endpoint)
//   PUT  /promotions/{id}                       update / returned-resubmit
//   POST /promotions/{id}/submit                SUBMIT A DRAFT — moves the record out of Draft
//   ── same for /transfers and /job-title-change-requests ──
// Draft saves persist via create/update with isDraft: true; the /submit endpoints are ONLY
// for finally submitting an existing draft (never the plain upload endpoint).

const PNC_RESOURCE = { promotion: "promotions", transfer: "transfers", jobTitle: "job-title-change-requests" };

// Mock transport — logs the request so the wiring is traceable in the console; swap the body
// of pncRequest for fetch() against the real base URL in production.
const pncRequest = (method, path, body) => {
  console.info(`[PncApi] ${method} ${path}`, body || "");
  return Promise.resolve({ ok: true, method, path, body });
};

const PncApi = {
  create:      (kind, body)     => pncRequest("POST", `/${PNC_RESOURCE[kind]}`, body),                        // non-draft upload
  update:      (kind, id, body) => pncRequest("PUT",  `/${PNC_RESOURCE[kind]}/${id}`, body),                  // edit + returned-resubmit
  saveDraft:   (kind, body)     => pncRequest("POST", `/${PNC_RESOURCE[kind]}`, { ...body, isDraft: true }),  // new draft
  updateDraft: (kind, id, body) => pncRequest("PUT",  `/${PNC_RESOURCE[kind]}/${id}`, { ...body, isDraft: true }),
  submitDraft: (kind, id, body) => pncRequest("POST", `/${PNC_RESOURCE[kind]}/${id}/submit`, body),           // draft → submitted
};

// The one status-transition rule for saving an edited request. Routes the persist call to the
// right endpoint (a DRAFT being finally submitted goes to POST /{resource}/{id}/submit; anything
// else PUTs /{resource}/{id}) and returns the record patch + audit entry the screen applies.
function pncEditTransition({ kind, id, prevStatus, payload, today, draftLabel, reason, staffId }) {
  const wasReturned = prevStatus === "Returned";
  const wasDraft = prevStatus === "Draft";
  if (wasDraft) PncApi.submitDraft(kind, id, payload);
  else PncApi.update(kind, id, payload);
  return {
    wasReturned, wasDraft,
    patch: wasReturned
      ? { status: "Pending", wfStatus: "Pending", hasBeenCorrected: true, returnedBy: "N/A", returnedAt: "N/A", returnReason: "", dateSubmitted: today, accepted: false }
      : wasDraft ? { status: "Pending", wfStatus: "Pending", dateSubmitted: today } : {},
    entry: pncEntry({
      action: wasReturned ? 6 : wasDraft ? 0 : 1,
      description: wasReturned ? "Request corrected and resubmitted for approval after return"
        : wasDraft ? `Draft submitted for approval — ${draftLabel}` : "Request details updated",
      justificationReason: reason, staffId }),
  };
}

/* ---------- shared form chrome ---------- */
function FormCard({ title, badge, children }) {
  return (
    <div className="card" style={{ padding: "var(--card-pad, 24px)", overflow: "visible" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <div className="bh-h2" style={{ fontSize: 20 }}>{title}</div>
        {badge}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>{children}</div>
    </div>
  );
}
// "Auto-populated" pill — marks the card grouping system-resolved values (grade, notch, salary).
const AutoBadge = () => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap", background: "var(--brand-yellow-tint)", border: "1px solid var(--brand-yellow)", color: "var(--gray-800)", borderRadius: 999, padding: "3px 9px", fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 11.5 }}>
    <Icon name="sparkling-2-line" size={12} color="var(--brand-yellow-dark)" />Auto-populated
  </span>
);
// The amber "Returned for correction" banner shown atop a form re-opened from a Returned record.
function PncReturnedBanner({ record }) {
  if (!record || record.status !== "Returned" || !record.returnReason) return null;
  return (
    <div className="card" style={{ padding: 0, border: "1px solid #FED7AA", background: "#FFFBEB" }}>
      <div style={{ display: "flex", gap: 12, padding: "16px 20px" }}>
        <Icon name="arrow-go-back-line" size={20} color="#D97706" style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontFamily: "var(--font-control)", fontWeight: 600, fontSize: 14, color: "var(--gray-900)" }}>Returned for correction{record.returnedBy ? ` by ${record.returnedBy}` : ""}{record.returnedAt && record.returnedAt !== "N/A" ? ` · ${record.returnedAt}` : ""}</span>
          <span style={{ fontFamily: "var(--font-ui)", fontSize: 13.5, lineHeight: "21px", color: "var(--gray-800)" }}>{record.returnReason}</span>
        </div>
      </div>
    </div>
  );
}
// Read-only salary Field — resolved from (grade, notch) by Payroll, never edited in the form.
function PncSalaryField({ salary, label = "Salary" }) {
  return (
    <Field label={label}>
      <div className="input-wrap" style={{ background: "var(--gray-50)" }}>
        <Icon name="money-dollar-circle-line" size={18} style={{ color: "var(--icon-default)" }} />
        <input value={salary ? `${salary} / month` : ""} readOnly placeholder="Auto from grade & notch" style={{ color: salary ? "var(--gray-900)" : "var(--gray-400)" }} />
      </div>
    </Field>
  );
}
// Supporting Documents block — label + SupportingDocuments field + required-doc hint.
function PncDocsField({ existingUrls, isEditMode, onChange, hasDocs, noun = "request" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <label style={{ fontFamily: "var(--font-control)", fontWeight: 500, fontSize: 14, color: "var(--gray-900)" }}>Supporting Documents</label>
      <SupportingDocuments existingUrls={existingUrls || []} isEditMode={isEditMode} onChange={onChange} maxFiles={8} maxSizeMB={8} />
      {!hasDocs && <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-400)" }}>At least one supporting document is required before this {noun} can be submitted.</span>}
    </div>
  );
}
// Form footer — Cancel · Save as Draft (hidden on returned-resubmit) · Submit. The submit
// label/icon resolve the shared states (Returned → "Resubmit for Approval", Draft → "Submit
// Request"); the screen only supplies its create/edit wording.
function PncFormFooter({ onCancel, onSaveDraft, draftDisabled, onSubmit, valid, isReturned, isDraft, submitLabel, submitIcon }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
      <Button variant="stroke" onClick={onCancel}>Cancel</Button>
      {onSaveDraft && !isReturned && <Button variant="stroke" icon="draft-line" disabled={draftDisabled} onClick={onSaveDraft}>Save as Draft</Button>}
      <Button variant="primary" icon={isReturned ? "send-plane-line" : submitIcon} disabled={!valid} onClick={onSubmit}>{isReturned ? "Resubmit for Approval" : isDraft ? "Submit Request" : submitLabel}</Button>
    </div>
  );
}

Object.assign(window, { PNC_RESOURCE, PncApi, pncEditTransition, FormCard, AutoBadge, PncReturnedBanner, PncSalaryField, PncDocsField, PncFormFooter });
