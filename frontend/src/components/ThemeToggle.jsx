// src/components/ThemeToggle.jsx
/*
================================================================================
File Name : ThemeToggle.jsx
Author : Tahseen Raza
Created Date : 2026-06-17
Description : Theme toggle with smooth 0.8s transition
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme()
  const [isRotating, setIsRotating] = useState(false)
  const [displayDarkIcon, setDisplayDarkIcon] = useState(isDark)

  const handleToggle = () => {
    setIsRotating(true)
    toggleTheme()

    setTimeout(() => {
      setIsRotating(false)
    }, 800)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayDarkIcon(isDark)
    }, 400)
    return () => clearTimeout(timer)
  }, [isDark])

  return (
    <button
      onClick={handleToggle}
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className="
        relative
        flex
        items-center
        justify-center
        w-10
        h-10
        md:w-11
        md:h-11
        rounded-full
        border
        hover:scale-110
        active:scale-95
        focus:outline-none
        focus:ring-2
        focus:ring-yellow-500
        overflow-hidden
        transition-all
        duration-300
      "
      style={{
        background: isDark
          ? "rgba(15,23,42,0.75)"
          : "#0B1F3A",
        borderColor: isDark
          ? "rgba(255,255,255,0.12)"
          : "rgba(255,255,255,0.15)",
        boxShadow: isDark
          ? "0 8px 30px rgba(0,0,0,.35)"
          : "0 8px 25px rgba(0,0,0,.15)",
      }}
    >
      <div
        className={`
          transition-all
          duration-300
          ease-in-out
          flex
          items-center
          justify-center
          ${isRotating ? 'scale-90 opacity-70' : 'scale-100 opacity-100'}
        `}
      >
        {displayDarkIcon ? (
          // Moon icon for dark mode
          <svg
            className="w-5 h-5 text-yellow-400 transition-colors duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        ) : (
          // Sun icon for light mode - clean, no background
          <svg
            className="w-5 h-5 text-yellow-400 transition-colors duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        )}
      </div>

      {/* Hover glow effect */}
      <span className="
        absolute
        inset-0
        rounded-full
        opacity-0
        hover:opacity-100
        transition-opacity
        duration-300
        pointer-events-none
        bg-gradient-to-r
        from-yellow-500/10
        to-yellow-500/10
      " />
    </button>
  )
}

export default ThemeToggle