// src/components/tools/evRangeCalculator/InputsPanel.jsx
import { Thermometer, Route, Gauge, Leaf, Mountain, TrafficCone, Calculator } from 'lucide-react';
import VehicleSelect from './VehicleSelect';
import BatterySlider from './BatterySlider';
import ConditionDropdown from './ConditionDropdown';
import AcToggle from './AcToggle';
import PassengerCounter from './PassengerCounter';
import AdvancedSettings from './AdvancedSettings';
import {
  TEMPERATURE_OPTIONS,
  ROAD_TYPE_OPTIONS,
  SPEED_OPTIONS,
  DRIVING_STYLE_OPTIONS,
  TERRAIN_OPTIONS,
  TRAFFIC_OPTIONS,
} from '../../../constants/evRangeCalculator';

const InputsPanel = ({
  formValues,
  selectedVehicle,
  vehicleOptions,
  vehicleSearchLoading,
  onSearchVehicles,
  onSelectVehicle,
  onUpdateField,
  onUpdateAdvanced,
  onCalculate,
  isCalculating,
}) => {
  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-1">
        <span
          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
          style={{ backgroundColor: 'var(--brand-navy)' }}
        >
          1
        </span>
        <h2 className="font-bold text-theme-primary">Your Inputs</h2>
      </div>
      <p className="text-sm text-theme-tertiary mb-5 ml-8">Enter your trip and driving conditions</p>

      <div className="space-y-5">
        <VehicleSelect
          selectedVehicle={selectedVehicle}
          options={vehicleOptions}
          isSearching={vehicleSearchLoading}
          onSearch={onSearchVehicles}
          onSelect={onSelectVehicle}
        />

        <BatterySlider value={formValues.batteryPercent} onChange={(v) => onUpdateField('batteryPercent', v)} />

        <div className="grid grid-cols-2 gap-4">
          <ConditionDropdown
            icon={Thermometer}
            label="Outside Temperature"
            value={formValues.outsideTemperatureC}
            options={TEMPERATURE_OPTIONS}
            onChange={(v) => onUpdateField('outsideTemperatureC', Number(v))}
          />
          <ConditionDropdown
            icon={Route}
            label="Road Type"
            value={formValues.roadType}
            options={ROAD_TYPE_OPTIONS}
            onChange={(v) => onUpdateField('roadType', v)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <ConditionDropdown
            icon={Gauge}
            label="Average Speed"
            value={formValues.averageSpeedKmh}
            options={SPEED_OPTIONS}
            onChange={(v) => onUpdateField('averageSpeedKmh', Number(v))}
          />
          <ConditionDropdown
            icon={Leaf}
            label="Driving Style"
            value={formValues.drivingStyle}
            options={DRIVING_STYLE_OPTIONS}
            onChange={(v) => onUpdateField('drivingStyle', v)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <AcToggle value={formValues.airConditioning} onChange={(v) => onUpdateField('airConditioning', v)} />
          <PassengerCounter value={formValues.passengers} onChange={(v) => onUpdateField('passengers', v)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <ConditionDropdown
            icon={Mountain}
            label="Terrain"
            value={formValues.terrain}
            options={TERRAIN_OPTIONS}
            onChange={(v) => onUpdateField('terrain', v)}
          />
          <ConditionDropdown
            icon={TrafficCone}
            label="Traffic"
            value={formValues.traffic}
            options={TRAFFIC_OPTIONS}
            onChange={(v) => onUpdateField('traffic', v)}
          />
        </div>

        <AdvancedSettings advanced={formValues.advanced} onChange={onUpdateAdvanced} />

        <button
          type="button"
          onClick={onCalculate}
          disabled={isCalculating || !formValues.vehicleId}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <Calculator className="w-5 h-5" />
          {isCalculating ? 'Calculating...' : 'Calculate Real Range'}
        </button>

        <p className="flex items-center justify-center gap-1.5 text-xs text-theme-tertiary text-center">
          🔒 Your data is private and used only for calculation
        </p>
      </div>
    </div>
  );
};

export default InputsPanel;
