// backend/src/services/pricing/roadTaxService.js
class RoadTaxService {
  calculate({ exShowroomPrice, rules }) {
    if (!rules || !rules.type) {
      return 0;
    }

    let tax = 0;

    switch (rules.type) {
      case 'percentage':
        tax = (exShowroomPrice * (rules.percentage || 0)) / 100;
        break;

      case 'slab':
        if (rules.slabs && Array.isArray(rules.slabs)) {
          for (const slab of rules.slabs) {
            if (exShowroomPrice >= slab.minPrice && 
                (slab.maxPrice === 0 || exShowroomPrice <= slab.maxPrice)) {
              tax = (exShowroomPrice * (slab.rate || 0)) / 100;
              break;
            }
          }
        }
        break;

      case 'fixed':
        tax = rules.fixedAmount || 0;
        break;

      default:
        tax = 0;
    }

    // Apply min and max tax limits
    if (rules.minTax && tax < rules.minTax) {
      tax = rules.minTax;
    }
    if (rules.maxTax && tax > rules.maxTax) {
      tax = rules.maxTax;
    }

    return tax;
  }
}

module.exports = RoadTaxService;