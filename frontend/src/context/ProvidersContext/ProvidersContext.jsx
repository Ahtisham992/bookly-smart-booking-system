// src/context/ProvidersContext/ProvidersContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'

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

  // Initialize with sample data on first load
  useEffect(() => {
    const storedProviders = localStorage.getItem('providers')
    if (storedProviders) {
      try {
        setProviders(JSON.parse(storedProviders))
      } catch (error) {
        console.error('Error parsing stored providers:', error)
        initializeSampleData()
      }
    } else {
      initializeSampleData()
    }
  }, [])

  const initializeSampleData = () => {
    const sampleProviders = [
      {
        id: '1',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@example.com',
        phone: '+1 (555) 123-4567',
        bio: 'Professional hair stylist with over 10 years of experience in cutting-edge hair design and color techniques.',
        specialties: ['Hair Cutting', 'Hair Coloring', 'Hair Styling'],
        category: 'Hair & Beauty',
        rating: 4.9,
        reviewCount: 127,
        imageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b5e5?w=400',
        location: 'New York, NY',
        experience: 10,
        verified: true,
        availability: 'Mon-Fri: 9AM-6PM, Sat: 10AM-4PM',
        priceRange: '$45 - $150',
        services: ['1'], // References to service IDs
        createdAt: new Date().toISOString(),
        isActive: true
      },
      {
        id: '2',
        firstName: 'Dr. Michael',
        lastName: 'Chen',
        email: 'dr.chen@example.com',
        phone: '+1 (555) 987-6543',
        bio: 'Board-certified dentist specializing in preventive care and cosmetic dentistry with a gentle approach.',
        specialties: ['General Dentistry', 'Cosmetic Dentistry', 'Preventive Care'],
        category: 'Healthcare',
        rating: 4.8,
        reviewCount: 89,
        imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400',
        location: 'Los Angeles, CA',
        experience: 8,
        verified: true,
        availability: 'Mon-Thu: 8AM-5PM, Fri: 8AM-2PM',
        priceRange: '$120 - $300',
        services: ['2'],
        createdAt: new Date().toISOString(),
        isActive: true
      },
      {
        id: '3',
        firstName: 'Alex',
        lastName: 'Rodriguez',
        email: 'alex.rodriguez@example.com',
        phone: '+1 (555) 456-7890',
        bio: 'Certified personal trainer and fitness coach helping clients achieve their health and fitness goals.',
        specialties: ['Weight Training', 'Cardio', 'Nutrition Coaching'],
        category: 'Fitness',
        rating: 4.7,
        reviewCount: 95,
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        location: 'Miami, FL',
        experience: 6,
        verified: true,
        availability: 'Mon-Sun: 6AM-8PM',
        priceRange: '$60 - $120',
        services: ['3'],
        createdAt: new Date().toISOString(),
        isActive: true
      },
      {
        id: '4',
        firstName: 'Lisa',
        lastName: 'Thompson',
        email: 'lisa.thompson@example.com',
        phone: '+1 (555) 321-0987',
        bio: 'Licensed massage therapist specializing in deep tissue and relaxation massage techniques.',
        specialties: ['Deep Tissue Massage', 'Swedish Massage', 'Sports Massage'],
        category: 'Wellness',
        rating: 4.9,
        reviewCount: 156,
        imageUrl: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400',
        location: 'Seattle, WA',
        experience: 12,
        verified: true,
        availability: 'Tue-Sat: 10AM-7PM',
        priceRange: '$80 - $140',
        services: ['4'],
        createdAt: new Date().toISOString(),
        isActive: true
      }
    ]
    
    setProviders(sampleProviders)
    localStorage.setItem('providers', JSON.stringify(sampleProviders))
  }

  // Save to localStorage whenever providers change
  const saveToStorage = (updatedProviders) => {
    localStorage.setItem('providers', JSON.stringify(updatedProviders))
    setProviders(updatedProviders)
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
      saveToStorage(updatedProviders)
      
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
      
      saveToStorage(updatedProviders)
      
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
      saveToStorage(updatedProviders)
      
      return { success: true }
    } catch (error) {
      console.error('Delete provider error:', error)
      return { success: false, error: 'Failed to delete provider' }
    } finally {
      setLoading(false)
    }
  }

  const getProviderById = (providerId) => {
    return providers.find(provider => provider.id === providerId)
  }

  const getProvidersByCategory = (category) => {
    return providers.filter(provider => provider.category === category && provider.isActive)
  }

  const getActiveProviders = () => {
    return providers.filter(provider => provider.isActive)
  }

  const getVerifiedProviders = () => {
    return providers.filter(provider => provider.isActive && provider.verified)
  }

  const searchProviders = (query) => {
    const lowercaseQuery = query.toLowerCase()
    return providers.filter(provider =>
      provider.isActive && (
        provider.firstName.toLowerCase().includes(lowercaseQuery) ||
        provider.lastName.toLowerCase().includes(lowercaseQuery) ||
        provider.bio.toLowerCase().includes(lowercaseQuery) ||
        provider.specialties.some(specialty => specialty.toLowerCase().includes(lowercaseQuery)) ||
        provider.category.toLowerCase().includes(lowercaseQuery) ||
        provider.location.toLowerCase().includes(lowercaseQuery)
      )
    )
  }

  const getCategories = () => {
    const categories = [...new Set(providers.map(provider => provider.category))]
    return categories.filter(Boolean)
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
    addProvider,
    updateProvider,
    deleteProvider,
    getProviderById,
    getProvidersByCategory,
    getActiveProviders,
    getVerifiedProviders,
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