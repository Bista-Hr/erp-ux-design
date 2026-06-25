// BISTA HR · primitives/EmptyState — ONE canonical empty illustration reused everywhere:
// empty lists, no-search-results, no-files, etc. Pass title/subtitle and an optional CTA.
// The artwork is the exact provided SVG (document stack + magnifier, brand-yellow stroke).
function EmptyIllustration({ size = 136 }) {
  return (
    <svg width={size} height={size * (108 / 136)} viewBox="0 0 136 108" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M34.0878 11.6797H87.3878C88.7139 11.6797 89.9857 12.2065 90.9233 13.1442C91.861 14.0818 92.3878 15.3536 92.3878 16.6797V80.0897C92.3878 81.4158 91.861 82.6875 90.9233 83.6252C89.9857 84.5629 88.7139 85.0897 87.3878 85.0897H27.2578C25.9317 85.0897 24.66 84.5629 23.7223 83.6252C22.7846 82.6875 22.2578 81.4158 22.2578 80.0897V23.6297L34.0878 11.6797Z" fill="white" stroke="#C8A900" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M92.1475 42.5791H37.1875V85.6991H92.1475V42.5791Z" fill="#FFF0C9" />
      <path d="M22.2578 23.6297H31.9478C32.5163 23.627 33.0606 23.3994 33.4616 22.9964C33.8627 22.5935 34.0878 22.0482 34.0878 21.4797V11.6797L22.2578 23.6297Z" fill="white" stroke="#C8A900" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M91.8775 28.8096H37.5175C35.4023 28.8096 33.6875 30.5243 33.6875 32.6396V44.2696C33.6875 46.3848 35.4023 48.0996 37.5175 48.0996H91.8775C93.9927 48.0996 95.7075 46.3848 95.7075 44.2696V32.6396C95.7075 30.5243 93.9927 28.8096 91.8775 28.8096Z" fill="white" stroke="#C8A900" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M44.2463 41.8196C46.0909 41.8196 47.5863 40.3243 47.5863 38.4796C47.5863 36.635 46.0909 35.1396 44.2463 35.1396C42.4016 35.1396 40.9062 36.635 40.9062 38.4796C40.9062 40.3243 42.4016 41.8196 44.2463 41.8196Z" fill="#FFF0C9" />
      <path d="M54.7462 41.8196C56.5909 41.8196 58.0863 40.3243 58.0863 38.4796C58.0863 36.635 56.5909 35.1396 54.7462 35.1396C52.9016 35.1396 51.4062 36.635 51.4062 38.4796C51.4062 40.3243 52.9016 41.8196 54.7462 41.8196Z" fill="#FFF0C9" />
      <path d="M65.2384 41.8196C67.0831 41.8196 68.5784 40.3243 68.5784 38.4796C68.5784 36.635 67.0831 35.1396 65.2384 35.1396C63.3938 35.1396 61.8984 36.635 61.8984 38.4796C61.8984 40.3243 63.3938 41.8196 65.2384 41.8196Z" fill="#FFF0C9" />
      <path d="M91.8775 50.1895H37.5175C35.4023 50.1895 33.6875 51.9042 33.6875 54.0195V65.6495C33.6875 67.7647 35.4023 69.4795 37.5175 69.4795H91.8775C93.9927 69.4795 95.7075 67.7647 95.7075 65.6495V54.0195C95.7075 51.9042 93.9927 50.1895 91.8775 50.1895Z" fill="white" stroke="#C8A900" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M44.2463 63.2093C46.0909 63.2093 47.5863 61.7139 47.5863 59.8693C47.5863 58.0247 46.0909 56.5293 44.2463 56.5293C42.4016 56.5293 40.9062 58.0247 40.9062 59.8693C40.9062 61.7139 42.4016 63.2093 44.2463 63.2093Z" fill="#FFF0C9" />
      <path d="M54.7462 63.2093C56.5909 63.2093 58.0863 61.7139 58.0863 59.8693C58.0863 58.0247 56.5909 56.5293 54.7462 56.5293C52.9016 56.5293 51.4062 58.0247 51.4062 59.8693C51.4062 61.7139 52.9016 63.2093 54.7462 63.2093Z" fill="#FFF0C9" />
      <path d="M65.2384 63.2093C67.0831 63.2093 68.5784 61.7139 68.5784 59.8693C68.5784 58.0247 67.0831 56.5293 65.2384 56.5293C63.3938 56.5293 61.8984 58.0247 61.8984 59.8693C61.8984 61.7139 63.3938 63.2093 65.2384 63.2093Z" fill="#FFF0C9" />
      <path d="M91.8775 71.5791H37.5175C35.4023 71.5791 33.6875 73.2939 33.6875 75.4091V87.0391C33.6875 89.1544 35.4023 90.8691 37.5175 90.8691H91.8775C93.9927 90.8691 95.7075 89.1544 95.7075 87.0391V75.4091C95.7075 73.2939 93.9927 71.5791 91.8775 71.5791Z" fill="white" stroke="#C8A900" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M44.2463 84.5892C46.0909 84.5892 47.5863 83.0938 47.5863 81.2492C47.5863 79.4046 46.0909 77.9092 44.2463 77.9092C42.4016 77.9092 40.9062 79.4046 40.9062 81.2492C40.9062 83.0938 42.4016 84.5892 44.2463 84.5892Z" fill="#FFF0C9" />
      <path d="M54.7462 84.5892C56.5909 84.5892 58.0863 83.0938 58.0863 81.2492C58.0863 79.4046 56.5909 77.9092 54.7462 77.9092C52.9016 77.9092 51.4062 79.4046 51.4062 81.2492C51.4062 83.0938 52.9016 84.5892 54.7462 84.5892Z" fill="#FFF0C9" />
      <path d="M65.2384 84.5892C67.0831 84.5892 68.5784 83.0938 68.5784 81.2492C68.5784 79.4046 67.0831 77.9092 65.2384 77.9092C63.3938 77.9092 61.8984 79.4046 61.8984 81.2492C61.8984 83.0938 63.3938 84.5892 65.2384 84.5892Z" fill="#FFF0C9" />
      <path d="M96.7964 53.17C108.245 53.17 117.526 43.8888 117.526 32.44C117.526 20.9911 108.245 11.71 96.7964 11.71C85.3475 11.71 76.0664 20.9911 76.0664 32.44C76.0664 43.8888 85.3475 53.17 96.7964 53.17Z" fill="white" stroke="#C8A900" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M111.516 47.4795L117.036 52.9995" stroke="#C8A900" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M116.422 50.3195L114.708 52.1121C113.937 52.9185 113.966 54.1972 114.773 54.9681L129.663 69.2029C130.47 69.9738 131.748 69.945 132.519 69.1386L134.233 67.3459C135.004 66.5395 134.975 65.2608 134.169 64.4899L119.278 50.2552C118.472 49.4843 117.193 49.513 116.422 50.3195Z" fill="white" stroke="#C8A900" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Variant illustrations. "search" keeps the canonical inline document+magnifier artwork.
// EMPTY_ART = recoloured undraw SVG files; EMPTY_SVG = inline brand-styled artwork (same flat
// gold language as the canonical illustration) for contexts that had no art yet.
const EMPTY_ART = {
  place:   "assets/empty/no-place.svg",   // building artwork — for tables describing places/locations
  message: "assets/empty/no-message.svg",
  money:   "assets/empty/no-money.svg",
  users:   "assets/empty/no-money.svg".replace("no-money", "no-users"),
};

// Shared palette for the inline illustrations (matches EmptyIllustration).
const _IS = { line: "#C8A900", tint: "#FFF0C9", gold: "#F4CE3C", gray: "#E8E5DD", white: "#FFFFFF" };
const _svgProps = (size) => ({ width: size, height: size * (108 / 136), viewBox: "0 0 160 128", fill: "none", xmlns: "http://www.w3.org/2000/svg" });

// Inline artwork keyed by variant. Each returns an <svg>.
const EMPTY_SVG = {
  // leave — wall calendar with a time-off check
  leave: (size) => (
    <svg {..._svgProps(size)}>
      <rect x="46" y="20" width="6" height="18" rx="3" fill={_IS.line} />
      <rect x="108" y="20" width="6" height="18" rx="3" fill={_IS.line} />
      <rect x="30" y="30" width="100" height="86" rx="12" fill={_IS.white} stroke={_IS.line} strokeWidth="2" />
      <path d="M30 42a12 12 0 0 1 12-12h76a12 12 0 0 1 12 12v10H30Z" fill={_IS.tint} />
      <path d="M30 52h100" stroke={_IS.line} strokeWidth="2" />
      <rect x="44" y="64" width="14" height="12" rx="3" fill={_IS.gray} />
      <rect x="66" y="64" width="14" height="12" rx="3" fill={_IS.gray} />
      <rect x="44" y="84" width="14" height="12" rx="3" fill={_IS.gray} />
      <circle cx="98" cy="90" r="20" fill={_IS.gold} />
      <path d="M89 90.5l6 6 12-13" stroke={_IS.white} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  // job — briefcase (recruitment / job postings)
  job: (size) => (
    <svg {..._svgProps(size)}>
      <path d="M63 46v-7a7 7 0 0 1 7-7h20a7 7 0 0 1 7 7v7" fill="none" stroke={_IS.line} strokeWidth="2" />
      <rect x="32" y="46" width="96" height="70" rx="12" fill={_IS.white} stroke={_IS.line} strokeWidth="2" />
      <rect x="40" y="66" width="80" height="42" rx="6" fill={_IS.tint} />
      <path d="M32 64h96" stroke={_IS.line} strokeWidth="2" />
      <rect x="71" y="70" width="18" height="13" rx="3.5" fill={_IS.gold} stroke={_IS.line} strokeWidth="1.6" />
    </svg>
  ),
  // assessment / appraisal — clipboard checklist
  assessment: (size) => (
    <svg {..._svgProps(size)}>
      <rect x="40" y="26" width="80" height="94" rx="12" fill={_IS.white} stroke={_IS.line} strokeWidth="2" />
      <rect x="65" y="18" width="30" height="17" rx="6" fill={_IS.tint} stroke={_IS.line} strokeWidth="2" />
      <circle cx="59" cy="56" r="6" fill={_IS.gold} />
      <path d="M56.4 56l2 2 4-4.4" stroke={_IS.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M72 56h34" stroke={_IS.gray} strokeWidth="4" strokeLinecap="round" />
      <circle cx="59" cy="78" r="6" fill={_IS.gold} />
      <path d="M56.4 78l2 2 4-4.4" stroke={_IS.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M72 78h34" stroke={_IS.gray} strokeWidth="4" strokeLinecap="round" />
      <circle cx="59" cy="100" r="6" fill={_IS.tint} stroke={_IS.line} strokeWidth="1.6" />
      <path d="M72 100h22" stroke={_IS.gray} strokeWidth="4" strokeLinecap="round" />
    </svg>
  ),
  // document / files
  document: (size) => (
    <svg {..._svgProps(size)}>
      <path d="M48 22h34l28 28v50a8 8 0 0 1-8 8H48a8 8 0 0 1-8-8V30a8 8 0 0 1 8-8Z" fill={_IS.white} stroke={_IS.line} strokeWidth="2" strokeLinejoin="round" />
      <path d="M82 22v22a4 4 0 0 0 4 4h24" fill={_IS.tint} stroke={_IS.line} strokeWidth="2" strokeLinejoin="round" />
      <path d="M54 66h44M54 80h44M54 94h28" stroke={_IS.gray} strokeWidth="4" strokeLinecap="round" />
    </svg>
  ),
  // approval — shield with a check
  approval: (size) => (
    <svg {..._svgProps(size)}>
      <path d="M80 22l34 13v25c0 24-15 40-34 47-19-7-34-23-34-47V35Z" fill={_IS.white} stroke={_IS.line} strokeWidth="2" strokeLinejoin="round" />
      <path d="M80 30l26 10v20c0 18-11 30-26 36-15-6-26-18-26-36V40Z" fill={_IS.tint} />
      <path d="M66 70l10 10 20-22" stroke={_IS.gold} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

function EmptyState({ title = "Nothing here yet", subtitle, cta, onAction, compact = false, variant = "search", illustration }) {
  const v = illustration || variant;
  const art = EMPTY_ART[v];
  const inlineSvg = EMPTY_SVG[v];
  const size = compact ? 168 : 196;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: compact ? "48px 24px" : "64px 24px" }}>
      <div style={{ marginBottom: 22 }}>
        {art
          ? <img src={art} alt="" style={{ width: compact ? 180 : 220, height: "auto", display: "block" }} />
          : inlineSvg
            ? inlineSvg(size)
            : <EmptyIllustration />}
      </div>
      <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 18, lineHeight: 1.3, color: "var(--gray-900)" }}>{title}</div>
      {subtitle && <div className="bh-body" style={{ marginTop: 6, maxWidth: 360 }}>{subtitle}</div>}
      {cta && onAction && <div style={{ marginTop: 20 }}><Button variant="primary" icon="add-line" onClick={onAction}>{cta}</Button></div>}
    </div>
  );
}

Object.assign(window, { EmptyState, EmptyIllustration });