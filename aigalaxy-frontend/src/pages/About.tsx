import React from "react";

const About: React.FC = () => {
  return (
    <section className="min-h-screen bg-gray-200 dark:bg-gray-800 flex flex-col items-center justify-center px-4 sm:px-6 py-16 transition-colors duration-300">
      <div className="max-w-5xl w-full text-center mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">
          About AI-Galaxy
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg">
          Discover the future of Artificial Intelligence through innovation, insight, and creativity.
        </p>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-6xl w-full px-4">
        {/* Card 1 */}
        <div className="bg-white dark:bg-gray-900 shadow-md rounded-2xl p-6 sm:p-8 hover:shadow-lg transition-all duration-300">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-indigo-500 dark:text-indigo-400">
            Our Mission
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
            AI-Galaxy is dedicated to bridging the gap between humans and artificial intelligence.
            We aim to empower individuals, developers, and organizations with access to over 3000+ AI tools,
            helping them harness technology to innovate and solve real-world challenges efficiently.
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-white dark:bg-gray-900 shadow-md rounded-2xl p-6 sm:p-8 hover:shadow-lg transition-all duration-300">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-indigo-500 dark:text-indigo-400">
            What We Offer
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
            From AI-powered productivity apps to machine learning platforms, AI-Galaxy curates the best tools
            across various industries. Our goal is to make discovering, comparing, and learning about AI
            solutions simple and accessible — so everyone can be part of the next technological revolution.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;



