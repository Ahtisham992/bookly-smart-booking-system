// src/context/AuthContext/AuthContext.jsx - UPDATED
import { createContext, useContext, useState, useEffect } from 'react'

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
  const [loading, setLoading] = useState(true)

  // Check if user is logged in on app start
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      // Get all registered users from localStorage
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
      
      // Find user with matching email and password
      const foundUser = registeredUsers.find(user => 
        user.email.toLowerCase() === email.toLowerCase() && 
        user.password === password // In real app, you'd hash and compare passwords
      )
      
      if (!foundUser) {
        return { success: false, error: 'Invalid email or password' }
      }
      
      // Remove password from user object for security
      const { password: _, ...userWithoutPassword } = foundUser
      
      setUser(userWithoutPassword)
      localStorage.setItem('user', JSON.stringify(userWithoutPassword))
      
      return { success: true, user: userWithoutPassword }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Login failed. Please try again.' }
    }
  }

  const register = async (userData) => {
    try {
      // Get existing users
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
      
      // Check if user already exists
      const existingUser = registeredUsers.find(user => 
        user.email.toLowerCase() === userData.email.toLowerCase()
      )
      
      if (existingUser) {
        return { success: false, error: 'An account with this email already exists' }
      }
      
      // Create new user with unique ID
      const newUser = {
        id: Date.now().toString(),
        email: userData.email,
        password: userData.password, // In real app, hash this password
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone || '',
        role: userData.role || 'user',
        profileImage: null,
        isVerified: false,
        createdAt: new Date().toISOString(),
        preferences: {
          notifications: {
            email: true,
            sms: false,
            push: true
          },
          timezone: 'UTC',
          language: 'en'
        }
      }
      
      // Add to registered users
      registeredUsers.push(newUser)
      localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers))
      
      // Set as current user (auto-login after registration)
      const { password: _, ...userWithoutPassword } = newUser
      setUser(userWithoutPassword)
      localStorage.setItem('user', JSON.stringify(userWithoutPassword))
      
      return { success: true, user: userWithoutPassword }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: 'Registration failed. Please try again.' }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData }
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
    
    // Also update in registeredUsers array
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
    const userIndex = registeredUsers.findIndex(u => u.id === user.id)
    if (userIndex !== -1) {
      registeredUsers[userIndex] = { ...registeredUsers[userIndex], ...updatedData }
      localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers))
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}