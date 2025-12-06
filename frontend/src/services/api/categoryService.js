// src/services/api/categoryService.js
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

// Add auth token to requests (optional for categories)
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

// Category API functions
export const categoryService = {
  // Get all categories
  async getAllCategories(params = {}) {
    try {
      const response = await api.get('/categories', { params })
      return {
        success: true,
        data: response.data.data || response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch categories'
      }
    }
  },

  // Get category tree
  async getCategoryTree() {
    try {
      const response = await api.get('/categories/tree')
      return {
        success: true,
        data: response.data.data || response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch category tree'
      }
    }
  },

  // Get popular categories
  async getPopularCategories() {
    try {
      const response = await api.get('/categories/popular')
      return {
        success: true,
        data: response.data.data || response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch popular categories'
      }
    }
  },

  // Search categories
  async searchCategories(query) {
    try {
      const response = await api.get('/categories/search', {
        params: { q: query }
      })
      return {
        success: true,
        data: response.data.data || response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to search categories'
      }
    }
  },

  // Get category by ID
  async getCategoryById(categoryId) {
    try {
      const response = await api.get(`/categories/${categoryId}`)
      return {
        success: true,
        data: response.data.data || response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch category'
      }
    }
  },

  // Create category (admin only)
  async createCategory(categoryData) {
    try {
      const response = await api.post('/categories', categoryData)
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Category created successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create category'
      }
    }
  },

  // Update category (admin only)
  async updateCategory(categoryId, categoryData) {
    try {
      const response = await api.put(`/categories/${categoryId}`, categoryData)
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Category updated successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update category'
      }
    }
  },

  // Delete category (admin only)
  async deleteCategory(categoryId) {
    try {
      await api.delete(`/categories/${categoryId}`)
      return {
        success: true,
        message: 'Category deleted successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete category'
      }
    }
  }
}

export default categoryService
