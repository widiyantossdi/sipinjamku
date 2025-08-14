import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Calendar from 'react-calendar'
import { supabase, Tables } from '../../lib/supabase'
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  Building, 
  Car,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Plus
} from 'lucide-react'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import { formatDate, formatTime, getStatusColor, getStatusText } from '../../utils'
import { useAuth } from '../../contexts/AuthContext'
import 'react-calendar/dist/Calendar.css'

type ValuePiece = Date | null
type Value = ValuePiece | [ValuePiece, ValuePiece]

interface BookingWithDetails extends Tables<'peminjaman'> {
  users: {
    nama: string
    email: string
  } | null
  ruangan: {
    nama_ruangan: string
    lokasi: string
  } | null
  kendaraan: {
    jenis: string
    merk: string
    plat_nomor: string
  } | null
}

const CalendarPage: React.FC = () => {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState<Value>(new Date())
  const [bookings, setBookings] = useState<BookingWithDetails[]>([])
  const [filteredBookings, setFilteredBookings] = useState<BookingWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchBookings()
  }, [])

  useEffect(() => {
    filterBookings()
  }, [bookings, selectedDate, typeFilter, statusFilter])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('peminjaman')
        .select(`
          *,
          users:id_user (
            nama,
            email
          ),
          ruangan:id_ruangan (
            nama_ruangan,
            lokasi
          ),
          kendaraan:id_kendaraan (
            jenis,
            merk,
            plat_nomor
          )
        `)
        .order('tanggal_mulai', { ascending: true })

      if (error) throw error
      setBookings(data || [])
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterBookings = () => {
    let filtered = [...bookings]

    // Date filter
    if (selectedDate && selectedDate instanceof Date) {
      const selectedDateStr = selectedDate.toISOString().split('T')[0]
      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.tanggal_mulai).toISOString().split('T')[0]
        return bookingDate === selectedDateStr
      })
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(booking => booking.jenis_peminjaman === typeFilter)
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter)
    }

    setFilteredBookings(filtered)
  }

  const getBookingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.tanggal_mulai).toISOString().split('T')[0]
      return bookingDate === dateStr
    })
  }

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dayBookings = getBookingsForDate(date)
      if (dayBookings.length > 0) {
        return (
          <div className="flex justify-center mt-1">
            <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
          </div>
        )
      }
    }
    return null
  }

  const openBookingModal = (booking: BookingWithDetails) => {
    setSelectedBooking(booking)
    setShowModal(true)
  }

  const closeModal = () => {
    setSelectedBooking(null)
    setShowModal(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Memuat kalender peminjaman..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Kalender Peminjaman</h1>
          <p className="text-gray-600">
            Lihat jadwal peminjaman ruangan dan kendaraan secara real-time
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Pilih Tanggal</h2>
                <Calendar
                  onChange={setSelectedDate}
                  value={selectedDate}
                  tileContent={tileContent}
                  className="w-full border-0"
                  locale="id-ID"
                  formatShortWeekday={(_locale, date) => {
                    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
                    return days[date.getDay()]
                  }}
                  formatMonthYear={(_locale, date) => {
                    const months = [
                      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
                    ]
                    return `${months[date.getMonth()]} ${date.getFullYear()}`
                  }}
                  prevLabel={<ChevronLeft className="w-4 h-4" />}
                  nextLabel={<ChevronRight className="w-4 h-4" />}
                />
              </div>

              {/* Legend */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Keterangan:</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-primary-600 rounded-full mr-2"></div>
                    <span>Ada peminjaman</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Filter</h2>
              
              <div className="space-y-4">
                {/* Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jenis Peminjaman
                  </label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="all">Semua</option>
                    <option value="ruangan">Ruangan</option>
                    <option value="kendaraan">Kendaraan</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="all">Semua Status</option>
                    <option value="diajukan">Diajukan</option>
                    <option value="disetujui">Disetujui</option>
                    <option value="ditolak">Ditolak</option>
                    <option value="selesai">Selesai</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <button
                  onClick={() => {
                    setTypeFilter('all')
                    setStatusFilter('all')
                  }}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Reset Filter
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            {user && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Aksi Cepat</h2>
                <div className="space-y-3">
                  <Link
                    to="/booking"
                    className="w-full flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajukan Peminjaman
                  </Link>
                  <Link
                    to="/dashboard"
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Lihat Dashboard
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bookings List */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Peminjaman pada {selectedDate instanceof Date ? formatDate(selectedDate) : 'Tanggal Dipilih'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {filteredBookings.length} peminjaman ditemukan
              </p>
            </div>

            <div className="divide-y divide-gray-200">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <div key={booking.id_peminjaman} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {booking.jenis_peminjaman === 'ruangan' ? (
                            <Building className="w-5 h-5 text-primary-600" />
                          ) : (
                            <Car className="w-5 h-5 text-blue-600" />
                          )}
                          <h3 className="text-lg font-medium text-gray-900">
                            {booking.jenis_peminjaman === 'ruangan' 
                              ? booking.ruangan?.nama_ruangan 
                              : `${booking.kendaraan?.jenis} ${booking.kendaraan?.merk}`
                            }
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {getStatusText(booking.status)}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>
                              {formatTime(booking.jam_mulai)} - {formatTime(booking.jam_selesai)}
                            </span>
                          </div>
                          
                          {booking.jenis_peminjaman === 'ruangan' && booking.ruangan && (
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2" />
                              <span>{booking.ruangan.lokasi}</span>
                            </div>
                          )}
                          
                          {booking.jenis_peminjaman === 'kendaraan' && booking.kendaraan && (
                            <div className="flex items-center">
                              <Car className="w-4 h-4 mr-2" />
                              <span>{booking.kendaraan.plat_nomor}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-2" />
                            <span>{booking.users?.nama}</span>
                          </div>
                        </div>

                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            <strong>Keperluan:</strong> {booking.keperluan}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => openBookingModal(booking)}
                        className="ml-4 flex items-center px-3 py-1 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Detail
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Tidak ada peminjaman
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Belum ada peminjaman pada tanggal yang dipilih
                  </p>
                  {user && (
                    <Link
                      to="/booking"
                      className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajukan Peminjaman
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Detail Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Detail Peminjaman</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Informasi Dasar</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Jenis Peminjaman</label>
                      <p className="mt-1 text-sm text-gray-900 capitalize">{selectedBooking.jenis_peminjaman}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedBooking.status)}`}>
                        {getStatusText(selectedBooking.status)}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tanggal</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatDate(new Date(selectedBooking.tanggal_mulai))} - {formatDate(new Date(selectedBooking.tanggal_selesai))}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Waktu</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatTime(selectedBooking.jam_mulai)} - {formatTime(selectedBooking.jam_selesai)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Asset Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {selectedBooking.jenis_peminjaman === 'ruangan' ? 'Informasi Ruangan' : 'Informasi Kendaraan'}
                  </h3>
                  {selectedBooking.jenis_peminjaman === 'ruangan' && selectedBooking.ruangan ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Nama Ruangan</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedBooking.ruangan.nama_ruangan}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Lokasi</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedBooking.ruangan.lokasi}</p>
                      </div>
                    </div>
                  ) : selectedBooking.kendaraan ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Jenis</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedBooking.kendaraan.jenis}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Merk</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedBooking.kendaraan.merk}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Plat Nomor</label>
                        <p className="mt-1 text-sm text-gray-900 font-mono">{selectedBooking.kendaraan.plat_nomor}</p>
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* User Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Informasi Peminjam</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nama</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedBooking.users?.nama}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedBooking.users?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Purpose */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Keperluan</h3>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                    {selectedBooking.keperluan}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CalendarPage