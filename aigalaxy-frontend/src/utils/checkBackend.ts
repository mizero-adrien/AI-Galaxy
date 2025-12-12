// Utility to check if backend is accessible
export async function checkBackendConnection(baseURL: string): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second check
    
    const response = await fetch(`${baseURL}/api/categories/`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    })
    
    clearTimeout(timeoutId)
    return response.ok || response.status < 500
  } catch (error) {
    console.error('Backend connection check failed:', error)
    return false
  }
}


