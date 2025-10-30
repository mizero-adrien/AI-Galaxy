import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar.jsx";
import Home from "./pages/Home.jsx"
import Footer from "./Components/Footer.jsx"
import Sidebar from "./Components/Sidebar.jsx";


// Simple page components
// const Home = () => <div className="p-6 text-center text-gray-800 dark:text-gray-200 text-xl">Welcome to <span className="text-indigo-600">AI Galaxy</span> </div>;
const Category = () => <div className="p-6 text-center text-gray-800 dark:text-gray-200 text-xl">Browse by Category</div>;
const About = () => <div className="p-6 text-center text-gray-800 dark:text-gray-200 text-xl">About AI Galaxy</div>;
const Subscriptions = () => <div className="p-6 text-center text-gray-800 dark:text-gray-200 text-xl">Manage Your Subscriptions</div>;
const Login = () => <div className="p-6 text-center text-gray-800 dark:text-gray-200 text-xl">Sign In to Continue</div>;

const App = () => {
  return (
    <Router>
      <Sidebar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
        <Navbar />

        <main className="pt-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/category" element={<Category />} />
            <Route path="/about" element={<About />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/login" element={<Login />} />
            <Route path="/home" element={<Home />} />

          </Routes>
        </main>

      </div>

    </Router>
  );
};

export default App;

