// src/pages/Reviews/LeaveReview.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Star, ArrowLeft, Send } from 'lucide-react'
import { useAuth } from '@/context/AuthContext/AuthContext'
import { bookingService } from '@/services/api'

const LeaveReview = () => {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [review, setReview] = useState('')

  useEffect(() => {
    loadBooking()
  }, [bookingId])

  const loadBooking = async () => {
    setLoading(true)
    try {
      const response = await bookingService.getBookingById(bookingId)
      if (response.success) {
        setBooking(response.data)
        
        // Check if booking is completed
        if (response.data.status !== 'completed') {
          alert('You can only review completed bookings')
          navigate('/my-bookings')
          return
        }

        // Check if already reviewed
        if (response.data.review) {
          alert('You have already reviewed this booking')
          navigate('/my-bookings')
          return
        }
      } else {
        alert('Booking not found')
        navigate('/my-bookings')
      }
    } catch (error) {
      console.error('Error loading booking:', error)
      alert('Failed to load booking')
      navigate('/my-bookings')
    }
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (rating === 0) {
      alert('Please select a rating')
      return
    }

    if (!review.trim()) {
      alert('Please write a review')
      return
    }

    if (review.trim().length < 10) {
      alert('Review must be at least 10 characters long')
      return
    }

    if (review.trim().length > 500) {
      alert('Review must not exceed 500 characters')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        bookingId: bookingId,
        serviceId: booking.service._id || booking.service,
        providerId: booking.provider._id || booking.provider,
        rating,
        review: review.trim()
      }
      
      console.log('Submitting review with payload:', payload)
      
      // Call review API endpoint
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()
      console.log('Review response:', data)

      if (data.success || response.ok) {
        alert('Review submitted successfully!')
        navigate('/my-bookings')
      } else {
        console.error('Review submission failed:', data)
        alert(data.message || 'Failed to submit review')
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Failed to submit review. Please try again.')
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!booking) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/my-bookings"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to My Bookings
        </Link>

        {/* Review Form */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Leave a Review</h1>

          {/* Booking Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">{booking.service?.title || 'Service'}</h3>
            <p className="text-sm text-gray-600">
              Provider: {booking.provider?.firstName} {booking.provider?.lastName}
            </p>
            <p className="text-sm text-gray-600">
              Date: {new Date(booking.scheduledDate).toLocaleDateString()}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating *
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-10 h-10 ${
                        star <= (hoverRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  {rating > 0 ? `${rating} out of 5 stars` : 'Select rating'}
                </span>
              </div>
            </div>

            {/* Review Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review * <span className="text-xs text-gray-500">(minimum 10 characters)</span>
              </label>
              <textarea
                required
                rows="6"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share your experience with this service... (minimum 10 characters)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                maxLength="500"
              />
              <p className={`text-xs mt-1 ${review.length < 10 ? 'text-red-500' : review.length > 500 ? 'text-red-500' : 'text-gray-500'}`}>
                {review.length}/500 characters {review.length < 10 && '(minimum 10 required)'}
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3">
              <Link
                to="/my-bookings"
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center font-medium"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting || rating === 0 || review.trim().length < 10}
                className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Review
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Tips */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Tips for writing a great review:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Write at least 10 characters (max 500)</li>
            <li>• Be specific about what you liked or didn't like</li>
            <li>• Mention the quality of service and professionalism</li>
            <li>• Be honest and constructive</li>
            <li>• Help others make informed decisions</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default LeaveReview
