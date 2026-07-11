// src/components/skeletons/Skeletons.jsx
/*
================================================================================
File Name : Skeletons.jsx
Description : Reusable, production-grade skeleton loaders with a premium
               shimmer animation. Every skeleton here is sized to match the
               real component it stands in for, so swapping skeleton -> real
               content never shifts layout (no CLS).
Usage       : import { SkeletonStyles, ArticleCardSkeleton, ... } from
               '../components/skeletons/Skeletons'
              Render <SkeletonStyles /> once near the top of any page that
              uses these skeletons (it injects the shared shimmer CSS).
================================================================================
*/

import { useTheme } from '../../context/ThemeContext'

// --------------------------------------------------------------------------
// Shared shimmer CSS — injected once per page via <SkeletonStyles />.
// Safe to render multiple times (browsers dedupe identical style rules
// harmlessly), but pages should only need one instance.
// --------------------------------------------------------------------------
export const SkeletonStyles = () => (
  <style>{`
    @keyframes ds-shimmer-sweep {
      0% { background-position: -400px 0; }
      100% { background-position: 400px 0; }
    }
    .ds-shimmer {
      position: relative;
      overflow: hidden;
      background-size: 800px 100%;
      background-repeat: no-repeat;
      animation: ds-shimmer-sweep 1.6s ease-in-out infinite;
    }
    .ds-shimmer-light {
      background-image: linear-gradient(
        90deg,
        rgba(226, 232, 240, 0.9) 25%,
        rgba(241, 245, 249, 1) 37%,
        rgba(226, 232, 240, 0.9) 63%
      );
    }
    .ds-shimmer-dark {
      background-image: linear-gradient(
        90deg,
        rgba(51, 65, 85, 0.6) 25%,
        rgba(71, 85, 105, 0.55) 37%,
        rgba(51, 65, 85, 0.6) 63%
      );
    }
    @media (prefers-reduced-motion: reduce) {
      .ds-shimmer { animation: none; }
    }
    .ds-fade-in {
      animation: ds-fade-in 200ms ease-out both;
    }
    @keyframes ds-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `}</style>
)

// --------------------------------------------------------------------------
// Primitive shimmer block. All skeletons are built from this.
// --------------------------------------------------------------------------
export const Shimmer = ({ className = '', isDark, style }) => (
  <div
    className={`ds-shimmer ${isDark ? 'ds-shimmer-dark' : 'ds-shimmer-light'} rounded-md ${className}`}
    style={style}
  />
)

// Small helper so every skeleton also works standalone without the caller
// needing to know about ThemeContext.
const useIsDark = (isDarkProp) => {
  // Allow explicit override, otherwise read from ThemeContext.
  if (typeof isDarkProp === 'boolean') return isDarkProp
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { isDark } = useTheme()
    return isDark
  } catch {
    return false
  }
}

// --------------------------------------------------------------------------
// Fade wrapper — used by pages to cross-fade skeleton -> real content.
// --------------------------------------------------------------------------
export const FadeIn = ({ children, className = '' }) => (
  <div className={`ds-fade-in ${className}`}>{children}</div>
)

// ============================================================================
// HERO / BANNER
// ============================================================================
export const HeroSkeleton = ({ isDark: isDarkProp }) => {
  const isDark = useIsDark(isDarkProp)
  return (
    <section className="relative w-full overflow-hidden bg-transparent pt-[var(--header-height,72px)] lg:pt-0">
      <div className="w-full relative aspect-[4/5] lg:aspect-[1672/941]">
        <Shimmer isDark={isDark} className="absolute inset-0 rounded-none" />
      </div>
    </section>
  )
}

export const BannerSkeleton = ({ isDark: isDarkProp, className = '' }) => {
  const isDark = useIsDark(isDarkProp)
  return (
    <Shimmer
      isDark={isDark}
      className={`w-full rounded-xl aspect-[16/6] ${className}`}
    />
  )
}

// ============================================================================
// ARTICLE / TRAVELOGUE CARDS (matches Articles.jsx / Travelogues.jsx grid)
// ============================================================================
export const ArticleCardSkeleton = ({ isDark: isDarkProp }) => {
  const isDark = useIsDark(isDarkProp)
  return (
    <div className={`rounded-xl overflow-hidden shadow-md ${isDark ? 'bg-dark-800' : 'bg-white'}`}>
      <Shimmer isDark={isDark} className="w-full h-40 sm:h-44 md:h-48 lg:h-52 rounded-none" />
      <div className="p-4 sm:p-5 space-y-3">
        <Shimmer isDark={isDark} className="h-3 w-24" />
        <Shimmer isDark={isDark} className="h-4 w-full" />
        <Shimmer isDark={isDark} className="h-4 w-3/4" />
        <Shimmer isDark={isDark} className="h-3 w-full" />
        <Shimmer isDark={isDark} className="h-3 w-2/3" />
        <div className="flex items-center justify-between pt-1">
          <Shimmer isDark={isDark} className="h-3 w-20" />
          <Shimmer isDark={isDark} className="h-3 w-16" />
        </div>
      </div>
    </div>
  )
}

// Travelogue card layout is identical to the article card in this codebase.
export const TravelogueCardSkeleton = (props) => <ArticleCardSkeleton {...props} />

export const CardGridSkeleton = ({ count = 6, isDark: isDarkProp, CardComponent = ArticleCardSkeleton }) => {
  const isDark = useIsDark(isDarkProp)
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <CardComponent key={i} isDark={isDark} />
      ))}
    </div>
  )
}

// ============================================================================
// CAROUSEL (Home.jsx horizontal Travelogue / Technology Guides rows)
// ============================================================================
export const CarouselSkeleton = ({ count = 4, isDark: isDarkProp }) => {
  const isDark = useIsDark(isDarkProp)
  return (
    <div className="flex gap-4 sm:gap-5 md:gap-6 overflow-x-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`shrink-0 w-[220px] sm:w-[260px] md:w-[280px] rounded-xl overflow-hidden shadow-md ${isDark ? 'bg-dark-800' : 'bg-white'}`}
        >
          <Shimmer isDark={isDark} className="w-full h-32 sm:h-36 md:h-40 rounded-none" />
          <div className="p-3 sm:p-4 space-y-2.5">
            <Shimmer isDark={isDark} className="h-2.5 w-16" />
            <Shimmer isDark={isDark} className="h-3.5 w-full" />
            <Shimmer isDark={isDark} className="h-3.5 w-2/3" />
            <Shimmer isDark={isDark} className="h-2.5 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// CATEGORY FILTER PILLS (sticky bar in Articles.jsx / Travelogues.jsx)
// ============================================================================
export const CategorySkeleton = ({ count = 5, isDark: isDarkProp }) => {
  const isDark = useIsDark(isDarkProp)
  const widths = ['w-14', 'w-20', 'w-24', 'w-16', 'w-28', 'w-20']
  return (
    <div className="flex flex-nowrap gap-2 py-2.5 sm:py-3 md:py-4 overflow-x-auto hide-scrollbar">
      {Array.from({ length: count }).map((_, i) => (
        <Shimmer
          key={i}
          isDark={isDark}
          className={`shrink-0 h-8 sm:h-9 md:h-10 rounded-full ${widths[i % widths.length]}`}
        />
      ))}
    </div>
  )
}

// ============================================================================
// COMPARE CARS
// ============================================================================
export const CompareCardSkeleton = ({ isDark: isDarkProp }) => {
  const isDark = useIsDark(isDarkProp)
  return (
    <div className={`rounded-xl overflow-hidden shadow-md p-4 sm:p-5 ${isDark ? 'bg-dark-800' : 'bg-white'}`}>
      <Shimmer isDark={isDark} className="w-full h-36 sm:h-40 md:h-44 mb-4" />
      <Shimmer isDark={isDark} className="h-3 w-20 mb-2" />
      <Shimmer isDark={isDark} className="h-4 w-3/4 mb-3" />
      <Shimmer isDark={isDark} className="h-5 w-1/2 mb-4" />
      <div className="grid grid-cols-2 gap-2">
        <Shimmer isDark={isDark} className="h-3 w-full" />
        <Shimmer isDark={isDark} className="h-3 w-full" />
        <Shimmer isDark={isDark} className="h-3 w-full" />
        <Shimmer isDark={isDark} className="h-3 w-full" />
      </div>
    </div>
  )
}

export const CompareCardGridSkeleton = ({ count = 4, isDark: isDarkProp }) => {
  const isDark = useIsDark(isDarkProp)
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CompareCardSkeleton key={i} isDark={isDark} />
      ))}
    </div>
  )
}

export const ComparisonTableSkeleton = ({ rows = 8, isDark: isDarkProp }) => {
  const isDark = useIsDark(isDarkProp)
  return (
    <div className={`rounded-xl overflow-hidden shadow-md ${isDark ? 'bg-dark-800' : 'bg-white'}`}>
      {/* Two-column header, mirrors the two cars being compared */}
      <div className="grid grid-cols-2 gap-4 p-4 sm:p-6 border-b border-dashed border-gray-500/20">
        {[0, 1].map((i) => (
          <div key={i} className="flex flex-col items-center text-center gap-3">
            <Shimmer isDark={isDark} className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg" />
            <Shimmer isDark={isDark} className="h-3 w-20" />
            <Shimmer isDark={isDark} className="h-4 w-28" />
          </div>
        ))}
      </div>
      {/* Spec rows */}
      <div className="divide-y divide-gray-500/10">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="grid grid-cols-3 gap-4 items-center px-4 sm:px-6 py-3 sm:py-4">
            <Shimmer isDark={isDark} className="h-3 w-full" />
            <Shimmer isDark={isDark} className="h-3 w-2/3 mx-auto" />
            <Shimmer isDark={isDark} className="h-3 w-2/3 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// ARTICLE / TRAVELOGUE DETAIL PAGE (hero + body, matches ArticleDetail.jsx /
// TravelogueDetail.jsx layout exactly so there's no jump when data lands)
// ============================================================================
const DetailSkeletonBase = ({ isDark }) => (
  <>
    {/* Hero Section */}
    <section className="relative overflow-hidden pt-24 sm:pt-28 md:pt-32 pb-10 sm:pb-12 md:pb-16 bg-gradient-to-r from-blue-950 via-slate-900 to-slate-700">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="container-custom relative z-10 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Shimmer isDark={false} className="h-3 w-32 mb-5 bg-white/10" />
          <div className="flex flex-wrap gap-2 mb-4 sm:mb-5">
            <Shimmer isDark={false} className="h-6 w-24 rounded-full bg-white/10" />
            <Shimmer isDark={false} className="h-6 w-20 rounded-full bg-white/10" />
          </div>
          <Shimmer isDark={false} className="h-9 sm:h-12 md:h-14 w-full mb-3 bg-white/10" />
          <Shimmer isDark={false} className="h-9 sm:h-12 md:h-14 w-2/3 mb-5 bg-white/10" />
          <div className="flex items-center gap-4">
            <Shimmer isDark={false} className="h-3 w-28 bg-white/10" />
            <Shimmer isDark={false} className="h-3 w-24 bg-white/10" />
          </div>
        </div>
      </div>
    </section>

    {/* Content Section */}
    <section className={`py-8 sm:py-12 md:py-16 transition-colors duration-300 ${isDark ? 'bg-dark-900' : 'bg-white'}`}>
      <div className="container-custom">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Shimmer isDark={isDark} className="w-full aspect-[16/9] rounded-xl mb-6 sm:mb-8" />
          <div className="space-y-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <Shimmer
                key={i}
                isDark={isDark}
                className={`h-3.5 ${i % 4 === 3 ? 'w-2/3' : 'w-full'}`}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t border-gray-500/10">
            {Array.from({ length: 4 }).map((_, i) => (
              <Shimmer key={i} isDark={isDark} className="h-6 w-16 rounded-full" />
            ))}
          </div>
        </div>
      </div>
    </section>
  </>
)

export const ArticleDetailSkeleton = ({ isDark: isDarkProp }) => {
  const isDark = useIsDark(isDarkProp)
  return <DetailSkeletonBase isDark={isDark} />
}

export const TravelogueDetailSkeleton = ({ isDark: isDarkProp }) => {
  const isDark = useIsDark(isDarkProp)
  return <DetailSkeletonBase isDark={isDark} />
}

// ============================================================================
// COMMENTS
// ============================================================================
export const CommentSkeleton = ({ isDark: isDarkProp }) => {
  const isDark = useIsDark(isDarkProp)
  return (
    <div className="flex gap-3 py-4">
      <Shimmer isDark={isDark} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Shimmer isDark={isDark} className="h-3 w-32" />
        <Shimmer isDark={isDark} className="h-3 w-full" />
        <Shimmer isDark={isDark} className="h-3 w-2/3" />
      </div>
    </div>
  )
}

export const CommentListSkeleton = ({ count = 3, isDark: isDarkProp }) => {
  const isDark = useIsDark(isDarkProp)
  return (
    <div className="divide-y divide-gray-500/10">
      {Array.from({ length: count }).map((_, i) => (
        <CommentSkeleton key={i} isDark={isDark} />
      ))}
    </div>
  )
}

// ============================================================================
// SEARCH
// ============================================================================
export const SearchSkeleton = ({ isDark: isDarkProp }) => {
  const isDark = useIsDark(isDarkProp)
  return <Shimmer isDark={isDark} className="w-full h-12 sm:h-14 rounded-xl" />
}

// ============================================================================
// SIDEBAR (generic list — related links, tags, filters, etc.)
// ============================================================================
export const SidebarSkeleton = ({ rows = 5, isDark: isDarkProp }) => {
  const isDark = useIsDark(isDarkProp)
  return (
    <div className="space-y-4">
      <Shimmer isDark={isDark} className="h-4 w-1/2" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Shimmer isDark={isDark} className="w-10 h-10 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <Shimmer isDark={isDark} className="h-3 w-full" />
            <Shimmer isDark={isDark} className="h-2.5 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default {
  SkeletonStyles,
  Shimmer,
  FadeIn,
  HeroSkeleton,
  BannerSkeleton,
  ArticleCardSkeleton,
  TravelogueCardSkeleton,
  CardGridSkeleton,
  CarouselSkeleton,
  CategorySkeleton,
  CompareCardSkeleton,
  CompareCardGridSkeleton,
  ComparisonTableSkeleton,
  ArticleDetailSkeleton,
  TravelogueDetailSkeleton,
  CommentSkeleton,
  CommentListSkeleton,
  SearchSkeleton,
  SidebarSkeleton,
}