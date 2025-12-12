import { apiClient } from "../utils/apiClient";

export interface FavoriteResponse {
  id: number;
  tool: {
    id: number;
    name: string;
    description: string;
    image?: string;
    is_premium: boolean;
    link?: string;
  };
  created_at: string;
}

export interface ToggleFavoriteResponse {
  message: string;
  is_favorite: boolean;
}

export const toggleFavorite = async (toolId: number, userEmail?: string): Promise<ToggleFavoriteResponse> => {
  const response = await apiClient.post<ToggleFavoriteResponse>("/api/favorites/toggle_favorite/", {
    tool_id: toolId,
    user_email: userEmail
  });
  return response.data;
};

export const getUserFavorites = async (): Promise<FavoriteResponse[]> => {
  const response = await apiClient.get<FavoriteResponse[]>("/api/favorites/my_favorites/");
  return response.data;
};

export const checkIfFavorite = async (toolId: number): Promise<boolean> => {
  try {
    // Use the check_favorite endpoint which allows unauthenticated access
    const response = await apiClient.get<{is_favorite: boolean}>("/api/favorites/check_favorite/", {
      params: { tool_id: toolId }
    });
    return response.data.is_favorite;
  } catch (error) {
    console.error("Error checking favorite status:", error);
    return false;
  }
};





