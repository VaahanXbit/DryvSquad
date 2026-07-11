// backend/src/services/pricing/luxuryTaxService.js
class LuxuryTaxService {
  calculate({ exShowroomPrice, rules }) {
    if (!rules || !rules.enabled) {
      return 0;
    }

    // Only apply if price exceeds threshold
    if (exShowroomPrice < (rules.threshold || 0)) {
      return 0;
    }

    // Calculate luxury tax
    const taxableAmount = exShowroomPrice - (rules.threshold || 0);
    return taxableAmount * ((rules.rate || 0) / 100);
  }
}

module.exports = LuxuryTaxService;