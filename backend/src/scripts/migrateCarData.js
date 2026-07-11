// backend/src/scripts/migrateCarData.js
/*
================================================================================
File Name : migrateCarData.js
Author : Tahseen Raza
Created Date : 2026-06-26
Description : Import car data from JSON files to MongoDB with all fields
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

// Import models
const Brand = require('../models/Brand')
const Model = require('../models/Model')
const Variant = require('../models/Variant')

// =============================================
// Configuration
// =============================================
const DATA_DIR = path.join(__dirname, '../data/cars')

// =============================================
// Database Connection
// =============================================
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vaahan')
    console.log(`✅ MongoDB Connected`)
    console.log(`📊 Database: ${conn.connection.name}`)
    return conn
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`)
    process.exit(1)
  }
}

// =============================================
// Clear Existing Data
// =============================================
const clearExistingData = async () => {
  console.log('\n🗑️ Clearing existing data...')
  await Brand.deleteMany({})
  await Model.deleteMany({})
  await Variant.deleteMany({})
  console.log('✅ Existing data cleared')
}

// =============================================
// Load JSON Files
// =============================================
const loadJsonFiles = () => {
  if (!fs.existsSync(DATA_DIR)) {
    console.error(`❌ Data directory not found: ${DATA_DIR}`)
    process.exit(1)
  }

  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'))
  if (files.length === 0) {
    console.error(`❌ No JSON files found in: ${DATA_DIR}`)
    process.exit(1)
  }

  console.log(`📁 Found cars data at: ${DATA_DIR}`)
  
  const carData = []
  for (const file of files) {
    try {
      const filePath = path.join(DATA_DIR, file)
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
      carData.push({ 
        filename: file, 
        data: data 
      })
      console.log(`📁 Loaded ${file}`)
    } catch (error) {
      console.error(`❌ Failed to load ${file}: ${error.message}`)
    }
  }
  
  return carData
}

// =============================================
// Helper: Extract Numeric Value
// =============================================
const extractNumeric = (value) => {
  if (value === null || value === undefined || value === 'N/A' || value === '') return null
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    // Try to extract number from string like "114.7 Nm", "61 kW (83 PS)", "18.5 km/l"
    const match = value.match(/^[\d.]+/)
    if (match) return parseFloat(match[0])
  }
  return null
}

// =============================================
// Helper: Get Specifications Safely
// =============================================
const getSpecifications = (specs) => {
  if (!specs || typeof specs !== 'object') return {}
  
  // Extract only the needed fields with proper values
  return {
    category: specs.category || 'SUV',
    seats: specs.seats || '5',
    engineType: specs.engineType || 'N/A',
    displacement: specs.displacement || 'N/A',
    transmissionType: specs.transmissionType || 'N/A',
    suspensionFront: specs.suspensionFront || 'N/A',
    suspensionRear: specs.suspensionRear || 'N/A',
    brakeFront: specs.brakeFront || 'N/A',
    brakeRear: specs.brakeRear || 'N/A',
    fuelType: specs.fuelType || 'N/A',
    fuelTankCapacity: specs.fuelTankCapacity || 'N/A',
    overallLength: specs.overallLength || 'N/A',
    overallWidth: specs.overallWidth || 'N/A',
    overallHeight: specs.overallHeight || 'N/A',
    wheelbase: specs.wheelbase || 'N/A',
    bootSpace: specs.bootSpace || 'N/A',
    groundClearance: specs.groundClearance || 'N/A',
    turningRadius: specs.turningRadius || 'N/A',
    tireSize: specs.tireSize || 'N/A',
    spareWheel: specs.spareWheel || 'N/A',
    safetyFeatures: specs.safetyFeatures || 'N/A',
    // Preserve any additional fields
    ...specs
  }
}

// =============================================
// Process a Single Brand
// =============================================
const processBrand = async (brandData) => {
  const { brand, brandSlug, brandIcon, brandDescription, models } = brandData
  const results = { brand: brand, success: true, errors: [], modelsProcessed: 0, variantsProcessed: 0 }

  try {
    // Generate slug if not provided
    const slug = brandSlug || brand.toLowerCase().replace(/\s+/g, '-')
    
    // 1. Create Brand
    const brandDoc = new Brand({
      name: brand,
      slug: slug,
      icon: brandIcon || '🚗',
      description: brandDescription || '',
    })
    await brandDoc.save()
    console.log(`   ✅ Brand created: ${brand} (${brandIcon || '🚗'})`)

    // 2. Process Models
    for (const modelData of models) {
      try {
        const modelDoc = new Model({
          brandId: brandDoc._id,
          name: modelData.name || modelData.model, // Handle both 'name' and 'model' fields
          slug: modelData.slug,
          image: modelData.image || '/images/default.png',
          bodyType: modelData.bodyType || 'SUV',
          seatingCapacity: modelData.seatingCapacity || 5,
          description: modelData.description || '',
        })
        await modelDoc.save()
        results.modelsProcessed++
        console.log(`   ✅ Model created: ${modelData.name || modelData.model}`)

        // 3. Process Variants
        for (const variantData of (modelData.variants || [])) {
          try {
            // Map transmission to valid enum values
            let transmission = variantData.transmission || 'N/A'
            
            // Handle electric vehicle transmission types
            if (transmission === 'Single Speed Reduction Gear' || 
                transmission === 'Single Speed Electric 2WD' || 
                transmission === 'Single Speed Electric ZWD') {
              transmission = 'Automatic'
            }
            
            // Extract numeric values from strings
            const torqueNumeric = variantData.torqueNumeric || extractNumeric(variantData.torque)
            const powerNumeric = variantData.powerNumeric || extractNumeric(variantData.power)
            const mileageNumeric = variantData.mileageNumeric || extractNumeric(variantData.mileage)
            
            // Get specifications with proper handling
            const specs = getSpecifications(variantData.specifications || {})
            
            // Log for debugging
            console.log(`   📝 Saving variant: ${variantData.name}`)

            const variantDoc = new Variant({
              modelId: modelDoc._id,
              name: variantData.name,
              price: variantData.price || 'N/A',
              exShowroomPrice: variantData.exShowroomPrice || null,
              onRoadPrice: variantData.onRoadPrice || null,
              engine: variantData.engine || 'N/A',
              displacement: variantData.displacement || 'N/A',
              fuelType: variantData.fuelType || 'N/A',
              transmission: transmission,
              power: variantData.power || 'N/A',
              torque: variantData.torque || 'N/A',
              mileage: variantData.mileage || 'N/A',
              torqueNumeric: torqueNumeric,
              powerNumeric: powerNumeric,
              mileageNumeric: mileageNumeric,
              overallScore: variantData.overallScore || 0,
              scores: variantData.scores || {
                safetyScore: 0,
                performanceScore: 0,
                drivingExperienceScore: 0,
                suspensionScore: 0,
                comfortScore: 0,
                featuresScore: 0,
                valueForMoneyScore: 0,
                cityDrivingScore: 0,
                highwayDrivingScore: 0,
                familyScore: 0,
                maintenanceScore: 0,
              },
              factorScores: variantData.factorScores || {
                safetyScore: { airbags: 0, adas: 0, ncapRating: 0, braking: 0, structuralSafety: 0 },
                performanceScore: { enginePower: 0, torque: 0, acceleration: 0, highwayPerformance: 0, gearboxResponse: 0 },
                drivingExperienceScore: { steeringFeedback: 0, handling: 0, stability: 0, rideQuality: 0, driverConfidence: 0 },
                suspensionScore: { rideComfort: 0, potholeAbsorption: 0, highwayStability: 0, corneringSupport: 0 },
                comfortScore: { seatQuality: 0, cabinInsulation: 0, acEffectiveness: 0, rearSeatComfort: 0, rideSmoothness: 0 },
                featuresScore: { infotainment: 0, connectedCar: 0, sunroof: 0, ventilatedSeats: 0, ambientLighting: 0 },
                valueForMoneyScore: { priceVsFeatures: 0, safetyPackage: 0, performanceValue: 0, resaleValue: 0, overallPackage: 0 },
                cityDrivingScore: { steeringResponsiveness: 0, turningRadius: 0, visibility: 0, easeOfParking: 0, trafficManeuverability: 0 },
                highwayDrivingScore: { highSpeedStability: 0, cruiseControl: 0, overtakingAbility: 0, fuelEfficiency: 0, cabinNoise: 0 },
                familyScore: { rearSeatSpace: 0, bootCapacity: 0, childSafety: 0, easeOfEntry: 0, familyFeatures: 0 },
                maintenanceScore: { serviceCost: 0, spareParts: 0, serviceNetwork: 0, reliability: 0, warranty: 0 },
              },
              specifications: specs,
            })
            await variantDoc.save()
            results.variantsProcessed++
          } catch (error) {
            console.error(`   ❌ Failed to create variant ${variantData.name}: ${error.message}`)
            results.errors.push({ variant: variantData.name, error: error.message })
          }
        }
      } catch (error) {
        console.error(`   ❌ Failed to create model ${modelData.name || modelData.model}: ${error.message}`)
        results.errors.push({ model: modelData.name || modelData.model, error: error.message })
        results.success = false
      }
    }
  } catch (error) {
    console.error(`   ❌ Failed to create brand ${brand}: ${error.message}`)
    results.success = false
    results.errors.push({ brand: brand, error: error.message })
  }

  return results
}

// =============================================
// Main Migration Function
// =============================================
const migrateData = async () => {
  console.log('\n🚀 Starting Car Data Migration...')
  console.log('──────────────────────────────────────────────────')

  try {
    // Connect to Database
    await connectDB()
    
    // Clear Existing Data
    await clearExistingData()
    
    // Load JSON Files
    const carFiles = loadJsonFiles()
    if (carFiles.length === 0) {
      console.error('❌ No valid car data files found')
      process.exit(1)
    }

    // Process Each Brand
    const results = []
    let totalVariants = 0

    for (const { filename, data } of carFiles) {
      const brandName = data.brand || filename.replace('.json', '')
      console.log(`\n📦 Processing ${brandName}...`)
      
      const result = await processBrand(data)
      results.push(result)
      
      if (result.success && result.errors.length === 0) {
        console.log(`   ✅ ${brandName} completed: ${result.modelsProcessed} models, ${result.variantsProcessed} variants`)
        totalVariants += result.variantsProcessed
      } else {
        console.log(`   ⚠️ ${brandName} completed with errors: ${result.errors.length} errors`)
        for (const err of result.errors) {
          console.log(`      - ${err.model || err.variant || err.brand}: ${err.error}`)
        }
        totalVariants += result.variantsProcessed
      }
    }

    // Final Summary
    console.log('\n──────────────────────────────────────────────────')
    console.log('📊 Migration Summary:')
    console.log(`   ✅ Brands Processed: ${results.length}`)
    console.log(`   ✅ Models Created: ${results.reduce((sum, r) => sum + r.modelsProcessed, 0)}`)
    console.log(`   ✅ Variants Created: ${totalVariants}`)
    
    const errors = results.filter(r => r.errors.length > 0)
    if (errors.length > 0) {
      console.log(`   ⚠️ Errors in ${errors.length} brand(s)`)
    } else {
      console.log('   ✅ All brands processed successfully!')
    }
    console.log('──────────────────────────────────────────────────\n')

    process.exit(0)

  } catch (error) {
    console.error(`\n❌ Migration failed: ${error.message}`)
    console.error(error.stack)
    process.exit(1)
  }
}

// =============================================
// Run Migration
// =============================================
migrateData()