// src/utils/timeSlots.js

/**
 * Generate time slots for a day based on service duration
 * @param {number} duration - Service duration in minutes
 * @param {string} startTime - Start time (e.g., "09:00")
 * @param {string} endTime - End time (e.g., "17:00")
 * @returns {Array} Array of time slot objects
 */
export const generateTimeSlots = (duration, startTime = "09:00", endTime = "17:00") => {
  const slots = []
  
  // Parse start and end times
  const [startHour, startMin] = startTime.split(':').map(Number)
  const [endHour, endMin] = endTime.split(':').map(Number)
  
  // Create start and end date objects
  const start = new Date()
  start.setHours(startHour, startMin, 0, 0)
  
  const end = new Date()
  end.setHours(endHour, endMin, 0, 0)
  
  // Generate slots
  let current = new Date(start)
  
  while (current < end) {
    const slotEnd = new Date(current.getTime() + duration * 60000)
    
    // Only add slot if it ends before or at the end time
    if (slotEnd <= end) {
      const hours = current.getHours().toString().padStart(2, '0')
      const minutes = current.getMinutes().toString().padStart(2, '0')
      const timeString = `${hours}:${minutes}`
      
      const endHours = slotEnd.getHours().toString().padStart(2, '0')
      const endMinutes = slotEnd.getMinutes().toString().padStart(2, '0')
      const endTimeString = `${endHours}:${endMinutes}`
      
      slots.push({
        time: timeString,
        endTime: endTimeString,
        display: formatTimeDisplay(timeString),
        available: true // Will be updated based on existing bookings
      })
    }
    
    // Move to next slot
    current = new Date(current.getTime() + duration * 60000)
  }
  
  return slots
}

/**
 * Format time for display (12-hour format)
 * @param {string} time24 - Time in 24-hour format (HH:MM)
 * @returns {string} Time in 12-hour format
 */
export const formatTimeDisplay = (time24) => {
  const [hours, minutes] = time24.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
}

/**
 * Check if a time slot is available based on existing bookings
 * @param {string} slotTime - Slot start time (HH:MM)
 * @param {string} slotEndTime - Slot end time (HH:MM)
 * @param {Array} existingBookings - Array of existing bookings for the day
 * @returns {boolean} True if slot is available
 */
export const isSlotAvailable = (slotTime, slotEndTime, existingBookings) => {
  if (!existingBookings || existingBookings.length === 0) {
    return true
  }
  
  const slotStart = timeToMinutes(slotTime)
  const slotEnd = timeToMinutes(slotEndTime)
  
  // Check if slot overlaps with any existing booking
  for (const booking of existingBookings) {
    const bookingStart = timeToMinutes(booking.scheduledTime)
    const bookingEnd = bookingStart + (booking.duration || 60)
    
    // Check for overlap
    if (
      (slotStart >= bookingStart && slotStart < bookingEnd) ||
      (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
      (slotStart <= bookingStart && slotEnd >= bookingEnd)
    ) {
      return false
    }
  }
  
  return true
}

/**
 * Convert time string to minutes since midnight
 * @param {string} time - Time in HH:MM format
 * @returns {number} Minutes since midnight
 */
const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Filter past time slots for today
 * @param {Array} slots - Array of time slots
 * @param {string} selectedDate - Selected date (YYYY-MM-DD)
 * @returns {Array} Filtered slots
 */
export const filterPastSlots = (slots, selectedDate) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const selected = new Date(selectedDate)
  selected.setHours(0, 0, 0, 0)
  
  // If selected date is not today, return all slots
  if (selected.getTime() !== today.getTime()) {
    return slots
  }
  
  // Filter out past slots for today
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  
  return slots.filter(slot => {
    const slotMinutes = timeToMinutes(slot.time)
    return slotMinutes > currentMinutes
  })
}

/**
 * Get provider's working hours (can be customized per provider)
 * @param {Object} provider - Provider object
 * @returns {Object} Working hours { start, end }
 */
export const getProviderWorkingHours = (provider) => {
  // Default working hours
  const defaultHours = {
    start: "09:00",
    end: "17:00"
  }
  
  // If provider has custom hours, use them
  if (provider?.workingHours) {
    return {
      start: provider.workingHours.start || defaultHours.start,
      end: provider.workingHours.end || defaultHours.end
    }
  }
  
  return defaultHours
}

/**
 * Mark unavailable slots based on existing bookings
 * @param {Array} slots - Array of time slots
 * @param {Array} existingBookings - Array of existing bookings
 * @returns {Array} Slots with availability marked
 */
export const markUnavailableSlots = (slots, existingBookings) => {
  return slots.map(slot => ({
    ...slot,
    available: isSlotAvailable(slot.time, slot.endTime, existingBookings)
  }))
}
