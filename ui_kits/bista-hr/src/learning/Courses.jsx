// BISTA HR · learning/Courses — Learning & Development ▸ Courses (admin, interactive LXP).
//   library : thumbnail course cards (GCB logo snipped from the image) — View / Edit / Assign
//   create  : title · source · category · summary · THUMBNAIL upload, then a SECTION builder —
//             each section is content / quiz / form / document-import; forms carry typed fields.
//   detail  : thumbnail header + every section laid out + a per-course tracking table
//   assign  : pick learners → writes window.HRStores.ldAssignments → appears in My Learning.
const { useState: useCo, useEffect: useCoEffect } = React;

function courseStat(assignments, courseId, status) { return assignments.filter(x => x.courseId === courseId && x.status === status).length; }

/* ---------- LIBRARY CARD ---------- */
function CourseCard({ course, assignments, onOpen, onAssign, onEdit }) {
  const a = assignments.filter(x => x.courseId === course.id);
  const done = a.filter(x => x.status === "Completed").length;
  const prog = a.filter(x => x.status === "In Progress").length;
  const st = COURSE_SOURCE_TINT[course.source] || COURSE_SOURCE_TINT.Internal;
  const secCount = (course.sections || []).length;
  const hasQuiz = (course.sections || []).some(s => s.type === "quiz");
  const hasForm = (course.sections || []).some(s => s.type === "form");
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", cursor: "pointer" }} onClick={() => onOpen(course)}>
      <div style={{ position: "relative" }}>
        <CourseThumb course={course} />
        <span className="bh-chip" style={{ position: "absolute", top: 10, right: 10, color: st.c, background: st.b }}>{course.source}</span>
      </div>
      <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
        <div>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 16, color: "var(--gray-900)" }}>{course.title}</div>
          <div className="bh-caption" style={{ marginTop: 2 }}>{course.category} · {secCount} section{secCount === 1 ? "" : "s"}</div>
        </div>
        <div style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--gray-500)", lineHeight: 1.5, minHeight: 38 }}>{course.summary}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <span className="bh-chip"><Icon name="group-line" size={13} color="var(--gray-500)" style={{ marginRight: 5 }} />{a.length} assigned</span>
          <span className="bh-chip" style={{ color: "var(--success-deep)" }}>{done} done</span>
          {prog > 0 && <span className="bh-chip" style={{ color: "var(--warning-deep)" }}>{prog} in progress</span>}
          {hasQuiz && <span className="bh-chip" style={{ color: "var(--brand-blue)", background: "#F4F7FF" }}><Icon name="question-answer-line" size={12} style={{ marginRight: 4 }} />Quiz</span>}
          {hasForm && <span className="bh-chip" style={{ color: "#6941C6", background: "#F4F0FF" }}><Icon name="survey-line" size={12} style={{ marginRight: 4 }} />Form</span>}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: "auto" }} onClick={e => e.stopPropagation()}>
          <Button variant="stroke" size="sm" icon="eye-line" onClick={() => onOpen(course)}>View</Button>
          <Button variant="stroke" size="sm" icon="edit-2-line" onClick={() => onEdit(course)}>Edit</Button>
          <Button variant="primary" size="sm" icon="user-add-line" onClick={() => onAssign(course)}>Assign</Button>
        </div>
      </div>
    </div>
  );
}

/* ---------- ASSIGN MODAL ---------- */
function AssignModal({ course, assignments, onClose, onAssign }) {
  const DIR = window.EMPLOYEE_DIRECTORY || {};
  const already = new Set(assignments.filter(a => a.courseId === course.id).map(a => a.learner));
  const [people, setPeople] = useCo([]);
  const [due, setDue] = useCo("");
  const options = LD_LEARNERS.filter(n => !already.has(n));
  return (
    <Modal onClose={onClose} width={560}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
        <div className="bh-h2" style={{ fontSize: 18 }}>Assign · {course.title}</div>
        <button onClick={onClose} style={{ border: 0, background: "none", cursor: "pointer", display: "flex" }}><Icon name="close-line" size={22} color="var(--gray-500)" /></button>
      </div>
      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="bh-body">Assigned courses appear in each learner's <strong>My Learning</strong> classroom. Already-assigned learners are excluded.</div>
        <Field label="Learners"><MultiSelectCombobox value={people} onChange={setPeople} options={options} placeholder="Select learners" avatar /></Field>
        <Field label="Completion Due" optional><UI.DatePicker value={due} onSelect={d => setDue(d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }))} placeholder="Pick a due date" /></Field>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: "16px 24px", borderTop: "1px solid var(--border)" }}>
        <Button variant="stroke" onClick={onClose}>Cancel</Button>
        <Button variant="primary" icon="user-add-line" disabled={people.length === 0} onClick={() => onAssign(course, people, due)}>Assign to {people.length || ""} learner{people.length === 1 ? "" : "s"}</Button>
      </div>
    </Modal>
  );
}

/* ---------- SECTION EDITOR (one section in the form) ---------- */
function SectionEditor({ section, index, count, onChange, onRemove, onMove }) {
  const s = section; const meta = SECTION_META[s.type] || {};
  const set = (k, v) => onChange({ ...s, [k]: v });
  // content items
  const setItem = (i, k, v) => set("items", s.items.map((it, j) => j === i ? { ...it, [k]: v } : it));
  const addItem = () => set("items", [...(s.items || []), { id: ldId(), type: "video", title: "", meta: "" }]);
  const rmItem = (i) => set("items", s.items.filter((_, j) => j !== i));
  // quiz questions
  const setQ = (i, q) => set("questions", s.questions.map((x, j) => j === i ? q : x));
  const addQ = () => set("questions", [...(s.questions || []), { id: ldId(), prompt: "", options: ["", ""], correct: 0 }]);
  const rmQ = (i) => set("questions", s.questions.filter((_, j) => j !== i));
  // form fields
  const setF = (i, f) => set("fields", s.fields.map((x, j) => j === i ? f : x));
  const addF = () => set("fields", [...(s.fields || []), { id: ldId(), label: "", kind: "short-text", required: false }]);
  const rmF = (i) => set("fields", s.fields.filter((_, j) => j !== i));
  // doc
  const setDocFile = (files) => set("file", files[0] || null);

  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "var(--gray-50)", borderBottom: "1px solid var(--border)" }}>
        <span style={{ width: 30, height: 30, borderRadius: 8, background: "#fff", border: "1px solid var(--border)", display: "grid", placeItems: "center", flex: "none" }}><Icon name={meta.icon} size={16} color="var(--gray-600)" /></span>
        <span style={{ fontFamily: "var(--font-control)", fontSize: 12, color: "var(--gray-400)", flex: "none" }}>Section {index + 1} · {meta.label}</span>
        <div style={{ flex: 1, minWidth: 0 }}><Input value={s.title} onChange={e => set("title", e.target.value)} placeholder={`${meta.label} title`} /></div>
        <button disabled={index === 0} onClick={() => onMove(-1)} style={{ border: 0, background: "none", cursor: index === 0 ? "default" : "pointer", display: "flex", flex: "none", opacity: index === 0 ? 0.3 : 1 }}><Icon name="arrow-up-line" size={17} color="var(--gray-500)" /></button>
        <button disabled={index === count - 1} onClick={() => onMove(1)} style={{ border: 0, background: "none", cursor: index === count - 1 ? "default" : "pointer", display: "flex", flex: "none", opacity: index === count - 1 ? 0.3 : 1 }}><Icon name="arrow-down-line" size={17} color="var(--gray-500)" /></button>
        <button onClick={onRemove} style={{ border: 0, background: "none", cursor: "pointer", display: "flex", flex: "none" }}><Icon name="delete-bin-line" size={18} color="#EF4444" /></button>
      </div>
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        {s.type === "content" && <React.Fragment>
          {(s.items || []).map((it, i) => (
            <div key={it.id} style={{ display: "flex", flexDirection: "column", gap: 10, border: (it.type === "post" || it.type === "video") ? "1px solid var(--border)" : 0, borderRadius: (it.type === "post" || it.type === "video") ? 10 : 0, padding: (it.type === "post" || it.type === "video") ? 12 : 0 }}>
              <div style={{ display: "grid", gridTemplateColumns: "170px 2fr 1fr 40px", gap: 12, alignItems: "center" }}>
                <Combobox value={(CONTENT_ITEM_TYPES.find(t => t.value === it.type) || {}).label} onChange={(lbl) => setItem(i, "type", (CONTENT_ITEM_TYPES.find(t => t.label === lbl) || {}).value || "video")} options={CONTENT_ITEM_TYPES.map(t => t.label)} placeholder="Type" />
                <Input value={it.title} onChange={e => setItem(i, "title", e.target.value)} placeholder="Item title" />
                <Input value={it.meta} onChange={e => setItem(i, "meta", e.target.value)} placeholder={it.type === "post" ? "e.g. 3 min read" : "e.g. 8 min / 1.2 MB"} />
                <button onClick={() => rmItem(i)} style={{ border: 0, background: "none", cursor: "pointer", display: "flex", justifyContent: "center" }}><Icon name="delete-bin-line" size={18} color="#EF4444" /></button>
              </div>
              {it.type === "video" && <Input value={it.url || ""} onChange={e => setItem(i, "url", e.target.value)} placeholder="YouTube link or direct video URL (.mp4) — plays inline; leave blank for a preview placeholder" />}
              {it.type === "post" && <UI.RichText value={it.html || ""} onChange={(html) => setItem(i, "html", html)} placeholder="Write the article — headings, bold, lists, links… (like a Coursera reading)" />}
            </div>
          ))}
          <AddLink onClick={addItem} label="Add content item" />
        </React.Fragment>}

        {s.type === "quiz" && <React.Fragment>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--gray-600)" }}>Pass mark</span>
            <div style={{ width: 90 }}><Input type="number" value={s.passMark} onChange={e => set("passMark", Number(e.target.value) || 0)} placeholder="70" /></div>
            <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--gray-400)" }}>%</span>
          </div>
          {(s.questions || []).map((q, i) => <QuizQuestionBuilder key={q.id} q={q} index={i} onChange={(nq) => setQ(i, nq)} onRemove={() => rmQ(i)} />)}
          <AddLink onClick={addQ} label="Add question" />
        </React.Fragment>}

        {s.type === "form" && <React.Fragment>
          <Textarea rows={2} value={s.description || ""} onChange={e => set("description", e.target.value)} placeholder="Short description / instructions (optional)" />
          {(s.fields || []).map((f, i) => <FieldBuilder key={f.id} field={f} index={i} onChange={(nf) => setF(i, nf)} onRemove={() => rmF(i)} />)}
          <AddLink onClick={addF} label="Add field" />
        </React.Fragment>}

        {s.type === "doc" && <React.Fragment>
          <SupportingDocsUploader files={s.file ? [s.file] : []} onChange={setDocFile} max={1} hint="Attach one file — PDF, DOC, XLSX, image, up to 10MB" />
          <Input value={s.note || ""} onChange={e => set("note", e.target.value)} placeholder="Instruction (e.g. Download and keep for reference)" />
        </React.Fragment>}
      </div>
    </div>
  );
}
function AddLink({ onClick, label }) {
  return <button onClick={onClick} style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 6, border: 0, background: "none", cursor: "pointer", padding: 0, fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 13, color: "var(--brand-yellow-dark)" }}><Icon name="add-line" size={15} color="var(--brand-yellow-dark)" />{label}</button>;
}

/* ---------- CREATE / EDIT (full page) ---------- */
function CourseForm({ initial, onCancel, onSubmit }) {
  const [f, setF] = useCo(initial || { title: "", source: "Internal", category: "", summary: "", thumbnail: "", sections: [{ id: ldId(), type: "content", title: "Module 1", items: [{ id: ldId(), type: "video", title: "", meta: "" }] }] });
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const setSection = (i, sec) => setF(s => ({ ...s, sections: s.sections.map((x, j) => j === i ? sec : x) }));
  const moveSection = (i, dir) => setF(s => { const arr = [...s.sections]; const j = i + dir; if (j < 0 || j >= arr.length) return s; [arr[i], arr[j]] = [arr[j], arr[i]]; return { ...s, sections: arr }; });
  const rmSection = (i) => setF(s => ({ ...s, sections: s.sections.filter((_, j) => j !== i) }));
  const addSection = (type) => {
    const base = { id: ldId(), title: SECTION_META[type].label };
    const seeded = type === "content" ? { ...base, type, items: [{ id: ldId(), type: "video", title: "", meta: "" }] }
      : type === "quiz" ? { ...base, type, passMark: 70, questions: [{ id: ldId(), prompt: "", options: ["", ""], correct: 0 }] }
      : type === "form" ? { ...base, type, description: "", fields: [{ id: ldId(), label: "", kind: "short-text", required: false }] }
      : { ...base, type, file: null, note: "" };
    setF(s => ({ ...s, sections: [...s.sections, seeded] }));
  };
  const valid = f.title && f.category && f.sections.length > 0;
  return (
    <div className="card" style={{ padding: "var(--card-pad, 24px)", overflow: "visible" }}>
      <div style={{ marginBottom: 8 }}>
        <div className="bh-h2" style={{ fontSize: 24 }}>{initial ? "Edit Course" : "Add Course"}</div>
        <div className="bh-body" style={{ marginTop: 4 }}>Set up the course, add a thumbnail, then build its interactive sections.</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 920 }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 20 }}>
          <Field label="Course Title"><Input value={f.title} onChange={e => set("title", e.target.value)} placeholder="e.g. AML & CFT Essentials" /></Field>
          <Field label="Source"><Combobox value={f.source} onChange={v => set("source", v)} options={["Internal", "Percipio", "Intuition"]} placeholder="Select" /></Field>
          <Field label="Category"><Input value={f.category} onChange={e => set("category", e.target.value)} placeholder="e.g. Compliance" /></Field>
        </div>
        <Field label="Summary"><Textarea rows={2} value={f.summary} onChange={e => set("summary", e.target.value)} placeholder="One-line description of the course." /></Field>
        <Field label="Thumbnail" optional><ThumbnailPicker value={f.thumbnail} onChange={v => set("thumbnail", v)} /></Field>

        <div style={{ height: 1, background: "var(--border)" }} />
        <div><div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 18, color: "var(--gray-900)" }}>Sections</div>
          <div className="bh-body" style={{ marginTop: 2 }}>Build the course from sections — content, a scored quiz, a form, or a document import.</div></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {f.sections.map((sec, i) => <SectionEditor key={sec.id} section={sec} index={i} count={f.sections.length} onChange={(ns) => setSection(i, ns)} onRemove={() => rmSection(i)} onMove={(dir) => moveSection(i, dir)} />)}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {SECTION_TYPES.map(t => <Button key={t.value} variant="stroke" size="sm" icon={t.icon} onClick={() => addSection(t.value)}>Add {t.label}</Button>)}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
        <Button variant="stroke" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" icon={initial ? "check-line" : "add-line"} disabled={!valid} onClick={() => valid && onSubmit(f)}>{initial ? "Save Changes" : "Add Course"}</Button>
      </div>
    </div>
  );
}

/* ---------- SECTION PREVIEW (detail page, read-only) ---------- */
function SectionPreview({ section }) {
  const s = section; const meta = SECTION_META[s.type] || {};
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", background: "var(--gray-50)", borderBottom: "1px solid var(--border)" }}>
        <Icon name={meta.icon} size={16} color="var(--gray-600)" />
        <span style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 14, color: "var(--gray-900)" }}>{s.title}</span>
        <span className="bh-chip" style={{ marginLeft: "auto" }}>{meta.label}{s.type === "quiz" ? ` · pass ${s.passMark}%` : ""}</span>
      </div>
      <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
        {s.type === "content" && (s.items || []).map(it => (
          <div key={it.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>{it.type === "document" ? <FileIcon name={(it.file && it.file.name) || it.title} ext={it.file && it.file.ext} size={22} /> : <Icon name={CONTENT_ICON[it.type]} size={16} color="var(--gray-500)" />}<span style={{ fontFamily: "var(--font-ui)", fontSize: 13.5, color: "var(--gray-800)" }}>{it.title}</span><span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-400)" }}>{it.meta}</span></div>
        ))}
        {s.type === "quiz" && (s.questions || []).map((q, i) => (
          <div key={q.id} style={{ fontFamily: "var(--font-ui)", fontSize: 13.5, color: "var(--gray-800)" }}>{i + 1}. {q.prompt} <span style={{ color: "var(--gray-400)" }}>({q.options.length} options)</span></div>
        ))}
        {s.type === "form" && (s.fields || []).map((fl, i) => (
          <div key={fl.id} style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontFamily: "var(--font-ui)", fontSize: 13.5, color: "var(--gray-800)" }}>{i + 1}. {fl.label || <em style={{ color: "var(--gray-400)" }}>Untitled</em>}</span><span className="bh-chip" style={{ fontSize: 11 }}>{FIELD_LABEL[fl.kind]}{fl.required ? " · required" : ""}</span></div>
        ))}
        {s.type === "doc" && (s.file ? <div style={{ display: "flex", alignItems: "center", gap: 10 }}><FileIcon name={s.file.name} ext={s.file.ext} size={28} /><span style={{ fontFamily: "var(--font-ui)", fontSize: 13.5, color: "var(--gray-800)" }}>{s.file.name}</span><span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-400)" }}>{s.file.size}</span></div> : <span className="bh-caption">No file attached.</span>)}
      </div>
    </div>
  );
}

/* ---------- DETAIL ---------- */
function CourseDetail({ course, assignments, onAssign, onEdit }) {
  const a = assignments.filter(x => x.courseId === course.id);
  const count = (s) => a.filter(x => x.status === s).length;
  const secs = (course.sections || []).length;
  const chip = { display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 11px", borderRadius: 999, background: "rgba(13,27,42,.55)", WebkitBackdropFilter: "blur(6px)", backdropFilter: "blur(6px)", color: "#fff", fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 12 };
  const dot = (c) => ({ width: 8, height: 8, borderRadius: "50%", background: c, flex: "none" });
  const statuses = [["Completed", count("Completed"), "var(--success)"], ["In progress", count("In Progress"), "#F59E0B"], ["Not started", count("Not Started"), "#CBD5E1"]];
  const metaChip = (icon, text) => <span className="bh-chip"><Icon name={icon} size={13} color="var(--gray-500)" style={{ marginRight: 5 }} />{text}</span>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title={course.title} subtitle={`${course.source} · ${course.category}`}
        actions={<React.Fragment>
          <Button variant="stroke" icon="edit-2-line" onClick={onEdit}>Edit</Button>
          <Button variant="primary" icon="user-add-line" onClick={onAssign}>Assign</Button>
        </React.Fragment>} />

      {/* thumbnail hero — image + completion statuses only */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ position: "relative" }}>
          <CourseThumb course={course} height={190} radius={0} flat />
          <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end", maxWidth: "70%" }}>
            {statuses.map(([label, n, c]) => <span key={label} style={chip}><span style={dot(c)} />{n} {label}</span>)}
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "14px 18px 14px 88px" }}>
            <div style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 20, color: "#fff", textShadow: "0 1px 8px rgba(13,27,42,.55)", lineHeight: 1.2 }}>{course.title}</div>
            <div style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "rgba(255,255,255,.9)", textShadow: "0 1px 6px rgba(13,27,42,.55)", marginTop: 2 }}>{course.source} · {course.category}</div>
          </div>
        </div>
      </div>

      {/* course detail — summary + meta, its own card */}
      <div className="card" style={{ padding: 0 }}>
        <DetailCard icon="information-line" title="Course details">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--gray-600)", lineHeight: 1.6 }}>{course.summary}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {metaChip("list-check-3", `${secs} section${secs === 1 ? "" : "s"}`)}
              {metaChip("time-line", fmtMins(courseEst(course)))}
              {metaChip("group-line", `${a.length} assigned`)}
            </div>
          </div>
        </DetailCard>
      </div>

      {/* course content — its own card */}
      <div className="card" style={{ padding: 0 }}>
        <DetailCard icon="stack-line" title={`Course content (${secs} section${secs === 1 ? "" : "s"})`}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {(course.sections || []).map(s => <SectionPreview key={s.id} section={s} />)}
          </div>
        </DetailCard>
      </div>

      {/* tracking — its own card */}
      <div className="card" style={{ padding: 0 }}>
        <DetailCard icon="group-line" title={`Tracking (${a.length} assignees)`}>
          {a.length === 0 ? <EmptyState compact variant="users" title="Not assigned yet" subtitle="Assign this course to learners to track progress." />
            : <table className="bh" style={{ margin: 0 }}>
                <thead><tr><th>Learner</th><th>Progress</th><th>Due</th><th>Status</th></tr></thead>
                <tbody>{a.map(x => (
                  <tr key={x.id}>
                    <td><span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}><Avatar name={x.learner} size={32} /><span style={{ fontWeight: 500, color: "var(--gray-900)" }}>{x.learner}</span></span></td>
                    <td><div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 90, height: 8, borderRadius: 999, background: "var(--gray-100)", overflow: "hidden" }}><div style={{ height: "100%", width: x.progress + "%", background: "var(--brand-yellow-dark)" }} /></div><span style={{ fontSize: 12, color: "var(--gray-500)" }}>{x.progress}%</span></div></td>
                    <td>{x.due}</td>
                    <td><StatusBadge variant={LD_COURSE_VARIANT[x.status]} text={x.status} size="sm" /></td>
                  </tr>
                ))}</tbody>
              </table>}
        </DetailCard>
      </div>
    </div>
  );
}

/* ---------- CONTROLLER ---------- */
function CoursesScreen({ onToast, onSubPage }) {
  const [courses, setCourses] = useStore(window.HRStores.ldCourses);
  const [assignments, setAssignments] = useStore(window.HRStores.ldAssignments);
  const [q, setQ] = useCo("");
  const [view, setView] = useCo({ name: "library" });
  const [assignFor, setAssignFor] = useCo(null);
  const [confirm, setConfirm] = useCo(null);

  useCoEffect(() => {
    if (!onSubPage) return;
    const toLib = () => setView({ name: "library" });
    if (view.name === "create") onSubPage({ trail: [{ label: "Courses", onClick: toLib }, { label: "Add Course" }] });
    else if (view.name === "edit") onSubPage({ trail: [{ label: "Courses", onClick: toLib }, { label: "Edit Course" }] });
    else if (view.name === "detail") { const c = courses.find(x => x.id === view.id); onSubPage({ trail: [{ label: "Courses", onClick: toLib }, { label: c ? c.title : "Course" }] }); }
    else onSubPage(null);
    return () => onSubPage(null);
  }, [view, courses]);

  const current = view.id ? courses.find(c => c.id === view.id) : null;
  const doAssign = (course, people, due) => {
    const fresh = people.map(n => ({ id: ldId(), courseId: course.id, learner: n, status: "Not Started", progress: 0, due: due || "—", assignedOn: ldToday(), doneSections: [], viewed: {}, quizScores: {}, formResponses: {} }));
    setAssignments(as => [...fresh, ...as]);
    onToast(`Assigned to ${people.length} learner${people.length === 1 ? "" : "s"}`, { tone: "success" });
    setAssignFor(null);
  };
  const submit = (f) => setConfirm({ kind: view.name === "edit" ? "edit" : "add", form: f, id: view.id });
  const run = () => {
    const c = confirm;
    if (c.kind === "add") { setCourses(cs => [{ id: ldId(), ...c.form }, ...cs]); onToast("Course Added", { tone: "success" }); setView({ name: "library" }); }
    else if (c.kind === "edit") { setCourses(cs => cs.map(x => x.id === c.id ? { ...x, ...c.form } : x)); onToast("Course Updated", { tone: "success" }); setView({ name: "detail", id: c.id }); }
    setConfirm(null);
  };

  let body;
  if (view.name === "create") body = <CourseForm onCancel={() => setView({ name: "library" })} onSubmit={submit} />;
  else if (view.name === "edit" && current) body = <CourseForm initial={JSON.parse(JSON.stringify(current))} onCancel={() => setView({ name: "detail", id: current.id })} onSubmit={submit} />;
  else if (view.name === "detail" && current) body = <CourseDetail course={current} assignments={assignments} onAssign={() => setAssignFor(current)} onEdit={() => setView({ name: "edit", id: current.id })} />;
  else {
    const shown = courses.filter(c => q === "" || (c.title + c.category + c.source).toLowerCase().includes(q.toLowerCase()));
    body = (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <PageHeader title="Courses" subtitle="Interactive courses — content, quizzes, forms and documents that power My Learning."
          actions={<Button variant="primary" icon="add-line" onClick={() => setView({ name: "create" })}>Add Course</Button>} />
        <div className="card" style={{ padding: "var(--card-pad, 24px)" }}>
          <div style={{ maxWidth: 320 }}><UI.SearchInput value={q} onChange={setQ} placeholder="Search courses…" /></div>
        </div>
        {shown.length === 0 ? <div className="card" style={{ padding: 8 }}><EmptyState title="No courses" subtitle="Add a course to build the library." /></div>
          : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))", gap: 16 }}>
              {shown.map(c => <CourseCard key={c.id} course={c} assignments={assignments} onOpen={(c) => setView({ name: "detail", id: c.id })} onAssign={setAssignFor} onEdit={(c) => setView({ name: "edit", id: c.id })} />)}
            </div>}
      </div>
    );
  }

  return (
    <React.Fragment>
      {body}
      {assignFor && <AssignModal course={assignFor} assignments={assignments} onClose={() => setAssignFor(null)} onAssign={doAssign} />}
      {confirm && (() => { const CC = { add: ["Add Course", "add this course", "Yes, Add", "add-line"], edit: ["Save Changes", "save changes", "Yes, Save", "check-line"] }; const [t, m, l, i] = CC[confirm.kind]; return (
        <ConfirmModal title={t} message={`Are you sure you want to ${m}?`} confirmLabel={l} confirmIcon={i} cancelLabel="Cancel" onConfirm={run} onClose={() => setConfirm(null)} />
      ); })()}
    </React.Fragment>
  );
}

Object.assign(window, { CoursesScreen });
