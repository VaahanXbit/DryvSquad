// backend/src/services/rating/segmentClassifier.js
/*
================================================================================
File Name : segmentClassifier.js
Description : Classifies a vehicle into a rating segment. 
              Priority: 1. MODEL_TO_SEGMENT (Explicit Mapping) 
                       2. category / brand / price inference
================================================================================
*/

const LUXURY_BRANDS = new Set(['Audi', 'BMW', 'Mercedes-Benz', 'Volvo', 'Jaguar', 'Land Rover', 'Porsche']);

const MODEL_TO_SEGMENT = {
  // === AUDI ===
  'Audi Q3': 'suv_luxury',
  'Audi Q3 Sportback': 'suv_luxury',
  'Audi Q5': 'suv_luxury',
  'Audi Q7': 'suv_luxury',
  'Audi Q8': 'suv_luxury',
  'Audi RS Q8': 'suv_luxury',
  'Audi RS e-tron GT': 'coupe_premium',
  'Audi A6': 'sedan_premium',
  'Audi A4': 'sedan_premium',

  // === BMW ===
  'BMW 2 Series Gran Coupe': 'coupe_premium',
  'BMW 3 Series': 'sedan_premium',
  'BMW 3 Series Long Wheelbase': 'sedan_premium',
  'BMW 5 Series': 'sedan_premium',
  'BMW i4': 'sedan_premium',
  'BMW XM': 'suv_luxury',
  'BMW X7': 'suv_luxury',
  'BMW 7 Series': 'sedan_premium',
  'BMW i5': 'sedan_premium',
  'BMW i7': 'sedan_premium',
  'BMW iX': 'suv_luxury',
  'BMW iX1': 'suv_compact',
  'BMW X1': 'suv_compact',
  'BMW X3': 'suv_luxury',
  'BMW X5': 'suv_luxury',
  'BMW Z4': 'convertible_premium',
  'BMW M2': 'coupe_premium',

  // === MERCEDES-BENZ ===
  'Mercedes-Benz A-Class Limousine': 'sedan_premium',
  'Mercedes-Benz CLA Electric': 'sedan_premium',
  'Mercedes-Benz E-Class': 'sedan_premium',
  'Mercedes-Benz Maybach S-Class': 'sedan_premium',
  'Mercedes-Benz GLA': 'suv_luxury',
  'Mercedes-Benz GLC': 'suv_luxury',
  'Mercedes-Benz GLE': 'suv_luxury',
  'Mercedes-Benz GLS': 'suv_luxury',
  'Mercedes-Benz C-Class': 'sedan_premium',
  'Mercedes-Benz S-Class': 'sedan_premium',
  'Mercedes-Benz G-Class': 'suv_luxury',
  'Mercedes-Benz AMG C 63': 'sedan_premium',
  'Mercedes-Benz AMG C43': 'sedan_premium',
  'Mercedes-Benz AMG CLE 53': 'coupe_premium',
  'Mercedes-Benz AMG GT Coupe': 'coupe_premium',

  // === HYUNDAI ===
  'Hyundai Creta': 'suv_compact',
  'Hyundai Venue': 'suv_compact',
  'Hyundai Verna': 'sedan_mass',
  'Hyundai i20': 'hatchback',
  'Hyundai Aura': 'sedan_mass',
  'Hyundai Exter': 'hatchback',
  'Hyundai Alcazar': 'suv_midsize',
  'Hyundai Grand i10 Nios': 'hatchback',
  'Hyundai IONIQ 5': 'suv_midsize',
  'Hyundai Creta Electric': 'suv_compact',

  // === KIA ===
  'Kia Seltos': 'suv_compact',
  'Kia Sonet': 'suv_compact',
  'Kia Carens': 'muv_mass',
  'Kia Carens Clavis': 'muv_mass',
  'Kia Syros': 'suv_compact',
  'Kia Carnival': 'muv_premium',
  'Kia EV6': 'suv_midsize',
  'Kia EV9': 'suv_luxury',

  // === TATA ===
  'Tata Nexon': 'suv_compact',
  'Tata Harrier': 'suv_midsize',
  'Tata Safari': 'suv_midsize',
  'Tata Curvv': 'suv_compact',
  'Tata Curvv EV': 'suv_compact',
  'Tata Punch': 'suv_compact',
  'Tata Punch EV': 'suv_compact',
  'Tata Tiago': 'hatchback',
  'Tata Tiago EV': 'hatchback',
  'Tata Tigor': 'sedan_mass',
  'Tata Tigor EV': 'sedan_mass',
  'Tata Altroz': 'hatchback',
  'Tata Sierra': 'suv_compact',
  'Tata Harrier EV': 'suv_midsize',
  'Tata Nexon EV': 'suv_compact',

  // === MAHINDRA ===
  'Mahindra XUV 3XO': 'suv_compact',
  'Mahindra XUV 3XO EV': 'suv_compact',
  'Mahindra XUV400 EV': 'suv_compact',
  'Mahindra XUV700': 'suv_midsize',
  'Mahindra Thar': 'suv_offroad',
  'Mahindra Thar ROXX': 'suv_offroad',
  'Mahindra Scorpio': 'suv_offroad',
  'Mahindra Scorpio N': 'suv_offroad',
  'Mahindra Bolero Neo': 'suv_compact',
  'Mahindra Bolero': 'suv_compact',
  'Mahindra Marazzo': 'muv_mass',
  'Mahindra BE 6': 'suv_compact',
  'Mahindra XEV 9e': 'suv_compact',

  // === MARUTI SUZUKI ===
  'Maruti Suzuki Baleno': 'hatchback',
  'Maruti Suzuki Swift': 'hatchback',
  'Maruti Suzuki Dzire': 'sedan_mass',
  'Maruti Suzuki Ciaz': 'sedan_mass',
  'Maruti Suzuki Celerio': 'hatchback',
  'Maruti Suzuki Alto K10': 'hatchback',
  'Maruti Suzuki S-Presso': 'hatchback',
  'Maruti Suzuki Wagon R': 'hatchback',
  'Maruti Suzuki XL6': 'muv_mass',
  'Maruti Suzuki Ertiga': 'muv_mass',
  'Maruti Suzuki Invicto': 'muv_mass',
  'Maruti Suzuki Brezza': 'suv_compact',
  'Maruti Suzuki FRONX': 'suv_compact',
  'Maruti Suzuki Grand Vitara': 'suv_compact',
  'Maruti Suzuki Jimny': 'suv_offroad',
  'Maruti Suzuki e VITARA': 'suv_compact',

  // === JEEP ===
  'Jeep Compass': 'suv_compact',
  'Jeep Wrangler': 'suv_offroad',
  'Jeep Meridian': 'suv_midsize',
  'Jeep Grand Cherokee': 'suv_luxury',

  // === CITROËN ===
  'Citroën C3X': 'suv_compact',
  'Citroën BasaltX': 'suv_coupe',
  'Citroën C5 Aircross': 'suv_midsize',
  'Citroën Aircross X': 'suv_compact',

  // === HONDA ===
  'Honda Amaze': 'sedan_mass',
  'Honda City': 'sedan_mass',
  'Honda Elevate': 'suv_compact',

  // === OTHER EXISTING MAPPINGS ===
  'Toyota Fortuner': 'suv_offroad',
  'Ford Endeavour': 'suv_offroad',
  'Volvo XC90': 'suv_luxury',
  'Jaguar F-Pace': 'suv_luxury',
  'Toyota Camry': 'sedan_premium',
  'Toyota Glanza': 'hatchback',
  'Toyota Innova Crysta': 'muv_mass',
  'Toyota Innova HyCross': 'muv_mass',
  'Force Gurkha': 'suv_offroad',
  'Land Rover Defender': 'suv_offroad',
};

/**
 * @param {Object} input
 * @param {string} input.category      Body category (SUV, Sedan, Hatchback, MUV, Coupe, etc.)
 * @param {string} input.brandName
 * @param {string} input.modelName
 * @param {number} input.exShowroomPrice
 * @param {string} input.fuelType
 * @returns {{ segmentId: string, segmentLabel: string, tier: 'mass'|'lux', isEV: boolean, isHybrid: boolean, isOffRoad: boolean }}
 */
function classifyVehicle({ category, brandName, modelName, exShowroomPrice, fuelType }) {
  const fullModelName = `${brandName} ${modelName}`.trim();
  
  // 1. PRIORITY: Explicit Model Map
  let segmentId = MODEL_TO_SEGMENT[fullModelName];
  let segmentLabel = '';

  // 2. FALLBACK: Automatic classification based on category, brand, price
  if (!segmentId) {
    const cat = (category || 'SUV').trim();
    const price = typeof exShowroomPrice === 'number' ? exShowroomPrice : null;
    const isLuxury = LUXURY_BRANDS.has(brandName) || (price && price > 3500000);
    
    if (cat === 'SUV') {
      if (isLuxury) segmentId = 'suv_luxury';
      else if (price && price < 1200000) segmentId = 'suv_compact';
      else segmentId = 'suv_midsize';
    } else if (cat === 'Sedan') segmentId = isLuxury ? 'sedan_premium' : 'sedan_mass';
    else if (cat === 'Hatchback') segmentId = 'hatchback';
    else if (cat === 'MUV') segmentId = isLuxury ? 'muv_premium' : 'muv_mass';
    else if (cat === 'SUV-Coupé' || cat === 'SUV-Coupe') segmentId = 'suv_coupe';
    else if (cat === 'Coupe') segmentId = 'coupe_premium';
    else if (cat === 'Convertible') segmentId = 'convertible_premium';
    else segmentId = 'suv_compact'; // Ultimate fallback
  }

  const labels = {
    'hatchback': 'Hatchback',
    'sedan_mass': 'Sedan',
    'sedan_premium': 'Premium Sedan',
    'suv_compact': 'Compact SUV',
    'suv_midsize': 'Mid-size SUV',
    'suv_luxury': 'Luxury SUV',
    'suv_offroad': 'Off-Road SUV',
    'muv_mass': 'MUV',
    'muv_premium': 'Premium MUV',
    'suv_coupe': 'SUV-Coupé',
    'coupe_premium': 'Coupe',
    'convertible_premium': 'Convertible'
  };
  segmentLabel = labels[segmentId] || 'Vehicle';

  return {
    segmentId,
    segmentLabel,
    tier: LUXURY_BRANDS.has(brandName) || (exShowroomPrice && exShowroomPrice > 3500000) ? 'lux' : 'mass',
    isEV: fuelType === 'Electric',
    isHybrid: fuelType === 'Hybrid',
    isOffRoad: segmentId === 'suv_offroad',
  };
}

module.exports = { classifyVehicle, MODEL_TO_SEGMENT };