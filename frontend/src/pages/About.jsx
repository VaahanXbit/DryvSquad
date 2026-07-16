// src/pages/About.jsx
/*
================================================================================
File Name : About.jsx
Author : Tahseen Raza
Created Date : 2026-06-10
Description : About page component with full theme support
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

import { motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import BasePage from './BasePage'
import { useTheme } from '../context/ThemeContext'

// ========================================
// ANIMATED COUNTER COMPONENT - FIXED FOR 24/7
// ========================================

const AnimatedCounter = ({ target, duration = 2000 }) => {
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

    // Check if the target is a special format like "24/7"
    if (target === '24/7') {
      // For 24/7, count to 24 then add "/7"
      let startTime = null
      const startValue = 0
      const endValue = 24

      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp
        const progress = Math.min((timestamp - startTime) / duration, 1)
        const easeOutQuart = 1 - Math.pow(1 - progress, 4)
        const currentValue = Math.floor(easeOutQuart * endValue)
        
        setCount(currentValue + '/7')

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          setCount('24/7')
        }
      }

      requestAnimationFrame(animate)
      return
    }

    // Parse the target number (remove any non-numeric characters like '+', ',')
    const numericTarget = parseFloat(target.toString().replace(/[^0-9.]/g, ''))
    if (isNaN(numericTarget)) {
      setCount(target)
      return
    }

    let startTime = null
    const startValue = 0
    const endValue = numericTarget

    // For numbers with K (thousands), we want to count up to the actual number
    // e.g., 5,000+ -> 5000
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
        const kValue = currentValue / 1000
        if (kValue % 1 === 0) {
          displayValue = Math.floor(kValue) + 'K'
        } else {
          displayValue = kValue.toFixed(1) + 'K'
        }
      } else if (target.includes('+')) {
        displayValue = currentValue + '+'
      } else if (target.includes(',')) {
        // Format with commas for large numbers
        displayValue = currentValue.toLocaleString()
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
        } else if (target.includes(',')) {
          finalDisplay = finalValue.toLocaleString()
        } else {
          finalDisplay = finalValue
        }
        setCount(finalDisplay)
      }
    }

    requestAnimationFrame(animate)
  }, [isVisible, target, duration])

  return <span ref={ref}>{isVisible ? count : '0'}</span>
}

class AboutPage extends BasePage {
  constructor(props) {
    super(props)
    this.pageTitle = 'About Vaahan International | Premium Automotive Service'
    this.pageDescription = 'Learn about our mission to simplify automotive technology for Indian car buyers'
  }

  fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
  }

  fadeLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: 'easeOut' } }
  }

  fadeRight = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: 'easeOut' } }
  }

  renderContent() {
    const { isDark } = this.props.theme || { isDark: false }

    return (
      <>
        {/* Hero Section */}
        <section className="relative min-h-[50vh] sm:min-h-[55vh] md:min-h-[60vh] flex items-center overflow-hidden pt-24 sm:pt-20">
          <div className="absolute inset-0">
            <img src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1920&h=600&fit=crop" alt="Luxury Car Workshop" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40"></div>
          </div>
          <div className="container-custom relative z-10">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-3xl">
              <span className="text-yellow-500 font-semibold text-xs sm:text-sm tracking-wider uppercase mb-3 sm:mb-4 block">About Vaahan International</span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">Premium Automotive <br className="hidden sm:block" /><span className="text-yellow-500">Service Excellence</span></h1>
            </motion.div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="relative -mt-10 sm:-mt-16 md:-mt-20 pb-12 sm:pb-16 md:pb-20">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 md:gap-8">
              <motion.div variants={this.fadeLeft} initial="hidden" whileInView="visible" viewport={{ once: true }} className={`rounded-2xl shadow-2xl p-5 sm:p-6 md:p-8 transform hover:-translate-y-2 transition-all duration-300 ${
                isDark ? 'bg-dark-800' : 'bg-white'
              }`}>
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                  <span className="text-2xl sm:text-3xl">🎯</span>
                </div>
                <h3 className={`text-xl sm:text-2xl font-bold mb-3 sm:mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Our Mission</h3>
                <p className={`text-sm sm:text-base leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>To provide premium automotive service that combines main dealer expertise with affordable pricing, ensuring every luxury vehicle owner gets the best care possible.</p>
              </motion.div>
              
              <motion.div variants={this.fadeRight} initial="hidden" whileInView="visible" viewport={{ once: true }} className={`rounded-2xl shadow-2xl p-5 sm:p-6 md:p-8 transform hover:-translate-y-2 transition-all duration-300 ${
                isDark ? 'bg-dark-800' : 'bg-white'
              }`}>
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                  <span className="text-2xl sm:text-3xl">👁️</span>
                </div>
                <h3 className={`text-xl sm:text-2xl font-bold mb-3 sm:mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Our Vision</h3>
                <p className={`text-sm sm:text-base leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>To become India's most trusted independent luxury vehicle service center, known for excellence, transparency, and customer satisfaction.</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section - WITH ANIMATED COUNTERS */}
        <section className={`py-12 sm:py-16 md:py-20 relative overflow-hidden transition-colors duration-300 ${
          isDark ? 'bg-dark-950' : 'bg-white'
        }`}>
          <div className="container-custom relative z-10">
            <motion.div variants={this.fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-8 sm:mb-10 md:mb-12">
              <span className="text-yellow-500 font-semibold text-xs sm:text-sm tracking-wider uppercase">Our Achievements</span>
              <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Numbers That Speak</h2>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
              {[
                { number: '15+', label: 'Years Experience', description: 'Industry leadership' },
                { number: '5,000+', label: 'Vehicles Serviced', description: 'Happy customers' },
                { number: '100%', label: 'Satisfaction Rate', description: 'Guaranteed quality' },
                { number: '24/7', label: 'Support Available', description: 'Always here' }
              ].map((stat, index) => (
                <motion.div 
                  key={index} 
                  variants={this.fadeUp} 
                  initial="hidden" 
                  whileInView="visible" 
                  viewport={{ once: true }} 
                  transition={{ delay: index * 0.1 }} 
                  className="text-center"
                >
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-yellow-500 mb-1 sm:mb-2">
                    <AnimatedCounter target={stat.number} duration={2000 + index * 300} />
                  </div>
                  <div className={`font-semibold text-sm sm:text-base md:text-lg mb-0.5 sm:mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {stat.label}
                  </div>
                  <div className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {stat.description}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Core Values Section */}
        <section className={`py-12 sm:py-16 md:py-20 transition-colors duration-300 ${
          isDark ? 'bg-dark-900' : 'bg-white'
        }`}>
          <div className="container-custom">
            <motion.div variants={this.fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-8 sm:mb-10 md:mb-12">
              <span className="text-yellow-500 font-semibold text-xs sm:text-sm tracking-wider uppercase">Core Values</span>
              <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>What Drives Us</h2>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 md:gap-8">
              {[
                { title: 'Excellence', description: 'We deliver nothing but the best service quality for premium vehicles.', icon: '💎' },
                { title: 'Transparency', description: 'Honest pricing and clear communication about every repair.', icon: '🔍' },
                { title: 'Innovation', description: 'Latest diagnostic tools and cutting-edge repair techniques.', icon: '⚡' },
                { title: 'Trust', description: 'Building lasting relationships with every customer.', icon: '🤝' }
              ].map((value, idx) => (
                <motion.div key={idx} variants={this.fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: idx * 0.1 }} whileHover={{ y: -10 }} className={`rounded-xl p-5 sm:p-6 text-center shadow-lg hover:shadow-2xl transition-all duration-300 ${
                  isDark ? 'bg-dark-800' : 'bg-gray-50'
                }`}>
                  <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">{value.icon}</div>
                  <h4 className={`text-lg sm:text-xl font-bold mb-2 sm:mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>{value.title}</h4>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-16 sm:py-20 md:py-24 overflow-hidden">
          <div className="absolute inset-0">
            <img src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1920&h=400&fit=crop" alt="Luxury Car" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 to-black/70"></div>
          </div>
          <div className="container-custom relative z-10">
            <motion.div variants={this.fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">Ready for a Premium Experience?</h2>
              <p className="text-gray-300 text-base sm:text-lg mb-6 sm:mb-8">Book your appointment today and let our experts take care of your vehicle</p>
              <div className="flex flex-col xs:flex-row flex-wrap gap-3 sm:gap-4 justify-center px-4 sm:px-0">
                <a href="/contact" className="w-full xs:w-auto text-center bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold py-3 px-6 sm:px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg">Book Appointment</a>
                <a href="/category" className="w-full xs:w-auto text-center border-2 border-white/30 text-white hover:bg-white/10 font-semibold py-3 px-6 sm:px-8 rounded-lg transition-all duration-300">Explore Services</a>
              </div>
            </motion.div>
          </div>
        </section>
      </>
    )
  }
}

let aboutPageInstance = null

export const getAboutPage = () => {
  if (!aboutPageInstance) {
    aboutPageInstance = new AboutPage({})
  }
  return aboutPageInstance
}

// Wrapper component to pass theme
const About = () => {
  const { isDark } = useTheme()
  const page = getAboutPage()
  page.props.theme = { isDark }
  return page.render()
}

export default About