'use client'

import { useState, useEffect, useMemo } from "react"
import dynamic from "next/dynamic"
import axios from "axios"
import { apiClient } from "../utils/apiClient"
import Link from "next/link"
import { ArrowUpRightIcon, SparklesIcon } from "@heroicons/react/24/outline"
import Navbar from "../Components/Navbar"
import Footer from "../Components/Footer"
import Sidebar from "../Components/Sidebar"
import ToolCard from "../Components/ToolCard"
import Newsletter from "../Components/Newsletter"
import { getCachedData, setCachedData } from "../utils/apiCache"
import '../index.css'

// Lazy load heavy components
const Trending = dynamic(() => import("../Components/Trending"), {
  loading: () => <div className="h-64 bg-[#0a0f3f] animate-pulse" />,
  ssr: false
})
const About = dynamic(() => import("../pages/About"), {
  loading: () => <div className="h-96 bg-gray-50 dark:bg-gray-800 animate-pulse" />,
  ssr: false
})

interface Category {
  id: number
  name: string
  slug: string
  description?: string
}

interface Tool {
  id: number
  name: string
  description: string
  image: string
  category: Category | number
  is_premium: boolean
  link?: string
}

export default function HomePage() {
  const [mounted, setMounted] = useState(false) // Fix hydration
  const [categories, setCategories] = useState<Category[]>([])
  const [tools, setTools] = useState<Tool[]>([])
  const [search, setSearch] = useState<string>("")
  const [aiSearchQuery, setAiSearchQuery] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
  const [sidebarWidth, setSidebarWidth] = useState<number>(192)
  const [aiSearchResults, setAiSearchResults] = useState<Tool[]>([])
  const [aiSearchLoading, setAiSearchLoading] = useState<boolean>(false)
  const [showAISearch, setShowAISearch] = useState<boolean>(false)

  const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

  // Only render after client mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch categories + tools with caching
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Check if backend is accessible first
        const { checkBackendConnection } = await import('../utils/checkBackend')
        const isBackendUp = await checkBackendConnection(baseURL)
        
        if (!isBackendUp) {
          console.error('Backend server is not accessible. Please make sure the Django backend is running on', baseURL)
          setCategories([])
          setTools([])
          setLoading(false)
          return
        }
        
        // Check cache first
        const cacheKey = `homepage-data-${baseURL}`
        const cachedData = getCachedData(cacheKey)
        
        if (cachedData) {
          setCategories(cachedData.categories)
          setTools(cachedData.tools)
          setLoading(false)
          return
        }
        
        // Fetch fresh data with increased timeout
        const [catRes, toolRes] = await Promise.all([
          apiClient.get('/api/categories/', { 
            params: { page_size: 9 },
            headers: { 'Cache-Control': 'max-age=300' },
            timeout: 30000 // 30 second timeout for slow connections
          }),
          apiClient.get('/api/ai-tools/', { 
            params: { page_size: 9, is_popular: true },
            headers: { 'Cache-Control': 'max-age=300' },
            timeout: 30000 // 30 second timeout for slow connections
          }),
        ])
        const categoriesData = Array.isArray(catRes.data) ? catRes.data : (catRes.data?.results || [])
        const toolsData = Array.isArray(toolRes.data) ? toolRes.data : (toolRes.data?.results || [])
        
        // Cache the data
        setCachedData(cacheKey, { categories: categoriesData, tools: toolsData })
        
        setCategories(categoriesData)
        setTools(toolsData)
      } catch (error: any) {
        console.error("Error loading data:", error)
        if (error.code === 'ECONNREFUSED' || error.message?.includes('timeout')) {
          console.error('Cannot connect to backend. Make sure Django server is running on', baseURL)
        }
        setCategories([])
        setTools([])
      } finally {
        setLoading(false)
      }
    }

    if (mounted) {
      fetchData()
    }
  }, [baseURL, mounted])

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  // Load sidebar preferences
  useEffect(() => {
    const loadPreferences = async () => {
      if (typeof window !== 'undefined') {
        const storageModule = await import('../utils/storage')
        const savedWidth = await storageModule.storage.getItem('sidebar-width')
        const savedOpen = await storageModule.storage.getItem('sidebar-open')
        
        if (savedWidth) {
          setSidebarWidth(parseInt(savedWidth, 10))
        }
        
        // On mobile, always start with sidebar closed
        const isMobile = window.innerWidth < 768 // md breakpoint
        if (isMobile) {
          setSidebarOpen(false)
        } else {
          // On desktop, load saved open state
          if (savedOpen === 'true') {
            setSidebarOpen(true)
          }
        }
      }
    }
    loadPreferences()
  }, [])

  // Save sidebar width
  const handleSidebarWidthChange = async (width: number) => {
    setSidebarWidth(width)
    if (typeof window !== 'undefined') {
      const storageModule = await import('../utils/storage')
      await storageModule.storage.setItem('sidebar-width', width.toString())
    }
  }

  // Save sidebar open state (for all screen sizes)
  const handleSidebarToggle = async () => {
    const newState = !sidebarOpen
    setSidebarOpen(newState)
    
    if (typeof window !== 'undefined') {
      const storageModule = await import('../utils/storage')
      await storageModule.storage.setItem('sidebar-open', newState.toString())
    }
  }

  // Handle AI Search with intelligent semantic matching
  const handleAISearch = async (query: string) => {
    if (!query.trim()) {
      setAiSearchResults([])
      return
    }

    setAiSearchLoading(true)
    try {
      const queryLower = query.toLowerCase()
      
      // Extract meaningful keywords (remove stop words)
      const stopWords = ['need', 'tool', 'to', 'for', 'a', 'an', 'the', 'i', 'want', 'looking', 'find', 'get', 'help', 'me', 'with', 'that', 'can', 'should', 'would', 'could']
      const keywords = queryLower
        .split(/\s+/)
        .filter(word => word.length > 2)
        .filter(word => !stopWords.includes(word))
        .map(word => word.replace(/[.,!?;:]/g, '')) // Remove punctuation

      // Score each tool based on relevance
      const scoredTools = tools.map(tool => {
        const nameLower = tool.name.toLowerCase()
        const descLower = tool.description.toLowerCase()
        let score = 0

        // Keyword matching (higher weight for name matches)
        keywords.forEach(keyword => {
          if (nameLower.includes(keyword)) score += 10
          if (descLower.includes(keyword)) score += 5
        })

        // Semantic category matching
        const semanticMatches = [
          { patterns: ['summar', 'summary', 'summarize', 'summarizing'], keywords: ['summar', 'summary', 'brief', 'condense'] },
          { patterns: ['legal', 'law', 'contract', 'agreement'], keywords: ['legal', 'law', 'contract', 'document', 'compliance'] },
          { patterns: ['document', 'file', 'pdf'], keywords: ['document', 'file', 'pdf', 'text', 'process'] },
          { patterns: ['image', 'photo', 'picture', 'visual'], keywords: ['image', 'photo', 'picture', 'visual', 'graphic', 'design'] },
          { patterns: ['video', 'movie', 'film'], keywords: ['video', 'movie', 'film', 'media', 'edit'] },
          { patterns: ['text', 'writing', 'content'], keywords: ['text', 'write', 'content', 'article', 'blog'] },
          { patterns: ['code', 'programming', 'developer'], keywords: ['code', 'program', 'develop', 'script', 'function'] },
          { patterns: ['chat', 'conversation', 'message'], keywords: ['chat', 'conversation', 'message', 'talk', 'communicate'] },
          { patterns: ['generate', 'create', 'make'], keywords: ['generate', 'create', 'make', 'produce', 'build'] },
          { patterns: ['edit', 'modify', 'change'], keywords: ['edit', 'modify', 'change', 'update', 'adjust'] },
          { patterns: ['translate', 'language', 'translation'], keywords: ['translate', 'language', 'convert', 'interpret'] },
          { patterns: ['convert', 'transform', 'change format'], keywords: ['convert', 'transform', 'change', 'format'] },
        ]

        semanticMatches.forEach(({ patterns, keywords: semanticKeywords }) => {
          const hasPattern = patterns.some(p => queryLower.includes(p))
          if (hasPattern) {
            semanticKeywords.forEach(semanticKeyword => {
              if (nameLower.includes(semanticKeyword) || descLower.includes(semanticKeyword)) {
                score += 8
              }
            })
          }
        })

        // Boost score for exact phrase matches
        if (descLower.includes(queryLower) || nameLower.includes(queryLower)) {
          score += 15
        }

        return { tool, score }
      })

      // Filter and sort by score
      const matchedTools = scoredTools
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .map(({ tool }) => tool)

      setAiSearchResults(matchedTools)
    } catch (error) {
      console.error('AI Search error:', error)
      setAiSearchResults([])
    } finally {
      setAiSearchLoading(false)
    }
  }

  // Memoize filtered and grouped tools to avoid recalculation on every render
  const filteredTools = useMemo(() => {
    // If AI search is active and has results, use those
    if (showAISearch && aiSearchResults.length > 0) {
      return aiSearchResults
    }
    // Regular search
    if (!search.trim()) return tools
    return tools.filter(tool =>
      tool.name.toLowerCase().includes(search.toLowerCase()) ||
      tool.description.toLowerCase().includes(search.toLowerCase())
    )
  }, [tools, search, showAISearch, aiSearchResults])

  const groupedTools = useMemo(() => {
    return filteredTools.reduce((acc, tool) => {
      if (typeof tool.category === 'object' && tool.category) {
        const key = tool.category.slug
        ;(acc[key] = acc[key] || []).push(tool)
      } else if (tool.category) {
        const key = String(tool.category)
        ;(acc[key] = acc[key] || []).push(tool)
      }
      return acc
    }, {} as Record<string, Tool[]>)
  }, [filteredTools])

  const limitedTools = useMemo(() => filteredTools.slice(0, 20), [filteredTools])
  const limitedCategories = useMemo(() => categories.slice(0, 9), [categories])

  const getImageUrl = (imagePath?: string | null) => {
    if (!imagePath) return "/logo.png"
    if (imagePath.startsWith("http")) return imagePath
    return `${baseURL}${imagePath}`
  }

  if (!mounted) return null // Don't render until mounted

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Navbar onToggleSidebar={handleSidebarToggle} sidebarOpen={sidebarOpen} />
      <Sidebar 
        onClose={() => setSidebarOpen(false)} 
        isOpen={sidebarOpen}
        width={sidebarWidth}
        onWidthChange={handleSidebarWidthChange}
      />
      <main 
        className="pt-16 transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? `${sidebarWidth}px` : '0' }}
      >
        {/* HERO SECTION */}
        <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-16 sm:py-20 md:py-24 flex flex-col justify-center items-center">
          <div className="relative z-10 bg-gray-500/60 dark:bg-gray-800/60 p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl text-center max-w-4xl mx-4 sm:mx-auto w-full text-white">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3 sm:mb-4">
              Discover 3000+ AI Tools
            </h1>
            <p className="mb-4 sm:mb-6 text-sm sm:text-base md:text-lg px-2">
              Find the right AI tools by category or search below
            </p>
            
            {/* Search Bar - Pill Shaped */}
            <div className="flex flex-col gap-3 sm:gap-4 w-full max-w-2xl mx-auto mb-4">
              {/* Regular Search Bar */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault()
                  setShowAISearch(false)
                  setAiSearchResults([])
                  // Scroll to results if there are any
                  if (search.trim()) {
                    setTimeout(() => {
                      const toolsSection = document.querySelector('section:nth-of-type(2)')
                      if (toolsSection) {
                        toolsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }
                    }, 100)
                  }
                }}
                className="relative flex items-center bg-white dark:bg-gray-800 rounded-full shadow-lg overflow-hidden border-2 border-transparent focus-within:border-blue-500 dark:focus-within:border-blue-600 transition-all"
              >
                <input
                  type="text"
                  placeholder="Search AI tools by name or description..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setShowAISearch(false)
                    setAiSearchResults([])
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      setShowAISearch(false)
                      setAiSearchResults([])
                      // Scroll to results if there are any
                      if (search.trim()) {
                        setTimeout(() => {
                          const toolsSection = document.querySelector('section:nth-of-type(2)')
                          if (toolsSection) {
                            toolsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                          }
                        }, 100)
                      }
                    }
                  }}
                  className="flex-1 px-4 sm:px-6 py-3 sm:py-4 outline-none bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base"
                />
                <button 
                  type="submit"
                  className="mr-3 sm:mr-4 px-4 sm:px-6 py-2 sm:py-3 bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-full font-medium transition-colors text-sm sm:text-base whitespace-nowrap"
                >
                  Search
                </button>
              </form>

              {/* AI Search Bar */}
              <div className="relative flex items-center bg-white dark:bg-gray-800 rounded-full shadow-lg overflow-hidden border-2 border-transparent focus-within:border-purple-500 dark:focus-within:border-purple-600 transition-all">
                <button
                  className="ml-3 sm:ml-4 p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                  title="AI Search - Describe your needs naturally"
                >
                  <SparklesIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
                <input
                  type="text"
                  placeholder="I need a tool to summarize legal documents..."
                  value={aiSearchQuery}
                  onChange={(e) => setAiSearchQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && aiSearchQuery.trim()) {
                      handleAISearch(aiSearchQuery)
                      setShowAISearch(true)
                    }
                  }}
                  className="flex-1 px-4 sm:px-6 py-3 sm:py-4 outline-none bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base"
                />
                <button
                  onClick={() => {
                    if (aiSearchQuery.trim()) {
                      handleAISearch(aiSearchQuery)
                      setShowAISearch(true)
                    }
                  }}
                  disabled={aiSearchLoading || !aiSearchQuery.trim()}
                  className="mr-3 sm:mr-4 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base whitespace-nowrap"
                >
                  {aiSearchLoading ? 'Searching...' : 'AI Search'}
                </button>
              </div>

              {/* AI Search Indicator */}
              {showAISearch && aiSearchResults.length > 0 && (
                <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-white/90">
                  <SparklesIcon className="h-4 w-4 text-yellow-300" />
                  <span>Found {aiSearchResults.length} tool{aiSearchResults.length !== 1 ? 's' : ''} matching your needs</span>
                </div>
              )}

            </div>
          </div>
        </section>

        {/* TOOLS SCROLL */}
        <section className="bg-white dark:bg-gray-900 py-6 sm:py-10 overflow-hidden border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="flex space-x-4 sm:space-x-8 animate-scroll px-4 sm:px-8">
            {loading ? (
              <p className="text-center w-full text-gray-500 dark:text-gray-400 text-sm sm:text-base">Loading tools...</p>
            ) : limitedTools.length > 0 ? (
              [...limitedTools, ...limitedTools].map((tool, i) => (
                <Link
                  key={`${tool.id}-${i}`}
                  href={`/tools/${tool.id}`}
                  className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl sm:rounded-2xl px-3 sm:px-4 md:px-6 py-2 sm:py-3 shadow-sm hover:shadow-md transition-all min-w-fit cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <img 
                    src={getImageUrl(tool.image)} 
                    alt={tool.name} 
                    className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 object-contain flex-shrink-0"
                    loading="lazy"
                  />
                  <p className="font-medium text-gray-700 dark:text-gray-300 text-xs sm:text-sm md:text-base whitespace-nowrap">{tool.name}</p>
                </Link>
              ))
            ) : (
              <p className="text-center w-full text-gray-500 dark:text-gray-400 text-sm sm:text-base">No tools found</p>
            )}
          </div>
        </section>

        {/* POPULAR TOOLS GRID */}
        <section className="py-6 sm:py-8 md:py-12 px-4 sm:px-6 md:px-8 lg:px-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="text-center mb-6 sm:mb-8 md:mb-10">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-gray-100">Popular AI Tools</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-xs sm:text-sm md:text-base">Explore trending AI tools from our database</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 max-w-7xl mx-auto">
            {loading ? (
              <p className="text-center text-gray-500 dark:text-gray-400 w-full col-span-full">Loading tools...</p>
            ) : tools.slice(0, 9).map(tool => (
              <ToolCard key={tool.id} tool={tool} showFavorite={false} />
            ))}
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="py-6 sm:py-8 md:py-12 px-4 sm:px-6 md:px-8 lg:px-20 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-center mb-6 sm:mb-8 md:mb-10 text-gray-900 dark:text-gray-100">Browse by Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-10 max-w-7xl mx-auto">
            {loading ? (
              <p className="text-center text-gray-500 dark:text-gray-400 w-full col-span-full">Loading categories...</p>
            ) : limitedCategories.map(category => {
              const toolsInCategory = groupedTools[category.slug] || []
              if (!toolsInCategory.length) return null
              return (
                <div key={category.id} className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-6 hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
                  <Link href={`/categories/${category.slug}`} className="inline-flex items-center justify-between w-full gap-2 sm:gap-3 mb-3 sm:mb-4 group">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline">{category.name}</h3>
                    <ArrowUpRightIcon className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500 dark:text-indigo-300 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform flex-shrink-0" />
                  </Link>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 text-gray-700 dark:text-gray-300 text-xs sm:text-sm md:text-base">
                    {toolsInCategory.slice(0,5).map(tool => (
                      <li key={tool.id}>
                        <button
                          onClick={() => tool.link && window.open(tool.link, '_blank', 'noopener,noreferrer')}
                          className={`hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors text-left ${
                            tool.link ? 'cursor-pointer' : 'cursor-default'
                          }`}
                        >
                          {tool.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                  {toolsInCategory.length > 5 && (
                    <div className="mt-4">
                      <Link href={`/categories/${category.slug}`} className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:underline">
                        More tools <ArrowUpRightIcon className="h-4 w-4"/>
                      </Link>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        <Trending />
        <About />
        <Newsletter />
        <Footer />
      </main>
    </div>
  )
}


