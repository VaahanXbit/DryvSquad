import { useState, useEffect, useRef } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { 
  Plus, 
  Mic, 
  Sparkles, 
  ArrowRight, 
  Loader2, 
  Globe,
  ExternalLink,
  ChevronRight,
  Trash2,
  Send
} from 'lucide-react'

const API_URL = import.meta.env.VITE_AI_API_URL || 'http://localhost:8000';

const AiModePage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const queryParam = searchParams.get('q') || ''
  
  const [inputVal, setInputVal] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)
  const processedQueryRef = useRef('')
  
  //(localStorage)
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('dryvsquad_chat_history')
      if (saved) {
        const parsed = JSON.parse(saved)
        return Array.isArray(parsed) ? parsed : []
      }
      return []
    } catch (e) {
      return []
    }
  })

  // Sync messages to localStorage
  useEffect(() => {
    localStorage.setItem('dryvsquad_chat_history', JSON.stringify(messages))
  }, [messages])

  // Rotate loading messages to decrease perceived latency
  const [loadingText, setLoadingText] = useState("Analyzing your query...")
  useEffect(() => {
    if (!loading) return

    const steps = [
      "Analyzing your query...",
      "Searching DryvSquad's knowledge base...",
      "Retrieving automotive articles...",
      "Synthesizing specifications...",
      "Formulating verdict..."
    ]
    
    let index = 0
    setLoadingText(steps[0])

    const interval = setInterval(() => {
      index = (index + 1) % steps.length
      setLoadingText(steps[index])
    }, 1100)

    return () => clearInterval(interval)
  }, [loading])

  const suggestions = [
    'Is AWD worth it for city driving in India?',
    'Can Your FWD Car Handle Spiti in Winter?',
    'How does ABS prevent wheels from locking up?',
    'Explain if ADAS features are useful on Indian roads'
  ]

  // Consume query parameters (e.g. from homepage redirect)
  useEffect(() => {
    const trimmedQuery = queryParam.trim()
    if (trimmedQuery && processedQueryRef.current !== trimmedQuery) {
      processedQueryRef.current = trimmedQuery
      handleSendMessage(trimmedQuery)
      // Clear URL query parameter to avoid duplicate triggering on tab-focus, mount, or reload
      setSearchParams({}, { replace: true })
    }
  }, [queryParam, setSearchParams])

  // Auto-scroll to the bottom 
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSendMessage = async (text) => {
    if (!text.trim()) return

    const userMsg = {
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toISOString()
    }
    
    setMessages(prev => [...prev, userMsg])
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_URL}/api/ai-mode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: text.trim(),
          history: messages.map(msg => ({
            sender: msg.sender,
            text: msg.text || '',
            result: msg.result || null
          }))
        })
      })

      if (!response.ok) {
        throw new Error('AI service failed to respond')
      }

      const data = await response.json()
      
      const aiMsg = {
        sender: 'ai',
        result: data,
        timestamp: new Date().toISOString()
      }
      
      setMessages(prev => [...prev, aiMsg])
    } catch (err) {
      setError('Could not connect to the DryvSquad AI service. Please make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    const text = inputVal.trim()
    if (text) {
      handleSendMessage(text)
      setInputVal('')
    }
  }

  const handleNewChat = () => {
    setMessages([])
    setInputVal('')
    setError(null)
    setSearchParams({})
    processedQueryRef.current = ''
    localStorage.removeItem('dryvsquad_chat_history')
  }

  const latestUserMsg = [...messages].reverse().find(msg => msg.sender === 'user')
  const currentQuery = latestUserMsg?.text || ''

  const latestAiMessage = [...messages].reverse().find(msg => msg.sender === 'ai')
  const latestResult = latestAiMessage?.result || null

  const uniqueSources = latestResult?.sources 
    ? [...new Map(latestResult.sources.map(s => [s.title, s])).values()]
    : []

  const isRelevant = latestResult && latestResult.has_answer !== false && 
    !latestResult.verdict?.toLowerCase().includes("couldn't find relevant") &&
    !latestResult.verdict?.toLowerCase().includes("please try searching");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#131314] text-slate-700 dark:text-[#e3e3e3] font-sans pt-28 pb-32 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex gap-6 relative items-start">
        
        {/* Main Content Area */}
        <main className="flex-1 flex flex-col space-y-6">
          
          {/* Empty state (No chat history) */}
          {messages.length === 0 && !loading && (
            <div className="max-w-2xl mx-auto w-full my-auto text-center space-y-8 py-12">
              <div className="space-y-3">
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-2">
                  <Sparkles className="w-8 h-8 text-yellow-600 dark:text-yellow-500 animate-pulse" />
                  DryvSquad AI
                </h2>
                <p className="text-slate-500 dark:text-[#9ca3af] text-sm max-w-md mx-auto leading-relaxed">
                  Ask anything about Indian cars, maintenance, or specifications. I will search our articles and synthesize a direct verdict.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto pt-4">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSendMessage(suggestion)}
                    className="text-left text-xs p-4 bg-white dark:bg-[#1e1f20] hover:bg-slate-100 dark:hover:bg-[#2f3032] border border-slate-200 dark:border-[#2f3032] rounded-xl text-slate-700 dark:text-[#c4c7c5] hover:text-slate-900 dark:hover:text-white transition-all font-medium flex items-center justify-between group shadow-sm"
                  >
                    <span>{suggestion}</span>
                    <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-yellow-600 dark:group-hover:text-yellow-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Messages */}
          {messages.length > 0 && (
            <div className="max-w-3xl mx-auto w-full flex flex-col space-y-6">
              
              {/* Clear History Button (Sticky Header) */}
              <div className="sticky top-[88px] z-10 flex justify-between items-center bg-slate-50/90 dark:bg-[#131314]/90 backdrop-blur-sm pb-2.5 border-b border-slate-200 dark:border-[#2f3032]/40 pt-2.5 transition-colors duration-200">
                <span className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-wider">Conversation History</span>
                <button 
                  onClick={handleNewChat}
                  className="flex items-center gap-1 text-[10px] text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 font-semibold transition-colors"
                  title="Clear Chat History"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear Chat
                </button>
              </div>

              {messages.map((msg, index) => {
                if (msg.sender === 'user') {
                  return (
                    <div key={index} className="flex justify-end animate-fade-in">
                      <div className="bg-slate-200 dark:bg-[#2f3032] text-slate-800 dark:text-white px-5 py-3 rounded-2xl max-w-lg shadow-md text-sm font-semibold leading-relaxed border border-slate-300 dark:border-[#3e4042]">
                        {msg.text}
                      </div>
                    </div>
                  )
                } else {
                  const result = msg.result
                  const isSmallTalk = result && result.is_small_talk === true;

                  if (isSmallTalk) {
                    return (
                      <div key={index} className="flex justify-start animate-fade-in">
                        <div className="bg-slate-100 dark:bg-[#202124] text-slate-800 dark:text-[#e3e3e3] px-5 py-3.5 rounded-2xl max-w-lg shadow-sm text-sm leading-relaxed border border-slate-200 dark:border-[#2f3032]">
                          {result.verdict}
                        </div>
                      </div>
                    )
                  }

                  const msgRelevant = result && result.has_answer !== false && 
                    !result.verdict?.toLowerCase().includes("couldn't find relevant") &&
                    !result.verdict?.toLowerCase().includes("please try searching")

                  return (
                    <div key={index} className="space-y-6 bg-white dark:bg-[#1e1f20]/30 border border-slate-200 dark:border-[#2f3032]/40 rounded-2xl p-6 shadow-md dark:shadow-sm animate-fade-in">
                      
                      {/* Verdict */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-yellow-600 dark:text-yellow-500 uppercase tracking-widest block">
                          Direct Verdict
                        </span>
                        <div className="text-base font-bold text-slate-900 dark:text-white leading-relaxed border-l-2 border-yellow-500 pl-4 py-1">
                          {result.verdict}
                        </div>
                      </div>

                      {/* Reasoning */}
                      {msgRelevant && result.reasoning && (
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest block">
                            Reasoning
                          </span>
                          <p className="text-sm text-slate-700 dark:text-[#e3e3e3] leading-relaxed">
                            {result.reasoning}
                          </p>
                        </div>
                      )}

                      {/* Pros and Cons */}
                      {msgRelevant && (result.pros?.length > 0 || result.cons?.length > 0) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                          {result.pros?.length > 0 && (
                            <div className="p-4 bg-green-500/[0.02] dark:bg-green-500/5 rounded-xl border border-green-500/20 dark:border-green-500/10">
                              <span className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-widest block mb-2">Pros (Indian Conditions)</span>
                              <ul className="space-y-2">
                                {result.pros.map((pro, i) => (
                                  <li key={i} className="text-xs text-slate-600 dark:text-[#c4c7c5] flex items-start gap-2">
                                    <span className="text-green-500 font-bold shrink-0 mt-0.5">✓</span>
                                    <span>{pro}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {result.cons?.length > 0 && (
                            <div className="p-4 bg-red-500/[0.02] dark:bg-red-500/5 rounded-xl border border-red-500/20 dark:border-red-500/10">
                              <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-widest block mb-2">Cons & Concerns</span>
                              <ul className="space-y-2">
                                {result.cons.map((con, i) => (
                                  <li key={i} className="text-xs text-slate-600 dark:text-[#c4c7c5] flex items-start gap-2">
                                    <span className="text-red-400 font-bold shrink-0 mt-0.5">✗</span>
                                    <span>{con}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Empty source fallback */}
                      {!msgRelevant && (
                        <div className="bg-slate-100 dark:bg-[#1e1f20] rounded-xl p-4 text-center border border-slate-200 dark:border-[#2f3032] space-y-3">
                          <p className="text-xs text-slate-500 dark:text-gray-400">
                            No specific matching articles were found in the DryvSquad Knowledge base.
                          </p>
                          <Link 
                            to={`/articles?search=${encodeURIComponent(messages[index-1]?.text || '')}`}
                            className="inline-flex items-center gap-1.5 text-xs text-yellow-600 dark:text-yellow-500 hover:underline font-bold"
                          >
                            Search general articles instead
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      )}

                    </div>
                  )
                }
              })}

              {/* Loading Indicator */}
              {loading && (
                <div className="flex flex-col items-start space-y-2 bg-white dark:bg-[#1e1f20]/30 border border-slate-200 dark:border-[#2f3032]/40 rounded-2xl p-6 shadow-md dark:shadow-sm w-full">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 text-yellow-600 dark:text-yellow-500 animate-spin" />
                    <p className="text-xs text-slate-500 dark:text-gray-400 font-medium transition-all duration-300">
                      {loadingText}
                    </p>
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm leading-relaxed">
                  {error}
                </div>
              )}
              
              {/* Dummy element for scroll anchoring */}
              <div ref={messagesEndRef} />
            </div>
          )}
          
        </main>

        {/* Right Sidebar (Related Articles)*/}
        {currentQuery && !loading && isRelevant && uniqueSources.length > 0 && (
          <aside className="w-[320px] bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-[#2f3032] rounded-2xl p-5 flex flex-col space-y-4 shrink-0 hidden lg:flex sticky top-28 h-fit max-h-[calc(100vh-160px)] overflow-y-auto shadow-md dark:shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-[#2f3032]">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-yellow-600 dark:text-yellow-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                  {uniqueSources.length} source{uniqueSources.length !== 1 ? 's' : ''} found
                </span>
              </div>
            </div>

            {/* Source Card list */}
            <div className="flex flex-col gap-3">
              {uniqueSources.map((source, i) => (
                <Link
                  key={i}
                  to={`/article/${source.slug}`}
                  className="group p-3.5 bg-slate-50 dark:bg-[#131314] hover:bg-slate-100 dark:hover:bg-[#252628] rounded-xl border border-slate-100 dark:border-[#2f3032] hover:border-yellow-600/30 dark:hover:border-yellow-500/30 transition-all flex flex-col space-y-2 cursor-pointer shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-600 dark:text-yellow-500 text-[8px] font-bold">
                        {source.category ? source.category[0] : 'A'}
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400 group-hover:text-yellow-600 dark:group-hover:text-yellow-500 transition-colors uppercase tracking-wider truncate max-w-[160px]">
                        {source.category || 'Article'}
                      </span>
                    </div>
                    <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-white transition-colors" />
                  </div>

                  <h4 className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-yellow-600 dark:group-hover:text-yellow-500 transition-colors line-clamp-2 leading-relaxed">
                    {source.title}
                  </h4>

                  <p className="text-[10px] text-slate-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                    Learn about {source.title.toLowerCase()} and how it impacts your driving conditions in India.
                  </p>
                </Link>
              ))}
            </div>

            <Link
              to="/articles"
              className="w-full mt-2 py-2.5 bg-slate-100 dark:bg-[#2f3032] hover:bg-slate-200 dark:hover:bg-[#3e4042] text-slate-600 dark:text-[#c4c7c5] hover:text-slate-800 dark:hover:text-white rounded-xl text-center transition-colors shadow-sm block text-xs font-bold"
            >
              Show all articles
            </Link>
          </aside>
        )}

      </div>

      {/*Search Bar */}
      <footer className="fixed bottom-0 left-0 right-0 from-slate-50 via-slate-50 to-transparent dark:from-[#131314] dark:via-[#131314] dark:to-transparent pt-8 pb-6 px-6 z-40 flex justify-center transition-colors duration-200">
        <form onSubmit={handleSearchSubmit} className="max-w-2xl w-full">
          <div className="w-full bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-[#2f3032] rounded-2xl flex items-center px-4 py-2.5 shadow-lg focus-within:ring-1 focus-within:ring-yellow-500/50">
            
            <button 
              type="button"
              onClick={handleNewChat}
              className="w-9 h-9 rounded-full bg-slate-100 dark:bg-[#2f3032] hover:bg-slate-200 dark:hover:bg-[#3e4042] text-slate-500 dark:text-[#c4c7c5] hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition-colors shadow-sm shrink-0"
              title="Start New Chat / Clear History"
            >
              <Plus className="w-5 h-5" />
            </button>

            {/* Input Element */}
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask anything..."
              disabled={loading}
              className="flex-grow bg-transparent text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none px-4 py-2 disabled:opacity-50"
            />

            {/* Send Button */}
            <button 
              type="submit"
              disabled={loading || !inputVal.trim()}
              className="w-9 h-9 rounded-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-slate-100 dark:disabled:bg-[#2f3032] text-white disabled:text-slate-400 dark:disabled:text-gray-500 flex items-center justify-center transition-all shadow-sm hover:shadow-md shrink-0 disabled:shadow-none disabled:cursor-not-allowed ml-2"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>

          </div>
        </form>
      </footer>

    </div>
  )
}

export default AiModePage
