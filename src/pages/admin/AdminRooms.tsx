import React, { useState, useEffect } from 'react'
import { ruanganAPI } from '../../lib/api'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import { Plus, Edit, Trash2, MapPin, Users, Search } from 'lucide-react'
import toast from 'react-hot-toast'

interface Room {
  id_ruangan: string
  nama_ruangan: string
  lokasi: string
  kapasitas: number
  fasilitas?: string
  status: 'tersedia' | 'tidak_tersedia' | 'maintenance'
  created_at?: string
}

interface RoomFormData {
  nama_ruangan: string
  lokasi: string
  kapasitas: number
  fasilitas?: string
  status: 'tersedia' | 'tidak_tersedia' | 'maintenance'
}

const AdminRooms: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'tersedia' | 'tidak_tersedia' | 'maintenance'>('all')
  const [formData, setFormData] = useState<RoomFormData>({
    nama_ruangan: '',
    lokasi: '',
    kapasitas: 0,
    fasilitas: '',
    status: 'tersedia'
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      setLoading(true)
      const response = await ruanganAPI.getAll()
      setRooms(response.data || [])
    } catch (error) {
      console.error('Error fetching rooms:', error)
      toast.error('Gagal memuat data ruangan')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const roomData = {
        nama_ruangan: formData.nama_ruangan,
        lokasi: formData.lokasi,
        kapasitas: formData.kapasitas,
        fasilitas: formData.fasilitas,
        status: formData.status
      }

      if (editingRoom) {
        await ruanganAPI.update(editingRoom.id_ruangan, roomData)
        toast.success('Ruangan berhasil diperbarui')
      } else {
        await ruanganAPI.create(roomData)
        toast.success('Ruangan berhasil ditambahkan')
      }

      setShowModal(false)
      setEditingRoom(null)
      setFormData({
        nama_ruangan: '',
        lokasi: '',
        kapasitas: 0,
        fasilitas: '',
        status: 'tersedia'
      })
      fetchRooms()
    } catch (error) {
      console.error('Error saving room:', error)
      toast.error('Gagal menyimpan ruangan')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (room: Room) => {
    setEditingRoom(room)
    setFormData({
      nama_ruangan: room.nama_ruangan,
      lokasi: room.lokasi,
      kapasitas: room.kapasitas,
      fasilitas: Array.isArray(room.fasilitas) ? room.fasilitas.join(', ') : room.fasilitas || '',
      status: room.status
    })
    setShowModal(true)
  }

  const handleDelete = async (room: Room) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus ruangan "${room.nama_ruangan}"?`)) {
      return
    }

    try {
      await ruanganAPI.delete(room.id_ruangan)
      toast.success('Ruangan berhasil dihapus')
      fetchRooms()
    } catch (error) {
      console.error('Error deleting room:', error)
      toast.error('Gagal menghapus ruangan')
    }
  }

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.nama_ruangan.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.lokasi.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || room.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'tersedia': return 'bg-green-100 text-green-800'
      case 'tidak_tersedia': return 'bg-red-100 text-red-800'
      case 'maintenance': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'tersedia': return 'Tersedia'
      case 'tidak_tersedia': return 'Tidak Tersedia'
      case 'maintenance': return 'Maintenance'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Memuat ruangan..." />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Kelola Ruangan</h1>
            <p className="text-gray-600">Tambah, edit, dan kelola ruangan universitas</p>
          </div>
          <button
            onClick={() => {
              setEditingRoom(null)
              setFormData({
                nama_ruangan: '',
                lokasi: '',
                kapasitas: 0,
                fasilitas: '',
                status: 'tersedia'
              })
              setShowModal(true)
            }}
            className="btn btn-primary"
          >
            <Plus className="h-5 w-5 mr-2" />
            Tambah Ruangan
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari ruangan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="input w-full sm:w-auto"
        >
          <option value="all">Semua Status</option>
          <option value="tersedia">Tersedia</option>
          <option value="tidak_tersedia">Tidak Tersedia</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      {/* Rooms Grid */}
      {filteredRooms.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || statusFilter !== 'all' ? 'Tidak ada ruangan yang sesuai' : 'Belum ada ruangan'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter !== 'all' 
              ? 'Coba ubah filter pencarian'
              : 'Tambahkan ruangan pertama untuk memulai'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <div key={room.id_ruangan} className="card">
              <div className="card-content">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <MapPin className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{room.nama_ruangan}</h3>
                      <p className="text-sm text-gray-600">{room.lokasi}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    getStatusColor(room.status)
                  }`}>
                    {getStatusText(room.status)}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>Kapasitas: {room.kapasitas} orang</span>
                  </div>

                  {room.fasilitas && (Array.isArray(room.fasilitas) ? room.fasilitas.length > 0 : room.fasilitas.split(',').length > 0) && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Fasilitas:</p>
                      <div className="flex flex-wrap gap-1">
                        {room.fasilitas?.split(',').slice(0, 3).map((fasilitas: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            {fasilitas}
                          </span>
                        ))}
                        {room.fasilitas && room.fasilitas.split(',').length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            +{room.fasilitas.split(',').length - 3} lainnya
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleEdit(room)}
                    className="btn btn-outline btn-sm flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(room)}
                    className="btn btn-outline btn-sm text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingRoom ? 'Edit Ruangan' : 'Tambah Ruangan'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Ruangan
                </label>
                <input
                  type="text"
                  value={formData.nama_ruangan}
                  onChange={(e) => setFormData(prev => ({ ...prev, nama_ruangan: e.target.value }))}
                  className="input"
                  placeholder="Masukkan nama ruangan"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lokasi
                </label>
                <input
                  type="text"
                  value={formData.lokasi}
                  onChange={(e) => setFormData(prev => ({ ...prev, lokasi: e.target.value }))}
                  className="input"
                  placeholder="Masukkan lokasi ruangan"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kapasitas
                </label>
                <input
                  type="number"
                  value={formData.kapasitas}
                  onChange={(e) => setFormData(prev => ({ ...prev, kapasitas: parseInt(e.target.value) || 0 }))}
                  className="input"
                  placeholder="Masukkan kapasitas"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fasilitas
                </label>
                <input
                  type="text"
                  value={formData.fasilitas}
                  onChange={(e) => setFormData(prev => ({ ...prev, fasilitas: e.target.value }))}
                  className="input"
                  placeholder="Pisahkan dengan koma (contoh: Proyektor, AC, Whiteboard)"
                />
                <p className="text-xs text-gray-500 mt-1">Pisahkan fasilitas dengan koma</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="input"
                  required
                >
                  <option value="tersedia">Tersedia</option>
                  <option value="tidak_tersedia">Tidak Tersedia</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-outline flex-1"
                  disabled={submitting}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary flex-1"
                >
                  {submitting ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Menyimpan...</span>
                    </>
                  ) : (
                    editingRoom ? 'Perbarui' : 'Tambah'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminRooms