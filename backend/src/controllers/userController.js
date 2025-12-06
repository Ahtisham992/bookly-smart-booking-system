const User = require('../models/User')
const { sendSuccessResponse, sendErrorResponse } = require('../utils/helpers/responseHelpers')
const logger = require('../utils/logger/logger')

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 10
    const startIndex = (page - 1) * limit

    const total = await User.countDocuments({ isActive: true })
    const users = await User.find({ isActive: true })
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex)

    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }

    res.status(200).json({
      success: true,
      data: users,
      pagination,
      count: users.length
    })
  } catch (error) {
    logger.error('Get users error:', error)
    sendErrorResponse(res, 'Failed to fetch users', 500)
  }
}

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password')

    if (!user) {
      return sendErrorResponse(res, 'User not found', 404)
    }

    // Users can only get their own data unless they're admin
    if (user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return sendErrorResponse(res, 'Not authorized to access this user', 403)
    }

    sendSuccessResponse(res, user, 'User retrieved successfully')
  } catch (error) {
    logger.error('Get user error:', error)
    sendErrorResponse(res, 'Failed to get user', 500)
  }
}

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
exports.updateUser = async (req, res) => {
  try {
    let user = await User.findById(req.params.id)

    if (!user) {
      return sendErrorResponse(res, 'User not found', 404)
    }

    // Users can only update their own data unless they're admin
    if (user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return sendErrorResponse(res, 'Not authorized to update this user', 403)
    }

    // Fields that can be updated
    const allowedFields = ['firstName', 'lastName', 'phone', 'preferences', 'profileImage']
    
    // Only admin can update role and verification status
    if (req.user.role === 'admin') {
      allowedFields.push('role', 'isVerified', 'isActive')
    }

    const fieldsToUpdate = {}
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        fieldsToUpdate[key] = req.body[key]
      }
    })

    user = await User.findByIdAndUpdate(
      req.params.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    ).select('-password')

    sendSuccessResponse(res, user, 'User updated successfully')
  } catch (error) {
    logger.error('Update user error:', error)
    
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(val => val.message).join(', ')
      return sendErrorResponse(res, message, 400)
    }

    sendErrorResponse(res, 'Failed to update user', 500)
  }
}

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return sendErrorResponse(res, 'User not found', 404)
    }

    // Users can only delete their own account unless they're admin
    if (user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return sendErrorResponse(res, 'Not authorized to delete this user', 403)
    }

    // Soft delete - set isActive to false instead of actually deleting
    await User.findByIdAndUpdate(req.params.id, { isActive: false })

    sendSuccessResponse(res, null, 'User account deactivated successfully')
  } catch (error) {
    logger.error('Delete user error:', error)
    sendErrorResponse(res, 'Failed to delete user', 500)
  }
}