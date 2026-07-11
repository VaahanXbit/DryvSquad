// backend/src/services/pricing/registrationService.js
class RegistrationService {
  calculate({ exShowroomPrice, rules }) {
    if (!rules || !rules.type) {
      return 0;
    }

    let fee = 0;

    switch (rules.type) {
      case 'fixed':
        fee = rules.fixedAmount || 0;
        break;

      case 'percentage':
        fee = (exShowroomPrice * (rules.percentage || 0)) / 100;
        break;

      case 'slab':
        if (rules.slabs && Array.isArray(rules.slabs)) {
          for (const slab of rules.slabs) {
            if (exShowroomPrice >= slab.minPrice && 
                (slab.maxPrice === 0 || exShowroomPrice <= slab.maxPrice)) {
              fee = slab.amount || 0;
              break;
            }
          }
        }
        break;

      default:
        fee = 0;
    }

    return fee;
  }
}

module.exports = RegistrationService;