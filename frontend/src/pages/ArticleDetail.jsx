// src/pages/ArticleDetail.jsx
/*
================================================================================
File Name : ArticleDetail.jsx
Author : Tahseen Raza
Created Date : 2025-01-15
Description : Individual article detail page with full theme support
Company : Vaahan International
Copyright : (c) 2025 Vaahan International. All rights reserved.
================================================================================
*/

import { useEffect, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { getArticleBySlug, getAllArticles } from '../data/articlesData'
import { api } from '../services/api'
import AuthModal from '../components/AuthModal'
import { getAvatarUrl } from '../utils/avatar'
import { SkeletonStyles, ArticleDetailSkeleton, CommentListSkeleton, FadeIn } from '../components/skeletons/Skeletons'

// Pulls the userId out of a JWT without needing a network call — the token
// payload is just base64, so this is safe to decode client-side (it's not
// being trusted for anything security-sensitive, only for UI state like
// "did I already upvote this?").
const decodeUserId = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.userId || null
  } catch {
    return null
  }
}
import { Landmark, ShieldAlert } from 'lucide-react'

// Article content comes in as either real HTML (from a rich text editor) or
// plain text pasted straight in. Plain text with no tags at all was
// rendering as one dense wall of text, so if we don't see any HTML tags we
// split on blank lines and wrap each block in <p> — that's what lets the
// "prose" typography classes actually add paragraph spacing.
const formatArticleContent = (content) => {
  if (!content) return ''
  const trimmed = content.trim()
  if (/<\/?[a-z][\s\S]*>/i.test(trimmed)) return trimmed
  return trimmed
    .split(/\n\s*\n/)
    .map((para) => para.trim())
    .filter(Boolean)
    .map((para) => `<p>${para.replace(/\n/g, '<br/>')}</p>`)
    .join('')
}

// Shows "@username" when we have one (matching how the rest of the app,
// e.g. the profile page, identifies members) instead of a full name.
// Prefers the live populated user record over the stored snapshot so even
// older comments display correctly if the user has since set a username.
const getDisplayHandle = (comment) => {
  if (comment.user && typeof comment.user === 'object' && comment.user.username) {
    return `@${comment.user.username}`
  }
  return comment.authorName || 'Member'
}

// Strips a leading "@" so it can be re-used as a plain mention prefix.
const getMentionHandle = (comment) => getDisplayHandle(comment).replace(/^@/, '')

// Same seed logic as the display handle — prefers the populated user's real
// id, falling back to whatever we have, so a member's avatar stays visually
// consistent between their profile and every comment they post.
const getCommentAvatarSeed = (comment) => {
  if (comment.user && typeof comment.user === 'object' && comment.user._id) return comment.user._id
  if (comment.user && typeof comment.user === 'string') return comment.user
  return comment.authorName || 'member'
}

// A single comment or reply card. Used for both top-level comments (which
// can show a "view replies" toggle and a nested reply list) and for the
// replies themselves (isReply=true keeps things one level deep, like
// Instagram/YouTube — replying to a reply still just posts into the same
// thread instead of nesting further).
const CommentCard = ({
  comment,
  isDark,
  currentUserId,
  isReply = false,
  editingCommentId,
  editingText,
  setEditingText,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onReply,
  getReplies,
  expandedReplies,
  onToggleReplies,
  replyingToCommentId,
  replyText,
  setReplyText,
  postingReply,
  replyError,
  onSubmitReply,
  onCancelReply,
}) => {
  const commentUserId = comment.user && typeof comment.user === 'object' ? comment.user._id : comment.user
  const isOwn = !!currentUserId && commentUserId === currentUserId
  const isEditing = editingCommentId === comment._id
  const isReplyingHere = replyingToCommentId === comment._id
  const replies = isReply ? [] : getReplies(comment._id)
  const isExpanded = !isReply && !!expandedReplies[comment._id]

  return (
    <div className={`${isReply ? 'p-3' : 'p-4'} rounded-lg transition-colors duration-300 ${
      isDark ? (isReply ? 'bg-dark-800' : 'bg-dark-900') : (isReply ? 'bg-gray-50' : 'bg-white')
    }`}>
      <div className="flex items-center justify-between mb-1 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <img
            src={getAvatarUrl(getCommentAvatarSeed(comment))}
            alt=""
            className={`${isReply ? 'w-6 h-6' : 'w-7 h-7'} rounded-full flex-shrink-0 ${isDark ? 'bg-dark-700' : 'bg-gray-200'}`}
          />
          <span className={`font-semibold truncate ${isReply ? 'text-xs sm:text-sm' : 'text-sm'} ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {getDisplayHandle(comment)}
          </span>
        </div>
        <span className={`${isReply ? 'text-[10px] sm:text-xs' : 'text-xs'} whitespace-nowrap ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          {new Date(comment.createdAt).toLocaleDateString()}
          {comment.isEdited ? ' (edited)' : ''}
        </span>
      </div>

      {isEditing ? (
        <div className="mt-2">
          <textarea
            value={editingText}
            onChange={(e) => setEditingText(e.target.value)}
            rows={2}
            maxLength={2000}
            className={`w-full rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
              isDark ? 'bg-dark-700 text-white border border-dark-600' : 'bg-gray-50 text-gray-900 border border-gray-200'
            }`}
          />
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => onSaveEdit(comment._id)}
              className="text-xs font-semibold text-yellow-500 hover:text-yellow-600"
            >
              Save
            </button>
            <button
              onClick={onCancelEdit}
              className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className={`${isReply ? 'text-xs sm:text-sm' : 'text-sm'} whitespace-pre-wrap ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {comment.content}
        </p>
      )}

      {!isEditing && (
        <div className="flex items-center gap-4 mt-2">
          <button
            onClick={() => onReply(comment)}
            className={`text-xs font-semibold ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'}`}
          >
            Reply
          </button>
          {isOwn && (
            <button
              onClick={() => onStartEdit(comment)}
              className={`text-xs font-semibold ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'}`}
            >
              Edit
            </button>
          )}
          {!isReply && replies.length > 0 && (
            <button
              onClick={() => onToggleReplies(comment._id)}
              className="text-xs font-semibold text-yellow-500 hover:text-yellow-600"
            >
              {isExpanded ? 'Hide replies' : `View ${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`}
            </button>
          )}
        </div>
      )}

      {isReplyingHere && (
        <form onSubmit={onSubmitReply} className="mt-3">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={2}
            maxLength={2000}
            autoFocus
            className={`w-full rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
              isDark ? 'bg-dark-800 text-white border border-dark-700' : 'bg-white text-gray-900 border border-gray-200'
            }`}
          />
          {replyError && <p className="text-red-500 text-xs mt-1">{replyError}</p>}
          <div className="flex gap-3 mt-2">
            <button
              type="submit"
              disabled={postingReply || !replyText.trim()}
              className="text-xs font-semibold text-yellow-500 hover:text-yellow-600 disabled:opacity-50"
            >
              {postingReply ? 'Posting...' : 'Post Reply'}
            </button>
            <button
              type="button"
              onClick={onCancelReply}
              className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {!isReply && isExpanded && replies.length > 0 && (
        <div className={`mt-3 ml-4 sm:ml-8 space-y-3 border-l-2 border-dashed pl-4 ${isDark ? 'border-dark-700' : 'border-gray-200'}`}>
          {replies.map((reply) => (
            <CommentCard
              key={reply._id}
              comment={reply}
              isDark={isDark}
              currentUserId={currentUserId}
              isReply
              editingCommentId={editingCommentId}
              editingText={editingText}
              setEditingText={setEditingText}
              onStartEdit={onStartEdit}
              onCancelEdit={onCancelEdit}
              onSaveEdit={onSaveEdit}
              onReply={onReply}
              getReplies={getReplies}
              expandedReplies={expandedReplies}
              onToggleReplies={onToggleReplies}
              replyingToCommentId={replyingToCommentId}
              replyText={replyText}
              setReplyText={setReplyText}
              postingReply={postingReply}
              replyError={replyError}
              onSubmitReply={onSubmitReply}
              onCancelReply={onCancelReply}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const ArticleDetail = () => {
  const { slug } = useParams()
  const { isDark } = useTheme()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [relatedArticles, setRelatedArticles] = useState([])

  // Auth
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const currentUserId = useMemo(() => (token ? decodeUserId(token) : null), [token])
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  // Upvotes
  const [upvotes, setUpvotes] = useState(0)
  const [hasUpvoted, setHasUpvoted] = useState(false)
  const [upvoting, setUpvoting] = useState(false)

  // Share
  const [shareStatus, setShareStatus] = useState('idle') // 'idle' | 'copied' | 'error'

  // Comments
  const [comments, setComments] = useState([])
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [postingComment, setPostingComment] = useState(false)
  const [commentError, setCommentError] = useState('')
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editingText, setEditingText] = useState('')

  // Replies
  const [expandedReplies, setExpandedReplies] = useState({})
  const [replyingToCommentId, setReplyingToCommentId] = useState(null)
  const [replyingThreadId, setReplyingThreadId] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [postingReply, setPostingReply] = useState(false)
  const [replyError, setReplyError] = useState('')

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true)
        // Article-by-slug and the full article list are independent
        // requests — fetch them in parallel instead of one-by-one.
        const [articleData, allArticlesData] = await Promise.all([
          getArticleBySlug(slug),
          getAllArticles(),
        ])

        setArticle(articleData || null)

        if (articleData) {
          // Related articles (same category, different slug)
          const related = allArticlesData
            .filter(a => a.category === articleData.category && a.slug !== slug)
            .slice(0, 3)
          setRelatedArticles(related)

          // Seed upvote state from the article payload
          setUpvotes(articleData.upvotes || 0)
          setHasUpvoted(
            !!currentUserId && (articleData.upvotedBy || []).includes(currentUserId)
          )
        }
      } catch (error) {
        console.error('❌ Error fetching article:', error)
        setArticle(null)
      } finally {
        setLoading(false)
      }
    }
    
    fetchArticle()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  // Fetch comments once we know the article's real database id
  useEffect(() => {
    if (!article?._id) return

    const fetchComments = async () => {
      try {
        setCommentsLoading(true)
        const res = await api.getComments(article._id)
        if (res.success) setComments(res.comments)
      } catch (error) {
        console.error('❌ Error fetching comments:', error)
      } finally {
        setCommentsLoading(false)
      }
    }

    fetchComments()
  }, [article?._id])

  const requireAuth = () => {
    if (!token) {
      setIsAuthModalOpen(true)
      return false
    }
    return true
  }

  const handleAuthModalClose = () => {
    setIsAuthModalOpen(false)
    // Pick up the token that AuthModal just saved to localStorage, if any
    setToken(localStorage.getItem('token'))
  }

  const handleUpvote = async () => {
    if (!requireAuth() || upvoting || !article?._id) return

    setUpvoting(true)
    const nextHasUpvoted = !hasUpvoted
    // Optimistic update
    setHasUpvoted(nextHasUpvoted)
    setUpvotes((prev) => prev + (nextHasUpvoted ? 1 : -1))

    try {
      const res = await api.upvoteArticle(article._id, token)
      if (res.success) {
        setUpvotes(res.upvotes)
        setHasUpvoted(res.hasUpvoted)
      } else {
        // Revert on failure
        setHasUpvoted(!nextHasUpvoted)
        setUpvotes((prev) => prev + (nextHasUpvoted ? -1 : 1))
      }
    } catch (error) {
      console.error('❌ Error upvoting article:', error)
      setHasUpvoted(!nextHasUpvoted)
      setUpvotes((prev) => prev + (nextHasUpvoted ? -1 : 1))
    } finally {
      setUpvoting(false)
    }
  }

  const handleShare = async () => {
    const shareUrl = window.location.href
    const shareData = {
      title: article?.title || 'DryvSquad',
      text: article?.excerpt || '',
      url: shareUrl,
    }

    // Prefer the native share sheet (mobile browsers, and most desktop
    // browsers too) so the user can pick WhatsApp, email, etc. directly.
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        // AbortError just means the user closed the share sheet — not a
        // real failure, so don't fall through to the clipboard path.
        if (error.name !== 'AbortError') {
          console.error('❌ Error sharing article:', error)
        }
      }
      return
    }

    // Fallback for browsers without the Web Share API: copy the link.
    try {
      await navigator.clipboard.writeText(shareUrl)
      setShareStatus('copied')
      setTimeout(() => setShareStatus('idle'), 2000)
    } catch (error) {
      console.error('❌ Error copying article link:', error)
      setShareStatus('error')
      setTimeout(() => setShareStatus('idle'), 2000)
    }
  }

  const handlePostComment = async (e) => {
    e.preventDefault()
    if (!requireAuth()) return
    if (!commentText.trim() || !article?._id) return

    setPostingComment(true)
    setCommentError('')
    try {
      const res = await api.addComment(article._id, commentText.trim(), token)
      if (res.success) {
        setComments((prev) => [res.comment, ...prev])
        setCommentText('')
      } else {
        setCommentError(res.message || 'Failed to post comment')
      }
    } catch (error) {
      console.error('❌ Error posting comment:', error)
      setCommentError('Network error. Please try again.')
    } finally {
      setPostingComment(false)
    }
  }

  const startEditComment = (comment) => {
    setEditingCommentId(comment._id)
    setEditingText(comment.content)
  }

  const cancelEditComment = () => {
    setEditingCommentId(null)
    setEditingText('')
  }

  const handleUpdateComment = async (commentId) => {
    if (!editingText.trim()) return
    try {
      const res = await api.updateComment(commentId, editingText.trim(), token)
      if (res.success) {
        setComments((prev) => prev.map((c) => (c._id === commentId ? res.comment : c)))
        cancelEditComment()
      }
    } catch (error) {
      console.error('❌ Error updating comment:', error)
    }
  }

  // Replies are kept one level deep: a reply's thread is either its own id
  // (if it's a top-level comment) or its parent's id (if it's already a
  // reply) — so replying to a reply still lands in the same thread.
  const getReplies = (commentId) =>
    comments
      .filter((c) => c.parentComment === commentId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

  const topLevelComments = comments
    .filter((c) => !c.parentComment)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const toggleReplies = (commentId) => {
    setExpandedReplies((prev) => ({ ...prev, [commentId]: !prev[commentId] }))
  }

  const handleReplyClick = (comment) => {
    if (!requireAuth()) return
    const threadId = comment.parentComment || comment._id
    setReplyingToCommentId(comment._id)
    setReplyingThreadId(threadId)
    setReplyText(`@${getMentionHandle(comment)} `)
    setReplyError('')
    setExpandedReplies((prev) => ({ ...prev, [threadId]: true }))
  }

  const cancelReply = () => {
    setReplyingToCommentId(null)
    setReplyingThreadId(null)
    setReplyText('')
    setReplyError('')
  }

  const handlePostReply = async (e) => {
    e.preventDefault()
    if (!requireAuth()) return
    if (!replyText.trim() || !article?._id || !replyingThreadId) return

    setPostingReply(true)
    setReplyError('')
    try {
      const res = await api.addComment(article._id, replyText.trim(), token, replyingThreadId)
      if (res.success) {
        setComments((prev) => [...prev, res.comment])
        setExpandedReplies((prev) => ({ ...prev, [replyingThreadId]: true }))
        setReplyingToCommentId(null)
        setReplyingThreadId(null)
        setReplyText('')
      } else {
        setReplyError(res.message || 'Failed to post reply')
      }
    } catch (error) {
      console.error('❌ Error posting reply:', error)
      setReplyError('Network error. Please try again.')
    } finally {
      setPostingReply(false)
    }
  }

  if (loading) {
    return (
      <>
        <SkeletonStyles />
        <ArticleDetailSkeleton isDark={isDark} />
      </>
    )
  }

  if (!article) {
    return (
      <div className={`min-h-screen flex items-center justify-center pt-20 ${isDark ? 'bg-dark-950' : 'bg-gray-50'}`}>
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-6">🔍</div>
          <h1 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Article Not Found</h1>
          <p className={`mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            The article you're looking for doesn't exist or has been moved.
          </p>
          <Link 
            to="/articles" 
            className="bg-yellow-500 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors inline-block"
          >
            Browse All Articles
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <SkeletonStyles />
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 sm:pt-28 md:pt-32 pb-10 sm:pb-12 md:pb-16 bg-gradient-to-r from-blue-950 via-slate-900 to-slate-700">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container-custom relative z-10 text-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            {/* Back to Articles */}
            <Link
              to="/articles"
              className="inline-flex items-center gap-1.5 text-gray-300 hover:text-yellow-400 text-sm font-medium mb-4 sm:mb-5 transition-colors duration-300"
            >
              <span aria-hidden="true">←</span> Back to Articles
            </Link>

            {/* Category & Read Time */}
            <div className="flex flex-wrap gap-2 mb-4 sm:mb-5">
              <span className="px-3 py-1 bg-yellow-500 text-gray-900 text-xs font-semibold rounded-full">
                {article.category}
              </span>
              {article.readTime && (
                <span className="px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 text-gray-200 text-xs font-semibold rounded-full">
                  {article.readTime}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-tight text-white mb-4 sm:mb-5">
              {article.title}
            </h1>

            {/* Author & Date */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-gray-300 text-sm sm:text-base">
              <span>By {article.author || 'Vaahan Team'}</span>
              <span>•</span>
              <span>{article.date || 'Coming Soon'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className={`pt-8 sm:pt-12 md:pt-16 pb-4 sm:pb-5 md:pb-6 transition-colors duration-300 ${isDark ? 'bg-dark-900' : 'bg-white'}`}>
        <div className="container-custom">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            {/* Featured Image */}
            <img
              src={article.image}
              alt={article.title}
              className={`w-full rounded-xl mb-6 sm:mb-8 transition-colors duration-300 ${isDark ? 'shadow-lg shadow-dark-800' : 'shadow-md'}`}
            />

            {/* Article Content */}
            <div className={`prose prose-sm sm:prose-base lg:prose-lg max-w-none leading-relaxed ${isDark ? 'prose-invert' : ''}`}>
              <div dangerouslySetInnerHTML={{ __html: formatArticleContent(article.content) }} />
            </div>

            {/* Inline Article CTA Buttons (Loan / Insurance) */}
            {(article.showLoanCTA || article.showInsuranceCTA) && (
              <div className={`mt-8 p-6 rounded-2xl border transition-all duration-300 ${
                isDark ? 'bg-dark-950/80 border-dark-800 shadow-inner' : 'bg-slate-50 border-slate-200 shadow-sm'
              }`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className={`text-sm font-extrabold uppercase tracking-wider ${isDark ? 'text-yellow-500' : 'text-yellow-600'}`}>
                      DryvSquad Advisor Recommendations
                    </h4>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                      Take the next step based on this article's expert insights.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                    {article.showLoanCTA && (
                      <Link
                        to="/loan-quotes"
                        state={{ fromArticle: `/article/${slug}` }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-slate-950 text-xs font-bold rounded-xl shadow transition-all hover:shadow-yellow-500/10 w-full sm:w-auto text-center justify-center"
                      >
                        <Landmark className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                        <span>Get Auto Loan Quotes</span>
                      </Link>
                    )}
                    {article.showInsuranceCTA && (
                      <Link
                        to="/insurance-quotes"
                        state={{ fromArticle: `/article/${slug}` }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-slate-950 text-xs font-bold rounded-xl shadow transition-all hover:shadow-yellow-500/10 w-full sm:w-auto text-center justify-center"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                        <span>Get Insurance Quotes</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}
            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className={`mt-4 pt-4 border-t transition-colors duration-300 ${isDark ? 'border-dark-700' : 'border-gray-200'}`}>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, idx) => (
                    <span key={idx} className={`px-3 py-1 text-sm rounded-full transition-colors duration-300 ${
                      isDark ? 'bg-dark-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                    }`}>
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Upvote & Share Section */}
            <div className={`mt-4 pt-4 border-t transition-colors duration-300 flex flex-wrap items-center justify-between gap-3 ${isDark ? 'border-dark-700' : 'border-gray-200'}`}>
              <button
                onClick={handleUpvote}
                disabled={upvoting}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors duration-300 disabled:opacity-60 ${
                  hasUpvoted
                    ? 'bg-yellow-500 text-gray-900'
                    : isDark ? 'bg-dark-700 text-gray-300 hover:bg-dark-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>👍</span>
                <span>{hasUpvoted ? 'Upvoted' : 'Upvote'}</span>
                <span className={hasUpvoted ? 'text-gray-800' : isDark ? 'text-gray-400' : 'text-gray-500'}>
                  ({upvotes})
                </span>
              </button>

              <div className="flex flex-wrap gap-2 sm:gap-3">
                <button
                  onClick={handleShare}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors duration-300 ${
                    shareStatus === 'copied'
                      ? 'bg-emerald-500 text-white'
                      : shareStatus === 'error'
                        ? 'bg-red-500 text-white'
                        : isDark ? 'bg-dark-700 text-gray-300 hover:bg-dark-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {shareStatus === 'copied' ? (
                    <>✅ Link Copied</>
                  ) : shareStatus === 'error' ? (
                    <>⚠️ Couldn't Copy</>
                  ) : (
                    <>📤 Share</>
                  )}
                </button>
                {/* Bookmark — disabled for now, re-enable once bookmark storage is built
                <button className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors duration-300 ${
                  isDark ? 'bg-dark-700 text-gray-300 hover:bg-dark-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                  🔖 Bookmark
                </button>
                */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comments Section */}
      <section className={`pt-4 sm:pt-5 md:pt-6 pb-6 sm:pb-8 md:pb-10 transition-colors duration-300 ${isDark ? 'bg-dark-800' : 'bg-gray-50'}`}>
        <div className="container-custom">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className={`text-xl sm:text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Comments ({comments.length})
            </h2>

            {/* New comment form */}
            <form onSubmit={handlePostComment} className="mb-8 flex gap-3">
              {token && (
                <img
                  src={getAvatarUrl(currentUserId)}
                  alt=""
                  className={`w-9 h-9 rounded-full flex-shrink-0 mt-0.5 ${isDark ? 'bg-dark-700' : 'bg-gray-200'}`}
                />
              )}
              <div className="flex-1 min-w-0">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onFocus={() => { if (!token) setIsAuthModalOpen(true) }}
                  placeholder={token ? 'Share your thoughts...' : 'Sign in to join the discussion...'}
                  rows={3}
                  maxLength={2000}
                  className={`w-full rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors duration-300 ${
                    isDark ? 'bg-dark-900 text-white placeholder-gray-500 border border-dark-700' : 'bg-white text-gray-900 placeholder-gray-400 border border-gray-200'
                  }`}
                />
                {commentError && <p className="text-red-500 text-xs mt-2">{commentError}</p>}
                <div className="flex justify-end mt-3">
                  <button
                    type="submit"
                    disabled={postingComment || !commentText.trim()}
                    className="bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-semibold px-5 py-2 rounded-lg text-sm transition-colors duration-300"
                  >
                    {postingComment ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </div>
            </form>

            {/* Comments list */}
            {commentsLoading ? (
              <CommentListSkeleton count={3} isDark={isDark} />
            ) : topLevelComments.length === 0 ? (
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Be the first to comment on this article.</p>
            ) : (
              <FadeIn>
              <div className="space-y-4">
                {topLevelComments.map((comment) => (
                  <CommentCard
                    key={comment._id}
                    comment={comment}
                    isDark={isDark}
                    currentUserId={currentUserId}
                    editingCommentId={editingCommentId}
                    editingText={editingText}
                    setEditingText={setEditingText}
                    onStartEdit={startEditComment}
                    onCancelEdit={cancelEditComment}
                    onSaveEdit={handleUpdateComment}
                    onReply={handleReplyClick}
                    getReplies={getReplies}
                    expandedReplies={expandedReplies}
                    onToggleReplies={toggleReplies}
                    replyingToCommentId={replyingToCommentId}
                    replyText={replyText}
                    setReplyText={setReplyText}
                    postingReply={postingReply}
                    replyError={replyError}
                    onSubmitReply={handlePostReply}
                    onCancelReply={cancelReply}
                  />
                ))}
              </div>
              </FadeIn>
            )}
          </div>
        </div>
      </section>

      {/* Sign-in modal, opened whenever a guest tries to comment, reply, or upvote */}
      <AuthModal isOpen={isAuthModalOpen} onClose={handleAuthModalClose} />

      {/* Related Articles Section */}
      {relatedArticles.length > 0 && (
        <section className={`py-8 sm:py-12 md:py-16 transition-colors duration-300 ${isDark ? 'bg-dark-800' : 'bg-gray-50'}`}>
          <div className="container-custom">
            <h2 className={`text-xl sm:text-2xl font-bold mb-6 sm:mb-8 ${isDark ? 'text-white' : 'text-gray-900'} px-4 sm:px-0`}>
              Related Articles
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 px-4 sm:px-0">
              {relatedArticles.map((related) => (
                <Link
                  key={related.id}
                  to={`/article/${related.slug}`}
                  className={`group rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ${
                    isDark ? 'bg-dark-900 hover:shadow-dark-800' : 'bg-white'
                  }`}
                >
                  <div className="relative h-40 sm:h-48 overflow-hidden">
                    <img
                      src={related.image}
                      alt={related.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4 sm:p-5">
                    <h3 className={`font-bold text-sm sm:text-base mb-2 line-clamp-2 transition-colors ${
                      isDark ? 'text-white group-hover:text-yellow-400' : 'text-gray-900 group-hover:text-yellow-500'
                    }`}>
                      {related.title}
                    </h3>
                    <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {related.readTime || '5 min read'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}

export default ArticleDetail