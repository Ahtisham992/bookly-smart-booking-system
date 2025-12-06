// src/services/api/bookingService.js
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

// Booking API functions
export const bookingService = {
  // Create new booking
  async createBooking(bookingData) {
    try {
      const response = await api.post('/bookings', bookingData)
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Booking created successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create booking'
      }
    }
  },

  // Get customer bookings
  async getCustomerBookings(params = {}) {
    try {
      const response = await api.get('/bookings/my-bookings', { params })
      return {
        success: true,
        data: response.data.data || response.data,
        pagination: response.data.pagination
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch bookings'
      }
    }
  },

  // Get provider bookings
  async getProviderBookings(params = {}) {
    try {
      const response = await api.get('/bookings/provider', { params })
      return {
        success: true,
        data: response.data.data || response.data,
        pagination: response.data.pagination
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch bookings'
      }
    }
  },

  // Get booking by ID
  async getBookingById(bookingId) {
    try {
      const response = await api.get(`/bookings/${bookingId}`)
      return {
        success: true,
        data: response.data.data || response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch booking'
      }
    }
  },

  // Update booking status (provider)
  async updateBookingStatus(bookingId, status, notes = '') {
    try {
      const response = await api.patch(`/bookings/provider/${bookingId}/status`, {
        status,
        notes
      })
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Booking status updated'
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update booking status'
      }
    }
  },

  // Cancel booking
  async cancelBooking(bookingId, reason = '') {
    try {
      const response = await api.patch(`/bookings/${bookingId}/cancel`, { reason })
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Booking cancelled successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to cancel booking'
      }
    }
  },

  // Get booking statistics
  async getBookingStats() {
    try {
      const response = await api.get('/bookings/stats')
      return {
        success: true,
        data: response.data.data || response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch booking statistics'
      }
    }
  }
}

export default bookingService
