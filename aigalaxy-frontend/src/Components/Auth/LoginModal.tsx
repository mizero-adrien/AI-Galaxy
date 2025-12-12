'use client'

import React, { useState, ChangeEvent, FormEvent } from "react";
import { signInWithEmail, signInWithGoogle, formatFirebaseUser } from "../../utils/firebaseAuth";
import { storage } from "../../utils/storage";
import { syncFirebaseUser } from "../../api/user.api";

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
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmailLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Check Firebase configuration first
      const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
      if (!apiKey || apiKey.trim() === '') {
        setError("Firebase is not configured. Please check your .env.local file. See README_FIREBASE.md for setup instructions.");
        return;
      }

      const userCredential = await signInWithEmail(formData.email, formData.password);
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
      
      onLoginSuccess(formattedUser);
      onClose();
      setFormData({ email: "", password: "" });
    } catch (err: any) {
      console.error("Login failed:", err);
      let errorMessage = "Invalid email or password";
      
      // Extract error code - Firebase errors can have code in different places
      const errorCode = err.code || err.error?.code || (err.message?.includes('auth/') ? err.message.match(/auth\/[a-z-]+/)?.[0] : null);
      
      // Handle Firebase error codes with meaningful messages
      if (errorCode) {
        switch (errorCode) {
          case 'auth/user-not-found':
            errorMessage = "No account found with this email address. Please check your email or sign up for a new account.";
            break;
          case 'auth/wrong-password':
            errorMessage = "The password you entered is incorrect. Please try again or reset your password.";
            break;
          case 'auth/invalid-email':
            errorMessage = "The email address you entered is not valid. Please check and try again.";
            break;
          case 'auth/too-many-requests':
            errorMessage = "Too many failed login attempts. Please wait a few minutes and try again, or reset your password.";
            break;
          case 'auth/network-request-failed':
            errorMessage = "Network connection error. Please check your internet connection and try again.";
            break;
          case 'auth/invalid-credential':
            errorMessage = "The email or password you entered is incorrect. Please check your credentials and try again. If you don't have an account, please sign up first.";
            break;
          case 'auth/user-disabled':
            errorMessage = "This account has been disabled. Please contact support for assistance.";
            break;
          case 'auth/operation-not-allowed':
            errorMessage = "Email/password sign-in is not enabled. Please contact support.";
            break;
          case 'auth/weak-password':
            errorMessage = "The password is too weak. Please use a stronger password with at least 6 characters.";
            break;
          case 'auth/email-already-in-use':
            errorMessage = "An account with this email already exists. Please sign in instead.";
            break;
          case 'auth/requires-recent-login':
            errorMessage = "For security reasons, please sign in again to complete this action.";
            break;
          default:
            // For unknown errors, provide a helpful message
            errorMessage = `Unable to sign in: ${err.message || errorCode || 'Unknown error'}. Please check your email and password, or try again later.`;
            console.error("Unhandled Firebase error code:", errorCode, err);
        }
      } else {
        // Fallback: check error message for common patterns
        const errMsg = err.message || '';
        if (errMsg.includes("user-not-found") || errMsg.includes("no user record")) {
          errorMessage = "No account found with this email address. Please check your email or sign up for a new account.";
        } else if (errMsg.includes("wrong-password") || errMsg.includes("invalid-credential") || errMsg.includes("invalid credential")) {
          errorMessage = "The email or password you entered is incorrect. Please check your credentials and try again. If you don't have an account, please sign up first.";
        } else if (errMsg.includes("invalid-email")) {
          errorMessage = "The email address you entered is not valid. Please check and try again.";
        } else if (errMsg.includes("too-many-requests")) {
          errorMessage = "Too many failed login attempts. Please wait a few minutes and try again.";
        } else if (errMsg.includes("Firebase is not initialized") || errMsg.includes("not configured")) {
          errorMessage = "Firebase is not configured. Please contact support.";
        } else {
          errorMessage = errMsg || "Unable to sign in. Please check your email and password, or try again later.";
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);

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
      
      onLoginSuccess(formattedUser);
      onClose();
    } catch (err: any) {
      console.error("Google login failed:", err);
      let errorMessage = err.message || "Failed to sign in with Google. Please try again.";
      
      if (err.code) {
        switch (err.code) {
          case 'auth/popup-closed-by-user':
            errorMessage = "Google sign-in was cancelled. Please try again if you want to sign in.";
            break;
          case 'auth/popup-blocked':
            errorMessage = "The sign-in popup was blocked by your browser. Please allow popups for this site and try again.";
            break;
          case 'auth/network-request-failed':
            errorMessage = "Network connection error. Please check your internet connection and try again.";
            break;
          case 'auth/account-exists-with-different-credential':
            errorMessage = "An account already exists with this email but using a different sign-in method. Please use email/password to sign in.";
            break;
          case 'auth/invalid-credential':
            errorMessage = "Google sign-in failed. Please try again or use email/password to sign in.";
            break;
          default:
            errorMessage = "Unable to sign in with Google. Please try again or use email/password to sign in.";
            console.error("Unhandled Google sign-in error code:", err.code, err.message);
        }
      } else if (err.message?.includes("popup-closed-by-user")) {
        errorMessage = "Google sign-in was cancelled. Please try again if you want to sign in.";
      } else if (err.message?.includes("popup-blocked")) {
        errorMessage = "The sign-in popup was blocked. Please allow popups and try again.";
      } else if (err.message?.includes("Firebase is not initialized")) {
        errorMessage = "Firebase is not configured. Please contact support.";
      } else if (err.message?.toLowerCase().includes("invalid-credential")) {
        errorMessage = "Google sign-in failed. Please try again or use email/password to sign in.";
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
          Sign In
        </h2>

        <div className="flex flex-col md:flex-row gap-4 md:gap-0">
          {/* Google sign-in button */}
          <div className="flex flex-col md:w-1/2 md:pr-4">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading}
              className="w-full px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {googleLoading ? (
                "Signing in..."
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

          {/* Login form */}
          <form
            onSubmit={handleEmailLogin}
            className="flex flex-col space-y-3 md:w-1/2 md:pl-4"
          >
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              required
              disabled={loading || googleLoading}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              required
              disabled={loading || googleLoading}
            />
            <button
              type="submit"
              className="w-full py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={loading || googleLoading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
            {error && (
              <div className="text-red-500 text-sm">
                <p>{error}</p>
                {(error.includes("No account found") || error.includes("incorrect") || error.includes("invalid-credential")) && (
                  <p className="mt-2 text-xs">
                    Don't have an account?{" "}
                    <span
                      onClick={() => {
                        onClose();
                        openRegister();
                      }}
                      className="text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline font-medium"
                    >
                      Sign up here
                    </span>
                  </p>
                )}
              </div>
            )}
          </form>
        </div>

        <p className="text-center text-gray-600 dark:text-gray-400 mt-4">
          Don't have an account?{" "}
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
