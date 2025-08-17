import React, { useState, useEffect } from 'react'
import { peminjamanAPI, Booking } from '../../lib/api'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import { Calendar, MapPin, Car, Clock, CheckCircle, XCircle, AlertCircle, Users, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { Link } from 'react-router-dom'

interface DashboardStats {
  totalBookings: number
  pendingBookings: number
  approvedBookings: number
  todayBookings: number
  roomBookings: number
  vehicleBookings: number
}



const StaffDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentBookings, setRecentBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch all bookings for stats
      const bookingsResponse = await peminjamanAPI.getAll()
      const allBookings = bookingsResponse.data || []

      // Calculate stats
      const today = new Date().toISOString().split('T')[0]
      const totalBookings = allBookings.length
      const pendingBookings = allBookings.filter(b => b.status === 'diajukan').length
      const approvedBookings = allBookings.filter(b => b.status === 'disetujui').length
      const todayBookings = allBookings.filter(b => 
        b.tanggal_mulai.startsWith(today) || b.tanggal_selesai.startsWith(today)
      ).length
      const roomBookings = allBookings.filter(b => b.jenis_peminjaman === 'ruangan').length
      const vehicleBookings = allBookings.filter(b => b.jenis_peminjaman === 'kendaraan').length

      setStats({
        totalBookings,
        pendingBookings,
        approvedBookings,
        todayBookings,
        roomBookings,
        vehicleBookings
      })

      // Get recent bookings (first 10)
      const recentData = allBookings.slice(0, 10)
      setRecentBookings(recentData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Gagal memuat data dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickAction = async (bookingId: string, action: 'approve' | 'reject') => {
    setActionLoading(bookingId)
    try {
      await peminjamanAPI.update(bookingId, {
        status: action === 'approve' ? 'disetujui' : 'ditolak'
      })

      toast.success(`Booking berhasil ${action === 'approve' ? 'disetujui' : 'ditolak'}`)
      fetchDashboardData()
    } catch (error) {
      console.error('Error updating booking:', error)
      toast.error('Gagal memperbarui booking')
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Menunggu'
      case 'approved': return 'Disetujui'
      case 'rejected': return 'Ditolak'
      case 'completed': return 'Selesai'
      default: return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />
      case 'approved': return <CheckCircle className="h-4 w-4" />
      case 'rejected': return <XCircle className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy, HH:mm', { locale: id })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Memuat dashboard..." />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Staff</h1>
        <p className="text-gray-600">Kelola booking dan pantau aktivitas sistem</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <div className="card">
            <div className="card-content">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Booking</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Menunggu</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingBookings}</p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Disetujui</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approvedBookings}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Hari Ini</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.todayBookings}</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ruangan</p>
                  <p className="text-2xl font-bold text-indigo-600">{stats.roomBookings}</p>
                </div>
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <MapPin className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Kendaraan</p>
                  <p className="text-2xl font-bold text-pink-600">{stats.vehicleBookings}</p>
                </div>
                <div className="p-2 bg-pink-100 rounded-lg">
                  <Car className="h-6 w-6 text-pink-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Link to="/admin/bookings" className="card hover:shadow-lg transition-shadow">
          <div className="card-content">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Kelola Booking</h3>
                <p className="text-sm text-gray-600">Setujui atau tolak booking</p>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/staff/scanner" className="card hover:shadow-lg transition-shadow">
          <div className="card-content">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">QR Scanner</h3>
                <p className="text-sm text-gray-600">Scan QR untuk check-in/out</p>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/profile" className="card hover:shadow-lg transition-shadow">
          <div className="card-content">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Profil Saya</h3>
                <p className="text-sm text-gray-600">Kelola profil dan pengaturan</p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Bookings */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Booking Terbaru</h3>
            <Link to="/admin/bookings" className="btn btn-outline btn-sm">
              Lihat Semua
            </Link>
          </div>
        </div>
        <div className="card-content">
          {recentBookings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Belum ada booking terbaru</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id_peminjaman} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 bg-primary-100 rounded-lg">
                        {booking.jenis_peminjaman === 'ruangan' ? (
                          <MapPin className="h-4 w-4 text-primary-600" />
                        ) : (
                          <Car className="h-4 w-4 text-primary-600" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">
                            {booking.jenis_peminjaman === 'ruangan' 
                              ? `Ruangan ID: ${booking.id_ruangan}` 
                              : `Kendaraan ID: ${booking.id_kendaraan}`
                            }
                          </h4>
                          <span className="text-sm text-gray-500">
                            {booking.jenis_peminjaman === 'ruangan' 
                              ? 'Ruangan' 
                              : 'Kendaraan'
                            }
                          </span>
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Users className="h-3 w-3" />
                            <span>User ID: {booking.id_user}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {formatDate(booking.tanggal_mulai)} - {formatDate(booking.tanggal_selesai)}
                            </span>
                          </div>
                          <p className="text-gray-700 mt-1">
                            <strong>Keperluan:</strong> {booking.keperluan}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {getStatusIcon(booking.status)}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          getStatusColor(booking.status)
                        }`}>
                          {getStatusText(booking.status)}
                        </span>
                      </div>
                      
                      {booking.status === 'diajukan' && (
                        <div className="flex gap-1 ml-2">
                          <button
                            onClick={() => handleQuickAction(booking.id_peminjaman, 'approve')}
                            disabled={actionLoading === booking.id_peminjaman}
                            className="btn btn-primary btn-xs"
                          >
                            {actionLoading === booking.id_peminjaman ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <CheckCircle className="h-3 w-3" />
                            )}
                          </button>
                          <button
                            onClick={() => handleQuickAction(booking.id_peminjaman, 'reject')}
                            disabled={actionLoading === booking.id_peminjaman}
                            className="btn btn-outline btn-xs text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <XCircle className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StaffDashboard