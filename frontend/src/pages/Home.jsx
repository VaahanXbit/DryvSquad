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

import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import SearchBar from '../components/SearchBar'
import Carousel from '../components/Carousel'
import CarouselCard from '../components/CarouselCard'
import HeroSlider from '../components/HeroSlider'
import { getAllTravelogues } from '../data/traveloguesData'
import { getHomeCategories } from '../data/articlesData'
import { getActiveHeroBanners } from '../data/heroBannersData'
import { SkeletonStyles, CarouselSkeleton, FadeIn } from '../components/skeletons/Skeletons'

// ========================================
// STATIC DATA
// ========================================

// Hero banners come from the backend (/api/hero-banners) via
// fetchHomeData below — this array is ONLY a fallback, used if that fetch
// is still in flight, fails, or the backend has no banners published yet,
// so the Hero never renders blank. Once real banners load, these are
// replaced entirely.
const FALLBACK_BANNERS = [
  {
    id: 'fallback-1',
    desktopImage: "/Hero1-new.png",
    mobileImage: "/Hero1-mobile.png",
    buttonLink: "/ai-car-finder",
    buttonText: "Launch Car Finder →"
  },
  {
    id: 'fallback-2',
    desktopImage: "/Hero2-new.png",
    mobileImage: "/Hero2-mobile.png",
    buttonLink: "/ai-mode",
    buttonText: "Ask AI Advisor →"
  },
  {
    id: 'fallback-3',
    desktopImage: "/Hero3-new.png",
    mobileImage: "/Hero3-mobile2.png",
    buttonLink: "/articles",
    buttonText: "Explore Articles →"
  },
  {
    id: 'fallback-4',
    desktopImage: "/Hero4-new.png",
    mobileImage: "/Hero1-mobile.png",
    buttonLink: "/compare-cars",
    buttonText: "Compare Cars →"
  },
  {
    id: 'fallback-5',
    desktopImage: "/Hero5-new.png",
    mobileImage: "/Hero2-mobile.png",
    buttonLink: "/travelogues",
    buttonText: "Read Travel Stories →"
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
  {
    quote: "The detailed explanations of ADAS features helped me understand exactly what to look for.",
    name: "Rahul Mehta",
    role: "New Car Buyer"
  },
  {
    quote: "Finally a platform that explains EV battery technology in simple terms.",
    name: "Priya Singh",
    role: "EV Owner"
  },
  {
    quote: "As a first-time car buyer, I was overwhelmed by all the technical jargon. Vaahan made it clear.",
    name: "Amit Sharma",
    role: "First Time Buyer"
  },
  {
    quote: "The comparison guides and buying advice saved me weeks of research. I finally chose the right car with confidence.",
    name: "Sneha Verma",
    role: "Working Professional"
  }
]

// ========================================
// HOMEPAGE SECTION THRESHOLDS
// How many published items a section needs before it's shown, and how many
// cards it displays once it qualifies. Lowered for now to match current
// content volume (5 travelogues total; smallest live article category —
// Feature Reviews — has 7). Bump these back up (e.g. to 8) once there's
// more published content in each category; nothing else needs to change.
// ========================================
const TRAVELOGUE_MIN_COUNT = 5
const TRAVELOGUE_DISPLAY_COUNT = 5
const ARTICLE_CATEGORY_MIN_COUNT = 7
const ARTICLE_CATEGORY_DISPLAY_COUNT = 7

// ========================================
// ANIMATED COUNTER COMPONENT - FIXED
// ========================================

const AnimatedCounter = ({ target, suffix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!isVisible) return

    // Parse the target number (remove any non-numeric characters like '+')
    const numericTarget = parseFloat(target.toString().replace(/[^0-9.]/g, ''))
    if (isNaN(numericTarget)) {
      setCount(target)
      return
    }

    let startTime = null
    const startValue = 0
    const endValue = numericTarget

    // For numbers with K (thousands), we want to count up to the actual number
    // e.g., 10K -> 10000
    let finalValue = endValue
    if (target.includes('K')) {
      finalValue = endValue * 1000
    }

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)

      // Easing function for smoother animation (ease out)
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentValue = Math.floor(easeOutQuart * finalValue)

      // Format the number with K or + suffix
      let displayValue = currentValue
      if (target.includes('K') && currentValue >= 1000) {
        // Fix: Only show decimal if not a whole number
        const kValue = currentValue / 1000
        if (kValue % 1 === 0) {
          displayValue = Math.floor(kValue) + 'K'
        } else {
          displayValue = kValue.toFixed(1) + 'K'
        }
      } else if (target.includes('+')) {
        displayValue = currentValue + '+'
      } else {
        displayValue = currentValue
      }

      setCount(displayValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        // Final value with proper formatting
        let finalDisplay = finalValue
        if (target.includes('K') && finalValue >= 1000) {
          const kFinal = finalValue / 1000
          if (kFinal % 1 === 0) {
            finalDisplay = Math.floor(kFinal) + 'K'
          } else {
            finalDisplay = kFinal.toFixed(1) + 'K'
          }
        } else if (target.includes('+')) {
          finalDisplay = finalValue + '+'
        }
        setCount(finalDisplay)
      }
    }

    requestAnimationFrame(animate)
  }, [isVisible, target, duration])

  return <span ref={ref}>{isVisible ? count : '0'}</span>
}

// ========================================
// HOME COMPONENT - Functional with Hooks
// ========================================

const Home = () => {
  const { isDark } = useTheme()
  const navigate = useNavigate()
  // Every homepage carousel section (Travelogue, Tech Insights, Buying
  // Guide, ...) lives in this single array. Nothing about a category is
  // hardcoded — sections are built entirely from what the backend returns.
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)

  // Hero banners — fetched independently of the carousel sections above so
  // a slow/failed Hero fetch can never delay or break the rest of the page,
  // and vice versa.
  const [heroBanners, setHeroBanners] = useState([])

  useEffect(() => {
    getActiveHeroBanners()
      .then(setHeroBanners)
      .catch((error) => {
        console.error('Error fetching hero banners:', error)
        setHeroBanners([])
      })
  }, [])

  // ========================================
  // Fetch homepage sections on component mount
  // ========================================
  const fetchHomeData = async () => {
    try {
      const [travelogues, categorySections] = await Promise.all([
        // Already returns published travelogues sorted newest-first.
        getAllTravelogues(),
        // Grouped article categories: only those with >= ARTICLE_CATEGORY_MIN_COUNT
        // published articles, latest ARTICLE_CATEGORY_DISPLAY_COUNT each, newest first.
        getHomeCategories(ARTICLE_CATEGORY_MIN_COUNT, ARTICLE_CATEGORY_DISPLAY_COUNT),
      ])

      const builtSections = []

      // Travelogues live in their own collection with their own detail
      // route (/travelogue/:slug vs /article/:slug), so they can't come
      // back from the /api/home/categories endpoint — but they still go
      // through the exact same "min count, latest N" rule and the exact
      // same generic carousel renderer as every other section below.
      if (Array.isArray(travelogues) && travelogues.length >= TRAVELOGUE_MIN_COUNT) {
        builtSections.push({
          key: 'travelogue',
          heading: 'Travelogue',
          subheading: 'Real Journeys Experiences.',
          ariaLabel: 'Travel Logs',
          viewAllLink: '/travelogues',
          linkPrefix: '/travelogue',
          fallbackImage: '/images/travelogue/default.png',
          items: travelogues.slice(0, TRAVELOGUE_DISPLAY_COUNT),
        })
      }

      // One section per qualifying article category. New categories show
      // up automatically once they cross ARTICLE_CATEGORY_MIN_COUNT published
      // articles, and drop off automatically if they fall back below that.
      // "View All" points to the existing /articles page (not /category/:id —
      // that route isn't resolving category names on this build).
      if (Array.isArray(categorySections)) {
        categorySections.forEach((group) => {
          builtSections.push({
            key: group.category,
            heading: group.category,
            subheading: `Latest in ${group.category}.`,
            ariaLabel: group.category,
            viewAllLink: '/articles',
            linkPrefix: '/article',
            fallbackImage: '/images/article/default.png',
            items: group.articles,
          })
        })
      }

      setSections(builtSections)
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
  // Stats Cards - With Animated Counter
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
              transition={{ delay: idx * 0.10 }}
              className="text-center"
            >
              <div className={`text-2xl md:text-3xl lg:text-4xl font-bold ${isDark ? 'text-yellow-500' : 'text-yellow-500'} mb-0.5`}>
                <AnimatedCounter target={stat.number} duration={2000 + idx * 300} />
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
  // GENERIC CATEGORY CAROUSEL SECTION
  // Renders ANY homepage section — Travelogue, Tech Insights, Buying Guide,
  // EV Guide, or any future category — from a single `section` object.
  // No category name is ever hardcoded here; Home just loops through
  // `sections` and calls this once per entry. Carousel / CarouselCard are
  // reused exactly as-is.
  // ========================================
  const renderCategorySection = (section, index) => {
    const hasItems = section.items && section.items.length > 0

    const cardShadowClass = isDark
      ? 'shadow-lg hover:shadow-2xl'
      : 'shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_60px_rgb(0,0,0,0.18)]';
    const cardBgClass = isDark ? 'bg-dark-800' : 'bg-white';

    return (
      <section
  key={section.key}
  className={`py-3 md:py-6 transition-colors duration-150 ${
    index > 0 ? 'border-t' : ''
  } ${isDark ? 'bg-dark-900 border-dark-700' : 'bg-gray-50 border-gray-200'}`}
>
        <div className="container-custom">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-wrap items-end justify-between gap-3 mb-3 md:mb-7"
          >
            <div>
              <h2
  className={`text-xl xs:text-2xl sm:text-2xl md:text-3xl font-bold mt-1 md:mt-3 ${isDark ? 'text-yellow-500' : 'text-gray-900'}`}>
                {section.heading}
              </h2>
              <p
  className={`text-xs xs:text-sm sm:text-sm md:text-base font-medium mt-0.5 md:mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {section.subheading}
              </p>
            </div>
            <Link
              to={section.viewAllLink}
              className={`shrink-0 ml-auto text-sm font-medium hover:text-yellow-500 transition-colors duration-150 ${isDark ? 'text-gray-400 hover:text-yellow-400' : 'text-gray-500 hover:text-yellow-600'}`}
            >
              View All →
            </Link>
          </motion.div>

          {!hasItems ? (
            <div className={`rounded-xl p-8 text-center ${cardBgClass} ${cardShadowClass}`}>
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>No {section.heading.toLowerCase()} available</p>
            </div>
          ) : (
            <FadeIn>
              <Carousel ariaLabel={section.ariaLabel}>
                {section.items.map((item, idx) => (
                  <CarouselCard
                    key={item._id || idx}
                    to={`${section.linkPrefix}/${item.slug}`}
                    image={item.thumbnail || item.image || section.fallbackImage}
                    fallbackImage={section.fallbackImage}
                    category={item.category || section.heading}
                    readTime={item.readTime}
                    title={item.title}
                    excerpt={item.excerpt}
                    isDark={isDark}
                    cardBgClass={cardBgClass}
                    cardShadowClass={cardShadowClass}
                    delay={idx * 0.06}
                  />
                ))}
              </Carousel>
            </FadeIn>
          )}
        </div>
      </section>
    )
  }

  // Skeleton placeholder shown while the section list itself is still
  // loading (before we even know which/how many categories qualify).
  const renderSkeletonSection = (index) => (
    <section
      key={`skeleton-${index}`}
      className={`pt-3 pb-4 md:py-6 transition-colors duration-150 ${index > 0 ? 'border-t' : ''} ${isDark ? 'bg-dark-900 border-dark-700' : 'bg-gray-50 border-gray-200'}`}
    >
      <div className="container-custom">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-5 md:mb-7">
          <div>
            <div className={`h-7 w-40 rounded animate-pulse ${isDark ? 'bg-dark-700' : 'bg-gray-200'}`} />
            <div className={`h-4 w-56 rounded mt-2 animate-pulse ${isDark ? 'bg-dark-700' : 'bg-gray-200'}`} />
          </div>
        </div>
        <CarouselSkeleton count={4} isDark={isDark} />
      </div>
    </section>
  )

  const renderTestimonials = () => {
    const cardShadowClass = isDark
      ? 'shadow-lg hover:shadow-2xl'
      : 'shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_60px_rgb(0,0,0,0.18)]';
    const cardBgClass = isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-100'

    return (
      <section className={`py-4 md:py-4 transition-colors duration-150 ${isDark ? 'bg-dark-900' : 'bg-gray-50'}`}>
        <div className="container-custom">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto mb-8 md:mb-10"
          >
            <span className="text-yellow-500 font-bold text-xl tracking-wider uppercase">Testimonials</span>
            <h2 className={`text-3xl md:text-xl font-bold mt-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              What Our Readers Say
            </h2>
          </motion.div>

          <Carousel ariaLabel="Testimonials">
            {TESTIMONIALS.map((testimonial, idx) => (
              <div
                key={idx}
                className={`flex-shrink-0 flex flex-col justify-center w-[62vw] xs:w-[54vw] sm:w-[240px] md:w-[260px] lg:w-[280px] min-h-[360px] sm:min-h-[380px] md:min-h-[400px] rounded-xl p-6 text-left border select-none cursor-default ${cardShadowClass} transition-shadow duration-300 ease-out ${cardBgClass}`}
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
              </div>
            ))}
          </Carousel>
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
      <SkeletonStyles />
      {/* Hero Section — banner data comes from the backend
          (/api/hero-banners). FALLBACK_BANNERS only covers the gap while
          that fetch is in flight, fails, or the backend has no banners
          published yet — real backend data always takes priority the
          moment it's available. Markup, animation, timing, arrows, and
          dots are all unchanged: this is the exact same Hero, just fed
          dynamic data via HeroSlider. */}
      <HeroSlider banners={heroBanners.length > 0 ? heroBanners : FALLBACK_BANNERS} />


      <section className={`transition-colors duration-150 border-b ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-gray-50 border-gray-100'} pt-6 pb-6 md:pb-10`}>
        {/* {renderSearchSection()} */}
        {renderStatsCards()}
      </section>

      {/* Dynamic category carousels — Travelogue, Tech Insights, Buying
          Guide, EV Guide, or any future category with >= 8 published
          articles. Fully generated from `sections`; nothing here is
          category-specific. */}
      {loading
        ? [0, 1].map((idx) => renderSkeletonSection(idx))
        : sections.map((section, idx) => renderCategorySection(section, idx))}

      {/* Testimonials Section — same horizontal Carousel component as
          the category sections above, so mobile scrolling (native
          swipe, arrows, no per-card fade delay) matches exactly. */}
      {renderTestimonials()}

      {renderNewsletter()}
    </>
  )
}

export default Home
