'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getUserFavorites, FavoriteResponse } from "@/api/favorites.api"
import Navbar from '../../Components/Navbar'
import Footer from '../../Components/Footer'
import Sidebar from '../../Components/Sidebar'
import ToolCard from '../../Components/ToolCard'
import Newsletter from '../../Components/Newsletter'
import SubmitToolButton from '../../Components/SubmitToolButton'

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
  const [sidebarWidth, setSidebarWidth] = useState<number>(192)
  const router = useRouter()

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
      
      if (savedOpen === 'true') {
        setSidebarOpen(true);
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
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.push("/")
      return
    }

    const loadFavorites = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getUserFavorites()
        setFavorites(data)
      } catch (err: any) {
        console.error("Failed to load favorites", err)
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          setError("Your session has expired. Please log in again.")
          localStorage.removeItem("user")
          setTimeout(() => router.push("/"), 2000)
        } else {
          setError("Unable to load your favorites. Please try again.")
        }
      } finally {
        setLoading(false)
      }
    }

    loadFavorites()
  }, [router])


  const handleFavoriteChange = (toolId: number, isFavorite: boolean) => {
    if (!isFavorite) {
      // Remove from favorites list
      setFavorites(prev => prev.filter(fav => fav.tool.id !== toolId))
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
            <p className="text-gray-500 dark:text-gray-400">Loading your favorites...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
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
            <div className="bg-white dark:bg-gray-900 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md w-full text-center">
              <p className="text-red-500 dark:text-red-400 mb-4 font-medium">{error}</p>
              <Link
                href="/"
                className="inline-block px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
              >
                Go back home
              </Link>
            </div>
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300 pt-20 pb-16 px-4 sm:px-6 md:px-8 lg:px-16">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-6 sm:mb-8 md:mb-10">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3 sm:mb-4">
                My Favorite AI Tools
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 px-4">
                Manage your favorite AI tools and access them quickly
              </p>
            </div>

            {favorites.length === 0 ? (
              <div className="text-center py-12 sm:py-16 md:py-20">
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-md mx-auto">
                  <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-gray-100">
                    No favorites yet
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
                    Start exploring AI tools and add them to your favorites by clicking the bookmark icon.
                  </p>
                  <Link
                    href="/tools"
                    className="inline-block px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors font-medium text-sm sm:text-base"
                  >
                    Explore AI Tools
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:gap-5 md:gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {favorites.map((favorite) => (
                  <ToolCard 
                    key={favorite.id} 
                    tool={favorite.tool} 
                    onFavoriteChange={handleFavoriteChange}
                  />
                ))}
              </div>
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





