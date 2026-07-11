// backend/src/services/pricing/insuranceService.js
class InsuranceService {
  calculate({ exShowroomPrice, rules, fuelType, vehicleType }) {
    if (!rules) return 0;

    let baseInsurance = 0;

    // Calculate base insurance
    if (rules.baseRate) {
      baseInsurance = exShowroomPrice * rules.baseRate;
    }

    // Apply min and max limits
    if (rules.minAmount && baseInsurance < rules.minAmount) {
      baseInsurance = rules.minAmount;
    }
    if (rules.maxAmount && baseInsurance > rules.maxAmount) {
      baseInsurance = rules.maxAmount;
    }

    // Add-ons (optional)
    let addons = 0;
    if (rules.addons) {
      const addonRates = rules.addons;
      for (const [key, rate] of Object.entries(addonRates)) {
        if (rate > 0) {
          addons += exShowroomPrice * rate;
        }
      }
    }

    return baseInsurance + addons;
  }
}

module.exports = InsuranceService;