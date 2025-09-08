// src/pages/Services/Services.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Filter, Grid3X3, List } from 'lucide-react'
import { useAuth } from '../../context/AuthContext/AuthContext'
import { useServices } from '@/context/ServicesContext/ServicesContext'
import ServiceCard from '../../components/services/ServiceCard'

const Services = () => {
  const { user } = useAuth()
  const { services, getActiveServices, getCategories, searchServices } = useServices()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [filteredServices, setFilteredServices] = useState([])

  const canAddService = user && (user.role === 'admin' || user.role === 'provider')
  const categories = getCategories()

  // Filter services based on search and category
  useEffect(() => {
    let result = getActiveServices()

    if (searchTerm) {
      result = searchServices(searchTerm)
    }

    if (selectedCategory) {
      result = result.filter(service => service.category === selectedCategory)
    }

    setFilteredServices(result)
  }, [services, searchTerm, selectedCategory, getActiveServices, searchServices])

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleCategoryFilter = (category) => {
    setSelectedCategory(selectedCategory === category ? '' : category)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Services</h1>
            <p className="text-gray-600 mt-1">
              Discover and book from our wide range of services
            </p>
          </div>

          {canAddService && (
            <Link
              to="/services/add"
              className="mt-4 sm:mt-0 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Link>
          )}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 w-5 h-5" />
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
                {(searchTerm || selectedCategory) && (
                  <button
                    onClick={clearFilters}
                    className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear filters
                  </button>
                )}
              </div>
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
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredServices.length === 0 ? (
              'No services found'
            ) : (
              `${filteredServices.length} service${filteredServices.length === 1 ? '' : 's'} found`
            )}
            {(searchTerm || selectedCategory) && (
              <span className="ml-2 text-sm">
                {searchTerm && `matching "${searchTerm}"`}
                {searchTerm && selectedCategory && ' in '}
                {selectedCategory && `"${selectedCategory}"`}
              </span>
            )}
          </p>
        </div>

        {/* Services Grid/List */}
        {filteredServices.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedCategory
                ? 'Try adjusting your search or filter criteria'
                : 'No services are currently available'
              }
            </p>
            {(searchTerm || selectedCategory) && (
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
            {filteredServices.map(service => (
              <div
                key={service.id}
                className={viewMode === 'list' ? 'bg-white rounded-lg shadow-sm' : ''}
              >
                <ServiceCard service={service} viewMode={viewMode} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Services