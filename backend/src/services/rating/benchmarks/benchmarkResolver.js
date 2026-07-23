// backend/src/services/rating/benchmarks/benchmarkResolver.js

const { SEGMENT_RANGES } = require('./segmentRanges.data');
const { EV_OVERRIDE_RANGES } = require('./evOverrides.data');

function getSegmentRange(paramKey, segmentContext) {
  if (!segmentContext || typeof segmentContext !== 'object') return null;
  const { segmentId, tier, isEV } = segmentContext;

  // EV Overrides for torque/power
  if (isEV && paramKey === 'mileage') return null;
  if (isEV && (paramKey === 'torque' || paramKey === 'power')) {
    return EV_OVERRIDE_RANGES[tier]?.[paramKey] || EV_OVERRIDE_RANGES.mass[paramKey];
  }

  // Normalize keys
  const normalizedKey = (() => {
    switch(paramKey) {
      case 'engineDisplacement': return 'displacement';
      case 'maxPower': return 'power';
      case 'maxTorque': return 'torque';
      case 'fuelEfficiency': return 'mileage';
      case 'exShowroomPrice': return 'price';
      default: return paramKey;
    }
  })();

  const segment = SEGMENT_RANGES[segmentId];
  if (!segment || !segment[normalizedKey]) {
    // ✅ STRICT: If no range exists for this parameter in this segment, return null
    return null;
  }
  return segment[normalizedKey];
}

function getSegmentLabel(segmentId) {
  return SEGMENT_RANGES[segmentId]?.label || segmentId;
}

module.exports = { getSegmentRange, getSegmentLabel };