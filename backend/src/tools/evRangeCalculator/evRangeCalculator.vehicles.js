// backend/src/tools/evRangeCalculator/evRangeCalculator.vehicles.js
/*
================================================================================
File Name : evRangeCalculator.vehicles.js
Description : Vehicle database for the EV Range Calculator.

              Per spec, every record stores ONLY official manufacturer data:
              name, variant, official claimed range (ARAI/MIDC/WLTP as
              published by the manufacturer), battery capacity, and charging
              info. No estimated/city/highway range is ever stored here —
              the calculation engine derives all of that at request time.

              NOTE: the figures below are seeded from publicly published
              ARAI specs at the time of writing and are meant to get the
              feature fully working end-to-end. Before going live, replace/
              verify each entry against your manufacturer data source of
              record (this is the one file to update for that — nothing
              else needs to change).
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

/** @typedef {import('./evRangeCalculator.types')} */

const EV_VEHICLES = [
  {
    id: 'tata-nexon-ev-45-lr',
    manufacturer: 'Tata',
    model: 'Nexon EV',
    variant: '45 kWh Long Range · FWD',
    batteryCapacityKwh: 45,
    officialClaimedRangeKm: 489,
    rangeStandard: 'ARAI',
    drivetrain: 'FWD',
    charging: { acKw: 7.2, acFullTimeHours: 6.5, dcKw: 50, dc10to80Minutes: 56 },
    image: 'https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=400',
  },
  {
    id: 'tata-nexon-ev-30-mr',
    manufacturer: 'Tata',
    model: 'Nexon EV',
    variant: '30 kWh Medium Range · FWD',
    batteryCapacityKwh: 30,
    officialClaimedRangeKm: 312,
    rangeStandard: 'ARAI',
    drivetrain: 'FWD',
    charging: { acKw: 3.3, acFullTimeHours: 9.4, dcKw: 30, dc10to80Minutes: 56 },
    image: 'https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=400',
  },
  {
    id: 'tata-tiago-ev-24',
    manufacturer: 'Tata',
    model: 'Tiago EV',
    variant: '24 kWh · FWD',
    batteryCapacityKwh: 24,
    officialClaimedRangeKm: 315,
    rangeStandard: 'ARAI',
    drivetrain: 'FWD',
    charging: { acKw: 3.3, acFullTimeHours: 7.6, dcKw: 25, dc10to80Minutes: 58 },
    image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400',
  },
  {
    id: 'mg-zs-ev-50',
    manufacturer: 'MG',
    model: 'ZS EV',
    variant: '50.3 kWh Excite · FWD',
    batteryCapacityKwh: 50.3,
    officialClaimedRangeKm: 461,
    rangeStandard: 'ARAI',
    drivetrain: 'FWD',
    charging: { acKw: 7.4, acFullTimeHours: 7, dcKw: 76, dc0to80Minutes: 60 },
    image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=400',
  },
  {
    id: 'mg-comet-ev-17',
    manufacturer: 'MG',
    model: 'Comet EV',
    variant: '17.3 kWh · RWD',
    batteryCapacityKwh: 17.3,
    officialClaimedRangeKm: 230,
    rangeStandard: 'ARAI',
    drivetrain: 'RWD',
    charging: { acKw: 3.3, acFullTimeHours: 7, dcKw: 0, dc0to80Minutes: null },
    image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=400',
  },
  {
    id: 'hyundai-kona-electric-39',
    manufacturer: 'Hyundai',
    model: 'Kona Electric',
    variant: '39.2 kWh Premium · FWD',
    batteryCapacityKwh: 39.2,
    officialClaimedRangeKm: 452,
    rangeStandard: 'ARAI',
    drivetrain: 'FWD',
    charging: { acKw: 7.2, acFullTimeHours: 6.1, dcKw: 50, dc0to80Minutes: 57 },
    image: 'https://images.unsplash.com/photo-1633509817627-5a29634f8f1b?w=400',
  },
  {
    id: 'hyundai-ioniq-5-72',
    manufacturer: 'Hyundai',
    model: 'Ioniq 5',
    variant: '72.6 kWh AWD',
    batteryCapacityKwh: 72.6,
    officialClaimedRangeKm: 631,
    rangeStandard: 'ARAI',
    drivetrain: 'AWD',
    charging: { acKw: 11, acFullTimeHours: 6.5, dcKw: 350, dc10to80Minutes: 18 },
    image: 'https://images.unsplash.com/photo-1633509817627-5a29634f8f1b?w=400',
  },
  {
    id: 'mahindra-xuv400-39',
    manufacturer: 'Mahindra',
    model: 'XUV400',
    variant: '39.4 kWh EL · FWD',
    batteryCapacityKwh: 39.4,
    officialClaimedRangeKm: 456,
    rangeStandard: 'ARAI',
    drivetrain: 'FWD',
    charging: { acKw: 7.2, acFullTimeHours: 6.5, dcKw: 50, dc0to80Minutes: 50 },
    image: 'https://images.unsplash.com/photo-1669192318977-1ec6f6a1f2c8?w=400',
  },
  {
    id: 'byd-atto-3-60',
    manufacturer: 'BYD',
    model: 'Atto 3',
    variant: '60.48 kWh Extended Range · FWD',
    batteryCapacityKwh: 60.48,
    officialClaimedRangeKm: 521,
    rangeStandard: 'ARAI',
    drivetrain: 'FWD',
    charging: { acKw: 7, acFullTimeHours: 10, dcKw: 80, dc0to80Minutes: 50 },
    image: 'https://images.unsplash.com/photo-1622551907985-30b7c5a4e13c?w=400',
  },
  {
    id: 'citroen-ec3-29',
    manufacturer: 'Citroen',
    model: 'eC3',
    variant: '29.2 kWh · FWD',
    batteryCapacityKwh: 29.2,
    officialClaimedRangeKm: 320,
    rangeStandard: 'ARAI',
    drivetrain: 'FWD',
    charging: { acKw: 3.3, acFullTimeHours: 10.9, dcKw: 30, dc0to80Minutes: 57 },
    image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400',
  },
];

/**
 * @param {string} query
 * @returns {Array<import('./evRangeCalculator.types').EvVehicle>}
 */
const searchVehicles = (query) => {
  const normalized = String(query || '').trim().toLowerCase();
  if (!normalized) return EV_VEHICLES;

  return EV_VEHICLES.filter((v) => {
    const haystack = `${v.manufacturer} ${v.model} ${v.variant}`.toLowerCase();
    return haystack.includes(normalized);
  });
};

/**
 * @param {string} id
 * @returns {import('./evRangeCalculator.types').EvVehicle | undefined}
 */
const findVehicleById = (id) => EV_VEHICLES.find((v) => v.id === id);

module.exports = {
  EV_VEHICLES,
  searchVehicles,
  findVehicleById,
};
