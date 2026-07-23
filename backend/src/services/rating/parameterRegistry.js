// backend/src/services/rating/parameterRegistry.js

const GROUP_ORDER = [
  'vehicleOverview', 'engine', 'performance', 'fuelEfficiency', 'drivingDynamics',
  'safety', 'comfort', 'technology', 'infotainment', 'dimensions',
  'practicality', 'ownership', 'value',
];

const GROUP_META = {
  vehicleOverview: { label: 'Vehicle Overview', icon: '🚗' },
  engine: { label: 'Engine', icon: '⚙️' },
  performance: { label: 'Performance', icon: '🏎️' },
  fuelEfficiency: { label: 'Fuel Efficiency', icon: '⛽' },
  drivingDynamics: { label: 'Driving Dynamics', icon: '🎮' },
  safety: { label: 'Safety', icon: '🛡️' },
  comfort: { label: 'Comfort & Convenience', icon: '🛋️' },
  technology: { label: 'Technology & Infotainment', icon: '💻' },
  dimensions: { label: 'Dimensions', icon: '📐' },
  ownership: { label: 'Ownership', icon: '🔧' },
};

// 1. Boolean/Feature fields
const FEATURE_MAPPING = {
  'abs': { label: 'ABS', group: 'safety', icon: '🛡️' },
  'esc': { label: 'Electronic Stability Control', group: 'safety', icon: '🛡️' },
  'tractionControl': { label: 'Traction Control', group: 'safety', icon: '🛡️' },
  'brakeAssist': { label: 'Brake Assist', group: 'safety', icon: '🛡️' },
  'hillAssist': { label: 'Hill Hold Assist', group: 'safety', icon: '⛰️' },
  'hillDescentControl': { label: 'Hill Descent Control', group: 'safety', icon: '⛰️' },
  'isofix': { label: 'ISOFIX Child Seat Mounts', group: 'safety', icon: '🧒' },
  'tpms': { label: 'Tyre Pressure Monitoring System', group: 'safety', icon: '🛞' },
  'sunroof': { label: 'Sunroof', group: 'comfort', icon: '☀️' },
  'cruiseControl': { label: 'Cruise Control', group: 'comfort', icon: '🛋️' },
  'ventilatedSeats': { label: 'Ventilated Seats', group: 'comfort', icon: '🛋️' },
  'powerSeats': { label: 'Power Adjustable Seats', group: 'comfort', icon: '🛋️' },
  'keylessEntry': { label: 'Keyless Entry', group: 'comfort', icon: '🔑' },
  'pushButtonStart': { label: 'Push Button Start', group: 'comfort', icon: '🔘' },
  'rearACVents': { label: 'Rear AC Vents', group: 'comfort', icon: '❄️' },
  'androidAuto': { label: 'Android Auto', group: 'technology', icon: '📱' },
  'appleCarPlay': { label: 'Apple CarPlay', group: 'technology', icon: '📱' },
  'wirelessCharging': { label: 'Wireless Phone Charging', group: 'technology', icon: '🔋' },
  '360Camera': { label: '360 Degree Camera', group: 'technology', icon: '📷' },
  'rearCamera': { label: 'Rear Parking Camera', group: 'technology', icon: '📷' },
  'navigation': { label: 'Navigation System', group: 'technology', icon: '🗺️' },
  'autoClimateControl': { label: 'Automatic Climate Control', group: 'comfort', icon: '❄️' },
};

// 2. CURATED Numeric specifications (Benchmarked, rated)
const NUMERIC_PARAMETERS = {
  'displacement': { label: 'Engine Capacity', group: 'engine', unit: 'cc', higherBetter: false, icon: '⚙️' },
  'power': { label: 'Max Power', group: 'performance', unit: 'PS', higherBetter: true, icon: '🏎️' },
  'torque': { label: 'Max Torque', group: 'performance', unit: 'Nm', higherBetter: true, icon: '⚡' },
  'mileage': { label: 'Mileage (ARAI)', group: 'fuelEfficiency', unit: 'km/l', higherBetter: true, icon: '⛽' },
  'fuelTankCapacity': { label: 'Fuel Tank Capacity', group: 'fuelEfficiency', unit: 'L', higherBetter: true, icon: '⛽' },
  'turningRadius': { label: 'Turning Radius', group: 'drivingDynamics', unit: 'm', higherBetter: false, icon: '🔄' },
  'groundClearance': { label: 'Ground Clearance', group: 'drivingDynamics', unit: 'mm', higherBetter: true, icon: '🛤️' },
  'wheelbase': { label: 'Wheelbase', group: 'dimensions', unit: 'mm', higherBetter: true, icon: '📐' },
  'length': { label: 'Length', group: 'dimensions', unit: 'mm', higherBetter: false, icon: '📐' },
  'width': { label: 'Width', group: 'dimensions', unit: 'mm', higherBetter: false, icon: '📐' },
  'height': { label: 'Height', group: 'dimensions', unit: 'mm', higherBetter: false, icon: '📐' },
  'bootSpace': { label: 'Boot Space', group: 'dimensions', unit: 'L', higherBetter: true, icon: '🧳' },
  'kerbWeight': { label: 'Kerb Weight', group: 'dimensions', unit: 'kg', higherBetter: false, icon: '⚖️' },
  'price': { label: 'Ex-Showroom Price', group: 'ownership', unit: '₹', higherBetter: false, icon: '💰' },
  
  // ✅ FIXED: Airbags is now strictly a segment-rated numeric parameter
  'airbags': { label: 'Airbags', group: 'safety', unit: '', higherBetter: true, icon: '🛡️' },
  
  'approachAngle': { label: 'Approach Angle', group: 'dimensions', unit: '°', higherBetter: true, icon: '⛰️' },
  'departureAngle': { label: 'Departure Angle', group: 'dimensions', unit: '°', higherBetter: true, icon: '⛰️' },
  'breakoverAngle': { label: 'Breakover Angle', group: 'dimensions', unit: '°', higherBetter: true, icon: '⛰️' },
  'adas': { label: 'ADAS Level', group: 'safety', unit: '', higherBetter: true, icon: '🛡️' },
  'topSpeed': { label: 'Top Speed', group: 'performance', unit: 'km/h', higherBetter: true, icon: '💨' },
  'touchscreenSize': { label: 'Touchscreen Size', group: 'technology', unit: '"', higherBetter: true, icon: '📺' },
};

// 3. CURATED Text/Info specifications
const TEXT_PARAMETERS = {
  'bodyType': { label: 'Body Type', group: 'vehicleOverview', icon: '🚘' },
  'fuelType': { label: 'Fuel Type', group: 'vehicleOverview', icon: '⛽' },
  'transmission': { label: 'Transmission Type', group: 'vehicleOverview', icon: '🔧' },
  'engineType': { label: 'Engine Type', group: 'engine', icon: '⚙️' },
  'turbocharger': { label: 'Turbocharger', group: 'engine', icon: '⚙️' },
  'suspensionFront': { label: 'Front Suspension', group: 'drivingDynamics', icon: '🎮' },
  'suspensionRear': { label: 'Rear Suspension', group: 'drivingDynamics', icon: '🎮' },
  'steeringType': { label: 'Steering Type', group: 'drivingDynamics', icon: '🎮' },
  'brakeFront': { label: 'Front Brakes', group: 'safety', icon: '🛡️' },
  'brakeRear': { label: 'Rear Brakes', group: 'safety', icon: '🛡️' },
  'tireSize': { label: 'Tyre Size', group: 'dimensions', icon: '🛞' },
  'driveType': { label: 'Drive Type', group: 'vehicleOverview', icon: '🛞' },
  'warranty': { label: 'Warranty', group: 'ownership', icon: '📄' },
};

// COMBINED: Master list
const CURATED_PARAMETERS = { ...FEATURE_MAPPING, ...NUMERIC_PARAMETERS, ...TEXT_PARAMETERS };

/**
 * Resolves display metadata for a curated specification key.
 */
function resolveFieldMeta(key) {
  return CURATED_PARAMETERS[key] ? { key, ...CURATED_PARAMETERS[key] } : null;
}

module.exports = {
  GROUP_ORDER, GROUP_META, CURATED_PARAMETERS,
  NUMERIC_PARAMETERS, FEATURE_MAPPING, TEXT_PARAMETERS,
  resolveFieldMeta,
};