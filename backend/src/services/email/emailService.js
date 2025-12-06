const nodemailer = require('nodemailer')
const logger = require('../../utils/logger/logger')

// Email templates
const welcomeTemplate = require('./templates/welcome')
const passwordResetTemplate = require('./templates/password-reset')

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  })
}

const sendEmail = async (options) => {
  try {
    const transporter = createTransporter()

    let htmlContent = ''
    let subject = options.subject

    // Generate HTML content based on template
    switch (options.template) {
      case 'welcome':
        htmlContent = welcomeTemplate(options.data)
        subject = subject || 'Welcome to Smart Booking'
        break
      case 'password-reset':
        htmlContent = passwordResetTemplate(options.data)
        subject = subject || 'Password Reset Request'
        break
      default:
        htmlContent = options.html || options.text || ''
    }

    const message = {
      from: `${process.env.FROM_NAME || 'Smart Booking'} <${process.env.EMAIL_FROM}>`,
      to: options.email,
      subject: subject,
      html: htmlContent,
      text: options.text
    }

    const info = await transporter.sendMail(message)
    
    logger.info(`Email sent to ${options.email}: ${info.messageId}`)
    
    return {
      success: true,
      messageId: info.messageId
    }
  } catch (error) {
    logger.error('Email sending failed:', error)
    throw error
  }
}

module.exports = { sendEmail }