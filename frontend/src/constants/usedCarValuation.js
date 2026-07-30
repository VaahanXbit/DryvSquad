// src/constants/usedCarValuation.js
/*
================================================================================
File Name : usedCarValuation.js
Description : Static guidance copy, dropdown option labels, and defaults
              for the Used Car Valuation form. Brand / Model / Variant /
              City are NEVER hardcoded here — they're fetched live from the
              backend (MongoDB / the site-wide Location system). The
              ADVANCED_FIELD_OPTIONS below are UI copy only — the option
              LABELS a user picks from — the actual valuation RATE for
              each option lives in usedCarValuation.config.js on the
              backend, so this list and the backend's OPTIONAL_ADJUSTMENTS
              table must stay in sync when adding a new option.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

export const OWNER_OPTIONS = [
  { value: 1, label: '1st Owner' },
  { value: 2, label: '2nd Owner' },
  { value: 3, label: '3rd Owner' },
  { value: 4, label: '4th Owner' },
  { value: 5, label: '5th Owner or more' },
];

export const FIELD_GUIDANCE = {
  registrationYear: 'The year your vehicle was first registered.',
  brand: 'Choose the manufacturer of your vehicle.',
  model: 'Choose the model of your vehicle.',
  variant: 'Choose the exact variant — pricing and specs differ by variant.',
  city: 'Resale value varies by city depending on local demand.',
  kilometersDriven: 'Total kilometers on the odometer.',
  ownerNumber: 'Number of owners this vehicle has had, including you.',
};

export const MIN_REGISTRATION_YEAR = 2000;
export const MIN_KILOMETERS = 0;
export const MAX_KILOMETERS = 500000;

// Advanced Details (Optional) — collapsed by default. Filling these in
// refines the valuation; leaving them blank still produces a complete one.
export const ADVANCED_FIELD_OPTIONS = {
  exteriorCondition: {
    label: 'Exterior Condition',
    icon: 'car',
    options: ['Excellent', 'Good', 'Fair', 'Poor'],
  },
  accidentHistory: {
    label: 'Accident History',
    icon: 'alert',
    options: ['No Accident', 'Minor Accident', 'Major Accident'],
  },
  engineCondition: {
    label: 'Engine Condition',
    icon: 'engine',
    options: ['Excellent', 'Good', 'Fair', 'Poor'],
  },
  serviceHistory: {
    label: 'Service History',
    icon: 'wrench',
    options: ['Regularly Serviced', 'Partially Serviced', 'No Service Record'],
  },
  insuranceStatus: {
    label: 'Insurance Status',
    icon: 'shield',
    options: ['Active', 'Expired', 'Not Available'],
  },
  loanStatus: {
    label: 'Loan Status',
    icon: 'file',
    options: ['No Loan', 'Loan Active'],
  },
};

// Formats a rupee amount the way Indian used-car listings usually show
// prices — in Lakh (L) or Crore (Cr) — used across every result card so
// they all agree on the same formatting.
export const formatRupeesShort = (amount) => {
  const value = Number(amount) || 0;
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (abs >= 10000000) return `${sign}\u20b9${(abs / 10000000).toFixed(2)} Cr`;
  if (abs >= 100000) return `${sign}\u20b9${(abs / 100000).toFixed(2)} L`;
  return `${sign}\u20b9${Math.round(abs).toLocaleString('en-IN')}`;
};

export const DEFAULT_FORM_VALUES = {
  registrationYear: new Date().getFullYear() - 3,
  brandId: null,
  modelId: null,
  variantId: null,
  kilometersDriven: 40000,
  ownerNumber: 1,
};

export const DEFAULT_ADVANCED_DETAILS = {
  exteriorCondition: '',
  accidentHistory: '',
  engineCondition: '',
  serviceHistory: '',
  insuranceStatus: '',
  loanStatus: '',
};
