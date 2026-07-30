// src/components/tools/usedCarValuation/ValueComparisonCard.jsx
/*
================================================================================
File Name : ValueComparisonCard.jsx
Description : "Value Comparison" — Dealer Exchange / Direct Buyer / Online
              Marketplace / Auction. Renders the backend's
              `channelComparison` array as-is; the relative bar width is
              purely visual (scaled against the highest amount in the
              list) and computes nothing about the price itself.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

import { formatRupeesShort } from '../../../constants/usedCarValuation';

const ValueComparisonCard = ({ channels }) => {
  const maxAmount = Math.max(...channels.map((c) => c.amount), 1);

  return (
    <div className="card p-5 sm:p-6 h-full">
      <h3 className="font-bold text-theme-primary mb-4">Value Comparison</h3>
      <div className="space-y-4">
        {channels.map((channel) => (
          <div key={channel.channel}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm text-theme-secondary">{channel.label}</span>
              <span className="text-sm font-bold text-theme-primary">{formatRupeesShort(channel.amount)}</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${(channel.amount / maxAmount) * 100}%`, backgroundColor: 'var(--brand-gold)' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ValueComparisonCard;
