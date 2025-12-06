// routes/notifications.js
const express = require('express')
const {
  createNotification,
  getUserNotifications,
  getNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  getNotificationStats
} = require('../controllers/notificationController')

const { protect } = require('../middleware/auth')
const { requireAdmin } = require('../middleware/roleAuth')
const { generalLimiter } = require('../middleware/rateLimiting')

const router = express.Router()

// Apply rate limiting and authentication to all routes
router.use(generalLimiter)
router.use(protect)

// User notification routes
router.get('/', getUserNotifications)
router.get('/stats', getNotificationStats)
router.put('/mark-all-read', markAllAsRead)
router.delete('/clear-all', clearAllNotifications)
router.get('/:id', getNotification)
router.put('/:id/read', markAsRead)
router.delete('/:id', deleteNotification)

// Admin only routes
router.post('/', requireAdmin, createNotification)

module.exports = router