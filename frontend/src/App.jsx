// // src/App.jsx
// /*
// ================================================================================
// File Name : App.jsx
// Author : Tahseen Raza
// Created Date : 2025-01-15
// Description : Main application component with theme support and location context
// Company : Vaahan International
// Copyright : (c) 2026 Vaahan International. All rights reserved.
// ================================================================================
// */

// import { useEffect } from 'react'
// import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
// import { ThemeProvider } from './context/ThemeContext'
// import { LocationProvider } from './context/LocationContext'
// import { api } from './services/api'
// import Home from './pages/Home'
// import About from './pages/About'
// import Contact from './pages/Contact'
// import Articles from './pages/Articles'
// import ArticleDetail from './pages/ArticleDetail'
// import CompareCars from './pages/CompareCars'
// import CommonHeader from './components/CommonHeader'
// import CommonFooter from './components/CommonFooter'
// import CategoryArticle from './pages/CategoryArticle'
// import FeatureDetail from './pages/FeatureDetail'
// import Profile from './pages/Profile' 
// import Travelogues from './pages/Travelogues'
// import TravelogueDetail from './pages/TravelogueDetail'
// import AiModePage from './pages/AiModePage'
// import AdminPage from './pages/AdminPage'
// import LeadFormPage from './pages/LeadFormPage'
// import LocationModal from './components/LocationModal'

// // ScrollToTop component
// const ScrollToTop = () => {
//   const { pathname } = useLocation()

//   useEffect(() => {
//     window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
//   }, [pathname])

//   return null
// }

// function App() {
//   const location = useLocation()
//   const navigate = useNavigate()
//   const isAiModePage = location.pathname === '/ai-mode'
  
//   // Kick off the Compare Cars data fetch as early as possible — right when
//   // the app mounts, not when the user navigates to /compare-cars. By the
//   // time they click through, the data is usually already cached, so that
//   // page can render without any visible loading state.
//   useEffect(() => {
//     api.prefetchCars()
//   }, [])

//   return (
//     <ThemeProvider>
//       <LocationProvider>
//         <div className="flex flex-col min-h-screen bg-white dark:bg-black transition-colors duration-100">
//           <CommonHeader />
//           <LocationModal />
//           <main className="flex-grow pt-0">
//             <ScrollToTop />
//             <Routes>
//               <Route path="/" element={<Home />} />
//               <Route path="/about" element={<About />} />
//               <Route path="/contact" element={<Contact />} />
//               <Route path="/articles" element={<Articles />} />
//               <Route path="/article/:slug" element={<ArticleDetail />} />
//               <Route path="/compare-cars" element={<CompareCars />} />
//               <Route path="/category/:categoryId" element={<CategoryArticle />} />
//               <Route path="/feature/:categoryId/:featureId" element={<FeatureDetail />} />
//               <Route path="/profile" element={<Profile />} /> 
//               <Route path="/travelogues" element={<Travelogues />} />
//               <Route path="/travelogue/:slug" element={<TravelogueDetail />} />
//               <Route path="/ai-mode" element={<AiModePage />} />
//               <Route path="/admin" element={<AdminPage />} />
//               <Route path="/lead-loan" element={<LeadFormPage type="auto-loan" />} />
//               <Route path="/lead-insurance" element={<LeadFormPage type="insurance" />} />
//             </Routes>
//           </main>
//           {!isAiModePage && <CommonFooter />}

//           {/* Floating AI Mode Button */}
//           {!isAiModePage && (
//             <button
//               onClick={() => navigate('/ai-mode')}
//               className="fixed bottom-6 right-6 z-50 flex items-center justify-center gap-2 px-5 py-3.5 rounded-full text-sm font-bold text-white shadow-xl hover:shadow-2xl floating-ai-btn animate-rgb-border"
//             >
//               <span className="text-base">✨</span>
//               <span>Ask AI Advisor</span>
//             </button>
//           )}
//         </div>
//       </LocationProvider>
//     </ThemeProvider>
//   )
// }

// export default App

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
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { LocationProvider } from './context/LocationContext'
import LocationModal from './components/location/LocationModal'
import { api } from './services/api'
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
import Profile from './pages/Profile' 
import Travelogues from './pages/Travelogues';
import TravelogueDetail from './pages/TravelogueDetail';
import AiModePage from './pages/AiModePage'
import AdminPage from './pages/AdminPage'
import LeadFormPage from './pages/LeadFormPage'
import AiCarFinder from './pages/AiCarFinder'
import ModelVariants from './pages/ModelVariants'
import PaymentTest from './pages/PaymentTest' 
import EvRangeCalculatorPage from './pages/EvRangeCalculatorPage'

// ScrollToTop component
const ScrollToTop = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  return null
}

function App() {

  const location = useLocation()
  const navigate = useNavigate()
  const isAiModePage = location.pathname === '/ai-mode'
  // Kick off the Compare Cars data fetch as early as possible — right when
  // the app mounts, not when the user navigates to /compare-cars. By the
  // time they click through, the data is usually already cached, so that
  // page can render without any visible loading state.
  useEffect(() => {
    api.prefetchCars()
  }, [])

  return (
    <ThemeProvider>
      <LocationProvider>
        <div className="flex flex-col min-h-screen bg-white dark:bg-black transition-colors duration-100">
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
              <Route path="/profile" element={<Profile />} /> 
              <Route path="/travelogues" element={<Travelogues />} />
              <Route path="/travelogue/:slug" element={<TravelogueDetail />} />
              <Route path="/ai-mode" element={<AiModePage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/loan-quotes" element={<LeadFormPage type="auto-loan" />} />
              <Route path="/insurance-quotes" element={<LeadFormPage type="insurance" />} />
              <Route path="/ai-car-finder" element={<AiCarFinder />} />
              <Route path="/model-variants/:slug" element={<ModelVariants />} />
              <Route path="/payment-test" element={<PaymentTest />} /> 
              <Route path="/tools/ev-range-calculator" element={<EvRangeCalculatorPage />} />
            </Routes>
          </main>
          {!isAiModePage && <CommonFooter />}

          {/* Global location modal — mounted once here, opened from
              anywhere via useDsLocation().openLocationModal() */}
          <LocationModal />

          {/* Floating AI Mode Button */}
          {!isAiModePage && (
            <button
              onClick={() => navigate('/ai-mode')}
              className="fixed bottom-6 right-6 z-50 flex items-center justify-center gap-2 px-5 py-3.5 rounded-full text-sm font-bold text-white shadow-xl hover:shadow-2xl floating-ai-btn animate-rgb-border"
            >
              <span className="text-base">✨</span>
              <span>Ask AI Advisor</span>
            </button>
          )}
        </div>
      </LocationProvider>
    </ThemeProvider>
  )
}

export default App
