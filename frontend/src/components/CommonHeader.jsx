// src/components/CommonHeader.jsx
/*
================================================================================
File Name : CommonHeader.jsx
Author : Tahseen Raza
Created Date : 2025-01-15
Description : Optimized header component with AuthModal integration, dynamic logo,
              functional SearchBar, and CarDekho style two-row premium layout.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ThemeToggle from './ThemeToggle'
import AuthModal from './AuthModal'
import LocationBadge from './location/LocationBadge'
import SearchBar from './SearchBar' // Integrated functional SearchBar
import { useTheme } from '../context/ThemeContext'
import { api } from '../services/api'

// Static category data
const DESKTOP_CATEGORIES = [
  {
    name: "New Launches",
    path: "/articles",
    baseRoute: "/article",
    articles: [
      { title: "2026 Hyundai Creta Launch", slug: "hyundai-creta-2026-launch" },
      { title: "New Kia Seltos 2026", slug: "kia-seltos-2026" }
    ]
  },
  {
    name: "Tech Insights",
    path: "/articles",
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
    path: "/travelogues",
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
  { name: "Compare Cars", path: "/compare-cars" },
  ...DESKTOP_CATEGORIES.map(({ name, path }) => ({ name, path }))
]

// Updated to match the specific CarDekho layout links
const NAV_LINKS = [
  // { path: '/', name: 'New Cars' },
  // { path: '/compare-cars', name: 'Compare Cars' },
  // { path: '/articles', name: 'Articles' },
  // { path: '/travelogues', name: 'Travelogues' },
  { path: '/about', name: 'About' },
  { path: '/contact', name: 'Contact' },
]

const CommonHeader = () => {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const location = useLocation()
  const { isDark } = useTheme()

  // State for hiding header when sticky comparison appears
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

  // Ref to the <nav> element itself — used to publish its real, live rendered
  // height as a CSS variable so other components can clear it.
  const navRef = useRef(null)

  // Memoized values
  const brandColor = useMemo(() => isDark ? '#000000' : '#ffffff', [isDark])

  // Publish the nav's real, live rendered height as a CSS variable on <html>.
  useEffect(() => {
    const el = navRef.current
    if (!el) return

    const publishHeight = () => {
      document.documentElement.style.setProperty('--header-height', `${el.offsetHeight}px`)
    }

    publishHeight()

    const resizeObserver = new ResizeObserver(publishHeight)
    resizeObserver.observe(el)
    window.addEventListener('resize', publishHeight)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', publishHeight)
    }
  }, [isScrolled])

  // Listen for sticky header visibility events
  useEffect(() => {
    const handleStickyVisibility = (event) => {
      setHideHeader(event.detail.visible)
    }

    window.addEventListener('stickyHeaderVisibility', handleStickyVisibility)
    return () => window.removeEventListener('stickyHeaderVisibility', handleStickyVisibility)
  }, [])

  // Also check scroll directly as fallback
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
    setIsDropdownOpen(false)
  }, [location.pathname])

  // Toggle functions
  const toggleMenu = useCallback(() => setIsOpen(prev => !prev), [])
  const toggleCategories = useCallback(() => setIsCategoriesOpen(prev => !prev), [])
  const closeMenu = useCallback(() => {
    setIsOpen(false)
    setIsCategoriesOpen(false)
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
    setTimeout(() => setActiveTriggerRef(null), 500)

    const token = localStorage.getItem('token')
    if (token) {
      try {
        const result = await api.getCurrentUser(token)
        if (result.success) setUser(result.user)
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

  const toggleDropdown = useCallback(() => setIsDropdownOpen(prev => !prev), [])

  // Desktop Categories Dropdown UI Update
  const CategoriesDropdown = useCallback(() => {
    const [isCatOpen, setIsCatOpen] = useState(false)
    const timeoutRef = useRef(null)
    const dropdownRef = useRef(null)

    const handleMouseEnter = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      setIsCatOpen(true)
    }

    const handleMouseLeave = () => {
      timeoutRef.current = setTimeout(() => setIsCatOpen(false), 200)
    }

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsCatOpen(false)
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
    const catHoverBg = isDark ? 'hover:bg-dark-700' : 'hover:bg-gray-50'
    const catBorderColor = isDark ? 'border-dark-700' : 'border-gray-100'
    const catBgColor = isDark ? 'bg-dark-800' : 'bg-white'
    
    // Active style match
    const catHoverText = 'hover:text-[#C69327]'

    return (
      <div
        className="relative inline-block h-full flex items-center"
        ref={dropdownRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button className={`flex items-center gap-1 font-semibold text-[15px] xl:text-[16px] tracking-wide transition-colors duration-200 h-full border-b-[3px] border-transparent ${catTextColor} ${catHoverText}`}>
          Categories
          <svg className={`w-3 h-3 xl:w-4 xl:h-4 transition-transform duration-200 ${isCatOpen ? 'rotate-180 text-[#C69327]' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isCatOpen && (
          <div
            className={`absolute top-[calc(100%-2px)] left-0 mt-0 w-64 rounded-xl shadow-xl border ${catBorderColor} z-50 ${catBgColor} overflow-hidden`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <Link
              to="/compare-cars"
              className={`flex items-center justify-between px-4 py-3 ${catHoverBg} transition-colors duration-200 border-b ${catBorderColor}`}
              onClick={() => setIsCatOpen(false)}
            >
              <div>
                <div className={`font-bold text-sm sm:text-base ${catTextColor}`}>Compare Cars</div>
                <div className={`text-[11px] sm:text-xs ${catSubTextColor}`}>Side by side comparison</div>
              </div>
              <span className="text-[#C69327] text-sm">→</span>
            </Link>

            {DESKTOP_CATEGORIES.map((category, idx) => (
              <Link
                key={idx}
                to={category.path}
                className={`flex items-center justify-between px-4 py-3 ${catHoverBg} transition-colors duration-200 border-b ${catBorderColor} last:border-0`}
                onClick={() => setIsCatOpen(false)}
              >
                <div>
                  <div className={`font-semibold text-sm sm:text-base ${catTextColor}`}>
                    {category.name}
                  </div>
                </div>
                <span className="text-[#C69327] text-sm opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }, [isDark])

  // Active / Inactive states matching CarDekho (Orange hover/underline)
  const navLinkClasses = `h-full flex items-center font-semibold text-[15px] xl:text-[16px] tracking-wide transition-all duration-200 border-b-[3px] pt-[3px]`
  const navLinkActiveClasses = 'text-[#C69327] border-[#C69327]'
  const navLinkInactiveClasses = isDark 
    ? 'text-white hover:text-[#C69327] border-transparent' 
    : 'text-gray-900 hover:text-[#C69327] border-transparent'

  const mobileNavLinkClasses = `block py-2.5 font-medium text-base sm:text-lg transition-colors duration-200`
  const mobileNavLinkActiveClasses = 'text-[#C69327] font-bold'
  const mobileNavLinkInactiveClasses = isDark ? 'text-white hover:text-[#C69327]' : 'text-gray-900 hover:text-[#C69327]'

  const getUserInitials = () => {
    if (!user) return '?'
    if (user.firstName && user.lastName) return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    if (user.firstName) return user.firstName[0].toUpperCase()
    if (user.email) return user.email[0].toUpperCase()
    return '?'
  }

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          hideHeader ? 'opacity-0 -translate-y-full pointer-events-none' : 'opacity-100 translate-y-0'
        }`}
        style={{
          backgroundColor: brandColor,
          boxShadow: isScrolled ? (isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 15px rgba(0,0,0,0.05)') : 'none'
        }}
      >
        {/* ===============================
            TOP ROW: Logo, Search, Actions
            =============================== */}
        <div className={`border-b ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="flex items-center justify-between h-[72px] lg:h-[80px]">
              
              {/* Logo */}
              <Link to="/" className="flex items-center group flex-shrink-0">
                <img
                  src={isDark ? "/DSLogo-Dark.png" : "/DSLogo-Light.png"}
                  alt="DryvSquad"
                  className="h-16 sm:h-[72px] lg:h-[80px] w-auto object-contain transition-transform duration-200 group-hover:scale-105"
                  style={{ maxWidth: '280px' }}
                />
              </Link>

              {/* Functional Search Bar integration with Tailwind overrides to force CarDekho layout sizing */}
              <div className="hidden lg:flex flex-1 max-w-[650px] mx-8 xl:mx-12">
                <div className="w-full relative z-[60] [&_input]:h-[48px] [&_input]:rounded-[16px] [&_input]:text-[15px] [&_input]:border-gray-200 dark:[&_input]:border-dark-600 focus-within:[&_input]:border-[#C69327] focus-within:[&_input]:ring-1 focus-within:[&_input]:ring-[#C69327]/50 transition-all duration-200">
                  <SearchBar />
                </div>
              </div>

              {/* Right Actions: Language, Wishlist, Login, Location, Theme */}
              <div className="flex items-center space-x-4 lg:space-x-5 xl:space-x-6">
                
                {/* Language UI Mock */}
                {/* <button className={`hidden lg:flex items-center gap-1.5 text-[15px] font-semibold transition-colors duration-200 ${isDark ? 'text-white hover:text-[#C69327]' : 'text-gray-900 hover:text-[#C69327]'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
                  <span>English</span>
                </button> */}

                {/* Wishlist UI Mock */}
                {/* <button className={`hidden lg:flex items-center transition-colors duration-200 ${isDark ? 'text-white hover:text-[#C69327]' : 'text-gray-900 hover:text-[#C69327]'}`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                </button> */}

                {/* Authentication */}
                {!isLoading && (
                  user ? (
                    <div className="relative" ref={dropdownRef}>
                      <button
                        onClick={toggleDropdown}
                        className="flex items-center gap-2 transition-transform duration-200 hover:scale-105"
                      >
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${isDark ? 'bg-yellow-500 text-gray-900' : 'bg-gray-900 text-white'}`}>
                          {getUserInitials()}
                        </div>
                      </button>

                      {isDropdownOpen && (
                        <div className={`absolute right-0 mt-3 w-52 rounded-xl shadow-xl border py-2 z-50 ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-100'}`}>
                          <Link
                            to="/profile"
                            className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors duration-200 ${isDark ? 'text-gray-300 hover:bg-dark-700 hover:text-[#C69327]' : 'text-gray-700 hover:bg-gray-50 hover:text-[#C69327]'}`}
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            My Profile
                          </Link>
                          <button
                            onClick={handleLogout}
                            className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium w-full text-left transition-colors duration-200 ${isDark ? 'text-red-400 hover:bg-dark-700' : 'text-red-500 hover:bg-gray-50'}`}
                          >
                            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            Logout
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      ref={desktopLoginRef}
                      onClick={openAuthModalDesktop}
                      className={`hidden lg:flex items-center gap-2 text-[15px] font-semibold transition-colors duration-200 ${isDark ? 'text-white hover:text-[#C69327]' : 'text-gray-900 hover:text-[#C69327]'}`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      Login / Register
                    </button>
                  )
                )}

                <div className="hidden md:block">
                  <LocationBadge isDark={isDark} variant="desktop" />
                </div>
                
                {/* Mobile Launch Car Finder Button */}
                <button
                  onClick={() => navigate('/ai-car-finder')}
                  className="lg:hidden flex items-center gap-1 px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg text-[10px] sm:text-xs transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm cursor-pointer font-sans mr-1"
                >
                  <span>✨ Car Finder</span>
                </button>

                <ThemeToggle />

                {/* Mobile Menu Button */}
                <button
                  onClick={toggleMenu}
                  className={`lg:hidden focus:outline-none flex-shrink-0 p-1 ml-1 ${isDark ? 'text-white' : 'text-gray-900'}`}
                  aria-label="Toggle Menu"
                >
                  <div className="w-6 h-5 flex flex-col justify-between">
                    <span className={`h-[2px] w-full bg-current transition-all duration-200 ${isOpen ? 'rotate-45 translate-y-2.5' : ''}`} />
                    <span className={`h-[2px] w-full bg-current transition-all duration-200 ${isOpen ? 'opacity-0' : ''}`} />
                    <span className={`h-[2px] w-full bg-current transition-all duration-200 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ===============================
            BOTTOM ROW: Navigation Links
            =============================== */}
        <div className="hidden lg:block max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 border-b border-transparent">
          <div className="flex items-center h-[48px] lg:h-[50px] space-x-8 xl:space-x-10">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => `${navLinkClasses} ${isActive ? navLinkActiveClasses : navLinkInactiveClasses}`}
              >
                {link.name}
              </NavLink>
            ))}
            <CategoriesDropdown />
            <button
              onClick={() => navigate('/ai-car-finder')}
              className="px-3.5 py-1.5 bg-[#C69327] hover:bg-[#A87B1F] text-white font-bold rounded-lg text-xs transition-all duration-300 hover:scale-105 active:scale-95 shadow-md flex items-center gap-1.5 cursor-pointer font-sans"
            >
              <span>Launch Car Finder</span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-x-0 bottom-0 bg-black/50 lg:hidden backdrop-blur-sm"
                style={{ top: 'var(--header-height, 72px)' }}
                onClick={closeMenu}
                aria-hidden="true"
              />

              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="absolute top-full left-0 w-full lg:hidden shadow-2xl border-t"
                style={{
                  backgroundColor: brandColor,
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'
                }}
              >
                <div className="max-w-7xl mx-auto px-4 pt-4 pb-5 space-y-1.5 max-h-[calc(100vh-var(--header-height,72px))] overflow-y-auto overscroll-contain">
                  
                  {/* Functional Search Bar integration for Mobile Menu */}
                  <div className="mb-4 relative w-full z-[60] [&_input]:h-[44px] [&_input]:rounded-[12px] [&_input]:text-sm [&_input]:border-gray-200 dark:[&_input]:border-dark-600 focus-within:[&_input]:border-[#C69327]">
                    <SearchBar />
                  </div>

                  {NAV_LINKS.map((link) => (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      className={({ isActive }) => `${mobileNavLinkClasses} ${isActive ? mobileNavLinkActiveClasses : mobileNavLinkInactiveClasses}`}
                      onClick={closeMenu}
                    >
                      {link.name}
                    </NavLink>
                  ))}


                  <div className="py-1 border-t border-gray-100 dark:border-dark-700 mt-2 pt-2">
                    <button
                      onClick={toggleCategories}
                      className={`w-full flex items-center justify-between py-2 font-medium text-base sm:text-lg transition-colors duration-200 ${isDark ? 'text-white hover:text-[#C69327]' : 'text-gray-900 hover:text-[#C69327]'}`}
                    >
                      <span>Categories</span>
                      <svg className={`w-4 h-4 transition-transform duration-200 ${isCategoriesOpen ? 'rotate-180 text-[#C69327]' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                          <div className="ml-4 space-y-1 pt-1 pb-2">
                            {MOBILE_CATEGORIES.map((item, idx) => (
                              <Link
                                key={idx}
                                to={item.path}
                                className={`block py-2 text-sm sm:text-base transition-colors duration-200 pl-3 border-l-2 border-gray-200 dark:border-dark-700 hover:border-[#C69327] ${isDark ? 'text-gray-300 hover:text-[#C69327]' : 'text-gray-600 hover:text-[#C69327]'}`}
                                onClick={closeMenu}
                              >
                                {item.name}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {!isLoading && (
                    user ? (
                      <div className="pt-2 border-t border-gray-100 dark:border-dark-700">
                        <Link
                          to="/profile"
                          className={`${mobileNavLinkClasses} ${mobileNavLinkInactiveClasses}`}
                          onClick={closeMenu}
                        >
                          <div className="flex items-center gap-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            My Profile
                          </div>
                        </Link>
                        <button
                          onClick={() => {
                            handleLogout()
                            closeMenu()
                          }}
                          className={`${mobileNavLinkClasses} ${isDark ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-600'}`}
                        >
                          <div className="flex items-center gap-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            Logout
                          </div>
                        </button>
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-gray-100 dark:border-dark-700">
                        <button
                          ref={mobileLoginRef}
                          onClick={openAuthModalMobile}
                          className={`w-full flex items-center gap-3 ${mobileNavLinkClasses} ${mobileNavLinkInactiveClasses}`}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                          Login / Register
                        </button>
                      </div>
                    )
                  )}

                  <div className={`mt-2 pt-4 pb-2 border-t flex flex-col gap-4 ${isDark ? 'border-dark-700' : 'border-gray-100'}`}>
                    <LocationBadge isDark={isDark} variant="mobile" />
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Appearance</span>
                      <ThemeToggle />
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>

      {/* FIXED: Dynamic Spacer for Desktop 
          Because Home.jsx explicitly uses "lg:pt-0" (which removes the CSS padding gap on large screens),
          the fixed header covers the Hero on desktop. This invisible spacer lives INSIDE the header component, 
          dynamically takes up exactly '--header-height' space on desktop only, and perfectly pushes the Hero 
          downwards so no images are ever cut from the top, all without touching Home.jsx.
      */}
    <div
  className="hidden lg:block w-full pointer-events-none"
  style={{ height: 'calc(var(--header-height, 130px) - 80px)' }}
  aria-hidden="true"
/>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        triggerRef={activeTriggerRef}
      />
    </>
  )
}

export default CommonHeader