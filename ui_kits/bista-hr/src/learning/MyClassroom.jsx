// BISTA HR · learning/MyClassroom — the ESS "My Learning" classroom (Dashboard tab, learner view).
// The CONSUMER side of the single source of truth: it reads the same window.HRStores the L&D admin
// writes to. Accepting an invitation flips the admin's Enrollment record to Confirmed; completing a
// course section updates the admin's Courses tracking live. Learners see ONLY their own classroom.
//   • assigned courses with status + due dates + branded thumbnails
//   • open a course → work through SECTIONS: content · scored quiz · typed form · document import
//   • program invitation acknowledgement (accept / decline with reason → escalates to line manager)
//   • pre / post self-assessment (Kirkpatrick L2)  +  application action plan (L3)
const { useState: useMc, useEffect: useMcEffect } = React;

const L2_STATEMENTS = ["I understand the core concepts of this topic.", "I can apply this in my day-to-day role.", "I feel confident handling related situations."];

function AssessmentModal({ title, subtitle, onClose, onSubmit }) {
  const [scores, setScores] = useMc([3, 3, 3]);
  const pct = Math.round((scores.reduce((a, b) => a + b, 0) / (L2_STATEMENTS.length * 5)) * 100);
  return (
    <Modal onClose={onClose} width={520}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
        <div><div className="bh-h2" style={{ fontSize: 18 }}>{title}</div><div className="bh-body" style={{ marginTop: 2 }}>{subtitle}</div></div>
        <button onClick={onClose} style={{ border: 0, background: "none", cursor: "pointer", display: "flex" }}><Icon name="close-line" size={22} color="var(--gray-500)" /></button>
      </div>
      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18 }}>
        {L2_STATEMENTS.map((s, i) => (
          <div key={i}>
            <div style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--gray-800)", marginBottom: 8 }}>{s}</div>
            <div style={{ display: "flex", gap: 8 }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setScores(sc => sc.map((x, j) => j === i ? n : x))} style={{ flex: 1, height: 38, borderRadius: 8, cursor: "pointer",
                  border: `1.5px solid ${scores[i] === n ? "var(--brand-yellow-dark)" : "var(--gray-200)"}`, background: scores[i] === n ? "var(--brand-yellow)" : "#fff",
                  color: scores[i] === n ? "var(--brand-ink)" : "var(--gray-500)", fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 14 }}>{n}</button>
              ))}
            </div>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 10, background: "var(--gray-50)" }}>
          <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--gray-500)" }}>Your score</span>
          <span style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 20, color: "var(--gray-900)" }}>{pct}%</span>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: "16px 24px", borderTop: "1px solid var(--border)" }}>
        <Button variant="stroke" onClick={onClose}>Cancel</Button>
        <Button variant="primary" icon="check-line" onClick={() => onSubmit(pct)}>Submit</Button>
      </div>
    </Modal>
  );
}

function DeclineModal({ onClose, onSubmit }) {
  const [reason, setReason] = useMc("");
  return (
    <Modal onClose={onClose} width={480}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}><div className="bh-h2" style={{ fontSize: 18 }}>Decline enrollment</div><div className="bh-body" style={{ marginTop: 2 }}>Your reason is shared with your line manager.</div></div>
      <div style={{ padding: "20px 24px" }}><Field label="Reason for declining"><Textarea rows={3} value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. On approved leave during the program dates." /></Field></div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: "16px 24px", borderTop: "1px solid var(--border)" }}>
        <Button variant="stroke" onClick={onClose}>Cancel</Button>
        <Button variant="primary" icon="close-line" disabled={!reason.trim()} onClick={() => onSubmit(reason.trim())}>Decline & Notify</Button>
      </div>
    </Modal>
  );
}

/* ============ section players (learner-facing, interactive) ============ */
function SectionShell({ section, index, done, open, onToggle, children }) {
  const meta = SECTION_META[section.type] || {};
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden", border: done ? "1px solid var(--success)" : undefined }}>
      <button onClick={onToggle} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", border: 0, background: done ? "var(--success-tint)" : "var(--gray-50)", cursor: "pointer", textAlign: "left" }}>
        <span style={{ width: 34, height: 34, borderRadius: 9, background: done ? "var(--success)" : "#fff", border: done ? 0 : "1px solid var(--border)", display: "grid", placeItems: "center", flex: "none" }}><Icon name={done ? "check-line" : meta.icon} size={18} color={done ? "#fff" : "var(--gray-600)"} /></span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 15, color: "var(--gray-900)" }}>{section.title}</span>
          <span style={{ display: "block", fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--gray-500)" }}>Section {index + 1} · {meta.label}{section.type === "quiz" ? ` · pass ${section.passMark}%` : ""}{done ? " · completed" : ""}</span>
        </span>
        <Icon name={open ? "arrow-up-s-line" : "arrow-down-s-line"} size={20} color="var(--gray-400)" />
      </button>
      {open && <div style={{ padding: 18 }}>{children}</div>}
    </div>
  );
}

function ContentSectionBody({ section, viewed, onView, done, isLast, onNext }) {
  const items = section.items || [];
  const [idx, setIdx] = useMc(0);
  const vset = new Set(viewed || []);
  const it = items[idx] || {};
  const v = vset.has(it.id);
  const onLastItem = idx >= items.length - 1;
  const renderItem = () => {
    if (it.type === "video") return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="play-circle-line" size={16} color="var(--gray-500)" />
          <span style={{ flex: 1, minWidth: 0, fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 14, color: "var(--gray-900)" }}>{it.title}</span>
          {it.meta && <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-400)" }}>{it.meta}</span>}
        </div>
        <VideoPlayer url={it.url} title={it.title} />
      </div>
    );
    if (it.type === "post") return (
      <div style={{ border: `1px solid ${v ? "var(--success)" : "var(--border)"}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: v ? "var(--success-tint)" : "var(--gray-50)", borderBottom: "1px solid var(--divider)" }}>
          <Icon name={v ? "check-line" : "article-line"} size={18} color={v ? "var(--success-deep)" : "var(--gray-600)"} />
          <span style={{ flex: 1, minWidth: 0, fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 14.5, color: "var(--gray-900)" }}>{it.title}</span>
          {it.meta && <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-400)" }}>{it.meta}</span>}
        </div>
        <div className="bh-rte" style={{ padding: "16px 18px", fontFamily: "var(--font-ui)", fontSize: 14.5, color: "var(--gray-700)", lineHeight: 1.75 }} dangerouslySetInnerHTML={{ __html: it.html || "<p style='color:var(--gray-400)'>No content yet.</p>" }} />
      </div>
    );
    const isDoc = it.type === "document";
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", border: "1px solid var(--border)", borderRadius: 10, background: v ? "var(--success-tint)" : "#fff" }}>
        {isDoc ? <FileIcon name={(it.file && it.file.name) || it.title} ext={it.file && it.file.ext} size={34} />
          : <span style={{ width: 34, height: 34, borderRadius: 8, background: v ? "var(--success)" : "var(--gray-50)", display: "grid", placeItems: "center", flex: "none" }}><Icon name={v ? "check-line" : CONTENT_ICON[it.type]} size={18} color={v ? "#fff" : "var(--gray-600)"} /></span>}
        <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 14, color: "var(--gray-900)" }}>{it.title}</div><div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-400)" }}>{it.type} · {it.meta}</div></div>
        <Button variant="stroke" size="sm" icon={isDoc ? "download-2-line" : "external-link-line"} onClick={() => onView(it.id)}>{isDoc ? "Download" : "Open"}</Button>
      </div>
    );
  };
  const next = () => {
    onView(it.id);               // mark the current item viewed
    if (onLastItem) { onNext(); } // last item → complete section + advance
    else setIdx(i => i + 1);     // otherwise step to the next item
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* step indicator — one content item at a time */}
      {items.length > 1 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--gray-500)", flex: "none" }}>Step {idx + 1} of {items.length}</span>
          <div style={{ flex: 1, display: "flex", gap: 4 }}>
            {items.map((x, i) => <span key={x.id} style={{ flex: 1, height: 4, borderRadius: 999, background: i < idx || vset.has(x.id) ? "var(--success)" : i === idx ? "var(--brand-yellow-dark)" : "var(--gray-200)" }} />)}
          </div>
        </div>
      )}
      {renderItem()}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 4 }}>
        <Button variant="stroke" icon="arrow-left-line" disabled={idx === 0} onClick={() => setIdx(i => Math.max(0, i - 1))}>Back</Button>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {done && <span style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--success-deep)", display: "inline-flex", alignItems: "center", gap: 5 }}><Icon name="checkbox-circle-fill" size={15} color="var(--success)" />Completed</span>}
          <Button variant="primary" iconRight={onLastItem ? (isLast ? "check-line" : "arrow-right-line") : "arrow-right-line"} onClick={next}>{onLastItem ? (isLast ? "Finish" : "Next section") : "Next"}</Button>
        </div>
      </div>
    </div>
  );
}

function QuizSectionBody({ section, done, prevScore, onSubmit, onConfirm }) {
  const [answers, setAnswers] = useMc({});
  const [result, setResult] = useMc(null);
  const all = (section.questions || []).every(q => answers[q.id] != null);
  const submit = () => {
    const qs = section.questions || [];
    const correct = qs.filter(q => answers[q.id] === q.correct).length;
    const score = qs.length ? Math.round((correct / qs.length) * 100) : 0;
    const passed = score >= (section.passMark || 0);
    setResult({ score, passed });
    if (passed) onSubmit(score);
  };
  if (done) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ padding: "12px 14px", borderRadius: 10, background: "var(--success-tint)", display: "flex", alignItems: "center", gap: 10 }}><Icon name="checkbox-circle-fill" size={18} color="var(--success-deep)" /><span style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--success-deep)" }}>Passed{prevScore != null ? ` · scored ${prevScore}%` : ""}.</span></div>
      {(section.questions || []).map((q, qi) => (
        <div key={q.id}>
          <div style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 14, color: "var(--gray-900)", marginBottom: 8 }}>{qi + 1}. {q.prompt}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {q.options.map((o, oi) => { const correct = oi === q.correct; return (
              <div key={oi} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10,
                border: `1.5px solid ${correct ? "var(--success)" : "var(--gray-200)"}`, background: correct ? "var(--success-tint)" : "#fff" }}>
                <Icon name={correct ? "checkbox-circle-fill" : "checkbox-blank-circle-line"} size={18} color={correct ? "var(--success)" : "var(--gray-300)"} />
                <span style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: correct ? "var(--success-deep)" : "var(--gray-700)" }}>{o}</span>
              </div>
            ); })}
          </div>
        </div>
      ))}
    </div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {(section.questions || []).map((q, qi) => (
        <div key={q.id}>
          <div style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 14, color: "var(--gray-900)", marginBottom: 8 }}>{qi + 1}. {q.prompt}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {q.options.map((o, oi) => { const sel = answers[q.id] === oi; return (
              <button key={oi} onClick={() => setAnswers(a => ({ ...a, [q.id]: oi }))} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, cursor: "pointer", textAlign: "left",
                border: `1.5px solid ${sel ? "var(--brand-yellow-dark)" : "var(--gray-200)"}`, background: sel ? "var(--brand-yellow-tint)" : "#fff" }}>
                <Icon name={sel ? "radio-button-line" : "checkbox-blank-circle-line"} size={18} color={sel ? "var(--brand-yellow-dark)" : "var(--gray-300)"} />
                <span style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--gray-800)" }}>{o}</span>
              </button>
            ); })}
          </div>
        </div>
      ))}
      {result && !result.passed && <div style={{ padding: "12px 14px", borderRadius: 10, background: "var(--error-tint)", display: "flex", alignItems: "center", gap: 10 }}><Icon name="error-warning-line" size={18} color="var(--error)" /><span style={{ fontFamily: "var(--font-ui)", fontSize: 13.5, color: "var(--error)" }}>You scored {result.score}% — {section.passMark}% needed to pass. Adjust your answers and try again.</span></div>}
      <div style={{ display: "flex", justifyContent: "flex-end" }}><Button variant="primary" icon="check-line" disabled={!all} onClick={() => onConfirm("quiz", submit)}>Submit answers</Button></div>
    </div>
  );
}

function FormSectionBody({ section, done, savedResponses, onSubmit, onConfirm }) {
  const [vals, setVals] = useMc(savedResponses || {});
  const set = (id, v) => setVals(s => ({ ...s, [id]: v }));
  const filled = (f) => { const v = vals[f.id]; return Array.isArray(v) ? v.length > 0 : v != null && v !== ""; };
  const valid = (section.fields || []).every(f => !f.required || filled(f));
  if (done) {
    const fmtVal = (f) => { const v = (savedResponses || {})[f.id]; if (Array.isArray(v)) return v.length ? v.join(", ") : "—"; return (v == null || v === "") ? "—" : String(v); };
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ padding: "12px 14px", borderRadius: 10, background: "var(--success-tint)", display: "flex", alignItems: "center", gap: 10 }}><Icon name="checkbox-circle-fill" size={18} color="var(--success-deep)" /><span style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--success-deep)" }}>Submitted — thank you.</span></div>
        {(section.fields || []).map(f => (
          <div key={f.id}>
            <div style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--gray-500)", marginBottom: 4 }}>{f.label}</div>
            <div style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--gray-900)", padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 10, background: "var(--gray-50)" }}>{fmtVal(f)}</div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {section.description && <div className="bh-body">{section.description}</div>}
      {(section.fields || []).map(f => (
        <Field key={f.id} label={f.label} required={f.required}><FormFieldRenderer field={f} value={vals[f.id]} onChange={(v) => set(f.id, v)} /></Field>
      ))}
      <div style={{ display: "flex", justifyContent: "flex-end" }}><Button variant="primary" icon="check-line" disabled={!valid} onClick={() => onConfirm("form", () => onSubmit(vals))}>Submit</Button></div>
    </div>
  );
}

function DocSectionBody({ section, done, onComplete, onToast }) {
  if (done) return <div style={{ padding: "12px 14px", borderRadius: 10, background: "var(--success-tint)", display: "flex", alignItems: "center", gap: 10 }}><Icon name="checkbox-circle-fill" size={18} color="var(--success-deep)" /><span style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--success-deep)" }}>Acknowledged.</span></div>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {section.note && <div className="bh-body">{section.note}</div>}
      {section.file ? (
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", border: "1px solid var(--border)", borderRadius: 10 }}>
          <FileIcon name={section.file.name} ext={section.file.ext} size={32} />
          <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 14, color: "var(--gray-900)" }}>{section.file.name}</div><div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-400)" }}>{section.file.size}{section.file.ext ? ` · ${section.file.ext}` : ""}</div></div>
          <Button variant="stroke" size="sm" icon="download-2-line" onClick={() => onToast("Download started", {})}>Download</Button>
        </div>
      ) : <div className="bh-caption">No file attached.</div>}
      <div style={{ display: "flex", justifyContent: "flex-end" }}><Button variant="primary" icon="checkbox-circle-line" onClick={onComplete}>I acknowledge</Button></div>
    </div>
  );
}

function CoursePlayer({ assignment, course, onCompleteSection, onViewItem, onAddAction, onToggleAction, onToast }) {
  const a = assignment;
  const sections = course.sections || [];
  const doneSet = new Set(a.doneSections || []);
  const firstOpen = sections.find(s => !doneSet.has(s.id)) || sections[0] || {};
  const [active, setActive] = useMc(firstOpen.id);
  const [actionText, setActionText] = useMc("");
  const [confirm, setConfirm] = useMc(null);
  const [drawer, setDrawer] = useMc(false);
  const sec = sections.find(s => s.id === active) || sections[0] || {};
  const secMeta = SECTION_META[sec.type] || {};
  const secDone = doneSet.has(sec.id);
  const askConfirm = (kind, run) => setConfirm({ kind, run });
  const isLast = sections.length > 0 && sections[sections.length - 1].id === sec.id;
  const advance = (sid) => { const idx = sections.findIndex(s => s.id === sid); const nxt = sections[idx + 1]; if (nxt) { setActive(nxt.id); } else { setDrawer(false); } };
  const openSection = (id) => { setActive(id); setDrawer(true); };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="md-split">
        {/* LEFT — thumbnail/about · sections · action plan, as separate cards */}
        <div className="md-rail md-rail--sticky" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* thumbnail + about */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ position: "relative" }}>
              <CourseThumb course={course} height={150} radius={0} flat />
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "14px 16px 14px 82px" }}>
                <div style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 18, color: "#fff", textShadow: "0 1px 8px rgba(13,27,42,.55)", lineHeight: 1.2 }}>{course.title}</div>
                <div style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "rgba(255,255,255,.9)", textShadow: "0 1px 6px rgba(13,27,42,.55)", marginTop: 2 }}>{course.source} · {course.category}</div>
              </div>
            </div>
            <div style={{ padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 14, color: "var(--gray-900)" }}>About this course</div>
                <StatusBadge variant={LD_COURSE_VARIANT[a.status]} text={a.status} size="sm" />
              </div>
              <div style={{ fontFamily: "var(--font-ui)", fontSize: 13.5, color: "var(--gray-600)", lineHeight: 1.6 }}>{course.summary}</div>
              <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1, height: 8, borderRadius: 999, background: "var(--gray-100)", overflow: "hidden" }}><div style={{ height: "100%", width: a.progress + "%", background: "var(--brand-yellow-dark)" }} /></div>
                <span style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 13, color: "var(--gray-900)" }}>{a.progress}%</span>
              </div>
              <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--gray-400)" }}>
                <span>{doneSet.size} of {sections.length} sections</span><span><Icon name="time-line" size={12} color="var(--gray-400)" style={{ marginRight: 4, verticalAlign: "-1px" }} />{fmtMins(courseEst(course))}</span>
              </div>
            </div>
          </div>

          {/* course sections — its own card */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "13px 16px 9px", fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 14, color: "var(--gray-900)" }}>Course sections</div>
            <div>
              {sections.map((s, i) => {
                const sd = doneSet.has(s.id); const on = s.id === active; const m = SECTION_META[s.type] || {};
                return (
                  <button key={s.id} onClick={() => openSection(s.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", border: 0, borderLeft: `3px solid ${on ? "var(--brand-yellow-dark)" : "transparent"}`,
                    background: on ? "var(--brand-yellow-tint)" : "transparent", cursor: "pointer", textAlign: "left", borderTop: "1px solid var(--divider)" }}
                    onMouseEnter={e => { if (!on) e.currentTarget.style.background = "var(--gray-50)"; }}
                    onMouseLeave={e => { if (!on) e.currentTarget.style.background = "transparent"; }}>
                    <span style={{ width: 30, height: 30, borderRadius: 8, background: sd ? "var(--success)" : on ? "#fff" : "var(--gray-50)", border: sd ? 0 : "1px solid var(--border)", display: "grid", placeItems: "center", flex: "none" }}><Icon name={sd ? "check-line" : m.icon} size={16} color={sd ? "#fff" : "var(--gray-600)"} /></span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 13.5, color: "var(--gray-900)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</span>
                      <span style={{ display: "block", fontFamily: "var(--font-ui)", fontSize: 11.5, color: "var(--gray-400)" }}>Section {i + 1} · {m.label} · {fmtMins(sectionEst(s))}</span>
                    </span>
                    {sd ? <span className="bh-chip" style={{ fontSize: 10.5, color: "var(--success-deep)", background: "var(--success-tint)", flex: "none" }}>Done</span>
                      : <Icon name="arrow-right-s-line" size={18} color="var(--gray-300)" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* My Action Plan — project-wide, its own card */}
          <div className="card" style={{ padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <Icon name="task-line" size={17} color="var(--brand-yellow-dark)" />
              <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 14, color: "var(--gray-900)" }}>My Action Plan (L3)</div>
            </div>
            <div style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--gray-500)", marginBottom: 12, lineHeight: 1.5 }}>How you'll apply this on the job — routed to your line manager for sign-off.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(a.actionPlan || []).map(ap => (
                <div key={ap.id} style={{ display: "flex", alignItems: "flex-start", gap: 9, padding: "9px 11px", border: "1px solid var(--border)", borderRadius: 10 }}>
                  <Checkbox checked={ap.done} onChange={() => onToggleAction(ap.id)} />
                  <span style={{ flex: 1, fontFamily: "var(--font-ui)", fontSize: 13, color: ap.done ? "var(--gray-400)" : "var(--gray-900)", textDecoration: ap.done ? "line-through" : "none", lineHeight: 1.45 }}>{ap.text}</span>
                </div>
              ))}
              {(!a.actionPlan || a.actionPlan.length === 0) && <div className="bh-caption">No actions yet.</div>}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <div style={{ flex: 1 }}><Input value={actionText} onChange={e => setActionText(e.target.value)} placeholder="Add an action…" /></div>
              <Button variant="stroke" icon="add-line" disabled={!actionText.trim()} onClick={() => { onAddAction(actionText.trim()); setActionText(""); }}>Add</Button>
            </div>
          </div>
        </div>

        {/* RIGHT — active section content (a slide-in drawer on small screens) */}
        <div className={"md-main cp-drawer" + (drawer ? " open" : "")} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card" style={{ padding: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 18px 0" }}>
              <button className="cp-drawer-close" onClick={() => setDrawer(false)} style={{ border: 0, background: "none", cursor: "pointer", padding: 0 }} aria-label="Back to sections"><Icon name="arrow-left-line" size={20} color="var(--gray-500)" /></button>
              <span style={{ width: 30, height: 30, borderRadius: 8, background: "var(--gray-50)", display: "grid", placeItems: "center", flex: "none" }}><Icon name={secMeta.icon || "stack-line"} size={17} color="var(--gray-600)" /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 16, color: "var(--gray-900)" }}>{sec.title}</div>
                <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-400)" }}>{secMeta.label}{sec.type === "quiz" ? ` · pass ${sec.passMark}%` : ""} · {fmtMins(sectionEst(sec))}</div>
              </div>
            </div>
            <div style={{ padding: "14px 18px 18px" }}>
              {sec.type === "content" && <ContentSectionBody section={sec} viewed={(a.viewed || {})[sec.id]} done={secDone} isLast={isLast} onView={(itemId) => onViewItem(sec.id, itemId)} onNext={() => { onCompleteSection(sec.id, {}); advance(sec.id); }} />}
              {sec.type === "quiz" && <QuizSectionBody section={sec} done={secDone} prevScore={(a.quizScores || {})[sec.id]} onConfirm={askConfirm} onSubmit={(score) => onCompleteSection(sec.id, { quizScore: score })} />}
              {sec.type === "form" && <FormSectionBody section={sec} done={secDone} savedResponses={(a.formResponses || {})[sec.id]} onConfirm={askConfirm} onSubmit={(responses) => onCompleteSection(sec.id, { formResponse: responses })} />}
            </div>
          </div>
        </div>
      </div>
      {drawer && <div className="cp-backdrop" onClick={() => setDrawer(false)} />}
      {confirm && <ConfirmModal title={confirm.kind === "quiz" ? "Submit quiz" : "Submit form"}
        message={confirm.kind === "quiz" ? "Submit your answers? You won't be able to change them once submitted." : "Submit your responses? You won't be able to change them once submitted."}
        confirmLabel="Yes, Submit" confirmIcon="check-line" cancelLabel="Cancel"
        onConfirm={() => { const r = confirm.run; setConfirm(null); r && r(); }} onClose={() => setConfirm(null)} />}
    </div>
  );
}
function Row({ label, children }) { return <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--gray-500)" }}>{label}</span>{children}</div>; }
function Donut2({ value }) {
  const size = 120, r = 50, c = 2 * Math.PI * r, len = (value / 100) * c;
  return (
    <div style={{ position: "relative", width: size, height: size, margin: "0 auto" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--gray-100)" strokeWidth={12} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--brand-yellow-dark)" strokeWidth={12} strokeDasharray={`${len} ${c - len}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 24, color: "var(--gray-900)" }}>{value}%</div>
    </div>
  );
}

function MyClassroom({ onToast, onSubPage }) {
  const [assignments, setAssignments] = useStore(window.HRStores.ldAssignments);
  const [courses] = useStore(window.HRStores.ldCourses);
  const [enrollments, setEnrollments] = useStore(window.HRStores.ldEnrollments);
  const [programs] = useStore(window.HRStores.ldPrograms);
  const [evaluations, setEvaluations] = useStore(window.HRStores.ldEvaluations);
  const [view, setView] = useMc({ name: "list" });
  const [decline, setDecline] = useMc(null);
  const [assess, setAssess] = useMc(null);
  const [q, setQ] = useMc("");
  const [statusFilter, setStatusFilter] = useMc("All");

  const mine = assignments.filter(a => a.learner === LD_ME);
  const myEvents = programs.filter(p => p.coordinator === LD_ME);
  const myInvites = enrollments.filter(e => e.learner === LD_ME && e.status === "Invited");
  const myConfirmed = enrollments.filter(e => e.learner === LD_ME && e.status === "Confirmed");
  const courseOf = (id) => courses.find(c => c.id === id) || { sections: [] };
  const progName = (id) => (programs.find(p => p.id === id) || {}).title || "Program";

  // breadcrumb (replaces a back button) when a course is open
  useMcEffect(() => {
    if (!onSubPage) return;
    if (view.name === "course") { const a = mine.find(x => x.id === view.id); const c = a ? courseOf(a.courseId) : {}; onSubPage({ trail: [{ label: "My Learning", onClick: () => setView({ name: "list" }) }, { label: c.title || "Course" }] }); }
    else onSubPage(null);
    return () => onSubPage(null);
  }, [view]);

  const upsertEval = (programId, patch) => setEvaluations(rs => {
    const ex = rs.find(r => r.programId === programId && r.learner === LD_ME);
    if (ex) return rs.map(r => r === ex ? { ...r, ...patch } : r);
    return [{ id: ldId(), programId, learner: LD_ME, program: progName(programId), l2Pre: null, l2Post: null, l3Status: "Not Started", l3Actions: 0, l3Done: 0, l4LearnerScore: null, l4ManagerScore: null, impactCategory: "—", stage: "Learning (L2)", ...patch }, ...rs];
  });
  const l2Pending = myConfirmed.filter(e => { const ev = evaluations.find(r => r.programId === e.programId && r.learner === LD_ME); return !ev || ev.l2Pre == null; });

  const accept = (e) => { setEnrollments(es => es.map(x => x.id === e.id ? { ...x, status: "Confirmed" } : x)); onToast("Enrollment confirmed — pre-course assessment available", { tone: "success" }); };
  const doDecline = (reason) => { setEnrollments(es => es.map(x => x.id === decline.id ? { ...x, status: "Declined", declineReason: reason } : x)); onToast("Declined — your line manager has been notified", { tone: "error" }); setDecline(null); };

  // mark a content item viewed (persisted on the assignment)
  const viewItem = (asgId, sectionId, itemId) => setAssignments(as => as.map(a => {
    if (a.id !== asgId) return a;
    const viewed = { ...(a.viewed || {}) }; const set = new Set(viewed[sectionId] || []); set.add(itemId); viewed[sectionId] = [...set];
    return { ...a, viewed };
  }));
  // complete a section → recompute progress + status (writes to the shared store; admin tracking updates live)
  const completeSection = (asgId, sectionId, extra) => setAssignments(as => as.map(a => {
    if (a.id !== asgId) return a;
    const course = courseOf(a.courseId);
    const doneSections = a.doneSections && a.doneSections.includes(sectionId) ? a.doneSections : [...(a.doneSections || []), sectionId];
    const quizScores = extra.quizScore != null ? { ...(a.quizScores || {}), [sectionId]: extra.quizScore } : (a.quizScores || {});
    const formResponses = extra.formResponse != null ? { ...(a.formResponses || {}), [sectionId]: extra.formResponse } : (a.formResponses || {});
    const next = { ...a, doneSections, quizScores, formResponses };
    const progress = courseProgress(course, next);
    const status = progress === 0 ? "Not Started" : progress === 100 ? "Completed" : "In Progress";
    if (progress === 100 && a.status !== "Completed") onToast("Course completed 🎉", { tone: "success" });
    return { ...next, progress, status };
  }));
  const submitAssessment = (pct) => { if (assess && assess.kind === "l2pre") { upsertEval(assess.programId, { l2Pre: pct }); onToast(`Pre-course self-assessment saved (${pct}%)`, { tone: "success" }); } setAssess(null); };
  const addAction = (asgId, text) => setAssignments(as => as.map(a => a.id === asgId ? { ...a, actionPlan: [...(a.actionPlan || []), { id: ldId(), text, done: false }] } : a));
  const toggleAction = (asgId, actId) => setAssignments(as => as.map(a => a.id === asgId ? { ...a, actionPlan: (a.actionPlan || []).map(x => x.id === actId ? { ...x, done: !x.done } : x) } : a));

  const markAttendance = (enrollmentId, status) => { setEnrollments(es => es.map(e => e.id === enrollmentId ? { ...e, status } : e)); onToast(status === "Attended" ? "Marked present" : "Marked absent", { tone: status === "Attended" ? "success" : "error" }); };

  if (view.name === "event") {
    const p = myEvents.find(x => x.id === view.id) || programs.find(x => x.id === view.id);
    if (p) return <CatalogDetail program={p} enrollments={enrollments} canMarkAttendance={true} onMarkAttendance={markAttendance} onBack={() => setView({ name: "list" })} />;
  }

  if (view.name === "course") {
    const a = mine.find(x => x.id === view.id);
    if (a) return (
      <CoursePlayer assignment={a} course={courseOf(a.courseId)}
        onViewItem={(sid, itemId) => viewItem(a.id, sid, itemId)} onCompleteSection={(sid, extra) => completeSection(a.id, sid, extra)}
        onAddAction={(t) => addAction(a.id, t)} onToggleAction={(id) => toggleAction(a.id, id)} onToast={onToast} />
    );
  }

  const counts = { "Not Started": mine.filter(a => a.status === "Not Started").length, "In Progress": mine.filter(a => a.status === "In Progress").length, Completed: mine.filter(a => a.status === "Completed").length };
  const STATUS_FILTERS = ["All", "Not Started", "In Progress", "Completed"];
  const shown = mine.filter(a => {
    const c = courseOf(a.courseId);
    if (statusFilter !== "All" && a.status !== statusFilter) return false;
    if (q && !((c.title + " " + (c.source || "") + " " + (c.category || "")).toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  });

  return (
    <div className="md-split" style={{ "--md-rail-w": "270px" }}>
      {/* LEFT — filters (careers-style sticky card, stacks above on small screens) */}
      <div className="md-rail md-rail--sticky">
        <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 16, color: "var(--gray-900)" }}>My Learning</div>
          <Field label="Search"><UI.SearchInput value={q} onChange={setQ} placeholder="Search courses…" /></Field>
          <div>
            <div style={{ fontFamily: "var(--font-control)", fontWeight: 500, fontSize: 14, color: "var(--gray-800)", marginBottom: 8 }}>Status</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {STATUS_FILTERS.map(s => { const on = statusFilter === s; const n = s === "All" ? mine.length : counts[s]; return (
                <button key={s} type="button" onClick={() => setStatusFilter(s)} style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 12.5, padding: "6px 12px", borderRadius: 999, cursor: "pointer",
                  border: on ? "1px solid var(--brand-ink)" : "1px solid var(--border-strong)", background: on ? "var(--brand-yellow-tint)" : "#fff", color: "var(--gray-800)" }}>{s}{typeof n === "number" ? ` (${n})` : ""}</button>
              ); })}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT — course grid */}
      <div className="md-main">
        {mine.length === 0
          ? <div className="card" style={{ padding: 8 }}><EmptyState title="No courses assigned yet" subtitle="Courses your L&D team assigns to you will appear here." /></div>
          : shown.length === 0
          ? <div className="card" style={{ padding: 8 }}><EmptyState compact title="No matching courses" subtitle="Try a different search or filter." /></div>
          : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
              {shown.map(a => { const c = courseOf(a.courseId); const secs = (c.sections || []).length; return (
                <div key={a.id} className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", cursor: "pointer" }} onClick={() => setView({ name: "course", id: a.id })}>
                  <div style={{ position: "relative" }}>
                    <CourseThumb course={c} height={140} />
                    <span style={{ position: "absolute", top: 10, right: 10 }}><StatusBadge variant={LD_COURSE_VARIANT[a.status]} text={a.status} size="sm" /></span>
                  </div>
                  <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
                    <div><div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 16, color: "var(--gray-900)" }}>{c.title}</div><div className="bh-caption" style={{ marginTop: 2 }}>{c.source} · {secs} section{secs === 1 ? "" : "s"}</div></div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ flex: 1, height: 8, borderRadius: 999, background: "var(--gray-100)", overflow: "hidden" }}><div style={{ height: "100%", width: a.progress + "%", background: "var(--brand-yellow-dark)" }} /></div>
                      <span style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 13, color: "var(--gray-900)" }}>{a.progress}%</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
                      <span className="bh-caption"><Icon name="calendar-line" size={13} color="var(--gray-400)" style={{ marginRight: 5 }} />Due {a.due}</span>
                      <span style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 13, color: "var(--brand-yellow-dark)", display: "inline-flex", alignItems: "center", gap: 4 }}>{a.status === "Completed" ? "Review" : a.status === "Not Started" ? "Start" : "Continue"}<Icon name="arrow-right-line" size={15} color="var(--brand-yellow-dark)" /></span>
                    </div>
                  </div>
                </div>
              ); })}
            </div>}
      </div>

      {decline && <DeclineModal onClose={() => setDecline(null)} onSubmit={doDecline} />}
      {assess && <AssessmentModal title="Pre-course self-assessment" subtitle="Rate yourself before the program" onClose={() => setAssess(null)} onSubmit={submitAssessment} />}
    </div>
  );
}

Object.assign(window, { MyClassroom });
