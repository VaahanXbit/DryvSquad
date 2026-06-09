
import Hero from '../components/Hero'
import FeatureCard from '../components/FeatureCard'
import CategoryCard from '../components/CategoryCard'
import ArticleCard from '../components/ArticleCard'
import CTASection from '../components/CTASection'
import Newsletter from '../components/Newsletter'

const Home = () => {
  const stats = [
    { icon: '📚', title: 'Feature Guides', value: '100+' },
    { icon: '👥', title: 'Monthly Readers', value: '10K+' },
    { icon: '📝', title: 'Technology Articles', value: '50+' },
    { icon: '🏷️', title: 'Feature Categories', value: '4+' },
  ]

  const categories = [
    {
      title: 'Safety Features',
      description: 'Understand ABS, Airbags, Electronic Stability Control, Traction Control, and other safety technologies designed to protect passengers.',
      examples: ['ABS', 'Airbags', 'ESC', 'Traction Control'],
      icon: '🛡️',
      color: 'bg-red-50',
      link: '/category#safety',
    },
    {
      title: 'ADAS',
      description: 'Explore Advanced Driver Assistance Systems including Lane Keep Assist, Adaptive Cruise Control, Blind Spot Monitoring, and Automatic Emergency Braking.',
      examples: ['Lane Assist', 'Adaptive Cruise', 'Emergency Braking', 'Blind Spot'],
      icon: '🤖',
      color: 'bg-blue-50',
      link: '/category#adas',
    },
    {
      title: 'Connected Cars',
      description: 'Learn how smartphones, cloud services, GPS systems, and vehicle connectivity are transforming modern transportation.',
      examples: ['Remote Start', 'GPS Tracking', 'Mobile Apps', 'Telematics'],
      icon: '📱',
      color: 'bg-purple-50',
      link: '/category#connected',
    },
    {
      title: 'Electric Vehicles',
      description: 'Discover battery technologies, charging infrastructure, regenerative braking, range optimization, and EV ownership essentials.',
      examples: ['Battery Tech', 'Charging', 'Range', 'Regen Braking'],
      icon: '⚡',
      color: 'bg-green-50',
      link: '/category#ev',
    },
  ]

  const articles = [
    {
      title: 'ABS Explained',
      description: 'Learn how Anti-lock Braking Systems improve vehicle safety during emergency braking situations.',
      image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=250&fit=crop',
      link: '#',
    },
    {
      title: 'ADAS Explained',
      description: 'Understand the future of driving with Advanced Driver Assistance Systems.',
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=250&fit=crop',
      link: '#',
    },
    {
      title: 'Cruise Control Guide',
      description: 'Discover how cruise control improves highway driving comfort and fuel efficiency.',
      image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&h=250&fit=crop',
      link: '#',
    },
    {
      title: '360 Camera Technology',
      description: 'Learn how surround-view camera systems help drivers park safely and confidently.',
      image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=250&fit=crop',
      link: '#',
    },
  ]

  const whyVaahan = [
    { title: 'Simple Language', description: 'We explain complex automotive technologies in plain language that anyone can understand.', icon: '📖' },
    { title: 'Expert Research', description: 'Every guide is carefully researched to provide accurate and practical information.', icon: '🔬' },
    { title: 'Indian Market Focus', description: 'Our content is designed specifically for Indian vehicle buyers and driving conditions.', icon: '🇮🇳' },
    { title: 'Practical Advice', description: 'We focus on helping buyers make informed decisions rather than promoting products.', icon: '💡' },
  ]

  return (
    <>
      <Hero />
      
      {/* Statistics Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <h2 className="text-center text-3xl font-bold mb-12 text-dark-800">Trusted Automotive Knowledge Platform</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <FeatureCard key={idx} {...stat} delay={idx * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4 text-dark-800">Explore Vehicle Technologies</h2>
            <p className="text-gray-600">Learn about the technologies shaping modern vehicles and understand how they impact your driving experience.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, idx) => (
              <CategoryCard key={idx} {...category} delay={idx * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Vaahan Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <h2 className="text-center text-3xl font-bold mb-12 text-dark-800">Why Trust Vaahan International?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyVaahan.map((item, idx) => (
              <div key={idx} className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow">
                <div className="text-5xl mb-4">{item.icon}</div>
                <h4 className="text-xl font-bold mb-2 text-dark-800">{item.title}</h4>
                <p className="text-gray-500 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <h2 className="text-center text-3xl font-bold mb-12 text-dark-800">Popular Technology Guides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {articles.map((article, idx) => (
              <ArticleCard key={idx} {...article} delay={idx * 0.1} />
            ))}
          </div>
        </div>
      </section>

      <Newsletter />
      <CTASection />
    </>
  )
}

export default Home