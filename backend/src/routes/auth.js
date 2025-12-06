const express = require('express')
const {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
  verifyEmail
} = require('../controllers/authController')

const { protect } = require('../middleware/auth')
const { validateRegister, validateLogin, validateUpdatePassword } = require('../middleware/validation')

const router = express.Router()

// Public routes
router.post('/register', validateRegister, register)
router.post('/login', validateLogin, login)
router.get('/logout', logout)
router.post('/forgotpassword', forgotPassword)
router.put('/resetpassword/:resettoken', resetPassword)
router.get('/verify-email/:token', verifyEmail)

// Protected routes
router.get('/me', protect, getMe)
router.put('/updatedetails', protect, updateDetails)
router.put('/updatepassword', protect, validateUpdatePassword, updatePassword)

module.exports = router