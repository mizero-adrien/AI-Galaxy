'use client'

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeftIcon, ArrowTopRightOnSquareIcon, StarIcon, BookmarkIcon } from "@heroicons/react/24/outline"
import { StarIcon as StarIconSolid, BookmarkIcon as BookmarkIconSolid } from "@heroicons/react/24/solid"
import Navbar from '../../../Components/Navbar'
import Footer from '../../../Components/Footer'
import Sidebar from '../../../Components/Sidebar'
import Newsletter from '../../../Components/Newsletter'
import SubmitToolButton from '../../../Components/SubmitToolButton'
import { apiClient } from "../../../utils/apiClient"
import { toggleFavorite, checkIfFavorite } from "../../../api/favorites.api"
import { createRating, updateRating, getToolRatings, type ToolRating as ToolRatingType } from "../../../api/tool-ratings.api"
import { storage } from "../../../utils/storage"

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
  image?: string
  category: Category
  is_premium: boolean
  is_free: boolean
  link?: string
  created_at: string
  features?: string[]
  how_it_works?: string
  models?: ToolModel[]
  average_rating?: number
  user_rating?: {
    rating: number
    review?: string
    id: number
  } | null
}

interface ToolModel {
  id: number
  name: string
  description?: string
}

export default function ToolDetailPage() {
  const params = useParams()
  const router = useRouter()
  const toolId = params.id as string
  const [tool, setTool] = useState<Tool | null>(null)
  const [models, setModels] = useState<ToolModel[]>([])
  const [features, setFeatures] = useState<string[]>([])
  const [howItWorks, setHowItWorks] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
  const [sidebarWidth, setSidebarWidth] = useState<number>(192)
  const [isFavorite, setIsFavorite] = useState<boolean>(false)
  const [favoriteLoading, setFavoriteLoading] = useState<boolean>(false)
  const [rating, setRating] = useState<number>(0)
  const [review, setReview] = useState<string>("")
  const [ratingLoading, setRatingLoading] = useState<boolean>(false)
  const [userRatingId, setUserRatingId] = useState<number | null>(null)
  const [hoveredStar, setHoveredStar] = useState<number>(0)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

  const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

  useEffect(() => {
    const checkAuth = async () => {
      const token = await storage.getItem('token')
      setIsAuthenticated(!!token)
    }
    checkAuth()
  }, [])

  useEffect(() => {
    const fetchTool = async () => {
      if (!toolId) return
      try {
        setLoading(true)
        setError(null)
        const response = await apiClient.get<Tool>(`/api/ai-tools/${toolId}/`)
        const toolData = response.data
        setTool(toolData)

        // Set features from backend
        if (toolData.features && Array.isArray(toolData.features) && toolData.features.length > 0) {
          setFeatures(toolData.features)
        } else {
          setFeatures([])
        }

        // Set how it works from backend
        if (toolData.how_it_works) {
          setHowItWorks(toolData.how_it_works)
        } else {
          setHowItWorks("")
        }

        // Set models from backend
        if (toolData.models && Array.isArray(toolData.models)) {
          setModels(toolData.models)
        } else {
          setModels([])
        }

        // Set user rating if exists
        if (toolData.user_rating) {
          setRating(toolData.user_rating.rating)
          setReview(toolData.user_rating.review || "")
          setUserRatingId(toolData.user_rating.id)
        } else {
          setRating(0)
          setReview("")
          setUserRatingId(null)
        }

        // Check favorite status
        if (isAuthenticated) {
          try {
            const favoriteStatus = await checkIfFavorite(parseInt(toolId))
            setIsFavorite(favoriteStatus)
          } catch (err) {
            console.error("Error checking favorite:", err)
          }
        }
      } catch (err) {
        console.error("Failed to load tool", err)
        setError("We couldn't load this tool. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchTool()
  }, [toolId, isAuthenticated])

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
      
      if (savedOpen === 'true') {
        setSidebarOpen(true);
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

  const getImageUrl = (imagePath?: string | null) => {
    if (!imagePath) return "/logo.png"
    if (imagePath.startsWith("http")) return imagePath
    return `${baseURL}${imagePath}`
  }

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      alert("Please log in to add tools to your favorites")
      return
    }

    if (!tool) return

    setFavoriteLoading(true)
    try {
      const userEmail = user?.email || user?.username
      const result = await toggleFavorite(tool.id, userEmail)
      setIsFavorite(result.is_favorite)
    } catch (err: any) {
      console.error("Error toggling favorite:", err)
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert("Please log in to add tools to your favorites")
      } else {
        alert("Failed to update favorite. Please try again.")
      }
    } finally {
      setFavoriteLoading(false)
    }
  }

  const handleRatingSubmit = async () => {
    if (!isAuthenticated) {
      alert("Please log in to rate tools")
      return
    }

    if (!tool || rating === 0) {
      alert("Please select a rating")
      return
    }

    setRatingLoading(true)
    try {
      if (userRatingId) {
        // Update existing rating
        await updateRating(userRatingId, { rating, review })
      } else {
        // Create new rating
        const newRating = await createRating({
          tool: tool.id,
          rating,
          review: review || undefined
        })
        setUserRatingId(newRating.id)
      }
      
      // Refresh tool data
      const response = await apiClient.get<Tool>(`/api/ai-tools/${toolId}/`)
      setTool(response.data)
      alert("Rating saved successfully!")
    } catch (err: any) {
      console.error("Error submitting rating:", err)
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert("Please log in to rate tools")
      } else {
        alert("Failed to save rating. Please try again.")
      }
    } finally {
      setRatingLoading(false)
    }
  }

  if (loading) {
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
          <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
            <p className="text-gray-500 dark:text-gray-400">Loading tool...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error || !tool) {
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
          <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 px-4">
            <p className="text-red-500 mb-4">{error || "Tool not found."}</p>
            <Link href="/tools" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              Back to all tools
            </Link>
          </div>
        </main>
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300 pt-8 sm:pt-12 pb-16 px-4 sm:px-6 md:px-8 lg:px-16">
          <div className="max-w-6xl mx-auto space-y-8 sm:space-y-10">
            {/* Back Button */}
            <Link
              href="/tools"
              className="inline-flex items-center text-black dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 mb-4 group text-sm sm:text-base"
            >
              <ArrowLeftIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to all tools
            </Link>

            {/* Tool Header */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl sm:rounded-3xl shadow-sm p-6 sm:p-8 md:p-10">
              <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-8">
                {/* Tool Image */}
                <div className="flex-shrink-0">
                  <img
                    src={getImageUrl(tool.image)}
                    alt={tool.name}
                    className="h-32 w-32 sm:h-40 sm:w-40 md:h-48 md:w-48 object-contain rounded-xl bg-gray-50 dark:bg-gray-800 p-4"
                  />
                </div>

                {/* Tool Info */}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                    <div>
                      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-black dark:text-gray-100 mb-2">
                        {tool.name}
                      </h1>
                      {tool.category && (
                        <Link
                          href={`/categories/${tool.category.slug}`}
                          className="inline-block text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-gray-200"
                        >
                          {tool.category.name}
                        </Link>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tool.is_premium && (
                        <span className="inline-block text-xs font-semibold text-white bg-yellow-500 rounded-full px-3 py-1">
                          Premium
                        </span>
                      )}
                      {tool.is_free && (
                        <span className="inline-block text-xs font-semibold text-white bg-green-500 rounded-full px-3 py-1">
                          Free
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                    {tool.description}
                  </p>

                  {/* Rating Display */}
                  {tool.average_rating && (
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIconSolid
                            key={star}
                            className={`h-5 w-5 ${
                              star <= Math.round(tool.average_rating!)
                                ? "text-yellow-400"
                                : "text-gray-300 dark:text-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {tool.average_rating.toFixed(1)} rating{tool.average_rating !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    {tool.link && (
                      <a
                        href={tool.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-black dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors font-medium"
                      >
                        Visit Website
                        <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                      </a>
                    )}
                    <button
                      onClick={handleToggleFavorite}
                      disabled={favoriteLoading}
                      className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg transition-colors font-medium ${
                        isFavorite
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isFavorite ? (
                        <>
                          <BookmarkIconSolid className="h-5 w-5" />
                          Remove from Favorites
                        </>
                      ) : (
                        <>
                          <BookmarkIcon className="h-5 w-5" />
                          Add to Favorites
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Models Section */}
            <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl sm:rounded-3xl shadow-sm p-6 sm:p-8 md:p-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Available Models
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {models.map((model) => (
                  <div
                    key={model.id}
                    className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                  >
                    <h3 className="text-lg font-semibold text-black dark:text-gray-200 mb-2">
                      {model.name}
                    </h3>
                    {model.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {model.description}
                      </p>
                    )}
                  </div>
                ))}
                {/* Add Model Button */}
                <button
                  className="bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-4 sm:p-6 flex flex-col items-center justify-center gap-2 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                  onClick={() => alert("Add model functionality coming soon!")}
                >
                  <span className="text-2xl">+</span>
                  <span className="text-sm font-medium">Add Another Model</span>
                </button>
              </div>
            </section>

            {/* How It Works Section */}
            {howItWorks && (
              <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl sm:rounded-3xl shadow-sm p-6 sm:p-8 md:p-10">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                  How It Works
                </h2>
                <div className="prose prose-indigo dark:prose-invert max-w-none">
                  <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {howItWorks}
                  </p>
                </div>
              </section>
            )}

            {/* Features Section */}
            {features.length > 0 && (
              <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl sm:rounded-3xl shadow-sm p-6 sm:p-8 md:p-10">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                  Features
                </h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-gray-700 dark:text-gray-300"
                    >
                      <span className="text-black dark:text-gray-400 mt-1">✓</span>
                      <span className="text-base sm:text-lg">{feature}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Rating Section */}
            {isAuthenticated && (
              <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl sm:rounded-3xl shadow-sm p-6 sm:p-8 md:p-10">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                  Rate This Tool
                </h2>
                <div className="space-y-4">
                  {/* Star Rating */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Your Rating:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoveredStar(star)}
                          onMouseLeave={() => setHoveredStar(0)}
                          className="focus:outline-none"
                        >
                          {(hoveredStar >= star || rating >= star) ? (
                            <StarIconSolid className="h-8 w-8 text-yellow-400" />
                          ) : (
                            <StarIcon className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                          )}
                        </button>
                      ))}
                    </div>
                    {rating > 0 && (
                      <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                        {rating} star{rating !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {/* Review Text */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Your Review (Optional)
                    </label>
                    <textarea
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      placeholder="Share your experience with this tool..."
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={4}
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleRatingSubmit}
                    disabled={ratingLoading || rating === 0}
                    className="px-6 py-3 bg-black dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {ratingLoading ? "Saving..." : userRatingId ? "Update Rating" : "Submit Rating"}
                  </button>
                </div>
              </section>
            )}
          </div>
        </div>
        
        <Newsletter />
        <SubmitToolButton />
        <Footer />
      </main>
    </div>
  )
}


