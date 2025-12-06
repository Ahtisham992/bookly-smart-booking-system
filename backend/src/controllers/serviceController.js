// controllers/serviceController.js
const Service = require('../models/Service')
const User = require('../models/User')
const Category = require('../models/Category')
const { sendSuccessResponse, sendErrorResponse } = require('../utils/helpers/responseHelpers')

// @desc    Get all services with filtering, searching, and pagination
// @route   GET /api/services
// @access  Public
exports.getServices = async (req, res) => {
  try {
    // Build query object
    let query = { isActive: true }
    
    // Only show approved services for public, but show all for logged-in providers viewing their own
    if (!req.user || req.user.role !== 'provider') {
      query.isApproved = true
    }
    
    // Filter by category
    if (req.query.category) {
      query.category = req.query.category
    }
    
    // Filter by provider
    if (req.query.provider) {
      query.provider = req.query.provider
    }
    
    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      query['pricing.basePrice'] = {}
      if (req.query.minPrice) {
        query['pricing.basePrice'].$gte = parseFloat(req.query.minPrice)
      }
      if (req.query.maxPrice) {
        query['pricing.basePrice'].$lte = parseFloat(req.query.maxPrice)
      }
    }
    
    // Location filter (within radius)
    if (req.query.lat && req.query.lng && req.query.radius) {
      const radius = parseFloat(req.query.radius) / 3963.2 // Convert miles to radians
      query.location = {
        $geoWithin: {
          $centerSphere: [[parseFloat(req.query.lng), parseFloat(req.query.lat)], radius]
        }
      }
    }
    
    // Search functionality
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ]
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 10
    const startIndex = (page - 1) * limit
    
    // Sorting
    const sortBy = req.query.sort || 'createdAt'
    const sortOrder = req.query.order === 'asc' ? 1 : -1
    const sort = { [sortBy]: sortOrder }
    
    // Execute query
    const total = await Service.countDocuments(query)
    const services = await Service.find(query)
      .populate('provider', 'firstName lastName providerInfo.rating providerInfo.reviewCount')
      .populate('category', 'name slug')
      .sort(sort)
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
      data: services,
      pagination,
      count: services.length
    })
  } catch (error) {
    console.error('Get services error:', error)
    sendErrorResponse(res, 'Failed to fetch services', 500)
  }
}

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
exports.getService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('provider', 'firstName lastName email phone providerInfo')
      .populate('category', 'name slug description')
    
    if (!service || !service.isActive) {
      return sendErrorResponse(res, 'Service not found', 404)
    }
    
    sendSuccessResponse(res, service, 'Service retrieved successfully')
  } catch (error) {
    console.error('Get service error:', error)
    if (error.name === 'CastError') {
      return sendErrorResponse(res, 'Service not found', 404)
    }
    sendErrorResponse(res, 'Failed to get service', 500)
  }
}

// @desc    Create new service
// @route   POST /api/services
// @access  Private (Provider only)
exports.createService = async (req, res) => {
  try {
    // Add provider to req.body
    req.body.provider = req.user.id
    
    // Verify user is a provider
    if (req.user.role !== 'provider') {
      return sendErrorResponse(res, 'Only providers can create services', 403)
    }
    
    const service = await Service.create(req.body)
    
    // Populate the response
    await service.populate('provider', 'firstName lastName')
    await service.populate('category', 'name slug')
    
    sendSuccessResponse(res, service, 'Service created successfully', 201)
  } catch (error) {
    console.error('Create service error:', error)
    
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(val => val.message).join(', ')
      return sendErrorResponse(res, message, 400)
    }
    
    sendErrorResponse(res, 'Failed to create service', 500)
  }
}

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private (Service owner only)
exports.updateService = async (req, res) => {
  try {
    let service = await Service.findById(req.params.id)
    
    if (!service) {
      return sendErrorResponse(res, 'Service not found', 404)
    }
    
    // Make sure user is service owner
    if (service.provider.toString() !== req.user.id && req.user.role !== 'admin') {
      return sendErrorResponse(res, 'Not authorized to update this service', 403)
    }
    
    // Fields that cannot be updated by provider
    const restrictedFields = ['provider', 'isApproved']
    if (req.user.role !== 'admin') {
      restrictedFields.forEach(field => delete req.body[field])
    }
    
    service = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('provider', 'firstName lastName')
     .populate('category', 'name slug')
    
    sendSuccessResponse(res, service, 'Service updated successfully')
  } catch (error) {
    console.error('Update service error:', error)
    
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(val => val.message).join(', ')
      return sendErrorResponse(res, message, 400)
    }
    
    if (error.name === 'CastError') {
      return sendErrorResponse(res, 'Service not found', 404)
    }
    
    sendErrorResponse(res, 'Failed to update service', 500)
  }
}

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private (Service owner only)
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
    
    if (!service) {
      return sendErrorResponse(res, 'Service not found', 404)
    }
    
    // Make sure user is service owner
    if (service.provider.toString() !== req.user.id && req.user.role !== 'admin') {
      return sendErrorResponse(res, 'Not authorized to delete this service', 403)
    }
    
    // Soft delete - set isActive to false
    await Service.findByIdAndUpdate(req.params.id, { isActive: false })
    
    sendSuccessResponse(res, null, 'Service deleted successfully')
  } catch (error) {
    console.error('Delete service error:', error)
    
    if (error.name === 'CastError') {
      return sendErrorResponse(res, 'Service not found', 404)
    }
    
    sendErrorResponse(res, 'Failed to delete service', 500)
  }
}

// @desc    Get services by provider
// @route   GET /api/services/provider/:providerId
// @access  Public
exports.getServicesByProvider = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 10
    const startIndex = (page - 1) * limit
    
    const query = {
      provider: req.params.providerId,
      isActive: true
    }
    
    // If not the provider themselves or admin, only show approved services
    if (req.user?.id !== req.params.providerId && req.user?.role !== 'admin') {
      query.isApproved = true
    }
    
    const total = await Service.countDocuments(query)
    const services = await Service.find(query)
      .populate('category', 'name slug')
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
      data: services,
      pagination,
      count: services.length
    })
  } catch (error) {
    console.error('Get provider services error:', error)
    sendErrorResponse(res, 'Failed to fetch provider services', 500)
  }
}

// @desc    Get services by category
// @route   GET /api/services/category/:categoryId
// @access  Public
exports.getServicesByCategory = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 10
    const startIndex = (page - 1) * limit
    
    const query = {
      category: req.params.categoryId,
      isActive: true,
      isApproved: true
    }
    
    const total = await Service.countDocuments(query)
    const services = await Service.find(query)
      .populate('provider', 'firstName lastName providerInfo.rating providerInfo.reviewCount')
      .populate('category', 'name slug')
      .sort({ rating: -1, createdAt: -1 })
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
      data: services,
      pagination,
      count: services.length
    })
  } catch (error) {
    console.error('Get category services error:', error)
    sendErrorResponse(res, 'Failed to fetch category services', 500)
  }
}

// @desc    Upload service images
// @route   PUT /api/services/:id/photo
// @access  Private (Service owner only)
exports.servicePhotoUpload = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
    
    if (!service) {
      return sendErrorResponse(res, 'Service not found', 404)
    }
    
    // Make sure user is service owner
    if (service.provider.toString() !== req.user.id && req.user.role !== 'admin') {
      return sendErrorResponse(res, 'Not authorized to update this service', 403)
    }
    
    if (!req.file) {
      return sendErrorResponse(res, 'Please upload a file', 400)
    }
    
    // Update service with new image URL
    await Service.findByIdAndUpdate(req.params.id, {
      $push: { 'media.images': req.file.location || req.file.path }
    })
    
    sendSuccessResponse(res, { imageUrl: req.file.location || req.file.path }, 'Photo uploaded successfully')
  } catch (error) {
    console.error('Service photo upload error:', error)
    sendErrorResponse(res, 'Failed to upload photo', 500)
  }
}