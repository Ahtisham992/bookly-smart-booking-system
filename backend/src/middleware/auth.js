const jwt = require('jsonwebtoken')
const User = require('../models/User')

// Helper function to send error response
const sendErrorResponse = (res, message = 'Something went wrong', statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  })
}

// Protect routes
exports.protect = async (req, res, next) => {
  let token

  // Check header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1]
  }
  // Check cookie
  else if (req.cookies.token) {
    token = req.cookies.token
  }

  // Make sure token exists
  if (!token) {
    return sendErrorResponse(res, 'Not authorized to access this route', 401)
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Check if user still exists
    const user = await User.findById(decoded.id)
    if (!user) {
      return sendErrorResponse(res, 'No user found with this token', 401)
    }

    // Check if user account is active
    if (!user.isActive) {
      return sendErrorResponse(res, 'User account has been deactivated', 401)
    }

    console.log('Auth middleware - User authenticated:', {
      id: user._id,
      email: user.email,
      role: user.role
    })

    req.user = user
    next()
  } catch (error) {
    console.error('Auth middleware error:', error.message)
    return sendErrorResponse(res, 'Not authorized to access this route', 401)
  }
}

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return sendErrorResponse(
        res, 
        `User role ${req.user.role} is not authorized to access this route`, 
        403
      )
    }
    next()
  }
}

// Check if user is verified
exports.requireVerification = async (req, res, next) => {
  if (!req.user.isVerified) {
    return sendErrorResponse(res, 'Please verify your email address first', 403)
  }
  next()
}

// Optional auth - doesn't fail if no token
exports.optionalAuth = async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  } else if (req.cookies.token) {
    token = req.cookies.token
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findById(decoded.id)
      if (user && user.isActive) {
        req.user = user
      }
    } catch (error) {
      // Token invalid, continue without user
    }
  }

  next()
}