import React, { useEffect, useState } from "react";
import axios from "axios";

interface Tool {
  id: number;
  name: string;
  description: string;
  image?: string;
  is_premium: boolean;
}

const AllToolsPage: React.FC = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const getImageUrl = (imagePath: string | null | undefined) => {
    if (!imagePath) return "/fallback.png";
    if (imagePath.startsWith("http")) return imagePath;
    return `${baseURL}${imagePath}`;
  };

  useEffect(() => {
    const fetchTools = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${baseURL}/api/ai-tools/`);
        const toolsData = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data.results)
          ? response.data.results
          : [];
        setTools(toolsData);
      } catch (err) {
        console.error(err);
        setError("Failed to load tools. Try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchTools();
  }, []);

  if (loading) return <p className="text-center py-20">Loading tools...</p>;
  if (error) return <p className="text-center py-20 text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300 pt-20 pb-16 px-4 sm:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-10 text-center">
          All AI Tools
        </h1>

        {tools.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-20">
            No tools available at the moment.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {tools.map((tool) => (
              <div
                key={tool.id}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition transform hover:-translate-y-1 duration-300 flex flex-col gap-4"
              >
                <div className="flex items-center justify-center">
                  <img
                    src={getImageUrl(tool.image)}
                    alt={tool.name}
                    className="h-20 w-20 object-contain"
                  />
                </div>
                <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 text-center">
                  {tool.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-4 text-center">
                  {tool.description || "No description provided."}
                </p>
                {tool.is_premium && (
                  <span className="inline-block text-xs font-semibold text-white bg-yellow-500 rounded-full px-2 py-1 text-center mt-2">
                    Premium
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllToolsPage;
