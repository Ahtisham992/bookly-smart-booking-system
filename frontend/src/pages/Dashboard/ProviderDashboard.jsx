// src/pages/Dashboard/ProviderDashboard.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  Filter,
  Search,
  BarChart3,
  Star,
  MapPin,
  Phone,
  Mail,
  Settings,
  Plus
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext/AuthContext'
import { useBooking } from '../../context/BookingContext/BookingContext'
import { useServices } from '../../context/ServicesContext/ServicesContext'

const ProviderDashboard = () => {
  const { user } = useAuth()
  const { 
    bookings, 
    updateBookingStatus, 
    loading,
    getUpcomingBookings,
    getPastBookings
  } = useBooking()
  const { services } = useServices()

  const [activeTab, setActiveTab] = useState('overview')
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDateRange, setSelectedDateRange] = useState('week')

  // Get provider's bookings
  const providerBookings = bookings.filter(booking => booking.providerId === user?.id)
  const upcomingBookings = providerBookings.filter(booking => {
    const bookingDate = new Date(booking.date)
    return bookingDate >= new Date() && booking.status !== 'cancelled'
  }).sort((a, b) => new Date(a.date) - new Date(b.date))

  const pendingBookings = providerBookings.filter(booking => booking.status === 'pending')
  const confirmedBookings = providerBookings.filter(booking => booking.status === 'confirmed')
  const completedBookings = providerBookings.filter(booking => booking.status === 'completed')

  // Calculate stats
  const stats = [
    {
      name: 'Pending Requests',
      value: pendingBookings.length,
      icon: AlertCircle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      change: '+2 from yesterday'
    },
    {
      name: 'Confirmed Today',
      value: confirmedBookings.filter(b => b.date === new Date().toISOString().split('T')[0]).length,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: 'Next: 10:00 AM'
    },
    {
      name: 'Monthly Earnings',
      value: `$${completedBookings.reduce((sum, b) => sum + b.price, 0)}`,
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+12% from last month'
    },
    {
      name: 'Total Customers',
      value: new Set(providerBookings.map(b => b.userId)).size,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: '5 new this month'
    }
  ]

  // Filter bookings based on status and search
  const getFilteredBookings = () => {
    let filtered = providerBookings

    if (filterStatus !== 'all') {
      filtered = filtered.filter(booking => booking.status === filterStatus)
    }

    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.notes.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  const handleStatusUpdate = async (bookingId, newStatus) => {
    const result = await updateBookingStatus(bookingId, newStatus)
    if (result.success) {
      // Show success message or handle UI update
      console.log('Booking status updated successfully')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
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
    const [hours, minutes] = timeString.split(':')
    const time = new Date()
    time.setHours(parseInt(hours), parseInt(minutes))
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming Appointments */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Today's Schedule</h2>
          </div>
          <div className="p-6">
            {upcomingBookings.slice(0, 5).length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No appointments scheduled</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{booking.serviceName}</h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatDate(booking.date)} at {formatTime(booking.time)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                      <span className="text-sm font-medium text-gray-900">${booking.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions & Pending Requests */}
        <div className="space-y-6">
          {/* Pending Requests */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Pending Requests</h2>
            </div>
            <div className="p-6">
              {pendingBookings.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No pending requests</p>
              ) : (
                <div className="space-y-3">
                  {pendingBookings.slice(0, 3).map((booking) => (
                    <div key={booking.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-medium text-gray-900 text-sm">{booking.serviceName}</h4>
                      <p className="text-sm text-gray-600">{formatDate(booking.date)} at {formatTime(booking.time)}</p>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                          className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200"
                          disabled={loading}
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                          className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200"
                          disabled={loading}
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                  {pendingBookings.length > 3 && (
                    <button
                      onClick={() => setActiveTab('bookings')}
                      className="w-full text-center text-primary-600 hover:text-primary-700 text-sm font-medium py-2"
                    >
                      View all {pendingBookings.length} requests
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                to="/services/add"
                className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="p-2 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
                  <Plus className="h-5 w-5 text-primary-600" />
                </div>
                <span className="ml-3 text-sm font-medium text-gray-700">Add New Service</span>
              </Link>
              
              <Link
                to="/profile"
                className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <Settings className="h-5 w-5 text-purple-600" />
                </div>
                <span className="ml-3 text-sm font-medium text-gray-700">Update Profile</span>
              </Link>
              
              <button
                onClick={() => setActiveTab('analytics')}
                className="w-full flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                  <BarChart3 className="h-5 w-5 text-orange-600" />
                </div>
                <span className="ml-3 text-sm font-medium text-gray-700">View Analytics</span>
              </button>
            </div>
          </div>

          {/* Provider Info */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">My Profile</h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-lg">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">4.8 rating</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  {user?.email}
                </div>
                {user?.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    {user.phone}
                  </div>
                )}
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Service Area
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderBookings = () => (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-900">All Bookings</h2>
          
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="divide-y divide-gray-200">
        {getFilteredBookings().length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No bookings found matching your criteria</p>
          </div>
        ) : (
          getFilteredBookings().map((booking) => (
            <div key={booking.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      {booking.serviceName}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(booking.date)} at {formatTime(booking.time)}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {booking.duration} minutes
                    </div>
                    {booking.notes && (
                      <p className="text-gray-500 mt-2">
                        <strong>Notes:</strong> {booking.notes}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="ml-4 text-right">
                  <p className="text-lg font-semibold text-gray-900">${booking.price}</p>
                  
                  {booking.status === 'pending' && (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                        className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded hover:bg-green-200 transition-colors"
                        disabled={loading}
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                        className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200 transition-colors"
                        disabled={loading}
                      >
                        Decline
                      </button>
                    </div>
                  )}
                  
                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => handleStatusUpdate(booking.id, 'completed')}
                      className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200 transition-colors"
                      disabled={loading}
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Analytics Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900">{completedBookings.length}</h3>
            <p className="text-sm text-gray-600">Completed Services</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              ${completedBookings.reduce((sum, b) => sum + b.price, 0)}
            </h3>
            <p className="text-sm text-gray-600">Total Earnings</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Star className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900">4.8</h3>
            <p className="text-sm text-gray-600">Average Rating</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Performance</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="text-gray-700">This Week</span>
            <span className="font-medium">{confirmedBookings.length} appointments</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="text-gray-700">Response Rate</span>
            <span className="font-medium">95%</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="text-gray-700">Customer Retention</span>
            <span className="font-medium">78%</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Provider Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your bookings, track performance, and grow your business
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-8 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'bookings', label: 'Bookings', icon: Calendar },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp }
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'bookings' && renderBookings()}
      {activeTab === 'analytics' && renderAnalytics()}
    </div>
  )
}

export default ProviderDashboard