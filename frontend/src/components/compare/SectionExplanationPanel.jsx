// src/components/compare/SectionExplanationPanel.jsx
/*
================================================================================
File Name : SectionExplanationPanel.jsx
Description : Renders professional automotive comparison content using
              backend-generated explanation data. No AI labels, no winners,
              no buying insights. Shows vehicle names, parameter definitions,
              and comparison summaries.
================================================================================
*/

const ParameterExplanation = ({ 
  label, 
  icon, 
  car1, 
  car2, 
  definition, 
  comparisonSummary 
}) => {
  return (
    <div className="py-4 border-b border-gray-200 dark:border-dark-700 last:border-0">
      {/* Parameter Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm">{icon}</span>
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          {label}
        </span>
        {definition && (
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
            {definition}
          </span>
        )}
      </div>
      
      {/* Vehicle Explanations */}
      <div className="grid grid-cols-2 gap-4 md:gap-6">
        {/* Car 1 */}
        <div className="flex flex-col gap-1.5 p-3 bg-gray-50 dark:bg-dark-700/30 rounded-lg">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {car1.name}
          </span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {car1.value}
          </span>
          {car1.explanation && (
            <ul className="space-y-1 mt-0.5">
              {car1.explanation.details?.map((detail, idx) => (
                <li key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1.5">
                  <span className="text-gray-400 dark:text-gray-500 mt-0.5">•</span>
                  {detail}
                </li>
              ))}
              {!car1.explanation.details && car1.explanation.summary && (
                <li className="text-xs text-gray-600 dark:text-gray-400">
                  {car1.explanation.summary}
                </li>
              )}
            </ul>
          )}
        </div>

        {/* Car 2 */}
        <div className="flex flex-col gap-1.5 p-3 bg-gray-50 dark:bg-dark-700/30 rounded-lg">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {car2.name}
          </span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {car2.value}
          </span>
          {car2.explanation && (
            <ul className="space-y-1 mt-0.5">
              {car2.explanation.details?.map((detail, idx) => (
                <li key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1.5">
                  <span className="text-gray-400 dark:text-gray-500 mt-0.5">•</span>
                  {detail}
                </li>
              ))}
              {!car2.explanation.details && car2.explanation.summary && (
                <li className="text-xs text-gray-600 dark:text-gray-400">
                  {car2.explanation.summary}
                </li>
              )}
            </ul>
          )}
        </div>
      </div>

      {/* Comparison Summary */}
      {comparisonSummary && (
        <div className="mt-3 p-3 bg-gray-50 dark:bg-dark-700/30 border border-gray-200 dark:border-dark-700 rounded-lg">
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Comparison
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            {comparisonSummary}
          </p>
        </div>
      )}
    </div>
  )
}

const SectionExplanationPanel = ({ section, onClose, showHeader = true }) => {
  if (!section) return null

  // If section has rows, render them using backend data
  if (section.rows && section.rows.length > 0) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-dark-800">
        {showHeader && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-dark-700 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base">{section.icon}</span>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {section.label}
              </span>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-dark-700 shrink-0"
                aria-label="Close"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            {/* Section Introduction */}
            {section.introduction && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                {section.introduction}
              </p>
            )}

            {/* Parameter Explanations */}
            <div className="space-y-2">
              {section.rows.map((row, idx) => (
                <ParameterExplanation
                  key={idx}
                  label={row.label}
                  icon={row.icon}
                  car1={row.car1}
                  car2={row.car2}
                  definition={row.definition}
                  comparisonSummary={row.comparisonSummary}
                />
              ))}
            </div>

            {/* Overall Section Summary */}
            {section.overallSummary && (
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-dark-700">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                  Overall {section.label} Summary
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {section.overallSummary}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Fallback for sections without rows (should not happen)
  return (
    <div className="flex flex-col h-full bg-white dark:bg-dark-800 p-4">
      {showHeader && (
        <div className="flex items-center justify-between mb-4 border-b border-gray-200 dark:border-dark-700 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">{section?.icon}</span>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {section?.label || 'Section'}
            </span>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No specification data available for this section.
      </p>
    </div>
  )
}

export default SectionExplanationPanel