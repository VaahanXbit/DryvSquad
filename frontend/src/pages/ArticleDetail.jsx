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
import { getArticleBySlug, getAllArticles } from '../data/articlesData'

const ArticleDetail = () => {
  const { slug } = useParams()
  const { isDark } = useTheme()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [relatedArticles, setRelatedArticles] = useState([])

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true)
        
        // Get article by slug from API
        const articleData = await getArticleBySlug(slug)
        setArticle(articleData || null)
        
        if (articleData) {
          // Get related articles (same category, different slug)
          const allArticlesData = await getAllArticles()
          const related = allArticlesData
            .filter(a => a.category === articleData.category && a.slug !== slug)
            .slice(0, 3)
          setRelatedArticles(related)
        }
      } catch (error) {
        console.error('❌ Error fetching article:', error)
        setArticle(null)
      } finally {
        setLoading(false)
      }
    }
    
    fetchArticle()
  }, [slug])

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center pt-20 ${isDark ? 'bg-dark-950' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Loading article...
          </p>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className={`min-h-screen flex items-center justify-center pt-20 ${isDark ? 'bg-dark-950' : 'bg-gray-50'}`}>
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-6">🔍</div>
          <h1 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Article Not Found</h1>
          <p className={`mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            The article you're looking for doesn't exist or has been moved.
          </p>
          <Link 
            to="/articles" 
            className="bg-yellow-500 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors inline-block"
          >
            Browse All Articles
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 sm:pt-28 md:pt-32 pb-10 sm:pb-12 md:pb-16 bg-gradient-to-r from-blue-950 via-slate-900 to-slate-700">
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

            {/* Inline Article CTA Buttons (Loan / Insurance) */}
            {(article.showLoanCTA || article.showInsuranceCTA) && (
              <div className={`mt-8 p-6 rounded-2xl border transition-all duration-300 ${
                isDark ? 'bg-dark-950/80 border-dark-800 shadow-inner' : 'bg-slate-50 border-slate-200 shadow-sm'
              }`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className={`text-sm font-extrabold uppercase tracking-wider ${isDark ? 'text-yellow-500' : 'text-yellow-600'}`}>
                      DryvSquad Advisor Recommendations
                    </h4>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                      Take the next step based on this article's expert insights.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                    {article.showLoanCTA && (
                      <Link
                        to="/loan-quotes"
                        state={{ fromArticle: `/article/${slug}` }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-slate-950 text-xs font-bold rounded-xl shadow transition-all hover:shadow-yellow-500/10 w-full sm:w-auto text-center justify-center"
                      >
                        <Landmark className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                        <span>Get Auto Loan Quotes</span>
                      </Link>
                    )}
                    {article.showInsuranceCTA && (
                      <Link
                        to="/insurance-quotes"
                        state={{ fromArticle: `/article/${slug}` }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-slate-950 text-xs font-bold rounded-xl shadow transition-all hover:shadow-yellow-500/10 w-full sm:w-auto text-center justify-center"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                        <span>Get Insurance Quotes</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}
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
      {relatedArticles.length > 0 && (
        <section className={`py-8 sm:py-12 md:py-16 transition-colors duration-300 ${isDark ? 'bg-dark-800' : 'bg-gray-50'}`}>
          <div className="container-custom">
            <h2 className={`text-xl sm:text-2xl font-bold mb-6 sm:mb-8 ${isDark ? 'text-white' : 'text-gray-900'} px-4 sm:px-0`}>
              Related Articles
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 px-4 sm:px-0">
              {relatedArticles.map((related) => (
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
      )}
    </>
  )
}

export default ArticleDetail