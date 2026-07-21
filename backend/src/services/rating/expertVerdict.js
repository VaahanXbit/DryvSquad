// backend/src/services/rating/expertVerdict.js
/*
================================================================================
File Name : expertVerdict.js
Description : Derives the "Expert Verdict" block (best for city / highway / 
              family / off-road / value, pros/cons, final recommendation)
              purely from ratings already computed by ratingService — no new 
              data dependencies.
================================================================================
*/

const CITY_KEYS = ['turningRadius', 'mileage'];
const HIGHWAY_KEYS = ['power', 'torque', 'mileage'];
const FAMILY_KEYS = ['bootSpace'];
const OFFROAD_KEYS = ['groundClearance', 'torque'];
const VALUE_KEYS = ['price'];

function avgRating(ratings, keys) {
  if (!ratings || typeof ratings !== 'object') return null;
  const vals = keys
    .map((k) => ratings[k]?.rating)
    .filter((v) => v !== null && v !== undefined && typeof v === 'number');
  if (vals.length === 0) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function pickWinner(carSlots, scoreFn) {
  if (!Array.isArray(carSlots) || carSlots.length < 2) return { winner: null, scores: [] };
  
  const scored = carSlots
    .map((slot) => ({ 
      slot: slot.slot, 
      score: scoreFn(slot.ratings) 
    }))
    .filter((s) => s.score !== null && typeof s.score === 'number');
    
  if (scored.length < 2) return { winner: null, scores: scored };
  
  const max = Math.max(...scored.map((s) => s.score));
  const top = scored.filter((s) => s.score === max);
  return { winner: top.length === 1 ? top[0].slot : 'tie', scores: scored };
}

function buildProsCons(name, ratings) {
  if (!ratings || typeof ratings !== 'object') return { pros: [], cons: [] };
  
  const entries = Object.entries(ratings).filter(([, r]) => r && r.rating !== null && r.strength !== undefined);
  const pros = entries.filter(([, r]) => r.strength).map(([key, r]) => `${r.label || key}: ${r.displayValue || r.value}`).slice(0, 4);
  const cons = entries.filter(([, r]) => r.weakness).map(([key, r]) => `${r.label || key}: ${r.displayValue || r.value}`).slice(0, 3);
  return { pros, cons };
}

/**
 * @param {Array<{ slot: 'car1'|'car2'|'car3', name: string, ratings: Object }>} carSlots
 * @param {string} overallWinner
 */
function buildExpertVerdict(carSlots, overallWinner) {
  // ✅ FIXED: Safe guard against undefined carSlots
  if (!carSlots || !Array.isArray(carSlots) || carSlots.length < 2) return null;

  // Safe-guard the mapping by checking if carSlots are valid
  const validCarSlots = carSlots.filter(c => c && c.ratings && typeof c.ratings === 'object');

  const bestForCity = pickWinner(validCarSlots, (r) => avgRating(r, CITY_KEYS));
  const bestForHighway = pickWinner(validCarSlots, (r) => avgRating(r, HIGHWAY_KEYS));
  const bestFamily = pickWinner(validCarSlots, (r) => avgRating(r, FAMILY_KEYS));
  const bestOffRoad = pickWinner(validCarSlots, (r) => avgRating(r, OFFROAD_KEYS));
  const bestValue = pickWinner(validCarSlots, (r) => avgRating(r, VALUE_KEYS));

  const prosConsBySlot = {};
  const buyerGuidanceBySlot = {};
  
  for (const { slot, name, ratings } of validCarSlots) {
    if (!slot || !name) continue;
    prosConsBySlot[slot] = buildProsCons(name, ratings);
    
    const strengths = Object.values(ratings).filter((r) => r?.strength).map((r) => r.label?.toLowerCase() || '');
    buyerGuidanceBySlot[slot] = strengths.length
      ? `Best suited if ${strengths.slice(0, 2).join(' and ')} matter most to you.`
      : `A balanced, no-major-weakness choice in this comparison.`;
  }

  // ✅ FIXED: Safe handling of overallWinner
  let winnerName = null;
  if (overallWinner && overallWinner !== 'tie') {
    const found = validCarSlots.find((c) => c.slot === overallWinner);
    if (found && found.name) winnerName = found.name;
  }

  const finalRecommendation = winnerName
    ? `Across the parameters compared, ${winnerName} wins more rounds on balance — but check the individual category winners below, since the "best overall" pick isn't always the best fit for your specific priorities (city use, family trips, or budget).`
    : `This comparison is close — use the category winners below (city, highway, family, off-road, value) to decide based on what matters most to you.`;

  return {
    bestForCity: bestForCity.winner,
    bestForHighway: bestForHighway.winner,
    bestFamily: bestFamily.winner,
    bestOffRoad: bestOffRoad.winner,
    bestValue: bestValue.winner,
    prosConsBySlot,
    buyerGuidanceBySlot,
    finalRecommendation,
  };
}

module.exports = { buildExpertVerdict };