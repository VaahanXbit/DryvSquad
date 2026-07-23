// src/components/compare/ExplanationContent.jsx
/*
================================================================================
File Name : ExplanationContent.jsx
Description : X-Ray-style explanation content — quick, contextual,
              comparison-first. Per redesign: NO definition, why-it-matters,
              industry average, recommended range, daily-usage essay, real-
              world example, or expert-recommendation paragraph. Just:

                Parameter name
                Per car: value, rating, 2-3 short bullets
                Winner + one-line reason

              That's it. This is intentionally the only content the drawer
              renders — keeping it lightweight is the point.
================================================================================
*/

const CarBlock = ({ carLabel, value, rating, color, bullets, isWinner }) => {
  const colorDot = { green: 'bg-green-500', yellow: 'bg-yellow-500', red: 'bg-red-500' }[color] || 'bg-gray-400'
  const ratingText = { green: 'text-green-600 dark:text-green-400', yellow: 'text-yellow-600 dark:text-yellow-400', red: 'text-red-600 dark:text-red-400' }[color] || 'text-gray-500'

  return (
    <div className={`rounded-xl border p-4 ${isWinner ? 'border-yellow-400/70 bg-yellow-50/60 dark:bg-yellow-900/10' : 'border-gray-200 dark:border-dark-700'}`}>
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {isWinner && <span className="text-sm shrink-0">🏆</span>}
          <span className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{carLabel}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-base font-bold text-gray-800 dark:text-gray-100">{value}</span>
          {rating !== null && (
            <span className={`flex items-center gap-1 text-xs font-bold ${ratingText}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${colorDot}`} />
              {rating.toFixed(1)}/10
            </span>
          )}
        </div>
      </div>
      {bullets && bullets.length > 0 && (
        <ul className="space-y-1 mt-2">
          {bullets.map((b, i) => (
            <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1.5">
              <span className="text-gray-400 dark:text-gray-500 shrink-0 mt-0.5">•</span>
              {b}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/**
 * @param {Object} param
 * @param {string} param.label
 * @param {string} param.icon
 * @param {Array<{ carLabel, value, rating, color, isWinner, bullets }>} param.entries
 * @param {{ winnerCarLabel: string, reasonText: string } | null} param.winner
 */
const ExplanationContent = ({ label, icon, entries, winner }) => {
  return (
    <div className="px-5 py-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">{icon}</span>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{label}</h3>
      </div>

      <div className="space-y-3">
        {entries.map((e, i) => (
          <CarBlock key={i} {...e} />
        ))}
      </div>

      {winner && (
        <div className="mt-4 rounded-xl border border-yellow-400/50 bg-yellow-50 dark:bg-yellow-900/10 p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-yellow-700 dark:text-yellow-400 mb-1">
            🏆 Winner — {winner.winnerCarLabel}
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">{winner.reasonText}</p>
        </div>
      )}
    </div>
  )
}

export default ExplanationContent