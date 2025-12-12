'use client'

import { useEffect, useMemo, useState } from "react"
import axios from "axios"
import Link from "next/link"
import Navbar from '../../Components/Navbar'
import Footer from '../../Components/Footer'
import Sidebar from '../../Components/Sidebar'
import Newsletter from '../../Components/Newsletter'
import SubmitToolButton from '../../Components/SubmitToolButton'

interface Category {
  id: number
  name: string
  slug: string
  description?: string
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
  const [sidebarWidth, setSidebarWidth] = useState<number>(192)

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
    const fetchCategories = async () => {
      try {
        setLoading(true)
        setError(null)
        const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        const response = await axios.get(`${baseURL}/api/categories/`)
        // Handle paginated response (DRF returns {results: [...]}) or direct array
        const categoriesData = Array.isArray(response.data) 
          ? response.data 
          : (response.data?.results || [])
        setCategories(categoriesData)
      } catch (err) {
        console.error("Failed to load categories", err)
        setError("Unable to load categories right now. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const filteredCategories = useMemo(() => {
    return categories.filter((category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    )
  }, [categories, searchTerm])

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
          <div className="max-w-6xl mx-auto">
            <div className="mb-6 sm:mb-8 md:mb-10 text-center">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold">
                Browse All Categories
              </h1>
              <p className="mt-2 sm:mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-400 px-4">
                Explore AI tools grouped by what they do. Select a category to see all matching tools.
              </p>
            </div>

            <div className="max-w-xl mx-auto mb-6 sm:mb-8">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  // Search is already filtering in real-time, but we can scroll to results
                  if (searchTerm.trim() && filteredCategories.length > 0) {
                    const categoriesGrid = document.querySelector('.grid')
                    if (categoriesGrid) {
                      categoriesGrid.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                  }
                }}
              >
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      // Search is already filtering in real-time, but we can scroll to results
                      if (searchTerm.trim() && filteredCategories.length > 0) {
                        const categoriesGrid = document.querySelector('.grid')
                        if (categoriesGrid) {
                          categoriesGrid.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        }
                      }
                    }
                  }}
                  placeholder="Search categories..."
                  className="w-full px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm sm:text-base"
                />
              </form>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <p className="text-gray-500 dark:text-gray-400">Loading categories...</p>
              </div>
            ) : error ? (
              <div className="flex justify-center py-12">
                <p className="text-red-500">{error}</p>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="flex justify-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No categories match your search.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:gap-5 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCategories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-lg transition-shadow duration-300"
                  >
                    <h2 className="text-lg sm:text-xl font-semibold text-indigo-600 dark:text-indigo-400 group-hover:underline">
                      {category.name}
                    </h2>
                    {category.description && (
                      <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                        {category.description}
                      </p>
                    )}
                    <span className="mt-3 sm:mt-4 inline-flex items-center text-xs sm:text-sm text-indigo-600 dark:text-indigo-400">
                      View tools
                      <svg
                        className="ml-2 h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-300 group-hover:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </Link>
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


