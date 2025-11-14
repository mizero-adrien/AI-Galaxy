import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";
        const response = await axios.get(`${baseURL}/api/categories/`);
        // Handle paginated response (DRF returns {results: [...]}) or direct array
        const categoriesData = Array.isArray(response.data) 
          ? response.data 
          : (response.data?.results || []);
        setCategories(categoriesData);
      } catch (err) {
        console.error("Failed to load categories", err);
        setError("Unable to load categories right now. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    return categories.filter((category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    );
  }, [categories, searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-white dark:text-gray-100 transition-colors duration-300 pt-20 pb-16 px-4 sm:px-8 lg:px-16">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold">
            Browse All Categories
          </h1>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            Explore AI tools grouped by what they do. Select a category to see all matching tools.
          </p>
        </div>

        <div className="max-w-xl mx-auto mb-8">
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search categories..."
            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCategories.map((category) => (
              <Link
                key={category.id}
                to={`/categories/${category.slug}`}
                className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow duration-300"
              >
                <h2 className="text-xl font-semibold text-indigo-600 dark:text-indigo-400 group-hover:underline">
                  {category.name}
                </h2>
                {category.description && (
                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                    {category.description}
                  </p>
                )}
                <span className="mt-4 inline-flex items-center text-sm text-indigo-600 dark:text-indigo-400">
                  View tools
                  <svg
                    className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
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
  );
};

export default CategoriesPage;



