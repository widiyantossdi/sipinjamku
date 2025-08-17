import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { peminjamanAPI, Booking } from '../../lib/api'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import { formatDateTime, getStatusColor, getStatusText } from '../../utils'
import { Calendar, Clock, MapPin, Car, QrCode } from 'lucide-react'
import toast from 'react-hot-toast'



const MyBookingsPage: React.FC = () => {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'diajukan' | 'disetujui' | 'ditolak' | 'selesai'>('all')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showQRModal, setShowQRModal] = useState(false)

  useEffect(() => {
    if (user) {
      fetchBookings()
    }
  }, [user])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await peminjamanAPI.getAll()
      const userBookings = response.data?.filter(booking => booking.id_user === user?.id_user) || []
      setBookings(userBookings)
    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast.error('Gagal memuat data peminjaman')
    } finally {
      setLoading(false)
    }
  }

  const filteredBookings = bookings.filter(booking => 
    filter === 'all' || booking.status === filter
  )

  const generateQRCode = async (booking: Booking) => {
    // Generate QR code using booking ID
    
    setSelectedBooking(booking)
    setShowQRModal(true)
  }

  // Document download feature removed

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Memuat peminjaman..." />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Peminjaman Saya</h1>
        <p className="text-gray-600">Kelola dan pantau status peminjaman Anda</p>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'Semua' },
            { key: 'diajukan', label: 'Diajukan' },
            { key: 'disetujui', label: 'Disetujui' },
            { key: 'ditolak', label: 'Ditolak' },
            { key: 'selesai', label: 'Selesai' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === key
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Calendar className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'all' ? 'Belum ada peminjaman' : `Tidak ada peminjaman ${filter}`}
          </h3>
          <p className="text-gray-600 mb-6">
            {filter === 'all' 
              ? 'Mulai ajukan peminjaman ruangan atau kendaraan'
              : `Tidak ada peminjaman dengan status ${filter}`
            }
          </p>
          <a
            href="/booking"
            className="btn btn-primary"
          >
            Ajukan Peminjaman
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div key={booking.id_peminjaman} className="card">
              <div className="card-content">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {booking.jenis_peminjaman === 'ruangan' ? (
                        <MapPin className="h-5 w-5 text-primary-600" />
                      ) : (
                        <Car className="h-5 w-5 text-primary-600" />
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {booking.jenis_peminjaman === 'ruangan'
                            ? `Ruangan ID: ${booking.id_ruangan}`
                            : `Kendaraan ID: ${booking.id_kendaraan}`
                          }
                        </h3>
                        <p className="text-sm text-gray-600">
                            {booking.jenis_peminjaman === 'ruangan'
                              ? `Ruangan ID: ${booking.id_ruangan}`
                              : `Kendaraan ID: ${booking.id_kendaraan}`
                            }
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>Mulai: {formatDateTime(booking.tanggal_mulai, booking.jam_mulai)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>Selesai: {formatDateTime(booking.tanggal_selesai, booking.jam_selesai)}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">Keperluan:</p>
                      <p className="text-gray-900">{booking.keperluan}</p>
                    </div>

                    {/* Admin notes not available in current schema */}
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      getStatusColor(booking.status)
                    }`}>
                      {getStatusText(booking.status)}
                    </span>

                    <div className="flex gap-2">
                      {booking.status === 'disetujui' && (
                        <button
                          onClick={() => generateQRCode(booking)}
                          className="btn btn-outline btn-sm"
                          title="Lihat QR Code"
                        >
                          <QrCode className="h-4 w-4" />
                        </button>
                      )}
                      
                      {/* Document download feature not available */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">QR Code Peminjaman</h3>
              <div className="mb-4">
                <div className="w-48 h-48 mx-auto bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <QrCode className="h-16 w-16 text-gray-400" />
                  <div className="text-xs text-gray-500 mt-2">
                    QR Code: {selectedBooking.id_peminjaman}
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Tunjukkan QR Code ini kepada petugas saat menggunakan fasilitas
              </p>
              <button
                onClick={() => setShowQRModal(false)}
                className="btn btn-primary w-full"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyBookingsPage