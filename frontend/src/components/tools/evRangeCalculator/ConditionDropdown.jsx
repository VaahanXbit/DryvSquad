// src/components/tools/evRangeCalculator/ConditionDropdown.jsx

/**
 * Generic labeled dropdown, reused for every simple select field in the
 * form (Outside Temperature, Road Type, Average Speed, Driving Style,
 * Terrain, Traffic) so the six identical-looking inputs share one
 * implementation instead of being duplicated six times.
 */
const ConditionDropdown = ({ icon: Icon, label, value, options, onChange }) => {
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
    </div>
  );
};

export default ConditionDropdown;
