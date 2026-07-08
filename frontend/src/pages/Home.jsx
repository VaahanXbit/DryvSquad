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

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import SearchBar from '../components/SearchBar'
import Carousel from '../components/Carousel'
import CarouselCard from '../components/CarouselCard'
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
      const [logs, arts] = await Promise.all([
        getFeaturedTravelogues(8),
        getFeaturedArticles(8)
      ])
      setTravelogues(logs)
      setFeaturedArticles(arts)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching homepage data:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
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
      }, 12000) // 10 seconds
      return () => clearInterval(interval)
    }, [])

    const goToSlide = (index) => {
      setCurrentSlide(index)
    }

    return (
      <section
        className="relative w-full overflow-hidden bg-transparent pt-[var(--header-height,72px)] lg:pt-0"
      >
        <style>{`
        .ds-hero-box { aspect-ratio: 4 / 5; }
        @media (min-width: 1024px) {
          .ds-hero-box { aspect-ratio: 1672 / 941; }
        }
        .ds-hero-media {
          width: 100% !important;
          height: 100% !important;
          object-fit: contain !important;
          object-position: center !important;
          display: block !important;
        }
      `}</style>
        <div className="w-full relative aspect-[4/5] lg:aspect-[1672/941] ds-hero-box">

          {BANNERS.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
            >
              <picture>
                <source media="(max-width: 1023px)" srcSet={banner.mobileImage} />
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-contain block ds-hero-media"
                />
              </picture>

              <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gradient-to-tl from-black/55 via-black/10 to-transparent pointer-events-none"></div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: index === currentSlide ? 1 : 0, y: index === currentSlide ? 0 : 12 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="absolute bottom-2 right-2 xs:bottom-3 xs:right-3 sm:bottom-5 sm:right-5 md:bottom-8 md:right-8 z-10"
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

          {/* Left Arrow Button — moved down from the geometric center (which sat
            right on top of the poster's title/icon text) to ~64% down, which
            sits in the car-photo/road area on every banner instead of on top
            of text. Also sized down so it doesn't dominate a narrow phone
            screen. */}
          <button
            onClick={() => goToSlide((currentSlide - 1 + BANNERS.length) % BANNERS.length)}
            className="absolute left-1.5 xs:left-2 sm:left-4 md:left-6 top-[64%] -translate-y-1/2 transform z-30 w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-all duration-200 flex items-center justify-center text-black shadow-lg hover:shadow-xl hover:scale-105"
            aria-label="Previous slide"
          >
            <svg className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Right Arrow Button - same repositioning/resizing as the left one */}
          <button
            onClick={() => goToSlide((currentSlide + 1) % BANNERS.length)}
            className="absolute right-1.5 xs:right-2 sm:right-4 md:right-6 top-[64%] -translate-y-1/2 transform z-30 w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-all duration-200 flex items-center justify-center text-black shadow-lg hover:shadow-xl hover:scale-105"
            aria-label="Next slide"
          >
            <svg className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Dots — pulled up well clear of the CTA button (which sits at
          bottom-2/left-2 on mobile) so the two rows never visually merge into
          one bar the way they were before. Reverts to a small, tight offset at
          lg: since the landscape desktop banner is tall enough in real pixels
          that there's no crowding risk there. */}
        <div className="flex justify-center items-center gap-1 xs:gap-1.5 sm:gap-2 md:gap-2.5 absolute bottom-10 xs:bottom-12 sm:bottom-14 md:bottom-16 lg:bottom-6 left-0 right-0 z-20">
          {BANNERS.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className="flex items-center justify-center !bg-transparent !min-h-0 px-0.5 xs:px-1 sm:px-1.5"
              aria-label={`Go to slide ${index + 1}`}
            >
              <span
                className={`block rounded-full transition-all duration-300 ${index === currentSlide
                  ? 'bg-yellow-500'
                  : 'bg-white/40'
                  } ${index === currentSlide
                    ? 'w-2 h-0.5 xs:w-3 xs:h-0.5 sm:w-5 sm:h-1 md:w-7 md:h-1.5 lg:w-9 lg:h-2'
                    : 'w-0.5 h-0.5 xs:w-1 xs:h-0.5 sm:w-1.5 sm:h-1 md:w-1.5 md:h-1.5 lg:w-2 lg:h-2'
                  }`}
              />
            </button>
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
      <section className="pt-8 md:pt-12 transition-colors duration-150">
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
              {/* 
               */}
            </motion.div>
          </div>
        </div>
      </section>
    )
  }

  // ========================================
  // Stats Cards - Flat, Thin, Text-based
  // ========================================
  const renderStatsCards = () => {
    return (
      <div className="container-custom mt-6 md:mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {STATS.map((stat, idx) => (
            <motion.div
              key={idx}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              className="text-center"
            >
              <div className={`text-2xl md:text-3xl lg:text-4xl font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-500'} mb-0.5`}>
                {stat.number}
              </div>
              <div className={`font-medium text-sm md:text-base ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {stat.label}
              </div>
              <div className={`text-xs md:text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
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
  const renderTravelogues = () => {
    const isTraveloguesLoading = loading;
    const hasTravelogues = travelogues && travelogues.length > 0;

    const cardShadowClass = isDark
      ? 'shadow-lg hover:shadow-2xl'
      : 'shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_60px_rgb(0,0,0,0.18)]';
    const cardBgClass = isDark ? 'bg-dark-800' : 'bg-white';

    return (
      <section className={`py-6 md:py-6 transition-colors duration-150 ${isDark ? 'bg-dark-900' : 'bg-gray-50'}`}>
        <div className="container-custom">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-wrap items-end justify-between gap-3 mb-5 md:mb-7"
          >
            <div>
              <h2 className="text-yellow-500 font-bold text-xl md:text-base tracking-wider uppercase">
                Travelogue
              </h2>
              <h4 className={`text-l md:text-l font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Real Journeys Experiences.
              </h4>
            </div>
            <Link
              to="/travelogues"
              className={`shrink-0 ml-auto text-sm font-medium hover:text-yellow-500 transition-colors duration-150 ${isDark ? 'text-gray-400 hover:text-yellow-400' : 'text-gray-500 hover:text-yellow-600'}`}
            >
              View All →
            </Link>
          </motion.div>

          {isTraveloguesLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500"></div>
            </div>
          ) : !hasTravelogues ? (
            <div className={`rounded-xl p-8 text-center ${cardBgClass} ${cardShadowClass}`}>
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>No travelogues available</p>
            </div>
          ) : (
            <Carousel ariaLabel="Travel Logs">
              {travelogues.slice(0, 8).map((log, idx) => (
                <CarouselCard
                  key={log._id || idx}
                  to={`/travelogue/${log.slug}`}
                  image={log.thumbnail || log.image || '/images/travelogue/default.png'}
                  fallbackImage="/images/travelogue/default.png"
                  category={log.category || 'Travel'}
                  readTime={log.readTime}
                  title={log.title}
                  excerpt={log.excerpt}
                  isDark={isDark}
                  cardBgClass={cardBgClass}
                  cardShadowClass={cardShadowClass}
                  delay={idx * 0.06}
                />
              ))}
            </Carousel>
          )}
        </div>
      </section>
    )
  }

  const renderTechnologyGuides = () => {
    const isArticlesLoading = loading;
    const hasArticles = featuredArticles && featuredArticles.length > 0;

    const cardShadowClass = isDark
      ? 'shadow-lg hover:shadow-2xl'
      : 'shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_60px_rgb(0,0,0,0.18)]';
    const cardBgClass = isDark ? 'bg-dark-800' : 'bg-white';

    return (
      <section className={`py-4 md:py-4 border-t transition-colors duration-150 ${isDark ? 'bg-dark-900 border-dark-700' : 'bg-gray-50 border-gray-200'}`}>
        <div className="container-custom">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-wrap items-end justify-between gap-3 mb-5 md:mb-7"
          >
            <div>
              <span className="text-yellow-500 font-bold text-xl md:text-base tracking-wider uppercase">
                Automotive Insights Hub
              </span>
              <h4 className={`text-2xl md:text-l font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Featured Technology Guides
              </h4>
            </div>
            <Link
              to="/articles"
              className={`shrink-0 ml-auto text-sm font-medium hover:text-yellow-500 transition-colors duration-150 ${isDark ? 'text-gray-400 hover:text-yellow-400' : 'text-gray-500 hover:text-yellow-600'}`}
            >
              View All →
            </Link>
          </motion.div>

          {isArticlesLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500"></div>
            </div>
          ) : !hasArticles ? (
            <div className={`rounded-xl p-8 text-center ${cardBgClass} ${cardShadowClass}`}>
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>No articles available</p>
            </div>
          ) : (
            <Carousel ariaLabel="Technology Guides">
              {featuredArticles.slice(0, 8).map((article, idx) => (
                <CarouselCard
                  key={article._id || idx}
                  to={`/article/${article.slug}`}
                  image={article.image || '/images/article/default.png'}
                  fallbackImage="/images/article/default.png"
                  category={article.category}
                  readTime={article.readTime}
                  title={article.title}
                  excerpt={article.excerpt}
                  ctaLabel="Read Article →"
                  isDark={isDark}
                  cardBgClass={cardBgClass}
                  cardShadowClass={cardShadowClass}
                  delay={idx * 0.06}
                />
              ))}
            </Carousel>
          )}
        </div>
      </section>
    )
  }

  // ========================================
  // Newsletter Section
  // ========================================
  const renderNewsletter = () => {
    return (
      <section className={`py-14 md:py-20 transition-colors duration-150 ${isDark ? 'bg-dark-800' : 'bg-gray-50'}`}>
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

      <section className={`transition-colors duration-150 border-b ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-gray-50 border-gray-100'} pb-6 md:pb-10`}>
        {renderSearchSection()}
        {renderStatsCards()}
      </section>

      {/* Travel Logs — horizontal carousel */}
      {renderTravelogues()}

      {/* Technology Guides — horizontal carousel */}
      {renderTechnologyGuides()}

      {/* Testimonials Section */}
      <section className={`py-4 md:py-4 transition-colors duration-150 ${isDark ? 'bg-dark-900' : 'bg-gray-50'}`}>
        <div className="container-custom">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center max-w-4xl mx-auto">
            <span className="text-yellow-500 font-bold text-xl tracking-wider uppercase">Testimonials</span>
            <h2 className={`text-3xl md:text-4xl font-bold mt-3 mb-10 md:mb-12 ${isDark ? 'text-white' : 'text-gray-900'}`}>
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