// routes/providers.js
const express = require('express')
const User = require('../models/User')
const { sendSuccessResponse, sendErrorResponse } = require('../utils/helpers/responseHelpers')
const { generalLimiter } = require('../middleware/rateLimiting')

const router = express.Router()

// Apply rate limiting
router.use(generalLimiter)

// @desc    Get all providers
// @route   GET /api/providers
// @access  Public
router.get('/', async (req, res) => {
  try {
    const providers = await User.find({ 
      role: 'provider',
      isActive: true 
    })
    .select('-password -resetPasswordToken -resetPasswordExpire')
    .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      data: providers,
      count: providers.length
    })
  } catch (error) {
    console.error('Get providers error:', error)
    sendErrorResponse(res, 'Failed to fetch providers', 500)
  }
})

// @desc    Get single provider
// @route   GET /api/providers/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const provider = await User.findOne({
      _id: req.params.id,
      role: 'provider',
      isActive: true
    })
    .select('-password -resetPasswordToken -resetPasswordExpire')
    .populate('providerInfo.services')

    if (!provider) {
      return sendErrorResponse(res, 'Provider not found', 404)
    }

    res.status(200).json({
      success: true,
      data: provider
    })
  } catch (error) {
    console.error('Get provider error:', error)
    
    if (error.name === 'CastError') {
      return sendErrorResponse(res, 'Provider not found', 404)
    }
    
    sendErrorResponse(res, 'Failed to get provider', 500)
  }
})

module.exports = router
