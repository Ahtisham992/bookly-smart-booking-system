// src/pages/Services/ServiceDetail.jsx
import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, Calendar, Edit, Trash2, MapPin, Star } from 'lucide-react'
import { useAuth } from '@/context/AuthContext/AuthContext'
import { useServices } from '@/context/ServicesContext/ServicesContext'

const ServiceDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { getServiceById, deleteService } = useServices()
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  const canEdit = user && (user.role === 'admin' || user.role === 'provider')

  useEffect(() => {
    const foundService = getServiceById(id)
    setService(foundService)
    setLoading(false)
  }, [id, getServiceById])

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    const result = await deleteService(service.id)
    
    if (result.success) {
      navigate('/services', { replace: true })
    } else {
      alert('Failed to delete service. Please try again.')
      setIsDeleting(false)
    }
  }

  const handleBookNow = () => {
    if (!user) {
      navigate('/auth/login', { 
        state: { 
          from: `/services/${id}`,
          message: 'Please log in to book this service'
        }
      })
      return
    }
    
    navigate('/booking', { 
      state: { 
        selectedService: service 
      }
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Not Found</h2>
            <p className="text-gray-600 mb-6">
              The service you're looking for doesn't exist or has been removed.
            </p>
            <Link
              to="/services"
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Browse All Services
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/services"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Services
          </Link>
        </div>

        {/* Service Detail Card */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Service Image */}
          <div className="relative h-64 md:h-80 bg-gray-200">
            {service.imageUrl ? (
              <img
                src={service.imageUrl}
                alt={service.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
            ) : null}
            <div className="absolute inset-0 bg-gray-300 flex items-center justify-center text-gray-500">
              <span>No Image Available</span>
            </div>

            {/* Category Badge */}
            <div className="absolute top-4 left-4">
              <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                {service.category}
              </span>
            </div>

            {/* Action Buttons (Edit/Delete) */}
            {canEdit && (
              <div className="absolute top-4 right-4 flex gap-2">
                <Link
                  to={`/services/edit/${service.id}`}
                  className="bg-white text-gray-700 p-2 rounded-full shadow-md hover:shadow-lg transition-shadow"
                  title="Edit Service"
                >
                  <Edit className="w-5 h-5" />
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-white text-red-600 p-2 rounded-full shadow-md hover:shadow-lg transition-shadow disabled:opacity-50"
                  title="Delete Service"
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

          {/* Service Content */}
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
              {/* Service Info */}
              <div className="flex-1 lg:mr-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {service.title}
                </h1>
                
                <div className="flex items-center gap-4 mb-6 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {service.duration} minutes
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-1 text-yellow-400" />
                    4.8 (124 reviews)
                  </div>
                </div>

                <div className="prose max-w-none mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">About This Service</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                {/* Service Features/Benefits (Mock data) */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">What's Included</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                      Professional consultation
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                      Quality service delivery
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                      Follow-up support
                    </li>
                  </ul>
                </div>
              </div>

              {/* Booking Card */}
              <div className="lg:w-80 mt-6 lg:mt-0">
                <div className="bg-gray-50 rounded-lg p-6 sticky top-6">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-primary-600 mb-1">
                      ${service.price}
                    </div>
                    <div className="text-sm text-gray-600">
                      per {service.duration} minute session
                    </div>
                  </div>

                  <button
                    onClick={handleBookNow}
                    className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors mb-4"
                  >
                    <Calendar className="w-5 h-5 inline mr-2" />
                    Book Now
                  </button>

                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-medium">{service.duration} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Category:</span>
                      <span className="font-medium">{service.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Availability:</span>
                      <span className="font-medium text-green-600">Available</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500 text-center">
                    Free cancellation up to 24 hours before appointment
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Services (Mock section) */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Similar Services</h2>
          <div className="bg-white rounded-lg p-6">
            <p className="text-gray-600 text-center">
              Related services will be displayed here based on category and preferences.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ServiceDetail