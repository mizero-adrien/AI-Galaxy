'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { CalendarIcon, HandThumbUpIcon } from '@heroicons/react/24/outline'
import { getPopularBlogPosts, type BlogPostList } from '../api/blog.api'
import { apiClient } from '../utils/apiClient'

interface Category {
  id: number
  name: string
  slug: string
  description?: string
  is_popular?: boolean
}

interface BlogSidebarProps {
  className?: string
}

const BlogSidebar: React.FC<BlogSidebarProps> = ({ className = '' }) => {
  const [categories, setCategories] = useState<Category[]>([])
  const [popularPosts, setPopularPosts] = useState<BlogPostList[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [loadingPosts, setLoadingPosts] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get<Category[]>('/api/categories/popular/')
        setCategories(Array.isArray(response.data) ? response.data : [])
      } catch (err) {
        console.error('Error fetching categories:', err)
        setCategories([])
      } finally {
        setLoadingCategories(false)
      }
    }

    const fetchPopularPosts = async () => {
      try {
        const posts = await getPopularBlogPosts(5)
        setPopularPosts(posts)
      } catch (err) {
        console.error('Error fetching popular posts:', err)
        setPopularPosts([])
      } finally {
        setLoadingPosts(false)
      }
    }

    fetchCategories()
    fetchPopularPosts()
  }, [])

  const getImageUrl = (imagePath: string | null | undefined): string => {
    if (!imagePath) return ''
    if (imagePath.startsWith('http')) return imagePath
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    return `${baseURL}${imagePath}`
  }

  return (
    <aside className={`space-y-8 ${className}`}>
      {/* Categories Section */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
          Categories
        </h2>
        {loadingCategories ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            ))}
          </div>
        ) : categories.length > 0 ? (
          <ul className="space-y-2">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/categories/${category.slug}`}
                  className="block px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm">No categories available</p>
        )}
      </div>

      {/* Popular Posts Section */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
          Popular Posts
        </h2>
        {loadingPosts ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : popularPosts.length > 0 ? (
          <div className="space-y-4">
            {popularPosts.map((post) => {
              const imageUrl = getImageUrl(post.cover_image || post.image)
              return (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug || post.id}`}
                  className="block group hover:opacity-90 transition-opacity"
                >
                  <article className="flex gap-3">
                    {imageUrl && (
                      <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          <span>
                            {new Date(post.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <HandThumbUpIcon className="h-3 w-3" />
                          <span>{post.like_count || 0}</span>
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              )
            })}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm">No popular posts available</p>
        )}
      </div>
    </aside>
  )
}

export default BlogSidebar

