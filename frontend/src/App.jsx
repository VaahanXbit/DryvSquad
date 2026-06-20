// src/App.jsx
/*
================================================================================
File Name : App.jsx
Author : Tahseen Raza
Created Date : 2025-01-15
Description : Main application component with theme support
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import Articles from './pages/Articles'
import ArticleDetail from './pages/ArticleDetail'
import CompareCars from './pages/CompareCars'
import CommonHeader from './components/CommonHeader'
import CommonFooter from './components/CommonFooter'
import CategoryArticle from './pages/CategoryArticle'
import FeatureDetail from './pages/FeatureDetail'

// ScrollToTop component
const ScrollToTop = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  return null
}

function App() {
  return (
    <ThemeProvider>
      <div className="flex flex-col min-h-screen bg-white dark:bg-dark-950">
        <CommonHeader />
        <main className="flex-grow pt-0">
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/article/:slug" element={<ArticleDetail />} />
            <Route path="/compare-cars" element={<CompareCars />} />
            <Route path="/category/:categoryId" element={<CategoryArticle />} />
            <Route path="/feature/:categoryId/:featureId" element={<FeatureDetail />} />
          </Routes>
        </main>
        <CommonFooter />
      </div>
    </ThemeProvider>
  )
}

export default App