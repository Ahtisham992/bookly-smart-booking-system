const mongoose = require('mongoose')

const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Service title is required'],
    trim: true,
    maxlength: [100, 'Service title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Service description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Service category is required']
  },
  subcategory: {
    type: String,
    trim: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Provider is required']
  },
  pricing: {
    type: {
      type: String,
      enum: ['fixed', 'hourly', 'package', 'custom'],
      default: 'fixed'
    },
    amount: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD'
    },
    packages: [{
      name: String,
      description: String,
      price: Number,
      duration: Number, // in minutes
      features: [String]
    }]
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Service duration is required'],
    min: [15, 'Minimum service duration is 15 minutes']
  },
  location: {
    type: {
      type: String,
      enum: ['online', 'provider-location', 'customer-location', 'both'],
      default: 'provider-location'
    },
    address: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  availability: {
    schedule: {
      monday: {
        available: { type: Boolean, default: true },
        slots: [{ start: String, end: String }] // e.g., "09:00", "17:00"
      },
      tuesday: {
        available: { type: Boolean, default: true },
        slots: [{ start: String, end: String }]
      },
      wednesday: {
        available: { type: Boolean, default: true },
        slots: [{ start: String, end: String }]
      },
      thursday: {
        available: { type: Boolean, default: true },
        slots: [{ start: String, end: String }]
      },
      friday: {
        available: { type: Boolean, default: true },
        slots: [{ start: String, end: String }]
      },
      saturday: {
        available: { type: Boolean, default: false },
        slots: [{ start: String, end: String }]
      },
      sunday: {
        available: { type: Boolean, default: false },
        slots: [{ start: String, end: String }]
      }
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    advanceBooking: {
      min: { type: Number, default: 24 }, // minimum hours in advance
      max: { type: Number, default: 720 } // maximum hours in advance (30 days)
    }
  },
  media: {
    images: [String], // URLs to service images
    videos: [String], // URLs to service videos
    documents: [String] // URLs to service documents/brochures
  },
  requirements: {
    customerRequirements: [String], // what customer needs to provide
    ageRestrictions: {
      minAge: Number,
      maxAge: Number
    },
    skills: [String], // required skills/equipment from customer
    preparation: String // preparation instructions
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  tags: [String], // searchable tags
  isActive: {
    type: Boolean,
    default: true
  },
  isApproved: {
    type: Boolean,
    default: true // auto-approve for development (change to false for production)
  },
  totalBookings: {
    type: Number,
    default: 0
  },
  cancelPolicy: {
    type: String,
    enum: ['flexible', 'moderate', 'strict'],
    default: 'moderate'
  },
  refundPolicy: {
    type: String,
    maxlength: [500, 'Refund policy cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for better performance
serviceSchema.index({ provider: 1 })
serviceSchema.index({ category: 1 })
serviceSchema.index({ 'location.city': 1 })
serviceSchema.index({ isActive: 1, isApproved: 1 })
serviceSchema.index({ 'rating.average': -1 })
serviceSchema.index({ createdAt: -1 })

// Virtual for formatted price
serviceSchema.virtual('formattedPrice').get(function() {
  return `$${this.pricing.amount.toFixed(2)}`
})

// Virtual populate reviews
serviceSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'service'
})

// Update provider's service count when service is saved
serviceSchema.post('save', async function() {
  const User = mongoose.model('User')
  const serviceCount = await mongoose.model('Service').countDocuments({ 
    provider: this.provider, 
    isActive: true 
  })
  
  await User.findByIdAndUpdate(this.provider, {
    'providerInfo.serviceCount': serviceCount
  })
})

module.exports = mongoose.model('Service', serviceSchema)