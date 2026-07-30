// src/components/SearchBar.jsx

import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { searchArticles } from '../data/articlesData';
import { searchRegistryItems } from '../config/searchRegistry';
import api from '../services/api';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const searchRef = useRef(null);
  const navigate = useNavigate();
  const searchTimeout = useRef(null);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search function
  const performSearch = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    setResults([]);

    try {
      const combinedResults = [];

      // 1. Search registry (static pages and tools)
      const registryResults = searchRegistryItems(searchQuery);
      registryResults.forEach(item => {
        combinedResults.push({
          ...item,
          isNavigationSuggestion: true,
        });
      });

      // 2. Search articles (existing API)
      try {
        const articleData = await searchArticles(searchQuery);
        if (articleData && articleData.length > 0) {
          articleData.slice(0, 5).forEach(article => {
            combinedResults.push({
              id: `article-${article.id}`,
              type: 'article',
              title: article.title,
              description: article.excerpt || article.description || '',
              path: `/article/${article.slug}`,
              score: 8,
              matchType: 'title',
              category: article.category,
              readTime: article.readTime,
              originalData: article,
              sectionLabel: 'Articles',
              isArticleResult: true,
            });
          });
        }
      } catch (error) {
        console.error('❌ Article search error:', error);
      }

      // 3. Search travelogues (existing API)
      try {
        const travelogueData = await api.getAllTravelogues();
        if (travelogueData?.success && travelogueData.data) {
          const normalizedQuery = searchQuery.toLowerCase().trim();
          const matchedTravelogues = travelogueData.data.filter(travelogue => {
            const titleMatch = travelogue.title?.toLowerCase().includes(normalizedQuery);
            const descMatch = travelogue.excerpt?.toLowerCase().includes(normalizedQuery) ||
                             travelogue.description?.toLowerCase().includes(normalizedQuery);
            const keywordMatch = travelogue.tags?.some(tag => 
              tag.toLowerCase().includes(normalizedQuery)
            );
            return titleMatch || descMatch || keywordMatch;
          });

          matchedTravelogues.slice(0, 5).forEach(travelogue => {
            combinedResults.push({
              id: `travelogue-${travelogue.id}`,
              type: 'travelogue',
              title: travelogue.title,
              description: travelogue.excerpt || travelogue.description || '',
              path: `/travelogue/${travelogue.slug}`,
              score: 8,
              matchType: 'title',
              originalData: travelogue,
              sectionLabel: 'Travelogues',
              isTravelogueResult: true,
            });
          });
        }
      } catch (error) {
        console.error('❌ Travelogue search error:', error);
      }

      // Sort results by score
      combinedResults.sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return 0;
      });

      // Limit total results
      const limitedResults = combinedResults.slice(0, 15);

      // Add section labels for grouping
      const groupedResults = [];
      let currentSection = '';

      limitedResults.forEach((result, index) => {
        const section = result.sectionLabel || getTypeDisplayName(result.type);
        
        if (section && section !== currentSection) {
          groupedResults.push({
            isSectionLabel: true,
            label: section,
            key: `section-${section}-${index}`,
          });
          currentSection = section;
        }
        
        groupedResults.push(result);
      });

      setResults(groupedResults);
      setIsOpen(groupedResults.length > 0);

    } catch (error) {
      console.error('❌ Search error:', error);
      setResults([]);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    searchTimeout.current = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [query, performSearch]);

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/articles?search=${encodeURIComponent(query)}`);
      setIsOpen(false);
      setQuery('');
      setResults([]);
    }
  };

  // Handle AI Mode toggle
  const handleAiModeToggle = () => {
    if (query.trim()) {
      navigate(`/ai-mode?q=${encodeURIComponent(query)}`);
      setQuery('');
      setResults([]);
    } else {
      navigate('/ai-mode');
    }
  };

  // Handle result click
  const handleResultClick = () => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
  };

  // Get category color for articles
  const getCategoryColor = (category) => {
    switch (category) {
      case 'Feature Reviews': return 'bg-dark-100 text-dark-700';
      case 'Tech Insights': return 'bg-green-100 text-green-700';
      case 'New Launches': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Helper function to get type display name
  const getTypeDisplayName = (type) => {
    const map = {
      tool: 'Tools',
      page: 'Pages',
      lead: 'Lead Forms',
      article: 'Articles',
      travelogue: 'Travelogues',
    };
    return map[type] || type;
  };

  // Render a single result row
  const renderResultRow = (item) => {
    // Section label
    if (item.isSectionLabel) {
      return (
        <div key={item.key} className="px-4 py-1.5 bg-gray-50 dark:bg-dark-700/50 border-b border-gray-100 dark:border-dark-700">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {item.label}
          </span>
        </div>
      );
    }

    // Navigation Suggestion (static pages/tools) - with ↗ arrow on left
    if (item.isNavigationSuggestion) {
      return (
        <Link
          key={item.id}
          to={item.path}
          onClick={handleResultClick}
          className="group flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors border-b border-gray-50 dark:border-dark-700 last:border-0"
        >
          <span className="text-gray-400 group-hover:text-yellow-500 transition-colors flex-shrink-0 text-base font-light">
            ↗
          </span>
          <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
            {item.title}
          </span>
        </Link>
      );
    }

    // Article result (existing rendering)
    if (item.isArticleResult) {
      return (
        <Link
          key={item.id}
          to={item.path}
          onClick={handleResultClick}
          className="block px-4 py-3 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors group border-b border-gray-50 dark:border-dark-700 last:border-0"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(item.category)}`}>
                  {item.category}
                </span>
                {item.readTime && (
                  <span className="text-xs text-gray-400">{item.readTime}</span>
                )}
              </div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors text-sm">
                {item.title}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                {item.description}
              </p>
            </div>
            <svg className="w-4 h-4 text-gray-400 group-hover:text-yellow-500 group-hover:translate-x-1 transition-all ml-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      );
    }

    // Travelogue result (existing rendering)
    if (item.isTravelogueResult) {
      return (
        <Link
          key={item.id}
          to={item.path}
          onClick={handleResultClick}
          className="block px-4 py-3 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors group border-b border-gray-50 dark:border-dark-700 last:border-0"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                  Travelogue
                </span>
              </div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors text-sm">
                {item.title}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                {item.description}
              </p>
            </div>
            <svg className="w-4 h-4 text-gray-400 group-hover:text-green-500 group-hover:translate-x-1 transition-all ml-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      );
    }

    // Fallback
    return null;
  };

  // Get total results count (excluding section labels)
  const totalResults = results.filter(r => !r.isSectionLabel).length;

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSearch}>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-5 py-4 pl-12 pr-36 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-800 placeholder-gray-400 transition-all"
            placeholder="Search automotive articles (ABS, ADAS, AWD, Spiti, Tyres)..."
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
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all bg-white text-slate-800 hover:text-yellow-600 animate-rgb-border"
            >
              <span>✨</span>
              <span>AI Mode</span>
            </button>
          </div>
        </div>
      </form>

      {/* Search Results Dropdown */}
      {isOpen && totalResults > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-800 rounded-xl shadow-xl border border-gray-100 dark:border-dark-700 z-50 overflow-hidden max-h-[480px] overflow-y-auto">
          <div className="py-1">
            {/* Result count header */}
            <div className="px-4 py-2 border-b border-gray-100 dark:border-dark-700 flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {totalResults} result{totalResults !== 1 ? 's' : ''}
              </span>
              <button 
                onClick={() => navigate(`/articles?search=${encodeURIComponent(query)}`)}
                className="text-xs text-yellow-600 hover:text-yellow-700 font-medium"
              >
                View all →
              </button>
            </div>

            {/* Results list */}
            {results.map((item) => renderResultRow(item))}
          </div>
        </div>
      )}

      {/* No Results */}
      {isOpen && query.length >= 2 && totalResults === 0 && !isLoading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-800 rounded-xl shadow-xl border border-gray-100 dark:border-dark-700 z-50 p-8 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">No results found</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            We couldn't find anything matching "{query}"
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => navigate('/articles')}
              className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
            >
              Browse articles →
            </button>
            <button
              onClick={() => navigate('/compare-cars')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Compare cars →
            </button>
            <button
              onClick={() => {
                navigate(`/ai-mode?q=${encodeURIComponent(query)}`);
                setIsOpen(false);
                setQuery('');
                setResults([]);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors"
            >
              ✨ Try AI Mode
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;