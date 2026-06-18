// BISTA HR · forms/MultiImageDropZone — the canonical multi-file dropzone used by the
// workflow forms (Promotions / Transfers / Exit / …). Ported 1:1 from the app's
// components/shared/MultiImageDropZone: click OR drag & drop, multi-file, with a horizontal
// gallery of 160px thumbnail cards. Supports BOTH create and edit:
//   • New files (this session)  → blue "NEW" badge + red ✕ to remove.
//   • Existing files (edit mode) → shown from `existingImages` URLs; ✕ marks them removed
//     (40% opacity + "REMOVED" overlay) and the overlay is click-to-restore.
//   • Empty state           → one large dropzone; once anything is present a compact dropzone
//                             sits above the gallery.
// Image files render a live preview (FileReader); everything else shows the branded FileIcon.
//   Props: selectedFiles (File[]), onFilesSelect(files), existingImages (string[]),
//          onRemoveExistingImage(url), onRestoreImage(url), removedImages (string[]),
//          isEditMode, maxFiles, maxSize, idleText, idleTextEmpty, acceptedFileTypesText, accept, multiple.
const MIDZ_ACCEPT = ".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx";
const MIDZ_MAX = 5 * 1024 * 1024;
const { useState: useMidz, useRef: useMidzRef, useCallback: useMidzCb } = React;

// url → is it a renderable image
const isImageUrl = (url) => /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url || "");
const fileNameFromUrl = (url) => { try { return decodeURIComponent((url || "").split("/").pop().split("?")[0]) || url; } catch (e) { return url; } };

function MultiImageDropZone({
  selectedFiles = [], onFilesSelect, existingImages = [], onRemoveExistingImage, onRestoreImage,
  removedImages = [], isEditMode = true, maxFiles = 10, maxSize = MIDZ_MAX,
  idleText = "Add file here", idleTextEmpty = "Upload file here",
  acceptedFileTypesText = "(jpeg, jpg, png, PDF, DOC, DOCX)", accept = MIDZ_ACCEPT, multiple = true,
}) {
  const inputRef = useMidzRef(null);
  const [previews, setPreviews] = useMidz([]);   // dataURL | null, index-aligned with selectedFiles
  const [drag, setDrag] = useMidz(false);

  const readPreview = (file) => new Promise(res => {
    if (!file.type.startsWith("image/")) return res(null);
    const r = new FileReader(); r.onloadend = () => res(r.result); r.readAsDataURL(file);
  });

  const addFiles = useMidzCb(async (list) => {
    const incoming = Array.from(list || []);
    if (!incoming.length) return;
    const total = existingImages.length + selectedFiles.length + incoming.length;
    if (total > maxFiles) { window.toast ? window.toast.error(`You can only upload up to ${maxFiles} files`) : alert(`You can only upload up to ${maxFiles} files`); return; }
    const tooBig = incoming.find(f => f.size > maxSize);
    if (tooBig) { window.toast ? window.toast.error(`File exceeds ${Math.round(maxSize / (1024 * 1024))}MB limit`) : null; return; }
    const newPreviews = await Promise.all(incoming.map(readPreview));
    setPreviews(p => [...p, ...newPreviews]);
    onFilesSelect([...selectedFiles, ...incoming]);
  }, [selectedFiles, existingImages.length, maxFiles, maxSize, onFilesSelect]);

  const removeFile = (i) => { onFilesSelect(selectedFiles.filter((_, j) => j !== i)); setPreviews(p => p.filter((_, j) => j !== i)); };
  const openPicker = () => inputRef.current && inputRef.current.click();
  const hasContent = existingImages.length > 0 || selectedFiles.length > 0;

  const dropZone = (compact) => (
    <div role="button" tabIndex={0} onClick={openPicker}
      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openPicker(); } }}
      onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}
      style={{ width: "fit-content", border: `2px dashed ${drag ? "var(--brand-yellow-dark)" : "var(--gray-300)"}`,
        background: drag ? "#FFFBEB" : "var(--gray-50)", borderRadius: 10, cursor: "pointer",
        padding: compact ? "16px 40px" : "16px 40px", transition: "background .15s, border-color .15s" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, width: "fit-content" }}>
        <Icon name={drag ? "upload-2-line" : "image-line"} size={32} color={drag ? "var(--brand-yellow-dark)" : "var(--gray-500)"} />
        <div>
          <div style={{ fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 13, color: "var(--gray-600)" }}>{compact ? idleText : idleTextEmpty}</div>
          <div style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 12, color: "var(--gray-500)" }}>{acceptedFileTypesText}</div>
        </div>
      </div>
    </div>
  );

  const card = (children, key, extraStyle) => (
    <div key={key} className="bh-midz-card" style={{ position: "relative" }}>
      <div style={{ width: 160, height: 160, borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)",
        background: "var(--gray-50)", display: "flex", alignItems: "center", justifyContent: "center", ...extraStyle }}>{children}</div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <input ref={inputRef} type="file" accept={accept} multiple={multiple} hidden
        onChange={e => { addFiles(e.target.files); e.target.value = ""; }} />

      {!hasContent ? dropZone(false) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {dropZone(true)}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {existingImages.map((url, i) => {
              const removed = removedImages.includes(url);
              const inner = isImageUrl(url)
                ? <img src={url} alt={`Upload ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: 8, textAlign: "center" }}>
                    <FileIcon name={fileNameFromUrl(url)} size={48} />
                    <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--gray-500)", maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fileNameFromUrl(url)}</span>
                  </div>;
              return (
                <div key={`existing-${url}`} className="bh-midz-card" style={{ position: "relative" }}>
                  <div style={{ width: 160, height: 160, borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)", background: "var(--gray-50)",
                    display: "flex", alignItems: "center", justifyContent: "center", opacity: removed ? 0.4 : 1, transition: "opacity .15s" }}>{inner}</div>
                  {removed && onRestoreImage ? (
                    <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRestoreImage(url); }}
                      style={{ position: "absolute", inset: 0, borderRadius: 12, border: "none", cursor: "pointer", background: "rgba(0,0,0,.6)",
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
                      <span style={{ color: "#fff", fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 11, padding: "3px 8px", background: "#DC2626", borderRadius: 5 }}>REMOVED</span>
                      <span style={{ color: "#fff", fontFamily: "var(--font-ui)", fontSize: 10, opacity: .85 }}>Click to restore</span>
                    </button>
                  ) : (onRemoveExistingImage && (
                    <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemoveExistingImage(url); }} className="bh-midz-x"
                      style={{ position: "absolute", top: -8, right: -8, width: 24, height: 24, borderRadius: 999, border: "none", cursor: "pointer",
                        background: "#DC2626", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon name="close-line" size={14} color="#fff" />
                    </button>
                  ))}
                </div>
              );
            })}

            {selectedFiles.map((file, i) => {
              const inner = previews[i]
                ? <img src={previews[i]} alt={file.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: 8, textAlign: "center" }}>
                    <FileIcon name={file.name} type={file.type} size={48} />
                    <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--gray-500)", maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</span>
                  </div>;
              return (
                <div key={file.name + file.size + i} className="bh-midz-card" style={{ position: "relative" }}>
                  <div style={{ width: 160, height: 160, borderRadius: 12, overflow: "hidden", border: `1px solid ${isEditMode ? "#93C5FD" : "var(--border)"}`,
                    background: "var(--gray-50)", display: "flex", alignItems: "center", justifyContent: "center" }}>{inner}</div>
                  {isEditMode && <span style={{ position: "absolute", top: -8, left: -8, background: "#2563EB", color: "#fff", fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 10, padding: "2px 6px", borderRadius: 5, zIndex: 1 }}>NEW</span>}
                  <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeFile(i); }} className="bh-midz-x"
                    style={{ position: "absolute", top: -8, right: -8, width: 24, height: 24, borderRadius: 999, border: "none", cursor: "pointer",
                      background: "#DC2626", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="close-line" size={14} color="#fff" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { MultiImageDropZone });
