// src/components/CommonFooter.jsx
/*
================================================================================
File Name : CommonFooter.jsx
Author : Tahseen Raza
Created Date : 2026-06-10
Description : Reusable footer component with full dark mode support - Compact version
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

const CommonFooter = () => {
  const { isDark } = useTheme()

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Articles', path: '/articles' },
    { name: 'Contact', path: '/contact' },
  ]

  const resources = [
    { name: 'Feature Reviews', path: '/articles?category=Feature%20Reviews' },
    { name: 'Tech Insights', path: '/articles?category=Tech%20Insights' },
    { name: 'New Launches', path: '/articles?category=New%20Launches' },
    { name: 'All Articles', path: '/articles' },
  ]

  const socialIcons = [
    { name: 'LinkedIn', icon: 'in', url: '#', color: 'hover:bg-blue-700' },
    { name: 'Instagram', icon: 'ig', url: '#', color: 'hover:bg-pink-600' },
    { name: 'Twitter', icon: 'tw', url: '#', color: 'hover:bg-blue-500' },
    { name: 'Facebook', icon: 'fb', url: '#', color: 'hover:bg-blue-800' },
  ]

  const footerBg = isDark ? '#0f172a' : 'bg-gray-900'
  const textColor = isDark ? 'text-gray-300' : 'text-gray-300'
  const borderColor = isDark ? 'border-dark-700' : 'border-gray-800'
  const hoverColor = 'hover:text-yellow-500'

  return (
    <footer className={`${footerBg} ${textColor} mt-auto transition-colors duration-300`}>
      <div className="container-custom py-6 sm:py-8 md:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-6 md:gap-6">
          <div className="col-span-1 sm:col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-3 group">
              <img
                src="/DSLogo-Dark4.png"
                alt="Vaahan International"
                className="h-10 sm:h-11 md:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
            <p className="text-gray-400 text-xs sm:text-sm mt-3 leading-relaxed max-w-sm">
              Helping Indian car buyers understand vehicle technology, safety systems, and automotive innovation.
            </p>
          </div>

          <div>
            <h4 className={`text-white font-semibold text-sm sm:text-base mb-2 sm:mb-3 border-b ${borderColor} pb-1.5 inline-block`}>Quick Links</h4>
            <ul className="space-y-1.5 mt-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className={`text-gray-400 ${hoverColor} transition-colors text-xs sm:text-sm flex items-center gap-2`}>
                    <span className="text-yellow-500">›</span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className={`text-white font-semibold text-sm sm:text-base mb-2 sm:mb-3 border-b ${borderColor} pb-1.5 inline-block`}>Resources</h4>
            <ul className="space-y-1.5 mt-2">
              {resources.map((resource) => (
                <li key={resource.name}>
                  <Link to={resource.path} className={`text-gray-400 ${hoverColor} transition-colors text-xs sm:text-sm flex items-center gap-2`}>
                    <span className="text-yellow-500">›</span>
                    {resource.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1 sm:col-span-2 md:col-span-1">
            <h4 className={`text-white font-semibold text-sm sm:text-base mb-2 sm:mb-3 border-b ${borderColor} pb-1.5 inline-block`}>Connect With Us</h4>

            <div className="flex flex-wrap gap-2 mb-4 mt-2">
              {socialIcons.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  className={`w-8 h-8 sm:w-9 sm:h-9 shrink-0 bg-gray-800 ${social.color} rounded-full flex items-center justify-center hover:bg-opacity-100 hover:scale-110 transition-all duration-300 border border-gray-700`}
                  aria-label={social.name}
                >
                  <span className="text-white font-bold text-[10px] sm:text-xs">
                    {social.name === 'LinkedIn' && 'in'}
                    {social.name === 'Instagram' && 'ig'}
                    {social.name === 'Twitter' && 'tw'}
                    {social.name === 'Facebook' && 'fb'}
                  </span>
                </a>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-2.5">
                <svg className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div className="min-w-0">
                  <p className="text-gray-400 text-[10px] sm:text-xs">Email Us</p>
                  <a href="mailto:contact@dryvsquad.com" className="text-white hover:text-yellow-500 transition-colors text-xs sm:text-sm break-all">
                    contact@dryvsquad.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <svg className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div className="min-w-0">
                  <p className="text-gray-400 text-[10px] sm:text-xs">Call Us</p>
                  <a href="tel:+918217316343" className="text-white hover:text-yellow-500 transition-colors text-xs sm:text-sm">
                    +91 82173 16343
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <svg className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div className="min-w-0">
                  <p className="text-gray-400 text-[10px] sm:text-xs">Location</p>
                  <p className="text-white text-xs sm:text-sm">Bangalore, Karnataka, India</p>
                </div>
              </div>
            </div>

            <div className="mt-4 p-2.5 bg-gray-800 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-yellow-500 text-base shrink-0">⏰</span>
                <div className="min-w-0">
                  <p className="text-white text-[10px] sm:text-xs font-semibold">Response Time</p>
                  <p className="text-gray-400 text-[10px] sm:text-xs">Within 2-4 hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`border-t ${borderColor} mt-6 sm:mt-7 pt-4 sm:pt-5`}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-center md:text-left">
            <p className="text-gray-500 text-[10px] sm:text-xs">© 2026 Vaahan International. All Rights Reserved.</p>
            <div className="flex flex-wrap justify-center gap-x-4 sm:gap-x-5 gap-y-1.5">
              <a href="#" className={`text-gray-500 ${hoverColor} text-[10px] sm:text-xs transition-colors`}>Privacy Policy</a>
              <a href="#" className={`text-gray-500 ${hoverColor} text-[10px] sm:text-xs transition-colors`}>Terms of Service</a>
              <a href="#" className={`text-gray-500 ${hoverColor} text-[10px] sm:text-xs transition-colors`}>Sitemap</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default CommonFooter