import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'

const AdminPage = () => {
  const navigate = useNavigate()
  
  // Auth State
  const [token, setToken] = useState(localStorage.getItem('admin_token') || null)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  // Loading & Message State for publishing
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

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoggingIn(true)
    setLoginError('')

    if (!password.trim()) {
      setLoginError('Password is required')
      setIsLoggingIn(false)
      return
    }

    try {
      const response = await api.adminLogin(password)
      if (response.success) {
        localStorage.setItem('admin_token', response.token)
        setToken(response.token)
        setPassword('')
      } else {
        setLoginError(response.message || 'Invalid admin credentials')
      }
    } catch (err) {
      console.error('Login error:', err)
      setLoginError('Network error. Failed to reach auth server.')
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    setToken(null)
    setMessage({ type: '', text: '' })
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
      const response = await api.createArticle(formData, token)
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
        // If forbidden or unauthorized, log them out
        if (response.status === 401 || response.status === 403) {
          handleLogout()
          setLoginError('Session expired. Please log in again.')
        } else {
          setMessage({
            type: 'error',
            text: response.message || 'Failed to create article.'
          })
        }
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

  // Parse comma-separated tags
  const getTagsArray = () => {
    if (!formData.tags) return []
    return formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
  }

  // Format content for live preview (converting double newlines to paragraphs)
  const getFormattedPreviewContent = () => {
    if (!formData.content) return { __html: '<p class="text-slate-500 italic">No content written yet...</p>' }
    
    // Check if user already typed HTML
    if (/<[a-z][\s\S]*>/i.test(formData.content)) {
      return { __html: formData.content }
    }

    // Convert double newlines to paragraph HTML tags
    const htmlString = formData.content
      .split('\n\n')
      .map(paragraph => {
        const cleanParagraph = paragraph.trim().replace(/\n/g, '<br />')
        return `<p class="mb-5 text-slate-300 leading-relaxed text-sm md:text-base">${cleanParagraph}</p>`
      })
      .join('')
      
    return { __html: htmlString }
  }

  // --- RENDERING ADMIN LOGIN SCREEN ---
  if (!token) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center pt-28 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl">
          <div>
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-2xl bg-yellow-500/10 text-yellow-500">
              <span className="text-2xl">🔒</span>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
              Admin Login
            </h2>
            <p className="mt-2 text-center text-sm text-slate-400">
              Access the DryvSquad AI admin publishing dashboard.
            </p>
          </div>

          {loginError && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
              <span>⚠️</span>
              <div>{loginError}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-8 space-y-6">
            <div className="rounded-md shadow-sm space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-slate-950 bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingIn ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-950 border-t-transparent" />
                ) : (
                  'Login'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // --- RENDERING ARTICLE CREATION DASHBOARD (SIDE-BY-SIDE) ---
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/50 pb-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-yellow-500/10 text-yellow-500 rounded-2xl text-xl">
              ✨
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">
                DryvSquad AI Creator
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Publishing to database cluster & Pinecone vectors
              </p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Logout Admin
          </button>
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

        {/* Grid Container for Side-by-Side Editor & Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* --- LEFT COLUMN: EDITOR FORM --- */}
          <form onSubmit={handleSubmit} className="space-y-8 bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6 md:p-8 shadow-2xl">
            
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
                    placeholder="e.g. https://images.unsplash.com/photo-1503376780353-7e6692767b70"
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
                    rows="14"
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
                    <span>Publish Article</span>
                  </>
                )}
              </button>
            </div>

          </form>

          {/* --- RIGHT COLUMN: LIVE STICKY PREVIEW --- */}
          <div className="lg:sticky lg:top-28 space-y-6 bg-slate-800/20 border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="bg-slate-900/65 border-b border-slate-700/50 px-6 py-3 flex items-center gap-2 text-slate-400 text-xs">
              <span>Live Article Preview</span>
            </div>

            {/* Scrollable Preview Area */}
            <div className="flex-1 overflow-y-auto bg-slate-950 text-white pb-8">
              {/* Cover Banner (Hero) */}
              <div className="relative overflow-hidden pt-10 pb-8 bg-gradient-to-r from-blue-950 via-slate-900 to-slate-800 border-b border-slate-800">
                <div className="px-6 max-w-2xl mx-auto">
                  {/* Category & Read Time */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2.5 py-0.5 bg-yellow-500 text-gray-900 text-[10px] font-bold rounded-full uppercase tracking-wider">
                      {formData.category || 'Tech Insights'}
                    </span>
                    {formData.readTime && (
                      <span className="px-2.5 py-0.5 bg-white/10 border border-white/20 text-gray-200 text-[10px] font-semibold rounded-full">
                        {formData.readTime}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h1 className="text-xl sm:text-2xl font-extrabold leading-tight text-white mb-3">
                    {formData.title || 'Untitled Article'}
                  </h1>

                  {/* Author & Date */}
                  <div className="flex items-center gap-2 text-slate-450 text-xs">
                    <span>By {formData.author || 'DryvSquad Editorial'}</span>
                    <span>•</span>
                    <span>{formData.date || 'Today'}</span>
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="px-6 py-8 max-w-2xl mx-auto space-y-6">
                {/* Cover Image */}
                {formData.image ? (
                  <img
                    src={formData.image}
                    alt={formData.title}
                    className="w-full rounded-xl object-cover shadow-lg max-h-64 border border-slate-850"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800';
                    }}
                  />
                ) : (
                  <div className="w-full h-40 rounded-xl bg-slate-900/60 border border-dashed border-slate-800 flex items-center justify-center text-slate-550 text-xs">
                    No image URL specified
                  </div>
                )}

                {/* Excerpt */}
                {formData.excerpt && (
                  <div className="border-l-4 border-yellow-500 pl-4 py-1 italic text-slate-350 text-sm md:text-base bg-slate-900/30 rounded-r-lg">
                    {formData.excerpt}
                  </div>
                )}

                {/* Main Article Body Render */}
                <div 
                  className="prose prose-invert max-w-none text-slate-200 text-sm md:text-base"
                  dangerouslySetInnerHTML={getFormattedPreviewContent()}
                />

                {/* Tags */}
                {getTagsArray().length > 0 && (
                  <div className="pt-6 border-t border-slate-850">
                    <h4 className="font-semibold text-xs text-white mb-2">Tags:</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {getTagsArray().map((tag, idx) => (
                        <span key={idx} className="px-2.5 py-0.5 text-[10px] rounded-full bg-slate-900 text-slate-450 border border-slate-800 font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default AdminPage
