// src/components/compare/SectionExplanationPanel.jsx
/*
================================================================================
File Name : SectionExplanationPanel.jsx
Description : The actual explanation content for one section — compact
              per-spec mini-comparison, then "AI Explanation" and "Buying
              Insight" strips. Rendered inside SectionExplainOverlay
              (desktop, inline over the section) and MobileBottomSheet
              (mobile) so there is exactly one content implementation.
================================================================================
*/

const MiniRow = ({ label, icon, entries }) => (
  <div className="flex items-center gap-2 py-1.5">
    <span className="text-xs shrink-0 w-4 text-center">{icon}</span>
    <span className="text-[11px] font-semibold text-gray-300 dark:text-gray-300 w-20 sm:w-28 shrink-0 truncate">{label}</span>
    <div className="flex flex-1 gap-2 min-w-0">
      {entries.map((e, i) => {
        const dot = { green: 'bg-green-400', yellow: 'bg-yellow-400', red: 'bg-red-400' }[e.color] || 'bg-gray-500'
        return (
          <div
            key={i}
            className={`flex-1 min-w-0 flex items-center justify-between gap-1 px-2 py-1 rounded-md text-[11px] ${
              e.isWinner ? 'bg-yellow-500/15 text-yellow-200' : 'text-gray-300'
            }`}
          >
            <span className="truncate">{e.value}</span>
            {e.rating !== null && (
              <span className="flex items-center gap-1 font-bold shrink-0">
                <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                {e.rating.toFixed(1)}
              </span>
            )}
          </div>
        )
      })}
    </div>
  </div>
)

// showHeader=false when the host container (e.g. MobileBottomSheet) already
// renders its own icon/title/close header — avoids a duplicate header bar.
const SectionExplanationPanel = ({ section, onClose, showHeader = true }) => {
  if (!section) return null

  return (
    <div className="flex flex-col h-full">
      {showHeader && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base">{section.icon}</span>
            <span className="text-sm font-bold text-white truncate">{section.label} — AI Comparison</span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-white/10 shrink-0"
              aria-label="Close"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="divide-y divide-white/5">
          {section.rows.map((row) => (
            <MiniRow key={row.key} label={row.label} icon={row.icon} entries={row.entries} />
          ))}
        </div>

        <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/10">
          <div className="text-[10px] font-bold uppercase tracking-wider text-yellow-300/80 mb-1">✨ AI Explanation</div>
          <p className="text-xs text-gray-200 leading-relaxed">{section.aiSummary}</p>
        </div>

        {section.buyingInsight && (
          <div className="mt-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <div className="text-[10px] font-bold uppercase tracking-wider text-yellow-300 mb-1">💡 Buying Insight</div>
            <p className="text-xs text-gray-100 leading-relaxed">{section.buyingInsight}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SectionExplanationPanel