'use client'

import { useState } from 'react'
import axios from 'axios'
import { PlusIcon } from '@heroicons/react/24/outline'

interface SubmitToolModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SubmitToolModal({ isOpen, onClose }: SubmitToolModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    image: '',
    features: '',
    howItWorks: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { apiClient } = await import('../utils/apiClient')
      await apiClient.post('/api/submit-tool/', {
        name: formData.name,
        email: formData.email,
        image: formData.image,
        features: formData.features || null,
        how_it_works: formData.howItWorks || null
      })

      setSuccess(true)
      setFormData({
        name: '',
        email: '',
        image: '',
        features: '',
        howItWorks: ''
      })
      setTimeout(() => {
        setSuccess(false)
        onClose()
      }, 2000)
    } catch (err) {
      console.error('Tool submission error:', err)
      setError('Failed to submit tool. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-2xl p-4 sm:p-6 relative my-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 dark:text-gray-300 hover:text-red-500 text-xl sm:text-2xl"
          aria-label="Close modal"
        >
          ✕
        </button>

        <h2 className="text-xl sm:text-2xl font-bold text-center text-indigo-600 dark:text-indigo-400 mb-6">
          Submit an AI Tool
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tool Name - Required */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tool Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter tool name"
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm sm:text-base"
            />
          </div>

          {/* Email - Required */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contact Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm sm:text-base"
            />
          </div>

          {/* Image URL - Required */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Image URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://example.com/image.png"
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm sm:text-base"
            />
          </div>

          {/* Features - Optional */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Features (Optional)
            </label>
            <textarea
              name="features"
              value={formData.features}
              onChange={handleChange}
              placeholder="List the key features of the tool..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm sm:text-base"
            />
          </div>

          {/* How It Works - Optional */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              How It Works (Optional)
            </label>
            <textarea
              name="howItWorks"
              value={formData.howItWorks}
              onChange={handleChange}
              placeholder="Describe how the tool works..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm sm:text-base"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          {success && (
            <p className="text-green-500 text-sm">✓ Tool submitted successfully! We'll review it soon.</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {loading ? 'Submitting...' : 'Submit Tool'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function SubmitToolButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <section className="bg-gray-50 dark:bg-gray-900 py-8 sm:py-12 px-4 sm:px-6 md:px-8 lg:px-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Have an AI Tool to Share?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-base sm:text-lg">
            Submit your AI tool to our directory and help others discover it
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-sm sm:text-base"
          >
            <PlusIcon className="h-5 w-5" />
            Submit a Tool
          </button>
        </div>
      </section>
      <SubmitToolModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}


