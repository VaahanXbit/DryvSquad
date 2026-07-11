// backend/src/services/pricing/index.js
const RoadTaxService = require('./roadTaxService');
const InsuranceService = require('./insuranceService');
const RegistrationService = require('./registrationService');
const GreenTaxService = require('./greenTaxService');
const EVSubsidyService = require('./evSubsidyService');
const LuxuryTaxService = require('./luxuryTaxService');
const StatePricingRule = require('../../models/StatePricingRule');

class PricingEngine {
  constructor() {
    this.roadTaxService = new RoadTaxService();
    this.insuranceService = new InsuranceService();
    this.registrationService = new RegistrationService();
    this.greenTaxService = new GreenTaxService();
    this.evSubsidyService = new EVSubsidyService();
    this.luxuryTaxService = new LuxuryTaxService();
    this.cache = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes
  }

  async getStateRules(stateCode) {
    const cacheKey = `state_rules_${stateCode}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < this.cacheTTL) {
      return cached.data;
    }

    const rules = await StatePricingRule.findOne({ 
      stateCode: stateCode.toUpperCase(),
      isActive: true 
    });

    if (!rules) {
      // Fallback to default rules
      const defaultRules = await StatePricingRule.findOne({ 
        stateCode: 'DEFAULT',
        isActive: true 
      });
      
      if (!defaultRules) {
        throw new Error(`No pricing rules found for state: ${stateCode}`);
      }
      
      this.cache.set(cacheKey, {
        data: defaultRules,
        timestamp: Date.now(),
      });
      
      return defaultRules;
    }

    this.cache.set(cacheKey, {
      data: rules,
      timestamp: Date.now(),
    });

    return rules;
  }

  async calculateOnRoadPrice({
    exShowroomPrice,
    stateCode,
    city,
    fuelType,
    vehicleType,
    vehicleAge = 0, // years
    isEV = false,
    includeInsurance = true,
    includeFastag = true,
    includeHandling = true,
  }) {
    // Get state-specific pricing rules
    const rules = await this.getStateRules(stateCode);

    // 1. Calculate Road Tax
    const roadTax = this.roadTaxService.calculate({
      exShowroomPrice,
      rules: rules.roadTax,
    });

    // 2. Calculate Registration Fee
    const registrationFee = this.registrationService.calculate({
      exShowroomPrice,
      rules: rules.registrationFee,
    });

    // 3. Calculate Insurance (if requested)
    let insurance = 0;
    if (includeInsurance) {
      insurance = this.insuranceService.calculate({
        exShowroomPrice,
        rules: rules.insurance,
        fuelType,
        vehicleType,
      });
    }

    // 4. Calculate Green Tax (if applicable)
    const greenTax = this.greenTaxService.calculate({
      exShowroomPrice,
      vehicleAge,
      rules: rules.greenTax,
    });

    // 5. Calculate EV Subsidy (if EV)
    let evSubsidy = 0;
    if (isEV) {
      evSubsidy = this.evSubsidyService.calculate({
        exShowroomPrice,
        stateCode,
        rules: rules.evSubsidy,
      });
    }

    // 6. Calculate Luxury Tax (if applicable)
    const luxuryTax = this.luxuryTaxService.calculate({
      exShowroomPrice,
      rules: rules.luxuryTax,
    });

    // 7. Other charges
    const handlingCharges = includeHandling ? rules.handlingCharges || 0 : 0;
    const fastagCharges = includeFastag ? rules.fastagCharges || 500 : 0;
    const tcsCharges = rules.tcsCharges || 0;

    // Calculate total on-road price
    let total = exShowroomPrice;
    total += roadTax;
    total += registrationFee;
    total += insurance;
    total += greenTax;
    total -= evSubsidy;
    total += luxuryTax;
    total += handlingCharges;
    total += fastagCharges;
    total += tcsCharges;

    // Ensure minimum price
    total = Math.max(total, exShowroomPrice);

    // Breakdown for response
    const breakdown = {
      exShowroomPrice: parseFloat(exShowroomPrice.toFixed(2)),
      roadTax: parseFloat(roadTax.toFixed(2)),
      registrationFee: parseFloat(registrationFee.toFixed(2)),
      insurance: parseFloat(insurance.toFixed(2)),
      greenTax: parseFloat(greenTax.toFixed(2)),
      evSubsidy: parseFloat(evSubsidy.toFixed(2)),
      luxuryTax: parseFloat(luxuryTax.toFixed(2)),
      handlingCharges: parseFloat(handlingCharges.toFixed(2)),
      fastagCharges: parseFloat(fastagCharges.toFixed(2)),
      tcsCharges: parseFloat(tcsCharges.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
    };

    return breakdown;
  }

  // Clear cache (useful when pricing rules are updated)
  clearCache() {
    this.cache.clear();
  }
}

module.exports = new PricingEngine();