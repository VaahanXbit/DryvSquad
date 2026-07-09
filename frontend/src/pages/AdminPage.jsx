import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'

const AdminPage = () => {
  const navigate = useNavigate()
  
  // Auth State
  const [token, setToken] = useState(localStorage.getItem('admin_token') || null)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  // Navigation Tabs State
  const [activeTab, setActiveTab] = useState('write') // 'write' or 'manage'
  const [articlesList, setArticlesList] = useState([])
  const [isLoadingList, setIsLoadingList] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [contentType, setContentType] = useState('article') // 'article' or 'travelogue'
  const [manageType, setManageType] = useState('article') // 'article' or 'travelogue'

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
    thumbnail: '', // Added for travelogue support
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      alert('File size exceeds the 2MB limit. Please upload a smaller image.')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        image: reader.result,
      }))
    }
    reader.readAsDataURL(file)
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
    setIsEditing(false)
    setEditingId(null)
  }

  // Fetch articles for management tab
  const fetchArticlesForManagement = async () => {
    setIsLoadingList(true)
    try {
      const response = await api.getAllArticles()
      if (response.success) {
        setArticlesList(response.articles)
      } else {
        console.error('Failed to load articles list')
      }
    } catch (err) {
      console.error('Error fetching articles list:', err)
    } finally {
      setIsLoadingList(false)
    }
  }

  // Fetch travelogues for management tab
  const fetchTraveloguesForManagement = async () => {
    setIsLoadingList(true)
    try {
      const response = await api.getAllTravelogues()
      if (response.success) {
        setArticlesList(response.travelogues)
      } else {
        console.error('Failed to load travelogues list')
      }
    } catch (err) {
      console.error('Error fetching travelogues list:', err)
    } finally {
      setIsLoadingList(false)
    }
  }

  useEffect(() => {
    if (token && activeTab === 'manage') {
      if (manageType === 'article') {
        fetchArticlesForManagement()
      } else {
        fetchTraveloguesForManagement()
      }
    }
  }, [token, activeTab, manageType])

  // Change content type write mode
  const handleContentTypeChange = (type) => {
    setContentType(type)
    setFormData(prev => ({
      ...prev,
      category: type === 'article' ? 'Tech Insights' : 'Travel Stories'
    }))
  }

  // Load item into form for editing
  const handleEditClick = (item, type = 'article') => {
    setIsEditing(true)
    setEditingId(item._id)
    setContentType(type)
    setFormData({
      title: item.title || '',
      category: item.category || (type === 'article' ? 'Tech Insights' : 'Travel Stories'),
      subCategory: item.subCategory || '',
      excerpt: item.excerpt || '',
      content: item.content || '',
      image: item.image || '',
      thumbnail: item.thumbnail || '',
      author: item.author || 'DryvSquad AI Editorial',
      date: item.date || '',
      readTime: item.readTime || '5 min read',
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || ''),
      seoTitle: item.seoTitle || '',
      seoDescription: item.seoDescription || '',
      seoKeywords: Array.isArray(item.seoKeywords) ? item.seoKeywords.join(', ') : (item.seoKeywords || ''),
    })
    setActiveTab('write')
    setMessage({ type: '', text: '' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Cancel edit mode
  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditingId(null)
    setFormData({
      title: '',
      category: contentType === 'article' ? 'Tech Insights' : 'Travel Stories',
      subCategory: '',
      excerpt: '',
      content: '',
      image: '',
      thumbnail: '',
      author: 'DryvSquad AI Editorial',
      date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
      readTime: '5 min read',
      tags: '',
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
    })
    setMessage({ type: '', text: '' })
  }

  // Delete article or travelogue
  const handleDeleteClick = async (id, title, type = 'article') => {
    if (!window.confirm(`Are you sure you want to delete this ${type}: "${title}"?`)) {
      return
    }
    
    try {
      const response = type === 'article'
        ? await api.deleteArticle(id, token)
        : await api.deleteTravelogue(id, token)
      if (response.success) {
        setMessage({
          type: 'success',
          text: `🗑️ ${type === 'article' ? 'Article' : 'Travelogue'} "${title}" deleted successfully!`
        })
        if (type === 'article') {
          fetchArticlesForManagement()
        } else {
          fetchTraveloguesForManagement()
        }
      } else {
        if (response.status === 401 || response.status === 403) {
          handleLogout()
          setLoginError('Session expired. Please log in again.')
        } else {
          setMessage({
            type: 'error',
            text: response.message || `Failed to delete ${type}.`
          })
        }
      }
    } catch (err) {
      console.error('Delete error:', err)
      setMessage({
        type: 'error',
        text: `An error occurred while deleting the ${type}.`
      })
    }
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
      let response
      if (isEditing) {
        response = contentType === 'article'
          ? await api.updateArticle(editingId, formData, token)
          : await api.updateTravelogue(editingId, formData, token)
      } else {
        response = contentType === 'article'
          ? await api.createArticle(formData, token)
          : await api.createTravelogue(formData, token)
      }

      if (response.success) {
        const itemType = contentType === 'article' ? 'Article' : 'Travelogue'
        const responseData = response.article || response.travelogue
        setMessage({
          type: 'success',
          text: isEditing 
            ? `🎉 ${itemType} updated successfully! URL Slug: "${responseData.slug}"`
            : `🎉 ${itemType} created successfully! URL Slug: "${responseData.slug}"`
        })
        
        // Reset form and editing status
        handleCancelEdit()
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        if (response.status === 401 || response.status === 403) {
          handleLogout()
          setLoginError('Session expired. Please log in again.')
        } else {
          setMessage({
            type: 'error',
            text: response.message || (isEditing ? `Failed to update ${contentType}.` : `Failed to create ${contentType}.`)
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
        <div className="flex items-center justify-between border-b border-slate-700/50 pb-6 mb-6">
          <div className="flex items-center gap-3">
            
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

        {/* Navigation Tabs */}
        <div className="flex gap-4 border-b border-slate-750/50 pb-4 mb-6">
          <button
            onClick={() => setActiveTab('write')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'write'
                ? 'bg-yellow-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {isEditing 
              ? `Edit ${contentType === 'article' ? 'Article' : 'Travelogue'}` 
              : `Write Content`}
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'manage'
                ? 'bg-yellow-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Manage Content
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

        {/* Conditionally Render Tabs */}
        {activeTab === 'manage' ? (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 md:p-8 shadow-2xl">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Published {manageType === 'article' ? 'Articles' : 'Travelogues'} ({articlesList.length})
                </h3>
                
                {/* Manage Type Toggle */}
                <div className="flex gap-2 bg-slate-900/40 p-1 rounded-lg border border-slate-700/50 max-w-[200px]">
                  <button
                    onClick={() => setManageType('article')}
                    className={`flex-1 py-1 rounded text-[10px] font-semibold transition-all ${
                      manageType === 'article' ? 'bg-slate-750 text-yellow-500 font-bold' : 'text-slate-400'
                    }`}
                  >
                    Articles
                  </button>
                  <button
                    onClick={() => setManageType('travelogue')}
                    className={`flex-1 py-1 rounded text-[10px] font-semibold transition-all ${
                      manageType === 'travelogue' ? 'bg-slate-750 text-yellow-500 font-bold' : 'text-slate-400'
                    }`}
                  >
                    Travelogues
                  </button>
                </div>
              </div>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, author, or category..."
                className="w-full sm:max-w-md bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
              />
            </div>
            
            {isLoadingList ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500"></div>
              </div>
            ) : articlesList.filter(art => 
                (art.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (art.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (art.author || '').toLowerCase().includes(searchQuery.toLowerCase())
              ).length === 0 ? (
              <p className="text-slate-400 text-center py-8">
                No {manageType === 'article' ? 'articles' : 'travelogues'} found matching search criteria.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400 font-semibold uppercase text-xs tracking-wider">
                      <th className="py-3 px-4">Title</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Author</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {articlesList.filter(art => 
                      (art.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (art.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (art.author || '').toLowerCase().includes(searchQuery.toLowerCase())
                    ).map(art => (
                      <tr key={art._id} className="hover:bg-slate-850/50 transition-colors">
                        <td className="py-4 px-4 font-semibold text-white max-w-sm truncate">{art.title}</td>
                        <td className="py-4 px-4">{art.category}</td>
                        <td className="py-4 px-4">{art.date}</td>
                        <td className="py-4 px-4">{art.author}</td>
                        <td className="py-4 px-4 text-right space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => handleEditClick(art, manageType)}
                            className="px-3 py-1.5 bg-yellow-500/10 hover:bg-yellow-500 text-yellow-500 hover:text-slate-950 rounded-lg text-xs font-semibold transition-all"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(art._id, art.title, manageType)}
                            className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-450 hover:text-white rounded-lg text-xs font-semibold transition-all"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* --- LEFT COLUMN: EDITOR FORM --- */}
          <form onSubmit={handleSubmit} className="space-y-8 bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6 md:p-8 shadow-2xl">
            
            {/* Content Type Selector */}
            {!isEditing && (
              <div className="flex gap-2 mb-6 bg-slate-900/40 p-1.5 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => handleContentTypeChange('article')}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                    contentType === 'article' ? 'bg-slate-800 text-yellow-500 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Article Mode
                </button>
                <button
                  type="button"
                  onClick={() => handleContentTypeChange('travelogue')}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                    contentType === 'travelogue' ? 'bg-slate-800 text-yellow-500 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Travelogue Mode
                </button>
              </div>
            )}

            {/* Core Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white border-b border-slate-700/50 pb-2">
                {contentType === 'article' ? 'Article Details' : 'Travelogue Details'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    {contentType === 'article' ? 'Article Title' : 'Travelogue Title'} <span className="text-rose-400">*</span>
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
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder={contentType === 'article' ? "e.g. Tech Insights" : "e.g. Travel Stories"}
                    className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Sub-Category vs Thumbnail */}
                {contentType === 'article' ? (
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
                ) : (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Thumbnail Image URL (Optional)
                    </label>
                    <input
                      type="text"
                      name="thumbnail"
                      value={formData.thumbnail || ''}
                      onChange={handleInputChange}
                      placeholder="e.g. /images/travelogue/thumbnails/bike-vs-car.png"
                      className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                    />
                  </div>
                )}

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
                    value={formData.image.startsWith('data:') ? 'Device Image Selected (Base64)' : formData.image}
                    onChange={handleInputChange}
                    disabled={formData.image.startsWith('data:')}
                    placeholder={formData.image.startsWith('data:') ? 'Clear uploaded image to use URL' : "e.g. https://images.unsplash.com/photo-1503376780353-7e6692767b70"}
                    className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all disabled:opacity-50"
                  />
                  
                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">OR</span>
                    <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition-all border border-slate-700">
                      <span>Upload from Device</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    {formData.image.startsWith('data:') && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                        className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold rounded-lg transition-all border border-rose-500/20"
                      >
                        Clear Upload
                      </button>
                    )}
                  </div>

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
                {contentType === 'article' ? 'Article Content' : 'Travelogue Content'}
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
                    {contentType === 'article' ? 'Article Body (Markdown / Text)' : 'Travelogue Body (Markdown / Text)'} <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    rows="14"
                    placeholder="Write the full content here. You can use markdown or plain paragraphs."
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

                  {/* SEO Keywords (Articles Only) */}
                  {contentType === 'article' && (
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
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={isEditing ? handleCancelEdit : () => navigate('/articles')}
                className="px-6 py-3.5 border border-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
              >
                {isEditing ? 'Cancel Edit' : 'Cancel'}
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
                    <span>{isEditing ? `Updating ${contentType === 'article' ? 'Article' : 'Travelogue'}...` : `Publishing ${contentType === 'article' ? 'Article' : 'Travelogue'}...`}</span>
                  </>
                ) : (
                  <>
                    <span>{isEditing ? `Update ${contentType === 'article' ? 'Article' : 'Travelogue'}` : `Publish ${contentType === 'article' ? 'Article' : 'Travelogue'}`}</span>
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
        )}

      </div>
    </div>
  )
}

export default AdminPage
