// routes/dashboard.js
const express = require('express')
const {
  getProviderDashboard,
  getUserDashboard,
  getAdminDashboard
} = require('../controllers/dashboardController')

const { protect } = require('../middleware/auth')
const { requireProvider, requireCustomer, requireAdmin } = require('../middleware/roleAuth')
const { generalLimiter } = require('../middleware/rateLimiting')

const router = express.Router()

// Apply rate limiting and authentication to all routes
router.use(generalLimiter)
router.use(protect)

// Role-specific dashboard routes
router.get('/provider', requireProvider, getProviderDashboard)
router.get('/user', requireCustomer, getUserDashboard)
router.get('/admin', requireAdmin, getAdminDashboard)

module.exports = router
