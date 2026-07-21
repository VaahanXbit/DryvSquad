// backend/src/services/rating/ratingMath.js

function clampToRange(value, [min, max]) {
  return Math.min(Math.max(value, min), max);
}

function scaleToRating(value, [min, max], higherBetter) {
  if (max === min) return 5.5;
  const clamped = clampToRange(value, [min, max]);
  
  // ✅ If higherBetter is FALSE (like Price), a smaller value produces a larger ratio
  const ratio = higherBetter 
    ? (clamped - min) / (max - min) 
    : (max - clamped) / (max - min);
    
  return Math.round((ratio * 9 + 1) * 10) / 10;
}

function scaleToPercentile(value, [min, max], higherBetter) {
  if (max === min) return 50;
  const clamped = clampToRange(value, [min, max]);
  const ratio = higherBetter 
    ? (clamped - min) / (max - min) 
    : (max - clamped) / (max - min);
  return Math.round(ratio * 1000) / 10;
}

module.exports = { clampToRange, scaleToRating, scaleToPercentile };