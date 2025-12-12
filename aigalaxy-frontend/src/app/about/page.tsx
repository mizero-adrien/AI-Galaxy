'use client'

import Navbar from '../../Components/Navbar'
import Footer from '../../Components/Footer'
import Sidebar from '../../Components/Sidebar'
import Newsletter from '../../Components/Newsletter'
import SubmitToolButton from '../../Components/SubmitToolButton'
import { useState, useEffect } from 'react'

export default function AboutPage() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
  const [sidebarWidth, setSidebarWidth] = useState<number>(192)

  // Load sidebar preferences
  useEffect(() => {
    const loadPreferences = async () => {
      if (typeof window === 'undefined') return;
      const storageModule = await import('../../utils/storage');
      const savedWidth = await storageModule.storage.getItem('sidebar-width');
      const savedOpen = await storageModule.storage.getItem('sidebar-open');
      
      if (savedWidth) {
        setSidebarWidth(parseInt(savedWidth, 10));
      }
      
      if (savedOpen === 'true') {
        setSidebarOpen(true);
      }
    };
    loadPreferences();
  }, []);

  const handleSidebarWidthChange = async (width: number) => {
    setSidebarWidth(width);
    if (typeof window !== 'undefined') {
      const storageModule = await import('../../utils/storage');
      await storageModule.storage.setItem('sidebar-width', width.toString());
    }
  };

  const handleSidebarToggle = async () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    if (typeof window !== 'undefined') {
      const storageModule = await import('../../utils/storage');
      await storageModule.storage.setItem('sidebar-open', newState.toString());
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Navbar onToggleSidebar={handleSidebarToggle} sidebarOpen={sidebarOpen} />
      <Sidebar 
        onClose={() => setSidebarOpen(false)} 
        isOpen={sidebarOpen}
        width={sidebarWidth}
        onWidthChange={handleSidebarWidthChange}
      />
      <main 
        className="pt-16 transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? `${sidebarWidth}px` : '0' }}
      >
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
        <Newsletter />
        <SubmitToolButton />
        <Footer />
      </main>
    </div>
  )
}


