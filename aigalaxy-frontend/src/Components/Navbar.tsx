'use client'

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  SunIcon,
  MoonIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { useDarkMode } from "../contexts/DarkModeContext";
import SignUpModal from "./Auth/SignUpModal";
import LoginModal from "./Auth/LoginModal";
import { SubmitToolModal } from "./SubmitToolButton";

interface NavbarProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, sidebarOpen }) => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [user, setUser] = useState<any>(null);
  const [profileOpen, setProfileOpen] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesOpen, setCategoriesOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const [isSignUpOpen, setIsSignUpOpen] = useState<boolean>(false);
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [isSubmitToolOpen, setIsSubmitToolOpen] = useState<boolean>(false);

  // Prevent hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Load user from localStorage (async)
  useEffect(() => {
    const loadUser = async () => {
      if (typeof window !== "undefined") {
        const storedUser = await import('../utils/storage').then(m => m.storage.getUser())
        if (storedUser) setUser(storedUser)
      }
    }
    loadUser()
  }, []);

  // Fetch categories (with caching)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const cacheKey = `categories-${baseURL}`
        
        // Check cache first
        const cacheModule = await import('../utils/apiCache')
        const cached = cacheModule.getCachedData(cacheKey)
        if (cached) {
          setCategories(cached)
          return
        }
        
        // Use apiClient instead of fetch for better error handling
        const { apiClient } = await import('../utils/apiClient')
        const response = await apiClient.get('/api/categories/', {
          params: { page_size: 50 },
          timeout: 30000 // 30 second timeout
        })
        
        const categoriesData = Array.isArray(response.data) 
          ? response.data 
          : (response.data?.results || [])
        
        // Cache the result
        cacheModule.setCachedData(cacheKey, categoriesData)
        setCategories(categoriesData)
      } catch (err: any) {
        console.error("Unable to load categories", err)
        if (err.code === 'ECONNREFUSED' || err.message?.includes('timeout')) {
          console.error('Backend server may not be running on', process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000")
        }
        setCategories([])
      }
    }
    fetchCategories()
  }, [])

  // Logout (async)
  const handleLogout = async () => {
    try {
      // Sign out from Firebase
      const { signOutUser } = await import('../utils/firebaseAuth')
      await signOutUser()
    } catch (error) {
      console.error('Firebase sign out error:', error)
    }
    
    // Clear local storage
    const storageModule = await import('../utils/storage')
    await storageModule.storage.removeUser()
    await storageModule.storage.removeItem('firebase_token')
    setUser(null)
    setProfileOpen(false)
  }


  // After login/signup success (async)
  const handleAuthSuccess = async (newUser: any) => {
    setUser(newUser)
    const storageModule = await import('../utils/storage')
    await storageModule.storage.setUser(newUser)
    setIsSignUpOpen(false)
    setIsLoginOpen(false)
  }

  if (!mounted) return null; // prevent SSR mismatch

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 bg-gray-50 dark:bg-gray-800 shadow-md dark:text-gray-50 text-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">

            {/* Sidebar + Logo */}
            <div className="flex items-center space-x-2">
              <button
                onClick={onToggleSidebar}
                className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 mr-2 transition-colors"
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
              <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <img src="/logo.png" alt="AI Galaxy Logo" className="h-8 w-8 sm:h-10 sm:w-10" />
                <span className="font-bold text-lg sm:text-xl text-indigo-600 dark:text-indigo-400">
                  AI Galaxy
                </span>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center space-x-2">
              {/* Dark Mode Toggle on Mobile */}
              <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label="Toggle dark mode">
                {isDarkMode ? <SunIcon className="h-5 w-5 text-yellow-400" /> : <MoonIcon className="h-5 w-5 text-gray-800 dark:text-gray-200" />}
              </button>
              {/* User/Auth on Mobile */}
              {user ? (
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  <UserCircleIcon className="h-6 w-6" />
                </button>
              ) : (
                <button onClick={() => setIsLoginOpen(true)} className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-500 transition-colors">Sign In</button>
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Home</Link>
              <Link href="/about" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">About</Link>

              {/* Categories Dropdown */}
              <div className="relative"
                   onMouseEnter={() => setCategoriesOpen(true)}
                   onMouseLeave={() => setCategoriesOpen(false)}
              >
                <Link href="/categories"
                      className="inline-flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      aria-expanded={categoriesOpen} aria-haspopup="true"
                      onClick={() => setCategoriesOpen(false)}
                      onFocus={() => setCategoriesOpen(true)}
                >
                  Categories <ChevronDownIcon className={`h-4 w-4 transition-transform ${categoriesOpen ? "rotate-180" : ""}`} />
                </Link>
                {categoriesOpen && (
                  <div className="absolute right-0 mt-3 w-52 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-2 z-50">
                    <Link href="/categories" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">View all categories</Link>
                    <div className="my-2 border-t border-gray-200 dark:border-gray-700" />
                    {categories.slice(0, 6).map(cat => (
                      <Link key={cat.id} href={`/categories/${cat.slug}`} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">{cat.name}</Link>
                    ))}
                  </div>
                )}
              </div>

              <Link href="/contact" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">ContactUs</Link>
              <Link href="/community" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Community</Link>
              <Link href="/blog" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Blog</Link>

              {/* Submit Tool Button */}
              <button 
                onClick={() => setIsSubmitToolOpen(true)}
                className="px-4 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-500 transition-colors text-sm font-medium"
              >
                Submit Tool
              </button>

              {/* Dark Mode */}
              <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label="Toggle dark mode">
                {isDarkMode ? <SunIcon className="h-5 w-5 text-yellow-400" /> : <MoonIcon className="h-5 w-5 text-gray-800 dark:text-gray-200" />}
              </button>

              {/* User / Auth */}
              {user ? (
                <div className="relative">
                  <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center space-x-2 px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-500">
                    <UserCircleIcon className="h-5 w-5" />
                    <span>{user.username}</span>
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded shadow-lg">
                      <Link href="/profile" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">Profile</Link>
                      <Link href="/favorites" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">Favorites</Link>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">Logout</button>
                    </div>
                  )}
                </div>
              ) : (
                <button onClick={() => setIsLoginOpen(true)} className="px-4 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-500 transition-colors">Sign In</button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="px-4 py-3 space-y-3">
              <Link href="/" className="block py-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" onClick={() => setMobileMenuOpen(false)}>Home</Link>
              <Link href="/about" className="block py-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" onClick={() => setMobileMenuOpen(false)}>About</Link>
              <div>
                <button
                  onClick={() => setCategoriesOpen(!categoriesOpen)}
                  className="w-full flex items-center justify-between py-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Categories
                  <ChevronDownIcon className={`h-4 w-4 transition-transform ${categoriesOpen ? "rotate-180" : ""}`} />
                </button>
                {categoriesOpen && (
                  <div className="pl-4 mt-2 space-y-2">
                    <Link href="/categories" className="block py-1 text-sm hover:text-indigo-600 dark:hover:text-indigo-400" onClick={() => setMobileMenuOpen(false)}>View all categories</Link>
                    {categories.slice(0, 6).map(cat => (
                      <Link key={cat.id} href={`/categories/${cat.slug}`} className="block py-1 text-sm hover:text-indigo-600 dark:hover:text-indigo-400" onClick={() => setMobileMenuOpen(false)}>{cat.name}</Link>
                    ))}
                  </div>
                )}
              </div>
              <Link href="/contact" className="block py-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" onClick={() => setMobileMenuOpen(false)}>ContactUs</Link>
              <Link href="/community" className="block py-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" onClick={() => setMobileMenuOpen(false)}>Community</Link>
              <Link href="/blog" className="block py-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" onClick={() => setMobileMenuOpen(false)}>Blog</Link>
              <button 
                onClick={() => {
                  setIsSubmitToolOpen(true)
                  setMobileMenuOpen(false)
                }}
                className="w-full text-left py-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Submit Tool
              </button>
              {user && (
                <>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                  <Link href="/profile" className="block py-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
                  <Link href="/favorites" className="block py-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" onClick={() => setMobileMenuOpen(false)}>Favorites</Link>
                  <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="w-full text-left py-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Logout</button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleAuthSuccess}
        openRegister={() => { setIsLoginOpen(false); setIsSignUpOpen(true); }}
      />
      <SignUpModal
        isOpen={isSignUpOpen}
        onClose={() => setIsSignUpOpen(false)}
        onSignUpSuccess={handleAuthSuccess}
        openLogin={() => { setIsSignUpOpen(false); setIsLoginOpen(true); }}
      />
      <SubmitToolModal isOpen={isSubmitToolOpen} onClose={() => setIsSubmitToolOpen(false)} />
    </>
  );
};

export default Navbar;








