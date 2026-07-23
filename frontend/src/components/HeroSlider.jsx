// src/components/HeroSlider.jsx
/*
================================================================================
File Name : HeroSlider.jsx
Description : Homepage Hero banner slider. Extracted verbatim from Home.jsx's
              old inline renderHero() — same markup, same classes, same
              timing, same arrows/dots/transitions — just parameterized by a
              `banners` prop instead of a hardcoded array, so:
                1) Home.jsx can feed it banners fetched from the backend.
                2) The Admin's Hero Banner Management preview can render this
                   exact same component (not a mockup/thumbnail) to show
                   "this is exactly how the homepage will look."
              Do not change layout, animation, timing, or styling here —
              this file IS the homepage Hero; changing it changes the
              homepage.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

// `forceViewport` is ONLY used by the Admin preview panel — it lets the
// preview show the mobile asset inside a small preview box regardless of
// the actual browser window width (CSS `<picture><source media>` matches
// against the real viewport, not a container's width, so a preview box on
// a wide admin screen can't otherwise show the mobile crop). Home.jsx never
// passes this prop, so the real homepage's behavior is completely
// unchanged — it still uses the native <picture> viewport switching below.
const HeroSlider = ({ banners, forceViewport }) => {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    // Reset to the first slide and (re)start autoplay whenever the banner
    // set itself changes (e.g. after the initial fetch resolves, or after
    // an admin publish refreshes the homepage data).
    setCurrentSlide(0)
    if (!banners || banners.length === 0) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length)
    }, 12000) // 10 seconds
    return () => clearInterval(interval)
  }, [banners])

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  if (!banners || banners.length === 0) return null

  return (
    <section
      className="relative w-full overflow-hidden bg-transparent pt-[var(--header-height,72px)] lg:pt-0"
    >
     <style>{`
  /* ===========================
     Mobile (UNCHANGED)
  ============================ */
  .ds-hero-box {
    position: relative;
    width: 100%;
    aspect-ratio: 4 / 5;
    overflow: hidden;
  }

  .ds-hero-media {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: contain;
    object-position: center;
  }

  /* ===========================
     Desktop Only
  ============================ */
  @media (min-width:1024px){

    /* Instead of showing the full image,
       crop the bottom white area */
    .ds-hero-box{
      aspect-ratio: auto !important;
      height: 650px;
      overflow: hidden;
    }

    .ds-hero-media{
      width:100%;
      height:100%;
      object-fit:cover !important;

      /*
       Move the crop upward.

       Increase this value if more white is visible.

       Try:
       center 0%
       center 10%
       center 15%
       center 20%
      */

      object-position:center 10% !important;
    }

  }
`}</style>
      <div
        className="w-full relative aspect-[4/5] lg:aspect-[1672/941] ds-hero-box"
        style={forceViewport === 'mobile' ? { aspectRatio: '4 / 5' } : undefined}
      >

        {banners.map((banner, index) => (
          <div
            key={banner._id || banner.id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
          >
            {forceViewport === 'mobile' ? (
              <img
                src={banner.mobileImage}
                alt={banner.title}
                className="w-full h-full object-contain block ds-hero-media"
              />
            ) : (
              <picture>
                <source media="(max-width: 1023px)" srcSet={banner.mobileImage} />
                <img
                  src={banner.desktopImage || banner.image}
                  alt={banner.title}
                  className="w-full h-full object-contain block ds-hero-media"
                />
              </picture>
            )}

           <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gradient-to-tl from-black/55 via-black/10 to-transparent pointer-events-none z-10"></div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: index === currentSlide ? 1 : 0, y: index === currentSlide ? 0 : 12 }}
              transition={{ duration: 0.5, delay: 0.25 }}
          className="
absolute

/* Mobile */
bottom-24
right-3

xs:bottom-24
xs:right-3

sm:bottom-5
sm:right-5

md:bottom-8
md:right-8

/* Desktop */
lg:bottom-28
lg:right-10

xl:bottom-32
xl:right-12

z-50
"
            >
              <Link
                to={banner.buttonLink || banner.link}
                className="inline-block whitespace-nowrap px-3 py-1.5 xs:px-4 xs:py-2 sm:px-6 sm:py-2.5 md:px-8 md:py-3 rounded-lg sm:rounded-xl font-semibold text-[11px] xs:text-xs sm:text-sm md:text-base transition-all duration-300 hover:scale-105 hover:shadow-xl text-black"
                style={{
                  background: '#af860c',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
                }}
              >
                {banner.buttonText}
              </Link>
            </motion.div>
          </div>
        ))}

        {/* Left Arrow Button — kept at the far left edge of the page */}
        <button
          onClick={() => goToSlide((currentSlide - 1 + banners.length) % banners.length)}
          className="absolute left-1.5 xs:left-2 sm:left-4 md:left-6 top-[50%] -translate-y-1/2 transform z-30 w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-all duration-200 flex items-center justify-center text-black shadow-lg hover:shadow-xl hover:scale-105"
          aria-label="Previous slide"
        >
          <svg className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Right Arrow Button - kept at the far right edge of the page */}
        <button
          onClick={() => goToSlide((currentSlide + 1) % banners.length)}
         className="absolute right-1.5 xs:right-2 sm:right-4 md:right-6 top-[50%] -translate-y-1/2 transform z-30 w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-all duration-200 flex items-center justify-center text-black shadow-lg hover:shadow-xl hover:scale-105"
          aria-label="Next slide"
        >
          <svg className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Dots */}
      <div className="flex justify-center items-center gap-1 xs:gap-1.5 sm:gap-2 md:gap-2.5 absolute bottom-10 xs:bottom-12 sm:bottom-14 md:bottom-16 lg:bottom-20
xl:bottom-24 left-0 right-0 z-20">
        {banners.map((_, index) => (
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

export default HeroSlider