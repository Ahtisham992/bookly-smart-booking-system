// src/pages/Profile/Profile.jsx - Updated for backend integration
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext/AuthContext'
import { User, Mail, Phone, Calendar, Shield, Bell, Globe, Save, Eye, EyeOff } from 'lucide-react'

const Profile = () => {
    const { user, updateUser, updatePassword } = useAuth()
    const [isEditing, setIsEditing] = useState(false)
    const [showChangePassword, setShowChangePassword] = useState(false)
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    })
    const [preferences, setPreferences] = useState({
        notifications: user?.preferences?.notifications || {
            email: true,
            sms: false,
            push: true
        },
        timezone: user?.preferences?.timezone || 'UTC',
        language: user?.preferences?.language || 'en'
    })
    const [errors, setErrors] = useState({})
    const [successMessage, setSuccessMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [passwordLoading, setPasswordLoading] = useState(false)

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        // Clear errors when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
        if (errors.submit) {
            setErrors(prev => ({ ...prev, submit: '' }))
        }
    }

    const handlePreferenceChange = (category, key, value) => {
        setPreferences(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: value
            }
        }))
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required'
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required'
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required'
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address'
        }

        return newErrors
    }

    const validatePasswordForm = () => {
        const newErrors = {}

        if (!formData.currentPassword) {
            newErrors.currentPassword = 'Current password is required'
        }

        if (!formData.newPassword) {
            newErrors.newPassword = 'New password is required'
        } else if (formData.newPassword.length < 6) {
            newErrors.newPassword = 'Password must be at least 6 characters long'
        }

        if (formData.newPassword !== formData.confirmNewPassword) {
            newErrors.confirmNewPassword = 'Passwords do not match'
        }

        return newErrors
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const newErrors = validateForm()
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        setIsLoading(true)
        setErrors({})
        setSuccessMessage('')

        try {
            // Update user data including preferences
            const updatedData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                preferences: preferences
            }

            const result = await updateUser(updatedData)

            if (result.success) {
                setIsEditing(false)
                setSuccessMessage('Profile updated successfully!')
                // Clear success message after 3 seconds
                setTimeout(() => setSuccessMessage(''), 3000)
            } else {
                setErrors({ submit: result.error })
            }

        } catch (error) {
            console.error('Profile update error:', error)
            setErrors({ submit: 'Failed to update profile. Please try again.' })
        } finally {
            setIsLoading(false)
        }
    }

    const handlePasswordUpdate = async (e) => {
        e.preventDefault()

        const newErrors = validatePasswordForm()
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        setPasswordLoading(true)
        setErrors({})

        try {
            const result = await updatePassword(formData.currentPassword, formData.newPassword)

            if (result.success) {
                setShowChangePassword(false)
                setFormData(prev => ({
                    ...prev,
                    currentPassword: '',
                    newPassword: '',
                    confirmNewPassword: ''
                }))
                setSuccessMessage('Password updated successfully!')
                setTimeout(() => setSuccessMessage(''), 3000)
            } else {
                setErrors({ password: result.error })
            }

        } catch (error) {
            console.error('Password update error:', error)
            setErrors({ password: 'Failed to update password. Please try again.' })
        } finally {
            setPasswordLoading(false)
        }
    }

    const handleCancel = () => {
        setFormData({
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            email: user?.email || '',
            phone: user?.phone || '',
            currentPassword: '',
            newPassword: '',
            confirmNewPassword: ''
        })
        setPreferences({
            notifications: user?.preferences?.notifications || {
                email: true,
                sms: false,
                push: true
            },
            timezone: user?.preferences?.timezone || 'UTC',
            language: user?.preferences?.language || 'en'
        })
        setErrors({})
        setIsEditing(false)
        setShowChangePassword(false)
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
                <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800">{successMessage}</p>
                </div>
            )}

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Personal Information */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                                >
                                    Edit Profile
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleCancel}
                                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                                        disabled={isLoading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isLoading}
                                        className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
                                    >
                                        {isLoading ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name Fields */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        First Name
                                    </label>
                                    {isEditing ? (
                                        <input
                                            name="firstName"
                                            type="text"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                                                errors.firstName ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                    ) : (
                                        <p className="text-gray-900 py-2">{user?.firstName || 'Not set'}</p>
                                    )}
                                    {errors.firstName && (
                                        <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Last Name
                                    </label>
                                    {isEditing ? (
                                        <input
                                            name="lastName"
                                            type="text"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                                                errors.lastName ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                    ) : (
                                        <p className="text-gray-900 py-2">{user?.lastName || 'Not set'}</p>
                                    )}
                                    {errors.lastName && (
                                        <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                                    )}
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
                                </label>
                                {isEditing ? (
                                    <input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                                            errors.email ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    />
                                ) : (
                                    <p className="text-gray-900 py-2">{user?.email || 'Not set'}</p>
                                )}
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number
                                </label>
                                {isEditing ? (
                                    <input
                                        name="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        placeholder="Enter phone number"
                                    />
                                ) : (
                                    <p className="text-gray-900 py-2">{user?.phone || 'Not set'}</p>
                                )}
                            </div>

                            {errors.submit && (
                                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                                    <p className="text-sm text-red-600">{errors.submit}</p>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Security Settings */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Security</h2>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900">Password</h3>
                                    <p className="text-sm text-gray-600">Change your account password</p>
                                </div>
                                <button
                                    onClick={() => setShowChangePassword(!showChangePassword)}
                                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                                >
                                    {showChangePassword ? 'Cancel' : 'Change Password'}
                                </button>
                            </div>

                            {showChangePassword && (
                                <form onSubmit={handlePasswordUpdate} className="space-y-4 pt-4 border-t">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Current Password
                                        </label>
                                        <input
                                            name="currentPassword"
                                            type="password"
                                            value={formData.currentPassword}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                                                errors.currentPassword ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.currentPassword && (
                                            <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            New Password
                                        </label>
                                        <input
                                            name="newPassword"
                                            type="password"
                                            value={formData.newPassword}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                                                errors.newPassword ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.newPassword && (
                                            <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Confirm New Password
                                        </label>
                                        <input
                                            name="confirmNewPassword"
                                            type="password"
                                            value={formData.confirmNewPassword}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                                                errors.confirmNewPassword ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.confirmNewPassword && (
                                            <p className="mt-1 text-sm text-red-600">{errors.confirmNewPassword}</p>
                                        )}
                                    </div>

                                    {errors.password && (
                                        <div className="bg-red-50 border border-red-200 rounded-md p-4">
                                            <p className="text-sm text-red-600">{errors.password}</p>
                                        </div>
                                    )}

                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={passwordLoading}
                                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                                        >
                                            {passwordLoading ? 'Updating...' : 'Update Password'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Preferences */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Preferences</h2>

                        {/* Notifications */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                            <div className="flex flex-col gap-2">
                                {['email', 'sms', 'push'].map((type) => (
                                    <label key={type} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={preferences.notifications[type]}
                                            onChange={(e) =>
                                                handlePreferenceChange('notifications', type, e.target.checked)
                                            }
                                            className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                                            disabled={!isEditing}
                                        />
                                        <span className="text-sm text-gray-700 capitalize">{type} notifications</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Timezone */}
                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                            <select
                                value={preferences.timezone}
                                onChange={(e) => setPreferences((prev) => ({ ...prev, timezone: e.target.value }))}
                                disabled={!isEditing}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                            >
                                <option value="UTC">UTC</option>
                                <option value="EST">EST (Eastern)</option>
                                <option value="PST">PST (Pacific)</option>
                                <option value="PKT">PKT (Pakistan)</option>
                                <option value="GMT">GMT (Greenwich)</option>
                                <option value="CET">CET (Central European)</option>
                            </select>
                        </div>

                        {/* Language */}
                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                            <select
                                value={preferences.language}
                                onChange={(e) => setPreferences((prev) => ({ ...prev, language: e.target.value }))}
                                disabled={!isEditing}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                            >
                                <option value="en">English</option>
                                <option value="es">Spanish</option>
                                <option value="fr">French</option>
                                <option value="ur">Urdu</option>
                                <option value="ar">Arabic</option>
                                <option value="de">German</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-full bg-primary-600 flex items-center justify-center">
                                <span className="text-white font-medium text-xl">
                                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {user?.firstName} {user?.lastName}
                                </h3>
                                <p className="text-sm text-gray-600">{user?.email}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full capitalize">
                                        {user?.role || 'user'} Account
                                    </span>
                                    {user?.isVerified ? (
                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                            ✓ Verified
                                        </span>
                                    ) : (
                                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                            ⚠ Unverified
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-sm font-medium text-gray-900 mb-4">Account Overview</h3>
                        <ul className="space-y-2 text-sm text-gray-700">
                            <li className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gray-500" />
                                <span className="truncate">{user?.email}</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-gray-500" />
                                {user?.phone || 'No phone set'}
                            </li>
                            <li className="flex items-center gap-2">
                                <Globe className="h-4 w-4 text-gray-500" />
                                Timezone: {preferences.timezone}
                            </li>
                            <li className="flex items-center gap-2">
                                <Bell className="h-4 w-4 text-gray-500" />
                                Notifications: {Object.keys(preferences.notifications)
                                    .filter((k) => preferences.notifications[k])
                                    .join(', ') || 'None'}
                            </li>
                        </ul>
                    </div>

                    {/* Account Info */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-sm font-medium text-gray-900 mb-4">Account Info</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Member since:</span>
                                <span className="text-gray-900">
                                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Account type:</span>
                                <span className="text-gray-900 capitalize">{user?.role || 'User'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Status:</span>
                                <span className={user?.isVerified ? 'text-green-600' : 'text-yellow-600'}>
                                    {user?.isVerified ? 'Verified' : 'Pending Verification'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Last updated:</span>
                                <span className="text-gray-900">
                                    {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Never'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Security Tips */}
                    <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                        <h3 className="text-sm font-medium text-blue-900 mb-3 flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Security Tips
                        </h3>
                        <ul className="space-y-2 text-sm text-blue-800">
                            <li>• Use a strong, unique password</li>
                            <li>• Keep your email address current</li>
                            <li>• Review your account regularly</li>
                            <li>• Enable notifications for security</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile