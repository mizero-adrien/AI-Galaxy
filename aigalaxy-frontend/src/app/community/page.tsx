'use client'

import { useState, useEffect } from "react"
import Navbar from '../../Components/Navbar'
import Footer from '../../Components/Footer'
import Sidebar from '../../Components/Sidebar'
import Newsletter from '../../Components/Newsletter'
import SubmitToolButton from '../../Components/SubmitToolButton'

export default function CommunityPage() {
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300 pt-8 sm:pt-12 md:pt-16 lg:pt-20 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AI Galaxy Community
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Join our vibrant community of AI enthusiasts, developers, and innovators
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 mb-12">
              {/* Discord Community */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-4">Discord Server</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Connect with fellow AI enthusiasts, share your projects, and get real-time help from the community.
                </p>
                <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors font-medium">
                  Join Discord
                </button>
              </div>

              {/* GitHub Community */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-4">GitHub Repository</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Contribute to AI Galaxy's development, report issues, and suggest new features on our GitHub repo.
                </p>
                <button className="px-6 py-3 bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors font-medium">
                  View on GitHub
                </button>
              </div>
            </div>

            {/* Community Stats */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 mb-12">
              <h2 className="text-2xl font-bold text-center mb-8">Community Stats</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">1.2K+</div>
                  <div className="text-gray-600 dark:text-gray-400">Members</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">500+</div>
                  <div className="text-gray-600 dark:text-gray-400">AI Tools</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">50+</div>
                  <div className="text-gray-600 dark:text-gray-400">Contributors</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">24/7</div>
                  <div className="text-gray-600 dark:text-gray-400">Support</div>
                </div>
              </div>
            </div>

            {/* Community Guidelines */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-6">Community Guidelines</h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-400">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Be respectful and constructive in all interactions</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Share knowledge and help others learn about AI</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Keep discussions relevant to AI tools and technology</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p>No spam, self-promotion without value, or off-topic content</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Report bugs and suggest improvements constructively</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Newsletter />
        <SubmitToolButton />
        <Footer />
      </main>
    </div>
  )
}





