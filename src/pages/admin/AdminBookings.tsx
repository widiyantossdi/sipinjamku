import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import { Search, Calendar, MapPin, Car, Users, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

interface Booking {
  id: string
  user_id: string
  jenis_booking: 'ruangan' | 'kendaraan'
  ruangan_id?: string
  kendaraan_id?: string
  tanggal_mulai: string
  tanggal_selesai: string
  keperluan: string
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  catatan_admin?: string
  created_at: string
  users: {
    nama: string
    email: string
  }
  ruangan?: {
    nama: string
    lokasi: string
  }
  kendaraan?: {
    nama: string
    plat_nomor: string
  }
}

const AdminBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'completed'>('all')
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
      const { data, error } = await supabase
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
        .order('created_at', { ascending: false })

      if (error) throw error
      setBookings(data || [])
    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast.error('Gagal memuat data booking')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (bookingId: string, newStatus: 'approved' | 'rejected', note?: string) => {
    setActionLoading(bookingId)
    try {
      const updateData: any = { status: newStatus }
      if (note) {
        updateData.catatan_admin = note
      }

      const { error } = await supabase
        .from('peminjaman')
        .update(updateData)
        .eq('id', bookingId)

      if (error) throw error

      toast.success(`Booking berhasil ${newStatus === 'approved' ? 'disetujui' : 'ditolak'}`)
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
      const { error } = await supabase
        .from('peminjaman')
        .update({ status: 'completed' })
        .eq('id', bookingId)

      if (error) throw error

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
      booking.users?.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.users?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.keperluan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.ruangan?.nama || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.kendaraan?.nama || '').toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter
    const matchesType = typeFilter === 'all' || booking.jenis_booking === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

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
          <option value="pending">Menunggu</option>
          <option value="approved">Disetujui</option>
          <option value="rejected">Ditolak</option>
          <option value="completed">Selesai</option>
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
            <div key={booking.id} className="card">
              <div className="card-content">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      {booking.jenis_booking === 'ruangan' ? (
                        <MapPin className="h-5 w-5 text-primary-600" />
                      ) : (
                        <Car className="h-5 w-5 text-primary-600" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {booking.jenis_booking === 'ruangan' 
                            ? booking.ruangan?.nama 
                            : booking.kendaraan?.nama
                          }
                        </h3>
                        <span className="text-sm text-gray-500">
                          {booking.jenis_booking === 'ruangan' 
                            ? booking.ruangan?.lokasi 
                            : booking.kendaraan?.plat_nomor
                          }
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{booking.users?.nama} ({booking.users?.email})</span>
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
                
                {booking.status === 'pending' && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleStatusUpdate(booking.id, 'approved')}
                      disabled={actionLoading === booking.id}
                      className="btn btn-primary btn-sm"
                    >
                      {actionLoading === booking.id ? (
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
                
                {booking.status === 'approved' && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleCompleteBooking(booking.id)}
                      disabled={actionLoading === booking.id}
                      className="btn btn-primary btn-sm"
                    >
                      {actionLoading === booking.id ? (
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
                  <p className="text-gray-900 capitalize">{selectedBooking.jenis_booking}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {selectedBooking.jenis_booking === 'ruangan' ? 'Ruangan' : 'Kendaraan'}
                  </label>
                  <p className="text-gray-900">
                    {selectedBooking.jenis_booking === 'ruangan' 
                      ? `${selectedBooking.ruangan?.nama} - ${selectedBooking.ruangan?.lokasi}`
                      : `${selectedBooking.kendaraan?.nama} (${selectedBooking.kendaraan?.plat_nomor})`
                    }
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pemohon
                  </label>
                  <p className="text-gray-900">{selectedBooking.users?.nama}</p>
                  <p className="text-sm text-gray-600">{selectedBooking.users?.email}</p>
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
              
              {selectedBooking.catatan_admin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catatan Admin
                  </label>
                  <p className="text-gray-900">{selectedBooking.catatan_admin}</p>
                </div>
              )}
              
              {selectedBooking.status === 'pending' && (
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
              
              {selectedBooking.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleStatusUpdate(selectedBooking.id, 'rejected', adminNote)}
                    disabled={actionLoading === selectedBooking.id}
                    className="btn btn-outline text-red-600 border-red-300 hover:bg-red-50"
                  >
                    {actionLoading === selectedBooking.id ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      'Tolak'
                    )}
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedBooking.id, 'approved', adminNote)}
                    disabled={actionLoading === selectedBooking.id}
                    className="btn btn-primary"
                  >
                    {actionLoading === selectedBooking.id ? (
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