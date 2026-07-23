// backend/src/services/rating/explanationEngine.js
/*
================================================================================
File Name : explanationEngine.js
Description : Builds the rich, educational explanation for a single parameter
              rating — definition, why it matters, industry average,
              recommended range, daily-usage impact, pros/cons, a real-world
              example, and an expert recommendation. This is what powers the
              X-Ray-style drawer (PART 2 / PART 4 of the brief).

              Deliberately does NOT use "Good / Average / Poor" as the visible
              copy — tier is only used internally to pick which pre-written
              angle (advantage emphasis vs. limitation emphasis) to surface.
================================================================================
*/

// Static domain knowledge per parameter. Kept separate from per-car dynamic
// values (which are interpolated at build time) so this table stays a pure
// content/config concern.
const PARAM_KNOWLEDGE = {
  torque: {
    definition: 'Torque is the twisting force an engine produces — it\'s what gets a heavy vehicle moving from a standstill and pulls it through inclines and overtakes without needing to downshift.',
    whyItMatters: 'Torque, not horsepower, is what you feel in daily driving: crawling in traffic, climbing a flyover, or accelerating out of a corner with a full car. Higher torque at lower RPM means less gear-hunting and a more relaxed drive.',
    tiers: {
      excellent: {
        summary: 'Standout pulling power for its class — effortless overtaking with minimal downshifting.',
        dailyUsage: 'You\'ll rarely need to drop more than one gear to overtake, even fully loaded.',
        advantages: ['Confident highway overtaking without planning ahead', 'Strong low-RPM response reduces gear-shifting in traffic', 'Handles a full cabin and luggage without feeling strained'],
        disadvantages: ['Usually paired with a firmer throttle response that needs a light foot in the city', 'Higher-torque engines can be thirstier under hard acceleration'],
      },
      strong: {
        summary: 'Solid, dependable pulling power that keeps pace with the rest of this segment.',
        dailyUsage: 'Comfortable for daily commuting and occasional highway overtakes with one downshift.',
        advantages: ['Smooth city acceleration', 'Adequate reserve for highway overtaking'],
        disadvantages: ['Overtaking on inclines with a full load needs a bit more planning'],
      },
      typical: {
        summary: 'Gets the job done, in line with what most vehicles in this class offer.',
        dailyUsage: 'Fine for solo or two-person commuting; expect more gear changes with passengers or luggage.',
        advantages: ['Predictable, easy-to-manage power delivery'],
        disadvantages: ['Requires more frequent downshifting on inclines', 'Overtaking with a full load takes more room and planning'],
      },
      behind: {
        summary: 'Trails the rest of the segment — best suited to lighter, mostly-flat driving.',
        dailyUsage: 'Best kept for city use; highway overtaking with passengers will feel strained.',
        advantages: ['Usually comes with better fuel efficiency as a trade-off'],
        disadvantages: ['Struggles with highway overtaking under load', 'Frequent downshifting needed on inclines'],
      },
    },
  },
  power: {
    definition: 'Power (measured in PS) is the rate at which the engine can do work — it governs top speed and how quickly the car keeps accelerating as RPM climbs, complementing torque\'s low-end pull.',
    whyItMatters: 'Power tells you how the car behaves at higher speeds — merging onto a highway, sustained overtaking, or simply how effortless it feels to drive quickly when you want to.',
    tiers: {
      excellent: {
        summary: 'Genuinely quick for its class, with strong high-speed reserves.',
        dailyUsage: 'Merging and overtaking at highway speed feels immediate, without needing to wring out the engine.',
        advantages: ['Confident high-speed overtaking', 'Strong reserve power for sustained highway cruising'],
        disadvantages: ['Tends to come with a firmer, sportier ride tune', 'Higher-power variants usually cost a premium over base trims'],
      },
      strong: {
        summary: 'A well-judged, usable amount of power for everyday and highway driving.',
        dailyUsage: 'Comfortable at highway speeds; overtaking is confident without being explosive.',
        advantages: ['Balanced around-town and highway drivability'],
        disadvantages: ['Not a standout — a few rivals in this class offer noticeably more'],
      },
      typical: {
        summary: 'A functional, unremarkable amount of power — adequate rather than exciting.',
        dailyUsage: 'Fine for city use; highway overtakes need more room and a lower gear.',
        advantages: ['Usually more fuel-efficient at this output level'],
        disadvantages: ['Can feel underpowered on inclines or with a full car'],
      },
      behind: {
        summary: 'Modest output — best matched to city-first use rather than frequent highway runs.',
        dailyUsage: 'City driving is fine; highway overtaking requires patience and planning.',
        advantages: ['Typically the most fuel-efficient variant in the lineup'],
        disadvantages: ['Highway overtaking requires real planning', 'Feels strained with a full load at speed'],
      },
    },
  },
  mileage: {
    definition: 'Mileage (km/l) is the manufacturer-tested fuel efficiency — how far the car travels on a litre of fuel under standardized test conditions.',
    whyItMatters: 'This is the single biggest driver of your monthly running cost. Over a typical 15,000 km/year of driving, even a 2 km/l difference adds up to real money at the pump.',
    tiers: {
      excellent: {
        summary: 'Among the most fuel-efficient options in its class — real savings over years of ownership.',
        dailyUsage: 'Noticeably fewer fuel stops, and lower cost-per-kilometre than most alternatives.',
        advantages: ['Lower running cost over the ownership period', 'Longer range between refuels'],
        disadvantages: ['Efficiency-focused tuning can mean slightly less punchy acceleration'],
      },
      strong: {
        summary: 'Good real-world efficiency — a sensible daily driver from a running-cost perspective.',
        dailyUsage: 'Comfortably competitive running costs for a city-highway mix.',
        advantages: ['Reasonable fuel bills for the segment'],
        disadvantages: ['A few segment rivals do slightly better'],
      },
      typical: {
        summary: 'Average efficiency for the class — nothing that stands out either way.',
        dailyUsage: 'Running costs are in line with what most owners in this segment budget for.',
        advantages: ['Predictable running costs'],
        disadvantages: ['More frequent fuel stops than the efficiency leaders in this class'],
      },
      behind: {
        summary: 'Below the segment average — factor this into your running-cost expectations.',
        dailyUsage: 'Expect noticeably higher monthly fuel spend than efficiency-focused rivals.',
        advantages: ['Often reflects a higher-output engine, which brings its own driving benefits'],
        disadvantages: ['Higher running cost over ownership', 'More frequent refuelling stops'],
      },
    },
  },
  bootSpace: {
    definition: 'Boot space (litres) is the usable luggage capacity behind the rear seats — the number that decides whether a family road trip means one suitcase each or a game of Tetris.',
    whyItMatters: 'For families and frequent travellers, boot space is often as important as anything under the hood. It\'s the difference between comfortably packing for a weekend trip and folding seats down for a single bag.',
    tiers: {
      excellent: {
        summary: 'Spacious for its class — genuinely practical for family trips and airport runs.',
        dailyUsage: 'Fits multiple large suitcases or a full weekly grocery run without folding seats.',
        advantages: ['Comfortably fits luggage for a family holiday', 'Rarely need to fold rear seats for everyday use'],
        disadvantages: ['Larger boots sometimes come with a higher load lip, less convenient for heavy items'],
      },
      strong: {
        summary: 'A generous, usable boot for this class.',
        dailyUsage: 'Handles standard luggage and weekly shopping comfortably.',
        advantages: ['Good everyday practicality'],
        disadvantages: ['Large items like a stroller and a suitcase together can be tight'],
      },
      typical: {
        summary: 'Covers daily essentials but isn\'t a strong point.',
        dailyUsage: 'Fine for a couple\'s daily use; road trips with 4 passengers will need to pack light.',
        advantages: ['Adequate for typical daily errands'],
        disadvantages: ['Limited for large items — folding rear seats helps for bigger loads'],
      },
      behind: {
        summary: 'One of the tighter boots in this class.',
        dailyUsage: 'Best for city use with light daily items; road trips will likely need the seats folded.',
        advantages: ['Often the trade-off for a smaller, easier-to-park footprint'],
        disadvantages: ['Tight for family trips or bulky luggage'],
      },
    },
  },
  groundClearance: {
    definition: 'Ground clearance (mm) is the gap between the lowest point of the car and the road — it determines what speed bumps, potholed roads, and unpaved stretches the car can handle without scraping.',
    whyItMatters: 'This is entirely relative to what the car is built for: 170mm is excellent on a sedan but unremarkable on an SUV, and genuinely limiting on a dedicated off-roader. What matters is clearance relative to the vehicle\'s own class and intended use.',
    tiers: {
      excellent: {
        summary: 'Clears rough patches and unpaved roads with confidence, for what this class of vehicle is built for.',
        dailyUsage: 'Glides over speed bumps and potholed stretches without a second thought.',
        advantages: ['Handles broken roads and unpaved stretches confidently', 'No scraping on steep driveways or speed bumps'],
        disadvantages: ['A higher stance can mean a slightly higher step-in height'],
      },
      strong: {
        summary: 'Comfortably handles most road conditions expected of this class.',
        dailyUsage: 'Copes well with speed bumps and moderately rough patches.',
        advantages: ['Good all-round confidence on mixed road quality'],
        disadvantages: ['Steep, sharp speed bumps still need a slow approach'],
      },
      typical: {
        summary: 'Adequate for city roads but no more than what\'s expected of this class.',
        dailyUsage: 'Fine for well-maintained roads; be cautious over steep speed bumps.',
        advantages: ['Sufficient for typical urban driving'],
        disadvantages: ['Care needed on rough or unpaved roads'],
      },
      behind: {
        summary: 'On the lower side for this class — worth noting if you regularly face bad roads.',
        dailyUsage: 'Best suited to smooth, well-maintained roads; approach speed bumps slowly.',
        advantages: ['Usually comes with a lower centre of gravity, helping stability at speed'],
        disadvantages: ['Risk of scraping on steep speed bumps or unpaved roads'],
      },
    },
  },
  turningRadius: {
    definition: 'Turning radius (metres) is the diameter of the smallest circle the car can complete a U-turn in — a lower number means a tighter, easier turn.',
    whyItMatters: 'This is the single biggest factor in how easy a car is to live with in dense city traffic and tight parking — narrow lanes, U-turns, and parallel parking all get easier as this number shrinks.',
    tiers: {
      excellent: {
        summary: 'Tight and city-friendly — one of the easier vehicles in its class to park and U-turn.',
        dailyUsage: 'Effortless U-turns on narrow roads and easy parallel parking.',
        advantages: ['Easy U-turns without a three-point manoeuvre', 'Simple to park in tight spots'],
        disadvantages: ['None significant — a tight turning radius is close to a pure advantage'],
      },
      strong: {
        summary: 'Good manoeuvrability for city driving.',
        dailyUsage: 'Comfortable U-turns and parking in most day-to-day situations.',
        advantages: ['Manageable in city traffic and parking lots'],
        disadvantages: ['Occasional three-point turns on narrower roads'],
      },
      typical: {
        summary: 'Typical for this class — neither a strength nor a weakness.',
        dailyUsage: 'Fine for most situations; tight U-turns may need an extra manoeuvre.',
        advantages: ['In line with segment expectations'],
        disadvantages: ['Occasionally needs a multi-point turn in narrow lanes'],
      },
      behind: {
        summary: 'Wider than most in this class — factor this into tight city driving.',
        dailyUsage: 'Expect to plan U-turns and reverse-park more deliberately.',
        advantages: ['Often the trade-off for a larger wheelbase and more cabin space'],
        disadvantages: ['Challenging U-turns on narrow roads', 'Tighter parking spots take more manoeuvring'],
      },
    },
  },
  price: {
    definition: 'Ex-showroom price is the base cost before registration, road tax, and insurance are added — the number used to compare vehicles before location-specific on-road costs come in.',
    whyItMatters: 'Price only means something in context of what you get for it — the same amount buys very different feature sets, engines, and cabin quality depending on the segment. This rating reflects pricing relative to this vehicle\'s own segment, not an absolute "cheap vs expensive" score.',
    tiers: {
      excellent: {
        summary: 'Sharply priced relative to what this class typically commands.',
        dailyUsage: 'Frees up budget for accessories, insurance, or a higher trim elsewhere.',
        advantages: ['Strong value entry point for this segment', 'More budget headroom for a higher variant or add-ons'],
        disadvantages: ['Aggressive pricing can sometimes mean a leaner features list — worth checking the specific variant'],
      },
      strong: {
        summary: 'Competitively priced within its segment.',
        dailyUsage: 'Fairly matched to what similar vehicles in this class cost.',
        advantages: ['Reasonable value for the segment'],
        disadvantages: ['A few rivals may undercut it slightly'],
      },
      typical: {
        summary: 'Priced in line with the rest of the segment — no particular value edge either way.',
        dailyUsage: 'Expect costs similar to comparable vehicles in this class.',
        advantages: ['Predictable, market-aligned pricing'],
        disadvantages: ['No standout value advantage over segment rivals'],
      },
      behind: {
        summary: 'Priced at the higher end for this segment.',
        dailyUsage: 'Worth checking what the premium buys — brand badge, features, or resale value.',
        advantages: ['Often reflects stronger brand positioning or resale value'],
        disadvantages: ['Commands a premium over segment-average pricing'],
      },
    },
  },
};

function tierFromPercentile(percentile) {
  if (percentile === null || percentile === undefined) return 'typical';
  if (percentile >= 75) return 'excellent';
  if (percentile >= 50) return 'strong';
  if (percentile >= 25) return 'typical';
  return 'behind';
}

function formatValue(value, unit) {
  if (unit === '₹') {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} Lakh`;
    return `₹${value.toLocaleString('en-IN')}`;
  }
  return `${value} ${unit}`;
}

/**
 * Builds the lightweight, X-Ray-style explanation for one parameter, for
 * one car: 2-3 short punchy bullets, nothing else. No definition, no
 * industry average, no recommended range, no daily-usage essay — those
 * were removed per the drawer redesign (they read like documentation, not
 * a quick comparison aid).
 *
 * Bullet composition is tier-weighted so it matches how a human would
 * actually describe a winner vs. a runner-up:
 *   excellent -> mostly advantages (this is a clear strength)
 *   strong    -> advantages + one honest trade-off
 *   typical   -> balanced
 *   behind    -> mostly the trade-off, one silver lining
 *
 * @param {string} key            benchmark key e.g. 'torque'
 * @param {Object} ctx
 * @param {number} ctx.segmentPercentile  0-100, position within the segment range
 * @param {number} ctx.industryPercentile 0-100, position within the global/industry range
 */
function buildExplanation(key, ctx) {
  const knowledge = PARAM_KNOWLEDGE[key];
  if (!knowledge) return null;

  const { segmentPercentile, industryPercentile } = ctx;
  const tier = tierFromPercentile(segmentPercentile);
  const tierContent = knowledge.tiers[tier];

  const bulletsByTier = {
    excellent: tierContent.advantages.slice(0, 3),
    strong: [...tierContent.advantages.slice(0, 2), ...tierContent.disadvantages.slice(0, 1)],
    typical: [...tierContent.advantages.slice(0, 1), ...tierContent.disadvantages.slice(0, 2)],
    behind: [...tierContent.disadvantages.slice(0, 2), ...tierContent.advantages.slice(0, 1)],
  };
  const bullets = (bulletsByTier[tier] || tierContent.advantages).slice(0, 3);

  return {
    // Backward-compatible fields some older UI still reads
    summary: tierContent.summary,
    details: bullets,

    // What the redesigned drawer actually renders
    expanded: {
      bullets,
      tier,
      segmentPercentile,
      industryPercentile,
    },
  };
}

/**
 * Pure, car-name-agnostic "why did this one win" sentence for a single row,
 * computed once across all compared cars (not per car). The caller
 * (dynamicSpecEngine) prepends the winning car's actual name.
 *
 * @param {string} label
 * @param {string} unit
 * @param {Array<{ slot: string, numeric: number|null, rating: number|null }>} values
 * @param {boolean} higherBetter
 * @returns {{ winnerSlot: string, reasonText: string } | null}
 */
function buildComparisonReason(label, unit, values, higherBetter) {
  const withRatings = values.filter((v) => v.rating !== null && v.rating !== undefined && v.numeric !== null);
  if (withRatings.length < 2) return null;

  const sorted = [...withRatings].sort((a, b) => b.rating - a.rating);
  const [winner, runnerUp] = sorted;
  if (winner.rating === runnerUp.rating) return null; // tie — no clear winner to explain

  const diff = higherBetter ? winner.numeric - runnerUp.numeric : runnerUp.numeric - winner.numeric;
  const absDiff = Math.abs(diff);
  const base = Math.abs(runnerUp.numeric) || 1;
  const diffPct = Math.round((absDiff / base) * 100);
  const diffDisplay = formatValue(Math.round(absDiff * 100) / 100, unit);

  const directionWord = higherBetter ? 'more' : 'less';
  const reasonText = diffPct > 0
    ? `${diffDisplay} ${directionWord} than the next best — a ${diffPct}% edge in ${label.toLowerCase()}.`
    : `Edges ahead on ${label.toLowerCase()}, though by a narrow margin.`;

  return { winnerSlot: winner.slot, reasonText };
}

module.exports = { buildExplanation, buildComparisonReason, tierFromPercentile, formatValue, PARAM_KNOWLEDGE };