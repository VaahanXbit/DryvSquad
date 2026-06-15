// src/App.jsx
/*
================================================================================
File Name : App.jsx
Author : Tahseen Raza
Created Date : 2025-01-15
Description : Main application component with scroll to top functionality
Company : Vaahan International
Copyright : (c) 2025 Vaahan International. All rights reserved.
================================================================================
*/

import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import Articles from './pages/Articles'
import ArticleDetail from './pages/ArticleDetail'
import CommonHeader from './components/CommonHeader'
import CommonFooter from './components/CommonFooter'

// ScrollToTop component - resets scroll position on route change
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // Use 'smooth' for smooth scrolling, 'instant' for immediate
    })
  }, [pathname])

  return null
}

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <CommonHeader />
        <main className="flex-grow">
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/article/:slug" element={<ArticleDetail />} />
          </Routes>
        </main>
        <CommonFooter />
      </div>
    </BrowserRouter>
  )
}

export default App