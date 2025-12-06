// src/pages/Providers/ProviderDetail.jsx
import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Star, MapPin, Clock, Calendar, CheckCircle, Edit, Trash2, Mail, Phone } from 'lucide-react'
import { useAuth } from '@/context/AuthContext/AuthContext'
import { useProviders } from '@/context/ProvidersContext/ProvidersContext'
import { useServices } from '@/context/ServicesContext/ServicesContext'

const ProviderDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { getProviderById, deleteProvider } = useProviders()
  const { getServiceById } = useServices()
  const [provider, setProvider] = useState(null)
  const [providerServices, setProviderServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  const canEdit = user && (user.role === 'admin' || (user.role === 'provider' && user.id === provider?.id))

  // Extract data from provider or providerInfo
  const providerData = provider ? {
    imageUrl: provider.profileImage || provider.imageUrl || provider.providerInfo?.profileImage,
    bio: provider.bio || provider.providerInfo?.bio || 'No bio available',
    specialties: provider.specialties || provider.providerInfo?.specialties || [],
    category: provider.category || provider.providerInfo?.category || 'Uncategorized',
    rating: provider.rating || provider.providerInfo?.rating || 0,
    reviewCount: provider.reviewCount || provider.providerInfo?.reviewCount || 0,
    location: provider.location || provider.providerInfo?.location || 'Location not set',
    experience: provider.experience || provider.providerInfo?.experience || 0,
    priceRange: provider.priceRange || provider.providerInfo?.priceRange || 'Contact for pricing',
    availability: provider.availability || provider.providerInfo?.availability || 'Contact for availability',
    verified: provider.verified || provider.providerInfo?.verified || false
  } : null

  useEffect(() => {
    const loadProviderData = async () => {
      setLoading(true)
      
      // Get provider details
      const foundProvider = getProviderById(id)
      setProvider(foundProvider)
      
      if (foundProvider) {
        // Fetch services from API by provider ID
        try {
          const { serviceService } = await import('@/services/api')
          const providerId = foundProvider._id || foundProvider.id
          console.log('Fetching services for provider:', providerId)
          
          const response = await serviceService.getServicesByProvider(providerId)
          
          console.log('Provider services response:', response)
          
          if (response.success && response.data) {
            setProviderServices(Array.isArray(response.data) ? response.data : [])
            console.log('Loaded services:', response.data.length)
          } else {
            console.log('No services found, trying fallback')
            // Fallback: Try to get from services array if exists
            if (foundProvider.services) {
              const services = foundProvider.services
                .map(serviceId => getServiceById(serviceId))
                .filter(Boolean)
              setProviderServices(services)
            } else {
              setProviderServices([])
            }
          }
        } catch (error) {
          console.error('Error loading provider services:', error)
          // Fallback to context services
          if (foundProvider.services) {
            const services = foundProvider.services
              .map(serviceId => getServiceById(serviceId))
              .filter(Boolean)
            setProviderServices(services)
          } else {
            setProviderServices([])
          }
        }
      }
      
      setLoading(false)
    }
    
    loadProviderData()
  }, [id, getProviderById, getServiceById])

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this provider? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    const result = await deleteProvider(provider.id)
    
    if (result.success) {
      navigate('/providers', { replace: true })
    } else {
      alert('Failed to delete provider. Please try again.')
      setIsDeleting(false)
    }
  }

  const handleBookProvider = () => {
    if (!user) {
      navigate('/auth/login', { 
        state: { 
          from: `/providers/${id}`,
          message: 'Please log in to book with this provider'
        }
      })
      return
    }
    
    navigate('/booking', { 
      state: { 
        selectedProvider: provider,
        selectedServices: providerServices
      }
    })
  }

  const handleServiceClick = (serviceId) => {
    navigate(`/services/${serviceId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="bg-white rounded-lg p-6">
              <div className="h-64 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Provider Not Found</h2>
            <p className="text-gray-600 mb-6">
              The provider you're looking for doesn't exist or has been removed.
            </p>
            <Link
              to="/providers"
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Browse All Providers
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/providers"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Providers
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Provider Header */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden mb-6">
              {/* Cover Image */}
              <div className="h-32 bg-gradient-to-r from-primary-600 to-primary-700"></div>
              
              <div className="px-6 pb-6">
                {/* Profile Image */}
                <div className="relative -mt-16 mb-4">
                  <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
                    {providerData?.imageUrl ? (
                      <img
                        src={providerData.imageUrl}
                        alt={`${provider.firstName} ${provider.lastName}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextElementSibling.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    <div 
                      className={`w-full h-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-3xl ${
                        providerData?.imageUrl ? 'hidden' : ''
                      }`}
                    >
                      {provider.firstName?.[0]}{provider.lastName?.[0]}
                    </div>
                  </div>

                  {/* Edit/Delete Actions */}
                  {canEdit && (
                    <div className="absolute top-0 right-0 flex gap-2">
                      <Link
                        to={`/providers/edit/${provider.id}`}
                        className="bg-white text-gray-700 p-2 rounded-full shadow-md hover:shadow-lg transition-shadow border"
                        title="Edit Provider"
                      >
                        <Edit className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-white text-red-600 p-2 rounded-full shadow-md hover:shadow-lg transition-shadow border disabled:opacity-50"
                        title="Delete Provider"
                      >
                        {isDeleting ? (
                          <div className="w-5 h-5 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Provider Info */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-3xl font-bold text-gray-900">
                        {provider.firstName} {provider.lastName}
                      </h1>
                      {providerData.verified && (
                        <CheckCircle className="w-5 h-5 text-green-500" title="Verified Provider" />
                      )}
                    </div>
                    <p className="text-lg text-primary-600 font-medium">{providerData.category}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    </div>
                    <div className="text-xl font-bold text-gray-900">{providerData.rating.toFixed(1)}</div>
                    <span className="text-sm text-gray-600">{providerData.reviewCount} reviews</span>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <Clock className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="text-xl font-bold text-gray-900">{providerData.experience}+</div>
                    <span className="text-sm text-gray-600">years exp</span>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                    <span className="text-sm text-gray-600">{providerData.location}</span>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    <span className="text-sm">{provider.email}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    <span className="text-sm">{provider.phone}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
              <p className="text-gray-600 leading-relaxed mb-4">{providerData.bio}</p>
              
              {/* Specialties */}
              {providerData.specialties.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Specialties</h3>
                  <div className="flex flex-wrap gap-2">
                    {providerData.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Services */}
            {providerServices.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Services Offered</h2>
                <div className="grid gap-4">
                  {providerServices.map(service => (
                    <div 
                      key={service.id} 
                      onClick={() => handleServiceClick(service.id || service._id)}
                      className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div>
                        <h3 className="font-semibold text-gray-900">{service.title}</h3>
                        <p className="text-gray-600 text-sm mt-1 line-clamp-2">{service.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {service.duration} min
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <div className="text-lg font-bold text-primary-600">${service.pricing?.amount || service.price}</div>
                        <button
                          className="text-sm text-primary-600 hover:text-primary-700 font-medium mt-1"
                        >
                          Book Now →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Booking Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6 mb-6">
              <div className="text-center mb-6">
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {providerData.priceRange}
                </div>
                <div className="text-sm text-gray-600">
                  Price range for services
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800 text-center">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Select a service below to book
                </p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Experience:</span>
                  <span className="font-medium">{providerData.experience}+ years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">{providerData.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Availability:</span>
                  <span className="font-medium text-green-600">Available</span>
                </div>
                {providerData.availability && (
                  <div className="pt-3 border-t border-gray-200">
                    <span className="text-gray-600 text-xs">Hours:</span>
                    <p className="text-xs text-gray-600 mt-1">{providerData.availability}</p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500 text-center">
                {providerData.verified ? 'Verified provider' : 'Verification pending'} • Free consultation available
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Response Rate</span>
                  <span className="font-medium">98%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Response Time</span>
                  <span className="font-medium">~1 hour</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Repeat Clients</span>
                  <span className="font-medium">85%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProviderDetail