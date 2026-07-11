// backend/src/scripts/seedLocationData.js
const mongoose = require('mongoose');
const Location = require('../models/Location');
const StatePricingRule = require('../models/StatePricingRule');
require('dotenv').config();

const connectDB = require('../config/database');

const seedLocations = async () => {
  const locations = [
    // Major cities
    { city: 'Mumbai', district: 'Mumbai City', state: 'Maharashtra', stateCode: 'MH', latitude: 19.0760, longitude: 72.8777, pincode: '400001' },
    { city: 'Delhi', district: 'Delhi', state: 'Delhi', stateCode: 'DL', latitude: 28.7041, longitude: 77.1025, pincode: '110001' },
    { city: 'Bengaluru', district: 'Bengaluru Urban', state: 'Karnataka', stateCode: 'KA', latitude: 12.9716, longitude: 77.5946, pincode: '560001' },
    { city: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', stateCode: 'TS', latitude: 17.3850, longitude: 78.4867, pincode: '500001' },
    { city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', stateCode: 'TN', latitude: 13.0827, longitude: 80.2707, pincode: '600001' },
    { city: 'Kolkata', district: 'Kolkata', state: 'West Bengal', stateCode: 'WB', latitude: 22.5726, longitude: 88.3639, pincode: '700001' },
    { city: 'Pune', district: 'Pune', state: 'Maharashtra', stateCode: 'MH', latitude: 18.5204, longitude: 73.8567, pincode: '411001' },
    { city: 'Ahmedabad', district: 'Ahmedabad', state: 'Gujarat', stateCode: 'GJ', latitude: 23.0225, longitude: 72.5714, pincode: '380001' },
    { city: 'Jaipur', district: 'Jaipur', state: 'Rajasthan', stateCode: 'RJ', latitude: 26.9124, longitude: 75.7873, pincode: '302001' },
    { city: 'Lucknow', district: 'Lucknow', state: 'Uttar Pradesh', stateCode: 'UP', latitude: 26.8467, longitude: 80.9462, pincode: '226001' },
    { city: 'Nagpur', district: 'Nagpur', state: 'Maharashtra', stateCode: 'MH', latitude: 21.1458, longitude: 79.0882, pincode: '440001' },
    { city: 'Indore', district: 'Indore', state: 'Madhya Pradesh', stateCode: 'MP', latitude: 22.7196, longitude: 75.8577, pincode: '452001' },
    { city: 'Warangal', district: 'Warangal', state: 'Telangana', stateCode: 'TS', latitude: 17.9685, longitude: 79.5941, pincode: '506001' },
    { city: 'Bhopal', district: 'Bhopal', state: 'Madhya Pradesh', stateCode: 'MP', latitude: 23.2599, longitude: 77.4126, pincode: '462001' },
    { city: 'Patna', district: 'Patna', state: 'Bihar', stateCode: 'BR', latitude: 25.5941, longitude: 85.1376, pincode: '800001' },
    { city: 'Chandigarh', district: 'Chandigarh', state: 'Chandigarh', stateCode: 'CH', latitude: 30.7333, longitude: 76.7794, pincode: '160001' },
    { city: 'Kochi', district: 'Ernakulam', state: 'Kerala', stateCode: 'KL', latitude: 9.9312, longitude: 76.2673, pincode: '682001' },
    { city: 'Dehradun', district: 'Dehradun', state: 'Uttarakhand', stateCode: 'UK', latitude: 30.3165, longitude: 78.0322, pincode: '248001' },
  ];

  for (const location of locations) {
    await Location.findOneAndUpdate(
      { city: location.city, state: location.state },
      location,
      { upsert: true, new: true }
    );
  }

  console.log(`✅ Seeded ${locations.length} locations`);
};

const seedPricingRules = async () => {
  const defaultRules = {
    roadTax: {
      type: 'percentage',
      percentage: 8,
      minTax: 1000,
      maxTax: 200000,
    },
    registrationFee: {
      type: 'fixed',
      fixedAmount: 600,
    },
    insurance: {
      baseRate: 0.03,
      minAmount: 5000,
      maxAmount: 50000,
      addons: {
        zeroDep: 0.02,
        returnToInvoice: 0.01,
        engineProtect: 0.005,
      },
    },
    greenTax: {
      enabled: false,
      vehicleAgeThreshold: 8,
      rate: 0.02,
    },
    evSubsidy: {
      enabled: true,
      maxAmount: 150000,
      percentage: 0.10,
    },
    luxuryTax: {
      enabled: true,
      threshold: 2000000,
      rate: 2,
    },
    handlingCharges: 5000,
    fastagCharges: 500,
    tcsCharges: 0,
    isActive: true,
  };

  const stateRules = [
    { state: 'Maharashtra', stateCode: 'MH', roadTax: { type: 'percentage', percentage: 9, minTax: 2000, maxTax: 250000 } },
    { state: 'Delhi', stateCode: 'DL', roadTax: { type: 'percentage', percentage: 10, minTax: 1500, maxTax: 200000 } },
    { state: 'Karnataka', stateCode: 'KA', roadTax: { type: 'percentage', percentage: 8, minTax: 1000, maxTax: 180000 } },
    { state: 'Tamil Nadu', stateCode: 'TN', roadTax: { type: 'percentage', percentage: 8, minTax: 1000, maxTax: 150000 } },
    { state: 'Telangana', stateCode: 'TS', roadTax: { type: 'percentage', percentage: 8, minTax: 1000, maxTax: 150000 } },
    { state: 'West Bengal', stateCode: 'WB', roadTax: { type: 'percentage', percentage: 7, minTax: 1000, maxTax: 120000 } },
    { state: 'Gujarat', stateCode: 'GJ', roadTax: { type: 'percentage', percentage: 7, minTax: 1000, maxTax: 150000 } },
    { state: 'Rajasthan', stateCode: 'RJ', roadTax: { type: 'percentage', percentage: 8, minTax: 1000, maxTax: 150000 } },
    { state: 'Uttar Pradesh', stateCode: 'UP', roadTax: { type: 'percentage', percentage: 7, minTax: 1000, maxTax: 120000 } },
    { state: 'Madhya Pradesh', stateCode: 'MP', roadTax: { type: 'percentage', percentage: 7, minTax: 1000, maxTax: 120000 } },
    { state: 'Bihar', stateCode: 'BR', roadTax: { type: 'percentage', percentage: 6, minTax: 500, maxTax: 100000 } },
    { state: 'Chandigarh', stateCode: 'CH', roadTax: { type: 'percentage', percentage: 8, minTax: 1000, maxTax: 150000 } },
    { state: 'Kerala', stateCode: 'KL', roadTax: { type: 'percentage', percentage: 8, minTax: 1000, maxTax: 150000 } },
    { state: 'Uttarakhand', stateCode: 'UK', roadTax: { type: 'percentage', percentage: 7, minTax: 1000, maxTax: 120000 } },
  ];

  // Default rule (fallback)
  await StatePricingRule.findOneAndUpdate(
    { stateCode: 'DEFAULT' },
    { ...defaultRules, state: 'Default', stateCode: 'DEFAULT', isActive: true },
    { upsert: true, new: true }
  );

  // State-specific rules
  for (const rule of stateRules) {
    await StatePricingRule.findOneAndUpdate(
      { stateCode: rule.stateCode },
      {
        ...defaultRules,
        ...rule,
        state: rule.state,
        stateCode: rule.stateCode,
        isActive: true,
      },
      { upsert: true, new: true }
    );
  }

  console.log(`✅ Seeded ${stateRules.length} state pricing rules`);
};

const seedAll = async () => {
  try {
    await connectDB();
    await seedLocations();
    await seedPricingRules();
    console.log('✅ Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedAll();