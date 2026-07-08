// backend/src/models/Comment.js
/*
================================================================================
File Name : Comment.js
Description : Comment model — one comment belongs to one article and one user
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: true,
    index: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // If set, this comment is a reply to another comment on the same article.
  // Kept one level deep (like Instagram/YouTube) — replies to replies just
  // attach to the original top-level comment rather than nesting further.
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
    index: true,
  },
  // Snapshot of the display name at time of posting, so comments still show
  // a sensible name even if the user later changes it.
  authorName: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
  },
  isEdited: {
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
});

// Newest-first lookups per article are the main query pattern.
CommentSchema.index({ article: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', CommentSchema);