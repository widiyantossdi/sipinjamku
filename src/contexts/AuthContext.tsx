import React, { createContext, useContext, useEffect, useState } from 'react'
import { authAPI, User } from '../lib/api'
import toast from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (userData: {
    nama: string
    email: string
    password: string
    password_confirmation: string
    role: 'admin' | 'user'
    no_telepon?: string
    divisi?: string
  }) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing auth token and get user profile
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token')
      if (token) {
        try {
          const response = await authAPI.profile()
          setUser(response.data)
        } catch (error) {
          // Token invalid, remove it
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user_data')
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])



  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const response = await authAPI.login(email, password)
      
      // Store token and user data
      localStorage.setItem('auth_token', response.data.token)
      localStorage.setItem('user_data', JSON.stringify(response.data.user))
      setUser(response.data.user)
      
      toast.success('Berhasil masuk!')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal masuk')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (userData: {
    nama: string
    email: string
    password: string
    password_confirmation: string
    role: 'admin' | 'user'
    no_telepon?: string
    divisi?: string
  }) => {
    try {
      setLoading(true)
      
      const response = await authAPI.register(userData)
      
      // Store token and user data
      localStorage.setItem('auth_token', response.data.token)
      localStorage.setItem('user_data', JSON.stringify(response.data.user))
      setUser(response.data.user)
      
      toast.success('Akun berhasil dibuat!')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal membuat akun')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      await authAPI.logout()
      
      // Clear local storage
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      setUser(null)
      
      toast.success('Berhasil keluar')
    } catch (error: any) {
      // Even if API call fails, clear local data
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      setUser(null)
      toast.success('Berhasil keluar')
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (_data: Partial<User>) => {
    try {
      if (!user) throw new Error('User not authenticated')

      setLoading(true)
      // Note: You'll need to implement user update API endpoint
      // const response = await usersAPI.update(user.id_user, data)
      // setUser(response.user)
      
      toast.success('Profil berhasil diperbarui')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal memperbarui profil')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}