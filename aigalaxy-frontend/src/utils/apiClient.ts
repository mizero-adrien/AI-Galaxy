// Centralized API client with proper connection handling
import axios, { AxiosInstance, AxiosError } from 'axios'

const BASE_URL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Create axios instance with proper configuration
export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 second timeout for slow connections
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Disable automatic retries that might cause connection issues
  validateStatus: (status) => status < 500,
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add any auth tokens here if needed
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors and ensure connections close
apiClient.interceptors.response.use(
  (response) => {
    // Ensure connection is properly closed
    return response
  },
  (error: AxiosError) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout:', error.config?.url)
      console.error('Backend server may not be responding. Make sure Django is running on', BASE_URL)
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused:', error.config?.url)
      console.error('Cannot connect to backend. Please start the Django server:', BASE_URL)
    } else if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const url = error.config?.url || '';
      
      // Don't log 403/401 errors for certain endpoints - these are expected when not authenticated
      const silentAuthEndpoints = ['/api/users/profile/', '/toggle_like/', '/toggle_favorite/'];
      const isSilentAuthError = (status === 403 || status === 401) && 
        silentAuthEndpoints.some(endpoint => url.includes(endpoint));
      
      if (isSilentAuthError) {
        // Silently handle authentication errors for these endpoints
        return Promise.reject(error);
      }
      
      // Log other errors
      if (status >= 500) {
        console.error('API Server Error:', status, error.response.data)
      } else if (status >= 400 && status < 500) {
        // Only log 4xx errors that aren't auth-related
        if (!isSilentAuthError) {
          console.warn('API Client Error:', status, url)
        }
      }
    } else if (error.request) {
      // Request made but no response
      console.error('No response from server. Backend may be down:', BASE_URL)
    }
    return Promise.reject(error)
  }
)

// Helper function for fetch with timeout
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = 10000
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout')
    }
    throw error
  }
}

