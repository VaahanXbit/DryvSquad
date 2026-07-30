// src/components/tools/usedCarValuation/ResultCard.jsx
/*
================================================================================
File Name : ResultCard.jsx
Description : Right column — the valuation dashboard. Composes, top to
              bottom, exactly what the product review asked for:

                1. Estimated Market Value + Confidence Score (directly
                   below the price) + "Why This Price?" (opens the
                   drawer instead of a permanently-visible breakdown) +
                   Recommended Price Range gradient bar.
                2. Market Demand / Expected Selling Time / Vehicle Health
                   Score mini cards.
                3. Value Comparison + Depreciation Summary.
                4. Price Trend (Last 12 Months).
                5. Similar Cars in Market.

              Every section renders a piece of the single `result` object
              returned from POST /valuate — no card recomputes anything.
================================================================================
*/

import { Info } from 'lucide-react';
import MarketDemandCard from './MarketDemandCard';
import ValueComparisonCard from './ValueComparisonCard';
import DepreciationSummaryCard from './DepreciationSummaryCard';
import PriceTrendChart from './PriceTrendChart';
import SimilarCarsTable from './SimilarCarsTable';
import WhyThisPriceDrawer from './WhyThisPriceDrawer';
import { formatRupeesShort } from '../../../constants/usedCarValuation';

const ResultCard = ({ result, isDrawerOpen, onOpenDrawer, onCloseDrawer, onSelectSimilarCar }) => {
  const {
    vehicle, estimatedValue, priceRange, confidence,
    marketDemand, channelComparison,
    depreciationSummary, priceTrend, similarCars, drawerRows,
  } = result;

  return (
    <div className="space-y-4 relative">
      {/* Estimated Market Value + Confidence (below price) + Why This Price? + Price Range */}
      <div className="card p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3 mb-1">
          <h2 className="font-bold text-theme-primary">Estimated Market Value</h2>
          <button
            type="button"
            onClick={onOpenDrawer}
            className="text-sm font-semibold flex-shrink-0"
            style={{ color: 'var(--brand-gold)' }}
          >
            Why this price?
          </button>
        </div>
        
        {/* Vehicle name */}
        <p className="text-sm text-theme-tertiary mb-4">
          {vehicle.brand} {vehicle.model} &middot; {vehicle.variant}
        </p>

        {/* Price - primary focus */}
        <div className="flex items-center gap-3 flex-wrap mb-2">
          <span className="text-4xl sm:text-5xl font-extrabold text-theme-primary">
            {formatRupeesShort(estimatedValue.amount)}
          </span>
        </div>

        {/* Confidence Badge - now directly below the price with FULL GREEN TEXT */}
        <div className="mb-4">
          <span
            className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-full"
            style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}
            title={confidence.description}
          >
            <span className="text-green-500 text-base">●</span>
            Confidence: {confidence.score}%
            <Info className="w-3 h-3 opacity-60" style={{ color: '#22c55e' }} />
          </span>
        </div>

        <div className="pt-4 mt-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
          <span className="text-xs font-semibold text-theme-tertiary mb-2 block">Recommended Price Range</span>
          <div className="flex items-center justify-between gap-4 mb-2">
            <span className="text-base font-bold text-theme-primary">{formatRupeesShort(priceRange.min)}</span>
            <span className="text-base font-bold text-theme-primary">{formatRupeesShort(priceRange.max)}</span>
          </div>
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ background: 'linear-gradient(to right, #f97316, #f59e0b, #eab308, #22c55e)' }}
          />
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-xs font-semibold text-theme-secondary">Good</span>
            <span className="text-xs font-semibold text-green-600 dark:text-green-400">Excellent</span>
          </div>
        </div>
      </div>

      {/* Market Demand / Expected Selling Time */}
      <MarketDemandCard marketDemand={marketDemand} />

      {/* Value Comparison + Depreciation Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ValueComparisonCard channels={channelComparison} />
        <DepreciationSummaryCard summary={depreciationSummary} />
      </div>

      {/* Price Trend */}
      <PriceTrendChart points={priceTrend} currentValue={estimatedValue.amount} />

      {/* Similar Cars */}
      <SimilarCarsTable cars={similarCars} onSelectCar={onSelectSimilarCar} />

      {/* Drawer - positioned relative to this container */}
      <WhyThisPriceDrawer isOpen={isDrawerOpen} onClose={onCloseDrawer} rows={drawerRows} />
    </div>
  );
};

export default ResultCard;