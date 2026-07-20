// BISTA HR · employee/ProfilePictureModal — profile-picture upload flow (My Info ▸ avatar).
// Three views inside one modal, matching the Figma:
//   empty    → current avatar/initials + "Upload New Picture"
//   selected → image preview (removable) + file card + Change / Crop / Upload Photo
//   crop     → circular reposition + zoom, Reset / Apply Crop (square output)
const { useState: usePP, useRef: usePPRef } = React;

const CROP_BOX = 300;   // on-screen crop square (px)
const OUT_SIZE = 512;   // exported square (px)
const fmtSize = (bytes) => bytes >= 1048576 ? (bytes / 1048576).toFixed(1) + " MB" : Math.round(bytes / 1024) + " KB";

function CropView({ src, onBack, onApply }) {
  const wrapRef = usePPRef(null);
  const imgRef = usePPRef(null);
  const [nat, setNat] = usePP(null);          // { w, h }
  const [zoom, setZoom] = usePP(1);
  const [off, setOff] = usePP({ x: 0, y: 0 });
  const drag = usePPRef(null);

  const base = nat ? Math.max(CROP_BOX / nat.w, CROP_BOX / nat.h) : 1;
  const scale = base * zoom;

  const clamp = (o, s) => {
    if (!nat) return o;
    const mx = Math.max(0, (nat.w * s - CROP_BOX) / 2);
    const my = Math.max(0, (nat.h * s - CROP_BOX) / 2);
    return { x: Math.max(-mx, Math.min(mx, o.x)), y: Math.max(-my, Math.min(my, o.y)) };
  };

  const onDown = (e) => { const p = e.touches ? e.touches[0] : e; drag.current = { sx: p.clientX, sy: p.clientY, ox: off.x, oy: off.y }; };
  const onMove = (e) => {
    if (!drag.current) return;
    const p = e.touches ? e.touches[0] : e;
    setOff(clamp({ x: drag.current.ox + (p.clientX - drag.current.sx), y: drag.current.oy + (p.clientY - drag.current.sy) }, scale));
  };
  const onUp = () => { drag.current = null; };
  const onZoom = (z) => { setZoom(z); setOff(o => clamp(o, base * z)); };
  const reset = () => { setZoom(1); setOff({ x: 0, y: 0 }); };

  const apply = () => {
    const img = imgRef.current; if (!img || !nat) return;
    const c = document.createElement("canvas"); c.width = OUT_SIZE; c.height = OUT_SIZE;
    const ctx = c.getContext("2d");
    const sw = CROP_BOX / scale;                 // source rect side in natural px
    const sx = nat.w / 2 - off.x / scale - sw / 2;
    const sy = nat.h / 2 - off.y / scale - sw / 2;
    ctx.drawImage(img, sx, sy, sw, sw, 0, 0, OUT_SIZE, OUT_SIZE);
    onApply(c.toDataURL("image/jpeg", 0.92));
  };

  const imgW = nat ? nat.w * scale : 0, imgH = nat ? nat.h * scale : 0;
  return (
    <React.Fragment>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "24px 24px 0" }}>
        <button className="btn btn-icon btn-ghost" onClick={onBack} style={{ width: 28, height: 28, padding: 0, marginTop: 2 }}>
          <Icon name="arrow-left-line" size={20} color="var(--brand-yellow-dark)" />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 20, color: "var(--gray-900)" }}>Crop Image</div>
          <div className="bh-body" style={{ marginTop: 4 }}>Drag to reposition and zoom to crop your image in a square format</div>
        </div>
      </div>

      <div style={{ padding: 24, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <div ref={wrapRef} onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
          onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}
          style={{ width: CROP_BOX, height: CROP_BOX, borderRadius: "50%", overflow: "hidden", position: "relative",
            cursor: "grab", border: "3px solid var(--brand-yellow)", background: "var(--gray-100)", touchAction: "none", userSelect: "none" }}>
          <img ref={imgRef} src={src} alt="" draggable={false}
            onLoad={e => setNat({ w: e.target.naturalWidth, h: e.target.naturalHeight })}
            style={{ position: "absolute", left: CROP_BOX / 2 + off.x - imgW / 2, top: CROP_BOX / 2 + off.y - imgH / 2,
              width: imgW || "auto", height: imgH || "auto", maxWidth: "none", pointerEvents: "none" }} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", maxWidth: 360 }}>
          <Icon name="zoom-out-line" size={18} color="var(--gray-400)" />
          <input type="range" min="1" max="3" step="0.01" value={zoom} onChange={e => onZoom(Number(e.target.value))} className="pp-range"
            style={{ flex: 1, background: `linear-gradient(to right, var(--brand-yellow) ${((zoom - 1) / 2) * 100}%, var(--gray-200) ${((zoom - 1) / 2) * 100}%)` }} />
          <Icon name="zoom-in-line" size={18} color="var(--gray-400)" />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", width: "100%", gap: 12 }}>
          <Button variant="stroke" icon="restart-line" onClick={reset}>Reset</Button>
          <Button variant="primary" onClick={apply}>Apply Crop</Button>
        </div>
        <div className="bh-caption" style={{ textAlign: "center" }}>Drag to reposition • Slider to zoom</div>
      </div>
    </React.Fragment>
  );
}

// `previewOnly` renders a read-only large preview (no upload/crop) — used outside My Info,
// e.g. the shared EmployeeEmploymentDrawer; editing stays exclusive to the ESS My Info flow.
function ProfilePictureModal({ name, photo, onClose, onSave, previewOnly }) {
  const [file, setFile] = usePP(null);          // { name, size, src }
  const [preview, setPreview] = usePP(null);    // current (possibly cropped) data URL
  const [cropping, setCropping] = usePP(false);
  const inputRef = usePPRef(null);

  const pick = () => inputRef.current && inputRef.current.click();
  const onPick = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => { setFile({ name: f.name, size: f.size, src: reader.result }); setPreview(reader.result); };
    reader.readAsDataURL(f);
    e.target.value = "";
  };
  const removeFile = () => { setFile(null); setPreview(null); };

  return (
    <Modal onClose={onClose} width={512}>{/* matches the codebase dialog (sm:max-w-lg) */}
      <input ref={inputRef} type="file" accept="image/*" onChange={onPick} style={{ display: "none" }} />

      {cropping ? (
        <CropView src={file.src} onBack={() => setCropping(false)} onApply={(url) => { setPreview(url); setCropping(false); }} />
      ) : (
        <React.Fragment>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "24px 24px 0" }}>
            <div>
              <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 20, color: "var(--gray-900)" }}>Profile Picture</div>
              <div className="bh-body" style={{ marginTop: 2, textTransform: "uppercase", letterSpacing: ".02em" }}>{name}</div>
            </div>
            <button className="btn btn-icon btn-ghost" onClick={onClose} style={{ width: 32, height: 32, padding: 0 }}>
              <Icon name="close-line" size={20} color="var(--gray-500)" />
            </button>
          </div>

          <div style={{ padding: 24 }}>
            {!file ? (
              // ---- preview (square — mirrors shared/ProfilePictureEditor: aspect-square box,
              // blurred cover backdrop + object-contain image when a photo exists) ----
              <div style={{ position: "relative", width: "100%", aspectRatio: "1 / 1", maxHeight: photo ? undefined : 384, borderRadius: "var(--radius-lg)", overflow: "hidden",
                background: "var(--gray-75)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {photo ? (
                  <React.Fragment>
                    <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${photo})`, backgroundSize: "cover", backgroundPosition: "center", filter: "blur(16px)", opacity: .6 }}></div>
                    <img src={photo} alt={name} style={{ position: "relative", zIndex: 1, width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
                  </React.Fragment>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                    <Avatar name={name} size={128} />
                    <div className="bh-body">No profile picture</div>
                  </div>
                )}
              </div>
            ) : (
              // ---- file selected ----
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ position: "relative", width: "100%", aspectRatio: "1 / 1", background: "var(--gray-75)", borderRadius: "var(--radius-lg)", overflow: "hidden",
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${preview})`, backgroundSize: "cover", backgroundPosition: "center", filter: "blur(16px)", opacity: .6 }}></div>
                  <img src={preview} alt="" style={{ position: "relative", zIndex: 1, width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
                  <button onClick={removeFile} title="Remove" style={{ position: "absolute", top: 12, right: 12, width: 32, height: 32, zIndex: 2,
                    borderRadius: "50%", border: 0, cursor: "pointer", background: "var(--error)", color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="close-line" size={18} color="#fff" />
                  </button>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: "var(--radius-md)",
                  border: "1px solid var(--success)", background: "var(--success-tint, #ECFDF3)" }}>
                  <Icon name="image-line" size={20} color="var(--success)" />
                  <div>
                    <div style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 14, color: "var(--success)" }}>{file.name}</div>
                    <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--success)" }}>{fmtSize(file.size)}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: "0 24px 24px" }}>
            {previewOnly ? null : !file
              ? <Button variant="stroke" icon="upload-2-line" onClick={pick}>Upload New Picture</Button>
              : <React.Fragment>
                  <Button variant="stroke" onClick={pick}>Change</Button>
                  <Button variant="stroke" icon="crop-line" onClick={() => setCropping(true)}>Crop</Button>
                  <Button variant="primary" onClick={() => onSave(preview)}>Upload Photo</Button>
                </React.Fragment>}
          </div>
        </React.Fragment>
      )}
    </Modal>
  );
}

Object.assign(window, { ProfilePictureModal });
