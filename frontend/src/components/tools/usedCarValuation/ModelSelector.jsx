// src/components/tools/usedCarValuation/ModelSelector.jsx
import { Car } from 'lucide-react';

/**
 * "Model" field — populated only once a Brand is selected; options come
 * live from MongoDB (models scoped to the selected brandId).
 */
const ModelSelector = ({ value, options, isLoading, disabled, onChange }) => {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-semibold text-theme-secondary mb-2">
        <Car className="w-4 h-4 text-theme-tertiary" />
        Model
      </label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || isLoading}
        className="input-field w-full disabled:opacity-60"
      >
        <option value="">
          {isLoading ? 'Loading models...' : disabled ? 'Select a brand first' : 'Select Model'}
        </option>
        {options.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ModelSelector;
