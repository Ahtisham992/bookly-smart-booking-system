// src/components/debug/AuthDebug.jsx - Temporary debugging component
import { useAuth } from '../../context/AuthContext/AuthContext'

const AuthDebug = () => {
  const { user, token, loading, isAuthenticated } = useAuth()
  
  const storedToken = localStorage.getItem('token')
  const storedUser = localStorage.getItem('user')
  
  return (
    <div className="fixed top-4 right-4 bg-black text-white p-4 rounded-lg text-xs z-50 max-w-sm">
      <h4 className="font-bold text-yellow-400 mb-2">Auth Debug</h4>
      <div className="space-y-1">
        <div>Loading: {loading ? 'true' : 'false'}</div>
        <div>IsAuthenticated: {isAuthenticated ? 'true' : 'false'}</div>
        <div>User in Context: {user ? JSON.stringify({
          id: user.id,
          firstName: user.firstName,
          email: user.email,
          role: user.role
        }, null, 2) : 'null'}</div>
        <div>Token in Context: {token ? 'exists' : 'null'}</div>
        <div>Stored Token: {storedToken ? 'exists' : 'null'}</div>
        <div>Stored User: {storedUser ? 'exists' : 'null'}</div>
      </div>
    </div>
  )
}

export default AuthDebug