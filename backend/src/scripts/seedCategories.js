// scripts/seedCategories.js
const mongoose = require('mongoose')
const Category = require('../models/Category')
require('dotenv').config()

const categories = [
  {
    name: 'Healthcare',
    slug: 'healthcare',
    description: 'Medical and healthcare services',
    icon: 'heart-pulse',
    isActive: true
  },
  {
    name: 'Beauty & Wellness',
    slug: 'beauty-wellness',
    description: 'Beauty, spa, and wellness services',
    icon: 'sparkles',
    isActive: true
  },
  {
    name: 'Fitness & Sports',
    slug: 'fitness-sports',
    description: 'Fitness training and sports coaching',
    icon: 'dumbbell',
    isActive: true
  },
  {
    name: 'Education & Tutoring',
    slug: 'education-tutoring',
    description: 'Educational and tutoring services',
    icon: 'graduation-cap',
    isActive: true
  },
  {
    name: 'Home Services',
    slug: 'home-services',
    description: 'Home repair, cleaning, and maintenance',
    icon: 'home',
    isActive: true
  },
  {
    name: 'Professional Services',
    slug: 'professional-services',
    description: 'Consulting, legal, and professional services',
    icon: 'briefcase',
    isActive: true
  },
  {
    name: 'Technology',
    slug: 'technology',
    description: 'IT support and technology services',
    icon: 'laptop',
    isActive: true
  },
  {
    name: 'Automotive',
    slug: 'automotive',
    description: 'Car repair and maintenance services',
    icon: 'car',
    isActive: true
  }
]

const seedCategories = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Clear existing categories
    await Category.deleteMany({})
    console.log('🗑️  Cleared existing categories')

    // Insert new categories
    const createdCategories = await Category.insertMany(categories)
    console.log(`✅ Created ${createdCategories.length} categories:`)
    createdCategories.forEach(cat => {
      console.log(`   - ${cat.name} (${cat._id})`)
    })

    console.log('\n✅ Categories seeded successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding categories:', error)
    process.exit(1)
  }
}

seedCategories()
