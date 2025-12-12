'use client'

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { apiClient } from "../../../utils/apiClient"
import Navbar from '../../../Components/Navbar'
import Footer from '../../../Components/Footer'
import Sidebar from '../../../Components/Sidebar'
import ToolCard from '../../../Components/ToolCard'
import Newsletter from '../../../Components/Newsletter'
import SubmitToolButton from '../../../Components/SubmitToolButton'

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
  is_premium: boolean
  link?: string
}

export default function CategoryDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [category, setCategory] = useState<Category | null>(null)
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

  const getImageUrl = (imagePath: string | null | undefined): string => {
    if (!imagePath) return "/fallback.png"
    if (imagePath.startsWith("http")) return imagePath
    return `${baseURL}${imagePath}`
  }

  useEffect(() => {
    const fetchCategory = async () => {
      if (!slug) return
      try {
        setLoading(true)
        setError(null)

        const [categoryResponse, toolsResponse] = await Promise.all([
          apiClient.get(`/api/categories/${slug}/`),
          apiClient.get(`/api/categories/${slug}/tools/`, { params: { page_size: 50 } }),
        ])

        setCategory(categoryResponse.data)

        const toolsData = Array.isArray(toolsResponse.data)
          ? toolsResponse.data
          : Array.isArray(toolsResponse.data.results)
            ? toolsResponse.data.results
            : []

        setTools(toolsData)
      } catch (err) {
        console.error("Failed to load category", err)
        setError("We couldn't load this category. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchCategory()
  }, [slug, baseURL])

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
            <p className="text-gray-500 dark:text-gray-400">Loading category...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error || !category) {
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
            <p className="text-red-500 mb-4">{error || "Category not found."}</p>
            <Link href="/categories" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              Back to categories
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300 pt-20 pb-16 px-4 sm:px-8 lg:px-16">
          <div className="max-w-6xl mx-auto space-y-10">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm p-8 md:p-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                    {category.name}
                  </h1>
                  {category.description && (
                    <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-2xl">
                      {category.description}
                    </p>
                  )}
                </div>
                <Link
                  href="/categories"
                  className="inline-flex items-center text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  ← All categories
                </Link>
              </div>
            </div>

            <section>
              <h2 className="text-2xl font-semibold mb-6">Tools in this category</h2>
              {tools.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-center text-gray-600 dark:text-gray-400">
                  No tools listed yet. Check back soon!
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {tools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
        <Newsletter />
        <SubmitToolButton />
        <Footer />
      </main>
    </div>
  )
}


