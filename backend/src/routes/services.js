// routes/services.js
const express = require('express')
const {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  getServicesByProvider,
  getServicesByCategory,
  servicePhotoUpload
} = require('../controllers/serviceController')

const { protect } = require('../middleware/auth')
const { requireProvider, requireAdmin } = require('../middleware/roleAuth')
const { verifyServiceOwnership } = require('../middleware/serviceAuth')
const { uploadSingle } = require('../middleware/uploadMiddleware')
const { validateCreateService } = require('../middleware/bookingValidation')
const { generalLimiter } = require('../middleware/rateLimiting')

const router = express.Router()

// Apply rate limiting to all routes
router.use(generalLimiter)

// Public routes
router.get('/', getServices)
router.get('/category/:categoryId', getServicesByCategory)
router.get('/:id', getService)

// Protected routes - Provider only
router.post('/', protect, requireProvider, validateCreateService, createService)
router.put('/:id', protect, requireProvider, verifyServiceOwnership, updateService)
router.get('/provider/:providerId', getServicesByProvider)
router.put('/:id/photo', protect, requireProvider, verifyServiceOwnership, uploadSingle('image'), servicePhotoUpload)

// Delete service - Provider (own service) or Admin (any service)
router.delete('/:id', protect, async (req, res, next) => {
  // Allow admin to delete any service, or provider to delete their own
  if (req.user.role === 'admin') {
    return next()
  }
  // For providers, verify ownership
  return verifyServiceOwnership(req, res, next)
}, deleteService)

module.exports = router
