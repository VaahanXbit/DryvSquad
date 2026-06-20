// src/pages/FeatureDetail.jsx
/*
================================================================================
File Name : FeatureDetail.jsx
Author : Tahseen Raza
Created Date : 2025-01-15
Description : Individual feature detail page with full content
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { featuresData } from '../data/featuresData'

const FeatureDetail = () => {
  const { categoryId, featureId } = useParams()
  const { isDark } = useTheme()
  const [feature, setFeature] = useState(null)
  const [category, setCategory] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const categoryData = featuresData[categoryId]
    if (categoryData) {
      const featureData = categoryData.features.find(f => f.id === featureId)
      setCategory(categoryData)
      setFeature(featureData)
    }
    setLoading(false)
  }, [categoryId, featureId])

  if (loading) {
    return (
      <div className="container-custom py-32 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
        <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading...</p>
      </div>
    )
  }

  if (!feature || !category) {
    return (
      <div className="container-custom py-32 text-center">
        <div className="text-6xl mb-6">🔍</div>
        <h1 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Feature Not Found</h1>
        <p className={`mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>The feature you're looking for doesn't exist.</p>
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
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="flex flex-wrap gap-2 mb-4 sm:mb-5">
              <Link 
                to={`/category/${categoryId}`} 
                className="px-3 py-1 bg-yellow-500 text-gray-900 text-xs font-semibold rounded-full hover:bg-yellow-600 transition-colors"
              >
                {category.icon} {category.name}
              </Link>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                feature.isStandard 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              }`}>
                {feature.isStandard ? '✓ Standard Feature' : '★ Advanced Feature'}
              </span>
              {feature.readTime && (
                <span className="px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 text-gray-300 text-xs font-semibold rounded-full">
                  {feature.readTime}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight text-white mb-4">
              {feature.name}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed">
              {feature.tagline || feature.shortDesc}
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-4 text-gray-400 text-sm">
              <span>By {feature.author || 'Vaahan Team'}</span>
              <span>•</span>
              <span>{feature.date || 'Coming Soon'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Content */}
      <section className={`py-8 sm:py-12 md:py-16 transition-colors duration-300 ${isDark ? 'bg-dark-900' : 'bg-white'}`}>
        <div className="container-custom">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            {/* Feature Image */}
            <img
              src={feature.image}
              alt={feature.name}
              className={`w-full rounded-xl mb-6 sm:mb-8 transition-colors duration-300 ${isDark ? 'shadow-lg shadow-dark-800' : 'shadow-md'}`}
            />

            {/* Article Content */}
            <div className="article-content">
              {/* Simple Explanation */}
              {feature.simpleExplanation && (
                <div className={`mb-6 sm:mb-8 p-4 sm:p-6 rounded-xl border ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-blue-50 border-blue-200'}`}>
                  <h3 className={`text-lg sm:text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>💡 Simple Explanation</h3>
                  <div className={`space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <p><span className="font-semibold">What it is:</span> {feature.simpleExplanation.what}</p>
                    <p><span className="font-semibold">Think of it like:</span> {feature.simpleExplanation.analogy}</p>
                    <p><span className="font-semibold">When it works:</span> {feature.simpleExplanation.whenUsed}</p>
                  </div>
                </div>
              )}

              {/* How It Works */}
              {feature.howItWorks && (
                <div className={`mb-6 sm:mb-8 p-4 sm:p-6 rounded-xl border ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-gray-50 border-gray-200'}`}>
                  <h3 className={`text-lg sm:text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>⚙️ How It Works</h3>
                  <div className="space-y-2">
                    {Object.values(feature.howItWorks).map((step, i) => (
                      <div key={i} className={`flex items-start gap-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isDark ? 'bg-dark-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                          {i + 1}
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Benefits */}
              {feature.benefits && (
                <div className={`mb-6 sm:mb-8 p-4 sm:p-6 rounded-xl border ${isDark ? 'bg-green-900/20 border-green-800/30' : 'bg-green-50 border-green-200'}`}>
                  <h3 className={`text-lg sm:text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>✅ Benefits</h3>
                  <ul className={`space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {feature.benefits.map((benefit, i) => (
                      <li key={i}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Cons / Limitations */}
              {feature.cons && (
                <div className={`mb-6 sm:mb-8 p-4 sm:p-6 rounded-xl border ${isDark ? 'bg-red-900/20 border-red-800/30' : 'bg-red-50 border-red-200'}`}>
                  <h3 className={`text-lg sm:text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>⚠️ Things to Know</h3>
                  <ul className={`space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {feature.cons.map((con, i) => (
                      <li key={i}>{con}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Myths Busted */}
              {feature.myths && (
                <div className={`mb-6 sm:mb-8 p-4 sm:p-6 rounded-xl border ${isDark ? 'bg-yellow-900/20 border-yellow-800/30' : 'bg-yellow-50 border-yellow-200'}`}>
                  <h3 className={`text-lg sm:text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>🔍 Myths Busted</h3>
                  <ul className={`space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {feature.myths.map((myth, i) => (
                      <li key={i}>{myth}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Who Needs This */}
              {feature.bestFor && (
                <div className={`mb-6 sm:mb-8 p-4 sm:p-6 rounded-xl border ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-gray-50 border-gray-200'}`}>
                  <h3 className={`text-lg sm:text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>🎯 Who Needs This Most?</h3>
                  <div className="flex flex-wrap gap-2">
                    {feature.bestFor.map((item, i) => (
                      <span key={i} className={`px-3 py-1 rounded-full text-sm ${isDark ? 'bg-dark-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Details */}
              {feature.technical && (
                <div className={`mb-6 sm:mb-8 p-4 sm:p-6 rounded-xl border ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-gray-50 border-gray-200'}`}>
                  <h3 className={`text-lg sm:text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>📊 Technical Details</h3>
                  <div className={`space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {Object.entries(feature.technical).map(([key, value]) => (
                      <div key={key} className="flex flex-wrap gap-2">
                        <span className="font-semibold">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                  <div className={`mt-3 pt-3 border-t ${isDark ? 'border-dark-600' : 'border-gray-200'}`}>
                    <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                      <span className="font-semibold">Applicable Vehicles:</span> {feature.applicableVehicles}
                    </p>
                    {feature.priceRange && (
                      <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                        <span className="font-semibold">Price Range:</span> {feature.priceRange}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-dark-700">
              <Link
                to={`/category/${categoryId}`}
                className="inline-flex items-center bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold py-2.5 px-6 rounded-lg transition-all duration-300"
              >
                ← Back to {category.name}
              </Link>
              <Link
                to="/"
                className="inline-flex items-center border border-gray-300 dark:border-dark-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 font-semibold py-2.5 px-6 rounded-lg transition-all duration-300"
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Related Features */}
      {category.features.filter(f => f.id !== feature.id).length > 0 && (
        <section className={`py-8 sm:py-12 md:py-16 transition-colors duration-300 ${isDark ? 'bg-dark-800' : 'bg-gray-50'}`}>
          <div className="container-custom">
            <h2 className={`text-xl sm:text-2xl font-bold mb-6 sm:mb-8 ${isDark ? 'text-white' : 'text-gray-900'} px-4 sm:px-0`}>
              More from {category.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 px-4 sm:px-0">
              {category.features
                .filter(f => f.id !== feature.id)
                .slice(0, 3)
                .map((relatedFeature) => (
                  <Link
                    key={relatedFeature.id}
                    to={`/feature/${categoryId}/${relatedFeature.id}`}
                    className={`group rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ${
                      isDark ? 'bg-dark-900' : 'bg-white'
                    }`}
                  >
                    <div className="relative h-40 sm:h-48 overflow-hidden">
                      <img
                        src={relatedFeature.image}
                        alt={relatedFeature.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-3 left-3">
                        <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-yellow-500 text-gray-900 text-[10px] sm:text-xs font-semibold rounded-full">
                          {category.name}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 sm:p-5">
                      <h3 className={`font-bold text-sm sm:text-base mb-2 line-clamp-2 transition-colors ${
                        isDark ? 'text-white group-hover:text-yellow-400' : 'text-gray-900 group-hover:text-yellow-500'
                      }`}>
                        {relatedFeature.name}
                      </h3>
                      <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {relatedFeature.shortDesc.substring(0, 60)}...
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

export default FeatureDetail