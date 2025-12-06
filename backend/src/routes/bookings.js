// routes/bookings.js
const express = require('express')
const router = express.Router()

const {
  createBooking,
  getCustomerBookings,
  getProviderBookings,
  getBooking,
  updateBookingStatus,
  cancelBooking,
  getBookingStats
} = require('../controllers/bookingController')

const { protect } = require('../middleware/auth')
const { requireCustomer, requireProvider } = require('../middleware/roleAuth')
const { verifyBookingAccess, verifyProviderBooking } = require('../middleware/bookingAuth')
const { 
  validateCreateBooking, 
  validateUpdateStatus, 
  validateCancelBooking 
} = require('../middleware/bookingValidation')
const { bookingLimiter, generalLimiter } = require('../middleware/rateLimiting')

// ==================
// Customer Routes
// ==================

// Create a new booking
router.post(
  '/', 
  protect, 
  requireCustomer, 
  validateCreateBooking, 
  bookingLimiter, 
  createBooking
)

// Get all bookings for logged-in customer
router.get('/my-bookings', protect, requireCustomer, getCustomerBookings)

// Get a specific booking (customer access)
router.get('/:id', protect, requireCustomer, verifyBookingAccess, getBooking)

// Cancel a booking
router.patch('/:id/cancel', protect, requireCustomer, verifyBookingAccess, validateCancelBooking, cancelBooking)

// ==================
// Provider Routes
// ==================

// Get all bookings for provider's services
router.get('/provider', protect, requireProvider, getProviderBookings)

// Update booking status (provider)
router.patch('/provider/:id/status', protect, requireProvider, verifyProviderBooking, validateUpdateStatus, updateBookingStatus)

// Get booking statistics (provider)
router.get('/stats', protect, requireProvider, getBookingStats)

module.exports = router
