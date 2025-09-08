// src/pages/Services/AddService.jsx
import { useNavigate, Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '@/context/AuthContext/AuthContext'
import { useServices } from '@/context/ServicesContext/ServicesContext'
import ServiceForm from '@/components/Services/ServiceForm'
import { useEffect, useState } from 'react'

const AddService = () => {
  const navigate = useNavigate()
  const { id } = useParams() // For edit mode
  const { user } = useAuth()
  const { addService, updateService, getServiceById } = useServices()
  
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(false)
  
  const isEditing = !!id
  const pageTitle = isEditing ? 'Edit Service' : 'Add New Service'

  // Check if user has permission
  const canAddService = user && (user.role === 'admin' || user.role === 'provider')

  // Load service for editing
  useEffect(() => {
    if (isEditing) {
      const foundService = getServiceById(id)
      if (!foundService) {
        navigate('/services', { replace: true })
        return
      }
      setService(foundService)
    }
  }, [id, isEditing, getServiceById, navigate])

  // Redirect if user doesn't have permission
  useEffect(() => {
    if (!canAddService) {
      navigate('/services', { replace: true })
    }
  }, [canAddService, navigate])

  const handleSubmit = async (serviceData) => {
    setLoading(true)
    
    try {
      let result
      
      if (isEditing) {
        result = await updateService(service.id, serviceData)
      } else {
        result = await addService(serviceData)
      }

      if (result.success) {
        // Show success message (you could use a toast notification here)
        console.log(`Service ${isEditing ? 'updated' : 'created'} successfully`)
        
        // Navigate back to services or to the service detail
        if (isEditing) {
          navigate(`/services/${service.id}`)
        } else {
          navigate('/services')
        }
      } else {
        // Show error message
        alert(result.error || `Failed to ${isEditing ? 'update' : 'create'} service`)
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert(`Failed to ${isEditing ? 'update' : 'create'} service. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (isEditing) {
      navigate(`/services/${service.id}`)
    } else {
      navigate('/services')
    }
  }

  // Don't render if user doesn't have permission
  if (!canAddService) {
    return null
  }

  // Show loading state while fetching service for edit
  if (isEditing && !service) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg p-6">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to={isEditing ? `/services/${service?.id}` : '/services'}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {isEditing ? 'Back to Service' : 'Back to Services'}
          </Link>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{pageTitle}</h1>
            <p className="text-gray-600 mt-1">
              {isEditing 
                ? 'Update the service information below' 
                : 'Fill in the details to create a new service'
              }
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <ServiceForm
              service={service}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isEditing={isEditing}
            />
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Tips for creating a great service:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Use a clear, descriptive title that explains what you offer</li>
            <li>• Write a detailed description that highlights key benefits</li>
            <li>• Set competitive pricing based on your market research</li>
            <li>• Be realistic about the time duration needed</li>
            <li>• Choose the most appropriate category for better discoverability</li>
            <li>• Add a high-quality image to make your service stand out</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default AddService