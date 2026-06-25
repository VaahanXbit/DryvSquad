import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { searchArticles } from '../data/articlesData'
import AiSidebar from './AiSidebar'

const SearchBar = () => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [aiMode, setAiMode] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState(null)
  const [aiError, setAiError] = useState(null)

  const searchRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Normal search logic
  useEffect(() => {
    if (!aiMode && query.length >= 2) {
      setIsLoading(true)
      const timeout = setTimeout(() => {
        const searchResults = searchArticles(query)
        setResults(searchResults.slice(0, 5))
        setIsOpen(true)
        setIsLoading(false)
      }, 300)
      return () => clearTimeout(timeout)
    } else {
      setResults([])
      setIsOpen(false)
    }
  }, [query, aiMode])

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      if (aiMode) {
        handleAiSearch(query)
      } else {
        navigate(`/articles?search=${encodeURIComponent(query)}`)
        setIsOpen(false)
        setQuery('')
      }
    }
  }

  // Extract keywords from query
  const extractKeywords = (text) => {
    const stopWords = new Set([
      'is', 'are', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for',
      'of', 'and', 'or', 'but', 'it', 'its', 'this', 'that', 'with',
      'worth', 'good', 'bad', 'best', 'better', 'how', 'what', 'why',
      'when', 'which', 'do', 'does', 'should', 'can', 'will', 'me',
      'my', 'i', 'you', 'your', 'we', 'us', 'tell', 'about', 'explain'
    ])
    return text
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word))
  }

  const handleAiSearch = async (searchQuery = query) => {
    const activeQuery = searchQuery.trim()
    if (!activeQuery) return

    setAiLoading(true)
    setAiResult(null)
    setAiError(null)
    setIsOpen(false)
    setAiMode(true) 

    const keywords = extractKeywords(activeQuery)

    try {
      const response = await fetch('http://localhost:8000/api/ai-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: activeQuery,
          keywords: keywords
        })
      })

      if (!response.ok) throw new Error('AI service unavailable')

      const data = await response.json()
      setAiResult(data)
    } catch (err) {
      setAiError('Could not connect to AI service. Please try again.')
    } finally {
      setAiLoading(false)
    }
  }

  const handleAiModeToggle = () => {
    setAiMode(!aiMode)
    setAiResult(null)
    setAiError(null)
    setIsOpen(false)
  }

  const handleResultClick = () => {
    setIsOpen(false)
    setQuery('')
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Feature Reviews': return 'bg-blue-100 text-blue-700'
      case 'Tech Insights': return 'bg-green-100 text-green-700'
      case 'New Launches': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSearch}>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              aiMode
                ? 'Ask AI anything about cars, features, safety...'
                : 'Search automotive articles (ABS, ADAS, AWD, Spiti, Tyres)...'
            }
            className={`w-full px-5 py-4 pl-12 pr-36 rounded-xl border shadow-sm focus:outline-none focus:ring-2 focus:border-transparent text-gray-800 placeholder-gray-400 transition-all ${
              aiMode
                ? 'border-yellow-400 bg-yellow-50 focus:ring-yellow-500'
                : 'border-gray-200 bg-white focus:ring-yellow-500'
            }`}
          />

          <svg
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>


          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500" />
            )}
            <button
              type="button"
              onClick={handleAiModeToggle}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                aiMode
                  ? 'bg-yellow-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-yellow-100 hover:text-yellow-700'
              }`}
            >
              <span>✨</span>
              <span>AI Mode</span>
            </button>
          </div>
        </div>
      </form>

      {!aiMode && isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="py-2">
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
              <span className="text-xs font-semibold text-gray-500">
                {results.length} article{results.length !== 1 ? 's' : ''} found
              </span>
            </div>
            {results.map((article) => (
              <Link
                key={article.id}
                to={`/article/${article.slug}`}
                onClick={handleResultClick}
                className="block px-4 py-3 hover:bg-yellow-50 transition-colors group border-b border-gray-50 last:border-0"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(article.category)}`}>
                        {article.category}
                      </span>
                      {article.readTime && (
                        <span className="text-xs text-gray-400">{article.readTime}</span>
                      )}
                    </div>
                    <h4 className="font-semibold text-gray-800 group-hover:text-yellow-600 transition-colors">
                      {article.title}
                    </h4>
                    <p className="text-sm text-gray-500 line-clamp-1 mt-1">
                      {article.excerpt}
                    </p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-yellow-500 group-hover:translate-x-1 transition-all ml-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
              <Link
                to={`/articles?search=${encodeURIComponent(query)}`}
                onClick={() => setIsOpen(false)}
                className="text-sm text-yellow-600 hover:text-yellow-700 font-medium flex items-center justify-center gap-1"
              >
                View all results for "{query}" →
              </Link>
            </div>
          </div>
        </div>
      )}

      {!aiMode && isOpen && query.length >= 2 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 p-8 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <h4 className="font-semibold text-gray-800 mb-1">No articles found</h4>
          <p className="text-sm text-gray-500 mb-3">
            We couldn't find any articles matching "{query}"
          </p>
          <button
            onClick={() => { setAiMode(true) }}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors"
          >
            ✨ Try AI Mode instead
          </button>
        </div>
      )}

      {/* AI Mode Right Sidebar */}
      <AiSidebar
        isOpen={aiMode}
        onClose={() => { setAiMode(false); setAiResult(null); setAiError(null); }}
        query={query}
        setQuery={setQuery}
        aiLoading={aiLoading}
        aiResult={aiResult}
        aiError={aiError}
        handleAiSearch={handleAiSearch}
      />
    </div>
  )
}

export default SearchBar