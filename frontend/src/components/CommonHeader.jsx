// src/components/CommonHeader.jsx
/*
================================================================================
File Name : CommonHeader.jsx
Author : Tahseen Raza
Created Date : 2025-01-15
Description : Reusable header component with professional styling
Company : Vaahan International
Copyright : (c) 2025 Vaahan International. All rights reserved.
================================================================================
*/

import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import CategoriesDropdown from './CategoriesDropdown'

const CommonHeader = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()
  const brandYellow = '#CFB32B'

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [location])

  const navLinks = [
    { path: '/', name: 'Home' },
    { path: '/about', name: 'About' },
    { path: '/contact', name: 'Contact' },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'py-2 shadow-xl' : 'py-3'
      }`}
      style={{
        backgroundColor: brandYellow,
        borderBottom: '1px solid rgba(0,0,0,0.08)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo - Larger Size */}
          <Link to="/" className="flex items-center group flex-shrink-0">
            <img
              src="/Vaahan_International_Logo1.jpg"
              alt="Vaahan International"
              className="h-16 md:h-20 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `font-semibold text-[16px] tracking-wide transition-all duration-300 ${
                    isActive
                      ? 'text-black border-b-2 border-black pb-1'
                      : 'text-gray-900 hover:text-black'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
            
            {/* Categories Dropdown */}
            <CategoriesDropdown />
            
            <Link
              to="/contact"
              className="
                bg-[#0B1F3A]
                hover:bg-[#08172C]
                text-white
                font-semibold
                py-2.5
                px-6
                rounded-xl
                shadow-lg
                transition-all
                duration-300
                hover:-translate-y-1
              "
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden focus:outline-none flex-shrink-0"
            aria-label="Toggle Menu"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span
                className={`h-0.5 w-full bg-black transition-all duration-300 ${
                  isOpen ? 'rotate-45 translate-y-2' : ''
                }`}
              />
              <span
                className={`h-0.5 w-full bg-black transition-all duration-300 ${
                  isOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`h-0.5 w-full bg-black transition-all duration-300 ${
                  isOpen ? '-rotate-45 -translate-y-2' : ''
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
              transition={{ duration: 0.3 }}
              className="overflow-hidden md:hidden"
            >
              <div className="pt-5 pb-6 space-y-4">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) =>
                      `block py-2 font-medium text-lg ${
                        isActive ? 'text-black' : 'text-gray-900 hover:text-black'
                      }`
                    }
                    onClick={() => setIsOpen(false)}
                  >
                    {link.name}
                  </NavLink>
                ))}
                <Link
                  to="/contact"
                  className="
                    block
                    text-center
                    bg-[#0B1F3A]
                    hover:bg-[#08172C]
                    text-white
                    font-semibold
                    py-3
                    rounded-xl
                    transition-all
                    duration-300
                  "
                  onClick={() => setIsOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}

export default CommonHeader