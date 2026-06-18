// BISTA HR · learning/course-fields — shared toolkit for the interactive course model.
//   CourseThumb        : branded thumbnail. The GCB logo is used as a MASK to "snip" the
//                        course image into a monogram badge — the brand mark filled with the photo.
//   ThumbnailPicker    : real image upload (FileReader → data URL) with preview, for the form.
//   FormFieldRenderer  : renders ONE form field for the learner — short/long text, number,
//                        single-select (RADIO list), multi-select (CHECKBOX list), date, yes/no,
//                        rating, file upload. Options use UI.RadioGroup / UI.CheckboxGroup (NOT a
//                        Combobox dropdown) so quiz & form options read as a visible pick-list.
//   FieldBuilder       : admin editor for one form field (label · kind · required · options).
//   QuizQuestionBuilder: admin editor for one quiz question (prompt · options · mark correct).
// All exported to window for the admin (Courses.jsx) and learner (MyClassroom.jsx) screens.
const { useState: useCF, useRef: useCFRef } = React;

const LD_LOGO = "../../assets/logo/gcb-logo.svg";

// section + field vocab
const SECTION_TYPES = [
  { value: "content", label: "Content", icon: "stack-line", hint: "Videos, articles, documents and links the learner works through." },
  { value: "quiz", label: "Quiz", icon: "question-answer-line", hint: "Multiple-choice questions, scored against a pass mark." },
  { value: "form", label: "Form", icon: "survey-line", hint: "Collect typed responses — any mix of input types." },
];
const SECTION_META = Object.fromEntries(SECTION_TYPES.map(s => [s.value, s]));
const FIELD_KINDS = [
  { value: "short-text", label: "Short text", icon: "text" },
  { value: "long-text", label: "Paragraph", icon: "align-left" },
  { value: "number", label: "Number", icon: "hashtag" },
  { value: "single-select", label: "Single select", icon: "radio-button-line" },
  { value: "multi-select", label: "Multi-select", icon: "checkbox-multiple-line" },
  { value: "date", label: "Date", icon: "calendar-line" },
  { value: "yes-no", label: "Yes / No", icon: "toggle-line" },
  { value: "rating", label: "Rating (1–5)", icon: "star-line" },
  { value: "file", label: "File upload", icon: "attachment-2" },
];
const FIELD_LABEL = Object.fromEntries(FIELD_KINDS.map(k => [k.value, k.label]));
const NEEDS_OPTIONS = (kind) => kind === "single-select" || kind === "multi-select";
const CONTENT_ITEM_TYPES = [{ value: "video", label: "Video" }, { value: "document", label: "Document" }, { value: "link", label: "Link" }, { value: "post", label: "Article (rich text)" }];
const CONTENT_ICON = { video: "play-circle-line", document: "file-text-line", link: "link", post: "article-line", text: "article-line" };
const COURSE_SOURCE_TINT = { Internal: { c: "var(--brand-yellow-dark)", b: "var(--brand-yellow-tint)" }, Percipio: { c: "#6941C6", b: "#F4F0FF" }, Intuition: { c: "var(--success-deep)", b: "var(--success-tint)" } };

// ---- video helpers + reusable inline player (YouTube embed, direct file, or placeholder) ----
function youtubeId(url) {
  if (!url) return null;
  const m = String(url).match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}
function VideoPlayer({ url, title }) {
  const yt = youtubeId(url);
  const [playing, setPlaying] = useCF(false);
  // embeds need a real (non-opaque) origin; sandboxed previews report origin "null" → embed errors (153)
  const canEmbed = (() => { try { return window.location.origin && window.location.origin !== "null"; } catch (e) { return false; } })();
  if (yt) {
    if (!playing) return (
      <div role="button" tabIndex={0} onClick={() => { if (canEmbed) setPlaying(true); else window.open(`https://youtu.be/${yt}`, "_blank", "noopener"); }} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (canEmbed) setPlaying(true); else window.open(`https://youtu.be/${yt}`, "_blank", "noopener"); } }}
        style={{ position: "relative", paddingTop: "56.25%", borderRadius: 12, overflow: "hidden", background: "#000", cursor: "pointer" }}>
        <img src={`https://i.ytimg.com/vi/${yt}/hqdefault.jpg`} alt={title || "Video"} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "rgba(13,27,42,.32)" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ width: 64, height: 46, borderRadius: 12, background: "#FF0000", display: "grid", placeItems: "center", boxShadow: "0 4px 16px rgba(0,0,0,.35)" }}><Icon name="play-fill" size={26} color="#fff" /></span>
        </div>
        <a href={`https://youtu.be/${yt}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
          style={{ position: "absolute", right: 10, bottom: 10, display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 8, background: "rgba(13,27,42,.7)", color: "#fff", fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
          <Icon name="youtube-fill" size={14} color="#fff" />Watch on YouTube</a>
      </div>
    );
    return (
      <div style={{ position: "relative", paddingTop: "56.25%", borderRadius: 12, overflow: "hidden", background: "#000" }}>
        <iframe src={`https://www.youtube-nocookie.com/embed/${yt}?rel=0&autoplay=1&playsinline=1`} title={title || "Video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }} />
      </div>
    );
  }
  if (url && /\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(url)) return (
    <div style={{ position: "relative", paddingTop: "56.25%", borderRadius: 12, overflow: "hidden", background: "#000" }}>
      <video controls playsInline controlsList="nodownload" src={url}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", background: "#000", border: 0 }} />
    </div>
  );
  // no playable source — branded placeholder
  return (
    <div style={{ position: "relative", paddingTop: "52%", borderRadius: 12, overflow: "hidden", background: "linear-gradient(135deg, #0D1B2A 0%, #20344A 70%)" }}>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
        <span style={{ width: 62, height: 62, borderRadius: "50%", background: "rgba(255,255,255,.16)", display: "grid", placeItems: "center" }}><Icon name="play-fill" size={30} color="#fff" /></span>
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "rgba(255,255,255,.8)" }}>Video preview</span>
      </div>
    </div>
  );
}

/* ---------- branded thumbnail (logo-snip mask) ---------- */
function CourseThumb({ course, height = 156, radius = 14, flat = false }) {
  const img = course && course.thumbnail;
  const mask = { WebkitMaskImage: `url(${LD_LOGO})`, maskImage: `url(${LD_LOGO})`, WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat", WebkitMaskSize: "contain", maskSize: "contain", WebkitMaskPosition: "center", maskPosition: "center" };
  const r = flat ? { borderRadius: radius } : { borderTopLeftRadius: radius, borderTopRightRadius: radius };
  return (
    <div style={{ position: "relative", height, overflow: "hidden", background: "linear-gradient(135deg, #0D1B2A 0%, #20344A 60%, var(--brand-yellow-dark) 160%)", ...r }}>
      {img && <img src={img} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(13,27,42,.12) 0%, rgba(13,27,42,0) 30%, rgba(13,27,42,.62) 100%)" }} />
      {/* GCB monogram "snipped" from the image: the logo masks a copy of the photo on a white chip */}
      <div style={{ position: "absolute", left: 14, bottom: 12, width: 58, height: 58, borderRadius: 13, background: "#fff", padding: 9, boxSizing: "border-box", boxShadow: "0 6px 16px rgba(13,27,42,.28)" }}>
        <div style={{ width: "100%", height: "100%", ...mask,
          background: img ? `center/180% url(${img})` : "linear-gradient(135deg, var(--brand-yellow-dark), #C2540A)" }} />
      </div>
    </div>
  );
}

/* ---------- thumbnail upload (form) ---------- */
function ThumbnailPicker({ value, onChange }) {
  const ref = useCFRef(null);
  const pick = (file) => { if (!file) return; const reader = new FileReader(); reader.onload = e => onChange(e.target.result); reader.readAsDataURL(file); };
  return (
    <div>
      <input ref={ref} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={e => { pick(e.target.files && e.target.files[0]); e.target.value = ""; }} />
      {value ? (
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ width: 200, flex: "none" }}><CourseThumb course={{ thumbnail: value, source: "Internal" }} height={112} flat /></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Button variant="stroke" size="sm" icon="image-edit-line" onClick={() => ref.current && ref.current.click()}>Replace image</Button>
            <Button variant="stroke" size="sm" icon="delete-bin-line" onClick={() => onChange("")}>Remove</Button>
          </div>
        </div>
      ) : (
        <div role="button" tabIndex={0} onClick={() => ref.current && ref.current.click()}
          onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); ref.current && ref.current.click(); } }}
          style={{ width: "100%", boxSizing: "border-box", border: "2px dashed var(--gray-300)", background: "#FCFCFD", borderRadius: 12, padding: "26px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textAlign: "center", cursor: "pointer" }}>
          <Icon name="image-add-line" size={34} color="var(--gray-400)" />
          <div style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 14, color: "var(--gray-700)" }}>Add a thumbnail image</div>
          <div style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--gray-400)" }}>PNG, JPG or WEBP — 16:9 looks best. The GCB mark is snipped from it on the card.</div>
        </div>
      )}
    </div>
  );
}

/* ---------- star rating ---------- */
function StarRating({ value = 0, onChange, readOnly }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} disabled={readOnly} onClick={() => onChange && onChange(n)} style={{ border: 0, background: "none", cursor: readOnly ? "default" : "pointer", padding: 0, lineHeight: 0 }}>
          <Icon name={n <= value ? "star-fill" : "star-line"} size={26} color={n <= value ? "var(--brand-yellow-dark)" : "var(--gray-300)"} />
        </button>
      ))}
    </div>
  );
}

/* ---------- learner: render ONE form field ---------- */
function FormFieldRenderer({ field, value, onChange }) {
  const f = field;
  switch (f.kind) {
    case "long-text": return <Textarea rows={3} value={value || ""} onChange={e => onChange(e.target.value)} placeholder={f.placeholder || "Your answer"} />;
    case "number": return <Input type="number" value={value || ""} onChange={e => onChange(e.target.value)} placeholder={f.placeholder || "0"} />;
    case "single-select": return <UI.RadioGroup value={value || ""} onChange={onChange} options={f.options || []} />;
    case "multi-select": return <UI.CheckboxGroup value={value || []} onChange={onChange} options={f.options || []} />;
    case "date": return <UI.DatePicker value={value || ""} onSelect={d => onChange(d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }))} placeholder="Pick a date" />;
    case "yes-no": return <UI.RadioPillGroup value={value || ""} onValueChange={onChange} options={[{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }]} />;
    case "rating": return <StarRating value={value || 0} onChange={onChange} />;
    case "file": return <SupportingDocsUploader files={value || []} onChange={onChange} max={1} hint="Upload your file — PDF, DOC, image, up to 10MB" />;
    default: return <Input value={value || ""} onChange={e => onChange(e.target.value)} placeholder={f.placeholder || "Your answer"} />;
  }
}

/* ---------- admin: edit ONE form field ---------- */
function FieldBuilder({ field, index, onChange, onRemove }) {
  const f = field;
  const set = (k, v) => onChange({ ...f, [k]: v });
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 14, background: "#fff" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <span style={{ fontFamily: "var(--font-control)", fontSize: 12, color: "var(--gray-400)", flex: "none" }}>Q{index + 1}</span>
        <div style={{ flex: 1, minWidth: 0 }}><Input value={f.label} onChange={e => set("label", e.target.value)} placeholder="Question / field label" /></div>
        <div style={{ width: 160, flex: "none" }}><Combobox value={FIELD_LABEL[f.kind]} onChange={(lbl) => set("kind", (FIELD_KINDS.find(k => k.label === lbl) || {}).value || "short-text")} options={FIELD_KINDS.map(k => k.label)} placeholder="Type" /></div>
        <button onClick={onRemove} style={{ border: 0, background: "none", cursor: "pointer", display: "flex", flex: "none" }}><Icon name="delete-bin-line" size={18} color="#EF4444" /></button>
      </div>
      {NEEDS_OPTIONS(f.kind) && (
        <div style={{ marginBottom: 10 }}>
          <Input value={(f.options || []).join(", ")} onChange={e => set("options", e.target.value.split(",").map(x => x.trim()).filter(Boolean))} placeholder="Options, comma-separated (e.g. Branch, Credit, Treasury)" />
        </div>
      )}
      <Checkbox checked={!!f.required} onChange={v => set("required", v)} label="Required" />
    </div>
  );
}

/* ---------- admin: edit ONE quiz question ---------- */
function QuizQuestionBuilder({ q, index, onChange, onRemove }) {
  const set = (k, v) => onChange({ ...q, [k]: v });
  const setOpt = (i, v) => set("options", q.options.map((o, j) => j === i ? v : o));
  const addOpt = () => set("options", [...q.options, ""]);
  const rmOpt = (i) => { const opts = q.options.filter((_, j) => j !== i); set("options", opts); if (q.correct >= opts.length) set("correct", 0); };
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 14, background: "#fff" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <span style={{ fontFamily: "var(--font-control)", fontSize: 12, color: "var(--gray-400)", flex: "none" }}>Q{index + 1}</span>
        <div style={{ flex: 1, minWidth: 0 }}><Input value={q.prompt} onChange={e => set("prompt", e.target.value)} placeholder="Question prompt" /></div>
        <button onClick={onRemove} style={{ border: 0, background: "none", cursor: "pointer", display: "flex", flex: "none" }}><Icon name="delete-bin-line" size={18} color="#EF4444" /></button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {q.options.map((o, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => set("correct", i)} title="Mark as correct answer" style={{ border: 0, background: "none", cursor: "pointer", display: "flex", flex: "none" }}>
              <Icon name={q.correct === i ? "checkbox-circle-fill" : "checkbox-blank-circle-line"} size={20} color={q.correct === i ? "var(--success)" : "var(--gray-300)"} />
            </button>
            <div style={{ flex: 1, minWidth: 0 }}><Input value={o} onChange={e => setOpt(i, e.target.value)} placeholder={`Option ${i + 1}`} /></div>
            {q.options.length > 2 && <button onClick={() => rmOpt(i)} style={{ border: 0, background: "none", cursor: "pointer", display: "flex", flex: "none" }}><Icon name="close-line" size={16} color="var(--gray-400)" /></button>}
          </div>
        ))}
        <button onClick={addOpt} style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 6, border: 0, background: "none", cursor: "pointer", padding: 0, fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 13, color: "var(--brand-yellow-dark)" }}>
          <Icon name="add-line" size={15} color="var(--brand-yellow-dark)" />Add option
        </button>
        <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-500)", display: "inline-flex", alignItems: "center", gap: 6 }}><Icon name="checkbox-circle-fill" size={14} color="var(--success)" />Correct answer — tick the green circle beside the right option.</div>
      </div>
    </div>
  );
}

// section progress helpers (shared by admin tracking + learner classroom)
function parseMins(str) { const m = String(str || "").match(/(\d+)\s*(min|hr|hour)/i); if (!m) return 0; const n = parseInt(m[1], 10); return /hr|hour/i.test(m[2]) ? n * 60 : n; }
function fmtMins(n) { if (!n) return "—"; return n >= 60 ? `${Math.round(n / 60)} hr${n >= 120 ? "s" : ""}` : `${n} min`; }
// estimated time for a section (auto-derived from its items / questions / fields)
function sectionEst(section) {
  if (!section) return 0;
  if (section.type === "content") return (section.items || []).reduce((t, it) => t + (parseMins(it.meta) || (it.type === "video" ? 5 : it.type === "post" ? 2 : it.type === "document" ? 3 : 1)), 0);
  if (section.type === "quiz") return Math.max(2, Math.round((section.questions || []).length * 1.2));
  if (section.type === "form") return Math.max(2, Math.round((section.fields || []).length * 0.8));
  return 3;
}
function courseEst(course) { return (course && course.sections || []).reduce((t, s) => t + sectionEst(s), 0); }
function sectionDone(assignment, sectionId) { return (assignment.doneSections || []).includes(sectionId); }
function courseProgress(course, assignment) {
  const total = (course.sections || []).length || 1;
  const done = (assignment.doneSections || []).filter(id => (course.sections || []).some(s => s.id === id)).length;
  return Math.round((done / total) * 100);
}

Object.assign(window, {
  LD_LOGO, SECTION_TYPES, SECTION_META, FIELD_KINDS, FIELD_LABEL, NEEDS_OPTIONS, CONTENT_ITEM_TYPES, CONTENT_ICON, COURSE_SOURCE_TINT,
  CourseThumb, ThumbnailPicker, StarRating, FormFieldRenderer, FieldBuilder, QuizQuestionBuilder, sectionDone, courseProgress,
  VideoPlayer, youtubeId, sectionEst, courseEst, fmtMins, parseMins,
});
