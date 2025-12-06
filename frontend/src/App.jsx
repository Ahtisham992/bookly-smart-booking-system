// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext/AuthContext'
import { ServicesProvider } from '@/context/ServicesContext/ServicesContext'
import { ProvidersProvider } from '@/context/ProvidersContext/ProvidersContext'
import { BookingProvider } from '@/context/BookingContext/BookingContext' // ✅ Import Booking Context
import Layout from '@components/layout/Layout'
import ProtectedRoute from '@components/auth/ProtectedRoute/ProtectedRoute'

// Pages
import Home from '@pages/Home/Home'
import Providers from '@pages/Providers/Providers'
import Booking from '@pages/Booking/Booking'
import Dashboard from '@pages/Dashboard/Dashboard'
import Profile from '@pages/Profile/Profile'
import Login from '@pages/Auth/Login'
import Register from '@pages/Auth/Register'
import Contact from '@pages/Contact/Contact'
import About from '@pages/About/About'
import NotFound from '@pages/NotFound/NotFound'
import Services from '@pages/Services/Services'
import ServiceDetail from '@pages/Services/ServiceDetail'
import AddService from '@pages/Services/AddService'
import ProviderDashboard from '@pages/Dashboard/ProviderDashboard' // ✅ New Provider Dashboard

function App() {
  return (
    <AuthProvider>
      <ServicesProvider>
        <ProvidersProvider>
          <BookingProvider>
            <Router>
              <Routes>
                {/* Public routes with layout */}
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="services" element={<Services />} />
                  <Route path="services/:id" element={<ServiceDetail />} />
                  <Route path="services/add" element={<AddService />} />
                  <Route path="services/edit/:id" element={<AddService />} />
                  <Route path="providers" element={<Providers />} />
                  <Route path="booking" element={<Booking />} />
                  <Route path="contact" element={<Contact />} />
                  <Route path="about" element={<About />} />
                </Route>

                {/* Auth routes (no layout) */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected routes with layout */}
                <Route path="/" element={<Layout />}>
                  <Route
                    path="dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="provider-dashboard" // ✅ New Provider Dashboard route
                    element={
                      <ProtectedRoute>
                        <ProviderDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                </Route>

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
          </BookingProvider>
        </ProvidersProvider>
      </ServicesProvider>
    </AuthProvider>
  )
}

export default App
