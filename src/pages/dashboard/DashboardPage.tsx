import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { peminjamanAPI, ruanganAPI, kendaraanAPI, Booking } from '../../lib/api'
import { 
  Calendar, 
  Building, 
  Car, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Plus,
  Eye
} from 'lucide-react'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import { formatDate, getStatusColor, getStatusText } from '../../utils'

interface DashboardStats {
  totalBookings: number
  pendingBookings: number
  approvedBookings: number
  rejectedBookings: number
  availableRooms: number
  availableVehicles: number
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    pendingBookings: 0,
    approvedBookings: 0,
    rejectedBookings: 0,
    availableRooms: 0,
    availableVehicles: 0
  })
  const [recentBookings, setRecentBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch user's bookings
      const bookingsResponse = await peminjamanAPI.getAll()
      const userBookings = bookingsResponse.data?.filter(booking => booking.id_user === user!.id_user) || []
      const recentBookings = userBookings.slice(0, 5)

      // Calculate stats from bookings
      const totalBookings = userBookings.length
      const pendingBookings = userBookings.filter(b => b.status === 'diajukan').length
      const approvedBookings = userBookings.filter(b => b.status === 'disetujui').length
      const rejectedBookings = userBookings.filter(b => b.status === 'ditolak').length

      // Fetch available rooms
      const roomsResponse = await ruanganAPI.getAll()
      const availableRooms = roomsResponse.data?.filter(room => room.status === 'tersedia') || []

      // Fetch available vehicles
      const vehiclesResponse = await kendaraanAPI.getAll()
      const availableVehicles = vehiclesResponse.data?.filter(vehicle => vehicle.status === 'tersedia') || []

      setStats({
        totalBookings,
        pendingBookings,
        approvedBookings,
        rejectedBookings,
        availableRooms: availableRooms.length,
        availableVehicles: availableVehicles.length
      })

      setRecentBookings(recentBookings)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Selamat Pagi'
    if (hour < 15) return 'Selamat Siang'
    if (hour < 18) return 'Selamat Sore'
    return 'Selamat Malam'
  }

  const quickActions = [
    {
      title: 'Buat Peminjaman Baru',
      description: 'Ajukan peminjaman ruangan atau kendaraan',
      icon: Plus,
      link: '/booking',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Lihat Riwayat',
      description: 'Cek status dan riwayat peminjaman Anda',
      icon: Eye,
      link: '/my-bookings',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Data Ruangan',
      description: 'Lihat semua ruangan yang tersedia',
      icon: Building,
      link: '/rooms',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Data Kendaraan',
      description: 'Lihat semua kendaraan yang tersedia',
      icon: Car,
      link: '/vehicles',
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ]

  const statCards = [
    {
      title: 'Total Peminjaman',
      value: stats.totalBookings,
      icon: Calendar,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Menunggu Persetujuan',
      value: stats.pendingBookings,
      icon: Clock,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Disetujui',
      value: stats.approvedBookings,
      icon: CheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Ditolak',
      value: stats.rejectedBookings,
      icon: XCircle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Memuat dashboard..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {getGreeting()}, {user?.nama || 'User'}!
          </h1>
          <p className="text-gray-600 mt-2">
            Selamat datang di dashboard sistem peminjaman UNUGHA Cilacap
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className={`${stat.bgColor} rounded-lg p-6`}>
                <div className="flex items-center">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Aksi Cepat</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <Link
                    key={index}
                    to={action.link}
                    className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200 group"
                  >
                    <div className="flex items-start">
                      <div className={`${action.color} p-3 rounded-lg transition-colors`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Recent Bookings */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Peminjaman Terbaru</h2>
              <Link
                to="/my-bookings"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Lihat Semua
              </Link>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {recentBookings.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {recentBookings.map((booking) => (
                    <div key={booking.id_peminjaman} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">
                            {booking.jenis_peminjaman === 'ruangan' 
                              ? `Ruangan ID: ${booking.id_ruangan}` 
                              : `Kendaraan ID: ${booking.id_kendaraan}`
                            }
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(booking.tanggal_mulai)} - {formatDate(booking.tanggal_selesai)}
                          </p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(booking.status)}`}>
                            {getStatusText(booking.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Belum ada peminjaman</p>
                  <Link
                    to="/booking"
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2 inline-block"
                  >
                    Buat peminjaman pertama
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Availability Summary */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Ketersediaan Fasilitas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <Building className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Ruangan Tersedia</h3>
                  <p className="text-3xl font-bold text-blue-600">{stats.availableRooms}</p>
                  <Link
                    to="/rooms"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Lihat Detail →
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <Car className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Kendaraan Tersedia</h3>
                  <p className="text-3xl font-bold text-green-600">{stats.availableVehicles}</p>
                  <Link
                    to="/vehicles"
                    className="text-green-600 hover:text-green-700 text-sm font-medium"
                  >
                    Lihat Detail →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage