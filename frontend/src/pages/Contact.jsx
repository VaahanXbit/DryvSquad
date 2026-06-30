import React, { useState } from 'react'
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
    
    // Validate
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      setError('Please fill in all required fields')
      return
    }

    // Validate email
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
    if (!emailRegex.test(formData.email.trim())) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Send contact form to backend
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
    { icon: '✉️', title: 'Email', value: 'contact@vaahan-international.com', link: 'mailto:contact@vaahan-international.com' },
    { icon: '📞', title: 'Phone', value: '+91 98765 43210', link: 'tel:+919876543210' },
    { icon: '📍', title: 'Location', value: 'New Delhi, India', link: null }
  ]

  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="container-custom text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-white text-4xl md:text-5xl font-bold mb-4">
            Get In Touch
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-xl text-gray-300 max-w-2xl mx-auto">
            Have questions about automotive technology or suggestions for future guides? We'd love to hear from you.
          </motion.p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className={`py-20 transition-colors duration-300 ${isDark ? 'bg-dark-900' : 'bg-white'}`}>
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form Column */}
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <h3 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Send us a message</h3>
              
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
              <h3 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Contact Information</h3>
              <div className="space-y-4">
                {contactInfo.map((info, idx) => (
                  <div key={idx} className={`flex items-start space-x-4 p-4 rounded-xl transition-colors duration-300 ${
                    isDark ? 'bg-dark-800' : 'bg-gray-50'
                  } border ${isDark ? 'border-dark-700' : 'border-gray-200'}`}>
                    <div className={`text-2xl ${isDark ? '' : 'text-gray-600'}`}>{info.icon}</div>
                    <div>
                      <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{info.title}</h4>
                      {info.link ? (
                        <a href={info.link} className={`transition-colors ${isDark ? 'text-gray-400 hover:text-yellow-400' : 'text-gray-600 hover:text-yellow-500'}`}>
                          {info.value}
                        </a>
                      ) : (
                        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{info.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Response Time */}
              <div className={`mt-6 p-4 rounded-xl transition-colors duration-300 border ${
                isDark ? 'bg-yellow-900/20 border-yellow-800/30' : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">⏰</span>
                  <div>
                    <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Response Time</h4>
                    <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Within 24–48 hours</p>
                  </div>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className={`mt-6 rounded-xl h-64 flex items-center justify-center transition-colors duration-300 border ${
                isDark ? 'bg-dark-800 border-dark-700' : 'bg-gray-100 border-gray-200'
              }`}>
                <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>📍 Location Map - New Delhi, India</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Contact