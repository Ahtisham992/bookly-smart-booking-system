// src/pages/Providers/AddProvider.jsx
import { useNavigate, Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '@/context/AuthContext/AuthContext'
import { useProviders } from '@/context/ProvidersContext/ProvidersContext'
import ProviderForm from '@/components/Providers/ProviderForm'
import { useEffect, useState } from 'react'

const AddProvider = () => {
  const navigate = useNavigate()
  const { id } = useParams() // For edit mode
  const { user } = useAuth()
  const { addProvider, updateProvider, getProviderById } = useProviders()
  
  const [provider, setProvider] = useState(null)
  const [loading, setLoading] = useState(false)
  
  const isEditing = !!id
  const pageTitle = isEditing ? 'Edit Provider' : 'Add New Provider'

  // Check if user has permission
  const canAddProvider = user && (user.role === 'admin')

  // Load provider for editing
  useEffect(() => {
    if (isEditing) {
      const foundProvider = getProviderById(id)
      if (!foundProvider) {
        navigate('/providers', { replace: true })
        return
      }
      setProvider(foundProvider)
    }
  }, [id, isEditing, getProviderById, navigate])

  // Redirect if user doesn't have permission
  useEffect(() => {
    if (!canAddProvider) {
      navigate('/providers', { replace: true })
    }
  }, [canAddProvider, navigate])

  const handleSubmit = async (providerData) => {
    setLoading(true)
    
    try {
      let result
      
      if (isEditing) {
        result = await updateProvider(provider.id, providerData)
      } else {
        result = await addProvider(providerData)
      }

      if (result.success) {
        // Show success message (you could use a toast notification here)
        console.log(`Provider ${isEditing ? 'updated' : 'created'} successfully`)
        
        // Navigate back to providers or to the provider detail
        if (isEditing) {
          navigate(`/providers/${provider.id}`)
        } else {
          navigate('/providers')
        }
      } else {
        // Show error message
        alert(result.error || `Failed to ${isEditing ? 'update' : 'create'} provider`)
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert(`Failed to ${isEditing ? 'update' : 'create'} provider. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (isEditing) {
      navigate(`/providers/${provider.id}`)
    } else {
      navigate('/providers')
    }
  }

  // Don't render if user doesn't have permission
  if (!canAddProvider) {
    return null
  }

  // Show loading state while fetching provider for edit
  if (isEditing && !provider) {
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
            to={isEditing ? `/providers/${provider?.id}` : '/providers'}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {isEditing ? 'Back to Provider' : 'Back to Providers'}
          </Link>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{pageTitle}</h1>
            <p className="text-gray-600 mt-1">
              {isEditing 
                ? 'Update the provider information below' 
                : 'Fill in the details to register a new service provider'
              }
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <ProviderForm
              provider={provider}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isEditing={isEditing}
              loading={loading}
            />
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Tips for creating a great provider profile:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Use a professional photo that clearly shows your face</li>
            <li>• Write a compelling bio that highlights your expertise and experience</li>
            <li>• Be specific about your specialties and what makes you unique</li>
            <li>• Provide accurate contact information and availability</li>
            <li>• Choose the most appropriate category for your services</li>
            <li>• Keep your profile information up to date</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default AddProvider