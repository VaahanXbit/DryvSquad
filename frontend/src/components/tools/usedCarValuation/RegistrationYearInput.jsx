// src/components/tools/usedCarValuation/RegistrationYearInput.jsx
import { CalendarDays } from 'lucide-react';
import { MIN_REGISTRATION_YEAR } from '../../../constants/usedCarValuation';

const RegistrationYearInput = ({ value, onChange }) => {
  const currentYear = new Date().getFullYear();

  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-semibold text-theme-secondary mb-2">
        <CalendarDays className="w-4 h-4 text-theme-tertiary" />
        Registration Year
      </label>
      <input
        type="number"
        min={MIN_REGISTRATION_YEAR}
        max={currentYear}
        value={value}
        onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
        className="input-field w-full"
        placeholder={`e.g. ${currentYear - 3}`}
      />
    </div>
  );
};

export default RegistrationYearInput;
