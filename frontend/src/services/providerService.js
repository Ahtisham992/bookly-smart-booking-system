// src/services/providerService.js
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const token = user.token || localStorage.getItem('token')
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear auth data and redirect to login
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    
    return Promise.reject(error)
  }
)

// Provider API functions
export const providerService = {
  // Get all providers
  async getAllProviders(params = {}) {
    try {
      const response = await api.get('/providers', { params })
      return {
        success: true,
        data: response.data.data || response.data,
        meta: response.data.meta
      }
    } catch (error) {
      console.error('Get all providers error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch providers'
      }
    }
  },

  // Get provider by ID
  async getProviderById(providerId) {
    try {
      const response = await api.get(`/providers/${providerId}`)
      return {
        success: true,
        data: response.data.data || response.data
      }
    } catch (error) {
      console.error('Get provider error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch provider'
      }
    }
  },

  // Create new provider
  async createProvider(providerData) {
    try {
      const response = await api.post('/providers', providerData)
      return {
        success: true,
        data: response.data.data || response.data
      }
    } catch (error) {
      console.error('Create provider error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create provider'
      }
    }
  },

  // Update provider
  async updateProvider(providerId, providerData) {
    try {
      const response = await api.put(`/providers/${providerId}`, providerData)
      return {
        success: true,
        data: response.data.data || response.data
      }
    } catch (error) {
      console.error('Update provider error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update provider'
      }
    }
  },

  // Delete provider
  async deleteProvider(providerId) {
    try {
      await api.delete(`/providers/${providerId}`)
      return {
        success: true
      }
    } catch (error) {
      console.error('Delete provider error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete provider'
      }
    }
  },

  // Search providers
  async searchProviders(query, filters = {}) {
    try {
      const params = { 
        search: query,
        ...filters 
      }
      const response = await api.get('/providers/search', { params })
      return {
        success: true,
        data: response.data.data || response.data
      }
    } catch (error) {
      console.error('Search providers error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to search providers'
      }
    }
  },

  // Get providers by category
  async getProvidersByCategory(category) {
    try {
      const response = await api.get(`/providers/category/${category}`)
      return {
        success: true,
        data: response.data.data || response.data
      }
    } catch (error) {
      console.error('Get providers by category error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch providers'
      }
    }
  },

  // Get provider's services
  async getProviderServices(providerId) {
    try {
      const response = await api.get(`/providers/${providerId}/services`)
      return {
        success: true,
        data: response.data.data || response.data
      }
    } catch (error) {
      console.error('Get provider services error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch provider services'
      }
    }
  },

  // Update provider services
  async updateProviderServices(providerId, serviceIds) {
    try {
      const response = await api.put(`/providers/${providerId}/services`, { serviceIds })
      return {
        success: true,
        data: response.data.data || response.data
      }
    } catch (error) {
      console.error('Update provider services error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update provider services'
      }
    }
  },

  // Get provider reviews
  async getProviderReviews(providerId, params = {}) {
    try {
      const response = await api.get(`/providers/${providerId}/reviews`, { params })
      return {
        success: true,
        data: response.data.data || response.data
      }
    } catch (error) {
      console.error('Get provider reviews error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch reviews'
      }
    }
  },

  // Upload provider image
  async uploadProviderImage(providerId, imageFile) {
    try {
      const formData = new FormData()
      formData.append('image', imageFile)
      
      const response = await api.post(`/providers/${providerId}/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      return {
        success: true,
        data: response.data.data || response.data
      }
    } catch (error) {
      console.error('Upload provider image error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to upload image'
      }
    }
  },

  // Get top-rated providers
  async getTopRatedProviders(limit = 10) {
    try {
      const response = await api.get('/providers/top-rated', {
        params: { limit }
      })
      return {
        success: true,
        data: response.data.data || response.data
      }
    } catch (error) {
      console.error('Get top-rated providers error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch top-rated providers'
      }
    }
  },

  // Get provider availability
  async getProviderAvailability(providerId, date) {
    try {
      const response = await api.get(`/providers/${providerId}/availability`, {
        params: { date }
      })
      return {
        success: true,
        data: response.data.data || response.data
      }
    } catch (error) {
      console.error('Get provider availability error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch availability'
      }
    }
  }
}

export default providerService