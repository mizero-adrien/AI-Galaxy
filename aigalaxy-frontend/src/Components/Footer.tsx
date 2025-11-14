import React from "react";
import { FaTwitter, FaInstagram, FaFacebook } from "react-icons/fa";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 py-10 px-4 md:px-20 shadow-inner border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8">
        {/* Logo & description */}
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center mb-4">
            <img src="/logo.png" alt="logo" className="h-10 w-10 mr-2" />
            <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
              AI-Galaxy
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Exploring the future of AI. Discover AI tools, innovations, and insights across the technology galaxy.
          </p>
        </div>

        {/* Company */}
        <div>
          <h3 className="font-semibold mb-4 text-lg text-gray-900 dark:text-gray-100">
            Company
          </h3>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
            <li>
              <a href="#" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                About
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                AI Tools
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                Blog
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                Careers
              </a>
            </li>
          </ul>
        </div>

        {/* Help */}
        <div>
          <h3 className="font-semibold mb-4 text-lg text-gray-900 dark:text-gray-100">
            Help
          </h3>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
            <li>
              <a href="#" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                Support
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                Contact
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                FAQ
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                Community
              </a>
            </li>
          </ul>
        </div>

        {/* Documents */}
        <div>
          <h3 className="font-semibold mb-4 text-lg text-gray-900 dark:text-gray-100">
            Documents
          </h3>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
            <li>
              <a href="#" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                Terms of Service
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                Licensing
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom row */}
      <div className="border-t border-gray-200 dark:border-gray-700 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} AI-Galaxy. All rights reserved.
        </p>
        <div className="flex space-x-4 mt-4 md:mt-0 text-gray-600 dark:text-gray-400">
          <a
            href="#"
            className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
            aria-label="Twitter"
          >
            <FaTwitter size={20} />
          </a>
          <a
            href="#"
            className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
            aria-label="Instagram"
          >
            <FaInstagram size={20} />
          </a>
          <a
            href="#"
            className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
            aria-label="Facebook"
          >
            <FaFacebook size={20} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;



