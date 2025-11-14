// src/components/Auth/LoginModal.tsx
import React, { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { loginUser } from "../../api/auth.api.ts";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
  openRegister: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  openRegister,
}) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await loginUser(formData);
      onLoginSuccess(response.user);
      localStorage.setItem("user", JSON.stringify(response.user));
      onClose();
    } catch (err) {
      console.error("Login failed:", err);
      if (axios.isAxiosError(err)) {
        const detail =
          err.response?.data?.message ||
          err.response?.data?.non_field_errors?.[0] ||
          err.response?.data?.detail;
        setError(detail || "Invalid email or password");
      } else {
        setError("Invalid email or password");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 dark:text-gray-300 hover:text-red-500"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-center text-indigo-600 dark:text-indigo-400 mb-4">
          Sign In
        </h2>

        <div className="flex flex-col md:flex-row">
          {/* Social login buttons (placeholders) */}
          <div className="flex flex-col space-y-3 md:w-1/2 md:pr-4">
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500">
              Facebook
            </button>
            <button className="w-full px-4 py-2 bg-sky-400 text-white rounded hover:bg-sky-300">
              Twitter
            </button>
            <button className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500">
              Google
            </button>
          </div>

          {/* Divider */}
          <div className="hidden md:flex items-center justify-center relative md:w-[2px] bg-gray-300 mx-2">
            <span className="absolute bg-white dark:bg-gray-900 px-2 text-gray-500">or</span>
          </div>

          {/* Login form */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col space-y-3 md:w-1/2 md:pl-4 mt-4 md:mt-0"
          >
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-800"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-800"
              required
            />
            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </form>
        </div>

        <p className="text-center text-gray-600 dark:text-gray-400 mt-4">
          Don’t have an account?{" "}
          <span
            onClick={openRegister}
            className="text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline"
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoginModal;


