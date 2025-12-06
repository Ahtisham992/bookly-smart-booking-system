// src/components/layout/Header/Header.jsx (Updated with Provider Dashboard)
import { Link, useNavigate } from 'react-router-dom'
import { Calendar, Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../../context/AuthContext/AuthContext'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsUserMenuOpen(false)
  }

  const isProvider = user?.role === 'provider' // ✅ check role

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Calendar className="h-8 w-8 text-primary-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">
              Smart Booking
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-600 hover:text-gray-900 transition-colors">
              Home
            </Link>
            <Link to="/services" className="text-gray-600 hover:text-gray-900 transition-colors">
              Services
            </Link>
            <Link to="/providers" className="text-gray-600 hover:text-gray-900 transition-colors">
              Providers
            </Link>
            <Link to="/booking" className="text-gray-600 hover:text-gray-900 transition-colors">
              Book Now
            </Link>
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </span>
                  </div>
                  <span className="text-gray-700">{user.firstName}</span>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <Link
                        to={isProvider ? "/provider-dashboard" : "/dashboard"}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        {isProvider ? "Provider Dashboard" : "User Dashboard"}
                      </Link>
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t py-4">
            <nav className="flex flex-col space-y-2">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="py-2 text-gray-600 hover:text-gray-900">Home</Link>
              <Link to="/services" onClick={() => setIsMenuOpen(false)} className="py-2 text-gray-600 hover:text-gray-900">Services</Link>
              <Link to="/providers" onClick={() => setIsMenuOpen(false)} className="py-2 text-gray-600 hover:text-gray-900">Providers</Link>
              <Link to="/booking" onClick={() => setIsMenuOpen(false)} className="py-2 text-gray-600 hover:text-gray-900">Book Now</Link>

              <div className="border-t pt-4 flex flex-col space-y-2">
                {user ? (
                  <>
                    <div className="py-2">
                      <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <Link 
                      to={isProvider ? "/provider-dashboard" : "/dashboard"} 
                      onClick={() => setIsMenuOpen(false)} 
                      className="py-2 text-gray-600 hover:text-gray-900"
                    >
                      {isProvider ? "Provider Dashboard" : "User Dashboard"}
                    </Link>
                    <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="py-2 text-gray-600 hover:text-gray-900">
                      Profile
                    </Link>
                    <button
                      onClick={() => { handleLogout(); setIsMenuOpen(false) }}
                      className="py-2 text-left text-red-600 hover:text-red-700"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsMenuOpen(false)} className="py-2 text-gray-600 hover:text-gray-900">Sign In</Link>
                    <Link to="/register" onClick={() => setIsMenuOpen(false)} className="btn-primary w-fit">Get Started</Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Click outside to close user menu */}
      {isUserMenuOpen && (
        <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)} />
      )}
    </header>
  )
}

export default Header
