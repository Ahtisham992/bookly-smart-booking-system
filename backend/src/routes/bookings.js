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
  completeBooking,
  getAllBookings
} = require('../controllers/bookingController')

const { protect } = require('../middleware/auth')
const { requireCustomer, requireProvider, requireAdmin } = require('../middleware/roleAuth')
const { verifyBookingAccess, verifyProviderBooking } = require('../middleware/bookingAuth')
const { 
  validateCreateBooking, 
  validateUpdateStatus, 
  validateCancelBooking 
} = require('../middleware/bookingValidation')
const { bookingLimiter, generalLimiter } = require('../middleware/rateLimiting')

// ==================
// Admin Routes
// ==================

// Get all bookings (Admin only)
router.get('/', protect, requireAdmin, getAllBookings)

// ==================
// Customer Routes
// ==================

// Get all bookings for logged-in customer (must be before /:id)
router.get('/my-bookings', protect, requireCustomer, getCustomerBookings)

// Get booking statistics (provider) - must be before /:id
router.get('/stats', protect, requireProvider, getBookingStats)

// Create a new booking
router.post(
  '/', 
  protect, 
  requireCustomer, 
  validateCreateBooking, 
  bookingLimiter, 
  createBooking
)

// ==================
// Provider Routes
// ==================

// Get all bookings for provider's services
router.get('/provider', protect, requireProvider, getProviderBookings)

// Update booking status (provider)
router.patch('/provider/:id/status', protect, requireProvider, verifyProviderBooking, validateUpdateStatus, updateBookingStatus)

// ==================
// Customer Routes (continued)
// ==================

// Get a specific booking (customer access)
router.get('/:id', protect, requireCustomer, verifyBookingAccess, getBooking)

// Cancel a booking
router.patch('/:id/cancel', protect, requireCustomer, verifyBookingAccess, validateCancelBooking, cancelBooking)

// Accept booking (provider)
router.patch('/:id/accept', protect, requireProvider, acceptBooking)

// Reject booking (provider)
router.patch('/:id/reject', protect, requireProvider, rejectBooking)

// Complete booking (provider)
router.patch('/:id/complete', protect, requireProvider, completeBooking)

// Delete booking (admin only)
router.delete('/:id', protect, requireAdmin, async (req, res) => {
  try {
    const Booking = require('../models/Booking')
    const booking = await Booking.findByIdAndDelete(req.params.id)
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      })
    }
    
    res.status(200).json({
      success: true,
      message: 'Booking deleted successfully'
    })
  } catch (error) {
    console.error('Delete booking error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete booking',
      error: error.message
    })
  }
})

module.exports = router
