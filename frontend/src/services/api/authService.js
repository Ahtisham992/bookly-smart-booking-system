// src/services/api/authService.js - Fixed version
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    // Add auth token if available
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    console.log('Making API call to:', `${API_BASE_URL}${endpoint}`) // Debug log

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
    const data = await response.json()

    console.log('API response:', { status: response.status, data }) // Debug log

    if (!response.ok) {
      // Check if user was deleted, deactivated, or banned
      if (data.code === 'USER_DELETED' || data.code === 'USER_DEACTIVATED' || data.code === 'USER_BANNED') {
        // Clear local storage and redirect to login
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        
        // Show alert with reason
        if (data.code === 'USER_BANNED') {
          alert(data.message || 'Your account has been banned')
        }
        
        window.location.href = '/login'
        throw new Error(data.message || 'Your account is no longer active')
      }
      throw new Error(data.message || data.error || 'Something went wrong')
    }

    return data
  } catch (error) {
    console.error('API call error:', error) // Debug log
    // Handle network errors
    if (error instanceof TypeError) {
      throw new Error('Network error. Please check your connection.')
    }
    throw error
  }
}

// Register a new user
export const registerUser = async (userData) => {
  try {
    console.log('Registering user:', userData) // Debug log
    const response = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })

    console.log('Registration response:', response) // Debug log

    // If registration includes auto-login (returns token)
    if (response.token) {
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
    }

    return {
      success: true,
      data: response.data || response,
      user: response.user,
      token: response.token,
      message: response.message || 'Registration successful'
    }
  } catch (error) {
    console.error('Registration error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Login user
export const loginUser = async (credentials) => {
  try {
    console.log('Logging in user:', credentials.email) // Debug log
    const response = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })

    console.log('Login response:', response) // Debug log

    // Handle different response structures
    const userData = response.user || response.data?.user
    const userToken = response.token || response.data?.token

    // Store token and user data
    if (userToken && userData) {
      localStorage.setItem('token', userToken)
      localStorage.setItem('user', JSON.stringify(userData))
      console.log('Stored in localStorage - token:', !!userToken, 'user:', !!userData)
    }

    return {
      success: true,
      data: response.data || response,
      user: userData,
      token: userToken,
      message: response.message || 'Login successful'
    }
  } catch (error) {
    console.error('Login error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Get current user (updated endpoint)
export const getCurrentUser = async () => {
  try {
    const response = await apiCall('/auth/me', {
      method: 'GET',
    })

    return {
      success: true,
      data: response.data || response.user,
      user: response.data || response.user
    }
  } catch (error) {
    console.error('Get current user error:', error)
    // If token is invalid, clear local storage
    if (error.message.includes('token') || error.message.includes('unauthorized')) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    
    return {
      success: false,
      error: error.message
    }
  }
}

// Logout (client-side cleanup)
export const logoutUser = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  return { success: true }
}

// Update user profile (fixed endpoint)
export const updateUserProfile = async (userData) => {
  try {
    const response = await apiCall('/auth/updatedetails', { // Fixed endpoint
      method: 'PUT',
      body: JSON.stringify(userData),
    })

    // Update stored user data
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data))
    }

    return {
      success: true,
      data: response.data,
      message: response.message || 'Profile updated successfully'
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

// Change password
export const changePassword = async (passwordData) => {
  try {
    const response = await apiCall('/auth/updatepassword', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    })

    return {
      success: true,
      message: response.message || 'Password updated successfully'
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

// Forgot password
export const forgotPassword = async (email) => {
  try {
    const response = await apiCall('/auth/forgotpassword', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })

    return {
      success: true,
      message: response.message || 'Password reset email sent'
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

// Reset password
export const resetPassword = async (token, password) => {
  try {
    const response = await apiCall(`/auth/resetpassword/${token}`, {
      method: 'PUT',
      body: JSON.stringify({ password }),
    })

    return {
      success: true,
      message: response.message || 'Password reset successful'
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}