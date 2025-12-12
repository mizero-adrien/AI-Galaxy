import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

interface Tool {
  id: number;
  name: string;
  description: string;
  image?: string;
}

const CategoryDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const getImageUrl = (imagePath: string | null | undefined): string => {
    if (!imagePath) return "/fallback.png";
    if (imagePath.startsWith("http")) return imagePath;
    return `${baseURL}${imagePath}`;
  };

  useEffect(() => {
    const fetchCategory = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        setError(null);

        const [categoryResponse, toolsResponse] = await Promise.all([
          axios.get(`${baseURL}/api/categories/${slug}/`),
          axios.get(`${baseURL}/api/categories/${slug}/tools/`, { params: { page_size: 50 } }),
        ]);

        setCategory(categoryResponse.data);

        const toolsData = Array.isArray(toolsResponse.data)
          ? toolsResponse.data
          : Array.isArray(toolsResponse.data.results)
            ? toolsResponse.data.results
            : [];

        setTools(toolsData);
      } catch (err) {
        console.error("Failed to load category", err);
        setError("We couldn't load this category. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [slug, baseURL]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <p className="text-gray-500 dark:text-gray-400">Loading category...</p>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 px-4">
        <p className="text-red-500 mb-4">{error || "Category not found."}</p>
        <Link to="/categories" className="text-indigo-600 dark:text-indigo-400 hover:underline">
          Back to categories
        </Link>
      </div>
    );
  }

  return (
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
              to="/categories"
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
                <Link
                  key={tool.id}
                  to={`/tools/${tool.id}`}
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition transform hover:-translate-y-1 duration-300 flex flex-col gap-4"
                >
                  <div className="flex items-center justify-center">
                    <img
                      src={getImageUrl(tool.image)}
                      alt={tool.name}
                      className="h-16 w-16 object-contain"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 text-center">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-4 text-center">
                    {tool.description || "No description provided."}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default CategoryDetail;

