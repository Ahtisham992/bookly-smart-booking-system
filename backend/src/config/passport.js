const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const User = require('../models/User')

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists
      let user = await User.findOne({ email: profile.emails[0].value })
      
      if (user) {
        // User exists, update Google ID if not set
        if (!user.googleId) {
          user.googleId = profile.id
          user.isVerified = true // Google accounts are verified
          await user.save()
        }
        return done(null, user)
      }
      
      // Create new user
      user = await User.create({
        googleId: profile.id,
        email: profile.emails[0].value,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        profileImage: profile.photos[0]?.value,
        isVerified: true, // Google accounts are pre-verified
        password: Math.random().toString(36).slice(-8) + 'Aa1!' // Random secure password
      })
      
      done(null, user)
    } catch (error) {
      console.error('Google OAuth error:', error)
      done(error, null)
    }
  }
))

module.exports = passport
