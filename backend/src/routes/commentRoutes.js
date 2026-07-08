// backend/src/routes/commentRoutes.js
/*
================================================================================
File Name : commentRoutes.js
Description : Routes for editing/deleting a single comment by id.
              Listing/creating comments for an article lives in
              articleRoutes.js under /api/articles/:articleId/comments
              because that's where the articleId param naturally belongs.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const express = require('express');
const router = express.Router();
const { updateComment, deleteComment } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

// Edit a comment (owner or admin)
router.put('/:commentId', protect, updateComment);

// Delete a comment (owner or admin)
router.delete('/:commentId', protect, deleteComment);

module.exports = router;