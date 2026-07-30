// src/components/tools/usedCarValuation/VariantSelector.jsx
import { Settings2 } from 'lucide-react';

/**
 * "Variant" field — populated only once a Model is selected; options come
 * live from MongoDB (variants scoped to the selected modelId). Selecting a
 * variant is what resolves the complete vehicle document (including
 * exShowroomPrice, used as Base Price) on the backend.
 */
const VariantSelector = ({ value, options, isLoading, disabled, onChange }) => {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-semibold text-theme-secondary mb-2">
        <Settings2 className="w-4 h-4 text-theme-tertiary" />
        Variant
      </label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || isLoading}
        className="input-field w-full disabled:opacity-60"
      >
        <option value="">
          {isLoading ? 'Loading variants...' : disabled ? 'Select a model first' : 'Select Variant'}
        </option>
        {options.map((variant) => (
          <option key={variant.id} value={variant.id}>
            {variant.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default VariantSelector;
