import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Search,
  X,
  Compass,
  Sparkles,
  MapPin,
  Layers,
  LayoutGrid,
  Filter,
  Check,
  ChevronDown,
  Clock,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Loader2,
  Folder,
  SlidersHorizontal,
  ExternalLink,
  Eye,
  Maximize2
} from 'lucide-react'
import { searchExplore, batchReindexCrossProject, getMediaUrl } from '../api/media'

export default function ExploreView({
  projects = [],
  onOpenLightbox,
  user = {}
}) {
  const [query, setQuery] = useState('')
  const [similarToItem, setSimilarToItem] = useState(null)
  const [selectedProjectIds, setSelectedProjectIds] = useState([])
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false)
  const [timFilter, setTimFilter] = useState('all')
  const [iqFilter, setIqFilter] = useState('all')
  const [hideDegraded, setHideDegraded] = useState(false)
  const [sortBy, setSortBy] = useState('relevance')
  const [viewMode, setViewMode] = useState('grid')
  const [groupBy, setGroupBy] = useState('tim')

  const [results, setResults] = useState([])
  const [totalMatches, setTotalMatches] = useState(0)
  const [facets, setFacets] = useState({
    tim_counts: {},
    iq_counts: {},
    project_counts: {},
    total_with_gps: 0
  })
  const [loading, setLoading] = useState(false)
  const [queryTimeMs, setQueryTimeMs] = useState(0)

  const [selectedImageIds, setSelectedImageIds] = useState(new Set())
  const [isReindexing, setIsReindexing] = useState(false)
  const [reindexMessage, setReindexMessage] = useState(null)

  const abortControllerRef = useRef(null)
  const debounceTimerRef = useRef(null)
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])

  const executeSearch = useCallback(
    async (
      searchQuery,
      targetSimilarId,
      projectIds,
      tim,
      iq,
      isHideDegraded,
      sort
    ) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()

      setLoading(true)
      const startTime = performance.now()

      let resolvedIq = iq === 'all' ? null : iq
      let minScore = null
      if (isHideDegraded && !resolvedIq) {
        minScore = 0.50
      }

      const payload = {
        query: targetSimilarId ? '' : searchQuery.trim(),
        similar_to_image_id: targetSimilarId || null,
        project_ids: projectIds && projectIds.length > 0 ? projectIds : null,
        tim: tim === 'all' ? null : tim,
        iq_label: resolvedIq,
        min_iq_score: minScore,
        sort_by: sort,
        limit: 120,
        offset: 0
      }

      const res = await searchExplore(payload, abortControllerRef.current.signal)
      if (res.success && res.data) {
        setResults(res.data.results || [])
        setTotalMatches(res.data.total_matches || 0)
        setFacets(
          res.data.facets || {
            tim_counts: {},
            iq_counts: {},
            project_counts: {},
            total_with_gps: 0
          }
        )
        setQueryTimeMs(Math.round(performance.now() - startTime))
        setLoading(false)
      } else if (!res.isCanceled) {
        setLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    executeSearch(
      query,
      similarToItem ? similarToItem.id : null,
      selectedProjectIds,
      timFilter,
      iqFilter,
      hideDegraded,
      sortBy
    )
  }, [
    executeSearch,
    similarToItem,
    selectedProjectIds,
    timFilter,
    iqFilter,
    hideDegraded,
    sortBy
  ])

  const handleQueryChange = (e) => {
    const val = e.target.value
    setQuery(val)
    if (similarToItem) {
      setSimilarToItem(null)
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      executeSearch(
        val,
        null,
        selectedProjectIds,
        timFilter,
        iqFilter,
        hideDegraded,
        sortBy
      )
    }, 250)
  }

  const handleKeyUp = (e) => {
    if (e.key === ' ' || e.code === 'Space') {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      executeSearch(
        query,
        null,
        selectedProjectIds,
        timFilter,
        iqFilter,
        hideDegraded,
        sortBy
      )
    }
  }

  const handleClearQuery = () => {
    setQuery('')
    setSimilarToItem(null)
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    executeSearch(
      '',
      null,
      selectedProjectIds,
      timFilter,
      iqFilter,
      hideDegraded,
      sortBy
    )
  }

  const handleFindSimilar = (item, e) => {
    e.stopPropagation()
    setSimilarToItem(item)
    setQuery('')
    setSortBy('relevance')
  }

  const handleTagClick = (tag, e) => {
    if (e) e.stopPropagation()
    const cleanTag = tag.replace(/^#/, '').trim()
    setQuery(cleanTag)
    setSimilarToItem(null)
    executeSearch(
      cleanTag,
      null,
      selectedProjectIds,
      timFilter,
      iqFilter,
      hideDegraded,
      sortBy
    )
  }

  const toggleProject = (projectId) => {
    setSelectedProjectIds((prev) => {
      if (prev.includes(projectId)) {
        return prev.filter((id) => id !== projectId)
      } else {
        return [...prev, projectId]
      }
    })
  }

  const toggleSelectImage = (id, e) => {
    e.stopPropagation()
    setSelectedImageIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleSelectAllMatches = () => {
    const allIds = results.map((r) => r.id)
    setSelectedImageIds(new Set(allIds))
  }

  const handleClearSelection = () => {
    setSelectedImageIds(new Set())
  }

  const handleBatchReindex = async () => {
    if (selectedImageIds.size === 0) return
    setIsReindexing(true)
    setReindexMessage(null)
    const res = await batchReindexCrossProject(Array.from(selectedImageIds))
    setIsReindexing(false)
    if (res.success) {
      setReindexMessage(res.data?.message || 'Images queued for priority reindexing')
      setSelectedImageIds(new Set())
      setTimeout(() => {
        executeSearch(
          query,
          similarToItem ? similarToItem.id : null,
          selectedProjectIds,
          timFilter,
          iqFilter,
          hideDegraded,
          sortBy
        )
      }, 800)
    } else {
      setReindexMessage(res.error || 'Failed to reindex images')
    }
  }

  useEffect(() => {
    if (viewMode !== 'map' || !mapContainerRef.current) return

    const loadLeaflet = () => {
      return new Promise((resolve) => {
        if (window.L) {
          resolve(window.L)
          return
        }
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link')
          link.id = 'leaflet-css'
          link.rel = 'stylesheet'
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
          document.head.appendChild(link)
        }
        if (!document.getElementById('leaflet-js')) {
          const script = document.createElement('script')
          script.id = 'leaflet-js'
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
          script.onload = () => resolve(window.L)
          document.head.appendChild(script)
        } else {
          const checkTimer = setInterval(() => {
            if (window.L) {
              clearInterval(checkTimer)
              resolve(window.L)
            }
          }, 50)
        }
      })
    }

    loadLeaflet().then((L) => {
      if (!mapContainerRef.current) return

      if (!mapInstanceRef.current) {
        mapInstanceRef.current = L.map(mapContainerRef.current).setView([20.5937, 78.9629], 5)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(mapInstanceRef.current)
      }

      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []

      const geotagged = results.filter(
        (r) => r.latitude !== null && r.longitude !== null && !isNaN(r.latitude) && !isNaN(r.longitude)
      )

      if (geotagged.length > 0) {
        const bounds = []
        geotagged.forEach((item) => {
          const lat = parseFloat(item.latitude)
          const lon = parseFloat(item.longitude)
          bounds.push([lat, lon])

          const popupContent = `
            <div style="font-family: inherit; width: 220px; font-size: 13px;">
              <img src="${getMediaUrl(item.thumbnail_url || item.image_url)}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />
              <div style="font-weight: 600; color: #252824; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${item.display_name || item.file_name}
              </div>
              <div style="font-size: 11px; color: #758076; margin-bottom: 6px;">
                ${item.project_name || 'Project'} • ${item.tim || 'time unk'}
              </div>
              <div style="display: flex; gap: 4px; margin-bottom: 8px;">
                <span style="font-size: 10px; padding: 2px 6px; border-radius: 4px; background: #eaf5ee; color: #006b49; font-weight: 600;">
                  ${item.iq_label || 'IQ: ' + (item.iq_score || 'N/A')}
                </span>
                ${item.similarity_score ? `<span style="font-size: 10px; padding: 2px 6px; border-radius: 4px; background: #006b49; color: #fff; font-weight: 600;">${Math.round(item.similarity_score * 100)}% match</span>` : ''}
              </div>
              <div style="font-size: 11px; color: #525c53; margin-bottom: 8px;">
                ${item.location_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`}
              </div>
            </div>
          `

          const marker = L.marker([lat, lon]).addTo(mapInstanceRef.current)
          marker.bindPopup(popupContent)
          markersRef.current.push(marker)
        })

        if (bounds.length > 0) {
          mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 })
        }
      }
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [viewMode, results])

  const groupedResults = React.useMemo(() => {
    if (viewMode !== 'grouped') return {}
    const groups = {}

    results.forEach((item) => {
      let groupKey = 'Other'
      if (groupBy === 'tim') {
        groupKey = item.tim ? item.tim.toUpperCase() : 'UNKNOWN TIME'
      } else if (groupBy === 'quality') {
        const label = item.iq_label || 'medium'
        if (label === 'very high' || label === 'high') {
          groupKey = 'HIGH FORENSIC QUALITY'
        } else if (label === 'medium') {
          groupKey = 'STANDARD QUALITY'
        } else {
          groupKey = 'DEGRADED / WARNING QUALITY'
        }
      } else if (groupBy === 'project') {
        groupKey = item.project_name ? item.project_name.toUpperCase() : 'UNASSIGNED'
      }

      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(item)
    })
    return groups
  }, [results, viewMode, groupBy])

  const timOptions = [
    { id: 'all', label: 'All Times', count: totalMatches },
    { id: 'morning', label: 'Morning', icon: '🌅', count: facets.tim_counts?.morning || 0 },
    { id: 'day', label: 'Day', icon: '☀️', count: facets.tim_counts?.day || 0 },
    { id: 'evening', label: 'Evening', icon: '🌇', count: facets.tim_counts?.evening || 0 },
    { id: 'night', label: 'Night', icon: '🌙', count: facets.tim_counts?.night || 0 },
    { id: 'unknown', label: 'Ambiguous', icon: '❓', count: facets.tim_counts?.unknown || 0 }
  ]

  const iqOptions = [
    { id: 'all', label: 'All Quality' },
    { id: 'very high', label: 'Very High', count: facets.iq_counts?.['very high'] || 0 },
    { id: 'high', label: 'High', count: facets.iq_counts?.high || 0 },
    { id: 'medium', label: 'Medium', count: facets.iq_counts?.medium || 0 },
    { id: 'low', label: 'Low', count: facets.iq_counts?.low || 0 },
    { id: 'unusable', label: 'Unusable', count: facets.iq_counts?.unusable || 0 }
  ]

  const suggestedQueries = [
    'people planting trees',
    'check dam structure',
    'earthmoving excavation',
    'dense green vegetation',
    'stone boundary markers',
    'water pond retention',
    'tilled soil nursery'
  ]

  const renderImageCard = (item, overallIndex) => {
    const isSelected = selectedImageIds.has(item.id)
    const isUnusable = item.iq_label === 'unusable'
    const isLow = item.iq_label === 'low'
    const isSearchActive = Boolean(query.trim() || similarToItem)
    const similarityPct =
      isSearchActive &&
      typeof item.similarity_score === 'number' &&
      item.similarity_score > 0
        ? Math.round(item.similarity_score * 100)
        : null

    return (
      <div
        key={item.id}
        onClick={() => onOpenLightbox && onOpenLightbox(results, overallIndex)}
        className={`group relative flex flex-col rounded-xl overflow-hidden bg-white border transition-all duration-200 cursor-pointer hover:shadow-md ${
          isSelected
            ? 'border-[#006b49] ring-2 ring-[#006b49]/20'
            : 'border-[#e7e3da] hover:border-[#cfc9bd]'
        }`}
      >
        <div className="relative aspect-4/3 w-full bg-[#f4f3ec] overflow-hidden">
          <img
            src={getMediaUrl(item.thumbnail_url || item.image_url)}
            alt={item.display_name || item.file_name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              const fallbackUrl = getMediaUrl(item.image_url)
              if (fallbackUrl && e.target.src !== fallbackUrl) {
                e.target.src = fallbackUrl
              }
            }}
          />

          <button
            type="button"
            onClick={(e) => toggleSelectImage(item.id, e)}
            className={`absolute top-2.5 left-2.5 z-10 w-6 h-6 rounded-md flex items-center justify-center transition-all ${
              isSelected
                ? 'bg-[#006b49] text-white'
                : 'bg-black/40 text-white/80 opacity-0 group-hover:opacity-100 hover:bg-black/60'
            }`}
            title={isSelected ? 'Deselect image' : 'Select for batch action'}
          >
            {isSelected ? <Check size={14} /> : null}
          </button>

          <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
            {similarityPct !== null && similarityPct > 0 && (
              <span className="bg-[#006b49] text-white text-[11px] font-semibold px-2 py-0.5 rounded-full shadow-sm tracking-tight">
                {similarityPct}% match
              </span>
            )}

            {isUnusable ? (
              <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm uppercase tracking-wide">
                <AlertTriangle size={11} /> Unusable
              </span>
            ) : isLow ? (
              <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm uppercase tracking-wide">
                <AlertTriangle size={11} /> Low
              </span>
            ) : null}
          </div>

          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={(e) => handleFindSimilar(item, e)}
              className="bg-white/95 hover:bg-white text-[#252824] px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-md transition-all hover:scale-105"
              title="Find Visual Twins"
            >
              <Sparkles size={13} className="text-[#006b49]" /> Find Similar
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onOpenLightbox && onOpenLightbox(results, overallIndex)
              }}
              className="bg-white/95 hover:bg-white text-[#252824] p-1.5 rounded-lg shadow-md transition-all hover:scale-105"
              title="Fullscreen Lightbox"
            >
              <Maximize2 size={13} />
            </button>
          </div>
        </div>

        <div className="p-3 flex flex-col flex-1 bg-white">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className="text-xs font-semibold text-[#252824] truncate flex-1" title={item.display_name || item.file_name}>
              {item.display_name || item.file_name}
            </h4>
            <span className="text-[10px] text-[#758076] shrink-0 font-medium px-1.5 py-0.5 bg-[#f4f3ec] rounded">
              {item.project_name || 'Project'}
            </span>
          </div>

          {item.sdsc && (
            <p className="text-[11px] text-[#525c53] line-clamp-2 leading-relaxed mb-2" title={item.sdsc}>
              {item.sdsc}
            </p>
          )}

          <div className="mt-auto pt-2 border-t border-[#f0eee6] flex flex-wrap gap-1 items-center">
            {Array.isArray(item.tags) && item.tags.slice(0, 3).map((tag, tIdx) => (
              <button
                key={tIdx}
                type="button"
                onClick={(e) => handleTagClick(tag, e)}
                className="text-[10px] text-[#525c53] bg-[#faf9f5] hover:bg-[#eaf5ee] hover:text-[#006b49] px-1.5 py-0.5 rounded border border-[#e7e3da] transition-colors"
                title={`Filter by "${tag}"`}
              >
                #{tag}
              </button>
            ))}
            {item.tim && item.tim !== 'unknown' && (
              <span className="text-[10px] text-[#758076] ml-auto flex items-center gap-1 capitalize">
                <Clock size={10} /> {item.tim}
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#faf9f5] pb-24">
      <div className="bg-white border-b border-[#e7e3da] px-8 py-6">
        <div className="max-w-7xl mx-auto flex flex-col gap-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#252824] tracking-tight flex items-center gap-2.5">
                <Compass className="text-[#006b49]" size={26} />
                Explore Visual Intelligence
              </h1>
              <p className="text-sm text-[#758076] mt-0.5">
                Real-time semantic vector retrieval, cross-project forensic discovery, and spatial mapping.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-lg border border-[#e7e3da] bg-[#f4f3ec] p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white text-[#252824] shadow-sm'
                      : 'text-[#525c53] hover:text-[#252824]'
                  }`}
                >
                  <LayoutGrid size={14} /> Grid
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grouped')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    viewMode === 'grouped'
                      ? 'bg-white text-[#252824] shadow-sm'
                      : 'text-[#525c53] hover:text-[#252824]'
                  }`}
                >
                  <Layers size={14} /> Grouped
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('map')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    viewMode === 'map'
                      ? 'bg-white text-[#252824] shadow-sm'
                      : 'text-[#525c53] hover:text-[#252824]'
                  }`}
                >
                  <MapPin size={14} /> Map ({facets.total_with_gps || 0})
                </button>
              </div>
            </div>
          </div>

          <div className="relative flex items-center w-full">
            <Search className="absolute left-4 text-[#758076] pointer-events-none" size={20} />
            <input
              type="text"
              value={query}
              onChange={handleQueryChange}
              onKeyUp={handleKeyUp}
              placeholder={
                similarToItem
                  ? `Finding visual twins for: ${similarToItem.display_name || similarToItem.file_name}`
                  : 'Search photo evidence (e.g. people planting trees, check dam, excavator, overcast sky)...'
              }
              className={`w-full h-13 pl-12 pr-28 rounded-xl border bg-white text-sm text-[#252824] placeholder-[#758076] transition-all focus:outline-none focus:ring-2 focus:ring-[#006b49]/20 focus:border-[#006b49] ${
                similarToItem
                  ? 'border-[#006b49] bg-[#eaf5ee]/20'
                  : 'border-[#dfdad0]'
              }`}
            />

            <div className="absolute right-3 flex items-center gap-2">
              {loading && <Loader2 size={18} className="animate-spin text-[#006b49]" />}

              {(query || similarToItem) && (
                <button
                  type="button"
                  onClick={handleClearQuery}
                  className="p-1.5 text-[#758076] hover:text-[#252824] rounded-lg hover:bg-[#f4f3ec] transition-colors"
                  title="Clear search"
                >
                  <X size={16} />
                </button>
              )}

              <span className="text-[11px] text-[#758076] bg-[#f4f3ec] px-2 py-1 rounded font-mono border border-[#e7e3da]">
                Space to Search
              </span>
            </div>
          </div>

          {similarToItem && (
            <div className="flex items-center gap-2 bg-[#eaf5ee] border border-[#cce8d7] text-[#006b49] px-3 py-1.5 rounded-lg text-xs font-medium">
              <Sparkles size={14} />
              <span>Showing images visually similar to <strong>{similarToItem.display_name || similarToItem.file_name}</strong></span>
              <button
                type="button"
                onClick={() => setSimilarToItem(null)}
                className="ml-auto text-[#006b49] hover:text-[#004e35] font-semibold flex items-center gap-1"
              >
                Clear Visual Twin Mode <X size={13} />
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-[#f0eee6]">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                  className={`h-9 px-3 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-colors ${
                    selectedProjectIds.length > 0
                      ? 'border-[#006b49] bg-[#eaf5ee] text-[#006b49]'
                      : 'border-[#dfdad0] bg-white text-[#525c53] hover:bg-[#faf9f5]'
                  }`}
                >
                  <Folder size={14} />
                  <span>
                    {selectedProjectIds.length === 0
                      ? 'All Projects'
                      : `${selectedProjectIds.length} Projects`}
                  </span>
                  <ChevronDown size={14} />
                </button>

                {isProjectDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1.5 w-64 bg-white border border-[#dfdad0] rounded-xl shadow-lg z-30 p-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProjectIds([])
                        setIsProjectDropdownOpen(false)
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between ${
                        selectedProjectIds.length === 0
                          ? 'bg-[#eaf5ee] text-[#006b49] font-semibold'
                          : 'hover:bg-[#faf9f5] text-[#252824]'
                      }`}
                    >
                      <span>All Projects</span>
                      {selectedProjectIds.length === 0 && <Check size={14} />}
                    </button>
                    <div className="my-1 border-t border-[#f0eee6]" />
                    <div className="max-h-52 overflow-y-auto flex flex-col gap-0.5">
                      {projects.map((p) => {
                        const isChecked = selectedProjectIds.includes(p.id)
                        const pCount = facets.project_counts?.[String(p.id)] || 0
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => toggleProject(p.id)}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between hover:bg-[#faf9f5] text-[#252824]"
                          >
                            <span className="truncate mr-2">{p.project_name}</span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[10px] text-[#758076]">({pCount})</span>
                              <div
                                className={`w-4 h-4 rounded flex items-center justify-center border ${
                                  isChecked
                                    ? 'bg-[#006b49] border-[#006b49] text-white'
                                    : 'border-[#cfc9bd]'
                                }`}
                              >
                                {isChecked && <Check size={11} />}
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="h-4 w-px bg-[#dfdad0]" />

              <div className="flex items-center gap-1 overflow-x-auto">
                {timOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTimFilter(opt.id)}
                    className={`h-8 px-2.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                      timFilter === opt.id
                        ? 'bg-[#006b49] text-white shadow-sm'
                        : 'bg-white border border-[#dfdad0] text-[#525c53] hover:bg-[#f4f3ec]'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span
                      className={`text-[10px] px-1 rounded ${
                        timFilter === opt.id ? 'bg-white/20 text-white' : 'bg-[#f4f3ec] text-[#758076]'
                      }`}
                    >
                      {opt.count}
                    </span>
                  </button>
                ))}
              </div>

              <div className="h-4 w-px bg-[#dfdad0]" />

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setHideDegraded(!hideDegraded)}
                  className={`h-8 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                    hideDegraded
                      ? 'border-[#006b49] bg-[#eaf5ee] text-[#006b49]'
                      : 'border-[#dfdad0] bg-white text-[#525c53] hover:bg-[#f4f3ec]'
                  }`}
                >
                  <ShieldCheck size={13} />
                  <span>Hide Degraded</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-8 px-2.5 rounded-lg border border-[#dfdad0] bg-white text-xs font-medium text-[#525c53] focus:outline-none focus:border-[#006b49]"
              >
                <option value="relevance">Best AI Match</option>
                <option value="quality_desc">Highest Quality</option>
                <option value="quality_asc">Lowest Quality</option>
                <option value="newest">Newest Uploads</option>
                <option value="oldest">Oldest Uploads</option>
              </select>

              {viewMode === 'grouped' && (
                <select
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value)}
                  className="h-8 px-2.5 rounded-lg border border-[#dfdad0] bg-white text-xs font-medium text-[#006b49] focus:outline-none focus:border-[#006b49]"
                >
                  <option value="tim">Group by Time of Day</option>
                  <option value="quality">Group by Quality Tier</option>
                  <option value="project">Group by Project</option>
                </select>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-8 py-6">
        <div className="flex items-center justify-between gap-4 mb-4 text-xs text-[#758076]">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-[#252824]">{results.length}</strong> of{' '}
              <strong className="text-[#252824]">{totalMatches}</strong> matching photos
            </span>
            {queryTimeMs > 0 && <span>• {queryTimeMs}ms query latency</span>}
          </div>

          <div className="flex items-center gap-3">
            {results.length > 0 && selectedImageIds.size === 0 && (
              <button
                type="button"
                onClick={handleSelectAllMatches}
                className="text-[#006b49] hover:underline font-semibold"
              >
                Select all {results.length} on this page
              </button>
            )}
          </div>
        </div>

        {reindexMessage && (
          <div className="mb-4 p-3 bg-[#eaf5ee] border border-[#cce8d7] text-[#006b49] rounded-xl text-xs font-medium flex items-center justify-between">
            <span>{reindexMessage}</span>
            <button
              type="button"
              onClick={() => setReindexMessage(null)}
              className="text-[#006b49] hover:text-black"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {viewMode === 'map' ? (
          <div className="bg-white border border-[#e7e3da] rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#e7e3da] flex items-center justify-between bg-[#faf9f5]">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#252824]">
                <MapPin className="text-[#006b49]" size={16} />
                <span>Geospatial Evidence Map ({facets.total_with_gps || 0} geotagged sites)</span>
              </div>
              <span className="text-[11px] text-[#758076]">Click pins to inspect preview & open lightbox</span>
            </div>
            <div ref={mapContainerRef} className="w-full h-[620px] bg-[#f4f3ec]" />
          </div>
        ) : viewMode === 'grouped' ? (
          <div className="flex flex-col gap-8">
            {Object.keys(groupedResults).length === 0 && !loading && (
              <div className="bg-white border border-[#e7e3da] rounded-2xl p-12 text-center">
                <Compass className="mx-auto text-[#758076] mb-3" size={36} />
                <h3 className="text-base font-bold text-[#252824] mb-1">No matches found</h3>
                <p className="text-xs text-[#758076]">Try adjusting your search query or clear active filters.</p>
              </div>
            )}

            {Object.entries(groupedResults).map(([groupTitle, groupItems]) => (
              <div key={groupTitle} className="flex flex-col gap-3">
                <div className="flex items-center gap-2 pb-2 border-b border-[#e7e3da]">
                  <h3 className="text-sm font-bold text-[#252824] tracking-tight">{groupTitle}</h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#f4f3ec] text-[#525c53]">
                    {groupItems.length} photos
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {groupItems.map((item, idx) => renderImageCard(item, idx))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {results.length === 0 && !loading ? (
              <div className="bg-white border border-[#e7e3da] rounded-2xl p-12 text-center flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-[#f4f3ec] text-[#758076] flex items-center justify-center mb-3">
                  <Search size={26} />
                </div>
                <h3 className="text-lg font-bold text-[#252824] mb-1">No matching photo evidence</h3>
                <p className="text-sm text-[#758076] max-w-md mb-6">
                  We could not find any photos matching &ldquo;{query}&rdquo; within the selected filters.
                </p>

                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs font-semibold text-[#525c53]">Try searching for:</span>
                  <div className="flex flex-wrap justify-center gap-1.5 max-w-lg">
                    {suggestedQueries.map((suggested, sIdx) => (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={() => handleTagClick(suggested)}
                        className="text-xs text-[#006b49] bg-[#eaf5ee] hover:bg-[#d8eedf] px-3 py-1 rounded-full font-medium transition-colors"
                      >
                        {suggested}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {results.map((item, idx) => renderImageCard(item, idx))}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedImageIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#252824] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-4 border border-white/10 animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="w-5 h-5 rounded-full bg-[#006b49] text-white flex items-center justify-center text-[10px]">
              {selectedImageIds.size}
            </span>
            <span>images selected across projects</span>
          </div>

          <div className="h-4 w-px bg-white/20" />

          <button
            type="button"
            onClick={handleBatchReindex}
            disabled={isReindexing}
            className="bg-[#006b49] hover:bg-[#00573b] text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {isReindexing ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <RotateCcw size={13} />
            )}
            Reindex Selected
          </button>

          <button
            type="button"
            onClick={handleClearSelection}
            className="text-white/70 hover:text-white text-xs font-medium transition-colors"
          >
            Clear Selection
          </button>
        </div>
      )}
    </div>
  )
}
