// src/pages/Contact.jsx - Updated with theme matching backgrounds

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { api } from '../services/api'

const Contact = () => {
  const { isDark } = useTheme()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      setError('Please fill in all required fields')
      return
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
    if (!emailRegex.test(formData.email.trim())) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await api.sendContactForm(formData)
      
      if (result.success) {
        setSubmitted(true)
        setFormData({ fullName: '', email: '', phone: '', subject: '', message: '' })
        setTimeout(() => setSubmitted(false), 5000)
      } else {
        setError(result.message || 'Failed to send message. Please try again.')
      }
    } catch (error) {
      console.error('Contact form error:', error)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const contactInfo = [
    { icon: '✉️', title: 'Email', value: 'contact@dryvsquad.com', link: 'mailto:contact@vaahan-international.com' },
    { icon: '📞', title: 'Phone', value: '+91 82173 16343', link: 'tel:+918217316343' },
    { icon: '📍', title: 'Location', value: 'Bangalore, Karnataka, India', link: null }
  ]

  // Bangalore Coordinates
  const mapSrc = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d248849.8996332334!2d77.46617289999999!3d12.9544616!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0xf8dfc3e8517e4fe0!2sBengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"

  return (
    <>
      {/* Hero Section - THEME AWARE FIXED */}
      <section className={`relative pt-[var(--header-height,72px)] sm:pt-28 md:pt-32 pb-12 sm:pb-16 transition-colors duration-300 ${
        isDark ? 'bg-dark-950' : 'bg-white'
      }`}>
        <div className="container-custom text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 ${
            isDark ? 'text-yellow-500' : 'text-gray-900'
          }`}>
            Get In Touch
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className={`text-base sm:text-lg md:text-xl max-w-2xl mx-auto px-2 ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Have questions about automotive technology or suggestions for future guides? We'd love to hear from you.
          </motion.p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className={`py-12 sm:py-16 md:py-20 transition-colors duration-300 ${isDark ? 'bg-dark-900' : 'bg-white'}`}>
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12">
            {/* Form Column */}
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <h3 className={`text-xl sm:text-2xl font-bold mb-4 sm:mb-6 ${isDark ? 'text-yellow-500' : 'text-gray-900'}`}>Send us a message</h3>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="fullName" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Full Name *
                  </label>
                  <input 
                    type="text" 
                    id="fullName" 
                    name="fullName" 
                    value={formData.fullName} 
                    onChange={handleChange} 
                    required 
                    className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors duration-300 ${
                      isDark 
                        ? 'bg-dark-800 border-dark-700 text-white placeholder-gray-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    } border`}
                    placeholder="John Doe" 
                  />
                </div>

                <div>
                  <label htmlFor="email" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Email Address *
                  </label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    required 
                    className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors duration-300 ${
                      isDark 
                        ? 'bg-dark-800 border-dark-700 text-white placeholder-gray-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    } border`}
                    placeholder="john@example.com" 
                  />
                </div>

                <div>
                  <label htmlFor="phone" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Phone Number
                  </label>
                  <input 
                    type="tel" 
                    id="phone" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors duration-300 ${
                      isDark 
                        ? 'bg-dark-800 border-dark-700 text-white placeholder-gray-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    } border`}
                    placeholder="+91 98765 43210" 
                  />
                </div>

                <div>
                  <label htmlFor="subject" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Subject *
                  </label>
                  <input 
                    type="text" 
                    id="subject" 
                    name="subject" 
                    value={formData.subject} 
                    onChange={handleChange} 
                    required 
                    className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors duration-300 ${
                      isDark 
                        ? 'bg-dark-800 border-dark-700 text-white placeholder-gray-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    } border`}
                    placeholder="How can we help you?" 
                  />
                </div>

                <div>
                  <label htmlFor="message" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Message *
                  </label>
                  <textarea 
                    id="message" 
                    name="message" 
                    value={formData.message} 
                    onChange={handleChange} 
                    required 
                    rows="5" 
                    className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors duration-300 ${
                      isDark 
                        ? 'bg-dark-800 border-dark-700 text-white placeholder-gray-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    } border`}
                    placeholder="Tell us about your question or suggestion..."
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className={`w-full py-3 rounded-xl font-semibold text-base transition-all duration-300 ${
                    loading
                      ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                      : 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    'Send Message'
                  )}
                </button>

                {submitted && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className={`p-4 rounded-lg text-center ${
                      isDark ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-green-100 text-green-700'
                    }`}
                  >
                    ✅ Thank you for reaching out! We'll respond within 24-48 hours.
                  </motion.div>
                )}
              </form>
            </motion.div>

            {/* Contact Information Column */}
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <h3 className={`text-xl sm:text-2xl font-bold mb-4 sm:mb-6 ${isDark ? 'text-yellow-500' : 'text-gray-900'}`}>Contact Information</h3>
              <div className="space-y-4">
                {contactInfo.map((info, idx) => (
                  <div key={idx} className={`flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl transition-colors duration-300 ${
                    isDark ? 'bg-dark-800' : 'bg-gray-50'
                  } border ${isDark ? 'border-dark-700' : 'border-gray-200'}`}>
                    <div className={`text-xl sm:text-2xl shrink-0 ${isDark ? '' : 'text-gray-600'}`}>{info.icon}</div>
                    <div className="min-w-0">
                      <h4 className={`font-semibold text-sm sm:text-base ${isDark ? 'text-white' : 'text-gray-800'}`}>{info.title}</h4>
                      {info.link ? (
                        <a href={info.link} className={`text-sm sm:text-base break-words transition-colors ${isDark ? 'text-gray-400 hover:text-yellow-400' : 'text-gray-600 hover:text-yellow-500'}`}>
                          {info.value}
                        </a>
                      ) : (
                        <p className={`text-sm sm:text-base break-words ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{info.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Response Time */}
              <div className={`mt-6 p-3 sm:p-4 rounded-xl transition-colors duration-300 border ${
                isDark ? 'bg-yellow-900/20 border-yellow-800/30' : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="text-xl sm:text-2xl shrink-0">⏰</span>
                  <div className="min-w-0">
                    <h4 className={`font-semibold text-sm sm:text-base ${isDark ? 'text-white' : 'text-gray-800'}`}>Response Time</h4>
                    <p className={`text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Within 2-4 hours</p>
                  </div>
                </div>
              </div>

              {/* Google Map - Bangalore */}
              <div className={`mt-6 rounded-xl overflow-hidden transition-colors duration-300 border ${
                isDark ? 'border-dark-700' : 'border-gray-200'
              }`}>
                <div className="relative w-full h-56 sm:h-64">
                  <iframe
                    src={mapSrc}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Vaahan International Location - Bangalore"
                    className="w-full h-full"
                  ></iframe>
                  {/* Overlay with location name */}
                  <div className={`absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 px-3 sm:px-4 py-2 rounded-lg backdrop-blur-sm ${
                    isDark ? 'bg-black/70 text-white' : 'bg-white/90 text-gray-900'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="text-base sm:text-lg shrink-0">📍</span>
                      <div className="min-w-0">
                        <p className="font-semibold text-xs sm:text-sm truncate">DryvSquad</p>
                        <p className="text-[10px] sm:text-xs opacity-75 truncate">Bangalore, Karnataka, India</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Link */}
              <div className="mt-3 text-center">
                <a 
                  href="https://www.google.com/maps/place/Bengaluru,+Karnataka/@12.9544616,77.4661729,11z/data=!3m1!4b1!4m6!3m5!1s0x3bae1670c9b44e6d:0xf8dfc3e8517e4fe0!8m2!3d12.9715987!4d77.5945627!16zL20vMDljY3c?entry=ttu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 text-sm font-semibold transition-colors ${
                    isDark ? 'text-yellow-400 hover:text-yellow-300' : 'text-yellow-600 hover:text-yellow-700'
                  }`}
                >
                  <span>🗺️</span>
                  Open in Google Maps
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Contact