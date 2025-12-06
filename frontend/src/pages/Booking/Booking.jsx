// src/pages/Booking/Booking.jsx
import { useState, useEffect } from 'react'
import { Calendar, Clock, User, Briefcase, MapPin, AlertCircle, CheckCircle, XCircle, Trash2, Plus } from 'lucide-react'
import { useAuth } from '../../context/AuthContext/AuthContext'
import { useServices } from '../../context/ServicesContext/ServicesContext'
import { useProviders } from '../../context/ProvidersContext/ProvidersContext'
import { useBooking } from '../../context/BookingContext/BookingContext'
import { Link } from 'react-router-dom'   // ✅ Add this import


const Booking = () => {
    const { user } = useAuth()
    const { services, getActiveServices } = useServices()
    const { providers, getActiveProviders } = useProviders()
    const {
        bookService,
        getUserBookings,
        cancelBooking,
        getUpcomingBookings,
        getPastBookings,
        loading,
        error,
        clearError
    } = useBooking()


    // ✅ Restrict booking access for providers/admins
    if (user?.role === 'provider' || user?.role === 'admin') {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            Booking Not Available
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Providers and admins cannot make bookings. Please switch to a customer account.
                        </p>
                        <Link
                            to="/provider-dashboard"
                            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                        >
                            Go to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        )
    }


    // Form state
    const [formData, setFormData] = useState({
        serviceId: '',
        providerId: '',
        date: '',
        time: '',
        notes: ''
    })
    const [formLoading, setFormLoading] = useState(false)
    const [formError, setFormError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    // Bookings state
    const [userBookings, setUserBookings] = useState([])
    const [activeTab, setActiveTab] = useState('upcoming') // upcoming, past, all
    const [filteredBookings, setFilteredBookings] = useState([])

    // Available providers based on selected service
    const [availableProviders, setAvailableProviders] = useState([])

    const activeServices = getActiveServices()
    const allProviders = getActiveProviders()

    // Load user bookings on component mount
    useEffect(() => {
        if (user?.id) {
            loadUserBookings()
        }
    }, [user?.id])

    // Filter bookings based on active tab
    useEffect(() => {
        if (user?.id) {
            switch (activeTab) {
                case 'upcoming':
                    setFilteredBookings(getUpcomingBookings(user.id))
                    break
                case 'past':
                    setFilteredBookings(getPastBookings(user.id))
                    break
                default:
                    setFilteredBookings(userBookings)
            }
        }
    }, [activeTab, userBookings, user?.id, getUpcomingBookings, getPastBookings])

    // Update available providers when service is selected
    useEffect(() => {
        if (formData.serviceId) {
            // In a real app, you'd filter providers by service
            // For now, we'll show all providers
            setAvailableProviders(allProviders)
        } else {
            setAvailableProviders([])
        }
    }, [formData.serviceId, allProviders])

    const loadUserBookings = async () => {
        if (!user?.id) return

        const result = await getUserBookings(user.id)
        if (result.success) {
            setUserBookings(result.bookings)
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))

        // Clear errors when user starts typing
        if (formError) setFormError('')
        if (error) clearError()
    }

    const validateForm = () => {
        if (!formData.serviceId) return 'Please select a service'
        if (!formData.providerId) return 'Please select a provider'
        if (!formData.date) return 'Please select a date'
        if (!formData.time) return 'Please select a time'

        // Validate date is not in the past
        const selectedDate = new Date(formData.date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        if (selectedDate < today) {
            return 'Please select a future date'
        }

        return null
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const validationError = validateForm()
        if (validationError) {
            setFormError(validationError)
            return
        }

        setFormLoading(true)
        setFormError('')

        try {
            const selectedService = activeServices.find(s => s.id === formData.serviceId)
            const selectedProvider = availableProviders.find(p => p.id === formData.providerId)

            if (!selectedService || !selectedProvider) {
                throw new Error('Selected service or provider not found')
            }

            const result = await bookService(
                formData.serviceId,
                formData.providerId,
                formData.date,
                formData.time,
                user.id,
                selectedService.title,
                `${selectedProvider.firstName} ${selectedProvider.lastName}`,
                selectedService.price,
                selectedService.duration,
                formData.notes
            )

            if (result.success) {
                setSuccessMessage('Booking created successfully!')
                setFormData({
                    serviceId: '',
                    providerId: '',
                    date: '',
                    time: '',
                    notes: ''
                })
                await loadUserBookings()

                // Clear success message after 3 seconds
                setTimeout(() => setSuccessMessage(''), 3000)
            } else {
                setFormError(result.error || 'Failed to create booking')
            }
        } catch (err) {
            setFormError(err.message || 'An unexpected error occurred')
        } finally {
            setFormLoading(false)
        }
    }

    const handleCancelBooking = async (bookingId) => {
        if (!confirm('Are you sure you want to cancel this booking?')) return

        const result = await cancelBooking(bookingId)
        if (result.success) {
            await loadUserBookings()
            setSuccessMessage('Booking cancelled successfully')
            setTimeout(() => setSuccessMessage(''), 3000)
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-100 text-green-800'
            case 'pending':
                return 'bg-yellow-100 text-yellow-800'
            case 'cancelled':
                return 'bg-red-100 text-red-800'
            case 'completed':
                return 'bg-blue-100 text-blue-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'confirmed':
                return <CheckCircle className="w-4 h-4" />
            case 'pending':
                return <Clock className="w-4 h-4" />
            case 'cancelled':
                return <XCircle className="w-4 h-4" />
            default:
                return <Clock className="w-4 h-4" />
        }
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const formatTime = (timeString) => {
        const [hours, minutes] = timeString.split(':')
        const time = new Date()
        time.setHours(parseInt(hours), parseInt(minutes))
        return time.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        })
    }

    // Generate time slots (9 AM to 6 PM, 30-minute intervals)
    const generateTimeSlots = () => {
        const slots = []
        for (let hour = 9; hour < 18; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
                const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                })
                slots.push({ value: timeString, label: displayTime })
            }
        }
        return slots
    }

    const timeSlots = generateTimeSlots()

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            Please log in to book services
                        </h2>
                        <p className="text-gray-600 mb-4">
                            You need to be logged in to book appointments with our service providers.
                        </p>
                        <a
                            href="/login"
                            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                        >
                            Login to Continue
                        </a>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Book a Service</h1>
                    <p className="text-gray-600 mt-1">
                        Schedule an appointment with our verified service providers
                    </p>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                            <p className="text-green-800 font-medium">{successMessage}</p>
                        </div>
                    </div>
                )}

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Booking Form */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center mb-6">
                            <Plus className="w-5 h-5 text-primary-600 mr-2" />
                            <h2 className="text-xl font-semibold text-gray-900">New Booking</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Service Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Briefcase className="w-4 h-4 inline mr-1" />
                                    Select Service *
                                </label>
                                <select
                                    name="serviceId"
                                    value={formData.serviceId}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    required
                                >
                                    <option value="">Choose a service...</option>
                                    {activeServices.map(service => (
                                        <option key={service.id} value={service.id}>
                                            {service.title} - ${service.price} ({service.duration} min)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Provider Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <User className="w-4 h-4 inline mr-1" />
                                    Select Provider *
                                </label>
                                <select
                                    name="providerId"
                                    value={formData.providerId}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    required
                                    disabled={!formData.serviceId}
                                >
                                    <option value="">
                                        {formData.serviceId ? 'Choose a provider...' : 'Select a service first'}
                                    </option>
                                    {availableProviders.map(provider => (
                                        <option key={provider.id} value={provider.id}>
                                            {provider.firstName} {provider.lastName} - {provider.location}
                                            {provider.verified && ' ✓'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Date Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Calendar className="w-4 h-4 inline mr-1" />
                                    Select Date *
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleInputChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    required
                                />
                            </div>

                            {/* Time Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Clock className="w-4 h-4 inline mr-1" />
                                    Select Time *
                                </label>
                                <select
                                    name="time"
                                    value={formData.time}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    required
                                >
                                    <option value="">Choose a time...</option>
                                    {timeSlots.map(slot => (
                                        <option key={slot.value} value={slot.value}>
                                            {slot.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Additional Notes (Optional)
                                </label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    rows="3"
                                    placeholder="Any special requests or additional information..."
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>

                            {/* Error Message */}
                            {(formError || error) && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-center">
                                        <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                                        <p className="text-red-800">{formError || error}</p>
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={formLoading || loading}
                                className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {formLoading || loading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Creating Booking...
                                    </div>
                                ) : (
                                    'Book Service'
                                )}
                            </button>
                        </form>
                    </div>

                    {/* My Bookings */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">My Bookings</h2>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-200 mb-6">
                            <button
                                onClick={() => setActiveTab('upcoming')}
                                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'upcoming'
                                        ? 'border-primary-500 text-primary-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Upcoming
                            </button>
                            <button
                                onClick={() => setActiveTab('past')}
                                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'past'
                                        ? 'border-primary-500 text-primary-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Past
                            </button>
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'all'
                                        ? 'border-primary-500 text-primary-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                All
                            </button>
                        </div>

                        {/* Bookings List */}
                        <div className="space-y-4">
                            {filteredBookings.length === 0 ? (
                                <div className="text-center py-8">
                                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        No bookings found
                                    </h3>
                                    <p className="text-gray-600">
                                        {activeTab === 'upcoming'
                                            ? 'You have no upcoming appointments'
                                            : activeTab === 'past'
                                                ? 'You have no past appointments'
                                                : 'You have no bookings yet'
                                        }
                                    </p>
                                </div>
                            ) : (
                                filteredBookings.map(booking => (
                                    <div
                                        key={booking.id}
                                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="font-semibold text-gray-900 mb-1">
                                                    {booking.serviceName}
                                                </h3>
                                                <p className="text-sm text-gray-600 mb-1">
                                                    with {booking.providerName}
                                                </p>
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <Calendar className="w-4 h-4 mr-1" />
                                                    {formatDate(booking.date)} at {formatTime(booking.time)}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getStatusColor(booking.status)}`}>
                                                    {getStatusIcon(booking.status)}
                                                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                <span>${booking.price}</span>
                                                <span>{booking.duration} min</span>
                                            </div>

                                            {booking.status === 'pending' || booking.status === 'confirmed' ? (
                                                <button
                                                    onClick={() => handleCancelBooking(booking.id)}
                                                    className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1 transition-colors"
                                                    disabled={loading}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Cancel
                                                </button>
                                            ) : null}
                                        </div>

                                        {booking.notes && (
                                            <div className="mt-3 pt-3 border-t border-gray-100">
                                                <p className="text-sm text-gray-600">
                                                    <strong>Notes:</strong> {booking.notes}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Booking