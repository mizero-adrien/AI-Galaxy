'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { fetchUserProfile, ProfileResponse } from "@/api/user.api"
import Navbar from '../../Components/Navbar'
import Footer from '../../Components/Footer'
import Sidebar from '../../Components/Sidebar'
import Newsletter from '../../Components/Newsletter'
import SubmitToolButton from '../../Components/SubmitToolButton'

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null)
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
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.push("/")
      return
    }

    const loadProfile = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchUserProfile()
        if (!data || !data.id) {
          // User is not authenticated with Django backend (Firebase-only user)
          setError("Your account is not fully set up. Please log in again to sync your account with the backend.")
          setLoading(false)
          return;
        }
        if (data) {
          setProfile(data)
        } else {
          setError("Profile data is empty. Please try logging in again.")
        }
      } catch (err: any) {
        console.error("Failed to load profile", err)
        // Handle different error types
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          setError("Your session has expired. Please log in again.")
          // Clear invalid user data
          localStorage.removeItem("user")
          setTimeout(() => router.push("/"), 2000)
        } else if (err?.response?.status === 404) {
          setError("Profile not found. Please contact support.")
        } else if (err?.response?.data?.message) {
          setError(err.response.data.message)
        } else if (err?.message) {
          setError(err.message)
        } else {
          setError("Unable to load your profile. Please check your connection and try again.")
        }
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [router])

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
            <p className="text-gray-500 dark:text-gray-400">Loading your profile...</p>
          </div>
        </main>
      </div>
    )
  }

  // Only show error state if there's an actual error (not just loading state)
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

  // If no profile after loading, show a fallback (shouldn't happen if API works correctly)
  if (!profile) {
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
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 max-w-md w-full text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">No profile data available.</p>
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300 pt-8 sm:pt-12 md:pt-16 lg:pt-20 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl sm:rounded-3xl shadow-sm px-4 sm:px-6 md:px-10 py-6 sm:py-8 md:py-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-6">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                    Welcome back, {profile.username}
                  </h1>
                  <p className="mt-2 sm:mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    Manage your account details and preferences.
                  </p>
                </div>
                <div className="flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 text-xl sm:text-2xl font-semibold flex-shrink-0">
                  {profile.username.slice(0, 2).toUpperCase()}
                </div>
              </div>

              <div className="mt-8 sm:mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700">
                  <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Account
                  </h2>
                  <dl className="mt-4 space-y-3">
                    <div>
                      <dt className="text-xs uppercase text-gray-400 dark:text-gray-500">Name</dt>
                      <dd className="text-base font-medium">{profile.username}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase text-gray-400 dark:text-gray-500">Email</dt>
                      <dd className="text-base font-medium wrap-break-word">{profile.email}</dd>
                    </div>
                  </dl>
                </div>

                <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700">
                  <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Quick Actions
                  </h2>
                  <div className="mt-4 space-y-4">
                    <Link
                      href="/subscriptions"
                      className="block w-full text-center px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-colors"
                    >
                      Manage subscription
                    </Link>
                    <button
                      type="button"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => router.push("/")}
                    >
                      Explore tools
                    </button>
                  </div>
                </div>
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


