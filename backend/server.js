const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const hpp = require('hpp')
const path = require('path')
const passport = require('passport')

// Load environment variables
dotenv.config()

// Import database connection
const connectDB = require('./src/config/database')

// Import passport configuration
require('./src/config/passport')

// Import error handler
const errorHandler = require('./src/middleware/errorHandler')

// Import routes
const authRoutes = require('./src/routes/auth')
const serviceRoutes = require('./src/routes/services')
const bookingRoutes = require('./src/routes/bookings')
const categoryRoutes = require('./src/routes/categories')
const userRoutes = require('./src/routes/users')
const reviewRoutes = require('./src/routes/reviews')
const notificationRoutes = require('./src/routes/notifications')
const dashboardRoutes = require('./src/routes/dashboard')
const providerRoutes = require('./src/routes/providers')

// Connect to database
connectDB()

const app = express()

// Enable CORS - MUST be before other middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))

// Security middleware
app.use(helmet())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 1000 : 100, // Higher limit in development
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
})
app.use(limiter)

// Body parser
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: false }))

// Cookie parser
app.use(cookieParser())

// Initialize Passport
app.use(passport.initialize())

// ❌ Removed express-mongo-sanitize
// ❌ Removed xss-clean

// Prevent parameter pollution
app.use(hpp())

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/services', serviceRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/users', userRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/providers', providerRoutes)

// Error handler
app.use(errorHandler)

const PORT = process.env.PORT || 5000

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
  console.log(`📱 Health check: http://localhost:${PORT}/health`)
  
  // Start booking reminder scheduler
  const { scheduleReminders } = require('./src/services/reminderScheduler')
  scheduleReminders()
})

// Graceful shutdown handlers
process.on('unhandledRejection', (err) => {
  console.log(`❌ Unhandled Rejection: ${err.message}`)
  server.close(() => process.exit(1))
})

process.on('uncaughtException', (err) => {
  console.log(`❌ Uncaught Exception: ${err.message}`)
  process.exit(1)
})

process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM received. Shutting down gracefully...')
  server.close(() => console.log('✅ Process terminated'))
})

module.exports = app
