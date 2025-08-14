import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from './UI/LoadingSpinner'

interface PublicRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

const PublicRoute: React.FC<PublicRouteProps> = ({ 
  children, 
  redirectTo = '/dashboard' 
}) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Memuat..." />
      </div>
    )
  }

  if (user) {
    // User is authenticated, redirect to dashboard or specified route
    return <Navigate to={redirectTo} replace />
  }

  return <>{children}</>
}

export default PublicRoute