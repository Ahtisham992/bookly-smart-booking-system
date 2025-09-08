// src/components/layout/Sidebar/Sidebar.jsx
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  Calendar, 
  Users, 
  Settings, 
  User, 
  Bell, 
  BarChart3, 
  Clock,
  X
} from 'lucide-react'

const Sidebar = ({ isOpen, onClose, userRole = 'user' }) => {
  const location = useLocation()

  // Different navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: Home,
        current: location.pathname === '/dashboard'
      },
      {
        name: 'Appointments',
        href: '/appointments',
        icon: Calendar,
        current: location.pathname === '/appointments'
      },
      {
        name: 'Profile',
        href: '/profile',
        icon: User,
        current: location.pathname === '/profile'
      }
    ]

    if (userRole === 'provider') {
      return [
        ...baseItems,
        {
          name: 'My Services',
          href: '/provider/services',
          icon: Users,
          current: location.pathname === '/provider/services'
        },
        {
          name: 'Availability',
          href: '/provider/availability',
          icon: Clock,
          current: location.pathname === '/provider/availability'
        },
        {
          name: 'Analytics',
          href: '/provider/analytics',
          icon: BarChart3,
          current: location.pathname === '/provider/analytics'
        }
      ]
    }

    if (userRole === 'admin') {
      return [
        ...baseItems,
        {
          name: 'User Management',
          href: '/admin/users',
          icon: Users,
          current: location.pathname === '/admin/users'
        },
        {
          name: 'System Analytics',
          href: '/admin/analytics',
          icon: BarChart3,
          current: location.pathname === '/admin/analytics'
        }
      ]
    }

    return [
      ...baseItems,
      {
        name: 'Find Services',
        href: '/services',
        icon: Users,
        current: location.pathname === '/services'
      },
      {
        name: 'Booking History',
        href: '/history',
        icon: Clock,
        current: location.pathname === '/history'
      }
    ]
  }

  const navigationItems = getNavigationItems()

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:h-auto lg:shadow-none lg:border-r lg:border-gray-200
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={`
                  flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${item.current 
                    ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }
                `}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Bottom section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <Link
            to="/notifications"
            onClick={onClose}
            className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <Bell className="h-5 w-5 mr-3" />
            Notifications
          </Link>
          <Link
            to="/settings"
            onClick={onClose}
            className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <Settings className="h-5 w-5 mr-3" />
            Settings
          </Link>
        </div>
      </div>
    </>
  )
}

export default Sidebar