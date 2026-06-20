// src/pages/ArticleDetail.jsx
/*
================================================================================
File Name : ArticleDetail.jsx
Author : Tahseen Raza
Created Date : 2025-01-15
Description : Individual article detail page with full theme support
Company : Vaahan International
Copyright : (c) 2025 Vaahan International. All rights reserved.
================================================================================
*/

import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { allArticles } from '../data/articlesData'

const ArticleDetail = () => {
  const { slug } = useParams()
  const { isDark } = useTheme()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const found = allArticles.find(a => a.slug === slug)
    setArticle(found || null)
    setLoading(false)
  }, [slug])

  if (loading) {
    return (
      <div className="container-custom py-32 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
        <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading article...</p>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="container-custom py-32 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-6">🔍</div>
          <h1 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Article Not Found</h1>
          <p className={`mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>The article you're looking for doesn't exist or has been moved.</p>
          <Link to="/articles" className="bg-yellow-500 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors inline-block">
            Browse All Articles
          </Link>
          <div className="mt-8 text-left">
            <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Available Articles:</h3>
            <div className="space-y-2">
              {allArticles.map(a => (
                <Link key={a.id} to={`/article/${a.slug}`} className="block text-yellow-500 hover:text-yellow-600 transition-colors">
                  • {a.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-16 bg-gradient-to-r from-blue-950 via-slate-900 to-slate-700">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container-custom relative z-10 text-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            {/* Category & Read Time */}
            <div className="flex flex-wrap gap-2 mb-4 sm:mb-5">
              <span className="px-3 py-1 bg-yellow-500 text-gray-900 text-xs font-semibold rounded-full">
                {article.category}
              </span>
              {article.readTime && (
                <span className="px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 text-gray-200 text-xs font-semibold rounded-full">
                  {article.readTime}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-tight text-white mb-4 sm:mb-5">
              {article.title}
            </h1>

            {/* Author & Date */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-gray-300 text-sm sm:text-base">
              <span>By {article.author || 'Vaahan Team'}</span>
              <span>•</span>
              <span>{article.date || 'Coming Soon'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className={`py-8 sm:py-12 md:py-16 transition-colors duration-300 ${isDark ? 'bg-dark-900' : 'bg-white'}`}>
        <div className="container-custom">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            {/* Featured Image */}
            <img
              src={article.image}
              alt={article.title}
              className={`w-full rounded-xl mb-6 sm:mb-8 transition-colors duration-300 ${isDark ? 'shadow-lg shadow-dark-800' : 'shadow-md'}`}
            />

            {/* Article Content */}
            <div className={`prose prose-sm sm:prose-base lg:prose-lg max-w-none ${isDark ? 'prose-invert' : ''}`}>
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className={`mt-6 sm:mt-8 pt-6 sm:pt-8 border-t transition-colors duration-300 ${isDark ? 'border-dark-700' : 'border-gray-200'}`}>
                <h4 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Tags:</h4>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, idx) => (
                    <span key={idx} className={`px-3 py-1 text-sm rounded-full transition-colors duration-300 ${
                      isDark ? 'bg-dark-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                    }`}>
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Share Section */}
            <div className={`mt-6 sm:mt-8 pt-6 sm:pt-8 border-t transition-colors duration-300 ${isDark ? 'border-dark-700' : 'border-gray-200'}`}>
              <h4 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Share this article:</h4>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <button className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors duration-300 ${
                  isDark ? 'bg-dark-700 text-gray-300 hover:bg-dark-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                  📤 Share
                </button>
                <button className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors duration-300 ${
                  isDark ? 'bg-dark-700 text-gray-300 hover:bg-dark-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                  🔖 Bookmark
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Articles Section */}
      <section className={`py-8 sm:py-12 md:py-16 transition-colors duration-300 ${isDark ? 'bg-dark-800' : 'bg-gray-50'}`}>
        <div className="container-custom">
          <h2 className={`text-xl sm:text-2xl font-bold mb-6 sm:mb-8 ${isDark ? 'text-white' : 'text-gray-900'} px-4 sm:px-0`}>Related Articles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 px-4 sm:px-0">
            {allArticles
              .filter(a => a.category === article.category && a.id !== article.id)
              .slice(0, 3)
              .map((related) => (
                <Link
                  key={related.id}
                  to={`/article/${related.slug}`}
                  className={`group rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ${
                    isDark ? 'bg-dark-900 hover:shadow-dark-800' : 'bg-white'
                  }`}
                >
                  <div className="relative h-40 sm:h-48 overflow-hidden">
                    <img
                      src={related.image}
                      alt={related.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4 sm:p-5">
                    <h3 className={`font-bold text-sm sm:text-base mb-2 line-clamp-2 transition-colors ${
                      isDark ? 'text-white group-hover:text-yellow-400' : 'text-gray-900 group-hover:text-yellow-500'
                    }`}>
                      {related.title}
                    </h3>
                    <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {related.readTime || '5 min read'}
                    </p>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default ArticleDetail