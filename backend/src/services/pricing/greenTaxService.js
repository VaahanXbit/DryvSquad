// backend/src/services/pricing/greenTaxService.js
class GreenTaxService {
  calculate({ exShowroomPrice, vehicleAge, rules }) {
    if (!rules || !rules.enabled) {
      return 0;
    }

    // Only apply for vehicles older than threshold
    if (vehicleAge < (rules.vehicleAgeThreshold || 8)) {
      return 0;
    }

    // Calculate green tax (percentage of ex-showroom price)
    const rate = rules.rate || 0.02; // Default 2%
    return exShowroomPrice * rate;
  }
}

module.exports = GreenTaxService;