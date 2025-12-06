// src/pages/Dashboard/CustomerDashboard.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, CheckCircle, XCircle, Star, ArrowRight, AlertCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext/AuthContext'
import { useBooking } from '@/context/BookingContext/BookingContext'

const CustomerDashboard = () => {
  const { user } = useAuth()
  const { getUserBookings, cancelBooking, loading } = useBooking()
  const [bookings, setBookings] = useState([])
  const [stats, setStats] = useState({
    upcoming: 0,
    completed: 0,
    cancelled: 0
  })

  useEffect(() => {
    loadBookings()
  }, [user])

  const loadBookings = async () => {
    if (!user?._id) return
    
    const result = await getUserBookings(user._id)
    if (result.success) {
      setBookings(result.data || [])
      
      // Calculate stats
      const upcoming = result.data?.filter(b => 
        b.status === 'pending' || b.status === 'confirmed'
      ).length || 0
      const completed = result.data?.filter(b => b.status === 'completed').length || 0
      const cancelled = result.data?.filter(b => b.status === 'cancelled').length || 0
      
      setStats({ upcoming, completed, cancelled })
    }
  }

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return
    
    const result = await cancelBooking(bookingId)
    if (result.success) {
      loadBookings()
    }
  }

  const getUpcomingBookings = () => {
    return bookings
      .filter(b => b.status === 'pending' || b.status === 'confirmed')
      .sort((a, b) => new Date(a.scheduledDate || a.date) - new Date(b.scheduledDate || b.date))
      .slice(0, 5)
  }

  const getRecentBookings = () => {
    return bookings
      .filter(b => b.status === 'completed' || b.status === 'cancelled')
      .sort((a, b) => new Date(b.scheduledDate || b.date) - new Date(a.scheduledDate || a.date))
      .slice(0, 5)
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your bookings and explore new services
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-3xl font-bold text-primary-600 mt-2">{stats.upcoming}</p>
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
                <p className="text-sm font-medium text-gray-600">Cancelled</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.cancelled}</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Bookings */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Upcoming Bookings</h2>
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
            ) : getUpcomingBookings().length > 0 ? (
              <div className="space-y-4">
                {getUpcomingBookings().map((booking) => (
                  <div key={booking._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{booking.service?.title || 'Service'}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(booking.status)}`}>
                            {booking.status}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {formatDate(booking.scheduledDate || booking.date)}
                          </p>
                          <p className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            {formatTime(booking.scheduledTime?.start || booking.time)}
                          </p>
                          <p className="flex items-center">
                            <span className="font-medium mr-2">Provider:</span>
                            {booking.provider?.firstName} {booking.provider?.lastName}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {booking.status === 'pending' || booking.status === 'confirmed' ? (
                          <button
                            onClick={() => handleCancelBooking(booking._id)}
                            className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 border border-red-300 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                        ) : null}
                        {booking.status === 'completed' && !booking.review && (
                          <Link
                            to={`/bookings/${booking._id}/review`}
                            className="px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 border border-primary-300 rounded-lg transition-colors text-center"
                          >
                            Leave Review
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No upcoming bookings</p>
                <Link
                  to="/services"
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Browse Services
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Bookings (Completed/Cancelled) */}
        {getRecentBookings().length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Recent Bookings</h2>
                <Link
                  to="/my-bookings"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
                >
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {getRecentBookings().map((booking) => (
                  <div key={booking._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{booking.service?.title || 'Service'}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(booking.status)}`}>
                            {booking.status}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {formatDate(booking.scheduledDate || booking.date)}
                          </p>
                          <p className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            {formatTime(booking.scheduledTime?.start || booking.time)}
                          </p>
                          <p className="flex items-center">
                            <span className="font-medium mr-2">Provider:</span>
                            {booking.provider?.firstName} {booking.provider?.lastName}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {booking.status === 'completed' && !booking.review && (
                          <Link
                            to={`/bookings/${booking._id}/review`}
                            className="px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 border border-primary-300 rounded-lg transition-colors text-center"
                          >
                            Leave Review
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Link
            to="/services"
            className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Browse Services</h3>
                <p className="text-gray-600 text-sm">Discover and book new services</p>
              </div>
              <ArrowRight className="h-6 w-6 text-primary-600" />
            </div>
          </Link>

          <Link
            to="/providers"
            className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Find Providers</h3>
                <p className="text-gray-600 text-sm">Connect with service providers</p>
              </div>
              <ArrowRight className="h-6 w-6 text-primary-600" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default CustomerDashboard
