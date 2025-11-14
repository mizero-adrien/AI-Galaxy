// src/components/Navbar.tsx
import React, { useState, useEffect, ChangeEvent } from "react";
import { Link } from "react-router-dom";
import {
  SunIcon,
  MoonIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { useDarkMode } from "../contexts/DarkModeContext";
import SignUpModal from "./Auth/SignUpModal.tsx";
import LoginModal from "./Auth/LoginModal.tsx";

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
  const [language, setLanguage] = useState<string>("en");
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [user, setUser] = useState<any>(null);
  const [profileOpen, setProfileOpen] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesOpen, setCategoriesOpen] = useState<boolean>(false);

  const [isSignUpOpen, setIsSignUpOpen] = useState<boolean>(false);
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";
        const response = await fetch(`${baseURL}/api/categories/`);
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        // Handle paginated response (DRF returns {results: [...]}) or direct array
        const categoriesData = Array.isArray(data) 
          ? data 
          : (data?.results || []);
        setCategories(categoriesData);
      } catch (err) {
        console.error("Unable to load categories", err);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setProfileOpen(false);
  };

  // Language change
  const handleLanguageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  };

  // After successful login or signup
  const handleAuthSuccess = (newUser: any) => {
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
    setIsSignUpOpen(false);
    setIsLoginOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 bg-white dark:bg-gray-900 shadow-md text-gray-900 dark:text-white transition-colors duration-300">
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
              <img src="/logo.png" alt="AI Galaxy Logo" className="h-10 w-10" />
              <span className="font-bold text-xl text-indigo-600 dark:text-indigo-400">
                AI Galaxy
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              <Link
                to="/"
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Home
              </Link>
              <Link
                to="/about"
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                About
              </Link>
              <div
                className="relative"
                onMouseEnter={() => setCategoriesOpen(true)}
                onMouseLeave={() => setCategoriesOpen(false)}
              >
                <Link
                  to="/categories"
                  className="inline-flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  aria-expanded={categoriesOpen}
                  aria-haspopup="true"
                  onClick={() => setCategoriesOpen(false)}
                  onFocus={() => setCategoriesOpen(true)}
                >
                  Categories
                  <ChevronDownIcon className={`h-4 w-4 transition-transform ${categoriesOpen ? "rotate-180" : ""}`} />
                </Link>
                {categoriesOpen && (
                  <div className="absolute right-0 mt-3 w-52 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-2 z-50">
                    <Link
                      to="/categories"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => setCategoriesOpen(false)}
                    >
                      View all categories
                    </Link>
                    <div className="my-2 border-t border-gray-200 dark:border-gray-700" />
                    {categories.slice(0, 6).map((category) => (
                      <Link
                        key={category.id}
                        to={`/categories/${category.slug}`}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => setCategoriesOpen(false)}
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <Link
                to="/contact"
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                ContactUs
              </Link>
              <Link
                to="/subscriptions"
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Subscriptions
              </Link>

              {/* Dark Mode */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <SunIcon className="h-5 w-5 text-yellow-400" />
                ) : (
                  <MoonIcon className="h-5 w-5 text-gray-800 dark:text-gray-200" />
                )}
              </button>

              {/* Language */}
              <select
                value={language}
                onChange={handleLanguageChange}
                className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
              >
                <option value="en">EN</option>
                <option value="fr">FR</option>
                <option value="es">ES</option>
              </select>

              {/* User profile or Auth buttons */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center space-x-2 px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-500"
                  >
                    <UserCircleIcon className="h-5 w-5" />
                    <span>{user.username}</span>
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded shadow-lg">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="px-4 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-500 transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleAuthSuccess}
        openRegister={() => {
          setIsLoginOpen(false);
          setIsSignUpOpen(true);
        }}
      />

      {/* Sign Up Modal */}
      <SignUpModal
        isOpen={isSignUpOpen}
        onClose={() => setIsSignUpOpen(false)}
        onSignUpSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default Navbar;







