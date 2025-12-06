// src/pages/Dashboard/Dashboard.jsx - Updated for backend auth integration
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, Users, TrendingUp, Plus, Search, Filter, ChevronRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext/AuthContext'
import { useBooking } from '@/context/BookingContext/BookingContext'

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth()
  const { bookings, loading, getUpcomingBookings, getBookingsByStatus } = useBooking()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [upcomingAppointments, setUpcomingAppointments] = useState([])

  // Fetch real booking data
  useEffect(() => {
    if (bookings && bookings.length > 0) {
      const upcoming = getUpcomingBookings()
      setUpcomingAppointments(upcoming)
    }
  }, [bookings])

  // If user is not authenticated or loading, show loading
  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Calculate real stats from bookings
  const upcomingCount = getUpcomingBookings().length
  const thisMonthBookings = bookings.filter(b => {
    const bookingDate = new Date(b.scheduledDate)
    const now = new Date()
    return bookingDate.getMonth() === now.getMonth() && 
           bookingDate.getFullYear() === now.getFullYear()
  }).length
  const completedBookings = getBookingsByStatus('completed').length
  const totalSpent = bookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + (b.pricing?.totalAmount || 0), 0)

  const stats = [
    {
      name: 'Upcoming Appointments',
      value: upcomingCount.toString(),
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      name: 'This Month',
      value: thisMonthBookings.toString(),
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      name: 'Completed',
      value: completedBookings.toString(),
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      name: 'Total Spent',
      value: `$${totalSpent.toFixed(0)}`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ]

  // Filter appointments based on search and status
  const filteredAppointments = upcomingAppointments.filter(appointment => {
    const serviceName = appointment.service?.title || ''
    const providerName = `${appointment.provider?.firstName || ''} ${appointment.provider?.lastName || ''}`.trim()
    
    const matchesSearch = serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         providerName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName || 'User'}!
        </h1>
        <p className="text-gray-600 mt-2">Here's your appointment overview and quick actions.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Upcoming Appointments */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
                
                {/* Search and Filter */}
                <div className="flex gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search appointments..."
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
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment) => (
                  <div key={appointment._id || appointment.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {appointment.service?.title || 'Service'}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <p className="font-medium">
                            {appointment.provider?.firstName} {appointment.provider?.lastName}
                          </p>
                          <p className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(appointment.scheduledDate)} at {appointment.scheduledTime?.start || appointment.scheduledTime}
                          </p>
                          <p>{appointment.location?.address || appointment.location?.type}</p>
                        </div>
                      </div>
                      
                      <div className="ml-4 text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          ${appointment.pricing?.totalAmount || 0}
                        </p>
                        <button className="mt-2 text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center">
                          View Details
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {bookings.length === 0 
                      ? 'No bookings yet. Book your first appointment!' 
                      : 'No appointments found matching your criteria'}
                  </p>
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <Link 
                to="/appointments" 
                className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center justify-center"
              >
                View all appointments
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link 
                to="/booking" 
                className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="p-2 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
                  <Plus className="h-5 w-5 text-primary-600" />
                </div>
                <span className="ml-3 text-sm font-medium text-gray-700">Book New Appointment</span>
              </Link>
              
              <Link 
                to="/providers" 
                className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <span className="ml-3 text-sm font-medium text-gray-700">Find Providers</span>
              </Link>
              
              <Link 
                to="/appointments/history" 
                className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <span className="ml-3 text-sm font-medium text-gray-700">View History</span>
              </Link>
            </div>
          </div>

          {/* User Profile Summary - Shows actual user data from backend */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile</h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-lg">
                    {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || ''}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName || 'User'} {user?.lastName || ''}
                  </p>
                  <p className="text-sm text-gray-600">{user?.email || 'No email'}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 capitalize">
                      {user?.role || 'user'} Account
                    </span>
                    {user?.isVerified ? (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        ✓ Verified
                      </span>
                    ) : (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        ⚠ Unverified
                      </span>
                    )}
                  </div>
                  {user?.phone && (
                    <p className="text-xs text-gray-500">{user.phone}</p>
                  )}
                </div>
              </div>
              
              <div className="pt-3 border-t">
                <Link 
                  to="/profile" 
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Edit Profile →
                </Link>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Info</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Member since:</span>
                <span className="text-gray-900">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Account type:</span>
                <span className="text-gray-900 capitalize">{user?.role || 'User'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={user?.isVerified ? 'text-green-600' : 'text-yellow-600'}>
                  {user?.isVerified ? 'Verified' : 'Pending Verification'}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-start">
                <div className="h-2 w-2 bg-green-400 rounded-full mt-2 mr-3"></div>
                <div>
                  <p className="text-gray-900">Account created</p>
                  <p className="text-gray-500">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleString() : 'Recently'}
                  </p>
                </div>
              </div>
              {user?.phone && (
                <div className="flex items-start">
                  <div className="h-2 w-2 bg-blue-400 rounded-full mt-2 mr-3"></div>
                  <div>
                    <p className="text-gray-900">Phone number added</p>
                    <p className="text-gray-500">{user.phone}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start">
                <div className="h-2 w-2 bg-purple-400 rounded-full mt-2 mr-3"></div>
                <div>
                  <p className="text-gray-900">Profile setup completed</p>
                  <p className="text-gray-500">Ready to book appointments</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard