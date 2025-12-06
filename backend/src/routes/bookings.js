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
  getBookingStats,
  acceptBooking,
  rejectBooking,
  completeBooking
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

// ==================
// Provider Routes
// ==================

// Get all bookings for provider's services
router.get('/provider', protect, requireProvider, getProviderBookings)

// ==================
// Customer Routes (continued)
// ==================

// Get a specific booking (customer access)
router.get('/:id', protect, requireCustomer, verifyBookingAccess, getBooking)

// Cancel a booking
router.patch('/:id/cancel', protect, requireCustomer, verifyBookingAccess, validateCancelBooking, cancelBooking)

// Update booking status (provider)
router.patch('/provider/:id/status', protect, requireProvider, verifyProviderBooking, validateUpdateStatus, updateBookingStatus)

// Get booking statistics (provider)
router.get('/stats', protect, requireProvider, getBookingStats)

// Accept booking (provider)
router.patch('/:id/accept', protect, requireProvider, acceptBooking)

// Reject booking (provider)
router.patch('/:id/reject', protect, requireProvider, rejectBooking)

// Complete booking (provider)
router.patch('/:id/complete', protect, requireProvider, completeBooking)

module.exports = router
