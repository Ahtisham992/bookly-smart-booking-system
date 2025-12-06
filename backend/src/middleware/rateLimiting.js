// middleware/rateLimiting.js
const rateLimit = require('express-rate-limit')
const { sendErrorResponse } = require('../utils/helpers/responseHelpers')

// General API rate limiting
exports.generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
})

// Auth endpoints rate limiting (stricter)
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
})

// Booking creation rate limiting
exports.bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 booking attempts per hour
  message: {
    success: false,
    message: 'Too many booking attempts, please try again later.',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
})

// Review creation rate limiting
exports.reviewLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 5, // limit each IP to 5 reviews per day
  message: {
    success: false,
    message: 'Too many review submissions, please try again tomorrow.',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
})
