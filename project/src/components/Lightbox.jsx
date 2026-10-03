import React, { useState, useEffect, useCallback } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Info,
  Pencil,
  Trash2,
  MapPin,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  FileBadge,
  Calendar,
  Camera,
  Sparkles,
  Clock,
  Zap,
  Check,
  Loader2
} from 'lucide-react'
import { getMediaUrl, reverseGeocode, forceIndexImage, getImageAiData } from '../api/media'

function formatDisplayDate(dateStr) {
  if (!dateStr) return ''
  try {
    const raw = String(dateStr).trim()
    let iso = raw
    if (raw.includes(':') && !raw.includes('-')) {
      const parts = raw.split(' ')
      const datePart = parts[0].split(':').join('-')
      iso = datePart + (parts[1] ? 'T' + parts[1] : '')
    } else {
      iso = raw.replace(' ', 'T')
    }
    const d = new Date(iso)
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString()
    }
    const fallback = new Date(raw)
    if (!isNaN(fallback.getTime())) {
      return fallback.toLocaleDateString()
    }
    return ''
  } catch {
    return ''
  }
}

function formatLocationText(loc, lat, lon) {
  const isZeroCoord = (lat === 0 && lon === 0) || (lat === 0.0 && lon === 0.0)
  if (isZeroCoord || !loc || loc === '0.0, 0.0' || loc === '0.0' || loc === '0, 0' || loc === '0.0000, 0.0000' || loc === 'Location unavailable') {
    return 'Location unavailable'
  }
  return loc
}

export default function Lightbox({
  images = [],
  currentIndex = 0,
  resolvedLocations = {},
  onClose,
  onNavigate,
  onUpdateDisplayName,
  onDeleteImage,
  onForceIndex
}) {
  const [zoom, setZoom] = useState(1)
  const [showDrawer, setShowDrawer] = useState(true)
  const [isEditingName, setIsEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState('')
  const [isSubmittingName, setIsSubmittingName] = useState(false)
  const [activeLocation, setActiveLocation] = useState(null)
  const [activeTab, setActiveTab] = useState('specs')
  const [aiData, setAiData] = useState(null)
  const [loadingAi, setLoadingAi] = useState(false)
  const [isForceIndexing, setIsForceIndexing] = useState(false)
  const [isForceQueued, setIsForceQueued] = useState(false)

  const currentImage = images[currentIndex] || null

  useEffect(() => {
    if (currentImage) {
      setNameDraft(currentImage.display_name || '')
      setIsEditingName(false)
      setZoom(1)
      setIsForceQueued(false)

      if (currentImage.ai_inference) {
        setAiData(currentImage.ai_inference)
      } else if (currentImage.is_ai_indexed) {
        setLoadingAi(true)
        getImageAiData(currentImage.project_id, currentImage.id)
          .then((res) => {
            if (res.success && res.data?.data) {
              setAiData(res.data.data)
            }
          })
          .finally(() => setLoadingAi(false))
      } else {
        setAiData(null)
      }

      const meta = currentImage.metadata || {}
      const hasGps =
        meta.latitude !== null &&
        meta.latitude !== undefined &&
        meta.longitude !== null &&
        meta.longitude !== undefined

      if (!hasGps) {
        setActiveLocation(null)
      } else if (meta.latitude === 0 && meta.longitude === 0) {
        setActiveLocation('Location unavailable')
      } else if (meta.location_name) {
        setActiveLocation(formatLocationText(meta.location_name, meta.latitude, meta.longitude))
      } else if (resolvedLocations[currentImage.id]) {
        setActiveLocation(formatLocationText(resolvedLocations[currentImage.id], meta.latitude, meta.longitude))
      } else {
        reverseGeocode(meta.latitude, meta.longitude).then((res) => {
          if (res.success && res.data?.location_name) {
            setActiveLocation(formatLocationText(res.data.location_name, meta.latitude, meta.longitude))
          } else {
            setActiveLocation('Location unavailable')
          }
        })
      }
    }
  }, [currentIndex, currentImage, resolvedLocations])

  const handleForceIndex = async () => {
    if (!currentImage || isForceIndexing) return
    setIsForceIndexing(true)
    const res = await forceIndexImage(currentImage.project_id, currentImage.id)
    setIsForceIndexing(false)
    if (res.success) {
      setIsForceQueued(true)
      if (onForceIndex) onForceIndex(currentImage.id)
    }
  }

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowLeft') {
        if (currentIndex > 0) onNavigate(currentIndex - 1)
      } else if (e.key === 'ArrowRight') {
        if (currentIndex < images.length - 1) onNavigate(currentIndex + 1)
      }
    },
    [currentIndex, images.length, onClose, onNavigate]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (!currentImage) return null

  const meta = currentImage.metadata || {}
  const hasGps =
    meta.latitude !== null &&
    meta.latitude !== undefined &&
    meta.longitude !== null &&
    meta.longitude !== undefined
  const gpsUrl = hasGps
    ? `https://www.google.com/maps?q=${meta.latitude},${meta.longitude}`
    : null

  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
  }

  const handleSaveName = async () => {
    if (!nameDraft.trim() || nameDraft === currentImage.display_name) {
      setIsEditingName(false)
      return
    }
    setIsSubmittingName(true)
    if (onUpdateDisplayName) {
      await onUpdateDisplayName(currentImage.id, nameDraft.trim())
    }
    setIsSubmittingName(false)
    setIsEditingName(false)
  }

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5))
  const handleResetZoom = () => setZoom(1)

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#ffffff] text-[#252824] select-none overflow-hidden">
      <header className="h-16 px-6 bg-white border-b border-[#e7e3da] flex items-center justify-between z-30 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#f4f2ea] text-[#4a544c] flex-shrink-0">
            {currentIndex + 1} of {images.length}
          </span>

          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName()
                  if (e.key === 'Escape') setIsEditingName(false)
                }}
                className="h-8 px-3 text-xs font-medium border border-[#188f70] rounded-md bg-[#faf9f6] text-[#252824] focus:outline-none"
                autoFocus
              />
              <button
                type="button"
                onClick={handleSaveName}
                disabled={isSubmittingName}
                className="h-8 px-3 text-xs font-medium rounded-md bg-[#188f70] text-white hover:bg-[#13735a] transition-colors"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditingName(false)}
                className="h-8 px-2.5 text-xs font-medium rounded-md bg-[#f4f2ea] text-[#5b655c] hover:bg-[#eae6da] transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 min-w-0">
              {currentImage.is_ai_indexed && (
                <span title="Indexed with AI" className="text-emerald-600 inline-flex items-center shrink-0">
                  <Sparkles size={16} className="text-emerald-600" />
                </span>
              )}
              <h2 className="text-sm md:text-base font-semibold text-[#252824] truncate max-w-sm md:max-w-lg">
                {currentImage.display_name}
              </h2>
              <button
                type="button"
                onClick={() => setIsEditingName(true)}
                className="p-1.5 rounded-md hover:bg-[#f4f2ea] text-[#636d64] hover:text-[#252824] transition-colors flex-shrink-0"
                title="Rename image"
              >
                <Pencil size={14} />
              </button>
              {currentImage.is_grouped && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 flex-shrink-0">
                  Grouped
                </span>
              )}
              {hasGps && activeLocation && (
                <span
                  className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md max-w-[220px] truncate flex-shrink-0"
                  style={activeLocation === 'Location unavailable' ? { color: '#636d64', borderColor: '#dcd7cc', background: '#f4f2ea', border: '1px solid #dcd7cc' } : { color: '#188f70', borderColor: '#cbe5d8', background: '#eef7f2', border: '1px solid #cbe5d8' }}
                  title={activeLocation}
                >
                  <MapPin size={11} className="flex-shrink-0" />
                  <span className="truncate">{activeLocation}</span>
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center border border-[#dcd7cc] rounded-lg bg-[#faf9f6] p-0.5">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1.5 text-[#5b655c] hover:text-[#252824] hover:bg-[#edeae1] rounded-md transition-colors"
              title="Zoom Out"
            >
              <ZoomOut size={16} />
            </button>
            <span className="px-2 text-xs font-mono font-medium text-[#4a544c]">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1.5 text-[#5b655c] hover:text-[#252824] hover:bg-[#edeae1] rounded-md transition-colors"
              title="Zoom In"
            >
              <ZoomIn size={16} />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="p-1.5 text-[#5b655c] hover:text-[#252824] hover:bg-[#edeae1] rounded-md transition-colors ml-0.5"
              title="Reset Zoom"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          <a
            href={getMediaUrl(currentImage.image_url)}
            download={currentImage.original_file_name || currentImage.file_name}
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-lg border border-[#dcd7cc] bg-white text-[#4a544c] hover:text-[#188f70] hover:border-[#188f70] transition-colors"
            title="Download full resolution"
          >
            <Download size={16} />
          </a>

          <button
            type="button"
            onClick={() => setShowDrawer(!showDrawer)}
            className={`p-2 rounded-lg border transition-colors ${
              showDrawer
                ? 'border-[#188f70] bg-[#eef8f2] text-[#006b49]'
                : 'border-[#dcd7cc] bg-white text-[#4a544c] hover:bg-[#faf9f6]'
            }`}
            title="Toggle Evidence Details"
          >
            <Info size={16} />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg border border-[#dcd7cc] bg-white text-[#4a544c] hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors ml-1"
            title="Close Lightbox"
          >
            <X size={16} />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-[#f7f6f2] p-6">
          {currentIndex > 0 && (
            <button
              type="button"
              onClick={() => onNavigate(currentIndex - 1)}
              className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white border border-[#dcd7cc] text-[#252824] hover:border-[#188f70] hover:bg-[#faf9f6] shadow-md flex items-center justify-center transition-all transform hover:scale-105 active:scale-95"
              title="Previous image"
            >
              <ChevronLeft size={22} />
            </button>
          )}

          {currentIndex < images.length - 1 && (
            <button
              type="button"
              onClick={() => onNavigate(currentIndex + 1)}
              className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white border border-[#dcd7cc] text-[#252824] hover:border-[#188f70] hover:bg-[#faf9f6] shadow-md flex items-center justify-center transition-all transform hover:scale-105 active:scale-95"
              title="Next image"
            >
              <ChevronRight size={22} />
            </button>
          )}

          <div
            className="flex items-center justify-center w-full h-full transition-transform duration-150 ease-out"
            style={{ transform: `scale(${zoom})` }}
          >
            <img
              src={getMediaUrl(currentImage.image_url)}
              alt={currentImage.display_name}
              className="max-h-[76vh] max-w-[80vw] object-contain rounded-xl shadow-lg border border-[#e7e3da] bg-white pointer-events-none"
            />
          </div>
        </div>

        {showDrawer && (
          <aside className="w-88 md:w-96 bg-white border-l border-[#e7e3da] flex flex-col h-full overflow-y-auto p-6 z-20 flex-shrink-0">
            <div className="flex items-center justify-between pb-3 border-b border-[#eeebe3]">
              <div className="flex items-center gap-1 bg-[#f4f2eb] p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setActiveTab('specs')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    activeTab === 'specs'
                      ? 'bg-white text-[#252824] shadow-xs'
                      : 'text-[#6d776e] hover:text-[#252824]'
                  }`}
                >
                  EXIF & Specs
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('ai')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1 transition-all cursor-pointer ${
                    activeTab === 'ai'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-[#6d776e] hover:text-emerald-700'
                  }`}
                >
                  <Sparkles size={12} className={currentImage?.is_ai_indexed ? 'text-emerald-600' : 'text-amber-500'} />
                  <span>AI Evidence</span>
                </button>
              </div>
              <span className="text-xs font-mono font-medium text-[#7c877d]">ID #{currentImage.id}</span>
            </div>

            {activeTab === 'specs' ? (
              <>
                <div className="mt-4 flex flex-col gap-3">
                  {currentImage.is_ai_generated ? (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
                      <div className="flex items-center gap-2 font-semibold text-xs text-rose-700">
                        <AlertTriangle size={15} />
                        AI Generation Flagged
                      </div>
                      <p className="mt-1 text-xs text-rose-800/80 leading-relaxed">
                        Synthetic generator markers or C2PA generative signatures were detected in this media file.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                      <div className="flex items-center gap-2 font-semibold text-xs text-emerald-700">
                        <ShieldCheck size={16} />
                        Camera Provenance Verified
                      </div>
                      <p className="mt-1 text-xs text-emerald-800/80 leading-relaxed">
                        Standard optical sensor capture attributes matched without AI synthetic signatures.
                      </p>
                    </div>
                  )}

                  {meta.c2pa_manifest_detected && (
                    <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 text-xs">
                      <div className="font-semibold text-sky-700 flex items-center gap-1.5">
                        <FileBadge size={15} />
                        C2PA Manifest Detected
                      </div>
                      <div className="text-[11.5px] text-sky-800/80 mt-0.5">
                        JUMBF content credentials structure located inside file binary.
                      </div>
                    </div>
                  )}
                </div>

                {hasGps ? (
                  <div className="mt-6">
                    <span className="text-xs uppercase tracking-wider font-semibold text-[#5b655c] block pb-2 border-b border-[#eeebe3]">
                      Location & Timestamp
                    </span>
                    <dl className="mt-3 flex flex-col gap-3 text-xs">
                      <div>
                        <dt className="text-[#6d776e] flex items-center gap-1.5">
                          <Calendar size={13} /> Capture Date / Time
                        </dt>
                        <dd className="font-medium text-[#252824] mt-1 pl-4">
                          {formatDisplayDate(meta.capture_datetime || currentImage.captured_at) ||
                           formatDisplayDate(currentImage.upload_time) ||
                           'Not recorded in EXIF'}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-[#6d776e] flex items-center gap-1.5">
                          <MapPin size={13} /> Location
                        </dt>
                        <dd className={`font-semibold mt-1 pl-4 ${activeLocation === 'Location unavailable' ? 'text-[#7c877d]' : 'text-[#188f70]'}`}>
                          {activeLocation || 'Location unavailable'}
                        </dd>
                      </div>

                      {!(meta.latitude === 0 && meta.longitude === 0) && (
                        <div>
                          <dt className="text-[#6d776e]">Coordinates</dt>
                          <dd className="mt-1 pl-4 flex flex-col gap-1">
                            <span className="font-mono text-[#252824]">
                              {meta.latitude.toFixed(6)}, {meta.longitude.toFixed(6)}
                              {meta.altitude ? ` (${meta.altitude}m)` : ''}
                            </span>
                            <a
                              href={gpsUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[#188f70] hover:text-[#006b49] font-medium underline"
                            >
                              <span>Open in Google Maps</span>
                              <ExternalLink size={12} />
                            </a>
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                ) : (meta.capture_datetime || currentImage.captured_at || currentImage.upload_time) ? (
                  <div className="mt-6">
                    <span className="text-xs uppercase tracking-wider font-semibold text-[#5b655c] block pb-2 border-b border-[#eeebe3]">
                      Timestamp
                    </span>
                    <dl className="mt-3 flex flex-col gap-3 text-xs">
                      <div>
                        <dt className="text-[#6d776e] flex items-center gap-1.5">
                          <Calendar size={13} /> Capture Date / Time
                        </dt>
                        <dd className="font-medium text-[#252824] mt-1 pl-4">
                          {formatDisplayDate(meta.capture_datetime || currentImage.captured_at) ||
                           formatDisplayDate(currentImage.upload_time) ||
                           'Not recorded in EXIF'}
                        </dd>
                      </div>
                    </dl>
                  </div>
                ) : null}

                <div className="mt-6">
                  <span className="text-xs uppercase tracking-wider font-semibold text-[#5b655c] block pb-2 border-b border-[#eeebe3]">
                    Device & Technical Specs
                  </span>
                  <dl className="mt-3 flex flex-col gap-2.5 text-xs">
                    <div>
                      <dt className="text-[#6d776e] flex items-center gap-1.5">
                        <Camera size={13} /> Camera Device
                      </dt>
                      <dd className="font-medium text-[#252824] mt-0.5 pl-4">
                        {meta.camera_make || meta.camera_model
                          ? `${meta.camera_make || ''} ${meta.camera_model || ''}`.trim()
                          : 'Unknown / Not recorded'}
                      </dd>
                    </div>

                    {meta.lens_model && (
                      <div>
                        <dt className="text-[#6d776e]">Lens Model</dt>
                        <dd className="font-medium text-[#252824] mt-0.5">{meta.lens_model}</dd>
                      </div>
                    )}

                    <div>
                      <dt className="text-[#6d776e]">Dimensions</dt>
                      <dd className="font-medium text-[#252824] mt-0.5">
                        {meta.width && meta.height ? `${meta.width} × ${meta.height} px` : 'Unknown'}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-[#6d776e]">File Size & Format</dt>
                      <dd className="font-medium text-[#252824] mt-0.5">
                        {formatFileSize(currentImage.file_size)} • {currentImage.mime_type}
                      </dd>
                    </div>

                    {meta.software && (
                      <div>
                        <dt className="text-[#6d776e]">Software / Processing</dt>
                        <dd className="font-medium text-[#252824] mt-0.5 break-words">{meta.software}</dd>
                      </div>
                    )}

                    {meta.creator && (
                      <div>
                        <dt className="text-[#6d776e]">Photographer / Creator</dt>
                        <dd className="font-medium text-[#252824] mt-0.5">{meta.creator}</dd>
                      </div>
                    )}

                    {meta.description && (
                      <div>
                        <dt className="text-[#6d776e] flex items-center gap-1.5">
                          {currentImage.is_ai_indexed && (
                            <Sparkles size={12} className="text-emerald-600 shrink-0" />
                          )}
                          <span>Embedded Description</span>
                        </dt>
                        <dd className="font-medium text-[#252824] mt-0.5 italic">{meta.description}</dd>
                      </div>
                    )}

                    {meta.copyright && (
                      <div>
                        <dt className="text-[#6d776e]">Copyright / License</dt>
                        <dd className="font-medium text-[#252824] mt-0.5">{meta.copyright}</dd>
                      </div>
                    )}

                    <div>
                      <dt className="text-[#6d776e]">Storage Filename</dt>
                      <dd className="font-mono text-[11px] text-[#7c877d] mt-0.5 break-all">
                        {currentImage.file_name}
                      </dd>
                    </div>
                  </dl>
                </div>
              </>
            ) : (
              <div className="mt-4 flex flex-col gap-4 text-xs">
                {!currentImage.is_ai_indexed ? (
                  <div className="flex flex-col gap-4">
                    <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[#252824]">
                      <div className="flex items-center gap-2 font-semibold text-xs text-amber-800">
                        <Clock size={15} className="text-amber-600" />
                        <span>Pending AI Indexing</span>
                      </div>
                      <p className="mt-1 text-xs text-amber-900/80 leading-relaxed">
                        Visual evidence and semantic tags have not been generated for this image yet. It is currently in the background queue.
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isForceIndexing || isForceQueued}
                      onClick={handleForceIndex}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      {isForceIndexing ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Submitting to Priority Queue...</span>
                        </>
                      ) : isForceQueued ? (
                        <>
                          <Check size={14} />
                          <span>Prioritized for Next Batch</span>
                        </>
                      ) : (
                        <>
                          <Zap size={14} />
                          <span>Force Index Now</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : loadingAi ? (
                  <div className="flex items-center justify-center py-12 text-[#6d776e] gap-2">
                    <Loader2 size={16} className="animate-spin text-emerald-600" />
                    <span>Loading visual evidence...</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="p-3 rounded-xl border border-[#e7e3da] bg-[#faf9f6]">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase tracking-wider font-semibold text-[#5b655c]">
                          Image Quality
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold capitalize ${
                            aiData?.iq_label === 'unusable'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : aiData?.iq_label === 'low'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : aiData?.iq_label === 'medium'
                              ? 'bg-sky-50 text-sky-800 border border-sky-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {aiData?.iq_label || 'Good'} • {Math.round((aiData?.iq_score || 0.75) * 100)}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#e7e3da] rounded-full overflow-hidden mt-2">
                        <div
                          className={`h-full transition-all duration-300 ${
                            aiData?.iq_label === 'unusable'
                              ? 'bg-rose-500'
                              : aiData?.iq_label === 'low'
                              ? 'bg-amber-500'
                              : aiData?.iq_label === 'medium'
                              ? 'bg-sky-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.round((aiData?.iq_score || 0.75) * 100)}%` }}
                        />
                      </div>
                      {(aiData?.iq_label === 'unusable' || aiData?.iq_label === 'low') && (
                        <p className="mt-2 text-[11px] text-amber-800 flex items-center gap-1.5">
                          <AlertTriangle size={13} className="shrink-0 text-amber-600" />
                          <span>
                            {aiData?.iq_label === 'unusable'
                              ? 'Severe blur or corruption detected. Flagged for site recapture.'
                              : 'Degraded visibility or motion blur may affect feature confidence.'}
                          </span>
                        </p>
                      )}
                    </div>

                    {aiData?.tag?.length > 0 && (
                      <div>
                        <span className="text-[11px] uppercase tracking-wider font-semibold text-[#5b655c] block pb-1.5 border-b border-[#eeebe3]">
                          Search Tags
                        </span>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {aiData.tag.map((t, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-xs font-medium"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {aiData?.sdsc && (
                      <div>
                        <span className="text-[11px] uppercase tracking-wider font-semibold text-[#5b655c] block pb-1.5 border-b border-[#eeebe3]">
                          Semantic Summary
                        </span>
                        <p className="mt-2 text-xs text-[#252824] font-medium leading-relaxed p-2.5 rounded-lg bg-[#faf9f6] border border-[#e7e3da]">
                          "{aiData.sdsc}"
                        </p>
                      </div>
                    )}

                    {aiData?.ddsc && (
                      <div>
                        <span className="text-[11px] uppercase tracking-wider font-semibold text-[#5b655c] block pb-1.5 border-b border-[#eeebe3]">
                          Visual Details
                        </span>
                        <p className="mt-2 text-xs text-[#4b554d] leading-relaxed">
                          {aiData.ddsc}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#eeebe3]">
                      <div className="p-2.5 rounded-lg bg-[#faf9f6] border border-[#e7e3da]">
                        <span className="text-[10.5px] uppercase tracking-wider font-semibold text-[#6d776e] block">Scene</span>
                        <span className="text-xs font-medium text-[#252824] capitalize mt-0.5 block truncate">
                          {aiData?.scn || 'Unknown'}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#faf9f6] border border-[#e7e3da]">
                        <span className="text-[10.5px] uppercase tracking-wider font-semibold text-[#6d776e] block">Lighting</span>
                        <span className="text-xs font-medium text-[#252824] capitalize mt-0.5 block truncate">
                          {aiData?.tim || 'Unknown'}
                        </span>
                      </div>
                    </div>

                    {aiData?.obj?.length > 0 && (
                      <div>
                        <span className="text-[11px] uppercase tracking-wider font-semibold text-[#5b655c] block pb-1.5 border-b border-[#eeebe3]">
                          Identified Objects ({aiData.obj.length})
                        </span>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {aiData.obj.map((o, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-[#f0eee6] text-[#3e473f] text-[11.5px]">
                              {o}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {aiData?.act?.length > 0 && (
                      <div>
                        <span className="text-[11px] uppercase tracking-wider font-semibold text-[#5b655c] block pb-1.5 border-b border-[#eeebe3]">
                          Active Actions ({aiData.act.length})
                        </span>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {aiData.act.map((a, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200/50 text-[11.5px]">
                              {a}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {aiData?.evd?.length > 0 && (
                      <div>
                        <span className="text-[11px] uppercase tracking-wider font-semibold text-[#5b655c] block pb-1.5 border-b border-[#eeebe3]">
                          Visual Evidence Points
                        </span>
                        <ul className="mt-2 flex flex-col gap-1.5 pl-3">
                          {aiData.evd.map((pt, idx) => (
                            <li key={idx} className="text-xs text-[#353c36] list-disc leading-snug">
                              {pt}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="mt-auto pt-6 border-t border-[#eeebe3]">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete "${currentImage.display_name}"?`)) {
                    if (onDeleteImage) onDeleteImage(currentImage.id)
                  }
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold transition-colors"
              >
                <Trash2 size={14} /> Delete This Image
              </button>
            </div>
          </aside>
        )}
      </div>

      <footer className="h-20 bg-white border-t border-[#e7e3da] px-6 flex items-center gap-3 overflow-x-auto z-30 flex-shrink-0">
        {images.map((img, idx) => (
          <button
            key={img.id}
            type="button"
            onClick={() => onNavigate(idx)}
            className={`h-14 w-14 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all relative ${
              idx === currentIndex
                ? 'border-[#188f70] scale-105 shadow-sm'
                : 'border-transparent opacity-60 hover:opacity-100 hover:border-[#dcd7cc]'
            }`}
            title={img.display_name}
          >
            <img
              src={getMediaUrl(img.thumbnail_url || img.image_url)}
              alt={img.display_name}
              className="w-full h-full object-cover"
            />
            {!img.is_ai_indexed && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 border border-black/40" title="Pending AI indexing" />
            )}
          </button>
        ))}
      </footer>
    </div>
  )
}
