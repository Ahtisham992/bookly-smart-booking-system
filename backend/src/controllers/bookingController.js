// controllers/bookingController.js
const Booking = require('../models/Booking')
const Service = require('../models/Service')
const User = require('../models/User')
const { sendSuccessResponse, sendErrorResponse } = require('../utils/helpers/responseHelpers')

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private (User only)
exports.createBooking = async (req, res) => {
  try {
    const { serviceId, providerId, scheduledDate, scheduledTime, notes } = req.body
    
    // Verify service exists and is active
    const service = await Service.findById(serviceId).populate('provider')
    if (!service || !service.isActive || !service.isApproved) {
      return sendErrorResponse(res, 'Service not found or not available', 404)
    }
    
    // Verify provider matches
    if (service.provider._id.toString() !== providerId) {
      return sendErrorResponse(res, 'Service does not belong to specified provider', 400)
    }
    
    // Check if user is trying to book their own service
    if (req.user.id === providerId) {
      return sendErrorResponse(res, 'You cannot book your own service', 400)
    }
    
    // Create booking date
    const bookingDateTime = new Date(`${scheduledDate}T${scheduledTime}`)
    
    // Check if booking is in the future
    if (bookingDateTime <= new Date()) {
      return sendErrorResponse(res, 'Booking must be scheduled for a future date and time', 400)
    }
    
    // Check for existing bookings at the same time
    const existingBooking = await Booking.findOne({
      provider: providerId,
      scheduledDate,
      scheduledTime,
      status: { $in: ['pending', 'confirmed', 'in-progress'] }
    })
    
    if (existingBooking) {
      return sendErrorResponse(res, 'Time slot is already booked', 409)
    }
    
    // Generate booking ID
    const bookingId = `BK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // Create booking
    const booking = await Booking.create({
      bookingId,
      customer: req.user.id,
      provider: providerId,
      service: serviceId,
      scheduledDate,
      scheduledTime,
      status: 'pending',
      location: service.location,
      pricing: {
        serviceFee: service.pricing.amount,
        totalAmount: service.pricing.amount
      },
      timeline: {
        requested: new Date()
      },
      notes
    })
    
    // Populate the response
    await booking.populate([
      { path: 'customer', select: 'firstName lastName email phone' },
      { path: 'provider', select: 'firstName lastName email phone' },
      { path: 'service', select: 'title description duration pricing' }
    ])
    
    sendSuccessResponse(res, booking, 'Booking created successfully', 201)
  } catch (error) {
    console.error('Create booking error:', error)
    
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(val => val.message).join(', ')
      return sendErrorResponse(res, message, 400)
    }
    
    sendErrorResponse(res, 'Failed to create booking', 500)
  }
}

// @desc    Get customer bookings
// @route   GET /api/bookings/customer
// @access  Private (User)
exports.getCustomerBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 10
    const startIndex = (page - 1) * limit
    
    let query = { customer: req.user.id }
    
    // Filter by status
    if (req.query.status) {
      query.status = req.query.status
    }
    
    const total = await Booking.countDocuments(query)
    const bookings = await Booking.find(query)
      .populate('provider', 'firstName lastName phone providerInfo.rating')
      .populate('service', 'title description duration pricing')
      .sort({ scheduledDate: -1, scheduledTime: -1 })
      .limit(limit)
      .skip(startIndex)
    
    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
    
    res.status(200).json({
      success: true,
      data: bookings,
      pagination,
      count: bookings.length
    })
  } catch (error) {
    console.error('Get customer bookings error:', error)
    sendErrorResponse(res, 'Failed to fetch bookings', 500)
  }
}

// @desc    Get provider bookings
// @route   GET /api/bookings/provider
// @access  Private (Provider)
exports.getProviderBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 10
    const startIndex = (page - 1) * limit
    
    let query = { provider: req.user.id }
    
    // Filter by status
    if (req.query.status) {
      query.status = req.query.status
    }
    
    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
      query.scheduledDate = {
        $gte: req.query.startDate,
        $lte: req.query.endDate
      }
    }
    
    const total = await Booking.countDocuments(query)
    const bookings = await Booking.find(query)
      .populate('customer', 'firstName lastName phone email')
      .populate('service', 'title description duration pricing')
      .sort({ scheduledDate: 1, scheduledTime: 1 })
      .limit(limit)
      .skip(startIndex)
    
    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
    
    res.status(200).json({
      success: true,
      data: bookings,
      pagination,
      count: bookings.length
    })
  } catch (error) {
    console.error('Get provider bookings error:', error)
    sendErrorResponse(res, 'Failed to fetch bookings', 500)
  }
}

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private (Booking participant only)
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'firstName lastName email phone')
      .populate('provider', 'firstName lastName email phone providerInfo')
      .populate('service', 'title description duration pricing location')
    
    if (!booking) {
      return sendErrorResponse(res, 'Booking not found', 404)
    }
    
    // Check if user is participant in booking
    if (booking.customer._id.toString() !== req.user.id && 
        booking.provider._id.toString() !== req.user.id &&
        req.user.role !== 'admin') {
      return sendErrorResponse(res, 'Not authorized to access this booking', 403)
    }
    
    sendSuccessResponse(res, booking, 'Booking retrieved successfully')
  } catch (error) {
    console.error('Get booking error:', error)
    
    if (error.name === 'CastError') {
      return sendErrorResponse(res, 'Booking not found', 404)
    }
    
    sendErrorResponse(res, 'Failed to get booking', 500)
  }
}

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private (Provider only for confirm/start/complete, Customer for cancel)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body
    const booking = await Booking.findById(req.params.id)
    
    if (!booking) {
      return sendErrorResponse(res, 'Booking not found', 404)
    }
    
    const validStatuses = ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show']
    if (!validStatuses.includes(status)) {
      return sendErrorResponse(res, 'Invalid status', 400)
    }
    
    // Authorization based on status and user role
    if (status === 'cancelled') {
      // Both customer and provider can cancel
      if (booking.customer.toString() !== req.user.id && 
          booking.provider.toString() !== req.user.id &&
          req.user.role !== 'admin') {
        return sendErrorResponse(res, 'Not authorized to cancel this booking', 403)
      }
    } else {
      // Only provider can change other statuses
      if (booking.provider.toString() !== req.user.id && req.user.role !== 'admin') {
        return sendErrorResponse(res, 'Only provider can update booking status', 403)
      }
    }
    
    // Status transition validation
    const validTransitions = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['in-progress', 'cancelled', 'no-show'],
      'in-progress': ['completed', 'cancelled'],
      'completed': [],
      'cancelled': [],
      'no-show': []
    }
    
    if (!validTransitions[booking.status].includes(status)) {
      return sendErrorResponse(res, `Cannot change status from ${booking.status} to ${status}`, 400)
    }
    
    // Update timeline
    const timelineUpdate = {}
    switch (status) {
      case 'confirmed':
        timelineUpdate['timeline.confirmed'] = new Date()
        break
      case 'in-progress':
        timelineUpdate['timeline.started'] = new Date()
        break
      case 'completed':
        timelineUpdate['timeline.completed'] = new Date()
        break
      case 'cancelled':
        timelineUpdate['timeline.cancelled'] = new Date()
        timelineUpdate.cancelledBy = req.user.id
        break
    }
    
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status, ...timelineUpdate },
      { new: true, runValidators: true }
    ).populate([
      { path: 'customer', select: 'firstName lastName email phone' },
      { path: 'provider', select: 'firstName lastName email phone' },
      { path: 'service', select: 'title description duration' }
    ])
    
    sendSuccessResponse(res, updatedBooking, `Booking ${status} successfully`)
  } catch (error) {
    console.error('Update booking status error:', error)
    
    if (error.name === 'CastError') {
      return sendErrorResponse(res, 'Booking not found', 404)
    }
    
    sendErrorResponse(res, 'Failed to update booking status', 500)
  }
}

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private (Booking participant only)
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
    
    if (!booking) {
      return sendErrorResponse(res, 'Booking not found', 404)
    }
    
    // Check authorization
    if (booking.customer.toString() !== req.user.id && 
        booking.provider.toString() !== req.user.id &&
        req.user.role !== 'admin') {
      return sendErrorResponse(res, 'Not authorized to cancel this booking', 403)
    }
    
    // Check if booking can be cancelled
    if (!['pending', 'confirmed'].includes(booking.status)) {
      return sendErrorResponse(res, 'Booking cannot be cancelled in current status', 400)
    }
    
    // Calculate cancellation fee if applicable
    const bookingDate = new Date(`${booking.scheduledDate}T${booking.scheduledTime}`)
    const hoursUntilBooking = (bookingDate - new Date()) / (1000 * 60 * 60)
    
    let cancellationFee = 0
    if (hoursUntilBooking < 24) {
      cancellationFee = booking.pricing.totalAmount * 0.5 // 50% fee for last-minute cancellation
    }
    
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        status: 'cancelled',
        'timeline.cancelled': new Date(),
        cancelledBy: req.user.id,
        'pricing.cancellationFee': cancellationFee,
        cancellationReason: req.body.reason
      },
      { new: true, runValidators: true }
    ).populate([
      { path: 'customer', select: 'firstName lastName email phone' },
      { path: 'provider', select: 'firstName lastName email phone' },
      { path: 'service', select: 'title description' }
    ])
    
    sendSuccessResponse(res, updatedBooking, 'Booking cancelled successfully')
  } catch (error) {
    console.error('Cancel booking error:', error)
    
    if (error.name === 'CastError') {
      return sendErrorResponse(res, 'Booking not found', 404)
    }
    
    sendErrorResponse(res, 'Failed to cancel booking', 500)
  }
}

// @desc    Get booking statistics for dashboard
// @route   GET /api/bookings/stats
// @access  Private (Provider/Admin)
exports.getBookingStats = async (req, res) => {
  try {
    const userId = req.user.id
    const userRole = req.user.role
    
    let matchQuery = {}
    
    if (userRole === 'provider') {
      matchQuery.provider = userId
    } else if (userRole === 'user') {
      matchQuery.customer = userId
    }
    // Admin can see all stats (no filter)
    
    const stats = await Booking.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$pricing.totalAmount' }
        }
      }
    ])
    
    // Get monthly stats
    const monthlyStats = await Booking.aggregate([
      { $match: { ...matchQuery, scheduledDate: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } } },
      {
        $group: {
          _id: {
            year: { $year: { $dateFromString: { dateString: '$scheduledDate' } } },
            month: { $month: { $dateFromString: { dateString: '$scheduledDate' } } }
          },
          bookings: { $sum: 1 },
          revenue: { $sum: '$pricing.totalAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ])
    
    res.status(200).json({
      success: true,
      data: {
        statusStats: stats,
        monthlyStats
      }
    })
  } catch (error) {
    console.error('Get booking stats error:', error)
    sendErrorResponse(res, 'Failed to get booking statistics', 500)
  }
}