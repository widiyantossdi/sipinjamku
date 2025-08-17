import React, { useState, useEffect } from 'react'
import { peminjamanAPI, Booking } from '../../lib/api'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import { Search, Calendar, MapPin, Car, Users, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'



const AdminBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'diajukan' | 'disetujui' | 'ditolak' | 'selesai'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'ruangan' | 'kendaraan'>('all')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [adminNote, setAdminNote] = useState('')

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await peminjamanAPI.getAll()
      setBookings(response.data || [])
    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast.error('Gagal memuat data booking')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (bookingId: string, newStatus: 'disetujui' | 'ditolak', note?: string) => {
    setActionLoading(bookingId)
    try {
      const updateData: any = { status: newStatus }
      if (note) {
        updateData.catatan_admin = note
      }

      await peminjamanAPI.update(bookingId, updateData)

      toast.success(`Booking berhasil ${newStatus === 'disetujui' ? 'disetujui' : 'ditolak'}`)
      fetchBookings()
      setShowDetailModal(false)
      setAdminNote('')
    } catch (error) {
      console.error('Error updating booking:', error)
      toast.error('Gagal memperbarui status booking')
    } finally {
      setActionLoading(null)
    }
  }

  const handleCompleteBooking = async (bookingId: string) => {
    setActionLoading(bookingId)
    try {
      await peminjamanAPI.update(bookingId, { status: 'selesai' })

      toast.success('Booking berhasil diselesaikan')
      fetchBookings()
    } catch (error) {
      console.error('Error completing booking:', error)
      toast.error('Gagal menyelesaikan booking')
    } finally {
      setActionLoading(null)
    }
  }

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.keperluan.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter
    const bookingType = booking.id_ruangan ? 'ruangan' : 'kendaraan'
    const matchesType = typeFilter === 'all' || bookingType === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'diajukan': return 'bg-yellow-100 text-yellow-800'
      case 'disetujui': return 'bg-green-100 text-green-800'
      case 'ditolak': return 'bg-red-100 text-red-800'
      case 'selesai': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'diajukan': return 'Menunggu'
      case 'disetujui': return 'Disetujui'
      case 'ditolak': return 'Ditolak'
      case 'selesai': return 'Selesai'
      default: return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'diajukan': return <Clock className="h-4 w-4" />
      case 'disetujui': return <CheckCircle className="h-4 w-4" />
      case 'ditolak': return <XCircle className="h-4 w-4" />
      case 'selesai': return <CheckCircle className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy, HH:mm', { locale: id })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Memuat booking..." />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Kelola Booking</h1>
        <p className="text-gray-600">Kelola dan pantau semua booking ruangan dan kendaraan</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari booking..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as any)}
          className="input w-full sm:w-auto"
        >
          <option value="all">Semua Jenis</option>
          <option value="ruangan">Ruangan</option>
          <option value="kendaraan">Kendaraan</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="input w-full sm:w-auto"
        >
          <option value="all">Semua Status</option>
          <option value="diajukan">Menunggu</option>
          <option value="disetujui">Disetujui</option>
          <option value="ditolak">Ditolak</option>
          <option value="selesai">Selesai</option>
        </select>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' ? 'Tidak ada booking yang sesuai' : 'Belum ada booking'}
          </h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'Coba ubah filter pencarian'
              : 'Booking akan muncul di sini ketika ada yang dibuat'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div key={booking.id_peminjaman} className="card">
              <div className="card-content">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      {booking.id_ruangan ? (
                        <MapPin className="h-5 w-5 text-primary-600" />
                      ) : (
                        <Car className="h-5 w-5 text-primary-600" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {booking.id_ruangan 
                            ? `Ruangan ID: ${booking.id_ruangan}` 
                            : `Kendaraan ID: ${booking.id_kendaraan}`
                          }
                        </h3>
                        <span className="text-sm text-gray-500">
                          {booking.id_ruangan 
                            ? 'Ruangan' 
                            : 'Kendaraan'
                          }
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>User ID: {booking.id_user}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {formatDate(booking.tanggal_mulai)} - {formatDate(booking.tanggal_selesai)}
                          </span>
                        </div>
                        <p className="text-gray-700 mt-2">
                          <strong>Keperluan:</strong> {booking.keperluan}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {getStatusIcon(booking.status)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        getStatusColor(booking.status)
                      }`}>
                        {getStatusText(booking.status)}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => {
                        setSelectedBooking(booking)
                        setShowDetailModal(true)
                      }}
                      className="btn btn-outline btn-sm"
                    >
                      Detail
                    </button>
                  </div>
                </div>
                
                {booking.status === 'diajukan' && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleStatusUpdate(booking.id_peminjaman, 'disetujui')}
                      disabled={actionLoading === booking.id_peminjaman}
                      className="btn btn-primary btn-sm">
                      {actionLoading === booking.id_peminjaman ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Setujui
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedBooking(booking)
                        setShowDetailModal(true)
                      }}
                      className="btn btn-outline btn-sm text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Tolak
                    </button>
                  </div>
                )}
                
                {booking.status === 'disetujui' && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleCompleteBooking(booking.id_peminjaman)}
                      disabled={actionLoading === booking.id_peminjaman}
                      className="btn btn-primary btn-sm"
                    >
                      {actionLoading === booking.id_peminjaman ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Selesaikan
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Detail Booking</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jenis Booking
                  </label>
                  <p className="text-gray-900 capitalize">{selectedBooking.id_ruangan ? 'Ruangan' : 'Kendaraan'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {selectedBooking.id_ruangan ? 'Ruangan' : 'Kendaraan'}
                  </label>
                  <p className="text-gray-900">
                    {selectedBooking.id_ruangan 
                      ? `Ruangan ID: ${selectedBooking.id_ruangan}`
                      : `Kendaraan ID: ${selectedBooking.id_kendaraan}`
                    }
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pemohon
                  </label>
                  <p className="text-gray-900">User ID: {selectedBooking.id_user}</p>
                  <p className="text-sm text-gray-600">-</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedBooking.status)}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      getStatusColor(selectedBooking.status)
                    }`}>
                      {getStatusText(selectedBooking.status)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal & Waktu
                </label>
                <p className="text-gray-900">
                  {formatDate(selectedBooking.tanggal_mulai)} - {formatDate(selectedBooking.tanggal_selesai)}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Keperluan
                </label>
                <p className="text-gray-900">{selectedBooking.keperluan}</p>
              </div>
              

              
              {selectedBooking.status === 'diajukan' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catatan (Opsional)
                  </label>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    className="input"
                    rows={3}
                    placeholder="Tambahkan catatan untuk pemohon..."
                  />
                </div>
              )}
            </div>
            
            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowDetailModal(false)
                  setAdminNote('')
                }}
                className="btn btn-outline flex-1"
              >
                Tutup
              </button>
              
              {selectedBooking.status === 'diajukan' && (
                <>
                  <button
                    onClick={() => handleStatusUpdate(selectedBooking.id_peminjaman, 'ditolak', adminNote)}
                    disabled={actionLoading === selectedBooking.id_peminjaman}
                    className="btn btn-outline text-red-600 border-red-300 hover:bg-red-50"
                  >
                    {actionLoading === selectedBooking.id_peminjaman ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      'Tolak'
                    )}
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedBooking.id_peminjaman, 'disetujui', adminNote)}
                    disabled={actionLoading === selectedBooking.id_peminjaman}
                    className="btn btn-primary"
                  >
                    {actionLoading === selectedBooking.id_peminjaman ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      'Setujui'
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminBookings