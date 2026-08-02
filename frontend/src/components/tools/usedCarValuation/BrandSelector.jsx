// src/components/tools/usedCarValuation/BrandSelector.jsx
import { Building2 } from 'lucide-react';

/**
 * "Brand" field — options are fetched live from MongoDB via the hook, never
 * hardcoded in this component. Disabled until Registration Year is set,
 * since the year-first flow filters Model/Variant by it downstream.
 */
const BrandSelector = ({ value, options, isLoading, disabled, onChange }) => {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-semibold text-theme-secondary mb-2">
        <Building2 className="w-4 h-4 text-theme-tertiary" />
        Brand
      </label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={isLoading || disabled}
        className="input-field w-full disabled:opacity-60"
      >
        <option value="">
          {isLoading ? 'Loading brands...' : disabled ? 'Select registration year first' : 'Select Brand'}
        </option>
        {options.map((brand) => (
          <option key={brand.id} value={brand.id}>
            {brand.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default BrandSelector;
