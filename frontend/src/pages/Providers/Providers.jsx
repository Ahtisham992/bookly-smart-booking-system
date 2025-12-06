// src/pages/Providers/Providers.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Filter, Grid3X3, List, Star, CheckCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext/AuthContext'
import { useProviders } from '@/context/ProvidersContext/ProvidersContext'
import ProviderCard from '../../components/providers/ProviderCard'

const Providers = () => {
  const { user } = useAuth()
  const { providers, getActiveProviders, getCategories, searchProviders } = useProviders()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [sortBy, setSortBy] = useState('rating') // rating, experience, name
  const [viewMode, setViewMode] = useState('grid')
  const [filteredProviders, setFilteredProviders] = useState([])

  const canAddProvider = user && (user.role === 'admin')
  const categories = getCategories()

  // Filter and sort providers based on search, category, and other filters
  useEffect(() => {
    let result = getActiveProviders()

    if (searchTerm) {
      result = searchProviders(searchTerm)
    }

    if (selectedCategory) {
      result = result.filter(provider => provider.category === selectedCategory)
    }

    if (verifiedOnly) {
      result = result.filter(provider => provider.verified)
    }

    // Sort providers
    result = result.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating
        case 'experience':
          return b.experience - a.experience
        case 'name':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
        case 'reviews':
          return b.reviewCount - a.reviewCount
        default:
          return 0
      }
    })

    setFilteredProviders(result)
  }, [providers, searchTerm, selectedCategory, verifiedOnly, sortBy, getActiveProviders, searchProviders])

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleCategoryFilter = (category) => {
    setSelectedCategory(selectedCategory === category ? '' : category)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setVerifiedOnly(false)
    setSortBy('rating')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Service Providers</h1>
            <p className="text-gray-600 mt-1">
              Find and connect with verified professionals in your area
            </p>
          </div>

          {canAddProvider && (
            <Link
              to="/providers/add"
              className="mt-4 sm:mt-0 bg-primary-600 text-black px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Provider
            </Link>
          )}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search providers by name, specialty, or location..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="rating">Rating</option>
                <option value="experience">Experience</option>
                <option value="reviews">Reviews</option>
                <option value="name">Name</option>
              </select>
            </div>

            {/* View Toggle */}
            <div className="flex items-center border border-gray-200 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-4">
            <Filter className="text-gray-400 w-5 h-5" />
            
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => handleCategoryFilter(category)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary-100 text-primary-700 border border-primary-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Verified Only Filter */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-600">Verified only</span>
            </label>

            {/* Clear Filters */}
            {(searchTerm || selectedCategory || verifiedOnly || sortBy !== 'rating') && (
              <button
                onClick={clearFilters}
                className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredProviders.length === 0 ? (
              'No providers found'
            ) : (
              `${filteredProviders.length} provider${filteredProviders.length === 1 ? '' : 's'} found`
            )}
            {(searchTerm || selectedCategory || verifiedOnly) && (
              <span className="ml-2 text-sm">
                {searchTerm && `matching "${searchTerm}"`}
                {searchTerm && selectedCategory && ' in '}
                {selectedCategory && `"${selectedCategory}"`}
                {verifiedOnly && ' (verified only)'}
              </span>
            )}
          </p>
        </div>

        {/* Providers Grid/List */}
        {filteredProviders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No providers found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedCategory || verifiedOnly
                ? 'Try adjusting your search or filter criteria'
                : 'No providers are currently available'
              }
            </p>
            {(searchTerm || selectedCategory || verifiedOnly) && (
              <button
                onClick={clearFilters}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }
          >
            {filteredProviders.map(provider => (
              <div
                key={provider.id}
                className={viewMode === 'list' ? 'bg-white rounded-lg shadow-sm' : ''}
              >
                <ProviderCard provider={provider} viewMode={viewMode} />
              </div>
            ))}
          </div>
        )}

        {/* Top Providers Section */}
        {filteredProviders.length === providers.length && (
          <div className="mt-12 bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <h2 className="text-xl font-bold text-gray-900">Top Rated Providers</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProviders
                .filter(p => p.verified && p.rating >= 4.7)
                .slice(0, 6)
                .map(provider => (
                  <div key={provider.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold">
                      {provider.firstName[0]}{provider.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {provider.firstName} {provider.lastName}
                      </p>
                      <p className="text-sm text-gray-600 truncate">{provider.category}</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{provider.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Providers