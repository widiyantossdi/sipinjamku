import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import { BarChart3, Download, TrendingUp, MapPin, Car, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import { format, startOfMonth, endOfMonth, subMonths, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'

interface ReportData {
  totalBookings: number
  roomBookings: number
  vehicleBookings: number
  pendingBookings: number
  approvedBookings: number
  rejectedBookings: number
  completedBookings: number
  monthlyData: {
    month: string
    total: number
    rooms: number
    vehicles: number
  }[]
  popularRooms: {
    nama: string
    lokasi: string
    count: number
  }[]
  popularVehicles: {
    nama: string
    plat_nomor: string
    count: number
  }[]
  userActivity: {
    nama: string
    email: string
    count: number
  }[]
}

const AdminReports: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(subMonths(new Date(), 5)), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  })
  const [exportLoading, setExportLoading] = useState(false)

  useEffect(() => {
    fetchReportData()
  }, [dateRange])

  const fetchReportData = async () => {
    try {
      setLoading(true)
      
      // Fetch all bookings within date range
      const { data: bookings, error: bookingsError } = await supabase
        .from('peminjaman')
        .select(`
          *,
          users:user_id (
            nama,
            email
          ),
          ruangan:ruangan_id (
            nama,
            lokasi
          ),
          kendaraan:kendaraan_id (
            nama,
            plat_nomor
          )
        `)
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end + 'T23:59:59')

      if (bookingsError) throw bookingsError

      // Process data
      const totalBookings = bookings?.length || 0
      const roomBookings = bookings?.filter(b => b.jenis_booking === 'ruangan').length || 0
      const vehicleBookings = bookings?.filter(b => b.jenis_booking === 'kendaraan').length || 0
      const pendingBookings = bookings?.filter(b => b.status === 'pending').length || 0
      const approvedBookings = bookings?.filter(b => b.status === 'approved').length || 0
      const rejectedBookings = bookings?.filter(b => b.status === 'rejected').length || 0
      const completedBookings = bookings?.filter(b => b.status === 'completed').length || 0

      // Monthly data
      const monthlyMap = new Map()
      bookings?.forEach(booking => {
        const month = format(parseISO(booking.created_at), 'MMM yyyy', { locale: id })
        if (!monthlyMap.has(month)) {
          monthlyMap.set(month, { month, total: 0, rooms: 0, vehicles: 0 })
        }
        const data = monthlyMap.get(month)
        data.total++
        if (booking.jenis_booking === 'ruangan') data.rooms++
        else data.vehicles++
      })
      const monthlyData = Array.from(monthlyMap.values()).sort((a, b) => 
        new Date(a.month).getTime() - new Date(b.month).getTime()
      )

      // Popular rooms
      const roomMap = new Map()
      bookings?.filter(b => b.jenis_booking === 'ruangan' && b.ruangan).forEach(booking => {
        const key = booking.ruangan_id
        if (!roomMap.has(key)) {
          roomMap.set(key, {
            nama: booking.ruangan.nama,
            lokasi: booking.ruangan.lokasi,
            count: 0
          })
        }
        roomMap.get(key).count++
      })
      const popularRooms = Array.from(roomMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      // Popular vehicles
      const vehicleMap = new Map()
      bookings?.filter(b => b.jenis_booking === 'kendaraan' && b.kendaraan).forEach(booking => {
        const key = booking.kendaraan_id
        if (!vehicleMap.has(key)) {
          vehicleMap.set(key, {
            nama: booking.kendaraan.nama,
            plat_nomor: booking.kendaraan.plat_nomor,
            count: 0
          })
        }
        vehicleMap.get(key).count++
      })
      const popularVehicles = Array.from(vehicleMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      // User activity
      const userMap = new Map()
      bookings?.forEach(booking => {
        const key = booking.user_id
        if (!userMap.has(key)) {
          userMap.set(key, {
            nama: booking.users.nama,
            email: booking.users.email,
            count: 0
          })
        }
        userMap.get(key).count++
      })
      const userActivity = Array.from(userMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      setReportData({
        totalBookings,
        roomBookings,
        vehicleBookings,
        pendingBookings,
        approvedBookings,
        rejectedBookings,
        completedBookings,
        monthlyData,
        popularRooms,
        popularVehicles,
        userActivity
      })
    } catch (error) {
      console.error('Error fetching report data:', error)
      toast.error('Gagal memuat data laporan')
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = async () => {
    if (!reportData) return
    
    setExportLoading(true)
    try {
      // Fetch detailed booking data for export
      const { data: bookings, error } = await supabase
        .from('peminjaman')
        .select(`
          *,
          users:user_id (
            nama,
            email
          ),
          ruangan:ruangan_id (
            nama,
            lokasi
          ),
          kendaraan:kendaraan_id (
            nama,
            plat_nomor
          )
        `)
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end + 'T23:59:59')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Create CSV content
      const headers = [
        'Tanggal Booking',
        'Jenis',
        'Item',
        'Lokasi/Plat',
        'Pemohon',
        'Email',
        'Tanggal Mulai',
        'Tanggal Selesai',
        'Keperluan',
        'Status',
        'Catatan Admin'
      ]

      const rows = bookings?.map(booking => [
        format(parseISO(booking.created_at), 'dd/MM/yyyy HH:mm'),
        booking.jenis_booking,
        booking.jenis_booking === 'ruangan' ? booking.ruangan?.nama : booking.kendaraan?.nama,
        booking.jenis_booking === 'ruangan' ? booking.ruangan?.lokasi : booking.kendaraan?.plat_nomor,
        booking.users?.nama,
        booking.users?.email,
        format(parseISO(booking.tanggal_mulai), 'dd/MM/yyyy HH:mm'),
        format(parseISO(booking.tanggal_selesai), 'dd/MM/yyyy HH:mm'),
        booking.keperluan,
        booking.status,
        booking.catatan_admin || ''
      ]) || []

      const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n')

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `laporan-booking-${format(new Date(), 'yyyy-MM-dd')}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success('Laporan berhasil diunduh')
    } catch (error) {
      console.error('Error exporting data:', error)
      toast.error('Gagal mengunduh laporan')
    } finally {
      setExportLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Memuat laporan..." />
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Gagal memuat laporan</h3>
          <p className="text-gray-600">Silakan coba lagi nanti</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Laporan & Analitik</h1>
            <p className="text-gray-600">Analisis data booking dan aktivitas sistem</p>
          </div>
          <button
            onClick={exportToCSV}
            disabled={exportLoading}
            className="btn btn-primary"
          >
            {exportLoading ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ml-2">Mengunduh...</span>
              </>
            ) : (
              <>
                <Download className="h-5 w-5 mr-2" />
                Export CSV
              </>
            )}
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="mb-8 card">
        <div className="card-content">
          <h3 className="text-lg font-semibold mb-4">Filter Periode</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Akhir
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Booking</p>
                <p className="text-2xl font-bold text-gray-900">{reportData.totalBookings}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Booking Ruangan</p>
                <p className="text-2xl font-bold text-gray-900">{reportData.roomBookings}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Booking Kendaraan</p>
                <p className="text-2xl font-bold text-gray-900">{reportData.vehicleBookings}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Car className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Menunggu Persetujuan</p>
                <p className="text-2xl font-bold text-gray-900">{reportData.pendingBookings}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold">Distribusi Status</h3>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Disetujui</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(reportData.approvedBookings / reportData.totalBookings) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{reportData.approvedBookings}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Selesai</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(reportData.completedBookings / reportData.totalBookings) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{reportData.completedBookings}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Menunggu</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ width: `${(reportData.pendingBookings / reportData.totalBookings) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{reportData.pendingBookings}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Ditolak</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${(reportData.rejectedBookings / reportData.totalBookings) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{reportData.rejectedBookings}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold">Tren Bulanan</h3>
          </div>
          <div className="card-content">
            <div className="space-y-3">
              {reportData.monthlyData.map((month, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{month.month}</span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-gray-500">Ruangan: {month.rooms}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-xs text-gray-500">Kendaraan: {month.vehicles}</span>
                    </div>
                    <span className="text-sm font-medium">{month.total}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Popular Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold">Ruangan Terpopuler</h3>
          </div>
          <div className="card-content">
            {reportData.popularRooms.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Tidak ada data ruangan</p>
            ) : (
              <div className="space-y-3">
                {reportData.popularRooms.map((room, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{room.nama}</p>
                      <p className="text-sm text-gray-600">{room.lokasi}</p>
                    </div>
                    <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded">
                      {room.count} booking
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold">Kendaraan Terpopuler</h3>
          </div>
          <div className="card-content">
            {reportData.popularVehicles.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Tidak ada data kendaraan</p>
            ) : (
              <div className="space-y-3">
                {reportData.popularVehicles.map((vehicle, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{vehicle.nama}</p>
                      <p className="text-sm text-gray-600">{vehicle.plat_nomor}</p>
                    </div>
                    <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded">
                      {vehicle.count} booking
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Activity */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Aktivitas Pengguna Teratas</h3>
        </div>
        <div className="card-content">
          {reportData.userActivity.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Tidak ada data aktivitas</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-sm font-medium text-gray-600">Nama</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-600">Email</th>
                    <th className="text-right py-2 text-sm font-medium text-gray-600">Total Booking</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.userActivity.map((user, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-2 text-sm text-gray-900">{user.nama}</td>
                      <td className="py-2 text-sm text-gray-600">{user.email}</td>
                      <td className="py-2 text-sm font-medium text-gray-900 text-right">{user.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminReports