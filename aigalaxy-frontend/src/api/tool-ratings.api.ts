import { apiClient } from "../utils/apiClient";

export interface ToolRating {
  id: number;
  user: string;
  user_id: number;
  tool: number;
  rating: number;
  review?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateRatingData {
  tool: number;
  rating: number;
  review?: string;
}

export interface UpdateRatingData {
  rating?: number;
  review?: string;
}

export const getToolRatings = async (toolId: number): Promise<ToolRating[]> => {
  const response = await apiClient.get<ToolRating[]>(`/api/tool-ratings/?tool=${toolId}`);
  return response.data;
};

export const createRating = async (data: CreateRatingData): Promise<ToolRating> => {
  const response = await apiClient.post<ToolRating>("/api/tool-ratings/", data);
  return response.data;
};

export const updateRating = async (ratingId: number, data: UpdateRatingData): Promise<ToolRating> => {
  const response = await apiClient.patch<ToolRating>(`/api/tool-ratings/${ratingId}/`, data);
  return response.data;
};

export const deleteRating = async (ratingId: number): Promise<void> => {
  await apiClient.delete(`/api/tool-ratings/${ratingId}/`);
};



