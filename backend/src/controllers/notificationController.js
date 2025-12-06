// controllers/notificationController.js
const Notification = require('../models/Notification')
const { sendSuccessResponse, sendErrorResponse } = require('../utils/helpers/responseHelpers')

// @desc    Create new notification
// @route   POST /api/notifications
// @access  Private (Admin/System)
exports.createNotification = async (req, res) => {
  try {
    const { recipient, type, title, message, channels, priority } = req.body

    const notification = await Notification.create({
      recipient,
      type,
      title,
      message,
      channels: channels || ['in-app'],
      priority: priority || 'medium',
      createdBy: req.user.id
    })

    sendSuccessResponse(res, notification, 'Notification created successfully', 201)
  } catch (error) {
    console.error('Create notification error:', error)
    
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(val => val.message).join(', ')
      return sendErrorResponse(res, message, 400)
    }
    
    sendErrorResponse(res, 'Failed to create notification', 500)
  }
}

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getUserNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 20
    const startIndex = (page - 1) * limit

    let query = { recipient: req.user.id }

    // Filter by read status
    if (req.query.read !== undefined) {
      query['status.read'] = req.query.read === 'true'
    }

    // Filter by type
    if (req.query.type) {
      query.type = req.query.type
    }

    // Filter by priority
    if (req.query.priority) {
      query.priority = req.query.priority
    }

    const total = await Notification.countDocuments(query)
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1, priority: -1 })
      .limit(limit)
      .skip(startIndex)

    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }

    // Get unread count
    const unreadCount = await Notification.countDocuments({
      recipient: req.user.id,
      'status.read': false
    })

    res.status(200).json({
      success: true,
      data: notifications,
      pagination,
      count: notifications.length,
      unreadCount
    })
  } catch (error) {
    console.error('Get notifications error:', error)
    sendErrorResponse(res, 'Failed to fetch notifications', 500)
  }
}

// @desc    Get single notification
// @route   GET /api/notifications/:id
// @access  Private
exports.getNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)

    if (!notification) {
      return sendErrorResponse(res, 'Notification not found', 404)
    }

    // Check if user owns this notification
    if (notification.recipient.toString() !== req.user.id && req.user.role !== 'admin') {
      return sendErrorResponse(res, 'Not authorized to access this notification', 403)
    }

    sendSuccessResponse(res, notification, 'Notification retrieved successfully')
  } catch (error) {
    console.error('Get notification error:', error)
    
    if (error.name === 'CastError') {
      return sendErrorResponse(res, 'Notification not found', 404)
    }
    
    sendErrorResponse(res, 'Failed to get notification', 500)
  }
}

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)

    if (!notification) {
      return sendErrorResponse(res, 'Notification not found', 404)
    }

    // Check if user owns this notification
    if (notification.recipient.toString() !== req.user.id) {
      return sendErrorResponse(res, 'Not authorized to update this notification', 403)
    }

    const updatedNotification = await Notification.findByIdAndUpdate(
      req.params.id,
      {
        'status.read': true,
        'status.readAt': new Date()
      },
      { new: true }
    )

    sendSuccessResponse(res, updatedNotification, 'Notification marked as read')
  } catch (error) {
    console.error('Mark notification as read error:', error)
    
    if (error.name === 'CastError') {
      return sendErrorResponse(res, 'Notification not found', 404)
    }
    
    sendErrorResponse(res, 'Failed to mark notification as read', 500)
  }
}

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { 
        recipient: req.user.id,
        'status.read': false 
      },
      {
        'status.read': true,
        'status.readAt': new Date()
      }
    )

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount
    })
  } catch (error) {
    console.error('Mark all as read error:', error)
    sendErrorResponse(res, 'Failed to mark all notifications as read', 500)
  }
}

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)

    if (!notification) {
      return sendErrorResponse(res, 'Notification not found', 404)
    }

    // Check if user owns this notification
    if (notification.recipient.toString() !== req.user.id && req.user.role !== 'admin') {
      return sendErrorResponse(res, 'Not authorized to delete this notification', 403)
    }

    await Notification.findByIdAndDelete(req.params.id)

    sendSuccessResponse(res, null, 'Notification deleted successfully')
  } catch (error) {
    console.error('Delete notification error:', error)
    
    if (error.name === 'CastError') {
      return sendErrorResponse(res, 'Notification not found', 404)
    }
    
    sendErrorResponse(res, 'Failed to delete notification', 500)
  }
}

// @desc    Delete all notifications for user
// @route   DELETE /api/notifications/clear-all
// @access  Private
exports.clearAllNotifications = async (req, res) => {
  try {
    const result = await Notification.deleteMany({ recipient: req.user.id })

    res.status(200).json({
      success: true,
      message: 'All notifications cleared',
      deletedCount: result.deletedCount
    })
  } catch (error) {
    console.error('Clear all notifications error:', error)
    sendErrorResponse(res, 'Failed to clear all notifications', 500)
  }
}

// @desc    Get notification statistics
// @route   GET /api/notifications/stats
// @access  Private
exports.getNotificationStats = async (req, res) => {
  try {
    const stats = await Notification.aggregate([
      { $match: { recipient: req.user.id } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: { $sum: { $cond: [{ $eq: ['$status.read', false] }, 1, 0] } },
          byType: {
            $push: {
              type: '$type',
              priority: '$priority',
              read: '$status.read'
            }
          }
        }
      }
    ])

    // Group by type and priority
    const typeStats = {}
    const priorityStats = {}

    if (stats.length > 0) {
      stats[0].byType.forEach(notif => {
        // Type statistics
        if (!typeStats[notif.type]) {
          typeStats[notif.type] = { total: 0, unread: 0 }
        }
        typeStats[notif.type].total++
        if (!notif.read) typeStats[notif.type].unread++

        // Priority statistics
        if (!priorityStats[notif.priority]) {
          priorityStats[notif.priority] = { total: 0, unread: 0 }
        }
        priorityStats[notif.priority].total++
        if (!notif.read) priorityStats[notif.priority].unread++
      })
    }

    const result = {
      total: stats.length > 0 ? stats[0].total : 0,
      unread: stats.length > 0 ? stats[0].unread : 0,
      typeStats,
      priorityStats
    }

    sendSuccessResponse(res, result, 'Notification statistics retrieved successfully')
  } catch (error) {
    console.error('Get notification stats error:', error)
    sendErrorResponse(res, 'Failed to get notification statistics', 500)
  }
}

// Helper function to create system notifications
exports.createSystemNotification = async (recipientId, type, title, message, priority = 'medium') => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      type,
      title,
      message,
      channels: ['in-app'],
      priority,
      isSystem: true
    })
    return notification
  } catch (error) {
    console.error('Create system notification error:', error)
    return null
  }
}

// Helper function to create bulk notifications
exports.createBulkNotifications = async (recipients, type, title, message, priority = 'medium') => {
  try {
    const notifications = recipients.map(recipientId => ({
      recipient: recipientId,
      type,
      title,
      message,
      channels: ['in-app'],
      priority,
      isSystem: true
    }))

    const result = await Notification.insertMany(notifications)
    return result
  } catch (error) {
    console.error('Create bulk notifications error:', error)
    return null
  }
}