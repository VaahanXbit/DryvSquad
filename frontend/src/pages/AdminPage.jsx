import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'

const AdminPage = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Tech Insights',
    subCategory: '',
    excerpt: '',
    content: '',
    image: '',
    author: 'DryvSquad AI Editorial',
    date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
    readTime: '5 min read',
    tags: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
  })

  const [showSeo, setShowSeo] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage({ type: '', text: '' })

    // Validations
    const requiredFields = ['title', 'category', 'excerpt', 'content', 'image', 'author', 'date', 'readTime']
    const missingFields = requiredFields.filter(f => !formData[f].trim())
    
    if (missingFields.length > 0) {
      setMessage({
        type: 'error',
        text: `Please fill in all required fields: ${missingFields.join(', ')}`
      })
      setIsLoading(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    try {
      const response = await api.createArticle(formData)
      if (response.success) {
        setMessage({
          type: 'success',
          text: `🎉 Article created successfully! URL Slug: "${response.article.slug}"`
        })
        
        // Reset form
        setFormData({
          title: '',
          category: 'Tech Insights',
          subCategory: '',
          excerpt: '',
          content: '',
          image: '',
          author: 'DryvSquad AI Editorial',
          date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
          readTime: '5 min read',
          tags: '',
          seoTitle: '',
          seoDescription: '',
          seoKeywords: '',
        })
        
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        setMessage({
          type: 'error',
          text: response.message || 'Failed to create article.'
        })
      }
    } catch (error) {
      console.error('Submission error:', error)
      setMessage({
        type: 'error',
        text: 'An error occurred during submission. Please try again.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-yellow-500/10 text-yellow-500 rounded-2xl mb-4">
            <span className="text-3xl">✨</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            DryvSquad AI Admin
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Publish articles to the database. They will be auto-synced to the RAG AI chatbot in real-time.
          </p>
        </div>

        {/* Status Alerts */}
        {message.text && (
          <div className={`p-4 rounded-xl mb-6 text-sm flex items-start gap-3 border ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}>
            <span className="text-lg">{message.type === 'success' ? '✅' : '⚠️'}</span>
            <div>{message.text}</div>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-8 bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
          
          {/* Article Core Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white border-b border-slate-700/50 pb-2">
              Article Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Article Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. How ABS Prevents Wheel Lock"
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Category <span className="text-rose-400">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                >
                  <option value="Tech Insights">Tech Insights</option>
                  <option value="Feature Reviews">Feature Reviews</option>
                  <option value="New Launches">New Launches</option>
                </select>
              </div>

              {/* Sub-Category */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Sub-Category (Optional)
                </label>
                <input
                  type="text"
                  name="subCategory"
                  value={formData.subCategory}
                  onChange={handleInputChange}
                  placeholder="e.g. Safety Systems"
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Author */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Author Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Read Time */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Read Time <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  name="readTime"
                  value={formData.readTime}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Image URL */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Image Path / URL <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="e.g. /images/articles/what-is-adas.png"
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                />
                {formData.image && (
                  <div className="mt-3 rounded-xl border border-slate-700/50 p-2 bg-slate-900/40 inline-block">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-semibold">Preview</p>
                    <img 
                      src={formData.image} 
                      alt="Preview" 
                      className="max-h-28 rounded-lg object-cover border border-slate-700"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Tags (Comma-separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="e.g. ABS, Safety, Brakes, Tech"
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Excerpt and Content */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white border-b border-slate-700/50 pb-2">
              Article Content
            </h3>

            <div className="space-y-6">
              {/* Excerpt */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Excerpt (Brief Summary) <span className="text-rose-400">*</span>
                </label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Summarize the article in 2-3 sentences. This will show up on cards and search excerpts."
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Article Body (Markdown / Text) <span className="text-rose-400">*</span>
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows="12"
                  placeholder="Write the full article content here. You can use markdown or plain paragraphs."
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* SEO Section (Collapsible) */}
          <div className="border border-slate-700 rounded-xl overflow-hidden bg-slate-900/20">
            <button
              type="button"
              onClick={() => setShowSeo(!showSeo)}
              className="w-full flex items-center justify-between px-6 py-4 bg-slate-900/40 text-left font-semibold text-white focus:outline-none hover:bg-slate-900/60 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span>🔍</span>
                <span>SEO Metadata Configuration</span>
              </div>
              <span className={`transition-transform duration-200 ${showSeo ? 'rotate-180' : ''}`}>▼</span>
            </button>
            
            {showSeo && (
              <div className="p-6 border-t border-slate-700/50 space-y-6">
                {/* SEO Title */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    SEO Title (Defaults to Title)
                  </label>
                  <input
                    type="text"
                    name="seoTitle"
                    value={formData.seoTitle}
                    onChange={handleInputChange}
                    placeholder="DryvSquad AI SEO Title"
                    className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* SEO Description */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    SEO Description (Defaults to Excerpt)
                  </label>
                  <textarea
                    name="seoDescription"
                    value={formData.seoDescription}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Short description for Google Search results..."
                    className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* SEO Keywords */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    SEO Keywords (Comma-separated)
                  </label>
                  <input
                    type="text"
                    name="seoKeywords"
                    value={formData.seoKeywords}
                    onChange={handleInputChange}
                    placeholder="e.g. ABS technology, safety, how brakes work"
                    className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => navigate('/articles')}
              className="px-6 py-3.5 border border-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 flex items-center justify-center gap-2 px-8 py-3.5 bg-yellow-500 hover:bg-yellow-600 text-slate-950 rounded-xl font-bold transition-all shadow-lg hover:shadow-yellow-500/20 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-950 border-t-transparent" />
                  <span>Publishing Article...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>Publish Article</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default AdminPage
