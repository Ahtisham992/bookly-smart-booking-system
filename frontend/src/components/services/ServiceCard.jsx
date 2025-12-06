// src/components/Services/ServiceCard.jsx
import { Link } from 'react-router-dom'
import { Clock, Edit, Trash2, Eye } from 'lucide-react'
import { useAuth } from '@/context/AuthContext/AuthContext'
import { useServices } from '@/context/ServicesContext/ServicesContext'
import { useState } from 'react'

const ServiceCard = ({ service }) => {
  const { user } = useAuth()
  const { deleteService } = useServices()
  const [isDeleting, setIsDeleting] = useState(false)

  const canEdit = user && (user.role === 'admin' || user.role === 'provider')

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return
    }

    setIsDeleting(true)
    const result = await deleteService(service.id)
    
    if (result.success) {
      // Success feedback could be added here (toast notification)
      console.log('Service deleted successfully')
    } else {
      alert('Failed to delete service. Please try again.')
    }
    
    setIsDeleting(false)
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Service Image */}
      <div className="relative h-48 bg-gray-200">
        {(service.media?.images?.[0] || service.imageUrl) ? (
          <img
            src={service.media?.images?.[0] || service.imageUrl}
            alt={service.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextElementSibling.style.display = 'flex'
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-gray-300 flex items-center justify-center text-gray-500">
            <span className="text-sm">No Image</span>
          </div>
        )}
        {(service.media?.images?.[0] || service.imageUrl) && (
          <div className="absolute inset-0 bg-gray-300 items-center justify-center text-gray-500 hidden">
            <span className="text-sm">No Image</span>
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-primary-600 text-white px-2 py-1 rounded-full text-xs font-medium">
            {service.category?.name || service.category}
          </span>
        </div>
      </div>

      {/* Service Content */}
      <div className="p-4">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {service.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2">
            {service.description}
          </p>
        </div>

        {/* Price and Duration */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl font-bold text-primary-600">
            ${service.pricing?.amount || service.price}
          </div>
          <div className="flex items-center text-gray-500 text-sm">
            <Clock className="w-4 h-4 mr-1" />
            {service.duration} min
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* View Details Button */}
          <Link
            to={`/services/${service.id}`}
            className="flex-1 bg-primary-50 text-primary-600 hover:bg-primary-100 font-medium py-2 px-3 rounded-lg transition-colors text-center text-sm flex items-center justify-center"
          >
            <Eye className="w-4 h-4 mr-1" />
            View Details
          </Link>

          {/* Edit/Delete Buttons (only for admin/provider) */}
          {canEdit && (
            <>
              <Link
                to={`/services/edit/${service.id}`}
                className="bg-gray-100 text-gray-600 hover:bg-gray-200 p-2 rounded-lg transition-colors"
                title="Edit Service"
              >
                <Edit className="w-4 h-4" />
              </Link>
              
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-100 text-red-600 hover:bg-red-200 p-2 rounded-lg transition-colors disabled:opacity-50"
                title="Delete Service"
              >
                {isDeleting ? (
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ServiceCard