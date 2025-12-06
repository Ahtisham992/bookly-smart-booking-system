import { useState, useEffect } from 'react'
import { Users, UserCheck, DollarSign, Calendar, CheckCircle, XCircle, Briefcase, LayoutDashboard } from 'lucide-react'

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [providers, setProviders] = useState([])
  const [services, setServices] = useState([])
  const [bookings, setBookings] = useState([])
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      const statsRes = await fetch('http://localhost:5000/api/dashboard/admin', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (statsRes.ok) setStats((await statsRes.json()).data)

      const usersRes = await fetch('http://localhost:5000/api/users?limit=100', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (usersRes.ok) {
        const data = (await usersRes.json()).data || []
        setUsers(data)
        setProviders(data.filter(u => u.role === 'provider'))
      }

      const servicesRes = await fetch('http://localhost:5000/api/services', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (servicesRes.ok) setServices((await servicesRes.json()).data || [])

      const bookingsRes = await fetch('http://localhost:5000/api/bookings', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (bookingsRes.ok) setBookings((await bookingsRes.json()).data || [])

      setLoading(false)
    } catch (error) {
      console.error('Error:', error)
      setLoading(false)
    }
  }

  const handleVerifyProvider = async (userId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ isVerified: true, providerInfo: { verified: true } })
      })
      if (res.ok) {
        alert('Provider verified!')
        loadDashboardData()
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleDelete = async (url, type) => {
    if (!window.confirm(`Delete this ${type}?`)) return
    try {
      const res = await fetch(url, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      if (res.ok) {
        alert(`${type} deleted!`)
        loadDashboardData()
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  if (loading) return <div className="min-h-screen bg-gray-50 py-8"><div className="max-w-7xl mx-auto px-4"><div className="animate-pulse"><div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div></div></div></div>

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 mb-8">Manage platform</p>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Statistics</h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded"><p className="text-sm text-gray-600">Users</p><p className="text-2xl font-bold">{stats?.userStats?.totalUsers || 0}</p></div>
            <div className="p-4 bg-green-50 rounded"><p className="text-sm text-gray-600">Providers</p><p className="text-2xl font-bold">{stats?.userStats?.providers || 0}</p></div>
            <div className="p-4 bg-yellow-50 rounded"><p className="text-sm text-gray-600">Services</p><p className="text-2xl font-bold">{services.length}</p></div>
            <div className="p-4 bg-purple-50 rounded"><p className="text-sm text-gray-600">Bookings</p><p className="text-2xl font-bold">{bookings.length}</p></div>
          </div>
        </div>
        <div className="mt-6 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Pending Verifications</h2>
          {providers.filter(p => !p.isVerified).length === 0 ? (
            <p className="text-gray-500 text-center py-4">No pending verifications</p>
          ) : (
            providers.filter(p => !p.isVerified).map(p => (
              <div key={p._id} className="flex justify-between items-center p-4 border-b">
                <div><p className="font-semibold">{p.firstName} {p.lastName}</p><p className="text-sm text-gray-600">{p.email}</p></div>
                <div className="flex gap-2">
                  <button onClick={() => handleVerifyProvider(p._id)} className="px-4 py-2 bg-green-600 text-white rounded">Verify</button>
                  <button onClick={() => handleDelete(`http://localhost:5000/api/users/${p._id}`, 'user')} className="px-4 py-2 bg-red-600 text-white rounded">Reject</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">All Users</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{u.firstName} {u.lastName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{u.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        u.role === 'provider' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>{u.role}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {u.isVerified ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Verified</span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {u.role !== 'admin' && (
                        <button onClick={() => handleDelete(`http://localhost:5000/api/users/${u._id}`, 'user')} className="text-red-600 hover:text-red-900">Delete</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">All Providers</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {providers.map(p => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{p.firstName} {p.lastName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{p.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{p.providerInfo?.category || 'Not set'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {p.isVerified || p.providerInfo?.verified ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Verified</span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        {!p.isVerified && (
                          <button onClick={() => handleVerifyProvider(p._id)} className="text-green-600 hover:text-green-900">Verify</button>
                        )}
                        <button onClick={() => handleDelete(`http://localhost:5000/api/users/${p._id}`, 'provider')} className="text-red-600 hover:text-red-900">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">All Services</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {services.map(s => (
                  <tr key={s._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{s.title}</td>
                    <td className="px-6 py-4">{s.provider?.firstName} {s.provider?.lastName}</td>
                    <td className="px-6 py-4">${s.pricing?.amount || s.price}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleDelete(`http://localhost:5000/api/services/${s._id}`, 'service')} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">All Bookings</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bookings.map(b => (
                  <tr key={b._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{b.customer?.firstName} {b.customer?.lastName}</td>
                    <td className="px-6 py-4">{b.provider?.firstName} {b.provider?.lastName}</td>
                    <td className="px-6 py-4">{b.service?.title || 'N/A'}</td>
                    <td className="px-6 py-4">{new Date(b.scheduledDate || b.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        b.status === 'completed' ? 'bg-green-100 text-green-800' :
                        b.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>{b.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleDelete(`http://localhost:5000/api/bookings/${b._id}`, 'booking')} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
