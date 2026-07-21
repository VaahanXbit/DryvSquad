// backend/src/controllers/compareController.js

/*
================================================================================
File Name : compareController.js
Author : Tahseen Raza
Created Date : 2026-06-24
Description : compare Controller
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const Variant = require('../models/Variant');
const Model = require('../models/Model');
const Brand = require('../models/Brand');
const Benchmark = require('../models/Benchmark');
const RatingService = require('../services/ratingService');
const mongoose = require('mongoose');
const { calculateOnRoadPrice } = require('../services/pricing/calculator');
const { resolveStateRule } = require('../services/pricing/stateRuleResolver');

/**
 * Helper to check if string is valid MongoDB ObjectID
 */
const isValidObjectId = (id) => {
  if (!id || typeof id !== 'string') return false;
  return mongoose.Types.ObjectId.isValid(id) && 
         new mongoose.Types.ObjectId(id).toString() === id;
};

/**
 * Find variant by string ID or ObjectID
 */
const findVariantByAnyId = async (id) => {
  try {
    console.log(`🔍 [compare debug] Looking up variant for id="${id}" (type: ${typeof id}, validObjectId: ${isValidObjectId(id)})`);

    if (isValidObjectId(id)) {
      const variant = await Variant.findById(id).lean();
      console.log(`🔍 [compare debug] Variant.findById("${id}") ->`, variant ? `FOUND (${variant.name})` : 'NOT FOUND');
      if (variant) return variant;
    }
    
    if (typeof id === 'string') {
      // Try to find by customId field (if it exists)
      const byCustomId = await Variant.findOne({ customId: id }).lean();
      if (byCustomId) return byCustomId;
      
      // Try to find by variant name
      const parts = id.split('-');
      const variantName = parts[parts.length - 1];
      
      const variants = await Variant.find({ 
        name: { $regex: new RegExp(`^${variantName}$`, 'i') } 
      }).lean();

      console.log(`🔍 [compare debug] Fallback name search for "${variantName}" -> ${variants.length} candidate(s)`);

      if (variants.length === 0) return null;

      // Batch-fetch all models/brands for the candidates in two queries
      // instead of awaiting Model.findById/Brand.findById one at a time in a loop.
      const modelIds = [...new Set(variants.map(v => String(v.modelId)))];
      const models = await Model.find({ _id: { $in: modelIds } }).lean();
      const modelById = new Map(models.map(m => [String(m._id), m]));

      const brandIds = [...new Set(models.map(m => String(m.brandId)))];
      const brands = await Brand.find({ _id: { $in: brandIds } }).lean();
      const brandById = new Map(brands.map(b => [String(b._id), b]));

      const idLower = id.toLowerCase();
      for (const variant of variants) {
        const model = modelById.get(String(variant.modelId));
        if (!model) continue;
        const brand = brandById.get(String(model.brandId));
        if (!brand) continue;

        const brandMatches = idLower.includes(brand.name.toLowerCase());
        const modelMatches = idLower.includes(model.name.toLowerCase());

        if (brandMatches && modelMatches) {
          return variant;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error finding variant:', error);
    return null;
  }
};

/**
 * Extract numeric value from string
 */
const extractNumeric = (value) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const match = value.match(/^[\d.]+/);
    return match ? parseFloat(match[0]) : null;
  }
  return null;
};

/**
 * Extract numeric value from specifications (handles "375 L" → 375)
 */
const extractSpecNumeric = (value) => {
  if (!value) return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const match = value.match(/^[\d.]+/);
    return match ? parseFloat(match[0]) : null;
  }
  return null;
};

/**
 * Compare two (or optionally three) cars
 */
exports.compareCars = async (req, res) => {
  try {
    const { car1Id, car2Id, car3Id, city, state, stateCode } = req.body;
    
    if (!car1Id || !car2Id) {
      return res.status(400).json({
        success: false,
        message: 'Both car IDs are required for comparison',
      });
    }
    
    // Run all lookups in parallel instead of one-after-another
    const [car1, car2, car3] = await Promise.all([
      findVariantByAnyId(car1Id),
      findVariantByAnyId(car2Id),
      car3Id ? findVariantByAnyId(car3Id) : Promise.resolve(null),
    ]);
    
    if (!car1 || !car2 || (car3Id && !car3)) {
      console.log('❌ Car1 found:', !!car1, 'Car2 found:', !!car2, car3Id ? `Car3 found: ${!!car3}` : '');
      return res.status(404).json({
        success: false,
        message: `One or more cars not found. Car1: ${!!car1}, Car2: ${!!car2}${car3Id ? `, Car3: ${!!car3}` : ''}`,
      });
    }
    
    // Fetch models, then brands + benchmarks, each batch in parallel
    const [model1, model2, model3] = await Promise.all([
      Model.findById(car1.modelId).lean(),
      Model.findById(car2.modelId).lean(),
      car3 ? Model.findById(car3.modelId).lean() : Promise.resolve(null),
    ]);
    const [brand1, brand2, brand3, benchmarks] = await Promise.all([
      Brand.findById(model1.brandId).lean(),
      Brand.findById(model2.brandId).lean(),
      model3 ? Brand.findById(model3.brandId).lean() : Promise.resolve(null),
      Benchmark.find({ isActive: true }).lean(),
    ]);
    
    // ========================================
    // 🔧 FIX: Extract ALL numeric values including specifications
    // ========================================
    
    // Helper to extract specifications with numeric fallback
    const getSpecValue = (specs, key) => {
      return specs?.[key] || null;
    };
    
    // For Car 1
    const specs1 = car1.specifications || {};
    
    // 🔧 IMPORTANT: Extract bootSpace, groundClearance, turningRadius from specifications
    const bootSpace1 = getSpecValue(specs1, 'bootSpace');
    const groundClearance1 = getSpecValue(specs1, 'groundClearance');
    const turningRadius1 = getSpecValue(specs1, 'turningRadius');
    
    // For Car 2
    const specs2 = car2.specifications || {};
    const bootSpace2 = getSpecValue(specs2, 'bootSpace');
    const groundClearance2 = getSpecValue(specs2, 'groundClearance');
    const turningRadius2 = getSpecValue(specs2, 'turningRadius');

    // For Car 3 (optional)
    const specs3 = car3?.specifications || {};
    const bootSpace3 = getSpecValue(specs3, 'bootSpace');
    const groundClearance3 = getSpecValue(specs3, 'groundClearance');
    const turningRadius3 = getSpecValue(specs3, 'turningRadius');
    
    // console.log('🔍 Car1 Specifications:', {
    //   bootSpace: bootSpace1,
    //   groundClearance: groundClearance1,
    //   turningRadius: turningRadius1,
    // });
    
    // console.log('🔍 Car2 Specifications:', {
    //   bootSpace: bootSpace2,
    //   groundClearance: groundClearance2,
    //   turningRadius: turningRadius2,
    // });
    
    // ========================================
    // Dynamic On-Road Price (location-aware)
    // ========================================
    // Only computed when the client supplied a location — Compare Cars
    // sends this once a global location is selected. No onRoadPrice is
    // ever read from the database; it's derived fresh from
    // exShowroomPrice + the caller's state rules every time.
    let onRoadPriceByCar = { car1: null, car2: null, car3: null };
    if (state || stateCode) {
      const { rule, isFallback } = await resolveStateRule({ state, stateCode });
      const buildOnRoad = (variant) => {
        if (!variant || !variant.exShowroomPrice) return null;
        return {
          ...calculateOnRoadPrice({
            exShowroomPrice: variant.exShowroomPrice,
            fuelType: variant.fuelType,
            city,
            state: state || rule.state,
            stateRule: rule,
          }),
          stateRuleUsed: isFallback ? 'national-average-fallback' : rule.state,
        };
      };
      onRoadPriceByCar = {
        car1: buildOnRoad(car1),
        car2: buildOnRoad(car2),
        car3: buildOnRoad(car3),
      };
    }

    const car1Data = {
      _id: car1._id,
      name: car1.name,
      modelName: model1.name,
      brandName: brand1.name,
      brandIcon: brand1.icon,
      price: car1.price,
      exShowroomPrice: car1.exShowroomPrice,
      fuelType: car1.fuelType,
      onRoadPricing: onRoadPriceByCar.car1,
      image: model1.image,
      overallScore: car1.overallScore,
      torqueNumeric: car1.torqueNumeric || extractNumeric(car1.torque),
      powerNumeric: car1.powerNumeric || extractNumeric(car1.power),
      mileageNumeric: car1.mileageNumeric || extractNumeric(car1.mileage),
      // Raw strings kept alongside the numeric fields (additive only) so the
      // segment-aware rating engine can correctly resolve PS vs kW for
      // variants formatted like "61 kW (83 PS) @ 6000 r/min" — the
      // pre-computed powerNumeric field alone isn't reliable for these.
      power: car1.power,
      torque: car1.torque,
      mileage: car1.mileage,
      specifications: {
        bootSpace: bootSpace1,
        groundClearance: groundClearance1,
        turningRadius: turningRadius1,
        // Pass all specs
        ...specs1,
      },
      scores: car1.scores || {},
      factorScores: car1.factorScores || {},
    };
    
    const car2Data = {
      _id: car2._id,
      name: car2.name,
      modelName: model2.name,
      brandName: brand2.name,
      brandIcon: brand2.icon,
      price: car2.price,
      exShowroomPrice: car2.exShowroomPrice,
      fuelType: car2.fuelType,
      onRoadPricing: onRoadPriceByCar.car2,
      image: model2.image,
      overallScore: car2.overallScore,
      torqueNumeric: car2.torqueNumeric || extractNumeric(car2.torque),
      powerNumeric: car2.powerNumeric || extractNumeric(car2.power),
      mileageNumeric: car2.mileageNumeric || extractNumeric(car2.mileage),
      power: car2.power,
      torque: car2.torque,
      mileage: car2.mileage,
      specifications: {
        bootSpace: bootSpace2,
        groundClearance: groundClearance2,
        turningRadius: turningRadius2,
        ...specs2,
      },
      scores: car2.scores || {},
      factorScores: car2.factorScores || {},
    };

    // Car 3 is optional — CarDekho-style 3-way compare
    const car3Data = car3 ? {
      _id: car3._id,
      name: car3.name,
      modelName: model3.name,
      brandName: brand3.name,
      brandIcon: brand3.icon,
      price: car3.price,
      exShowroomPrice: car3.exShowroomPrice,
      fuelType: car3.fuelType,
      onRoadPricing: onRoadPriceByCar.car3,
      image: model3.image,
      overallScore: car3.overallScore,
      torqueNumeric: car3.torqueNumeric || extractNumeric(car3.torque),
      powerNumeric: car3.powerNumeric || extractNumeric(car3.power),
      mileageNumeric: car3.mileageNumeric || extractNumeric(car3.mileage),
      power: car3.power,
      torque: car3.torque,
      mileage: car3.mileage,
      specifications: {
        bootSpace: bootSpace3,
        groundClearance: groundClearance3,
        turningRadius: turningRadius3,
        ...specs3,
      },
      scores: car3.scores || {},
      factorScores: car3.factorScores || {},
    } : null;
    
    // Calculate comparison
    const comparison = RatingService.compareCars(car1Data, car2Data, benchmarks, car3Data);

    // Defensive: RatingService may only copy a known whitelist of fields
    // onto its own car1/car2/car3 output objects. Re-attach onRoadPricing
    // here so it reaches the client regardless of what RatingService does
    // internally — the pricing engine's output must never depend on
    // rating logic being aware of it.
    if (comparison?.car1) comparison.car1.onRoadPricing = onRoadPriceByCar.car1;
    if (comparison?.car2) comparison.car2.onRoadPricing = onRoadPriceByCar.car2;
    if (comparison?.car3) comparison.car3.onRoadPricing = onRoadPriceByCar.car3;
    
    res.status(200).json({
      success: true,
      data: comparison,
    });
  } catch (error) {
    console.error('❌ Compare cars error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to compare cars',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get all benchmarks
 */
exports.getBenchmarks = async (req, res) => {
  try {
    const benchmarks = await Benchmark.find({ isActive: true }).sort({ category: 1, label: 1 });
    res.status(200).json({
      success: true,
      data: benchmarks,
    });
  } catch (error) {
    console.error('❌ Get benchmarks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch benchmarks',
    });
  }
};

/**
 * Seed benchmarks
 */
exports.seedBenchmarks = async (req, res) => {
  try {
    const { benchmarks } = req.body;
    if (!benchmarks || !Array.isArray(benchmarks)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid benchmark data',
      });
    }
    const results = [];
    for (const data of benchmarks) {
      const result = await Benchmark.findOneAndUpdate(
        { key: data.key },
        { ...data, updatedAt: new Date() },
        { upsert: true, new: true }
      );
      results.push(result);
    }
    res.status(200).json({
      success: true,
      message: `${results.length} benchmarks seeded successfully`,
      data: results,
    });
  } catch (error) {
    console.error('❌ Seed benchmarks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to seed benchmarks',
    });
  }
};