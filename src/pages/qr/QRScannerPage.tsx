import React, { useState, useRef, useEffect } from 'react'
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode'
import { supabase } from '../../lib/supabase'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import { QrCode, Camera, CheckCircle, XCircle, AlertCircle, Calendar, MapPin, Car, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

interface BookingData {
  id: string
  jenis_booking: 'ruangan' | 'kendaraan'
  tanggal_mulai: string
  tanggal_selesai: string
  keperluan: string
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  created_at: string
  users: {
    nama: string
    email: string
    nim?: string
  }
  ruangan?: {
    nama: string
    lokasi: string
    kapasitas: number
  }
  kendaraan?: {
    nama: string
    plat_nomor: string
    jenis: string
  }
}

const QRScannerPage: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false)
  const [scannedData, setScannedData] = useState<BookingData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const qrCodeRef = useRef<Html5Qrcode | null>(null)

  useEffect(() => {
    return () => {
      // Cleanup scanner on unmount
      if (scannerRef.current) {
        scannerRef.current.clear()
      }
      if (qrCodeRef.current) {
        qrCodeRef.current.stop()
      }
    }
  }, [])

  const startScanner = () => {
    setIsScanning(true)
    setError(null)
    setScannedData(null)

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0
    }

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      config,
      false
    )

    scanner.render(
      (decodedText) => {
        handleScanSuccess(decodedText)
        scanner.clear()
        setIsScanning(false)
      },
      (error) => {
        // Handle scan error silently
        console.log('QR scan error:', error)
      }
    )

    scannerRef.current = scanner
  }

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear()
      scannerRef.current = null
    }
    setIsScanning(false)
  }

  const handleScanSuccess = async (decodedText: string) => {
    setLoading(true)
    setError(null)

    try {
      // Parse QR code data
      let bookingId: string
      
      try {
        // Try to parse as JSON first
        const qrData = JSON.parse(decodedText)
        bookingId = qrData.bookingId || qrData.id
      } catch {
        // If not JSON, treat as plain booking ID
        bookingId = decodedText
      }

      if (!bookingId) {
        throw new Error('QR Code tidak valid: ID booking tidak ditemukan')
      }

      // Fetch booking data from Supabase
      const { data: booking, error: fetchError } = await supabase
        .from('peminjaman')
        .select(`
          *,
          users:user_id (
            nama,
            email,
            nim
          ),
          ruangan:ruangan_id (
            nama,
            lokasi,
            kapasitas
          ),
          kendaraan:kendaraan_id (
            nama,
            plat_nomor,
            jenis
          )
        `)
        .eq('id', bookingId)
        .single()

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          throw new Error('Booking tidak ditemukan')
        }
        throw fetchError
      }

      setScannedData(booking)
      toast.success('QR Code berhasil dipindai!')
    } catch (error: any) {
      console.error('Error processing QR code:', error)
      const errorMessage = error.message || 'Gagal memproses QR Code'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus: 'approved' | 'rejected' | 'completed') => {
    if (!scannedData) return

    setActionLoading(true)
    try {
      const { error } = await supabase
        .from('peminjaman')
        .update({ status: newStatus })
        .eq('id', scannedData.id)

      if (error) throw error

      setScannedData({ ...scannedData, status: newStatus })
      
      const statusText = {
        approved: 'disetujui',
        rejected: 'ditolak',
        completed: 'diselesaikan'
      }[newStatus]
      
      toast.success(`Booking berhasil ${statusText}!`)
    } catch (error) {
      console.error('Error updating booking status:', error)
      toast.error('Gagal memperbarui status booking')
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'approved': return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Menunggu Persetujuan'
      case 'approved': return 'Disetujui'
      case 'rejected': return 'Ditolak'
      case 'completed': return 'Selesai'
      default: return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <AlertCircle className="h-5 w-5" />
      case 'approved': return <CheckCircle className="h-5 w-5" />
      case 'rejected': return <XCircle className="h-5 w-5" />
      case 'completed': return <CheckCircle className="h-5 w-5" />
      default: return <AlertCircle className="h-5 w-5" />
    }
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy, HH:mm', { locale: id })
  }

  const resetScanner = () => {
    setScannedData(null)
    setError(null)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary-100 rounded-full">
              <QrCode className="h-8 w-8 text-primary-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">QR Scanner</h1>
          </div>
          <p className="text-gray-600">
            Pindai QR Code booking untuk melihat detail dan mengelola status
          </p>
        </div>

        {/* Scanner Section */}
        {!scannedData && (
          <div className="card mb-6">
            <div className="card-content">
              {!isScanning ? (
                <div className="text-center py-8">
                  <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <Camera className="h-10 w-10 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Mulai Pemindaian
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Klik tombol di bawah untuk memulai pemindaian QR Code
                  </p>
                  <button
                    onClick={startScanner}
                    className="btn btn-primary"
                  >
                    <Camera className="h-5 w-5 mr-2" />
                    Mulai Scanner
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Pindai QR Code</h3>
                    <button
                      onClick={stopScanner}
                      className="btn btn-outline btn-sm"
                    >
                      Batal
                    </button>
                  </div>
                  <div id="qr-reader" className="w-full"></div>
                  {loading && (
                    <div className="mt-4 text-center">
                      <LoadingSpinner size="sm" text="Memproses QR Code..." />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="card border-red-200 bg-red-50 mb-6">
            <div className="card-content">
              <div className="flex items-center gap-3">
                <XCircle className="h-6 w-6 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-900">Error</h3>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
              <button
                onClick={resetScanner}
                className="btn btn-outline btn-sm mt-4"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        )}

        {/* Scanned Data Display */}
        {scannedData && (
          <div className="space-y-6">
            {/* Booking Details */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Detail Booking</h3>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
                    getStatusColor(scannedData.status)
                  }`}>
                    {getStatusIcon(scannedData.status)}
                    <span className="font-medium">
                      {getStatusText(scannedData.status)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="card-content">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Resource Info */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary-100 rounded-lg">
                        {scannedData.jenis_booking === 'ruangan' ? (
                          <MapPin className="h-5 w-5 text-primary-600" />
                        ) : (
                          <Car className="h-5 w-5 text-primary-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {scannedData.jenis_booking === 'ruangan' 
                            ? scannedData.ruangan?.nama 
                            : scannedData.kendaraan?.nama
                          }
                        </h4>
                        <p className="text-gray-600">
                          {scannedData.jenis_booking === 'ruangan' 
                            ? `${scannedData.ruangan?.lokasi} • Kapasitas: ${scannedData.ruangan?.kapasitas} orang`
                            : `${scannedData.kendaraan?.plat_nomor} • ${scannedData.kendaraan?.jenis}`
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {scannedData.users?.nama}
                        </h4>
                        <p className="text-gray-600">
                          {scannedData.users?.email}
                          {scannedData.users?.nim && (
                            <span className="block">NIM: {scannedData.users.nim}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Booking Info */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Calendar className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Waktu Booking</h4>
                        <p className="text-gray-600">
                          <span className="block">Mulai: {formatDate(scannedData.tanggal_mulai)}</span>
                          <span className="block">Selesai: {formatDate(scannedData.tanggal_selesai)}</span>
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Keperluan</h4>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                        {scannedData.keperluan}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {scannedData.status === 'pending' && (
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold">Aksi</h3>
                </div>
                <div className="card-content">
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleStatusUpdate('approved')}
                      disabled={actionLoading}
                      className="btn btn-primary flex-1"
                    >
                      {actionLoading ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Setujui
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleStatusUpdate('rejected')}
                      disabled={actionLoading}
                      className="btn btn-outline flex-1 text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <XCircle className="h-5 w-5 mr-2" />
                      Tolak
                    </button>
                  </div>
                </div>
              </div>
            )}

            {scannedData.status === 'approved' && (
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold">Aksi</h3>
                </div>
                <div className="card-content">
                  <button
                    onClick={() => handleStatusUpdate('completed')}
                    disabled={actionLoading}
                    className="btn btn-primary w-full"
                  >
                    {actionLoading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Tandai Selesai
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Reset Button */}
            <div className="text-center">
              <button
                onClick={resetScanner}
                className="btn btn-outline"
              >
                <QrCode className="h-5 w-5 mr-2" />
                Pindai QR Code Lain
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default QRScannerPage