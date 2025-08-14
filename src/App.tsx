import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout/Layout'
import LoadingSpinner from './components/UI/LoadingSpinner'

// Public pages
import HomePage from './pages/public/HomePage'
import RoomsPage from './pages/public/RoomsPage'
import VehiclesPage from './pages/public/VehiclesPage'
import CalendarPage from './pages/public/CalendarPage'
import GuidePage from './pages/public/GuidePage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Protected pages
import DashboardPage from './pages/dashboard/DashboardPage'
import BookingPage from './pages/booking/BookingPage'
import MyBookingsPage from './pages/booking/MyBookingsPage'
import ProfilePage from './pages/profile/ProfilePage'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminRooms from './pages/admin/AdminRooms'
import AdminVehicles from './pages/admin/AdminVehicles'
import AdminBookings from './pages/admin/AdminBookings'
import AdminReports from './pages/admin/AdminReports'
import AdminUsers from './pages/admin/AdminUsers'

// Staff pages
import StaffDashboard from './pages/staff/StaffDashboard'
import QRScannerPage from './pages/qr/QRScannerPage'

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string[]
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, userProfile, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && userProfile && !requiredRole.includes(userProfile.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

// Public Route Component (redirect if authenticated)
interface PublicRouteProps {
  children: React.ReactNode
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <Layout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/vehicles" element={<VehiclesPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/guide" element={<GuidePage />} />
        
        {/* Auth Routes */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          } 
        />

        {/* Protected Routes - All authenticated users */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/booking" 
          element={
            <ProtectedRoute>
              <BookingPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/my-bookings" 
          element={
            <ProtectedRoute>
              <MyBookingsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />

        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requiredRole={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/rooms" 
          element={
            <ProtectedRoute requiredRole={['admin']}>
              <AdminRooms />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/vehicles" 
          element={
            <ProtectedRoute requiredRole={['admin']}>
              <AdminVehicles />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/bookings" 
          element={
            <ProtectedRoute requiredRole={['admin']}>
              <AdminBookings />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/reports" 
          element={
            <ProtectedRoute requiredRole={['admin']}>
              <AdminReports />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute requiredRole={['admin']}>
              <AdminUsers />
            </ProtectedRoute>
          } 
        />

        {/* Staff Routes */}
        <Route 
          path="/staff" 
          element={
            <ProtectedRoute requiredRole={['petugas', 'admin']}>
              <StaffDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/staff/scanner" 
          element={
            <ProtectedRoute requiredRole={['petugas', 'admin']}>
              <QRScannerPage />
            </ProtectedRoute>
          } 
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App