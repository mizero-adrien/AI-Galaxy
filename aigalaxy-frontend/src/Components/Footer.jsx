import { FaTwitter, FaInstagram, FaFacebook } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-white text-gray-800 py-10 px-4 md:px-20 shadow-inner border-t border-gray-200">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Logo & description */}
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center mb-4">
            <img src="/logo.png" alt="logo" className="h-10 w-10 mr-2" />
            <h2 className="text-xl font-bold text-indigo-600">AI-Galaxy</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            Exploring the future of AI. Discover AI tools, innovations, and insights across the technology galaxy.
          </p>
        </div>

        {/* Company */}
        <div>
          <h3 className="font-semibold mb-4 text-lg text-gray-900">Company</h3>
          <ul className="space-y-2 text-gray-600 text-sm">
            <li><a href="#" className="hover:text-indigo-500">About</a></li>
            <li><a href="#" className="hover:text-indigo-500">AI Tools</a></li>
            <li><a href="#" className="hover:text-indigo-500">Blog</a></li>
            <li><a href="#" className="hover:text-indigo-500">Careers</a></li>
          </ul>
        </div>

        {/* Help */}
        <div>
          <h3 className="font-semibold mb-4 text-lg text-gray-900">Help</h3>
          <ul className="space-y-2 text-gray-600 text-sm">
            <li><a href="#" className="hover:text-indigo-500">Support</a></li>
            <li><a href="#" className="hover:text-indigo-500">Contact</a></li>
            <li><a href="#" className="hover:text-indigo-500">FAQ</a></li>
            <li><a href="#" className="hover:text-indigo-500">Community</a></li>
          </ul>
        </div>

        {/* Documents */}
        <div>
          <h3 className="font-semibold mb-4 text-lg text-gray-900">Documents</h3>
          <ul className="space-y-2 text-gray-600 text-sm">
            <li><a href="#" className="hover:text-indigo-500">Terms of Service</a></li>
            <li><a href="#" className="hover:text-indigo-500">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-indigo-500">Licensing</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom row */}
      <div className="border-t border-gray-200 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} AI-Galaxy. All rights reserved.
        </p>
        <div className="flex space-x-4 mt-4 md:mt-0 text-gray-600">
          <a href="#" className="hover:text-indigo-500"><FaTwitter size={20} /></a>
          <a href="#" className="hover:text-indigo-500"><FaInstagram size={20} /></a>
          <a href="#" className="hover:text-indigo-500"><FaFacebook size={20} /></a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

