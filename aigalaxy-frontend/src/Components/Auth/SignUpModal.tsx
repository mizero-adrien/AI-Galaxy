'use client'

import React, { useState, ChangeEvent, FormEvent } from "react";
import { signUpWithEmail, signInWithGoogle, formatFirebaseUser } from "../../utils/firebaseAuth";
import { storage } from "../../utils/storage";
import { syncFirebaseUser } from "../../api/user.api";

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignUpSuccess: (user: any) => void;
  openLogin: () => void;
}

interface FormData {
  email: string;
  password: string;
}

const SignUpModal: React.FC<SignUpModalProps> = ({ isOpen, onClose, onSignUpSuccess, openLogin }) => {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmailSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      // Check Firebase configuration first
      const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
      if (!apiKey || apiKey.trim() === '') {
        setError("Firebase is not configured. Please check your .env.local file. See README_FIREBASE.md for setup instructions.");
        return;
      }

      const userCredential = await signUpWithEmail(formData.email, formData.password);
      const formattedUser = formatFirebaseUser(userCredential.user);
      
      // Sync with Django backend
      try {
        const syncedUser = await syncFirebaseUser(
          formattedUser.email,
          formattedUser.username,
          formattedUser.id
        );
        // If sync successful, use synced user data (has Django ID)
        if (syncedUser) {
          formattedUser.id = syncedUser.id.toString();
        }
      } catch (err) {
        console.warn('Failed to sync with backend, but user can continue:', err);
      }
      
      // Save user data
      await storage.setItem("user", JSON.stringify(formattedUser));
      await storage.setItem("firebase_token", await userCredential.user.getIdToken());
      
      onSignUpSuccess(formattedUser);
      setSuccess("Account created successfully!");
      setFormData({ email: "", password: "" });

      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 1500);
    } catch (err: any) {
      console.error("Signup failed:", err);
      let errorMessage = err.message || "Signup failed. Please try again.";
      
      // Handle Firebase error codes with meaningful messages
      if (err.code) {
        switch (err.code) {
          case 'auth/email-already-in-use':
            errorMessage = "An account with this email address already exists. Please sign in instead, or use a different email address.";
            break;
          case 'auth/weak-password':
            errorMessage = "The password is too weak. Please use a stronger password with at least 6 characters, including letters and numbers.";
            break;
          case 'auth/invalid-email':
            errorMessage = "The email address you entered is not valid. Please check the format and try again.";
            break;
          case 'auth/network-request-failed':
            errorMessage = "Network connection error. Please check your internet connection and try again.";
            break;
          case 'auth/operation-not-allowed':
            errorMessage = "Email/password sign-up is not enabled. Please contact support for assistance.";
            break;
          case 'auth/invalid-credential':
            errorMessage = "Unable to create account. Please check your email and password, and try again.";
            break;
          default:
            errorMessage = "Unable to create account. Please check your information and try again.";
            console.error("Unhandled Firebase sign-up error code:", err.code, err.message);
        }
      } else if (errorMessage.includes("email-already-in-use")) {
        errorMessage = "An account with this email address already exists. Please sign in instead.";
      } else if (errorMessage.includes("weak-password")) {
        errorMessage = "The password is too weak. Please use a stronger password with at least 6 characters.";
      } else if (errorMessage.includes("invalid-email")) {
        errorMessage = "The email address you entered is not valid. Please check and try again.";
      } else if (errorMessage.includes("Firebase is not initialized")) {
        errorMessage = "Firebase is not configured. Please contact support.";
      } else if (errorMessage.toLowerCase().includes("invalid-credential")) {
        errorMessage = "Unable to create account. Please check your email and password, and try again.";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Check Firebase configuration first
      const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
      if (!apiKey || apiKey.trim() === '') {
        setError("Firebase is not configured. Please check your .env.local file. See README_FIREBASE.md for setup instructions.");
        return;
      }

      const userCredential = await signInWithGoogle();
      const formattedUser = formatFirebaseUser(userCredential.user);
      
      // Sync with Django backend
      try {
        const syncedUser = await syncFirebaseUser(
          formattedUser.email,
          formattedUser.username,
          formattedUser.id
        );
        // If sync successful, use synced user data (has Django ID)
        if (syncedUser) {
          formattedUser.id = syncedUser.id.toString();
        }
      } catch (err) {
        console.warn('Failed to sync with backend, but user can continue:', err);
      }
      
      // Save user data
      await storage.setItem("user", JSON.stringify(formattedUser));
      await storage.setItem("firebase_token", await userCredential.user.getIdToken());
      
      onSignUpSuccess(formattedUser);
      setSuccess("Account created successfully!");
      
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 1500);
    } catch (err: any) {
      console.error("Google signup failed:", err);
      let errorMessage = err.message || "Failed to sign up with Google. Please try again.";
      
      if (err.code) {
        switch (err.code) {
          case 'auth/popup-closed-by-user':
            errorMessage = "Google sign-up was cancelled. Please try again if you want to create an account.";
            break;
          case 'auth/popup-blocked':
            errorMessage = "The sign-up popup was blocked by your browser. Please allow popups for this site and try again.";
            break;
          case 'auth/network-request-failed':
            errorMessage = "Network connection error. Please check your internet connection and try again.";
            break;
          case 'auth/account-exists-with-different-credential':
            errorMessage = "An account already exists with this email but using a different sign-in method. Please sign in instead.";
            break;
          case 'auth/invalid-credential':
            errorMessage = "Google sign-up failed. Please try again or use email/password to create an account.";
            break;
          default:
            errorMessage = "Unable to sign up with Google. Please try again or use email/password to create an account.";
            console.error("Unhandled Google sign-up error code:", err.code, err.message);
        }
      } else if (err.message?.includes("popup-closed-by-user")) {
        errorMessage = "Google sign-up was cancelled. Please try again if you want to create an account.";
      } else if (err.message?.includes("popup-blocked")) {
        errorMessage = "The sign-up popup was blocked. Please allow popups and try again.";
      } else if (err.message?.includes("Firebase is not initialized")) {
        errorMessage = "Firebase is not configured. Please contact support.";
      } else if (err.message?.toLowerCase().includes("invalid-credential")) {
        errorMessage = "Google sign-up failed. Please try again or use email/password to create an account.";
      }
      
      setError(errorMessage);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-2xl p-4 sm:p-6 relative my-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 dark:text-gray-300 hover:text-red-500 text-xl sm:text-2xl"
          aria-label="Close modal"
        >
          ✕
        </button>

        <h2 className="text-xl sm:text-2xl font-bold text-center text-indigo-600 dark:text-indigo-400 mb-4">
          Create Your Account
        </h2>

        <div className="flex flex-col md:flex-row gap-4 md:gap-0">
          {/* Google sign-up button */}
          <div className="flex flex-col md:w-1/2 md:pr-4">
            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={googleLoading || loading}
              className="w-full px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {googleLoading ? (
                "Signing up..."
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="hidden md:flex items-center justify-center relative md:w-[2px] bg-gray-300 dark:bg-gray-700 mx-2">
            <span className="absolute bg-white dark:bg-gray-900 px-2 text-gray-500">or</span>
          </div>
          <div className="md:hidden text-center text-gray-500 py-2">or</div>

          {/* Signup form */}
          <form
            onSubmit={handleEmailSignup}
            className="flex flex-col space-y-3 md:w-1/2 md:pl-4"
          >
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              required
              disabled={loading || googleLoading}
            />
            <input
              type="password"
              name="password"
              placeholder="Password (min. 6 characters)"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              required
              minLength={6}
              disabled={loading || googleLoading}
            />
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-500 text-sm">{success}</p>}
          </form>
        </div>

        <p className="text-center text-gray-600 dark:text-gray-400 mt-4">
          Already have an account?{" "}
          <span
            onClick={() => {
              onClose();
              openLogin();
            }}
            className="text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline"
          >
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignUpModal;
