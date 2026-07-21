// backend/src/services/rating/dynamicSpecEngine.js

const { GROUP_ORDER, GROUP_META, CURATED_PARAMETERS, FEATURE_MAPPING } = require('./parameterRegistry');
const { getSegmentRange } = require('./benchmarks/benchmarkResolver');
const { scaleToRating, scaleToPercentile } = require('./ratingMath');

function extractPowerPS(raw) {
  if (typeof raw !== 'string') return null;
  let match = raw.match(/([\d.]+)\s*(?:PS|bhp|hp)/i);
  if (match) return parseFloat(match[1]);
  match = raw.match(/([\d.]+)\s*kW/i);
  if (match) return parseFloat(match[1]) * 1.35962;
  return null;
}

function extractTorqueNm(raw) {
  if (typeof raw !== 'string') return null;
  let match = raw.match(/([\d.]+)\s*Nm/i);
  if (match) return parseFloat(match[1]);
  return null;
}

function extractSafeNumeric(raw) {
  if (typeof raw === 'number') return raw;
  if (typeof raw !== 'string') return null;
  const cleaned = raw.replace(/,/g, '').trim();
  const match = cleaned.match(/([\d.]+)/);
  return match ? parseFloat(match[1]) : null;
}

function formatBooleanFeature(val) {
  if (val === true || val === 'Available' || val === 'Yes' || val === 'true') return '✓ Available';
  return '✕ Not Available';
}

function buildDynamicComparison(carEntries) {
  const mergedRatingsBySlot = {};
  carEntries.forEach(({ slot, legacyRatings }) => {
    mergedRatingsBySlot[slot] = { ...legacyRatings };
  });

  const rows = [];

  Object.keys(CURATED_PARAMETERS).forEach((key) => {
    const meta = CURATED_PARAMETERS[key];
    
    const rawBySlot = {};
    carEntries.forEach(({ slot, data }) => {
      let val = data.specifications?.[key] !== undefined ? data.specifications[key] : data[key];
      if (val === undefined && data.features) {
        const foundFeature = data.features.find(f => f === key || f.includes(key));
        val = foundFeature ? true : false;
      }
      rawBySlot[slot] = val;
    });

    const allEmpty = carEntries.every(({ slot }) => {
      const v = rawBySlot[slot];
      return v === null || v === undefined || v === '' || v === 'N/A' || v === false;
    });
    if (allEmpty) return;

    if (FEATURE_MAPPING[key]) {
      carEntries.forEach(({ slot }) => {
        const val = rawBySlot[slot];
        const isAvailable = val === true || val === 'Available' || val === 'Yes';
        mergedRatingsBySlot[slot][key] = {
          value: isAvailable,
          displayValue: formatBooleanFeature(isAvailable),
          rating: isAvailable ? 9 : 1,
          color: isAvailable ? 'green' : 'red',
          isTextOnly: true,
        };
      });
      rows.push({ key, label: meta.label, icon: meta.icon, type: 'feature', group: meta.group });
      return;
    }

    if (!meta.unit || meta.unit === null || meta.type === 'info') {
      carEntries.forEach(({ slot }) => {
        const val = rawBySlot[slot];
        mergedRatingsBySlot[slot][key] = {
          value: val,
          displayValue: val || 'Not Available',
          rating: null,
          color: null,
          isTextOnly: true,
        };
      });
      rows.push({ key, label: meta.label, icon: meta.icon, type: 'info', group: meta.group });
      return;
    }

    const numericBySlot = {};
    carEntries.forEach(({ slot }) => {
      const raw = rawBySlot[slot];
      let numeric = null;
      if (typeof raw === 'number') numeric = raw;
      else if (typeof raw === 'string') {
        if (key === 'power' || key === 'maxPower') numeric = extractPowerPS(raw);
        else if (key === 'torque' || key === 'maxTorque') numeric = extractTorqueNm(raw);
        else numeric = extractSafeNumeric(raw);
      }
      numericBySlot[slot] = numeric;
    });

    if (carEntries.every(({ slot }) => numericBySlot[slot] === null)) return;

    const higherBetter = meta.higherBetter !== false;
    const unit = meta.unit || '';

    carEntries.forEach(({ slot, segment }) => {
      const numeric = numericBySlot[slot];
      if (numeric === null || numeric === undefined) {
        mergedRatingsBySlot[slot][key] = {
          rating: null, value: null, displayValue: 'N/A', color: null, 
          isTextOnly: true, explanation: null
        };
        return;
      }

      const segRange = getSegmentRange(key, segment);
      if (!segRange) {
        mergedRatingsBySlot[slot][key] = {
          rating: null, value: null, displayValue: 'N/A', color: null, 
          isTextOnly: true, explanation: null
        };
        return;
      }

      const rating = scaleToRating(numeric, segRange, higherBetter);
      const segmentPercentile = scaleToPercentile(numeric, segRange, higherBetter);
      const color = rating >= 8 ? 'green' : (rating >= 5 ? 'yellow' : 'red');
      const displayVal = numeric + (unit ? ' ' + unit : '');

      mergedRatingsBySlot[slot][key] = {
        rating, value: numeric, displayValue: displayVal, color,
        strength: rating >= 8, weakness: rating <= 3,
        isTextOnly: false, explanation: null
      };
    });
    
    rows.push({
      key, label: meta.label, icon: meta.icon, type: 'segment-rated', group: meta.group,
      unit: meta.unit, higherBetter
    });
  });

  const byGroup = {};
  rows.forEach((row) => {
    if (!byGroup[row.group]) byGroup[row.group] = [];
    byGroup[row.group].push(row);
  });

  const sections = GROUP_ORDER
    .filter((groupKey) => byGroup[groupKey]?.length)
    .map((groupKey) => ({
      key: groupKey,
      label: GROUP_META[groupKey].label,
      icon: GROUP_META[groupKey].icon,
      rows: byGroup[groupKey].map(({ key, label, icon, type, unit, higherBetter }) => ({
        key, label, icon, type, unit, higherBetter
      })),
    }));

  return { mergedRatingsBySlot, sections };
}

module.exports = { buildDynamicComparison };