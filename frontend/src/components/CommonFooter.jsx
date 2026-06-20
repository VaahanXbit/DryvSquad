// src/components/CommonFooter.jsx
/*
================================================================================
File Name : CommonFooter.jsx
Author : Tahseen Raza
Created Date : 2026-06-10
Description : Reusable footer component with full dark mode support
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

  const footerBg = isDark ? 'bg-dark-900' : 'bg-gray-900'
  const textColor = isDark ? 'text-gray-300' : 'text-gray-300'
  const borderColor = isDark ? 'border-dark-700' : 'border-gray-800'
  const hoverColor = 'hover:text-yellow-500'

  return (
    <footer className={`${footerBg} ${textColor} mt-auto transition-colors duration-300`}>
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4 group">
              <img
                src="/Vaahan_International_Logo1.jpg"
                alt="Vaahan International"
                className="h-14 md:h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
            <p className="text-gray-400 text-sm mt-4 leading-relaxed">
              Helping Indian car buyers understand vehicle technology, safety systems, and automotive innovation.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-lg mb-4 border-b ${borderColor} pb-2 inline-block">Quick Links</h4>
            <ul className="space-y-2 mt-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className={`text-gray-400 ${hoverColor} transition-colors text-sm flex items-center gap-2`}>
                    <span className="text-yellow-500">›</span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-lg mb-4 border-b ${borderColor} pb-2 inline-block">Resources</h4>
            <ul className="space-y-2 mt-3">
              {resources.map((resource) => (
                <li key={resource.name}>
                  <Link to={resource.path} className={`text-gray-400 ${hoverColor} transition-colors text-sm flex items-center gap-2`}>
                    <span className="text-yellow-500">›</span>
                    {resource.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-lg mb-4 border-b ${borderColor} pb-2 inline-block">Connect With Us</h4>

            <div className="flex space-x-3 mb-6 mt-3">
              {socialIcons.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  className={`w-10 h-10 bg-gray-800 ${social.color} rounded-full flex items-center justify-center hover:bg-opacity-100 hover:scale-110 transition-all duration-300 border border-gray-700`}
                  aria-label={social.name}
                >
                  <span className="text-white font-bold text-sm">
                    {social.name === 'LinkedIn' && 'in'}
                    {social.name === 'Instagram' && 'ig'}
                    {social.name === 'Twitter' && 'tw'}
                    {social.name === 'Facebook' && 'fb'}
                  </span>
                </a>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-gray-400 text-sm">Email Us</p>
                  <a href="mailto:contact@vaahan-international.com" className="text-white hover:text-yellow-500 transition-colors text-sm">
                    contact@vaahan-international.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <p className="text-gray-400 text-sm">Call Us</p>
                  <a href="tel:+919876543210" className="text-white hover:text-yellow-500 transition-colors text-sm">
                    +91 98765 43210
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="text-gray-400 text-sm">Visit Us</p>
                  <p className="text-white text-sm">New Delhi, India</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-3 bg-gray-800 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-yellow-500 text-lg">⏰</span>
                <div>
                  <p className="text-white text-xs font-semibold">Response Time</p>
                  <p className="text-gray-400 text-xs">Within 24-48 hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`border-t ${borderColor} mt-10 pt-6`}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">© 2026 Vaahan International. All Rights Reserved.</p>
            <div className="flex gap-6">
              <a href="#" className={`text-gray-500 ${hoverColor} text-xs transition-colors`}>Privacy Policy</a>
              <a href="#" className={`text-gray-500 ${hoverColor} text-xs transition-colors`}>Terms of Service</a>
              <a href="#" className={`text-gray-500 ${hoverColor} text-xs transition-colors`}>Sitemap</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default CommonFooter