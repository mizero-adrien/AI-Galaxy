// src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SunIcon, MoonIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import useDarkMode from 'use-dark-mode';

const Navbar = () => {
  // Use the hook instead of manual localStorage logic

  const [menuOpen, setMenuOpen] = useState(false);
  const [language, setLanguage] = useState('en');

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };
  const darkMode = useDarkMode(false, {
  className: 'dark',
  element: document.documentElement
});

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white dark:bg-gray-900 shadow-md text-gray-900 dark:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <img src="/logo.png" alt="AI Galaxy Logo" className="h-10 w-10" />
            <span className="font-bold text-xl text-indigo-600 dark:text-indigo-400">
              AI Galaxy
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">Home</Link>
            <Link to="/category" className="hover:text-indigo-600 dark:hover:text-indigo-400">Category</Link>
            <Link to="/about" className="hover:text-indigo-600 dark:hover:text-indigo-400">About</Link>
            <Link to="/subscriptions" className="hover:text-indigo-600 dark:hover:text-indigo-400">Subscriptions</Link>

            {/* Dark Mode Toggle */}
            <button
              onClick={darkMode.toggle}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {darkMode.value ? (
                <SunIcon className="h-5 w-5 text-yellow-400" />
              ) : (
                <MoonIcon className="h-5 w-5 text-gray-800 dark:text-gray-200" />
              )}
            </button>

            {/* Language Selector */}
            <select
              value={language}
              onChange={handleLanguageChange}
              className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            >
              <option value="en">EN</option>
              <option value="fr">FR</option>
              <option value="es">ES</option>
            </select>

            {/* Sign In */}
            <Link to="/login" className="px-4 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-500">
              Sign In
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 px-4 pt-2 pb-4 space-y-2">
          <Link to="/" className="block hover:text-indigo-600 dark:hover:text-indigo-400">Home</Link>
          <Link to="/category" className="block hover:text-indigo-600 dark:hover:text-indigo-400">Category</Link>
          <Link to="/about" className="block hover:text-indigo-600 dark:hover:text-indigo-400">About</Link>
          <Link to="/subscriptions" className="block hover:text-indigo-600 dark:hover:text-indigo-400">Subscriptions</Link>

          {/* Mobile Dark Mode */}
          <button
            onClick={darkMode.toggle}
            className="flex items-center space-x-2 py-1 px-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {darkMode.value ? (
              <SunIcon className="h-5 w-5 text-yellow-400" />
            ) : (
              <MoonIcon className="h-5 w-5 text-gray-800 dark:text-gray-200" />
            )}
            <span>{darkMode.value ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          {/* Mobile Language Selector */}
          <select
            value={language}
            onChange={handleLanguageChange}
            className="w-full border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
          >
            <option value="en">EN</option>
            <option value="fr">FR</option>
            <option value="es">ES</option>
          </select>

          <Link
            to="/login"
            className="block w-full text-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500"
          >
            Sign In
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;




