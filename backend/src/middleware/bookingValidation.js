// middleware/bookingValidation.js
const { body, validationResult } = require('express-validator')
const { sendErrorResponse } = require('../utils/helpers/responseHelpers')

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg)
    return sendErrorResponse(res, errorMessages.join(', '), 400)
  }
  next()
}

// Create booking validation
exports.validateCreateBooking = [
  body('serviceId')
    .isMongoId()
    .withMessage('Valid service ID is required'),
  body('providerId')
    .isMongoId()
    .withMessage('Valid provider ID is required'),
  body('scheduledDate')
    .isISO8601()
    .toDate()
    .withMessage('Valid date is required (YYYY-MM-DD format)')
    .custom((value) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (value < today) {
        throw new Error('Booking date must be in the future')
      }
      return true
    }),
  body('scheduledTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Valid time is required (HH:MM format)'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  handleValidationErrors
]

// Update booking status validation
exports.validateUpdateStatus = [
  body('status')
    .isIn(['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'])
    .withMessage('Invalid booking status'),
  handleValidationErrors
]

// Cancel booking validation
exports.validateCancelBooking = [
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Cancellation reason cannot exceed 200 characters'),
  handleValidationErrors
]

// Service validation
exports.validateCreateService = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Service title is required and must be less than 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('category')
    .isMongoId()
    .withMessage('Valid category ID is required'),
  body('pricing.amount')
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number'),
  body('duration')
    .isInt({ min: 1 })
    .withMessage('Duration must be at least 1 minute'),
  body('location.address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address cannot exceed 200 characters'),
  handleValidationErrors
]

// Review validation
exports.validateCreateReview = [
  body('bookingId')
    .isMongoId()
    .withMessage('Valid booking ID is required'),
  body('serviceId')
    .isMongoId()
    .withMessage('Valid service ID is required'),
  body('providerId')
    .isMongoId()
    .withMessage('Valid provider ID is required'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('review')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Review must be between 10 and 500 characters'),
  body('isRecommended')
    .optional()
    .isBoolean()
    .withMessage('Recommendation must be true or false'),
  handleValidationErrors
]