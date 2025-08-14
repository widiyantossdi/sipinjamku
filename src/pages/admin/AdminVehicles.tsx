import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import { Plus, Edit, Trash2, Car, Search, Fuel, Users } from 'lucide-react'
import toast from 'react-hot-toast'

interface Vehicle {
  id: string
  nama: string
  jenis: 'mobil' | 'motor' | 'bus' | 'truk'
  plat_nomor: string
  kapasitas: number
  bahan_bakar: string
  status: 'tersedia' | 'tidak_tersedia' | 'maintenance'
  created_at: string
}

interface VehicleFormData {
  nama: string
  jenis: 'mobil' | 'motor' | 'bus' | 'truk'
  plat_nomor: string
  kapasitas: number
  bahan_bakar: string
  status: 'tersedia' | 'tidak_tersedia' | 'maintenance'
}

const AdminVehicles: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'tersedia' | 'tidak_tersedia' | 'maintenance'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'mobil' | 'motor' | 'bus' | 'truk'>('all')
  const [formData, setFormData] = useState<VehicleFormData>({
    nama: '',
    jenis: 'mobil',
    plat_nomor: '',
    kapasitas: 0,
    bahan_bakar: '',
    status: 'tersedia'
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('kendaraan')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setVehicles(data || [])
    } catch (error) {
      console.error('Error fetching vehicles:', error)
      toast.error('Gagal memuat data kendaraan')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const vehicleData = {
        nama: formData.nama,
        jenis: formData.jenis,
        plat_nomor: formData.plat_nomor.toUpperCase(),
        kapasitas: formData.kapasitas,
        bahan_bakar: formData.bahan_bakar,
        status: formData.status
      }

      if (editingVehicle) {
        const { error } = await supabase
          .from('kendaraan')
          .update(vehicleData)
          .eq('id', editingVehicle.id)

        if (error) throw error
        toast.success('Kendaraan berhasil diperbarui')
      } else {
        const { error } = await supabase
          .from('kendaraan')
          .insert([vehicleData])

        if (error) throw error
        toast.success('Kendaraan berhasil ditambahkan')
      }

      setShowModal(false)
      setEditingVehicle(null)
      setFormData({
        nama: '',
        jenis: 'mobil',
        plat_nomor: '',
        kapasitas: 0,
        bahan_bakar: '',
        status: 'tersedia'
      })
      fetchVehicles()
    } catch (error) {
      console.error('Error saving vehicle:', error)
      toast.error('Gagal menyimpan kendaraan')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    setFormData({
      nama: vehicle.nama,
      jenis: vehicle.jenis,
      plat_nomor: vehicle.plat_nomor,
      kapasitas: vehicle.kapasitas,
      bahan_bakar: vehicle.bahan_bakar,
      status: vehicle.status
    })
    setShowModal(true)
  }

  const handleDelete = async (vehicle: Vehicle) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus kendaraan "${vehicle.nama}"?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('kendaraan')
        .delete()
        .eq('id', vehicle.id)

      if (error) throw error
      toast.success('Kendaraan berhasil dihapus')
      fetchVehicles()
    } catch (error) {
      console.error('Error deleting vehicle:', error)
      toast.error('Gagal menghapus kendaraan')
    }
  }

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.plat_nomor.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter
    const matchesType = typeFilter === 'all' || vehicle.jenis === typeFilter
    return matchesSearch && matchesStatus && matchesType
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

  const getTypeText = (type: string) => {
    switch (type) {
      case 'mobil': return 'Mobil'
      case 'motor': return 'Motor'
      case 'bus': return 'Bus'
      case 'truk': return 'Truk'
      default: return type
    }
  }

  const getTypeIcon = () => {
    return <Car className="h-5 w-5" />
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Memuat kendaraan..." />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Kelola Kendaraan</h1>
            <p className="text-gray-600">Tambah, edit, dan kelola kendaraan universitas</p>
          </div>
          <button
            onClick={() => {
              setEditingVehicle(null)
              setFormData({
                nama: '',
                jenis: 'mobil',
                plat_nomor: '',
                kapasitas: 0,
                bahan_bakar: '',
                status: 'tersedia'
              })
              setShowModal(true)
            }}
            className="btn btn-primary"
          >
            <Plus className="h-5 w-5 mr-2" />
            Tambah Kendaraan
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari kendaraan..."
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
          <option value="mobil">Mobil</option>
          <option value="motor">Motor</option>
          <option value="bus">Bus</option>
          <option value="truk">Truk</option>
        </select>
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

      {/* Vehicles Grid */}
      {filteredVehicles.length === 0 ? (
        <div className="text-center py-12">
          <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' ? 'Tidak ada kendaraan yang sesuai' : 'Belum ada kendaraan'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'Coba ubah filter pencarian'
              : 'Tambahkan kendaraan pertama untuk memulai'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => (
            <div key={vehicle.id} className="card">
              <div className="card-content">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      {getTypeIcon()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{vehicle.nama}</h3>
                      <p className="text-sm text-gray-600">{vehicle.plat_nomor}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    getStatusColor(vehicle.status)
                  }`}>
                    {getStatusText(vehicle.status)}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Jenis:</span>
                    <span className="font-medium text-gray-900">{getTypeText(vehicle.jenis)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>Kapasitas: {vehicle.kapasitas} orang</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Fuel className="h-4 w-4" />
                    <span>Bahan Bakar: {vehicle.bahan_bakar}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleEdit(vehicle)}
                    className="btn btn-outline btn-sm flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(vehicle)}
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
              {editingVehicle ? 'Edit Kendaraan' : 'Tambah Kendaraan'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Kendaraan
                </label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData(prev => ({ ...prev, nama: e.target.value }))}
                  className="input"
                  placeholder="Masukkan nama kendaraan"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jenis Kendaraan
                </label>
                <select
                  value={formData.jenis}
                  onChange={(e) => setFormData(prev => ({ ...prev, jenis: e.target.value as any }))}
                  className="input"
                  required
                >
                  <option value="mobil">Mobil</option>
                  <option value="motor">Motor</option>
                  <option value="bus">Bus</option>
                  <option value="truk">Truk</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plat Nomor
                </label>
                <input
                  type="text"
                  value={formData.plat_nomor}
                  onChange={(e) => setFormData(prev => ({ ...prev, plat_nomor: e.target.value }))}
                  className="input"
                  placeholder="Masukkan plat nomor"
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
                  Bahan Bakar
                </label>
                <input
                  type="text"
                  value={formData.bahan_bakar}
                  onChange={(e) => setFormData(prev => ({ ...prev, bahan_bakar: e.target.value }))}
                  className="input"
                  placeholder="Contoh: Bensin, Solar, Listrik"
                  required
                />
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
                    editingVehicle ? 'Perbarui' : 'Tambah'
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

export default AdminVehicles