const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Booking reference is required']
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Service reference is required']
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Provider reference is required']
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer reference is required']
  },
  rating: {
    overall: {
      type: Number,
      required: [true, 'Overall rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    breakdown: {
      quality: {
        type: Number,
        min: 1,
        max: 5
      },
      punctuality: {
        type: Number,
        min: 1,
        max: 5
      },
      communication: {
        type: Number,
        min: 1,
        max: 5
      },
      professionalism: {
        type: Number,
        min: 1,
        max: 5
      },
      valueForMoney: {
        type: Number,
        min: 1,
        max: 5
      }
    }
  },
  review: {
    title: {
      type: String,
      maxlength: [100, 'Review title cannot exceed 100 characters']
    },
    content: {
      type: String,
      required: [true, 'Review content is required'],
      maxlength: [1000, 'Review content cannot exceed 1000 characters']
    }
  },
  media: {
    images: [String], // URLs to review images
    videos: [String]  // URLs to review videos
  },
  isVerified: {
    type: Boolean,
    default: true // true if from completed booking
  },
  isRecommended: {
    type: Boolean,
    required: true
  },
  tags: [String], // helpful tags like "punctual", "professional", "great-communication"
  helpfulVotes: {
    count: {
      type: Number,
      default: 0
    },
    voters: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  response: {
    content: String,
    respondedAt: Date,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  status: {
    type: String,
    enum: ['active', 'reported', 'hidden', 'removed'],
    default: 'active'
  },
  flags: {
    inappropriate: {
      count: { type: Number, default: 0 },
      reporters: [{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        reason: String,
        reportedAt: {
          type: Date,
          default: Date.now
        }
      }]
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Prevent duplicate reviews for same booking
reviewSchema.index({ booking: 1 }, { unique: true })

// Other indexes
reviewSchema.index({ service: 1, createdAt: -1 })
reviewSchema.index({ provider: 1, createdAt: -1 })
reviewSchema.index({ customer: 1 })
reviewSchema.index({ 'rating.overall': -1 })
reviewSchema.index({ status: 1 })

// Virtual for star display
reviewSchema.virtual('starDisplay').get(function() {
  return '★'.repeat(this.rating.overall) + '☆'.repeat(5 - this.rating.overall)
})

// Virtual for review age
reviewSchema.virtual('reviewAge').get(function() {
  const now = new Date()
  const diffTime = Math.abs(now - this.createdAt)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return '1 day ago'
  if (diffDays < 30) return `${diffDays} days ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
})

// Update service and provider ratings after review is saved
reviewSchema.post('save', async function() {
  // Update service rating
  const serviceReviews = await mongoose.model('Review').find({
    service: this.service,
    status: 'active'
  })
  
  if (serviceReviews.length > 0) {
    const avgRating = serviceReviews.reduce((sum, review) => 
      sum + review.rating.overall, 0) / serviceReviews.length
    
    await mongoose.model('Service').findByIdAndUpdate(this.service, {
      'rating.average': Math.round(avgRating * 10) / 10,
      'rating.count': serviceReviews.length
    })
  }
  
  // Update provider rating
  const providerReviews = await mongoose.model('Review').find({
    provider: this.provider,
    status: 'active'
  })
  
  if (providerReviews.length > 0) {
    const avgRating = providerReviews.reduce((sum, review) => 
      sum + review.rating.overall, 0) / providerReviews.length
    
    await mongoose.model('User').findByIdAndUpdate(this.provider, {
      'providerInfo.rating': Math.round(avgRating * 10) / 10,
      'providerInfo.reviewCount': providerReviews.length
    })
  }
})

// Update ratings when review is removed
reviewSchema.post('findOneAndUpdate', async function() {
  if (this.getUpdate().$set && this.getUpdate().$set.status === 'removed') {
    const review = await this.model.findOne(this.getQuery())
    
    // Recalculate service rating
    const serviceReviews = await mongoose.model('Review').find({
      service: review.service,
      status: 'active'
    })
    
    const serviceAvg = serviceReviews.length > 0 
      ? serviceReviews.reduce((sum, r) => sum + r.rating.overall, 0) / serviceReviews.length 
      : 0
    
    await mongoose.model('Service').findByIdAndUpdate(review.service, {
      'rating.average': Math.round(serviceAvg * 10) / 10,
      'rating.count': serviceReviews.length
    })
    
    // Recalculate provider rating
    const providerReviews = await mongoose.model('Review').find({
      provider: review.provider,
      status: 'active'
    })
    
    const providerAvg = providerReviews.length > 0 
      ? providerReviews.reduce((sum, r) => sum + r.rating.overall, 0) / providerReviews.length 
      : 0
    
    await mongoose.model('User').findByIdAndUpdate(review.provider, {
      'providerInfo.rating': Math.round(providerAvg * 10) / 10,
      'providerInfo.reviewCount': providerReviews.length
    })
  }
})

module.exports = mongoose.model('Review', reviewSchema)