// src/components/tools/evRangeCalculator/ConditionDropdown.jsx
import FieldHint from './FieldHint';

/**
 * Generic labeled dropdown, reused for every simple select field in the
 * form (Road Type, Driving Style, Terrain, Traffic) so identical-looking
 * inputs share one implementation instead of being duplicated.
 */
const ConditionDropdown = ({ icon: Icon, label, value, options, onChange, hint }) => {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-semibold text-theme-secondary mb-2">
        {Icon && <Icon className="w-4 h-4 text-theme-tertiary" />}
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field w-full"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <FieldHint>{hint}</FieldHint>
    </div>
  );
};

export default ConditionDropdown;
