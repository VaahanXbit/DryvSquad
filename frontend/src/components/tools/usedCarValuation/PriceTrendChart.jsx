// src/components/tools/usedCarValuation/PriceTrendChart.jsx
/*
================================================================================
File Name : PriceTrendChart.jsx
Description : "Price Trend (Last 12 Months)". Renders the backend's
              `priceTrend` array (currently a DEMO generator — see
              priceTrend.js — architected so a live data source can be
              swapped in later without this component changing at all,
              since it only ever consumes { month, value } points).

              Interactive hover/touch tooltip — follows the cursor,
              snapping to the nearest month, showing Month / Estimated
              Price / Price Change (vs. the previous point). Works with
              mouse (desktop) and touch (mobile) on the same handlers.

              Built as a small dependency-free inline SVG line chart, so
              this doesn't require adding a charting library to the
              project just for one chart.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

import { useRef, useState } from 'react';
import { formatRupeesShort } from '../../../constants/usedCarValuation';

const WIDTH = 600;
const HEIGHT = 180;
const PADDING = { top: 10, right: 10, bottom: 24, left: 10 };

const PriceTrendChart = ({ points, currentValue }) => {
  const svgRef = useRef(null);
  const [hoverIndex, setHoverIndex] = useState(null);

  if (!points?.length) return null;

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const chartW = WIDTH - PADDING.left - PADDING.right;
  const chartH = HEIGHT - PADDING.top - PADDING.bottom;

  const coords = points.map((p, i) => ({
    x: PADDING.left + (i / (points.length - 1)) * chartW,
    y: PADDING.top + chartH - ((p.value - min) / range) * chartH,
    month: p.month,
    value: p.value,
  }));

  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${HEIGHT - PADDING.bottom} L ${coords[0].x.toFixed(1)} ${HEIGHT - PADDING.bottom} Z`;

  const updateHoverFromClientX = (clientX) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = WIDTH / rect.width;
    const svgX = (clientX - rect.left) * scaleX;

    let nearestIndex = 0;
    let nearestDistance = Infinity;
    coords.forEach((c, i) => {
      const distance = Math.abs(c.x - svgX);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = i;
      }
    });
    setHoverIndex(nearestIndex);
  };

  const handleMouseMove = (e) => updateHoverFromClientX(e.clientX);
  const handleTouchMove = (e) => {
    if (e.touches?.[0]) updateHoverFromClientX(e.touches[0].clientX);
  };
  const handleLeave = () => setHoverIndex(null);

  const hovered = hoverIndex !== null ? coords[hoverIndex] : null;
  const previousValue = hoverIndex !== null && hoverIndex > 0 ? coords[hoverIndex - 1].value : null;
  const changePercent = hovered && previousValue
    ? ((hovered.value - previousValue) / previousValue) * 100
    : 0;

  // Tooltip position as a percentage of container width/height, so it
  // stays correctly placed regardless of the SVG's actual rendered size.
  const tooltipLeftPct = hovered ? (hovered.x / WIDTH) * 100 : 0;
  const tooltipTopPct = hovered ? (hovered.y / HEIGHT) * 100 : 0;

  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="font-bold text-theme-primary">Price Trend</h3>
          <p className="text-xs text-theme-tertiary">Last 12 Months</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-theme-tertiary">Current Value</p>
          <p className="text-sm font-bold" style={{ color: 'var(--brand-navy)' }}>{formatRupeesShort(currentValue)}</p>
        </div>
      </div>

      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full touch-none"
          style={{ maxHeight: 200 }}
          preserveAspectRatio="none"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleLeave}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleLeave}
        >
          <path d={areaPath} fill="var(--brand-gold)" opacity="0.12" />
          <path d={linePath} fill="none" stroke="var(--brand-gold)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

          {hovered && (
            <line
              x1={hovered.x} y1={PADDING.top} x2={hovered.x} y2={HEIGHT - PADDING.bottom}
              stroke="var(--border-primary)" strokeWidth="1" strokeDasharray="3 3"
            />
          )}

          {coords.map((c, i) => (
            <circle
              key={i}
              cx={c.x}
              cy={c.y}
              r={hoverIndex === i ? 5 : i === coords.length - 1 ? 4 : 2.5}
              fill="var(--brand-gold)"
              className="transition-all duration-100"
            />
          ))}
        </svg>

        {hovered && (
          <div
            className="absolute z-10 pointer-events-none px-3 py-2 rounded-lg shadow-lg text-xs whitespace-nowrap transition-all duration-100"
            style={{
              left: `${tooltipLeftPct}%`,
              top: `${tooltipTopPct}%`,
              transform: `translate(${tooltipLeftPct > 80 ? '-100%' : tooltipLeftPct < 10 ? '0%' : '-50%'}, -120%)`,
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-primary)',
            }}
          >
            <p className="font-semibold text-theme-primary">{hovered.month}</p>
            <p className="text-theme-secondary">{formatRupeesShort(hovered.value)}</p>
            {previousValue !== null && (
              <p className={changePercent < 0 ? 'text-red-600 dark:text-red-400' : changePercent > 0 ? 'text-green-600 dark:text-green-400' : 'text-theme-tertiary'}>
                {changePercent > 0 ? '+' : ''}{changePercent.toFixed(1)}%
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-between mt-1">
        {coords.filter((_, i) => i % 2 === 0 || i === coords.length - 1).map((c, i) => (
          <span key={i} className="text-[10px] text-theme-tertiary">{c.month}</span>
        ))}
      </div>
    </div>
  );
};

export default PriceTrendChart;
