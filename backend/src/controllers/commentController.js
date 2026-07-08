// backend/src/controllers/commentController.js
/*
================================================================================
File Name : commentController.js
Description : Comment controller — list/create comments for an article, and
              update/delete a single comment (owner or admin only)
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const Comment = require('../models/Comment');
const Article = require('../models/Article');

// Build a friendly display handle from whatever fields the user actually
// has. Username is preferred (shown as "@handle"), matching how the rest of
// the app (e.g. the profile page) identifies members — full names are only
// a fallback for accounts that never set a username.
const getDisplayName = (user) => {
  if (!user) return 'Member';
  if (user.username) return `@${user.username}`;
  if (user.email) return `@${user.email.split('@')[0]}`;
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
  if (fullName) return fullName;
  return 'Member';
};

// ========================================
// GET /api/articles/:articleId/comments - List comments for an article
// ========================================
exports.getCommentsForArticle = async (req, res) => {
  try {
    const { articleId } = req.params;

    const comments = await Comment.find({ article: articleId })
      .sort({ createdAt: -1 })
      .populate('user', 'firstName lastName username email profileImage');

    res.status(200).json({
      success: true,
      count: comments.length,
      comments,
    });
  } catch (error) {
    console.error('❌ Get comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ========================================
// POST /api/articles/:articleId/comments - Add a comment (member only)
// ========================================
exports.addComment = async (req, res) => {
  try {
    const { articleId } = req.params;
    const { content, parentComment } = req.body;

    if (req.user?._id === 'admin_user') {
      return res.status(400).json({
        success: false,
        message: 'Admin accounts cannot post comments.',
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required',
      });
    }

    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }

    // If this is a reply, make sure the parent comment is real and belongs
    // to the same article — replies are kept one level deep, so a reply to
    // a reply still points at that reply's own parent (the top-level
    // comment), flattening the thread like Instagram/YouTube do.
    let parentId = null;
    if (parentComment) {
      const parent = await Comment.findById(parentComment);
      if (!parent || parent.article.toString() !== articleId) {
        return res.status(400).json({
          success: false,
          message: 'The comment you are replying to could not be found.',
        });
      }
      parentId = parent.parentComment || parent._id;
    }

    const comment = new Comment({
      article: articleId,
      user: req.user._id,
      authorName: getDisplayName(req.user),
      content: content.trim(),
      parentComment: parentId,
    });

    await comment.save();
    await comment.populate('user', 'firstName lastName username email profileImage');

    // Keep the denormalized count on the article in sync.
    await Article.findByIdAndUpdate(articleId, { $inc: { commentsCount: 1 } });

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment,
    });
  } catch (error) {
    console.error('❌ Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ========================================
// PUT /api/comments/:commentId - Edit your own comment
// ========================================
exports.updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required',
      });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    const isOwner = comment.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own comments',
      });
    }

    comment.content = content.trim();
    comment.isEdited = true;
    comment.updatedAt = new Date();
    await comment.save();

    res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      comment,
    });
  } catch (error) {
    console.error('❌ Update comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update comment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ========================================
// DELETE /api/comments/:commentId - Delete your own comment (or admin)
// ========================================
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    const isOwner = comment.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own comments',
      });
    }

    await Comment.findByIdAndDelete(commentId);
    await Article.findByIdAndUpdate(comment.article, { $inc: { commentsCount: -1 } });

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    console.error('❌ Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete comment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};