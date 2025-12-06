// scripts/seedTestService.js
const mongoose = require('mongoose')
const Service = require('../models/Service')
const User = require('../models/User')
const Category = require('../models/Category')
require('dotenv').config()

const seedTestService = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Find a provider user
    const provider = await User.findOne({ role: 'provider' })
    if (!provider) {
      console.log('❌ No provider found. Please register as a provider first.')
      process.exit(1)
    }
    console.log(`✅ Found provider: ${provider.firstName} ${provider.lastName}`)

    // Find a category
    const category = await Category.findOne({ isActive: true })
    if (!category) {
      console.log('❌ No categories found. Please run seedCategories.js first.')
      process.exit(1)
    }
    console.log(`✅ Found category: ${category.name}`)

    // Check if test service already exists
    const existingService = await Service.findOne({ 
      title: 'Professional Haircut',
      provider: provider._id 
    })
    
    if (existingService) {
      console.log('⚠️  Test service already exists')
      console.log(`   Service: ${existingService.title}`)
      console.log(`   ID: ${existingService._id}`)
      process.exit(0)
    }

    // Create test service
    const testService = await Service.create({
      title: 'Professional Haircut',
      description: 'Get a professional haircut from experienced stylists. Includes consultation, wash, cut, and styling.',
      category: category._id,
      provider: provider._id,
      pricing: {
        type: 'fixed',
        amount: 45,
        currency: 'USD'
      },
      duration: 60,
      location: {
        type: 'provider-location',
        address: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001'
      },
      media: {
        images: ['https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400']
      },
      isActive: true,
      isApproved: true
    })

    console.log('\n✅ Test service created successfully!')
    console.log(`   Title: ${testService.title}`)
    console.log(`   Price: $${testService.pricing.amount}`)
    console.log(`   Duration: ${testService.duration} minutes`)
    console.log(`   Category: ${category.name}`)
    console.log(`   Provider: ${provider.firstName} ${provider.lastName}`)
    console.log(`   ID: ${testService._id}`)
    console.log(`   Approved: ${testService.isApproved}`)
    console.log(`   Active: ${testService.isActive}`)

    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding test service:', error)
    process.exit(1)
  }
}

seedTestService()
