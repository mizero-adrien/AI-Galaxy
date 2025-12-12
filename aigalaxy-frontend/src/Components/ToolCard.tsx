'use client'

import React, { useState, useEffect, memo } from 'react'
import { BookmarkIcon } from '@heroicons/react/24/outline'
import { BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid'
import { toggleFavorite, checkIfFavorite } from '../api/favorites.api'

interface Tool {
  id: number
  name: string
  description: string
  image?: string
  is_premium: boolean
  link?: string
}

interface ToolCardProps {
  tool: Tool
  showFavorite?: boolean
  onFavoriteChange?: (toolId: number, isFavorite: boolean) => void
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, showFavorite = true, onFavoriteChange }) => {
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  // Check if user is logged in (async)
  useEffect(() => {
    const loadUser = async () => {
      if (typeof window !== 'undefined') {
        const storageModule = await import('../utils/storage')
        const storedUser = await storageModule.storage.getUser()
        if (storedUser) {
          setUser(storedUser)
        }
      }
    }
    loadUser()
  }, [])

  // Check if tool is favorited
  useEffect(() => {
    if (user && showFavorite) {
      checkIfFavorite(tool.id).then(setIsFavorite)
    }
  }, [tool.id, user, showFavorite])

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return '/vite.svg'
    if (imagePath.startsWith('http')) return imagePath
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    return `${baseURL}${imagePath}`
  }

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) {
      alert('Please log in to add favorites')
      return
    }

    setIsLoading(true)
    try {
      const userEmail = user?.email || user?.username
      const result = await toggleFavorite(tool.id, userEmail)
      setIsFavorite(result.is_favorite)
      onFavoriteChange?.(tool.id, result.is_favorite)
    } catch (error) {
      console.error('Error toggling favorite:', error)
      alert('Failed to update favorite. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCardClick = () => {
    // Navigate to tool detail page
    window.location.href = `/tools/${tool.id}`
  }

  return (
    <div
      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition transform hover:-translate-y-1 duration-300 flex flex-col gap-4 relative cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Favorite Button */}
      {showFavorite && user && (
        <button
          onClick={handleFavoriteClick}
          disabled={isLoading}
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-10"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFavorite ? (
            <BookmarkIconSolid className="h-5 w-5 text-blue-500" />
          ) : (
            <BookmarkIcon className="h-5 w-5 text-gray-400 hover:text-blue-500" />
          )}
        </button>
      )}

      {/* Tool Image */}
      <div className="flex items-center justify-center">
        <img
          src={getImageUrl(tool.image)}
          alt={tool.name}
          className="h-20 w-20 object-contain"
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* Tool Name */}
      <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 text-center">
        {tool.name}
      </h3>

      {/* Tool Description */}
      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-4 text-center flex-grow">
        {tool.description || 'No description provided.'}
      </p>

      {/* Premium Badge */}
      {tool.is_premium && (
        <span className="inline-block text-xs font-semibold text-white bg-yellow-500 rounded-full px-2 py-1 text-center mt-2">
          Premium
        </span>
      )}

      {/* External Link Indicator */}
      {tool.link && (
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
          Click to visit website
        </div>
      )}
    </div>
  )
}

export default memo(ToolCard)





