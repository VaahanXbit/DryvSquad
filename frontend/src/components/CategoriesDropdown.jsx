// src/components/CategoriesDropdown.jsx - Fixed for desktop dropdown with nested items

import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

const CategoriesDropdown = () => {
  const { isDark } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState(null)
  const timeoutRef = useRef(null)
  const dropdownRef = useRef(null)

  const categories = [
    {
      name: "Feature Reviews",
      articles: [
        { title: "AWD vs FWD: The ₹2 Lakh Question", slug: "awd-vs-fwd" },
        { title: "ADAS Lane Keep Assist Review", slug: "adas-lane-keep-assist" },
        { title: "FWD Car in Spiti Winter", slug: "fwd-car-spiti-winter" },
        { title: "Best Tyres for Highway Drives", slug: "best-highway-tyres" }
      ]
    },
    {
      name: "New Launches",
      articles: [
        { title: "2026 Hyundai Creta Launch", slug: "hyundai-creta-2026-launch" },
        { title: "New Kia Seltos 2026", slug: "kia-seltos-2026" }
      ]
    },
    {
      name: "Tech Insights",
      articles: [
        { title: "What is ADAS? Complete Guide", slug: "what-is-adas" },
        { title: "What is ABS? How It Works", slug: "what-is-abs" },
        { title: "What is EBD? Explained", slug: "what-is-ebd" },
        { title: "What is ESC? Stability Control", slug: "what-is-esc" }
      ]
    }
  ]

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
        setActiveCategory(null)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
      setActiveCategory(null)
    }, 200)
  }

  const handleCategoryMouseEnter = (categoryName) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setActiveCategory(categoryName)
  }

  const handleCategoryMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveCategory(null)
    }, 200)
  }

  const handleSubmenuMouseEnter = (categoryName) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setActiveCategory(categoryName)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const textColor = isDark ? 'text-white' : 'text-gray-900'
  const subTextColor = isDark ? 'text-gray-400' : 'text-gray-500'
  const hoverBg = isDark ? 'hover:bg-dark-700' : 'hover:bg-gray-50'
  const subHoverBg = isDark ? 'hover:bg-dark-700' : 'hover:bg-yellow-50'
  const borderColor = isDark ? 'border-dark-700' : 'border-gray-100'
  const bgColor = isDark ? 'bg-dark-800' : 'bg-white'
  const subBgColor = isDark ? 'bg-dark-800' : 'bg-white'
  const headerBg = isDark ? 'bg-dark-700' : 'bg-gray-50'

  return (
    <div
      className="relative inline-block"
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button className={`flex items-center gap-1 font-semibold text-sm xl:text-[16px] tracking-wide ${textColor} hover:text-yellow-500 transition-colors`}>
        Categories
        <svg className={`w-3 h-3 xl:w-4 xl:h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className={`absolute top-full left-0 mt-1 w-56 sm:w-64 md:w-72 rounded-lg shadow-xl border ${borderColor} z-50 ${bgColor}`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Compare Cars - Direct Link */}
          <Link
            to="/compare-cars"
            className={`flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 ${hoverBg} transition-colors border-b ${borderColor}`}
            onClick={() => setIsOpen(false)}
          >
            <div>
              <div className={`font-bold text-sm sm:text-base ${textColor}`}>Compare Cars</div>
              <div className={`text-[10px] sm:text-xs ${subTextColor}`}>Side by side comparison</div>
            </div>
            <span className="text-yellow-500 text-xs sm:text-sm">→</span>
          </Link>

          {/* Categories with Nested Items */}
          {categories.map((category, idx) => (
            <div
              key={idx}
              className={`relative border-b ${borderColor} last:border-0`}
              onMouseEnter={() => handleCategoryMouseEnter(category.name)}
              onMouseLeave={handleCategoryMouseLeave}
            >
              <div className={`flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 ${hoverBg} cursor-pointer transition-colors`}>
                <div>
                  <div className={`font-semibold text-sm sm:text-base ${textColor}`}>{category.name}</div>
                  <div className={`text-[10px] sm:text-xs ${subTextColor}`}>{category.articles.length} articles</div>
                </div>
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>

              {/* Nested Submenu - Opens on Left */}
              {activeCategory === category.name && (
                <div
                  className={`absolute top-0 right-full mr-0 w-56 sm:w-64 md:w-80 rounded-lg shadow-xl border ${borderColor} z-50 ${subBgColor}`}
                  style={{ left: 'auto', right: '100%' }}
                  onMouseEnter={() => handleSubmenuMouseEnter(category.name)}
                  onMouseLeave={handleCategoryMouseLeave}
                >
                  <div className="py-2">
                    <div className={`px-3 sm:px-4 py-1.5 sm:py-2 ${headerBg} border-b ${borderColor}`}>
                      <span className={`font-semibold text-sm sm:text-base ${textColor}`}>{category.name}</span>
                      <span className={`text-[10px] sm:text-xs ${subTextColor} ml-2`}>({category.articles.length})</span>
                    </div>
                    {category.articles.map((article, articleIdx) => (
                      <Link
                        key={articleIdx}
                        to={`/article/${article.slug}`}
                        className={`block px-3 sm:px-4 py-1.5 sm:py-2 ${subHoverBg} transition-colors`}
                        onClick={() => setIsOpen(false)}
                      >
                        <span className={`text-xs sm:text-sm ${textColor} hover:text-yellow-500`}>
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
}

export default CategoriesDropdown