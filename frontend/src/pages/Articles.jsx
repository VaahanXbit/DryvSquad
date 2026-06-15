// src/pages/Articles.jsx
/*
================================================================================
File Name : Articles.jsx
Author : Tahseen Raza
Created Date : 2025-01-15
Description : Articles page with category filtering for Feature Reviews, New Launches, and Tech Insights
Company : Vaahan International
Copyright : (c) 2025 Vaahan International. All rights reserved.
================================================================================
*/

import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import BasePage from './BasePage'
import { getCategories, getArticlesByCategory, allArticles } from '../data/articlesData'

class ArticlesPage extends BasePage {
  constructor(props = {}) {
    super(props)
    this.pageTitle = 'Automotive Articles | Vaahan International'
    this.pageDescription = 'Feature reviews, new launches, and tech insights for Indian car buyers'
    this.state = {
      selectedCategory: 'All',
      filteredArticles: allArticles
    }
  }

  componentDidMount() {
    super.componentDidMount()
    const params = new URLSearchParams(window.location.search)
    const categoryParam = params.get('category')
    if (categoryParam) {
      this.setState({
        selectedCategory: categoryParam,
        filteredArticles: getArticlesByCategory(categoryParam)
      })
    }
  }

  handleCategoryChange = (category) => {
    this.setState({ 
      selectedCategory: category,
      filteredArticles: category === 'All' ? allArticles : getArticlesByCategory(category)
    })
  }

  getCategoryIcon = (categoryName) => {
    const icons = {
      'Feature Reviews': '📝',
      'New Launches': '🚗',
      'Tech Insights': '💡'
    }
    return icons[categoryName] || '📚'
  }

  renderContent() {
    const { selectedCategory, filteredArticles } = this.state
    const categories = ['All', ...getCategories().map(c => c.name)]

    return (
      <>
        {/* Hero Section */}
        <section className="relative pt-32 pb-16 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
          <div className="container-custom text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              Automotive Knowledge Hub
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl text-gray-300 max-w-2xl mx-auto"
            >
              Honest reviews, upcoming launches, and technology explained simply
            </motion.p>
          </div>
        </section>

        {/* Category Filter Tabs */}
        <section className="sticky top-16 z-20 bg-white border-b border-gray-200">
          <div className="container-custom">
            <div className="flex gap-2 py-4 overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => this.handleCategoryChange(category)}
                  className={`px-5 py-2 rounded-full whitespace-nowrap font-semibold transition-all duration-300 flex items-center gap-2 ${
                    selectedCategory === category
                      ? 'bg-yellow-500 text-gray-900 shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category !== 'All' && <span>{this.getCategoryIcon(category)}</span>}
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Articles Grid */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            {filteredArticles.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Coming Soon</h3>
                <p className="text-gray-500">New articles are being added regularly. Check back soon!</p>
                <button
                  onClick={() => this.handleCategoryChange('All')}
                  className="mt-4 text-yellow-600 font-semibold hover:text-yellow-700"
                >
                  Browse all articles →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredArticles.map((article, idx) => (
                  <motion.article
                    key={article.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (idx % 9) * 0.05 }}
                    whileHover={{ y: -5 }}
                    className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                  >
                    <Link to={`/article/${article.slug}`}>
                      <div className="relative h-52 overflow-hidden">
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-yellow-500 text-gray-900 text-xs font-semibold rounded-full flex items-center gap-1">
                            <span>{article.category === 'Feature Reviews' ? '📝' : article.category === 'New Launches' ? '🚗' : '💡'}</span>
                            {article.category}
                          </span>
                        </div>
                        {article.status === 'coming-soon' && (
                          <div className="absolute top-4 right-4">
                            <span className="px-2 py-1 bg-gray-900 text-white text-xs font-semibold rounded-full">
                              Coming Soon
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                          <span>{article.date || 'Coming Soon'}</span>
                          {article.readTime && <span>• {article.readTime}</span>}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-yellow-600 transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">{article.author || 'Vaahan Team'}</span>
                          <span className="text-yellow-600 font-semibold text-sm group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                            Read More →
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>
            )}
          </div>
        </section>
      </>
    )
  }
}

let articlesPageInstance = null

export const getArticlesPage = () => {
  if (!articlesPageInstance) {
    articlesPageInstance = new ArticlesPage({})
  }
  return articlesPageInstance
}

const Articles = () => {
  const page = getArticlesPage()
  return page.render()
}

export default Articles