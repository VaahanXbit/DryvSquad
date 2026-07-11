// backend/src/services/pricing/evSubsidyService.js
class EVSubsidyService {
  calculate({ exShowroomPrice, stateCode, rules }) {
    if (!rules || !rules.enabled) {
      return 0;
    }

    let subsidy = 0;

    // Calculate based on percentage
    if (rules.percentage) {
      subsidy = (exShowroomPrice * rules.percentage) / 100;
    }

    // Apply maximum cap
    if (rules.maxAmount && subsidy > rules.maxAmount) {
      subsidy = rules.maxAmount;
    }

    return subsidy;
  }
}

module.exports = EVSubsidyService;