const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer is required']
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Provider is required']
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Service is required']
  },
  scheduledDate: {
    type: Date,
    required: [true, 'Scheduled date is required']
  },
  scheduledTime: {
    start: {
      type: String, // "HH:MM" format
      required: [true, 'Start time is required']
    },
    end: {
      type: String, // "HH:MM" format
      required: [true, 'End time is required']
    }
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Duration is required']
  },
  status: {
    type: String,
    enum: [
      'pending',      // waiting for provider confirmation
      'confirmed',    // provider confirmed
      'in-progress',  // service is currently being performed
      'completed',    // service completed
      'cancelled',    // cancelled by customer or provider
      'no-show',      // customer didn't show up
      'refunded'      // payment refunded
    ],
    default: 'pending'
  },
  location: {
    type: {
      type: String,
      enum: ['online', 'provider-location', 'customer-location'],
      required: true
    },
    address: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    meetingLink: String, // for online services
    instructions: String // special location instructions
  },
  pricing: {
    serviceFee: {
      type: Number,
      required: true
    },
    platformFee: {
      type: Number,
      default: 0
    },
    taxes: {
      type: Number,
      default: 0
    },
    discount: {
      amount: { type: Number, default: 0 },
      code: String,
      type: {
        type: String,
        enum: ['percentage', 'fixed']
      }
    },
    totalAmount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  payment: {
    method: {
      type: String,
      enum: ['card', 'paypal', 'stripe', 'cash', 'bank-transfer'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded', 'partial-refund'],
      default: 'pending'
    },
    transactionId: String,
    paymentIntentId: String, // for Stripe
    paidAt: Date,
    refundedAt: Date,
    refundAmount: Number
  },
  customerInfo: {
    name: String,
    email: String,
    phone: String,
    notes: String, // special requirements/notes from customer
    requirements: [String] // specific requirements for the service
  },
  providerNotes: {
    type: String,
    maxlength: [500, 'Provider notes cannot exceed 500 characters']
  },
  timeline: [{
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show', 'refunded']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  cancellation: {
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    cancelledAt: Date,
    refundEligible: {
      type: Boolean,
      default: false
    },
    refundAmount: Number
  },
  rescheduleHistory: [{
    oldDate: Date,
    oldTime: {
      start: String,
      end: String
    },
    newDate: Date,
    newTime: {
      start: String,
      end: String
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    requestedAt: Date,
    reason: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  }],
  reminders: {
    customerReminders: [{
      type: {
        type: String,
        enum: ['email', 'sms', 'push']
      },
      sentAt: Date,
      scheduledFor: Date
    }],
    providerReminders: [{
      type: {
        type: String,
        enum: ['email', 'sms', 'push']
      },
      sentAt: Date,
      scheduledFor: Date
    }]
  },
  feedback: {
    customerFeedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      review: String,
      submittedAt: Date
    },
    providerFeedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      review: String,
      submittedAt: Date
    }
  },
  metadata: {
    source: {
      type: String,
      enum: ['web', 'mobile', 'api'],
      default: 'web'
    },
    device: String,
    ipAddress: String,
    userAgent: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Generate booking ID before saving
bookingSchema.pre('save', async function(next) {
  if (!this.bookingId) {
    const count = await mongoose.model('Booking').countDocuments()
    this.bookingId = `BK${Date.now()}${String(count + 1).padStart(4, '0')}`
  }
  
  // Add to timeline if status changed
  if (this.isModified('status')) {
    this.timeline.push({
      status: this.status,
      timestamp: new Date(),
      updatedBy: this._updatedBy || this.customer
    })
  }
  
  next()
})

// Indexes for better performance
bookingSchema.index({ customer: 1, createdAt: -1 })
bookingSchema.index({ provider: 1, createdAt: -1 })
bookingSchema.index({ service: 1 })
bookingSchema.index({ status: 1 })
bookingSchema.index({ scheduledDate: 1 })
bookingSchema.index({ bookingId: 1 })

// Virtual for formatted total amount
bookingSchema.virtual('formattedTotal').get(function() {
  return `$${this.pricing.totalAmount.toFixed(2)}`
})

// Virtual for booking duration in hours
bookingSchema.virtual('durationInHours').get(function() {
  return this.duration / 60
})

// Virtual to check if booking is upcoming
bookingSchema.virtual('isUpcoming').get(function() {
  const now = new Date()
  const bookingDateTime = new Date(this.scheduledDate)
  return bookingDateTime > now && ['confirmed', 'pending'].includes(this.status)
})

// Virtual to check if booking can be cancelled
bookingSchema.virtual('canBeCancelled').get(function() {
  const now = new Date()
  const bookingDateTime = new Date(this.scheduledDate)
  const hoursUntilBooking = (bookingDateTime - now) / (1000 * 60 * 60)
  
  return hoursUntilBooking > 24 && ['pending', 'confirmed'].includes(this.status)
})

// Update service booking count
bookingSchema.post('save', async function() {
  if (this.status === 'completed') {
    await mongoose.model('Service').findByIdAndUpdate(this.service, {
      $inc: { totalBookings: 1 }
    })
  }
})

module.exports = mongoose.model('Booking', bookingSchema)