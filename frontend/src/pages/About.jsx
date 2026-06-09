
import { motion } from 'framer-motion'

const About = () => {
  const values = [
    { title: 'Transparency', description: 'We provide clear, honest information about vehicle technologies without any bias.', icon: '🔍' },
    { title: 'Accuracy', description: 'Every piece of information is verified and up-to-date with the latest automotive standards.', icon: '✅' },
    { title: 'Innovation', description: 'We continuously update our content to cover emerging technologies and trends.', icon: '💡' },
    { title: 'Education', description: 'Our goal is to empower buyers with knowledge for better decision making.', icon: '🎓' },
  ]

  const team = [
    { name: 'Founder', role: 'Automotive Technology Expert', icon: '👨‍💼' },
    { name: 'Editor', role: 'Technical Writer & Editor', icon: '👩‍💻' },
    { name: 'Research Team', role: 'Automotive Researchers', icon: '👥' },
  ]

  const techCategories = [
    { name: 'Safety Technologies', items: 'ABS, Airbags, ESC, Traction Control, Child Safety Systems' },
    { name: 'Driver Assistance Systems', items: 'Lane Keep Assist, Adaptive Cruise Control, Emergency Braking' },
    { name: 'Connected Technologies', items: 'Smartphone Connectivity, Navigation, Telematics, Remote Monitoring' },
    { name: 'Electric Vehicles', items: 'Battery Systems, Charging Infrastructure, EV Ownership' },
  ]

  return (
    <>
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="container-custom text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            About Vaahan International
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-primary-100 max-w-2xl mx-auto"
          >
            Making automotive technology easy to understand for every Indian car buyer
          </motion.p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center p-8 bg-primary-50 rounded-2xl"
            >
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold mb-3 text-dark-800">Our Mission</h3>
              <p className="text-gray-600">
                Our mission is to simplify modern automotive technology and help Indian buyers make informed vehicle purchasing decisions.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center p-8 bg-secondary-50 rounded-2xl"
            >
              <div className="text-5xl mb-4">👁️</div>
              <h3 className="text-2xl font-bold mb-3 text-dark-800">Our Vision</h3>
              <p className="text-gray-600">
                To become India's most trusted platform for understanding vehicle technologies and automotive innovation.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What We Cover */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-dark-800 mb-4">What We Cover</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Comprehensive guides across all major automotive technology categories
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {techCategories.map((category, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
              >
                <h4 className="text-xl font-bold text-primary-600 mb-2">{category.name}</h4>
                <p className="text-gray-500 text-sm">{category.items}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-dark-800 mb-4">Our Core Values</h2>
            <p className="text-gray-600">The principles that guide everything we do</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 rounded-xl bg-gray-50 hover:bg-primary-50 transition-colors"
              >
                <div className="text-4xl mb-3">{value.icon}</div>
                <h4 className="text-lg font-bold text-dark-800 mb-2">{value.title}</h4>
                <p className="text-gray-500 text-sm">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-dark-800 mb-4">Meet Our Team</h2>
            <p className="text-gray-600">Passionate experts dedicated to simplifying automotive technology</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {team.map((member, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-32 h-32 bg-primary-100 rounded-full flex items-center justify-center text-5xl mx-auto mb-4">
                  {member.icon}
                </div>
                <h4 className="text-xl font-bold text-dark-800">{member.name}</h4>
                <p className="text-gray-500">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default About