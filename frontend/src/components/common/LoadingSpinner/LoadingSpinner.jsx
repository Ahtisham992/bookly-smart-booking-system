import { Calendar } from 'lucide-react'

const LoadingSpinner = ({ size = 'default', message = 'Loading...' }) => {
  const sizeClasses = {
    small: 'h-6 w-6',
    default: 'h-8 w-8',
    large: 'h-12 w-12'
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative">
        <Calendar className={`${sizeClasses[size]} text-primary-600 animate-bounce`} />
        <div className="absolute inset-0 rounded-full border-2 border-primary-200 animate-ping"></div>
      </div>
      {message && (
        <p className="mt-2 text-sm text-gray-600 animate-pulse">{message}</p>
      )}
    </div>
  )
}

export default LoadingSpinner