// middleware/bookingAuth.js
const Booking = require('../models/Booking')
const { sendErrorResponse } = require('../utils/helpers/responseHelpers')

// Verify booking ownership or participation
exports.verifyBookingAccess = async (req, res, next) => {
  try {
    const bookingId = req.params.id || req.params.bookingId
    
    if (!bookingId) {
      return sendErrorResponse(res, 'Booking ID is required', 400)
    }

    const booking = await Booking.findById(bookingId)
    
    if (!booking) {
      return sendErrorResponse(res, 'Booking not found', 404)
    }

    // Check if user is customer, provider, or admin
    const isCustomer = booking.customer.toString() === req.user.id
    const isProvider = booking.provider.toString() === req.user.id
    const isAdmin = req.user.role === 'admin'

    if (!isCustomer && !isProvider && !isAdmin) {
      return sendErrorResponse(res, 'Not authorized to access this booking', 403)
    }

    // Attach booking to request for use in controller
    req.booking = booking
    next()
  } catch (error) {
    console.error('Booking auth error:', error)
    
    if (error.name === 'CastError') {
      return sendErrorResponse(res, 'Invalid booking ID', 400)
    }
    
    sendErrorResponse(res, 'Failed to verify booking access', 500)
  }
}

// Verify customer owns the booking
exports.verifyCustomerBooking = async (req, res, next) => {
  try {
    const bookingId = req.params.id || req.params.bookingId
    
    const booking = await Booking.findById(bookingId)
    
    if (!booking) {
      return sendErrorResponse(res, 'Booking not found', 404)
    }

    if (booking.customer.toString() !== req.user.id) {
      return sendErrorResponse(res, 'Not authorized to access this booking', 403)
    }

    req.booking = booking
    next()
  } catch (error) {
    console.error('Customer booking auth error:', error)
    sendErrorResponse(res, 'Failed to verify booking ownership', 500)
  }
}

// Verify provider owns the booking
exports.verifyProviderBooking = async (req, res, next) => {
  try {
    const bookingId = req.params.id || req.params.bookingId
    
    const booking = await Booking.findById(bookingId)
    
    if (!booking) {
      return sendErrorResponse(res, 'Booking not found', 404)
    }

    if (booking.provider.toString() !== req.user.id && req.user.role !== 'admin') {
      return sendErrorResponse(res, 'Not authorized to access this booking', 403)
    }

    req.booking = booking
    next()
  } catch (error) {
    console.error('Provider booking auth error:', error)
    sendErrorResponse(res, 'Failed to verify booking ownership', 500)
  }
}
