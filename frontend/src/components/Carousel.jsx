// src/components/Carousel.jsx
/*
================================================================================
File Name : Carousel.jsx
Description : Reusable horizontal free-scroll carousel used on the homepage
              for Travel Logs and Technology Guides. Netflix / Prime style:
              - Desktop: Native trackpad scroll + mouse click & drag.
              - Mobile: Fluid momentum scrolling (no forced snapping).
              - Arrows: Scrolls 85% of the visible container width per click.
================================================================================
*/

import { useRef, useState, useEffect, useCallback } from 'react'
import { useTheme } from '../context/ThemeContext'

const Carousel = ({ children, ariaLabel = 'Carousel', center = false }) => {
  const { isDark } = useTheme()
  const trackRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  // Refs for high-performance mouse dragging without re-renders
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)
  const dragDistance = useRef(0)

  const updateArrowState = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    // Math.ceil ensures we don't get stuck due to sub-pixel rounding
    const maxScroll = el.scrollWidth - el.clientWidth
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(Math.ceil(el.scrollLeft) < maxScroll - 4)
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    updateArrowState()
    el.addEventListener('scroll', updateArrowState, { passive: true })
    window.addEventListener('resize', updateArrowState)
    return () => {
      el.removeEventListener('scroll', updateArrowState)
      window.removeEventListener('resize', updateArrowState)
    }
  }, [updateArrowState, children])

  const scrollByPage = (direction) => {
    const el = trackRef.current
    if (!el) return
    // Scroll by 85% of the visible width (Netflix style).
    // behavior: 'smooth' is passed per-call only — the element's own
    // scroll-behavior stays 'auto' (native) at all times, so trackpad,
    // touch, and mouse-wheel scrolling are always instant/1:1 like a
    // real Netflix/Prime row. Only this button-triggered scroll eases.
    const scrollAmount = el.clientWidth * 0.85
    el.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' })
  }

  // --- Mouse Drag Logic ---
  const handleMouseDown = (e) => {
    const el = trackRef.current
    if (!el) return
    isDragging.current = true
    dragDistance.current = 0
    startX.current = e.pageX - el.offsetLeft
    scrollLeft.current = el.scrollLeft
    el.classList.add('cursor-grabbing')
  }

  const handleMouseLeave = () => {
    isDragging.current = false
    if (trackRef.current) {
      trackRef.current.classList.remove('cursor-grabbing')
    }
  }

  const handleMouseUp = () => {
    isDragging.current = false
    if (trackRef.current) {
      trackRef.current.classList.remove('cursor-grabbing')
    }
  }

  const handleMouseMove = (e) => {
    if (!isDragging.current) return
    e.preventDefault() // Prevents text selection while dragging
    
    const el = trackRef.current
    const x = e.pageX - el.offsetLeft
    const walk = x - startX.current // Exactly 1:1 drag distance
    
    dragDistance.current = Math.abs(walk)
    el.scrollLeft = scrollLeft.current - walk
  }

  // Prevent accidental link clicking if the user was trying to drag
  const handleClickCapture = (e) => {
    if (dragDistance.current > 5) {
      e.stopPropagation()
      e.preventDefault()
    }
  }

  return (
    <div className="relative group/carousel">
      {/* Left arrow */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollByPage(-1)}
          aria-label={`Scroll ${ariaLabel} left`}
          className={`hidden sm:flex absolute -left-3 md:-left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-10 md:h-10 rounded-full items-center justify-center shadow-lg transition-all duration-300 ease-out hover:scale-110 active:scale-95 ${
            isDark
              ? 'bg-dark-800 text-white border border-dark-600 hover:bg-dark-700'
              : 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Right arrow */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollByPage(1)}
          aria-label={`Scroll ${ariaLabel} right`}
          className={`hidden sm:flex absolute -right-3 md:-right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-10 md:h-10 rounded-full items-center justify-center shadow-lg transition-all duration-300 ease-out hover:scale-110 active:scale-95 ${
            isDark
              ? 'bg-dark-800 text-white border border-dark-600 hover:bg-dark-700'
              : 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Right-edge fade hint */}
      {canScrollRight && (
        <div
          className={`hidden sm:block pointer-events-none absolute right-0 top-0 bottom-0 w-12 md:w-16 z-10 bg-gradient-to-l ${
            isDark ? 'from-dark-900' : 'from-gray-50'
          } to-transparent`}
        />
      )}

      {/* Track Container */}
      <div
        ref={trackRef}
        role="region"
        aria-label={ariaLabel}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onClickCapture={handleClickCapture}
        className={`flex gap-4 md:gap-5 overflow-x-auto overflow-y-hidden hide-scrollbar pb-2 cursor-grab ${center ? 'justify-center' : ''}`}
        style={{
          WebkitOverflowScrolling: 'touch',
          // Native ('auto') at all times — trackpad/touch/wheel scrolling
          // is always instant and 1:1, exactly like Netflix/Prime rows.
          // Smooth easing is applied per-call only for arrow-button clicks
          // (see scrollByPage), never as a blanket style.
          scrollBehavior: 'auto',
        }}
      >
        {children}
      </div>
    </div>
  )
}

export default Carousel