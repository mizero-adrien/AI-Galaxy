import axios from "axios";
import { SignupData, LoginData, AuthResponse } from "../types/auth.types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const client = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Properly close connections
  httpAgent: typeof window === 'undefined' ? undefined : undefined,
  httpsAgent: typeof window === 'undefined' ? undefined : undefined,
});

export const registerUser = async (data: SignupData): Promise<AuthResponse> => {
  const res = await client.post<AuthResponse>("/api/users/signup/", data);
  return res.data;
};

export const loginUser = async (data: LoginData): Promise<AuthResponse> => {
  const res = await client.post<AuthResponse>("/api/users/login/", data);
  return res.data;
};
