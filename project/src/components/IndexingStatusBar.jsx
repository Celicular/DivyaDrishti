import React from 'react'
import { Sparkles, CheckCircle2, Loader2 } from 'lucide-react'

export default function IndexingStatusBar({
  totalImages = 0,
  indexedCount = 0,
  isIndexing = false,
  isCollapsed = false,
  onSimulateToggle
}) {
  if (totalImages === 0) return null

  const isAllIndexed = !isIndexing && indexedCount >= totalImages

  return (
    <div
      className={`fixed bottom-0 right-0 z-30 h-10 bg-[#161c17] text-[#e3ece5] border-t border-[#253328] flex items-center justify-between px-5 text-xs transition-[left] duration-250 ${
        isCollapsed ? 'left-[74px]' : 'left-[260px]'
      } max-md:left-0`}
      role="status"
    >
      <div className="flex items-center gap-2">
        {isIndexing ? (
          <Loader2 size={14} className="animate-spin text-emerald-400 shrink-0" />
        ) : isAllIndexed ? (
          <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
        ) : (
          <Sparkles size={14} className="text-emerald-400 shrink-0" />
        )}
        <span className="font-medium text-[#f0f4f1]">
          {isIndexing || !isAllIndexed
            ? `Indexing ${indexedCount} out of ${totalImages} images`
            : 'All images indexed'}
        </span>
      </div>

      {onSimulateToggle && (
        <button
          type="button"
          onClick={onSimulateToggle}
          className="text-[11px] text-[#8fa393] hover:text-white transition-colors cursor-pointer"
        >
          {isAllIndexed ? 'Simulate indexing' : 'Mark all indexed'}
        </button>
      )}
    </div>
  )
}
