// src/data/cars/index.js - Updated to include factorScores

import hyundaiData from './hyundai.json'
import kiaData from './kia.json'
import tataData from './tata.json'
import mahindraData from './mahindra.json'
import suzukiData from './suzuki.json'

// All brand data
const allBrands = [hyundaiData, kiaData, tataData, mahindraData, suzukiData]

// Get all cars with variants flattened
export const getAllCars = () => {
  const cars = []
  allBrands.forEach(brand => {
    brand.models.forEach(model => {
      model.variants.forEach(variant => {
        cars.push({
          id: `${brand.brand}-${model.name}-${variant.name}`,
          brand: brand.brand,
          model: model.name,
          variant: variant.name,
          slug: model.slug,
          image: model.image,
          price: variant.price,
          overallScore: variant.overallScore || 0,
          scores: variant.scores || null,
          factorScores: variant.factorScores || null // <- ADD THIS
        })
      })
    })
  })
  return cars
}

// Get all brands
export const getAllBrands = () => {
  return allBrands.map(brand => brand.brand)
}

// Get models by brand
export const getModelsByBrand = (brandName) => {
  const brand = allBrands.find(b => b.brand === brandName)
  if (!brand) return []
  return brand.models.map(model => model.name)
}

// Get variants by brand and model
export const getVariantsByBrandAndModel = (brandName, modelName) => {
  const brand = allBrands.find(b => b.brand === brandName)
  if (!brand) return []
  const model = brand.models.find(m => m.name === modelName)
  if (!model) return []
  return model.variants.map(variant => ({
    name: variant.name,
    price: variant.price,
    overallScore: variant.overallScore || 0,
    scores: variant.scores || null,
    factorScores: variant.factorScores || null // <- ADD THIS
  }))
}

// Get full car data by brand, model, and variant
export const getCarByBrandModelVariant = (brandName, modelName, variantName) => {
  const brand = allBrands.find(b => b.brand === brandName)
  if (!brand) return null
  const model = brand.models.find(m => m.name === modelName)
  if (!model) return null
  const variant = model.variants.find(v => v.name === variantName)
  if (!variant) return null
  
  return {
    id: `${brand.brand}-${model.name}-${variant.name}`,
    brand: brand.brand,
    model: model.name,
    variant: variant.name,
    slug: model.slug,
    image: model.image,
    price: variant.price,
    overallScore: variant.overallScore || 0,
    scores: variant.scores || null,
    factorScores: variant.factorScores || null // <- ADD THIS
  }
}

// Search cars
export const searchCars = (query) => {
  if (!query || query.trim() === '') return []
  const searchTerm = query.toLowerCase().trim()
  const allCars = getAllCars()
  return allCars.filter(car => 
    car.brand.toLowerCase().includes(searchTerm) ||
    car.model.toLowerCase().includes(searchTerm) ||
    car.variant.toLowerCase().includes(searchTerm)
  )
}

// Popular comparisons
export const popularComparisons = [
  {
    id: 1,
    car1Id: 'Hyundai-Creta-SX(O) 1.5 Diesel AT',
    car2Id: 'Kia-Seltos-GTX+ 1.5 Diesel AT',
    title: "Creta vs Seltos",
    car1Name: "Creta",
    car2Name: "Seltos",
    car1Brand: "Hyundai",
    car2Brand: "Kia"
  },
  {
    id: 2,
    car1Id: 'Hyundai-Creta-SX(O) 1.5 Diesel AT',
    car2Id: 'Suzuki-Grand Vitara-Zeta+ Smart Hybrid',
    title: "Creta vs Grand Vitara",
    car1Name: "Creta",
    car2Name: "Grand Vitara",
    car1Brand: "Hyundai",
    car2Brand: "Suzuki"
  },
  {
    id: 3,
    car1Id: 'Tata-Nexon-Fearless Plus 1.5 Diesel',
    car2Id: 'Suzuki-Brezza-ZXi+ 1.5 Petrol',
    title: "Nexon vs Brezza",
    car1Name: "Nexon",
    car2Name: "Brezza",
    car1Brand: "Tata",
    car2Brand: "Suzuki"
  },
  {
    id: 4,
    car1Id: 'Mahindra-XUV700-AX7L 2.0 Diesel AT',
    car2Id: 'Kia-Seltos-GTX+ 1.5 Diesel AT',
    title: "XUV700 vs Seltos",
    car1Name: "XUV700",
    car2Name: "Seltos",
    car1Brand: "Mahindra",
    car2Brand: "Kia"
  }
]

export default {
  getAllCars,
  getAllBrands,
  getModelsByBrand,
  getVariantsByBrandAndModel,
  getCarByBrandModelVariant,
  searchCars,
  popularComparisons
}