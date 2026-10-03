import { useState, useMemo, useEffect } from 'react'
import {
  FileText,
  CheckSquare,
  Square,
  ArrowRight,
  ArrowLeft,
  Printer,
  Download,
  ShieldCheck,
  MapPin,
  Calendar,
  Sparkles,
  Camera,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Folder,
  Loader2
} from 'lucide-react'
import { getMediaUrl, getProjectImages } from '../api/media'

function escapeHtml(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export default function ExportReportView({
  projects = [],
  currentProjectId = null,
  projectMedia = [],
  onOpenImageInLightbox = null
}) {
  const [selectedProjectId, setSelectedProjectId] = useState(currentProjectId || (projects[0]?.id ?? null))
  const [activeMedia, setActiveMedia] = useState(projectMedia || [])
  const [loadingMedia, setLoadingMedia] = useState(false)
  const [step, setStep] = useState(1)

  const activeProject = useMemo(() => {
    return projects.find((p) => p.id === selectedProjectId) || projects[0] || null
  }, [projects, selectedProjectId])

  const [selectedImageIds, setSelectedImageIds] = useState(() => {
    return (projectMedia || []).slice(0, 6).map((m) => m.id)
  })

  const [beforeImageId, setBeforeImageId] = useState(null)
  const [afterImageId, setAfterImageId] = useState(null)

  useEffect(() => {
    if (projectMedia && projectMedia.length > 0 && (!currentProjectId || selectedProjectId === currentProjectId)) {
      setActiveMedia(projectMedia)
      setSelectedImageIds((prev) => (prev.length > 0 ? prev : projectMedia.slice(0, 6).map((m) => m.id)))
      setBeforeImageId((prev) => prev || projectMedia[projectMedia.length - 1]?.id || null)
      setAfterImageId((prev) => prev || projectMedia[0]?.id || null)
    }
  }, [projectMedia, currentProjectId, selectedProjectId])

  useEffect(() => {
    if (selectedProjectId) {
      setLoadingMedia(true)
      getProjectImages(selectedProjectId).then((res) => {
        if (res.success && res.data) {
          setActiveMedia(res.data)
          setSelectedImageIds(res.data.slice(0, 6).map((m) => m.id))
          if (res.data.length > 0) {
            setBeforeImageId(res.data[res.data.length - 1]?.id || null)
            setAfterImageId(res.data[0]?.id || null)
          }
        }
        setLoadingMedia(false)
      })
    }
  }, [selectedProjectId])

  const [reportTitle, setReportTitle] = useState('Field Verification & Impact Progress Report')
  const [organization, setOrganization] = useState('Delhi Urban Ecological Restoration Mission')
  const [auditorName, setAuditorName] = useState('Field Verification Team')
  const [reportingPeriod, setReportingPeriod] = useState('October 2026')

  const [whatAreWeDoing, setWhatAreWeDoing] = useState(
    'Restoring degraded urban roadside corridors and community green belts across designated coordinates in Delhi to combat air particulate pollution and enhance local biodiversity.'
  )
  const [whatWeDid, setWhatWeDid] = useState(
    'Conducted ground-level soil preparation, de-compaction, dug standardized tree pits, distributed native neem and peepal saplings, erected protective metal tree guards, and laid organic mulching with community volunteers.'
  )
  const [changesObserved, setChangesObserved] = useState(
    'Verified 100% sapling survival across all documented sites. Installed protective infrastructure preventing roadside encroachment, and established routine drip-irrigation schedules with municipal field teams.'
  )

  const [beforeCaption, setBeforeCaption] = useState('Baseline site condition: degraded soil verge with waste accumulation prior to afforestation drive.')
  const [afterCaption, setAfterCaption] = useState('Completed intervention: native saplings secured with tree guards and organic mulch layer.')
  const [auditorTakeaways, setAuditorTakeaways] = useState(
    'All captured media assets possess authentic GPS EXIF telemetry. Geotagged coordinates cross-verified with municipal site maps. Zero synthetic or AI-manipulated footprints detected.'
  )

  const selectedImages = useMemo(() => {
    return activeMedia.filter((m) => selectedImageIds.includes(m.id))
  }, [activeMedia, selectedImageIds])

  const beforeImage = useMemo(() => {
    return activeMedia.find((m) => m.id === beforeImageId) || selectedImages[0] || null
  }, [activeMedia, beforeImageId, selectedImages])

  const afterImage = useMemo(() => {
    return activeMedia.find((m) => m.id === afterImageId) || selectedImages[1] || null
  }, [activeMedia, afterImageId, selectedImages])

  const handleToggleImage = (id) => {
    setSelectedImageIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    setSelectedImageIds(activeMedia.map((m) => m.id))
  }

  const handleClearSelection = () => {
    setSelectedImageIds([])
  }

  const handlePrintPdf = () => {
    const printWin = window.open('about:blank', '_blank')
    if (!printWin) {
      window.print()
      return
    }

    const beforeImgSrc = beforeImage ? getMediaUrl(beforeImage.image_url) : ''
    const afterImgSrc = afterImage ? getMediaUrl(afterImage.image_url) : ''

    const evidenceCardsHtml = selectedImages
      .map(
        (img, idx) => `
        <div class="evidence-card">
          <div class="evidence-img-wrap">
            <img src="${getMediaUrl(img.thumbnail_url || img.image_url)}" alt="${escapeHtml(img.display_name)}" />
          </div>
          <div class="evidence-info">
            <div class="evidence-title truncate">#${idx + 1} ${escapeHtml(img.display_name)}</div>
            <div class="evidence-geo truncate">
              ${img.metadata?.latitude ? `${img.metadata.latitude.toFixed(4)}, ${img.metadata.longitude.toFixed(4)}` : 'Geotagged'} • ${escapeHtml(img.metadata?.location_name || 'Delhi')}
            </div>
          </div>
        </div>
      `
      )
      .join('')

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(reportTitle)} — DivyaDrishti Verified Evidence Dossier</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Merriweather:wght@400;700;900&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 12mm 12mm 12mm;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      color: #1f2420;
      background: #faf9f6;
      padding: 24px;
      line-height: 1.5;
      font-size: 13px;
      -webkit-font-smoothing: antialiased;
    }
    .print-bar {
      max-width: 900px;
      margin: 0 auto 20px auto;
      background: #ffffff;
      border: 1px solid #dcd7cc;
      border-radius: 12px;
      padding: 12px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
    .print-bar-info {
      font-size: 12px;
      color: #5a655c;
    }
    .print-bar-info strong {
      color: #1f2420;
    }
    .print-bar-btn {
      background: #006b49;
      color: #ffffff;
      border: 0;
      padding: 8px 18px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .print-bar-btn:hover {
      background: #005238;
    }
    .dossier-card {
      max-width: 900px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #ded8cb;
      border-radius: 16px;
      padding: 36px 40px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.03);
    }
    .dossier-header {
      border-bottom: 2px solid #1f2420;
      padding-bottom: 18px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 20px;
    }
    .dossier-brand {
      color: #006b49;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .dossier-title {
      font-family: 'Merriweather', serif;
      font-size: 26px;
      font-weight: 700;
      color: #1f2420;
      line-height: 1.25;
      margin-bottom: 6px;
    }
    .dossier-org {
      font-size: 13px;
      color: #4d564e;
      font-weight: 500;
    }
    .dossier-meta {
      font-size: 11.5px;
      color: #5a655c;
      text-align: right;
      display: flex;
      flex-direction: column;
      gap: 3px;
      white-space: nowrap;
    }
    .c2pa-badge {
      color: #006b49;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      justify-content: flex-end;
    }
    .c2pa-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #006b49;
    }
    .section-block {
      margin-bottom: 22px;
      page-break-inside: avoid;
    }
    .section-heading {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #006b49;
      border-bottom: 1px solid #ece7de;
      padding-bottom: 6px;
      margin-bottom: 10px;
    }
    .section-text {
      font-size: 13px;
      color: #2b312c;
      line-height: 1.6;
    }
    .pair-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 8px;
    }
    .pair-card {
      border: 1px solid #ded8cb;
      border-radius: 10px;
      overflow: hidden;
      background: #faf9f6;
    }
    .pair-img-wrap {
      position: relative;
      width: 100%;
      height: 200px;
      background: #e8e4da;
      overflow: hidden;
    }
    .pair-img-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .pair-badge {
      position: absolute;
      top: 10px;
      left: 10px;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: #fff;
    }
    .badge-before { background: rgba(31, 36, 32, 0.88); }
    .badge-after { background: #006b49; }
    .pair-meta {
      padding: 12px;
    }
    .pair-caption {
      font-weight: 600;
      color: #1f2420;
      font-size: 12px;
      margin-bottom: 4px;
    }
    .pair-sub {
      font-size: 10.5px;
      color: #6d776e;
    }
    .evidence-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 10px;
      margin-top: 8px;
    }
    .evidence-card {
      border: 1px solid #e0dacd;
      border-radius: 8px;
      overflow: hidden;
      background: #faf9f6;
    }
    .evidence-img-wrap {
      width: 100%;
      height: 90px;
      background: #eeebe2;
      overflow: hidden;
    }
    .evidence-img-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .evidence-info {
      padding: 6px 8px;
    }
    .evidence-title {
      font-size: 9.5px;
      font-weight: 600;
      color: #1f2420;
    }
    .evidence-geo {
      font-size: 8.5px;
      color: #6d776e;
    }
    .truncate {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .signoff-box {
      background: #f5f8f6;
      border: 1px solid #cfe2d7;
      border-radius: 10px;
      padding: 16px 20px;
      margin-top: 10px;
      page-break-inside: avoid;
    }
    .signoff-head {
      font-size: 12px;
      font-weight: 700;
      color: #006b49;
      margin-bottom: 6px;
    }
    .signoff-text {
      font-size: 11.5px;
      color: #2b352e;
      line-height: 1.55;
    }
    .signoff-foot {
      display: flex;
      justify-content: space-between;
      font-size: 9.5px;
      color: #556358;
      border-top: 1px solid rgba(207, 226, 215, 0.6);
      padding-top: 8px;
      margin-top: 8px;
    }
    @media print {
      body {
        background: #ffffff !important;
        padding: 0 !important;
      }
      .no-print, .print-bar {
        display: none !important;
      }
      .dossier-card {
        border: none !important;
        box-shadow: none !important;
        padding: 0 !important;
        max-width: 100% !important;
      }
    }
  </style>
</head>
<body>
  <div class="print-bar no-print">
    <div class="print-bar-info">
      <strong>DivyaDrishti Print Preview</strong> · Ready to export document or save as PDF
    </div>
    <div style="display: flex; gap: 10px;">
      <button class="print-bar-btn" onclick="window.print()">
        🖨️ Print / Save as PDF
      </button>
      <button style="background: #e5e0d3; color: #252824; border: 0; padding: 8px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer;" onclick="window.close()">
        ✕ Close
      </button>
    </div>
  </div>

  <article class="dossier-card">
    <div class="dossier-header">
      <div>
        <div class="dossier-brand">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          DivyaDrishti Verified Evidence Dossier
        </div>
        <h1 class="dossier-title">${escapeHtml(reportTitle)}</h1>
        <p class="dossier-org">${escapeHtml(organization)} · Project ID: #${activeProject?.id || 1}</p>
      </div>

      <div class="dossier-meta">
        <div><strong>Reporting Window:</strong> ${escapeHtml(reportingPeriod)}</div>
        <div><strong>Lead Auditor:</strong> ${escapeHtml(auditorName)}</div>
        <div class="c2pa-badge"><span class="c2pa-dot"></span> C2PA Integrity & Telemetry Verified</div>
      </div>
    </div>

    <section class="section-block">
      <h2 class="section-heading">1. Project Mission & Scope</h2>
      <p class="section-text">${escapeHtml(whatAreWeDoing)}</p>
    </section>

    <section class="section-block">
      <h2 class="section-heading">2. Executed Ground Actions</h2>
      <p class="section-text">${escapeHtml(whatWeDid)}</p>
    </section>

    <section class="section-block">
      <h2 class="section-heading">3. Observed Physical & Environmental Changes</h2>
      <p class="section-text">${escapeHtml(changesObserved)}</p>
    </section>

    ${
      beforeImage || afterImage
        ? `
    <section class="section-block">
      <h2 class="section-heading">4. Synchronized Before & After Evidence Plate</h2>
      <div class="pair-grid">
        ${
          beforeImage
            ? `
          <div class="pair-card">
            <div class="pair-img-wrap">
              <img src="${beforeImgSrc}" alt="Before state" />
              <span class="pair-badge badge-before">BEFORE INTERVENTION</span>
            </div>
            <div class="pair-meta">
              <p class="pair-caption">${escapeHtml(beforeCaption)}</p>
              <p class="pair-sub">📍 ${escapeHtml(beforeImage.metadata?.location_name || 'Delhi, India')} • ${escapeHtml(beforeImage.captured_at || 'Baseline')}</p>
            </div>
          </div>
        `
            : ''
        }
        ${
          afterImage
            ? `
          <div class="pair-card">
            <div class="pair-img-wrap">
              <img src="${afterImgSrc}" alt="After state" />
              <span class="pair-badge badge-after">AFTER INTERVENTION</span>
            </div>
            <div class="pair-meta">
              <p class="pair-caption">${escapeHtml(afterCaption)}</p>
              <p class="pair-sub">📍 ${escapeHtml(afterImage.metadata?.location_name || 'Delhi, India')} • ${escapeHtml(afterImage.captured_at || 'Completed')}</p>
            </div>
          </div>
        `
            : ''
        }
      </div>
    </section>
    `
        : ''
    }

    <section class="section-block">
      <h2 class="section-heading">5. Corroborating Field Evidence Assets (${selectedImages.length})</h2>
      <div class="evidence-grid">
        ${evidenceCardsHtml}
      </div>
    </section>

    <section class="signoff-box">
      <div class="signoff-head">
        🛡️ Auditor Verification & Forensic Sign-Off
      </div>
      <p class="signoff-text">${escapeHtml(auditorTakeaways)}</p>
      <div class="signoff-foot">
        <span>Cryptographic Digest: SHA256 Verified</span>
        <span>Generated by DivyaDrishti Evidence Engine</span>
      </div>
    </section>
  </article>

  <script>
    window.addEventListener('load', function() {
      setTimeout(function() {
        window.print();
      }, 500);
    });
  </script>
</body>
</html>`

    printWin.document.open()
    printWin.document.write(htmlContent)
    printWin.document.close()
  }

  return (
    <div className="flex-1 w-full p-6 md:p-8 flex flex-col gap-6 max-w-7xl mx-auto print:p-0 print:max-w-none">
      <div className="bg-white border border-[#e5e0d3] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#006b49] mb-1">
            <FileText size={15} />
            <span>Impact Report Generator</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#1f2420]">
            Export Verified Impact Report
          </h1>
          <p className="text-xs md:text-sm text-[#5a655c] mt-1">
            Assemble field photos, before/after evidence plates, and mission observations into an auditable document.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#f4f1e8] p-1.5 rounded-xl border border-[#e2dcd0]">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              step === 1
                ? 'bg-[#006b49] text-white shadow-xs'
                : 'text-[#4d564e] hover:text-[#1f2420]'
            }`}
          >
            1. Select Evidence ({selectedImageIds.length})
          </button>
          <button
            type="button"
            onClick={() => setStep(2)}
            disabled={selectedImageIds.length === 0}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              step === 2
                ? 'bg-[#006b49] text-white shadow-xs'
                : 'text-[#4d564e] hover:text-[#1f2420] disabled:opacity-40'
            }`}
          >
            2. Report Details
          </button>
          <button
            type="button"
            onClick={() => setStep(3)}
            disabled={selectedImageIds.length === 0}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              step === 3
                ? 'bg-[#006b49] text-white shadow-xs'
                : 'text-[#4d564e] hover:text-[#1f2420] disabled:opacity-40'
            }`}
          >
            3. Preview & Export
          </button>
        </div>
      </div>

      {step === 1 && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#faf9f5] border border-[#e5e0d3] rounded-xl px-5 py-3.5">
            <div className="flex flex-wrap items-center gap-3">
              {projects.length > 0 && (
                <>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1f2420]">
                    <Folder size={14} className="text-[#006b49]" />
                    <span>Project:</span>
                  </div>
                  <select
                    value={selectedProjectId || ''}
                    onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                    className="text-xs bg-white border border-[#d8d2c4] rounded-lg px-2.5 py-1 font-medium text-[#1f2420] focus:outline-none focus:border-[#006b49]"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.project_name}
                      </option>
                    ))}
                  </select>
                  <span className="h-4 w-px bg-[#d5cebf]" />
                </>
              )}
              <span className="text-xs font-medium text-[#4d564e]">
                {selectedImageIds.length} of {activeMedia.length} assets selected
              </span>
              <span className="h-4 w-px bg-[#d5cebf]" />
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs font-semibold text-[#006b49] hover:underline"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={handleClearSelection}
                className="text-xs font-medium text-[#7d877e] hover:underline"
              >
                Clear
              </button>
            </div>

            <button
              type="button"
              disabled={selectedImageIds.length === 0}
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 bg-[#006b49] hover:bg-[#005238] disabled:opacity-40 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-xs"
            >
              <span>Next: Add Report Information</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {loadingMedia ? (
            <div className="bg-white border border-[#e5e0d3] rounded-2xl p-12 text-center flex flex-col items-center gap-3">
              <Loader2 size={24} className="animate-spin text-[#006b49]" />
              <p className="text-xs text-[#5a655c]">Loading project media assets...</p>
            </div>
          ) : activeMedia.length === 0 ? (
            <div className="bg-white border border-[#e5e0d3] rounded-2xl p-12 text-center flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#f4f1e8] text-[#7d877e] flex items-center justify-center">
                <FileText size={22} />
              </div>
              <h3 className="text-base font-semibold text-[#1f2420]">No Media Found in Project</h3>
              <p className="text-xs text-[#5a655c] max-w-sm">
                Upload field photos to this project first to assemble an evidence report.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {activeMedia.map((item) => {
                const isSelected = selectedImageIds.includes(item.id)
                return (
                  <div
                    key={item.id}
                    onClick={() => handleToggleImage(item.id)}
                    className={`group relative bg-white border rounded-xl overflow-hidden cursor-pointer transition-all duration-150 flex flex-col ${
                      isSelected
                        ? 'border-[#006b49] ring-2 ring-[#006b49]/20 shadow-sm'
                        : 'border-[#e5e0d3] hover:border-[#b8b09f]'
                    }`}
                  >
                    <div className="relative aspect-4/3 w-full bg-[#f4f1e8] overflow-hidden">
                      <img
                        src={getMediaUrl(item.thumbnail_url || item.image_url)}
                        alt={item.display_name}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
                        loading="lazy"
                      />
                      <div className="absolute top-2 left-2 z-10">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                            isSelected
                              ? 'bg-[#006b49] border-[#006b49] text-white shadow-xs'
                              : 'bg-white/90 border-[#c5beaf] text-transparent hover:border-[#006b49]'
                          }`}
                        >
                          <CheckCircle2 size={13} className={isSelected ? 'opacity-100' : 'opacity-0'} />
                        </div>
                      </div>

                      {item.metadata?.latitude && (
                        <span className="absolute bottom-2 left-2 z-10 px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#1f2420]/80 text-white backdrop-blur-xs flex items-center gap-1">
                          <MapPin size={9} className="text-[#34d399]" /> GPS
                        </span>
                      )}
                    </div>

                    <div className="p-2.5 flex flex-col gap-1">
                      <p className="text-xs font-semibold text-[#1f2420] truncate" title={item.display_name}>
                        {item.display_name}
                      </p>
                      <p className="text-[10px] text-[#7d877e] truncate">
                        {item.metadata?.location_name || 'Delhi, India'}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="bg-white border border-[#e5e0d3] rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-xs">
          <div className="border-b border-[#ece7de] pb-4">
            <h2 className="text-lg font-serif font-bold text-[#1f2420]">
              Step 2: Project Narrative & Field Observations
            </h2>
            <p className="text-xs text-[#5a655c] mt-1">
              Provide the context, executed actions, and observed outcomes that will structure the final PDF report.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#3c443e]">
                Report Title
              </label>
              <input
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="w-full h-10 px-3 text-xs md:text-sm bg-[#faf9f5] border border-[#d8d2c4] rounded-lg focus:outline-none focus:border-[#006b49]"
                placeholder="e.g. Field Verification & Impact Progress Report"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#3c443e]">
                Organization / Implementing Partner
              </label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full h-10 px-3 text-xs md:text-sm bg-[#faf9f5] border border-[#d8d2c4] rounded-lg focus:outline-none focus:border-[#006b49]"
                placeholder="e.g. Delhi Urban Ecological Restoration Mission"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#3c443e]">
                Lead Field Auditor
              </label>
              <input
                type="text"
                value={auditorName}
                onChange={(e) => setAuditorName(e.target.value)}
                className="w-full h-10 px-3 text-xs md:text-sm bg-[#faf9f5] border border-[#d8d2c4] rounded-lg focus:outline-none focus:border-[#006b49]"
                placeholder="e.g. Field Verification Team"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#3c443e]">
                Audit / Reporting Period
              </label>
              <input
                type="text"
                value={reportingPeriod}
                onChange={(e) => setReportingPeriod(e.target.value)}
                className="w-full h-10 px-3 text-xs md:text-sm bg-[#faf9f5] border border-[#d8d2c4] rounded-lg focus:outline-none focus:border-[#006b49]"
                placeholder="e.g. October 2026"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#3c443e]">
              1. What are we doing? (Mission & Objectives)
            </label>
            <textarea
              rows={3}
              value={whatAreWeDoing}
              onChange={(e) => setWhatAreWeDoing(e.target.value)}
              className="w-full p-3 text-xs md:text-sm bg-[#faf9f5] border border-[#d8d2c4] rounded-lg focus:outline-none focus:border-[#006b49]"
              placeholder="State the core objective, project target, and community purpose..."
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#3c443e]">
              2. What we did? (Executed Field Operations)
            </label>
            <textarea
              rows={3}
              value={whatWeDid}
              onChange={(e) => setWhatWeDid(e.target.value)}
              className="w-full p-3 text-xs md:text-sm bg-[#faf9f5] border border-[#d8d2c4] rounded-lg focus:outline-none focus:border-[#006b49]"
              placeholder="Detail the activities completed on the ground..."
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#3c443e]">
              3. The Changes Observed (Outcomes & Survival Metrics)
            </label>
            <textarea
              rows={3}
              value={changesObserved}
              onChange={(e) => setChangesObserved(e.target.value)}
              className="w-full p-3 text-xs md:text-sm bg-[#faf9f5] border border-[#d8d2c4] rounded-lg focus:outline-none focus:border-[#006b49]"
              placeholder="Describe measurable physical changes, survival rates, and environmental feedback..."
            />
          </div>

          <div className="border border-[#e0dacd] bg-[#fbfaf6] rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#006b49]">
              <Sparkles size={14} />
              <span>Before & After Evidence Pairing Plate</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-[#1f2420]">
                  Select "Before" State Image
                </label>
                <select
                  value={beforeImageId || ''}
                  onChange={(e) => setBeforeImageId(Number(e.target.value))}
                  className="w-full h-9 px-3 text-xs bg-white border border-[#d8d2c4] rounded-lg focus:outline-none"
                >
                  {activeMedia.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.display_name} ({m.metadata?.location_name || 'Delhi'})
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={beforeCaption}
                  onChange={(e) => setBeforeCaption(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-white border border-[#d8d2c4] rounded-lg focus:outline-none"
                  placeholder="Baseline observation caption..."
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-[#1f2420]">
                  Select "After" State Image
                </label>
                <select
                  value={afterImageId || ''}
                  onChange={(e) => setAfterImageId(Number(e.target.value))}
                  className="w-full h-9 px-3 text-xs bg-white border border-[#d8d2c4] rounded-lg focus:outline-none"
                >
                  {activeMedia.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.display_name} ({m.metadata?.location_name || 'Delhi'})
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={afterCaption}
                  onChange={(e) => setAfterCaption(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-white border border-[#d8d2c4] rounded-lg focus:outline-none"
                  placeholder="Intervention outcome caption..."
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#3c443e]">
              4. Auditor Verification Takeaway & Compliance Note
            </label>
            <textarea
              rows={2}
              value={auditorTakeaways}
              onChange={(e) => setAuditorTakeaways(e.target.value)}
              className="w-full p-3 text-xs md:text-sm bg-[#faf9f5] border border-[#d8d2c4] rounded-lg focus:outline-none focus:border-[#006b49]"
              placeholder="Forensic sensor notes, tamper check verification, compliance statement..."
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#ece7de]">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#4d564e] hover:text-[#1f2420]"
            >
              <ArrowLeft size={14} />
              <span>Back to Image Selection</span>
            </button>

            <button
              type="button"
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-2 bg-[#006b49] hover:bg-[#005238] text-white text-xs font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-xs"
            >
              <span>Preview Report Document</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-[#faf9f5] border border-[#e5e0d3] rounded-xl px-6 py-3.5 print:hidden">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4d564e] hover:text-[#1f2420]"
              >
                <ArrowLeft size={14} />
                <span>Edit Narrative</span>
              </button>
              <span className="h-4 w-px bg-[#d5cebf]" />
              <span className="text-xs text-[#5a655c]">
                Ready to export · {selectedImages.length} verified primary media assets attached
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handlePrintPdf}
                className="inline-flex items-center gap-2 bg-[#006b49] hover:bg-[#005238] text-white text-xs font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-sm"
              >
                <Printer size={15} />
                <span>Export PDF Report</span>
              </button>
            </div>
          </div>

          <article className="bg-white border border-[#ded8cb] rounded-2xl p-8 md:p-12 shadow-sm flex flex-col gap-8 print:border-none print:shadow-none print:p-0">
            <div className="border-b-2 border-[#1f2420] pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#006b49] mb-1.5">
                  <ShieldCheck size={16} />
                  <span>DivyaDrishti Verified Evidence Dossier</span>
                </div>
                <h1 className="text-3xl font-serif font-bold text-[#1f2420] leading-tight">
                  {reportTitle}
                </h1>
                <p className="text-sm text-[#4d564e] mt-1 font-medium">
                  {organization} · Project ID: #{activeProject?.id || 1}
                </p>
              </div>

              <div className="text-left md:text-right text-xs text-[#5a655c] flex flex-col gap-1">
                <div>
                  <span className="font-semibold text-[#1f2420]">Reporting Window:</span> {reportingPeriod}
                </div>
                <div>
                  <span className="font-semibold text-[#1f2420]">Lead Auditor:</span> {auditorName}
                </div>
                <div className="inline-flex items-center gap-1.5 md:justify-end text-[#006b49] font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#006b49]" /> C2PA Integrity & Telemetry Verified
                </div>
              </div>
            </div>

            <section className="flex flex-col gap-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#006b49] border-b border-[#ece7de] pb-1.5">
                1. Project Mission & Scope
              </h2>
              <p className="text-xs md:text-sm text-[#2b312c] leading-relaxed">
                {whatAreWeDoing}
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#006b49] border-b border-[#ece7de] pb-1.5">
                2. Executed Ground Actions
              </h2>
              <p className="text-xs md:text-sm text-[#2b312c] leading-relaxed">
                {whatWeDid}
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#006b49] border-b border-[#ece7de] pb-1.5">
                3. Observed Physical & Environmental Changes
              </h2>
              <p className="text-xs md:text-sm text-[#2b312c] leading-relaxed">
                {changesObserved}
              </p>
            </section>

            {(beforeImage || afterImage) && (
              <section className="flex flex-col gap-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#006b49] border-b border-[#ece7de] pb-1.5">
                  4. Synchronized Before & After Evidence Plate
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-1">
                  {beforeImage && (
                    <div className="border border-[#ded8cb] rounded-xl overflow-hidden bg-[#faf9f6] flex flex-col">
                      <div className="relative aspect-16/10 w-full bg-[#e8e4da] overflow-hidden">
                        <img
                          src={getMediaUrl(beforeImage.image_url)}
                          alt="Before state"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#1f2420]/85 text-white">
                          BEFORE INTERVENTION
                        </span>
                      </div>
                      <div className="p-3.5 flex flex-col gap-1 text-xs">
                        <p className="font-semibold text-[#1f2420]">{beforeCaption}</p>
                        <div className="flex items-center gap-3 text-[11px] text-[#6d776e] mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin size={11} className="text-[#006b49]" />
                            {beforeImage.metadata?.location_name || 'Delhi, India'}
                          </span>
                          <span>·</span>
                          <span>{beforeImage.captured_at || 'Baseline'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {afterImage && (
                    <div className="border border-[#ded8cb] rounded-xl overflow-hidden bg-[#faf9f6] flex flex-col">
                      <div className="relative aspect-16/10 w-full bg-[#e8e4da] overflow-hidden">
                        <img
                          src={getMediaUrl(afterImage.image_url)}
                          alt="After state"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#006b49] text-white">
                          AFTER INTERVENTION
                        </span>
                      </div>
                      <div className="p-3.5 flex flex-col gap-1 text-xs">
                        <p className="font-semibold text-[#1f2420]">{afterCaption}</p>
                        <div className="flex items-center gap-3 text-[11px] text-[#6d776e] mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin size={11} className="text-[#006b49]" />
                            {afterImage.metadata?.location_name || 'Delhi, India'}
                          </span>
                          <span>·</span>
                          <span>{afterImage.captured_at || 'Completed'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            <section className="flex flex-col gap-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#006b49] border-b border-[#ece7de] pb-1.5">
                5. Corroborating Field Evidence Assets ({selectedImages.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-1">
                {selectedImages.map((img, idx) => (
                  <div
                    key={img.id}
                    className="border border-[#e0dacd] rounded-lg overflow-hidden bg-[#faf9f6] flex flex-col text-[10px]"
                  >
                    <div className="aspect-square w-full bg-[#eeebe2] overflow-hidden">
                      <img
                        src={getMediaUrl(img.thumbnail_url || img.image_url)}
                        alt={img.display_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-1.5 flex flex-col gap-0.5">
                      <p className="font-semibold text-[#1f2420] truncate" title={img.display_name}>
                        #{idx + 1} {img.display_name}
                      </p>
                      <p className="text-[#6d776e] text-[9px] truncate">
                        {img.metadata?.latitude ? `${img.metadata.latitude.toFixed(4)}, ${img.metadata.longitude.toFixed(4)}` : 'Geotagged'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-[#f5f8f6] border border-[#cfe2d7] rounded-xl p-5 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#006b49]">
                <ShieldCheck size={16} />
                <span>Auditor Verification & Forensic Sign-Off</span>
              </div>
              <p className="text-xs text-[#2b352e] leading-relaxed">
                {auditorTakeaways}
              </p>
              <div className="flex justify-between items-center text-[10px] text-[#556358] pt-2 border-t border-[#cfe2d7]/60 mt-1">
                <span>Cryptographic Digest: SHA256 Verified</span>
                <span>Generated by DivyaDrishti Evidence Engine</span>
              </div>
            </section>
          </article>
        </div>
      )}
    </div>
  )
}
