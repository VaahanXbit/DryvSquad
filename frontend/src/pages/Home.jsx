// src/pages/Home.jsx
/*
================================================================================
File Name : Home.jsx
Author : Tahseen Raza
Created Date : 2026-06-10
Description : Home page component - displays hero section, features, categories,
              articles, testimonials and newsletter signup
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import BasePage from './BasePage'
import SearchBar from '../components/SearchBar'


class HomePage extends BasePage {
  constructor(props = {}) {
    super(props)
    this.pageTitle = 'Vaahan International | Modern Car Features Explained Simply'
    this.pageDescription = 'Helping Indian car buyers understand vehicle technology, safety systems, electric vehicles, and connected car technologies.'
  }

  fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
  }

  scaleUp = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } }
  }

  // Hero Section Component (Inline)
  renderHero() {
    return (
        <section className="relative min-h-[85vh] flex items-center overflow-hidden pt-0 mt-0">
        <div className="absolute inset-0 w-full h-full z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              minWidth: '100%',
              minHeight: '100%',
            }}
          >
            <source src="/car_Video1.mp4" type="video/mp4" />
          </video>
        </div>
        
        <div className="absolute inset-0 bg-black/50 z-0"></div>

        <div className="container-custom relative z-10 py-20">
          <div className="max-w-2xl">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="inline-block px-4 py-1.5 bg-yellow-500 rounded-full text-gray-900 text-sm font-semibold mb-6">
                🚗 Trusted by 10,000+ Indian Car Buyers
              </motion.div>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }} className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-white">
                Modern Car Features{' '}
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Explained Simply</span>
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }} className="text-xl text-gray-200 mb-4">
                Helping Indian car buyers understand automotive technology before making a purchase decision.
              </motion.p>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }} className="text-gray-300 mb-8">
                From safety features like ABS and Airbags to advanced technologies such as ADAS, Connected Cars, and Electric Vehicles, Vaahan International simplifies complex automotive concepts into easy-to-understand guides.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.5 }} className="flex flex-wrap gap-4">
                <Link to="/articles" className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
                  Browse Articles →
                </Link>
                <Link to="/about" className="bg-white text-gray-800 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg border border-gray-200">
                  Learn More
                </Link>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.5 }} className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-white/20">
                <div><div className="text-3xl font-bold text-yellow-400">100+</div><div className="text-gray-300 text-sm">Articles</div></div>
                <div><div className="text-3xl font-bold text-yellow-400">10K+</div><div className="text-gray-300 text-sm">Readers</div></div>
                <div><div className="text-3xl font-bold text-yellow-400">4+</div><div className="text-gray-300 text-sm">Categories</div></div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    )
  }

  // Search Section - Professional placement like CarDekho/ZigWheels
  renderSearchSection() {
    return (
      <section className="py-16 bg-gradient-to-br from-yellow-50 to-white border-b border-gray-100">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <span className="text-yellow-600 font-semibold text-sm tracking-wider uppercase">Find Your Answer</span>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2 mb-3">
                  Search Our Automotive Library
                </h2>
                <p className="text-gray-500">
                  Explore expert reviews, comparisons, and technology guides
                </p>
              </motion.div>
            </div>
            
            <SearchBar />
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex flex-wrap justify-center gap-2 mt-5"
            >
              <span className="text-xs text-gray-400">Popular searches:</span>
              <button 
                onClick={() => {
                  const searchInput = document.querySelector('input[placeholder*="Search automotive"]')
                  if (searchInput) {
                    searchInput.value = 'AWD vs FWD'
                    searchInput.dispatchEvent(new Event('input'))
                  }
                }}
                className="text-xs text-gray-500 hover:text-yellow-600 transition-colors"
              >
                #AWD vs FWD
              </button>
              <span className="text-gray-300">•</span>
              <button 
                onClick={() => {
                  const searchInput = document.querySelector('input[placeholder*="Search automotive"]')
                  if (searchInput) {
                    searchInput.value = 'ADAS'
                    searchInput.dispatchEvent(new Event('input'))
                  }
                }}
                className="text-xs text-gray-500 hover:text-yellow-600 transition-colors"
              >
                #ADAS
              </button>
              <span className="text-gray-300">•</span>
              <button 
                onClick={() => {
                  const searchInput = document.querySelector('input[placeholder*="Search automotive"]')
                  if (searchInput) {
                    searchInput.value = 'Spiti Winter'
                    searchInput.dispatchEvent(new Event('input'))
                  }
                }}
                className="text-xs text-gray-500 hover:text-yellow-600 transition-colors"
              >
                #Spiti Winter
              </button>
              <span className="text-gray-300">•</span>
              <button 
                onClick={() => {
                  const searchInput = document.querySelector('input[placeholder*="Search automotive"]')
                  if (searchInput) {
                    searchInput.value = 'Highway Tyres'
                    searchInput.dispatchEvent(new Event('input'))
                  }
                }}
                className="text-xs text-gray-500 hover:text-yellow-600 transition-colors"
              >
                #Best Tyres
              </button>
              <span className="text-gray-300">•</span>
              <button 
                onClick={() => {
                  const searchInput = document.querySelector('input[placeholder*="Search automotive"]')
                  if (searchInput) {
                    searchInput.value = 'ABS'
                    searchInput.dispatchEvent(new Event('input'))
                  }
                }}
                className="text-xs text-gray-500 hover:text-yellow-600 transition-colors"
              >
                #ABS
              </button>
            </motion.div>
          </div>
        </div>
      </section>
    )
  }

  // Newsletter Section Component (Inline)
  renderNewsletter() {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <motion.div variants={this.fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Stay Updated With Automotive Technology</h2>
            <p className="text-gray-600 text-lg mb-8">Receive the latest feature guides, technology updates, and vehicle insights directly in your inbox.</p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input type="email" placeholder="Enter your email address" className="flex-1 px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500" />
              <button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-all duration-300">Subscribe Now</button>
            </div>
          </motion.div>
        </div>
      </section>
    )
  }

  // CTA Section Component (Inline)
  renderCTA() {
    return (
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1494905998402-395d579af36f?w=1920&h=500&fit=crop" alt="Car Technology" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900 to-gray-900/80"></div>
        </div>
        <div className="container-custom relative z-10">
          <motion.div variants={this.fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">Ready to Make an Informed Decision?</h2>
            <p className="text-gray-300 text-lg mb-8">Explore our comprehensive guides and understand modern car features before you buy.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/articles" className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg">Browse Articles</Link>
              <Link to="/contact" className="border-2 border-white text-white hover:bg-white/10 font-semibold py-3 px-8 rounded-lg transition-all duration-300">Contact Us</Link>
            </div>
          </motion.div>
        </div>
      </section>
    )
  }

  renderContent() {
    const categories = [
      { title: 'Safety Features', description: 'Modern vehicles come equipped with advanced safety systems that protect passengers.', image: 'https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=600&h=400&fit=crop', stats: ['ABS', 'Airbags', 'ESC', 'Traction Control'], link: '/category#safety' },
      { title: 'ADAS Technology', description: 'Advanced Driver Assistance Systems are revolutionizing how we drive.', image: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=600&h=400&fit=crop', stats: ['Lane Assist', 'Adaptive Cruise', 'Auto Braking'], link: '/category#adas' },
      { title: 'Connected Cars', description: 'Your vehicle is now smarter than ever with real-time connectivity.', image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=600&h=400&fit=crop', stats: ['Remote Start', 'GPS Tracking', 'Mobile Apps'], link: '/category#connected' },
      { title: 'Electric Vehicles', description: 'The future of mobility is electric. Understand battery tech and charging.', image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&h=400&fit=crop', stats: ['Battery Tech', 'Fast Charging', 'Range'], link: '/category#ev' }
    ]

    const latestArticles = [
      { title: 'AWD vs FWD: The ₹2 Lakh Question', excerpt: 'A practical comparison between AWD and FWD systems for Indian roads.', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&h=400&fit=crop', date: 'January 15, 2025', readTime: '8 min read', category: 'Feature Reviews', slug: 'awd-vs-fwd' },
      { title: 'ADAS Lane Keep Assist: Why It Failed', excerpt: 'Real-world review of ADAS technology on Indian highways.', image: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=600&h=400&fit=crop', date: 'January 14, 2025', readTime: '6 min read', category: 'Feature Reviews', slug: 'adas-lane-keep-assist' },
      { title: 'FWD Car in Spiti Winter', excerpt: 'Can your FWD car handle Spiti in winter? The honest answer.', image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=600&h=400&fit=crop', date: 'January 13, 2025', readTime: '7 min read', category: 'Feature Reviews', slug: 'fwd-car-spiti-winter' },
      { title: 'Best Tyres for Highway Drives', excerpt: 'What nobody tells you about choosing tyres for long drives.', image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&h=400&fit=crop', date: 'January 12, 2025', readTime: '5 min read', category: 'Feature Reviews', slug: 'best-highway-tyres' }
    ]

    return (
      <>
        {this.renderHero()}
        
        {/* Stats Section */}
        <section className="relative -mt-16 pb-20">
          <div className="container-custom">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { number: '100+', label: 'Feature Guides', description: 'Comprehensive explanations' },
                { number: '10K+', label: 'Monthly Readers', description: 'Growing community' },
                { number: '50+', label: 'Tech Articles', description: 'Expert insights' },
                { number: '4+', label: 'Categories', description: 'Complete coverage' }
              ].map((stat, idx) => (
                <motion.div key={idx} variants={this.scaleUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: idx * 0.1 }} whileHover={{ y: -5 }} className="bg-white rounded-2xl shadow-xl p-6 text-center border border-gray-100">
                  <div className="text-3xl md:text-4xl font-bold text-yellow-500 mb-2">{stat.number}</div>
                  <div className="text-gray-800 font-semibold mb-1">{stat.label}</div>
                  <div className="text-gray-400 text-sm">{stat.description}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Search Section - Professional Placement */}
        {this.renderSearchSection()}

        {/* Featured Categories Section */}
        <section className="py-20 bg-gray-50">
          <div className="container-custom">
            <motion.div variants={this.fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
              <span className="text-yellow-500 font-semibold text-sm tracking-wider uppercase">Explore Technologies</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mt-3">Modern Vehicle Features</h2>
              <p className="text-gray-600 text-lg mt-4 max-w-2xl mx-auto">Discover the technologies shaping the future of automobiles</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {categories.map((category, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} whileHover={{ y: -5 }} className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="h-64 md:h-full overflow-hidden"><img src={category.image} alt={category.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /></div>
                    <div className="p-6 md:p-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{category.title}</h3>
                      <p className="text-gray-600 mb-4 leading-relaxed">{category.description}</p>
                      <div className="flex flex-wrap gap-2 mb-5">{category.stats.map((stat, i) => (<span key={i} className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-700">{stat}</span>))}</div>
                      <a href={category.link} className="inline-flex items-center text-yellow-500 font-semibold hover:text-yellow-600 transition-colors">Learn More →</a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Articles Section */}
        <section className="py-20 bg-white">
          <div className="container-custom">
            <motion.div variants={this.fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
              <span className="text-yellow-500 font-semibold text-sm tracking-wider uppercase">Latest Guides</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3">Popular Technology Articles</h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {latestArticles.map((article, idx) => (
                <motion.article key={idx} variants={this.scaleUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: idx * 0.1 }} whileHover={{ y: -8 }} className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                  <Link to={`/article/${article.slug}`}>
                    <div className="relative h-52 overflow-hidden"><img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /><div className="absolute top-4 left-4"><span className="px-3 py-1 bg-yellow-500 text-gray-900 text-xs font-semibold rounded-full">{article.category}</span></div></div>
                    <div className="p-5"><div className="flex items-center gap-3 text-xs text-gray-400 mb-3"><span>{article.date}</span><span>•</span><span>{article.readTime}</span></div><h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-yellow-500 transition-colors">{article.title}</h3><p className="text-gray-500 text-sm mb-4 line-clamp-3">{article.excerpt}</p><div className="inline-flex items-center text-yellow-500 font-semibold text-sm hover:text-yellow-600 transition-colors">Read Article →</div></div>
                  </Link>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-gray-50">
          <div className="container-custom">
            <motion.div variants={this.fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center max-w-4xl mx-auto">
              <span className="text-yellow-500 font-semibold text-sm tracking-wider uppercase">Testimonials</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3 mb-12">What Our Readers Say</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { quote: "The detailed explanations of ADAS features helped me understand exactly what to look for.", name: "Rahul Mehta", role: "New Car Buyer" },
                  { quote: "Finally a platform that explains EV battery technology in simple terms.", name: "Priya Singh", role: "EV Owner" },
                  { quote: "As a first-time car buyer, I was overwhelmed by all the technical jargon. Vaahan made it clear.", name: "Amit Sharma", role: "First Time Buyer" }
                ].map((testimonial, idx) => (
                  <motion.div key={idx} variants={this.scaleUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="bg-white rounded-xl p-6 text-left border border-gray-100 shadow-md">
                    <div className="flex text-yellow-400 mb-4">{[...Array(5)].map((_, i) => (<svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>))}</div>
                    <p className="text-gray-600 italic mb-4 leading-relaxed">"{testimonial.quote}"</p>
                    <div><p className="font-semibold text-gray-900">{testimonial.name}</p><p className="text-gray-400 text-sm">{testimonial.role}</p></div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {this.renderNewsletter()}
        {this.renderCTA()}
      </>
    )
  }
}

// Singleton pattern for Home page
let homePageInstance = null

export const getHomePage = () => {
  if (!homePageInstance) {
    homePageInstance = new HomePage({})
  }
  return homePageInstance
}

const Home = () => {
  const page = getHomePage()
  return page.render()
}

export default Home