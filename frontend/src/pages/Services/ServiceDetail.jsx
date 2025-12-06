// src/pages/Services/ServiceDetail.jsx
import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, Calendar, Edit, Trash2, MapPin, Star, X, DollarSign } from 'lucide-react'
import { useAuth } from '@/context/AuthContext/AuthContext'
import { useServices } from '@/context/ServicesContext/ServicesContext'
import { bookingService } from '@/services/api'
import { 
  generateTimeSlots, 
  filterPastSlots, 
  markUnavailableSlots,
  getProviderWorkingHours 
} from '@/utils/timeSlots'

const ServiceDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { getServiceById, deleteService } = useServices()
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    notes: ''
  })
  const [isBooking, setIsBooking] = useState(false)
  const [timeSlots, setTimeSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)

  const isProvider = user?.role === 'provider'
  const isOwner = isProvider && service?.provider?._id === user?._id
  const canEdit = isOwner || user?.role === 'admin'

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
      navigate('/login', { 
        state: { 
          from: `/services/${id}`,
          message: 'Please log in to book this service'
        }
      })
      return
    }
    
    if (isProvider) {
      alert('Providers cannot book services')
      return
    }
    
    setShowBookingModal(true)
  }

  const handleDateChange = async (selectedDate) => {
    setBookingData({ ...bookingData, date: selectedDate, time: '' })
    setSelectedSlot(null)
    
    if (!selectedDate || !service) return
    
    setLoadingSlots(true)
    try {
      const workingHours = getProviderWorkingHours(service.provider)
      
      let slots = generateTimeSlots(
        service.duration,
        workingHours.start,
        workingHours.end
      )
      
      slots = filterPastSlots(slots, selectedDate)
      
      const providerId = service.provider?._id || service.provider?.id || service.provider
      const response = await bookingService.getProviderBookings({
        date: selectedDate,
        providerId: providerId
      })
      
      if (response.success && response.data) {
        slots = markUnavailableSlots(slots, response.data)
      }
      
      setTimeSlots(slots)
    } catch (error) {
      console.error('Error loading time slots:', error)
      const workingHours = getProviderWorkingHours(service.provider)
      let slots = generateTimeSlots(
        service.duration,
        workingHours.start,
        workingHours.end
      )
      slots = filterPastSlots(slots, selectedDate)
      setTimeSlots(slots)
    }
    setLoadingSlots(false)
  }

  const handleSlotSelect = (slot) => {
    if (!slot.available) return
    setSelectedSlot(slot)
    setBookingData({ ...bookingData, time: slot.time })
  }

  const handleBookingSubmit = async (e) => {
    e.preventDefault()
    
    if (!bookingData.date || !bookingData.time) {
      alert('Please select date and time slot')
      return
    }

    setIsBooking(true)
    try {
      const bookingPayload = {
        serviceId: service._id || service.id,
        providerId: service.provider?._id || service.provider?.id || service.provider,
        scheduledDate: bookingData.date,
        scheduledTime: bookingData.time,
        notes: bookingData.notes || '',
        duration: service.duration
      }

      console.log('Booking payload:', bookingPayload)
      const response = await bookingService.createBooking(bookingPayload)

      if (response.success) {
        alert('Booking created successfully!')
        setShowBookingModal(false)
        setBookingData({ date: '', time: '', notes: '' })
        setSelectedSlot(null)
        setTimeSlots([])
        navigate('/my-bookings')
      } else {
        alert(response.error || 'Failed to create booking')
      }
    } catch (error) {
      console.error('Booking error:', error)
      alert('Failed to create booking. Please try again.')
    }
    setIsBooking(false)
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
            {(service.imageUrl || (service.media?.images && service.media.images.length > 0)) ? (
              <img
                src={service.imageUrl || service.media?.images[0]}
                alt={service.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextElementSibling.style.display = 'flex'
                }}
              />
            ) : (
              <div className="absolute inset-0 bg-gray-300 flex items-center justify-center text-gray-500">
                <span>No Image Available</span>
              </div>
            )}
            {(service.imageUrl || (service.media?.images && service.media.images.length > 0)) && (
              <div className="absolute inset-0 bg-gray-300 items-center justify-center text-gray-500 hidden">
                <span>No Image Available</span>
              </div>
            )}

            {/* Category Badge */}
            <div className="absolute top-4 left-4">
              <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                {service.category?.name || service.category}
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

              {/* Booking Card - Only for Customers */}
              {!isProvider && (
                <div className="lg:w-80 mt-6 lg:mt-0">
                  <div className="bg-gray-50 rounded-lg p-6 sticky top-6">
                    <div className="text-center mb-6">
                      <div className="text-3xl font-bold text-primary-600 mb-1">
                        ${service.pricing?.amount || service.price}
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
                        <span className="font-medium">{service.category?.name || service.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Provider:</span>
                        <span className="font-medium">{service.provider?.firstName} {service.provider?.lastName}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500 text-center">
                      Free cancellation up to 24 hours before appointment
                    </div>
                  </div>
                </div>
              )}

              {/* Provider Info Card - Only for Providers viewing their own service */}
              {isOwner && (
                <div className="lg:w-80 mt-6 lg:mt-0">
                  <div className="bg-blue-50 rounded-lg p-6 sticky top-6 border-2 border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">Your Service</h3>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-semibold text-gray-900">${service.pricing?.amount || service.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium text-gray-900">{service.duration} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium text-gray-900">{service.category?.name || service.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`font-medium ${service.isActive ? 'text-green-600' : 'text-red-600'}`}>
                          {service.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 space-y-2">
                      <Link
                        to={`/services/edit/${service.id || service._id}`}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Service
                      </Link>
                      <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="w-full text-red-600 hover:bg-red-50 border border-red-300 py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        {isDeleting ? 'Deleting...' : 'Delete Service'}
                      </button>
                    </div>

                    <div className="mt-4 pt-4 border-t border-blue-200 text-xs text-blue-700 text-center">
                      This is your service. Customers can book it.
                    </div>
                  </div>
                </div>
              )}
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

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Book Service</h2>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleBookingSubmit} className="p-6">
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-sm text-gray-600">
                  Provider: {service.provider?.firstName} {service.provider?.lastName}
                </p>
                <p className="text-sm text-gray-600">
                  Duration: {service.duration} minutes • ${service.pricing?.amount || service.price}
                </p>
              </div>

              <div className="space-y-4">
                {/* Date Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Date *
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingData.date}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* Time Slots */}
                {bookingData.date && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Time Slot *
                    </label>
                    
                    {loadingSlots ? (
                      <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
                        <p className="text-sm text-gray-600 mt-2">Loading available slots...</p>
                      </div>
                    ) : timeSlots.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">No available time slots for this date</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                        {timeSlots.map((slot, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleSlotSelect(slot)}
                            disabled={!slot.available}
                            className={`
                              px-3 py-2 rounded-lg text-sm font-medium transition-all
                              ${selectedSlot?.time === slot.time
                                ? 'bg-primary-600 text-white ring-2 ring-primary-600 ring-offset-2'
                                : slot.available
                                ? 'bg-white border-2 border-gray-300 text-gray-700 hover:border-primary-500 hover:bg-primary-50'
                                : 'bg-gray-100 border-2 border-gray-200 text-gray-400 cursor-not-allowed'
                              }
                            `}
                          >
                            {slot.display}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {selectedSlot && (
                      <p className="text-xs text-gray-600 mt-2">
                        Selected: {selectedSlot.display} ({service.duration} min session)
                      </p>
                    )}
                  </div>
                )}

                {/* Notes Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    rows="3"
                    value={bookingData.notes}
                    onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                    placeholder="Any special requirements or notes..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBooking}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isBooking ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ServiceDetail