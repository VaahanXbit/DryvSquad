// backend/src/services/ratingService.js
/*
================================================================================
File Name : ratingService.js
Description : Segment-aware rating engine. Classifies each car into its own 
              segment using segmentClassifier.js, then passes the segment 
              context to dynamicSpecEngine.js so every specification is 
              rated against the correct segment range.
================================================================================
*/

const { classifyVehicle } = require('./rating/segmentClassifier');
// ✅ FIXED: Removed the incorrect 'as' syntax. Requires just the function name.
const { getSegmentRange, getSegmentLabel } = require('./rating/benchmarks/benchmarkResolver');
const { scaleToRating, scaleToPercentile } = require('./rating/ratingMath');
const { buildExplanation } = require('./rating/explanationEngine');
const { buildExpertVerdict } = require('./rating/expertVerdict');
const { buildDynamicComparison } = require('./rating/dynamicSpecEngine');

const KW_TO_PS = 1.35962;

class RatingService {

  // ------------------------------------------------------------------
  // Value parsing
  // ------------------------------------------------------------------

  parseNumericValue(value) {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const match = value.match(/^[\d.]+/);
      if (match) return parseFloat(match[0]);
    }
    return null;
  }

  /**
   * Correctly resolves power in PS regardless of how the source string is formatted.
   */
  parsePowerPS(rawPowerString, fallbackNumeric) {
    if (typeof rawPowerString === 'string' && rawPowerString.trim()) {
      const psMatch = rawPowerString.match(/([\d.]+)\s*PS/i);
      if (psMatch) return parseFloat(psMatch[1]);

      const kwMatch = rawPowerString.match(/([\d.]+)\s*kW/i);
      if (kwMatch) return Math.round(parseFloat(kwMatch[1]) * KW_TO_PS * 10) / 10;

      const bare = this.parseNumericValue(rawPowerString);
      if (bare !== null) return bare;
    }
    return typeof fallbackNumeric === 'number' ? fallbackNumeric : null;
  }

  getValueByPath(obj, path) {
    if (!path) return null;
    const parts = path.split('.');
    let current = obj;
    for (const part of parts) {
      if (current === null || current === undefined) return null;
      current = current[part];
    }
    return current;
  }

  // ------------------------------------------------------------------
  // Segmentation
  // ------------------------------------------------------------------

  classifyCar(data) {
    return classifyVehicle({
      category: data?.specifications?.category,
      brandName: data?.brandName,
      modelName: data?.modelName,
      exShowroomPrice: data?.exShowroomPrice,
      fuelType: data?.fuelType,
    });
  }

  // ------------------------------------------------------------------
  // Core rating math
  // ------------------------------------------------------------------

  /**
   * @param {*} rawValue                 unparsed value from the variant
   * @param {Object} benchmark           global Benchmark document (from MongoDB)
   * @param {Object} [segmentContext]    result of classifyCar()
   */
  calculateRating(rawValue, benchmark, segmentContext = null) {
    const base = {
      rating: null,
      value: rawValue,
      label: benchmark.label,
      unit: benchmark.unit,
      icon: benchmark.icon,
      explanation: null,
      color: null,
      isHigherBetter: benchmark.isHigherBetter,
      industryPercentile: null,
      segmentPercentile: null,
      segmentLabel: segmentContext ? getSegmentLabel(segmentContext.segmentId) : null,
      segmentId: segmentContext ? segmentContext.segmentId : null,
      strength: false,
      weakness: false,
      notApplicable: false,
    };

    if (rawValue === null || rawValue === undefined || rawValue === 'N/A' || rawValue === '') {
      return base;
    }

    const numericValue = this.parseNumericValue(rawValue);
    if (numericValue === null) return base;

    const { minValue: industryMin, maxValue: industryMax, isHigherBetter } = benchmark;
    const industryRange = [industryMin, industryMax];

    // Segment-specific range, when we have segment context.
    let segmentRange = industryRange;
    if (segmentContext) {
      const resolved = getSegmentRange(benchmark.key, segmentContext);
      if (resolved === null && segmentContext.isEV && benchmark.key === 'mileage') {
        return {
          ...base,
          notApplicable: true,
          displayValue: 'N/A (Electric)',
          explanation: {
            summary: 'Fuel efficiency (km/l) doesn\'t apply to electric vehicles.',
            details: ['EVs are measured in range/kWh, not km/l — this parameter is not rated for this vehicle.'],
          },
        };
      }
      segmentRange = resolved || industryRange;
    }

    const rating = scaleToRating(numericValue, segmentRange, isHigherBetter);
    const segmentPercentile = scaleToPercentile(numericValue, segmentRange, isHigherBetter);
    const industryPercentile = scaleToPercentile(numericValue, industryRange, isHigherBetter);
    const color = this.getColorForRating(rating);

    const explanation = buildExplanation(benchmark.key, {
      numericValue,
      unit: benchmark.unit,
      segmentPercentile,
      industryPercentile,
      segmentRange,
      industryRange,
      segmentLabel: base.segmentLabel || 'this segment',
      isHigherBetter,
    }) || this.getExplanationForRating(rating, benchmark);

    return {
      ...base,
      rating,
      value: numericValue,
      displayValue: `${numericValue} ${benchmark.unit}`,
      color,
      explanation,
      industryPercentile,
      segmentPercentile,
      strength: segmentPercentile >= 70,
      weakness: segmentPercentile <= 30,
    };
  }

  calculateMultipleRatings(data, benchmarks) {
    // ✅ Pass data to classifier first to get the correct segment
    const segmentContext = this.classifyCar(data);
    const results = {};

    benchmarks.forEach((benchmark) => {
      let rawValue;
      if (benchmark.key === 'power') {
        rawValue = this.parsePowerPS(data.power, data.powerNumeric);
      } else {
        rawValue = this.getValueByPath(data, benchmark.variantFieldPath);
      }
      results[benchmark.key] = this.calculateRating(rawValue, benchmark, segmentContext);
    });

    // ✅ Return segment along with ratings so it can be passed to dynamicSpecEngine
    return { ratings: results, segment: segmentContext };
  }

  // ------------------------------------------------------------------
  // Comparison
  // ------------------------------------------------------------------

  compareCars(car1Data, car2Data, benchmarks, car3Data = null) {
    // Safety check
    if (!car1Data || !car2Data) {
      throw new Error('Both car1 and car2 data are required for comparison');
    }

    // 1. Calculate ratings AND segment for each car
    const car1Result = this.calculateMultipleRatings(car1Data, benchmarks);
    const car2Result = this.calculateMultipleRatings(car2Data, benchmarks);
    const car3Result = car3Data ? this.calculateMultipleRatings(car3Data, benchmarks) : null;

    const car1LegacyRatings = car1Result.ratings;
    const car2LegacyRatings = car2Result.ratings;
    const car3LegacyRatings = car3Result?.ratings || null;

    // 2. Build entries for Dynamic Spec Engine - PASSING THE SEGMENT CONTEXT!
    const carEntriesForDynamicEngine = [
      { slot: 'car1', data: car1Data, legacyRatings: car1LegacyRatings, segment: car1Result.segment },
      { slot: 'car2', data: car2Data, legacyRatings: car2LegacyRatings, segment: car2Result.segment },
      ...(car3Data ? [{ slot: 'car3', data: car3Data, legacyRatings: car3LegacyRatings, segment: car3Result.segment }] : []),
    ];
    
    const { mergedRatingsBySlot, sections } = buildDynamicComparison(carEntriesForDynamicEngine);

    const car1Ratings = mergedRatingsBySlot.car1;
    const car2Ratings = mergedRatingsBySlot.car2;
    const car3Ratings = car3Data ? mergedRatingsBySlot.car3 : null;

    // Calculate wins
    const wins = { car1Wins: 0, car2Wins: 0, car3Wins: 0, ties: 0 };

    Object.keys(car1Ratings || {}).forEach((key) => {
      const contenders = [
        { slot: 'car1Wins', rating: car1Ratings[key]?.rating },
        { slot: 'car2Wins', rating: car2Ratings[key]?.rating },
      ];
      if (car3Ratings) {
        contenders.push({ slot: 'car3Wins', rating: car3Ratings[key]?.rating });
      }

      const withRatings = contenders.filter((c) => c.rating !== null && typeof c.rating === 'number');
      if (withRatings.length < 2) return;

      const maxRating = Math.max(...withRatings.map((c) => c.rating));
      const topContenders = withRatings.filter((c) => c.rating === maxRating);

      if (topContenders.length > 1) {
        wins.ties++;
      } else {
        wins[topContenders[0].slot]++;
      }
    });

    const computeCarLevelRatings = (ratings) => {
      if (!ratings || typeof ratings !== 'object') return { segmentRating: null, industryRating: null };
      const values = Object.values(ratings).filter((r) => r && r.rating !== null);
      const industryVals = values.map((r) => r.industryPercentile).filter((v) => v !== null && v !== undefined);
      const segmentAvg = values.length ? values.reduce((a, r) => a + r.rating, 0) / values.length : null;
      const industryAvg = industryVals.length ? (industryVals.reduce((a, b) => a + b, 0) / industryVals.length) / 10 : null;
      return {
        segmentRating: segmentAvg !== null ? Math.round(segmentAvg * 10) / 10 : null,
        industryRating: industryAvg !== null ? Math.round(industryAvg * 10) / 10 : null,
      };
    };

    const buildCarOutput = (data, ratings, segment) => {
      if (!data) return null;
      return {
        id: data._id || data.id,
        name: data.name || data.modelName || 'Unknown',
        model: data.modelName || data.name || 'Unknown',
        brand: data.brandName || 'Unknown',
        price: data.price || 'N/A',
        image: data.image || '',
        brandIcon: data.brandIcon || '',
        overallScore: data.overallScore || null,
        ratings: ratings || {},
        segment: {
          id: segment?.segmentId || 'unknown',
          label: segment?.segmentLabel || 'Vehicle',
          tier: segment?.tier || 'mass',
          isEV: segment?.isEV || false,
          isHybrid: segment?.isHybrid || false,
          isOffRoad: segment?.isOffRoad || false,
        },
        computedRatings: computeCarLevelRatings(ratings),
      };
    };

    const winCounts = car3Ratings
      ? { car1: wins.car1Wins, car2: wins.car2Wins, car3: wins.car3Wins }
      : { car1: wins.car1Wins, car2: wins.car2Wins };
    const maxWinCount = Math.max(...Object.values(winCounts));
    const topWinners = Object.keys(winCounts).filter((slot) => winCounts[slot] === maxWinCount);
    const overallWinner = maxWinCount === 0 || topWinners.length > 1 ? 'tie' : topWinners[0];

    const car1Output = buildCarOutput(car1Data, car1Ratings, car1Result.segment);
    const car2Output = buildCarOutput(car2Data, car2Ratings, car2Result.segment);
    const car3Output = car3Data ? buildCarOutput(car3Data, car3Ratings, car3Result.segment) : null;

    const result = {
      car1: car1Output,
      car2: car2Output,
      summary: {
        car1Wins: wins.car1Wins,
        car2Wins: wins.car2Wins,
        ...(car3Ratings ? { car3Wins: wins.car3Wins } : {}),
        ties: wins.ties,
        overallWinner,
      },
      sections: sections || [],
    };

    if (car3Output) {
      result.car3 = car3Output;
    }

    // Safe guard for Expert Verdict
    const carSlotsForVerdict = [
      { slot: 'car1', name: `${car1Output.brand} ${car1Output.model}`, ratings: car1Ratings },
      { slot: 'car2', name: `${car2Output.brand} ${car2Output.model}`, ratings: car2Ratings },
      ...(car3Output ? [{ slot: 'car3', name: `${car3Output.brand} ${car3Output.model}`, ratings: car3Ratings }] : []),
    ].filter(c => c && c.name && c.ratings);
    
    result.expertVerdict = buildExpertVerdict(carSlotsForVerdict, overallWinner);

    return result;
  }

  // ------------------------------------------------------------------
  // Legacy helpers (kept for backward compatibility)
  // ------------------------------------------------------------------

  getColorForRating(rating) {
    if (rating >= 8) return 'green';
    if (rating >= 5) return 'yellow';
    return 'red';
  }

  getExplanationForRating(rating, benchmark) {
    const { explanations } = benchmark;
    if (!explanations) return null;
    if (rating >= 8) return explanations.excellent;
    if (rating >= 5) return explanations.good;
    if (rating >= 3) return explanations.average;
    return explanations.needsImprovement;
  }
}

module.exports = new RatingService();