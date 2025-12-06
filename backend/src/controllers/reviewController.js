// controllers/reviewController.js
const Review = require('../models/Review')
const Booking = require('../models/Booking')
const Service = require('../models/Service')
const User = require('../models/User')
const { sendSuccessResponse, sendErrorResponse } = require('../utils/helpers/responseHelpers')

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private (Customer only, after completed booking)
exports.createReview = async (req, res) => {
  try {
    const { bookingId, serviceId, providerId, rating, review, isRecommended } = req.body
    
    // Verify booking exists and belongs to user
    const booking = await Booking.findById(bookingId)
    if (!booking) {
      return sendErrorResponse(res, 'Booking not found', 404)
    }
    
    // Check if user is the customer
    if (booking.customer.toString() !== req.user.id) {
      return sendErrorResponse(res, 'You can only review your own bookings', 403)
    }
    
    // Check if booking is completed
    if (booking.status !== 'completed') {
      return sendErrorResponse(res, 'You can only review completed bookings', 400)
    }
    
    // Check if review already exists
    const existingReview = await Review.findOne({ booking: bookingId })
    if (existingReview) {
      return sendErrorResponse(res, 'Review already exists for this booking', 409)
    }
    
    // Verify service and provider match booking
    if (booking.service.toString() !== serviceId || booking.provider.toString() !== providerId) {
      return sendErrorResponse(res, 'Service or provider does not match booking', 400)
    }
    
    // Create review
    const newReview = await Review.create({
      booking: bookingId,
      service: serviceId,
      provider: providerId,
      customer: req.user.id,
      rating,
      review,
      isRecommended: isRecommended || false
    })
    
    // Update service rating
    await updateServiceRating(serviceId)
    
    // Update provider rating
    await updateProviderRating(providerId)
    
    // Populate the response
    await newReview.populate([
      { path: 'customer', select: 'firstName lastName' },
      { path: 'service', select: 'title' },
      { path: 'provider', select: 'firstName lastName' }
    ])
    
    sendSuccessResponse(res, newReview, 'Review created successfully', 201)
  } catch (error) {
    console.error('Create review error:', error)
    
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(val => val.message).join(', ')
      return sendErrorResponse(res, message, 400)
    }
    
    sendErrorResponse(res, 'Failed to create review', 500)
  }
}

// @desc    Get reviews for a service
// @route   GET /api/reviews/service/:serviceId
// @access  Public
exports.getServiceReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 10
    const startIndex = (page - 1) * limit
    
    const query = { service: req.params.serviceId }
    
    // Filter by rating
    if (req.query.rating) {
      query.rating = parseInt(req.query.rating)
    }
    
    const total = await Review.countDocuments(query)
    const reviews = await Review.find(query)
      .populate('customer', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex)
    
    // Get rating distribution
    const ratingStats = await Review.aggregate([
      { $match: { service: req.params.serviceId } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': -1 } }
    ])
    
    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
    
    res.status(200).json({
      success: true,
      data: reviews,
      ratingStats,
      pagination,
      count: reviews.length
    })
  } catch (error) {
    console.error('Get service reviews error:', error)
    sendErrorResponse(res, 'Failed to fetch service reviews', 500)
  }
}

// @desc    Get reviews for a provider
// @route   GET /api/reviews/provider/:providerId
// @access  Public
exports.getProviderReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 10
    const startIndex = (page - 1) * limit
    
    const query = { provider: req.params.providerId }
    
    const total = await Review.countDocuments(query)
    const reviews = await Review.find(query)
      .populate('customer', 'firstName lastName')
      .populate('service', 'title')
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
      data: reviews,
      pagination,
      count: reviews.length
    })
  } catch (error) {
    console.error('Get provider reviews error:', error)
    sendErrorResponse(res, 'Failed to fetch provider reviews', 500)
  }
}

// @desc    Update helpful votes for review
// @route   PUT /api/reviews/:id/helpful
// @access  Private
exports.updateHelpfulVotes = async (req, res) => {
  try {
    const { isHelpful } = req.body
    const reviewId = req.params.id
    
    const review = await Review.findById(reviewId)
    if (!review) {
      return sendErrorResponse(res, 'Review not found', 404)
    }
    
    // Check if user already voted
    const existingVote = review.helpfulVotes.find(vote => vote.user.toString() === req.user.id)
    
    if (existingVote) {
      // Update existing vote
      existingVote.isHelpful = isHelpful
    } else {
      // Add new vote
      review.helpfulVotes.push({
        user: req.user.id,
        isHelpful
      })
    }
    
    await review.save()
    
    sendSuccessResponse(res, review, 'Vote updated successfully')
  } catch (error) {
    console.error('Update helpful votes error:', error)
    sendErrorResponse(res, 'Failed to update vote', 500)
  }
}

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private (Review owner or admin)
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
    
    if (!review) {
      return sendErrorResponse(res, 'Review not found', 404)
    }
    
    // Check authorization
    if (review.customer.toString() !== req.user.id && req.user.role !== 'admin') {
      return sendErrorResponse(res, 'Not authorized to delete this review', 403)
    }
    
    await Review.findByIdAndDelete(req.params.id)
    
    // Update ratings after deletion
    await updateServiceRating(review.service)
    await updateProviderRating(review.provider)
    
    sendSuccessResponse(res, null, 'Review deleted successfully')
  } catch (error) {
    console.error('Delete review error:', error)
    sendErrorResponse(res, 'Failed to delete review', 500)
  }
}

// Helper function to update service rating
const updateServiceRating = async (serviceId) => {
  try {
    const stats = await Review.aggregate([
      { $match: { service: serviceId } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 }
        }
      }
    ])
    
    if (stats.length > 0) {
      await Service.findByIdAndUpdate(serviceId, {
        rating: Math.round(stats[0].averageRating * 10) / 10,
        reviewCount: stats[0].reviewCount
      })
    } else {
      await Service.findByIdAndUpdate(serviceId, {
        rating: 0,
        reviewCount: 0
      })
    }
  } catch (error) {
    console.error('Update service rating error:', error)
  }
}

// Helper function to update provider rating
const updateProviderRating = async (providerId) => {
  try {
    const stats = await Review.aggregate([
      { $match: { provider: providerId } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 }
        }
      }
    ])
    
    if (stats.length > 0) {
      await User.findByIdAndUpdate(providerId, {
        'providerInfo.rating': Math.round(stats[0].averageRating * 10) / 10,
        'providerInfo.reviewCount': stats[0].reviewCount
      })
    } else {
      await User.findByIdAndUpdate(providerId, {
        'providerInfo.rating': 0,
        'providerInfo.reviewCount': 0
      })
    }
  } catch (error) {
    console.error('Update provider rating error:', error)
  }
}