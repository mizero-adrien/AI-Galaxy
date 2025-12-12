'use client'

import Navbar from '../../../Components/Navbar'
import Footer from '../../../Components/Footer'
import Sidebar from '../../../Components/Sidebar'
import Newsletter from '../../../Components/Newsletter'
import SubmitToolButton from '../../../Components/SubmitToolButton'
import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CalendarIcon, UserIcon, ArrowLeftIcon, HandThumbUpIcon, ChatBubbleLeftIcon, ArrowTopRightOnSquareIcon, BookmarkIcon, ShareIcon } from '@heroicons/react/24/outline'
import { HandThumbUpIcon as HandThumbUpIconSolid, BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid'
import Link from 'next/link'
import Image from 'next/image'
import { getBlogPost, toggleLike, checkLike, getPostComments, addComment, deleteComment, updateComment, type BlogPost, type BlogComment } from '../../../api/blog.api'
import { toggleFavorite } from '../../../api/favorites.api'
import { apiClient } from '../../../utils/apiClient'

interface Tool {
  id: number
  name: string
  description: string
  image?: string
  link?: string
  is_premium: boolean
  is_free: boolean
}

interface TocItem {
  id: string
  text: string
  level: number
}

export default function BlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const slug = (params?.id as string) || ''
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
  const [sidebarWidth, setSidebarWidth] = useState<number>(192)
  const [post, setPost] = useState<BlogPost | null>(null)
  const [comments, setComments] = useState<BlogComment[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [commentText, setCommentText] = useState<string>('')
  const [submittingComment, setSubmittingComment] = useState<boolean>(false)
  const [liking, setLiking] = useState<boolean>(false)
  const [user, setUser] = useState<any>(null)
  const [toc, setToc] = useState<TocItem[]>([])
  const [activeTocId, setActiveTocId] = useState<string>('')
  const [toolFavorites, setToolFavorites] = useState<Set<number>>(new Set())
  const [showShareMenu, setShowShareMenu] = useState<boolean>(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const tocRef = useRef<HTMLDivElement>(null)

  // Load sidebar preferences
  useEffect(() => {
    const loadPreferences = async () => {
      if (typeof window === 'undefined') return;
      const storageModule = await import('../../../utils/storage');
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
      const storageModule = await import('../../../utils/storage');
      await storageModule.storage.setItem('sidebar-width', width.toString());
    }
  };

  const handleSidebarToggle = async () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    if (typeof window !== 'undefined') {
      const storageModule = await import('../../../utils/storage');
      await storageModule.storage.setItem('sidebar-open', newState.toString());
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user')
      if (storedUser) setUser(JSON.parse(storedUser))
    }
  }, [])

  // Generate TOC from content
  useEffect(() => {
    if (!post?.content) return

    const lines = post.content.split('\n')
    const tocItems: TocItem[] = []

    lines.forEach((line, index) => {
      const match = line.match(/^(#{1,6})\s(.+)$/)
      if (match) {
        const level = match[1].length
        const text = match[2]
        const id = `heading-${index}-${text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`
        tocItems.push({ id, text, level })
      }
    })

    setToc(tocItems)
  }, [post?.content])

  // Scroll spy for TOC
  useEffect(() => {
    if (!toc.length || !contentRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveTocId(entry.target.id)
          }
        })
      },
      { rootMargin: '-20% 0px -70% 0px' }
    )

    // Wait for content to render
    const timeoutId = setTimeout(() => {
      if (contentRef.current) {
        const headings = contentRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6')
        headings.forEach((heading) => observer.observe(heading))
      }
    }, 200)

    return () => {
      clearTimeout(timeoutId)
      observer.disconnect()
    }
  }, [toc, post?.content])

  useEffect(() => {
    const fetchBlogPost = async () => {
      if (!slug) return

      try {
        setLoading(true)
        setError(null)
        const postData = await getBlogPost(slug)
        setPost(postData)
        
        if (postData) {
          // Check like status (works for both authenticated and anonymous users)
          try {
            const likeStatus = await checkLike(postData.slug || slug)
            setPost({ ...postData, is_liked: likeStatus.is_liked, like_count: likeStatus.like_count })
          } catch (err) {
            console.warn('Could not check like status:', err)
            // Continue with post data as-is
            setPost(postData)
          }
          
          try {
            const commentsData = await getPostComments(postData.id)
            setComments(commentsData)
          } catch (commentErr: any) {
            // Handle comment fetch errors separately - don't fail the whole page
            console.error('Error fetching comments:', commentErr)
            if (commentErr.response?.status === 403) {
              console.warn('Access denied to comments. User may need to be authenticated.')
              // Set empty comments array instead of showing error
              setComments([])
            } else {
              // For other errors, still set empty array to prevent UI issues
              setComments([])
            }
          }
        }
      } catch (err: any) {
        console.error('Error fetching blog post:', err)
        if (err.response?.status === 403) {
          setError('Access denied. You may not have permission to view this post.')
        } else if (err.response?.status === 404) {
          setError('Blog post not found.')
        } else {
          setError('Failed to load blog post. Please try again later.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchBlogPost()
  }, [slug])

  const handleLike = async () => {
    if (liking || !post) return
    
    try {
      setLiking(true)
      // Send user email if logged in, otherwise send empty (for anonymous likes)
      const userEmail = user?.email || user?.username || undefined
      const result = await toggleLike(post.slug || slug, userEmail)
      if (post) {
        // Update post with new like status and count
        setPost({ ...post, is_liked: result.is_liked, like_count: result.like_count })
      }
    } catch (err: any) {
      console.error('Error toggling like:', err)
      // Handle different error types
      if (err.response?.status >= 500) {
        alert('Server error. Please try again later.')
      } else {
        alert('Failed to update like. Please try again.')
      }
    } finally {
      setLiking(false)
    }
  }

  const handleShare = async () => {
    if (!post) return
    
    const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
    const shareText = `${post.title} - ${post.excerpt || ''}`
    
    if (navigator.share) {
      // Use native share API if available (mobile)
      try {
        await navigator.share({
          title: post.title,
          text: shareText,
          url: shareUrl,
        })
      } catch (err: any) {
        // User cancelled or error occurred
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err)
        }
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl)
        alert('Link copied to clipboard!')
      } catch (err) {
        // Fallback: show share menu
        setShowShareMenu(!showShareMenu)
      }
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert('Link copied to clipboard!')
      setShowShareMenu(false)
    } catch (err) {
      console.error('Failed to copy:', err)
      alert('Failed to copy link. Please try again.')
    }
  }

  const handleToolFavorite = async (toolId: number) => {
    if (!user) {
      alert('Please log in to save favorites')
      return
    }
    
    try {
      const userEmail = user.email || user.username
      const result = await toggleFavorite(toolId, userEmail)
      // Update local state based on response
      setToolFavorites(prev => {
        const newSet = new Set(prev)
        if (result.is_favorite) {
          newSet.add(toolId)
        } else {
          newSet.delete(toolId)
        }
        return newSet
      })
    } catch (err: any) {
      console.error('Error toggling favorite:', err)
      // Handle different error types
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert('Please log in to save favorites')
      } else if (err.response?.status >= 500) {
        alert('Server error. Please try again later.')
      } else {
        alert('Failed to update favorite. Please try again.')
      }
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim() || submittingComment || !post) return

    if (!user) {
      alert('Please log in to add comments')
      return
    }

    try {
      setSubmittingComment(true)
      const userEmail = user.email || user.username
      const newComment = await addComment(post.id, commentText.trim(), userEmail)
      // Ensure the new comment has the correct structure
      const formattedComment: BlogComment = {
        ...newComment,
        author: newComment.author || newComment.user,
        body: newComment.body || newComment.content || commentText.trim()
      }
      setComments(prev => [formattedComment, ...prev])
      setCommentText('')
      if (post) {
        setPost({ ...post, comment_count: post.comment_count + 1 })
      }
    } catch (err: any) {
      console.error('Error adding comment:', err)
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert('Please log in to add comments')
      } else {
        alert('Failed to add comment. Please try again.')
      }
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    try {
      await deleteComment(commentId)
      setComments(prev => prev.filter(c => c.id !== commentId))
      if (post) {
        setPost({ ...post, comment_count: Math.max(0, post.comment_count - 1) })
      }
    } catch (err) {
      console.error('Error deleting comment:', err)
      alert('Failed to delete comment. Please try again.')
    }
  }

  const getImageUrl = (imagePath: string | null | undefined): string => {
    if (!imagePath) return ''
    if (imagePath.startsWith('http')) return imagePath
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    return `${baseURL}${imagePath}`
  }

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Close share menu when clicking outside
  useEffect(() => {
    if (!showShareMenu) return
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('[data-share-menu]')) {
        setShowShareMenu(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showShareMenu])

  const tools = (post?.tools_mentioned || []) as Tool[]

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
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Back Button */}
          <Link
            href="/blog"
            className="inline-flex items-center text-black dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 mb-6 sm:mb-8 group text-sm sm:text-base"
          >
            <ArrowLeftIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Blog
          </Link>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading post...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-8">
              <p className="text-red-800 dark:text-red-200">{error}</p>
              <Link
                href="/blog"
                className="mt-4 inline-block text-blue-600 dark:text-blue-400 hover:underline"
              >
                Return to Blog
              </Link>
            </div>
          )}

          {/* Blog Post Content - Three Column Layout */}
          {!loading && !error && post && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
              {/* Left Rail - Table of Contents */}
              <aside className="lg:col-span-2 hidden lg:block">
                <div ref={tocRef} className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
                  {toc.length > 0 && (
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-800">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 uppercase tracking-wide">
                        Table of Contents
                      </h3>
                      <nav className="space-y-1">
                        {toc.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => scrollToHeading(item.id)}
                            className={`block w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${
                              activeTocId === item.id
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                            style={{ paddingLeft: `${(item.level - 1) * 0.75 + 0.5}rem` }}
                          >
                            {item.text}
                          </button>
                        ))}
                      </nav>
                    </div>
                  )}
                </div>
              </aside>

              {/* Center - Article Content */}
              <article className="lg:col-span-7">
                {/* Cover Image - Outside Card */}
                {(post.cover_image || post.image) && (
                  <div className="mb-8 rounded-xl overflow-hidden">
                    <img
                      src={getImageUrl(post.cover_image || post.image)}
                      alt={post.title}
                      className="w-full h-64 sm:h-80 md:h-96 object-cover"
                    />
                  </div>
                )}

                {/* Title and Meta - Outside Card */}
                <div className="mb-6">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6">
                    {post.title}
                  </h1>

                  <div className="flex flex-wrap items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-6 space-x-4 sm:space-x-6">
                    <div className="flex items-center">
                      <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                      <span>{post.author?.username || post.author?.email || 'Unknown Author'}</span>
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                      <span>{new Date(post.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</span>
                    </div>
                  </div>

                  {/* Excerpt Paragraph - Outside Card, Not in Card */}
                  {post.excerpt && (
                    <div className="mb-8">
                      <p className="text-lg sm:text-xl md:text-2xl text-gray-700 dark:text-gray-300 leading-relaxed font-normal">
                        {post.excerpt}
                      </p>
                    </div>
                  )}

                  {/* Like, Comment, and Share - Outside Card */}
                  <div className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-6">
                    <button
                      onClick={handleLike}
                      disabled={liking}
                      className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors disabled:opacity-50"
                      title="Like this post"
                    >
                      {post.is_liked ? (
                        <HandThumbUpIconSolid className="h-5 w-5 text-blue-500" />
                      ) : (
                        <HandThumbUpIcon className="h-5 w-5" />
                      )}
                      <span className="font-medium">{post.like_count || 0}</span>
                    </button>
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <ChatBubbleLeftIcon className="h-5 w-5" />
                      <span className="font-medium">{post.comment_count || 0}</span>
                    </div>
                    <div className="relative" data-share-menu>
                      <button
                        onClick={handleShare}
                        className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400 transition-colors"
                        title="Share this post"
                      >
                        <ShareIcon className="h-5 w-5" />
                        <span className="font-medium">Share</span>
                      </button>
                      {showShareMenu && (
                        <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                          <div className="p-2">
                            <button
                              onClick={() => copyToClipboard(typeof window !== 'undefined' ? window.location.href : '')}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            >
                              Copy Link
                            </button>
                            <a
                              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                              onClick={() => setShowShareMenu(false)}
                            >
                              Share on Twitter
                            </a>
                            <a
                              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                              onClick={() => setShowShareMenu(false)}
                            >
                              Share on Facebook
                            </a>
                            <a
                              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                              onClick={() => setShowShareMenu(false)}
                            >
                              Share on LinkedIn
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Article Content - In Card */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden mb-8">
                  <div className="p-6 sm:p-8 md:p-10">

                    {/* Article Content - Large Font */}
                    <div 
                      ref={contentRef}
                      className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
                      style={{ fontSize: '18px', lineHeight: '1.8' }}
                    >
                      {post.content.split('\n').map((line, index) => {
                        // Check if line looks like a heading
                        if (line.match(/^#{1,6}\s/)) {
                          const match = line.match(/^(#{1,6})\s(.+)$/)
                          if (match) {
                            const level = match[1].length
                            const text = match[2]
                            const id = `heading-${index}-${text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`
                            const HeadingTag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
                            const HeadingComponent = HeadingTag
                            return (
                              <HeadingComponent key={`heading-${index}-${id}`} id={id} className="font-bold mt-8 mb-4 text-gray-900 dark:text-gray-100">
                                {text}
                              </HeadingComponent>
                            )
                          }
                        }
                        // Regular paragraph
                        if (line.trim()) {
                          return <p key={`paragraph-${index}`} className="mb-4">{line}</p>
                        }
                        // Return null for empty lines - React will skip rendering null values
                        return null
                      }).filter((element) => element !== null)}
                    </div>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 sm:p-8 md:p-10 mt-8">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6">
                    Comments ({comments.length})
                  </h2>

                  {/* Comment Form */}
                  {user ? (
                    <form onSubmit={handleSubmitComment} className="mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-gray-200 dark:border-gray-700">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Write a comment..."
                        rows={4}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                        required
                      />
                      <button
                        type="submit"
                        disabled={submittingComment || !commentText.trim()}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submittingComment ? 'Posting...' : 'Post Comment'}
                      </button>
                    </form>
                  ) : (
                    <div className="mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">
                        Please <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">sign in</Link> to leave a comment.
                      </p>
                    </div>
                  )}

                  {/* Comments List */}
                  <div className="space-y-6">
                    {comments.length > 0 ? (
                      comments
                        .filter(comment => comment.active !== false) // Filter out inactive comments
                        .map((comment) => {
                          // Safely handle missing author data - backend uses 'author' field
                          const commentAuthor = comment.author || comment.user || null;
                          const username = commentAuthor?.username || commentAuthor?.email?.split('@')[0] || 'Anonymous';
                          const userId = commentAuthor?.id || null;
                          const commentBody = comment.body || comment.content || '';
                          
                          // Silently handle missing author data - don't log warnings in production
                          // The UI will display "Anonymous" for comments without author data
                          
                          return (
                            <div key={comment.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0 last:pb-0">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center space-x-3">
                                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                    <span className="text-blue-600 dark:text-blue-400 font-semibold">
                                      {username.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                      {username}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                      {new Date(comment.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </p>
                                  </div>
                                </div>
                                {user && userId && user.id === userId && (
                                  <button
                                    onClick={() => handleDeleteComment(comment.id)}
                                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                              <p className="text-gray-700 dark:text-gray-300 ml-13 whitespace-pre-line">
                                {commentBody}
                              </p>
                              {/* Render replies if any */}
                              {comment.replies && Array.isArray(comment.replies) && comment.replies.length > 0 && (
                                <div key={`replies-${comment.id}`} className="mt-4 ml-8 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                                  {comment.replies
                                    .filter(reply => reply.active !== false)
                                    .map((reply) => {
                                      const replyAuthor = reply.author || reply.user || null;
                                      const replyUsername = replyAuthor?.username || replyAuthor?.email?.split('@')[0] || 'Anonymous';
                                      const replyBody = reply.body || reply.content || '';
                                      
                                      return (
                                        <div key={`reply-${reply.id}`} className="mb-4 last:mb-0">
                                          <div className="flex items-center space-x-2 mb-1">
                                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                              {replyUsername}
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                              {new Date(reply.created_at).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                              })}
                                            </span>
                                          </div>
                                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                            {replyBody}
                                          </p>
                                        </div>
                                      );
                                    })}
                                </div>
                              )}
                            </div>
                          );
                        })
                    ) : (
                      <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                        No comments yet. Be the first to comment!
                      </p>
                    )}
                  </div>
                </div>
              </article>

              {/* Right Rail - Tools Mentioned */}
              {tools.length > 0 && (
                <aside className="lg:col-span-3">
                  <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-800">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 uppercase tracking-wide">
                        Tools Mentioned
                      </h3>
                      <div className="space-y-4">
                        {tools.map((tool) => (
                          <div
                            key={tool.id}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            {tool.image && (
                              <div className="w-full h-32 mb-3 rounded overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                <img
                                  src={getImageUrl(tool.image)}
                                  alt={tool.name}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            )}
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 text-sm">
                              {tool.name}
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                              {tool.description}
                            </p>
                            <div className="flex items-center gap-2">
                              {tool.link && (
                                <a
                                  href={tool.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                                >
                                  <span>Visit</span>
                                  <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                                </a>
                              )}
                              <button
                                onClick={() => handleToolFavorite(tool.id)}
                                className={`p-1.5 rounded transition-colors ${
                                  toolFavorites.has(tool.id)
                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                                title="Save to favorites"
                              >
                                {toolFavorites.has(tool.id) ? (
                                  <BookmarkIconSolid className="h-4 w-4" />
                                ) : (
                                  <BookmarkIcon className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </aside>
              )}
            </div>
          )}
        </div>
        <Newsletter />
        <SubmitToolButton />
        <Footer />
      </main>
    </div>
  )
}
