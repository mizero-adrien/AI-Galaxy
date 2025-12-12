'use client'

import Navbar from '../../Components/Navbar'
import Footer from '../../Components/Footer'
import Sidebar from '../../Components/Sidebar'
import BlogSidebar from '../../Components/BlogSidebar'
import Newsletter from '../../Components/Newsletter'
import SubmitToolButton from '../../Components/SubmitToolButton'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CalendarIcon, UserIcon, ArrowRightIcon, HandThumbUpIcon } from '@heroicons/react/24/outline'
import { HandThumbUpIcon as HandThumbUpIconSolid } from '@heroicons/react/24/solid'
import { getBlogPosts, toggleLike, type BlogPostList } from '../../api/blog.api'

export default function BlogPage() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
  const [sidebarWidth, setSidebarWidth] = useState<number>(192)
  const [posts, setPosts] = useState<BlogPostList[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [likingPosts, setLikingPosts] = useState<Set<number>>(new Set())
  const [isClient, setIsClient] = useState<boolean>(false)

  // Load sidebar preferences
  useEffect(() => {
    const loadPreferences = async () => {
      if (typeof window === 'undefined') return;
      const storageModule = await import('../../utils/storage');
      const savedWidth = await storageModule.storage.getItem('sidebar-width');
      const savedOpen = await storageModule.storage.getItem('sidebar-open');
      
      if (savedWidth) {
        setSidebarWidth(parseInt(savedWidth, 10));
      }
      
      // On mobile, always start with sidebar closed
      const isMobile = window.innerWidth < 768; // md breakpoint
      if (isMobile) {
        setSidebarOpen(false);
      } else {
        // On desktop, load saved open state
        if (savedOpen === 'true') {
          setSidebarOpen(true);
        }
      }
    };
    loadPreferences();
  }, []);

  const handleSidebarWidthChange = async (width: number) => {
    setSidebarWidth(width);
    if (typeof window !== 'undefined') {
      const storageModule = await import('../../utils/storage');
      await storageModule.storage.setItem('sidebar-width', width.toString());
    }
  };

  const handleSidebarToggle = async () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    if (typeof window !== 'undefined') {
      const storageModule = await import('../../utils/storage');
      await storageModule.storage.setItem('sidebar-open', newState.toString());
    }
  };

  useEffect(() => {
    setIsClient(true)
    const fetchBlogPosts = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getBlogPosts()
        console.log('Blog posts fetched:', data)
        console.log('Number of posts:', data?.length || 0)
        setPosts(data || [])
      } catch (err: any) {
        console.error('Error fetching blog posts:', err)
        console.error('Error details:', err.response?.data || err.message)
        setError(`Failed to load blog posts: ${err.response?.data?.detail || err.message || 'Unknown error'}`)
        setPosts([])
      } finally {
        setLoading(false)
      }
    }

    fetchBlogPosts()
  }, [])

  const handleLike = async (post: BlogPostList, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (likingPosts.has(post.id)) return

    try {
      setLikingPosts(prev => new Set(prev).add(post.id))
      // Get user email if logged in, otherwise undefined (for anonymous likes)
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null
      const user = userStr ? JSON.parse(userStr) : null
      const userEmail = user?.email || user?.username || undefined
      const result = await toggleLike(post.slug || post.id.toString(), userEmail)

      setPosts(prevPosts =>
        prevPosts.map(p =>
          p.id === post.id
            ? { ...p, is_liked: result.is_liked, like_count: result.like_count }
            : p
        )
      )
    } catch (err: any) {
      console.error('Error toggling like:', err)
      if (err.response?.status >= 500) {
        alert('Server error. Please try again later.')
      } else {
        alert('Failed to update like. Please try again.')
      }
    } finally {
      setLikingPosts(prev => {
        const newSet = new Set(prev)
        newSet.delete(post.id)
        return newSet
      })
    }
  }

  const getImageUrl = (imagePath: string | null | undefined): string => {
    if (!imagePath) return ''
    if (imagePath.startsWith('http')) return imagePath
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    return `${baseURL}${imagePath}`
  }

  // Use cover_image if available, otherwise fall back to image
  const getPostImage = (post: BlogPostList): string | null => {
    return post.cover_image || post.image || null
  }

  const filteredPosts = (Array.isArray(posts) ? posts : []).filter(post =>
    post?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post?.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Don't render anything until client-side to avoid hydration mismatches
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

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
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 dark:from-indigo-900 dark:via-purple-900 dark:to-indigo-950 text-white py-16 sm:py-20 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
                Latest News in AI
              </h1>
              <p className="text-xl sm:text-2xl md:text-3xl text-indigo-100 dark:text-indigo-200 font-medium">
                Trends, Reviews, Tool Comparisons
              </p>
              <p className="mt-6 text-lg sm:text-xl text-indigo-100 dark:text-indigo-200 max-w-3xl mx-auto">
                Stay updated with the latest AI tools, trends, and insights from the world of artificial intelligence.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Search Bar */}
              <div className="mb-8">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    // Search is already filtering in real-time, but we can scroll to results
                    if (searchTerm.trim() && filteredPosts.length > 0) {
                      const postsGrid = document.querySelector('.grid')
                      if (postsGrid) {
                        postsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }
                    }
                  }}
                >
                  <input
                    type="text"
                    placeholder="Search blog posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        // Search is already filtering in real-time, but we can scroll to results
                        if (searchTerm.trim() && filteredPosts.length > 0) {
                          const postsGrid = document.querySelector('.grid')
                          if (postsGrid) {
                            postsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' })
                          }
                        }
                      }
                    }}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </form>
              </div>

              {/* Loading State */}
              {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading blog posts...</p>
            </div>
          )}

              {/* Error State */}
              {error && !loading && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-8">
                  <p className="text-yellow-800 dark:text-yellow-200">{error}</p>
                </div>
              )}

              {/* Blog Posts Grid */}
              {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => {
                  const imageUrl = getImageUrl(getPostImage(post))
                  return (
                    <article
                      key={post.id}
                      className="bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
                    >
                      {imageUrl && (
                        <div className="h-48 overflow-hidden">
                          <img
                            src={imageUrl}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-6 flex-1 flex flex-col">
                        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3 line-clamp-2">
                          {post.title}
                        </h2>
                        
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4 space-x-4 flex-wrap">
                          <div className="flex items-center">
                            <UserIcon className="h-4 w-4 mr-1" />
                            <span>{post.author.username}</span>
                          </div>
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            <span>{new Date(post.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}</span>
                          </div>
                        </div>

                        <p className="text-gray-600 dark:text-gray-400 mb-4 flex-1 line-clamp-3">
                          {post.excerpt || 'No excerpt available'}
                        </p>

                        <div className="flex items-center justify-between mt-auto">
                          <Link
                            href={`/blog/${post.slug || post.id}`}
                            className="inline-flex items-center text-black dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 font-medium group"
                          >
                            Read more
                            <ArrowRightIcon className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Link>
                          <button
                            onClick={(e) => handleLike(post, e)}
                            className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                            disabled={likingPosts.has(post.id)}
                          >
                            {post.is_liked ? (
                              <HandThumbUpIconSolid className="h-5 w-5 text-blue-500" />
                            ) : (
                              <HandThumbUpIcon className="h-5 w-5" />
                            )}
                            <span>{post.like_count}</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  )
                })
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    No blog posts found matching "{searchTerm}"
                  </p>
                </div>
              )}
            </div>
          )}

              {/* Empty State */}
              {!loading && !error && filteredPosts.length === 0 && searchTerm === '' && (
                <div className="text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    No blog posts available at the moment.
                  </p>
                </div>
              )}
            </div>

            {/* Blog Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <BlogSidebar />
              </div>
            </div>
          </div>
        </div>
        <Newsletter />
        <SubmitToolButton />
        <Footer />
      </main>
    </div>
  )
}
