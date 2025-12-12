'use client'

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface Category {
  id: number;
  name: string;
  slug: string;
}

const Trending: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const MAX_TRENDING = 10;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { apiClient } = await import('../utils/apiClient');
        const response = await apiClient.get('/api/categories/', {
          timeout: 30000 // 30 second timeout
        });
        const data = response.data;
        // If API returns { results: [...] }, otherwise fallback to data
        setCategories(data.results || data);
      } catch (err: any) {
        console.error("Failed to fetch categories:", err);
        if (err.code === 'ECONNREFUSED' || err.message?.includes('timeout')) {
          console.error('Backend server may not be running');
        }
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <section className="bg-[#0a0f3f] py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-20 text-white border-2 border-hidden shadow-xl">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold flex items-center justify-center gap-2 mb-3 sm:mb-4">
          <span className="text-red-500 text-xl sm:text-2xl md:text-3xl">🔥</span> Trending Categories
        </h2>
        <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto mb-6 sm:mb-8 md:mb-10 px-4">
          Explore our editorial favorites and popular AI tools in these trending categories
        </p>

        {loading ? (
          <p className="text-sm sm:text-base text-gray-400">Loading categories...</p>
        ) : categories.length === 0 ? (
          <p className="text-sm sm:text-base text-gray-400">No categories found.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 justify-center">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="bg-white text-gray-800 px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 rounded-full shadow hover:bg-gray-100 transition w-full text-center truncate text-xs sm:text-sm md:text-base"
                title={category.name} // Shows full name on hover if truncated
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Trending;
