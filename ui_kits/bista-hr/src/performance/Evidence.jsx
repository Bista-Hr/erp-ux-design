// BISTA HR · performance/Evidence — Portfolio of Evidence.
// Supporting documents an employee attaches to objectives/goals. List + "Upload Evidence" modal.
const { useState: useEV } = React;

let EV_SEQ = 9700;
const evId = () => ++EV_SEQ;
const EV_LINKS = ["Grow deposit mobilisation", "Improve customer satisfaction", "Improve turnaround time", "Build team capability"];
const EV_ICON = { pdf: { i: "file-pdf-2-line", c: "#D92D20" }, xlsx: { i: "file-excel-2-line", c: "#067647" }, docx: { i: "file-word-2-line", c: "#155EEF" }, img: { i: "image-line", c: "#7A5AF8" } };

const EV_ROWS = [
  { id: evId(), name: "Q1 Deposit Report.xlsx", type: "xlsx", linkedTo: "Grow deposit mobilisation", date: "2026-04-02", size: "248 KB" },
  { id: evId(), name: "Customer Survey Results.pdf", type: "pdf", linkedTo: "Improve customer satisfaction", date: "2026-03-18", size: "1.2 MB" },
  { id: evId(), name: "Process Map v2.docx", type: "docx", linkedTo: "Improve turnaround time", date: "2026-02-27", size: "86 KB" },
];

function UploadEvidenceModal({ onClose, onUpload }) {
  const [name, setName] = useEV("");
  const [linkedTo, setLinkedTo] = useEV("");
  const [file, setFile] = useEV(null);
  const valid = (file || name.trim()) && linkedTo;
  return (
    <Modal onClose={onClose} width={500}>
      <div style={{ padding: 24 }}>
        <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 19, color: "var(--gray-900)" }}>Upload Evidence</div>
        <div className="bh-body" style={{ marginTop: 4 }}>Attach a document as proof against an objective or goal.</div>
        <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Link to Objective / Goal"><Select value={linkedTo} options={EV_LINKS} placeholder="Select an objective" onChange={(e) => setLinkedTo(e.target.value)} /></Field>
          <Field label="Document">
            <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 12px", border: "1px dashed var(--border-strong)", borderRadius: 10, cursor: "pointer", background: "var(--gray-25)" }}>
              <Icon name="upload-cloud-2-line" size={18} color="var(--brand-yellow-dark)" />
              <span style={{ fontFamily: "var(--font-ui)", fontSize: 13.5, color: file ? "var(--gray-900)" : "var(--gray-400)" }}>{file ? file.name : "Choose a file (PDF, Excel, Word, image)"}</span>
              <input type="file" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; setFile(f || null); if (f && !name) setName(f.name); }} />
            </label>
          </Field>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: "0 24px 24px" }}>
        <Button variant="stroke" onClick={onClose}>Cancel</Button>
        <Button variant="primary" disabled={!valid} onClick={() => { const fn = (file?.name || name).toLowerCase(); const type = fn.endsWith(".pdf") ? "pdf" : fn.endsWith(".xlsx") || fn.endsWith(".xls") ? "xlsx" : fn.endsWith(".doc") || fn.endsWith(".docx") ? "docx" : "img"; onUpload({ name: file?.name || name, type, linkedTo }); }}>Upload</Button>
      </div>
    </Modal>
  );
}

function Evidence({ onToast }) {
  const [rows, setRows] = useEV(EV_ROWS);
  const [uploading, setUploading] = useEV(false);
  const [menu, setMenu] = useEV(null);

  return (
    <div className="card" style={{ padding: "var(--card-pad, 24px)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 22, flexWrap: "wrap" }}>
        <div>
          <div className="bh-h2" style={{ fontSize: 24 }}>Portfolio of Evidence</div>
          <div className="bh-body" style={{ marginTop: 4 }}>Attach supporting documents to your objectives and goals</div>
        </div>
        <Button variant="primary" icon="upload-2-line" onClick={() => setUploading(true)}>Upload Evidence</Button>
      </div>
      <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "visible" }}>
        <table className="bh">
          <thead><tr><th>Document</th><th>Linked To</th><th>Date</th><th>Size</th><th style={{ width: 48 }}></th></tr></thead>
          <tbody>
            {rows.length === 0
              ? <tr><td colSpan={5} style={{ padding: 32, textAlign: "center", color: "var(--gray-400)" }}>No evidence uploaded yet.</td></tr>
              : rows.map((r) => {
                const ic = EV_ICON[r.type] || EV_ICON.pdf;
                return (
                  <tr key={r.id}>
                    <td><span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}><Icon name={ic.i} size={20} color={ic.c} /><span style={{ fontWeight: 600, color: "var(--gray-900)" }}>{r.name}</span></span></td>
                    <td>{r.linkedTo}</td>
                    <td>{fmtDate(r.date)}</td>
                    <td>{r.size}</td>
                    <td style={{ position: "relative", textAlign: "right" }}>
                      <button className="btn btn-icon btn-ghost" style={{ width: 28, height: 28, padding: 0 }} onClick={() => setMenu(menu === r.id ? null : r.id)}><Icon name="more-fill" size={18} color="var(--gray-400)" /></button>
                      {menu === r.id && (
                        <div onMouseLeave={() => setMenu(null)} style={{ position: "absolute", right: 16, top: 40, zIndex: 30, background: "#fff", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-pop)", padding: 6, minWidth: 150, display: "flex", flexDirection: "column" }}>
                          <button className="menu-item" onClick={() => { setMenu(null); onToast("Downloading…"); }}><Icon name="download-2-line" size={16} />Download</button>
                          <button className="menu-item danger" onClick={() => { setMenu(null); setRows((rs) => rs.filter((x) => x.id !== r.id)); onToast("Evidence Removed", { tone: "error" }); }}><Icon name="delete-bin-6-line" size={16} />Remove</button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      {uploading && <UploadEvidenceModal onClose={() => setUploading(false)} onUpload={({ name, type, linkedTo }) => { setRows((rs) => [{ id: evId(), name, type, linkedTo, date: new Date().toISOString().slice(0, 10), size: "—" }, ...rs]); setUploading(false); onToast("Evidence Uploaded", { tone: "success" }); }} />}
    </div>
  );
}

Object.assign(window, { Evidence, UploadEvidenceModal });
