import { useState } from "react";
import { registerUser, loginUser } from "../api/auth.api";
import { SignupData, LoginData, AuthResponse } from "../types/auth.types";

export const useAuth = () => {
  const [user, setUser] = useState<AuthResponse["user"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signup = async (data: SignupData) => {
    try {
      setLoading(true);
      const result = await registerUser(data);
      setUser(result.user);
      return result;
    } catch (err: any) {
      setError(err.response?.data?.message || "Signup failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: LoginData) => {
    try {
      setLoading(true);
      const result = await loginUser(data);
      setUser(result.user);
      return result;
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { user, signup, login, loading, error };
};
