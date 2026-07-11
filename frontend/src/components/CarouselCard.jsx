// src/components/CarouselCard.jsx
/*
================================================================================
File Name : CarouselCard.jsx
Description : Single card used inside the homepage Travel Logs, Technology
              Guides, and Testimonials carousels — image-only, editorial
              style. No entrance/hover transforms on the card itself (only
              the poster image zooms, clipped inside its own frame) so the
              row never grows a stray vertical scrollbar and cards render
              instantly with zero delay while scrolling — same as
              Netflix / Prime style rows.
================================================================================
*/

import { Link } from 'react-router-dom'

const CarouselCard = ({
  to,
  image,
  fallbackImage,
  category,
  title,
  isDark,
  cardShadowClass,
}) => {
  return (
    <article
      className={`group flex-shrink-0 w-[62vw] xs:w-[54vw] sm:w-[240px] md:w-[260px] lg:w-[280px] rounded-xl overflow-hidden will-change-transform ${cardShadowClass} transition-shadow duration-300 ease-out ${!isDark && 'border border-gray-100'}`}
    >
      <Link to={to} className="block h-full">
        <div className="relative w-full aspect-[3/4] overflow-hidden rounded-xl">
          <img
            src={image}
            alt={title}
            draggable="false" // IMPORTANT: Prevents the browser's default ghost image dragging
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.06]"
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
    </article>
  )
}

export default CarouselCard