// src/context/ServicesContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'

const ServicesContext = createContext(null)

export const useServices = () => {
  const context = useContext(ServicesContext)
  if (!context) {
    throw new Error('useServices must be used within a ServicesProvider')
  }
  return context
}

export const ServicesProvider = ({ children }) => {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(false)

  // Initialize with sample data on first load
  useEffect(() => {
    const storedServices = localStorage.getItem('services')
    if (storedServices) {
      try {
        setServices(JSON.parse(storedServices))
      } catch (error) {
        console.error('Error parsing stored services:', error)
        initializeSampleData()
      }
    } else {
      initializeSampleData()
    }
  }, [])

  const initializeSampleData = () => {
    const sampleServices = [
      {
        id: '1',
        title: 'Haircut & Styling',
        description: 'Professional haircut and styling service with expert stylists.',
        price: 45,
        duration: 60,
        category: 'Hair & Beauty',
        imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
        createdAt: new Date().toISOString(),
        isActive: true
      },
      {
        id: '2',
        title: 'Dental Cleaning',
        description: 'Complete dental cleaning and oral health checkup.',
        price: 120,
        duration: 45,
        category: 'Healthcare',
        imageUrl: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=400',
        createdAt: new Date().toISOString(),
        isActive: true
      },
      {
        id: '3',
        title: 'Personal Training',
        description: '1-on-1 personal training session with certified trainer.',
        price: 80,
        duration: 60,
        category: 'Fitness',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        createdAt: new Date().toISOString(),
        isActive: true
      },
      {
        id: '4',
        title: 'Massage Therapy',
        description: 'Relaxing full-body massage therapy session.',
        price: 90,
        duration: 90,
        category: 'Wellness',
        imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400',
        createdAt: new Date().toISOString(),
        isActive: true
      }
    ]
    
    setServices(sampleServices)
    localStorage.setItem('services', JSON.stringify(sampleServices))
  }

  // Save to localStorage whenever services change
  const saveToStorage = (updatedServices) => {
    localStorage.setItem('services', JSON.stringify(updatedServices))
    setServices(updatedServices)
  }

  const addService = async (serviceData) => {
    try {
      setLoading(true)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const newService = {
        id: Date.now().toString(),
        ...serviceData,
        createdAt: new Date().toISOString(),
        isActive: true
      }
      
      const updatedServices = [...services, newService]
      saveToStorage(updatedServices)
      
      return { success: true, service: newService }
    } catch (error) {
      console.error('Add service error:', error)
      return { success: false, error: 'Failed to add service' }
    } finally {
      setLoading(false)
    }
  }

  const updateService = async (serviceId, serviceData) => {
    try {
      setLoading(true)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const updatedServices = services.map(service =>
        service.id === serviceId
          ? { ...service, ...serviceData, updatedAt: new Date().toISOString() }
          : service
      )
      
      saveToStorage(updatedServices)
      
      const updatedService = updatedServices.find(s => s.id === serviceId)
      return { success: true, service: updatedService }
    } catch (error) {
      console.error('Update service error:', error)
      return { success: false, error: 'Failed to update service' }
    } finally {
      setLoading(false)
    }
  }

  const deleteService = async (serviceId) => {
    try {
      setLoading(true)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const updatedServices = services.filter(service => service.id !== serviceId)
      saveToStorage(updatedServices)
      
      return { success: true }
    } catch (error) {
      console.error('Delete service error:', error)
      return { success: false, error: 'Failed to delete service' }
    } finally {
      setLoading(false)
    }
  }

  const getServiceById = (serviceId) => {
    return services.find(service => service.id === serviceId)
  }

  const getServicesByCategory = (category) => {
    return services.filter(service => service.category === category && service.isActive)
  }

  const getActiveServices = () => {
    return services.filter(service => service.isActive)
  }

  const searchServices = (query) => {
    const lowercaseQuery = query.toLowerCase()
    return services.filter(service =>
      service.isActive && (
        service.title.toLowerCase().includes(lowercaseQuery) ||
        service.description.toLowerCase().includes(lowercaseQuery) ||
        service.category.toLowerCase().includes(lowercaseQuery)
      )
    )
  }

  const getCategories = () => {
    const categories = [...new Set(services.map(service => service.category))]
    return categories.filter(Boolean)
  }

  const value = {
    services,
    loading,
    addService,
    updateService,
    deleteService,
    getServiceById,
    getServicesByCategory,
    getActiveServices,
    searchServices,
    getCategories
  }

  return (
    <ServicesContext.Provider value={value}>
      {children}
    </ServicesContext.Provider>
  )
}