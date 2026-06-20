// src/pages/Articles.jsx - Simplified with category filter buttons

import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import BasePage from './BasePage'
import { useTheme } from '../context/ThemeContext'
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

  renderContent() {
    const { selectedCategory, filteredArticles } = this.state
    const { isDark } = this.props.theme || { isDark: false }
    // const categories = ['All', ...getCategories().map(c => c.name)]

    return (
      <>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-32 pb-16 bg-gradient-to-r from-blue-950 via-slate-900 to-slate-700">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="container-custom relative z-10 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-white mb-4 sm:mb-5"
            >
              Automotive Knowledge Hub
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-base sm:text-lg md:text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed px-4"
            >
              Honest reviews, upcoming launches, and technology explained simply.
            </motion.p>
          </div>
        </section>

        {/* Category Filter Buttons */}
        {/* <section className={`sticky top-16 z-20 border-b transition-colors duration-300 ${
          isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'
         }`}>
          <div className="container-custom">
            <div className="flex flex-wrap gap-2 py-3 sm:py-4">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => this.handleCategoryChange(category)}
                  className={`px-4 sm:px-5 py-1.5 sm:py-2 rounded-full whitespace-nowrap font-semibold transition-all duration-300 text-sm sm:text-base ${
                    selectedCategory === category
                      ? 'bg-yellow-500 text-gray-900 shadow-md'
                      : isDark 
                        ? 'bg-dark-700 text-gray-300 hover:bg-dark-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                  {category !== 'All' && (
                    <span className={`ml-1.5 text-xs ${
                      selectedCategory === category 
                        ? 'text-gray-700' 
                        : isDark ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      ({getArticlesByCategory(category).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </section> */}

        {/* Articles Grid */}
        <section className={`py-8 sm:py-12 md:py-16 transition-colors duration-300 ${
          isDark ? 'bg-dark-900' : 'bg-gray-50'
        }`}>
          <div className="container-custom">
            {filteredArticles.length === 0 ? (
              <div className="text-center py-12 sm:py-16 md:py-20">
                <div className="text-5xl sm:text-6xl mb-4">📚</div>
                <h3 className={`text-xl sm:text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>No Articles Found</h3>
                <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Try selecting a different category</p>
              </div>
            ) : (
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

// Wrapper component to pass theme
const Articles = () => {
  const { isDark } = useTheme()
  const page = getArticlesPage()
  page.props.theme = { isDark }
  return page.render()
}

export default Articles