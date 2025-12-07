// src/context/BookingContext/BookingContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { bookingService } from '@/services/api'
import { useAuth } from '@/context/AuthContext/AuthContext'

const BookingContext = createContext(null)

export const useBooking = () => {
  const context = useContext(BookingContext)
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider')
  }
  return context
}

export const BookingProvider = ({ children }) => {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch bookings when user changes
  useEffect(() => {
    if (user) {
      fetchUserBookings()
    } else {
      setBookings([])
    }
  }, [user])

  const fetchUserBookings = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Admin doesn't have bookings in this context
      if (user?.role === 'admin') {
        setBookings([])
        return { success: true, data: [] }
      }
      
      const response = user?.role === 'provider' 
        ? await bookingService.getProviderBookings()
        : await bookingService.getCustomerBookings()
      
      if (response.success) {
        setBookings(response.data || [])
        return { success: true, data: response.data || [] }
      } else {
        setError(response.error || 'Failed to fetch bookings')
        return { success: false, error: response.error || 'Failed to fetch bookings' }
      }
    } catch (err) {
      console.error('Fetch bookings error:', err)
      setError('Failed to fetch bookings')
      return { success: false, error: 'Failed to fetch bookings' }
    } finally {
      setLoading(false)
    }
  }

  const bookService = async (bookingData) => {
    try {
      setLoading(true)
      setError(null)

      const response = await bookingService.createBooking(bookingData)

      if (response.success) {
        // Refresh bookings list
        await fetchUserBookings()
        return { success: true, booking: response.data }
      } else {
        setError(response.error)
        return { success: false, error: response.error }
      }
    } catch (err) {
      const errorMessage = 'Failed to book service'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const getUserBookings = async (userId) => {
    // Just call fetchUserBookings which now returns the result
    return await fetchUserBookings()
  }

  const cancelBooking = async (bookingId, reason = '') => {
    try {
      setLoading(true)
      setError(null)

      const response = await bookingService.cancelBooking(bookingId, reason)

      if (response.success) {
        // Refresh bookings list
        await fetchUserBookings()
        return { success: true }
      } else {
        setError(response.error)
        return { success: false, error: response.error }
      }
    } catch (err) {
      const errorMessage = 'Failed to cancel booking'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId, status, notes = '') => {
    try {
      setLoading(true)
      setError(null)

      const response = await bookingService.updateBookingStatus(bookingId, status, notes)

      if (response.success) {
        // Refresh bookings list
        await fetchUserBookings()
        return { success: true }
      } else {
        setError(response.error)
        return { success: false, error: response.error }
      }
    } catch (err) {
      const errorMessage = 'Failed to update booking'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const getBookingById = (bookingId) => {
    return bookings.find(booking => booking._id === bookingId || booking.id === bookingId)
  }

  const getBookingsByStatus = (status) => {
    return bookings.filter(booking => booking.status === status)
  }

  const getUpcomingBookings = () => {
    const today = new Date()
    const filtered = bookings.filter(booking => {
      const bookingDate = new Date(booking.scheduledDate)
      return bookingDate >= today && !['cancelled', 'completed'].includes(booking.status)
    })
    
    return filtered.sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate))
  }

  const getPastBookings = () => {
    const today = new Date()
    const filtered = bookings.filter(booking => {
      const bookingDate = new Date(booking.scheduledDate)
      return bookingDate < today || ['completed', 'cancelled'].includes(booking.status)
    })
    
    return filtered.sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate))
  }

  const clearError = () => {
    setError(null)
  }

  const value = {
    bookings,
    loading,
    error,
    fetchUserBookings,
    bookService,
    getUserBookings,
    cancelBooking,
    updateBookingStatus,
    getBookingById,
    getBookingsByStatus,
    getUpcomingBookings,
    getPastBookings,
    clearError
  }

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  )
}