// Script to create an admin user
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
require('dotenv').config()

const User = require('../src/models/User')

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@bookly.com' })
    
    if (existingAdmin) {
      console.log('❌ Admin user already exists!')
      console.log('Email:', existingAdmin.email)
      console.log('Role:', existingAdmin.role)
      process.exit(0)
    }

    // Create admin user
    const adminData = {
      email: 'admin@bookly.com',
      password: 'Admin@123', // Will be hashed by pre-save hook
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isVerified: true,
      isActive: true
    }

    const admin = await User.create(adminData)

    console.log('\n✅ Admin user created successfully!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📧 Email:', admin.email)
    console.log('🔑 Password: Admin@123')
    console.log('👤 Role:', admin.role)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n⚠️  IMPORTANT: Change the password after first login!')
    console.log('🌐 Login at: http://localhost:3002/auth/login\n')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message)
    process.exit(1)
  }
}

// Run the script
createAdminUser()
