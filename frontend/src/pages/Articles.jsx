// src/pages/Articles.jsx
/*
================================================================================
File Name : Articles.jsx
Author : Tahseen Raza
Created Date : 2026-06-15
Description : Articles page with all articles
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { getAllArticles, getArticlesByCategory, getCategories } from '../data/articlesData'
import { SkeletonStyles, CategorySkeleton, CardGridSkeleton, ArticleCardSkeleton, FadeIn } from '../components/skeletons/Skeletons'

const Articles = () => {
  const { isDark } = useTheme()
  const [articles, setArticles] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [filteredArticles, setFilteredArticles] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null)

        // Independent requests — fetch in parallel instead of one-by-one.
        const [allArticles, categoriesData] = await Promise.all([
          getAllArticles(),
          getCategories(),
        ])

        setArticles(allArticles)
        setFilteredArticles(allArticles)
        setCategories(categoriesData)

      } catch (err) {
        console.error('❌ Error fetching articles:', err)
        setError('Failed to load articles. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  const handleCategoryChange = async (category) => {
    setSelectedCategory(category)
    
    if (category === 'All') {
      setFilteredArticles(articles)
    } else {
      const categoryArticles = await getArticlesByCategory(category)
      setFilteredArticles(categoryArticles)
    }
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center pt-[var(--header-height,72px)] lg:pt-20 ${isDark ? 'bg-dark-950' : 'bg-gray-50'}`}>
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold py-2 px-6 rounded-lg transition-all duration-300"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const allCategories = [{ id: 'All', name: 'All', count: articles.length }, ...categories]

  return (
    <>
      <SkeletonStyles />
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-[var(--header-height,72px)] sm:pt-28 md:pt-32 pb-10 sm:pb-12 md:pb-16 bg-gradient-to-r from-dark-950 via-slate-900 to-slate-700">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container-custom relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-white mb-3 sm:mb-4 md:mb-5"
          >
            Automotive Knowledge Hub
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-sm sm:text-lg md:text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed px-4"
          >
            Honest reviews, upcoming launches, and technology explained simply.
          </motion.p>
        </div>
      </section>

      {/* Category Filter Buttons */}
      <section className={`sticky top-14 sm:top-16 z-20 border-b transition-colors duration-300 ${
        isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'
      }`}>
        <div className="container-custom">
          {loading ? (
            <CategorySkeleton isDark={isDark} count={5} />
          ) : (
          <div className="flex flex-nowrap gap-2 py-2.5 sm:py-3 md:py-4 overflow-x-auto hide-scrollbar">
            {allCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.name)}
                className={`shrink-0 px-3.5 sm:px-4 md:px-5 py-1.5 sm:py-2 rounded-full whitespace-nowrap font-semibold transition-all duration-300 text-xs sm:text-sm md:text-base ${
                  selectedCategory === category.name
                    ? 'bg-yellow-500 text-gray-900 shadow-md'
                    : isDark 
                      ? 'bg-dark-700 text-gray-300 hover:bg-dark-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
                <span className={`ml-1.5 text-xs ${
                  selectedCategory === category.name 
                    ? 'text-gray-700' 
                    : isDark ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  ({category.count})
                </span>
              </button>
            ))}
          </div>
          )}
        </div>
      </section>

      {/* Articles Grid */}
      <section className={`py-8 sm:py-12 md:py-16 transition-colors duration-300 ${
        isDark ? 'bg-dark-900' : 'bg-gray-50'
      }`}>
        <div className="container-custom">
          {loading ? (
            <CardGridSkeleton count={6} isDark={isDark} CardComponent={ArticleCardSkeleton} />
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-12 sm:py-16 md:py-20">
              <div className="text-5xl sm:text-6xl mb-4">📚</div>
              <h3 className={`text-xl sm:text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>No Articles Found</h3>
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Try selecting a different category</p>
            </div>
          ) : (
            <FadeIn>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
              {filteredArticles.map((article, idx) => (
                <motion.article
                  key={article.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (idx % 9) * 0.05 }}
                  whileHover={{ y: -5 }}
                  className={`group rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ${
                    isDark ? 'bg-dark-800' : 'bg-white'
                  }`}
                >
                  <Link to={`/article/${article.slug}`}>
                    <div className="relative h-40 sm:h-44 md:h-48 lg:h-52 overflow-hidden">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-yellow-500 text-gray-900 text-[10px] sm:text-xs font-semibold rounded-full">
                          {article.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 sm:p-5">
                      <div className={`flex items-center gap-2 text-[10px] sm:text-xs mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        <span>{article.date || 'Coming Soon'}</span>
                        {article.readTime && (
                          <>
                            <span>•</span>
                            <span>{article.readTime}</span>
                          </>
                        )}
                      </div>
                      <h3 className={`text-base sm:text-lg font-bold mb-2 line-clamp-2 transition-colors ${
                        isDark ? 'text-white group-hover:text-yellow-400' : 'text-gray-900 group-hover:text-yellow-600'
                      }`}>
                        {article.title}
                      </h3>
                      <p className={`text-sm mb-3 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {article.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] sm:text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{article.author || 'Vaahan Team'}</span>
                        <span className="text-yellow-500 font-semibold text-xs sm:text-sm group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                          Read More →
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
            </FadeIn>
          )}
        </div>
      </section>
    </>
  )
}

export default Articles