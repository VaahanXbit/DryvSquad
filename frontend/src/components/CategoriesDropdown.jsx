// src/components/CategoriesDropdown.jsx
/*
================================================================================
File Name : CategoriesDropdown.jsx
Author : Tahseen Raza
Created Date : 2025-01-15
Description : Professional categories dropdown with vertical submenu (top to bottom)
Company : Vaahan International
Copyright : (c) 2025 Vaahan International. All rights reserved.
================================================================================
*/

import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const CategoriesDropdown = () => {
  const [openCategory, setOpenCategory] = useState(null)

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

  return (
    <div className="relative group">
      {/* Dropdown Trigger */}
      <button className="flex items-center gap-1 font-semibold text-[16px] tracking-wide text-gray-900 hover:text-black transition-colors">
        Categories
        <svg className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Main Dropdown Menu - Vertical Layout */}
      <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-gray-100 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        {categories.map((category, idx) => (
          <div
            key={idx}
            className="relative"
          >
            {/* Category Item - Click to open submenu */}
            <button
              onClick={() => setOpenCategory(openCategory === category.name ? null : category.name)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 text-left"
            >
              <span className="font-medium text-gray-800">{category.name}</span>
              <svg 
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${openCategory === category.name ? 'rotate-90' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Submenu - Opens BELOW the category (Vertical/Top to Bottom) */}
            {openCategory === category.name && (
              <div className="bg-gray-50 border-t border-gray-100">
                <div className="px-4 py-2 bg-gray-100">
                  <span className="text-xs font-semibold text-gray-600">{category.name}</span>
                  <span className="text-xs text-gray-400 ml-2">({category.articles.length} articles)</span>
                </div>
                <div className="py-1">
                  {category.articles.map((article, articleIdx) => (
                    <Link
                      key={articleIdx}
                      to={`/article/${article.slug}`}
                      className="block px-4 py-2 hover:bg-yellow-50 transition-colors"
                      onClick={() => setOpenCategory(null)}
                    >
                      <div>
                        <span className="text-sm text-gray-700 hover:text-yellow-600 font-medium">
                          {article.title}
                        </span>
                        <span className="text-xs text-gray-400 block mt-0.5">Click to read →</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default CategoriesDropdown