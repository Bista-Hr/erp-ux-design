// BISTA HR · forms/SupportingDocsUploader — reusable multi-file upload field for workflow
// forms (Promotions / Transfers / Change of Job Title / Exit / etc.). A dashed drop zone
// that opens the OS file picker on click (and accepts drag & drop) so users upload real
// files from their machine. Each picked file is shown with the branded FileIcon (right icon
// per type) and a remove button. Controlled: pass `files` (array of { name, ext, size })
// and `onChange`.
const SUPPORTING_ACCEPT = ".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.xls,.xlsx";

// human-readable file size from bytes
function fmtFileSize(bytes) {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
// map a real File → the { name, ext, size } shape the app renders
function fileToDoc(f) {
  const dot = f.name.lastIndexOf(".");
  const ext = dot > -1 ? f.name.slice(dot + 1).toUpperCase() : "";
  return { name: f.name, ext, size: fmtFileSize(f.size) };
}

function SupportingDocsUploader({ files = [], onChange, max = 5, accept = SUPPORTING_ACCEPT, hint = "PDF, DOC, DOCX, TXT, JPEG, PNG — up to 10MB per document" }) {
  const inputRef = React.useRef(null);
  const [drag, setDrag] = React.useState(false);
  const full = files.length >= max;

  const addFiles = (list) => {
    const incoming = Array.from(list || []).map(fileToDoc);
    if (!incoming.length) return;
    onChange([...files, ...incoming].slice(0, max));
  };
  const openPicker = () => { if (!full && inputRef.current) inputRef.current.click(); };
  const remove = (i) => onChange(files.filter((_, j) => j !== i));

  return (
    <div>
      <input ref={inputRef} type="file" accept={accept} multiple hidden
        onChange={e => { addFiles(e.target.files); e.target.value = ""; }} />

      <div role="button" tabIndex={0} onClick={openPicker}
        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openPicker(); } }}
        onDragOver={e => { e.preventDefault(); if (!full) setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); if (!full) addFiles(e.dataTransfer.files); }}
        style={{ width: "100%", boxSizing: "border-box", border: `2px dashed ${drag ? "var(--brand-yellow-dark)" : "var(--gray-300)"}`,
          background: full ? "var(--gray-100)" : drag ? "#FFFBEB" : "#FCFCFD", borderRadius: 12, transition: "background .15s, border-color .15s",
          padding: "26px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textAlign: "center", cursor: full ? "not-allowed" : "pointer" }}>
        <Icon name="upload-cloud-2-line" size={36} color={drag ? "var(--brand-yellow-dark)" : "var(--gray-400)"} />
        <div style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 14, color: "var(--gray-700)" }}>
          {full ? `Maximum ${max} files reached` : "Choose a file or drag & drop it here."}
        </div>
        <div style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--gray-400)", maxWidth: "100%" }}>{hint}</div>
        {!full && (
          <span style={{ marginTop: 6, display: "inline-flex", alignItems: "center", gap: 6, border: "1px solid var(--border)",
            borderRadius: 8, padding: "8px 16px", fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 13, color: "var(--gray-700)", background: "#fff" }}>Browse File</span>
        )}
      </div>

      {files.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
          {files.map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 10 }}>
              <FileIcon type={f.docType} name={f.name} ext={f.ext} size={28} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 13.5, color: "var(--gray-900)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.name}</div>
                <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--gray-400)" }}>{f.size}{f.ext ? ` · ${f.ext}` : ""}</div>
              </div>
              <button onClick={() => remove(i)} className="btn btn-icon btn-ghost" style={{ width: 30, height: 30, padding: 0 }}>
                <Icon name="close-line" size={16} color="var(--gray-500)" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { SupportingDocsUploader, fmtFileSize, fileToDoc });
