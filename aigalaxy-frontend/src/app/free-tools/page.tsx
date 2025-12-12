'use client'

import { useEffect, useState } from "react"
import { apiClient } from "../../utils/apiClient"
import Navbar from '../../Components/Navbar'
import Footer from '../../Components/Footer'
import Sidebar from '../../Components/Sidebar'
import ToolCard from '../../Components/ToolCard'
import Newsletter from '../../Components/Newsletter'
import SubmitToolButton from '../../Components/SubmitToolButton'

interface Tool {
  id: number
  name: string
  description: string
  image?: string
  is_premium: boolean
  is_free: boolean
  affiliate?: boolean
  link?: string
}

export default function FreeToolsPage() {
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
  const [sidebarWidth, setSidebarWidth] = useState<number>(192)

  const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

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

  const getImageUrl = (imagePath: string | null | undefined) => {
    if (!imagePath) return "/fallback.png"
    if (imagePath.startsWith("http")) return imagePath
    return `${baseURL}${imagePath}`
  }

  useEffect(() => {
    const fetchFreeTools = async () => {
      try {
        setLoading(true)
        // Fetch free tools using the free_tools endpoint
        const response = await apiClient.get('/api/ai-tools/free_tools/')
        const toolsData = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data.results)
          ? response.data.results
          : []
        
        // Filter to ensure only free tools (is_free = true)
        const freeTools = toolsData.filter((tool: Tool) => tool.is_free === true)
        setTools(freeTools)
      } catch (err) {
        console.error(err)
        setError("Failed to load free AI tools. Please try again later.")
      } finally {
        setLoading(false)
      }
    }
    fetchFreeTools()
  }, [])

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
          <div className="flex items-center justify-center min-h-[60vh]">
            <p className="text-gray-600 dark:text-gray-400">Loading free AI tools...</p>
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
          <div className="flex items-center justify-center min-h-[60vh]">
            <p className="text-red-500 dark:text-red-400">{error}</p>
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300 pt-20 pb-16 px-4 sm:px-8 lg:px-16">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-4 text-center text-gray-900 dark:text-white">
              Free AI Tools
            </h1>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-10 text-base sm:text-lg">
              Discover amazing free AI tools to enhance your workflow
            </p>

            {tools.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-20">
                <p className="text-lg mb-2">No free AI tools available at the moment.</p>
                <p className="text-sm">Check back later for new free tools!</p>
              </div>
            ) : (
              <>
                <div className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                  Showing {tools.length} free AI tool{tools.length !== 1 ? 's' : ''}
                </div>
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {tools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} showFavorite={false} />
                  ))}
                </div>
              </>
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
