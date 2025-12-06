// src/pages/Bookings/MyBookings.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, Search, Filter, Check, X, CheckCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext/AuthContext'
import { bookingService } from '@/services/api'

const MyBookings = () => {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, pending, confirmed, completed, cancelled
  const [searchTerm, setSearchTerm] = useState('')

  const isProvider = user?.role === 'provider'

  useEffect(() => {
    loadBookings()
  }, [user])

  const loadBookings = async () => {
    setLoading(true)
    try {
      const response = isProvider 
        ? await bookingService.getProviderBookings()
        : await bookingService.getCustomerBookings()
      
      if (response.success) {
        setBookings(response.data || [])
      }
    } catch (error) {
      console.error('Error loading bookings:', error)
    }
    setLoading(false)
  }

  const handleAccept = async (bookingId) => {
    const response = await bookingService.acceptBooking(bookingId)
    if (response.success) {
      loadBookings()
    } else {
      alert(response.error || 'Failed to accept booking')
    }
  }

  const handleReject = async (bookingId) => {
    const reason = prompt('Reason for rejection (optional):')
    const response = await bookingService.rejectBooking(bookingId, reason)
    if (response.success) {
      loadBookings()
    } else {
      alert(response.error || 'Failed to reject booking')
    }
  }

  const handleComplete = async (bookingId) => {
    if (!window.confirm('Mark this booking as completed?')) return
    const response = await bookingService.completeBooking(bookingId)
    if (response.success) {
      loadBookings()
    } else {
      alert(response.error || 'Failed to complete booking')
    }
  }

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return
    const response = await bookingService.cancelBooking(bookingId)
    if (response.success) {
      loadBookings()
    } else {
      alert(response.error || 'Failed to cancel booking')
    }
  }

  const getFilteredBookings = () => {
    let filtered = bookings

    // Filter by status
    if (filter !== 'all') {
      filtered = filtered.filter(b => b.status === filter)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(b => {
        const serviceName = b.service?.title?.toLowerCase() || ''
        const customerName = isProvider 
          ? `${b.customer?.firstName} ${b.customer?.lastName}`.toLowerCase()
          : `${b.provider?.firstName} ${b.provider?.lastName}`.toLowerCase()
        return serviceName.includes(searchTerm.toLowerCase()) || 
               customerName.includes(searchTerm.toLowerCase())
      })
    }

    return filtered
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      rejected: 'bg-red-100 text-red-800'
    }
    return badges[status] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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

  const filteredBookings = getFilteredBookings()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isProvider ? 'My Bookings' : 'My Bookings'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isProvider ? 'Manage bookings for your services' : 'View and manage your service bookings'}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={isProvider ? "Search by service or customer..." : "Search by service or provider..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading bookings...</p>
          </div>
        ) : filteredBookings.length > 0 ? (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Booking Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {booking.service?.title || 'Service'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {isProvider ? (
                            <>Customer: {booking.customer?.firstName} {booking.customer?.lastName}</>
                          ) : (
                            <>Provider: {booking.provider?.firstName} {booking.provider?.lastName}</>
                          )}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {formatDate(booking.date || booking.scheduledDate)}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        {formatTime(booking.time || booking.scheduledTime?.start)}
                      </div>
                      <div className="text-primary-600 font-semibold">
                        ${booking.service?.pricing?.amount || booking.pricing?.totalAmount || 0}
                      </div>
                      <div>
                        Duration: {booking.service?.duration || booking.duration || 0} min
                      </div>
                    </div>

                    {booking.notes && (
                      <div className="mt-3 text-sm text-gray-600">
                        <span className="font-medium">Notes:</span> {booking.notes}
                      </div>
                    )}

                    {/* Rejection Reason - Only show for rejected bookings */}
                    {booking.status === 'rejected' && booking.providerResponse?.rejectionReason && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm font-medium text-red-800 mb-1">Rejection Reason:</p>
                        <p className="text-sm text-red-700">{booking.providerResponse.rejectionReason}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 lg:min-w-[200px]">
                    {isProvider ? (
                      <>
                        {booking.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleAccept(booking._id)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                            >
                              <Check className="h-4 w-4" />
                              Accept
                            </button>
                            <button
                              onClick={() => handleReject(booking._id)}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                            >
                              <X className="h-4 w-4" />
                              Reject
                            </button>
                          </>
                        )}
                        {booking.status === 'confirmed' && (
                          <>
                            <button
                              onClick={() => handleComplete(booking._id)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Mark Complete
                            </button>
                            <button
                              onClick={() => handleCancel(booking._id)}
                              className="px-4 py-2 text-red-600 hover:bg-red-50 border border-red-300 rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        {(booking.status === 'pending' || booking.status === 'confirmed') && (
                          <button
                            onClick={() => handleCancel(booking._id)}
                            className="px-4 py-2 text-red-600 hover:bg-red-50 border border-red-300 rounded-lg transition-colors"
                          >
                            Cancel Booking
                          </button>
                        )}
                        {booking.status === 'completed' && !booking.review && (
                          <Link
                            to={`/bookings/${booking._id}/review`}
                            className="px-4 py-2 text-primary-600 hover:bg-primary-50 border border-primary-300 rounded-lg transition-colors text-center"
                          >
                            Leave Review
                          </Link>
                        )}
                      </>
                    )}
                    <Link
                      to={`/services/${booking.service?._id || booking.service}`}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors text-center"
                    >
                      View Service
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? isProvider 
                  ? "You don't have any bookings yet."
                  : "You haven't made any bookings yet."
                : `No ${filter} bookings found.`}
            </p>
            {!isProvider && (
              <Link
                to="/services"
                className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Browse Services
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyBookings
