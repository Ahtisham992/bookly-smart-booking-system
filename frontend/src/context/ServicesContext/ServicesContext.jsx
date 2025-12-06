// src/context/ServicesContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { serviceService } from '@/services/api'

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
  const [error, setError] = useState(null)

  // Fetch services from API on mount
  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await serviceService.getAllServices()
      
      if (response.success) {
        setServices(response.data || [])
      } else {
        setError(response.error || 'Failed to fetch services')
      }
    } catch (err) {
      console.error('Fetch services error:', err)
      setError('Failed to fetch services')
    } finally {
      setLoading(false)
    }
  }

  const addService = async (serviceData) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await serviceService.createService(serviceData)
      
      if (response.success) {
        // Refresh services list
        await fetchServices()
        return { success: true, service: response.data }
      } else {
        setError(response.error)
        return { success: false, error: response.error }
      }
    } catch (error) {
      console.error('Add service error:', error)
      const errorMsg = 'Failed to add service'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  const updateService = async (serviceId, serviceData) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await serviceService.updateService(serviceId, serviceData)
      
      if (response.success) {
        // Refresh services list
        await fetchServices()
        return { success: true, service: response.data }
      } else {
        setError(response.error)
        return { success: false, error: response.error }
      }
    } catch (error) {
      console.error('Update service error:', error)
      const errorMsg = 'Failed to update service'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  const deleteService = async (serviceId) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await serviceService.deleteService(serviceId)
      
      if (response.success) {
        // Refresh services list
        await fetchServices()
        return { success: true }
      } else {
        setError(response.error)
        return { success: false, error: response.error }
      }
    } catch (error) {
      console.error('Delete service error:', error)
      const errorMsg = 'Failed to delete service'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  const getServiceById = (serviceId) => {
    return services.find(service => service._id === serviceId || service.id === serviceId)
  }

  const getServicesByCategory = (categoryId) => {
    return services.filter(service => 
      (service.category?._id === categoryId || service.category === categoryId) && 
      service.isActive
    )
  }

  const getActiveServices = () => {
    return services.filter(service => service.isActive && service.isApproved)
  }

  const searchServices = (query) => {
    const lowercaseQuery = query.toLowerCase()
    return services.filter(service =>
      service.isActive && service.isApproved && (
        service.title?.toLowerCase().includes(lowercaseQuery) ||
        service.description?.toLowerCase().includes(lowercaseQuery) ||
        service.category?.name?.toLowerCase().includes(lowercaseQuery)
      )
    )
  }

  const getCategories = () => {
    const categories = [...new Set(services.map(service => 
      service.category?.name || service.category
    ))]
    return categories.filter(Boolean)
  }

  const value = {
    services,
    loading,
    error,
    fetchServices,
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