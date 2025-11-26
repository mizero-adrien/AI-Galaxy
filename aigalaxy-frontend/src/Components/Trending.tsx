import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Category {
  id: number;
  name: string;
  slug: string;
}

const Trending: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const MAX_TRENDING = 10;

{categories.slice(0, MAX_TRENDING).map(category => (
  <Link key={category.id} to={`/category/${category.slug}`}>
    {category.name}
  </Link>
))}


  useEffect(() => {
    fetch("http://localhost:8000/api/categories/")
      .then((res) => res.json())
      .then((data) => {
        // If API returns { results: [...] }, otherwise fallback to data
        setCategories(data.results || data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch categories:", err);
        setCategories([]);
        setLoading(false);
      });
  }, []);

  return (
    <section className="bg-[#0a0f3f] py-16 px-4 sm:px-6 lg:px-20 text-white border-2 border-hidden shadow-xl">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold flex items-center justify-center gap-2 mb-4">
          <span className="text-red-500 text-3xl">🔥</span> Trending Categories
        </h2>
        <p className="text-gray-300 max-w-2xl mx-auto mb-10">
          Explore our editorial favorites and popular AI tools in these trending categories
        </p>

        {loading ? (
          <p className="text-gray-400">Loading categories...</p>
        ) : categories.length === 0 ? (
          <p className="text-gray-400">No categories found.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 justify-center">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="bg-white text-gray-800 px-5 py-2 rounded-full shadow hover:bg-gray-100 transition w-full text-center truncate"
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
