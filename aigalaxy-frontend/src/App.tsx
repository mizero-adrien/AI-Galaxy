import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar.tsx";
import Home from "./pages/Home.tsx";
import Footer from "./Components/Footer.tsx";
import Sidebar from "./Components/Sidebar.tsx";
import About from "./pages/About.tsx";
import CategoriesPage from "./pages/Categories.tsx";
import CategoryDetail from "./pages/CategoryDetail.tsx";
import Profile from "./pages/Profile.tsx";
import Contact from "./pages/Contact.tsx"

// Simple page components
const Subscriptions = () => (
  <div className="p-6 text-center text-gray-800 dark:text-gray-200 text-xl">
    Manage Your Subscriptions
  </div>
);

const Login = () => (
  <div className="p-6 text-center text-gray-800 dark:text-gray-200 text-xl">
    Sign In to Continue
  </div>
);

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
        <Navbar onToggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        {sidebarOpen && <Sidebar onClose={() => setSidebarOpen(false)} />}
        <main className={`pt-16 transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : ''}`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/categories/:slug" element={<CategoryDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/home" element={<Home />} />
            <Route path="/contact" element={<Contact/>} />
          </Routes>
          <Footer />
        </main>
      </div>
    </Router>
  );
};

export default App;

