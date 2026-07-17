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
    required: function() { return this.status === 'published'; },
  },
  subCategory: {
    type: String,
    trim: true,
  },
  excerpt: {
    type: String,
    required: function() { return this.status === 'published'; },
    maxlength: 500,
  },
  content: {
    type: String,
    required: function() { return this.status === 'published'; },
  },
  image: {
    type: String,
    required: function() { return this.status === 'published'; },
  },
  thumbnail: {
    type: String,
    trim: true,
  },
  blocks: {
    type: Array,
    default: undefined,
  },
  author: {
    type: String,
    required: function() { return this.status === 'published'; },
  },
  date: {
    type: String,
    required: function() { return this.status === 'published'; },
  },
  readTime: {
    type: String,
    required: function() { return this.status === 'published'; },
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
  showLoanCTA: {
    type: Boolean,
    default: false,
  },
  showInsuranceCTA: {
    type: Boolean,
    default: false,
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
  views: {
    type: Number,
    default: 0,
  },
  weeklyViews: {
    type: Number,
    default: 0,
  },
  lastWeekViews: {
    type: Number,
    default: 0,
  },
  // Upvotes from logged-in members. upvotedBy tracks who has upvoted so a
  // member can only upvote once and can toggle their upvote off again.
  upvotes: {
    type: Number,
    default: 0,
  },
  upvotedBy: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    default: [],
  },
  // Denormalized comment count so article lists can show it without a
  // separate query against the Comment collection.
  commentsCount: {
    type: Number,
    default: 0,
  },
});

// Update updatedAt on save
ArticleSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Indexes for search
ArticleSchema.index({ title: 'text', excerpt: 'text', tags: 'text' });
ArticleSchema.index({ slug: 1 });
ArticleSchema.index({ category: 1 });
ArticleSchema.index({ status: 1 });

module.exports = mongoose.model('Article', ArticleSchema);