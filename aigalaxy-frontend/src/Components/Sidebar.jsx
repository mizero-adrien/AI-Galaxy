import React from "react";
import {
  FaTools,
  FaGift,
  FaUsers,
  FaImage,
  FaVideo,
  FaRobot,
  FaQuestionCircle,FaHeadphones,  FaComments,  FaThLarge,  FaYoutube,  FaFileAlt,  FaUser, FaCode, FaMusic, FaMicrophoneAlt,
} from "react-icons/fa";

const Sidebar = () => {
  return (
    // <aside className="w-64 bg-white dark:text-white dark:bg-gray-800 shadow-md border-r dark:border-gray-700 flex flex-col h-screen fixed left-0 mt-4">
      <div className="flex">
    <aside className="w-64 bg-white  shadow-md border-r  flex flex-col h-screen fixed left-0 mt-4">
      {/* Header */}
      <div className="p-5 border-b ">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          AI-Galaxy
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Discover AI tools
        </p>
      </div>

      {/* Scrollable Menu */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent px-3 py-4 space-y-3">
        <a href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
          <FaTools className="text-gray-500" />
          <span>All Tools</span>
        </a>
        <a href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-white-400  transition">
          <FaGift className="text-gray-500" />
          <span>Free Credits</span>
        </a>
        <a href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
          <FaUsers className="text-gray-500" />
          <span>Become an Affiliate</span>
        </a>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700 my-3" />

        {/* Popular Section */}
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Popular
        </h3>

        <a href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
          <FaRobot className="text-gray-500" />
          <span>Prompt Library</span>
        </a>
        <a href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
          <FaImage className="text-gray-500" />
          <span>AI Image Generator</span>
        </a>
        <a href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
          <FaVideo className="text-gray-500" />
          <span>AI Video Generator</span>
        </a>
        <a href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
          <FaVideo className="text-gray-500" />
          <span>AI Lipsync Generator</span>
        </a><a href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
          <FaHeadphones className="text-gray-500" />
          <span>AI Talking Photo</span>
        </a>
      <a href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
          <FaYoutube className="text-gray-500" />
          <span>AI Youtube summarizer</span>
        </a>
        <a href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
          <FaCode className="text-gray-500" />
          <span>AI App Builder</span>
        </a>
        <a href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
          <FaMusic className="text-gray-500" />
          <span>AI Music Generator</span>
        </a>
        <a href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
          <FaComments className="text-gray-500" />
          <span>AI chats</span>
        </a>
        <a href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
          <FaImage className="text-gray-500" />
          <span>AI Image Editor</span>
        </a>
        <a href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
          <FaQuestionCircle className="text-gray-500" />
          <span>Help Center</span>
        </a>
      </div>


      {/* Footer */}
      <div className="border-t dark:border-gray-700 p-3 text-center text-xs text-white-500 pb-5">
        <div className="p-3 text-center">
          <button className="h-10 w-30 bg-indigo-500 text-white rounded">Upgrade</button>

        </div>
        © {new Date().getFullYear()} AI-Galaxy
      </div>
    </aside>
    </div>
  );

};

export default Sidebar;

