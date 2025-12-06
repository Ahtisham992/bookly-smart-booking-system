// src/pages/Providers/ProviderSettings.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Save, User, MapPin, Briefcase, Star, Mail, Phone, FileText, Award } from 'lucide-react'
import { useAuth } from '@/context/AuthContext/AuthContext'

const ProviderSettings = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    specialties: [],
    location: '',
    experience: '',
    category: '',
    availability: '',
    priceRange: ''
  })

  const [newSpecialty, setNewSpecialty] = useState('')

  useEffect(() => {
    if (!user || user.role !== 'provider') {
      navigate('/')
      return
    }

    // Load user data
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      bio: user.providerInfo?.bio || user.bio || '',
      specialties: user.providerInfo?.specialties || user.specialties || [],
      location: user.providerInfo?.location || user.location || '',
      experience: user.providerInfo?.experience || user.experience || '',
      category: user.providerInfo?.category || user.category || '',
      availability: user.providerInfo?.availability || user.availability || '',
      priceRange: user.providerInfo?.priceRange || user.priceRange || ''
    })

    // Set image preview if exists - check all possible locations
    const existingImage = user.profileImage || user.imageUrl || user.providerInfo?.profileImage
    if (existingImage) {
      setImagePreview(existingImage)
    }
  }, [user, navigate])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Image size should be less than 5MB')
        return
      }

      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddSpecialty = () => {
    if (newSpecialty.trim() && !formData.specialties.includes(newSpecialty.trim())) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()]
      }))
      setNewSpecialty('')
    }
  }

  const handleRemoveSpecialty = (specialty) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialty)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Use the preview URL (base64 or existing URL)
      // Limit base64 size to prevent database issues
      let profileImageUrl = imagePreview
      
      // If it's a base64 image and too large, warn user
      if (profileImageUrl && profileImageUrl.startsWith('data:image') && profileImageUrl.length > 100000) {
        console.warn('Image is large (base64):', profileImageUrl.length, 'characters')
        // Still try to save it, but user should know
      }

      console.log('Submitting profile update with image length:', profileImageUrl?.length || 0)

      // Update profile
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          profileImage: profileImageUrl,
          providerInfo: {
            bio: formData.bio,
            specialties: formData.specialties,
            location: formData.location,
            experience: parseInt(formData.experience) || 0,
            category: formData.category,
            availability: formData.availability,
            priceRange: formData.priceRange
          }
        })
      })

      console.log('Profile update response status:', response.status)
      const data = await response.json()
      console.log('Profile update response data:', data)
      
      // Log the returned user to see if image was saved
      if (data.data) {
        console.log('Updated user profileImage length:', data.data.profileImage?.length || 0)
      }

      if (data.success || response.ok) {
        alert('Profile updated successfully!')
        // Force reload to get fresh user data from server
        // This ensures the auth context gets the updated user with new image
        setTimeout(() => {
          window.location.reload()
        }, 500)
      } else {
        alert(data.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile. Please try again.')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your professional profile and settings</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Main Content - 2 Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Profile */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Header Card */}
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {/* Cover Image */}
                <div className="h-32 bg-gradient-to-r from-primary-600 to-primary-700"></div>
                
                <div className="px-6 pb-6">
                  {/* Profile Image */}
                  <div className="relative -mt-16 mb-4">
                    <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-3xl">
                          {formData.firstName?.[0]}{formData.lastName?.[0]}
                        </div>
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700 transition-colors shadow-lg">
                      <Camera className="w-5 h-5" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Name Preview */}
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {formData.firstName} {formData.lastName}
                    </h2>
                    <p className="text-lg text-primary-600 font-medium">
                      {formData.category || 'Select Category'}
                    </p>
                  </div>

                  {/* Quick Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-xl font-bold text-gray-900">{formData.experience || 0}+</div>
                      <span className="text-sm text-gray-600">years exp</span>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-xl font-bold text-gray-900">{formData.specialties?.length || 0}</div>
                      <span className="text-sm text-gray-600">specialties</span>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                      <span className="text-sm text-gray-600">{formData.location || 'Location'}</span>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-xl font-bold text-gray-900">{formData.priceRange || 'N/A'}</div>
                      <span className="text-sm text-gray-600">price range</span>
                    </div>
                  </div>
                </div>
              </div>

          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Phone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Briefcase className="w-5 h-5 mr-2" />
              Professional Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select Category</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Technology">Technology</option>
                  <option value="Beauty & Wellness">Beauty & Wellness</option>
                  <option value="Home Services">Home Services</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Star className="w-4 h-4 inline mr-1" />
                    Years of Experience *
                  </label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    min="0"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range
                  </label>
                  <input
                    type="text"
                    name="priceRange"
                    value={formData.priceRange}
                    onChange={handleChange}
                    placeholder="e.g., $50 - $200"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="City, State"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Availability
                </label>
                <input
                  type="text"
                  name="availability"
                  value={formData.availability}
                  onChange={handleChange}
                  placeholder="e.g., Mon-Fri 9AM-5PM"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          {/* About & Bio */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              About You
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio / Description *
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="6"
                required
                placeholder="Tell customers about yourself, your experience, and what makes you unique..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                maxLength="1000"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.bio.length}/1000 characters
              </p>
            </div>
          </div>

          {/* Specialties */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Specialties
            </h2>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSpecialty())}
                  placeholder="Add a specialty (e.g., Pediatrics, Web Design)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <button
                  type="button"
                  onClick={handleAddSpecialty}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Add
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {formData.specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium flex items-center gap-2"
                  >
                    {specialty}
                    <button
                      type="button"
                      onClick={() => handleRemoveSpecialty(specialty)}
                      className="text-primary-600 hover:text-primary-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              
              {formData.specialties.length === 0 && (
                <p className="text-sm text-gray-500 italic">
                  No specialties added yet. Add your areas of expertise.
                </p>
              )}
            </div>
          </div>

            </div>
            {/* End Left Column */}

            {/* Right Column - Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Profile Preview Card */}
              <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Preview</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium text-green-600">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium text-gray-900">{formData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium text-gray-900">{formData.phone || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium text-gray-900">{formData.location || 'Not set'}</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Profile Completion</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium text-gray-900">
                        {Math.round(
                          ((formData.firstName ? 1 : 0) +
                          (formData.lastName ? 1 : 0) +
                          (formData.phone ? 1 : 0) +
                          (formData.bio ? 1 : 0) +
                          (formData.category ? 1 : 0) +
                          (formData.location ? 1 : 0) +
                          (formData.experience ? 1 : 0) +
                          (formData.specialties?.length > 0 ? 1 : 0)) / 8 * 100
                        )}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.round(
                            ((formData.firstName ? 1 : 0) +
                            (formData.lastName ? 1 : 0) +
                            (formData.phone ? 1 : 0) +
                            (formData.bio ? 1 : 0) +
                            (formData.category ? 1 : 0) +
                            (formData.location ? 1 : 0) +
                            (formData.experience ? 1 : 0) +
                            (formData.specialties?.length > 0 ? 1 : 0)) / 8 * 100
                          )}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 text-xs text-gray-500 text-center">
                  Complete your profile to attract more customers
                </div>
              </div>

              {/* Quick Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Profile Tips</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Use a professional photo</li>
                  <li>• Write a detailed bio</li>
                  <li>• Add your specialties</li>
                  <li>• Keep info up to date</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Buttons - Full Width */}
          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProviderSettings
