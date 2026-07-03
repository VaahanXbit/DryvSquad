// src/pages/Home.jsx
/*
================================================================================
File Name : Home.jsx
Author : Tahseen Raza
Created Date : 2026-06-10
Description : Home page component with banner slider and combined travelogues & articles
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import SearchBar from '../components/SearchBar'
import { useTheme } from '../context/ThemeContext'
import { getFeaturedTravelogues } from '../data/traveloguesData'
import { getFeaturedArticles } from '../data/articlesData'

// ========================================
// STATIC DATA
// ========================================

const BANNERS = [
  {
    id: 1,
    image: "/Hero1.png",
    mobileImage: "/Hero1-mobile.png",
    link: "/articles",
    buttonText: "Explore Articles →"
  },
  {
    id: 2,
    image: "/Hero2.png",
    mobileImage: "/Hero2-mobile.png",
    link: "/travelogues",
    buttonText: "Read Travel Stories →"
  },
  {
    id: 3,
    image: "/Hero3.png",
    mobileImage: "/Hero3-mobile2.png",
    link: "/compare-cars",
    buttonText: "Compare Cars →"
  }
];

const STATS = [
  { number: '100+', label: 'Feature Guides', description: 'Comprehensive explanations' },
  { number: '10K+', label: 'Monthly Readers', description: 'Growing community' },
  { number: '50+', label: 'Tech Articles', description: 'Expert insights' },
  { number: '4+', label: 'Categories', description: 'Complete coverage' }
]

const LATEST_ARTICLES = [
  {
    title: 'AWD vs FWD: The ₹2 Lakh Question',
    excerpt: 'A practical comparison between AWD and FWD systems for Indian roads.',
    image: '/AWDvsFWD.png',
    date: 'January 15, 2025',
    readTime: '8 min read',
    category: 'Feature Reviews',
    slug: 'awd-vs-fwd'
  },
  {
    title: 'ADAS Lane Keep Assist: Why It Failed',
    excerpt: 'Real-world review of ADAS technology on Indian highways.',
    image: '/images/articles/Adas-lane.png',
    date: 'January 14, 2025',
    readTime: '6 min read',
    category: 'Feature Reviews',
    slug: 'adas-lane-keep-assist'
  },
  {
    title: 'FWD Car in Spiti Winter',
    excerpt: 'Can your FWD car handle Spiti in winter? The honest answer.',
    image: '/images/articles/FWD-Car.png',
    date: 'January 13, 2025',
    readTime: '7 min read',
    category: 'Feature Reviews',
    slug: 'fwd-car-spiti-winter'
  },
  {
    title: 'Best Tyres for Highway Drives',
    excerpt: 'What nobody tells you about choosing tyres for long drives.',
    image: '/images/articles/Best-Tyres.png',
    date: 'January 12, 2025',
    readTime: '5 min read',
    category: 'Feature Reviews',
    slug: 'best-highway-tyres'
  }
]

const TESTIMONIALS = [
  { quote: "The detailed explanations of ADAS features helped me understand exactly what to look for.", name: "Rahul Mehta", role: "New Car Buyer" },
  { quote: "Finally a platform that explains EV battery technology in simple terms.", name: "Priya Singh", role: "EV Owner" },
  { quote: "As a first-time car buyer, I was overwhelmed by all the technical jargon. Vaahan made it clear.", name: "Amit Sharma", role: "First Time Buyer" }
]

// ========================================
// HOME COMPONENT - Functional with Hooks
// ========================================

const Home = () => {
  const { isDark } = useTheme()
  const [travelogues, setTravelogues] = useState([])
  const [featuredArticles, setFeaturedArticles] = useState([])
  const [loading, setLoading] = useState(true)

  // ========================================
  // Fetch travelogues & articles on component mount
  // ========================================
  const fetchHomeData = async () => {
    try {
      console.log('Fetching travelogues & articles from API...')
      
      const logsPromise = getFeaturedTravelogues(4)
      const artsPromise = getFeaturedArticles(4)
      
      const [logs, arts] = await Promise.all([logsPromise, artsPromise])
      
      console.log('✅ Received logs:', logs)
      console.log('✅ Received featured articles:', arts)
      
      setTravelogues(logs)
      setFeaturedArticles(arts)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching homepage data:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('Home component mounted - fetching dynamic data...')
    fetchHomeData()
  }, [])

  // ========================================
  // Animation variants
  // ========================================
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  }

  const scaleUp = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } }
  }

// ========================================
// Hero Section with Banner Slider
// ========================================
const renderHero = () => {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BANNERS.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  return (
    <section
      className="relative w-full overflow-hidden bg-transparent pt-[var(--header-height,72px)] lg:pt-0"
    >
      <div className="w-full relative aspect-[4/5] lg:aspect-[1672/941]">
        
        {BANNERS.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <picture>
              <source media="(max-width: 1023px)" srcSet={banner.mobileImage} />
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-contain block"
              />
            </picture>

            <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-black/55 via-black/10 to-transparent pointer-events-none"></div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: index === currentSlide ? 1 : 0, y: index === currentSlide ? 0 : 12 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="absolute bottom-2 left-2 xs:bottom-3 xs:left-3 sm:bottom-5 sm:left-5 md:bottom-8 md:left-8 z-10"
            >
              <Link
                to={banner.link}
                className="inline-block whitespace-nowrap px-3 py-1.5 xs:px-4 xs:py-2 sm:px-6 sm:py-2.5 md:px-8 md:py-3 rounded-lg sm:rounded-xl font-semibold text-[11px] xs:text-xs sm:text-sm md:text-base transition-all duration-300 hover:scale-105 hover:shadow-xl text-black"
                style={{
                  background: '#EAB308',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
                }}
              >
                {banner.buttonText}
              </Link>
            </motion.div>
          </div>
        ))}

        <button
          onClick={() => goToSlide((currentSlide - 1 + BANNERS.length) % BANNERS.length)}
          className="absolute left-1.5 xs:left-2 sm:left-4 md:left-6 top-1/2 transform -translate-y-1/2 z-20 w-6 h-6 xs:w-7 xs:h-7 sm:w-9 sm:h-9 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/30 transition-colors duration-150 flex items-center justify-center text-white border border-white/20"
          aria-label="Previous slide"
        >
          <svg className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={() => goToSlide((currentSlide + 1) % BANNERS.length)}
          className="absolute right-1.5 xs:right-2 sm:right-4 md:right-6 top-1/2 transform -translate-y-1/2 z-20 w-6 h-6 xs:w-7 xs:h-7 sm:w-9 sm:h-9 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/30 transition-colors duration-150 flex items-center justify-center text-white border border-white/20"
          aria-label="Next slide"
        >
          <svg className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="flex justify-center items-center gap-1.5 xs:gap-2 absolute bottom-2 xs:bottom-3 sm:bottom-4 md:bottom-5 left-0 right-0 z-20">
        {BANNERS.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-yellow-500 w-4 h-1.5 xs:w-5 xs:h-2' 
                : 'bg-white/60 w-1.5 h-1.5 xs:h-2'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}

  // ========================================
  // Search Section
  // ========================================
  const renderSearchSection = () => {
    return (
      <section className="pt-12 md:pt-16 transition-colors duration-150">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6 md:mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h2 className={`font-bold text-2xl tracking-wider uppercase ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`}>
                  Find Your Answer
                </h2>
                <h2 className={`text-2xl md:text-3xl font-bold mt-2 mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Search Our Automotive Library
                </h2>
                <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                  Explore expert reviews, comparisons, and technology guides
                </p>
              </motion.div>
            </div>

            <SearchBar />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex flex-wrap justify-center gap-2 mt-5"
            >
              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Popular searches:</span>
              {['AWD vs FWD', 'ADAS', 'Spiti Winter', 'Best Tyres', 'ABS'].map((term) => (
                <React.Fragment key={term}>
                  <button
                    onClick={() => {
                      const searchInput = document.querySelector('input[placeholder*="Search automotive"]')
                      if (searchInput) {
                        searchInput.value = term
                        searchInput.dispatchEvent(new Event('input'))
                      }
                    }}
                    className={`text-xs transition-colors duration-150 ${isDark ? 'text-gray-400 hover:text-yellow-400' : 'text-gray-500 hover:text-yellow-600'}`}
                  >
                    #{term}
                  </button>
                  <span className={isDark ? 'text-gray-700' : 'text-gray-300'}>•</span>
                </React.Fragment>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
    )
  }

  // ========================================
  // Stats Cards
  // ========================================
  const renderStatsCards = () => {
    return (
      <div className="container-custom -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {STATS.map((stat, idx) => (
            <motion.div
              key={idx}
              variants={scaleUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              whileHover={{ y: -5 }}
              className={`rounded-2xl shadow-xl p-4 md:p-6 text-center border transition-colors duration-150 ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-100'}`}
            >
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-yellow-500 mb-1 md:mb-2">
                {stat.number}
              </div>
              <div className={`font-semibold text-sm md:text-base mb-0.5 md:mb-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {stat.label}
              </div>
              <div className={`text-xs md:text-sm ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>
                {stat.description}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  // ========================================
  // COMBINED TRAVELOGUES & ARTICLES SECTION
  // Two columns side by side with identical card styling
  // Enhanced 3D shadow effect for light theme
  // ========================================
  const renderCombinedContent = () => {
    const isTraveloguesLoading = loading;
    const hasTravelogues = travelogues && travelogues.length > 0;
    const hasArticles = featuredArticles && featuredArticles.length > 0;

    // Card shadow classes based on theme
    const cardShadowClass = isDark 
      ? 'shadow-lg hover:shadow-2xl' 
      : 'shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_60px_rgb(0,0,0,0.18)]';

    const cardBgClass = isDark ? 'bg-dark-800' : 'bg-white';

    return (
      <section className={`py-12 md:py-16 lg:py-20 transition-colors duration-150 ${isDark ? 'bg-dark-900' : 'bg-gray-50'}`}>
        <div className="container-custom">
          {/* Section Header */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-12"
          >
            <span className="text-yellow-500 font-bold text-3xl tracking-wider uppercase">
              Explore
            </span>
            <h2
              className={`text-2xl md:text-3xl lg:text-4xl font-bold mt-2 md:mt-3 ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Most Popular Articles &amp; Story
            </h2>
            <p
              className={`text-sm md:text-base lg:text-lg mt-2 md:mt-4 max-w-3xl mx-auto ${isDark ? "text-gray-400" : "text-gray-600"}`}
            >
              Real driving experiences and expert automotive insights — all in one place.
            </p>
          </motion.div>

          {/* Two Column Grid - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            
            {/* LEFT COLUMN - TRAVELOGUES */}
            <div>
              <div className="mb-4 md:mb-6">
                <h2 className="text-yellow-500 font-bold text-3xl tracking-wider uppercase">
                  Travelogue
                </h2>
                <h5 className={`text-xl md:text-xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Real Journeys. Real Driving Experiences.
                </h5>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Explore real road trips, driving experiences, destination guides, and practical travel stories designed for Indian roads and everyday drivers.
                </p>
                <Link 
                  to="/travelogues" 
                  className={`inline-block mt-2 text-sm font-medium hover:text-yellow-500 transition-colors duration-150 ${isDark ? 'text-gray-400 hover:text-yellow-400' : 'text-gray-500 hover:text-yellow-600'}`}
                >
                  View All Travelogues →
                </Link>
              </div>

              {isTraveloguesLoading ? (
                <div className="flex justify-center items-center h-96">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500"></div>
                </div>
              ) : !hasTravelogues ? (
                <div className={`rounded-xl p-8 text-center ${cardBgClass} ${cardShadowClass}`}>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>No travelogues available</p>
                </div>
              ) : (
                <div className="space-y-4 md:space-y-5">
                  {travelogues.slice(0, 4).map((log, idx) => (
                    <motion.div
                      key={log._id || idx}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.08 }}
                      whileHover={{ y: -4, scale: 1.01 }}
                      className={`group rounded-xl overflow-hidden ${cardShadowClass} transition-all duration-300 h-[140px] md:h-[160px] ${cardBgClass} ${!isDark && 'border border-gray-100'}`}
                    >
                      <Link to={`/travelogue/${log.slug}`} className="flex h-full">
                        <div className="w-[140px] md:w-[160px] h-full flex-shrink-0 overflow-hidden">
                          <img
                            src={log.image || '/images/travelogue/default.png'}
                            alt={log.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              e.target.src = '/images/travelogue/default.png';
                            }}
                          />
                        </div>
                        <div className="flex-1 p-3 md:p-4 flex flex-col justify-between min-w-0">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2 py-0.5 bg-yellow-500 text-gray-900 text-[10px] font-semibold rounded-full whitespace-nowrap">
                                {log.category || 'Travel'}
                              </span>
                              {log.readTime && (
                                <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                  {log.readTime}
                                </span>
                              )}
                            </div>
                            <h4 className={`font-bold text-sm md:text-base leading-tight line-clamp-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {log.title}
                            </h4>
                            <p className={`text-xs md:text-sm mt-1 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {log.excerpt}
                            </p>
                          </div>
                          <div className="flex items-center text-yellow-500 font-semibold text-xs md:text-sm hover:text-yellow-600 transition-colors duration-150 mt-1">
                            Read More →
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN - ARTICLES */}
            <div>
              <div className="mb-4 md:mb-6">
                <h2 className="text-yellow-500 font-bold text-3xl tracking-wider uppercase">
                  Automotive Insights Hub
                </h2>
                <h5 className={`text-2xl md:text-xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Featured Technology Guides
                </h5>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Learn modern automotive technologies, safety systems and engineering concepts through practical, easy-to-understand articles.
                </p>
                <Link 
                  to="/articles" 
                  className={`inline-block mt-2 text-sm font-medium hover:text-yellow-500 transition-colors duration-150 ${isDark ? 'text-gray-400 hover:text-yellow-400' : 'text-gray-500 hover:text-yellow-600'}`}
                >
                  View All Articles →
                </Link>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-96">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500"></div>
                </div>
              ) : !hasArticles ? (
                <div className={`rounded-xl p-8 text-center ${cardBgClass} ${cardShadowClass}`}>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>No articles available</p>
                </div>
              ) : (
                <div className="space-y-4 md:space-y-5">
                  {featuredArticles.slice(0, 4).map((article, idx) => (
                    <motion.article
                      key={article._id || idx}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.08 }}
                      whileHover={{ y: -4, scale: 1.01 }}
                      className={`group rounded-xl overflow-hidden ${cardShadowClass} transition-all duration-300 h-[140px] md:h-[160px] ${cardBgClass} ${!isDark && 'border border-gray-100'}`}
                    >
                      <Link to={`/article/${article.slug}`} className="flex h-full">
                        <div className="w-[140px] md:w-[160px] h-full flex-shrink-0 overflow-hidden">
                          <img 
                            src={article.image || '/images/article/default.png'} 
                            alt={article.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                        </div>
                        <div className="flex-1 p-3 md:p-4 flex flex-col justify-between min-w-0">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2 py-0.5 bg-yellow-500 text-gray-900 text-[10px] font-semibold rounded-full whitespace-nowrap">
                                {article.category}
                              </span>
                              <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                {article.readTime}
                              </span>
                            </div>
                            <h4 className={`font-bold text-sm md:text-base leading-tight line-clamp-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {article.title}
                            </h4>
                            <p className={`text-xs md:text-sm mt-1 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {article.excerpt}
                            </p>
                          </div>
                          <div className="flex items-center text-yellow-500 font-semibold text-xs md:text-sm hover:text-yellow-600 transition-colors duration-150 mt-1">
                            Read Article →
                          </div>
                        </div>
                      </Link>
                    </motion.article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    )
  }

  // ========================================
  // Newsletter Section
  // ========================================
  const renderNewsletter = () => {
    return (
      <section className={`py-20 transition-colors duration-150 ${isDark ? 'bg-dark-800' : 'bg-gray-50'}`}>
        <div className="container-custom">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="max-w-3xl mx-auto text-center">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Stay Updated With Automotive Technology
            </h2>
            <p className={`text-lg mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Receive the latest feature guides, technology updates, and vehicle insights directly in your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className={`flex-1 px-5 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors duration-150 ${isDark ? 'bg-dark-700 border-dark-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'} border`}
              />
              <button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-all duration-150">
                Subscribe Now
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    )
  }

  // ========================================
  // Main Render
  // ========================================
  return (
    <>
      {renderHero()}

      <section className={`transition-colors duration-150 border-b ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-yellow-50 border-gray-100'} pb-8 md:pb-12`}>
        {renderSearchSection()}
        {renderStatsCards()}
      </section>

      {/* COMBINED SECTION - Travelogues & Articles side by side */}
      {renderCombinedContent()}

      {/* Testimonials Section */}
      <section className={`py-20 transition-colors duration-150 ${isDark ? 'bg-dark-900' : 'bg-gray-50'}`}>
        <div className="container-custom">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center max-w-4xl mx-auto">
            <span className="text-yellow-500 font-semibold text-sm tracking-wider uppercase">Testimonials</span>
            <h2 className={`text-3xl md:text-4xl font-bold mt-3 mb-12 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              What Our Readers Say
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {TESTIMONIALS.map((testimonial, idx) => (
                <motion.div
                  key={idx}
                  variants={scaleUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                  className={`rounded-xl p-6 text-left border shadow-md transition-colors duration-150 ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-100'}`}
                >
                  <div className="flex text-yellow-400 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                  </div>
                  <p className={`italic mb-4 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    "{testimonial.quote}"
                  </p>
                  <div>
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{testimonial.name}</p>
                    <p className={isDark ? 'text-gray-500' : 'text-gray-400'}>{testimonial.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {renderNewsletter()}
    </>
  )
}

export default Home