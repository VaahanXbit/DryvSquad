// backend/src/scripts/seedHeroBanners.js
/*
================================================================================
File Name : seedHeroBanners.js
Description : One-time seed script. Inserts the three original Hero images
              (previously a hardcoded fallback array in Home.jsx) as real
              HeroBanner documents in the database, so they show up in
              Admin → Hero Banner Management immediately, fully editable —
              same as any banner an admin creates from scratch.

              Safe to run more than once: if the HeroBanner collection
              already has anything in it (e.g. an admin has already started
              managing banners), this does nothing rather than risk
              duplicating or clobbering real content.

Usage (from the backend/ directory):
              node src/scripts/seedHeroBanners.js
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

try {
  require('dotenv').config();
} catch (e) {
  // dotenv not installed / not used in this project — fine, env vars are
  // assumed to already be present in the environment this script runs in.
}

const mongoose = require('mongoose');
const connectDB = require('../config/database');
const HeroBanner = require('../models/HeroBanner');

const SEED_BANNERS = [
  {
    title: 'Automotive Insights Hero',
    desktopImage: '/Hero1.png',
    mobileImage: '/Hero1-mobile.png',
    buttonText: 'Explore Articles →',
    buttonLink: '/articles',
    displayOrder: 0,
    isActive: true,
  },
  {
    title: 'Travelogue Hero',
    desktopImage: '/Hero2.png',
    mobileImage: '/Hero2-mobile.png',
    buttonText: 'Read Travel Stories →',
    buttonLink: '/travelogues',
    displayOrder: 1,
    isActive: true,
  },
  {
    title: 'Car Comparison Hero',
    desktopImage: '/Hero3.png',
    mobileImage: '/Hero3-mobile2.png',
    buttonText: 'Compare Cars →',
    buttonLink: '/compare-cars',
    displayOrder: 2,
    isActive: true,
  },
];

async function waitForConnection() {
  if (mongoose.connection.readyState === 1) return; // already connected
  await new Promise((resolve, reject) => {
    mongoose.connection.once('connected', resolve);
    mongoose.connection.once('error', reject);
    setTimeout(() => reject(new Error('Timed out waiting for MongoDB connection (10s). Check your DB connection string/env vars.')), 10000);
  });
}

async function seed() {
  try {
    connectDB();
    await waitForConnection();

    const existingCount = await HeroBanner.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  HeroBanner collection already has ${existingCount} banner(s) — skipping seed so nothing already managed in Admin gets duplicated.`);
      console.log('   To reseed from scratch, remove the existing banners (via Admin → Hero Banner Management, or by clearing the collection) and run this again.');
      process.exit(0);
    }

    const created = await HeroBanner.insertMany(SEED_BANNERS);
    console.log(`✅ Seeded ${created.length} hero banner(s) — they'll now appear on the live homepage AND in Admin → Hero Banner Management, fully editable:`);
    created.forEach((b) => console.log(`   - "${b.title}" (order ${b.displayOrder})`));
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();