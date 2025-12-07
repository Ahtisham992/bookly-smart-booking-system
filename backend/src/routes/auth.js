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
const passport = require('../config/passport')

const router = express.Router()

// Public routes
router.post('/register', validateRegister, register)
router.post('/login', validateLogin, login)
router.get('/logout', logout)
router.post('/forgotpassword', forgotPassword)
router.put('/resetpassword/:resettoken', resetPassword)
router.get('/verify-email/:token', verifyEmail)

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
)

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=google_auth_failed` }),
  (req, res) => {
    try {
      // Generate JWT token
      const token = req.user.getSignedJwtToken()
      
      // Redirect to frontend with token
      res.redirect(`${process.env.CLIENT_URL}/auth/google/success?token=${token}`)
    } catch (error) {
      console.error('Google callback error:', error)
      res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`)
    }
  }
)

// Protected routes
router.get('/me', protect, getMe)
router.put('/updatedetails', protect, updateDetails)
router.put('/updatepassword', protect, validateUpdatePassword, updatePassword)

module.exports = router