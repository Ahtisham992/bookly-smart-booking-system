// Email Service using Nodemailer
const nodemailer = require('nodemailer')

// Create transporter
const createTransporter = () => {
  // For development, use Gmail or Mailtrap
  // For production, use SendGrid, AWS SES, or similar
  
  if (process.env.NODE_ENV === 'production') {
    // Production email service (e.g., SendGrid)
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })
  } else {
    // Development - Gmail or Mailtrap
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // Use App Password for Gmail
      }
    })
  }
}

// Send email
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter()
    
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME || 'Bookly'} <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text
    }
    
    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error: error.message }
  }
}

// Email Templates
const emailTemplates = {
  // Welcome Email
  welcome: (user) => ({
    subject: 'Welcome to Bookly!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4F46E5;">Welcome to Bookly, ${user.firstName}!</h1>
        <p>Thank you for joining our platform. We're excited to have you on board!</p>
        <p>You can now browse services, book appointments, and manage your bookings all in one place.</p>
        <a href="${process.env.CLIENT_URL}/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px;">Go to Dashboard</a>
        <p style="margin-top: 30px; color: #666;">Best regards,<br>The Bookly Team</p>
      </div>
    `
  }),

  // Email Verification
  emailVerification: (user, token) => ({
    subject: 'Verify Your Email Address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4F46E5;">Verify Your Email</h1>
        <p>Hi ${user.firstName},</p>
        <p>Please verify your email address by clicking the button below:</p>
        <a href="${process.env.CLIENT_URL}/verify-email/${token}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px;">Verify Email</a>
        <p style="margin-top: 30px; color: #666;">This link will expire in 24 hours.</p>
        <p style="color: #666;">If you didn't create an account, please ignore this email.</p>
      </div>
    `
  }),

  // Booking Confirmation
  bookingConfirmation: (booking) => ({
    subject: 'Booking Confirmation',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4F46E5;">Booking Confirmed!</h1>
        <p>Hi ${booking.customer.firstName},</p>
        <p>Your booking has been confirmed. Here are the details:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Service:</strong> ${booking.service.title}</p>
          <p><strong>Provider:</strong> ${booking.provider.firstName} ${booking.provider.lastName}</p>
          <p><strong>Date:</strong> ${new Date(booking.scheduledDate).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${booking.scheduledTime}</p>
          <p><strong>Payment Method:</strong> ${booking.paymentMethod === 'cash' ? 'Cash on Spot' : 'Card Payment'}</p>
          <p><strong>Total Amount:</strong> $${booking.pricing.totalAmount}</p>
        </div>
        <a href="${process.env.CLIENT_URL}/bookings/${booking._id}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px;">View Booking</a>
        <p style="margin-top: 30px; color: #666;">Thank you for using Bookly!</p>
      </div>
    `
  }),

  // Booking Reminder (24 hours before)
  bookingReminder: (booking) => ({
    subject: 'Reminder: Your Booking Tomorrow',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4F46E5;">Booking Reminder</h1>
        <p>Hi ${booking.customer.firstName},</p>
        <p>This is a reminder that you have a booking tomorrow:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Service:</strong> ${booking.service.title}</p>
          <p><strong>Provider:</strong> ${booking.provider.firstName} ${booking.provider.lastName}</p>
          <p><strong>Date:</strong> ${new Date(booking.scheduledDate).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${booking.scheduledTime}</p>
          <p><strong>Payment Method:</strong> ${booking.paymentMethod === 'cash' ? 'Cash on Spot' : 'Card Payment'}</p>
        </div>
        <p>Please arrive on time. If you need to cancel or reschedule, please do so as soon as possible.</p>
        <a href="${process.env.CLIENT_URL}/bookings/${booking._id}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px;">Manage Booking</a>
      </div>
    `
  }),

  // Booking Accepted by Provider
  bookingAccepted: (booking) => ({
    subject: 'Your Booking Has Been Accepted',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10B981;">Booking Accepted!</h1>
        <p>Hi ${booking.customer.firstName},</p>
        <p>Great news! Your booking has been accepted by the provider.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Service:</strong> ${booking.service.title}</p>
          <p><strong>Provider:</strong> ${booking.provider.firstName} ${booking.provider.lastName}</p>
          <p><strong>Date:</strong> ${new Date(booking.scheduledDate).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${booking.scheduledTime}</p>
        </div>
        <a href="${process.env.CLIENT_URL}/bookings/${booking._id}" style="display: inline-block; padding: 12px 24px; background-color: #10B981; color: white; text-decoration: none; border-radius: 6px;">View Booking</a>
      </div>
    `
  }),

  // Booking Rejected by Provider
  bookingRejected: (booking, reason) => ({
    subject: 'Booking Update',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #EF4444;">Booking Not Available</h1>
        <p>Hi ${booking.customer.firstName},</p>
        <p>Unfortunately, your booking request could not be accepted.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        <p>Please try booking a different time slot or contact the provider for more information.</p>
        <a href="${process.env.CLIENT_URL}/services/${booking.service._id}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px;">Book Again</a>
      </div>
    `
  }),

  // Password Reset
  passwordReset: (user, token) => ({
    subject: 'Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4F46E5;">Reset Your Password</h1>
        <p>Hi ${user.firstName},</p>
        <p>You requested to reset your password. Click the button below to create a new password:</p>
        <a href="${process.env.CLIENT_URL}/reset-password/${token}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px;">Reset Password</a>
        <p style="margin-top: 30px; color: #666;">This link will expire in 10 minutes.</p>
        <p style="color: #666;">If you didn't request this, please ignore this email.</p>
      </div>
    `
  }),

  // Provider Verification
  providerVerified: (provider) => ({
    subject: 'Your Provider Account Has Been Verified',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10B981;">Account Verified!</h1>
        <p>Hi ${provider.firstName},</p>
        <p>Congratulations! Your provider account has been verified by our admin team.</p>
        <p>You can now start receiving bookings from customers.</p>
        <a href="${process.env.CLIENT_URL}/provider-dashboard" style="display: inline-block; padding: 12px 24px; background-color: #10B981; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px;">Go to Dashboard</a>
      </div>
    `
  }),

  // Account Banned
  accountBanned: (user, reason) => ({
    subject: 'Account Status Update',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #EF4444;">Account Suspended</h1>
        <p>Hi ${user.firstName},</p>
        <p>Your account has been suspended.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        <p>If you believe this is a mistake, please contact our support team.</p>
        <p style="margin-top: 30px; color: #666;">Support Email: ${process.env.SUPPORT_EMAIL || 'support@bookly.com'}</p>
      </div>
    `
  })
}

// Send specific email types
const sendWelcomeEmail = async (user) => {
  const template = emailTemplates.welcome(user)
  return await sendEmail({ to: user.email, ...template })
}

const sendVerificationEmail = async (user, token) => {
  const template = emailTemplates.emailVerification(user, token)
  return await sendEmail({ to: user.email, ...template })
}

const sendBookingConfirmation = async (booking) => {
  const template = emailTemplates.bookingConfirmation(booking)
  return await sendEmail({ to: booking.customer.email, ...template })
}

const sendBookingReminder = async (booking) => {
  const template = emailTemplates.bookingReminder(booking)
  return await sendEmail({ to: booking.customer.email, ...template })
}

const sendBookingAccepted = async (booking) => {
  const template = emailTemplates.bookingAccepted(booking)
  return await sendEmail({ to: booking.customer.email, ...template })
}

const sendBookingRejected = async (booking, reason) => {
  const template = emailTemplates.bookingRejected(booking, reason)
  return await sendEmail({ to: booking.customer.email, ...template })
}

const sendPasswordResetEmail = async (user, token) => {
  const template = emailTemplates.passwordReset(user, token)
  return await sendEmail({ to: user.email, ...template })
}

const sendProviderVerifiedEmail = async (provider) => {
  const template = emailTemplates.providerVerified(provider)
  return await sendEmail({ to: provider.email, ...template })
}

const sendAccountBannedEmail = async (user, reason) => {
  const template = emailTemplates.accountBanned(user, reason)
  return await sendEmail({ to: user.email, ...template })
}

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendVerificationEmail,
  sendBookingConfirmation,
  sendBookingReminder,
  sendBookingAccepted,
  sendBookingRejected,
  sendPasswordResetEmail,
  sendProviderVerifiedEmail,
  sendAccountBannedEmail
}
