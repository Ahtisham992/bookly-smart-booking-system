// middleware/serviceAuth.js
const Service = require('../models/Service')
const { sendErrorResponse } = require('../utils/helpers/responseHelpers')

// Verify service ownership
exports.verifyServiceOwnership = async (req, res, next) => {
  try {
    const serviceId = req.params.id || req.params.serviceId
    
    if (!serviceId) {
      return sendErrorResponse(res, 'Service ID is required', 400)
    }

    const service = await Service.findById(serviceId)
    
    if (!service) {
      return sendErrorResponse(res, 'Service not found', 404)
    }

    // Check if user is service owner or admin
    if (service.provider.toString() !== req.user.id && req.user.role !== 'admin') {
      return sendErrorResponse(res, 'Not authorized to modify this service', 403)
    }

    req.service = service
    next()
  } catch (error) {
    console.error('Service auth error:', error)
    
    if (error.name === 'CastError') {
      return sendErrorResponse(res, 'Invalid service ID', 400)
    }
    
    sendErrorResponse(res, 'Failed to verify service ownership', 500)
  }
}