// Async localStorage utilities for better performance
export const storage = {
  async getItem(key: string): Promise<string | null> {
    if (typeof window === 'undefined') return null
    try {
      return await Promise.resolve(localStorage.getItem(key))
    } catch (error) {
      console.error(`Error getting ${key} from localStorage:`, error)
      return null
    }
  },

  async setItem(key: string, value: string): Promise<boolean> {
    if (typeof window === 'undefined') return false
    try {
      await Promise.resolve(localStorage.setItem(key, value))
      return true
    } catch (error) {
      console.error(`Error setting ${key} in localStorage:`, error)
      return false
    }
  },

  async removeItem(key: string): Promise<boolean> {
    if (typeof window === 'undefined') return false
    try {
      await Promise.resolve(localStorage.removeItem(key))
      return true
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error)
      return false
    }
  },

  async getUser(): Promise<any | null> {
    const userStr = await this.getItem('user')
    if (!userStr) return null
    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  },

  async setUser(user: any): Promise<boolean> {
    return await this.setItem('user', JSON.stringify(user))
  },

  async removeUser(): Promise<boolean> {
    return await this.removeItem('user')
  },
}


