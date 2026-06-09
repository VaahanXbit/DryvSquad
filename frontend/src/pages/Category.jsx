
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const Category = () => {
  const categories = [
    {
      id: 'safety',
      name: 'Safety Features',
      description: 'Vehicle safety systems designed to prevent accidents and protect occupants.',
      icon: '🛡️',
      color: 'bg-red-100',
      hoverColor: 'hover:bg-red-50',
      technologies: ['ABS', 'Airbags', 'Electronic Stability Control', 'Traction Control', 'Child Safety Systems', 'Hill Start Assist', 'Brake Assist', 'Tyre Pressure Monitoring'],
    },
    {
      id: 'adas',
      name: 'ADAS',
      description: 'Technologies that assist drivers and improve road safety.',
      icon: '🤖',
      color: 'bg-blue-100',
      hoverColor: 'hover:bg-blue-50',
      technologies: ['Lane Keep Assist', 'Adaptive Cruise Control', 'Automatic Emergency Braking', 'Blind Spot Monitoring', 'Rear Cross Traffic Alert', 'Driver Attention Monitoring', 'Traffic Sign Recognition', 'Parking Assist'],
    },
    {
      id: 'connected',
      name: 'Connected Cars',
      description: 'Smart vehicle systems connected through software and internet services.',
      icon: '📱',
      color: 'bg-purple-100',
      hoverColor: 'hover:bg-purple-50',
      technologies: ['Smartphone Connectivity', 'Navigation', 'Telematics', 'Remote Monitoring', 'Over-the-Air Updates', 'Voice Control', 'Wi-Fi Hotspot', 'Cloud Services'],
    },
    {
      id: 'ev',
      name: 'Electric Vehicles',
      description: 'The future of mobility powered by sustainable electric technology.',
      icon: '⚡',
      color: 'bg-green-100',
      hoverColor: 'hover:bg-green-50',
      technologies: ['Battery Systems', 'Charging Infrastructure', 'Regenerative Braking', 'Range Optimization', 'Thermal Management', 'Electric Motors', 'Energy Recovery', 'Battery Management System'],
    },
    {
      id: 'engine',
      name: 'Engine Technology',
      description: 'Modern engine innovations focused on performance, efficiency, and emissions reduction.',
      icon: '🔧',
      color: 'bg-yellow-100',
      hoverColor: 'hover:bg-yellow-50',
      technologies: ['Turbocharging', 'Direct Injection', 'Variable Valve Timing', 'Hybrid Systems', 'Start-Stop Technology', 'Cylinder Deactivation', 'Exhaust Recirculation', 'Performance Tuning'],
    },
  ]

  return (
    <>
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="container-custom text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Explore Vehicle Technologies
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-primary-100 max-w-2xl mx-auto"
          >
            Comprehensive guides to help you understand modern car features
          </motion.p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, idx) => (
              <motion.div
                key={category.id}
                id={category.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className={`bg-white rounded-2xl shadow-lg overflow-hidden ${category.hoverColor} transition-all duration-300 transform hover:-translate-y-2`}
              >
                <div className={`p-6 ${category.color}`}>
                  <div className="text-5xl mb-4">{category.icon}</div>
                  <h3 className="text-2xl font-bold mb-2 text-dark-800">{category.name}</h3>
                  <p className="text-gray-600 mb-4">{category.description}</p>
                </div>
                <div className="p-6">
                  <h4 className="font-semibold text-dark-800 mb-3">Technologies Covered:</h4>
                  <div className="flex flex-wrap gap-2">
                    {category.technologies.map((tech, techIdx) => (
                      <span key={techIdx} className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-700">
                        {tech}
                      </span>
                    ))}
                  </div>
                  <Link
                    to="#"
                    className="inline-flex items-center mt-5 text-primary-600 font-semibold hover:text-primary-700 transition-colors"
                  >
                    Explore Guides
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="container-custom text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">Can't Find What You're Looking For?</h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Contact us and suggest a topic you'd like us to cover
            </p>
            <Link to="/contact" className="bg-white text-primary-600 hover:bg-primary-50 font-semibold py-3 px-8 rounded-lg transition-all duration-300 inline-block">
              Suggest a Topic
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  )
}

export default Category