import React from "react";
import Link from "next/link";
import { FaTwitter, FaInstagram, FaFacebook } from "react-icons/fa";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 py-8 sm:py-10 md:py-12 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 shadow-inner border-t border-gray-200 dark:border-gray-700 transition-colors duration-300 w-full">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 sm:gap-8">
        {/* Logo & description */}
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center mb-3 sm:mb-4">
            <img src="/logo.png" alt="logo" className="h-8 w-8 sm:h-10 sm:w-10 mr-2" />
            <h2 className="text-lg sm:text-xl font-bold text-indigo-600 dark:text-indigo-400">
              AI-Galaxy
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Exploring the future of AI. Discover AI tools, innovations, and insights across the technology galaxy.
          </p>
        </div>

        {/* Company */}
        <div>
          <h3 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg text-gray-900 dark:text-gray-100">
            Company
          </h3>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
            <li>
              <Link href="/about" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                About
              </Link>
            </li>
            <li>
              <Link href="/tools" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                AI Tools
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/community" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                Community
              </Link>
            </li>
          </ul>
        </div>

        {/* Help */}
        <div>
          <h3 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg text-gray-900 dark:text-gray-100">
            Help
          </h3>
          <ul className="space-y-1.5 sm:space-y-2 text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
            <li>
              <Link href="/support" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                Support
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/faq" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/community" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                Community
              </Link>
            </li>
          </ul>
        </div>

        {/* Documents */}
        <div>
          <h3 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg text-gray-900 dark:text-gray-100">
            Documents
          </h3>
          <ul className="space-y-1.5 sm:space-y-2 text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
            <li>
              <Link href="/terms-of-service" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="/privacy-policy" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/categories" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                Categories
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom row */}
      <div className="border-t border-gray-200 dark:border-gray-700 mt-8 sm:mt-10 md:mt-12 pt-4 sm:pt-5 md:pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center md:text-left">
          © {new Date().getFullYear()} AI-Galaxy. All rights reserved.
        </p>
        <div className="flex space-x-3 sm:space-x-4 text-gray-600 dark:text-gray-400">
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



