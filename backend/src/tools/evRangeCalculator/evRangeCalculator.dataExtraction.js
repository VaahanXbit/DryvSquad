// backend/src/tools/evRangeCalculator/evRangeCalculator.dataExtraction.js
/*
================================================================================
File Name : evRangeCalculator.dataExtraction.js
Description : Extracts and normalizes EV data from the EXISTING database
              schema (Variant.specifications + Variant.mileage/mileageNumeric,
              populated with Model/Brand). This module never hardcodes a
              vehicle spec — it only parses whatever free-text values are
              already stored, so it keeps working automatically as new EVs
              are added to the database.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const isMissing = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' || trimmed.toUpperCase() === 'N/A';
  }
  return false;
};

/**
 * Extracts the largest numeric value found in a string, e.g.
 * "401-481 km" -> 481, "483 km" -> 483, "~280 km (Real-world)" -> 280.
 * Per spec: when a range is expressed as a band, use the maximum value.
 */
const extractMaxNumber = (str) => {
  if (isMissing(str)) return null;
  const matches = String(str).match(/\d+(\.\d+)?/g);
  if (!matches || matches.length === 0) return null;
  return Math.max(...matches.map(Number));
};

/** Extracts a "...kW" number (not kWh) from a free-text string. */
const extractKw = (str) => {
  if (isMissing(str)) return null;
  const match = String(str).match(/(\d+(\.\d+)?)\s*kw(?!h)/i);
  return match ? Number(match[1]) : null;
};

/** Extracts a "...kWh" number from a free-text string. */
const extractKwh = (str) => {
  if (isMissing(str)) return null;
  const match = String(str).match(/(\d+(\.\d+)?)\s*kwh/i);
  if (match) return Number(match[1]);
  // Fall back to the first plain number if "kWh" wasn't in the string but
  // a number is (defensive — every sample we've seen includes "kWh", but
  // this avoids silently failing on a minor formatting variant).
  return extractMaxNumber(str);
};

const RANGE_STANDARD_PATTERNS = [
  { pattern: /ARAI/i, label: 'ARAI' },
  { pattern: /WLTP/i, label: 'WLTP' },
  { pattern: /MIDC/i, label: 'MIDC' },
  { pattern: /company\s*claimed/i, label: 'Company Claimed' },
];

const detectRangeStandard = (str) => {
  if (isMissing(str)) return null;
  const found = RANGE_STANDARD_PATTERNS.find(({ pattern }) => pattern.test(str));
  return found ? found.label : null;
};

/**
 * Resolves the Official Claimed Range for a variant.
 *
 * Priority order (matches what's actually populated across the real brand
 * data): `specifications.range` first (per spec — this is where most
 * brands store it, and handles band values like "401-481 km" by taking the
 * max). Falls back to the variant's top-level `mileageNumeric` only when
 * `specifications.range` isn't present (this is how Tata's EV data is
 * currently stored — no `specifications.range` key at all).
 *
 * Never estimates or derives a number that isn't already in the database.
 */
const extractOfficialClaimedRange = (specifications, mileageNumeric) => {
  const rangeRaw = specifications?.range;

  if (!isMissing(rangeRaw)) {
    const km = extractMaxNumber(rangeRaw);
    if (km !== null) {
      return {
        km,
        standard: detectRangeStandard(rangeRaw) || 'Unknown',
        source: 'specifications.range',
        raw: rangeRaw,
      };
    }
  }

  if (typeof mileageNumeric === 'number' && !Number.isNaN(mileageNumeric)) {
    return {
      km: mileageNumeric,
      standard: 'Unknown',
      source: 'mileageNumeric',
      raw: `${mileageNumeric} km`,
    };
  }

  return null;
};

const extractBatteryCapacity = (specifications) => {
  const raw = specifications?.batteryCapacity;
  if (isMissing(raw)) return null;
  const kwh = extractKwh(raw);
  return kwh === null ? null : { kwh, raw };
};

// Known field-name variants seen across brands for AC / DC charging info,
// in priority order (first non-missing value wins).
const AC_FIELD_CANDIDATES = ['chargingTimeAC', 'chargingAC', 'acCharging'];
const DC_FIELD_CANDIDATES = ['chargingTimeDC', 'chargingDC', 'fastCharging', 'chargingTime50kW'];

const firstNonMissing = (specifications, keys) => {
  for (const key of keys) {
    const value = specifications?.[key];
    if (!isMissing(value)) return { raw: value, field: key };
  }
  return null;
};

const extractChargingInfo = (specifications) => {
  const chargingPort = isMissing(specifications?.chargingPort) ? null : specifications.chargingPort;

  let ac = firstNonMissing(specifications, AC_FIELD_CANDIDATES);
  let dc = firstNonMissing(specifications, DC_FIELD_CANDIDATES);

  // Some brands (Tata) only expose a single generic `chargingTime` field.
  // Use it as a last resort, inferring AC vs DC from its wording.
  const genericCharging = specifications?.chargingTime;
  if (!isMissing(genericCharging)) {
    const mentionsDc = /dc|\d+\s*min.*\d+-\d+%/i.test(genericCharging);
    if (!ac && !mentionsDc) ac = { raw: genericCharging, field: 'chargingTime' };
    if (!dc && mentionsDc) dc = { raw: genericCharging, field: 'chargingTime' };
  }

  return {
    chargingPort,
    ac: ac ? { raw: ac.raw, kw: extractKw(ac.raw) } : null,
    dc: dc ? { raw: dc.raw, kw: extractKw(dc.raw) } : null,
    hasChargingInfo: Boolean(chargingPort || ac || dc),
  };
};

const extractBatteryType = (specifications) => {
  const raw = specifications?.batteryType;
  return isMissing(raw) ? null : raw;
};

// Consistent multi-line format for every developer warning this module
// logs: header, vehicle identity, what's missing, what it affects. These
// are developer-only diagnostics — never surfaced to end users, and never
// change what extractEvSpecData() returns.
const logDevWarning = (vehicleLabel, issue, consequence) => {
  // eslint-disable-next-line no-console
  console.warn(`[EV Calculator]\nVehicle: ${vehicleLabel}\n${issue}\n${consequence}`);
};

/**
 * Builds the normalized EvSpecData object the calculation engine consumes.
 * Never throws — missing data is represented as `null` fields so the
 * validator/service layer can decide how to respond (per the spec's
 * validation-message rules), and this function logs a developer warning
 * for each gap so incomplete vehicle data is easy to spot and fix later.
 *
 * @param {Object} variantDoc - a Variant document (with modelId.brandId populated)
 * @returns {Object} EvSpecData
 */
const extractEvSpecData = (variantDoc) => {
  const specifications = variantDoc.specifications || {};
  const model = variantDoc.modelId;
  const brand = model?.brandId;

  const label = `${brand?.name || 'Unknown Brand'} ${model?.name || 'Unknown Model'} ${variantDoc.name || ''}`.trim();

  const isElectric = variantDoc.fuelType === 'Electric';

  const officialClaimedRange = extractOfficialClaimedRange(specifications, variantDoc.mileageNumeric);
  const batteryCapacity = extractBatteryCapacity(specifications);
  const chargingInfo = extractChargingInfo(specifications);
  const batteryType = extractBatteryType(specifications);

  if (isElectric) {
    if (!officialClaimedRange) {
      logDevWarning(label, 'Missing official claimed range.', 'Range estimation unavailable.');
    } else if (officialClaimedRange.raw && /real[\s-]?world|estimate/i.test(officialClaimedRange.raw)) {
      logDevWarning(
        label,
        `Stored range value ("${officialClaimedRange.raw}") reads like a real-world estimate, not an official manufacturer figure.`,
        'Using it as-is (per data-source rule) — flag for data-entry review.'
      );
    }

    if (officialClaimedRange && !batteryCapacity) {
      logDevWarning(label, 'Missing battery capacity.', 'Energy and cost calculation unavailable.');
    }

    if (!batteryType) {
      logDevWarning(label, 'Missing battery type.', 'Battery type will not be displayed.');
    }

    if (!chargingInfo.ac && !chargingInfo.dc) {
      logDevWarning(label, 'Missing charging time.', 'Charging duration details unavailable.');
    }

    if (!chargingInfo.chargingPort) {
      logDevWarning(label, 'Missing charging port.', 'Charging port details unavailable.');
    }
  }

  return {
    id: String(variantDoc._id),
    manufacturer: brand?.name || 'Unknown',
    model: model?.name || 'Unknown',
    variant: variantDoc.name,
    image: model?.image || null,
    fuelType: variantDoc.fuelType,
    isElectric,
    officialClaimedRangeKm: officialClaimedRange?.km ?? null,
    rangeStandard: officialClaimedRange?.standard ?? null,
    rangeSource: officialClaimedRange?.source ?? null,
    batteryCapacityKwh: batteryCapacity?.kwh ?? null,
    batteryType,
    chargingPort: chargingInfo.chargingPort,
    chargingAcKw: chargingInfo.ac?.kw ?? null,
    chargingAcRaw: chargingInfo.ac?.raw ?? null,
    chargingDcKw: chargingInfo.dc?.kw ?? null,
    chargingDcRaw: chargingInfo.dc?.raw ?? null,
    hasChargingInfo: chargingInfo.hasChargingInfo,
  };
};

module.exports = {
  extractEvSpecData,
  // exported for unit testing
  extractMaxNumber,
  extractKw,
  extractKwh,
  detectRangeStandard,
  extractOfficialClaimedRange,
  extractBatteryCapacity,
  extractChargingInfo,
  isMissing,
};