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
    if (isValidObjectId(id)) {
      const variant = await Variant.findById(id).lean();
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
 * Compare two cars
 */
exports.compareCars = async (req, res) => {
  try {
    const { car1Id, car2Id } = req.body;
    
    if (!car1Id || !car2Id) {
      return res.status(400).json({
        success: false,
        message: 'Both car IDs are required for comparison',
      });
    }
    
    // Run both lookups in parallel instead of one-after-another
    const [car1, car2] = await Promise.all([
      findVariantByAnyId(car1Id),
      findVariantByAnyId(car2Id),
    ]);
    
    if (!car1 || !car2) {
      console.log('❌ Car1 found:', !!car1, 'Car2 found:', !!car2);
      return res.status(404).json({
        success: false,
        message: `One or both cars not found. Car1: ${!!car1}, Car2: ${!!car2}`,
      });
    }
    
    // Fetch models, then brands + benchmarks, each batch in parallel
    const [model1, model2] = await Promise.all([
      Model.findById(car1.modelId).lean(),
      Model.findById(car2.modelId).lean(),
    ]);
    const [brand1, brand2, benchmarks] = await Promise.all([
      Brand.findById(model1.brandId).lean(),
      Brand.findById(model2.brandId).lean(),
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
    
    const car1Data = {
      _id: car1._id,
      name: car1.name,
      modelName: model1.name,
      brandName: brand1.name,
      brandIcon: brand1.icon,
      price: car1.price,
      exShowroomPrice: car1.exShowroomPrice,
      image: model1.image,
      overallScore: car1.overallScore,
      torqueNumeric: car1.torqueNumeric || extractNumeric(car1.torque),
      powerNumeric: car1.powerNumeric || extractNumeric(car1.power),
      mileageNumeric: car1.mileageNumeric || extractNumeric(car1.mileage),
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
      image: model2.image,
      overallScore: car2.overallScore,
      torqueNumeric: car2.torqueNumeric || extractNumeric(car2.torque),
      powerNumeric: car2.powerNumeric || extractNumeric(car2.power),
      mileageNumeric: car2.mileageNumeric || extractNumeric(car2.mileage),
      specifications: {
        bootSpace: bootSpace2,
        groundClearance: groundClearance2,
        turningRadius: turningRadius2,
        ...specs2,
      },
      scores: car2.scores || {},
      factorScores: car2.factorScores || {},
    };
    
    // Calculate comparison
    const comparison = RatingService.compareCars(car1Data, car2Data, benchmarks);
    
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