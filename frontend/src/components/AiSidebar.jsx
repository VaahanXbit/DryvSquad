import { useState } from 'react'
import { Link } from 'react-router-dom'

const AiSidebar = ({
  isOpen,
  onClose,
  query,
  setQuery,
  aiLoading,
  aiResult,
  aiError,
  handleAiSearch
}) => {
  const [sidebarQuery, setSidebarQuery] = useState('')

  if (!isOpen) return null

  const handleSidebarSearch = (e) => {
    e.preventDefault()
    if (sidebarQuery.trim()) {
      setQuery(sidebarQuery)
      handleAiSearch(sidebarQuery)
      setSidebarQuery('')
    }
  }

  const isRelevant = aiResult && aiResult.has_answer !== false && 
    !aiResult.verdict?.toLowerCase().includes("couldn't find relevant") &&
    !aiResult.verdict?.toLowerCase().includes("please try searching");

  return (
    <>
      {/* Backdrop overlay with blur */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[9990] transition-opacity duration-300 cursor-pointer"
        onClick={onClose}
      />
      
      {/* Right Sidebar Panel */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-[500px] bg-white dark:bg-gray-900 shadow-2xl z-[9999] flex flex-col border-l border-gray-100 dark:border-gray-800 transition-all duration-300 ease-in-out animate-slide-in">
        
        {/* Sidebar Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 dark:from-yellow-500/5 dark:to-amber-500/5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* <span className="text-xl animate-pulse">✨</span> */}
            <div>
              <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">DryvSquad AI</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-lg"
          >
            ✕
          </button>
        </div>

        {/* Sidebar Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          
          {query.trim() && (aiLoading || aiResult || aiError) && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800/80">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Your Question</span>
              </div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {query}
              </p>
            </div>
          )}

          {!aiLoading && !aiResult && !aiError && (
            <div className="space-y-6 py-4 text-center">
              
              <div>
                <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-1.5">Ask DryvSquad AI</h4>
                {/* <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
                  Get instant, objective advice on Indian cars, specs, and road conditions sourced directly from our knowledge base.
                </p> */}
              </div>
              
              <div className="space-y-2 pt-4">
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-left mb-2 px-1">Suggested Questions</p>
                <div className="flex flex-col gap-2.5">
                  {[
                    'Is AWD worth it for city driving in India?',
                    'Can Your FWD Car Handle Spiti in Winter?',
                    'How does ABS prevent wheels from locking up?',
                    'Explain if ADAS features are useful on Indian roads'
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setQuery(suggestion)
                        handleAiSearch(suggestion)
                      }}
                      className="w-full text-left text-xs px-4 py-3 bg-gray-50 hover:bg-yellow-50/80 dark:bg-gray-800/50 dark:hover:bg-yellow-950/20 text-gray-700 dark:text-gray-300 hover:text-yellow-700 dark:hover:text-yellow-500 rounded-xl border border-gray-100 dark:border-gray-800 transition-all font-medium hover:border-yellow-200 dark:hover:border-yellow-900/50 shadow-xs"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {aiLoading && (
            <div className="py-12 text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-yellow-100 dark:border-yellow-950 animate-ping opacity-75" />
                <div className="absolute inset-0 rounded-full border-4 border-yellow-500 border-t-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-xl">
                  ✨
                </div>
              </div>
              <div>
                <h5 className="font-bold text-gray-800 dark:text-gray-200 text-sm">
                  Synthesizing Answer
                </h5>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Generating Response....
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {aiError && (
            <div className="py-8 text-center space-y-3 bg-red-50/50 dark:bg-red-950/10 rounded-2xl p-6 border border-red-100 dark:border-red-950/50">
              <span className="text-3xl">⚠️</span>
              <h5 className="font-bold text-gray-800 dark:text-gray-200 text-sm">Search Failed</h5>
              <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed">
                {aiError}
              </p>
              <button
                onClick={() => handleAiSearch(query)}
                className="mt-2 inline-flex items-center justify-center px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-xs font-semibold shadow-md transition-all"
              >
                Try again
              </button>
            </div>
          )}

          {/* Results State */}
          {aiResult && !aiLoading && (
            <div className="space-y-6">
              
              {/* Verdict */}
              <div className=" space-y-1.5 ">
                {/* <div className="absolute top-0 left-0 w-2.5 h-full bg-yellow-500" /> */}
                <span className="text-[10px] font-bold text-yellow-700 dark:text-yellow-500 uppercase tracking-widest block">
                  Direct Verdict
                </span>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-100 leading-snug">
                  {aiResult.verdict}
                </p>
              </div>

              {/* Reasoning */}
              {isRelevant && aiResult.reasoning && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">Reasoning</span>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-normal">
                    {aiResult.reasoning}
                  </p>
                </div>
              )}

              {/* Pros & Cons */}
              {isRelevant && (aiResult.pros?.length > 0 || aiResult.cons?.length > 0) && (
                <div className="grid grid-cols-1 gap-4">
                  {aiResult.pros?.length > 0 && (
                    <div className="p-4.5 ">
                      <span className="text-[10px] font-bold text-green-700 dark:text-green-500 uppercase tracking-widest block mb-2.5">Pros (Indian Conditions)</span>
                      <ul className="space-y-2">
                        {aiResult.pros.map((pro, i) => (
                          <li key={i} className="text-xs text-gray-600 dark:text-gray-300 flex items-start gap-2">
                            <span className="text-green-500 font-bold shrink-0 mt-0.5">✓</span>
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {aiResult.cons?.length > 0 && (
                    <div className="p-4.5">
                      <span className="text-[10px] font-bold text-red-700 dark:text-red-500 uppercase tracking-widest block mb-2.5">Cons & Concerns</span>
                      <ul className="space-y-2">
                        {aiResult.cons.map((con, i) => (
                          <li key={i} className="text-xs text-gray-600 dark:text-gray-300 flex items-start gap-2">
                            <span className="text-red-400 font-bold shrink-0 mt-0.5">✗</span>
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Empty Source state */}
              {!isRelevant && (
                <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-4 text-center border border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
                    No specific documentation matches this query in the DryvSquad Knowledge base.
                  </p>
                  <Link
                    to={`/articles?search=${encodeURIComponent(query)}`}
                    onClick={() => { onClose(); setQuery(''); }}
                    className="text-xs text-yellow-600 dark:text-yellow-500 hover:underline font-bold inline-flex items-center gap-1"
                  >
                    Search general articles instead →
                  </Link>
                </div>
              )}

              {/* Sources */}
              {isRelevant && aiResult.sources?.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">
                    Related Articles
                  </span>
                  <div className="flex flex-col gap-2">
                    {[...new Map(aiResult.sources.map(s => [s.title, s])).values()].map((source, i) => (
                      <Link
                        key={i}
                        to={`/article/${source.slug}`}
                        onClick={() => { onClose(); setQuery(''); }}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 group"
                      >
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 group-hover:text-yellow-700 dark:group-hover:text-yellow-500 truncate max-w-[340px]">
                          {source.title}
                        </span>
                        <span className="text-[10px] text-yellow-600 dark:text-yellow-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                          Read Article →
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

            {/* Sidebar Footer with input box */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
              <form onSubmit={handleSidebarSearch} className="flex gap-2">
                <input
                  type="text"
                  value={sidebarQuery}
                  onChange={(e) => setSidebarQuery(e.target.value)}
                  placeholder="Ask another question..."
                  disabled={aiLoading}
                  className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent placeholder-gray-400 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={aiLoading || !sidebarQuery.trim()}
                  className="px-4 py-2.5 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 dark:disabled:bg-gray-800/80 disabled:text-gray-400 dark:disabled:text-gray-600 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center shrink-0"
                >
                  Ask AI
                </button>
              </form>
            </div>

          </div>
        </>
  )
}

export default AiSidebar
