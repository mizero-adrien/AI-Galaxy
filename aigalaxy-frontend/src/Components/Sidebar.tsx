import React from "react";
import {
  FaTools,
  FaGift,
  FaUsers,
  FaImage,
  FaVideo,
  FaRobot,
  FaQuestionCircle,
  FaHeadphones,
  FaComments,
  FaYoutube,
  FaCode,
  FaMusic,
} from "react-icons/fa";

interface SidebarProps {
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  return (
    <>
      {/* Overlay for mobile */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Sidebar */}
      <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 flex flex-col z-50 transform transition-transform duration-300 ease-in-out translate-x-0 md:translate-x-0">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            AI-Galaxy
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Discover AI tools
          </p>
        </div>

        {/* Scrollable Menu */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent px-3 py-4 space-y-3">
          <a
            href="#"
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          >
            <FaTools className="text-gray-500 dark:text-gray-400" />
            <span>All Tools</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          >
            <FaGift className="text-gray-500 dark:text-gray-400" />
            <span>Free Credits</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          >
            <FaUsers className="text-gray-500 dark:text-gray-400" />
            <span>Become an Affiliate</span>
          </a>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700 my-3" />

          {/* Popular Section */}
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-2">
            Popular
          </h3>

          <a
            href="#"
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          >
            <FaRobot className="text-gray-500 dark:text-gray-400" />
            <span>Prompt Library</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          >
            <FaImage className="text-gray-500 dark:text-gray-400" />
            <span>AI Image Generator</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          >
            <FaVideo className="text-gray-500 dark:text-gray-400" />
            <span>AI Video Generator</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          >
            <FaVideo className="text-gray-500 dark:text-gray-400" />
            <span>AI Lipsync Generator</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          >
            <FaHeadphones className="text-gray-500 dark:text-gray-400" />
            <span>AI Talking Photo</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          >
            <FaYoutube className="text-gray-500 dark:text-gray-400" />
            <span>AI Youtube summarizer</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          >
            <FaCode className="text-gray-500 dark:text-gray-400" />
            <span>AI App Builder</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          >
            <FaMusic className="text-gray-500 dark:text-gray-400" />
            <span>AI Music Generator</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          >
            <FaComments className="text-gray-500 dark:text-gray-400" />
            <span>AI chats</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          >
            <FaImage className="text-gray-500 dark:text-gray-400" />
            <span>AI Image Editor</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          >
            <FaQuestionCircle className="text-gray-500 dark:text-gray-400" />
            <span>Help Center</span>
          </a>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-3 text-center">
          <div className="p-3">
            <button className="h-10 w-full bg-indigo-500 hover:bg-indigo-600 text-white rounded transition-colors">
              Upgrade
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 pb-5">
            © {new Date().getFullYear()} AI-Galaxy
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

