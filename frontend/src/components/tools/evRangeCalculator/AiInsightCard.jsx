// src/components/tools/evRangeCalculator/AiInsightCard.jsx
import { Sparkles } from 'lucide-react';

/**
 * "AI Insight" — a single natural-language sentence, never any internal
 * formula/multiplier details.
 */
const AiInsightCard = ({ insight }) => {
  return (
    <div className="card p-5 sm:p-6 h-full">
      <h3 className="flex items-center gap-2 font-semibold text-theme-primary mb-3">
        <Sparkles className="w-4 h-4" style={{ color: 'var(--brand-gold)' }} />
        AI Insight
      </h3>
      <p className="text-sm text-theme-secondary leading-relaxed">{insight}</p>
    </div>
  );
};

export default AiInsightCard;
