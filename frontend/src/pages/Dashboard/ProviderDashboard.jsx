// src/pages/Dashboard/NewProviderDashboard.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, CheckCircle, DollarSign, Plus, ArrowRight, AlertCircle, X, Check, Settings } from 'lucide-react'
import { useAuth } from '@/context/AuthContext/AuthContext'
import { useServices } from '@/context/ServicesContext/ServicesContext'
import { bookingService } from '@/services/api'

const NewProviderDashboard = () => {
  const { user } = useAuth()
  const { services, fetchServices } = useServices()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    pending: 0,
    today: 0,
    completed: 0,
    earnings: 0
  })

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    setLoading(true)
    await Promise.all([
      fetchServices(),
      loadProviderBookings()
    ])
    setLoading(false)
  }

  const loadProviderBookings = async () => {
    try {
      // Get bookings for this provider
      const response = await bookingService.getProviderBookings()
      if (response.success) {
        const bookingsData = response.data || []
        setBookings(bookingsData)
        
        // Calculate stats
        const pending = bookingsData.filter(b => b.status === 'pending').length
        const today = bookingsData.filter(b => {
          const bookingDate = new Date(b.date)
          const now = new Date()
          return bookingDate.toDateString() === now.toDateString() && 
                 (b.status === 'confirmed' || b.status === 'pending')
        }).length
        const completed = bookingsData.filter(b => b.status === 'completed').length
        const earnings = bookingsData
          .filter(b => b.status === 'completed')
          .reduce((sum, b) => sum + (b.service?.pricing?.amount || 0), 0)
        
        setStats({ pending, today, completed, earnings })
      }
    } catch (error) {
      console.error('Error loading bookings:', error)
    }
  }

  const handleAcceptBooking = async (bookingId) => {
    try {
      const response = await bookingService.acceptBooking(bookingId)
      if (response.success) {
        loadProviderBookings()
      } else {
        alert(response.error || 'Failed to accept booking')
      }
    } catch (error) {
      console.error('Error accepting booking:', error)
      alert('Failed to accept booking')
    }
  }

  const handleRejectBooking = async (bookingId) => {
    const reason = prompt('Please provide a reason for rejection (optional):')
    try {
      const response = await bookingService.rejectBooking(bookingId, reason)
      if (response.success) {
        loadProviderBookings()
      } else {
        alert(response.error || 'Failed to reject booking')
      }
    } catch (error) {
      console.error('Error rejecting booking:', error)
      alert('Failed to reject booking')
    }
  }

  const handleCompleteBooking = async (bookingId) => {
    if (!window.confirm('Mark this booking as completed?')) return
    
    try {
      const response = await bookingService.completeBooking(bookingId)
      if (response.success) {
        loadProviderBookings()
      } else {
        alert(response.error || 'Failed to complete booking')
      }
    } catch (error) {
      console.error('Error completing booking:', error)
      alert('Failed to complete booking')
    }
  }

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return
    
    try {
      const response = await bookingService.cancelBooking(bookingId)
      if (response.success) {
        loadProviderBookings()
      } else {
        alert(response.error || 'Failed to cancel booking')
      }
    } catch (error) {
      console.error('Error cancelling booking:', error)
      alert('Failed to cancel booking')
    }
  }

  const getPendingBookings = () => {
    return bookings
      .filter(b => b.status === 'pending')
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  }

  const getTodayBookings = () => {
    const today = new Date().toDateString()
    return bookings
      .filter(b => {
        const bookingDate = new Date(b.date).toDateString()
        return bookingDate === today && (b.status === 'confirmed' || b.status === 'pending')
      })
      .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
  }

  const getMyServices = () => {
    return services.filter(s => s.provider?._id === user?._id || s.provider === user?._id)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A'
    const [hours, minutes] = timeString.split(':')
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes))
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const myServices = getMyServices()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Provider Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your bookings and services
            </p>
          </div>
          <Link
            to="/provider/settings"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-5 h-5" />
            Profile Settings
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today</p>
                <p className="text-3xl font-bold text-primary-600 mt-2">{stats.today}</p>
              </div>
              <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.completed}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Earnings</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">${stats.earnings}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Pending Bookings */}
        {getPendingBookings().length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border mb-8">
            <div className="p-6 border-b bg-yellow-50">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-yellow-600" />
                Pending Bookings - Need Action
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Review and respond to booking requests
              </p>
            </div>

            <div className="p-6 space-y-4">
              {getPendingBookings().map((booking) => (
                <div key={booking._id} className="border rounded-lg p-4 bg-yellow-50/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {booking.customer?.firstName} {booking.customer?.lastName}
                      </h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><span className="font-medium">Service:</span> {booking.service?.title}</p>
                        <p className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formatDate(booking.date)} at {formatTime(booking.time)}
                        </p>
                        {booking.notes && (
                          <p><span className="font-medium">Notes:</span> {booking.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleAcceptBooking(booking._id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <Check className="h-4 w-4" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectBooking(booking._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Today's Bookings */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Today's Bookings</h2>
              <Link to="/my-bookings" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading bookings...</p>
              </div>
            ) : getTodayBookings().length > 0 ? (
              <div className="space-y-4">
                {getTodayBookings().map((booking) => (
                  <div key={booking._id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {booking.customer?.firstName} {booking.customer?.lastName}
                        </h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p><span className="font-medium">Service:</span> {booking.service?.title}</p>
                          <p className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            {formatTime(booking.time)}
                          </p>
                          <p><span className="font-medium">Status:</span> 
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                              booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {booking.status}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => handleCompleteBooking(booking._id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                          >
                            Mark Complete
                          </button>
                        )}
                        <button
                          onClick={() => handleCancelBooking(booking._id)}
                          className="px-4 py-2 text-red-600 hover:bg-red-50 border border-red-300 rounded-lg transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No bookings for today</p>
              </div>
            )}
          </div>
        </div>

        {/* My Services */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">My Services</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {myServices.length} service{myServices.length !== 1 ? 's' : ''} active
                </p>
              </div>
              <Link
                to="/services/add"
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Link>
            </div>
          </div>

          <div className="p-6">
            {myServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myServices.slice(0, 4).map((service) => (
                  <Link
                    key={service._id}
                    to={`/services/${service._id}`}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">{service.title}</h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{service.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-primary-600 font-semibold">
                        ${service.pricing?.amount || 0}
                      </span>
                      <span className="text-gray-500">{service.duration} min</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No services yet</p>
                <Link
                  to="/services/add"
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Service
                </Link>
              </div>
            )}
            
            {myServices.length > 4 && (
              <div className="mt-4 text-center">
                <Link
                  to="/services"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center justify-center"
                >
                  View All Services
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewProviderDashboard
