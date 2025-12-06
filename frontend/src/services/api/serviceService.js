// src/services/api/serviceService.js
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Service API functions
export const serviceService = {
  // Get all services
  async getAllServices(params = {}) {
    try {
      const response = await api.get('/services', { params })
      return {
        success: true,
        data: response.data.data || response.data,
        pagination: response.data.pagination
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch services'
      }
    }
  },

  // Get service by ID
  async getServiceById(serviceId) {
    try {
      const response = await api.get(`/services/${serviceId}`)
      return {
        success: true,
        data: response.data.data || response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch service'
      }
    }
  },

  // Create new service
  async createService(serviceData) {
    try {
      const response = await api.post('/services', serviceData)
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Service created successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create service'
      }
    }
  },

  // Update service
  async updateService(serviceId, serviceData) {
    try {
      const response = await api.put(`/services/${serviceId}`, serviceData)
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Service updated successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update service'
      }
    }
  },

  // Delete service
  async deleteService(serviceId) {
    try {
      await api.delete(`/services/${serviceId}`)
      return {
        success: true,
        message: 'Service deleted successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete service'
      }
    }
  },

  // Get services by category
  async getServicesByCategory(categoryId, params = {}) {
    try {
      const response = await api.get(`/services/category/${categoryId}`, { params })
      return {
        success: true,
        data: response.data.data || response.data,
        pagination: response.data.pagination
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch services'
      }
    }
  },

  // Get services by provider
  async getServicesByProvider(providerId, params = {}) {
    try {
      const response = await api.get(`/services/provider/${providerId}`, { params })
      return {
        success: true,
        data: response.data.data || response.data,
        pagination: response.data.pagination
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch provider services'
      }
    }
  },

  // Upload service photo
  async uploadServicePhoto(serviceId, photoFile) {
    try {
      const formData = new FormData()
      formData.append('image', photoFile)
      
      const response = await api.put(`/services/${serviceId}/photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Photo uploaded successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to upload photo'
      }
    }
  }
}

export default serviceService
