// src/pages/CategoryArticle.jsx
/*
================================================================================
File Name : CategoryArticle.jsx
Author : Tahseen Raza
Created Date : 2026-06-18
Description : Category page showing features as articles in professional format
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { featuresData } from '../data/featuresData'

const CategoryArticle = () => {
  const { categoryId } = useParams()
  const { isDark } = useTheme()
  
  // Get category data
  const category = featuresData[categoryId]
  
  if (!category) {
    return (
      <div className="container-custom py-32 text-center">
        <div className="text-6xl mb-6">🔍</div>
        <h1 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Category Not Found</h1>
        <p className={`mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>The category you're looking for doesn't exist.</p>
        <Link to="/" className="inline-block bg-yellow-500 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors">
          Back to Home
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-16 bg-gradient-to-r from-blue-950 via-slate-900 to-slate-700">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container-custom relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block px-4 py-1.5 bg-yellow-500 rounded-full text-gray-900 text-sm font-semibold mb-4"
          >
            {category.icon} {category.name}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-white mb-4"
          >
            {category.name}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed px-4"
          >
            {category.description}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-3 mt-6"
          >
            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-semibold">
              {category.features.length} Features
            </span>
          </motion.div>
        </div>
      </section>

      {/* Features as Articles Grid */}
      <section className={`py-12 sm:py-16 md:py-20 transition-colors duration-300 ${
        isDark ? 'bg-dark-900' : 'bg-gray-50'
      }`}>
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
            {category.features.map((feature, idx) => (
              <motion.article
                key={feature.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (idx % 9) * 0.05 }}
                whileHover={{ y: -5 }}
                className={`group rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ${
                  isDark ? 'bg-dark-800' : 'bg-white'
                }`}
              >
                <Link to={`/feature/${categoryId}/${feature.id}`}>
                  <div className="relative h-44 sm:h-48 md:h-52 overflow-hidden">
                    <img
                      src={feature.image}
                      alt={feature.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className={`px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full ${
                        feature.isStandard 
                          ? 'bg-green-500 text-white' 
                          : 'bg-yellow-500 text-gray-900'
                      }`}>
                        {feature.isStandard ? '✓ Standard' : '★ Advanced'}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-yellow-500 text-gray-900 text-[10px] sm:text-xs font-semibold rounded-full">
                        {category.name}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 sm:p-5">
                    <h3 className={`text-base sm:text-lg md:text-xl font-bold mb-2 line-clamp-2 transition-colors ${
                      isDark ? 'text-white group-hover:text-yellow-400' : 'text-gray-900 group-hover:text-yellow-600'
                    }`}>
                      {feature.name}
                    </h3>
                    <p className={`text-sm mb-3 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {feature.shortDesc}
                    </p>
                    <p className={`text-xs mb-3 line-clamp-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {feature.tagline}
                    </p>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
                      {feature.benefits && feature.benefits.slice(0, 2).map((benefit, i) => (
                        <span key={i} className={`text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full ${
                          isDark ? 'bg-dark-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {benefit.replace('✅ ', '').substring(0, 25)}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] sm:text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {feature.applicableVehicles?.substring(0, 30) || 'All vehicles'}
                      </span>
                      <span className="text-yellow-500 font-semibold text-xs sm:text-sm group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        Read More →
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default CategoryArticle