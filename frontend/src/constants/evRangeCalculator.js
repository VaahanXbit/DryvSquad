// src/constants/evRangeCalculator.js
/*
================================================================================
File Name : evRangeCalculator.js
Description : Static option lists for the EV Range Calculator form fields.
              Purely presentational — the values map 1:1 to what the backend
              validator/config expects (see evRangeCalculator.validator.js
              and evRangeCalculator.config.js).
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

export const TEMPERATURE_OPTIONS = [0, 5, 10, 15, 20, 25, 30, 35, 38, 40, 45].map((v) => ({
  value: v,
  label: `${v} °C`,
}));

export const ROAD_TYPE_OPTIONS = [
  { value: 'city', label: 'City' },
  { value: 'highway', label: 'Highway' },
  { value: 'mixed', label: 'Mixed' },
  { value: 'hilly', label: 'Hilly' },
];

export const SPEED_OPTIONS = [
  { value: 30, label: 'Below 40 km/h' },
  { value: 50, label: '40 - 60 km/h' },
  { value: 70, label: '60 - 80 km/h' },
  { value: 90, label: '80 - 100 km/h' },
  { value: 95, label: '90 - 100 km/h' },
  { value: 110, label: '100 - 120 km/h' },
  { value: 125, label: 'Above 120 km/h' },
];

export const DRIVING_STYLE_OPTIONS = [
  { value: 'eco', label: 'Eco' },
  { value: 'normal', label: 'Normal' },
  { value: 'aggressive', label: 'Aggressive' },
];

export const AC_OPTIONS = [
  { value: 'off', label: 'OFF' },
  { value: 'mixed', label: 'Mixed' },
  { value: 'on', label: 'ON' },
];

export const TERRAIN_OPTIONS = [
  { value: 'flat', label: 'Flat' },
  { value: 'rolling', label: 'Rolling' },
  { value: 'hilly', label: 'Hilly' },
];

export const TRAFFIC_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'heavy', label: 'Heavy' },
];

export const DEFAULT_FORM_VALUES = {
  vehicleId: null,
  batteryPercent: 85,
  outsideTemperatureC: 38,
  roadType: 'highway',
  averageSpeedKmh: 95,
  drivingStyle: 'normal',
  airConditioning: 'on',
  passengers: 4,
  terrain: 'hilly',
  traffic: 'moderate',
  advanced: {
    tripDistanceKm: 220,
    homeChargingRatePerKwh: 8,
    publicChargingRatePerKwh: 20.7,
  },
};

export const MIN_PASSENGERS = 1;
export const MAX_PASSENGERS = 7;
export const MIN_BATTERY_PERCENT = 10;
export const MAX_BATTERY_PERCENT = 100;
