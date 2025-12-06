// middleware/roleAuth.js
const { sendErrorResponse } = require('../utils/helpers/responseHelpers')

// Role-based access control middleware
exports.requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendErrorResponse(res, 'Authentication required', 401)
    }

    if (!roles.includes(req.user.role)) {
      return sendErrorResponse(
        res,
        `Access denied. Required role: ${roles.join(' or ')}`,
        403
      )
    }

    next()
  }
}

// Provider specific middleware
exports.requireProvider = (req, res, next) => {
  if (!req.user) {
    return sendErrorResponse(res, 'Authentication required', 401)
  }

  console.log('requireProvider check - User role:', req.user.role, 'User ID:', req.user._id || req.user.id)

  if (req.user.role !== 'provider') {
    console.log('Access denied - Expected: provider, Got:', req.user.role)
    return sendErrorResponse(res, 'Provider access required', 403)
  }

  next()
}

// User/Customer specific middleware
exports.requireCustomer = (req, res, next) => {
  if (!req.user) {
    return sendErrorResponse(res, 'Authentication required', 401)
  }

  if (req.user.role !== 'user') {
    return sendErrorResponse(res, 'Customer access required', 403)
  }

  next()
}

// Admin specific middleware
exports.requireAdmin = (req, res, next) => {
  if (!req.user) {
    return sendErrorResponse(res, 'Authentication required', 401)
  }

  if (req.user.role !== 'admin') {
    return sendErrorResponse(res, 'Admin access required', 403)
  }

  next()
}
