import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const client = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export interface ProfileResponse {
  id: number;
  username: string;
  email: string;
}

export const fetchUserProfile = async (): Promise<ProfileResponse> => {
  const response = await client.get<ProfileResponse>("/api/users/profile/");
  return response.data;
};





