import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext/AuthContext'

export default function GoogleAuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { login } = useAuth()
  const [status, setStatus] = useState('processing')
  
  useEffect(() => {
    const handleGoogleAuth = async () => {
      const token = searchParams.get('token')
      const error = searchParams.get('error')
      
      if (error) {
        setStatus('error')
        setTimeout(() => navigate('/login'), 2000)
        return
      }
      
      if (token) {
        try {
          // Store token
          localStorage.setItem('token', token)
          
          // Fetch user data
          const response = await fetch('http://localhost:5000/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          const data = await response.json()
          
          if (data.success && data.user) {
            localStorage.setItem('user', JSON.stringify(data.user))
            setStatus('success')
            
            // Redirect based on role
            setTimeout(() => {
              if (data.user.role === 'admin') {
                navigate('/admin-dashboard')
              } else if (data.user.role === 'provider') {
                navigate('/provider-dashboard')
              } else {
                navigate('/dashboard')
              }
            }, 1000)
          } else {
            setStatus('error')
            setTimeout(() => navigate('/login'), 2000)
          }
        } catch (error) {
          console.error('Google auth error:', error)
          setStatus('error')
          setTimeout(() => navigate('/login'), 2000)
        }
      } else {
        setStatus('error')
        setTimeout(() => navigate('/login'), 2000)
      }
    }
    
    handleGoogleAuth()
  }, [searchParams, navigate, login])
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        {status === 'processing' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Completing Sign In...</h2>
            <p className="text-gray-600">Please wait while we log you in</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Success!</h2>
            <p className="text-gray-600">Redirecting to your dashboard...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="text-red-500 text-6xl mb-4">✗</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Failed</h2>
            <p className="text-gray-600">Redirecting to login page...</p>
          </>
        )}
      </div>
    </div>
  )
}
