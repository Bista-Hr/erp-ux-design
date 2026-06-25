// BISTA HR · forms/SupportingDocuments — the canonical supporting-documents field for every
// People & Culture workflow form (Promotion / Transfer / Exit / Job Title). Wraps
// MultiImageDropZone together with the kept / removed / new-file state so a form wires it in
// ONE line and supports BOTH create and edit:
//   • create → just collects new files.
//   • edit   → shows existing document URLs as thumbnails; ✕ marks them removed (restore-able)
//              and new files get the blue "NEW" badge.
// It is self-managing: it reports changes through onChange({ keptUrls, newFiles }). To persist,
// turn that into final URLs with the static helper:
//     SupportingDocuments.resolve(value, "https://files.bistasol.com/<area>/")
//
// SupportingDocumentsList is the matching READ view for detail pages — a wrapped row of
// clickable FileIcon tiles (used inside a DetailCard "Supporting Documents").
const { useState: useSD, useEffect: useSDEffect } = React;

function SupportingDocuments({ existingUrls = [], isEditMode = false, onChange, maxFiles = 8, maxSizeMB = 8 }) {
  const [selectedFiles, setSelectedFiles] = useSD([]);
  const [removed, setRemoved] = useSD([]);
  const emit = (files, rem) => onChange && onChange({ keptUrls: existingUrls.filter(u => !rem.includes(u)), newFiles: files });
  return (
    <MultiImageDropZone
      isEditMode={isEditMode}
      selectedFiles={selectedFiles}
      onFilesSelect={(files) => { setSelectedFiles(files); emit(files, removed); }}
      existingImages={existingUrls}
      removedImages={removed}
      onRemoveExistingImage={(url) => { const r = [...removed, url]; setRemoved(r); emit(selectedFiles, r); }}
      onRestoreImage={(url) => { const r = removed.filter(u => u !== url); setRemoved(r); emit(selectedFiles, r); }}
      maxFiles={maxFiles}
      maxSize={maxSizeMB * 1024 * 1024}
    />
  );
}
// Turn { keptUrls, newFiles } into the final URL list (mock-uploads new files under `base`).
SupportingDocuments.resolve = (value, base) => {
  const v = value || { keptUrls: [], newFiles: [] };
  const uploaded = (v.newFiles || []).map(f => `${base}${encodeURIComponent(f.name)}`);
  return [...(v.keptUrls || []), ...uploaded];
};

// ── read view for detail pages — mirrors the app's Supporting Documents grid + ImageGalleryDialog ──
// A responsive grid of square thumbnail tiles (image preview, or branded FileIcon for non-images).
// Clicking a tile opens the full gallery lightbox (main viewer + arrows + thumbnail strip), exactly
// like components/shared/ImageGalleryDialog + the PromotionDetail "Supporting Documents" card.
const SD_IMG_EXT = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
const sdBare = (u) => (u || "").toLowerCase().split("?")[0];
const sdIsImage = (u) => SD_IMG_EXT.some(e => sdBare(u).endsWith(e));
const sdIsPdf = (u) => sdBare(u).endsWith(".pdf");
const sdName = (u) => { try { return decodeURIComponent(u.split("/").pop().split("?")[0]); } catch (e) { return u; } };
// Seed + freshly "uploaded" docs point at mock storage that doesn't resolve. For the viewer/download
// route those to a real, renderable sample of the SAME TYPE so dummy document views open something
// that matches the tile's file type. Google's viewer renders pdf/doc/xls/ppt alike.
const SD_SAMPLES = {
  pdf: ["https://pdfobject.com/pdf/sample.pdf", "https://www.orimi.com/pdf-test.pdf"],
  doc: ["https://calibre-ebook.com/downloads/demos/demo.docx", "https://scholar.harvard.edu/files/torman_personal/files/sampleworddocument.docx"],
  xls: ["https://go.microsoft.com/fwlink/?LinkID=521962", "https://file-examples.com/storage/fe1170c2ce66e8d83a2b495/2017/02/file_example_XLSX_50.xlsx"],
  ppt: ["https://scholar.harvard.edu/files/torman_personal/files/samplepptx.pptx"],
};
const sdHash = (s) => { let h = 0; for (let i = 0; i < (s || "").length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); };
const sdIsMock = (u) => !u || /files\.bistasol\.com/i.test(u) || u.startsWith("blob:") || u.startsWith("mock:");
const sdKind = (u) => {
  const b = sdBare(u);
  if (b.endsWith(".doc") || b.endsWith(".docx")) return "doc";
  if (b.endsWith(".xls") || b.endsWith(".xlsx") || b.endsWith(".csv")) return "xls";
  if (b.endsWith(".ppt") || b.endsWith(".pptx")) return "ppt";
  return "pdf";
};
const sdRawUrl = (u) => {
  if (sdIsImage(u) && !sdIsMock(u)) return u;
  const arr = SD_SAMPLES[sdKind(u)] || SD_SAMPLES.pdf;
  return arr[sdHash(u) % arr.length];
};
// Sample hosts send X-Frame-Options, so browsers (e.g. Arc) block direct iframe embedding.
// Render docs through Google's embeddable viewer, which is made for iframing and handles every type.
const sdFrameSrc = (u) => `https://docs.google.com/viewer?url=${encodeURIComponent(sdRawUrl(u))}&embedded=true`;

// <img> that falls back to the branded FileIcon if the source fails to load (mock URLs, dead links).
function SDImage({ url, cover, size = 64, alt }) {
  const [err, setErr] = useSD(false);
  if (err) return <FileIcon name={sdName(url)} size={size} />;
  return <img src={url} alt={alt} onError={() => setErr(true)}
    style={cover
      ? { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }
      : { maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }} />;
}

function SupportingDocsGallery({ urls, index, onIndex, onClose }) {
  const cur = urls[index];
  const prev = () => onIndex(index > 0 ? index - 1 : urls.length - 1);
  const next = () => onIndex(index < urls.length - 1 ? index + 1 : 0);
  useSDEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); else if (e.key === "ArrowLeft") prev(); else if (e.key === "ArrowRight") next(); };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  });
  const navBtn = { position: "absolute", top: "50%", transform: "translateY(-50%)", width: 48, height: 48, borderRadius: 999,
    display: "flex", alignItems: "center", justifyContent: "center", border: 0, cursor: "pointer",
    background: "var(--primary-200, #FDE68A)", boxShadow: "0 4px 12px rgba(16,24,40,.18)" };
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 400, background: "rgba(16,24,40,.7)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24, animation: "bhFade .12s ease" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 12, overflow: "hidden",
        width: "min(1100px, 95vw)", height: "min(92vh, 820px)", display: "flex", flexDirection: "column", boxShadow: "0 24px 64px rgba(16,24,40,.4)" }}>
        <div style={{ position: "relative", flex: 1, minHeight: 0, background: "rgba(0,0,0,.04)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {sdIsImage(cur) && !sdIsMock(cur)
            ? <SDImage url={cur} size={128} alt={`Document ${index + 1}`} />
            : <iframe src={sdFrameSrc(cur)} title={`Document ${index + 1}`} style={{ width: "100%", height: "100%", border: 0 }} />}

          {urls.length > 1 && (
            <React.Fragment>
              <button type="button" onClick={prev} aria-label="Previous" style={{ ...navBtn, left: 16 }}><Icon name="arrow-left-s-line" size={24} color="var(--gray-900)" /></button>
              <button type="button" onClick={next} aria-label="Next" style={{ ...navBtn, right: 16 }}><Icon name="arrow-right-s-line" size={24} color="var(--gray-900)" /></button>
            </React.Fragment>
          )}
          <button type="button" onClick={onClose} aria-label="Close" style={{ position: "absolute", top: 14, right: 14, width: 36, height: 36, borderRadius: 999,
            display: "flex", alignItems: "center", justifyContent: "center", border: 0, cursor: "pointer", background: "rgba(255,255,255,.9)", boxShadow: "0 2px 8px rgba(16,24,40,.16)" }}>
            <Icon name="close-line" size={20} color="var(--gray-700)" />
          </button>
        </div>

        {urls.length > 1 && (
          <div style={{ borderTop: "1px solid var(--border)", padding: 10 }}>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
              {urls.map((u, i) => (
                <button key={i} type="button" onClick={() => onIndex(i)}
                  style={{ position: "relative", flexShrink: 0, width: 56, height: 56, borderRadius: 10, overflow: "hidden", cursor: "pointer", padding: 0,
                    border: `2px solid ${i === index ? "var(--brand-yellow-dark, var(--primary-500))" : "var(--gray-200)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center", background: "var(--gray-50)" }}>
                  {sdIsImage(u)
                    ? <SDImage url={u} cover alt={`Thumbnail ${i + 1}`} />
                    : <FileIcon name={sdName(u)} size={28} />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SupportingDocumentsList({ urls = [], emptyTitle = "No documents", emptySubtitle = "No supporting documents were attached." }) {
  const [open, setOpen] = useSD(false);
  const [idx, setIdx] = useSD(0);
  if (!urls || urls.length === 0) return <EmptyState compact title={emptyTitle} subtitle={emptySubtitle} />;
  return (
    <React.Fragment>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 16 }}>
        {urls.map((url, i) => (
          <button key={i} type="button" onClick={() => { setIdx(i); setOpen(true); }}
            style={{ position: "relative", aspectRatio: "1 / 1", borderRadius: 10, border: "1px solid var(--border)", overflow: "hidden",
              cursor: "pointer", background: "var(--gray-50)", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
            {sdIsImage(url)
              ? <SDImage url={url} cover alt={`Document ${i + 1}`} />
              : <FileIcon name={sdName(url)} size={64} />}
          </button>
        ))}
      </div>
      {open && <SupportingDocsGallery urls={urls} index={idx} onIndex={setIdx} onClose={() => setOpen(false)} />}
    </React.Fragment>
  );
}

Object.assign(window, { SupportingDocuments, SupportingDocumentsList });
