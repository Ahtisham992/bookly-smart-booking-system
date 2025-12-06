// src/components/providers/ProviderCard.jsx
import { Link } from 'react-router-dom'
import { Star, MapPin, Clock, CheckCircle } from 'lucide-react'

const ProviderCard = ({ provider, viewMode = 'grid' }) => {
  const isGridView = viewMode === 'grid'

  const cardClasses = isGridView
    ? 'bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow overflow-hidden'
    : 'flex bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow overflow-hidden p-4'

  const imageClasses = isGridView
    ? 'w-full h-48 object-cover'
    : 'w-24 h-24 rounded-lg object-cover flex-shrink-0'

  const contentClasses = isGridView
    ? 'p-4'
    : 'flex-1 ml-4'

  // Get data from multiple possible sources (direct or nested in providerInfo)
  const imageUrl = provider.profileImage || provider.imageUrl || provider.providerInfo?.profileImage
  const category = provider.category || provider.providerInfo?.category || 'Uncategorized'
  const rating = provider.rating || provider.providerInfo?.rating || 0
  const reviewCount = provider.reviewCount || provider.providerInfo?.reviewCount || 0
  const location = provider.location || provider.providerInfo?.location || 'Location not set'
  const experience = provider.experience || provider.providerInfo?.experience || 0
  const bio = provider.bio || provider.providerInfo?.bio || 'No bio available'
  const specialties = provider.specialties || provider.providerInfo?.specialties || []
  const priceRange = provider.priceRange || provider.providerInfo?.priceRange || 'Contact for pricing'
  const verified = provider.verified || provider.providerInfo?.verified || false

  return (
    <div className={cardClasses}>
      {/* Provider Image */}
      <div className={isGridView ? '' : 'flex-shrink-0'}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${provider.firstName} ${provider.lastName}`}
            className={imageClasses}
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextElementSibling.style.display = 'flex'
            }}
          />
        ) : null}
        <div 
          className={`${imageClasses} bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-xl ${
            imageUrl ? 'hidden' : ''
          }`}
        >
          {provider.firstName?.[0]}{provider.lastName?.[0]}
        </div>
      </div>

      {/* Content */}
      <div className={contentClasses}>
        <div className={isGridView ? '' : 'flex justify-between items-start'}>
          <div className="flex-1">
            {/* Provider Name and Verification */}
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 text-lg">
                {provider.firstName} {provider.lastName}
              </h3>
              {verified && (
                <CheckCircle className="w-5 h-5 text-green-500" title="Verified Provider" />
              )}
            </div>

            {/* Category */}
            <p className="text-primary-600 font-medium text-sm mb-2">
              {category}
            </p>

            {/* Rating and Reviews */}
            <div className="flex items-center gap-1 mb-2">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="font-medium text-gray-900">{rating.toFixed(1)}</span>
              <span className="text-gray-500 text-sm">({reviewCount} reviews)</span>
            </div>

            {/* Location and Experience */}
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{location}</span>
              </div>
              {experience > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{experience}+ years</span>
                </div>
              )}
            </div>

            {/* Bio (truncated) */}
            {bio && (
              <p className={`text-gray-600 text-sm ${isGridView ? 'line-clamp-2' : 'line-clamp-1'} mb-3`}>
                {bio}
              </p>
            )}

            {/* Specialties */}
            {specialties.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {specialties.slice(0, isGridView ? 3 : 2).map((specialty, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                  >
                    {specialty}
                  </span>
                ))}
                {specialties.length > (isGridView ? 3 : 2) && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{specialties.length - (isGridView ? 3 : 2)} more
                  </span>
                )}
              </div>
            )}

            {/* Price Range */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">
                {priceRange}
              </span>
              {!isGridView && (
                <Link
                  to={`/providers/${provider.id}`}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                >
                  View Profile
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Grid view action button */}
        {isGridView && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <Link
              to={`/providers/${provider.id}`}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors text-center block"
            >
              View Profile
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProviderCard