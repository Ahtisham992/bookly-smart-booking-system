// src/context/ProvidersContext/ProvidersContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { providerService } from '@/services/api'

const ProvidersContext = createContext(null)

export const useProviders = () => {
  const context = useContext(ProvidersContext)
  if (!context) {
    throw new Error('useProviders must be used within a ProvidersProvider')
  }
  return context
}

export const ProvidersProvider = ({ children }) => {
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch providers from API on mount
  useEffect(() => {
    fetchProviders()
  }, [])

  const fetchProviders = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await providerService.getAllProviders()
      
      if (response.success) {
        setProviders(response.data || [])
      } else {
        setError(response.error || 'Failed to fetch providers')
      }
    } catch (err) {
      console.error('Fetch providers error:', err)
      setError('Failed to fetch providers')
    } finally {
      setLoading(false)
    }
  }

  const addProvider = async (providerData) => {
    try {
      setLoading(true)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const newProvider = {
        id: Date.now().toString(),
        ...providerData,
        rating: 0,
        reviewCount: 0,
        services: [],
        createdAt: new Date().toISOString(),
        isActive: true,
        verified: false
      }
      
      const updatedProviders = [...providers, newProvider]
      setProviders(updatedProviders)
      
      return { success: true, provider: newProvider }
    } catch (error) {
      console.error('Add provider error:', error)
      return { success: false, error: 'Failed to add provider' }
    } finally {
      setLoading(false)
    }
  }

  const updateProvider = async (providerId, providerData) => {
    try {
      setLoading(true)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const updatedProviders = providers.map(provider =>
        provider.id === providerId
          ? { ...provider, ...providerData, updatedAt: new Date().toISOString() }
          : provider
      )
      
      setProviders(updatedProviders)
      
      const updatedProvider = updatedProviders.find(p => p.id === providerId)
      return { success: true, provider: updatedProvider }
    } catch (error) {
      console.error('Update provider error:', error)
      return { success: false, error: 'Failed to update provider' }
    } finally {
      setLoading(false)
    }
  }

  const deleteProvider = async (providerId) => {
    try {
      setLoading(true)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const updatedProviders = providers.filter(provider => provider.id !== providerId)
      setProviders(updatedProviders)
      
      return { success: true }
    } catch (error) {
      console.error('Delete provider error:', error)
      return { success: false, error: 'Failed to delete provider' }
    } finally {
      setLoading(false)
    }
  }

  const getProviderById = (providerId) => {
    return providers.find(provider => provider._id === providerId || provider.id === providerId)
  }

  const getProvidersByCategory = (category) => {
    return providers.filter(provider => 
      provider.providerInfo?.specialties?.includes(category) && 
      provider.isActive
    )
  }

  const getActiveProviders = () => {
    return providers.filter(provider => provider.isActive && provider.role === 'provider')
  }

  const searchProviders = (query) => {
    const lowercaseQuery = query.toLowerCase()
    return providers.filter(provider =>
      provider.isActive && provider.role === 'provider' && (
        provider.firstName?.toLowerCase().includes(lowercaseQuery) ||
        provider.lastName?.toLowerCase().includes(lowercaseQuery) ||
        provider.providerInfo?.bio?.toLowerCase().includes(lowercaseQuery) ||
        provider.providerInfo?.specialties?.some(s => s.toLowerCase().includes(lowercaseQuery))
      )
    )
  }

  const getCategories = () => {
    const categories = providers
      .filter(p => p.providerInfo?.specialties)
      .flatMap(p => p.providerInfo.specialties)
    return [...new Set(categories)].filter(Boolean)
  }

  const getTopRatedProviders = (limit = 5) => {
    return providers
      .filter(provider => provider.isActive && provider.verified)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit)
  }

  const value = {
    providers,
    loading,
    error,
    fetchProviders,
    addProvider,
    updateProvider,
    deleteProvider,
    getProviderById,
    getProvidersByCategory,
    getActiveProviders,
    searchProviders,
    getCategories,
    getTopRatedProviders
  }

  return (
    <ProvidersContext.Provider value={value}>
      {children}
    </ProvidersContext.Provider>
  )
}