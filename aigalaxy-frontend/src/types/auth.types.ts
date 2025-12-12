// src/types/auth.types.ts
export interface SignupData {
  email: string;
  password: string;
  username?: string; // Optional, will be auto-generated from email if not provided
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

