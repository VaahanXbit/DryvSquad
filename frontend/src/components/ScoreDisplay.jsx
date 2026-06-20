// src/components/ScoreDisplay.jsx
/*
================================================================================
File Name : ScoreDisplay.jsx
Author : Tahseen Raza
Created Date : 2025-01-16
Description : Professional score display component showing user-friendly ratings
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

import { motion } from 'framer-motion'

const ScoreDisplay = ({ scores, carName, overallScore }) => {
  // If scores is undefined or null, show placeholder
  if (!scores || typeof scores !== 'object') {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
          <h3 className="text-xl font-bold text-white">{carName || 'Car'} - Ratings</h3>
        </div>
        <div className="p-6 text-center">
          <div className="text-gray-400 text-lg mb-2">📊</div>
          <p className="text-gray-500">Rating data not available for this variant</p>
        </div>
      </div>
    )
  }

  // Check if scores object has actual values
  const hasValidScores = Object.values(scores).some(val => val !== undefined && val !== null && typeof val === 'number')

  if (!hasValidScores) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
          <h3 className="text-xl font-bold text-white">{carName || 'Car'} - Ratings</h3>
        </div>
        <div className="p-6 text-center">
          <div className="text-gray-400 text-lg mb-2">📊</div>
          <p className="text-gray-500">Rating data not available for this variant</p>
        </div>
      </div>
    )
  }

  const scoreCategories = [
    { key: 'safetyScore', label: 'Safety', icon: '🛡️', description: 'Protection & assistance systems' },
    { key: 'performanceScore', label: 'Performance', icon: '⚡', description: 'Engine & driving dynamics' },
    { key: 'drivingExperienceScore', label: 'Driving Experience', icon: '🚗', description: 'Overall driving feel' },
    { key: 'suspensionScore', label: 'Suspension', icon: '🔧', description: 'Ride quality & handling' },
    { key: 'comfortScore', label: 'Comfort', icon: '🛋️', description: 'Passenger comfort & ride' },
    { key: 'featuresScore', label: 'Features', icon: '🎯', description: 'Technology & convenience' },
    { key: 'valueForMoneyScore', label: 'Value for Money', icon: '💰', description: 'Price vs features' },
    { key: 'cityDrivingScore', label: 'City Driving', icon: '🏙️', description: 'Urban driving ease' },
    { key: 'highwayDrivingScore', label: 'Highway Driving', icon: '🛣️', description: 'Highway comfort' },
    { key: 'familyScore', label: 'Family', icon: '👨‍👩‍👧‍👦', description: 'Family-friendly features' },
    { key: 'maintenanceScore', label: 'Maintenance', icon: '🔧', description: 'Service & reliability' }
  ]

  const getScoreColor = (score) => {
    if (score >= 9) return 'bg-green-500'
    if (score >= 8) return 'bg-green-400'
    if (score >= 7) return 'bg-yellow-500'
    if (score >= 6) return 'bg-orange-500'
    return 'bg-red-500'
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-white">{carName || 'Car'} - Ratings</h3>
            <p className="text-gray-400 text-sm">Based on expert evaluation</p>
          </div>
          {overallScore && (
            <div className="text-center bg-yellow-500/20 px-4 py-2 rounded-lg">
              <span className="text-sm text-gray-300">Overall</span>
              <div className="text-2xl font-bold text-yellow-400">{overallScore.toFixed(1)}</div>
            </div>
          )}
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {scoreCategories.map((category, idx) => {
            let score = scores[category.key]
            
            if (typeof score !== 'number' || isNaN(score)) {
              return (
                <div key={category.key} className="group hover:bg-gray-50 rounded-lg p-3 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{category.icon}</span>
                      <div>
                        <span className="font-semibold text-gray-800">{category.label}</span>
                        <p className="text-xs text-gray-400">{category.description}</p>
                      </div>
                    </div>
                    <span className="text-gray-400 text-sm font-medium">N/A</span>
                  </div>
                  <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="absolute top-0 left-0 h-full bg-gray-300 rounded-full w-0"></div>
                  </div>
                </div>
              )
            }
            
            const percentage = Math.min((score / 10) * 100, 100)
            const colorClass = getScoreColor(score)
            
            return (
              <motion.div
                key={category.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group hover:bg-gray-50 rounded-lg p-3 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{category.icon}</span>
                    <div>
                      <span className="font-semibold text-gray-800">{category.label}</span>
                      <p className="text-xs text-gray-400">{category.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-2xl font-bold ${score >= 8 ? 'text-green-600' : score >= 6 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {typeof score === 'number' ? score.toFixed(1) : 'N/A'}
                    </span>
                    <span className="text-sm text-gray-400">/ 10</span>
                  </div>
                </div>
                <div className="relative h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, delay: idx * 0.05 }}
                    className={`absolute top-0 left-0 h-full ${colorClass} rounded-full`}
                  />
                </div>
              </motion.div>
            )
          })}
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-2">Rating Guide</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">9-10: Excellent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-gray-600">8-9: Very Good</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-600">7-8: Good</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-gray-600">6-7: Average</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-600">Below 6: Needs Improvement</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ScoreDisplay