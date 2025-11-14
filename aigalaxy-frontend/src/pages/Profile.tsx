import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchUserProfile, ProfileResponse } from "../api/user.api";

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }

    const loadProfile = async () => {
      try {
        setLoading(true);
        const data = await fetchUserProfile();
        setProfile(data);
      } catch (err) {
        console.error("Failed to load profile", err);
        setError("Unable to load your profile right now. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <p className="text-gray-500 dark:text-gray-400">Loading your profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 px-4">
        <p className="text-red-500 mb-4 text-center">{error || "Profile not available."}</p>
        <Link
          to="/"
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
        >
          Go back home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300 pt-20 pb-16 px-4 sm:px-8 lg:px-16">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm px-6 sm:px-10 py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                Welcome back, {profile.username}
              </h1>
              <p className="mt-3 text-gray-600 dark:text-gray-400">
                Manage your account details and preferences.
              </p>
            </div>
            <div className="flex items-center justify-center h-20 w-20 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 text-2xl font-semibold">
              {profile.username.slice(0, 2).toUpperCase()}
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Account
              </h2>
              <dl className="mt-4 space-y-3">
                <div>
                  <dt className="text-xs uppercase text-gray-400 dark:text-gray-500">Name</dt>
                  <dd className="text-base font-medium">{profile.username}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-gray-400 dark:text-gray-500">Email</dt>
                  <dd className="text-base font-medium wrap-break-word">{profile.email}</dd>
                </div>
              </dl>
            </div>

            <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Quick Actions
              </h2>
              <div className="mt-4 space-y-4">
                <Link
                  to="/subscriptions"
                  className="block w-full text-center px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-colors"
                >
                  Manage subscription
                </Link>
                <button
                  type="button"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => navigate("/")}
                >
                  Explore tools
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;


