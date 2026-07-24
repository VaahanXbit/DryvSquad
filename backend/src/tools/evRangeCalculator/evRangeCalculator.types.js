// backend/src/tools/evRangeCalculator/evRangeCalculator.types.js
/*
================================================================================
File Name : evRangeCalculator.types.js
Description : JSDoc type definitions — documentation only, no TypeScript
              build step in this project.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================

@typedef {Object} EvVehicle
@property {string} id
@property {string} manufacturer
@property {string} model
@property {string} variant
@property {number} batteryCapacityKwh
@property {number} officialClaimedRangeKm
@property {string} rangeStandard - e.g. "ARAI", "WLTP", "MIDC"
@property {string} drivetrain
@property {Object} charging
@property {string} image

@typedef {Object} CalculateRangeInput
@property {string} vehicleId
@property {number} batteryPercent - 10-100
@property {number} outsideTemperatureC
@property {'city'|'highway'|'mixed'|'hilly'} roadType
@property {number} averageSpeedKmh
@property {'eco'|'normal'|'aggressive'} drivingStyle
@property {'off'|'mixed'|'on'} airConditioning
@property {number} passengers - 1-7
@property {'flat'|'rolling'|'hilly'} terrain
@property {'low'|'moderate'|'heavy'} traffic
@property {Object} [advanced]
@property {number} [advanced.tripDistanceKm]
@property {number} [advanced.homeChargingRatePerKwh]
@property {number} [advanced.publicChargingRatePerKwh]
@property {number} [advanced.reserveBatteryBufferPercent]

@typedef {Object} RangeReductionItem
@property {string} label
@property {number} reductionPercent - positive number = % reduction

@typedef {Object} CalculateRangeResult
@property {EvVehicle} vehicle
@property {number} confidencePercent
@property {number} claimedRangeKm
@property {number} estimatedRealWorldRangeKm
@property {number} rangeBarPercent
@property {number} estimatedBatteryAtDestinationPercent
@property {number} recommendedMaxTripDistanceKm
@property {number} usableBatteryUsedKwh
@property {RangeReductionItem[]} rangeReductionBreakdown
@property {number} totalReductionPercent
@property {Object} claimedVsEstimated
@property {Object} costEstimate
@property {string} aiInsight
@property {Object} tripPlanner
*/

module.exports = {};
