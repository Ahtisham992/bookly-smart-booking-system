// routes/reviews.js
const express = require('express')
const {
  createReview,
  getServiceReviews,
  getProviderReviews,
  updateHelpfulVotes,
  deleteReview
} = require('../controllers/reviewController')

const { protect, optionalAuth } = require('../middleware/auth')
const { requireCustomer } = require('../middleware/roleAuth')
const { validateCreateReview } = require('../middleware/bookingValidation')
const { reviewLimiter, generalLimiter } = require('../middleware/rateLimiting')

const router = express.Router()

// Apply rate limiting
router.use(generalLimiter)

// Public routes
router.get('/service/:serviceId', getServiceReviews)
router.get('/provider/:providerId', getProviderReviews)

// Protected routes
router.use(protect)

// Customer only routes
router.post('/', requireCustomer, reviewLimiter, validateCreateReview, createReview)

// Authenticated user routes
router.put('/:id/helpful', updateHelpfulVotes)
router.delete('/:id', deleteReview)

module.exports = router