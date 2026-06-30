// src/components/CommonHeader.jsx
/*
================================================================================
File Name : CommonHeader.jsx
Author : Tahseen Raza
Created Date : 2025-01-15
Description : Optimized header component with AuthModal integration
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ThemeToggle from './ThemeToggle'
import AuthModal from './AuthModal'
import { useTheme } from '../context/ThemeContext'
import { api } from '../services/api'

// Static category data
const DESKTOP_CATEGORIES = [
  {
    name: "Feature Reviews",
    baseRoute: "/article",
    articles: [
      { title: "AWD vs FWD: The ₹2 Lakh Question", slug: "awd-vs-fwd" },
      { title: "ADAS Lane Keep Assist Review", slug: "adas-lane-keep-assist" },
      { title: "FWD Car in Spiti Winter", slug: "fwd-car-spiti-winter" },
      { title: "Best Tyres for Highway Drives", slug: "best-highway-tyres" }
    ]
  },
  {
    name: "New Launches",
    baseRoute: "/article",
    articles: [
      { title: "2026 Hyundai Creta Launch", slug: "hyundai-creta-2026-launch" },
      { title: "New Kia Seltos 2026", slug: "kia-seltos-2026" }
    ]
  },
  {
    name: "Tech Insights",
    baseRoute: "/article",
    articles: [
      { title: "What is ADAS? Complete Guide", slug: "what-is-adas" },
      { title: "What is ABS? How It Works", slug: "what-is-abs" },
      { title: "What is EBD? Explained", slug: "what-is-ebd" },
      { title: "What is ESC? Stability Control", slug: "what-is-esc" }
    ]
  },
  {
    name: "Travelogues",
    baseRoute: "/travelogue",
    articles: [
      { title: "First Job: Bike vs Car?", slug: "first-job-bike-vs-car" },
      { title: "Sedan vs SUV vs Hatchback", slug: "first-car-sedan-vs-suv-vs-hatchback" },
      { title: "Renting vs Buying a Car", slug: "renting-vs-buying-car-true-cost" },
      { title: "First Long Drive Tips", slug: "first-long-drive-beginner-tips" }
    ]
  }
]

const MOBILE_CATEGORIES = [
  { name: "Compare Cars", path: "/compare-cars", isDirect: true },
  ...DESKTOP_CATEGORIES
]

const NAV_LINKS = [
  { path: '/', name: 'Home' },
  { path: '/about', name: 'About' },
  { path: '/contact', name: 'Contact' },
]

const CommonHeader = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const [activeMobileCategory, setActiveMobileCategory] = useState(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const location = useLocation()
  const { isDark } = useTheme()

  // ✅ NEW: State for hiding header when sticky comparison appears
  const [hideHeader, setHideHeader] = useState(false)

  // User authentication state
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Refs for the login buttons
  const desktopLoginRef = useRef(null)
  const mobileLoginRef = useRef(null)
  const [activeTriggerRef, setActiveTriggerRef] = useState(null)

  // Dropdown ref for click outside
  const dropdownRef = useRef(null)

  // Memoized values
  const brandColor = useMemo(() => isDark ? '#0f172a' : '#CFB32B', [isDark])

  // ✅ NEW: Listen for sticky header visibility events
  useEffect(() => {
    const handleStickyVisibility = (event) => {
      setHideHeader(event.detail.visible)
    }

    window.addEventListener('stickyHeaderVisibility', handleStickyVisibility)
    return () => window.removeEventListener('stickyHeaderVisibility', handleStickyVisibility)
  }, [])

  // ✅ NEW: Also check scroll directly as fallback
  useEffect(() => {
    const checkStickyHeader = () => {
      const stickyHeader = document.getElementById('sticky-comparison-header')
      if (stickyHeader) {
        const rect = stickyHeader.getBoundingClientRect()
        const shouldHide = rect.top <= 0 && rect.bottom > 0
        setHideHeader(shouldHide)
      }
    }

    window.addEventListener('scroll', checkStickyHeader, { passive: true })
    return () => window.removeEventListener('scroll', checkStickyHeader)
  }, [])

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const result = await api.getCurrentUser(token)
          if (result.success) {
            setUser(result.user)
          } else {
            localStorage.removeItem('token')
          }
        } catch (error) {
          localStorage.removeItem('token')
        }
      }
      setIsLoading(false)
    }
    checkAuth()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Scroll handler
  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 20)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // Close menu on location change
  useEffect(() => {
    setIsOpen(false)
    setIsCategoriesOpen(false)
    setActiveMobileCategory(null)
    setIsDropdownOpen(false)
  }, [location.pathname])

  // Toggle functions
  const toggleMenu = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  const toggleCategories = useCallback(() => {
    setIsCategoriesOpen(prev => !prev)
    if (!isCategoriesOpen) {
      setActiveMobileCategory(null)
    }
  }, [isCategoriesOpen])

  const toggleMobileSubCategory = useCallback((categoryName) => {
    setActiveMobileCategory(prev => prev === categoryName ? null : categoryName)
  }, [])

  const closeMenu = useCallback(() => {
    setIsOpen(false)
    setIsCategoriesOpen(false)
    setActiveMobileCategory(null)
  }, [])

  // Open auth modal
  const openAuthModalDesktop = useCallback(() => {
    setActiveTriggerRef(desktopLoginRef)
    setIsAuthModalOpen(true)
  }, [])

  const openAuthModalMobile = useCallback(() => {
    setActiveTriggerRef(mobileLoginRef)
    setIsAuthModalOpen(true)
    closeMenu()
  }, [closeMenu])

  // Close auth modal and refresh user
  const closeAuthModal = useCallback(async () => {
    setIsAuthModalOpen(false)
    setTimeout(() => {
      setActiveTriggerRef(null)
    }, 500)

    const token = localStorage.getItem('token')
    if (token) {
      try {
        const result = await api.getCurrentUser(token)
        if (result.success) {
          setUser(result.user)
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      }
    }
  }, [])

  // Handle logout
  const handleLogout = useCallback(() => {
    localStorage.removeItem('token')
    setUser(null)
    setIsDropdownOpen(false)
  }, [])

  // Toggle dropdown
  const toggleDropdown = useCallback(() => {
    setIsDropdownOpen(prev => !prev)
  }, [])

  // Desktop Categories Dropdown
  const CategoriesDropdown = useCallback(() => {
    const [isCatOpen, setIsCatOpen] = useState(false)
    const [activeCat, setActiveCat] = useState(null)
    const timeoutRef = useRef(null)
    const dropdownRef = useRef(null)

    const handleMouseEnter = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      setIsCatOpen(true)
    }

    const handleMouseLeave = () => {
      timeoutRef.current = setTimeout(() => {
        setIsCatOpen(false)
        setActiveCat(null)
      }, 200)
    }

    const handleCategoryMouseEnter = (categoryName) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      setActiveCat(categoryName)
    }

    const handleCategoryMouseLeave = () => {
      timeoutRef.current = setTimeout(() => {
        setActiveCat(null)
      }, 200)
    }

    const handleSubmenuMouseEnter = (categoryName) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      setActiveCat(categoryName)
    }

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsCatOpen(false)
          setActiveCat(null)
        }
      }
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }, [])

    useEffect(() => {
      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
      }
    }, [])

    const catTextColor = isDark ? 'text-white' : 'text-gray-900'
    const catSubTextColor = isDark ? 'text-gray-400' : 'text-gray-500'
    const catHoverBg = isDark ? 'hover:bg-dark-700' : 'hover:bg-gray-100'
    const catBorderColor = isDark ? 'border-dark-700' : 'border-gray-100'
    const catBgColor = isDark ? 'bg-dark-800' : 'bg-white'
    const catHoverText = isDark ? 'hover:text-yellow-400' : 'hover:text-gray-700'

    return (
      <div
        className="relative inline-block"
        ref={dropdownRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button className={`flex items-center gap-1 font-semibold text-sm xl:text-[16px] tracking-wide transition-colors duration-300 ${catTextColor} ${catHoverText}`}>
          Categories
          <svg className={`w-3 h-3 xl:w-4 xl:h-4 transition-transform duration-150 ${isCatOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isCatOpen && (
          <div
            className={`absolute top-full left-0 mt-1 w-56 sm:w-64 md:w-72 rounded-lg shadow-xl border ${catBorderColor} z-50 ${catBgColor}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <Link
              to="/compare-cars"
              className={`flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 ${catHoverBg} transition-colors duration-200 border-b ${catBorderColor}`}
              onClick={() => setIsCatOpen(false)}
            >
              <div>
                <div className={`font-bold text-sm sm:text-base ${catTextColor}`}>Compare Cars</div>
                <div className={`text-[10px] sm:text-xs ${catSubTextColor}`}>Side by side comparison</div>
              </div>
              <span className="text-yellow-500 text-xs sm:text-sm">→</span>
            </Link>

            {DESKTOP_CATEGORIES.map((category, idx) => (
              <div
                key={idx}
                className={`relative border-b ${catBorderColor} last:border-0`}
                onMouseEnter={() => handleCategoryMouseEnter(category.name)}
                onMouseLeave={handleCategoryMouseLeave}
              >
                <div className={`flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 ${catHoverBg} cursor-pointer transition-colors duration-200`}>
                  <div>
                    <div className={`font-semibold text-sm sm:text-base ${catTextColor}`}>{category.name}</div>
                    <div className={`text-[10px] sm:text-xs ${catSubTextColor}`}>{category.articles.length} articles</div>
                  </div>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {activeCat === category.name && (
                  <div
                    className={`absolute top-0 right-full mr-0 w-56 sm:w-64 md:w-80 rounded-lg shadow-xl border ${catBorderColor} z-50 ${catBgColor}`}
                    style={{ left: 'auto', right: '100%' }}
                    onMouseEnter={() => handleSubmenuMouseEnter(category.name)}
                    onMouseLeave={handleCategoryMouseLeave}
                  >
                    <div className="py-2">
                      <div className={`px-3 sm:px-4 py-1.5 sm:py-2 ${isDark ? 'bg-dark-700' : 'bg-gray-50'} border-b ${catBorderColor}`}>
                        <span className={`font-semibold text-sm sm:text-base ${catTextColor}`}>{category.name}</span>
                        <span className={`text-[10px] sm:text-xs ${catSubTextColor} ml-2`}>({category.articles.length})</span>
                      </div>
                      {category.articles.map((article, articleIdx) => (
                        <Link
                          key={articleIdx}
                          to={`${category.baseRoute || '/article'}/${article.slug}`}
                          className={`block px-3 sm:px-4 py-1.5 sm:py-2 ${catHoverBg} transition-colors duration-200`}
                          onClick={() => setIsCatOpen(false)}
                        >
                          <span className={`text-xs sm:text-sm ${catTextColor} ${catHoverText}`}>
                            {article.title}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }, [isDark])

  // Consistent text classes
  const navLinkClasses = `font-semibold text-sm xl:text-[16px] tracking-wide transition-colors duration-300`
  const navLinkActiveClasses = isDark
    ? 'text-yellow-400 border-b-2 border-yellow-400 pb-1'
    : 'text-gray-900 border-b-2 border-gray-900 pb-1'
  const navLinkInactiveClasses = isDark ? 'text-white hover:text-yellow-400' : 'text-gray-900 hover:text-gray-700'

  const mobileNavLinkClasses = `block py-2 font-medium text-base sm:text-lg transition-colors duration-300`
  const mobileNavLinkActiveClasses = isDark ? 'text-yellow-400' : 'text-gray-900 font-bold'
  const mobileNavLinkInactiveClasses = isDark ? 'text-white hover:text-yellow-400' : 'text-gray-900 hover:text-gray-700'

  const getUserInitials = () => {
    if (!user) return '?'
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    }
    if (user.firstName) {
      return user.firstName[0].toUpperCase()
    }
    if (user.email) {
      return user.email[0].toUpperCase()
    }
    return '?'
  }

  const getUserName = () => {
    if (!user) return 'User'
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    if (user.firstName) {
      return user.firstName
    }
    if (user.username) {
      return user.username
    }
    return user.email?.split('@')[0] || 'User'
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          hideHeader ? 'opacity-0 -translate-y-full pointer-events-none' : 'opacity-100 translate-y-0'
        }`}
        style={{
          backgroundColor: brandColor,
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
          paddingTop: isScrolled ? '0.5rem' : '0.75rem',
          paddingBottom: isScrolled ? '0.5rem' : '0.75rem',
          boxShadow: isScrolled ? '0 4px 20px rgba(0,0,0,0.15)' : 'none'
        }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center group flex-shrink-0">
              <img
                src="/Vaahan_International_Logo1.jpg"
                alt="Vaahan International"
                className="h-12 sm:h-14 md:h-16 lg:h-20 w-auto object-contain transition-transform duration-150 group-hover:scale-105"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-4 xl:space-x-6 2xl:space-x-8">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) => {
                    return `${navLinkClasses} ${isActive ? navLinkActiveClasses : navLinkInactiveClasses}`
                  }}
                >
                  {link.name}
                </NavLink>
              ))}

              <CategoriesDropdown />

              {!isLoading && (
                user ? (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={toggleDropdown}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors duration-300`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300 ${isDark
                        ? 'bg-yellow-500 text-gray-900'
                        : 'bg-gray-900 text-white'
                        }`}>
                        {getUserInitials()}
                      </div>
                      <svg className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''} ${isDark ? 'text-gray-400' : 'text-gray-600'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {isDropdownOpen && (
                      <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border py-2 ${isDark
                        ? 'bg-dark-800 border-dark-700'
                        : 'bg-white border-gray-200'
                        }`}>
                        <Link
                          to="/profile"
                          className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-200 ${isDark
                            ? 'text-gray-300 hover:bg-dark-700'
                            : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          My Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className={`flex items-center gap-3 px-4 py-2.5 text-sm w-full text-left transition-colors duration-200 ${isDark
                            ? 'text-red-400 hover:bg-dark-700'
                            : 'text-red-600 hover:bg-gray-100'
                            }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    ref={desktopLoginRef}
                    onClick={openAuthModalDesktop}
                    className={`${navLinkClasses} ${navLinkInactiveClasses}`}
                  >
                    Login / Register
                  </button>
                )
              )}

              <Link
                to="/contact"
                className="
                  bg-[#0B1F3A]
                  hover:bg-[#08172C]
                  text-white
                  font-semibold
                  py-1.5 px-3 xl:py-2 xl:px-4 2xl:py-2.5 2xl:px-6
                  rounded-lg xl:rounded-xl
                  shadow-lg
                  transition-all
                  duration-150
                  hover:-translate-y-1
                  text-xs xl:text-sm 2xl:text-base
                "
              >
                Get Started
              </Link>

              <ThemeToggle />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="lg:hidden focus:outline-none flex-shrink-0 p-1 ml-2"
              aria-label="Toggle Menu"
            >
              <div className="w-5 sm:w-6 h-4 sm:h-5 flex flex-col justify-between">
                <span
                  className={`h-0.5 w-full bg-current transition-all duration-150 ${isOpen ? 'rotate-45 translate-y-1.5 sm:translate-y-2' : ''
                    }`}
                />
                <span
                  className={`h-0.5 w-full bg-current transition-all duration-150 ${isOpen ? 'opacity-0' : ''
                    }`}
                />
                <span
                  className={`h-0.5 w-full bg-current transition-all duration-150 ${isOpen ? '-rotate-45 -translate-y-1.5 sm:-translate-y-2' : ''
                    }`}
                />
              </div>
            </button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden lg:hidden"
              >
                <div className="pt-3 pb-4 space-y-1.5">
                  {NAV_LINKS.map((link) => (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      className={({ isActive }) => {
                        return `${mobileNavLinkClasses} ${isActive ? mobileNavLinkActiveClasses : mobileNavLinkInactiveClasses}`
                      }}
                      onClick={closeMenu}
                    >
                      {link.name}
                    </NavLink>
                  ))}

                  {!isLoading && (
                    user ? (
                      <>
                        <div className={`px-3 py-2 ${mobileNavLinkClasses} ${mobileNavLinkInactiveClasses}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isDark
                                ? 'bg-yellow-500 text-gray-900'
                                : 'bg-gray-900 text-white'
                              }`}>
                              {getUserInitials()}
                            </div>
                          </div>
                        </div>
                        <Link
                          to="/profile"
                          className={`${mobileNavLinkClasses} ${mobileNavLinkInactiveClasses}`}
                          onClick={closeMenu}
                        >
                          <div className="flex items-center gap-3">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            My Profile
                          </div>
                        </Link>
                        <button
                          onClick={() => {
                            handleLogout()
                            closeMenu()
                          }}
                          className={`${mobileNavLinkClasses} ${isDark ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'}`}
                        >
                          <div className="flex items-center gap-3">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                          </div>
                        </button>
                      </>
                    ) : (
                      <button
                        ref={mobileLoginRef}
                        onClick={openAuthModalMobile}
                        className={`${mobileNavLinkClasses} ${mobileNavLinkInactiveClasses}`}
                      >
                        Login / Register
                      </button>
                    )
                  )}

                  <div className="py-1">
                    <button
                      onClick={toggleCategories}
                      className={`w-full flex items-center justify-between py-2 font-medium text-base sm:text-lg transition-colors duration-300 ${isDark ? 'text-white hover:text-yellow-400' : 'text-gray-900 hover:text-gray-700'}`}
                    >
                      <span>Categories</span>
                      <svg
                        className={`w-4 h-4 transition-transform duration-150 ${isCategoriesOpen ? 'rotate-180' : ''
                          }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    <AnimatePresence>
                      {isCategoriesOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="overflow-hidden"
                        >
                          <div className="ml-2 sm:ml-4 space-y-1 pt-1 pb-2">
                            {MOBILE_CATEGORIES.map((item, idx) => {
                              if (item.isDirect) {
                                return (
                                  <Link
                                    key={idx}
                                    to={item.path}
                                    className={`block py-2 text-sm sm:text-base transition-colors duration-300 pl-2 border-l-2 border-transparent hover:border-gray-400 ${isDark ? 'text-white hover:text-yellow-400' : 'text-gray-900 hover:text-gray-700'}`}
                                    onClick={closeMenu}
                                  >
                                    {item.name}
                                  </Link>
                                )
                              }

                              const isActive = activeMobileCategory === item.name
                              return (
                                <div key={idx} className="space-y-1">
                                  <button
                                    onClick={() => toggleMobileSubCategory(item.name)}
                                    className={`w-full flex items-center justify-between py-2 text-sm sm:text-base transition-colors duration-300 pl-2 border-l-2 border-transparent hover:border-gray-400 ${isDark ? 'text-white hover:text-yellow-400' : 'text-gray-900 hover:text-gray-700'}`}
                                  >
                                    <span>{item.name}</span>
                                    <svg
                                      className={`w-3 h-3 transition-transform duration-150 ${isActive ? 'rotate-90' : ''
                                        }`}
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </button>

                                  <AnimatePresence>
                                    {isActive && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                        className="overflow-hidden"
                                      >
                                        <div className="ml-4 sm:ml-6 space-y-1 pb-1">
                                          {item.articles.map((article, articleIdx) => (
                                            <Link
                                              key={articleIdx}
                                              to={`${item.baseRoute || '/article'}/${article.slug}`}
                                              className={`block py-1.5 text-xs sm:text-sm transition-colors duration-300 pl-2 border-l-2 border-transparent hover:border-gray-400 ${isDark ? 'text-white hover:text-yellow-400' : 'text-gray-900 hover:text-gray-700'}`}
                                              onClick={closeMenu}
                                            >
                                              {article.title}
                                            </Link>
                                          ))}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              )
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex items-center justify-between pt-2 mt-1 border-t border-gray-200 dark:border-dark-700">
                    <ThemeToggle />
                  </div>

                  <Link
                    to="/contact"
                    className="
                      block
                      text-center
                      bg-[#0B1F3A]
                      hover:bg-[#08172C]
                      text-white
                      font-semibold
                      py-2.5
                      rounded-xl
                      transition-all
                      duration-150
                      text-base
                      mt-2
                    "
                    onClick={closeMenu}
                  >
                    Get Started
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        triggerRef={activeTriggerRef}
      />
    </>
  )
}

export default CommonHeader