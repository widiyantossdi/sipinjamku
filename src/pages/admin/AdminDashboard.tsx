import React, { useState, useEffect } from 'react'
import { peminjamanAPI, ruanganAPI, kendaraanAPI, usersAPI, Booking } from '../../lib/api'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import { 
  Users, 
  MapPin, 
  Car, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp,
  BarChart3
} from 'lucide-react'
import { formatDate, getStatusColor, getStatusText } from '../../utils'
import toast from 'react-hot-toast'

interface DashboardStats {
  totalUsers: number
  totalRooms: number
  totalVehicles: number
  totalBookings: number
  pendingBookings: number
  approvedBookings: number
  rejectedBookings: number
  completedBookings: number
}



const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalRooms: 0,
    totalVehicles: 0,
    totalBookings: 0,
    pendingBookings: 0,
    approvedBookings: 0,
    rejectedBookings: 0,
    completedBookings: 0
  })
  const [recentBookings, setRecentBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch all data
      const [usersResponse, roomsResponse, vehiclesResponse, bookingsResponse] = await Promise.all([
        usersAPI.getAll(),
        ruanganAPI.getAll(),
        kendaraanAPI.getAll(),
        peminjamanAPI.getAll()
      ])

      const users = usersResponse.data || []
      const rooms = roomsResponse.data || []
      const vehicles = vehiclesResponse.data || []
      const allBookings = bookingsResponse.data || []
      
      // Count bookings by status
      const statusCounts = allBookings.reduce((acc, booking) => {
        acc[booking.status] = (acc[booking.status] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      setStats({
        totalUsers: users.length,
        totalRooms: rooms.length,
        totalVehicles: vehicles.length,
        totalBookings: allBookings.length,
        pendingBookings: statusCounts['diajukan'] || 0,
        approvedBookings: statusCounts['disetujui'] || 0,
        rejectedBookings: statusCounts['ditolak'] || 0,
        completedBookings: statusCounts['selesai'] || 0
      })

      // Get recent bookings (first 10)
      const recentBookings = allBookings.slice(0, 10)
      setRecentBookings(recentBookings)

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Gagal memuat data dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Memuat dashboard..." />
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Pengguna',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Total Ruangan',
      value: stats.totalRooms,
      icon: MapPin,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Total Kendaraan',
      value: stats.totalVehicles,
      icon: Car,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    {
      title: 'Total Peminjaman',
      value: stats.totalBookings,
      icon: Calendar,
      color: 'bg-orange-500',
      textColor: 'text-orange-600'
    }
  ]

  const statusCards = [
    {
      title: 'Menunggu Persetujuan',
      value: stats.pendingBookings,
      icon: Clock,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Disetujui',
      value: stats.approvedBookings,
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Ditolak',
      value: stats.rejectedBookings,
      icon: XCircle,
      color: 'bg-red-500',
      textColor: 'text-red-600'
    },
    {
      title: 'Selesai',
      value: stats.completedBookings,
      icon: TrendingUp,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Admin</h1>
        <p className="text-gray-600">Kelola sistem peminjaman fasilitas universitas</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="card">
              <div className="card-content">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Status Stats */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Status Peminjaman</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statusCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="card">
                <div className="card-content">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
                    </div>
                    <div className={`p-2 rounded-full ${stat.color}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Peminjaman Terbaru</h2>
          <a
            href="/admin/bookings"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            Lihat Semua
          </a>
        </div>
        
        <div className="card">
          <div className="card-content">
            {recentBookings.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Belum ada peminjaman</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Peminjam
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Diajukan
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentBookings.map((booking) => (
                      <tr key={booking.id_peminjaman} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              User ID: {booking.id_user}
                            </div>
                            <div className="text-sm text-gray-500">
                              -
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {booking.jenis_peminjaman === 'ruangan' ? (
                              <MapPin className="h-4 w-4 text-primary-600 mr-2" />
                            ) : (
                              <Car className="h-4 w-4 text-primary-600 mr-2" />
                            )}
                            <span className="text-sm text-gray-900">
                              {booking.jenis_peminjaman === 'ruangan'
                                ? `Ruangan ID: ${booking.id_ruangan}`
                                : `Kendaraan ID: ${booking.id_kendaraan}`
                              }
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(booking.tanggal_mulai)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            getStatusColor(booking.status)
                          }`}>
                            {getStatusText(booking.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {booking.created_at ? formatDate(booking.created_at) : 'Tanggal tidak tersedia'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/admin/bookings"
            className="card hover:shadow-md transition-shadow"
          >
            <div className="card-content text-center">
              <Calendar className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Kelola Peminjaman</h3>
              <p className="text-sm text-gray-600">Setujui atau tolak peminjaman</p>
            </div>
          </a>
          
          <a
            href="/admin/rooms"
            className="card hover:shadow-md transition-shadow"
          >
            <div className="card-content text-center">
              <MapPin className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Kelola Ruangan</h3>
              <p className="text-sm text-gray-600">Tambah atau edit ruangan</p>
            </div>
          </a>
          
          <a
            href="/admin/vehicles"
            className="card hover:shadow-md transition-shadow"
          >
            <div className="card-content text-center">
              <Car className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Kelola Kendaraan</h3>
              <p className="text-sm text-gray-600">Tambah atau edit kendaraan</p>
            </div>
          </a>
          
          <a
            href="/admin/users"
            className="card hover:shadow-md transition-shadow"
          >
            <div className="card-content text-center">
              <Users className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Kelola Pengguna</h3>
              <p className="text-sm text-gray-600">Lihat dan kelola pengguna</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard