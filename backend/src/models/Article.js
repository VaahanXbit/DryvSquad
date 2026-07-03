// backend/src/models/Article.js
const mongoose = require("mongoose");
const ArticleSchema = new mongoose.Schema({
  title: {
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
  category: {
    type: String,
    required: true,
    enum: ['Feature Reviews', 'New Launches', 'Tech Insights'],
  },
  subCategory: {
    type: String,
    trim: true,
  },
  excerpt: {
    type: String,
    required: true,
    maxlength: 500,
  },
  content: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  readTime: {
    type: String,
    required: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  status: {
    type: String,
    enum: ['published', 'coming-soon', 'draft'],
    default: 'published',
  },
  seoTitle: {
    type: String,
    trim: true,
  },
  seoDescription: {
    type: String,
    trim: true,
  },
  seoKeywords: {     // SEO keywords for the article
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  publishedAt: {
    type: Date,
  },
});

// Update updatedAt on save
ArticleSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Update updatedAt on save
ArticleSchema.pre('save', function() {
  this.updatedAt = new Date();
});
// Indexes for search
ArticleSchema.index({ title: 'text', excerpt: 'text', tags: 'text' });
ArticleSchema.index({ slug: 1 });
ArticleSchema.index({ category: 1 });
ArticleSchema.index({ status: 1 });

module.exports = mongoose.model('Article', ArticleSchema);

