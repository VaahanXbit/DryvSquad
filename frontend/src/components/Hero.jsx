import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import carHero from "../assets/hero.png";


const Hero = () => {
    return (
        <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary-300 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-300 rounded-full blur-3xl"></div>
            </div>

            <div className="container-custom relative z-10 py-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="inline-block px-4 py-1.5 bg-primary-100 rounded-full text-primary-700 text-sm font-semibold mb-6"
                        >
                            🚗 Trusted by 10,000+ Indian Car Buyers
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
                        >
                            Modern Car Features{' '}
                            <span className="text-gradient">Explained Simply</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            className="text-xl text-gray-600 mb-4"
                        >
                            Helping Indian car buyers understand automotive technology before making a purchase decision.
                        </motion.p>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                            className="text-gray-500 mb-8"
                        >
                            From safety features like ABS and Airbags to advanced technologies such as ADAS, Connected Cars, and Electric Vehicles, Vaahan International simplifies complex automotive concepts into easy-to-understand guides.
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.5 }}
                            className="flex flex-wrap gap-4"
                        >
                            <Link to="/category" className="btn-primary">
                                Explore Features →
                            </Link>
                            <Link to="/about" className="btn-secondary">
                                Learn More
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* Right Image */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, x: 50 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
                        className="relative"
                    >
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                            <img
                                src={carHero}
                                alt="Modern Car Technology"
                                className="w-full h-auto object-cover"
                                loading="eager"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-dark-900/20 to-transparent"></div>
                        </div>
                        {/* Floating Badges */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="absolute -top-6 -left-6 bg-white rounded-lg shadow-lg px-4 py-2"
                        >
                            <span className="text-primary-600 font-bold">100+</span>
                            <span className="text-gray-600 text-sm ml-1">Features</span>
                        </motion.div>
                        <motion.div
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
                            className="absolute -bottom-4 -right-4 bg-white rounded-lg shadow-lg px-4 py-2"
                        >
                            <span className="text-secondary-600 font-bold">10K+</span>
                            <span className="text-gray-600 text-sm ml-1">Readers</span>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

export default Hero