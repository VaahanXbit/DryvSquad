// src/components/tools/evRangeCalculator/InputsPanel.jsx
import { Route, Gauge, Leaf, Mountain, TrafficCone, Calculator } from 'lucide-react';
import VehicleSelect from './VehicleSelect';
import BatterySlider from './BatterySlider';
import TripDistanceInput from './TripDistanceInput';
import TemperatureInput from './TemperatureInput';
import ConditionDropdown from './ConditionDropdown';
import AcToggle from './AcToggle';
import PassengerCounter from './PassengerCounter';
// import AdvancedSettings from './AdvancedSettings';
import {
  ROAD_TYPE_OPTIONS,
  SPEED_OPTIONS,
  DRIVING_STYLE_OPTIONS,
  TERRAIN_OPTIONS,
  TRAFFIC_OPTIONS,
  FIELD_GUIDANCE,
} from '../../../constants/evRangeCalculator';

/**
 * Field order here follows real-world impact on range, highest first —
 * per the latest review: vehicle/battery/trip/speed/temperature (decide
 * whether the trip is even possible), then road profile & terrain, then
 * driving behaviour & HVAC, then traffic & passengers, then future/
 * lowest-impact factors tucked into Advanced Settings.
 */
const InputsPanel = ({
  formValues,
  selectedVehicle,
  vehicleOptions,
  vehicleSearchLoading,
  onSearchVehicles,
  onSelectVehicle,
  onUpdateField,
  onCalculate,
  isCalculating,
  canCalculate,
}) => {
  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-1">
        <span
          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-brand-navy dark:text-black bg-yellow-500 flex-shrink-0"
        >
          1
        </span>
        <h2 className="font-bold text-theme-primary">Your Inputs</h2>
      </div>
      <p className="text-sm text-theme-tertiary mb-5 ml-8">Enter your trip and driving conditions</p>

      <div className="space-y-5">
        {/* Priority 1 — vehicle, battery, trip distance, speed, temperature */}
        <VehicleSelect
          selectedVehicle={selectedVehicle}
          options={vehicleOptions}
          isSearching={vehicleSearchLoading}
          onSearch={onSearchVehicles}
          onSelect={onSelectVehicle}
        />

        <BatterySlider
          value={formValues.batteryPercent}
          onChange={(v) => onUpdateField('batteryPercent', v)}
          hint={FIELD_GUIDANCE.batteryPercent}
        />

        <TripDistanceInput
          value={formValues.tripDistanceKm}
          onChange={(v) => onUpdateField('tripDistanceKm', v)}
          hint={FIELD_GUIDANCE.tripDistanceKm}
        />

        <ConditionDropdown
          icon={Gauge}
          label="Average Speed"
          value={formValues.averageSpeedKmh}
          options={SPEED_OPTIONS}
          onChange={(v) => onUpdateField('averageSpeedKmh', Number(v))}
          hint={FIELD_GUIDANCE.averageSpeedKmh}
        />

        <TemperatureInput
          value={formValues.outsideTemperatureC}
          onChange={(v) => onUpdateField('outsideTemperatureC', v)}
          hint={FIELD_GUIDANCE.outsideTemperatureC}
        />

        {/* Priority 2 — road profile & terrain */}
        <ConditionDropdown
          icon={Route}
          label="Road Type"
          value={formValues.roadType}
          options={ROAD_TYPE_OPTIONS}
          onChange={(v) => onUpdateField('roadType', v)}
          hint={FIELD_GUIDANCE.roadType}
        />

        <ConditionDropdown
          icon={Mountain}
          label="Terrain"
          value={formValues.terrain}
          options={TERRAIN_OPTIONS}
          onChange={(v) => onUpdateField('terrain', v)}
          hint={FIELD_GUIDANCE.terrain}
        />

        {/* Priority 3 — driving behaviour & HVAC */}
        <ConditionDropdown
          icon={Leaf}
          label="Driving Style"
          value={formValues.drivingStyle}
          options={DRIVING_STYLE_OPTIONS}
          onChange={(v) => onUpdateField('drivingStyle', v)}
          hint={FIELD_GUIDANCE.drivingStyle}
        />

        <AcToggle
          value={formValues.airConditioning}
          onChange={(v) => onUpdateField('airConditioning', v)}
          hint={FIELD_GUIDANCE.airConditioning}
        />

        {/* Priority 4 — traffic & passengers */}
        <ConditionDropdown
          icon={TrafficCone}
          label="Traffic"
          value={formValues.traffic}
          options={TRAFFIC_OPTIONS}
          onChange={(v) => onUpdateField('traffic', v)}
          hint={FIELD_GUIDANCE.traffic}
        />

        <PassengerCounter
          value={formValues.passengers}
          onChange={(v) => onUpdateField('passengers', v)}
          hint={FIELD_GUIDANCE.passengers}
        />

        {/* Priority 5 — future factors
        <AdvancedSettings /> */}

        <button
          type="button"
          onClick={onCalculate}
          disabled={isCalculating || !canCalculate}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <Calculator className="w-5 h-5" />
          {isCalculating ? 'Calculating...' : 'Calculate Projected Range'}
        </button>
        {!canCalculate && !isCalculating && (
          <p className="text-xs text-center text-theme-tertiary -mt-3">
            Select a vehicle and enter battery level and trip distance to continue.
          </p>
        )}

        <p className="flex items-center justify-center gap-1.5 text-xs text-theme-tertiary text-center">
          🔒 Your data is private and used only for calculation
        </p>
      </div>
    </div>
  );
};

export default InputsPanel;