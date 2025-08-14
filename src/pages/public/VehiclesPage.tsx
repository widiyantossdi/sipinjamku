import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, Tables } from '../../lib/supabase'
import { 
  Car, 
  Users, 
  Hash, 
  Search, 
  Filter,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Truck,
  Bus
} from 'lucide-react'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import { getStatusColor, getStatusText } from '../../utils'

const VehiclesPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Tables<'kendaraan'>[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<Tables<'kendaraan'>[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [capacityFilter, setCapacityFilter] = useState<string>('all')

  useEffect(() => {
    fetchVehicles()
  }, [])

  useEffect(() => {
    filterVehicles()
  }, [vehicles, searchTerm, statusFilter, typeFilter, capacityFilter])

  const fetchVehicles = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('kendaraan')
        .select('*')
        .order('jenis', { ascending: true })

      if (error) throw error
      setVehicles(data || [])
    } catch (error) {
      console.error('Error fetching vehicles:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterVehicles = () => {
    let filtered = [...vehicles]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(vehicle => 
        vehicle.jenis.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.merk.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.plat_nomor.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.status === statusFilter)
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.jenis.toLowerCase().includes(typeFilter.toLowerCase()))
    }

    // Capacity filter
    if (capacityFilter !== 'all') {
      const [min, max] = capacityFilter.split('-').map(Number)
      if (max) {
        filtered = filtered.filter(vehicle => vehicle.kapasitas_penumpang >= min && vehicle.kapasitas_penumpang <= max)
      } else {
        filtered = filtered.filter(vehicle => vehicle.kapasitas_penumpang >= min)
      }
    }

    setFilteredVehicles(filtered)
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

  const getVehicleIcon = (type: string) => {
    const lowerType = type.toLowerCase()
    if (lowerType.includes('mobil') || lowerType.includes('car')) {
      return <Car className="w-12 h-12 text-primary-600" />
    } else if (lowerType.includes('bus') || lowerType.includes('minibus')) {
      return <Bus className="w-12 h-12 text-primary-600" />
    } else if (lowerType.includes('truck') || lowerType.includes('truk')) {
      return <Truck className="w-12 h-12 text-primary-600" />
    }
    return <Car className="w-12 h-12 text-primary-600" />
  }

  const getCapacityCategory = (capacity: number) => {
    if (capacity <= 4) return 'Kecil'
    if (capacity <= 8) return 'Sedang'
    if (capacity <= 15) return 'Besar'
    return 'Sangat Besar'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Memuat data kendaraan..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Data Kendaraan</h1>
          <p className="text-gray-600">
            Lihat semua kendaraan yang tersedia untuk dipinjam di UNUGHA Cilacap
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari kendaraan..."
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

            {/* Type Filter */}
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">Semua Jenis</option>
                <option value="mobil">Mobil</option>
                <option value="bus">Bus</option>
                <option value="minibus">Minibus</option>
                <option value="truck">Truck</option>
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
                <option value="1-4">1-4 Penumpang</option>
                <option value="5-8">5-8 Penumpang</option>
                <option value="9-15">9-15 Penumpang</option>
                <option value="16">15+ Penumpang</option>
              </select>
            </div>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
                setTypeFilter('all')
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
            Menampilkan {filteredVehicles.length} dari {vehicles.length} kendaraan
          </p>
        </div>

        {/* Vehicles Grid */}
        {filteredVehicles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle) => (
              <div key={vehicle.id_kendaraan} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Vehicle Image Placeholder */}
                <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  {getVehicleIcon(vehicle.jenis)}
                </div>

                {/* Vehicle Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {vehicle.jenis}
                      </h3>
                      <p className="text-sm text-gray-600">{vehicle.merk}</p>
                    </div>
                    <div className="flex items-center">
                      {getStatusIcon(vehicle.status)}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600">
                      <Hash className="w-4 h-4 mr-2" />
                      <span className="text-sm font-mono">{vehicle.plat_nomor}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      <span className="text-sm">
                        {vehicle.kapasitas_penumpang} penumpang ({getCapacityCategory(vehicle.kapasitas_penumpang)})
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mb-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                      {getStatusText(vehicle.status)}
                    </span>
                  </div>

                  {/* Vehicle Type Badge */}
                  <div className="mb-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {vehicle.jenis}
                    </span>
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
                    {vehicle.status === 'tersedia' && (
                      <Link
                        to="/booking"
                        state={{ type: 'kendaraan', item: vehicle }}
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
            <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada kendaraan ditemukan</h3>
            <p className="text-gray-600 mb-4">
              Coba ubah filter pencarian atau kata kunci Anda
            </p>
            <button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
                setTypeFilter('all')
                setCapacityFilter('all')
              }}
              className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
            >
              Reset Filter
            </button>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {vehicles.filter(v => v.status === 'tersedia').length}
            </div>
            <div className="text-gray-600">Kendaraan Tersedia</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {Math.round(vehicles.reduce((sum, v) => sum + v.kapasitas_penumpang, 0) / vehicles.length) || 0}
            </div>
            <div className="text-gray-600">Rata-rata Kapasitas</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {new Set(vehicles.map(v => v.jenis)).size}
            </div>
            <div className="text-gray-600">Jenis Kendaraan</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {vehicles.length}
            </div>
            <div className="text-gray-600">Total Kendaraan</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VehiclesPage