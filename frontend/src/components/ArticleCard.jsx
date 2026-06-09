// src/components/FeatureCard.jsx
import React from 'react'
import { motion } from 'framer-motion'

const FeatureCard = ({ icon, title, value, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-all duration-300"
    >
      <div className="text-4xl mb-3">{icon}</div>
      <div className="text-3xl font-bold text-primary-600 mb-1">{value}</div>
      <div className="text-gray-600 font-medium">{title}</div>
    </motion.div>
  )
}

export default FeatureCard