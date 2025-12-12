'use client'

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import {
  FaTools,
  FaGift,
  FaUsers,
  FaRobot,
  FaQuestionCircle,
} from "react-icons/fa";

interface SidebarProps {
  onClose: () => void;
  isOpen?: boolean; // For mobile toggle
  width?: number;
  onWidthChange?: (width: number) => void;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  is_popular?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose, isOpen = false, width = 192, onWidthChange }) => {
  const [popularCategories, setPopularCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const fetchPopularCategories = async () => {
      try {
        const { fetchWithTimeout } = await import('../utils/apiClient');
        const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const response = await fetchWithTimeout(`${baseURL}/api/categories/popular/`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        }, 10000);
        if (!response.ok) {
          throw new Error("Failed to fetch popular categories");
        }
        const data = await response.json();
        setPopularCategories(data);
      } catch (err) {
        console.error("Unable to load popular categories", err);
        setPopularCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularCategories();
  }, []);

  // Handle resize
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.min(Math.max(192, e.clientX), 400); // Min 192px, Max 400px
      onWidthChange?.(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, onWidthChange]);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  return (
    <>
      {/* Overlay for mobile only */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - Fully optional, toggleable on all devices */}
      <aside 
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 flex flex-col z-50 transform transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ width: `${width}px` }}
      >
        {/* Resize Handle - Only visible on desktop when sidebar is open */}
        {isOpen && (
          <div
            onMouseDown={handleResizeStart}
            className="hidden md:block absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 transition-colors z-10"
            title="Drag to resize sidebar"
          />
        )}

        {/* Width Control Buttons - Only on desktop */}
        {isOpen && (
          <div className="hidden md:flex items-center justify-end gap-1 p-2 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => onWidthChange?.(Math.max(192, width - 32))}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Decrease width"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => onWidthChange?.(Math.min(400, width + 32))}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Increase width"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            AI-Galaxy
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Discover AI tools
          </p>
        </div>

        {/* Scrollable Menu */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent px-3 py-4 space-y-3">
         <Link
            href="/tools"
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
            onClick={onClose}
          >
            <FaTools className="text-gray-500 dark:text-gray-400" />
            <span>All Tools</span>
          </Link>
          <Link
            href="/free-tools"
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
            onClick={onClose}
          >
            <FaGift className="text-gray-500 dark:text-gray-400" />
            <span>Free AI</span>
          </Link>
          <a
            href="#"
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          >
            <FaUsers className="text-gray-500 dark:text-gray-400" />
            <span>Become an Affiliate</span>
          </a>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700 my-3" />

          {/* Popular Section */}
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-2">
            Popular
          </h3>

          {loading ? (
            <p className="text-xs text-gray-500 dark:text-gray-400 px-2">Loading...</p>
          ) : popularCategories.length > 0 ? (
            popularCategories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                onClick={onClose}
              >
                <FaRobot className="text-gray-500 dark:text-gray-400" />
                <span className="truncate" title={category.name}>{category.name}</span>
              </Link>
            ))
          ) : (
            <p className="text-xs text-gray-500 dark:text-gray-400 px-2">No popular categories yet</p>
          )}

          <Link
            href="/contact"
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
            onClick={onClose}
          >
            <FaQuestionCircle className="text-gray-500 dark:text-gray-400" />
            <span>Help Center</span>
          </Link>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-3 text-center">
          <div className="p-3">
            <button className="h-10 w-full bg-blue-700 hover:bg-blue-800 text-white rounded transition-colors">
              Upgrade
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 pb-5">
            © {new Date().getFullYear()} AI-Galaxy
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
