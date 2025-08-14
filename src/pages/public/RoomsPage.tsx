import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, Tables } from '../../lib/supabase'
import { 
  Building, 
  Users, 
  MapPin, 
  Search, 
  Filter,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import { getStatusColor, getStatusText } from '../../utils'

const RoomsPage: React.FC = () => {
  const [rooms, setRooms] = useState<Tables<'ruangan'>[]>([])
  const [filteredRooms, setFilteredRooms] = useState<Tables<'ruangan'>[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [capacityFilter, setCapacityFilter] = useState<string>('all')

  useEffect(() => {
    fetchRooms()
  }, [])

  useEffect(() => {
    filterRooms()
  }, [rooms, searchTerm, statusFilter, capacityFilter])

  const fetchRooms = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('ruangan')
        .select('*')
        .order('nama_ruangan', { ascending: true })

      if (error) throw error
      setRooms(data || [])
    } catch (error) {
      console.error('Error fetching rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterRooms = () => {
    let filtered = [...rooms]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(room => 
        room.nama_ruangan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.lokasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.fasilitas.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(room => room.status === statusFilter)
    }

    // Capacity filter
    if (capacityFilter !== 'all') {
      const [min, max] = capacityFilter.split('-').map(Number)
      if (max) {
        filtered = filtered.filter(room => room.kapasitas >= min && room.kapasitas <= max)
      } else {
        filtered = filtered.filter(room => room.kapasitas >= min)
      }
    }

    setFilteredRooms(filtered)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'tersedia':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'tidak_tersedia':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'maintenance':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-600" />
    }
  }

  const getCapacityCategory = (capacity: number) => {
    if (capacity <= 10) return 'Kecil'
    if (capacity <= 30) return 'Sedang'
    if (capacity <= 50) return 'Besar'
    return 'Sangat Besar'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Memuat data ruangan..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Data Ruangan</h1>
          <p className="text-gray-600">
            Lihat semua ruangan yang tersedia untuk dipinjam di UNUGHA Cilacap
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari ruangan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">Semua Status</option>
                <option value="tersedia">Tersedia</option>
                <option value="tidak_tersedia">Tidak Tersedia</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            {/* Capacity Filter */}
            <div>
              <select
                value={capacityFilter}
                onChange={(e) => setCapacityFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">Semua Kapasitas</option>
                <option value="1-10">1-10 Orang</option>
                <option value="11-30">11-30 Orang</option>
                <option value="31-50">31-50 Orang</option>
                <option value="51">50+ Orang</option>
              </select>
            </div>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
                setCapacityFilter('all')
              }}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Filter className="w-4 h-4 mr-2" />
              Reset Filter
            </button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600">
            Menampilkan {filteredRooms.length} dari {rooms.length} ruangan
          </p>
        </div>

        {/* Rooms Grid */}
        {filteredRooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <div key={room.id_ruangan} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Room Image Placeholder */}
                <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                  <Building className="w-16 h-16 text-primary-600" />
                </div>

                {/* Room Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {room.nama_ruangan}
                    </h3>
                    <div className="flex items-center">
                      {getStatusIcon(room.status)}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="text-sm">{room.lokasi}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      <span className="text-sm">
                        {room.kapasitas} orang ({getCapacityCategory(room.kapasitas)})
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mb-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(room.status)}`}>
                      {getStatusText(room.status)}
                    </span>
                  </div>

                  {/* Facilities */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Fasilitas:</h4>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {room.fasilitas}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Link
                      to="/calendar"
                      className="flex-1 bg-primary-600 text-white text-center py-2 px-4 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
                    >
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Lihat Jadwal
                    </Link>
                    {room.status === 'tersedia' && (
                      <Link
                        to="/booking"
                        state={{ type: 'ruangan', item: room }}
                        className="flex-1 bg-green-600 text-white text-center py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                      >
                        Pinjam
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada ruangan ditemukan</h3>
            <p className="text-gray-600 mb-4">
              Coba ubah filter pencarian atau kata kunci Anda
            </p>
            <button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
                setCapacityFilter('all')
              }}
              className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
            >
              Reset Filter
            </button>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {rooms.filter(r => r.status === 'tersedia').length}
            </div>
            <div className="text-gray-600">Ruangan Tersedia</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {Math.round(rooms.reduce((sum, r) => sum + r.kapasitas, 0) / rooms.length) || 0}
            </div>
            <div className="text-gray-600">Rata-rata Kapasitas</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {rooms.length}
            </div>
            <div className="text-gray-600">Total Ruangan</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoomsPage