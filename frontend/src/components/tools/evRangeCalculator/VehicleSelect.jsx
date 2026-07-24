// src/components/tools/evRangeCalculator/VehicleSelect.jsx
import { useState } from 'react';
import { ChevronRight, Search, X } from 'lucide-react';

/**
 * "Select Your EV" field. Shows the currently selected vehicle as a compact
 * card; clicking "Change Vehicle" opens a searchable list.
 */
const VehicleSelect = ({ selectedVehicle, options, isSearching, onSearch, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  const handleQueryChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  const handleSelect = (vehicle) => {
    onSelect(vehicle);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-theme-secondary mb-2">Select Your EV</label>

      {selectedVehicle && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center gap-4 p-3 rounded-lg border text-left transition-colors hover:shadow-sm"
          style={{ borderColor: 'var(--border-primary)' }}
        >
          <div className="w-16 h-12 rounded-md overflow-hidden flex-shrink-0" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <img src={selectedVehicle.image} alt={selectedVehicle.model} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-theme-primary truncate">
              {selectedVehicle.manufacturer} {selectedVehicle.model}
            </p>
            <p className="text-sm text-theme-tertiary truncate">
              {selectedVehicle.batteryCapacityKwh} kWh &middot; {selectedVehicle.drivetrain}
            </p>
            <span className="text-sm font-medium" style={{ color: 'var(--brand-navy)' }}>
              Change Vehicle
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-theme-tertiary flex-shrink-0" />
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/40 p-4" onClick={() => setIsOpen(false)}>
          <div
            className="card w-full max-w-md mt-16 sm:mt-0 max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
              <h3 className="font-semibold text-theme-primary">Select Your EV</h3>
              <button type="button" onClick={() => setIsOpen(false)} aria-label="Close">
                <X className="w-5 h-5 text-theme-tertiary" />
              </button>
            </div>

            <div className="p-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-theme-tertiary" />
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={handleQueryChange}
                  placeholder="Search by manufacturer or model"
                  className="input-field pl-9 w-full"
                />
              </div>
            </div>

            <div className="overflow-y-auto">
              {isSearching && <p className="p-4 text-sm text-theme-tertiary">Searching...</p>}
              {!isSearching && options.length === 0 && (
                <p className="p-4 text-sm text-theme-tertiary">No vehicles found</p>
              )}
              {!isSearching &&
                options.map((vehicle) => (
                  <button
                    key={vehicle.id}
                    type="button"
                    onClick={() => handleSelect(vehicle)}
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <div className="w-14 h-10 rounded-md overflow-hidden flex-shrink-0" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                      <img src={vehicle.image} alt={vehicle.model} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-theme-primary truncate">
                        {vehicle.manufacturer} {vehicle.model}
                      </p>
                      <p className="text-xs text-theme-tertiary truncate">{vehicle.variant}</p>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleSelect;
