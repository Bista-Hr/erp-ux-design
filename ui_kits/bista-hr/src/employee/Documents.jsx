// BISTA HR · employee/Documents — the Documents tab: a left "File Type" filter rail
// (All Files / Pay Slips) beside a list of uploaded files. Each row shows the branded
// file-type icon (FileIcon, picked from the file's extension/type), name + size·ext, and
// Download / Edit / Archive actions (archive → confirm → toast).
//   "Upload Document" → UploadDocumentModal: a single-file drop zone + Document Name /
//   Document Type / Description, then confirm → toast. "Edit" → EditDocumentModal: same
//   fields pre-filled + the current file shown + an optional replace drop zone.
// Ported from the app's document components (FileDropZone / Upload+Edit dialogs / table)
// — the drop zone simulates a file pick so the flow stays clickable in the prototype.
const DOCUMENT_TYPES = [
  "Resume or CV", "Contract", "ID Card", "Passport", "Certificate",
  "Degree", "License", "Reference Letter", "Medical Report", "Other",
];
const DOCTYPE_OPTS = DOCUMENT_TYPES.map(t => ({ value: t, label: t }));

// Sample files a simulated "pick" can produce — varied types so icons differ.
const SAMPLE_FILES = [
  { name: "Employment Contract.pdf", size: "1.1 MB", ext: "PDF" },
  { name: "Updated Policy.docx", size: "320 KB", ext: "DOCX" },
  { name: "Budget Sheet.xlsx", size: "48 KB", ext: "XLSX" },
  { name: "Passport Photo.jpg", size: "1.9 MB", ext: "JPG" },
  { name: "Notes.txt", size: "3 KB", ext: "TXT" },
];

/* ---------- single-file drop zone (ported from FileDropZone; click simulates a pick) ---------- */
function FileDropZone({ file, onPick, onRemove, pickIndex = 0 }) {
  if (file) {
    return (
      <div style={{ border: "2px dashed var(--gray-300)", borderRadius: 12, padding: "22px 20px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
          <FileIcon type="" name={file.name} ext={file.ext} size={40} />
        </div>
        <div style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 14, color: "var(--gray-900)", maxWidth: 360, margin: "0 auto",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{file.name}</div>
        <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-400)", marginTop: 2 }}>{file.size}{file.ext ? ` · ${file.ext}` : ""}</div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
          <Button variant="stroke" size="sm" icon="close-line" onClick={onRemove}>Remove File</Button>
        </div>
      </div>
    );
  }
  return (
    <button onClick={() => onPick(SAMPLE_FILES[pickIndex % SAMPLE_FILES.length])}
      style={{ width: "100%", border: "2px dashed var(--gray-300)", background: "#FCFCFD", borderRadius: 12,
        padding: "30px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer" }}>
      <Icon name="upload-cloud-2-line" size={40} color="var(--gray-400)" />
      <div style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 14, color: "var(--gray-700)" }}>Choose a file or drag &amp; drop it here.</div>
      <div style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--gray-400)" }}>PDF, DOC, DOCX, TXT, JPEG, PNG — up to 10MB per document</div>
      <span style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 6, border: "1px solid var(--border)",
        borderRadius: 8, padding: "8px 16px", fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 13, color: "var(--gray-700)", background: "#fff" }}>Browse File</span>
    </button>
  );
}

/* ---------- file row ---------- */
function DocFileRow({ doc, onDownload, onEdit, onDelete }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 8px", borderBottom: "1px solid var(--divider)" }}>
      <FileIcon type={doc.docType} name={doc.name} ext={doc.ext} size={34} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 14, color: "var(--gray-900)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{doc.name}</div>
        <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-400)", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{doc.size} · {doc.ext}{doc.docType ? ` · ${doc.docType}` : ""}</div>
      </div>
      <button onClick={onDownload} title="Download" style={{ display: "inline-flex", alignItems: "center", gap: 6, border: 0, background: "none", flexShrink: 0,
        cursor: "pointer", fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 14, color: "var(--gray-700)", whiteSpace: "nowrap" }}>
        <Icon name="download-2-line" size={18} color="var(--gray-500)" />Download
      </button>
      {onEdit && (
        <button onClick={onEdit} title="Edit" className="btn btn-icon btn-ghost" style={{ width: 32, height: 32, padding: 0 }}>
          <Icon name="edit-2-line" size={17} color="var(--gray-500)" />
        </button>
      )}
      <button onClick={onDelete} title="Archive" style={{ width: 32, height: 32, borderRadius: 8, border: 0, background: "#E5484D",
        cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon name="delete-bin-6-line" size={17} color="#fff" />
      </button>
    </div>
  );
}

/* ---------- upload dialog (single file + name + type + description) ---------- */
function UploadDocumentModal({ noun, onClose, onUpload }) {
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [docType, setDocType] = useState("");
  const [desc, setDesc] = useState("");
  const [confirming, setConfirming] = useState(false);
  const valid = file && name.trim() && docType;
  const pick = (f) => { setFile(f); if (!name) setName(f.name.replace(/\.[^.]+$/, "")); };

  return (
    <Modal onClose={onClose} width={620}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "24px 24px 0" }}>
        <div>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 20, lineHeight: "28px", color: "var(--gray-900)" }}>Upload {noun}</div>
          <div className="bh-body" style={{ marginTop: 4 }}>Upload a new {noun.toLowerCase()} for this employee.</div>
        </div>
        <button className="btn btn-icon btn-ghost" onClick={onClose} style={{ width: 32, height: 32, padding: 0 }}><Icon name="close-line" size={20} color="var(--gray-500)" /></button>
      </div>

      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
        <FileDropZone file={file} onPick={pick} onRemove={() => setFile(null)} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Field label="Document Name"><Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Employment Contract" /></Field>
          <Field label="Document Type"><Combobox value={docType} onChange={setDocType} options={DOCTYPE_OPTS} placeholder="Select type" /></Field>
        </div>
        <Field label="Description" optional><Textarea rows={3} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Optional description…" /></Field>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: "0 24px 24px" }}>
        <Button variant="stroke" onClick={onClose}>Cancel</Button>
        <Button variant="primary" icon="upload-2-line" disabled={!valid} onClick={() => valid && setConfirming(true)}>Upload</Button>
      </div>

      {confirming && (
        <ConfirmModal title={`Upload ${noun}`} message={`Are you sure you want to upload this ${noun.toLowerCase()}?`}
          confirmLabel="Yes, Upload" confirmIcon="upload-2-line" cancelLabel="Cancel"
          onConfirm={() => onUpload({ name: name.trim() + (file.ext ? "" : ""), size: file.size, ext: file.ext, docType, desc: desc.trim() })}
          onClose={() => setConfirming(false)} />
      )}
    </Modal>
  );
}

/* ---------- edit dialog (prefilled + current file + optional replace) ---------- */
function EditDocumentModal({ noun, doc, onClose, onSave }) {
  const [name, setName] = useState(doc.name);
  const [docType, setDocType] = useState(doc.docType || "");
  const [desc, setDesc] = useState(doc.desc || "");
  const [replacement, setReplacement] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const valid = name.trim() && docType;

  return (
    <Modal onClose={onClose} width={620}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "24px 24px 0" }}>
        <div>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 20, lineHeight: "28px", color: "var(--gray-900)" }}>Edit {noun}</div>
          <div className="bh-body" style={{ marginTop: 4 }}>Update {noun.toLowerCase()} information.</div>
        </div>
        <button className="btn btn-icon btn-ghost" onClick={onClose} style={{ width: 32, height: 32, padding: 0 }}><Icon name="close-line" size={20} color="var(--gray-500)" /></button>
      </div>

      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Field label="Document Name"><Input value={name} onChange={e => setName(e.target.value)} /></Field>
          <Field label="Document Type"><Combobox value={docType} onChange={setDocType} options={DOCTYPE_OPTS} placeholder="Select type" /></Field>
        </div>
        <Field label="Description" optional><Textarea rows={3} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Optional description…" /></Field>

        <div>
          <div style={{ fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 13, color: "var(--gray-700)", marginBottom: 8 }}>File</div>
          {!replacement && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 14px",
              border: "1px solid #F0C24B", borderRadius: 10, background: "#FFFBEB", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <FileIcon type={doc.docType} name={doc.name} ext={doc.ext} size={30} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 14, color: "var(--gray-900)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{doc.name}</div>
                  <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-400)" }}>{doc.size} · {doc.ext}</div>
                </div>
              </div>
              <span style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 12, color: "var(--brand-yellow-dark)", flexShrink: 0 }}>Current File</span>
            </div>
          )}
          <div style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--gray-400)", marginBottom: 8 }}>
            {replacement ? "Replace with new file:" : "Select a new file to replace current:"}
          </div>
          <FileDropZone file={replacement} onPick={setReplacement} onRemove={() => setReplacement(null)} pickIndex={1} />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: "0 24px 24px" }}>
        <Button variant="stroke" onClick={onClose}>Cancel</Button>
        <Button variant="primary" disabled={!valid} onClick={() => valid && setConfirming(true)}>Update</Button>
      </div>

      {confirming && (
        <ConfirmModal title={`Update ${noun}`} message={`Are you sure you want to update this ${noun.toLowerCase()}?`}
          confirmLabel="Yes, Update" confirmIcon="check-line" cancelLabel="Cancel"
          onConfirm={() => onSave({ ...doc, name: name.trim(), docType, desc: desc.trim(),
            ...(replacement ? { size: replacement.size, ext: replacement.ext } : {}) })}
          onClose={() => setConfirming(false)} />
      )}
    </Modal>
  );
}

function FileTypeRail({ value, onChange }) {
  const items = [{ key: "document", label: "All Files" }, { key: "payslip", label: "Pay Slips" }];
  return (
    <div className="card" style={{ padding: 20, alignSelf: "flex-start", width: 220, flexShrink: 0 }}>
      <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 17, color: "var(--gray-900)", marginBottom: 14 }}>File Type</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {items.map(it => {
          const on = it.key === value;
          return (
            <button key={it.key} onClick={() => onChange(it.key)} style={{ display: "flex", alignItems: "center", gap: 10,
              border: 0, borderRadius: 8, padding: "10px 12px", cursor: "pointer", textAlign: "left",
              background: on ? "#FFF6E0" : "transparent",
              fontFamily: "var(--font-ui)", fontWeight: on ? 600 : 500, fontSize: 14, color: on ? "var(--gray-900)" : "var(--gray-600)" }}>
              <Icon name={on ? "folder-5-fill" : "folder-5-line"} size={18} color={on ? "var(--brand-yellow-dark)" : "var(--gray-400)"} />
              {it.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DocumentsTab({ d, edit }) {
  const [filter, setFilter] = useState("document");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const noun = filter === "payslip" ? "Pay Slip" : "Document";
  const list = d.documents.filter(x => x.type === filter);
  const pg = usePaged(list);

  const doUpload = (file) => {
    edit.set(p => ({ ...p, documents: [{ ...file, type: filter }, ...p.documents] }));
    edit.toast(`${noun} Uploaded`);
    setUploadOpen(false);
  };
  const doSaveEdit = (updated) => {
    edit.set(p => ({ ...p, documents: p.documents.map(x => x === editingDoc ? { ...updated, type: x.type } : x) }));
    edit.toast(`${noun} Updated`);
    setEditingDoc(null);
  };
  const doDelete = (doc) => edit.remove({ noun, verb: "Archive", pastVerb: "Archived", apply: () => edit.set(p => ({ ...p, documents: p.documents.filter(x => x !== doc) })) });

  return (
    <div style={{ display: "flex", gap: 20, marginTop: 20, alignItems: "flex-start" }}>
      <FileTypeRail value={filter} onChange={setFilter} />
      <div className="card" style={{ flex: 1, minWidth: 0, padding: "var(--card-pad, 24px)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 6 }}>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 20, color: "var(--gray-900)" }}>All Files</div>
          <Button variant="primary" icon="add-line" onClick={() => setUploadOpen(true)}>Upload {noun}</Button>
        </div>
        <div>
          {list.length === 0
            ? <EmptyState compact variant="document" title="No files yet" subtitle={`No ${noun.toLowerCase()}s have been uploaded for this employee.`} cta={`Upload ${noun}`} onAction={() => setUploadOpen(true)} />
            : pg.pageItems.map((doc, i) => <DocFileRow key={i} doc={doc} onDownload={() => {}} onEdit={filter === "document" ? () => setEditingDoc(doc) : null} onDelete={() => doDelete(doc)} />)}
        </div>
        {list.length > 0 && <Pagination page={pg.page} pages={pg.pages} onPrev={pg.prev} onNext={pg.next} />}
      </div>

      {uploadOpen && <UploadDocumentModal noun={noun} onClose={() => setUploadOpen(false)} onUpload={doUpload} />}
      {editingDoc && <EditDocumentModal noun={noun} doc={editingDoc} onClose={() => setEditingDoc(null)} onSave={doSaveEdit} />}
    </div>
  );
}

Object.assign(window, { DocumentsTab, UploadDocumentModal, EditDocumentModal, FileTypeRail, DocFileRow, FileDropZone });
