// src/components/CarouselCard.jsx
/*
================================================================================
File Name : CarouselCard.jsx
Description : Single card used inside the homepage Travel Logs and Technology
              Guides carousels — image-only, editorial style.
================================================================================
*/

import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const CarouselCard = ({
  to,
  image,
  fallbackImage,
  category,
  title,
  isDark,
  cardShadowClass,
  delay = 0,
}) => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.45, ease: 'easeOut' }}
      whileHover={{ y: -6, transition: { type: 'spring', stiffness: 300, damping: 22 } }}
      // REMOVED 'snap-start' from the class string below
      className={`group flex-shrink-0 w-[62vw] xs:w-[54vw] sm:w-[240px] md:w-[260px] lg:w-[280px] rounded-xl overflow-hidden will-change-transform ${cardShadowClass} transition-shadow duration-500 ease-out ${!isDark && 'border border-gray-100'}`}
    >
      <Link to={to} className="block h-full">
        <div className="relative w-full aspect-[3/4] overflow-hidden">
          <img
            src={image}
            alt={title}
            draggable="false" // IMPORTANT: Prevents the browser's default ghost image dragging
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]"
            onError={(e) => {
              if (fallbackImage) e.target.src = fallbackImage
            }}
          />
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />

          <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3.5 pointer-events-none">
            <span className="text-yellow-400 text-[9px] sm:text-[10px] md:text-[11px] font-semibold uppercase tracking-wider">
              {category}
            </span>
            <h4 className="text-white font-bold text-xs sm:text-sm md:text-base leading-snug line-clamp-2 mt-0.5">
              {title}
            </h4>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}

export default CarouselCard