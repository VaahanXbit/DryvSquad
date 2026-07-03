// backend/src/controllers/carController.js
/*
================================================================================
File Name : carController.js
Author : Tahseen Raza
Created Date : 2026-06-22
Description : Car controller with all CRUD operations
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const Brand = require('../models/Brand');
const Model = require('../models/Model');
const Variant = require('../models/Variant');
const mongoose = require('mongoose');

// ========================================
// BRAND CONTROLLERS
// ========================================

// Get full car hierarchy (Brand → Model → Variant)
exports.getFullCarHierarchy = async (req, res) => {
  try {
    // ✅ OPTIMIZED: 3 batched queries run in parallel instead of the
    // previous "1 + one-per-brand + one-per-model" sequential pattern
    // (which was 50-100+ round trips on a real dataset). Response shape,
    // field names, ordering, and all business logic are unchanged.
    const [brands, models, variants] = await Promise.all([
      Brand.find().sort({ name: 1 }).lean(),
      Model.find().sort({ name: 1 }).lean(),
      Variant.find().sort({ name: 1 }).lean(),
    ]);

    // Group models by brandId, and variants by modelId, in memory (O(n)).
    // Because `models` and `variants` were fetched already sorted by name,
    // the grouped arrays preserve the same per-group order the old
    // per-brand / per-model queries produced.
    const modelsByBrand = new Map();
    for (const model of models) {
      const key = String(model.brandId);
      if (!modelsByBrand.has(key)) modelsByBrand.set(key, []);
      modelsByBrand.get(key).push(model);
    }

    const variantsByModel = new Map();
    for (const variant of variants) {
      const key = String(variant.modelId);
      if (!variantsByModel.has(key)) variantsByModel.set(key, []);
      variantsByModel.get(key).push(variant);
    }

    const result = brands.map((brand) => {
      const brandModels = modelsByBrand.get(String(brand._id)) || [];

      return {
        brand: brand.name,
        brandSlug: brand.slug,
        brandIcon: brand.icon,
        brandDescription: brand.description,
        models: brandModels.map((model) => {
          const modelVariants = variantsByModel.get(String(model._id)) || [];

          return {
            name: model.name,
            slug: model.slug,
            image: model.image,
            bodyType: model.bodyType,
            seatingCapacity: model.seatingCapacity,
            description: model.description,
            variants: modelVariants.map((v) => ({
              _id: v._id.toString(),
              name: v.name,
              price: v.price,
              exShowroomPrice: v.exShowroomPrice,
              onRoadPrice: v.onRoadPrice,
              engine: v.engine,
              displacement: v.displacement,
              fuelType: v.fuelType,
              transmission: v.transmission,
              power: v.power,
              torque: v.torque,
              mileage: v.mileage,
              torqueNumeric: v.torqueNumeric,
              powerNumeric: v.powerNumeric,
              mileageNumeric: v.mileageNumeric,
              overallScore: v.overallScore,
              // ✅ SEND SCORES AND FACTOR SCORES
              scores: v.scores || null,
              factorScores: v.factorScores || null,
              specifications: v.specifications || {},
            })),
          };
        }),
      };
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('❌ Get full car hierarchy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch car data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get all brands
exports.getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.find().sort({ name: 1 });
    res.status(200).json({
      success: true,
      data: brands,
    });
  } catch (error) {
    console.error('❌ Get brands error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch brands',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get brand by ID
exports.getBrandById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid brand ID format',
      });
    }
    
    const brand = await Brand.findById(id);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found',
      });
    }
    
    res.status(200).json({
      success: true,
      data: brand,
    });
  } catch (error) {
    console.error('❌ Get brand by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch brand',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get brand by slug
exports.getBrandBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const brand = await Brand.findOne({ slug });
    
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found',
      });
    }
    
    res.status(200).json({
      success: true,
      data: brand,
    });
  } catch (error) {
    console.error('❌ Get brand by slug error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch brand',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ========================================
// MODEL CONTROLLERS
// ========================================

// Get all models
exports.getModelsByBrandId = async (req, res) => {
  try {
    const models = await Model.find().populate('brandId', 'name icon').sort({ name: 1 });
    res.status(200).json({
      success: true,
      count: models.length,
      data: models,
    });
  } catch (error) {
    console.error('❌ Get models error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch models',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get model by ID
exports.getModelById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid model ID format',
      });
    }
    
    const model = await Model.findById(id).populate('brandId', 'name icon');
    if (!model) {
      return res.status(404).json({
        success: false,
        message: 'Model not found',
      });
    }
    
    res.status(200).json({
      success: true,
      data: model,
    });
  } catch (error) {
    console.error('❌ Get model by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch model',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get model by slug
exports.getModelBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const model = await Model.findOne({ slug }).populate('brandId', 'name icon');
    
    if (!model) {
      return res.status(404).json({
        success: false,
        message: 'Model not found',
      });
    }
    
    res.status(200).json({
      success: true,
      data: model,
    });
  } catch (error) {
    console.error('❌ Get model by slug error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch model',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get models by brand slug
exports.getModelsByBrandSlug = async (req, res) => {
  try {
    const { brandSlug } = req.params;
    const brand = await Brand.findOne({ slug: brandSlug });
    
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found',
      });
    }
    
    const models = await Model.find({ brandId: brand._id }).sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      brand: {
        id: brand._id,
        name: brand.name,
        icon: brand.icon,
      },
      count: models.length,
      data: models,
    });
  } catch (error) {
    console.error('❌ Get models by brand slug error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch models',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ========================================
// VARIANT CONTROLLERS
// ========================================

// Get all variants
exports.getVariantsByModelId = async (req, res) => {
  try {
    const variants = await Variant.find().populate({
      path: 'modelId',
      populate: { path: 'brandId', select: 'name icon' }
    }).sort({ overallScore: -1, name: 1 });
    
    res.status(200).json({
      success: true,
      count: variants.length,
      data: variants,
    });
  } catch (error) {
    console.error('❌ Get variants error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch variants',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get variant by ID
exports.getVariantById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid variant ID format',
      });
    }
    
    const variant = await Variant.findById(id);
    if (!variant) {
      return res.status(404).json({
        success: false,
        message: 'Variant not found',
      });
    }
    
    const model = await Model.findById(variant.modelId);
    const brand = await Brand.findById(model.brandId);
    
    res.status(200).json({
      success: true,
      data: {
        ...variant.toObject(),
        model: model ? {
          id: model._id,
          name: model.name,
          slug: model.slug,
          image: model.image,
        } : null,
        brand: brand ? {
          id: brand._id,
          name: brand.name,
          slug: brand.slug,
          icon: brand.icon,
        } : null,
      },
    });
  } catch (error) {
    console.error('❌ Get variant by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch variant',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get variants by model slug
exports.getVariantsByModelSlug = async (req, res) => {
  try {
    const { modelSlug } = req.params;
    const model = await Model.findOne({ slug: modelSlug });
    
    if (!model) {
      return res.status(404).json({
        success: false,
        message: 'Model not found',
      });
    }
    
    const variants = await Variant.find({ modelId: model._id }).sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      model: {
        id: model._id,
        name: model.name,
        image: model.image,
      },
      count: variants.length,
      data: variants,
    });
  } catch (error) {
    console.error('❌ Get variants by model slug error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch variants',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ========================================
// SPECIALIZED CONTROLLERS
// ========================================

// Get top rated cars
exports.getTopRatedCars = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const variants = await Variant.find()
      .sort({ overallScore: -1 })
      .limit(limit);
    
    const results = [];
    for (const variant of variants) {
      const model = await Model.findById(variant.modelId);
      const brand = await Brand.findById(model.brandId);
      results.push({
        id: variant._id,
        name: variant.name,
        price: variant.price,
        overallScore: variant.overallScore,
        scores: variant.scores,
        factorScores: variant.factorScores,
        model: model ? model.name : null,
        brand: brand ? brand.name : null,
        brandIcon: brand ? brand.icon : null,
        image: model ? model.image : null,
      });
    }
    
    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error('❌ Get top rated cars error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top rated cars',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Search cars
exports.searchCars = async (req, res) => {
  try {
    const { query } = req.params;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters',
      });
    }
    
    const searchRegex = new RegExp(query, 'i');
    
    const variants = await Variant.find({
      $or: [
        { name: searchRegex },
        { fuelType: searchRegex },
        { transmission: searchRegex },
      ]
    }).limit(20);
    
    const results = [];
    for (const variant of variants) {
      const model = await Model.findById(variant.modelId);
      const brand = await Brand.findById(model.brandId);
      results.push({
        id: variant._id,
        type: 'variant',
        name: variant.name,
        price: variant.price,
        overallScore: variant.overallScore,
        model: model ? model.name : null,
        brand: brand ? brand.name : null,
        brandIcon: brand ? brand.icon : null,
        image: model ? model.image : null,
      });
    }
    
    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error('❌ Search cars error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search cars',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Compare two cars
exports.compareCars = async (req, res) => {
  try {
    const { car1Id, car2Id } = req.body;
    
    if (!car1Id || !car2Id) {
      return res.status(400).json({
        success: false,
        message: 'Both car IDs are required for comparison',
      });
    }
    
    const car1 = await Variant.findById(car1Id);
    const car2 = await Variant.findById(car2Id);
    
    if (!car1 || !car2) {
      return res.status(404).json({
        success: false,
        message: 'One or both cars not found',
      });
    }
    
    const model1 = await Model.findById(car1.modelId);
    const model2 = await Model.findById(car2.modelId);
    const brand1 = await Brand.findById(model1.brandId);
    const brand2 = await Brand.findById(model2.brandId);
    
    const getComparisonResult = (score1, score2) => {
      if (score1 > score2) return 'car1';
      if (score2 > score1) return 'car2';
      return 'tie';
    };
    
    const scoreComparison = {};
    if (car1.scores && car2.scores) {
      const categories = Object.keys(car1.scores);
      categories.forEach(category => {
        scoreComparison[category] = getComparisonResult(
          car1.scores[category] || 0,
          car2.scores[category] || 0
        );
      });
    }
    
    res.status(200).json({
      success: true,
      comparison: {
        car1: {
          id: car1._id,
          name: car1.name,
          price: car1.price,
          engine: car1.engine,
          fuelType: car1.fuelType,
          transmission: car1.transmission,
          mileage: car1.mileage,
          overallScore: car1.overallScore,
          scores: car1.scores,
          factorScores: car1.factorScores,
          model: model1 ? model1.name : null,
          brand: brand1 ? brand1.name : null,
          brandIcon: brand1 ? brand1.icon : null,
        },
        car2: {
          id: car2._id,
          name: car2.name,
          price: car2.price,
          engine: car2.engine,
          fuelType: car2.fuelType,
          transmission: car2.transmission,
          mileage: car2.mileage,
          overallScore: car2.overallScore,
          scores: car2.scores,
          factorScores: car2.factorScores,
          model: model2 ? model2.name : null,
          brand: brand2 ? brand2.name : null,
          brandIcon: brand2 ? brand2.icon : null,
        },
        winner: car1.overallScore > car2.overallScore ? 'car1' : 
                car2.overallScore > car1.overallScore ? 'car2' : 'tie',
        scoreComparison,
      },
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

// Get cars by fuel type
exports.getCarsByFuelType = async (req, res) => {
  try {
    const { fuelType } = req.params;
    
    const validFuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'];
    if (!validFuelTypes.includes(fuelType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid fuel type. Allowed: ${validFuelTypes.join(', ')}`,
      });
    }
    
    const variants = await Variant.find({ fuelType }).sort({ overallScore: -1 });
    
    const results = [];
    for (const variant of variants) {
      const model = await Model.findById(variant.modelId);
      const brand = await Brand.findById(model.brandId);
      results.push({
        id: variant._id,
        name: variant.name,
        price: variant.price,
        fuelType: variant.fuelType,
        overallScore: variant.overallScore,
        model: model ? model.name : null,
        brand: brand ? brand.name : null,
        brandIcon: brand ? brand.icon : null,
      });
    }
    
    res.status(200).json({
      success: true,
      count: results.length,
      fuelType,
      data: results,
    });
  } catch (error) {
    console.error('❌ Get cars by fuel type error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cars by fuel type',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get cars by body type
exports.getCarsByBodyType = async (req, res) => {
  try {
    const { bodyType } = req.params;
    
    const validBodyTypes = ['SUV', 'Sedan', 'Hatchback', 'MUV', 'Coupe', 'Convertible'];
    if (!validBodyTypes.includes(bodyType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid body type. Allowed: ${validBodyTypes.join(', ')}`,
      });
    }
    
    const models = await Model.find({ bodyType });
    const results = [];
    
    for (const model of models) {
      const brand = await Brand.findById(model.brandId);
      const variants = await Variant.find({ modelId: model._id }).sort({ overallScore: -1 });
      results.push({
        model: {
          id: model._id,
          name: model.name,
          image: model.image,
          bodyType: model.bodyType,
        },
        brand: brand ? brand.name : null,
        brandIcon: brand ? brand.icon : null,
        variants: variants.map(v => ({
          id: v._id,
          name: v.name,
          price: v.price,
          overallScore: v.overallScore,
        })),
      });
    }
    
    res.status(200).json({
      success: true,
      count: results.length,
      bodyType,
      data: results,
    });
  } catch (error) {
    console.error('❌ Get cars by body type error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cars by body type',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};