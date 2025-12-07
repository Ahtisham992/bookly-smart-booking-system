const cron = require('node-cron')
const Booking = require('../models/Booking')
const { sendBookingReminder } = require('./emailService')

// Run every hour to check for bookings that need reminders
const scheduleReminders = () => {
  // Run at minute 0 of every hour
  cron.schedule('0 * * * *', async () => {
    console.log('🔔 Checking for bookings to remind...')
    
    try {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      
      const dayAfterTomorrow = new Date(tomorrow)
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)
      
      // Find bookings scheduled for tomorrow that haven't been reminded yet
      const bookings = await Booking.find({
        scheduledDate: {
          $gte: tomorrow,
          $lt: dayAfterTomorrow
        },
        status: { $in: ['confirmed', 'pending'] },
        'reminders.customerReminders.0': { $exists: false } // No reminders sent yet
      })
      .populate('customer', 'firstName lastName email')
      .populate('provider', 'firstName lastName email')
      .populate('service', 'title description')
      
      console.log(`📧 Found ${bookings.length} bookings to remind`)
      
      let successCount = 0
      let failCount = 0
      
      for (const booking of bookings) {
        try {
          // Send reminder email
          const result = await sendBookingReminder(booking)
          
          if (result.success) {
            // Mark as reminded
            booking.reminders.customerReminders.push({
              type: 'email',
              sentAt: new Date(),
              scheduledFor: booking.scheduledDate
            })
            await booking.save()
            successCount++
          } else {
            failCount++
            console.error(`Failed to send reminder for booking ${booking.bookingId}:`, result.error)
          }
        } catch (error) {
          failCount++
          console.error(`Error sending reminder for booking ${booking.bookingId}:`, error)
        }
      }
      
      console.log(`✅ Sent ${successCount} reminders, ${failCount} failed`)
    } catch (error) {
      console.error('❌ Reminder scheduler error:', error)
    }
  })
  
  console.log('📅 Booking reminder scheduler started (runs hourly)')
}

// Manual trigger for testing
const sendRemindersNow = async () => {
  console.log('🔔 Manually triggering reminder check...')
  
  try {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    
    const dayAfterTomorrow = new Date(tomorrow)
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)
    
    const bookings = await Booking.find({
      scheduledDate: {
        $gte: tomorrow,
        $lt: dayAfterTomorrow
      },
      status: { $in: ['confirmed', 'pending'] }
    })
    .populate('customer', 'firstName lastName email')
    .populate('provider', 'firstName lastName email')
    .populate('service', 'title description')
    
    console.log(`Found ${bookings.length} bookings for tomorrow`)
    
    for (const booking of bookings) {
      await sendBookingReminder(booking)
      console.log(`Sent reminder for booking ${booking.bookingId}`)
    }
    
    return { success: true, count: bookings.length }
  } catch (error) {
    console.error('Manual reminder error:', error)
    return { success: false, error: error.message }
  }
}

module.exports = { scheduleReminders, sendRemindersNow }
