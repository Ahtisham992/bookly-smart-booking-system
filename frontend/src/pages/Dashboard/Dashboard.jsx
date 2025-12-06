// src/pages/Dashboard/Dashboard.jsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext/AuthContext'
import CustomerDashboard from './CustomerDashboard'

const Dashboard = () => {
  const { user } = useAuth()
  
  // Redirect providers to their dashboard
  if (user?.role === 'provider') {
    return <Navigate to="/provider-dashboard" replace />
  }
  
  // Show customer dashboard
  return <CustomerDashboard />
}

export default Dashboard
