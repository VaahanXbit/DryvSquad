// backend/src/controllers/pricingController.js
const PricingEngine = require('../services/pricing');
const Variant = require('../models/Variant');
const Model = require('../models/Model');
const Brand = require('../models/Brand');
const LocationService = require('../services/locationService');

// Calculate on-road price for a variant
exports.calculateOnRoadPrice = async (req, res) => {
  try {
    const { variantId, city, stateCode, includeInsurance = true } = req.body;

    if (!variantId) {
      return res.status(400).json({
        success: false,
        message: 'Variant ID is required',
      });
    }

    // Get variant details
    const variant = await Variant.findById(variantId).lean();
    if (!variant) {
      return res.status(404).json({
        success: false,
        message: 'Variant not found',
      });
    }

    // Get ex-showroom price
    const exShowroomPrice = variant.exShowroomPrice || 0;
    
    if (!exShowroomPrice || exShowroomPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Ex-showroom price not available for this variant',
      });
    }

    // Get model and brand info
    const model = await Model.findById(variant.modelId).lean();
    const brand = model ? await Brand.findById(model.brandId).lean() : null;

    // Determine vehicle type and fuel type
    const vehicleType = model?.bodyType || 'SUV';
    const fuelType = variant.fuelType || 'Petrol';
    const isEV = fuelType === 'Electric';

    // If stateCode not provided, try to get from city
    let finalStateCode = stateCode;
    if (!finalStateCode && city) {
      const location = await LocationService.searchLocations(city);
      if (location && location.length > 0) {
        finalStateCode = location[0].stateCode;
      }
    }

    // Default to Maharashtra if no state specified
    if (!finalStateCode) {
      finalStateCode = 'MH';
    }

    // Calculate on-road price
    const pricing = await PricingEngine.calculateOnRoadPrice({
      exShowroomPrice,
      stateCode: finalStateCode,
      city: city || 'Mumbai',
      fuelType,
      vehicleType,
      isEV,
      includeInsurance,
    });

    // Get vehicle details
    const vehicleDetails = {
      id: variant._id,
      name: variant.name,
      model: model?.name || '',
      brand: brand?.name || '',
      brandIcon: brand?.icon || '',
      image: model?.image || '',
      fuelType: variant.fuelType,
      transmission: variant.transmission,
      engine: variant.engine,
    };

    return res.status(200).json({
      success: true,
      data: {
        vehicle: vehicleDetails,
        pricing: {
          exShowroomPrice: pricing.exShowroomPrice,
          roadTax: pricing.roadTax,
          registrationFee: pricing.registrationFee,
          insurance: pricing.insurance,
          greenTax: pricing.greenTax,
          evSubsidy: pricing.evSubsidy,
          luxuryTax: pricing.luxuryTax,
          handlingCharges: pricing.handlingCharges,
          fastagCharges: pricing.fastagCharges,
          tcsCharges: pricing.tcsCharges,
          total: pricing.total,            // ✅ FIX: Injects 'total' key for frontend card lookups
          totalOnRoadPrice: pricing.total, // Retains fallback compatibility
        },
        location: {
          city: city || 'Mumbai',
          stateCode: finalStateCode,
        },
      },
    });
  } catch (error) {
    console.error('❌ Calculate on-road price error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to calculate on-road price',
    });
  }
};

// Calculate on-road price for multiple variants (for comparison)
exports.calculateMultipleOnRoadPrices = async (req, res) => {
  try {
    const { variantIds, city, stateCode } = req.body;

    if (!variantIds || !Array.isArray(variantIds) || variantIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one variant ID is required',
      });
    }

    const results = [];
    for (const variantId of variantIds) {
      try {
        // Get variant details
        const variant = await Variant.findById(variantId).lean();
        if (!variant) continue;

        const exShowroomPrice = variant.exShowroomPrice || 0;
        if (exShowroomPrice <= 0) continue;

        // Get model and brand
        const model = await Model.findById(variant.modelId).lean();
        const brand = model ? await Brand.findById(model.brandId).lean() : null;

        const isEV = variant.fuelType === 'Electric';
        const pricing = await PricingEngine.calculateOnRoadPrice({
          exShowroomPrice,
          stateCode: stateCode || 'MH',
          city: city || 'Mumbai',
          fuelType: variant.fuelType || 'Petrol',
          vehicleType: model?.bodyType || 'SUV',
          isEV,
        });

        results.push({
          id: variant._id,
          name: variant.name,
          model: model?.name || '',
          brand: brand?.name || '',
          brandIcon: brand?.icon || '',
          image: model?.image || '',
          exShowroomPrice: pricing.exShowroomPrice,
          onRoadPrice: pricing.total,
          pricing: {
            roadTax: pricing.roadTax,
            registrationFee: pricing.registrationFee,
            insurance: pricing.insurance,
            greenTax: pricing.greenTax,
            evSubsidy: pricing.evSubsidy,
            luxuryTax: pricing.luxuryTax,
            total: pricing.total, // ✅ Ensure total key consistency across multi-pricing
          },
        });
      } catch (err) {
        console.error(`Failed to calculate price for variant ${variantId}:`, err);
      }
    }

    return res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('❌ Calculate multiple prices error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to calculate prices',
    });
  }
};

// Get all state pricing rules (admin only)
exports.getStatePricingRules = async (req, res) => {
  try {
    const { stateCode } = req.query;
    
    let query = { isActive: true };
    if (stateCode) {
      query.stateCode = stateCode.toUpperCase();
    }

    const rules = await StatePricingRule.find(query).sort({ state: 1 });
    
    return res.status(200).json({
      success: true,
      data: rules,
    });
  } catch (error) {
    console.error('❌ Get state rules error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get state pricing rules',
    });
  }
};

// Update state pricing rules (admin only)
exports.updateStatePricingRules = async (req, res) => {
  try {
    const { stateCode, rules } = req.body;

    if (!stateCode || !rules) {
      return res.status(400).json({
        success: false,
        message: 'State code and rules are required',
      });
    }

    const updated = await StatePricingRule.findOneAndUpdate(
      { stateCode: stateCode.toUpperCase() },
      { ...rules, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    // Clear pricing engine cache
    PricingEngine.clearCache();

    return res.status(200).json({
      success: true,
      message: 'State pricing rules updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('❌ Update state rules error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update state pricing rules',
    });
  }
};