// src/pages/Travelogues.jsx
/*
================================================================================
File Name : Travelogues.jsx
Author : Tahseen Raza
Created Date : 2026-06-29
Description : Travelogues page with all travel stories from PDF
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import {
  getAllTravelogues,
  getTraveloguesByCategory,
  getTravelogueCategories
} from '../data/traveloguesData';

const Travelogues = () => {
  const { isDark } = useTheme();
  const [travelogues, setTravelogues] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const allLogs = await getAllTravelogues();
        setTravelogues(allLogs);
        setFilteredLogs(allLogs);

        const categoriesData = await getTravelogueCategories();
        setCategories(categoriesData);

      } catch (err) {
        console.error('❌ Error fetching travelogues:', err);
        setError('Failed to load travel stories. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCategoryChange = async (category) => {
    setSelectedCategory(category);

    if (category === 'All') {
      setFilteredLogs(travelogues);
    } else {
      const categoryLogs = await getTraveloguesByCategory(category);
      setFilteredLogs(categoryLogs);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center pt-20 ${isDark ? 'bg-dark-950' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Loading travel stories...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center pt-20 ${isDark ? 'bg-dark-950' : 'bg-gray-50'}`}>
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold py-2 px-6 rounded-lg transition-all duration-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const allCategories = [{ id: 'All', name: 'All', count: travelogues.length }, ...categories];

  return (
    <>
      <section className="relative overflow-hidden pt-32 pb-16 bg-gradient-to-r from-blue-950 via-slate-900 to-slate-700">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container-custom relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-white mb-4 sm:mb-5"
          >
            Real Stories. Real Lessons.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-base sm:text-lg md:text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed px-4"
          >
            Honest travel stories, buying experiences, and driving lessons from real people on Indian roads.
          </motion.p>
        </div>
      </section>

      <section className={`sticky top-16 z-20 border-b transition-colors duration-300 ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'
        }`}>
        <div className="container-custom">
          <div className="flex flex-wrap gap-2 py-3 sm:py-4 overflow-x-auto">
            {allCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.name)}
                className={`px-4 sm:px-5 py-1.5 sm:py-2 rounded-full whitespace-nowrap font-semibold transition-all duration-300 text-sm sm:text-base ${selectedCategory === category.name
                    ? 'bg-yellow-500 text-gray-900 shadow-md'
                    : isDark
                      ? 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {category.name}
                <span className={`ml-1.5 text-xs ${selectedCategory === category.name
                    ? 'text-gray-700'
                    : isDark ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                  ({category.count})
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className={`py-8 sm:py-12 md:py-16 transition-colors duration-300 ${isDark ? 'bg-dark-900' : 'bg-gray-50'
        }`}>
        <div className="container-custom">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 sm:py-16 md:py-20">
              <div className="text-5xl sm:text-6xl mb-4">📖</div>
              <h3 className={`text-xl sm:text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>No Travel Stories Found</h3>
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Try selecting a different category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
              {filteredLogs.map((log, idx) => (
                <motion.article
                  key={log._id || idx}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (idx % 9) * 0.05 }}
                  whileHover={{ y: -5 }}
                  className={`group rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ${isDark ? 'bg-dark-800' : 'bg-white'
                    }`}
                >
                  <Link to={`/travelogue/${log.slug}`}>
                    <div className="relative h-40 sm:h-44 md:h-48 lg:h-52 overflow-hidden">
                      <img
                        src={log.image || '/images/travelogue/default.png'}
                        alt={log.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = '/images/travelogue/default.png';
                        }}
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-yellow-500 text-gray-900 text-[10px] sm:text-xs font-semibold rounded-full">
                          {log.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 sm:p-5">
                      <div className={`flex items-center gap-2 text-[10px] sm:text-xs mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        <span>{log.date || 'Coming Soon'}</span>
                        {log.readTime && (
                          <>
                            <span>•</span>
                            <span>{log.readTime}</span>
                          </>
                        )}
                      </div>
                      <h3 className={`text-base sm:text-lg font-bold mb-2 line-clamp-2 transition-colors ${isDark ? 'text-white group-hover:text-yellow-400' : 'text-gray-900 group-hover:text-yellow-600'
                        }`}>
                        {log.title}
                      </h3>
                      <p className={`text-sm mb-3 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {log.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] sm:text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{log.author || 'Vaahan Team'}</span>
                        <span className="text-yellow-500 font-semibold text-xs sm:text-sm group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                          Read Story →
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Travelogues;