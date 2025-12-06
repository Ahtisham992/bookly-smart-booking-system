// authController.js - Fixed response structure
const crypto = require('crypto')
const User = require('../models/User')

// Helper function to send success response
const sendSuccessResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  })
}

// Helper function to send error response
const sendErrorResponse = (res, message = 'Something went wrong', statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  })
}

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, role } = req.body

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return sendErrorResponse(res, 'User with this email already exists', 400)
    }

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      phone,
      role: role || 'user'
    })

    // Generate email verification token
    const verificationToken = user.getEmailVerificationToken()
    await user.save()

    // Send verification email (placeholder for now)
    console.log(`Verification URL: ${process.env.CLIENT_URL}/verify-email/${verificationToken}`)

    sendTokenResponse(user, 201, res, 'Registration successful! Please check your email to verify your account.')
  } catch (error) {
    console.error('Registration error:', error)
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(val => val.message).join(', ')
      return sendErrorResponse(res, message, 400)
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return sendErrorResponse(res, 'Email already exists', 400)
    }

    sendErrorResponse(res, 'Registration failed', 500)
  }
}

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Validate email & password
    if (!email || !password) {
      return sendErrorResponse(res, 'Please provide an email and password', 400)
    }

    // Check for user (include password since it's select: false)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password')

    if (!user) {
      return sendErrorResponse(res, 'Invalid credentials', 401)
    }

    // Check if account is locked
    if (user.isLocked) {
      return sendErrorResponse(res, 'Account temporarily locked due to too many failed login attempts', 423)
    }

    // Check if account is active
    if (!user.isActive) {
      return sendErrorResponse(res, 'Account has been deactivated', 403)
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password)

    if (!isMatch) {
      // Increment login attempts
      await user.incLoginAttempts()
      return sendErrorResponse(res, 'Invalid credentials', 401)
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts()
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    sendTokenResponse(user, 200, res, 'Login successful')
  } catch (error) {
    console.error('Login error:', error)
    sendErrorResponse(res, 'Login failed', 500)
  }
}

// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  })

  sendSuccessResponse(res, null, 'User logged out successfully')
}

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    
    // 🔧 FIXED: Return consistent structure with user property
    res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully',
      user: user, // Frontend expects 'user' property
      data: user, // Keep 'data' for backward compatibility
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Get profile error:', error)
    sendErrorResponse(res, 'Failed to get user profile', 500)
  }
}

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res) => {
  try {
    const fieldsToUpdate = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      preferences: req.body.preferences
    }

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => {
      if (fieldsToUpdate[key] === undefined) {
        delete fieldsToUpdate[key]
      }
    })

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    })

    sendSuccessResponse(res, user, 'Profile updated successfully')
  } catch (error) {
    console.error('Update profile error:', error)
    
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(val => val.message).join(', ')
      return sendErrorResponse(res, message, 400)
    }

    sendErrorResponse(res, 'Failed to update profile', 500)
  }
}

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return sendErrorResponse(res, 'Please provide current and new password', 400)
    }

    const user = await User.findById(req.user.id).select('+password')

    // Check current password
    if (!(await user.comparePassword(currentPassword))) {
      return sendErrorResponse(res, 'Current password is incorrect', 401)
    }

    user.password = newPassword
    await user.save()

    sendTokenResponse(user, 200, res, 'Password updated successfully')
  } catch (error) {
    console.error('Update password error:', error)
    sendErrorResponse(res, 'Failed to update password', 500)
  }
}

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email.toLowerCase() })

    if (!user) {
      return sendErrorResponse(res, 'There is no user with that email', 404)
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken()
    await user.save({ validateBeforeSave: false })

    // Create reset url
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`

    // For now, just log the reset URL (implement email service later)
    console.log(`Password reset URL: ${resetUrl}`)

    sendSuccessResponse(res, null, 'Email sent successfully')
  } catch (error) {
    console.error('Forgot password error:', error)
    sendErrorResponse(res, 'Failed to process forgot password request', 500)
  }
}

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex')

    const user = await User.findOne({
      passwordResetToken: resetPasswordToken,
      passwordResetExpires: { $gt: Date.now() }
    })

    if (!user) {
      return sendErrorResponse(res, 'Invalid or expired reset token', 400)
    }

    // Set new password
    user.password = req.body.password
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save()

    sendTokenResponse(user, 200, res, 'Password reset successful')
  } catch (error) {
    console.error('Reset password error:', error)
    sendErrorResponse(res, 'Failed to reset password', 500)
  }
}

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex')

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    })

    if (!user) {
      return sendErrorResponse(res, 'Invalid or expired verification token', 400)
    }

    // Mark user as verified
    user.isVerified = true
    user.emailVerificationToken = undefined
    user.emailVerificationExpires = undefined
    await user.save()

    sendSuccessResponse(res, null, 'Email verified successfully')
  } catch (error) {
    console.error('Email verification error:', error)
    sendErrorResponse(res, 'Failed to verify email', 500)
  }
}

// Helper function to send token response
const sendTokenResponse = (user, statusCode, res, message) => {
  const token = user.getSignedJwtToken()

  const options = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  }

  if (process.env.NODE_ENV === 'production') {
    options.secure = true
  }

  // Remove password from output
  const userResponse = { ...user.toObject() }
  delete userResponse.password

  // 🔧 FIXED: Return consistent structure that frontend expects
  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      message,
      token,
      user: userResponse, // Frontend expects 'user' property
      data: userResponse  // Keep 'data' for backward compatibility
    })
}