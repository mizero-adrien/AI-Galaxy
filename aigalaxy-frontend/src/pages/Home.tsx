import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from 'next/link';
import { ArrowUpRightIcon } from "@heroicons/react/24/outline";
import ToolCard from "../Components/ToolCard";
import About from "./About";
import Trending from "../Components/Trending";

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
  image: string;
  category: Category | number;
  is_premium: boolean;
  link?: string;
}


const Home: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Helper function to construct full image URL
  const getImageUrl = (imagePath: string | null | undefined): string => {
    if (!imagePath) return "/fallback.png";
    if (imagePath.startsWith("http")) return imagePath;
    return `${baseURL}${imagePath}`;
  };

  // Fetch categories + tools
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catRes, toolRes] = await Promise.all([
          axios.get(`${baseURL}/api/categories/`, { params: { page_size: 9 } }),
          axios.get(`${baseURL}/api/ai-tools/`, { params: { page_size: 20, is_popular: true } }),
        ]);
        // Handle paginated response (DRF returns {results: [...]}) or direct array
        const categoriesData = Array.isArray(catRes.data) 
          ? catRes.data 
          : (catRes.data?.results || []);
        const toolsData = Array.isArray(toolRes.data) 
          ? toolRes.data 
          : (toolRes.data?.results || []);
        setCategories(categoriesData);
        setTools(toolsData);
      } catch (error) {
        console.error("Error loading data:", error);
        setCategories([]);
        setTools([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [baseURL]);

  // Filter tools by search
  const filteredTools = tools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(search.toLowerCase()) ||
      tool.description.toLowerCase().includes(search.toLowerCase())
  );

  // Group tools by category
  const groupedTools = filteredTools.reduce((acc, tool) => {
    if (typeof tool.category === 'object' && tool.category !== null) {
      const key = tool.category.slug;
      (acc[key] = acc[key] || []).push(tool);
    } else if (tool.category) {
      const key = String(tool.category);
      (acc[key] = acc[key] || []).push(tool);
    }
    return acc;
  }, {} as Record<string, Tool[]>);

  // Limit results
  const limitedTools = filteredTools.slice(0, 20);
  const limitedCategories = categories.slice(0, 9);

  return (
    <div className="flex flex-col bg-gray-50  min-h-screen text-gray-900  overflow-x-hidden transition-colors duration-300">
      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1">
        {/* HERO SECTION */}
        <section
            className="relative h-[50vh] sm:h-[60vh] flex flex-col justify-center items-center text-white ">
          <video
              className="absolute top-0 left-0 w-full h-40 object-cover"
              src="/Neural_Network_Animation_Generated.mp4"
              autoPlay
              loop
              muted
              playsInline
          />

          <div className="absolute inset-0 bg-black bg-opacity-50"></div>

          <div
              className="relative z-10 bg-gray-500 bg-opacity-60 p-6 sm:p-8 rounded-2xl text-center max-w-2xl mx-4 sm:mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4">
              Discover 3000+ AI Tools
            </h1>
            <p className="mb-6 text-base sm:text-lg">
              Find the right AI tools by category or search below
            </p>

            <div
                className="flex flex-col sm:flex-row items-stretch sm:items-center bg-white rounded-lg overflow-hidden shadow-md w-full sm:w-96 mx-auto">
              <input
                  type="text"
                  placeholder="Search AI tools..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 p-3 outline-none text-black text-sm sm:text-base"
              />
              <button
                  className="bg-indigo-400 hover:bg-indigo-700 text-white px-4 py-3 font-medium transition-colors text-sm sm:text-base">
                Search
              </button>
            </div>
          </div>
        </section>

        {/* DYNAMIC SCROLLING TOOL LOGOS */}
        <section
            className="bg-white dark:bg-gray-900 py-10 overflow-hidden border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="flex space-x-8 animate-scroll px-8">
            {loading ? (
                <p className="text-center w-full text-gray-500 dark:text-gray-400">
                  Loading tools...
                </p>
            ) : limitedTools.length > 0 ? (
                [...limitedTools, ...limitedTools].map((tool, index) => (
                    <Link
                        key={`${tool.id}-${index}`}
                        href={`/tools/${tool.id}`} // <- CHANGED: to → href
                        className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 sm:px-6 py-3 shadow-sm hover:shadow-md transition-all min-w-fit"
                    >
                      <img
                          src={getImageUrl(tool.image)}
                          alt={tool.name}
                          className="h-6 w-6 sm:h-8 sm:w-8 object-contain"
                      />
                      <p className="font-medium text-gray-700 dark:text-gray-300 text-sm sm:text-base whitespace-nowrap">
                        {tool.name}
                      </p>
                    </Link>
                ))
            ) : (
                <p className="text-center w-full text-gray-500 dark:text-gray-400">No tools found</p>
            )}
          </div>

          <style>
            {`
      @keyframes scroll {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      .animate-scroll {
        display: flex;
        width: max-content;
        animation: scroll 40s linear infinite;
      }
    `}
          </style>
        </section>

        {/* POPULAR TOOLS */}
        <section
            className="py-8 sm:py-12 px-4 sm:px-6 md:px-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-gray-100">
              Popular AI Tools
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm sm:text-base">
              Explore trending AI tools from our database
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {loading ? (
                <p className="text-center text-gray-500 dark:text-gray-400 w-full col-span-full">
                  Loading tools...
                </p>
            ) : limitedTools.length > 0 ? (
                limitedTools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                ))
            ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 w-full col-span-full">
                  No tools found
                </p>
            )}
          </div>
        </section>

        {/* CATEGORIES */}
        <section
            className="py-8 sm:py-12 px-4 sm:px-6 md:px-20 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
          <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-8 sm:mb-10 text-gray-900 dark:text-gray-100">
            Browse by Category
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10 max-w-7xl mx-auto">
            {loading ? (
                <p className="text-center text-gray-500 dark:text-gray-400 w-full col-span-full">
                  Loading categories...
                </p>
            ) : (
                limitedCategories.map((category) => {
                  const toolsInCategory = groupedTools[category.slug] || [];
                  if (toolsInCategory.length === 0) return null;

                  return (
                      <div
                          key={category.id}
                          className="bg-white dark:bg-gray-900 rounded-2xl shadow-md p-6 hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
                      >
                        <Link
                          href={`/categories/${category.slug}`} // <- CHANGED: to → href
                          className="inline-flex items-center justify-between w-full gap-3 mb-4 group"
                        >
                          <h3 className="text-lg sm:text-xl font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline">
                            {category.name}
                          </h3>
                          <ArrowUpRightIcon className="h-5 w-5 text-indigo-500 dark:text-indigo-300 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </Link>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                          {toolsInCategory.slice(0, 5).map((tool) => (
                              <li key={tool.id}>
                                <Link
                                    href={`/tools/${tool.id}`} // <- CHANGED: to → href
                                    className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
                                >
                                  {tool.name}
                                </Link>
                              </li>
                          ))}
                        </ul>
                        {toolsInCategory.length > 5 && (
                          <div className="mt-4">
                            <Link
                              href={`/categories/${category.slug}`} // <- CHANGED: to → href
                              className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:underline"
                            >
                              More tools
                              <ArrowUpRightIcon className="h-4 w-4" />
                            </Link>
                          </div>
                        )}
                      </div>
                  );
                })
            )}
          </div>
        </section>

         <Trending/>
        {/* ABOUT */}
        <About/>

      </div>
    </div>
  );
};

export default Home;

