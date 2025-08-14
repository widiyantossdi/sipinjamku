import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase, Tables } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { 
  Building, 
  Car, 
  FileText, 
  Upload, 
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Users,
  MapPin
} from 'lucide-react'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import { formatDate, isDateTimeConflict } from '../../utils'
import toast from 'react-hot-toast'

interface BookingFormData {
  jenis_peminjaman: 'ruangan' | 'kendaraan'
  id_ruangan: string | null
  id_kendaraan: string | null
  tanggal_mulai: string
  jam_mulai: string
  tanggal_selesai: string
  jam_selesai: string
  keperluan: string
  file_surat: File | null
}

const BookingPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [rooms, setRooms] = useState<Tables<'ruangan'>[]>([])
  const [vehicles, setVehicles] = useState<Tables<'kendaraan'>[]>([])
  const [existingBookings, setExistingBookings] = useState<Tables<'peminjaman'>[]>([])
  const [conflicts, setConflicts] = useState<string[]>([])

  const [formData, setFormData] = useState<BookingFormData>({
    jenis_peminjaman: 'ruangan',
    id_ruangan: null,
    id_kendaraan: null,
    tanggal_mulai: '',
    jam_mulai: '',
    tanggal_selesai: '',
    jam_selesai: '',
    keperluan: '',
    file_surat: null
  })

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    
    // Check if coming from room/vehicle selection
    if (location.state?.type && location.state?.item) {
      const { type, item } = location.state
      setFormData(prev => ({
        ...prev,
        jenis_peminjaman: type,
        id_ruangan: type === 'ruangan' ? item.id_ruangan : null,
        id_kendaraan: type === 'kendaraan' ? item.id_kendaraan : null
      }))
    }

    fetchData()
  }, [user, navigate, location.state])

  useEffect(() => {
    checkConflicts()
  }, [formData.jenis_peminjaman, formData.id_ruangan, formData.id_kendaraan, formData.tanggal_mulai, formData.jam_mulai, formData.tanggal_selesai, formData.jam_selesai])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch rooms
      const { data: roomsData, error: roomsError } = await supabase
        .from('ruangan')
        .select('*')
        .eq('status', 'tersedia')
        .order('nama_ruangan')

      if (roomsError) throw roomsError
      setRooms(roomsData || [])

      // Fetch vehicles
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('kendaraan')
        .select('*')
        .eq('status', 'tersedia')
        .order('jenis')

      if (vehiclesError) throw vehiclesError
      setVehicles(vehiclesData || [])

      // Fetch existing bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('peminjaman')
        .select('*')
        .in('status', ['diajukan', 'disetujui'])

      if (bookingsError) throw bookingsError
      setExistingBookings(bookingsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  const checkConflicts = () => {
    if (!formData.tanggal_mulai || !formData.jam_mulai || !formData.tanggal_selesai || !formData.jam_selesai) {
      setConflicts([])
      return
    }

    const newConflicts: string[] = []
    const startDateTime = new Date(`${formData.tanggal_mulai}T${formData.jam_mulai}`)
    const endDateTime = new Date(`${formData.tanggal_selesai}T${formData.jam_selesai}`)

    // Check if end time is after start time
    if (endDateTime <= startDateTime) {
      newConflicts.push('Waktu selesai harus setelah waktu mulai')
    }

    // Check conflicts with existing bookings
    const relevantBookings = existingBookings.filter(booking => {
      if (formData.jenis_peminjaman === 'ruangan') {
        return booking.jenis_peminjaman === 'ruangan' && booking.id_ruangan === formData.id_ruangan
      } else {
        return booking.jenis_peminjaman === 'kendaraan' && booking.id_kendaraan === formData.id_kendaraan
      }
    })

    relevantBookings.forEach(booking => {

      
      if (isDateTimeConflict(
        formData.tanggal_mulai,
        formData.jam_mulai,
        formData.tanggal_selesai,
        formData.jam_selesai,
        booking.tanggal_mulai,
        booking.jam_mulai,
        booking.tanggal_selesai,
        booking.jam_selesai
      )) {
        newConflicts.push(`Bentrok dengan peminjaman lain pada ${formatDate(booking.tanggal_mulai)} ${booking.jam_mulai}-${booking.jam_selesai}`)
      }
    })

    setConflicts(newConflicts)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData(prev => ({
      ...prev,
      file_surat: file
    }))
  }

  const handleTypeChange = (type: 'ruangan' | 'kendaraan') => {
    setFormData(prev => ({
      ...prev,
      jenis_peminjaman: type,
      id_ruangan: type === 'ruangan' ? prev.id_ruangan : null,
      id_kendaraan: type === 'kendaraan' ? prev.id_kendaraan : null
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast.error('Anda harus login terlebih dahulu')
      return
    }

    if (conflicts.length > 0) {
      toast.error('Harap perbaiki konflik waktu terlebih dahulu')
      return
    }

    try {
      setSubmitting(true)
      
      let fileUrl = null
      
      // Upload file if exists
      if (formData.file_surat) {
        const fileExt = formData.file_surat.name.split('.').pop()
        const fileName = `${user.id}_${Date.now()}.${fileExt}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, formData.file_surat)

        if (uploadError) throw uploadError
        fileUrl = uploadData.path
      }

      // Generate QR Code data
      const qrData = {
        id_peminjaman: `temp_${Date.now()}`,
        jenis: formData.jenis_peminjaman,
        user_id: user.id,
        tanggal: formData.tanggal_mulai,
        waktu: `${formData.jam_mulai}-${formData.jam_selesai}`
      }

      // Insert booking
      const { error } = await supabase
        .from('peminjaman')
        .insert({
          id_user: user.id,
          jenis_peminjaman: formData.jenis_peminjaman,
          id_ruangan: formData.id_ruangan,
          id_kendaraan: formData.id_kendaraan,
          tanggal_mulai: formData.tanggal_mulai,
          jam_mulai: formData.jam_mulai,
          tanggal_selesai: formData.tanggal_selesai,
          jam_selesai: formData.jam_selesai,
          keperluan: formData.keperluan,
          file_surat: fileUrl,
          status: 'diajukan',
          qr_code: JSON.stringify(qrData)
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Pengajuan peminjaman berhasil dikirim!')
      navigate('/dashboard')
    } catch (error: any) {
      console.error('Error submitting booking:', error)
      toast.error(error.message || 'Gagal mengirim pengajuan')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Memuat form peminjaman..." />
      </div>
    )
  }

  const selectedRoom = rooms.find(r => r.id_ruangan === formData.id_ruangan)
  const selectedVehicle = vehicles.find(v => v.id_kendaraan === formData.id_kendaraan)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Kembali
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Ajukan Peminjaman</h1>
          <p className="text-gray-600">
            Isi form berikut untuk mengajukan peminjaman ruangan atau kendaraan
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Type Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Jenis Peminjaman</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleTypeChange('ruangan')}
                className={`p-6 rounded-lg border-2 transition-colors ${
                  formData.jenis_peminjaman === 'ruangan'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Building className={`w-12 h-12 mx-auto mb-3 ${
                  formData.jenis_peminjaman === 'ruangan' ? 'text-primary-600' : 'text-gray-400'
                }`} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ruangan</h3>
                <p className="text-sm text-gray-600">Pinjam ruangan untuk kegiatan, rapat, atau acara</p>
              </button>
              
              <button
                type="button"
                onClick={() => handleTypeChange('kendaraan')}
                className={`p-6 rounded-lg border-2 transition-colors ${
                  formData.jenis_peminjaman === 'kendaraan'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Car className={`w-12 h-12 mx-auto mb-3 ${
                  formData.jenis_peminjaman === 'kendaraan' ? 'text-primary-600' : 'text-gray-400'
                }`} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Kendaraan</h3>
                <p className="text-sm text-gray-600">Pinjam kendaraan untuk perjalanan dinas atau kegiatan</p>
              </button>
            </div>
          </div>

          {/* Asset Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Pilih {formData.jenis_peminjaman === 'ruangan' ? 'Ruangan' : 'Kendaraan'}
            </h2>
            
            {formData.jenis_peminjaman === 'ruangan' ? (
              <div className="space-y-4">
                <select
                  name="id_ruangan"
                  value={formData.id_ruangan || ''}
                  onChange={handleInputChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Pilih Ruangan</option>
                  {rooms.map(room => (
                    <option key={room.id_ruangan} value={room.id_ruangan}>
                      {room.nama_ruangan} - {room.lokasi} (Kapasitas: {room.kapasitas})
                    </option>
                  ))}
                </select>
                
                {selectedRoom && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">{selectedRoom.nama_ruangan}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{selectedRoom.lokasi}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        <span>Kapasitas: {selectedRoom.kapasitas} orang</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        <strong>Fasilitas:</strong> {selectedRoom.fasilitas}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <select
                  name="id_kendaraan"
                  value={formData.id_kendaraan || ''}
                  onChange={handleInputChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Pilih Kendaraan</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.id_kendaraan} value={vehicle.id_kendaraan}>
                      {vehicle.jenis} {vehicle.merk} - {vehicle.plat_nomor} (Kapasitas: {vehicle.kapasitas_penumpang})
                    </option>
                  ))}
                </select>
                
                {selectedVehicle && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">
                      {selectedVehicle.jenis} {selectedVehicle.merk}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <strong>Plat Nomor:</strong> {selectedVehicle.plat_nomor}
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        <span>Kapasitas: {selectedVehicle.kapasitas_penumpang} penumpang</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Date and Time */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Waktu Peminjaman</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  name="tanggal_mulai"
                  value={formData.tanggal_mulai}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jam Mulai
                </label>
                <input
                  type="time"
                  name="jam_mulai"
                  value={formData.jam_mulai}
                  onChange={handleInputChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Selesai
                </label>
                <input
                  type="date"
                  name="tanggal_selesai"
                  value={formData.tanggal_selesai}
                  onChange={handleInputChange}
                  min={formData.tanggal_mulai || new Date().toISOString().split('T')[0]}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jam Selesai
                </label>
                <input
                  type="time"
                  name="jam_selesai"
                  value={formData.jam_selesai}
                  onChange={handleInputChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            
            {/* Conflicts Warning */}
            {conflicts.length > 0 && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex">
                  <AlertCircle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800 mb-1">Konflik Waktu Ditemukan:</h3>
                    <ul className="text-sm text-red-700 space-y-1">
                      {conflicts.map((conflict, index) => (
                        <li key={index}>• {conflict}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Purpose and Documents */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Keperluan dan Dokumen</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keperluan Peminjaman *
                </label>
                <textarea
                  name="keperluan"
                  value={formData.keperluan}
                  onChange={handleInputChange}
                  rows={4}
                  required
                  placeholder="Jelaskan keperluan peminjaman secara detail..."
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Surat Pendukung (Opsional)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                        <span>Upload file</span>
                        <input
                          type="file"
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">atau drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PDF, DOC, DOCX, JPG, PNG hingga 10MB
                    </p>
                    {formData.file_surat && (
                      <p className="text-sm text-green-600 mt-2">
                        <CheckCircle className="w-4 h-4 inline mr-1" />
                        {formData.file_surat.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Kirim Pengajuan</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Pastikan semua data sudah benar sebelum mengirim
                </p>
              </div>
              <button
                type="submit"
                disabled={submitting || conflicts.length > 0}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5 mr-2" />
                    Kirim Pengajuan
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BookingPage