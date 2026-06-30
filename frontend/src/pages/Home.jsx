// src/pages/Home.jsx
/*
================================================================================
File Name : Home.jsx
Author : Tahseen Raza
Created Date : 2026-06-10
Description : Home page component with banner slider and dynamic travelogues
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

// ========================================
// STATIC DATA
// ========================================

const BANNERS = [
  {
    id: 1,
    title: "Compare Cars with Confidence",
    subtitle:
      "Compare specifications, safety, performance, mileage and pricing side-by-side to find the right car for your needs.",
    image: "/Hero12.png",
    cta: "Compare Cars",
    link: "/compare-cars"
  },
  {
    id: 2,
    title: "Engineering-Backed Automotive Insights",
    subtitle:
      "Understand ADAS, EVs, engines, safety systems and vehicle technologies through practical, real-world guides.",
    image: "/Hero22.png",
    cta: "Explore Technology",
    link: "/articles"
  },
  {
    id: 3,
    title: "Real Driving Stories for Indian Roads",
    subtitle:
      "Explore travelogue, buying experiences and practical advice designed for everyday Indian driving conditions.",
    image: "/Hero33.png",
    cta: "Explore Travel Stories",
    link: "/travelogues"
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
// Fallback images for travelogues
// ========================================
// const TRAVELOGUE_IMAGES = {
//   'first-highway-lesson': 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&h=400&fit=crop',
//   'first-long-drive-beginner-tips': 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&h=400&fit=crop',
//   'renting-vs-buying-car-true-cost': 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=600&h=400&fit=crop',
//   'first-car-sedan-vs-suv-vs-hatchback': 'https://images.unsplash.com/photo-1550355291-bbee04a44e7e?w=600&h=400&fit=crop',
// }

// const getTravelogueImage = (slug) => {
//   return TRAVELOGUE_IMAGES[slug] || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&h=400&fit=crop'
// }

// ========================================
// HOME COMPONENT - Functional with Hooks
// ========================================

const Home = () => {
  const { isDark } = useTheme()
  const [travelogues, setTravelogues] = useState([])
  const [loading, setLoading] = useState(true)

  // ========================================
  // Fetch travelogues on component mount
  // ========================================
  const fetchTravelogues = async () => {
    try {
      console.log('🔄 Fetching travelogues from API...')
      const logs = await getFeaturedTravelogues(4)
      console.log('✅ Received logs:', logs)
      setTravelogues(logs)
      setLoading(false)
      console.log('✅ State updated - travelogues:', logs.length, 'items')
    } catch (error) {
      console.error('❌ Error fetching featured travelogues:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('🔄 Home component mounted - fetching travelogues...')
    fetchTravelogues()
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
      <section className="relative h-[100vh] min-h-[600px] flex items-center overflow-hidden pt-0 mt-0">
        <div className="absolute inset-0 w-full h-full z-0">
          {BANNERS.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
            >
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>
            </div>
          ))}
        </div>

        <button
          onClick={() => goToSlide((currentSlide - 1 + BANNERS.length) % BANNERS.length)}
          className="absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/30 transition-colors duration-150 flex items-center justify-center text-white border border-white/20"
          aria-label="Previous slide"
        >
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={() => goToSlide((currentSlide + 1) % BANNERS.length)}
          className="absolute right-4 md:right-8 top-1/2 transform -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/30 transition-colors duration-150 flex items-center justify-center text-white border border-white/20"
          aria-label="Next slide"
        >
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div className="container-custom relative z-10">
          <div className="max-w-2xl">
            {BANNERS.map((banner, index) => (
              <div
                key={banner.id}
                className={`transition-opacity duration-500 ${index === currentSlide ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'
                  }`}
              >
                <div className={index === currentSlide ? 'block' : 'hidden'}>
                  <div className="inline-block px-4 py-1.5 bg-yellow-500 rounded-full text-gray-900 text-sm font-semibold mb-6">
                    🚗 Trusted by 10,000+ Indian Car Buyers
                  </div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4 text-white">
                    {banner.title}
                  </h1>
                  <p className="text-xl text-gray-200 mb-6">
                    {banner.subtitle}
                  </p>
                  <Link
                    to={banner.link}
                    className="inline-block bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold py-3 px-8 rounded-lg transition-all duration-150 transform hover:scale-105 shadow-lg"
                  >
                    {banner.cta} →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 flex gap-2">
          {BANNERS.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-yellow-500 w-8' : 'bg-white/50 hover:bg-white/80'
                }`}
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
                <span className={`font-semibold text-sm tracking-wider uppercase ${isDark ? 'text-yellow-400' : 'text-yellow-600'
                  }`}>
                  Find Your Answer
                </span>
                <h2 className={`text-2xl md:text-3xl font-bold mt-2 mb-3 ${isDark ? 'text-white' : 'text-gray-900'
                  }`}>
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
                    className={`text-xs transition-colors duration-150 ${isDark ? 'text-gray-400 hover:text-yellow-400' : 'text-gray-500 hover:text-yellow-600'
                      }`}
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
              className={`rounded-2xl shadow-xl p-4 md:p-6 text-center border transition-colors duration-150 ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-100'
                }`}
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
  // DYNAMIC TRAVELOGUES SECTION
  // ========================================
  const renderTravelogues = () => {
    console.log('📊 Travelogues in state:', travelogues)
    console.log('📊 Loading state:', loading)

    if (loading) {
      return (
        <section className={`py-20 transition-colors duration-150 ${isDark ? 'bg-dark-900' : 'bg-gray-50'}`}>
          <div className="container-custom text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
            <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Loading travel stories...
            </p>
          </div>
        </section>
      )
    }

    if (!travelogues || travelogues.length === 0) {
      console.log('⚠️ No travelogues data available')
      return null
    }

    return (
      <section className={`py-20 transition-colors duration-150 ${isDark ? 'bg-dark-900' : 'bg-gray-50'}`}>
        <div className="container-custom">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-yellow-500 font-bold text-xl tracking-wider uppercase">
              Travelogue
            </span>

            <h2
              className={`text-3xl md:text-4xl lg:text-5xl font-bold mt-3 ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Real Journeys. Real Driving Experiences.
            </h2>

            <p
              className={`text-lg mt-4 max-w-3xl mx-auto ${isDark ? "text-gray-400" : "text-gray-600"}`}
            >
              Explore real road trips, driving experiences, destination guides, and practical travel stories designed for Indian roads and everyday drivers.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {travelogues.map((log, idx) => {
              // Get image based on slug or use fallback
              // const imageUrl = getTravelogueImage(log.slug)

              return (
                <motion.div
                  key={log._id || idx}
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -5 }}
                  className={`group rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-150 ${isDark ? 'bg-dark-800' : 'bg-white'}`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="h-64 md:h-full overflow-hidden">
                      <img
                        src={log.image || '/images/travelogue/default.png'}
                        alt={log.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = '/images/travelogue/default.png';
                        }}
                      />
                    </div>
                    <div className="p-6 md:p-8">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-yellow-500 text-gray-900 text-xs font-semibold rounded-full">
                          {log.category}
                        </span>
                        {log.readTime && (
                          <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            {log.readTime}
                          </span>
                        )}
                      </div>
                      <h3 className={`text-2xl font-bold mb-3 line-clamp-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {log.title}
                      </h3>
                      <p className={`mb-4 leading-relaxed line-clamp-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {log.excerpt}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-5">
                        {log.tags && log.tags.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className={`text-xs px-3 py-1 rounded-full ${isDark ? 'bg-dark-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <Link
                        to={`/travelogue/${log.slug}`}
                        className="inline-flex items-center text-yellow-500 font-semibold hover:text-yellow-600 transition-colors duration-150"
                      >
                        Read More →
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )
            })}
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
      <section className={`py-20 transition-colors duration-150 ${isDark ? 'bg-dark-800' : 'bg-gray-50'
        }`}>
        <div className="container-custom">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="max-w-3xl mx-auto text-center">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'
              }`}>
              Stay Updated With Automotive Technology
            </h2>
            <p className={`text-lg mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Receive the latest feature guides, technology updates, and vehicle insights directly in your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className={`flex-1 px-5 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors duration-150 ${isDark ? 'bg-dark-700 border-dark-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
                  } border`}
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

      <section className={`transition-colors duration-150 border-b ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-yellow-50 border-gray-100'
        } pb-8 md:pb-12`}>
        {renderSearchSection()}
        {renderStatsCards()}
      </section>

      {renderTravelogues()}

      <section className={`py-20 transition-colors duration-150 ${isDark ? 'bg-dark-800' : 'bg-white'
        }`}>
        <div className="container-custom">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
            <span className="text-yellow-500 font-semibold text-sm tracking-wider uppercase">
              Automotive Knowledge Hub
            </span>

            <h2 className={`text-3xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Featured Technology Guides
            </h2>

            <p className={`text-lg mt-4 max-w-3xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Learn modern automotive technologies, safety systems and engineering concepts through practical, easy-to-understand articles.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {LATEST_ARTICLES.map((article, idx) => (
              <motion.article
                key={idx}
                variants={scaleUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                whileHover={{ y: -8 }}
                className={`group rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-150 ${isDark ? 'bg-dark-800' : 'bg-white'
                  }`}
              >
                <Link to={`/article/${article.slug}`}>
                  <div className="relative h-52 overflow-hidden">
                    <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-yellow-500 text-gray-900 text-xs font-semibold rounded-full">{article.category}</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className={`flex items-center gap-3 text-xs mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                      <span>{article.date}</span>
                      <span>•</span>
                      <span>{article.readTime}</span>
                    </div>
                    <h3 className={`text-lg font-bold mb-2 line-clamp-2 group-hover:text-yellow-500 transition-colors ${isDark ? 'text-white' : 'text-gray-900'
                      }`}>{article.title}</h3>
                    <p className={`text-sm mb-4 line-clamp-3 ${isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>{article.excerpt}</p>
                    <div className="inline-flex items-center text-yellow-500 font-semibold text-sm hover:text-yellow-600 transition-colors duration-150">
                      Read Article →
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className={`py-20 transition-colors duration-150 ${isDark ? 'bg-dark-900' : 'bg-gray-50'
        }`}>
        <div className="container-custom">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center max-w-4xl mx-auto">
            <span className="text-yellow-500 font-semibold text-sm tracking-wider uppercase">Testimonials</span>
            <h2 className={`text-3xl md:text-4xl font-bold mt-3 mb-12 ${isDark ? 'text-white' : 'text-gray-900'
              }`}>
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
                  className={`rounded-xl p-6 text-left border shadow-md transition-colors duration-150 ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-100'
                    }`}
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