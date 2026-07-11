// backend/src/models/StatePricingRule.js
const mongoose = require('mongoose');

const StatePricingRuleSchema = new mongoose.Schema({
  state: {
    type: String,
    required: true,
    trim: true,
  },
  stateCode: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
  },
  // Road Tax Rules
  roadTax: {
    type: {
      type: String,
      enum: ['percentage', 'slab', 'fixed'],
      default: 'percentage',
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    slabs: [{
      minPrice: { type: Number, min: 0 },
      maxPrice: { type: Number, min: 0 },
      rate: { type: Number, min: 0, max: 100 },
    }],
    fixedAmount: { type: Number, min: 0 },
    minTax: { type: Number, min: 0 },
    maxTax: { type: Number, min: 0 },
  },
  // Registration Fee Rules
  registrationFee: {
    type: {
      type: String,
      enum: ['fixed', 'percentage', 'slab'],
      default: 'fixed',
    },
    fixedAmount: { type: Number, min: 0 },
    percentage: { type: Number, min: 0, max: 100 },
    slabs: [{
      minPrice: { type: Number, min: 0 },
      maxPrice: { type: Number, min: 0 },
      amount: { type: Number, min: 0 },
    }],
  },
  // Insurance Rules (approximate)
  insurance: {
    baseRate: { type: Number, min: 0, default: 0.03 }, // 3% of ex-showroom
    minAmount: { type: Number, min: 0 },
    maxAmount: { type: Number, min: 0 },
    addons: {
      zeroDep: { type: Number, min: 0, default: 0.02 },
      returnToInvoice: { type: Number, min: 0, default: 0.01 },
      engineProtect: { type: Number, min: 0, default: 0.005 },
    },
  },
  // Green Tax (for older vehicles)
  greenTax: {
    enabled: { type: Boolean, default: false },
    vehicleAgeThreshold: { type: Number, default: 8 }, // years
    rate: { type: Number, min: 0, default: 0.02 }, // 2% of ex-showroom
  },
  // EV Subsidy (state-specific)
  evSubsidy: {
    enabled: { type: Boolean, default: false },
    maxAmount: { type: Number, min: 0 },
    percentage: { type: Number, min: 0, max: 100 },
    batteryCapacityMin: { type: Number, min: 0 }, // kWh
  },
  // Luxury Tax (for vehicles above a certain price)
  luxuryTax: {
    enabled: { type: Boolean, default: false },
    threshold: { type: Number, min: 0 },
    rate: { type: Number, min: 0, max: 100 },
  },
  // Other charges
  handlingCharges: {
    type: Number,
    default: 0,
  },
  fastagCharges: {
    type: Number,
    default: 500,
  },
  tcsCharges: {
    type: Number,
    default: 0,
  },
  // Cess / other charges
  cess: {
    enabled: { type: Boolean, default: false },
    rate: { type: Number, min: 0, max: 100 },
    threshold: { type: Number, min: 0 },
  },
  // Active status
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

StatePricingRuleSchema.index({ state: 1, stateCode: 1 });
StatePricingRuleSchema.index({ stateCode: 1 });

module.exports = mongoose.model('StatePricingRule', StatePricingRuleSchema);