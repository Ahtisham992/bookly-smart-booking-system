const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    unique: true,
    maxlength: [100, 'Category name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    required: [true, 'Category slug is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  icon: {
    type: String, // Icon name or URL
    default: null
  },
  image: {
    type: String, // Category image URL
    default: null
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  level: {
    type: Number,
    default: 0, // 0 for root categories, 1 for subcategories, etc.
    min: 0,
    max: 3
  },
  order: {
    type: Number,
    default: 0 // For custom ordering
  },
  serviceCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  metadata: {
    keywords: [String], // SEO keywords
    metaDescription: String,
    color: String, // Brand color for the category
    customFields: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes
categorySchema.index({ slug: 1 })
categorySchema.index({ parentCategory: 1 })
categorySchema.index({ isActive: 1, isFeatured: 1 })
categorySchema.index({ name: 'text', description: 'text' })

// Virtual for subcategories
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentCategory'
})

// Pre-save middleware to generate slug
categorySchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }
  next()
})

// Pre-save middleware to set level based on parent
categorySchema.pre('save', async function(next) {
  if (this.isModified('parentCategory') && this.parentCategory) {
    const parent = await mongoose.model('Category').findById(this.parentCategory)
    if (parent) {
      this.level = parent.level + 1
    }
  }
  next()
})

// Static method to update service counts
categorySchema.statics.updateServiceCounts = async function() {
  const Service = mongoose.model('Service')
  const categories = await this.find()
  
  for (const category of categories) {
    const count = await Service.countDocuments({
      category: category._id,
      isActive: true,
      isApproved: true
    })
    
    await this.findByIdAndUpdate(category._id, { serviceCount: count })
  }
}

module.exports = mongoose.model('Category', categorySchema)
