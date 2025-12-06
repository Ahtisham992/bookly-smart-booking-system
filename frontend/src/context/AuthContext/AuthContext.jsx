// src/context/AuthContext/AuthContext.jsx - Fixed version with better state management
import { createContext, useContext, useState, useEffect } from 'react'
import { 
  registerUser, 
  loginUser, 
  getCurrentUser, 
  logoutUser,
  updateUserProfile,
  changePassword 
} from '../../services/api/authService'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Initialize auth state on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token')
        const storedUser = localStorage.getItem('user')

        console.log('Initializing auth, stored token:', !!storedToken)

        if (storedToken && storedUser) {
          setToken(storedToken)
          
          try {
            const parsedUser = JSON.parse(storedUser)
            console.log('Parsed stored user:', parsedUser)
            
            // Optionally verify token with backend
            const result = await getCurrentUser()
            if (result.success && result.user) {
              console.log('Token verified, setting user:', result.user)
              setUser(result.user)
              localStorage.setItem('user', JSON.stringify(result.user))
            } else {
              // Token invalid, use stored user data
              console.log('Token invalid, using stored user data')
              setUser(parsedUser)
            }
          } catch (error) {
            console.error('Error parsing stored user:', error)
            localStorage.removeItem('user')
            localStorage.removeItem('token')
            setToken(null)
            setUser(null)
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  // Login function
  const login = async (email, password) => {
    try {
      console.log('AuthContext login called with:', email)
      const result = await loginUser({ email, password })
      
      console.log('Login API result:', result)
      
      if (result.success && result.user && result.token) {
        console.log('Setting user and token in AuthContext')
        
        // Set state first
        setUser(result.user)
        setToken(result.token)
        
        // Then update localStorage
        localStorage.setItem('token', result.token)
        localStorage.setItem('user', JSON.stringify(result.user))
        
        console.log('Auth state updated successfully')
        
        return { 
          success: true, 
          user: result.user,
          token: result.token,
          message: result.message 
        }
      } else {
        console.log('Login failed in AuthContext:', result.error)
        return { 
          success: false, 
          error: result.error || 'Login failed' 
        }
      }
    } catch (error) {
      console.error('Login error in AuthContext:', error)
      return { 
        success: false, 
        error: 'Login failed. Please try again.' 
      }
    }
  }

  // Register function
  const register = async (userData) => {
    try {
      console.log('AuthContext register called')
      const result = await registerUser(userData)
      
      if (result.success) {
        // Check if auto-login happened (token returned)
        if (result.token && result.user) {
          console.log('Auto-login after registration')
          setUser(result.user)
          setToken(result.token)
          localStorage.setItem('token', result.token)
          localStorage.setItem('user', JSON.stringify(result.user))
        }
        
        return { 
          success: true, 
          user: result.user,
          token: result.token,
          message: result.message 
        }
      } else {
        return { 
          success: false, 
          error: result.error 
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
      return { 
        success: false, 
        error: 'Registration failed. Please try again.' 
      }
    }
  }

  // Logout function
  const logout = () => {
    try {
      console.log('Logging out user')
      logoutUser()
      setUser(null)
      setToken(null)
      return { success: true }
    } catch (error) {
      console.error('Logout error:', error)
      return { success: false, error: 'Logout failed' }
    }
  }

  // Update user profile
  const updateUser = async (updatedData) => {
    try {
      const result = await updateUserProfile(updatedData)
      
      if (result.success) {
        setUser(result.data)
        localStorage.setItem('user', JSON.stringify(result.data))
        return { 
          success: true, 
          user: result.data,
          message: result.message 
        }
      } else {
        return { 
          success: false, 
          error: result.error 
        }
      }
    } catch (error) {
      console.error('Update profile error:', error)
      return { 
        success: false, 
        error: 'Profile update failed. Please try again.' 
      }
    }
  }

  // Change password
  const updatePassword = async (currentPassword, newPassword) => {
    try {
      const result = await changePassword({
        currentPassword,
        newPassword
      })
      
      if (result.success) {
        return { 
          success: true, 
          message: result.message 
        }
      } else {
        return { 
          success: false, 
          error: result.error 
        }
      }
    } catch (error) {
      console.error('Password update error:', error)
      return { 
        success: false, 
        error: 'Password update failed. Please try again.' 
      }
    }
  }

  // Refresh user data
  const refreshUser = async () => {
    try {
      const result = await getCurrentUser()
      
      if (result.success && result.user) {
        setUser(result.user)
        localStorage.setItem('user', JSON.stringify(result.user))
        return { success: true, user: result.user }
      } else {
        // If refresh fails, might need to logout
        if (result.error && (result.error.includes('token') || result.error.includes('unauthorized'))) {
          logout()
        }
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('Refresh user error:', error)
      return { success: false, error: 'Failed to refresh user data' }
    }
  }

  // Check if user is authenticated
  const isAuthenticated = Boolean(user && token)

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role
  }

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    return roles.includes(user?.role)
  }

  console.log('AuthContext state:', { 
    user: !!user, 
    token: !!token, 
    isAuthenticated, 
    loading,
    userRole: user?.role 
  })

  const value = {
    // State
    user,
    token,
    loading,
    isAuthenticated,
    
    // Actions
    login,
    register,
    logout,
    updateUser,
    updatePassword,
    refreshUser,
    
    // Utilities
    hasRole,
    hasAnyRole
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}