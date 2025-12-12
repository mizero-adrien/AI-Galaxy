import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const client = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export interface ProfileResponse {
  id: number;
  username: string;
  email: string;
}

export interface ProfileResponseWithMessage extends ProfileResponse {
  message?: string;
}

export const fetchUserProfile = async (): Promise<ProfileResponse | null> => {
  try {
    const response = await client.get<ProfileResponseWithMessage>("/api/users/profile/", {
      timeout: 15000 // 15 second timeout
    });
    
    // Check if user is authenticated (has id)
    if (response.data && (response.data.id === null || response.data.id === undefined)) {
      // User is not authenticated with Django (Firebase user)
      return null;
    }
    
    // Validate response data
    if (!response.data || !response.data.id) {
      return null;
    }
    
    return response.data as ProfileResponse;
  } catch (error: any) {
    // 403/401 errors should not happen now, but keep for safety
    if (error.response?.status === 403 || error.response?.status === 401) {
      // User is not authenticated - this is normal, don't log as error
      return null;
    }
    // For network errors or timeouts, log and rethrow
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      console.error('Profile request timed out', error);
      throw new Error('Request timed out. Please check your connection and try again.');
    }
    console.error('Failed to load profile', error);
    throw error;
  }
};

/**
 * Sync Firebase user with Django backend
 * Creates a user in Django if they don't exist
 */
export const syncFirebaseUser = async (email: string, username: string, firebaseUid?: string): Promise<ProfileResponse | null> => {
  try {
    const response = await client.post<{ message: string; user: ProfileResponse }>("/api/users/sync_firebase_user/", {
      email,
      username,
      firebase_uid: firebaseUid
    }, {
      timeout: 15000
    });
    
    return response.data.user;
  } catch (error: any) {
    console.error('Failed to sync Firebase user with backend', error);
    // Don't throw - allow user to continue even if sync fails
    // They can manually sync later
    return null;
  }
};






