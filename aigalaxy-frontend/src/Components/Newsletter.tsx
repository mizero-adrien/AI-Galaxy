'use client'

import { useState } from 'react'
import { apiClient } from '../utils/apiClient'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await apiClient.post('/api/newsletter/subscribe/', {
        email: email
      })

      setSuccess(true)
      setEmail('')
      setTimeout(() => setSuccess(false), 5000)
    } catch (err: any) {
      console.error('Newsletter subscription error:', err)
      if (err.response?.data?.error) {
        setError(err.response.data.error)
      } else {
        setError('Failed to subscribe. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 lg:px-16 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Stay Updated with AI Galaxy
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8 text-base sm:text-lg">
          Get the latest AI tools, trends, and insights delivered to your inbox
        </p>
        
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent text-sm sm:text-base"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base whitespace-nowrap"
            >
              {loading ? 'Subscribing...' : 'Subscribe'}
            </button>
          </div>
          
          {success && (
            <p className="mt-4 text-green-600 dark:text-green-400 text-sm sm:text-base">
              ✓ Successfully subscribed! Check your email.
            </p>
          )}
          {error && (
            <p className="mt-4 text-red-600 dark:text-red-400 text-sm sm:text-base">
              {error}
            </p>
          )}
        </form>
      </div>
    </section>
  )
}


