// backend/src/scripts/migrateTravelogues.js
/*
================================================================================
File Name : migrateTravelogues.js
Author : Tahseen Raza
Created Date : 2026-06-29
Description : Migrate travelogue data from JSON to MongoDB
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const Travelogue = require('../models/Travelogue');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vaahan_auth');
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

// Load travelogue data from JSON file
const loadTravelogueData = () => {
  try {
    const jsonPath = path.join(__dirname, '../data/travelogues.json');
    
    if (!fs.existsSync(jsonPath)) {
      console.error('❌ travelogues.json not found at:', jsonPath);
      process.exit(1);
    }
    
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    console.log(`📁 Loaded ${data.length} travelogues from travelogues.json`);
    return data;
  } catch (error) {
    console.error('❌ Error loading travelogue data:', error);
    process.exit(1);
  }
};

// Migrate travelogues
const migrateTravelogues = async () => {
  console.log('\n📚 Starting Travelogue Data Migration...\n');
  console.log('─'.repeat(50));
  
  await connectDB();
  
  console.log('\n🗑️ Clearing existing travelogues...');
  await Travelogue.deleteMany({});
  console.log('✅ Existing travelogues cleared\n');
  
  const traveloguesData = loadTravelogueData();
  
  if (traveloguesData.length === 0) {
    console.log('⚠️ No travelogues to migrate.');
    process.exit(0);
  }
  
  let count = 0;
  let errors = [];
  
  for (const travelogueData of traveloguesData) {
    try {
      const travelogue = new Travelogue({
        title: travelogueData.title,
        slug: travelogueData.slug,
        category: travelogueData.category,
        excerpt: travelogueData.excerpt,
        content: travelogueData.content,
        image: travelogueData.image,
        author: travelogueData.author,
        date: travelogueData.date,
        readTime: travelogueData.readTime,
        tags: travelogueData.tags || [],
        status: travelogueData.status || 'published',
        seoTitle: travelogueData.seoTitle || travelogueData.title,
        seoDescription: travelogueData.seoDescription || travelogueData.excerpt,
      });
      
      await travelogue.save();
      count++;
      
      if (count % 5 === 0 || count === traveloguesData.length) {
        console.log(`   ✅ Migrated ${count}/${traveloguesData.length} travelogues...`);
      }
    } catch (error) {
      console.error(`❌ Error migrating travelogue: ${travelogueData.title}`, error.message);
      errors.push({ title: travelogueData.title, error: error.message });
    }
  }
  
  console.log('\n' + '─'.repeat(50));
  console.log(`\n📊 Migration Summary:`);
  console.log(`   Total Travelogues: ${traveloguesData.length}`);
  console.log(`   Successfully Migrated: ${count}`);
  console.log(`   Errors: ${errors.length}`);
  
  if (errors.length > 0) {
    console.log('\n⚠️ Errors:');
    errors.forEach(err => {
      console.log(`   - ${err.title}: ${err.error}`);
    });
  }
  
  console.log('\n✅ Travelogue Migration Completed Successfully!');
  
  process.exit(0);
};

migrateTravelogues();