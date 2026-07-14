import { useState, useEffect, useRef } from 'react'
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
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [contentType, setContentType] = useState('article') // 'article' or 'travelogue'
  const [editorBlocks, setEditorBlocks] = useState([])
  const blockIdCounterRef = useRef(0)

  // Loading & Message State for publishing
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
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
    showLoanCTA: false,
    showInsuranceCTA: false,
  })

  const [showSeo, setShowSeo] = useState(false)

  const generateBlockId = () => {
    blockIdCounterRef.current += 1
    return `${Date.now()}-${blockIdCounterRef.current}-${Math.random().toString(36).slice(2, 8)}`
  }

  const htmlToEditableText = (htmlContent) => {
    if (!htmlContent) return ''
    const raw = String(htmlContent).trim()
    if (!raw) return ''

    // If it is already plain text, keep it as-is.
    if (!/<\/?[a-z][\s\S]*>/i.test(raw)) return raw

    if (typeof window === 'undefined') {
      return raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    }

    const container = window.document.createElement('div')
    container.innerHTML = raw

    const paragraphs = Array.from(container.querySelectorAll('p'))
      .map((p) => (p.textContent || '').trim())
      .filter(Boolean)

    if (paragraphs.length > 0) {
      return paragraphs.join('\n\n')
    }

    return (container.textContent || '').replace(/\s+/g, ' ').trim()
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
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

  const handleThumbnailUpload = (e) => {
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
        thumbnail: reader.result,
      }))
    }
    reader.readAsDataURL(file)
  }

  // --- BLOCK EDITOR HELPER FUNCTIONS & SERIALIZATION ---
  const addSubheadingBlock = () => {
    setEditorBlocks(prev => [
      ...prev,
      { id: generateBlockId(), type: 'subheading', text: '', color: 'orange' }
    ])
  }

  const addBodyBlock = () => {
    setEditorBlocks(prev => [
      ...prev,
      { id: generateBlockId(), type: 'body', text: '' }
    ])
  }

  const addCalloutBlock = () => {
    setEditorBlocks(prev => [
      ...prev,
      { id: generateBlockId(), type: 'callout', title: '', color: 'yellow', style: 'points', text: '' }
    ])
  }

  const addAffiliateBlock = () => {
    setEditorBlocks(prev => [
      ...prev,
      { id: generateBlockId(), type: 'affiliate', text: 'View Offer', url: '' }
    ])
  }

  const moveBlockUp = (index) => {
    if (index === 0) return
    setEditorBlocks(prev => {
      const copy = [...prev]
      const temp = copy[index]
      copy[index] = copy[index - 1]
      copy[index - 1] = temp
      return copy
    })
  }

  const moveBlockDown = (index) => {
    setEditorBlocks(prev => {
      if (index === prev.length - 1) return prev
      const copy = [...prev]
      const temp = copy[index]
      copy[index] = copy[index + 1]
      copy[index + 1] = temp
      return copy
    })
  }

  const deleteBlock = (id) => {
    setEditorBlocks(prev => prev.filter(block => block.id !== id))
  }

  const updateBlockField = (id, fieldName, value) => {
    setEditorBlocks(prev => prev.map(block => {
      if (block.id === id) {
        return { ...block, [fieldName]: value }
      }
      return block
    }))
  }

  // Serialize blocks to HTML content string for preview & submission
  useEffect(() => {
    if (editorBlocks.length === 0) {
      setFormData(prev => ({
        ...prev,
        content: ''
      }))
      return
    }

    const escapeHtml = (text) => {
      if (!text) return ''
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
    }

    const validateUrl = (url) => {
      if (!url) return '#'
      const trimmed = url.trim()
      if (trimmed.startsWith('/') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return trimmed
      }
      if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(trimmed)) {
        return 'https://' + trimmed
      }
      return '#'
    }

    const htmlContent = editorBlocks.map(block => {
      if (block.type === 'subheading') {
        const borderColors = {
          orange: 'border-[#F97316]',
          yellow: 'border-yellow-500',
          green: 'border-emerald-500',
          blue: 'border-sky-500'
        }
        const borderColor = borderColors[block.color] || 'border-[#F97316]'
        const safeText = escapeHtml(block.text)
        return `<h2 class="text-2xl font-bold border-l-4 ${borderColor} pl-4 py-1 my-6 font-sans">${safeText}</h2>`
      }
      
      if (block.type === 'body') {
        const safeText = escapeHtml(block.text || '')
        return safeText
          .split('\n\n')
          .map(para => para.trim())
          .filter(para => para)
          .map(para => `<p class="my-4 leading-relaxed">${para.replace(/\n/g, '<br />')}</p>`)
          .join('')
      }

      if (block.type === 'callout') {
        const borderColors = {
          orange: 'border-[#F97316]',
          yellow: 'border-yellow-500',
          green: 'border-emerald-500',
          blue: 'border-sky-500'
        }
        const borderColor = borderColors[block.color] || 'border-[#F97316]'
        
        let innerHtml = ''
        if (block.style === 'points') {
          const items = (block.text || '').split('\n').map(line => line.trim()).filter(l => l)
          innerHtml = `<ul class="space-y-3">` + items.map(item => {
            const safeItem = escapeHtml(item)
            if (safeItem.includes(':')) {
              const [label, desc] = safeItem.split(/:(.+)/)
              return `<li class="text-slate-200 text-sm"><strong class="text-white">${label.trim()}:</strong> ${desc ? desc.trim() : ''}</li>`
            }
            return `<li class="text-slate-200 text-sm">${safeItem}</li>`
          }).join('') + `</ul>`
        } else {
          const safeText = escapeHtml(block.text || '')
          innerHtml = safeText
            .split('\n\n')
            .map(para => para.trim())
            .filter(p => p)
            .map(para => `<p class="text-slate-200 text-sm leading-relaxed">${para.replace(/\n/g, '<br />')}</p>`)
            .join('')
        }

        const safeTitle = escapeHtml(block.title)
        return `
          <div class="bg-slate-900/60 border-l-4 ${borderColor} rounded-r-2xl p-6 my-6 shadow-md">
            ${safeTitle ? `<h3 class="text-lg font-bold text-white mb-4">${safeTitle}</h3>` : ''}
            ${innerHtml}
          </div>
        `
      }

      if (block.type === 'affiliate') {
        const safeUrl = validateUrl(block.url)
        const safeText = escapeHtml(block.text)
        return `
          <div class="my-8 flex justify-center">
            <a 
              href="${safeUrl}" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="inline-flex items-center gap-2 px-6 py-3 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold rounded-xl transition-all shadow-lg hover:scale-105 active:scale-95 text-sm"
            >
              <span>${safeText || 'View Offer'}</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        `
      }

      return ''
    }).join('\n')

    setFormData(prev => ({
      ...prev,
      content: htmlContent
    }))
  }, [editorBlocks])

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

  useEffect(() => {
    if (token && activeTab === 'manage') {
      fetchArticlesForManagement()
    }
  }, [token, activeTab])

  // Categories derived from published articles (includes any newly used categories)
  const manageCategories = [
    ...new Set(
      articlesList
        .map((art) => (art.category || '').trim())
        .filter(Boolean)
    ),
  ].sort((a, b) => a.localeCompare(b))

  useEffect(() => {
    if (selectedCategory === 'All') return
    const categoryStillExists = articlesList.some(
      (art) => (art.category || '').trim() === selectedCategory
    )
    if (!categoryStillExists) {
      setSelectedCategory('All')
    }
  }, [articlesList, selectedCategory])

  const filteredArticlesList = articlesList.filter((art) => {
    const matchesCategory =
      selectedCategory === 'All' || (art.category || '').trim() === selectedCategory
    const query = searchQuery.toLowerCase()
    const matchesSearch =
      !query ||
      (art.title || '').toLowerCase().includes(query) ||
      (art.category || '').toLowerCase().includes(query) ||
      (art.author || '').toLowerCase().includes(query)
    return matchesCategory && matchesSearch
  })

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
      slug: item.slug || '',
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
      showLoanCTA: item.showLoanCTA || false,
      showInsuranceCTA: item.showInsuranceCTA || false,
    })
    
    // Load blocks from article or fallback to a single default body block
    if (item.blocks && Array.isArray(item.blocks)) {
      const normalizedBlocks = item.blocks.map((block) => ({
        ...block,
        id: generateBlockId()
      }))
      setEditorBlocks(normalizedBlocks)
    } else {
      setEditorBlocks([
        { id: generateBlockId(), type: 'body', text: htmlToEditableText(item.content || '') }
      ])
    }

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
      slug: '',
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
      showLoanCTA: false,
      showInsuranceCTA: false,
    })
    setEditorBlocks([])
    setMessage({ type: '', text: '' })
  }

  // Delete article
  const handleDeleteClick = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete this article: "${title}"?`)) {
      return
    }
    
    try {
      const response = await api.deleteArticle(id, token)
      if (response.success) {
        setMessage({
          type: 'success',
          text: `🗑️ Article "${title}" deleted successfully!`
        })
        fetchArticlesForManagement()
      } else {
        if (response.status === 401 || response.status === 403) {
          handleLogout()
          setLoginError('Session expired. Please log in again.')
        } else {
          setMessage({
            type: 'error',
            text: response.message || 'Failed to delete article.'
          })
        }
      }
    } catch (err) {
      console.error('Delete error:', err)
      setMessage({
        type: 'error',
        text: 'An error occurred while deleting the article.'
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
      const payload = {
        ...formData,
        blocks: editorBlocks
      }
      if (isEditing) {
        response = contentType === 'article'
          ? await api.updateArticle(editingId, payload, token)
          : await api.updateTravelogue(editingId, payload, token)
      } else {
        response = contentType === 'article'
          ? await api.createArticle(payload, token)
          : await api.createTravelogue(payload, token)
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
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Published Articles ({filteredArticlesList.length}
                  {selectedCategory !== 'All' || searchQuery
                    ? ` of ${articlesList.length}`
                    : ''}
                  )
                </h3>
                <p className="text-slate-400 text-xs">
                  Filter by category to browse articles. New categories appear automatically when used.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full sm:w-52 bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                >
                  <option value="All">All Categories</option>
                  {manageCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, author, or category..."
                  className="w-full sm:max-w-md bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            
            {isLoadingList ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500"></div>
              </div>
            ) : filteredArticlesList.length === 0 ? (
              <p className="text-slate-400 text-center py-8">
                No articles found matching your filters.
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
                    {filteredArticlesList.map(art => (
                      <tr key={art._id} className="hover:bg-slate-850/50 transition-colors">
                        <td className="py-4 px-4 font-semibold text-white max-w-sm truncate">{art.title}</td>
                        <td className="py-4 px-4">{art.category}</td>
                        <td className="py-4 px-4">{art.date}</td>
                        <td className="py-4 px-4">{art.author}</td>
                        <td className="py-4 px-4 text-right space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => handleEditClick(art, 'article')}
                            className="px-3 py-1.5 bg-yellow-500/10 hover:bg-yellow-500 text-yellow-500 hover:text-slate-950 rounded-lg text-xs font-semibold transition-all"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(art._id, art.title)}
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

                {/* Slug */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Slug / URL Path (Optional - Auto-generates if empty)
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. how-abs-prevents-wheel-lock"
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

                {/* Sub-Category (Article only) */}
                {contentType === 'article' && (
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
                )}

                {/* Thumbnail URL & Upload (Both) */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Thumbnail Image Path / URL (Optional)
                  </label>
                  <input
                    type="text"
                    name="thumbnail"
                    value={(formData.thumbnail || '').startsWith('data:') ? 'Device Thumbnail Selected (Base64)' : formData.thumbnail || ''}
                    onChange={handleInputChange}
                    disabled={(formData.thumbnail || '').startsWith('data:')}
                    placeholder={(formData.thumbnail || '').startsWith('data:') ? 'Clear uploaded thumbnail to use URL' : "e.g. /images/travelogue/thumbnails/bike-vs-car.png"}
                    className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all disabled:opacity-50"
                  />
                  
                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">OR</span>
                    <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition-all border border-slate-700">
                      <span>Upload from Device</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailUpload}
                        className="hidden"
                      />
                    </label>
                    {(formData.thumbnail || '').startsWith('data:') && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, thumbnail: '' }))}
                        className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold rounded-lg transition-all border border-rose-500/20"
                      >
                        Clear Upload
                      </button>
                    )}
                  </div>

                  {formData.thumbnail && (
                    <div className="mt-3 rounded-xl border border-slate-700/50 p-2 bg-slate-900/40 inline-block">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-semibold">Preview</p>
                      <img 
                        src={formData.thumbnail} 
                        alt="Thumbnail Preview" 
                        className="max-h-20 rounded-lg object-cover border border-slate-700"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  )}
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

                {/* Block-Based Editor */}
                <div className="space-y-6">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                    <span>Structured Article Body Content (Blocks)</span>
                    <span className="text-[10px] text-yellow-500 font-bold lowercase bg-yellow-500/10 px-2 py-0.5 rounded-full">drag-free modular builder</span>
                  </label>
                  
                  {editorBlocks.length === 0 ? (
                    <div className="border border-dashed border-slate-700/60 rounded-2xl p-8 text-center bg-slate-900/10">
                      <p className="text-sm text-slate-400 mb-4">No content blocks added yet. Click a button below to start building your article.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {editorBlocks.map((block, idx) => (
                        <div key={block.id || idx} className="bg-slate-900/35 border border-slate-700/60 rounded-2xl p-4 md:p-5 relative transition-all hover:border-slate-650 flex flex-col gap-4">
                          
                          {/* Block Header & Ordering Actions */}
                          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-slate-800 text-slate-350 text-[10px] rounded font-bold uppercase tracking-wider">
                                Block {idx + 1}
                              </span>
                              <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 text-[10px] rounded font-bold uppercase tracking-wide">
                                {block.type}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => moveBlockUp(idx)}
                                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                                title="Move Up"
                              >
                                ▲
                              </button>
                              <button
                                type="button"
                                disabled={idx === editorBlocks.length - 1}
                                onClick={() => moveBlockDown(idx)}
                                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                                title="Move Down"
                              >
                                ▼
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteBlock(block.id)}
                                className="p-1 hover:bg-rose-500/20 rounded text-rose-450 hover:text-rose-450 transition-colors"
                                title="Delete Block"
                              >
                                ✕
                              </button>
                            </div>
                          </div>

                          {/* Block-specific Fields */}
                          {block.type === 'subheading' && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div className="sm:col-span-2">
                                <label className="block text-[10px] text-slate-400 font-semibold mb-1">Subheading Text</label>
                                <input
                                  type="text"
                                  value={block.text || ''}
                                  onChange={(e) => updateBlockField(block.id, 'text', e.target.value)}
                                  placeholder="e.g. The Dealer Promise"
                                  className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] text-slate-400 font-semibold mb-1">Left Line Indicator Color</label>
                                <select
                                  value={block.color || 'orange'}
                                  onChange={(e) => updateBlockField(block.id, 'color', e.target.value)}
                                  className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                                >
                                  <option value="orange">Orange (Theme)</option>
                                  <option value="yellow">Yellow</option>
                                  <option value="green">Green</option>
                                  <option value="blue">Blue</option>
                                </select>
                              </div>
                            </div>
                          )}

                          {block.type === 'body' && (
                            <div>
                              <label className="block text-[10px] text-slate-400 font-semibold mb-1">Body Text Content (supports multi-line paragraphs)</label>
                              <textarea
                                value={block.text || ''}
                                onChange={(e) => updateBlockField(block.id, 'text', e.target.value)}
                                rows={4}
                                placeholder="Enter body text content. Separate paragraphs with double enter (empty line)."
                                className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                              />
                            </div>
                          )}

                          {block.type === 'callout' && (
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="sm:col-span-2">
                                  <label className="block text-[10px] text-slate-400 font-semibold mb-1">Callout Title</label>
                                  <input
                                    type="text"
                                    value={block.title || ''}
                                    onChange={(e) => updateBlockField(block.id, 'title', e.target.value)}
                                    placeholder="e.g. Indian Road Reality"
                                    className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] text-slate-400 font-semibold mb-1">Color Theme</label>
                                  <select
                                    value={block.color || 'yellow'}
                                    onChange={(e) => updateBlockField(block.id, 'color', e.target.value)}
                                    className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                                  >
                                    <option value="yellow">Yellow</option>
                                    <option value="green">Green</option>
                                    <option value="blue">Blue</option>
                                    <option value="orange">Orange</option>
                                  </select>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                  <label className="block text-[10px] text-slate-400 font-semibold mb-1">Rendering Style</label>
                                  <select
                                    value={block.style || 'points'}
                                    onChange={(e) => updateBlockField(block.id, 'style', e.target.value)}
                                    className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                                  >
                                    <option value="points">Key: Description List (One per line)</option>
                                    <option value="paragraphs">Standard Paragraphs</option>
                                  </select>
                                </div>
                                <div className="sm:col-span-2">
                                  <label className="block text-[10px] text-slate-400 font-semibold mb-1">
                                    {block.style === 'points' ? 'List Items (one per line, e.g. Faded lane markings: Camera goes blind)' : 'Box Paragraphs (supports double newline for spacing)'}
                                  </label>
                                  <textarea
                                    value={block.text || ''}
                                    onChange={(e) => updateBlockField(block.id, 'text', e.target.value)}
                                    rows={4}
                                    placeholder={block.style === 'points' ? "Faded lane markings: Camera cannot detect missing lines\nHeavy rain: Camera goes blind" : "Enter standard box paragraphs."}
                                    className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {block.type === 'affiliate' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] text-slate-400 font-semibold mb-1">Button text label</label>
                                <input
                                  type="text"
                                  value={block.text || ''}
                                  onChange={(e) => updateBlockField(block.id, 'text', e.target.value)}
                                  placeholder="e.g. View Best Deals on Hyundai Creta"
                                  className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] text-slate-400 font-semibold mb-1">Affiliate Link / Button URL</label>
                                <input
                                  type="text"
                                  value={block.url || ''}
                                  onChange={(e) => updateBlockField(block.id, 'url', e.target.value)}
                                  placeholder="https://affiliate-partner.com/deal"
                                  className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                                />
                              </div>
                            </div>
                          )}

                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Block Options Panel */}
                  <div className="border border-slate-700/60 rounded-2xl p-4 bg-slate-900/10 space-y-3">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Choose Element to Append</p>
                    <div className="flex flex-wrap gap-2.5">
                      <button
                        type="button"
                        onClick={addSubheadingBlock}
                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>➕ Add Subheading</span>
                      </button>
                      <button
                        type="button"
                        onClick={addBodyBlock}
                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>➕ Add Body Paragraph</span>
                      </button>
                      <button
                        type="button"
                        onClick={addCalloutBlock}
                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>➕ Add Styled Callout Box</span>
                      </button>
                      <button
                        type="button"
                        onClick={addAffiliateBlock}
                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>➕ Add Affiliate Link</span>
                      </button>
                    </div>
                  </div>

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

            {/* CTA Buttons Display Toggles (Articles Only) */}
            {contentType === 'article' && (
              <div className="bg-slate-850/40 border border-slate-700/60 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-yellow-500">
                  Article Call-To-Action (CTA) Settings
                </h3>
                <p className="text-xs text-slate-400">
                  Enable these checkboxes to render direct CTA conversion buttons at the bottom of this article page.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <label className="flex items-center gap-3 bg-slate-900/40 p-4 rounded-xl border border-slate-700/50 cursor-pointer hover:bg-slate-900/60 transition-all select-none">
                    <input
                      type="checkbox"
                      name="showLoanCTA"
                      checked={formData.showLoanCTA}
                      onChange={handleInputChange}
                      className="w-4.5 h-4.5 accent-yellow-500 rounded cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-semibold text-slate-200 block">Show Auto Loan CTA</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Redirects readers to the Auto Loan Lead Form</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 bg-slate-900/40 p-4 rounded-xl border border-slate-700/50 cursor-pointer hover:bg-slate-900/60 transition-all select-none">
                    <input
                      type="checkbox"
                      name="showInsuranceCTA"
                      checked={formData.showInsuranceCTA}
                      onChange={handleInputChange}
                      className="w-4.5 h-4.5 accent-yellow-500 rounded cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-semibold text-slate-200 block">Show Insurance CTA</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Redirects readers to the Insurance Lead Form</span>
                    </div>
                  </label>
                </div>
              </div>
            )}

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
          <div className="lg:sticky lg:top-28 space-y-6 bg-slate-800/20 border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-slate-900/65 border-b border-slate-700/50 px-6 py-3 flex items-center gap-2 text-slate-400 text-xs">
              <span>Live Article Preview</span>
            </div>

            {/* Full Height Preview Area */}
            <div className="bg-slate-950 text-white pb-8">
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
