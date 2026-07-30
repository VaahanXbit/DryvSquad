// backend/src/models/Model.js
const mongoose = require('mongoose');

const ModelSchema = new mongoose.Schema({
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  image: {
    type: String,
    required: true,
  },
  bodyType: {
  type: String,
  enum: ['SUV', 'Sedan', 'Hatchback', 'MUV', 'Coupe', 'Convertible', 'SUV-Coupé'],
  default: 'SUV',
},
  seatingCapacity: {
    type: Number,
    min: 2,
    max: 10,
    default: 5,
  },
  description: {
    type: String,
    trim: true,
  },

   launchYear: {
    type: Number,
    min: 1900, // A simple validation to ensure it's a sensible year
    required: false, // Set to true if you want to make it mandatory for all new data
  },
  discontinuedYear: {
    type: Number,
    min: 1900,
    required: false, // This should definitely be optional
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

ModelSchema.index({ brandId: 1 });
ModelSchema.index({ slug: 1 });

module.exports = mongoose.model('Model', ModelSchema);