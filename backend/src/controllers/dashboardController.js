// controllers/dashboardController.js
const Booking = require('../models/Booking')
const Service = require('../models/Service')
const Review = require('../models/Review')
const User = require('../models/User')
const { sendSuccessResponse, sendErrorResponse } = require('../utils/helpers/responseHelpers')

// @desc    Get provider dashboard statistics
// @route   GET /api/dashboard/provider
// @access  Private (Provider only)
exports.getProviderDashboard = async (req, res) => {
  try {
    const providerId = req.user.id

    // Get booking statistics
    const bookingStats = await Booking.aggregate([
      { $match: { provider: providerId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$pricing.totalAmount' }
        }
      }
    ])

    // Format booking stats
    const stats = {
      totalPending: 0,
      totalConfirmed: 0,
      totalCompleted: 0,
      totalCancelled: 0,
      totalRevenue: 0
    }

    bookingStats.forEach(stat => {
      switch (stat._id) {
        case 'pending':
          stats.totalPending = stat.count
          break
        case 'confirmed':
          stats.totalConfirmed = stat.count
          break
        case 'completed':
          stats.totalCompleted = stat.count
          stats.totalRevenue += stat.totalRevenue || 0
          break
        case 'cancelled':
          stats.totalCancelled = stat.count
          break
      }
    })

    // Get recent bookings
    const recentBookings = await Booking.find({ provider: providerId })
      .populate('customer', 'firstName lastName email')
      .populate('service', 'title duration')
      .sort({ createdAt: -1 })
      .limit(5)

    // Get upcoming bookings (next 7 days)
    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    const upcomingBookings = await Booking.find({
      provider: providerId,
      status: { $in: ['confirmed', 'pending'] },
      scheduledDate: {
        $gte: today.toISOString().split('T')[0],
        $lte: nextWeek.toISOString().split('T')[0]
      }
    })
      .populate('customer', 'firstName lastName phone')
      .populate('service', 'title duration')
      .sort({ scheduledDate: 1, scheduledTime: 1 })
      .limit(10)

    // Get service statistics
    const serviceStats = await Service.aggregate([
      { $match: { provider: providerId, isActive: true } },
      {
        $group: {
          _id: null,
          totalServices: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: '$reviewCount' }
        }
      }
    ])

    const serviceData = serviceStats[0] || {
      totalServices: 0,
      averageRating: 0,
      totalReviews: 0
    }

    // Get monthly revenue (last 12 months)
    const monthlyRevenue = await Booking.aggregate([
      {
        $match: {
          provider: providerId,
          status: 'completed',
          createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$pricing.totalAmount' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ])

    // Get recent reviews
    const recentReviews = await Review.find({ provider: providerId })
      .populate('customer', 'firstName lastName')
      .populate('service', 'title')
      .sort({ createdAt: -1 })
      .limit(5)

    const dashboardData = {
      stats,
      serviceData,
      recentBookings,
      upcomingBookings,
      monthlyRevenue,
      recentReviews
    }

    sendSuccessResponse(res, dashboardData, 'Provider dashboard data retrieved successfully')
  } catch (error) {
    console.error('Get provider dashboard error:', error)
    sendErrorResponse(res, 'Failed to get provider dashboard data', 500)
  }
}

// @desc    Get user dashboard statistics
// @route   GET /api/dashboard/user
// @access  Private (User only)
exports.getUserDashboard = async (req, res) => {
  try {
    const userId = req.user.id

    // Get booking statistics
    const bookingStats = await Booking.aggregate([
      { $match: { customer: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    // Format booking stats
    const stats = {
      totalBookings: 0,
      upcomingBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0
    }

    bookingStats.forEach(stat => {
      stats.totalBookings += stat.count
      switch (stat._id) {
        case 'pending':
        case 'confirmed':
          stats.upcomingBookings += stat.count
          break
        case 'completed':
          stats.completedBookings = stat.count
          break
        case 'cancelled':
          stats.cancelledBookings = stat.count
          break
      }
    })

    // Get recent bookings
    const recentBookings = await Booking.find({ customer: userId })
      .populate('provider', 'firstName lastName providerInfo.rating')
      .populate('service', 'title duration pricing')
      .sort({ createdAt: -1 })
      .limit(5)

    // Get upcoming bookings
    const today = new Date()
    const upcomingBookings = await Booking.find({
      customer: userId,
      status: { $in: ['confirmed', 'pending'] },
      scheduledDate: { $gte: today.toISOString().split('T')[0] }
    })
      .populate('provider', 'firstName lastName phone')
      .populate('service', 'title duration location')
      .sort({ scheduledDate: 1, scheduledTime: 1 })
      .limit(10)

    // Get completed bookings that can be reviewed
    const bookingsToReview = await Booking.find({
      customer: userId,
      status: 'completed'
    }).populate({
      path: 'service',
      select: 'title'
    }).populate({
      path: 'provider',
      select: 'firstName lastName'
    })

    // Filter out bookings that already have reviews
    const reviewedBookings = await Review.find({ customer: userId }).distinct('booking')
    const pendingReviews = bookingsToReview.filter(
      booking => !reviewedBookings.includes(booking._id.toString())
    ).slice(0, 5)

    // Get favorite services (most booked categories)
    const favoriteCategories = await Booking.aggregate([
      { $match: { customer: userId } },
      {
        $lookup: {
          from: 'services',
          localField: 'service',
          foreignField: '_id',
          as: 'serviceData'
        }
      },
      { $unwind: '$serviceData' },
      {
        $lookup: {
          from: 'categories',
          localField: 'serviceData.category',
          foreignField: '_id',
          as: 'categoryData'
        }
      },
      { $unwind: '$categoryData' },
      {
        $group: {
          _id: '$categoryData._id',
          name: { $first: '$categoryData.name' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ])

    // Get booking history for the last 6 months
    const sixMonthsAgo = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000)
    const bookingHistory = await Booking.aggregate([
      {
        $match: {
          customer: userId,
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ])

    const dashboardData = {
      stats,
      recentBookings,
      upcomingBookings,
      pendingReviews,
      favoriteCategories,
      bookingHistory
    }

    sendSuccessResponse(res, dashboardData, 'User dashboard data retrieved successfully')
  } catch (error) {
    console.error('Get user dashboard error:', error)
    sendErrorResponse(res, 'Failed to get user dashboard data', 500)
  }
}

// @desc    Get admin dashboard statistics
// @route   GET /api/dashboard/admin
// @access  Private (Admin only)
exports.getAdminDashboard = async (req, res) => {
  try {
    // Get user statistics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ])

    const users = {
      totalUsers: 0,
      totalProviders: 0,
      totalCustomers: 0
    }

    userStats.forEach(stat => {
      users.totalUsers += stat.count
      if (stat._id === 'provider') {
        users.totalProviders = stat.count
      } else if (stat._id === 'user') {
        users.totalCustomers = stat.count
      }
    })

    // Get booking statistics
    const bookingStats = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: { $sum: '$pricing.totalAmount' }
        }
      }
    ])

    const bookings = {
      total: 0,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      totalRevenue: 0
    }

    bookingStats.forEach(stat => {
      bookings.total += stat.count
      bookings[stat._id] = stat.count
      if (stat._id === 'completed') {
        bookings.totalRevenue = stat.revenue
      }
    })

    // Get service statistics
    const serviceStats = await Service.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
          approved: { $sum: { $cond: [{ $eq: ['$isApproved', true] }, 1, 0] } }
        }
      }
    ])

    const services = serviceStats[0] || { total: 0, active: 0, approved: 0 }

    // Get recent activity
    const recentBookings = await Booking.find()
      .populate('customer', 'firstName lastName')
      .populate('provider', 'firstName lastName')
      .populate('service', 'title')
      .sort({ createdAt: -1 })
      .limit(10)

    // Get monthly growth data
    const monthlyGrowth = await User.aggregate([
      {
        $match: { createdAt: { $gte: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000) } }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            role: '$role'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ])

    // Get pending approvals
    const pendingServices = await Service.countDocuments({ isApproved: false, isActive: true })
    
    // Get top providers
    const topProviders = await User.find({ role: 'provider' })
      .sort({ 'providerInfo.rating': -1, 'providerInfo.reviewCount': -1 })
      .select('firstName lastName providerInfo.rating providerInfo.reviewCount')
      .limit(5)

    const dashboardData = {
      users,
      bookings,
      services,
      recentBookings,
      monthlyGrowth,
      pendingServices,
      topProviders
    }

    sendSuccessResponse(res, dashboardData, 'Admin dashboard data retrieved successfully')
  } catch (error) {
    console.error('Get admin dashboard error:', error)
    console.error('Error stack:', error.stack)
    sendErrorResponse(res, `Failed to get admin dashboard data: ${error.message}`, 500)
  }
}