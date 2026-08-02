// src/components/tools/usedCarValuation/OwnerSelector.jsx
import { Users } from 'lucide-react';
import { OWNER_OPTIONS } from '../../../constants/usedCarValuation';

const OwnerSelector = ({ value, onChange }) => {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-semibold text-theme-secondary mb-2">
        <Users className="w-4 h-4 text-theme-tertiary" />
        Owner
      </label>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="input-field w-full"
      >
        {OWNER_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default OwnerSelector;
