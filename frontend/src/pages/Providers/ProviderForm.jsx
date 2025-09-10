// src/components/Providers/ProviderForm.jsx
import { useState, useEffect } from 'react'
import { User, Mail, Phone, MapPin, FileText, Tag, DollarSign, Clock, Camera } from 'lucide-react'

const ProviderForm = ({ 
  provider = null, 
  onSubmit, 
  onCancel, 
  isEditing = false, 
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    specialties: [],
    category: '',
    location: '',
    experience: '',
    availability: '',
    priceRange: '',
    imageUrl: ''
  })

  const [newSpecialty, setNewSpecialty] = useState('')
  const [errors, setErrors] = useState({})

  const categories = [
    'Hair & Beauty',
    'Healthcare', 
    'Fitness',
    'Wellness',
    'Education',
    'Consulting',
    'Technology',
    'Home Services',
    'Legal',
    'Finance'
  ]

  // Initialize form data when provider changes
  useEffect(() => {
    if (provider) {
      setFormData({
        firstName: provider.firstName || '',
        lastName: provider.lastName || '',
        email: provider.email || '',
        phone: provider.phone || '',
        bio: provider.bio || '',
        specialties: provider.specialties || [],
        category: provider.category || '',
        location: provider.location || '',
        experience: provider.experience?.toString() || '',
        availability: provider.availability || '',
        priceRange: provider.priceRange || '',
        imageUrl: provider.imageUrl || ''
      })
    }
  }, [provider])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const addSpecialty = () => {
    if (newSpecialty.trim() && !formData.specialties.includes(newSpecialty.trim())) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()]
      }))
      setNewSpecialty('')
    }
  }

  const removeSpecialty = (specialty) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialty)
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required'
    if (!formData.bio.trim()) newErrors.bio = 'Bio is required'
    if (formData.bio.length < 50) newErrors.bio = 'Bio must be at least 50 characters'
    if (!formData.category) newErrors.category = 'Category is required'
    if (!formData.location.trim()) newErrors.location = 'Location is required'
    if (!formData.experience) newErrors.experience = 'Experience is required'
    if (isNaN(formData.experience) || formData.experience < 0) newErrors.experience = 'Experience must be a valid number'
    if (!formData.priceRange.trim()) newErrors.priceRange = 'Price range is required'
    if (formData.specialties.length === 0) newErrors.specialties = 'At least one specialty is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const submitData = {
      ...formData,
      experience: parseInt(formData.experience),
      specialties: formData.specialties
    }

    onSubmit(submitData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            First Name *
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.firstName ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter first name"
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Last Name *
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.lastName ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter last name"
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
          )}
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="w-4 h-4 inline mr-2" />
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter email address"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4 inline mr-2" />
            Phone *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.phone ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter phone number"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>
      </div>

      {/* Location and Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-2" />
            Location *
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.location ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="City, State"
          />
          {errors.location && (
            <p className="mt-1 text-sm text-red-600">{errors.location}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Tag className="w-4 h-4 inline mr-2" />
            Category *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.category ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category}</p>
          )}
        </div>
      </div>

      {/* Experience and Price Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="w-4 h-4 inline mr-2" />
            Years of Experience *
          </label>
          <input
            type="number"
            name="experience"
            value={formData.experience}
            onChange={handleInputChange}
            min="0"
            max="50"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.experience ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Years of experience"
          />
          {errors.experience && (
            <p className="mt-1 text-sm text-red-600">{errors.experience}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="w-4 h-4 inline mr-2" />
            Price Range *
          </label>
          <input
            type="text"
            name="priceRange"
            value={formData.priceRange}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.priceRange ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="e.g., $50 - $150"
          />
          {errors.priceRange && (
            <p className="mt-1 text-sm text-red-600">{errors.priceRange}</p>
          )}
        </div>
      </div>

      {/* Profile Image URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Camera className="w-4 h-4 inline mr-2" />
          Profile Image URL (optional)
        </label>
        <input
          type="url"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="https://example.com/image.jpg"
        />
        <p className="mt-1 text-sm text-gray-500">
          Enter a URL to a professional photo of yourself
        </p>
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <FileText className="w-4 h-4 inline mr-2" />
          Professional Bio *
        </label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleInputChange}
          rows={4}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
            errors.bio ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Describe your experience, qualifications, and what makes you unique..."
        />
        <div className="flex justify-between mt-1">
          {errors.bio ? (
            <p className="text-sm text-red-600">{errors.bio}</p>
          ) : (
            <p className="text-sm text-gray-500">
              Tell potential clients about your background and expertise (minimum 50 characters)
            </p>
          )}
          <p className="text-sm text-gray-400">
            {formData.bio.length}/500
          </p>
        </div>
      </div>

      {/* Specialties */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Specialties *
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newSpecialty}
            onChange={(e) => setNewSpecialty(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Add a specialty (e.g., Hair Cutting)"
          />
          <button
            type="button"
            onClick={addSpecialty}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.specialties.map((specialty, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
            >
              {specialty}
              <button
                type="button"
                onClick={() => removeSpecialty(specialty)}
                className="ml-2 text-primary-600 hover:text-primary-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        {errors.specialties && (
          <p className="text-sm text-red-600">{errors.specialties}</p>
        )}
        <p className="text-sm text-gray-500">
          Add skills and specialties that describe your expertise
        </p>
      </div>

      {/* Availability */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Clock className="w-4 h-4 inline mr-2" />
          Availability (optional)
        </label>
        <input
          type="text"
          name="availability"
          value={formData.availability}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="e.g., Mon-Fri: 9AM-6PM, Sat: 10AM-4PM"
        />
        <p className="mt-1 text-sm text-gray-500">
          Let clients know when you're typically available
        </p>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              {isEditing ? 'Updating...' : 'Creating...'}
            </div>
          ) : (
            isEditing ? 'Update Provider' : 'Create Provider'
          )}
        </button>
        
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export default ProviderForm
