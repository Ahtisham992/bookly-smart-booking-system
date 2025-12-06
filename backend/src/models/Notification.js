const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipient is required']
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: [
      // Booking related
      'booking-request',        // New booking request received
      'booking-confirmed',      // Booking confirmed by provider
      'booking-cancelled',      // Booking cancelled
      'booking-reminder',       // Reminder before booking
      'booking-completed',      // Booking marked as completed
      'booking-reschedule',     // Reschedule request
      
      // Payment related
      'payment-success',        // Payment processed successfully
      'payment-failed',         // Payment failed
      'refund-processed',       // Refund completed
      
      // Service related
      'service-approved',       // Service approved by admin
      'service-rejected',       // Service rejected by admin
      'new-review',            // New review received
      'review-response',       // Provider responded to review
      
      // Account related
      'account-verified',       // Account verification completed
      'password-changed',       // Password changed
      'profile-updated',        // Profile updated
      
      // System notifications
      'maintenance',           // System maintenance
      'feature-update',        // New feature announcement
      'promotional',           // Promotional offers
      'security-alert'         // Security related alerts
    ],
    required: [true, 'Notification type is required']
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  data: {
    // Additional data based on notification type
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service'
    },
    reviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review'
    },
    amount: Number,
    actionUrl: String,    // URL for action button
    actionText: String,   // Text for action button
    metadata: mongoose.Schema.Types.Mixed // Additional flexible data
  },
  channels: {
    // Which channels to send notification through
    inApp: {
      type: Boolean,
      default: true
    },
    email: {
      type: Boolean,
      default: false
    },
    sms: {
      type: Boolean,
      default: false
    },
    push: {
      type: Boolean,
      default: false
    }
  },
  status: {
    inApp: {
      sent: { type: Boolean, default: false },
      sentAt: Date,
      read: { type: Boolean, default: false },
      readAt: Date
    },
    email: {
      sent: { type: Boolean, default: false },
      sentAt: Date,
      delivered: { type: Boolean, default: false },
      deliveredAt: Date,
      opened: { type: Boolean, default: false },
      openedAt: Date,
      bounced: { type: Boolean, default: false },
      error: String
    },
    sms: {
      sent: { type: Boolean, default: false },
      sentAt: Date,
      delivered: { type: Boolean, default: false },
      deliveredAt: Date,
      failed: { type: Boolean, default: false },
      error: String
    },
    push: {
      sent: { type: Boolean, default: false },
      sentAt: Date,
      delivered: { type: Boolean, default: false },
      deliveredAt: Date,
      clicked: { type: Boolean, default: false },
      clickedAt: Date,
      error: String
    }
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  scheduledFor: {
    type: Date,
    default: Date.now
  },
  expiresAt: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  template: {
    name: String,
    version: String,
    variables: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for better performance
notificationSchema.index({ recipient: 1, createdAt: -1 })
notificationSchema.index({ type: 1 })
notificationSchema.index({ scheduledFor: 1 })
notificationSchema.index({ 'status.inApp.read': 1 })
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

// Virtual for checking if notification is read
notificationSchema.virtual('isRead').get(function() {
  return this.status.inApp.read
})

// Virtual for checking if notification is sent
notificationSchema.virtual('isSent').get(function() {
  return this.status.inApp.sent || this.status.email.sent || 
         this.status.sms.sent || this.status.push.sent
})

// Virtual for time ago
notificationSchema.virtual('timeAgo').get(function() {
  const now = new Date()
  const diffTime = Math.abs(now - this.createdAt)
  const diffMinutes = Math.floor(diffTime / (1000 * 60))
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return this.createdAt.toLocaleDateString()
})

// Method to mark as read
notificationSchema.methods.markAsRead = async function() {
  this.status.inApp.read = true
  this.status.inApp.readAt = new Date()
  return await this.save()
}

// Method to check if should be sent via channel
notificationSchema.methods.shouldSendVia = function(channel) {
  if (!this.channels[channel]) return false
  if (this.status[channel] && this.status[channel].sent) return false
  return true
}

// Static method to get unread count for user
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    recipient: userId,
    'status.inApp.read': false,
    isActive: true
  })
}

// Static method to mark all as read for user
notificationSchema.statics.markAllAsRead = function(userId) {
  return this.updateMany(
    { 
      recipient: userId, 
      'status.inApp.read': false,
      isActive: true 
    },
    { 
      'status.inApp.read': true,
      'status.inApp.readAt': new Date()
    }
  )
}

module.exports = mongoose.model('Notification', notificationSchema)