import React, { useEffect, useState } from "react";


import axios from "axios";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import About from "../pages/About";

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [tools, setTools] = useState([]);
  const [search, setSearch] = useState("");

  // Fetch categories + tools
  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";
        const [catRes, toolRes] = await Promise.all([
          axios.get(`${baseURL}/api/categories/`),
          axios.get(`${baseURL}/api/ai-tools/`),
        ]);
        setCategories(catRes.data);
        setTools(toolRes.data);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    fetchData();
  }, []);

  // Filter tools by search
  const filteredTools = tools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(search.toLowerCase()) ||
      tool.description.toLowerCase().includes(search.toLowerCase())
  );

  // Group tools by category
  const groupedTools = filteredTools.reduce((acc, tool) => {
    const key = tool.category.id || tool.category;
    (acc[key] = acc[key] || []).push(tool);
    return acc;
  }, {});

  // Limit results
  const limitedTools = filteredTools.slice(0, 20);
  const limitedCategories = categories.slice(0, 9);

  return (
    <div className="flex flex-col bg-gray-50 min-h-screen text-gray-900 overflow-x-hidden">
      <Navbar />

      {/* MAIN CONTENT WRAPPER TO PREVENT OVERLAP */}
      <main className="flex-1 mt-[70px] md:ml-[260px]">
        {/* Adjust based on your actual sidebar/header height */}

        {/* HERO SECTION */}
        <section className="relative h-[60vh] flex flex-col justify-center items-center text-white overflow-hidden">
          <video
            className="absolute top-0 left-0 w-full h-full object-cover"
            src="/download (7).mp4"
            autoPlay
            loop
            muted
            playsInline
          />
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>

          <div className="relative z-10 bg-gray-500 bg-opacity-60 p-8 rounded-2xl text-center max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              Discover 3000+ AI Tools
            </h1>
            <p className="mb-6 text-lg">
              Find the right AI tools by category or search below
            </p>

            <div className="flex items-center bg-white rounded-lg overflow-hidden shadow-md w-[90%] md:w-96 mx-auto">
              <input
                type="text"
                placeholder="Search AI tools..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 p-3 outline-none text-black"
              />
              <button className="bg-indigo-400 hover:bg-indigo-700 text-white px-4 py-3 font-medium">
                Search
              </button>
            </div>
          </div>
        </section>

        {/* DYNAMIC SCROLLING TOOL LOGOS */}
        <section className="bg-white py-10 overflow-hidden border-b">
          <div className="flex space-x-8 animate-scroll px-8">
            {limitedTools.length > 0 ? (
              [...limitedTools, ...limitedTools].map((tool, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 bg-gray-50 border rounded-2xl px-6 py-3 shadow-sm hover:shadow-md transition"
                >
                  <img
                    src={tool.image || "/fallback.png"}
                    alt={tool.name}
                    className="h-8 w-8 object-contain"
                  />
                  <p className="font-medium text-gray-700">{tool.name}</p>
                </div>
              ))
            ) : (
              <p className="text-center w-full text-gray-500">Loading tools...</p>
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
        <section className="py-12 px-6 md:px-16 bg-white border-b">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-extrabold">Popular AI Tools</h2>
            <p className="text-gray-500 mt-2">
              Explore trending AI tools from our database
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {limitedTools.length > 0 ? (
              limitedTools.map((tool) => (
                <Link
                  key={tool.id}
                  to={`/tools/${tool.id}`}
                  className="bg-gray-100 hover:scale-105 transition-transform duration-300 rounded-xl shadow-md p-4"
                >
                  <div className="flex items-center justify-center mb-3">
                    <img
                      src={tool.image || "/fallback.png"}
                      alt={tool.name}
                      className="h-12 object-contain"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-center mb-2">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-gray-600 text-center line-clamp-3">
                    {tool.description
                      ? tool.description.split(" ").slice(0, 15).join(" ") + "..."
                      : "No description available."}
                  </p>
                </Link>
              ))
            ) : (
              <p className="text-center text-gray-500 w-full">Loading tools...</p>
            )}
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="py-12 px-6 md:px-20 bg-gray-50">
          <h2 className="text-3xl font-semibold text-center mb-10">
            Browse by Category
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {limitedCategories.map((category) => {
              const toolsInCategory = groupedTools[category.id] || [];
              if (toolsInCategory.length === 0) return null;

              return (
                <div
                  key={category.id}
                  className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition duration-300"
                >
                  <h3 className="text-xl font-bold mb-4 text-indigo-600">
                    {category.name}
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    {toolsInCategory.slice(0, 6).map((tool) => (
                      <li key={tool.id}>
                        <Link
                          to={`/tools/${tool.id}`}
                          className="hover:text-indigo-500 transition"
                        >
                          {tool.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* ABOUT + FOOTER */}
        <About />
        <Footer />
      </main>
    </div>
  );
};

export default Home;



