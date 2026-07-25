// src/constants/evRangeCalculator.js
/*
================================================================================
File Name : evRangeCalculator.js
Description : Static option lists + guidance copy for the EV Range
              Calculator form fields, ordered by real-world impact on range
              (see InputsPanel.jsx for how this drives field order).
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

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

// Short explanation shown below each field, per the latest review.
export const FIELD_GUIDANCE = {
  batteryPercent: 'Your current charge level — the calculator uses this to work out how far you can go right now.',
  tripDistanceKm: 'The distance you plan to drive. This decides whether a charging stop is needed.',
  averageSpeedKmh: 'Higher average speeds increase aerodynamic drag and usually reduce practical EV range.',
  outsideTemperatureC: 'Extreme hot or cold weather can reduce battery efficiency.',
  roadType: 'Highway driving is typically less efficient than city driving for EVs.',
  terrain: 'Hilly roads generally require more energy than flat roads.',
  drivingStyle: 'Aggressive acceleration consumes more energy than smooth driving.',
  airConditioning: 'Cabin cooling uses battery power and can slightly reduce practical range.',
  traffic: 'Stop-and-go traffic may increase energy use, although regenerative braking can recover some energy.',
  passengers: 'Additional vehicle load can increase energy consumption.',
};

export const DEFAULT_FORM_VALUES = {
  vehicleId: null,
  batteryPercent: 85,
  tripDistanceKm: 220,
  averageSpeedKmh: 95,
  outsideTemperatureC: 38,
  roadType: 'highway',
  terrain: 'hilly',
  drivingStyle: 'normal',
  airConditioning: 'on',
  traffic: 'moderate',
  passengers: 4,
};

export const MIN_PASSENGERS = 1;
export const MAX_PASSENGERS = 7;
export const MIN_BATTERY_PERCENT = 10;
export const MAX_BATTERY_PERCENT = 100;
export const MIN_TEMPERATURE_C = -30;
export const MAX_TEMPERATURE_C = 55;
