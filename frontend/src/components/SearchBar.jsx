// src/components/SearchBar.jsx
/*
================================================================================
File Name : SearchBar.jsx
Author : Tahseen Raza
Created Date : 2025-01-15
Description : Professional search bar component for articles
Company : Vaahan International
Copyright : (c) 2025 Vaahan International. All rights reserved.
================================================================================
*/

import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { searchArticles } from '../data/articlesData'

const SearchBar = () => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
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

  useEffect(() => {
    if (query.length >= 2) {
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
  }, [query])

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/articles?search=${encodeURIComponent(query)}`)
      setIsOpen(false)
      setQuery('')
    }
  }

  const handleResultClick = () => {
    setIsOpen(false)
    setQuery('')
  }

  const getCategoryColor = (category) => {
    switch(category) {
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
            placeholder="Search automotive articles (ABS, ADAS, AWD, Spiti, Tyres)..."
            className="w-full px-5 py-4 pl-12 pr-16 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-800 placeholder-gray-400"
          />
          <svg
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {isLoading && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-500"></div>
            </div>
          )}
          {query.length >= 2 && !isLoading && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
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

      {/* No Results */}
      {isOpen && query.length >= 2 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 p-8 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <h4 className="font-semibold text-gray-800 mb-1">No articles found</h4>
          <p className="text-sm text-gray-500 mb-3">
            We couldn't find any articles matching "{query}"
          </p>
          <p className="text-xs text-gray-400">
            Try searching for: AWD, ADAS, Spiti, Tyres, ABS, ESC
          </p>
        </div>
      )}
    </div>
  )
}

export default SearchBar